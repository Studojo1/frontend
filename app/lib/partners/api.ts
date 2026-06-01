/**
 * Fetch utility for the Studojo B2B Partners API.
 * Base: https://partners.studojo.com
 * Auth: Bearer token stored in localStorage as "partner_token"
 */

const PARTNERS_API = "https://partners.studojo.com";

export class PartnersApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("partner_token");
}

export function setToken(token: string): void {
  localStorage.setItem("partner_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("partner_token");
  localStorage.removeItem("partner_user");
}

export function getStoredUser(): { name: string; email: string; company?: string; id: number } | null {
  try {
    const raw = localStorage.getItem("partner_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: { name: string; email: string; company?: string; id: number }): void {
  localStorage.setItem("partner_user", JSON.stringify(user));
}

export async function partnersFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${PARTNERS_API}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    throw new PartnersApiError(
      data?.detail ?? data?.message ?? `Request failed (${res.status})`,
      res.status,
      data,
    );
  }
  return data as T;
}

export async function partnersGet<T = unknown>(path: string): Promise<T> {
  return partnersFetch<T>(path);
}

export async function partnersPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return partnersFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function partnersDelete(path: string): Promise<void> {
  return partnersFetch<void>(path, { method: "DELETE" });
}
