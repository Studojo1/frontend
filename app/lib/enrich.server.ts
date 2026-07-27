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

/** Add a late-arriving Apollo phone to a cached result (called from the webhook).
 *  `urlKey` is the exact cache key stored on the reveal row, not a raw URL. */
export async function patchCachePhone(urlKey: string, rawPhone: string): Promise<void> {
  const phone = usablePhone(rawPhone);
  if (!phone) return;
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
export type Target = {
  linkedin_url?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  domain?: string;
};

/** Parse a request body (or a bulk entry) into a Target, or null if unusable.
 *  Accepts a LinkedIn URL, or first/last name (or a full `name`) + company/domain. */
export function parseTarget(body: any): Target | null {
  if (typeof body === "string") body = { linkedin_url: body };
  const url = String(body?.linkedin_url || "").trim();
  if (url && isLinkedInUrl(url)) return { linkedin_url: url };
  let firstName = String(body?.first_name || "").trim();
  let lastName = String(body?.last_name || "").trim();
  const name = String(body?.name || body?.full_name || "").trim();
  if ((!firstName || !lastName) && name) {
    const parts = name.split(/\s+/);
    firstName = firstName || parts[0] || "";
    lastName = lastName || parts.slice(1).join(" ");
  }
  const company = String(body?.company || body?.organization || "").trim();
  const domain = String(body?.domain || "").trim();
  if (firstName && lastName && (company || domain)) {
    return { firstName, lastName, company: company || undefined, domain: domain || undefined };
  }
  return null;
}

/** Stable cache/idempotency key: the LinkedIn URL if we have one, else name+org. */
export function cacheKeyFor(t: Target): string {
  if (t.linkedin_url && isLinkedInUrl(t.linkedin_url)) return normalizeUrl(t.linkedin_url);
  const who = [t.firstName, t.lastName].filter(Boolean).join(" ").trim().toLowerCase();
  const org = (t.domain || t.company || "").trim().toLowerCase();
  return `name:${who}|${org}`;
}

export async function enrichProfile(
  target: Target,
  fields: string[] = ["email", "phone"],
): Promise<EnrichResult> {
  const cacheKey = cacheKeyFor(target);
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  const wantEmail = fields.includes("email");
  const wantPhone = fields.includes("phone");
  const parts: Parts = { name: [target.firstName, target.lastName].filter(Boolean).join(" ") || null };
  let url = target.linkedin_url && isLinkedInUrl(target.linkedin_url) ? target.linkedin_url : "";

  const haveEmail = () => !!parts.workEmail;
  const havePhone = () => !!parts.phone;
  const captureUrl = (u?: string) => {
    if (!url && u && isLinkedInUrl(u)) url = u;
  };

  // 1 ── SalesQL: base record (by URL, else by name+company; may return the URL)
  if (salesql.isConfigured()) {
    const s = url ? await salesql.enrichByUrl(url) : await salesql.enrichByName(target);
    if (s) {
      if (s.workEmail) parts.workEmail = s.workEmail;
      if (s.personalEmail) parts.personalEmail = s.personalEmail;
      if (s.name) parts.name = s.name;
      if (s.title) parts.title = s.title;
      captureUrl(s.linkedinUrl);
      if (wantPhone && usablePhone(s.phone)) parts.phone = usablePhone(s.phone)!.number;
    }
  }

  // 2 ── LeadsForge: native name+company (or URL). Fills phone + missing email.
  const lfNeedEmail = wantEmail && !haveEmail();
  const lfNeedPhone = wantPhone && !havePhone();
  if (leadsforge.isConfigured() && (lfNeedEmail || lfNeedPhone)) {
    const lf = await leadsforge.enrich(
      [{ externalID: cacheKey, linkedinURL: url || undefined,
         firstName: target.firstName, lastName: target.lastName, company: target.company }],
      { email: lfNeedEmail, phone: lfNeedPhone },
      randomUUID(),
    );
    const hit = lf[cacheKey] || {};
    if (lfNeedEmail && hit.email) parts.workEmail = hit.email;
    if (lfNeedPhone && usablePhone(hit.phone)) parts.phone = usablePhone(hit.phone)!.number;
  }

  // 3 ── Apollo: last resort. Match (by URL or name) backfills email + resolves
  //      the URL; gated paid reveal chases a phone both prior legs missed.
  const apNeedEmail = wantEmail && !haveEmail();
  const apNeedPhone = wantPhone && !havePhone();
  if (apollo.isConfigured() && (apNeedEmail || apNeedPhone)) {
    const m = url ? await apollo.match(url) : await apollo.matchByName(target);
    if (m) {
      captureUrl(m.linkedinUrl);
      if (apNeedEmail && m.email) parts.workEmail = m.email;
      if (apNeedPhone && usablePhone(m.phone)) parts.phone = usablePhone(m.phone)!.number;
      if (wantPhone && !havePhone() && apollo.revealEnabled() && m.apolloId) {
        const rid = randomUUID();
        await ensureTables();
        await db.execute(sql`
          INSERT INTO apollo_reveals (rid, linkedin_url, apollo_id) VALUES (${rid}, ${cacheKey}, ${m.apolloId})`);
        if (await apollo.requestPhoneReveal(m.apolloId, rid)) {
          const ph = await pollApolloReveal(rid, APOLLO_POLL_MS);
          if (ph && usablePhone(ph)) parts.phone = usablePhone(ph)!.number;
        }
      }
    }
  }

  const result = buildResult(url, parts, fields);
  await putCache(cacheKey, result); // caches ok and not_found (negative cache)
  return result;
}
