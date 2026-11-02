// SUPPORT-STU: the /contact form (signed-out visitors) makes a ticket in public.tickets. Pure helpers, no I/O, so the
// rules are unit tested (app/lib/contact-limit.test.mjs).

/** At most this many contact tickets from one email in the last hour. */
export const CONTACT_PER_EMAIL_PER_HOUR = 3;

/** True when this email already has too many contact tickets in the last hour (the count is taken in SQL). */
export function overContactLimit(countInLastHour: number): boolean {
  return Number.isFinite(countInLastHour) && countInLastHour >= CONTACT_PER_EMAIL_PER_HOUR;
}

export type ContactCategory = "info_request" | "website_broken" | "billing" | "feature_request" | "other";
export type ContactPriority = "high" | "normal" | "low";

const SUBJECT_CATEGORY: Record<string, ContactCategory> = {
  "General Inquiry": "info_request",
  "Technical Issue": "website_broken",
  "Billing & Refunds": "billing",
  "Feature Request": "feature_request",
  Other: "other",
};

/** The form's subject select as a ticket category; anything unknown is "other". */
export function contactCategory(subject: string): ContactCategory {
  return SUBJECT_CATEGORY[subject] ?? "other";
}

/** high for billing and website_broken, low for info_request and feature_request, normal otherwise. */
export function contactPriority(category: ContactCategory): ContactPriority {
  if (category === "billing" || category === "website_broken") return "high";
  if (category === "info_request" || category === "feature_request") return "low";
  return "normal";
}

/** First ticket message: the subject, a blank line, the message, capped at 5000 characters. */
export function contactBody(subject: string, message: string): string {
  return `${subject}\n\n${message.trim()}`.slice(0, 5000);
}
