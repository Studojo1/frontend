// SalesQL client — enrich a person by LinkedIn URL.
//   GET https://api-public.salesql.com/v1/persons/enrich?api_key=..&linkedin_url=..
// Returns work/personal emails (with a verification status) and phones (typed).
// This is the base leg of the cascade: it usually returns emails and sometimes a
// mobile. Gated on SALESQL_API_KEY; when unset, isConfigured() is false and the
// engine simply skips this leg.
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
  phone?: string; // best mobile if present
  name?: string;
  title?: string;
};

/** Enrich one profile. Returns null on any error or when not configured. */
export async function enrichByUrl(linkedinUrl: string): Promise<SalesQlResult | null> {
  if (!isConfigured()) return null;
  const url =
    `${BASE}/persons/enrich?api_key=${encodeURIComponent(key())}` +
    `&linkedin_url=${encodeURIComponent(linkedinUrl)}`;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${key()}`, Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j: any = await r.json();
    // The person can arrive at the top level or under a `person`/`data` wrapper.
    const p = j.person ?? j.data ?? j;
    const emails: any[] = p.emails ?? [];
    const phones: any[] = p.phones ?? [];

    const workEmail = pickEmail(emails, "work");
    const personalEmail = pickEmail(emails, "personal");
    const phone = pickMobile(phones);

    const out: SalesQlResult = {};
    if (workEmail) out.workEmail = workEmail;
    if (personalEmail) out.personalEmail = personalEmail;
    if (phone) out.phone = phone;
    if (p.first_name || p.last_name)
      out.name = [p.first_name, p.last_name].filter(Boolean).join(" ");
    if (p.title || p.headline) out.title = p.title || p.headline;
    return out;
  } catch {
    return null;
  }
}

function ok(status?: string): boolean {
  // Treat unknown/unspecified as usable; only drop explicit invalids.
  const s = (status || "").toLowerCase();
  return s !== "invalid" && s !== "bad" && s !== "catch_all_invalid";
}

function pickEmail(emails: any[], want: "work" | "personal"): string | undefined {
  const typed = emails.find(
    (e) => (e?.type || "").toLowerCase() === want && e?.email && ok(e?.status),
  );
  if (typed) return String(typed.email);
  // Fall back to any valid email for the work slot only.
  if (want === "work") {
    const any = emails.find((e) => e?.email && ok(e?.status));
    if (any) return String(any.email);
  }
  return undefined;
}

function pickMobile(phones: any[]): string | undefined {
  const mob = phones.find((p) => (p?.type || "").toLowerCase().includes("mobile") && p?.phone);
  const chosen = mob || phones.find((p) => p?.phone);
  return chosen ? String(chosen.phone) : undefined;
}
