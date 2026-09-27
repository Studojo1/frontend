// Razorpay webhook — activates AutoApply on payment
// POST /api/webhooks/razorpay
//
// Events handled:
//   payment.captured       → activate user (one-time or subscription)
//   subscription.activated → activate user
//   subscription.cancelled → pause user
//   payment.failed         → pause user

import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyConfigs, userLinkedinSessions } from "../../auth-schema";
import type { Route } from "./+types/api.webhooks.razorpay";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[razorpay] RAZORPAY_WEBHOOK_SECRET not set");
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const sig = request.headers.get("x-razorpay-signature");
  const body = await request.text();

  // Verify HMAC-SHA256 signature
  try {
    await verifyRazorpaySignature(body, sig ?? "", webhookSecret);
  } catch (err: any) {
    console.error("[razorpay] Signature verification failed:", err?.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as RazorpayEvent;
  console.log(`[razorpay] Event: ${event.event}`);

  switch (event.event) {
    case "payment.captured":
    case "subscription.activated":
      // Webinar tickets ride the same webhook but are not AutoApply purchases:
      // they carry no userId, and handlePaymentSuccess would log an error and
      // drop them. The registration_id note tells the two apart.
      if (await handleWebinarPayment(event)) break;
      await handlePaymentSuccess(event);
      break;
    case "subscription.cancelled":
    case "payment.failed":
      await handlePaymentFailed(event);
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}

// ── Handlers ──────────────────────────────────────────────────────────────────

/**
 * Fulfil a webinar ticket, if this payment is one.
 *
 * Returns true when the event was a webinar payment and has been dealt with, so
 * the caller knows not to run it through the AutoApply path as well.
 *
 * This is the authoritative fulfilment path. The browser may never come back
 * after paying — a closed tab, a dead battery, a UPI app that does not return —
 * and the ticket must still be valid. Failures here are swallowed rather than
 * rethrown so a broken email never turns into a 500 that makes Razorpay retry
 * a payment that has already been recorded.
 */
async function handleWebinarPayment(event: RazorpayEvent): Promise<boolean> {
  const payload: Partial<RazorpayEntity> = event.payload?.payment?.entity ?? {};
  const registrationId = payload.notes?.registration_id;
  if (!registrationId) return false;

  const orderId = typeof payload.order_id === "string" ? payload.order_id : "";
  const paymentId = typeof payload.id === "string" ? payload.id : "";
  if (!orderId || !paymentId) {
    console.error("[razorpay] Webinar payment missing order/payment id");
    return true; // It was ours; there is just nothing we can do with it.
  }

  try {
    const { fulfilWebinarPayment } = await import("~/lib/webinar-payment.server");
    await fulfilWebinarPayment({ orderId, paymentId, source: "webhook" });
  } catch (err) {
    console.error("[razorpay] Failed to fulfil webinar payment:", err);
  }
  return true;
}

async function handlePaymentSuccess(event: RazorpayEvent) {
  const payload = event.payload?.payment?.entity ?? event.payload?.subscription?.entity ?? {};

  // userId + location come from notes (set at checkout creation time)
  const notes = payload.notes ?? {};
  const userId = notes.userId ?? notes.user_id;

  if (!userId) {
    console.error("[razorpay] No userId in payment notes:", event.event);
    return;
  }

  const userLocation = notes.location ?? "India";
  const { country, city } = parseLocation(userLocation);

  // Activate autoapply config
  const [existing] = await db
    .select({ id: autoapplyConfigs.id })
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(autoapplyConfigs)
      .set({ status: "active" })
      .where(eq(autoapplyConfigs.userId, userId));
  }

  // Provision or update proxy config
  const [sess] = await db
    .select({ id: userLinkedinSessions.id })
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, userId))
    .limit(1);

  if (sess) {
    await db
      .update(userLinkedinSessions)
      .set({
        proxyCountry: country,
        proxyCity: city,
        proxySession: `usr_${userId}`,
        isActive: true,
      })
      .where(eq(userLinkedinSessions.userId, userId));
  }

  console.log(`[razorpay] Payment success — activated user ${userId} (${country}/${city})`);
}

async function handlePaymentFailed(event: RazorpayEvent) {
  const payload = event.payload?.payment?.entity ?? event.payload?.subscription?.entity ?? {};
  const notes = payload.notes ?? {};
  const userId = notes.userId ?? notes.user_id;

  if (!userId) return;

  await db
    .update(autoapplyConfigs)
    .set({ status: "paused" })
    .where(eq(autoapplyConfigs.userId, userId));

  console.log(`[razorpay] Payment failed — paused user ${userId}`);
}

// ── Location → proxy mapping ──────────────────────────────────────────────────

function parseLocation(location: string): { country: string; city: string } {
  const l = location.toLowerCase();
  if (l.includes("india") || l.includes("bangalore") || l.includes("mumbai") || l.includes("delhi")) return { country: "IN", city: "bangalore" };
  if (l.includes("us") || l.includes("united states") || l.includes("new york")) return { country: "US", city: "new_york" };
  if (l.includes("uk") || l.includes("london") || l.includes("united kingdom")) return { country: "GB", city: "london" };
  if (l.includes("dubai") || l.includes("uae")) return { country: "AE", city: "dubai" };
  if (l.includes("singapore")) return { country: "SG", city: "singapore" };
  return { country: "IN", city: "bangalore" };
}

// ── Razorpay HMAC-SHA256 signature verification ───────────────────────────────

async function verifyRazorpaySignature(body: string, signature: string, secret: string): Promise<void> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected !== signature) throw new Error("Signature mismatch");
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface RazorpayEvent {
  event: string;
  payload: {
    payment?: { entity: RazorpayEntity };
    subscription?: { entity: RazorpayEntity };
  };
}

interface RazorpayEntity {
  id: string;
  notes?: Record<string, string>;
  [key: string]: unknown;
}
