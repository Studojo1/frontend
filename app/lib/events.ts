/**
 * Base URL of the EMAILER service (NOT the control plane). Events must go to the
 * emailer's /v1/email/events, which is a different service than getEmailerServiceUrl()
 * (that returns the control plane, whose /v1/email/events expects a different
 * shape and 400s our payload — the original silent bug). Override with
 * EMAILER_SERVICE_URL; defaults to the public emailer host.
 */
function emailerBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.EMAILER_SERVICE_URL) {
    return process.env.EMAILER_SERVICE_URL;
  }
  return "https://email.studojo.com";
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
