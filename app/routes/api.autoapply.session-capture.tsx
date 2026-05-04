// POST /api/autoapply/session-capture
// Accepts a one-time token (from the local capture script) + session data.
// No Studojo auth cookie needed — the token IS the auth for this endpoint.

import { createClient } from "redis";
import db from "~/lib/db";
import { userLinkedinSessions } from "../../auth-schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/api.autoapply.session-capture";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";

let _redis: ReturnType<typeof createClient> | null = null;
async function getRedis() {
  if (_redis) return _redis;
  _redis = createClient({ url: REDIS_URL, password: REDIS_PASSWORD || undefined });
  _redis.on("error", () => {});
  await _redis.connect();
  return _redis;
}

function inferProxy(locale?: string, timezone?: string): { country: string; city: string } {
  if (timezone?.includes("Asia/Kolkata") || locale === "en-IN") return { country: "IN", city: "bangalore" };
  if (timezone?.includes("America/") || locale?.startsWith("en-US")) return { country: "US", city: "new_york" };
  if (timezone?.includes("Europe/London") || locale === "en-GB") return { country: "GB", city: "london" };
  if (timezone?.includes("Asia/Dubai") || locale === "en-AE") return { country: "AE", city: "dubai" };
  if (timezone?.includes("Asia/Singapore") || locale === "en-SG") return { country: "SG", city: "singapore" };
  return { country: "IN", city: "bangalore" };
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const { token, liAt, cookies, userAgent, timezone, locale } = body as {
    token?: string;
    liAt?: string;
    cookies?: string;
    userAgent?: string;
    timezone?: string;
    locale?: string;
  };

  if (!token) return Response.json({ error: "token required" }, { status: 400 });
  if (!liAt)  return Response.json({ error: "liAt required" }, { status: 400 });

  // Validate token → resolve userId
  const redis = await getRedis();
  const userId = await redis.get(`capture_token:${token}`);
  if (!userId) return Response.json({ error: "Token invalid or expired" }, { status: 401 });

  // Consume token immediately (one-time use)
  await redis.del(`capture_token:${token}`);

  const { encrypt } = await import("~/lib/encrypt.server");
  const liAtEncrypted = await encrypt(liAt);
  const cookiesEncrypted = cookies ? await encrypt(cookies) : null;
  const { country, city } = inferProxy(locale, timezone);

  const [existing] = await db
    .select({ id: userLinkedinSessions.id })
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, userId))
    .limit(1);

  if (existing) {
    await db.update(userLinkedinSessions).set({
      liAtEncrypted,
      ...(cookiesEncrypted ? { cookiesEncrypted } : {}),
      ...(userAgent ? { userAgent } : {}),
      ...(locale ? { locale } : {}),
      ...(timezone ? { timezone } : {}),
      cookieRefreshedAt: new Date(),
      isActive: true,
    }).where(eq(userLinkedinSessions.userId, userId));
  } else {
    await db.insert(userLinkedinSessions).values({
      userId,
      liAtEncrypted,
      cookiesEncrypted: cookiesEncrypted ?? null,
      userAgent: userAgent ?? null,
      locale: locale ?? "en-US",
      timezone: timezone ?? "Asia/Kolkata",
      proxyCountry: country,
      proxyCity: city,
      proxySession: `usr_${userId}`,
      isActive: true,
      warmupDay: 0,
    });
  }

  return Response.json({ ok: true });
}
