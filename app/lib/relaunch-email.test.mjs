// RELAUNCH (2 Nov 2026, the owner): no email to a student, not even by accident (no verification, welcome or reset),
// email and password sign-up kept without verification, and GOOGLE_ONLY as one switch, off by default.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { STUDENT_TEMPLATES_OFF, TEAM_EVENT_KEYS, publishEmailEvent, sendTemplateEmail, teamEventAllowed } from "./events.ts";
import { googleOnlyFrom } from "./google-only.ts";

const APP = new URL("../", import.meta.url).pathname;
const code = (rel) => readFileSync(join(APP, rel), "utf8").replace(/^\s*\/\/.*$/gm, "");

// ── 1. The emailer gate: only team mail passes, and nothing else ever makes a request.
assert.deepEqual([...TEAM_EVENT_KEYS], ["event.sensei.contact"]);
assert.equal(STUDENT_TEMPLATES_OFF, true);
for (const k of ["event.cc.welcome_new_user", "event.user.signup", "event.internship.applied", "event.cc.outreach_used", "event.cc.paid", "event.cc.webinar_registered", ""]) {
  assert.equal(teamEventAllowed(k), false, k);
}
const realFetch = globalThis.fetch;
const realWarn = console.warn;
const calls = [];
globalThis.fetch = async (...args) => {
  calls.push(String(args[0]));
  return new Response("{}", { status: 200 });
};
console.warn = () => {};
try {
  await publishEmailEvent("event.cc.welcome_new_user", { user_id: "u", email: "a@example.com" });
  await sendTemplateEmail("a@example.com", "verify-email", { action_url: "https://x" });
  await sendTemplateEmail("a@example.com", "reset-password", { action_url: "https://x" });
  assert.deepEqual(calls, [], "no request for a student email");
  await publishEmailEvent("event.sensei.contact", { email: "lead@example.com" });
  assert.equal(calls.length, 1, "team mail still goes");
} finally {
  globalThis.fetch = realFetch;
  console.warn = realWarn;
}

// ── 2. better-auth: no verification email, no welcome, no reset sender; sign-up without verification.
const auth = code("lib/auth.ts");
assert.doesNotMatch(auth, /sendVerificationEmail|sendResetPassword|sendTemplateEmail|publishEmailEvent|welcomeAfterCommit|welcome_new_user/);
assert.match(auth, /emailVerification: \{\n\s+sendOnSignUp: false,\n\s+sendOnSignIn: false,\n\s+\},/);
assert.match(auth, /requireEmailVerification: false,\n\s+disableSignUp: googleOnlyEnabled\(\),/);
assert.match(auth, /emailAndPassword: \{\n\s+enabled: true,/, "email and password stay on");
assert.doesNotMatch(auth.slice(auth.indexOf("databaseHooks")), /user: \{\n\s+create: \{\n\s+after:/, "no hook on a new user");
assert.match(auth, /\.\.\.cookieConfig\.trustedOrigins,\n\s+\],/, "the product's sign-in origins come from AUTH_TRUSTED_ORIGINS (app/lib/auth-cookies.test.mjs)");

// ── 3. GOOGLE_ONLY: one switch, off by default.
for (const v of [undefined, null, "", "0", "false", "off", "no", "maybe"]) assert.equal(googleOnlyFrom(v), false, String(v));
for (const v of ["1", "true", "TRUE", "on", "yes", " 1 "]) assert.equal(googleOnlyFrom(v), true, v);
const root = code("root.tsx");
assert.match(root, /googleOnly: googleOnlyEnabled\(\),\n/, "the root loader hands the switch to the pages");
const authPage = code("routes/auth._index.tsx");
assert.match(authPage, /const googleOnly = useGoogleOnly\(\);/);
for (const gate of [/\{!googleOnly && \(\n\s+<div \{\.\.\.b2cMark\("tabs"\)\}/, /\{mode === "signin" && !googleOnly && \(\n\s+<button\n\s+\{\.\.\.b2cMark\("passkey"\)\}/, /\{!googleOnly && \(\n\s+<>\n\s+<div className="relative">/]) {
  assert.match(authPage, gate, "tabs, passkey and the email form hide with GOOGLE_ONLY on");
}
const settings = code("routes/settings._index.tsx");
assert.match(settings, /\{!googleOnly && \(\n\s+<>\n\s+\{\/\* Passkeys Section \*\/\}/);

// ── 4. Nothing that stays sends a reset, verification or password email through the emailer.
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f)) files.push(p);
  }
})(join(APP, "routes"));
for (const f of files) {
  const src = readFileSync(f, "utf8");
  assert.doesNotMatch(src, /requestPasswordReset|resetPassword\(|changePassword\(currentPassword|getEmailPreferences|updateEmailPreferences|publishEmailEventFromClient|sendLinkedInConnectEmail|sendInternshipApplicationNotification/, f.slice(APP.length));
}
assert.match(settings, /authClient\.changePassword\(\{ currentPassword, newPassword \}\)/, "a password change goes through better-auth, which sends no email");

console.log("relaunch-email: no student email, sign-up without verification, GOOGLE_ONLY off by default");
