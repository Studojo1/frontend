// HOMEPAGE, RELAUNCH (2 Nov 2026): studojo.com, www.studojo.com and studojo.pro (and localhost) get the new homepage,
// header and footer, and so do the product's platform hosts (only their sign-in pages reach this app). The Sensei
// hosts (app., dashboard.) and the admin panel keep what they have.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { b2cHomeHost, deploymentAllowsB2c, homeV3On } from "./b2c-home.ts";

const STAGING = "https://studojo.pro";
const PROD = "https://studojo.com";

const B2C = [
  "studojo.com", "STUDOJO.COM", "studojo.com:443", "studojo.com.", "www.studojo.com",
  "studojo.pro", "STUDOJO.PRO", "studojo.pro:443", "studojo.pro.", "www.studojo.pro",
  "platform.studojo.com", "platform.studojo.pro",
  "localhost", "localhost:5173", "127.0.0.1:3000",
];
for (const h of B2C) {
  for (const dep of [STAGING, PROD, undefined]) assert.equal(b2cHomeHost(h, dep), true, `${h} on ${dep}`);
}
// Sensei, the admin panel and look-alikes keep what they have, on every deployment.
for (const h of ["app.studojo.pro", "dashboard.studojo.pro", "admin.studojo.pro", "app.studojo.com", "dashboard.studojo.com", "admin.studojo.com", "sensei.studojo.com", "studojo.pro.evil.com", "evilstudojo.pro", "studojo.com.evil.com", "studojo.prod", "", null, undefined]) {
  for (const dep of [STAGING, PROD, undefined]) assert.equal(b2cHomeHost(h, dep), false, `${h} on ${dep}`);
}
// A deployment for some other address never draws it.
assert.equal(deploymentAllowsB2c(PROD), true);
assert.equal(deploymentAllowsB2c(STAGING), true);
assert.equal(deploymentAllowsB2c("http://localhost:3000"), true);
assert.equal(deploymentAllowsB2c("https://example.com"), false);
assert.equal(deploymentAllowsB2c("not a url"), false);
assert.equal(b2cHomeHost("studojo.com", "https://example.com"), false);

// HOME_V3: on unless "0" (studojo.com's deploy never sets it, so it gets V3 like studojo.pro).
for (const v of [undefined, "", "1", "true", " 1 "]) assert.equal(homeV3On(v), true, String(v));
assert.equal(homeV3On("0"), false);
assert.equal(homeV3On(" 0 "), false);

// Everyone off the Sensei hosts sees the new homepage, signed in or not: no redirect and no old /onboarding check,
// and no old homepage left to fall back to. The loader reads the session only to return signedIn, so the first
// paint is right, and a failed read is "signed out".
const index = readFileSync(new URL("../routes/_index.tsx", import.meta.url), "utf8");
const loaderSrc = index.slice(index.indexOf("export async function loader"), index.indexOf("export function meta"));
assert.match(loaderSrc, /const signedIn = !!\(await getSessionFromRequest\(request\)\.catch\(\(\) => null\)\);/);
assert.match(loaderSrc, /return \{ bobApp: false, dashboardApp: false, b2cHome: true, signedIn, homeV3: homeV3On\(process\.env\.HOME_V3\),/);
const indexCode = index.replace(/^\s*\/\/.*$/gm, "");
assert.doesNotMatch(indexCode, /redirect\(|requireOnboardingComplete|"\/onboarding|"\/outreach/, "no redirect, no /onboarding, no old product");
assert.doesNotMatch(index, /from "~\/components";/, "the old homepage's sections are gone");
// Signed in, the header offers "my jobs" (a plain <a> to /b2cnew) and keeps /settings (account deletion) reachable.
const header = readFileSync(new URL("../components/home-b2c/HeaderB2C.tsx", import.meta.url), "utf8");
assert.match(header, /<a\s[^>]*href=\{STU_HOME\}/);
assert.match(header, /to=\{SETTINGS\}/);

// "start the call" (signed out): /b2cnew/join with the visit's whole landing query, each key once, then
// via=home&how=voice. Every way in goes through /b2cnew/join (owner rule). Signed in: "Open my jobs" to /b2cnew.
const { startHref, startCta } = await import("../components/home-b2c/links.ts");
assert.equal(startHref(""), "/b2cnew/join?via=home&how=voice");
assert.equal(startHref(undefined), "/b2cnew/join?via=home&how=voice");
assert.equal(
  startHref("?utm_source=meta&utm_medium=paid&utm_campaign=oct&fbclid=abc&gclid=g1&ref=x"),
  "/b2cnew/join?utm_source=meta&utm_medium=paid&utm_campaign=oct&fbclid=abc&gclid=g1&ref=x&via=home&how=voice",
);
assert.equal(startHref("?via=ad&how=type&utm_source=a&utm_source=b"), "/b2cnew/join?utm_source=a&via=home&how=voice", "no key twice");
assert.equal(startHref("utm_term=a%20b&x=%26"), "/b2cnew/join?utm_term=a+b&x=%26&via=home&how=voice", "values stay encoded");
assert.deepEqual(startCta(false, "?gclid=1"), { label: "Start the call", href: "/b2cnew/join?gclid=1&via=home&how=voice" });
assert.deepEqual(startCta(true, "?gclid=1"), { label: "Open my jobs", href: "/b2cnew" }, "signed in: never /join again");

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

// The homepage loads no career-agent embed (owner, 27 Oct): no <stu-agent> element and no /b2cnew/embed script;
// stu-embed.tsx stays in the tree, unused, so it is a one-line switch later.
for (const f of readdirSync(dir)) {
  if (!/\.tsx?$/.test(f) || f === "stu-embed.tsx" || f === "stu-events.ts") continue;
  const src = readFileSync(new URL(f, dir), "utf8").replace(/export const STU_EMBED_SRC = "[^"]*";/, "");
  assert.doesNotMatch(src, /from "\.\/stu-embed"|<stu-agent|loadStuEmbed|\/b2cnew\/embed\/|STU_EMBED_SRC\b(?! =)/, `${f}: loads Stu's embed`);
}
// The plain button stays the way in on the B2C header and footer of the other pages: one StartButton component, a
// plain <a href>, only in the places it was made for; no per-section and no header buttons (owner, 27 Oct).
const cta = readFileSync(new URL("cta.tsx", dir), "utf8");
assert.match(cta, /<a href=\{href\}[^>]*data-start=\{place\}/);
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const uses = readFileSync(new URL(f, dir), "utf8").match(/<StartButton\b[^>]*place="(\w+)"/g) ?? [];
  for (const u of uses) assert.match(u, /place="(hero|side|bar|footer)"/, `${f}: ${u}`);
}
// The homepage itself is HOMEPAGE V2 (components/home-v2, app/lib/home-v2.test.mjs); the neo-brutalist homepage
// components (HomeB2C, HeroB2C, WhyB2C, HowB2C, GetB2C, ProofB2C, FaqB2C, StickyCta) are gone.
for (const gone of ["HomeB2C", "HeroB2C", "WhyB2C", "HowB2C", "GetB2C", "ProofB2C", "FaqB2C", "StickyCta"]) {
  assert.ok(!readdirSync(dir).includes(`${gone}.tsx`), `${gone}.tsx is the old homepage`);
}
// Purple only on the start buttons (owner, 27 Oct): the one purple token is used by .nb-btn rules alone.
const nbCss = readFileSync(new URL("b2c.css", dir), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
for (const rule of nbCss.match(/[^{}]+\{[^{}]*var\(--sjb-cta[^)]*\)[^{}]*\}/g) ?? []) {
  assert.match(rule.trim(), /\.nb-btn/, `purple outside a start button: ${rule.trim().slice(0, 80)}`);
}
assert.doesNotMatch(nbCss, /gradient\(|blur\(/, "no gradients or blur");
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
