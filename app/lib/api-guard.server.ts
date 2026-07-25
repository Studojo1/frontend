// Shared entry guard for the Contact Enrichment API routes:
// authenticate the key, enforce the per-key rate limit and monthly quota, and
// attach the standard rate-limit headers. Returns either a short-circuit
// Response or the resolved caller.
import { verifyKey, rateLimit, quotaStatus, type Caller } from "~/lib/api-keys.server";

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function bearer(request: Request): string {
  const h = request.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
}

export type Guarded =
  | { ok: true; caller: Caller; headers: Record<string, string> }
  | { ok: false; response: Response };

/**
 * @param count when false, only authenticate (no rate/quota) — used by GET
 *              endpoints like job polling that should not consume the limit.
 */
export async function guard(request: Request, count = true): Promise<Guarded> {
  const caller = await verifyKey(bearer(request));
  if (!caller) return { ok: false, response: json({ error: "invalid_api_key" }, 401) };

  if (!count) return { ok: true, caller, headers: {} };

  const rl = await rateLimit(caller.id);
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": "60",
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(rl.resetSec),
  };
  if (!rl.ok) {
    return {
      ok: false,
      response: json({ error: "rate_limited", retry_after: rl.resetSec }, 429, {
        ...headers,
        "Retry-After": String(rl.resetSec),
      }),
    };
  }

  const q = await quotaStatus(caller.id, caller.monthlyQuota);
  if (!q.ok) {
    return {
      ok: false,
      response: json(
        { error: "out_of_credits", used: q.used, quota: q.quota },
        402,
        headers,
      ),
    };
  }

  return { ok: true, caller, headers };
}
