import { verifyCheckoutSignature } from "~/lib/razorpay.server";
import { fulfilWebinarPayment } from "~/lib/webinar-payment.server";
import type { Route } from "./+types/api.webinar-confirm";

/**
 * Confirm a webinar payment from the browser, straight after Razorpay's
 * checkout modal reports success.
 *
 * The signature is verified before anything is marked paid — without that check
 * this endpoint would let anyone mark any order paid by posting its id.
 *
 * The webhook is still the authority: if someone closes the tab before this
 * fires, the webhook fulfils the ticket a moment later. This path exists only
 * so the person sees "you're in" immediately instead of waiting on a webhook.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");

  if (!orderId || !paymentId || !signature) {
    return Response.json({ error: "Missing payment details" }, { status: 400 });
  }

  let valid = false;
  try {
    valid = await verifyCheckoutSignature({ orderId, paymentId, signature });
  } catch (err) {
    console.error("[webinar] Signature verification error:", err);
    return Response.json({ error: "Could not verify payment" }, { status: 500 });
  }

  if (!valid) {
    console.error(`[webinar] Invalid checkout signature for order ${orderId}`);
    return Response.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  await fulfilWebinarPayment({ orderId, paymentId, source: "checkout" });

  // `paid: true` regardless of who fulfilled it — the payment is verified, so
  // the person is in, whether this call or the webhook recorded it.
  return Response.json({ ok: true, paid: true });
}
