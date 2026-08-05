// POST /api/mcp — the hosted Sensei MCP server (JSON-RPC 2.0 over Streamable HTTP).
// Auth: Authorization: Bearer sk_live_… (the same keys as /api/enrich). Each key is
// isolated to its own bob-svc workspace (see lib/mcp/keyorg.server.ts). Tools:
// sensei_search / sensei_status / sensei_results (discovery, async) and
// enrich_contact / enrich_bulk / enrichment_status / sensei_credits.
import type { Route } from "./+types/api.mcp";
import { guard, json } from "~/lib/api-guard.server";
import { chargeUsage, logRequest, quotaStatus, rateLimit, type Caller } from "~/lib/api-keys.server";
import { enrichProfile, parseTarget, enginesConfigured } from "~/lib/enrich.server";
import { createJob, getJob, BULK_MAX } from "~/lib/api-jobs.server";
import { bobConfigured, createChat, sendMessage, getRun, getCredits } from "~/lib/mcp/bob-client";
import { resolveOrg } from "~/lib/mcp/keyorg.server";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "studojo-sensei", version: "1.0.0" };

type Content = { content: { type: "text"; text: string }[]; isError?: boolean };
const ok = (obj: unknown): Content => ({
  content: [{ type: "text", text: typeof obj === "string" ? obj : JSON.stringify(obj, null, 2) }],
});
const err = (message: string): Content => ({ content: [{ type: "text", text: message }], isError: true });

const TOOLS = [
  {
    name: "sensei_search",
    description:
      "Start a Sensei hiring search from a plain-English brief (role/function, location, company type, pay, seniority). Returns a run_id immediately; the search runs for a few minutes. Poll sensei_status, then read sensei_results. Example: 'business analyst roles at funded startups in Bangalore, 0-2 years'.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "The full hiring brief in plain English." } },
      required: ["query"],
    },
  },
  {
    name: "sensei_status",
    description:
      "Check a Sensei search's progress by run_id. Returns status (running | waiting_user | done | error) and a short progress summary. Poll every ~20-30s until status is 'done'.",
    inputSchema: {
      type: "object",
      properties: { run_id: { type: "integer", description: "The run_id from sensei_search." } },
      required: ["run_id"],
    },
  },
  {
    name: "sensei_results",
    description:
      "Get the companies and roles a Sensei search found (company, role, location, pay, fit score, why-now signal, apply link, and any contact already discovered). Call once sensei_status is 'done'; also returns partial rows while still running.",
    inputSchema: {
      type: "object",
      properties: { run_id: { type: "integer", description: "The run_id from sensei_search." } },
      required: ["run_id"],
    },
  },
  {
    name: "enrich_contact",
    description:
      "Turn a LinkedIn profile URL (or a name + company/domain) into a verified work email, personal email and mobile number. Billed only when a contact is returned.",
    inputSchema: {
      type: "object",
      properties: {
        linkedin_url: { type: "string" },
        first_name: { type: "string" },
        last_name: { type: "string" },
        company: { type: "string" },
        domain: { type: "string" },
        fields: {
          type: "array",
          items: { type: "string", enum: ["email", "phone"] },
          description: "Which fields to reveal. Default both.",
        },
      },
    },
  },
  {
    name: "enrich_bulk",
    description: `Enrich up to ${BULK_MAX} contacts in one batch. Each item has the same shape as enrich_contact. Returns a job_id; poll enrichment_status for results.`,
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: { type: "object" },
          description: "Array of {linkedin_url} or {first_name,last_name,company|domain}.",
        },
        fields: { type: "array", items: { type: "string", enum: ["email", "phone"] } },
      },
      required: ["items"],
    },
  },
  {
    name: "enrichment_status",
    description: "Fetch a bulk enrichment job by job_id: overall status plus each enriched contact once complete.",
    inputSchema: {
      type: "object",
      properties: { job_id: { type: "string", description: "The job_id from enrich_bulk." } },
      required: ["job_id"],
    },
  },
  {
    name: "sensei_credits",
    description:
      "Show remaining balances for this API key: Sensei search credits and the Contact Enrichment monthly quota.",
    inputSchema: { type: "object", properties: {} },
  },
];

function mapRows(tables: any[]): any[] {
  const out: any[] = [];
  for (const t of tables || []) {
    for (const r of t.rows || []) {
      const c = r.cells || {};
      out.push({
        row_id: r.id,
        company: c.company || "",
        role: c.role || "",
        location: c.city || "",
        pay: c.stipend || "",
        posted: c.posted || "",
        fit_score: c.fit_score ?? null,
        why_now: c.why_now || "",
        source: c.source || "",
        apply_url: c.evidence_url || c.website || "",
        website: c.website || "",
        contact: {
          name: c.contact_name || "",
          title: c.contact_title || "",
          email: c.contact_email || "",
          phone: c.contact_phone || "",
          linkedin_url: c.contact_linkedin_url || "",
          status: c._contact_status || "",
        },
      });
    }
  }
  return out;
}

async function dispatch(name: string, args: any, caller: Caller): Promise<Content> {
  args = args || {};
  switch (name) {
    case "sensei_search": {
      if (!bobConfigured()) return err("Sensei is not configured on this environment.");
      const query = String(args.query || "").trim();
      if (!query) return err("Provide a 'query' — the hiring brief in plain English.");
      const org = await resolveOrg(caller);
      if (!org.ok) return err(`Could not open your Sensei workspace: ${org.error}`);
      const chat = await createChat(org.orgId);
      if (!chat.ok) return err(`Could not start a search: ${chat.error}`);
      const run = await sendMessage(org.orgId, chat.data.id, query);
      if (!run.ok) {
        if (run.status === 402)
          return err("Out of Sensei search credits for this key. Contact admin@studojo.com to top up.");
        return err(`Could not start a search: ${run.error}`);
      }
      return ok({
        run_id: run.data.run_id,
        chat_id: chat.data.id,
        status: "running",
        next: "Poll sensei_status with this run_id; when status is 'done', call sensei_results.",
      });
    }
    case "sensei_status": {
      if (!bobConfigured()) return err("Sensei is not configured on this environment.");
      const runId = Number(args.run_id);
      if (!Number.isFinite(runId)) return err("Provide a numeric 'run_id'.");
      const org = await resolveOrg(caller);
      if (!org.ok) return err(`Workspace error: ${org.error}`);
      const r = await getRun(org.orgId, runId);
      if (!r.ok) return r.status === 404 ? err("No such run for this key.") : err(r.error);
      const d = r.data || {};
      return ok({ run_id: runId, status: d.status, summary: d.answer || "", counters: d.counters || {}, done: d.status === "done" });
    }
    case "sensei_results": {
      if (!bobConfigured()) return err("Sensei is not configured on this environment.");
      const runId = Number(args.run_id);
      if (!Number.isFinite(runId)) return err("Provide a numeric 'run_id'.");
      const org = await resolveOrg(caller);
      if (!org.ok) return err(`Workspace error: ${org.error}`);
      const r = await getRun(org.orgId, runId);
      if (!r.ok) return r.status === 404 ? err("No such run for this key.") : err(r.error);
      const d = r.data || {};
      const companies = mapRows(d.tables || []);
      return ok({ run_id: runId, status: d.status, count: companies.length, summary: d.answer || "", companies });
    }
    case "enrich_contact": {
      if (!enginesConfigured())
        return err("The enrichment engine is not connected for this account. Contact admin@studojo.com.");
      const target = parseTarget(args);
      if (!target) return err("Provide linkedin_url, or first_name + last_name + (company or domain).");
      const q = await quotaStatus(caller.id, caller.monthlyQuota);
      if (!q.ok) return err(`Out of enrichment credits (${q.used}/${q.quota} this month).`);
      const fields = Array.isArray(args.fields)
        ? args.fields.filter((f: any) => f === "email" || f === "phone")
        : ["email", "phone"];
      if (!fields.length) fields.push("email", "phone");
      const result = await enrichProfile(target, fields);
      if (!result.cached && result.credits_used > 0) await chargeUsage(caller.id, result.credits_used);
      return ok(result);
    }
    case "enrich_bulk": {
      if (!enginesConfigured())
        return err("The enrichment engine is not connected for this account. Contact admin@studojo.com.");
      const items = Array.isArray(args.items) ? args.items : [];
      if (!items.length) return err("Provide 'items' — an array of contacts to enrich.");
      if (items.length > BULK_MAX) return err(`Too many items (max ${BULK_MAX}).`);
      const q = await quotaStatus(caller.id, caller.monthlyQuota);
      if (!q.ok) return err(`Out of enrichment credits (${q.used}/${q.quota} this month).`);
      const fields = Array.isArray(args.fields)
        ? args.fields.filter((f: any) => f === "email" || f === "phone")
        : ["email", "phone"];
      const jobRes = await createJob(caller, items, fields.length ? fields : ["email", "phone"]);
      return ok({ ...jobRes, next: "Poll enrichment_status with this job_id." });
    }
    case "enrichment_status": {
      const jobId = String(args.job_id || "").trim();
      if (!jobId) return err("Provide a 'job_id'.");
      const jr = await getJob(caller.email, jobId);
      if (!jr) return err("No such job for this key.");
      return ok(jr);
    }
    case "sensei_credits": {
      const q = await quotaStatus(caller.id, caller.monthlyQuota);
      const out: any = {
        enrichment_api: { monthly_used: q.used, monthly_quota: q.quota, remaining: Math.max(0, q.quota - q.used) },
      };
      if (bobConfigured()) {
        const org = await resolveOrg(caller);
        if (org.ok) {
          const c = await getCredits(org.orgId);
          if (c.ok)
            out.sensei = {
              search_credits: c.data?.ai_balance ?? c.data?.ai ?? null,
              enrichment_credits: c.data?.enrichment_balance ?? c.data?.enrichment ?? null,
            };
        }
      }
      return ok(out);
    }
    default:
      return err(`Unknown tool: ${name}`);
  }
}

async function handle(m: any, caller: Caller, ctx: { t0: number; ip: string | null }): Promise<any | undefined> {
  const id = m?.id;
  const method = m?.method;
  const isNotification = id === undefined || id === null;
  const reply = (result: any) => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

  if (method === "initialize")
    return reply({
      protocolVersion: m?.params?.protocolVersion || PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
    });
  if (method === "ping") return reply({});
  if (method === "tools/list") return reply({ tools: TOOLS });
  if (method === "tools/call") {
    if (isNotification) return undefined;
    const name = m?.params?.name;
    const args = m?.params?.arguments || {};
    const rl = await rateLimit(caller.id);
    if (!rl.ok) return reply(err(`Rate limited, retry in ${rl.resetSec}s.`));
    let result: Content;
    try {
      result = await dispatch(name, args, caller);
    } catch {
      result = err("Internal error running the tool. Try again.");
    }
    await logRequest({
      keyId: caller.id,
      email: caller.email,
      endpoint: "/api/mcp",
      target: name || null,
      status: result.isError ? "error" : "ok",
      httpStatus: 200,
      credits: 0,
      cached: false,
      ms: Date.now() - ctx.t0,
      ip: ctx.ip,
    });
    return reply(result);
  }
  if (method && method.startsWith("notifications/")) return undefined;
  if (isNotification) return undefined;
  return fail(-32601, `Method not found: ${method}`);
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const g = await guard(request, false); // authenticate the sk_live_ key; tools meter individually
  if (!g.ok) return g.response;

  let msg: any;
  try {
    msg = await request.json();
  } catch {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
  }

  const ctx = { t0: Date.now(), ip: (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null };
  const isBatch = Array.isArray(msg);
  const messages = isBatch ? msg : [msg];
  const responses: any[] = [];
  for (const m of messages) {
    const r = await handle(m, g.caller, ctx);
    if (r !== undefined) responses.push(r);
  }
  if (!responses.length) return new Response(null, { status: 202 }); // only notifications
  return json(isBatch ? responses : responses[0]);
}

export async function loader() {
  return json(
    {
      error: "method_not_allowed",
      message: "This is the Sensei MCP endpoint. Connect an MCP client over Streamable HTTP (POST JSON-RPC) with Authorization: Bearer sk_live_…",
    },
    405,
  );
}
