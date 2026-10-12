// A failed session check must not sign the student out.
//
// Chrome on Android re-checks the session when it comes back from the file
// picker, often before the network is back. The auth client reported that as
// "no session", so the upload page blanked, the picked file was lost and the
// student was sent to sign in. effectiveSession keeps the last signed-in
// session until a finished check really answers "no session".
import assert from "node:assert/strict";
import { effectiveSession, recheckDelayMs, SESSION_RECHECKS } from "./session-check.ts";

const signedIn = { user: { id: "u1" }, session: { id: "s1" } };
const networkError = new TypeError("Failed to fetch");
const serverError = { status: 503, message: "Service Unavailable" };
const unauthorized = { status: 401, message: "Unauthorized" };
// effectiveSession(live, last, error, isPending, isRefetching, retriesLeft)

// Signed in and the check succeeds: nothing special.
let r = effectiveSession(signedIn, signedIn, null, false, false, true);
assert.equal(r.session, signedIn);
assert.equal(r.signedOut, false);
assert.equal(r.loading, false);

// A re-check in flight while still signed in: nothing changes.
r = effectiveSession(signedIn, signedIn, null, false, true, true);
assert.equal(r.session, signedIn);
assert.equal(r.loading, false);

// The check fails on the network after the student was signed in: still signed
// in, nothing blanks, no redirect, and a re-check is due.
r = effectiveSession(null, signedIn, networkError, false, false, true);
assert.equal(r.session, signedIn);
assert.equal(r.checkFailed, true);
assert.equal(r.signedOut, false);
assert.equal(r.loading, false);

// The re-check after that failure: the auth client has cleared its data, so it
// reports loading. This is the moment the page used to blank and drop the
// input with the picked file. Still signed in, not loading.
r = effectiveSession(null, signedIn, null, true, true, true);
assert.equal(r.session, signedIn);
assert.equal(r.loading, false);
assert.equal(r.signedOut, false);
assert.equal(r.answeredNo, false);

// A server error is treated like a network error.
r = effectiveSession(null, signedIn, serverError, false, false, true);
assert.equal(r.session, signedIn);
assert.equal(r.signedOut, false);

// Even with the re-checks used up, a student we know was signed in keeps their
// session: only a real answer signs them out.
r = effectiveSession(null, signedIn, networkError, false, false, false);
assert.equal(r.session, signedIn);
assert.equal(r.signedOut, false);

// A finished check that answers "no session": signed out.
r = effectiveSession(null, signedIn, null, false, false, true);
assert.equal(r.session, null);
assert.equal(r.answeredNo, true);
assert.equal(r.signedOut, true);

// A 401 is a real answer too.
r = effectiveSession(null, signedIn, unauthorized, false, false, true);
assert.equal(r.session, null);
assert.equal(r.checkFailed, false);
assert.equal(r.answeredNo, true);
assert.equal(r.signedOut, true);

// First load fails before we ever saw a session: keep loading while the
// re-checks run, then give up and treat it as signed out.
r = effectiveSession(null, null, networkError, false, false, true);
assert.equal(r.session, null);
assert.equal(r.loading, true);
assert.equal(r.signedOut, false);
r = effectiveSession(null, null, null, true, true, true);
assert.equal(r.loading, true);
r = effectiveSession(null, null, networkError, false, false, false);
assert.equal(r.loading, false);
assert.equal(r.signedOut, true);

// Still loading the first answer: neither signed out nor done.
r = effectiveSession(null, null, null, true, false, true);
assert.equal(r.loading, true);
assert.equal(r.signedOut, false);

// Never signed in, and the server says so: signed out straight away.
r = effectiveSession(null, null, null, false, false, true);
assert.equal(r.signedOut, true);

// Re-checks back off: 2s, 4s, 8s.
assert.deepEqual([0, 1, 2].map(recheckDelayMs), [2000, 4000, 8000]);
assert.equal(SESSION_RECHECKS, 3);

console.log("session-check: ok");
