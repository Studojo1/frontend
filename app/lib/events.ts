import { getEmailerServiceUrl } from "./emailer";

// Helper to publish events to emailer service (server-side).
// Keeps the existing control-plane routing; additionally attaches the internal
// secret so the emailer's gated /v1/email/events accepts the call. The secret is
// read from the server env (EMAILER_INTERNAL_SECRET) and never reaches the client.
export async function publishEmailEvent(routingKey: string, event: any): Promise<void> {
  try {
    const base = getEmailerServiceUrl();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const secret =
      typeof process !== "undefined" && process.env
        ? process.env.EMAILER_INTERNAL_SECRET
        : undefined;
    if (secret) headers["X-Internal-Secret"] = secret;
    await fetch(`${base}/v1/email/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        routing_key: routingKey,
        event,
      }),
    });
  } catch (error) {
    // Non-blocking - log but don't fail the main operation
    console.error("Failed to publish email event:", error);
  }
}

// Browser-safe publisher. The secret lives only on the server, so client code
// posts to the /api/email-event resource route, which re-publishes server-side
// (with the secret) after allow-listing the routing key. Fire-and-forget.
export async function publishEmailEventFromClient(routingKey: string, event: any): Promise<void> {
  try {
    await fetch("/api/email-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routingKey, event }),
    });
  } catch (error) {
    console.error("Failed to publish email event (client):", error);
  }
}
