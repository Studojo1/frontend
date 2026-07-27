// Bulk enrichment jobs. A job maps to LeadsForge's native batch jobs (one per
// channel for the whole list). We return a job_id immediately and advance the
// job lazily whenever it is polled, so no background worker is required.
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import * as leadsforge from "~/lib/leadsforge.server";
import { buildResult, normalizeUrl, isLinkedInUrl } from "~/lib/enrich.server";
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
  urls: string[],
  fields: string[],
): Promise<{ job_id: string; status: string; count: number }> {
  await ensureTable();
  const clean = urls.filter((u) => isLinkedInUrl(u));
  const people = clean.map((u) => ({ externalID: normalizeUrl(u), linkedinURL: u }));
  const map: Record<string, string> = {};
  clean.forEach((u) => (map[normalizeUrl(u)] = u));

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
  return { job_id: id, status: "processing", count: clean.length };
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
  const map: Record<string, string> = meta.map || {};
  const fields: string[] = meta.fields || ["email", "phone"];
  const results = Object.entries(map).map(([extId, url]) => {
    const h = hits[extId] || {};
    return buildResult(url, { workEmail: h.email, phone: h.phone }, fields);
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
