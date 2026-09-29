// The support bot must not contradict the live refund policy (v3.0) or the
// Terms (18+, no detection promises), and must
// not answer "delete my account" with password-reset text (B2C audit NEW-04,
// NEW-05). Runs the real matcher against the real knowledge base.
import assert from "node:assert/strict";
import { matchIntent } from "./matcher.ts";
import { KNOWLEDGE_CONTEXT } from "./knowledge-base.ts";

for (const q of ["delete my account", "please delete my account", "how do I close my account"]) {
  const { intent } = matchIntent(q);
  assert.equal(intent?.id, "privacy", `"${q}" went to ${intent?.id}`);
  assert.doesNotMatch(intent.response, /password/i);
  assert.ok(intent.links?.some((l) => l.url === "/account/delete"), `"${q}" has no deletion link`);
}

for (const q of ["i want a refund", "refund policy", "refund my credits"]) {
  const { intent } = matchIntent(q);
  assert.equal(intent?.id, "refund", `"${q}" went to ${intent?.id}`);
  assert.doesNotMatch(intent.response, /7 days|24 hours|no leads were processed/i);
}

assert.equal(matchIntent("forgot my password").intent?.id, "account");

assert.doesNotMatch(KNOWLEDGE_CONTEXT, /refundable within 7 days|refundable within 24 hours/);
// v2.0 promised fix-first clocks and assignment cancellation; v3.0 dropped both.
assert.doesNotMatch(KNOWLEDGE_CONTEXT, /policy v2\.0|We fix it first|cancelled before the document is generated/);
// Terms §2: 18+ only. The old rule told the bot to deny any age requirement.
assert.doesNotMatch(KNOWLEDGE_CONTEXT, /no stated age requirement/i);
assert.match(KNOWLEDGE_CONTEXT, /aged 18 and over/);
// Terms §12: never promise detection results.
assert.doesNotMatch(KNOWLEDGE_CONTEXT, /plagiarism-safe/i);
const { intent: turnitin } = matchIntent("will it pass turnitin");
assert.doesNotMatch(turnitin.response, /plagiarism-safe|undetectable|pass/i);
console.log("support-answers: all passed");
