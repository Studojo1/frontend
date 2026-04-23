import { getSessionFromRequest } from "~/lib/onboarding.server";
import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { userLinkedinSessions } from "../../auth-schema";
import type { Route } from "./+types/api.autoapply.session";

// POST /api/autoapply/session — store or refresh li_at + fingerprint
// Called by extension on connect + every 7 days auto-refresh
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { liAt, cookies, userAgent, locale, timezone } = body as {
    liAt?: string;
    cookies?: string;   // full cookie string from DevTools — strongly recommended
    userAgent?: string;
    locale?: string;
    timezone?: string;
  };

  if (!liAt) return Response.json({ error: "liAt is required" }, { status: 400 });

  const { encrypt } = await import("~/lib/encrypt.server");
  const liAtEncrypted = await encrypt(liAt);
  const cookiesEncrypted = cookies ? await encrypt(cookies) : null;

  const [existing] = await db
    .select({ id: userLinkedinSessions.id })
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, session.user.id))
    .limit(1);

  if (existing) {
    await db
      .update(userLinkedinSessions)
      .set({
        liAtEncrypted,
        ...(cookiesEncrypted ? { cookiesEncrypted } : {}),
        ...(userAgent ? { userAgent } : {}),
        ...(locale ? { locale } : {}),
        ...(timezone ? { timezone } : {}),
        cookieRefreshedAt: new Date(),
        isActive: true,
      })
      .where(eq(userLinkedinSessions.userId, session.user.id));
  } else {
    // Infer proxy country/city from locale/timezone defaults
    const { country, city } = inferProxy(locale, timezone);
    await db.insert(userLinkedinSessions).values({
      userId: session.user.id,
      liAtEncrypted,
      cookiesEncrypted: cookiesEncrypted ?? null,
      userAgent: userAgent ?? null,
      locale: locale ?? "en-US",
      timezone: timezone ?? "Asia/Kolkata",
      proxyCountry: country,
      proxyCity: city,
      proxySession: `usr_${session.user.id}`,
      isActive: true,
      warmupDay: 0,
    });
  }

  return Response.json({ ok: true });
}

// GET /api/autoapply/session — return session metadata (never the raw li_at)
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db
    .select({
      id: userLinkedinSessions.id,
      locale: userLinkedinSessions.locale,
      timezone: userLinkedinSessions.timezone,
      proxyCountry: userLinkedinSessions.proxyCountry,
      proxyCity: userLinkedinSessions.proxyCity,
      cookieRefreshedAt: userLinkedinSessions.cookieRefreshedAt,
      isActive: userLinkedinSessions.isActive,
      warmupDay: userLinkedinSessions.warmupDay,
    })
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, session.user.id))
    .limit(1);

  if (!row) return Response.json({ connected: false });

  const refreshedAt = row.cookieRefreshedAt;
  const daysSinceRefresh = refreshedAt
    ? Math.floor((Date.now() - new Date(refreshedAt).getTime()) / 86_400_000)
    : 999;

  return Response.json({
    connected: true,
    locale: row.locale,
    timezone: row.timezone,
    proxyCountry: row.proxyCountry,
    proxyCity: row.proxyCity,
    isActive: row.isActive,
    warmupDay: row.warmupDay,
    cookieAgedays: daysSinceRefresh,
    cookieExpiresSoon: daysSinceRefresh >= 25, // li_at lasts ~30 days
  });
}

function inferProxy(locale?: string, timezone?: string): { country: string; city: string } {
  if (timezone?.includes("Asia/Kolkata") || locale === "en-IN") return { country: "IN", city: "bangalore" };
  if (timezone?.includes("America/") || locale?.startsWith("en-US")) return { country: "US", city: "new_york" };
  if (timezone?.includes("Europe/London") || locale === "en-GB") return { country: "GB", city: "london" };
  if (timezone?.includes("Asia/Dubai") || locale === "en-AE") return { country: "AE", city: "dubai" };
  if (timezone?.includes("Asia/Singapore") || locale === "en-SG") return { country: "SG", city: "singapore" };
  return { country: "IN", city: "bangalore" };
}
