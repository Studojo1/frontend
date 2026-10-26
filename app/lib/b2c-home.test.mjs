// HOMEPAGE: studojo.pro (and localhost) get the B2C homepage, header and footer; studojo.com never does, even
// with a forged Host header, because the deployment's own address (BETTER_AUTH_URL) must agree.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { b2cHomeHost, deploymentAllowsB2c } from "./b2c-home.ts";

const STAGING = "https://studojo.pro";
const PROD = "https://studojo.com";

for (const h of ["studojo.pro", "STUDOJO.PRO", "studojo.pro:443", "studojo.pro.", "www.studojo.pro", "localhost", "localhost:5173", "127.0.0.1:3000"]) {
  assert.equal(b2cHomeHost(h, STAGING), true, h);
  assert.equal(b2cHomeHost(h, undefined), true, `${h} (no deployment url: local runs and tests)`);
}
// Sensei, the admin panel, production and look-alikes keep what they have.
for (const h of ["studojo.com", "www.studojo.com", "app.studojo.pro", "dashboard.studojo.pro", "admin.studojo.pro", "app.studojo.com", "studojo.pro.evil.com", "evilstudojo.pro", "studojo.prod", "", null, undefined]) {
  assert.equal(b2cHomeHost(h, STAGING), false, String(h));
}
// Production never shows it, whatever Host a request claims.
for (const h of ["studojo.pro", "localhost", "127.0.0.1"]) assert.equal(b2cHomeHost(h, PROD), false, `${h} on production`);
assert.equal(deploymentAllowsB2c(PROD), false);
assert.equal(deploymentAllowsB2c("http://localhost:3000"), true);
assert.equal(deploymentAllowsB2c("not a url"), false);

// Everyone on a B2C host sees the homepage, signed in or not: no redirect and no old /onboarding check
// (the explainer, 27 Oct: the owner reviews it signed in). The B2C branch reads the session only to return
// signedIn, so the first paint is right, and a failed read is "signed out".
const index = readFileSync(new URL("../routes/_index.tsx", import.meta.url), "utf8");
const b2cBranch = index.slice(index.indexOf("if (isB2cRequest(request)) {"), index.indexOf("\n  }\n", index.indexOf("if (isB2cRequest(request)) {")));
assert.match(b2cBranch, /const signedIn = !!\(await getSessionFromRequest\(request\)\.catch\(\(\) => null\)\);/);
assert.match(b2cBranch, /return \{ bobApp: false, dashboardApp: false, b2cHome: true, signedIn,/);
assert.doesNotMatch(b2cBranch, /redirect|requireOnboardingComplete/, "no redirect and no /onboarding check on a B2C host");
assert.ok(index.indexOf("isB2cRequest(request)") < index.indexOf("requireOnboardingComplete("), "B2C branch before the old /onboarding check");
// Signed in, the header offers "my jobs" (a plain <a> to /b2cnew) and keeps /settings (account deletion) reachable.
const header = readFileSync(new URL("../components/home-b2c/HeaderB2C.tsx", import.meta.url), "utf8");
assert.match(header, /<a\s[^>]*href=\{STU_HOME\}/);
assert.match(header, /to=\{SETTINGS\}/);

// "start the call" (signed out): /b2cnew/join with the visit's whole landing query, each key once, then
// via=home&how=voice. Every way in goes through /b2cnew/join (owner rule). Signed in: "open my jobs" to /b2cnew.
const { startHref, startCta } = await import("../components/home-b2c/links.ts");
assert.equal(startHref(""), "/b2cnew/join?via=home&how=voice");
assert.equal(startHref(undefined), "/b2cnew/join?via=home&how=voice");
assert.equal(
  startHref("?utm_source=meta&utm_medium=paid&utm_campaign=oct&fbclid=abc&gclid=g1&ref=x"),
  "/b2cnew/join?utm_source=meta&utm_medium=paid&utm_campaign=oct&fbclid=abc&gclid=g1&ref=x&via=home&how=voice",
);
assert.equal(startHref("?via=ad&how=type&utm_source=a&utm_source=b"), "/b2cnew/join?utm_source=a&via=home&how=voice", "no key twice");
assert.equal(startHref("utm_term=a%20b&x=%26"), "/b2cnew/join?utm_term=a+b&x=%26&via=home&how=voice", "values stay encoded");
assert.deepEqual(startCta(false, "?gclid=1"), { label: "start the call", href: "/b2cnew/join?gclid=1&via=home&how=voice" });
assert.deepEqual(startCta(true, "?gclid=1"), { label: "open my jobs", href: "/b2cnew" }, "signed in: never /join again");

// The B2C components link into /b2cnew with a plain <a href> (commit 93ba6dd), and name no old product.
const dir = new URL("../components/home-b2c/", import.meta.url);
for (const f of readdirSync(dir)) {
  if (!/\.tsx?$/.test(f)) continue;
  const src = readFileSync(new URL(f, dir), "utf8");
  assert.doesNotMatch(src, /<Link[^>]*(to=\{(stu|STU_|stuHref)|to="\/b2cnew)/, `${f}: /b2cnew is another app, use <a href>`);
  assert.doesNotMatch(src, /["'`]\/(outreach|dojos|resume-maker|resumes|cc|internships|assignments|my-applications|onboarding)\b/, `${f}: an old product route`);
  // Every way in goes through /b2cnew/join (owner rule, 27 Oct): nothing links the typed set-up.
  assert.doesNotMatch(src, /\/b2cnew\/start|STU_START/, `${f}: links /b2cnew/start`);
}

// Stu's embed (career-agent): the real script path, the two elements, and data-base left to its default. Both take
// data-mode="join", straight into /b2cnew/join. Only the hero element holds a fallback (light DOM, shown until the
// element is defined); the dock holds none.
const embed = readFileSync(new URL("stu-embed.tsx", dir), "utf8");
const links = readFileSync(new URL("links.ts", dir), "utf8");
assert.match(links, /STU_EMBED_SRC = "\/b2cnew\/embed\/stu\.js"/);
assert.match(embed, /<stu-agent data-size="hero" data-mode="join" data-signed-in="auto"[^>]*>\s*\{children\}\s*<\/stu-agent>/);
assert.match(embed, /<stu-agent data-size="dock" data-mode="join" data-signed-in="auto" \/>/);
assert.doesNotMatch(embed, /data-base=/, "on studojo.pro data-base defaults to /b2cnew");
// The plain button stays as the way in either way: one StartButton component, a plain <a href>, in the hero, the
// floating start (side pill or phone bar) and the footer only; no per-section and no header buttons (owner, 27 Oct).
const cta = readFileSync(new URL("cta.tsx", dir), "utf8");
assert.match(cta, /<a href=\{href\}[^>]*data-start=\{place\}/);
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const uses = readFileSync(new URL(f, dir), "utf8").match(/<StartButton\b[^>]*place="(\w+)"/g) ?? [];
  for (const u of uses) assert.match(u, /place="(hero|side|bar|footer)"/, `${f}: ${u}`);
}
const home = readFileSync(new URL("HomeB2C.tsx", dir), "utf8");
const ORDER = ["HeroB2C", "WhatB2C", "CallB2C", "BriefB2C", "MatchesB2C", "GetJobB2C", "MoreB2C", "ProofB2C", "ExpectB2C", "FaqB2C", "BlogReports", "FooterB2C", "StickyCta"];
const order = ORDER.map((t) => home.indexOf(`<${t} />`));
assert.ok(order.every((i, k) => i > 0 && (k === 0 || i > order[k - 1])), `in order: ${ORDER.join(", ")}`);
// Each story section is its own component with its id (h-sections.html), and none carries a start button.
const IDS = { WhatB2C: "what", CallB2C: "call", BriefB2C: "brief", MatchesB2C: "matches", GetJobB2C: "getjob", MoreB2C: "more", ProofB2C: "proof", ExpectB2C: "expect", FaqB2C: "faq", BlogReports: "read" };
for (const [c, id] of Object.entries(IDS)) {
  const src = readFileSync(new URL(`${c}.tsx`, dir), "utf8");
  assert.match(src, new RegExp(`<section className="sjb-sec" id="${id}"`), `${c} is #${id}`);
  assert.doesNotMatch(src, /StartButton|data-start/, `${c}: no per-section button`);
}
// The B2C look is scoped: every rule of b2c.css sits under .sjb, so studojo.com never changes.
const css = readFileSync(new URL("b2c.css", dir), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
for (const rule of css.match(/(^|[{}])\s*([^{}@]+)\{/g) ?? []) {
  const sel = rule.replace(/^[{}]?\s*/, "").replace(/\{$/, "").trim();
  if (!sel || /^(from|to|\d+%)/.test(sel) || sel === "@font-face") continue;
  for (const part of sel.split(",")) assert.match(part.trim(), /^\.sjb[\s.:#[]|^\.sjb$/, `b2c.css: unscoped selector "${part.trim()}"`);
}

// Stu's events reach PostHog and the pixel with known names and known fields only, never free text.
const { stuEventProps } = await import("../components/home-b2c/stu-events.ts");
assert.deepEqual(stuEventProps({ event: "stu_open", mode: "voice", size: "dock", signed_in: false }), {
  event: "stu_open",
  props: { surface: "home_b2c", mode: "voice", size: "dock", signed_in: false },
});
assert.deepEqual(stuEventProps({ event: "stu_qa", topic: "is_it_free", turn: 2, question: "my phone is 98..." })?.props, {
  surface: "home_b2c",
  topic: "is_it_free",
  turn: 2,
});
assert.equal(stuEventProps({ event: "stu_signup_start", via: "voice" })?.props.via, "voice");
assert.equal(stuEventProps({ event: "stu_mode_choice", choice: "I want a job in Pune" })?.props.choice, undefined, "free text is dropped");
for (const bad of [null, undefined, "stu_open", {}, { event: "Purchase" }, { event: "stu_unknown" }]) {
  assert.equal(stuEventProps(bad), null, JSON.stringify(bad));
}

console.log("b2c-home: ok");
