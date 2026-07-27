// Bulk enrichment jobs. A job maps to LeadsForge's native batch jobs (one per
// channel for the whole list). We return a job_id immediately and advance the
// job lazily whenever it is polled, so no background worker is required.
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import * as leadsforge from "~/lib/leadsforge.server";
import { buildResult, parseTarget, cacheKeyFor } from "~/lib/enrich.server";
import { chargeUsage, type Caller } from "~/lib/api-keys.server";

export const BULK_MAX = 500;

let ensured = false;
async function ensureTable(): Promise<void> {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "api_jobs" (
      "id" text PRIMARY KEY,
      "email" text NOT NULL,
      "key_id" uuid,
      "status" text NOT NULL DEFAULT 'processing',
      "total" integer NOT NULL DEFAULT 0,
      "processed" integer NOT NULL DEFAULT 0,
      "results" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "meta" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    )`);
  ensured = true;
}

function rowsOf(r: any): any[] {
  return (r?.rows ?? r ?? []) as any[];
}

export async function createJob(
  caller: Caller,
  entries: any[],
  fields: string[],
): Promise<{ job_id: string; status: string; count: number }> {
  await ensureTable();
  const targets = entries.map((e) => parseTarget(e)).filter(Boolean) as any[];
  const people = targets.map((t) => ({
    externalID: cacheKeyFor(t),
    linkedinURL: t.linkedin_url,
    firstName: t.firstName,
    lastName: t.lastName,
    company: t.company,
  }));
  const map: Record<string, { url: string; name: string }> = {};
  targets.forEach((t) => {
    map[cacheKeyFor(t)] = {
      url: t.linkedin_url || "",
      name: [t.firstName, t.lastName].filter(Boolean).join(" "),
    };
  });
  const clean = targets;

  const reqId = randomUUID();
  const lf: Record<string, string> = {};
  if (fields.includes("email")) {
    const id = await leadsforge.submitJob("emails", people, reqId);
    if (id) lf.emails = id;
  }
  if (fields.includes("phone")) {
    const id = await leadsforge.submitJob("phones", people, reqId);
    if (id) lf.phones = id;
  }

  const id = "job_" + randomUUID().replace(/-/g, "").slice(0, 12);
  await db.execute(sql`
    INSERT INTO api_jobs (id, email, key_id, status, total, meta)
    VALUES (${id}, ${caller.email}, ${caller.id}, 'processing', ${clean.length},
            ${JSON.stringify({ lf, map, fields, charged: false })}::jsonb)`);
  kickAutoComplete(caller.email, id); // self-resolve without client polling
  return { job_id: id, status: "processing", count: clean.length };
}

/** In-process best-effort completer: advance a job to done without any client
 *  poll, so "a job nobody polls never finishes" (CP4) can't happen. Runs in the
 *  long-lived frontend process; getJob is idempotent so double-runs are safe.
 *  (Not durable across a pod restart — getJob still advances on demand as a
 *  fallback, and the worker-backed version is the eventual upgrade.) */
export function kickAutoComplete(email: string, id: string): void {
  let tries = 0;
  const tick = async () => {
    tries += 1;
    try {
      const j = await getJob(email, id);
      if (j && j.status === "completed") return;
    } catch {
      /* transient — keep trying */
    }
    if (tries < 120) setTimeout(tick, 5000); // up to ~10 minutes
  };
  setTimeout(tick, 4000);
}

/** Fetch a job scoped to its owner and advance it if the batch has finished. */
export async function getJob(email: string, id: string): Promise<any | null> {
  await ensureTable();
  const r = await db.execute(sql`
    SELECT id, key_id, status, total, processed, results, meta
    FROM api_jobs WHERE id = ${id} AND lower(email) = ${email.toLowerCase()}`);
  const row = rowsOf(r)[0];
  if (!row) return null;

  if (row.status === "completed") {
    return { job_id: row.id, status: "completed", total: row.total, processed: row.processed, results: row.results };
  }

  // Still processing: check whether every LeadsForge job is done, then assemble.
  const meta = row.meta || {};
  const lf: Record<string, string> = meta.lf || {};
  const jobIds = Object.entries(lf) as [string, string][];
  const allDone = jobIds.length > 0 && (await Promise.all(jobIds.map(([, jid]) => leadsforge.jobDone(jid)))).every(Boolean);

  if (!allDone) {
    return { job_id: row.id, status: "processing", total: row.total, processed: 0, results: [] };
  }

  const hits: Record<string, { email?: string; phone?: string }> = {};
  for (const [channel, jid] of jobIds) {
    leadsforge.collect(hits, channel as leadsforge.Channel, await leadsforge.jobResults(jid));
  }
  const map: Record<string, { url: string; name: string }> = meta.map || {};
  const fields: string[] = meta.fields || ["email", "phone"];
  const results = Object.entries(map).map(([extId, m]) => {
    const h = hits[extId] || {};
    return buildResult(m.url, { workEmail: h.email, phone: h.phone, name: m.name || null }, fields);
  });
  const billable = results.reduce((s, r2) => s + (r2.credits_used || 0), 0);

  if (!meta.charged && billable > 0) await chargeUsage(row.key_id, billable);
  meta.charged = true;

  await db.execute(sql`
    UPDATE api_jobs
    SET status = 'completed', processed = ${results.length},
        results = ${JSON.stringify(results)}::jsonb, meta = ${JSON.stringify(meta)}::jsonb,
        updated_at = now()
    WHERE id = ${id}`);

  return { job_id: row.id, status: "completed", total: row.total, processed: results.length, results };
}
