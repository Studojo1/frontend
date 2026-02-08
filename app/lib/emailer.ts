import { fetchWithRetry } from "./fetch-with-retry";

export function getEmailerServiceUrl(): string {
  const url = import.meta.env?.VITE_EMAILER_SERVICE_URL;
  if (typeof url === "string" && url) {
    return url;
  }
  // In production, use internal service URL
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname.includes("studojo.pro") || hostname.includes("studojo.com")) {
      const tld = hostname.includes("studojo.com") ? "studojo.com" : "studojo.pro";
      return `${protocol}//emailer.${tld}`;
    }
  }
  // Development fallback - use internal service (will need port-forwarding or proxy)
  return "http://localhost:8087";
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface EmailPreferences {
  id: string;
  user_id: string;
  product_emails: boolean;
  resume_emails: boolean;
  internship_emails: boolean;
  security_emails: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailPreferencesUpdate {
  product_emails?: boolean;
  resume_emails?: boolean;
  internship_emails?: boolean;
  security_emails?: boolean;
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const base = getEmailerServiceUrl();
  const res = await fetchWithRetry(`${base}/v1/email/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to request password reset");
  }
  return data;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string; password_created?: string }> {
  const base = getEmailerServiceUrl();
  const res = await fetchWithRetry(`${base}/v1/email/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, new_password: newPassword }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to reset password");
  }
  return data;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const base = getEmailerServiceUrl();
  const res = await fetchWithRetry(`${base}/v1/email/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, current_password: currentPassword, new_password: newPassword }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to change password");
  }
  return data;
}

export async function getEmailPreferences(userId: string): Promise<EmailPreferences> {
  const base = getEmailerServiceUrl();
  const res = await fetchWithRetry(`${base}/v1/email/preferences/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to get email preferences");
  }
  return data;
}

export async function updateEmailPreferences(
  userId: string,
  preferences: EmailPreferencesUpdate
): Promise<EmailPreferences> {
  const base = getEmailerServiceUrl();
  const res = await fetchWithRetry(`${base}/v1/email/preferences/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update email preferences");
  }
  return data;
}

