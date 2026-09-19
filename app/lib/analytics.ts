// One call site, both destinations.
//
// The admin funnel reads PostHog. Meta reads its own pixel. Those two only
// reconcile if every funnel event reaches both at the same instant under the
// same conditions. Calling capturePostHog and trackMeta separately let them
// drift, and they did: the whole payment half of the funnel was visible in
// PostHog and invisible to Meta, so Meta could see a signup and then never
// learn whether any money followed.
//
// Adding a funnel event means adding it to META_EVENT below. An explicit null
// records a decision ("product metric, not an ad signal") rather than an
// oversight, and keeps the two systems provably in step.

import { capturePostHog } from "./posthog";
import { trackMeta } from "./meta-pixel";

const META_EVENT: Record<string, string | null> = {
  // --- the money funnel: these must agree with the admin funnel exactly ---
  signed_up: "CompleteRegistration",
  resume_uploaded: "Lead",
  pricing_viewed: "ViewContent",
  checkout_opened: "InitiateCheckout",
  pay_now_clicked: "AddPaymentInfo",
  payment_confirmed: "Purchase",

  // --- product metrics: real funnel steps, deliberately not ad signals ---
  // Sending these would give Meta more events to optimise toward, all of them
  // measuring onboarding quality rather than whether an ad found the right person.
  quiz_started: null,
  quiz_question_answered: null,
  profile_quiz_completed: null,
  tier_selected: null,
  coupon_applied: null,
  discovery_started: null,
  discovery_completed: null,
  discovery_failed: null,
  leads_loaded: null,
  get_emails_clicked: null,
  back_to_leads_clicked: null,
  style_selected: null,
  campaign_started: null,
  start_linkedin_automation_clicked: null,
  resume_upload_started: null,
  resume_upload_failed: null,
  checkout_abandoned: null,
  payment_failed: null,
  scroll_depth: null,
};

export type TrackOptions = {
  /** Revenue. Required on Purchase, or ROAS and value-based lookalikes are impossible later. */
  value?: number;
  /** ISO code, e.g. "INR". Meaningless to Meta without it. */
  currency?: string;
  /**
   * Stable id for this conversion, normally the payment provider's order or
   * session id. payment_confirmed fires from two different routes for the same
   * purchase, so without a shared id Meta counts one sale twice. The same id
   * also lets a server-side copy deduplicate against this one.
   */
  eventId?: string;
};

/**
 * Record a funnel event in PostHog and, where it maps, in Meta.
 * Never throws: analytics must not be able to break a payment flow.
 */
export function track(
  event: string,
  props?: Record<string, unknown>,
  opts?: TrackOptions
): void {
  try {
    capturePostHog(event, props);
  } catch {
    // PostHog failing must not stop the Meta copy
  }

  const metaEvent = META_EVENT[event];
  if (!metaEvent) return;

  try {
    const metaProps: Record<string, unknown> = {};
    if (typeof opts?.value === "number") metaProps.value = opts.value;
    if (opts?.currency) metaProps.currency = opts.currency;
    trackMeta(metaEvent, metaProps, opts?.eventId);
  } catch {
    // Silently fail — analytics must never break the app
  }
}
