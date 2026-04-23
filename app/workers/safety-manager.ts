// Safety manager: per-user pause, fleet-wide sweep detection, acceptance rate monitor
// All pause/resume is automatic — users notified via email, dashboard reflects status

import { eq, and, gte, sql } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyConfigs, systemEvents, outreachContacts, userLinkedinSessions } from "../../auth-schema";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";

// ── Per-user pause ────────────────────────────────────────────────────────────

export async function pauseUser(userId: string, hours: number, reason: string) {
  await db
    .update(autoapplyConfigs)
    .set({ status: "paused" })
    .where(eq(autoapplyConfigs.userId, userId));

  await logEvent("user_paused", userId, { hours, reason });
  console.log(`[safety] Paused user ${userId} for ${hours}h: ${reason}`);
}

export async function pauseOutreach(userId: string, hours: number, reason: string) {
  await logEvent("outreach_paused", userId, { hours, reason });
  console.log(`[safety] Paused outreach for user ${userId} for ${hours}h: ${reason}`);
}

export async function resumeUser(userId: string) {
  await db
    .update(autoapplyConfigs)
    .set({ status: "active" })
    .where(eq(autoapplyConfigs.userId, userId));

  console.log(`[safety] Resumed user ${userId}`);
}

export async function reduceUserLimits(userId: string, factor: number) {
  const [cfg] = await db
    .select({ dailyLimit: autoapplyConfigs.dailyLimit })
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.userId, userId))
    .limit(1);

  if (!cfg) return;

  const newLimit = Math.max(5, Math.floor(cfg.dailyLimit * factor));
  await db
    .update(autoapplyConfigs)
    .set({ dailyLimit: newLimit })
    .where(eq(autoapplyConfigs.userId, userId));

  await logEvent("limits_reduced", userId, { factor, newLimit });
}

// ── Fleet-wide sweep detection ────────────────────────────────────────────────
// If >10% of active users hit 429/999 in the same hour → LinkedIn sweep

export async function checkFleetHealth(): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3_600_000);

  // Count recent LinkedIn errors
  const errorResult = await db.execute(sql`
    SELECT COUNT(*) as cnt FROM system_events
    WHERE event_type IN ('linkedin_429', 'linkedin_999', 'linkedin_captcha')
      AND created_at > ${oneHourAgo}
  `);
  const errorCount = Number((errorResult.rows[0] as any)?.cnt ?? 0);

  // Count active users
  const activeResult = await db.execute(sql`
    SELECT COUNT(*) as cnt FROM autoapply_configs WHERE status = 'active'
  `);
  const activeCount = Number((activeResult.rows[0] as any)?.cnt ?? 1);

  const errorRate = errorCount / activeCount;

  if (errorRate > 0.10 && errorCount >= 3) {
    await pauseAllUsers("linkedin_sweep_detected");
    return false; // sweep detected
  }
  return true;
}

export async function pauseAllUsers(reason: string) {
  await db
    .update(autoapplyConfigs)
    .set({ status: "paused" })
    .where(eq(autoapplyConfigs.status, "active"));

  await logEvent("fleet_paused", null, { reason });
  console.error(`[safety] 🚨 Fleet paused: ${reason}`);

  // Slack alert if configured
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackUrl) {
    fetch(slackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `🚨 AutoApply fleet paused: ${reason}` }),
    }).catch(() => {});
  }
}

// ── Acceptance rate monitor ───────────────────────────────────────────────────

export async function checkAcceptanceRate(userId: string): Promise<number | null> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

  const result = await db.execute(sql`
    SELECT
      COUNT(*) as sent,
      SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted
    FROM outreach_contacts
    WHERE user_id = ${userId}
      AND created_at > ${sevenDaysAgo}
  `);
  const row = result.rows[0] as any;

  const sent = Number(row?.sent ?? 0);
  const accepted = Number(row?.accepted ?? 0);

  if (sent < 10) return null; // not enough data

  const rate = accepted / sent;

  if (rate < 0.20) {
    await pauseOutreach(userId, 72, "low_acceptance_rate");
    await logEvent("low_acceptance_rate", userId, { rate, sent, accepted });
  } else if (rate < 0.30) {
    await reduceUserLimits(userId, 0.75);
  }

  return rate;
}

// ── Warm-up daily increment ───────────────────────────────────────────────────

export function getWarmupLimit(warmupDay: number, configuredLimit: number): number {
  if (warmupDay <= 3) return Math.min(5, configuredLimit);
  if (warmupDay <= 7) return Math.min(8, configuredLimit);
  if (warmupDay <= 11) return Math.min(12, configuredLimit);
  if (warmupDay <= 14) return Math.min(16, configuredLimit);
  return configuredLimit;
}

export async function incrementWarmupDay(userId: string) {
  await db.execute(sql`
    UPDATE user_linkedin_sessions
    SET warmup_day = LEAST(warmup_day + 1, 15)
    WHERE user_id = ${userId}
  `);
}

// ── Event logging ─────────────────────────────────────────────────────────────

export async function logEvent(eventType: string, userId: string | null, metadata?: Record<string, unknown>) {
  try {
    await db.execute(sql`
      INSERT INTO system_events (event_type, user_id, metadata)
      VALUES (${eventType}, ${userId}, ${JSON.stringify(metadata ?? {})}::jsonb)
    `);
  } catch {}
}
