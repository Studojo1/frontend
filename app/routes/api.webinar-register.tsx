import {
  saveWebinarRegistration,
  attachOrderToRegistration,
} from "~/lib/webinar.server";
import { lookupAmbassadorByRefCode } from "~/lib/campus-ambassador.server";
import { checkEmail } from "~/lib/email-validate";
import { webinarPricePaise } from "~/lib/webinar-pricing";
import {
  createRazorpayOrder,
  razorpayKeyId,
  RazorpayNotConfiguredError,
} from "~/lib/razorpay.server";
import type { Route } from "./+types/api.webinar-register";

function clamp(v: unknown, max = 200): string {
  return String(v ?? "").trim().slice(0, max);
}

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

  const fullName = clamp(body.fullName);
  const whatsapp = clamp(body.whatsapp, 30);
  const email = clamp(body.email).toLowerCase();
  const college = clamp(body.college);
  const course = clamp(body.course);
  const yearOfStudy = clamp(body.yearOfStudy, 40);
  const lifeStage = clamp(body.lifeStage, 60); // required (the intent question)
  // Optional fields
  const specialisation = clamp(body.specialisation);
  const graduationYear = clamp(body.graduationYear, 10);
  const referralSource = clamp(body.referralSource, 60);
  const refCode = clamp(body.refCode, 40).toUpperCase();

  if (!fullName || !whatsapp || !email || !college || !course || !yearOfStudy || !lifeStage) {
    return Response.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  // Authoritative email check: rejects typo domains (gmail.cok, gnail.com, ...)
  // and invalid TLDs, which the old shape-only regex let through.
  const emailCheck = checkEmail(email);
  if (!emailCheck.ok) {
    return Response.json(
      { error: emailCheck.error, suggestion: emailCheck.suggestion },
      { status: 400 }
    );
  }

  // Resolve the ambassador code server-side. The browser is told whether it
  // matched, but never gets to decide the price.
  const ambassador = refCode ? await lookupAmbassadorByRefCode(refCode) : null;
  if (refCode && !ambassador) {
    return Response.json(
      {
        error:
          "We don't recognise that campus ambassador code. Check the spelling, or clear the field to continue at full price.",
        invalidRefCode: true,
      },
      { status: 400 }
    );
  }
  const amountPaise = webinarPricePaise(Boolean(ambassador));

  const { registrationId } = await saveWebinarRegistration({
    fullName,
    whatsapp,
    email,
    college,
    course,
    specialisation: specialisation || undefined,
    yearOfStudy,
    graduationYear: graduationYear || undefined,
    lifeStage: lifeStage || undefined,
    referralSource: referralSource || undefined,
    refCode: refCode || undefined,
    ambassadorId: ambassador?.id,
    amountPaise,
  });

  // No row came back, so an existing registration for this webinar is already
  // paid. Nothing to charge again — tell the form so it can say so kindly.
  if (registrationId === null) {
    return Response.json({ ok: true, alreadyPaid: true });
  }

  // Create the payment order. The ticket is not a ticket until this is paid,
  // so the confirmation email is deliberately NOT sent here — it goes out from
  // the webhook, once money has actually moved.
  try {
    const order = await createRazorpayOrder({
      amountPaise,
      receipt: `web-${registrationId}-${Date.now().toString(36)}`,
      notes: {
        registration_id: String(registrationId),
        ref_code: refCode || "",
        ambassador_id: ambassador ? String(ambassador.id) : "",
        email,
      },
    });
    await attachOrderToRegistration({
      registrationId,
      orderId: order.id,
      amountPaise,
    });

    return Response.json({
      ok: true,
      orderId: order.id,
      amountPaise,
      keyId: razorpayKeyId(),
      prefill: { name: fullName, email, contact: whatsapp },
    });
  } catch (err) {
    if (err instanceof RazorpayNotConfiguredError) {
      console.error("[webinar] Razorpay is not configured; cannot take payment");
      return Response.json(
        { error: "Payments are temporarily unavailable. Please try again shortly." },
        { status: 503 }
      );
    }
    console.error("[webinar] Failed to create payment order:", err);
    return Response.json(
      { error: "We couldn't start the payment. Please try again." },
      { status: 502 }
    );
  }
}
