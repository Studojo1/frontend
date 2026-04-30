// Patchright apply worker — applies to jobs using user's li_at session
// Runs inside autoapply-worker pod with Chromium installed via patchright

import { eq, and, sql } from "drizzle-orm";
import db from "~/lib/db";
import { jobQueue, userLinkedinSessions, autoapplyConfigs } from "../../auth-schema";
import { decrypt } from "~/lib/encrypt.server";
import { buildProxy } from "~/lib/proxy.server";
import { pauseUser, logEvent, getWarmupLimit } from "./safety-manager";
import { answerQuestion } from "./prescreen";
import { blockHeavyResources, withWatchdog, humanTypeLocator, jitter as jitterMs } from "./browser-utils";

let chromiumModule: any = null;
async function getChromium() {
  if (!chromiumModule) {
    chromiumModule = (await import("patchright")).chromium;
  }
  return chromiumModule;
}

async function launchBrowser(userId: string, country: string, city: string, contextOptions: any): Promise<{ browser: any; ctx: any }> {
  const chromium = await getChromium();
  const proxy = buildProxy(userId, country, city); // undefined if DECODO_* not set
  const browser = await chromium.launch({
    headless: true,
    proxy,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext(contextOptions);
  await blockHeavyResources(ctx);
  return { browser, ctx };
}

// ── Apply to a single job ─────────────────────────────────────────────────────

export async function applyToJob(jobId: string): Promise<{ status: string; error?: string }> {
  const [job] = await db
    .select()
    .from(jobQueue)
    .where(eq(jobQueue.id, jobId))
    .limit(1);

  if (!job) return { status: "failed", error: "job_not_found" };

  // Get user's LinkedIn session
  const [session] = await db
    .select()
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, job.userId))
    .limit(1);

  if (!session?.liAtEncrypted) {
    await db.update(jobQueue).set({ status: "skipped", error: "no_linkedin_session" }).where(eq(jobQueue.id, jobId));
    return { status: "skipped", error: "no_linkedin_session" };
  }

  // Get config and check warm-up limit
  const [config] = await db
    .select()
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.userId, job.userId))
    .limit(1);

  if (!config || config.status !== "active") {
    return { status: "skipped", error: "user_paused" };
  }

  const warmupLimit = getWarmupLimit(session.warmupDay, config.dailyLimit);
  const todayCount = await getTodayCount(job.userId);
  if (todayCount >= warmupLimit) {
    return { status: "skipped", error: "daily_limit_reached" };
  }

  // Check schedule (only apply during user's working hours)
  const userHour = getUserLocalHour(session.timezone ?? "Asia/Kolkata");
  const startHour = (config as any).scheduleStartHour ?? 9;
  const endHour = (config as any).scheduleEndHour ?? 20;
  if (userHour < startHour || userHour >= endHour) {
    return { status: "skipped", error: "outside_schedule" };
  }

  // Mark as processing
  await db.update(jobQueue).set({ status: "processing" }).where(eq(jobQueue.id, jobId));

  let liAt: string;
  try {
    liAt = await decrypt(session.liAtEncrypted);
  } catch {
    await db.update(jobQueue).set({ status: "failed", error: "decrypt_failed" }).where(eq(jobQueue.id, jobId));
    return { status: "failed", error: "decrypt_failed" };
  }

  let browser: any, ctx: any;
  try {
    ({ browser, ctx } = await launchBrowser(
      job.userId,
      session.proxyCountry ?? "IN",
      session.proxyCity ?? "bangalore",
      {
      userAgent: session.userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 900 },
      locale: session.locale ?? "en-US",
      timezoneId: session.timezone ?? "Asia/Kolkata",
      storageState: {
        cookies: [
          {
            name: "li_at",
            value: liAt,
            domain: ".linkedin.com",
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "None",
          },
        ],
        origins: [],
      },
    }
    ));

    const page = await ctx.newPage();

    // Monitor for rate limiting
    let rateLimited = false;
    page.on("response", async (response) => {
      const status = response.status();
      const url = response.url();
      if (!url.includes("linkedin.com")) return;

      if (status === 429 || status === 999) {
        rateLimited = true;
        await logEvent("linkedin_429", job.userId, { url, status });
        await pauseUser(job.userId, 48, "rate_limited_429");
      } else if (status === 403) {
        await logEvent("linkedin_403", job.userId, { url });
        await pauseUser(job.userId, 6, "access_denied_403");
      }
    });

    let result: { status: string; error?: string };

    if (job.platform === "linkedin") {
      result = await withWatchdog(
        () => applyLinkedIn(page, job, config.cvText, rateLimited),
        browser,
        10 * 60_000,  // 10 min max per application
        `apply:${jobId}`,
      );
    } else {
      result = { status: "skipped", error: "unsupported_platform" };
    }

    await browser.close();

    if (result.status === "applied") {
      await db.update(jobQueue).set({ status: "applied", appliedAt: new Date(), error: null }).where(eq(jobQueue.id, jobId));
      // warmup_day increments once daily via scheduler, not per application
    } else {
      await db.update(jobQueue).set({ status: result.status, error: result.error ?? null }).where(eq(jobQueue.id, jobId));
    }

    return result;
  } catch (err: any) {
    browser?.close().catch(() => {});
    const errMsg = err?.message?.slice(0, 200) ?? "unknown";
    await db.update(jobQueue).set({ status: "failed", error: errMsg }).where(eq(jobQueue.id, jobId));
    await logEvent("apply_error", job.userId, { jobId, error: errMsg });
    return { status: "failed", error: errMsg };
  }
}

// ── LinkedIn Easy Apply handler ───────────────────────────────────────────────

async function applyLinkedIn(page: any, job: any, cvText: string, rateLimited: boolean): Promise<{ status: string; error?: string }> {
  if (rateLimited) return { status: "skipped", error: "rate_limited" };

  try {
    await page.goto(job.applyUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Check for CAPTCHA / challenge
    const captcha = await page.$('[data-test-id="challenge-redirect"], .captcha-challenge, #error-page');
    if (captcha) {
      await logEvent("linkedin_captcha", job.userId, { url: job.applyUrl });
      await pauseUser(job.userId, 24, "captcha_detected");
      return { status: "failed", error: "captcha_detected" };
    }

    // Check if already applied
    const alreadyApplied = await page.$('[aria-label*="Applied"]');
    if (alreadyApplied) return { status: "skipped", error: "already_applied" };

    // Find Easy Apply button
    const easyApplyBtn = await findEasyApplyButton(page);
    if (!easyApplyBtn) return { status: "skipped", error: "no_easy_apply" };

    await easyApplyBtn.click();
    await page.waitForTimeout(1500);

    // Fill out the modal
    const applied = await fillAndSubmitModal(page, job, cvText);
    return applied ? { status: "applied" } : { status: "failed", error: "form_fill_failed" };
  } catch (err: any) {
    return { status: "failed", error: err?.message?.slice(0, 100) };
  }
}

async function findEasyApplyButton(page: any): Promise<any> {
  const selectors = [
    '[data-control-name="jobdetails_topcard_inapply"]',
    '.jobs-apply-button--top-card',
    'button.jobs-apply-button',
    '[aria-label*="Easy Apply"]',
  ];

  for (const sel of selectors) {
    const btn = await page.$(sel);
    if (btn) return btn;
  }

  // Text content fallback
  const allBtns = await page.$$("button");
  for (const btn of allBtns) {
    const text = await btn.textContent().catch(() => "");
    if (text?.toLowerCase().includes("easy apply")) return btn;
  }

  return null;
}

async function fillAndSubmitModal(page: any, job: any, cvText: string): Promise<boolean> {
  const prescreened = (job.prescreenedAnswers as Record<string, string>) ?? {};
  let stepCount = 0;
  const maxSteps = 8;

  while (stepCount < maxSteps) {
    stepCount++;
    await page.waitForTimeout(1000);

    // Check if modal is done (success screen)
    const successMsg = await page.$('[data-test-modal-id="easy-apply-success-modal"], .jobs-easy-apply-content__confirmation');
    if (successMsg) return true;

    // Check for submit button
    const submitBtn = await page.$('button[aria-label*="Submit application"], button[aria-label="Submit application"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      return true;
    }

    // Fill visible form fields
    await fillFormFields(page, prescreened, cvText, job.jobDescription ?? "");

    // Next button
    const nextBtn = await page.$('button[aria-label="Continue to next step"], button[aria-label*="Next"]');
    if (nextBtn) {
      await nextBtn.click();
      continue;
    }

    // Review button
    const reviewBtn = await page.$('button[aria-label="Review your application"]');
    if (reviewBtn) {
      await reviewBtn.click();
      continue;
    }

    break;
  }

  return false;
}

async function fillFormFields(page: any, prescreened: Record<string, string>, cvText: string, jobContext: string) {
  // Text inputs
  const inputs = await page.$$('input[type="text"], input[type="number"], textarea');
  for (const input of inputs) {
    const label = await getFieldLabel(page, input);
    if (!label) continue;

    const existing = await input.inputValue().catch(() => "");
    if (existing?.trim()) continue; // already filled

    // Find answer from prescreened cache or generate one
    const answer = findAnswer(prescreened, label)
      ?? await answerQuestion(label, cvText, jobContext);

    if (answer) {
      // Human-like typing: character-by-character with randomized delay
      await input.click().catch(() => {});
      await input.fill("").catch(() => {});
      await input.type(answer.slice(0, 1000), { delay: 50 + Math.random() * 120 });
      await jitterMs(200, 600);
    }
  }

  // Radio buttons and selects — handle yes/no questions
  const radios = await page.$$('input[type="radio"]');
  for (const radio of radios) {
    const label = await getFieldLabel(page, radio);
    if (!label) continue;
    const lowerLabel = label.toLowerCase();

    // For eligibility/sponsorship/relocation questions, always select "Yes"
    const isYesNo = lowerLabel.includes("authorized") || lowerLabel.includes("eligible")
      || lowerLabel.includes("willing") || lowerLabel.includes("sponsorship")
      || lowerLabel.includes("relocat");

    if (isYesNo) {
      const radioValue = await radio.getAttribute("value").catch(() => "");
      if (radioValue?.toLowerCase() === "yes") {
        await radio.click().catch(() => {});
      }
    }
  }

  // Selects
  const selects = await page.$$("select");
  for (const select of selects) {
    const label = await getFieldLabel(page, select);
    if (!label) continue;

    const existing = await select.inputValue().catch(() => "");
    if (existing && existing !== "") continue;

    const answer = findAnswer(prescreened, label);
    if (answer) {
      await select.selectOption({ label: answer }).catch(async () => {
        await select.selectOption({ value: answer }).catch(() => {});
      });
    }
  }
}

async function getFieldLabel(page: any, element: any): Promise<string> {
  try {
    const id = await element.getAttribute("id");
    if (id) {
      const label = await page.$(`label[for="${id}"]`);
      if (label) return (await label.textContent() ?? "").trim();
    }
    const ariaLabel = await element.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel.trim();

    const placeholder = await element.getAttribute("placeholder");
    if (placeholder) return placeholder.trim();
  } catch {}
  return "";
}

function findAnswer(prescreened: Record<string, string>, label: string): string | null {
  const lower = label.toLowerCase();
  for (const [question, answer] of Object.entries(prescreened)) {
    if (question.toLowerCase().includes(lower.slice(0, 20)) || lower.includes(question.toLowerCase().slice(0, 20))) {
      return answer;
    }
  }
  return null;
}

// ── Daily count helpers ───────────────────────────────────────────────────────

async function getTodayCount(userId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [row] = await db.execute(sql`
    SELECT COUNT(*) as cnt FROM job_queue
    WHERE user_id = ${userId}
      AND status = 'applied'
      AND applied_at >= ${todayStart}
  `);
  return Number((row as any).cnt ?? 0);
}

function getUserLocalHour(timezone: string): number {
  try {
    const now = new Date();
    const hour = parseInt(
      now.toLocaleString("en-US", { timeZone: timezone, hour: "numeric", hour12: false }),
      10
    );
    return hour;
  } catch {
    return new Date().getHours();
  }
}
