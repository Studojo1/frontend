// The Studojo enrichment engine. Input: a LinkedIn URL. Output: a normalized,
// verified contact. Providers run in order and each only fills what is still
// missing; the phone is the field that drives fallback.
//   1. SalesQL   base record (emails, sometimes a mobile)
//   2. LeadsForge fills the phone (and email if still missing), free on a miss
//   3. Apollo    last resort for the phone, gated + webhook-async, OFF unless
//                APOLLO_ENABLED=true
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import * as leadsforge from "~/lib/leadsforge.server";
import * as salesql from "~/lib/salesql.server";
import * as apollo from "~/lib/apollo.server";

const CACHE_TTL_DAYS = 30;
const APOLLO_POLL_MS = 7000;

export type EnrichResult = {
  status: "ok" | "not_found";
  person: { name: string | null; title: string | null; linkedin_url: string };
  emails: { work: string | null; personal: string | null };
  phone: { number: string; type: string; verified: boolean } | null;
  confidence: number;
  found: string[];
  credits_used: number;
  cached?: boolean;
};

/** True if at least one provider is wired, so the route can 503 cleanly. */
export function enginesConfigured(): boolean {
  return leadsforge.isConfigured() || salesql.isConfigured() || apollo.isConfigured();
}

const LINKEDIN_RE = /linkedin\.com\/in\/[^/?#\s]+/i;
export function isLinkedInUrl(url: string): boolean {
  return LINKEDIN_RE.test(url || "");
}
export function normalizeUrl(url: string): string {
  const m = (url || "").match(/linkedin\.com\/in\/([^/?#\s]+)/i);
  return m ? `linkedin.com/in/${m[1].toLowerCase()}` : (url || "").trim().toLowerCase();
}

/** A phone is only "usable" as a mobile if present, E.164-shaped, plausible. */
export function usablePhone(raw?: string): { number: string; type: string } | null {
  const p = (raw || "").replace(/[^\d+]/g, "");
  if (!/^\+\d{8,15}$/.test(p)) return null;
  let type = "mobile";
  if (p.startsWith("+91")) type = /^\+91[6-9]\d{9}$/.test(p) ? "mobile" : "landline";
  return type === "landline" ? null : { number: p, type };
}

// ── cache ────────────────────────────────────────────────────────────────────
async function ensureTables(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "api_enrich_cache" (
      "linkedin_url" text PRIMARY KEY,
      "status" text NOT NULL,
      "result" jsonb NOT NULL,
      "created_at" timestamp NOT NULL DEFAULT now()
    )`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "apollo_reveals" (
      "rid" text PRIMARY KEY,
      "linkedin_url" text NOT NULL DEFAULT '',
      "apollo_id" text NOT NULL DEFAULT '',
      "phone" text,
      "status" text NOT NULL DEFAULT 'pending',
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    )`);
}

function rowsOf(r: any): any[] {
  return (r?.rows ?? r ?? []) as any[];
}

async function getCached(urlKey: string): Promise<EnrichResult | null> {
  await ensureTables();
  const r = await db.execute(sql`
    SELECT result FROM api_enrich_cache
    WHERE linkedin_url = ${urlKey}
      AND created_at > now() - make_interval(days => ${CACHE_TTL_DAYS})`);
  const row = rowsOf(r)[0];
  if (!row) return null;
  return { ...(row.result as EnrichResult), cached: true };
}

async function putCache(urlKey: string, res: EnrichResult): Promise<void> {
  await ensureTables();
  const { cached, ...store } = res;
  await db.execute(sql`
    INSERT INTO api_enrich_cache (linkedin_url, status, result)
    VALUES (${urlKey}, ${res.status}, ${JSON.stringify(store)}::jsonb)
    ON CONFLICT (linkedin_url)
    DO UPDATE SET status = EXCLUDED.status, result = EXCLUDED.result, created_at = now()`);
}

/** Add a late-arriving Apollo phone to a cached result (called from the webhook). */
export async function patchCachePhone(linkedin_url: string, rawPhone: string): Promise<void> {
  const phone = usablePhone(rawPhone);
  if (!phone) return;
  const urlKey = normalizeUrl(linkedin_url);
  await ensureTables();
  const r = await db.execute(sql`SELECT result FROM api_enrich_cache WHERE linkedin_url = ${urlKey}`);
  const row = rowsOf(r)[0];
  if (!row) return;
  const res = row.result as EnrichResult;
  if (res.phone) return; // already has one
  res.phone = { ...phone, verified: true };
  if (!res.found.includes("mobile")) res.found.push("mobile");
  res.status = "ok";
  res.confidence = Math.max(res.confidence, res.found.length >= 2 ? 0.92 : 0.7);
  await db.execute(sql`
    UPDATE api_enrich_cache SET result = ${JSON.stringify(res)}::jsonb, status = 'ok'
    WHERE linkedin_url = ${urlKey}`);
}

async function pollApolloReveal(rid: string, budgetMs: number): Promise<string | null> {
  const deadline = Date.now() + budgetMs;
  while (Date.now() < deadline) {
    await new Promise((res) => setTimeout(res, 1000));
    const r = await db.execute(sql`SELECT phone, status FROM apollo_reveals WHERE rid = ${rid}`);
    const row = rowsOf(r)[0];
    if (row && row.status !== "pending") return row.phone ? String(row.phone) : null;
  }
  return null;
}

// ── assembly ───────────────────────────────────────────────────────────────
type Parts = {
  workEmail?: string | null;
  personalEmail?: string | null;
  phone?: string | null;
  name?: string | null;
  title?: string | null;
};

/** Build a normalized result from collected contact parts + requested fields. */
export function buildResult(linkedin_url: string, parts: Parts, fields: string[] = ["email", "phone"]): EnrichResult {
  const wantEmail = fields.includes("email");
  const wantPhone = fields.includes("phone");
  const work = wantEmail ? parts.workEmail ?? null : null;
  const personal = wantEmail ? parts.personalEmail ?? null : null;
  const phone = wantPhone ? usablePhone(parts.phone ?? undefined) : null;

  const found: string[] = [];
  if (work) found.push("work_email");
  if (personal) found.push("personal_email");
  if (phone) found.push("mobile");
  const confidence = found.length >= 2 ? 0.92 : found.length === 1 ? 0.7 : 0;
  return {
    status: found.length ? "ok" : "not_found",
    person: { name: parts.name ?? null, title: parts.title ?? null, linkedin_url },
    emails: { work, personal },
    phone: phone ? { ...phone, verified: true } : null,
    confidence,
    found,
    credits_used: found.length ? 1 : 0,
  };
}

// ── the cascade ──────────────────────────────────────────────────────────────
export async function enrichProfile(
  linkedin_url: string,
  fields: string[] = ["email", "phone"],
): Promise<EnrichResult> {
  const urlKey = normalizeUrl(linkedin_url);
  const cached = await getCached(urlKey);
  if (cached) return cached;

  const wantEmail = fields.includes("email");
  const wantPhone = fields.includes("phone");
  const parts: Parts = {};

  const haveEmail = () => !!parts.workEmail;
  const havePhone = () => !!parts.phone;

  // 1 ── SalesQL: base record
  if (salesql.isConfigured()) {
    const s = await salesql.enrichByUrl(linkedin_url);
    if (s) {
      if (s.workEmail) parts.workEmail = s.workEmail;
      if (s.personalEmail) parts.personalEmail = s.personalEmail;
      if (s.name) parts.name = s.name;
      if (s.title) parts.title = s.title;
      if (wantPhone && usablePhone(s.phone)) parts.phone = usablePhone(s.phone)!.number;
    }
  }

  // 2 ── LeadsForge: fill the phone (and email if still missing), free on a miss
  const lfNeedEmail = wantEmail && !haveEmail();
  const lfNeedPhone = wantPhone && !havePhone();
  if (leadsforge.isConfigured() && (lfNeedEmail || lfNeedPhone)) {
    const lf = await leadsforge.enrich(
      [{ externalID: urlKey, linkedinURL: linkedin_url }],
      { email: lfNeedEmail, phone: lfNeedPhone },
      randomUUID(),
    );
    const hit = lf[urlKey] || {};
    if (lfNeedEmail && hit.email) parts.workEmail = hit.email;
    if (lfNeedPhone && usablePhone(hit.phone)) parts.phone = usablePhone(hit.phone)!.number;
  }

  // 3 ── Apollo: last resort. Free match backfills email; paid reveal (opt-in)
  //      chases a phone both prior legs missed.
  const apNeedEmail = wantEmail && !haveEmail();
  const apNeedPhone = wantPhone && !havePhone();
  if (apollo.isConfigured() && (apNeedEmail || apNeedPhone)) {
    const m = await apollo.match(linkedin_url);
    if (m) {
      if (apNeedEmail && m.email) parts.workEmail = m.email;
      if (apNeedPhone && usablePhone(m.phone)) parts.phone = usablePhone(m.phone)!.number;
      if (wantPhone && !havePhone() && apollo.revealEnabled() && m.apolloId) {
        const rid = randomUUID();
        await ensureTables();
        await db.execute(sql`
          INSERT INTO apollo_reveals (rid, linkedin_url, apollo_id) VALUES (${rid}, ${linkedin_url}, ${m.apolloId})`);
        if (await apollo.requestPhoneReveal(m.apolloId, rid)) {
          const ph = await pollApolloReveal(rid, APOLLO_POLL_MS);
          if (ph && usablePhone(ph)) parts.phone = usablePhone(ph)!.number;
        }
      }
    }
  }

  const result = buildResult(linkedin_url, parts, fields);
  await putCache(urlKey, result); // caches ok and not_found (negative cache)
  return result;
}
