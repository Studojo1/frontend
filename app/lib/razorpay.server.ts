/**
 * Minimal Razorpay REST client for guest (logged-out) payments.
 *
 * The existing payment paths — control-plane /v1/payments/create-order and the
 * outreach service's /create-order — both require an authenticated user. A
 * webinar registrant has no Studojo account, so neither can be reused. This
 * talks to Razorpay's Orders API directly over fetch, which needs no SDK: it is
 * a Basic-auth POST with a JSON body.
 *
 * SERVER-SIDE ONLY. RAZORPAY_KEY_SECRET must never reach the browser.
 */

const RAZORPAY_API = "https://api.razorpay.com/v1";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export class RazorpayNotConfiguredError extends Error {
  constructor() {
    super("Razorpay credentials are not configured");
    this.name = "RazorpayNotConfiguredError";
  }
}

/** The public key id, safe to hand to the browser for the checkout modal. */
export function razorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || "";
}

function credentials(): { keyId: string; keySecret: string } {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!keyId || !keySecret) throw new RazorpayNotConfiguredError();
  return { keyId, keySecret };
}

/**
 * Create a Razorpay order.
 *
 * `notes` travel with the payment and come back on the webhook, which is how a
 * captured payment is matched to the registration that started it. The amount
 * is decided by the caller from server-side pricing, never by the browser.
 */
export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = credentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      // Razorpay caps receipts at 40 characters and rejects longer ones.
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[razorpay] order creation failed (${res.status}): ${body}`);
    throw new Error("Payment gateway error");
  }
  return (await res.json()) as RazorpayOrder;
}

/**
 * Verify the signature Razorpay's checkout hands back to the browser.
 *
 * HMAC-SHA256 over "<order_id>|<payment_id>" keyed with the API secret, the
 * scheme Razorpay documents for client-side confirmation. This proves the
 * browser's success callback is genuine — but the webhook remains the
 * authority for marking a ticket paid, because a browser that closes before
 * the callback fires would otherwise lose a real payment.
 */
export async function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<boolean> {
  const { keySecret } = credentials();
  const expected = await hmacSha256Hex(
    keySecret,
    `${params.orderId}|${params.paymentId}`
  );
  return timingSafeEqual(expected, params.signature);
}

/** Verify the X-Razorpay-Signature header on a webhook delivery. */
export async function verifyWebhookSignature(params: {
  body: string;
  signature: string;
  secret: string;
}): Promise<boolean> {
  const expected = await hmacSha256Hex(params.secret, params.body);
  return timingSafeEqual(expected, params.signature);
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compare two hex digests without leaking, through timing, how much of a
 * forged signature was correct.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
