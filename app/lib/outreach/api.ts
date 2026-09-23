import { describeError } from "~/lib/error-detail";
import { getToken, ControlPlaneError } from "~/lib/control-plane";
import { fetchWithRetry } from "~/lib/fetch-with-retry";

/**
 * Raw authenticated fetch for SSE streaming endpoints.
 * Returns the Response directly so the caller can consume body as a ReadableStream.
 */
export async function outreachStreamFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("Not authenticated", 401);

  const url = `/api/v1/outreach${path}`;
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
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

  // fetchWithRetry clears its timer as soon as headers arrive, so on its own
  // the body download has no deadline. Our own controller covers that part:
  // a stalled body is aborted `timeout` after the headers landed.
  const bodyController = new AbortController();
  if (fetchOpts.signal) {
    const outer = fetchOpts.signal;
    if (outer.aborted) bodyController.abort();
    else outer.addEventListener("abort", () => bodyController.abort(), { once: true });
  }

  const res = await fetchWithRetry(url, {
    ...fetchOpts,
    signal: bodyController.signal,
    credentials: "include",
    headers,
    maxRetries,
    timeout,
  });

  // For 204 No Content
  if (res.status === 204) return undefined as T;

  const bodyTimer = setTimeout(() => bodyController.abort(), timeout);
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
  } finally {
    clearTimeout(bodyTimer);
  }

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

/**
 * True when the backend rejected the request because the session is gone.
 * Pages use this to offer a sign-in instead of printing "Request failed (401)".
 */
export function isAuthExpired(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 401;
}
