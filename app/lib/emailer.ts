import { fetchWithRetry } from "./fetch-with-retry";
import { getControlPlaneUrl, getToken } from "./control-plane";

// Use control plane URL instead of direct emailer service URL
export function getEmailerServiceUrl(): string {
  return getControlPlaneUrl();
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
    throw new Error(data.error?.message || data.error || "Failed to request password reset");
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
    throw new Error(data.error?.message || data.error || "Failed to reset password");
  }
  return data;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const base = getEmailerServiceUrl();
  const res = await fetchWithRetry(`${base}/v1/email/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId, current_password: currentPassword, new_password: newPassword }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.error || "Failed to change password");
  }
  return data;
}

export async function getEmailPreferences(userId: string): Promise<EmailPreferences> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const base = getEmailerServiceUrl();
  const res = await fetchWithRetry(`${base}/v1/email/preferences/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.error || "Failed to get email preferences");
  }
  return data;
}

export async function updateEmailPreferences(
  userId: string,
  preferences: EmailPreferencesUpdate
): Promise<EmailPreferences> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const base = getEmailerServiceUrl();
  const res = await fetchWithRetry(`${base}/v1/email/preferences/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preferences),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.error || "Failed to update email preferences");
  }
  return data;
}

