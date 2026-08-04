// Bulk enrichment jobs. Each entry now runs the FULL provider cascade
// (SalesQL -> LeadsForge -> Apollo, identical to /api/enrich) in a bounded
// concurrency pool inside the long-lived frontend process. A job_id is returned
// immediately; results are assembled in the background, and getJob re-kicks a
// stalled job. enrichProfile is cache-backed + idempotent, so a pod restart
// mid-job just re-runs cheaply (already-done entries come straight from cache).
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { enrichProfile, parseTarget, buildResult, type Target } from "~/lib/enrich.server";
import { chargeUsage, type Caller } from "~/lib/api-keys.server";

export const BULK_MAX = 500;
const POOL = 6; // concurrent per-entry cascades
const STALE_MS = 90_000; // a processing job idle this long is treated as dead -> re-kick

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

// Bounded concurrency map that preserves input order in the output.
async function pool<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let idx = 0;
  const worker = async () => {
    while (idx < items.length) {
      const i = idx++;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

export async function createJob(
  caller: Caller,
  entries: any[],
  fields: string[],
): Promise<{ job_id: string; status: string; count: number }> {
  await ensureTable();
  const targets = entries.map((e) => parseTarget(e)).filter(Boolean) as Target[];
  const id = "job_" + randomUUID().replace(/-/g, "").slice(0, 12);
  await db.execute(sql`
    INSERT INTO api_jobs (id, email, key_id, status, total, meta)
    VALUES (${id}, ${caller.email}, ${caller.id}, 'processing', ${targets.length},
            ${JSON.stringify({ targets, fields, charged: false })}::jsonb)`);
  kick(caller.email, id); // process in the background, don't block the response
  return { job_id: id, status: "processing", count: targets.length };
}

// Fire background processing without blocking; swallow errors (per-entry catches
// already handle real failures, getJob re-kicks anything that stalls).
function kick(email: string, id: string): void {
  setTimeout(() => {
    runJob(email, id).catch(() => {});
  }, 0);
}

/** Run the full SalesQL -> LeadsForge -> Apollo cascade for every entry, then
 *  complete the job. Idempotent: enrichProfile is cache-backed, so re-running is
 *  cheap and only fresh (uncached) hits are billed. */
async function runJob(email: string, id: string): Promise<void> {
  await ensureTable();
  const row = rowsOf(
    await db.execute(sql`
      SELECT key_id, status, meta FROM api_jobs
      WHERE id = ${id} AND lower(email) = ${email.toLowerCase()}`),
  )[0];
  if (!row || row.status === "completed") return;
  const meta = row.meta || {};
  const targets: Target[] = meta.targets || [];
  const fields: string[] = meta.fields || ["email", "phone"];

  let done = 0;
  const results = await pool(targets, POOL, async (t) => {
    let r: any;
    try {
      r = await enrichProfile(t, fields);
    } catch {
      const name = [t.firstName, t.lastName].filter(Boolean).join(" ") || null;
      r = buildResult(t.linkedin_url ? String(t.linkedin_url) : "", { name }, fields);
    }
    done += 1;
    await db.execute(sql`UPDATE api_jobs SET processed = ${done}, updated_at = now() WHERE id = ${id}`);
    return r;
  });

  // Bill only fresh (uncached) hits, exactly like the single endpoint.
  const billable = results.reduce(
    (s, r) => s + (!r.cached && (r.credits_used || 0) > 0 ? r.credits_used : 0),
    0,
  );
  if (!meta.charged && billable > 0) await chargeUsage(row.key_id, billable);
  meta.charged = true;

  await db.execute(sql`
    UPDATE api_jobs
    SET status = 'completed', processed = ${results.length},
        results = ${JSON.stringify(results)}::jsonb, meta = ${JSON.stringify(meta)}::jsonb,
        updated_at = now()
    WHERE id = ${id}`);
}

/** Fetch a job scoped to its owner; re-kick a stalled one so it always finishes. */
export async function getJob(email: string, id: string): Promise<any | null> {
  await ensureTable();
  const row = rowsOf(
    await db.execute(sql`
      SELECT id, status, total, processed, results, updated_at FROM api_jobs
      WHERE id = ${id} AND lower(email) = ${email.toLowerCase()}`),
  )[0];
  if (!row) return null;
  if (row.status === "completed") {
    return {
      job_id: row.id,
      status: "completed",
      total: row.total,
      processed: row.processed,
      results: row.results,
    };
  }
  const stale = row.updated_at && Date.now() - new Date(row.updated_at).getTime() > STALE_MS;
  if (stale) kick(email, id);
  return { job_id: row.id, status: "processing", total: row.total, processed: row.processed || 0, results: [] };
}
