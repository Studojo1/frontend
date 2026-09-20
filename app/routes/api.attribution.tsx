import { auth } from "~/lib/auth";
import db from "~/lib/db";
import { sql } from "drizzle-orm";
import type { Route } from "./+types/api.attribution";

/** POST /api/attribution — record where the signed-in user originally came from.
 *
 * Written once per user, on first touch. A second call is ignored rather than
 * overwriting, so a later organic visit cannot take credit from the ad click
 * that actually produced the signup.
 */

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_attribution (
      user_id TEXT PRIMARY KEY,
      fbclid TEXT,
      gclid TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      referrer TEXT,
      landing_path TEXT,
      captured_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // The two questions this table exists to answer are "which campaign produced
  // paying users" and "how much Meta traffic is there", so index both.
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_user_attribution_campaign
    ON user_attribution (utm_campaign)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_user_attribution_source
    ON user_attribution (utm_source)
  `);
  tableReady = true;
}

function clamp(v: unknown, max = 300): string | null {
  const s = String(v ?? "").trim();
  return s ? s.slice(0, max) : null;
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Tie this to the session rather than accepting a user id from the client,
  // otherwise anyone could rewrite anyone else's attribution.
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}) as any);

  await ensureTable();
  await db.execute(sql`
    INSERT INTO user_attribution (
      user_id, fbclid, gclid, utm_source, utm_medium, utm_campaign,
      utm_content, utm_term, referrer, landing_path, captured_at
    ) VALUES (
      ${userId},
      ${clamp(body.fbclid)},
      ${clamp(body.gclid)},
      ${clamp(body.utm_source, 120)},
      ${clamp(body.utm_medium, 120)},
      ${clamp(body.utm_campaign, 200)},
      ${clamp(body.utm_content, 200)},
      ${clamp(body.utm_term, 200)},
      ${clamp(body.referrer, 500)},
      ${clamp(body.landing_path, 200)},
      ${body.captured_at ? new Date(body.captured_at) : null}
    )
    ON CONFLICT (user_id) DO NOTHING
  `);

  return Response.json({ ok: true });
}
