// A click that costs nothing must not be recorded with the pack price.
//
// The pricing page records payment_confirmed when money moves, and also when
// an order is covered by credits the student already holds or made free by a
// coupon: the admin funnel counts all of these as "Paid" on purpose. Anything
// that adds up amount_cents reads it as revenue, so the free ones carry 0
// there and the pack price under pack_amount_cents.
//
// Calls the real paymentConfirmedProps and checks the pricing page uses it.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { paymentConfirmedProps } from "./payment-confirmed.ts";

// Undefined properties never leave the browser, so compare what is sent.
const sent = (...args) => JSON.parse(JSON.stringify(paymentConfirmedProps(...args)));

// Money moved: amount_cents is the pack price.
assert.deepEqual(sent(200, "INR", 182500, true), {
  tier: 200,
  currency: "INR",
  amount_cents: 182500,
  money_moved: true,
});

// Covered by credits, or free with a coupon: no revenue, and the pack price
// under its own name.
assert.deepEqual(sent(200, "INR", 182500, false), {
  tier: 200,
  currency: "INR",
  amount_cents: 0,
  pack_amount_cents: 182500,
  money_moved: false,
});

// "Use my 120 credits" matches no pack, so there is no pack price to send.
// The amount is still an explicit zero.
assert.deepEqual(sent(120, "INR", undefined, false), {
  tier: 120,
  currency: "INR",
  amount_cents: 0,
  money_moved: false,
});

// A real payment confirmed before prices load has no amount to report. It
// must not say 0, which would read as a free order.
assert.deepEqual(sent(350, "USD", undefined, true), { tier: 350, currency: "USD", money_moved: true });

// A total over amount_cents counts the one order that was paid for.
const events = [
  sent(200, "INR", 182500, true),
  sent(200, "INR", 182500, false),
  sent(500, "INR", 346500, false),
  sent(120, "INR", undefined, false),
];
assert.equal(events.reduce((sum, e) => sum + e.amount_cents, 0), 182500);

// Every payment_confirmed the pricing page records is built by the helper.
const page = readFileSync(new URL("../../routes/outreach.enrichment.tsx", import.meta.url), "utf8");
const builtBy = [...page.matchAll(/track\(\s*"payment_confirmed",\s*([^\s(]+)/g)].map((m) => m[1]);
assert.ok(
  builtBy.length > 0 && builtBy.every((b) => b === "paymentConfirmedProps"),
  `the pricing page must build payment_confirmed with paymentConfirmedProps, found: ${builtBy.join(", ") || "no call"}`,
);

console.log("payment-confirmed: ok");
