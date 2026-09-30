// PH-06 (audit 30 Sep 2026): on a paid staging order at 360px, the cookie
// notice (fixed, z-60) sat on top of the floating Launch Campaign and "Use
// these styles" buttons until it was dismissed. Floating actions are now
// lifted above it. Calls the real noticeLift and checks every fixed-bottom
// action on the app pages opts in.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { noticeLift, NOTICE_VAR } from "../components/legal/cookie-notice.tsx";

assert.equal(noticeLift(0), "0px");
assert.equal(noticeLift(88), "112px", "height + 16px edge offset + 8px gap");
assert.equal(noticeLift(87.2), "112px");

const APP = new URL("../", import.meta.url).pathname;
const css = readFileSync(APP + "app.css", "utf8");
assert.match(css, new RegExp(`\\[data-floating-cta\\]\\s*\\{\\s*margin-bottom: var\\(${NOTICE_VAR}, 0px\\);`));

const notice = readFileSync(APP + "components/legal/cookie-notice.tsx", "utf8");
assert.equal((notice.match(/ref=\{liftRef\}/g) || []).length, 2, "both the notice and the EU/UK choice lift the actions");

// Every bottom-anchored floating action in the app routes must opt in, so a
// new one cannot slide under the notice again. resume-maker's is a toast
// panel above the fold content, not a page action.
const ALLOW = new Set(["resume-maker.tsx"]);
const missing = [];
for (const f of readdirSync(APP + "routes")) {
  if (!f.endsWith(".tsx") || ALLOW.has(f)) continue;
  const src = readFileSync(APP + "routes/" + f, "utf8");
  for (const m of src.matchAll(/<div([^>]*)className="fixed (?:bottom-|inset-x-0 bottom-)/g)) {
    if (!m[1].includes("data-floating-cta")) missing.push(f);
  }
}
assert.deepEqual(missing, [], `floating actions without data-floating-cta: ${missing.join(", ")}`);

console.log("floating-cta: ok");
