import { getEmailerServiceUrl } from "./emailer";

/**
 * Publish an email event directly to the emailer service.
 *
 * SERVER-SIDE ONLY. The emailer's /v1/email/events endpoint is gated by
 * X-Internal-Secret, so this attaches EMAILER_INTERNAL_SECRET from the server
 * environment. Calling this from the browser will send no secret and be
 * rejected (401) by design — client code must use the /api/email-event resource
 * route (see publishEmailEventFromClient) which holds the secret server-side.
 */
export async function publishEmailEvent(routingKey: string, event: any): Promise<void> {
  try {
    const base = getEmailerServiceUrl();
    const secret =
      typeof process !== "undefined" ? process.env?.EMAILER_INTERNAL_SECRET : undefined;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) headers["X-Internal-Secret"] = secret;
    await fetch(`${base}/v1/email/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({ routing_key: routingKey, event }),
    });
  } catch (error) {
    // Non-blocking - log but don't fail the main operation
    console.error("Failed to publish email event:", error);
  }
}

/**
 * Publish an email event from the BROWSER. Posts to the /api/email-event Remix
 * resource route, which runs server-side, holds the internal secret, and
 * forwards to the gated emailer endpoint. Non-blocking and best-effort.
 */
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
