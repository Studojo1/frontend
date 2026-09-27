import { lookupAmbassadorByRefCode } from "~/lib/campus-ambassador.server";
import {
  webinarPricePaise,
  WEBINAR_REF_DISCOUNT_PAISE,
} from "~/lib/webinar-pricing";
import type { Route } from "./+types/api.webinar-ref-code";

/**
 * Check a campus-ambassador code and report the price it unlocks, so the form
 * can confirm the discount before anyone commits to paying.
 *
 * This only ever *reports* a price. The amount actually charged is recomputed
 * from the code when the order is created, so a tampered response here changes
 * nothing about what is billed.
 *
 * The ambassador's first name is returned to reassure the registrant they typed
 * their friend's code correctly. Surname and email are deliberately withheld:
 * this endpoint is unauthenticated, and guessing codes should not enumerate
 * ambassadors' contact details.
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

  const code = String(body.refCode ?? "").trim().slice(0, 40);
  if (!code) {
    return Response.json({
      valid: false,
      pricePaise: webinarPricePaise(false),
    });
  }

  const ambassador = await lookupAmbassadorByRefCode(code);
  if (!ambassador) {
    return Response.json({
      valid: false,
      pricePaise: webinarPricePaise(false),
      message: "We don't recognise that code.",
    });
  }

  const firstName = ambassador.fullName.trim().split(/\s+/)[0] ?? "";
  return Response.json({
    valid: true,
    pricePaise: webinarPricePaise(true),
    discountPaise: WEBINAR_REF_DISCOUNT_PAISE,
    ambassadorFirstName: firstName,
    ambassadorCollege: ambassador.college,
  });
}
