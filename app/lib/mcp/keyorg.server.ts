// Maps each external API key -> its OWN isolated bob-svc org (provisioned once, on first
// use). bob-svc scopes every request to that org, so a key can only ever see its own
// Sensei searches/results/credits. Same ensureTable idiom as api-jobs.server.ts.
//
// The mapping is keyed by (key_id, env): this table lives in the shared platform DB
// (staging + prod), but each key's bob_org_id is created in a DIFFERENT bob DB per
// environment (staging vs the isolated bobprod). Scoping by env stops a mapping made on
// one environment from resolving to a non-existent org on the other.
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { provisionOrg } from "~/lib/mcp/bob-client";
import type { Caller } from "~/lib/api-keys.server";

const ENV = process.env.BOB_ENV || "prod";

let ensured = false;
async function ensureTable(): Promise<void> {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "mcp_key_org" (
      "key_id" uuid NOT NULL,
      "env" text NOT NULL DEFAULT 'prod',
      "email" text,
      "bob_org_id" bigint NOT NULL,
      "created_at" timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY ("key_id", "env")
    )`);
  ensured = true;
}

function rowsOf(r: any): any[] {
  return (r?.rows ?? r ?? []) as any[];
}

/** Point a key at an EXISTING Sensei workspace (used when a workspace admin mints a key
 *  from the manager dashboard). Pre-mapping here is what stops resolveOrg from creating a
 *  fresh empty workspace on the key's first call, so the agent sees the same searches,
 *  contacts and credit pool the team already uses in the browser. */
export async function mapKeyToOrg(keyId: string, email: string, orgId: number): Promise<void> {
  await ensureTable();
  await db.execute(sql`
    INSERT INTO mcp_key_org (key_id, env, email, bob_org_id)
    VALUES (${keyId}, ${ENV}, ${email}, ${orgId})
    ON CONFLICT (key_id, env) DO UPDATE SET bob_org_id = EXCLUDED.bob_org_id`);
}

/** Drop a key's workspace mapping (on revoke), so a stale row can never resolve. */
export async function unmapKey(keyId: string): Promise<void> {
  await ensureTable();
  await db.execute(sql`DELETE FROM mcp_key_org WHERE key_id = ${keyId} AND env = ${ENV}`);
}

/** The bob workspace ids this email's keys are mapped to, keyed by key id (this env). */
export async function mappedOrgs(email: string): Promise<Record<string, number>> {
  await ensureTable();
  const rows = rowsOf(
    await db.execute(
      sql`SELECT key_id, bob_org_id FROM mcp_key_org WHERE lower(email) = ${email.toLowerCase()} AND env = ${ENV}`,
    ),
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[String(r.key_id)] = Number(r.bob_org_id);
  return out;
}

export type OrgResult = { ok: true; orgId: number } | { ok: false; error: string };

/** The isolated bob-svc org for this key (in this environment), provisioning it on first
 *  use. Race-safe: bob-svc provisioning is idempotent (dedupes on a synthetic per-key
 *  domain) and the INSERT ... ON CONFLICT + re-read converge concurrent first-callers. */
export async function resolveOrg(caller: Caller): Promise<OrgResult> {
  await ensureTable();
  const hit = rowsOf(
    await db.execute(
      sql`SELECT bob_org_id FROM mcp_key_org WHERE key_id = ${caller.id} AND env = ${ENV}`,
    ),
  )[0];
  if (hit?.bob_org_id) return { ok: true, orgId: Number(hit.bob_org_id) };

  const p = await provisionOrg(caller.id);
  if (!p.ok) return { ok: false, error: p.error };
  const orgId = Number(p.data.org_id);

  await db.execute(sql`
    INSERT INTO mcp_key_org (key_id, env, email, bob_org_id)
    VALUES (${caller.id}, ${ENV}, ${caller.email}, ${orgId})
    ON CONFLICT (key_id, env) DO NOTHING`);
  const row = rowsOf(
    await db.execute(
      sql`SELECT bob_org_id FROM mcp_key_org WHERE key_id = ${caller.id} AND env = ${ENV}`,
    ),
  )[0];
  return { ok: true, orgId: row?.bob_org_id ? Number(row.bob_org_id) : orgId };
}
