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

// Signed-in students on the B2C homepage go to /b2cnew with a full page load, never the router.
const index = readFileSync(new URL("../routes/_index.tsx", import.meta.url), "utf8");
assert.match(index, /if \(isB2cRequest\(request\)\) \{\n\s+if \(session\) throw redirectDocument\(/);

// The B2C components link into /b2cnew with a plain <a href> (commit 93ba6dd), and name no old product.
const dir = new URL("../components/home-b2c/", import.meta.url);
for (const f of readdirSync(dir)) {
  if (!/\.tsx?$/.test(f)) continue;
  const src = readFileSync(new URL(f, dir), "utf8");
  assert.doesNotMatch(src, /<Link[^>]*(to=\{(stu|STU_|stuHref)|to="\/b2cnew)/, `${f}: /b2cnew is another app, use <a href>`);
  assert.doesNotMatch(src, /["'`]\/(outreach|dojos|resume-maker|resumes|cc|internships|assignments|my-applications|onboarding)\b/, `${f}: an old product route`);
}

// Stu's embed (career-agent): the real script path, the two elements, and data-base left to its default.
const embed = readFileSync(new URL("stu-embed.tsx", dir), "utf8");
const links = readFileSync(new URL("links.ts", dir), "utf8");
assert.match(links, /STU_EMBED_SRC = "\/b2cnew\/embed\/stu\.js"/);
assert.match(embed, /<stu-agent data-size="hero" data-mode="voice" data-signed-in="auto"/);
assert.match(embed, /<stu-agent data-size="dock" data-mode="voice" data-signed-in="auto"/);
assert.doesNotMatch(embed, /data-base=/, "on studojo.pro data-base defaults to /b2cnew");
// The plain link stays in the hero as the way in when the embed does not load: "Talk to Stu" to stuHref
// (/b2cnew/start signed out), rendered as an <a href>.
const hero = readFileSync(new URL("HeroB2C.tsx", dir), "utf8");
const home = readFileSync(new URL("HomeB2C.tsx", dir), "utf8");
assert.match(hero, /<a\s+href=\{primary\.href\}/);
assert.match(home, /primary=\{\{ label: "Talk to Stu", href: stu \}\}/);
assert.match(home, /const stu = stuHref\(!!session\)/);

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
