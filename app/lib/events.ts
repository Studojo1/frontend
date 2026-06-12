import { getEmailerServiceUrl } from "./emailer";

// Helper to publish events to emailer service.
//
// /v1/email/events is gated by X-Internal-Secret, so this only works server-side
// where EMAILER_INTERNAL_SECRET is set (all real callers — auth signup hook,
// internship apply action — run server-side). The secret is attached only when
// present so a stray client-side call degrades to a no-op instead of throwing;
// the call is non-blocking either way.
export async function publishEmailEvent(routingKey: string, event: any): Promise<void> {
  try {
    const base = getEmailerServiceUrl();
    const secret =
      typeof process !== "undefined" && process.env
        ? process.env.EMAILER_INTERNAL_SECRET
        : undefined;
    if (!secret) {
      console.error(
        "publishEmailEvent skipped: EMAILER_INTERNAL_SECRET not available (must run server-side)"
      );
      return;
    }
    await fetch(`${base}/v1/email/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": secret,
      },
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

