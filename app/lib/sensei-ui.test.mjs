// The new Sensei look is on for the test app only.
//
// Production must keep the original look until someone lists it on purpose, and
// bob.tsx must stay safe to promote on its own: it draws the original look
// unless a route hands it ui="new".
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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

// bob.tsx stays safe to promote alone: it pulls in nothing of ours, by any kind of import.
for (const re of [/from\s+["'](~|\.)[^"']*["']/, /import\s*\(\s*["'](~|\.)/, /import\s+["'](~|\.)/]) {
  assert.ok(!re.test(bob), "bob.tsx must stay self-contained: no imports from this codebase");
}

// What the workspace actually draws, rendered the way the server renders it.
const { createElement } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
// bob.tsx reads import.meta.env as it loads, which only exists under Vite. Load a copy with
// that one expression stubbed, from node_modules/.cache so its package imports still resolve
// and nothing else (git, lint, the router's file scan) ever sees it.
const cache = fileURLToPath(new URL("../../node_modules/.cache/", import.meta.url));
mkdirSync(cache, { recursive: true });
const dir = mkdtempSync(join(cache, "sensei-ui-test-"));
let BobPage, SenseiApp;
try {
  // Outside the project's tsconfig the JSX compiles to React.createElement, so React is imported for it.
  writeFileSync(join(dir, "bob.tsx"), 'import React from "react";\n' + bob.replaceAll("import.meta.env", "({})"));
  ({ default: BobPage, SenseiApp } = await import(pathToFileURL(join(dir, "bob.tsx")).href));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
const draw = (component, props) => renderToStaticMarkup(createElement(component, props));
const original = draw(BobPage);
// The route on its own, and anything that is not exactly ui="new", is the original look:
// no scope for the new stylesheet, and no stylesheet.
assert.ok(!original.includes('class="sx"') && !original.includes("<style"), "the route alone must draw the original look");
for (const ui of [undefined, "old", "NEW", "anything", ""]) {
  assert.equal(draw(SenseiApp, { ui }), original, `ui=${JSON.stringify(ui)} must draw the original look`);
}
// ui="new" is the same screen inside the scope, with the stylesheet, and every rule stays inside it.
const fresh = draw(SenseiApp, { ui: "new" });
assert.ok(fresh.startsWith('<div class="sx"') && fresh.includes("<style>"), 'ui="new" must wrap the screen in the new look');
assert.ok(fresh.endsWith(original + "</div>"), "the new look must wrap the very same screen");
const css = fresh.slice(fresh.indexOf("<style>") + 7, fresh.indexOf("</style>"));
const stray = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@(font-face|keyframes)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "")
  .replace(/@media[^{]*\{/g, "")
  .split("}")
  .map((rule) => rule.split("{")[0].trim())
  .filter(Boolean)
  .flatMap((selectors) => selectors.split(/,(?![^(]*\))/).map((x) => x.trim()))
  .filter((selector) => !selector.startsWith(".sx"));
assert.deepEqual(stray, [], "every rule of the new look must sit inside .sx");

// The pieces a render cannot show: the look everything inside falls back to, and the dark class per look.
has(bob, /createContext<Ui>\("old"\)/, "parts of the workspace must assume the original look unless told otherwise");
has(bob, /dark \? \(ui === "new" \? "sx-dark" : "bob-dark"\) : ""/, "each look must keep its own dark mode class");

// The home page takes the look from the host and nowhere else; every other page says "old".
const home = read("../routes/_index.tsx");
has(home, /senseiUi: senseiUi\(request\.headers\.get\("host"\)\)/, "the home route must take the look from the host list");
assert.equal((home.match(/senseiUi: "new"/g) || []).length, 0, "the home route must never hard-code the new look");
has(home, /<BobPage ui=\{ui\} \/>/, "the home route must pass the host's look to the workspace");
// Both routes must import SenseiApp by name: the default export cannot take the look.
const oldui = read("../routes/oldui.tsx");
for (const [name, text] of [["_index.tsx", home], ["oldui.tsx", oldui]]) {
  has(text, /lazy\(\(\) => import\("\.\/bob"\)\.then\(\(m\) => \(\{ default: m\.SenseiApp \}\)\)\)/, `${name} must import SenseiApp by name`);
}
has(oldui, /<BobPage ui="old" \/>/, "/oldui must always ask for the original look");
has(oldui, /isSenseiAppHost\(request\.headers\.get\("host"\)\)/, "/oldui must exist on the workspace hosts only");

console.log("sensei-ui: ok");
