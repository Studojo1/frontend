// Error codes + output hygiene for the hosted MCP.
//
// Two rules, both about what a CUSTOMER is allowed to see:
//   1. An error tells them what THEY can do about it, and nothing else. It never names a
//      backend vendor (Context.dev, Apollo, LeadsForge, SalesQL, Azure/OpenAI...), never
//      quotes an upstream error string, and never exposes an internal host, query, stage
//      or credit-governor state. Every failure carries a stable `code` and a short `ref`.
//   2. The TRUE reason is recorded internally against that same `ref`, so support can
//      explain any incident a customer reports without the customer ever seeing it.
//
// Anything that trips a code is written to `mcp_incidents` and, for the codes that mean
// "our side is unhealthy", emailed to ops once per code per hour so a silent degradation
// (the 19-hour Context.dev governor pause on 2026-08-06) can't go unnoticed again.
import { randomBytes } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";

export const CODE = {
  INVALID_INPUT: "invalid_input",
  NOT_FOUND: "not_found",
  WORKSPACE_NOT_LINKED: "workspace_not_linked",
  OUT_OF_CREDITS: "out_of_credits",
  BUSY: "busy",
  RATE_LIMITED: "rate_limited",
  SERVICE_UNAVAILABLE: "service_unavailable",
  UPSTREAM_DEGRADED: "upstream_degraded",
  INTERNAL_ERROR: "internal_error",
} as const;
export type Code = (typeof CODE)[keyof typeof CODE];

/** Customer-facing text. Deliberately says what to do, not what broke. */
const MESSAGE: Record<Code, string> = {
  [CODE.INVALID_INPUT]: "That request was missing something.",
  [CODE.NOT_FOUND]: "Not found for this key.",
  [CODE.WORKSPACE_NOT_LINKED]:
    "This key is not linked to a Sensei workspace. Generate a key from the AI agent tab of dashboard.studojo.com, or ask Studojo to link this one.",
  [CODE.OUT_OF_CREDITS]:
    "This workspace is out of credits. Contact admin@studojo.com to top up.",
  [CODE.BUSY]: "That search is still working. Check its status before sending another instruction.",
  [CODE.RATE_LIMITED]: "Too many requests. Please retry in a few seconds.",
  [CODE.SERVICE_UNAVAILABLE]: "Sensei is temporarily unavailable. Please retry shortly.",
  [CODE.UPSTREAM_DEGRADED]:
    "A temporary issue is affecting results right now. Please retry shortly.",
  [CODE.INTERNAL_ERROR]: "Something went wrong on our side. Please retry shortly.",
};

/** Codes that mean OUR side is unhealthy — these page ops. The rest are ordinary
 *  client-side outcomes (bad input, not found, out of credits) and are only logged. */
const ALERTABLE = new Set<Code>([
  CODE.SERVICE_UNAVAILABLE,
  CODE.UPSTREAM_DEGRADED,
  CODE.INTERNAL_ERROR,
]);

// ── Scrubbing ────────────────────────────────────────────────────────────────────────
// Infrastructure vendors + internal machinery. Applied ONLY to status/progress/summary
// text and never to result rows, because a real company can legitimately be called
// "Apollo Hospitals" and a customer is entitled to see that.
const INFRA = new RegExp(
  [
    "context\\.?dev", "contextdev", "ctx[_-]?(?:governor|boards|li_posts|x|search)",
    "leadsforge", "leads\\s?forge", "salesql", "sales\\s?ql",
    "apollo\\s*(?:api|key|credits?|enrich\\w*)", "serpapi", "evomi",
    "azure", "openai", "gpt-?\\d[\\w.]*", "luna", "resend",
    "bob-svc", "bob_svc", "x-bob-", "x-internal-secret",
  ].join("|"),
  "gi",
);
/** Whole clauses the pipeline appends about its own plumbing. Removed outright. */
const INFRA_CLAUSE =
  /\s*\|\s*(?:CONTEXT\.DEV[^|]*|Context\.dev[^|]*|PAID SEARCH[^|]*|[^|]*credit pool[^|]*|[^|]*governor[^|]*)/gi;

/** Make free text safe to hand a customer: drop plumbing clauses, then any vendor token. */
export function scrub(text: string | null | undefined): string {
  if (!text) return "";
  let out = String(text).replace(INFRA_CLAUSE, "");
  out = out.replace(INFRA, "a data source");
  return out.replace(/\s{2,}/g, " ").trim();
}

/** Progress is WHITELISTED, not scrubbed: raw stage labels carry internal queries
 *  ("[ctx_li_posts] site:linkedin.com/posts \"business analyst\"..."). We map the stage
 *  to a plain description of what is happening and emit nothing we don't recognise. */
const STAGE_PHRASE: [RegExp, string][] = [
  [/planning|conductor/i, "Planning the search"],
  [/^\[?ctx|li_posts|boards|linkedin|unstop|careerjet|getro|hirist|indeed|naukri|reddit|\bats\b/i,
    "Searching job boards and hiring posts"],
  [/harvest|search|sourc/i, "Searching job boards and hiring posts"],
  [/extract/i, "Reading what we found"],
  [/shortlist|verify|liveness/i, "Checking each listing is still live"],
  [/jd[_ ]?fetch|description/i, "Reading the job descriptions"],
  [/company|enrich|intel/i, "Researching the companies"],
  [/score|rank|prefilter|gate/i, "Scoring how well each one fits"],
  [/contact|t1/i, "Finding the right person to reach"],
  [/assemble|added \d+ row|pipeline finished|table/i, "Finalising the results"],
];

export function safeProgress(events: any[]): string {
  const list = Array.isArray(events) ? events : [];
  for (let i = list.length - 1; i >= 0; i--) {
    const label = String(list[i]?.label || "").trim();
    if (!label) continue;
    for (const [re, phrase] of STAGE_PHRASE) if (re.test(label)) return phrase;
  }
  return list.length ? "Working" : "";
}

// ── Incidents ────────────────────────────────────────────────────────────────────────
let ensured = false;
async function ensureTable(): Promise<void> {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "mcp_incidents" (
      "ref" text PRIMARY KEY,
      "code" text NOT NULL,
      "tool" text,
      "key_id" uuid,
      "email" text,
      "detail" text,
      "created_at" timestamp NOT NULL DEFAULT now()
    )`);
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "mcp_incidents_code_idx" ON "mcp_incidents" (code, created_at DESC)`,
  );
  ensured = true;
}

function rowsOf(r: any): any[] {
  return (r?.rows ?? r ?? []) as any[];
}

/** Email ops at most once per code per hour, so a sustained outage is one message. */
async function alertOnce(code: Code, ref: string, detail: string, tool?: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return;
  const recent = rowsOf(
    await db.execute(sql`
      SELECT 1 FROM mcp_incidents
      WHERE code = ${code} AND ref <> ${ref} AND created_at > now() - interval '1 hour' LIMIT 1`),
  );
  if (recent.length) return; // already alerted for this code inside the window
  const to = process.env.OPS_ALERT_EMAIL?.trim() || "admin@studojo.com";
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "Studojo <onboarding@resend.dev>";
  const env = process.env.BOB_ENV || "prod";
  const body =
    `MCP incident on ${env}\n\ncode:   ${code}\nref:    ${ref}\ntool:   ${tool || "-"}\n` +
    `when:   ${new Date().toISOString()}\n\ntrue reason (internal only):\n${detail || "(none)"}\n\n` +
    `The customer saw only the generic message for this code.\n` +
    `More: SELECT * FROM mcp_incidents WHERE code = '${code}' ORDER BY created_at DESC LIMIT 20;`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: `[MCP ${env}] ${code} (${ref})`, text: body }),
    });
  } catch {
    /* alerting must never break a request */
  }
}

/** Record the TRUE reason against a ref the customer can quote. Never throws. */
export async function recordIncident(entry: {
  code: Code;
  detail?: string;
  tool?: string;
  keyId?: string | null;
  email?: string | null;
}): Promise<string> {
  const ref = "mcp_" + randomBytes(4).toString("hex");
  try {
    await ensureTable();
    await db.execute(sql`
      INSERT INTO mcp_incidents (ref, code, tool, key_id, email, detail)
      VALUES (${ref}, ${entry.code}, ${entry.tool ?? null}, ${entry.keyId ?? null},
              ${entry.email ?? null}, ${(entry.detail || "").slice(0, 2000)})`);
    if (ALERTABLE.has(entry.code)) await alertOnce(entry.code, ref, entry.detail || "", entry.tool);
  } catch {
    /* logging must never break a request */
  }
  return ref;
}

/** Map an upstream HTTP status to a code, WITHOUT leaking which upstream it was. */
export function codeForStatus(status: number): Code {
  if (status === 404) return CODE.NOT_FOUND;
  if (status === 402) return CODE.OUT_OF_CREDITS;
  if (status === 409) return CODE.BUSY;
  if (status === 429) return CODE.RATE_LIMITED;
  if (status === 503 || status === 502) return CODE.SERVICE_UNAVAILABLE;
  return CODE.UPSTREAM_DEGRADED;
}

export type Failure = { code: Code; message: string; ref: string };

/** Build the customer-facing failure. `detail` and `hint` never reach them: `detail` is
 *  the true internal reason, `hint` optionally REPLACES the generic message for codes
 *  that are about the caller's own input (safe by construction). */
export async function fail(
  code: Code,
  opts: { detail?: string; hint?: string; tool?: string; keyId?: string | null; email?: string | null } = {},
): Promise<Failure> {
  const ref = await recordIncident({
    code,
    detail: opts.detail,
    tool: opts.tool,
    keyId: opts.keyId,
    email: opts.email,
  });
  const safeHint = code === CODE.INVALID_INPUT || code === CODE.NOT_FOUND ? opts.hint : undefined;
  return { code, message: scrub(safeHint || MESSAGE[code]), ref };
}
