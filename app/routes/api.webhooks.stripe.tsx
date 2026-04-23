// Stripe webhook — activates AutoApply on payment
// POST /api/webhooks/stripe

import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyConfigs, userLinkedinSessions } from "../../auth-schema";
import type { Route } from "./+types/api.webhooks.stripe";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET not set");
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: StripeEvent;

  // Verify webhook signature
  try {
    event = await verifyStripeSignature(body, sig ?? "", webhookSecret);
  } catch (err: any) {
    console.error("[stripe] signature verification failed:", err?.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded":
      await handlePaymentSuccess(event);
      break;
    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      await handlePaymentFailed(event);
      break;
    default:
      // Acknowledge other events
      break;
  }

  return Response.json({ received: true });
}

async function handlePaymentSuccess(event: StripeEvent) {
  const metadata = event.data?.object?.metadata ?? {};
  const userId = metadata.userId ?? event.data?.object?.client_reference_id;

  if (!userId) {
    console.error("[stripe] No userId in payment event metadata:", event.id);
    return;
  }

  const userLocation = metadata.location ?? "India";
  const { country, city } = parseLocation(userLocation);

  // Activate/extend autoapply config
  const [existing] = await db
    .select({ id: autoapplyConfigs.id })
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.userId, userId))
    .limit(1);

  if (existing) {
    await db.update(autoapplyConfigs).set({ status: "active" }).where(eq(autoapplyConfigs.userId, userId));
  }

  const [sess] = await db
    .select({ id: userLinkedinSessions.id })
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, userId))
    .limit(1);

  if (sess) {
    await db.update(userLinkedinSessions).set({
      proxyCountry: country,
      proxyCity: city,
      proxySession: `usr_${userId}`,
      isActive: true,
    }).where(eq(userLinkedinSessions.userId, userId));
  }
  // If no session row yet, it will be created when user submits li_at

  console.log(`[stripe] Payment success — activated user ${userId} (${country}/${city})`);
}

async function handlePaymentFailed(event: StripeEvent) {
  const metadata = event.data?.object?.metadata ?? {};
  const userId = metadata.userId;
  if (!userId) return;

  await db.update(autoapplyConfigs).set({ status: "paused" }).where(eq(autoapplyConfigs.userId, userId));
  console.log(`[stripe] Payment failed — paused user ${userId}`);
}

function parseLocation(location: string): { country: string; city: string } {
  const lower = location.toLowerCase();
  if (lower.includes("india") || lower.includes("bangalore") || lower.includes("mumbai") || lower.includes("delhi")) return { country: "IN", city: "bangalore" };
  if (lower.includes("us") || lower.includes("united states") || lower.includes("new york")) return { country: "US", city: "new_york" };
  if (lower.includes("uk") || lower.includes("london") || lower.includes("united kingdom")) return { country: "GB", city: "london" };
  if (lower.includes("dubai") || lower.includes("uae")) return { country: "AE", city: "dubai" };
  if (lower.includes("singapore")) return { country: "SG", city: "singapore" };
  return { country: "IN", city: "bangalore" };
}

// ── Minimal Stripe signature verification (no SDK dependency) ─────────────────

async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<StripeEvent> {
  const parts = sigHeader.split(",").reduce((acc, part) => {
    const [key, val] = part.split("=");
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const v1 = parts["v1"];

  if (!timestamp || !v1) throw new Error("Invalid stripe-signature header");

  // Verify timestamp (within 5 minutes)
  const diff = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (diff > 300) throw new Error("Timestamp out of tolerance");

  // Compute expected HMAC-SHA256
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

  if (expected !== v1) throw new Error("Signature mismatch");

  return JSON.parse(payload) as StripeEvent;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      metadata?: Record<string, string>;
      client_reference_id?: string;
    };
  };
}
