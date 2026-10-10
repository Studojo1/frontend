// Audit 10 Oct 2026. Three ways a visit reached Meta that should not have:
//   1. fbevents.js sends its own PageView on every pushState, bypassing our
//      gate, so clicking into a high-school report reported a minor's visit.
//   2. The Gmail connect return puts a one-time code in the URL, and every
//      pixel event carries the full URL.
//   3. (kept working) the high-school reports themselves.
//
// Drives the real meta-pixel module on a fake studojo.com page.
import assert from "node:assert/strict";

// India, so the consent gate is not what blocks anything here. CI runs in UTC,
// which the consent module treats as "ask first".
const RealDTF = Intl.DateTimeFormat;
Intl.DateTimeFormat = function (...a) {
  const d = new RealDTF(...a);
  return { format: (x) => d.format(x), resolvedOptions: () => ({ ...d.resolvedOptions(), timeZone: "Asia/Kolkata" }) };
};

const sent = [];
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const loc = { hostname: "studojo.com", pathname: "/outreach", search: "", href: "https://studojo.com/outreach" };
globalThis.window = Object.assign(new EventTarget(), { location: loc });
globalThis.document = {
  createElement: () => ({ setAttribute() {}, addEventListener() {} }),
  head: { appendChild() {} },
  getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
  cookie: "",
};
globalThis.fetch = async (url, init) => {
  sent.push(["fetch", String(url), init?.body ? JSON.parse(init.body) : null]);
  return { ok: true, json: async () => ({}) };
};
Object.defineProperty(globalThis, "navigator", { value: { userAgent: "test" }, configurable: true });

const { bootPixel, metaExcludedPath, metaExcludedSearch, trackMeta } = await import("./meta-pixel.ts");
const settle = () => new Promise((r) => setTimeout(r, 20));
const go = (pathname, search = "") => Object.assign(loc, { pathname, search, href: `https://studojo.com${pathname}${search}` });

// 1. The pixel boots with its history listener off, set before init.
assert.equal(bootPixel("1234567890"), true);
assert.equal(window.fbq.disablePushState, true, "fbevents would auto-send a PageView on every route change");
const queued = window.fbq.queue.map((args) => Array.from(args));
assert.deepEqual(queued.at(-1), ["init", "1234567890"]);

// 2. A one-time code in the URL: nothing reaches Meta, browser or server.
assert.equal(metaExcludedSearch("?gmail_code=abc&gmail_state=xyz"), true);
assert.equal(metaExcludedSearch("?x=1&gmail_state=xyz"), true);
assert.equal(metaExcludedSearch("?utm_source=meta&fbclid=abc"), false);
assert.equal(metaExcludedSearch(""), false);
go("/outreach/connect/gmail", "?gmail_code=4%2FsecretCode&gmail_state=signedState");
assert.equal(trackMeta("ViewContent"), null);
await settle();
assert.equal(sent.length, 0, `a URL with a Gmail code reached Meta: ${JSON.stringify(sent)}`);

// Once the app has consumed the code and cleaned the URL, tracking resumes.
go("/outreach/campaign/setup");
assert.ok(trackMeta("ViewContent"), "tracking must resume on a clean URL");
await settle();
assert.equal(sent.length, 1);
assert.ok(!JSON.stringify(sent).includes("gmail_code"));

// 3. The high-school reports stay invisible to Meta.
sent.length = 0;
assert.equal(metaExcludedPath("/reports/how-to-get-a-high-school-internship-2026"), true);
go("/reports/how-to-get-a-high-school-internship-2026");
assert.equal(trackMeta("ViewContent"), null);
await settle();
assert.equal(sent.length, 0);

console.log("meta-pixel-gates: ok");
