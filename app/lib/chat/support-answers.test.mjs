// The support bot must not contradict the live refund policy (v2.0), and must
// not answer "delete my account" with password-reset text (B2C audit NEW-04,
// NEW-05). Runs the real matcher against the real knowledge base.
import assert from "node:assert/strict";
import { matchIntent } from "./matcher.ts";
import { KNOWLEDGE_CONTEXT } from "./knowledge-base.ts";

for (const q of ["delete my account", "please delete my account", "how do I close my account"]) {
  const { intent } = matchIntent(q);
  assert.equal(intent?.id, "privacy", `"${q}" went to ${intent?.id}`);
  assert.doesNotMatch(intent.response, /password/i);
  assert.match(intent.response, /delete my account/i);
}

for (const q of ["i want a refund", "refund policy", "refund my credits"]) {
  const { intent } = matchIntent(q);
  assert.equal(intent?.id, "refund", `"${q}" went to ${intent?.id}`);
  assert.doesNotMatch(intent.response, /7 days|24 hours|no leads were processed/i);
}

assert.equal(matchIntent("forgot my password").intent?.id, "account");

assert.doesNotMatch(KNOWLEDGE_CONTEXT, /refundable within 7 days|refundable within 24 hours/);
console.log("support-answers: all passed");
