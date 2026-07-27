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
  phones?: { number: string; type?: string }[]; // all phones, with their Work/Personal label
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
  const ph = phones
    .filter((p) => p?.phone)
    .map((p) => ({ number: String(p.phone), type: p.type ? String(p.type) : undefined }));
  if (ph.length) out.phones = ph;
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

