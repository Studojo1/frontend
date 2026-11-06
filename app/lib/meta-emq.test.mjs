// EMQ (5 Nov 2026, the owner: Events Manager showed PageView 6.1, Lead 6.1, CompleteRegistration 7.7 of 10, "we need
// to be around 9+"). More customer information on every Conversions API copy (ph, fn, ln, country, and external_id as
// the account id plus the stu_vid visitor id), each normalised as Meta asks before it is hashed, and the browser
// pixel's init carries the same hashed visitor id (Advanced Matching), with every call held until init has run.
//
// Made-up people only. fetch is stubbed: nothing here reaches Meta or any network.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const APP = new URL("../", import.meta.url).pathname;
const sha = (s) => createHash("sha256").update(s).digest("hex");

// India, so the consent gate is not what blocks anything here (CI runs in UTC, which consent treats as "ask first").
const RealDTF = Intl.DateTimeFormat;
Intl.DateTimeFormat = function (...a) {
  const d = new RealDTF(...a);
  return { format: (x) => d.format(x), resolvedOptions: () => ({ ...d.resolvedOptions(), timeZone: "Asia/Kolkata" }) };
};

// The token is read when the module loads; a stand-in, never a real one.
delete process.env.META_TEST_EVENT_CODE;
process.env.META_CAPI_TOKEN = "stand-in-token";
const bodies = [];
const relayed = [];
globalThis.fetch = async (url, init) => {
  if (String(url).startsWith("https://graph.facebook.com/")) {
    bodies.push(JSON.parse(init.body));
    return new Response("{}", { status: 200 });
  }
  relayed.push([String(url), init?.body ? JSON.parse(init.body) : null]);
  return { ok: true, json: async () => ({}) };
};

const capi = await import("./meta-capi.server.ts");

// ── Normalisation, one key at a time.
assert.equal(capi.normEmail("  Riya.Test@Example.COM "), "riya.test@example.com");
assert.equal(capi.normEmail(""), null);
assert.equal(capi.normEmail(null), null);
assert.equal(capi.normEmail("not-an-email"), null);

assert.equal(capi.normPhone("+91 98765-43210"), "919876543210");
assert.equal(capi.normPhone("0091 98765 43210"), "919876543210", "00 is the international prefix, not part of the number");
assert.equal(capi.normPhone("+1 (415) 555-0100"), "14155550100");
assert.equal(capi.normPhone("+65 6123 4567"), "6561234567");
assert.equal(capi.normPhone("+44 7700 900123"), "447700900123");
assert.equal(capi.normPhone("+971 50 123 4567"), "971501234567");
assert.equal(capi.normPhone("1234567"), null, "fewer than 8 digits");
assert.equal(capi.normPhone("+91"), null);
assert.equal(capi.normPhone(""), null);
assert.equal(capi.normPhone(undefined), null);
assert.equal(capi.normPhone("1".repeat(16)), null, "longer than E.164 allows");

assert.equal(capi.phoneCountry("+91 98765-43210"), "in");
assert.equal(capi.phoneCountry("+971 50 123 4567"), "ae");
assert.equal(capi.phoneCountry("+65 6123 4567"), "sg");
assert.equal(capi.phoneCountry("+44 7700 900123"), "gb");
assert.equal(capi.phoneCountry("+1 415 555 0100"), "us");
assert.equal(capi.phoneCountry("0091 98765 43210"), "in", "00 is international form too");
assert.equal(capi.phoneCountry("+61 412 345 678"), null, "a calling code outside the list: omitted");
assert.equal(capi.phoneCountry("6512345678"), null, "no + or 00: no calling code (an Indian mobile, not Singapore)");
assert.equal(capi.phoneCountry("+91 12"), null, "not a phone number");
assert.equal(capi.phoneCountry(null), null);

assert.equal(capi.normCountry(" IN "), "in");
assert.equal(capi.normCountry("ind"), null);
assert.equal(capi.normCountry(""), null);

assert.equal(capi.normName("  Riya "), "riya");
assert.equal(capi.normName("O'Brien-Smith"), "obriensmith", "punctuation dropped");
assert.equal(capi.normName("Mary Ann"), "maryann", "spaces inside dropped");
assert.equal(capi.normName("José"), "josé", "letters outside ASCII kept");
assert.equal(capi.normName("José"), "josé", "composed (NFC) so both spellings hash the same");
assert.equal(capi.normName("प्रिया"), "प्रिया", "a Devanagari name keeps its vowel signs");
assert.equal(capi.normName("R2D2"), "rd", "digits dropped");
assert.equal(capi.normName("-"), null);
assert.equal(capi.normName(null), null);

assert.deepEqual(capi.splitName("Riya Testname"), { firstName: "Riya", lastName: "Testname" });
assert.deepEqual(capi.splitName("  Riya   Kumari   Testname "), { firstName: "Riya", lastName: "Testname" }, "middle names dropped");
assert.deepEqual(capi.splitName("Riya"), { firstName: "Riya", lastName: null }, "one word: a first name only");
assert.deepEqual(capi.splitName("Riya - Testname"), { firstName: "Riya", lastName: "Testname" }, "a word with no letters does not count");
assert.deepEqual(capi.splitName("   "), { firstName: null, lastName: null });
assert.deepEqual(capi.splitName(null), { firstName: null, lastName: null });

// An email sign-up's name is the email's local part (auth._index.tsx): not a name.
assert.equal(capi.accountName("riya.test99", "Riya.Test99@example.com"), null);
assert.equal(capi.accountName("User", "x@example.com"), null);
assert.equal(capi.accountName("Riya Testname", "riya.test99@example.com"), "Riya Testname");
assert.equal(capi.accountName("", "x@example.com"), null);
assert.match(readFileSync(`${APP}routes/auth._index.tsx`, "utf8"), /name: email\.split\("@"\)\[0\] \|\| "User",/, "the placeholder accountName drops");

assert.deepEqual(capi.externalIdHashes(["Acct_1", " acct_1 ", "", null, "vid-0001"]), [sha("acct_1"), sha("vid-0001")], "trimmed, lowercased, blanks and repeats dropped");
assert.deepEqual(capi.externalIdHashes([]), []);
assert.deepEqual(capi.externalIdHashes(undefined), []);

// ── The request: the stu_vid visitor id, when valid, is the request's external id.
const VID = "3f2b8c1e-5a6d-4e7f-9a0b-1c2d3e4f5a6b";
const req = (cookie) =>
  new Request("https://studojo.com/api/meta-event", {
    method: "POST",
    headers: { cookie, "user-agent": "UA/1", "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
  });
const anon = capi.metaUserDataFromRequest(req(`stu_vid=${VID}; _fbp=fb.1.1700000000000.42`));
assert.deepEqual(anon.externalIds, [VID]);
assert.equal(anon.clientIp, "203.0.113.5");
assert.equal("externalIds" in capi.metaUserDataFromRequest(req("stu_vid=bad%20id!")), false, "an id this site did not issue");
assert.equal("externalIds" in capi.metaUserDataFromRequest(req("")), false);

// ── Signed out: external_id is the visitor id alone; no em, ph, fn, ln or country.
const out = capi.metaUserDataPayload(anon);
assert.deepEqual(out, {
  external_id: [sha(VID)],
  client_ip_address: "203.0.113.5",
  client_user_agent: "UA/1",
  fbp: "fb.1.1700000000000.42",
});
// No visitor id and no account: no external_id key at all, never an empty list.
const bare = capi.metaUserDataPayload(capi.metaUserDataFromRequest(req("")));
assert.equal("external_id" in bare, false);
assert.equal(Object.values(bare).some((v) => Array.isArray(v) && v.length === 0), false);

// ── Signed in: the account's keys on top, the account id ahead of the visitor id.
const account = { id: "AcctTest01", email: " Riya.Test99@Example.com ", name: "Riya Kumari Testname", phoneNumber: "+91 98765-43210" };
const signed = capi.withAccount(anon, account);
assert.deepEqual(signed.externalIds, ["AcctTest01", VID]);
assert.equal(signed.firstName, "Riya");
assert.equal(signed.lastName, "Testname");
assert.equal(signed.phone, "+91 98765-43210");
assert.equal(signed.country, "in");
assert.equal(anon.externalIds.length, 1, "the request's data is not changed");
const inn = capi.metaUserDataPayload(signed);
assert.deepEqual(inn, {
  em: [sha("riya.test99@example.com")],
  ph: [sha("919876543210")],
  fn: [sha("riya")],
  ln: [sha("testname")],
  country: [sha("in")],
  external_id: [sha("accttest01"), sha(VID)],
  client_ip_address: "203.0.113.5",
  client_user_agent: "UA/1",
  fbp: "fb.1.1700000000000.42",
});
// No phone (most accounts), a placeholder name, no visitor cookie: em and the account id only.
const thin = capi.metaUserDataPayload(capi.withAccount(capi.metaUserDataFromRequest(req("")), { id: "AcctTest02", email: "sam.test@example.com", name: "sam.test", phoneNumber: null }));
assert.deepEqual(Object.keys(thin).sort(), ["client_ip_address", "client_user_agent", "em", "external_id"]);
assert.deepEqual(thin.external_id, [sha("accttest02")]);
// A phone outside the five markets: ph, but no country.
const abroad = capi.metaUserDataPayload(capi.withAccount({}, { id: "a", email: "a@example.com", name: "Alex", phoneNumber: "+61 412 345 678" }));
assert.deepEqual(abroad.ph, [sha("61412345678")]);
assert.equal("country" in abroad, false);
assert.deepEqual(abroad.fn, [sha("alex")]);
assert.equal("ln" in abroad, false, "one word: no last name");

// ── sendMetaEvent sends exactly that user_data (stubbed fetch).
assert.deepEqual(await capi.sendMetaEvent({ eventName: "Lead", eventId: "lead_1", eventSourceUrl: "https://studojo.com/", user: anon }), { ok: true });
assert.deepEqual(bodies.at(-1).data[0].user_data, out);
assert.equal(bodies.at(-1).data[0].event_id, "lead_1", "event ids untouched");
await capi.sendMetaEvent({ eventName: "CompleteRegistration", eventId: "reg_AcctTest01", user: signed });
assert.deepEqual(bodies.at(-1).data[0].user_data, inn);
assert.equal(bodies.at(-1).data[0].event_id, "reg_AcctTest01");

// ── The relay: every send's user data comes from the request (the visitor id), signed-in ones through withAccount.
const route = readFileSync(`${APP}routes/api.meta-event.tsx`, "utf8");
assert.match(route, /let user = metaUserDataFromRequest\(request\);/);
assert.match(route, /if \(session\?\.user\) \{\s*signedIn = true;\s*user = withAccount\(user, session\.user\);/);
assert.match(route, /const user = withAccount\(metaUserDataFromRequest\(request\), account\);/, "claimRegistration too");
assert.doesNotMatch(route, /body\.(email|phone|name)\b/, "never a client-supplied email, phone or name");
assert.doesNotMatch(route, /externalId\b/, "the old single id is gone");

// ── The browser: init carries the same hashed visitor id.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const loc = { hostname: "studojo.com", pathname: "/", search: "", href: "https://studojo.com/", protocol: "https:" };
globalThis.window = Object.assign(new EventTarget(), { location: loc });
let cookie = `stu_vid=${VID.toUpperCase()}`;
globalThis.document = {
  createElement: () => ({ setAttribute() {}, addEventListener() {} }),
  head: { appendChild() {} },
  getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
  get cookie() {
    return cookie;
  },
};
Object.defineProperty(globalThis, "navigator", { value: { userAgent: "test" }, configurable: true });
const pixel = await import("./meta-pixel.ts");

assert.equal(await pixel.visitorExternalId(`a=1; stu_vid=${VID}`), sha(VID));
assert.equal(await pixel.visitorExternalId(`stu_vid=${VID.toUpperCase()}`), sha(VID), "lowercased first, as the server does");
assert.equal(await pixel.visitorExternalId(`stu_vid=${VID}`), capi.externalIdHashes([VID])[0], "the browser and server hashes are one id");
assert.equal(await pixel.visitorExternalId(""), null, "no stu_vid: nothing");
assert.equal(await pixel.visitorExternalId("stu_vid=bad%20id!"), null);
assert.deepEqual(await pixel.pixelUserData(1000, `stu_vid=${VID}`), { external_id: sha(VID) });
assert.equal(await pixel.pixelUserData(1000, ""), undefined);
const hashed = await pixel.pixelUserData(1000, `stu_vid=${VID}`);
assert.match(hashed.external_id, /^[0-9a-f]{64}$/, "pre-hashed lowercase hex, never the raw id");
assert.ok(!JSON.stringify(hashed).includes(VID));

// No crypto.subtle (an insecure context), or a hash slower than the cap: init without user data, as before.
const realCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
Object.defineProperty(globalThis, "crypto", { value: { randomUUID: () => "uuid-test" }, configurable: true });
assert.equal(await pixel.visitorExternalId(`stu_vid=${VID}`), null);
assert.equal(await pixel.pixelUserData(1000, `stu_vid=${VID}`), undefined);
Object.defineProperty(globalThis, "crypto", { value: { subtle: { digest: () => new Promise(() => {}) } }, configurable: true });
const t0 = Date.now();
assert.equal(await pixel.pixelUserData(40, `stu_vid=${VID}`), undefined, "the wait is capped");
assert.ok(Date.now() - t0 < 1000);
Object.defineProperty(globalThis, "crypto", realCrypto);

// bootPixel: with user data, init's third argument; without, exactly as before.
assert.equal(pixel.bootPixel("1234567890", { external_id: sha(VID) }), true);
assert.deepEqual(Array.from(window.fbq.queue.at(-1)), ["init", "1234567890", { external_id: sha(VID) }]);
delete window.fbq;
delete window._fbq;

// startPixel: events fired while init waits for the hash are held and land after init, in order; the gates still run.
const booted = pixel.startPixel("1234567890");
assert.equal(pixel.trackMeta("ViewContent", { content_name: "a" }, "ev_1"), "ev_1");
pixel.trackMetaPageView();
loc.pathname = "/reports/how-to-get-a-high-school-internship-2026";
assert.equal(pixel.trackMeta("ViewContent", {}, "ev_minor"), null, "an excluded page is still excluded");
loc.pathname = "/";
assert.equal(window.fbq, undefined, "nothing reaches the page's fbq before init");
assert.equal(await booted, true);
pixel.trackMeta("ViewContent", {}, "ev_2");
const q = window.fbq.queue.map((args) => Array.from(args));
const at = (pred) => q.findIndex(pred);
assert.deepEqual(q[0], ["set", "autoConfig", false, "1234567890"]);
assert.deepEqual(q[1], ["init", "1234567890", { external_id: sha(VID) }]);
assert.deepEqual(q.slice(2), [
  ["track", "ViewContent", { content_name: "a" }, { eventID: "ev_1" }],
  ["track", "PageView"],
  ["track", "ViewContent", {}, { eventID: "ev_2" }],
]);
assert.ok(at((c) => c[0] === "init") < at((c) => c[0] === "track"));
assert.equal(window.fbq.disablePushState, true, "flags as before");
assert.equal(window.fbq.allowDuplicatePageViews, true);
await new Promise((r) => setTimeout(r, 20));
assert.deepEqual(relayed.map(([, b]) => b.eventId), ["ev_1", "ev_2"], "the server mirror is as before (and not for the excluded page)");

// ── The privacy page names what is now sent.
const privacy = readFileSync(`${APP}routes/privacy.tsx`, "utf8");
assert.match(privacy, /Identifiers sent with them:<\/span> scrambled \(SHA-256 hashed\) copies of your email address, phone number, name and country, a hashed account ID and visitor ID, your IP address \(your device&apos;s IPv6 address too, which our own server reads when your network has one\), your browser details, and the _fbp and _fbc cookies\./);

console.log("meta-emq: ok");
