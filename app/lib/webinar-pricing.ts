/**
 * Webinar ticket pricing — the single source of truth, shared by the page (to
 * display) and the order endpoint (to charge).
 *
 * Amounts are in paise, the unit Razorpay charges in. Keeping them as integers
 * avoids the rounding drift that floating-point rupees would introduce.
 *
 * The price is NEVER taken from the request body. The browser sends a referral
 * code; the server resolves it and decides the amount. Otherwise anyone could
 * post their own price and buy a ticket for ₹1.
 */

/** Full price, with no referral code. ₹100. */
export const WEBINAR_PRICE_PAISE = 100_00;

/** Price when a valid campus-ambassador code is applied. ₹79. */
export const WEBINAR_PRICE_WITH_REF_PAISE = 79_00;

/** What the ambassador discount saves, for display. ₹21. */
export const WEBINAR_REF_DISCOUNT_PAISE =
  WEBINAR_PRICE_PAISE - WEBINAR_PRICE_WITH_REF_PAISE;

/** The amount to charge, given whether a referral code was recognised. */
export function webinarPricePaise(hasValidRef: boolean): number {
  return hasValidRef ? WEBINAR_PRICE_WITH_REF_PAISE : WEBINAR_PRICE_PAISE;
}

/**
 * Format paise as rupees for display: 10000 → "₹100", 7900 → "₹79".
 * Whole rupees drop the decimals, since every price here is a round number and
 * "₹100.00" reads like a form field rather than a price.
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? `₹${rupees}` : `₹${rupees.toFixed(2)}`;
}
