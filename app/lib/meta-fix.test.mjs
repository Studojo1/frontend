// META-FIX (2 Nov 2026, the production pass's bugs B1, B2, B4, B5, B7): fbc on every server copy when the pixel is
// blocked (built from the stored fbclid), Lead means a CTA click only, CompleteRegistration and PostHog signed_up once a
// person across both hosts (a server claim before either copy fires), value and currency on the server copies that
// have them, and the consent choice as a parent-domain cookie the platform can read.
//
// Drives the real modules on a fake studojo.com page (a cookie jar, localStorage, fbq and fetch recorded).
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const APP = new URL("../", import.meta.url).pathname;
let tz = "Asia/Kolkata";
const RealDTF = Intl.DateTimeFormat;
Intl.DateTimeFormat = function (...a) {
  const d = new RealDTF(...a);
  return { format: (x) => d.format(x), resolvedOptions: () => ({ ...d.resolvedOptions(), timeZone: tz }) };
};

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const fbqCalls = [];
globalThis.window = Object.assign(new EventTarget(), {
  location: { hostname: "studojo.com", pathname: "/", search: "", href: "https://studojo.com/", protocol: "https:" },
  fbq: (...args) => fbqCalls.push(args),
});
// A cookie jar: setting document.cookie adds or replaces one cookie, as a browser does.
const jar = new Map();
const setCookies = [];
globalThis.document = {
  createElement: () => ({ setAttribute() {}, addEventListener() {} }),
  head: { appendChild() {} },
  getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
  get cookie() {
    return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  },
  set cookie(v) {
    setCookies.push(v);
    const [pair, ...attrs] = v.split(";");
    const i = pair.indexOf("=");
    const name = pair.slice(0, i).trim();
    const value = pair.slice(i + 1).trim();
    if (attrs.some((a) => /max-age=0\b/i.test(a.trim())) || value === "") jar.delete(name);
    else jar.set(name, value);
  },
};
const bodies = [];
let reply = {};
globalThis.fetch = async (url, init) => {
  if (init?.body) bodies.push(JSON.parse(init.body));
  return { ok: true, json: async () => reply };
};

// ── B7: the consent choice is a parent-domain cookie, read before this origin's localStorage.
const consent = await import("./consent.ts");
assert.equal(consent.consentCookieDomain("studojo.com"), ".studojo.com");
assert.equal(consent.consentCookieDomain("platform.studojo.com"), ".studojo.com");
assert.equal(consent.consentCookieDomain("platform.studojo.pro"), ".studojo.pro");
assert.equal(consent.consentCookieDomain("localhost"), null);
assert.equal(consent.consentCookieString("granted", "studojo.com", true), "sj_tracking_consent=granted; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.studojo.com; Secure");
assert.match(consent.consentCookieString(null, "studojo.com", true), /Max-Age=0/);
assert.equal(consent.consentFromCookie("a=1; sj_tracking_consent=denied"), "denied");
assert.equal(consent.consentFromCookie("x_sj_tracking_consent=granted"), null);
consent.writeConsent("granted");
assert.equal(jar.get("sj_tracking_consent"), "granted", "Accept writes the shared cookie");
assert.match(setCookies.at(-1), /Domain=\.studojo\.com/);
// A choice made on the other host (the cookie) wins over this origin's older one.
store.set("sj_tracking_consent", "granted");
jar.set("sj_tracking_consent", "denied");
assert.equal(consent.readConsent(), "denied");
// A choice held only in localStorage (from before the cookie) is copied to the cookie, so the platform sees it.
jar.delete("sj_tracking_consent");
store.set("sj_tracking_consent", "granted");
assert.equal(consent.readConsent(), "granted");
assert.equal(jar.get("sj_tracking_consent"), "granted");
// The platform's reader (Studojo1/career-agent app/lib/analytics.ts consentFromCookie) reads this same cookie name.
assert.equal(consent.CONSENT_COOKIE, "sj_tracking_consent");

// ── B1: server copies carry fbc built from the stored fbclid when the pixel left no _fbc cookie.
const capi = await import("./meta-capi.server.ts");
const seen = "2026-11-01T10:00:00.000Z";
const ms = Date.parse(seen);
const src = (o) => encodeURIComponent(JSON.stringify(o));
const lt = src({ fbclid: "IwAR1test123", landing_path: "/", first_seen_at: seen });
const first = src({ fbclid: "IwAR1firstclk", landing_path: "/", first_seen_at: "2026-10-20T10:00:00.000Z" });
const reqWith = (cookie) => new Request("https://studojo.com/api/meta-event", { method: "POST", headers: { cookie, "user-agent": "UA/1" } });
assert.equal(capi.fbcFromSourceCookies(`stu_lt=${lt}; stu_src=${first}`), `fb.1.${ms}.IwAR1test123`, "the latest click first");
assert.equal(capi.fbcFromSourceCookies(`stu_src=${first}`), `fb.1.${Date.parse("2026-10-20T10:00:00.000Z")}.IwAR1firstclk`);
assert.equal(capi.fbcFromSourceCookies(`stu_lt=${src({ landing_path: "/", first_seen_at: seen })}`), null);
assert.equal(capi.metaUserDataFromRequest(reqWith(`stu_lt=${lt}`)).fbc, `fb.1.${ms}.IwAR1test123`);
const both = capi.metaUserDataFromRequest(reqWith(`_fbc=fb.1.1700000000000.IwAR1pixel0; _fbp=fb.1.1700000000000.9; stu_lt=${lt}`));
assert.equal(both.fbc, "fb.1.1700000000000.IwAR1pixel0", "the pixel's own cookie wins");
assert.equal(both.fbp, "fb.1.1700000000000.9", "fbp when _fbp exists");
assert.equal(capi.cleanFbc("fb.1.1730454000000.IwAR1test123"), "fb.1.1730454000000.IwAR1test123");
assert.equal(capi.cleanFbc("fb.1.1730454000000.<x>"), null);

// The browser's relay body carries the fbc from the stored fbclid too (attribution.ts metaBrowserIds, no longer unused).
store.set("studojo_attribution", JSON.stringify({ fbclid: "IwAR1test123", captured_at: seen }));
const pixel = await import("./meta-pixel.ts");
const body = JSON.parse(pixel.relayBody("Lead", "e1", { content_name: "start_hero" }));
assert.equal(body.fbc, `fb.1.${ms}.IwAR1test123`);
assert.equal("value" in body, false, "Lead carries no value");

// ── B5: value and currency on the server copies that have them (InitiateCheckout, AddPaymentInfo), never Lead.
const money = JSON.parse(pixel.relayBody("InitiateCheckout", "e2", { value: 499, currency: "INR" }));
assert.equal(money.value, 499);
assert.equal(money.currency, "INR");
assert.deepEqual(capi.valueData("InitiateCheckout", { value: 499, currency: "inr" }), { value: 499, currency: "INR" });
assert.deepEqual(capi.valueData("AddPaymentInfo", { value: 18.255, currency: "INR" }), { value: 18.26, currency: "INR" });
assert.equal(capi.valueData("Lead", { value: 1, currency: "INR" }), null);
assert.equal(capi.valueData("InitiateCheckout", { value: "499", currency: "INR" }), null);
assert.equal(capi.valueData("InitiateCheckout", { value: 1e9, currency: "INR" }), null);
const route = readFileSync(`${APP}routes/api.meta-event.tsx`, "utf8");
assert.match(route, /const customData = valueData\(eventName, body\);/);
assert.match(route, /if \(!user\.fbc\) user\.fbc = cleanFbc\(body\.fbc\);/);

// ── B4: CompleteRegistration once a person across hosts: the server's claim decides both copies.
assert.deepEqual(pixel.onceAnswer({ ok: true, once: { meta: true, posthog: false } }), { meta: true, posthog: false });
assert.deepEqual(pixel.onceAnswer({ ok: true }), { meta: null, posthog: null }, "an old server: unknown");
const once = await import("./tracking-once.server.ts");
const rows = new Set();
once.setOnceClaim(async (u, e) => (rows.has(`${u}|${e}`) ? false : (rows.add(`${u}|${e}`), true)));
assert.equal(await once.claimOnce("u1", "CompleteRegistration", "studojo.com"), true);
assert.equal(await once.claimOnce("u1", "CompleteRegistration", "platform.studojo.com"), false, "the other host sends nothing");
assert.equal(await once.claimOnce("u1", once.POSTHOG_SIGNED_UP, "studojo.com"), true);
once.setOnceClaim(async () => Promise.reject(Object.assign(new Error("missing"), { code: "42P01" })));
assert.equal(await once.claimOnce("u1", "CompleteRegistration", "x"), null, "the table not made yet: unknown");
once.setOnceClaim(null);
assert.match(readFileSync(`${APP}lib/tracking-once.server.ts`, "utf8"), /career_agent\.career_tracking_once/);
assert.match(route, /if \(eventId !== `reg_\$\{userId\}`\) return ok\(\{ meta: false, posthog: false \}\);/, "only the person's own id");

// The browser: already claimed elsewhere, no pixel copy; first, one pixel copy with reg_<id>.
fbqCalls.length = 0;
bodies.length = 0;
reply = { ok: true, once: { meta: false, posthog: false } };
let a = await pixel.claimMetaOnce("CompleteRegistration", "reg_u1", { posthog: true });
assert.deepEqual(a, { meta: false, posthog: false });
assert.equal(fbqCalls.filter((c) => c[1] === "CompleteRegistration").length, 0, "claimed elsewhere: no browser copy");
assert.equal(bodies[0].once, true);
assert.equal(bodies[0].posthog, true);
assert.equal(bodies[0].meta, true);
reply = { ok: true, once: { meta: true, posthog: true } };
a = await pixel.claimMetaOnce("CompleteRegistration", "reg_u2", { posthog: true });
assert.deepEqual(a, { meta: true, posthog: true });
// (No pixel id under test, so the copy itself is checked in the source: fired only when the claim is not someone else's.)
assert.match(readFileSync(`${APP}lib/meta-pixel.ts`, "utf8"), /if \(answer\.meta !== false\) \{\s*initMetaPixel\(\);\s*try \{\s*if \(isInitialized\) fbq\(\)\?\.\("track", eventName, \{\}, \{ eventID: eventId \}\);/);
// trackSignedUpOnce: one request per account on this browser, and /auth can wait for its answer.
const analytics = await import("./analytics.ts");
bodies.length = 0;
await analytics.trackSignedUpOnce({ id: "u3", email: "a@b.co", name: "A" });
await analytics.trackSignedUpOnce({ id: "u3", email: "a@b.co", name: "A" });
assert.equal(bodies.length, 1, "the browser's own flag still guards repeats");
assert.equal(bodies[0].eventId, "reg_u3");
await analytics.signupReported(10);
const auth = readFileSync(`${APP}routes/auth._index.tsx`, "utf8");
assert.match(auth, /void signupReported\(\)\.then\(\(\) => \{\s*if \(live\) goOn\(redirectUrl, true\);/);

// ── B2: Lead means a join or start CTA click only (the platform's onboarding is its custom OnboardingComplete).
const analyticsSrc = readFileSync(`${APP}lib/analytics.ts`, "utf8");
assert.match(analyticsSrc, /resume_uploaded: null,/);
const files = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
const leads = files(APP).filter((f) => /trackMeta\(\s*"Lead"|:\s*"Lead",/.test(readFileSync(f, "utf8")));
assert.deepEqual(leads.map((f) => f.slice(APP.length)), ["lib/journey-client.ts"], "Lead only from the CTA click");
assert.match(readFileSync(`${APP}lib/meta-pixel.ts`, "utf8"), /OnboardingComplete {4}the platform's custom event/);

tz = "Asia/Kolkata";
console.log("meta-fix: ok");
