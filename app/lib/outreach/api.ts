import { getControlPlaneUrl, getToken, ControlPlaneError } from "~/lib/control-plane";
import { fetchWithRetry } from "~/lib/fetch-with-retry";

/**
 * Authenticated fetch wrapper for all outreach API calls.
 * Routes through the control-plane at /v1/outreach/*.
 */
export async function outreachFetch<T = unknown>(
  path: string,
  options: RequestInit & { maxRetries?: number; timeout?: number } = {},
): Promise<T> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("Not authenticated", 401);

  const base = getControlPlaneUrl();
  const url = `${base}/v1/outreach${path}`;

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