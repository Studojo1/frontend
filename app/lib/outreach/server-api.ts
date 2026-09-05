// Server-side client for job-outreach-svc.
//
// `outreachFetch` in ./api.ts is a BROWSER helper and cannot be used from a
// loader or an action. Three things make it browser-only:
//
//   1. the URL is relative (`/api/v1/outreach…`), which has nothing to resolve
//      against on the server, so the fetch throws
//   2. `credentials: "include"` sends a cookie the server does not hold
//   3. `getToken()` reads browser storage
//
// Calling it server-side therefore fails EVERY time — silently, if the caller
// wraps it in a try/catch. That is exactly what happened: the extension's apply
// route asked whether Gmail was connected, the call threw, the catch set the
// answer to null, and the student was told to connect Gmail no matter how many
// times they already had.
//
// This client talks to the service directly, in-cluster, and identifies the
// student explicitly rather than relying on an ambient session.
const OUTREACH_URL =
  process.env.OUTREACH_SVC_URL ?? "http://job-outreach-svc:8000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";

import { describeError } from "~/lib/error-detail";

export class OutreachServerError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function outreachServerFetch<T = unknown>(
  path: string,
  opts: {
    method?: string;
    body?: unknown;
    userId?: string;
    timeout?: number;
  } = {},
): Promise<T> {
  const { method = "GET", body, userId, timeout = 10_000 } = opts;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // MUST be exactly "X-User-Id". job-outreach-svc's get_current_user
  // (api/dependencies.py:34) reads that header and nothing else; anything
  // differently named is ignored, it then finds no session cookie, and every
  // call comes back 401 — which the callers were swallowing as "not
  // connected". I had sent X-Studojo-User-Id.
  if (userId) headers["X-User-Id"] = userId;
  if (INTERNAL_SECRET) headers["x-studojo-internal"] = INTERNAL_SECRET;

  const res = await fetch(`${OUTREACH_URL}/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeout),
  });

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // A non-JSON body from an error page must not throw a SyntaxError and
      // mask the real status.
      data = { detail: text.slice(0, 300) };
    }
  }

  if (!res.ok) {
    // describeError, not a `??` chain. FastAPI returns `detail` as a STRING
    // for our own HTTPExceptions and as an ARRAY OF OBJECTS for validation
    // failures — and an array is truthy, so it wins the fallback and then
    // stringifies to "[object Object]". That reached a student once.
    const detail = describeError(data, `Request failed (${res.status})`);
    throw new OutreachServerError(detail, res.status, data);
  }

  return data as T;
}
