import { getEmailerServiceUrl } from "./emailer";

// Helper to publish events to emailer service
export async function publishEmailEvent(routingKey: string, event: any): Promise<void> {
  try {
    const base = getEmailerServiceUrl();
    await fetch(`${base}/v1/email/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

