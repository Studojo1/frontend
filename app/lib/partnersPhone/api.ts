/**
 * Fetch utility for the Studojo Phone B2B Partners API.
 * Base: https://studojo.com/partners/phone
 * Auth: Bearer token stored in localStorage as "phone_partner_token"
 */

const PHONE_PARTNERS_API = "https://studojo.com/partners/phone";

export class PhonePartnersApiError extends Error {
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
  return localStorage.getItem("phone_partner_token");
}

export function setToken(token: string): void {
  localStorage.setItem("phone_partner_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("phone_partner_token");
  localStorage.removeItem("phone_partner_user");
}

export function getStoredUser(): { name: string; email: string; company?: string; id: number } | null {
  try {
    const raw = localStorage.getItem("phone_partner_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: { name: string; email: string; company?: string; id: number }): void {
  localStorage.setItem("phone_partner_user", JSON.stringify(user));
}

export async function phonePartnersFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${PHONE_PARTNERS_API}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    const detail = data?.detail;
    const errorMessage = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
      ? detail.map((e: any) => e.msg ?? JSON.stringify(e)).join(", ")
      : data?.message ?? `Request failed (${res.status})`;
    throw new PhonePartnersApiError(errorMessage, res.status, data);
  }
  return data as T;
}

export async function phonePartnersGet<T = unknown>(path: string): Promise<T> {
  return phonePartnersFetch<T>(path);
}

export async function phonePartnersPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return phonePartnersFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function phonePartnersDelete(path: string): Promise<void> {
  return phonePartnersFetch<void>(path, { method: "DELETE" });
}
