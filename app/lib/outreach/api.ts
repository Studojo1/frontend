import { describeError } from "~/lib/error-detail";
import { getToken, ControlPlaneError } from "~/lib/control-plane";
import { fetchWithRetry } from "~/lib/fetch-with-retry";

/**
 * Raw authenticated fetch for SSE streaming endpoints.
 * Returns the Response directly so the caller can consume body as a ReadableStream.
 */
export async function outreachStreamFetch(
  path: string,
  options: RequestInit & { maxRetries?: number; timeout?: number } = {},
): Promise<Response> {
  // Token is optional, matching outreachFetch: the backend also accepts the
  // same-origin session cookie. Throwing on a missing token meant a student
  // whose token had simply not been minted yet was told to start over, on the
  // one request that had no retry to recover with.
  let token: string | null = null;
  try {
    token = await getToken();
  } catch {}

  const { maxRetries = 2, timeout = 20_000, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOpts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `/api/v1/outreach${path}`;

  // Retry is safe here specifically because the quiz stream endpoint is a pure
  // replay of the history it is sent: zero LLM calls, questions served from a
  // static sequence, and answers now merged by question key rather than
  // appended, so sending the same turn twice cannot double-count an answer.
  //
  // Without a timeout this fetch could hang forever. On a phone that is not
  // hypothetical: a connection that drops mid-stream leaves the request open,
  // the quiz shows a spinner, and there is nothing the student can do but
  // reload, which used to throw the quiz away as well.
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        ...fetchOpts,
        credentials: "include",
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      // Retry a 5xx, but never a 4xx: the request itself is wrong and sending
      // it again just burns the student's time.
      if (res.status >= 500 && attempt < maxRetries) {
        lastErr = new ControlPlaneError(`Stream failed (${res.status})`, res.status);
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt >= maxRetries) break;
      // Brief backoff so an immediate retry does not hit the same blip.
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }

  throw lastErr ?? new ControlPlaneError("Stream request failed", 0);
}

/**
 * Authenticated fetch wrapper for all outreach API calls.
 * Uses same-origin relative path /api/v1/outreach/* to avoid CORS.
 * Ingress routes this to job-outreach-svc with rewrite to /api/v1/*.
 */
export async function outreachFetch<T = unknown>(
  path: string,
  options: RequestInit & { maxRetries?: number; timeout?: number } = {},
): Promise<T> {
  // Token is optional — backend also accepts session cookies (same-origin).
  // Don't block the request if getToken() fails.
  let token: string | null = null;
  try {
    token = await getToken();
  } catch {}

  const url = `/api/v1/outreach${path}`;

  const { maxRetries = 3, timeout = 30_000, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...fetchOpts.headers as Record<string, string>,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetchWithRetry(url, {
    ...fetchOpts,
    credentials: "include",
    headers,
    maxRetries,
    timeout,
  });

  // For 204 No Content
  if (res.status === 204) return undefined as T;

  // fetchWithRetry's deadline still covers this body read (see there).
  let data: any = null;
  try {
    const text = await res.text();
    // An ingress or proxy error page is HTML, not JSON. Parsing it blindly
    // turned a 401/502 into "Unexpected token '<'" on screen.
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new ControlPlaneError(`Request timeout after ${timeout / 1000}s`, 0);
    }
    throw err;
  }

  if (res.status === 401) redirectToSignIn();

  if (!res.ok) {
    throw new ControlPlaneError(
      // See error-detail.ts: `detail` can be an array of validation objects,
      // which is truthy and stringifies to "[object Object]". Every caller
      // that renders err.message inherits this fix.
      data?.error?.message ?? describeError(data, `Request failed (${res.status})`),
      res.status,
      data,
    );
  }

  return data as T;
}

const SIGNIN_BOUNCE_KEY = "outreach-signin-bounce";

/**
 * Send the user to sign in, coming back to this page afterwards.
 *
 * Browser only, and at most once a minute: if the BetterAuth client session is
 * still valid but the backend keeps answering 401, /auth would bounce straight
 * back here and loop. After one bounce the error surfaces instead, and the page
 * shows its own "sign in again" prompt (see isAuthExpired).
 */
function redirectToSignIn() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname + window.location.search;
  if (path.startsWith("/auth")) return;
  try {
    const last = Number(sessionStorage.getItem(SIGNIN_BOUNCE_KEY) || 0);
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem(SIGNIN_BOUNCE_KEY, String(Date.now()));
  } catch {
    return; // storage blocked: no loop guard, so do not redirect
  }
  window.location.assign(`/auth?mode=signin&redirect=${encodeURIComponent(path)}`);
}

/**
 * True when the backend rejected the request because the session is gone.
 * Pages use this to offer a sign-in instead of printing "Request failed (401)".
 */
export function isAuthExpired(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 401;
}
