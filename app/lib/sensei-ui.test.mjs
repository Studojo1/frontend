// The new Sensei look is on for the test app only.
//
// Production must keep the original look until someone lists it on purpose, and
// bob.tsx must stay safe to promote on its own: it draws the original look
// unless a route hands it ui="new".
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NEW_UI_HOSTS, isSenseiAppHost, senseiUi } from "./sensei-ui.ts";

// The test app gets the new look, with or without a port, in any case.
assert.equal(senseiUi("app.studojo.pro"), "new");
assert.equal(senseiUi("APP.Studojo.pro"), "new");
assert.equal(senseiUi("app.studojo.pro:443"), "new");

// Production keeps the original look.
assert.equal(senseiUi("app.studojo.com"), "old");
assert.deepEqual([...NEW_UI_HOSTS], ["app.studojo.pro"], "listing production is a decision for the owner: update this test with it");

// Everything else too: the marketing sites, the dashboard, a look-alike host, nothing at all.
for (const host of ["studojo.com", "studojo.pro", "dashboard.studojo.pro", "app.studojo.pro.evil.example", "xapp.studojo.pro", "", null, undefined]) {
  assert.equal(senseiUi(host), "old", `host ${host}`);
}

assert.equal(isSenseiAppHost("app.studojo.com"), true);
assert.equal(isSenseiAppHost("app.studojo.pro:3000"), true);
assert.equal(isSenseiAppHost("studojo.pro"), false);
assert.equal(isSenseiAppHost("dashboard.studojo.pro"), false);
assert.equal(isSenseiAppHost(null), false);

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
// ok() rather than match(): a failure should name the rule, not print a 4,000-line file.
const has = (text, re, why) => assert.ok(re.test(text), why);
const bob = read("../routes/bob.tsx");
// bob.tsx stays safe to promote alone: it imports nothing of ours, and draws the original look by default.
assert.ok(!/from\s+["'](~|\.)[^"']*["']/.test(bob), "bob.tsx must stay self-contained: no imports from this codebase");
has(bob, /const look: Ui = ui === "new" \? "new" : "old"/, "bob.tsx must default to the original look");
has(bob, /if \(look !== "new"\) return screen;/, "the original look must render exactly as before");
has(bob, /export default function BobPage\(\) \{\s*return <SenseiApp \/>;\s*\}/, "the route itself must ask for no look, so it gets the original");
// The home page hands the look over from the host; /oldui always asks for the original.
has(read("../routes/_index.tsx"), /<BobPage ui=\{ui\} \/>/, "the home route must pass the host's look to the workspace");
has(read("../routes/oldui.tsx"), /<BobPage ui="old" \/>/, "/oldui must always ask for the original look");

console.log("sensei-ui: ok");
