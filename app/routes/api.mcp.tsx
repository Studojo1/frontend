// POST /api/mcp — the hosted Sensei MCP server (JSON-RPC 2.0 over Streamable HTTP).
// Auth: Authorization: Bearer sk_live_… (the same keys as /api/enrich). Each key is
// bound to the Sensei workspace its owner already belongs to (see lib/mcp/keyorg.server.ts),
// so an agent sees the same searches, tables and shared credits as the browser. Tools:
// sensei_search / sensei_status / sensei_reply / sensei_stop / sensei_results /
// sensei_reveal_contacts (discovery) and enrich_contact / enrich_bulk /
// enrichment_status / sensei_credits, plus sourcing_enrich_contacts for workspaces
// set up for candidate sourcing.
import type { Route } from "./+types/api.mcp";
import { guard, json } from "~/lib/api-guard.server";
import { chargeUsage, logRequest, quotaStatus, rateLimit, type Caller } from "~/lib/api-keys.server";
import { enrichProfile, parseTarget, enginesConfigured } from "~/lib/enrich.server";
import { createJob, getJob, BULK_MAX } from "~/lib/api-jobs.server";
import {
  bobConfigured, createChat, sendMessage, getRun, getChat, getCredits, enrichRow, enrichTable,
  stopRun, sourcingEnrich,
} from "~/lib/mcp/bob-client";
import { resolveOrg } from "~/lib/mcp/keyorg.server";
import { CODE, fail, scrub, safeProgress, codeForStatus, type Code } from "~/lib/mcp/errors.server";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "studojo-sensei", version: "1.0.0" };

type Content = { content: { type: "text"; text: string }[]; isError?: boolean };
const ok = (obj: unknown): Content => ({
  content: [{ type: "text", text: typeof obj === "string" ? obj : JSON.stringify(obj, null, 2) }],
});
const err = (message: string): Content => ({ content: [{ type: "text", text: message }], isError: true });

/** A coded failure: the customer gets a generic message + a ref; the true reason is
 *  recorded internally against that ref (and alerts ops when our side is unhealthy). */
async function failed(
  code: Code,
  ctx: { tool: string; caller: Caller; detail?: string; hint?: string },
): Promise<Content> {
  const f = await fail(code, {
    detail: ctx.detail,
    hint: ctx.hint,
    tool: ctx.tool,
    keyId: ctx.caller.id,
    email: ctx.caller.email,
  });
  return { content: [{ type: "text", text: JSON.stringify({ error: f }, null, 2) }], isError: true };
}

const TOOLS = [
  {
    name: "sensei_search",
    description:
      "Start a Sensei hiring search from a plain-English brief (role/function, location, company type, pay, seniority). Returns a run_id immediately; the search runs for a few minutes. Poll sensei_status, then read sensei_results. If the brief is missing something load-bearing (pay band, company type, location), Sensei may pause and ask ONE clarifying question — sensei_status then returns status 'waiting_user' with the question; answer it with sensei_reply. Example: 'business analyst roles at funded startups in Bangalore, 0-2 years'.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "The full hiring brief in plain English." } },
      required: ["query"],
    },
  },
  {
    name: "sensei_status",
    description:
      "Check a Sensei search's progress by run_id. Returns status (running | waiting_user | done | error) and a short progress summary. Poll every ~20-30s. IMPORTANT: if status is 'waiting_user', Sensei is BLOCKED on a clarifying question — the response carries `question`, `options` and `chat_id`; answer it with sensei_reply (ask the user first if you cannot infer it) or the search will never finish. When status is 'done', call sensei_results.",
    inputSchema: {
      type: "object",
      properties: { run_id: { type: "integer", description: "The run_id from sensei_search." } },
      required: ["run_id"],
    },
  },
  {
    name: "sensei_reply",
    description:
      "Answer Sensei's clarifying question (when sensei_status returned 'waiting_user'), or send a follow-up instruction to refine an existing search ('make it Pune instead', 'only funded startups'). Returns a NEW run_id — poll that one with sensei_status. Pass the chat_id (or the run_id) from the search you are answering.",
    inputSchema: {
      type: "object",
      properties: {
        answer: { type: "string", description: "The answer or follow-up instruction, in plain English." },
        chat_id: { type: "integer", description: "The chat_id from sensei_search / sensei_status." },
        run_id: { type: "integer", description: "Alternative to chat_id: the run you are answering." },
      },
      required: ["answer"],
    },
  },
  {
    name: "sensei_stop",
    description:
      "Stop a search that is still running, when the brief was wrong or you no longer need it. Whatever it already found stays readable with sensei_results. Stopping frees the workspace from a run that would otherwise keep spending.",
    inputSchema: {
      type: "object",
      properties: { run_id: { type: "integer", description: "The run to stop." } },
      required: ["run_id"],
    },
  },
  {
    name: "sensei_results",
    description:
      "Get the companies and roles a Sensei search found (company, role, location, pay, fit score, why-now signal, apply link). Call once sensei_status is 'done'; also returns partial rows while still running. Contacts come back BLANK by default: they are revealed on demand with sensei_reveal_contacts, and this response tells you how many are pending plus the table_id to reveal them with.",
    inputSchema: {
      type: "object",
      properties: { run_id: { type: "integer", description: "The run_id from sensei_search." } },
      required: ["run_id"],
    },
  },
  {
    name: "sensei_reveal_contacts",
    description:
      "Reveal the hiring-side contact (name, title, email, direct phone) for Sensei search results. Results come back WITHOUT contacts by default — each row's contact.status is 'pending' until revealed. Pass table_id to reveal every unresolved row in one go (recommended, batched, already-revealed rows are skipped so it never double-charges), or row_id for a single company. Spends the workspace's reveal credits, exactly like the Enrich button in the app. Runs in the background: call sensei_results again in ~30-60s and the contacts will have filled in.",
    inputSchema: {
      type: "object",
      properties: {
        table_id: { type: "integer", description: "Reveal every unresolved row in this result table." },
        row_id: { type: "integer", description: "Or reveal just this one row." },
      },
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
    name: "sourcing_enrich_contacts",
    description:
      "Bulk contact enrichment. Give it LinkedIn profile links or rows copied from a spreadsheet " +
      "(name, company, one per line) and it returns work email and phone for each. Only available to " +
      "workspaces set up for candidate sourcing; other workspaces get a clear refusal. A credit is " +
      "charged only for a contact actually found, never for a miss.",
    inputSchema: {
      type: "object",
      properties: {
        people: {
          type: "string",
          description:
            "LinkedIn profile links (one per line), or rows copied from a sheet with a header line, " +
            "e.g. 'Name | Company' then one person per line.",
        },
        want_email: { type: "boolean", description: "Default true." },
        want_phone: { type: "boolean", description: "Default true." },
      },
      required: ["people"],
    },
  },
  {
    name: "sensei_credits",
    description:
      "Show what is left: this workspace's Sensei search credits and reveal credits (the same shared pool the app and dashboard show), plus this key's monthly Contact Enrichment quota.",
    inputSchema: { type: "object", properties: {} },
  },
];

/** Counters minus bob-svc's internal bookkeeping (leading underscore). */
function publicCounters(c: any): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(c || {})) if (!k.startsWith("_")) out[k] = v;
  return out;
}

function mapRows(tables: any[]): any[] {
  const out: any[] = [];
  for (const t of tables || []) {
    for (const r of t.rows || []) {
      const c = r.cells || {};
      out.push({
        row_id: r.id,
        table_id: t.id,
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

/** Tap-answer choices for a 'waiting_user' question. bob-svc stores them on the LAST
 *  assistant message's meta.suggestions, not on the run, so read them from the chat.
 *  Best-effort: the question text alone is enough to answer. */
async function questionOptions(orgId: number, chatId: any): Promise<string[]> {
  if (!Number.isFinite(Number(chatId))) return [];
  const c = await getChat(orgId, Number(chatId));
  if (!c.ok) return [];
  const msgs = (c.data?.messages || []) as any[];
  for (let i = msgs.length - 1; i >= 0; i--) {
    const s = msgs[i]?.meta?.suggestions;
    if (msgs[i]?.role === "assistant" && Array.isArray(s) && s.length) return s.map(String);
  }
  return [];
}

async function dispatch(name: string, args: any, caller: Caller): Promise<Content> {
  args = args || {};
  switch (name) {
    case "sensei_search": {
      if (!bobConfigured()) return failed(CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: "gateway secret unset" });
      const query = String(args.query || "").trim();
      if (!query) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide a 'query' — the hiring brief in plain English." });
      const org = await resolveOrg(caller);
      if (!org.ok) return failed(org.error.includes("not linked") ? CODE.WORKSPACE_NOT_LINKED : CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: org.error });
      const chat = await createChat(org.orgId);
      if (!chat.ok) return failed(codeForStatus(chat.status), { tool: name, caller, detail: `createChat: ${chat.error}` });
      const run = await sendMessage(org.orgId, chat.data.id, query);
      if (!run.ok) {
        return failed(codeForStatus(run.status), { tool: name, caller, detail: `sendMessage: ${run.error}` });
      }
      return ok({
        run_id: run.data.run_id,
        chat_id: chat.data.id,
        status: "running",
        next: "Poll sensei_status with this run_id; when status is 'done', call sensei_results.",
      });
    }
    case "sensei_status": {
      if (!bobConfigured()) return failed(CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: "gateway secret unset" });
      const runId = Number(args.run_id);
      if (!Number.isFinite(runId)) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide a numeric 'run_id'." });
      const org = await resolveOrg(caller);
      if (!org.ok) return failed(org.error.includes("not linked") ? CODE.WORKSPACE_NOT_LINKED : CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: org.error });
      const r = await getRun(org.orgId, runId);
      if (!r.ok) return failed(codeForStatus(r.status), { tool: name, caller, detail: `getRun: ${r.error}`, hint: "No such run for this key." });
      const d = r.data || {};
      const base: any = {
        run_id: runId,
        status: d.status,
        summary: scrub(d.answer),
        progress: safeProgress(d.events),
        counters: publicCounters(d.counters),
        done: d.status === "done",
      };
      // BLOCKED on a clarifying question: hand the agent everything it needs to answer
      // (the question text, the tap-answer options, and the chat to reply into).
      if (d.status === "waiting_user") {
        base.needs_answer = true;
        base.question = scrub(d.answer) || "Could you clarify your request?";
        base.chat_id = d.chat_id ?? null;
        base.options = await questionOptions(org.orgId, d.chat_id);
        base.next =
          "Sensei is waiting on this answer and will not continue until it gets one. Reply with sensei_reply({ chat_id, answer }) — that starts a NEW run_id to poll.";
      }
      return ok(base);
    }
    case "sensei_reply": {
      if (!bobConfigured()) return failed(CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: "gateway secret unset" });
      const answer = String(args.answer || "").trim();
      if (!answer) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide an 'answer' — what to tell Sensei." });
      const org = await resolveOrg(caller);
      if (!org.ok) return failed(org.error.includes("not linked") ? CODE.WORKSPACE_NOT_LINKED : CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: org.error });
      let chatId = Number(args.chat_id);
      if (!Number.isFinite(chatId)) {
        const rid = Number(args.run_id);
        if (!Number.isFinite(rid)) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide a 'chat_id' (or the 'run_id' you are answering)." });
        const rr = await getRun(org.orgId, rid);
        if (!rr.ok) return failed(codeForStatus(rr.status), { tool: name, caller, detail: `getRun: ${rr.error}`, hint: "No such run for this key." });
        chatId = Number(rr.data?.chat_id);
        if (!Number.isFinite(chatId)) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Could not resolve the chat for that run_id; pass chat_id." });
      }
      const run = await sendMessage(org.orgId, chatId, answer);
      if (!run.ok) {
        return failed(codeForStatus(run.status), { tool: name, caller, detail: `sendMessage: ${run.error}`, hint: "No such search for this key." });
      }
      return ok({
        run_id: run.data.run_id,
        chat_id: chatId,
        status: "running",
        next: "Poll sensei_status with this NEW run_id; when it is 'done', call sensei_results.",
      });
    }
    case "sensei_stop": {
      if (!bobConfigured()) return failed(CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: "gateway secret unset" });
      const runId = Number(args.run_id);
      if (!Number.isFinite(runId)) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide a numeric 'run_id'." });
      const org = await resolveOrg(caller);
      if (!org.ok) return failed(org.error.includes("not linked") ? CODE.WORKSPACE_NOT_LINKED : CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: org.error });
      const r = await stopRun(org.orgId, runId);
      if (!r.ok) return failed(codeForStatus(r.status), { tool: name, caller, detail: `stopRun: ${r.error}`, hint: "No such run for this key." });
      // Report the run's REAL state rather than assuming it stopped: a run can reach a
      // terminal state on its own (it finished, or it paused on a clarifying question)
      // between the agent deciding to stop and the request landing.
      const after = await getRun(org.orgId, runId);
      const st = after.ok ? after.data?.status : null;
      if (st === "waiting_user")
        return ok({
          run_id: runId,
          status: "waiting_user",
          needs_answer: true,
          question: after.ok ? scrub(after.data?.answer) : "",
          chat_id: after.ok ? after.data?.chat_id ?? null : null,
          next: "It had already paused to ask you something rather than still running. Answer with sensei_reply, or just leave it.",
        });
      if (st === "done")
        return ok({ run_id: runId, status: "done", next: "It had already finished. Read it with sensei_results." });
      // bob-svc FLAGS the run and the pipeline winds down at its next safe checkpoint,
      // so a status of 'running' here means "accepted, winding down", not "stop failed".
      return ok({
        run_id: runId,
        status: st === "running" || !st ? "stopping" : st,
        next: "It winds down at the next safe checkpoint. Anything it already found stays readable with sensei_results.",
      });
    }
    case "sensei_results": {
      if (!bobConfigured()) return failed(CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: "gateway secret unset" });
      const runId = Number(args.run_id);
      if (!Number.isFinite(runId)) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide a numeric 'run_id'." });
      const org = await resolveOrg(caller);
      if (!org.ok) return failed(org.error.includes("not linked") ? CODE.WORKSPACE_NOT_LINKED : CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: org.error });
      const r = await getRun(org.orgId, runId);
      if (!r.ok) return failed(codeForStatus(r.status), { tool: name, caller, detail: `getRun: ${r.error}`, hint: "No such run for this key." });
      const d = r.data || {};
      const companies = mapRows(d.tables || []);
      // Don't let an empty table read as "nothing found" when Sensei is actually blocked
      // on a clarifying question — say so and hand over what's needed to unblock it.
      if (d.status === "waiting_user" && !companies.length) {
        return ok({
          run_id: runId,
          status: "waiting_user",
          needs_answer: true,
          question: scrub(d.answer) || "Could you clarify your request?",
          chat_id: d.chat_id ?? null,
          options: await questionOptions(org.orgId, d.chat_id),
          count: 0,
          companies: [],
          next: "Answer with sensei_reply({ chat_id, answer }) — the search has not run yet.",
        });
      }
      // Contacts are revealed on demand (and charged), so a fresh result set has them
      // blank. Say so explicitly — otherwise an agent reports "no contact found" when
      // the truth is "not revealed yet", and never calls the tool that would fill them.
      const pending = companies.filter((c) => !c.contact.email && !c.contact.phone).length;
      const tables = (d.tables || []).map((t: any) => ({ table_id: t.id, name: t.name, rows: (t.rows || []).length }));
      const out: any = { run_id: runId, status: d.status, count: companies.length, summary: scrub(d.answer), tables, companies };
      if (pending > 0) {
        out.contacts_pending = pending;
        out.next = `${pending} of ${companies.length} rows have no contact yet. Contacts are revealed on demand: call sensei_reveal_contacts({ table_id }) with a table_id above, wait ~30-60s, then read sensei_results again.`;
      }
      return ok(out);
    }
    case "sensei_reveal_contacts": {
      if (!bobConfigured()) return failed(CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: "gateway secret unset" });
      const org = await resolveOrg(caller);
      if (!org.ok) return failed(org.error.includes("not linked") ? CODE.WORKSPACE_NOT_LINKED : CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: org.error });
      const tableId = Number(args.table_id);
      const rowId = Number(args.row_id);
      if (!Number.isFinite(tableId) && !Number.isFinite(rowId))
        return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide a 'table_id' (reveal the whole table) or a 'row_id' (one company). Both come from sensei_results." });
      const r = Number.isFinite(tableId)
        ? await enrichTable(org.orgId, tableId)
        : await enrichRow(org.orgId, rowId);
      if (!r.ok) {
        return failed(codeForStatus(r.status), { tool: name, caller, detail: `enrich: ${r.error}`, hint: "No such table or row for this key." });
      }
      const d = r.data || {};
      if (d.status === "idle")
        return ok({ status: "idle", revealing: 0, note: "Every row already has a contact, or a reveal is already running." });
      return ok({
        status: "revealing",
        revealing: d.count ?? (Array.isArray(d.rows) ? d.rows.length : 1),
        next: "Runs in the background. Call sensei_results again in about 30-60 seconds to read the contacts.",
      });
    }
    case "enrich_contact": {
      if (!enginesConfigured())
        return failed(CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: "enrichment providers not configured" });
      const target = parseTarget(args);
      if (!target) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide linkedin_url, or first_name + last_name + (company or domain)." });
      const q = await quotaStatus(caller.id, caller.monthlyQuota);
      if (!q.ok) return failed(CODE.OUT_OF_CREDITS, { tool: name, caller, detail: `monthly quota ${q.used}/${q.quota}` });
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
        return failed(CODE.SERVICE_UNAVAILABLE, { tool: name, caller, detail: "enrichment providers not configured" });
      const items = Array.isArray(args.items) ? args.items : [];
      if (!items.length) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide 'items' — an array of contacts to enrich." });
      if (items.length > BULK_MAX) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: `Too many items (max ${BULK_MAX}).` });
      const q = await quotaStatus(caller.id, caller.monthlyQuota);
      if (!q.ok) return failed(CODE.OUT_OF_CREDITS, { tool: name, caller, detail: `monthly quota ${q.used}/${q.quota}` });
      const fields = Array.isArray(args.fields)
        ? args.fields.filter((f: any) => f === "email" || f === "phone")
        : ["email", "phone"];
      const jobRes = await createJob(caller, items, fields.length ? fields : ["email", "phone"]);
      return ok({ ...jobRes, next: "Poll enrichment_status with this job_id." });
    }
    case "enrichment_status": {
      const jobId = String(args.job_id || "").trim();
      if (!jobId) return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: "Provide a 'job_id'." });
      const jr = await getJob(caller.email, jobId);
      if (!jr) return failed(CODE.NOT_FOUND, { tool: name, caller, hint: "No such job for this key." });
      return ok(jr);
    }
    case "sourcing_enrich_contacts": {
      const people = String(args?.people || "").trim();
      if (!people) return failed("BAD_INPUT", { tool: name, caller: caller.id, detail: "people is required" });
      const org = await resolveOrg(caller);
      if (!org.ok) return failed(org.code, { tool: name, caller: caller.id, detail: org.detail });
      const r = await sourcingEnrich(org.orgId, people, {
        want_email: args?.want_email !== false,
        want_phone: args?.want_phone !== false,
      });
      if (!r.ok) {
        // 403 here means the workspace simply is not a sourcing workspace. Say
        // that plainly rather than leaking a backend status.
        if (r.status === 403)
          return failed("NOT_ENABLED", {
            tool: name, caller: caller.id,
            detail: "this workspace is not set up for contact enrichment",
          });
        return failed(codeForStatus(r.status), { tool: name, caller: caller.id, detail: r.error });
      }
      const d: any = r.data || {};
      return {
        rows: (d.rows || []).map((x: any) => ({
          name: x.name, company: x.company, title: x.title,
          linkedin_url: x.linkedin_url, email: x.email, phone: x.phone, status: x.status,
        })),
        summary: d.summary,
        billing: d.billing,
      };
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
      return failed(CODE.INVALID_INPUT, { tool: name, caller, hint: `Unknown tool: ${name}` });
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
    if (!rl.ok) return reply(await failed(CODE.RATE_LIMITED, { tool: String(name || "-"), caller, detail: `retry in ${rl.resetSec}s` }));
    let result: Content;
    try {
      result = await dispatch(name, args, caller);
    } catch (e) {
      result = await failed(CODE.INTERNAL_ERROR, { tool: String(name || "-"), caller, detail: String((e as any)?.message || e).slice(0, 500) });
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
