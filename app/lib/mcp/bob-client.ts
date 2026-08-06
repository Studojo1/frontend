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

/** Idempotently provision + seed this key's isolated org; returns its bob-svc org id. */
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
