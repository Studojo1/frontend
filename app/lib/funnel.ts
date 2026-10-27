/** Fire-and-forget server-side funnel step (see api.funnel-event.tsx). */

const ANON_KEY = "sj_anon_id";

function anonId(): string | null {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export type FunnelEvent =
  | "auth_view"
  | "upload_view"
  // EX-06: the /auth steps, so the in-app browser drop point is measurable.
  | "auth_google_click"
  | "auth_email_submit"
  | "auth_oauth_error"
  | "auth_in_app_copy_link"
  | "auth_in_app_open_chrome"
  // The Creator Program application (/creators): page view, first touch, each
  // step reached ("2".."4"), submit (info: share code), the no-LinkedIn
  // warning and what they chose, and share clicks (info: "channel:code").
  | "creators_view"
  | "creators_start"
  | "creators_step"
  | "creators_submit"
  | "creators_no_linkedin"
  | "creators_no_linkedin_continue"
  | "creators_no_linkedin_create"
  | "creators_share";

export function logFunnelStep(event: FunnelEvent, extra?: { in_app?: string | null; info?: string }): void {
  if (typeof window === "undefined") return;
  fetch("/api/funnel-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, anon_id: anonId(), path: window.location.pathname + window.location.search, ...extra }),
    keepalive: true,
  }).catch(() => {
    // Tracking must never surface to the user.
  });
}
