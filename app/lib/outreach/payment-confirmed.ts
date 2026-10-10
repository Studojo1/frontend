/**
 * Properties of the payment_confirmed event the pricing page records.
 *
 * amount_cents is read as revenue wherever it is added up, so it is 0 unless
 * money moved. An order covered by credits the student already holds, or made
 * free by a coupon, records the same event (the admin funnel counts it as
 * "Paid" on purpose) and its pack price goes under pack_amount_cents.
 *
 * packAmountCents is undefined when no pack matches the tier (the "use my
 * remaining credits" button) or prices have not loaded.
 */
export function paymentConfirmedProps(
  tier: number,
  currency: string,
  packAmountCents: number | undefined,
  moneyMoved: boolean,
): Record<string, unknown> {
  return moneyMoved
    ? { tier, currency, amount_cents: packAmountCents, money_moved: true }
    : { tier, currency, amount_cents: 0, pack_amount_cents: packAmountCents, money_moved: false };
}
