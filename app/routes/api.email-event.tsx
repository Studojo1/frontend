import type { Route } from "./+types/api.email-event";
import { publishEmailEvent } from "~/lib/events";

/**
 * Server-side proxy for browser-originated email events.
 *
 * The emailer's /v1/email/events endpoint is gated by an internal secret that
 * must never be exposed to the browser. Client code posts here instead; this
 * action runs on the server, holds the secret (via publishEmailEvent), and
 * forwards. Best-effort and non-blocking: always returns 200 so a failed email
 * never surfaces to the user.
 *
 * Only a safe allowlist of event.cc.* routing keys may be published from the
 * client, so a malicious caller cannot fire arbitrary emails.
 */
const CLIENT_ALLOWED_ROUTING_KEYS = new Set<string>([
  "event.cc.outreach_used",
  "event.cc.outreach_payment_page",
  "event.cc.paid",
]);

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { routingKey?: string; event?: any } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const routingKey = body.routingKey || "";
  if (!routingKey || !CLIENT_ALLOWED_ROUTING_KEYS.has(routingKey)) {
    // Silently ignore anything not on the client allowlist.
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fire-and-forget; never block the response on email delivery.
  publishEmailEvent(routingKey, body.event || {}).catch(() => {});

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
