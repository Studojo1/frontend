// QA-FIX (2 Nov 2026): the email typed on the homepage's call screen carries to /auth through this tab's
// sessionStorage, short-lived and read once, never in the URL (app/lib/carry-email.ts).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CARRY_EMAIL_KEY, CARRY_EMAIL_TTL_MS, cleanEmail, holdEmail, packEmail, takeEmail, unpackEmail } from "./carry-email.ts";

const T = 1_762_000_000_000;
assert.equal(cleanEmail("  asha@college.edu "), "asha@college.edu");
for (const bad of ["", "asha", "a@b", "a b@c.de", null, 42, "x".repeat(250) + "@a.io"]) assert.equal(cleanEmail(bad), null, String(bad));
assert.equal(packEmail("nope", T), null, "nothing worth keeping");
const packed = packEmail("asha@college.edu", T);
assert.equal(unpackEmail(packed, T + 60_000), "asha@college.edu");
assert.equal(unpackEmail(packed, T + CARRY_EMAIL_TTL_MS + 1), null, "short-lived");
assert.equal(unpackEmail(packed, T - 1), null, "not from the future");
assert.equal(unpackEmail("{not json", T), null);
assert.equal(unpackEmail(JSON.stringify({ e: "asha@college.edu" }), T), null, "no time, no email");
assert.ok(CARRY_EMAIL_TTL_MS <= 15 * 60_000);

// In a browser tab: held on the call screen, taken once on /auth.
const store = new Map();
globalThis.sessionStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
holdEmail("asha@college.edu");
assert.ok(store.has(CARRY_EMAIL_KEY));
assert.equal(takeEmail(), "asha@college.edu");
assert.equal(takeEmail(), null, "read once");
holdEmail("asha@college.edu");
holdEmail("");
assert.equal(takeEmail(), null, "an emptied field forgets the old one");
globalThis.sessionStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
holdEmail("asha@college.edu");
assert.equal(takeEmail(), null, "blocked storage is silent");

// Wiring: both sign-up cards hold it, /auth takes it, and nothing puts it in an address.
const APP = new URL("../", import.meta.url).pathname;
for (const f of ["components/home-v3/JoinCard.tsx", "components/home-v2/JoinCard.tsx"]) {
  const src = readFileSync(`${APP}${f}`, "utf8");
  assert.match(src, /holdEmail\(email\);\s*window\.location\.href = signIn;/, `${f}: held before leaving`);
  assert.doesNotMatch(src, /encodeURIComponent\(email\)|[?&]email=/, `${f}: never in the URL`);
}
const auth = readFileSync(`${APP}routes/auth._index.tsx`, "utf8");
assert.match(auth, /const carried = takeEmail\(\);/);
assert.match(auth, /ref=\{emailRef\}\s*defaultValue=\{carriedEmail\}/);
const agent = readFileSync(`${APP}components/home-v3/agent.ts`, "utf8");
assert.doesNotMatch(agent, /[?&]email=/, "the sign-in link carries attribution only");

console.log("carry-email: ok");
