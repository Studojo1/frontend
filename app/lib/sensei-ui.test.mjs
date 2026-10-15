// The new Sensei look is on for the test hosts only.
//
// Production must keep the original look until someone lists it on purpose, and
// each app file (the workspace bob.tsx, the team dashboard dashboard.tsx) must
// stay safe to promote on its own: it draws the original look unless a route
// hands it ui="new".
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NEW_UI_HOSTS, isSenseiAppHost, senseiHostKind, senseiUi } from "./sensei-ui.ts";

// The two test hosts get the new look, with or without a port, in any case.
for (const host of ["app.studojo.pro", "APP.Studojo.pro", "app.studojo.pro:443", "dashboard.studojo.pro", "Dashboard.Studojo.pro:3000"]) {
  assert.equal(senseiUi(host), "new", `host ${host}`);
}

// Production keeps the original look.
assert.equal(senseiUi("app.studojo.com"), "old");
assert.equal(senseiUi("dashboard.studojo.com"), "old");
assert.deepEqual([...NEW_UI_HOSTS], ["app.studojo.pro", "dashboard.studojo.pro"], "listing production is a decision for the owner: update this test with it");

// Everything else too: the marketing sites, the admin panel, a look-alike host, nothing at all.
for (const host of ["studojo.com", "studojo.pro", "admin.studojo.pro", "app.studojo.pro.evil.example", "xapp.studojo.pro", "dashboard.studojo.pro.evil.example", "", null, undefined]) {
  assert.equal(senseiUi(host), "old", `host ${host}`);
}

assert.equal(senseiHostKind("app.studojo.com"), "workspace");
assert.equal(senseiHostKind("app.studojo.pro:3000"), "workspace");
assert.equal(senseiHostKind("dashboard.studojo.com"), "dashboard");
assert.equal(senseiHostKind("Dashboard.studojo.pro"), "dashboard");
for (const host of ["studojo.pro", "admin.studojo.pro", "", null, undefined]) assert.equal(senseiHostKind(host), null, `host ${host}`);
assert.equal(isSenseiAppHost("app.studojo.com"), true);
assert.equal(isSenseiAppHost("dashboard.studojo.pro"), false);
assert.equal(isSenseiAppHost(null), false);

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
// ok() rather than match(): a failure should name the rule, not print a 4,000-line file.
const has = (text, re, why) => assert.ok(re.test(text), why);

// What an app file actually draws, rendered the way the server renders it.
const { createElement } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const draw = (component, props) => renderToStaticMarkup(createElement(component, props));

// These files read import.meta.env as they load, which only exists under Vite. Load a copy with
// that one expression stubbed, from node_modules/.cache so its package imports still resolve
// and nothing else (git, lint, the router's file scan) ever sees it.
async function load(source, name) {
  const cache = fileURLToPath(new URL("../../node_modules/.cache/", import.meta.url));
  mkdirSync(cache, { recursive: true });
  const dir = mkdtempSync(join(cache, "sensei-ui-test-"));
  try {
    // Outside the project's tsconfig the JSX compiles to React.createElement, so React is imported for it.
    writeFileSync(join(dir, name), 'import React from "react";\n' + source.replaceAll("import.meta.env", "({})"));
    return await import(pathToFileURL(join(dir, name)).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// The rules of a stylesheet that are not inside the .sx scope.
function strayRules(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@(font-face|keyframes)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "")
    .replace(/@(media|container)[^{]*\{/g, "")
    .split("}")
    .map((rule) => rule.split("{")[0].trim())
    .filter(Boolean)
    .flatMap((selectors) => selectors.split(/,(?![^(]*\))/).map((x) => x.trim()))
    // The one allowed exception: the skip link in app/root.tsx sits outside the wrapper, and
    // body:has(> .sx) still limits the rule to pages in the new look.
    .filter((selector) => !selector.startsWith(".sx") && !selector.startsWith("body:has(> .sx) > "));
}

const shared = {};
for (const app of [
  { file: "bob.tsx", named: "SenseiApp", darkRule: /dark \? \(ui === "new" \? "sx-dark" : "bob-dark"\) : ""/ },
  { file: "dashboard.tsx", named: "DashboardApp", darkRule: null },
]) {
  const source = read(`../routes/${app.file}`);
  const at = (why) => `${app.file}: ${why}`;

  // Safe to promote alone: it pulls in nothing of ours, by any kind of import.
  for (const re of [/from\s+["'](~|\.)[^"']*["']/, /import\s*\(\s*["'](~|\.)/, /import\s+["'](~|\.)/]) {
    assert.ok(!re.test(source), at("must stay self-contained: no imports from this codebase"));
  }

  const mod = await load(source, app.file);
  const Route = mod.default;
  const App = mod[app.named];
  assert.equal(typeof App, "function", at(`must export ${app.named} for the routes that choose a look`));
  const original = draw(Route);
  // The route on its own, and anything that is not exactly ui="new", is the original look:
  // no scope for the new stylesheet, and no stylesheet.
  assert.ok(!original.includes('class="sx"') && !original.includes("<style"), at("the route alone must draw the original look"));
  for (const ui of [undefined, "old", "NEW", "anything", ""]) {
    assert.equal(draw(App, { ui }), original, at(`ui=${JSON.stringify(ui)} must draw the original look`));
  }
  // ui="new" is the same screen inside the scope, with the stylesheet, and every rule stays inside it.
  const fresh = draw(App, { ui: "new" });
  assert.ok(fresh.startsWith('<div class="sx"') && fresh.includes("<style>"), at('ui="new" must wrap the screen in the new look'));
  assert.ok(fresh.endsWith(original + "</div>"), at("the new look must wrap the very same screen"));
  const css = fresh.slice(fresh.indexOf("<style>") + 7, fresh.indexOf("</style>"));
  assert.deepEqual(strayRules(css), [], at("every rule of the new look must sit inside .sx"));

  // The palette and general restyling are one block, copied into both files.
  const block = css.match(/\/\* sx:shared:start[^*]*\*\/([\s\S]*?)\/\* sx:shared:end \*\//);
  assert.ok(block && block[1].includes("--acc:"), at("the stylesheet must carry the shared block between its sx:shared markers"));
  shared[app.file] = block[1];

  // The pieces a render cannot show: the look everything inside falls back to, and the dark class per look.
  has(source, /createContext<Ui>\("old"\)/, at("parts of the app must assume the original look unless told otherwise"));
  has(source, /const look: Ui = ui === "new" \? "new" : "old"/, at("anything but ui=\"new\" must mean the original look"));
  if (app.darkRule) has(source, app.darkRule, at("each look must keep its own dark mode class"));
}
assert.equal(shared["bob.tsx"], shared["dashboard.tsx"], "the shared part of the new look must be identical in bob.tsx and dashboard.tsx (edit it once, write it into both)");

// The home page takes the look from the host and nowhere else; every other page says "old".
const home = read("../routes/_index.tsx");
has(home, /senseiUi: senseiUi\(request\.headers\.get\("host"\)\)/, "the home route must take the look from the host list");
assert.equal((home.match(/senseiUi: "new"/g) || []).length, 0, "the home route must never hard-code the new look");
has(home, /<BobPage ui=\{ui\} \/>/, "the home route must pass the host's look to the workspace");
has(home, /<DashboardPage ui=\{ui\} \/>/, "the home route must pass the host's look to the dashboard");
// The routes must import the named components: a default export cannot take the look.
const oldui = read("../routes/oldui.tsx");
for (const [name, text] of [["_index.tsx", home], ["oldui.tsx", oldui]]) {
  has(text, /lazy\(\(\) => import\("\.\/bob"\)\.then\(\(m\) => \(\{ default: m\.SenseiApp \}\)\)\)/, `${name} must import SenseiApp by name`);
  has(text, /lazy\(\(\) => import\("\.\/dashboard"\)\.then\(\(m\) => \(\{ default: m\.DashboardApp \}\)\)\)/, `${name} must import DashboardApp by name`);
}
has(oldui, /<BobPage ui="old" \/>/, "/oldui must always ask for the workspace's original look");
has(oldui, /<DashboardPage ui="old" \/>/, "/oldui must always ask for the dashboard's original look");
assert.equal((oldui.match(/ui="new"/g) || []).length, 0, "/oldui must never ask for the new look");
has(oldui, /senseiHostKind\(request\.headers\.get\("host"\)\)/, "/oldui must exist on the Sensei hosts only");

console.log("sensei-ui: ok");
