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
  const token = await getToken();
  if (!token) throw new ControlPlaneError("Not authenticated", 401);

  const url = `/api/v1/outreach${path}`;

  const { maxRetries = 3, timeout = 30_000, ...fetchOpts } = options;

  const res = await fetchWithRetry(url, {
    ...fetchOpts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...fetchOpts.headers,
    },
    maxRetries,
    timeout,
  });

  // For 204 No Content
  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    throw new ControlPlaneError(
      data?.error?.message ?? data?.detail ?? `Request failed (${res.status})`,
      res.status,
      data,
    );
  }

  return data as T;
}