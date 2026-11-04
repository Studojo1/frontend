// PRODUCT_ORIGIN (RELAUNCH, 2 Nov 2026): the homepage and every "join" or "start" link go to the product's own host,
// and /b2cnew and /b2cnew/* answer 301 to the same path and query there (app/lib/product-origin.ts, routes/b2cnew.tsx).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { PRODUCT_LEGACY_BASE, mainOriginFrom, productHref, productOriginFrom, productOriginScript, productRedirect } from "./product-origin.ts";

const APP = new URL("../", import.meta.url).pathname;
const PROD = "https://platform.studojo.com";
const STAGING = "https://platform.studojo.pro";

// ── 1. The rules.
assert.equal(productOriginFrom(PROD), PROD);
assert.equal(productOriginFrom(" https://platform.studojo.pro/ "), STAGING);
assert.equal(productOriginFrom("platform.studojo.com"), PROD, "a bare host means https");
for (const bad of [undefined, null, "", "http://platform.studojo.com", "https://platform.studojo.com/b2cnew", "javascript:alert(1)", "*"]) {
  assert.equal(productOriginFrom(bad), "", String(bad));
}
assert.equal(productHref("/join?via=home", PROD), `${PROD}/join?via=home`);
assert.equal(productHref("/", PROD), `${PROD}/`);
assert.equal(productHref("start?x=1", STAGING), `${STAGING}/start?x=1`);
assert.equal(productHref("/join?via=home", ""), "/b2cnew/join?via=home", "no origin: under /b2cnew as before");
assert.equal(productHref("/", ""), "/b2cnew");
assert.equal(PRODUCT_LEGACY_BASE, "/b2cnew");

assert.equal(productRedirect("https://studojo.com/b2cnew", STAGING), `${STAGING}/`);
assert.equal(productRedirect("https://studojo.com/b2cnew/", STAGING), `${STAGING}/`);
assert.equal(productRedirect("https://studojo.com/b2cnew/x", STAGING), `${STAGING}/x`);
assert.equal(productRedirect("https://studojo.com/b2cnew/join?via=ad&utm_source=ig", PROD), `${PROD}/join?via=ad&utm_source=ig`, "path and query kept");
assert.equal(productRedirect("https://studojo.com/b2cnew/a/b/c?x=%20y", PROD), `${PROD}/a/b/c?x=%20y`);
assert.equal(productRedirect("https://studojo.com/b2cnewx", PROD), null);
assert.equal(productRedirect("https://studojo.com/blog", PROD), null);
assert.equal(productRedirect("https://studojo.com/b2cnew/x", ""), null, "no origin, no redirect");
// QA-FIX (2 Nov 2026): the main site, for this app's pages on the product's host. MAIN_ORIGIN wins; else the product's
// origin without "platform."; else "" (links stay paths).
assert.equal(mainOriginFrom(undefined, PROD), "https://studojo.com");
assert.equal(mainOriginFrom("", STAGING), "https://studojo.pro");
assert.equal(mainOriginFrom("https://www.studojo.com", PROD), "https://www.studojo.com");
assert.equal(mainOriginFrom("javascript:alert(1)", STAGING), "https://studojo.pro", "a bad MAIN_ORIGIN is ignored");
assert.equal(mainOriginFrom(undefined, ""), "");
assert.equal(mainOriginFrom(undefined, "https://app.studojo.com"), "", "only a platform. host is derived");
assert.equal(productOriginScript(PROD), `window.__STU_PRODUCT_ORIGIN__="${PROD}";`);
assert.equal(productOriginScript("</script><script>x"), `window.__STU_PRODUCT_ORIGIN__="";`, "only an origin ever lands in the page");

// ── 2. The handoff route: 301 with path and query; 404 with no origin.
{
  const saved = process.env.PRODUCT_ORIGIN;
  process.env.PRODUCT_ORIGIN = STAGING;
  const { loader, action } = await import("../routes/b2cnew.tsx");
  for (const fn of [loader, action]) {
    const res = fn({ request: new Request("https://studojo.pro/b2cnew/x?y=1") });
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("Location"), `${STAGING}/x?y=1`);
  }
  assert.equal(loader({ request: new Request("https://studojo.pro/b2cnew") }).headers.get("Location"), `${STAGING}/`);
  delete process.env.PRODUCT_ORIGIN;
  assert.throws(() => loader({ request: new Request("https://studojo.pro/b2cnew/x") }), (r) => r instanceof Response && r.status === 404);
  if (saved !== undefined) process.env.PRODUCT_ORIGIN = saved;
}
const routes = readFileSync(APP + "routes.ts", "utf8");
assert.match(routes, /route\("b2cnew", "routes\/b2cnew\.tsx", \{ id: "product-handoff" \}\)/);
assert.match(routes, /route\("b2cnew\/\*", "routes\/b2cnew\.tsx", \{ id: "product-handoff-all" \}\)/);
assert.match(routes, /"\*\*\/b2cnew\.tsx",/, "flatRoutes leaves the module to these two routes");

// ── 3. The links, as a server with PRODUCT_ORIGIN draws them (a fresh process: the link constants are read once).
const out = execFileSync(
  "npx",
  [
    "tsx",
    "-e",
    `(async () => {
     const l = await import(${JSON.stringify(APP + "components/home-b2c/links.ts")});
     const s = await import(${JSON.stringify(APP + "components/site-b2c/site-links.ts")});
     const b = await import(${JSON.stringify(APP + "components/site-b2c/blog/blog-b2c.ts")});
     const a3 = await import(${JSON.stringify(APP + "components/home-v3/agent.ts")});
     const a2 = await import(${JSON.stringify(APP + "components/home-v2/agent.ts")});
     console.log(JSON.stringify({
       home: l.STU_HOME, join: l.STU_JOIN, start: l.startHref("?utm_source=ig"), ctaIn: l.startCta(true, "").href,
       ctaOut: l.startCta(false, "?gclid=1").href, signIn: l.SIGN_IN,
       siteHome: s.STU_HOME, siteStart: s.siteStartHref("?fbclid=f", null), blogJob: b.BLOG_JOB_LINK,
       v3Join: a3.joinHref("?utm_source=x"), v3Desk: a3.DESK, v3SignIn: a3.homeSignIn("?utm_source=x"), v2Join: a2.joinHref(""),
     }));
     })();`,
  ],
  { cwd: new URL("../../", import.meta.url).pathname, encoding: "utf8", env: { ...process.env, PRODUCT_ORIGIN: STAGING } },
);
const got = JSON.parse(out.trim().split("\n").pop());
assert.deepEqual(got, {
  home: `${STAGING}/`,
  join: `${STAGING}/join`,
  start: `${STAGING}/join?utm_source=ig&via=home&how=voice`,
  ctaIn: `${STAGING}/`,
  ctaOut: `${STAGING}/join?gclid=1&via=home&how=voice`,
  signIn: "/auth?mode=signin&redirect=%2Fb2cnew",
  siteHome: `${STAGING}/`,
  siteStart: `${STAGING}/join?fbclid=f&via=site&how=voice`,
  blogJob: `${STAGING}/join?via=blog&how=voice`,
  v3Join: `${STAGING}/join?utm_source=x&via=home&how=voice`,
  v3Desk: `${STAGING}/`,
  // Sign-in returns to a path on this host (sign-in follows same-origin returns only); /b2cnew then answers 301.
  v3SignIn: "/auth?redirect=%2Fb2cnew%2Fstart%3Ffresh%26utm_source%3Dx%26via%3Dhome%26how%3Dvoice&utm_source=x&via=home&how=voice",
  v2Join: `${STAGING}/join?via=home&how=voice`,
});

// ── 4. The pages: every report CTA goes to the product host; no page links /b2cnew any more; the root hands the
// origin to the browser before any module runs.
let ctas = 0;
for (const f of readdirSync(APP + "routes").filter((x) => /^reports(\..+)?\.tsx$/.test(x))) {
  const src = readFileSync(APP + "routes/" + f, "utf8");
  assert.doesNotMatch(src, /(to|href)=\{?["'`]\/b2cnew/, f);
  ctas += (src.match(/to=\{productHref\("\/(join|start)\?/g) ?? []).length;
  // CTA-NEW (4 Nov 2026): the report CTAs are the shared Stu card, whose button is siteStartHref (STU_JOIN, the product host)
  ctas += (src.match(/<StuCta\b/g) ?? []).length;
}
assert.ok(ctas >= 150, `report CTAs on the product host: ${ctas}`);
assert.match(readFileSync(APP + "components/site-b2c/site-links.ts", "utf8"), /export const STU_JOIN = productHref\("\/join"\);/);
assert.match(readFileSync(APP + "components/site-b2c/StuCta.tsx", "utf8"), /useSiteStart\(\)/);
const root = readFileSync(APP + "root.tsx", "utf8");
assert.match(root, /<meta name="viewport" content="width=device-width, initial-scale=1" \/>\n\s+\{\/\*[^*]*\*\/\}\n\s+<script dangerouslySetInnerHTML=\{\{ __html: productOriginScript\(productOrigin\(\)\) \}\} \/>/);

console.log(`product-origin: links on the product host, /b2cnew 301s there, ${ctas} report CTAs`);
