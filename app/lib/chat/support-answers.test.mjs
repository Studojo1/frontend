// The support bot must not contradict the live refund policy (v3.0) or the
// Terms (18+, no detection promises), and must
// not answer "delete my account" with password-reset text (B2C audit NEW-04,
// NEW-05). Runs the real matcher against the real knowledge base.
import assert from "node:assert/strict";
import { matchIntent } from "./matcher.ts";
import { INTENTS, KNOWLEDGE_CONTEXT } from "./knowledge-base.ts";

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
// PRODUCT-ALIGN (27 Oct 2026, staging only): Studojo is one product, Stu the job agent at /b2cnew. The bot says so,
// answers the three questions students ask about the old products, and never sells or links them.
const RETIRED = /(?<!stu)dojo|outreach tool|resume maker|resume builder is free|ATS-optimised|pay per assignment|10,000\+/i;
const about = matchIntent("what does studojo do").intent;
assert.equal(about?.id, "about");
assert.match(about.response, /^Studojo is one product: Stu, a job agent/);
const resume = matchIntent("can you build my resume").intent;
assert.equal(resume?.id, "careers_resume");
assert.match(resume.response, /inside Stu/);
assert.ok(resume.links?.some((l) => l.url.startsWith("/b2cnew")));
const homework = matchIntent("do you do assignments").intent;
assert.equal(homework?.id, "assignments");
assert.match(homework.response, /^Studojo doesn't do assignments/);
for (const intent of INTENTS) {
  assert.doesNotMatch(intent.response, RETIRED, `${intent.id} sells a retired product`);
  for (const l of intent.links ?? []) assert.doesNotMatch(l.url, /^\/(outreach|resume-maker|jrs|dojos|assignments)\b/, `${intent.id} links ${l.url}`);
}
assert.doesNotMatch(KNOWLEDGE_CONTEXT, /\*\*(Outreach Tool|Careers Dojo|Internship Dojo|Assignment Dojo|AI Risk Dojo|Revision Dojo)\*\*|PRIMARY RECOMMENDATION/);
assert.match(KNOWLEDGE_CONTEXT, /Studojo is one product: Stu, a job agent/);
console.log("support-answers: all passed");
