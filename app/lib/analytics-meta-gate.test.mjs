// ST-N02 (audit 29 Sep 2026): Meta must only hear about Purchase and
// AddPaymentInfo when money can actually move. Credit-covered and 100%-off
// orders were sending value-less Purchases into the ad dataset.
//
// Drives the real track() on a fake studojo.com page and records what would
// reach Meta (the browser pixel's fbq and the /api/meta-event mirror).
import assert from "node:assert/strict";

const sent = [];
globalThis.window = {
  location: { hostname: "studojo.com", search: "", href: "https://studojo.com/outreach/enrichment" },
  fbq: (...args) => sent.push(["fbq", ...args]),
};
globalThis.document = {
  createElement: () => ({ setAttribute() {}, addEventListener() {} }),
  head: { appendChild() {} },
  getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
  cookie: "",
};
globalThis.fetch = async (url) => {
  sent.push(["fetch", String(url)]);
  return { ok: true, json: async () => ({}) };
};
Object.defineProperty(globalThis, "navigator", { value: { userAgent: "test", sendBeacon: (url) => { sent.push(["beacon", String(url)]); return true; } }, configurable: true });

const { track } = await import("./analytics.ts");

track("payment_confirmed", { money_moved: false }, { meta: false });
track("pay_now_clicked", { covered_by_credits: true }, { meta: false });
await new Promise((r) => setTimeout(r, 20));
assert.equal(sent.length, 0, `meta:false still reached Meta: ${JSON.stringify(sent)}`);

track("payment_confirmed", { money_moved: true }, { value: 18.25, currency: "INR", eventId: "order_1" });
await new Promise((r) => setTimeout(r, 20));
assert.ok(sent.length > 0, "a real purchase must still reach Meta");

console.log("analytics-meta-gate: ok");
