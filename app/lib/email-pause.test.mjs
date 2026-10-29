// EMAIL-PAUSE (29 Oct 2026): the owner ordered every email this app sends by
// itself switched off, user and internal team mail alike. The helper must hold
// by default, and each held sender must ask it before sending. The internship
// application notification (to the hiring side) is deliberately not held.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { emailsPaused } from "./email-pause.server.ts";

const saved = process.env.EMAILS_PAUSED;
try {
  delete process.env.EMAILS_PAUSED;
  assert.equal(emailsPaused(), true, "unset must hold (paused by default)");
  for (const v of ["", "1", "true", "false", "no", "00"]) {
    process.env.EMAILS_PAUSED = v;
    assert.equal(emailsPaused(), true, `EMAILS_PAUSED=${JSON.stringify(v)} must hold`);
  }
  process.env.EMAILS_PAUSED = "0";
  assert.equal(emailsPaused(), false, "only EMAILS_PAUSED=0 lifts the pause");
} finally {
  if (saved === undefined) delete process.env.EMAILS_PAUSED;
  else process.env.EMAILS_PAUSED = saved;
}

/** The source of one function: from its signature to the next top-level function. */
function body(file, signature) {
  const src = readFileSync(new URL(file, import.meta.url), "utf8");
  const start = src.indexOf(signature);
  assert.ok(start >= 0, `${file}: ${signature} not found`);
  const next = src.slice(start + signature.length).search(/\n(export )?(async )?function /);
  return next < 0 ? src.slice(start) : src.slice(start, start + signature.length + next);
}

const HELD = [
  ["./gmail-direct.server.ts", "export async function sendDirectGmail("],
  ["./notifications.server.ts", "export async function sendLinkedInConnectEmail("],
  ["./mcp/errors.server.ts", "async function alertOnce("],
];
for (const [file, sig] of HELD) {
  const fn = body(file, sig);
  const gate = fn.indexOf("if (emailsPaused())");
  assert.ok(gate > 0, `${file}: ${sig} must check emailsPaused()`);
  for (const send of ["sendMail(", "fetch("]) {
    const at = fn.indexOf(send);
    if (at >= 0) assert.ok(gate < at, `${file}: the pause check must come before ${send}`);
  }
}

const kept = body("./notifications.server.ts", "export async function sendInternshipApplicationNotification(");
assert.ok(!kept.includes("emailsPaused"), "the internship application notification is not held");

console.log("email-pause: ok");
