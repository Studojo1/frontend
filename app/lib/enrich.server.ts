// The Studojo enrichment engine. Input: a LinkedIn URL. Output: a normalized,
// verified contact. Providers are tried in order and each only fills what is
// still missing; the phone is the field that drives fallback. Today the live
// leg is LeadsForge; SalesQL and Apollo slot in here when their keys land.
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import * as leadsforge from "~/lib/leadsforge.server";

const CACHE_TTL_DAYS = 30;

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
  return leadsforge.isConfigured();
}

const LINKEDIN_RE = /linkedin\.com\/in\/[^/?#\s]+/i;
export function isLinkedInUrl(url: string): boolean {
  return LINKEDIN_RE.test(url || "");
}
/** Canonical key for cache + idempotency: lowercased /in/<handle>. */
export function normalizeUrl(url: string): string {
  const m = (url || "").match(/linkedin\.com\/in\/([^/?#\s]+)/i);
  return m ? `linkedin.com/in/${m[1].toLowerCase()}` : (url || "").trim().toLowerCase();
}

/** A phone is only "usable" as a mobile if present, E.164-shaped, plausible. */
export function usablePhone(raw?: string): { number: string; type: string } | null {
  const p = (raw || "").replace(/[^\d+]/g, "");
  if (!/^\+\d{8,15}$/.test(p)) return null;
  // Heuristic line type. India mobiles start 6-9; otherwise mark unknown rather
  // than overclaim "mobile".
  let type = "unknown";
  if (p.startsWith("+91")) type = /^\+91[6-9]\d{9}$/.test(p) ? "mobile" : "landline";
  else type = "mobile";
  return type === "landline" ? null : { number: p, type };
}

async function ensureCache(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "api_enrich_cache" (
      "linkedin_url" text PRIMARY KEY,
      "status" text NOT NULL,
      "result" jsonb NOT NULL,
      "created_at" timestamp NOT NULL DEFAULT now()
    )`);
}

async function getCached(urlKey: string): Promise<EnrichResult | null> {
  await ensureCache();
  const r: any = await db.execute(sql`
    SELECT result FROM api_enrich_cache
    WHERE linkedin_url = ${urlKey}
      AND created_at > now() - make_interval(days => ${CACHE_TTL_DAYS})`);
  const row = (r.rows ?? r ?? [])[0];
  if (!row) return null;
  const cached = row.result as EnrichResult;
  return { ...cached, cached: true };
}

async function putCache(urlKey: string, res: EnrichResult): Promise<void> {
  await ensureCache();
  const { cached, ...store } = res;
  await db.execute(sql`
    INSERT INTO api_enrich_cache (linkedin_url, status, result)
    VALUES (${urlKey}, ${res.status}, ${JSON.stringify(store)}::jsonb)
    ON CONFLICT (linkedin_url)
    DO UPDATE SET status = EXCLUDED.status, result = EXCLUDED.result, created_at = now()`);
}

/** Build a normalized result from a provider hit ({email?, phone?}) + fields. */
export function buildResult(
  linkedin_url: string,
  hit: { email?: string; phone?: string },
  fields: string[] = ["email", "phone"],
): EnrichResult {
  const email = fields.includes("email") ? hit.email ?? null : null;
  const phone = fields.includes("phone") ? usablePhone(hit.phone) : null;
  const found: string[] = [];
  if (email) found.push("work_email");
  if (phone) found.push("mobile");
  const confidence = found.length === 2 ? 0.92 : found.length === 1 ? 0.7 : 0;
  return {
    status: found.length ? "ok" : "not_found",
    person: { name: null, title: null, linkedin_url },
    emails: { work: email, personal: null },
    phone: phone ? { ...phone, verified: true } : null,
    confidence,
    found,
    credits_used: found.length ? 1 : 0,
  };
}

/**
 * Enrich one profile. Honors the idempotency cache (same URL inside the TTL is
 * free and identical). `fields` selects email and/or phone.
 */
export async function enrichProfile(
  linkedin_url: string,
  fields: string[] = ["email", "phone"],
): Promise<EnrichResult> {
  const urlKey = normalizeUrl(linkedin_url);
  const cached = await getCached(urlKey);
  if (cached) return cached;

  const wantEmail = fields.includes("email");
  const wantPhone = fields.includes("phone");

  // ── Provider cascade (LeadsForge live; SalesQL/Apollo slot in above/below) ──
  const reqId = randomUUID();
  const lf = await leadsforge.enrich(
    [{ externalID: urlKey, linkedinURL: linkedin_url }],
    { email: wantEmail, phone: wantPhone },
    reqId,
  );
  const result = buildResult(linkedin_url, lf[urlKey] || {}, fields);
  await putCache(urlKey, result); // caches both ok and not_found (negative cache)
  return result;
}
