import { markRegistrationPaid } from "~/lib/webinar.server";

/**
 * Everything that must happen once a webinar ticket is genuinely paid for.
 *
 * Two independent paths call this: the browser's success callback (fast, but
 * lost if the tab closes) and the Razorpay webhook (reliable, but delayed).
 * Whichever arrives first does the work; the other becomes a no-op, because
 * markRegistrationPaid only returns a row on the transition from unpaid to
 * paid. That is what keeps the confirmation email from going out twice.
 */
export async function fulfilWebinarPayment(params: {
  orderId: string;
  paymentId: string;
  source: "checkout" | "webhook";
}): Promise<{ fulfilled: boolean }> {
  const registration = await markRegistrationPaid({
    orderId: params.orderId,
    paymentId: params.paymentId,
  });

  // Already fulfilled by the other path, or no such order. Either way there is
  // nothing left to do, and saying so lets the webhook return 200 rather than
  // provoking a retry storm.
  if (!registration) return { fulfilled: false };

  console.log(
    `[webinar] Payment fulfilled via ${params.source}: order=${params.orderId} registration=${registration.id}`
  );

  // Confirmation + joining details. Non-blocking: a failed email must never
  // fail a payment that already went through, or the webhook would retry and
  // the person would be charged nothing but see an error.
  try {
    const { publishEmailEvent } = await import("~/lib/events");
    await publishEmailEvent("event.cc.webinar_registered", {
      email: registration.email,
      name: registration.full_name,
    });
  } catch (err) {
    console.error("[webinar] Failed to publish webinar_registered event:", err);
  }

  return { fulfilled: true };
}
