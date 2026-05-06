// GET /api/outreach/stats
// Returns session status, warmup progress, today's counts, and per-campaign breakdown.

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { eq, and, gte, sql } from "drizzle-orm";
import db from "~/lib/db";
import {
  outreachContacts,
  outreachCampaigns,
  userLinkedinSessions,
  autoapplyConfigs,
} from "../../auth-schema";
import { getWarmupLimit } from "~/workers/safety-manager";
import type { Route } from "./+types/api.outreach.stats";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [liSession, config, campaigns, allContacts, todayContacts] = await Promise.all([
    db.select({
      isActive: userLinkedinSessions.isActive,
      warmupDay: userLinkedinSessions.warmupDay,
      proxyCountry: userLinkedinSessions.proxyCountry,
      cookieRefreshedAt: userLinkedinSessions.cookieRefreshedAt,
    })
      .from(userLinkedinSessions)
      .where(eq(userLinkedinSessions.userId, userId))
      .limit(1),

    db.select({ dailyLimit: autoapplyConfigs.dailyLimit, status: autoapplyConfigs.status })
      .from(autoapplyConfigs)
      .where(eq(autoapplyConfigs.userId, userId))
      .limit(1),

    db.select()
      .from(outreachCampaigns)
      .where(eq(outreachCampaigns.userId, userId)),

    db.select({
      id: outreachContacts.id,
      campaignId: sql<string>`null`, // contacts aren't campaign-scoped yet — future
      status: outreachContacts.status,
      lastActionAt: outreachContacts.lastActionAt,
    })
      .from(outreachContacts)
      .where(eq(outreachContacts.userId, userId)),

    // Today's connection requests sent
    db.select({ cnt: sql<number>`COUNT(*)` })
      .from(outreachContacts)
      .where(
        and(
          eq(outreachContacts.userId, userId),
          eq(outreachContacts.status, "requested"),
          gte(outreachContacts.lastActionAt, todayStart),
        )
      ),
  ]);

  const li = liSession[0] ?? null;
  const cfg = config[0] ?? null;

  const warmupDay = li?.warmupDay ?? 0;
  const dailyLimit = getWarmupLimit(warmupDay, cfg?.dailyLimit ?? 20);
  const sentToday = Number(todayContacts[0]?.cnt ?? 0);

  const cookieAgeDays = li?.cookieRefreshedAt
    ? Math.floor((Date.now() - new Date(li.cookieRefreshedAt).getTime()) / 86_400_000)
    : null;

  // Aggregate totals across all contacts
  const totals = {
    pending:   allContacts.filter(c => c.status === "pending").length,
    requested: allContacts.filter(c => c.status === "requested").length,
    accepted:  allContacts.filter(c => c.status === "accepted").length,
    messaged:  allContacts.filter(c => c.status === "messaged").length,
    replied:   allContacts.filter(c => c.status === "replied").length,
    done:      allContacts.filter(c => c.status === "done").length,
  };

  const totalSent = totals.requested + totals.accepted + totals.messaged + totals.replied + totals.done;
  const acceptanceRate = totalSent > 0
    ? Math.round(((totals.accepted + totals.messaged + totals.replied + totals.done) / totalSent) * 100)
    : 0;

  return Response.json({
    session: li ? {
      connected: li.isActive,
      warmupDay,
      dailyLimit,
      sentToday,
      proxyCountry: li.proxyCountry,
      cookieAgeDays,
      cookieExpiresSoon: (cookieAgeDays ?? 0) >= 25,
    } : { connected: false },
    campaigns,
    totals,
    acceptanceRate,
  });
}
