// Fails when a legal page would ship with an unfilled field.
//
// Runs in the tests workflow for pull requests into main and pushes to main
// (not staging, where drafts with open fields are reviewed). Refund policy
// v2.0 went live with __GRIEVANCE_OFFICER_NAME__ on studojo.com because
// nothing checked for this.
import { readFileSync } from "node:fs";

const problems = [];

const legal = readFileSync("app/lib/legal.ts", "utf8");
legal.split("\n").forEach((line, i) => {
  // Every use of TO_FILL other than its own definition is an unfilled field.
  if (/\bTO_FILL\b/.test(line) && !/export const TO_FILL\b/.test(line) && !/=== TO_FILL/.test(line) && !line.trim().startsWith("//")) {
    problems.push(`app/lib/legal.ts:${i + 1}  ${line.trim()}`);
  }
});

for (const file of ["app/routes/privacy.tsx", "app/routes/terms.tsx", "app/routes/refund-policy.tsx", "app/routes/contact.tsx"]) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (/__[A-Z][A-Z_]{2,}__|\[to be confirmed\]/i.test(line)) problems.push(`${file}:${i + 1}  ${line.trim().slice(0, 120)}`);
    });
}

if (problems.length) {
  console.error(`✗ ${problems.length} unfilled legal field(s). Fill them in app/lib/legal.ts before merging to main:\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("✓ legal pages: 0 unfilled fields");
