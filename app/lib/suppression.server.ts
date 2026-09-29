// The one do-not-contact list (job-outreach-svc suppressed_emails, migration
// 055): bounces, removal requests, "remove me" replies and admin entries.
// Privacy Policy §5 promises that once someone opts out, no Studojo user can
// reach them through us again, and the partner Contact Enrichment API is one
// of those routes. Lookups are by sha256 of the lowercased, trimmed address,
// the same hash job-outreach-svc writes; entries may keep only the hash.
import { createHash } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import type { EnrichResult } from "~/lib/enrich.server";

export function emailHash(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

function rowsOf(r: any): any[] {
  return (r?.rows ?? r ?? []) as any[];
}

function emailsOf(res: Pick<EnrichResult, "emails"> | null | undefined): string[] {
  const e = res?.emails;
  return [e?.work, e?.personal].filter((x): x is string => !!x && x.includes("@"));
}

/** Which of these addresses are on the list, as their hashes. */
export async function suppressedHashes(emails: string[]): Promise<Set<string>> {
  const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (!unique.length) return new Set();
  const hashes = unique.map(emailHash);
  const hashList = sql.join(hashes.map((h) => sql`${h}`), sql`, `);
  const emailList = sql.join(unique.map((e) => sql`${e}`), sql`, `);
  let rows: any[];
  try {
    rows = rowsOf(await db.execute(sql`
      SELECT email_hash, lower(email) AS email FROM suppressed_emails
      WHERE email_hash IN (${hashList}) OR lower(email) IN (${emailList})`));
  } catch {
    // Before migration 055 the table has no email_hash column.
    rows = rowsOf(await db.execute(sql`
      SELECT lower(email) AS email FROM suppressed_emails WHERE lower(email) IN (${emailList})`));
  }
  const out = new Set<string>();
  for (const r of rows) {
    if (r.email_hash) out.add(r.email_hash);
    if (r.email) out.add(emailHash(r.email));
  }
  return out;
}

/** A result for someone who opted out: no contact details, nothing billed.
 *  Reads as an ordinary miss, so it doesn't reveal that they opted out. */
export function applySuppression<T extends EnrichResult>(res: T, suppressed: Set<string>): T {
  if (!emailsOf(res).some((e) => suppressed.has(emailHash(e)))) return res;
  return {
    ...res,
    status: "not_found",
    emails: { work: null, personal: null },
    phone: null,
    confidence: 0,
    found: [],
    credits_used: 0,
  };
}

export async function withoutSuppressed<T extends EnrichResult>(res: T): Promise<T> {
  return applySuppression(res, await suppressedHashes(emailsOf(res)));
}

/** Same for a list (bulk job results), with one lookup for all of them. */
export async function withoutSuppressedMany<T extends EnrichResult>(results: T[]): Promise<T[]> {
  if (!Array.isArray(results) || !results.length) return results;
  const suppressed = await suppressedHashes(results.flatMap((r) => emailsOf(r)));
  return suppressed.size ? results.map((r) => applySuppression(r, suppressed)) : results;
}
