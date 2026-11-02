import { Pool } from "pg";

// META-FIX (2 Nov 2026, B4): once a person, across both hosts. Meta's CompleteRegistration and PostHog's signed_up were
// guarded by a per-origin localStorage flag, so a sign-up seen on studojo.com and on platform.studojo.com (this site
// serves /auth there too) was reported twice. Now whoever reports first claims (person, event) as one row of
// career_agent.career_tracking_once, the table the product (Studojo1/career-agent db/schema.sql, meta-once.server.ts)
// makes and claims the same way, and every later claim, from any host or browser, answers false.
//
// Never throws and never holds a request long: its own small pool with short timeouts. null when it cannot tell (no
// database, the table not made yet), and the browser falls back to its own flag, as before.

const TABLE = "career_agent.career_tracking_once";

/** The claim names: Meta's event names, and PostHog's signed_up. */
export const POSTHOG_SIGNED_UP = "posthog_signed_up";

export type OnceClaim = (userId: string, event: string, host: string) => Promise<boolean>;

let pool: Pool | null = null;
function oncePool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 2_000,
      statement_timeout: 2_000,
      query_timeout: 3_000,
    });
    pool.on("error", () => {
      // an idle client dropped: the pool replaces it
    });
  }
  return pool;
}

const realClaim: OnceClaim = async (userId, event, host) => {
  const p = oncePool();
  if (!p) throw new Error("no database");
  const r = await p.query(
    `INSERT INTO ${TABLE} (user_id, event, host) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, event) DO NOTHING RETURNING user_id`,
    [userId, event, host.slice(0, 80)],
  );
  return (r.rowCount ?? 0) > 0;
};

let claimFn: OnceClaim = realClaim;

/** Tests: a fake table (null puts the real one back). */
export function setOnceClaim(fn: OnceClaim | null): void {
  claimFn = fn ?? realClaim;
}

/** Claim one person's event: true, first (report it); false, already reported; null, unknown. Never throws. */
export async function claimOnce(userId: string, event: string, host: string): Promise<boolean | null> {
  if (!userId || !event) return null;
  try {
    return await claimFn(userId, event, host);
  } catch {
    return null;
  }
}
