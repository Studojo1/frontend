// SUPPORT-STU: the /contact form makes a ticket (no email), with a per-email cap on top of the per-IP guard.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contactBody, contactCategory, contactPriority, overContactLimit } from "./contact-limit.ts";

assert.equal(overContactLimit(0), false);
assert.equal(overContactLimit(2), false);
assert.equal(overContactLimit(3), true);
assert.equal(overContactLimit(10), true);
assert.equal(overContactLimit(Number.NaN), false);

const map = {
  "General Inquiry": ["info_request", "low"],
  "Technical Issue": ["website_broken", "high"],
  "Billing & Refunds": ["billing", "high"],
  "Feature Request": ["feature_request", "low"],
  Other: ["other", "normal"],
  "something odd": ["other", "normal"],
};
for (const [subject, [cat, pri]] of Object.entries(map)) {
  assert.equal(contactCategory(subject), cat, subject);
  assert.equal(contactPriority(contactCategory(subject)), pri, subject);
}
assert.equal(contactBody("Other", "  hello there friend  "), "Other\n\nhello there friend");
assert.equal(contactBody("Other", "x".repeat(9000)).length, 5000);

const src = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../routes/api.contact.tsx"), "utf8");
assert.match(src, /guardPublicForm\(request, body\)/, "api.contact must keep the per-IP guard");
assert.match(src, /overContactLimit/, "api.contact must apply the per-email limit");
assert.match(src, /INSERT INTO tickets/);
assert.match(src, /'contact_form'/);
assert.match(src, /INSERT INTO ticket_messages/);
assert.match(src, /ensureTicketTables\(\)/);
for (const bad of [/getEmailerServiceUrl/, /\/v1\/email/, /sendDirectGmail/, /notifyTicketCreated/, /notifyTicketReplied/, /emailer/i]) {
  assert.ok(!bad.test(src), `api.contact must never email: ${bad}`);
}
console.log("contact-limit: ok");
