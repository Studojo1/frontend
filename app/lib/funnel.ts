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

export function logFunnelStep(event: "auth_view" | "upload_view"): void {
  if (typeof window === "undefined") return;
  fetch("/api/funnel-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, anon_id: anonId(), path: window.location.pathname + window.location.search }),
    keepalive: true,
  }).catch(() => {
    // Tracking must never surface to the user.
  });
}
