// Guards against the fabricated marketing claims removed in the 29 Sep 2026
// audit (HP-N04, OP-N02, OP-N04, HP-N02).
//
// The site showed invented testimonials labelled "Real messages from
// students", "500+ students placed", "Positive replies from" 32 brands (2 had
// ever replied positively), "most students reply within a week" (4 in 10 do),
// and crossed-out prices that were never charged. Under India's CCPA and the
// FTC fake-review rule these are legal exposure on pages paid ads land on.
// Real figures live in app/components/outreach/RealNumbers.tsx with their
// source queries.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { webinarHasEnded, WEBINAR } from "./webinar-event.ts";

const ROOT = new URL("../", import.meta.url).pathname;
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e)) files.push(p);
  }
})(ROOT);

const BANNED = [
  /Real messages from students/i,
  /students placed/i,
  /Positive replies from/i,
  /(first )?reply (typically )?within a week/i,
  /Priya Nair|Hannah Lim|Devansh Rao|Karthik Menon|Sara Qureshi|Rohit Bansal/,
  /3 interview calls in week one|95% of students say/i,
  /4 in 10 (students )?hear back/i,
  /success stories are students placed/i,
  /anchor_display/,
];

let bad = 0;
for (const f of files) {
  if (f.endsWith("honest-claims.test.mjs")) continue;
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const re of BANNED) {
      if (!re.test(line)) continue;
      bad++;
      console.log(`  FAIL ${f.replace(ROOT, "app/")}:${i + 1}  ${re}\n       ${line.trim().slice(0, 110)}`);
    }
  });
}
assert.equal(bad, 0, `${bad} fabricated or unverifiable claim(s) found; see above`);

// The webinar stops selling the day after it runs (IST).
const day = new Date(`${WEBINAR.isoDate}T12:00:00Z`);
assert.equal(webinarHasEnded(day), false, "not ended on the day itself");
assert.equal(webinarHasEnded(new Date(`${WEBINAR.isoDate}T18:31:00Z`)), true, "ended after IST midnight (18:30 UTC)");
assert.equal(webinarHasEnded(new Date(day.getTime() - 86400000)), false, "not ended the day before");

console.log(`honest-claims: scanned ${files.length} files, ok`);
