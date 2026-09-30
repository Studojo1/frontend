// PH-16 (audit 30 Sep 2026): after "Apply now" on /insider a phone user was
// left looking at the footer, 850px below the "Application received" card,
// and rage-tapped the footer's Join button. Calls the real revealResult and
// checks the page wires it to the result card.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { revealResult } from "./reveal-result.ts";

const calls = [];
const el = {
  scrollIntoView: (o) => calls.push(["scroll", o]),
  focus: (o) => calls.push(["focus", o]),
};
assert.equal(revealResult(el), true);
assert.deepEqual(calls, [
  ["scroll", { block: "start", behavior: "smooth" }],
  ["focus", { preventScroll: true }],
]);
assert.equal(revealResult(null), false);

// A browser without scrollIntoView options still scrolls.
const old = [];
const legacy = {
  scrollIntoView: (o) => { if (o) throw new TypeError("no options"); old.push("scroll"); },
  focus: () => { throw new Error("not focusable"); },
};
assert.equal(revealResult(legacy), true);
assert.deepEqual(old, ["scroll"]);

const page = readFileSync(new URL("../routes/campus-ambassador.tsx", import.meta.url), "utf8");
assert.match(page, /if \(done\) revealResult\(resultRef\.current\)/, "the page reveals the result once submitted");
assert.match(page, /ref=\{resultRef\}[\s\S]{0,200}data-testid="apply-result"/, "the ref is on the result card");

console.log("reveal-result: ok");
