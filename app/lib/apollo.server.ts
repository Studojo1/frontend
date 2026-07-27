// Apollo client — the last-resort phone leg. Two calls:
//   1. match(linkedinUrl): cheap identity + any already-unlocked email/phone.
//   2. requestPhoneReveal(): PAID (8 credits), webhook-async — Apollo POSTs the
//      number to our callback a few seconds later.
// Apollo is OFF unless APOLLO_ENABLED=true, because a reveal spends whether or
// not a number comes back. When on, it only ever runs on profiles both SalesQL
// and LeadsForge missed a phone for (the residual of the residual).
const BASE = "https://api.apollo.io/api/v1";

function key(): string {
  return process.env.APOLLO_API_KEY || "";
}
// The WHOLE Apollo leg is opt-in: even a match can cost a credit, so nothing
// fires unless APOLLO_ENABLED=true. With the flag off, Apollo is fully cold.
export function isConfigured(): boolean {
  return !!key() && process.env.APOLLO_ENABLED === "true";
}
/** Paid reveal additionally needs a public webhook base for the async number. */
export function revealEnabled(): boolean {
  return isConfigured() && !!process.env.APOLLO_WEBHOOK_BASE_URL;
}

function headers() {
  return { "X-Api-Key": key(), "Content-Type": "application/json", "Cache-Control": "no-cache" };
}

function realEmail(email?: string): string | undefined {
  if (!email || email.includes("email_not_unlocked")) return undefined;
  return email;
}

export type ApolloPhone = { number: string; type?: string };
export type ApolloMatch = {
  apolloId: string;
  email?: string;
  phones?: ApolloPhone[]; // with Apollo's type_cd (mobile / work / ...)
  linkedinUrl?: string;
};

function mapPhones(list: any[]): ApolloPhone[] {
  return (list ?? [])
    .map((p) => ({ number: String(p.sanitized_number || p.raw_number || ""), type: p.type_cd || p.type }))
    .filter((p) => p.number);
}

async function doMatch(body: Record<string, unknown>): Promise<ApolloMatch | null> {
  if (!isConfigured()) return null;
  try {
    const r = await fetch(`${BASE}/people/match`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    const person = ((await r.json()) as any)?.person ?? {};
    const id = person.id ? String(person.id) : "";
    if (!id) return null;
    return {
      apolloId: id,
      email: realEmail(person.email),
      phones: mapPhones(person.phone_numbers),
      linkedinUrl: person.linkedin_url ? String(person.linkedin_url) : undefined,
    };
  } catch {
    return null;
  }
}

/** Match a person by LinkedIn URL. */
export function match(linkedinUrl: string): Promise<ApolloMatch | null> {
  return doMatch({ linkedin_url: linkedinUrl });
}

/** Match a person by name + company (returns their LinkedIn URL when found). */
export function matchByName(t: {
  firstName?: string;
  lastName?: string;
  company?: string;
  domain?: string;
}): Promise<ApolloMatch | null> {
  if (!t.firstName || !t.lastName || !(t.company || t.domain)) return Promise.resolve(null);
  const body: Record<string, unknown> = { first_name: t.firstName, last_name: t.lastName };
  if (t.company) body.organization_name = t.company;
  if (t.domain) body.domain = t.domain;
  return doMatch(body);
}

function webhookUrl(rid: string): string {
  const base = (process.env.APOLLO_WEBHOOK_BASE_URL || "").replace(/\/$/, "");
  const sec = process.env.APOLLO_WEBHOOK_SECRET || "";
  return `${base}/api/enrich/apollo-callback?secret=${encodeURIComponent(sec)}&rid=${encodeURIComponent(rid)}`;
}

/** Fire a PAID phone reveal. The number lands later on the webhook. */
export async function requestPhoneReveal(apolloId: string, rid: string): Promise<boolean> {
  if (!revealEnabled() || !apolloId) return false;
  try {
    const r = await fetch(`${BASE}/people/match`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ id: apolloId, reveal_phone_number: true, webhook_url: webhookUrl(rid) }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Parse Apollo's async phone webhook into {number, type} (or null). */
export function parseCallback(body: any): ApolloPhone | null {
  const p = (body?.people ?? [])[0] ?? {};
  if (p.status !== "success") return null;
  const best = (p.phone_numbers ?? [])[0] || {};
  const number = (best.sanitized_number || best.raw_number || "").trim();
  return number ? { number, type: best.type_cd || best.type } : null;
}

export function webhookSecretOk(secret: string): boolean {
  const want = process.env.APOLLO_WEBHOOK_SECRET || "";
  return !!want && secret === want;
}
