// EX-06 (audit 30 Sep 2026): upload before signup for ad visitors, behind the
// PostHog flag `upload-before-signup` (off by default). Calls the real
// helpers, and reads the pages to check the wiring: nothing changes unless the
// flag is on, and the held resume is sent once the account exists.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  UPLOAD_BEFORE_SIGNUP_FLAG, isAdVisitor, headedToUpload, isResumeFile,
  saveResumeDraft, loadResumeDraft, clearResumeDraft, DRAFT_MAX_AGE_MS,
} from "./resume-draft.ts";
import { featureFlagEnabled } from "../posthog.ts";

assert.equal(UPLOAD_BEFORE_SIGNUP_FLAG, "upload-before-signup");

// Who counts as an ad visitor.
assert.equal(isAdVisitor("?utm_source=meta&utm_medium=paid"), true);
assert.equal(isAdVisitor("?utm_medium=PAID"), true);
assert.equal(isAdVisitor("?fbclid=IwAR0abc"), true);
assert.equal(isAdVisitor("?utm_medium=organic"), false);
assert.equal(isAdVisitor(""), false);
assert.equal(isAdVisitor("", new URLSearchParams("fbclid=x")), true, "the held first touch counts");
assert.equal(isAdVisitor("", new URLSearchParams("utm_medium=email")), false);

assert.equal(headedToUpload("/outreach/onboarding/upload?fbclid=x"), true);
assert.equal(headedToUpload("/outreach/leads/results"), false);
assert.equal(headedToUpload(null), false);

assert.equal(isResumeFile({ type: "application/pdf", name: "a" }), true);
assert.equal(isResumeFile({ type: "", name: "CV.DOCX" }), true);
assert.equal(isResumeFile({ type: "image/png", name: "a.png" }), false);

// The held file (Node has no IndexedDB, so this is the in-page fallback).
const t0 = 1_700_000_000_000;
assert.equal(await loadResumeDraft(t0), null);
await saveResumeDraft(new File([new Uint8Array([37, 80, 68, 70])], "cv.pdf", { type: "application/pdf" }), t0);
const back = await loadResumeDraft(t0 + 1000);
assert.equal(back.name, "cv.pdf");
assert.equal(back.type, "application/pdf");
assert.deepEqual([...new Uint8Array(await back.arrayBuffer())], [37, 80, 68, 70]);
await clearResumeDraft();
assert.equal(await loadResumeDraft(t0 + 2000), null);
await saveResumeDraft(new File(["x"], "old.pdf", { type: "application/pdf" }), t0);
assert.equal(await loadResumeDraft(t0 + DRAFT_MAX_AGE_MS + 1), null, "an unclaimed draft expires");

// Off the browser the flag is off: the default flow cannot change.
assert.equal(await featureFlagEnabled(UPLOAD_BEFORE_SIGNUP_FLAG), false);

const APP = new URL("../../", import.meta.url).pathname;
const auth = readFileSync(APP + "routes/auth._index.tsx", "utf8");
assert.match(auth, /featureFlagEnabled\(UPLOAD_BEFORE_SIGNUP_FLAG\)/, "/auth asks PostHog for the flag");
assert.match(auth, /if \(!headedToUpload\(/, "only for signups headed to upload");
assert.match(auth, /if \(!isAdVisitor\(/, "only for ad visitors");
assert.match(auth, /\{resumeFirst && mode === "signup" && <ResumeFirstCard \/>\}/, "the card shows only when the flag said yes");
assert.match(auth, /useState\(false\);\n  useEffect\(\(\) => \{\n    if \(!headedToUpload/, "resumeFirst starts off");

const upload = readFileSync(APP + "routes/outreach.onboarding.upload.tsx", "utf8");
const claim = upload.slice(upload.indexOf("loadResumeDraft().then"));
assert.ok(claim.indexOf("clearResumeDraft()") < claim.indexOf("handleUpload(draft)"), "claimed once before the upload");
assert.match(upload, /if \(!userId \|\| draftClaimedRef\.current\) return;/, "sent only once the account exists");
// The loader still sends logged-out visitors to /auth: the server-side
// redirect ad visitors rely on (PH-04) is untouched.
assert.match(upload, /throw redirect\(`\/auth\?mode=signup&redirect=/);

console.log("resume-draft: ok");
