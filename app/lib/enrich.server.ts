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
import { classifyPhone } from "~/lib/phone-verify.server";

const CACHE_TTL_DAYS = 30;
const APOLLO_POLL_MS = 7000;

// One line in the phone verification trace: what each source returned and why it
// was accepted or rejected. This is what makes the cascade decisions visible.
export type PhoneStep = {
  step: "salesql" | "leadsforge" | "apollo";
  number?: string;
  line_type: string;
  verdict: "accepted" | "rejected" | "none";
  reason: string;
};

export type EnrichResult = {
  status: "ok" | "not_found";
  person: { name: string | null; title: string | null; linkedin_url: string };
  emails: { work: string | null; personal: string | null };
  phone: { number: string; type: string; line_type: string; source: string; verified: boolean } | null;
  confidence: number;
  found: string[];
  credits_used: number;
  phone_trace?: PhoneStep[];
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
export async function patchCachePhone(urlKey: string, rawPhone: string, label?: string): Promise<void> {
  const v = classifyPhone(rawPhone, label);
  if (!v.ok) return; // only patch a usable personal mobile
  await ensureTables();
  const r = await db.execute(sql`SELECT result FROM api_enrich_cache WHERE linkedin_url = ${urlKey}`);
  const row = rowsOf(r)[0];
  if (!row) return;
  const res = row.result as EnrichResult;
  if (res.phone) return; // already has one
  res.phone = { number: v.number, type: v.lineType, line_type: v.lineType, source: "apollo", verified: true };
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
  name?: string | null;
  title?: string | null;
  phone?: string | null; // verified mobile (set by the cascade) OR raw (bulk)
  phoneLineType?: string; // set only when already verified by the cascade
  phoneSource?: string;
};

/** Build a normalized result. The cascade pre-verifies the phone; the bulk path
 *  passes a raw LeadsForge number, which is verified here (mobiles only). */
export function buildResult(
  linkedin_url: string,
  parts: Parts,
  fields: string[] = ["email", "phone"],
  trace?: PhoneStep[],
): EnrichResult {
  const wantEmail = fields.includes("email");
  const wantPhone = fields.includes("phone");
  const work = wantEmail ? parts.workEmail ?? null : null;
  const personal = wantEmail ? parts.personalEmail ?? null : null;

  let phone: EnrichResult["phone"] = null;
  if (wantPhone && parts.phone) {
    if (parts.phoneLineType) {
      // already verified by the cascade — trust it
      phone = {
        number: parts.phone,
        type: parts.phoneLineType,
        line_type: parts.phoneLineType,
        source: parts.phoneSource || "provider",
        verified: true,
      };
    } else {
      const v = classifyPhone(parts.phone); // raw (bulk) — verify now
      if (v.ok) {
        phone = { number: v.number, type: v.lineType, line_type: v.lineType, source: parts.phoneSource || "leadsforge", verified: true };
      }
    }
  }

  const found: string[] = [];
  if (work) found.push("work_email");
  if (personal) found.push("personal_email");
  if (phone) found.push("mobile");
  const confidence = found.length >= 2 ? 0.92 : found.length === 1 ? 0.7 : 0;
  const result: EnrichResult = {
    status: found.length ? "ok" : "not_found",
    person: { name: parts.name ?? null, title: parts.title ?? null, linkedin_url },
    emails: { work, personal },
    phone,
    confidence,
    found,
    credits_used: found.length ? 1 : 0,
  };
  if (wantPhone && trace) result.phone_trace = trace;
  return result;
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
  const trace: PhoneStep[] = [];
  let url = target.linkedin_url && isLinkedInUrl(target.linkedin_url) ? target.linkedin_url : "";

  const haveEmail = () => !!parts.workEmail;
  const havePhone = () => !!parts.phone;
  const captureUrl = (u?: string) => {
    if (!url && u && isLinkedInUrl(u)) url = u;
  };

  // The verifier gate: try this step's candidate numbers, accept the first that
  // classifies as a usable personal mobile, and record what happened either way.
  const tryPhone = (step: PhoneStep["step"], cands: { number?: string; label?: string }[]): void => {
    if (!wantPhone || parts.phone) return;
    const verdicts = cands.filter((c) => c.number).map((c) => classifyPhone(c.number, c.label));
    const hit = verdicts.find((v) => v.ok);
    if (hit) {
      parts.phone = hit.number;
      parts.phoneLineType = hit.lineType;
      parts.phoneSource = step;
      trace.push({ step, number: hit.number, line_type: hit.lineType, verdict: "accepted", reason: hit.reason });
    } else if (verdicts.length) {
      const v = verdicts[0];
      trace.push({ step, number: v.number || undefined, line_type: v.lineType, verdict: "rejected", reason: v.reason });
    } else {
      trace.push({ step, line_type: "none", verdict: "none", reason: "no number returned" });
    }
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
      tryPhone("salesql", (s.phones || []).map((p) => ({ number: p.number, label: p.type })));
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
    tryPhone("leadsforge", [{ number: hit.phone, label: "" }]);
  }

  // 3 ── Apollo: last resort. Match (by URL or name) backfills email + resolves
  //      the URL; gated paid reveal chases a mobile both prior legs missed.
  const apNeedEmail = wantEmail && !haveEmail();
  const apNeedPhone = wantPhone && !havePhone();
  if (apollo.isConfigured() && (apNeedEmail || apNeedPhone)) {
    const m = url ? await apollo.match(url) : await apollo.matchByName(target);
    if (m) {
      captureUrl(m.linkedinUrl);
      if (apNeedEmail && m.email) parts.workEmail = m.email;
      const cands: { number?: string; label?: string }[] = (m.phones || []).map((p) => ({ number: p.number, label: p.type }));
      // Any already-unlocked mobile in the match? If not, fire the paid reveal.
      const matchHasMobile = cands.some((c) => classifyPhone(c.number, c.label).ok);
      if (wantPhone && !havePhone() && !matchHasMobile && apollo.revealEnabled() && m.apolloId) {
        const rid = randomUUID();
        await ensureTables();
        await db.execute(sql`
          INSERT INTO apollo_reveals (rid, linkedin_url, apollo_id) VALUES (${rid}, ${cacheKey}, ${m.apolloId})`);
        if (await apollo.requestPhoneReveal(m.apolloId, rid)) {
          const ph = await pollApolloReveal(rid, APOLLO_POLL_MS);
          if (ph) cands.push({ number: ph, label: "mobile" }); // reveal returns a direct dial
        }
      }
      tryPhone("apollo", cands);
    }
  }

  const result = buildResult(url, parts, fields, trace);
  await putCache(cacheKey, result); // caches ok and not_found (negative cache)
  return result;
}
