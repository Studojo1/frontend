// Every error shape a service can hand us — including the ones I did not
// think of the first time.
//
// The bug this guards: I wrote a handler for `detail` as a string, tested the
// cases I imagined, and shipped. The first request that returned `detail` as
// an ARRAY printed "[object Object]" to a student and hid the real cause.
//
// So the rule for this file: every case must assert the output contains real
// words. "It didn't throw" is not a pass — [object Object] doesn't throw
// either. That is exactly how the bug survived.
import { describeError } from "./error-detail.ts";

let pass = 0, fail = 0;
const BAD = /\[object Object\]|undefined|^\s*$|^null$/;

function check(name, input, mustContain) {
  const out = describeError(input);
  const problems = [];
  if (BAD.test(out)) problems.push(`unreadable output: ${JSON.stringify(out)}`);
  if (mustContain && !out.includes(mustContain)) {
    problems.push(`expected to contain ${JSON.stringify(mustContain)}, got ${JSON.stringify(out)}`);
  }
  if (problems.length) { fail++; console.log(`  FAIL ${name}\n       ${problems.join("\n       ")}`); }
  else { pass++; console.log(`  ok   ${name}\n       -> ${out}`); }
}

// The shape I wrote the original handler for.
check("our own HTTPException (a string)",
  { body: { detail: "needs_gmail: Connect Gmail so this sends from your own address." } },
  "needs_gmail");

// THE ONE THAT BROKE. Pydantic returns a list, one entry per bad field.
check("pydantic validation (an array) — the actual bug",
  { body: { detail: [{ type: "string_too_short", loc: ["body", "contact_name"],
                       msg: "String should have at least 1 character" }] } },
  "contact_name");

check("two validation failures at once",
  { body: { detail: [{ loc: ["body", "contact_name"], msg: "String should have at least 1 character" },
                     { loc: ["body", "company"], msg: "Field required" }] } },
  "company");

// Shapes I did NOT originally consider. Each one would have printed
// [object Object] or "undefined" under the old code.
check("detail is an object, message nested", { body: { detail: { message: "Upstream timed out" } } }, "Upstream");
check("detail is an object with no message", { body: { detail: { code: 502, upstream: "apollo" } } }, "apollo");
check("detail is an array of plain strings", { body: { detail: ["Rate limited", "Retry in 30s"] } }, "Rate limited");
check("loc has only one segment", { body: { detail: [{ loc: ["body"], msg: "Invalid payload" }] } }, "Invalid payload");
check("detail present but empty array", { body: { detail: [] } });
check("detail present but empty string", { body: { detail: "" }, message: "Network unreachable" }, "Network");
check("no body at all — a thrown Error", new Error("fetch failed"), "fetch failed");
check("a bare string thrown", "something broke", "something broke");
check("detail is a number", { body: { detail: 502 } }, "502");
check("detail is null, message present", { body: { detail: null }, message: "Timed out" }, "Timed out");
check("nothing useful anywhere", {});
check("a bare detail, not wrapped in body",
  { detail: [{ loc: ["body", "subject"], msg: "Field required" }] }, "subject");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
