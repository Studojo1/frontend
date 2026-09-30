// HP-N13 (audit 30 Sep 2026): EU/UK visitors were tracked by the Meta pixel,
// PostHog cookies and session recording before any consent, and high-school
// report readers (minors) were sent to Meta. CF-N04: exceptions and dead
// clicks were not captured.
//
// Drives the real trackMeta / metaBrowserIds / posthogConfig on a fake
// studojo.com page, switching the device time zone and the stored choice.
import assert from "node:assert/strict";

let tz = "Europe/London";
const RealDTF = Intl.DateTimeFormat;
Intl.DateTimeFormat = function (...a) {
  const d = new RealDTF(...a);
  return { format: (x) => d.format(x), resolvedOptions: () => ({ ...d.resolvedOptions(), timeZone: tz }) };
};

const sent = [];
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = Object.assign(new EventTarget(), {
  location: { hostname: "studojo.com", pathname: "/outreach", search: "", href: "https://studojo.com/outreach" },
  fbq: (...args) => sent.push(["fbq", ...args]),
});
globalThis.document = {
  createElement: () => ({ setAttribute() {}, addEventListener() {} }),
  head: { appendChild() {} },
  getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
  cookie: "_fbp=fb.1.1.1; _fbc=fb.1.1.abc",
};
globalThis.fetch = async (url) => {
  sent.push(["fetch", String(url)]);
  return { ok: true, json: async () => ({}) };
};

const { consentRegion, writeConsent, trackingAllowed } = await import("./consent.ts");
const { trackMeta, metaExcludedPath } = await import("./meta-pixel.ts");
const { metaBrowserIds } = await import("./attribution.ts");
const { posthogConfig } = await import("./posthog.ts");
const flush = () => new Promise((r) => setTimeout(r, 10));

// Regions.
for (const z of ["Europe/London", "Europe/Berlin", "Europe/Dublin", "Atlantic/Canary", "Europe/Lisbon", undefined]) {
  assert.equal(consentRegion(z), true, `${z} needs consent`);
}
for (const z of ["Asia/Kolkata", "Asia/Calcutta", "America/New_York", "Asia/Dubai", "Asia/Singapore"]) {
  assert.equal(consentRegion(z), false, `${z} does not`);
}

// 1. UK visitor, no choice yet: nothing reaches Meta, no Meta ids on orders.
assert.equal(trackingAllowed(), false);
assert.equal(trackMeta("ViewContent"), null);
await flush();
assert.equal(sent.length, 0, `Meta reached without consent: ${JSON.stringify(sent)}`);
assert.deepEqual(metaBrowserIds(), {});
const pre = posthogConfig(trackingAllowed());
assert.equal(pre.persistence, "memory", "no PostHog cookies before consent");
assert.equal(pre.disable_session_recording, true, "no recording before consent");

// 2. Reject: still nothing.
writeConsent("denied");
assert.equal(trackMeta("ViewContent"), null);
await flush();
assert.equal(sent.length, 0);

// 3. Accept: Meta works again.
writeConsent("granted");
assert.ok(trackMeta("ViewContent"));
await flush();
assert.ok(sent.some(([k, u]) => k === "fetch" && u === "/api/meta-event"), "accepted visitor must reach Meta");
assert.equal(posthogConfig(trackingAllowed()).persistence, "localStorage+cookie");
assert.ok(metaBrowserIds().fbp);

// 4. India: no banner needed, tracked as before.
writeConsent(null);
tz = "Asia/Kolkata";
sent.length = 0;
assert.equal(trackingAllowed(), true);
assert.ok(trackMeta("ViewContent"));
await flush();
assert.ok(sent.length > 0);

// 5. High-school report pages never reach Meta, wherever the reader is.
assert.equal(metaExcludedPath("/reports/how-to-get-a-high-school-internship-2026"), true);
assert.equal(metaExcludedPath("/reports/finance-india-2026"), false);
window.location.pathname = "/reports/how-to-get-a-high-school-internship-2026";
sent.length = 0;
assert.equal(trackMeta("ViewContent"), null);
await flush();
assert.equal(sent.length, 0, "a high-school report page reached Meta");

// CF-N04: exception and dead-click capture on, text still masked in replays.
const cfg = posthogConfig(true);
assert.equal(cfg.capture_exceptions, true);
assert.equal(cfg.capture_dead_clicks, true);
assert.equal(cfg.session_recording.maskTextSelector, "*");
assert.equal(typeof cfg.before_send, "function");

console.log("consent-gate: ok");
