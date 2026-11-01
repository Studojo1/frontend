/**
 * Base URL of the EMAILER service (NOT the control plane). Events must go to the
 * emailer's /v1/email/events, which is a different service than getEmailerServiceUrl()
 * (that returns the control plane, whose /v1/email/events expects a different
 * shape and 400s our payload, the original silent bug). Override with
 * EMAILER_SERVICE_URL; defaults to the public emailer host.
 */
function emailerBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.EMAILER_SERVICE_URL) {
    return process.env.EMAILER_SERVICE_URL;
  }
  return "https://email.studojo.com";
}

/**
 * RELAUNCH (2 Nov 2026, the owner): no email goes to a student from this app, not even by accident. Only events that
 * mail the Studojo team pass; every other routing key (the welcome, the old Outreach and internship events) is
 * dropped here, before any request. event.sensei.contact is a Sensei demo request, read by the team.
 */
export const TEAM_EVENT_KEYS: ReadonlySet<string> = new Set(["event.sensei.contact"]);

/** Whether this app may publish a routing key (team mail only). Pure, for tests. */
export function teamEventAllowed(routingKey: string): boolean {
  return TEAM_EVENT_KEYS.has(routingKey);
}

/**
 * Publish an email event directly to the EMAILER service.
 *
 * SERVER-SIDE ONLY. The emailer's /v1/email/events endpoint is gated by
 * X-Internal-Secret, so this attaches EMAILER_INTERNAL_SECRET from the server
 * environment. Browser code must use publishEmailEventFromClient instead.
 *
 * Non-blocking (a failed email never fails the calling operation) but it now
 * checks res.ok and logs a clear error on a non-2xx, so a misconfigured secret
 * or wrong URL is visible in logs instead of failing silently.
 */
export async function publishEmailEvent(routingKey: string, event: any): Promise<void> {
  if (!teamEventAllowed(routingKey)) {
    console.warn(`[publishEmailEvent] ${routingKey} not sent: student emails are off`);
    return;
  }
  try {
    const base = emailerBaseUrl();
    const secret =
      typeof process !== "undefined" ? process.env?.EMAILER_INTERNAL_SECRET : undefined;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) headers["X-Internal-Secret"] = secret;
    const res = await fetch(`${base}/v1/email/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({ routing_key: routingKey, event }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[publishEmailEvent] emailer rejected ${routingKey}: HTTP ${res.status} ${body.slice(0, 200)}` +
          (secret ? "" : " (no EMAILER_INTERNAL_SECRET set)")
      );
    }
  } catch (error) {
    // Network-level failure only; non-blocking.
    console.error("Failed to publish email event:", error);
  }
}

/**
 * Publish an email event from the BROWSER. Posts to the /api/email-event Remix
 * resource route, which runs server-side, holds the internal secret, and
 * forwards to the gated emailer endpoint. Non-blocking and best-effort.
 */
export const STUDENT_TEMPLATES_OFF = true;

export async function publishEmailEventFromClient(
  routingKey: string,
  event: any
): Promise<void> {
  try {
    await fetch("/api/email-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routing_key: routingKey, event }),
    });
  } catch (error) {
    console.error("Failed to publish email event (client):", error);
  }
}

/**
 * Send one named transactional template through the emailer (SERVER-SIDE ONLY,
 * uses the internal secret). Non-blocking like publishEmailEvent.
 *
 * RELAUNCH (2 Nov 2026): every template goes to a student (verify-email was the last caller), so nothing is sent.
 */
export async function sendTemplateEmail(
  to: string,
  template: string,
  fields: { user_name?: string; action_url?: string } = {}
): Promise<void> {
  if (STUDENT_TEMPLATES_OFF) {
    console.warn(`[sendTemplateEmail] ${template} not sent: student emails are off`);
    return;
  }
  try {
    const secret =
      typeof process !== "undefined" ? process.env?.EMAILER_INTERNAL_SECRET : undefined;
    const res = await fetch(`${emailerBaseUrl()}/v1/email/send-template`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(secret ? { "X-Internal-Secret": secret } : {}) },
      body: JSON.stringify({ to, template, ...fields }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[sendTemplateEmail] ${template} rejected: HTTP ${res.status} ${body.slice(0, 200)}`);
    }
  } catch (error) {
    console.error("Failed to send template email:", error);
  }
}
