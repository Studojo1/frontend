import { describeError } from "~/lib/error-detail";
// Server-side client for bob-svc (Sensei), used ONLY by the hosted MCP (app/routes/api.mcp.tsx).
// Every call is scoped to ONE isolated per-key org through the trusted gateway
// (X-Internal-Secret + X-Bob-Org-Id), so bob-svc's own _same_org checks enforce per-key
// isolation exactly as they do for a logged-in user. In-cluster, ingress is bypassed:
// bob-svc serves the router at /api/v1/bob (see bob-svc api/main.py).
const BASE =
  (process.env.BOB_INTERNAL_URL || "http://bob-svc:8000").replace(/\/+$/, "") + "/api/v1/bob";
const SECRET = process.env.BOB_MCP_SECRET || "";

export function bobConfigured(): boolean {
  return !!SECRET;
}

export type BobResp<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

async function call<T>(
  path: string,
  opts: { method?: string; orgId?: number | null; body?: unknown } = {},
): Promise<BobResp<T>> {
  if (!SECRET) return { ok: false, status: 503, error: "sensei_gateway_not_configured" };
  const headers: Record<string, string> = { "X-Internal-Secret": SECRET };
  if (opts.orgId != null) headers["X-Bob-Org-Id"] = String(opts.orgId);
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  let r: Response;
  try {
    r = await fetch(BASE + path, {
      method: opts.method || "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    return { ok: false, status: 502, error: "sensei_unreachable" };
  }
  let data: any = null;
  try {
    data = await r.json();
  } catch {
    data = null;
  }
  if (!r.ok) {
    const msg = (data && (data.detail || data.error)) || `http_${r.status}`;
    return { ok: false, status: r.status, error: String(msg) };
  }
  return { ok: true, data: data as T };
}

/** The Sensei workspace this API key's OWNER already belongs to. This is what binds an
 *  agent to the same workspace the person uses in the browser (same searches, same shared
 *  credits). 404 => the email has no Sensei account. */
export function resolveUser(
  email: string,
): Promise<BobResp<{ org_id: number; name: string; role: string }>> {
  return call("/gateway/resolve-user", { method: "POST", body: { email } });
}

/** Stop a run that is still going. */
export function stopRun(orgId: number, runId: number): Promise<BobResp<any>> {
  return call(`/runs/${runId}/stop`, { method: "POST", orgId });
}

/** Legacy: provision an ISOLATED org for a key with no Sensei account. No longer the
 *  default path — keys now bind to their owner's real workspace via resolveUser. */
export function provisionOrg(
  keyRef: string,
  enrichmentCredits = 50,
): Promise<BobResp<{ org_id: number; seeded: boolean }>> {
  return call("/gateway/provision", {
    method: "POST",
    body: { key_ref: keyRef, enrichment_credits: enrichmentCredits },
  });
}

export function createChat(orgId: number): Promise<BobResp<{ id: number; title: string }>> {
  return call("/chats", { method: "POST", orgId });
}

/** Post the search brief; bob-svc starts the run in the background and returns its id. */
export function sendMessage(
  orgId: number,
  chatId: number,
  content: string,
): Promise<BobResp<{ run_id: number }>> {
  return call(`/chats/${chatId}/messages`, { method: "POST", orgId, body: { content } });
}

export function getRun(orgId: number, runId: number): Promise<BobResp<any>> {
  return call(`/runs/${runId}`, { orgId });
}

export function getChat(orgId: number, chatId: number): Promise<BobResp<any>> {
  return call(`/chats/${chatId}`, { orgId });
}

export function getCredits(orgId: number): Promise<BobResp<any>> {
  return call("/credits", { orgId });
}

/** Reveal ONE result row's hiring-side contact. Spends the workspace's enrichment
 *  credits, exactly like the Enrich button in the app. Runs in the background: the
 *  row's contact status moves enriching -> found | not_found. */
export function enrichRow(orgId: number, rowId: number): Promise<BobResp<any>> {
  return call(`/rows/${rowId}/enrich`, { method: "POST", orgId });
}

/** Reveal every not-yet-resolved row in a result table (batched). Rows already found
 *  or in flight are skipped, so a repeat call never double-charges. */
export function enrichTable(orgId: number, tableId: number): Promise<BobResp<any>> {
  return call(`/tables/${tableId}/enrich`, { method: "POST", orgId });
}

/** Resolve a Sensei (app.studojo.com) session to its user + org + role. Used by the
 *  manager dashboard so a workspace admin can mint an MCP key for their OWN workspace
 *  without needing a separate studojo.com platform account. Authenticated by the
 *  caller's session token, NOT the gateway secret — bob-svc verifies it. */
/** Bulk contact enrichment for a sourcing workspace. bob-svc enforces the
 *  capability, so a key whose org lacks it gets a 403 rather than a silent no-op. */
export function sourcingEnrich(
  orgId: number,
  text: string,
  opts: { want_email?: boolean; want_phone?: boolean } = {},
): Promise<BobResp<any>> {
  return call("/sourcing/enrich", {
    method: "POST",
    orgId,
    body: { text, want_email: opts.want_email !== false, want_phone: opts.want_phone !== false },
  });
}

export async function whoAmI(
  session: string,
): Promise<BobResp<{ email: string | null; role: string; org: { id: number; name: string } | null }>> {
  if (!session) return { ok: false, status: 401, error: "no_session" };
  let r: Response;
  try {
    r = await fetch(BASE + "/me", { headers: { "X-Bob-Session": session } });
  } catch {
    return { ok: false, status: 502, error: "sensei_unreachable" };
  }
  let data: any = null;
  try {
    data = await r.json();
  } catch {
    data = null;
  }
  if (!r.ok) return { ok: false, status: r.status, error: describeError(data, `http_${r.status}`) };
  return { ok: true, data };
}
