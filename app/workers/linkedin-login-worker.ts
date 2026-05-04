// Server-side LinkedIn credential login via Patchright
// State stored in Redis so API routes can poll + inject OTP
// State machine: pending → logging_in → awaiting_otp → success | failed

import { createClient } from "redis";
import db from "~/lib/db";
import { userLinkedinSessions } from "../../auth-schema";
import { encrypt } from "~/lib/encrypt.server";
import { eq } from "drizzle-orm";
import { inferProxy } from "./login-utils";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";
const JOB_TTL = 600; // 10 min in seconds

export interface LoginJobState {
  status: "pending" | "logging_in" | "awaiting_otp" | "success" | "failed";
  error?: string;
  userId: string;
}

let _redis: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (_redis) return _redis;
  _redis = createClient({
    url: REDIS_URL,
    password: REDIS_PASSWORD || undefined,
  });
  _redis.on("error", (err) => console.error("[login-worker] Redis error:", err));
  await _redis.connect();
  return _redis;
}

function stateKey(jobId: string) { return `linkedin_login:${jobId}`; }
function otpKey(jobId: string)   { return `linkedin_login_otp:${jobId}`; }

export async function setState(jobId: string, state: Partial<LoginJobState>) {
  const redis = await getRedis();
  const current = await getState(jobId);
  const merged = { ...current, ...state };
  await redis.set(stateKey(jobId), JSON.stringify(merged), { EX: JOB_TTL });
}

export async function getState(jobId: string): Promise<LoginJobState | null> {
  const redis = await getRedis();
  const raw = await redis.get(stateKey(jobId));
  return raw ? JSON.parse(raw) : null;
}

export async function waitForOtp(jobId: string, timeoutMs = 300_000): Promise<string | null> {
  const redis = await getRedis();
  const deadline = Date.now() + timeoutMs;
  const key = otpKey(jobId);

  while (Date.now() < deadline) {
    const val = await redis.get(key);
    if (val) {
      await redis.del(key);
      return val;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return null;
}

export async function submitOtp(jobId: string, otp: string) {
  const redis = await getRedis();
  await redis.set(otpKey(jobId), otp, { EX: 120 });
}

// ── Lazy Patchright import ──────────────────────────────────────────────────

let chromiumModule: any = null;
async function getChromium() {
  if (!chromiumModule) {
    chromiumModule = (await import("patchright")).chromium;
  }
  return chromiumModule;
}

// ── Main login flow ─────────────────────────────────────────────────────────

export async function runLinkedinLogin(jobId: string, userId: string, email: string, password: string) {
  await setState(jobId, { status: "logging_in", userId });

  const chromium = await getChromium();
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  let browser_closed = false;
  const closeBrowser = async () => {
    if (!browser_closed) { browser_closed = true; try { await browser.close(); } catch {} }
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "en-US",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    // Navigate to LinkedIn login
    await page.goto("https://www.linkedin.com/login", { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Fill credentials
    await page.fill("#username", email);
    await page.fill("#password", password);
    await page.click('[type="submit"]');

    // Wait for navigation (3 possible outcomes)
    await page.waitForLoadState("domcontentloaded", { timeout: 15_000 });

    const url = page.url();

    // ── 2FA / checkpoint ──────────────────────────────────────────────────
    if (url.includes("/checkpoint") || url.includes("/challenge") || url.includes("/two-step-verification")) {
      await setState(jobId, { status: "awaiting_otp" });

      const otp = await waitForOtp(jobId, 300_000); // 5-min window
      if (!otp) {
        await setState(jobId, { status: "failed", error: "OTP timeout — user did not enter code" });
        await closeBrowser();
        return;
      }

      // Try to find OTP input and submit
      const otpInput = page.locator("input[name='pin'], input[aria-label*='verification'], input[id*='input__phone_verification'], input[autocomplete='one-time-code']").first();
      await otpInput.fill(otp, { timeout: 10_000 });
      await page.keyboard.press("Enter");
      await page.waitForLoadState("domcontentloaded", { timeout: 15_000 });
    }

    // ── Check for wrong password / error page ─────────────────────────────
    const errorEl = await page.$(".alert-content, #error-for-password, .form__label--error");
    if (errorEl) {
      const errText = await errorEl.textContent();
      await setState(jobId, { status: "failed", error: errText?.trim() ?? "Login failed" });
      await closeBrowser();
      return;
    }

    // ── Confirm we're on the feed / home ──────────────────────────────────
    const finalUrl = page.url();
    if (!finalUrl.includes("linkedin.com/feed") && !finalUrl.includes("linkedin.com/in/") && !finalUrl.includes("linkedin.com/mynetwork")) {
      await setState(jobId, { status: "failed", error: `Unexpected redirect to ${finalUrl}` });
      await closeBrowser();
      return;
    }

    // ── Extract cookies ───────────────────────────────────────────────────
    const cookies = await context.cookies();
    const liAt = cookies.find((c) => c.name === "li_at")?.value;
    const jsessionId = cookies.find((c) => c.name === "JSESSIONID")?.value;

    if (!liAt) {
      await setState(jobId, { status: "failed", error: "li_at cookie not found after login" });
      await closeBrowser();
      return;
    }

    const cookieString = cookies
      .filter((c) => ["li_at", "JSESSIONID", "bcookie", "bscookie", "lidc", "li_gc"].includes(c.name))
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const userAgent = await page.evaluate(() => navigator.userAgent);
    const locale = "en-US";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // ── Store session ─────────────────────────────────────────────────────
    const liAtEncrypted = await encrypt(liAt);
    const cookiesEncrypted = await encrypt(cookieString);
    const { country, city } = inferProxy(locale, timezone);

    const [existing] = await db
      .select({ id: userLinkedinSessions.id })
      .from(userLinkedinSessions)
      .where(eq(userLinkedinSessions.userId, userId))
      .limit(1);

    if (existing) {
      await db.update(userLinkedinSessions).set({
        liAtEncrypted,
        cookiesEncrypted,
        userAgent,
        locale,
        timezone,
        cookieRefreshedAt: new Date(),
        isActive: true,
      }).where(eq(userLinkedinSessions.userId, userId));
    } else {
      await db.insert(userLinkedinSessions).values({
        userId,
        liAtEncrypted,
        cookiesEncrypted,
        userAgent,
        locale,
        timezone,
        proxyCountry: country,
        proxyCity: city,
        proxySession: `usr_${userId}`,
        isActive: true,
        warmupDay: 0,
      });
    }

    await setState(jobId, { status: "success" });
    console.log(`[login-worker] Login success for user ${userId}`);
  } catch (err: any) {
    console.error(`[login-worker] Login error for user ${userId}:`, err?.message);
    await setState(jobId, { status: "failed", error: err?.message ?? "Unknown error" });
  } finally {
    await closeBrowser();
  }
}
