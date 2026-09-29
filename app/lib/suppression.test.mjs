// The partner enrichment API must never hand out, cache or bill the details
// of someone on the do-not-contact list (Privacy Policy §5). Runs the real
// applySuppression / emailHash from suppression.server.ts.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { applySuppression, emailHash } from "./suppression.server.ts";

// Same hash as job-outreach-svc: sha256 of the lowercased, trimmed address.
assert.equal(emailHash("  Priya@Razorpay.com "), createHash("sha256").update("priya@razorpay.com").digest("hex"));

const hit = {
  status: "ok",
  person: { name: "Priya Nair", title: "PM", linkedin_url: "https://linkedin.com/in/priya" },
  emails: { work: "priya@razorpay.com", personal: "priya.n@gmail.com" },
  phone: { number: "+919800000000", type: "mobile", line_type: "mobile", verified: true },
  confidence: 0.92,
  found: ["work_email", "personal_email", "mobile"],
  credits_used: 1,
};

// Not on the list: untouched.
assert.deepEqual(applySuppression(hit, new Set([emailHash("someone@else.com")])), hit);

// Either address on the list: every contact detail goes, and nothing is billed.
for (const listed of ["priya@razorpay.com", "PRIYA.N@gmail.com"]) {
  const out = applySuppression(hit, new Set([emailHash(listed)]));
  assert.equal(out.status, "not_found");
  assert.deepEqual(out.emails, { work: null, personal: null });
  assert.equal(out.phone, null);
  assert.deepEqual(out.found, []);
  assert.equal(out.credits_used, 0);
  assert.equal(out.person.name, "Priya Nair");
}

console.log("suppression: all passed");
