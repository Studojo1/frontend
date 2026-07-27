// SalesQL client — enrich a person by LinkedIn URL OR by name + company.
//   GET https://api-public.salesql.com/v1/persons/enrich?api_key=..&<selector>
// Selectors: linkedin_url, OR first_name+last_name+organization_name/domain.
// Returns emails (type Work/Direct/Personal + status) and phones (type + country).
// Gated on SALESQL_API_KEY; when unset, isConfigured() is false and the engine
// skips this leg.
const BASE = "https://api-public.salesql.com/v1";

function key(): string {
  return process.env.SALESQL_API_KEY || "";
}
export function isConfigured(): boolean {
  return !!key();
}

export type SalesQlResult = {
  workEmail?: string;
  personalEmail?: string;
  phone?: string;
  name?: string;
  title?: string;
  linkedinUrl?: string;
};

async function callEnrich(params: Record<string, string>): Promise<SalesQlResult | null> {
  if (!isConfigured()) return null;
  const q = new URLSearchParams({ api_key: key(), ...params });
  try {
    const r = await fetch(`${BASE}/persons/enrich?${q.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null; // 404 = no match (free), 422 = bad input, etc.
    return parsePerson(await r.json());
  } catch {
    return null;
  }
}

export function enrichByUrl(linkedinUrl: string): Promise<SalesQlResult | null> {
  return callEnrich({ linkedin_url: linkedinUrl });
}

export function enrichByName(t: {
  firstName?: string;
  lastName?: string;
  company?: string;
  domain?: string;
}): Promise<SalesQlResult | null> {
  if (!t.firstName || !t.lastName || !(t.company || t.domain)) return Promise.resolve(null);
  const params: Record<string, string> = { first_name: t.firstName, last_name: t.lastName };
  if (t.company) params.organization_name = t.company;
  if (t.domain) params.organization_domain = t.domain;
  return callEnrich(params);
}

function parsePerson(j: any): SalesQlResult | null {
  const p = j?.person ?? j?.data ?? j;
  if (!p || typeof p !== "object") return null;
  const emails: any[] = p.emails ?? [];
  const phones: any[] = p.phones ?? [];
  const out: SalesQlResult = {};
  const work = pickEmail(emails, ["work"]);
  const personal = pickEmail(emails, ["direct", "personal"]);
  if (work) out.workEmail = work;
  if (personal) out.personalEmail = personal;
  const phone = pickPhone(phones);
  if (phone) out.phone = phone;
  if (p.full_name) out.name = p.full_name;
  else if (p.first_name || p.last_name) out.name = [p.first_name, p.last_name].filter(Boolean).join(" ");
  if (p.title || p.headline) out.title = p.title || p.headline;
  if (p.linkedin_url) out.linkedinUrl = String(p.linkedin_url);
  return out;
}

function usableStatus(status?: string): boolean {
  const s = (status || "").toLowerCase();
  return s !== "invalid" && s !== "bad" && s !== "catch_all_invalid";
}

function pickEmail(emails: any[], types: string[]): string | undefined {
  const typed = emails.find(
    (e) => types.includes((e?.type || "").toLowerCase()) && e?.email && usableStatus(e?.status),
  );
  return typed ? String(typed.email) : undefined;
}

function pickPhone(phones: any[]): string | undefined {
  // Prefer a number that looks like a real mobile, then a "personal" line.
  const score = (p: any) => {
    const num = (p?.phone || "").replace(/[^\d+]/g, "");
    const t = (p?.type || "").toLowerCase();
    if (/^\+91[6-9]\d{9}$/.test(num)) return 0; // India mobile
    if (t === "personal" || t === "mobile") return 1;
    return 2;
  };
  const cand = phones.filter((p) => p?.phone).sort((a, b) => score(a) - score(b))[0];
  return cand ? String(cand.phone) : undefined;
}
