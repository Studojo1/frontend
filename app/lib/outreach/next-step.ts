/**
 * Where this user should go next, from GET /orders/next-step.
 *
 * The backend decides from what the user actually holds (credits, campaigns,
 * a finished profile, a mailbox), never from order.status, which goes stale
 * after payment. A paid user with credits and nothing running always gets
 * Launch, or the one thing blocking it. Paths are relative to /outreach.
 *
 * Pure: no React, no auth client, so tests can import it directly.
 */
export type NextStepState =
  | "campaign_active"
  | "launch_draft"
  | "launch_ready"
  | "connect_gmail"
  | "needs_profile"
  | "not_paid";

export interface NextStep {
  state: NextStepState;
  path: string | null;
  available_credits: number;
  order_id: number | null;
  candidate_id: number | null;
  email_account_id: number | null;
  campaign_id: number | null;
  /** True once any campaign has launched: a returning customer, not a first-timer. */
  has_launched?: boolean;
}

/** States where the user has paid and has not launched. */
export const PAID_NOT_LAUNCHED: NextStepState[] = [
  "launch_draft",
  "launch_ready",
  "connect_gmail",
  "needs_profile",
];

export function isPaidNotLaunched(step: NextStep | null | undefined): step is NextStep {
  return !!step && PAID_NOT_LAUNCHED.includes(step.state) && !!step.path;
}

/** Button label for the step a paid-not-launched user is blocked on. */
export function nextStepLabel(step: NextStep): string {
  switch (step.state) {
    case "connect_gmail":
      return "Connect Gmail to launch";
    case "needs_profile":
      return "Finish my profile to launch";
    default:
      return step.has_launched ? "Launch another campaign" : "Launch my campaign";
  }
}

/** One line telling a paid, unlaunched user what is waiting for them. */
export function nextStepSummary(step: NextStep): string {
  if (step.state === "launch_draft") {
    return "Your campaign is set up but hasn't started. Nothing has been sent yet.";
  }
  if (step.has_launched) {
    return `You have ${step.available_credits} unused email credits ready for another campaign.`;
  }
  return `You've paid and ${step.available_credits} email credits are waiting. Nothing has been sent yet.`;
}

/**
 * Where /outreach/results sends someone (audit NEW-07).
 *
 * Checkout-recovery and coupon emails link to /outreach/results?coupon=CODE.
 * They used to land on the /outreach landing page, whose button restarted
 * resume upload, so a student who already had leads redid the quiz and waited
 * through a fresh search. `search` is the incoming query string and is kept,
 * so ?coupon= reaches the pricing page.
 */
export function resultsDestination(step: NextStep | null | undefined, search = ""): string {
  const qs = search && search !== "?" ? (search.startsWith("?") ? search : `?${search}`) : "";
  if (!step) return `/outreach/leads/results${qs}`; // lookup failed: the results page finds their leads
  if (step.state === "campaign_active") return "/outreach/campaign/dashboard";
  if (PAID_NOT_LAUNCHED.includes(step.state) && step.path) return `/outreach${step.path}`;
  if (step.state === "not_paid") {
    // No leads anywhere: the /outreach page, which explains the product and
    // starts them off; the layout keeps ?coupon= for when they reach pricing.
    return step.path ? `/outreach${step.path}${qs}` : `/outreach${qs}`;
  }
  return `/outreach/leads/results${qs}`;
}
