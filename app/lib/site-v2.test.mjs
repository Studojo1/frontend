// SITE-V2 (27 Oct 2026): studojo.pro's pages other than the homepage (blog, reports, legal, contact, about, sign-in,
// errors) wear the h1 look on B2C hosts only. These checks hold the line:
// 1. studojo.com is untouched: the root adds no data-sv2 mark and links no SITE-V2 stylesheet off B2C hosts, every
//    SITE-V2 CSS rule sits under html[data-sv2], and the classic code of every page that branches is unchanged
//    (pinned against staging 788903e after removing the gate lines).
// 2. The B2C header and footer link the job agent and the site only, and no SITE-V2 file links a retired product.
// 3. The start link keeps the ad click keys and nothing else, then via=site&how=voice.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";

const APP = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, APP), "utf8");

// ---------- 3. the start link and the page kinds (pure) ----------
const { siteStartHref, sv2PageFor, HOW_IT_WORKS } = await import("../components/site-b2c/site-links.ts");
assert.equal(siteStartHref(""), "/b2cnew/join?via=site&how=voice");
assert.equal(siteStartHref(undefined), "/b2cnew/join?via=site&how=voice");
assert.equal(
  siteStartHref("?page=2&search=x&utm_source=meta&utm_medium=paid&utm_campaign=oct&fbclid=abc&gclid=g1&via=ad&how=type"),
  "/b2cnew/join?fbclid=abc&gclid=g1&utm_source=meta&utm_medium=paid&utm_campaign=oct&via=site&how=voice",
  "ad keys only, then via=site&how=voice",
);
assert.equal(siteStartHref("?utm_source=a&utm_source=b"), "/b2cnew/join?utm_source=a&via=site&how=voice", "each key once");
assert.equal(siteStartHref("", new URLSearchParams("gclid=held1&utm_source=google")), "/b2cnew/join?gclid=held1&utm_source=google&via=site&how=voice", "held first touch when the URL has none");
assert.equal(siteStartHref("?fbclid=now", new URLSearchParams("gclid=held1")), "/b2cnew/join?fbclid=now&via=site&how=voice", "never mixes two touches");
assert.equal(HOW_IT_WORKS, "/#how");
// QA-FIX (2 Nov 2026): the anchor must exist on the homepage that is served (V3 unless HOME_V3 is "0").
assert.match(readFileSync(new URL("../components/home-v3/HowItWorks.tsx", import.meta.url), "utf8"), /id="how"/, "the homepage has #how");
for (const [p, kind] of [
  ["/blog", "blog"], ["/blog/", "blog"], ["/blog/some-post", "blog"], ["/reports", "reports"], ["/reports/ghost-jobs-2026", "report"],
  ["/terms", "legal"], ["/privacy", "legal"], ["/refund-policy", "legal"], ["/contact", "contact"], ["/about", "about"],
  ["/auth", "auth"], ["/auth/2fa", "auth"], ["/forgot-password", "auth"], ["/reset-password", "auth"],
  ["/profile/riya-menon", "profile"], ["/profile/x/", "profile"],
  // QA-FIX (2 Nov 2026): the account pages get the stylesheets for the site header (it rendered unstyled at 1440 px).
  ["/settings", "account"], ["/settings/", "account"], ["/account/delete", "account"],
]) assert.equal(sv2PageFor(p), kind, p);
{
  const { mainHref } = await import("../components/site-b2c/site-links.ts");
  assert.equal(mainHref("/blog", ""), "/blog", "on the main site a path");
  assert.equal(mainHref("/#how", "https://studojo.pro"), "https://studojo.pro/#how");
  assert.equal(mainHref("/", "https://studojo.com"), "https://studojo.com/");
  assert.equal(mainHref("contact", "https://studojo.com"), "https://studojo.com/contact");
  // On the product's host the header and footer links, the wordmark and "Forgot password?" go to the main site.
  const ui = readFileSync(new URL("../components/site-b2c/ui.tsx", import.meta.url), "utf8");
  assert.match(ui, /<SiteLink to="\/" className=\{`sv-brand/, "the wordmark");
  for (const f of ["SiteHeader.tsx", "SiteFooter.tsx"]) {
    const src = readFileSync(new URL(`../components/site-b2c/${f}`, import.meta.url), "utf8");
    assert.doesNotMatch(src, /<Link to=\{(BLOG|REPORTS|TERMS|PRIVACY|CONTACT|REFUNDS)\}|<a href=\{HOW_IT_WORKS\}/, `${f}: every page link is a SiteLink`);
  }
  const root = readFileSync(new URL("../root.tsx", import.meta.url), "utf8");
  assert.match(root, /mainOrigin: isPlatformHost\(host\) \? mainOrigin\(\) : "",/, "only the product's host gets the origin");
}
// the homepage (its own look), the retired products and the apps keep what they have
for (const p of ["/", "/outreach", "/dojos/internships", "/resume-maker", "/cc", "/webinar", "/settings/email", "/account", "/b2cnew", "/profile", "/profile/x/photo", "/blogger", "/reportsx"]) {
  assert.equal(sv2PageFor(p), null, p);
}

// ---------- 1a. the root: the mark and the stylesheets only on B2C hosts ----------
const root = read("root.tsx");
assert.match(root, /\n  const b2c = useSiteB2c\(\);\n  const routeError = useRouteError\(\);\n  const sv2 = b2c \? \(routeError \? "error" : sv2PageFor\(pathname\)\) : null;\n/);
// (CLASSIC LOOK adds data-look beside it, set only when the look switch is on: app/lib/look.test.mjs.)
assert.match(root, /<html lang="en" data-sv2=\{sv2 \?\? undefined\}( data-look=\{look \?\? undefined\})?>/, "no attribute at all off B2C hosts");
const links = root.slice(root.indexOf("{sv2 ? ("), root.indexOf(") : null}", root.indexOf("{sv2 ? (")));
assert.equal((links.match(/<link rel="stylesheet" href=\{sv2[A-Za-z]*Css\} \/>/g) ?? []).length, 4);
assert.equal((root.match(/sv2[A-Za-z]*Css\b/g) ?? []).length, 8, "each SITE-V2 stylesheet is imported once and linked once, inside the gate");
assert.match(root, /import sv2Css from "\.\/components\/site-b2c\/site\.css\?url";/, "linked by URL, never bundled into every page's CSS");
// The 404 case (no root loader): the server's own answer under the router, the browser's host rule on the client.
const host = read("components/site-b2c/host.tsx");
assert.match(host, /if \(data && typeof data\.b2cHost === "boolean"\) return data\.b2cHost;/);
assert.match(host, /if \(typeof window !== "undefined"\) return b2cHomeHost\(window\.location\.host, undefined\);/);
const entry = read("entry.server.tsx");
// (CLASSIC LOOK: the same answer held in b2c, and the look's own provider between it and the router: app/lib/look.test.mjs.)
assert.match(entry, /\n  const b2c = isB2cRequest\(request\);\n/);
assert.match(entry, /<Sv2HostContext\.Provider value=\{b2c\}>\n\s+(<LookContext\.Provider value=\{[^}]+\}>\n\s+)?<ServerRouter context=\{routerContext\} url=\{request\.url\} \/>\n\s+(<\/LookContext\.Provider>\n\s+)?<\/Sv2HostContext\.Provider>/);
const { b2cHomeHost } = await import("./b2c-home.ts");
// RELAUNCH (2 Nov 2026): studojo.com is a B2C host now; the Sensei hosts never are.
assert.equal(b2cHomeHost("studojo.com", undefined), true, "the browser rule makes studojo.com B2C");
assert.equal(b2cHomeHost("app.studojo.com", undefined), false, "never the Sensei workspace");
assert.equal(b2cHomeHost("studojo.pro", undefined), true);

// ---------- 1b. every SITE-V2 CSS rule is under html[data-sv2] ----------
const cssDir = new URL("components/site-b2c/", APP);
/** A selector list split at its top-level commas (not inside :is(), :not(), :has() or [attr]). */
function splitTop(head) {
  const parts = [];
  let depth = 0, cur = "";
  for (const ch of head) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
  }
  parts.push(cur);
  return parts;
}
const cssFiles = readdirSync(cssDir).filter((f) => f.endsWith(".css"));
assert.deepEqual(cssFiles.sort(), ["site-blog.css", "site-pages.css", "site-reports.css", "site.css"]);
for (const f of cssFiles) {
  const css = readFileSync(new URL(f, cssDir), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  // walk the blocks: @media/@supports contain rules, @font-face/@keyframes are not selectors
  let depth = 0, buf = "", n = 0;
  const stack = [];
  for (const ch of css) {
    if (ch === "{") {
      const head = buf.trim();
      buf = "";
      if (head.startsWith("@media") || head.startsWith("@supports") || head.startsWith("@container")) { stack.push("group"); continue; }
      if (head.startsWith("@font-face") || head.startsWith("@keyframes") || stack.at(-1) === "keyframes") { stack.push(head.startsWith("@keyframes") ? "keyframes" : "skip"); continue; }
      for (const sel of splitTop(head)) {
        const s = sel.trim();
        assert.match(s, /^html\[data-sv2(="[a-z]+")?\](\s|$|::?[a-z-]+|\[)/, `${f}: unscoped selector "${s}"`);
        n++;
      }
      stack.push("rule");
      depth++;
    } else if (ch === "}") {
      stack.pop();
      buf = "";
    } else buf += ch;
  }
  assert.ok(f !== "site.css" || n > 80, `${f}: ${n} rules`);
}

// ---------- 1c. the classic code of every page that branches on B2C is unchanged ----------
// Remove the SITE-V2 lines (imports from site-b2c, "// SITE-V2" comments, the hook, the early returns and the one
// B2C-only element), drop blank lines, and the rest must hash exactly as on staging 788903e.
function classicOf(src) {
  const out = [];
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const t = l.trim();
    if (/^import .* from "(~\/components\/site-b2c\/|\.\/site-b2c\/|\.\.\/site-b2c\/)[^"]*";$/.test(t)) continue;
    if (/^\/\/ SITE-V2\b/.test(t)) continue;
    if (t === "const b2c = useSiteB2c();") continue;
    if (/^\{b2c \? <[A-Za-z]+( [^>]*)? \/> : null\}$/.test(t)) continue;
    if (/^if \(b2c( && [^)]*)?\) return .*;$/.test(t)) continue;
    if (/^if \(b2c\) \{$/.test(t)) {
      const indent = l.match(/^\s*/)[0];
      while (i < lines.length && lines[i] !== `${indent}}`) i++;
      continue;
    }
    if (t === "") continue;
    out.push(l.replace(/^export function processBlogContentHtml\(/, "function processBlogContentHtml("));
  }
  return out.join("\n");
}
function cutFn(src, name) {
  const at = src.indexOf(`export function ${name}(`);
  const docAt = src.lastIndexOf("/**", at);
  const end = src.indexOf("\n}\n", at) + 3;
  return (src.slice(0, docAt) + src.slice(end)).split("\n").filter((l) => !/from "\.\.\/(home-b2c|site-b2c)\//.test(l)).join("\n");
}
const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const PINNED = {
  "routes/blog._index.tsx": "c56374e058eb2f3f",
  "routes/blog.$slug.tsx": "2a9c438fdd84f1ea",
  // re-pinned 28 Oct for the 14 batch-2 reports (REPORTS entries only); RELAUNCH 2 Nov: its two CTAs go to the
  // product host (productHref, app/lib/product-origin.ts) and nothing else changed. SEO day 7 (4 Nov): one REPORTS
  // entry for india-entry-level-jobs-internships-october-2026, nothing else changed. CTA-NEW (4 Nov): the classic
  // banner's line no longer says Stu tailors your resume (finds who's hiring and writes the email), nothing else changed
  "routes/reports.tsx": "a54c6ed24e89e619",
  "routes/terms.tsx": "e565ab6f9433ba94",
  // RELAUNCH 2 Nov: the sign-in cookie row names the stu.* cookies (app/lib/auth-cookies.ts), and a row for the
  // stu_vid, stu_src and stu_lt journey cookies (app/lib/journey.ts); nothing else changed. META-FIX 2 Nov: the
  // sj_tracking_consent row says it is also a cookie on studojo.com and its subdomains (app/lib/consent.ts), 1 year
  "routes/privacy.tsx": "77353e01b8b5d830",
  "routes/refund-policy.tsx": "dbb5edf23c3dd454",
  // SUPPORT-STU 2 Nov: contact.tsx lost the chat copy and gained the signed-in Ask Stu card (hash re-pinned).
  // QA-FIX 2 Nov: copy only (one sending promise, career agent, reset emails paused, chat bubble bottom left, About's
  // lines from the QA report); the same words on both looks
  "routes/contact.tsx": "7e4e1dad3fb5e9b7",
  "routes/about.tsx": "535174f5c08fa082",
  "components/error-page.tsx": "99b6cfefb8352b47",
  "components/blog/blog-content.tsx": "4c28dd5648ab8edd",
};
for (const [f, want] of Object.entries(PINNED)) {
  const src = read(f);
  assert.equal(sha(classicOf(src)), want, `${f}: the studojo.com code changed`);
  if (f !== "components/blog/blog-content.tsx") assert.match(src, /const b2c = useSiteB2c\(\);/, `${f}: gated by useSiteB2c`);
}
// The classic header and footer (studojo.com) are byte for byte the same; only the B2C pick changed.
assert.equal(sha(cutFn(read("components/common/header.tsx"), "Header")), "08c36b01150f1827", "the classic header changed");
assert.equal(sha(cutFn(read("components/common/footer.tsx"), "Footer")), "6acf79b6f9c8073b", "the classic footer changed");
const headerSrc = read("components/common/header.tsx");
assert.match(headerSrc, /\n  const b2c = useSiteB2c\(\);\n  if \(b2c && !landing\) return <SiteHeader \/>;\n  return <ClassicHeader landing=\{landing\} \/>;\n/);
const footerSrc = read("components/common/footer.tsx");
assert.match(footerSrc, /\n  const b2c = useSiteB2c\(\);\n  return b2c \? <SiteFooter compact=\{compact\} \/> : <ClassicFooter \/>;\n/);
// No report page was edited for SITE-V2 (the restyle is site-reports.css only). CTA-NEW (4 Nov 2026): a report may
// use the shared Stu card (components/site-b2c/StuCta.tsx, the owner's one CTA for blogs and reports), nothing else.
for (const f of readdirSync(new URL("routes/", APP)).filter((x) => /^reports\..+\.tsx$/.test(x))) {
  const src = read(`routes/${f}`).replace('import { StuCta } from "~/components/site-b2c/StuCta";', "");
  assert.doesNotMatch(src, /site-b2c|useSiteB2c|data-sv2/, `routes/${f}`);
}

// ---------- 2. the B2C header and footer, and no retired product anywhere in SITE-V2 ----------
const siteHeader = read("components/site-b2c/SiteHeader.tsx");
const siteFooter = read("components/site-b2c/SiteFooter.tsx");
// QA-FIX (2 Nov 2026): the page links are SiteLinks (main-site links, absolute on the product's host).
const linkTargets = (src) => [...src.matchAll(/<(?:Link to|SiteLink to|a href)=\{([A-Z_a-z]+)\}/g)].map((m) => m[1]);
assert.deepEqual([...new Set(linkTargets(siteHeader))].sort(), ["BLOG", "HOW_IT_WORKS", "REPORTS", "SETTINGS", "signIn"]);
assert.match(siteHeader, /<StartPill size="sm" place="header" \/>/, "every page: start the call in the header");
// Sign-in returns to a path on this host (same-origin returns only), which then 301s to the product (RELAUNCH).
assert.match(siteHeader, /const signIn = authUrl\("signin", PRODUCT_LEGACY_BASE\);/);
assert.deepEqual(linkTargets(siteFooter), ["HOW_IT_WORKS", "BLOG", "REPORTS", "TERMS", "PRIVACY", "CONTACT", "REFUNDS"]);
assert.match(siteFooter, /Stu, your career agent at Studojo\./, "the homepage footer's line (home-v2/HomeFooter.tsx)");
assert.match(siteFooter, /Studojo Labs Private Limited/);
const ui = read("components/site-b2c/ui.tsx");
assert.match(ui, /<a href=\{href\} className=\{cls\} data-start=\{place\}>/, "the start pill is a plain <a> (another app)");
assert.match(ui, /if \(signedIn\) return \{ label: "my jobs", href: STU_HOME, signedIn \};/, "signed in: never /join again");

const RETIRED = /["'`(]\/(outreach|dojos|resume-maker|resumes|cc|jrs|internships|assignments?|webinar|campus-ambassador|insider|ai-risk|pricing|start|careers|my-applications|onboarding)(?=[/?#"'`)]|$)/;
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = new URL(f, dir);
  return statSync(p).isDirectory() ? walk(new URL(`${f}/`, dir)) : [p];
});
for (const p of walk(cssDir)) {
  if (!/\.(tsx?|css)$/.test(p.pathname)) continue;
  const code = readFileSync(p, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const name = p.pathname.split("/site-b2c/")[1];
  // blog-b2c.ts rewrites old /outreach links in post HTML to the job agent; that regex is the only allowed mention
  const scan = name === "blog/blog-b2c.ts" ? code.replace(/out\.replace\(\/\(href[^\n]*\n/, "") : code;
  assert.doesNotMatch(scan, RETIRED, `${name}: links a retired product`);
  assert.doesNotMatch(scan, /\/b2cnew\/start\b/, `${name}: every way in goes through /b2cnew/join`);
  assert.doesNotMatch(scan, /<Link[^>]*to=\{?["'`]?\/b2cnew|<Link[^>]*to=\{(STU_HOME|STU_JOIN|href)\}/, `${name}: /b2cnew is another app, use <a href>`);
}
// Stu is the logo's own head, never drawn on a purple circle.
assert.match(ui, /STU_HEAD : `\/stu\/head-\$\{face\}\.png`/);
assert.doesNotMatch(read("components/site-b2c/site.css"), /\.sv-stu[^{]*\{[^}]*(border-radius:\s*50%|background:\s*#6e4b8e)/);

// QA-FIX (2 Nov 2026): the database's posts lose the retired product's counts, price and "20,000+ databases" as they render.
{
  const { fixBlogClaims, processBlogHtmlB2c, SIGNED_UP_LINE, PRICE_LINE } = await import("../components/site-b2c/blog/blog-b2c.ts");
  const old = "So far, 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed.";
  assert.equal(fixBlogClaims(`<p>${old}</p>`), `<p>${SIGNED_UP_LINE} Replies are not guaranteed.</p>`);
  assert.equal(fixBlogClaims("<p>The numbers so far: 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students&#39; own Gmail (Studojo&#39;s own records, September 2026).</p>"), `<p>${SIGNED_UP_LINE}</p>`);
  assert.equal(fixBlogClaims("<p>Studojo writes it. The people come sourced from 20,000+ databases, and it is a one-time payment, not a subscription. Try it.</p>"), "<p>Studojo writes it. Try it.</p>");
  assert.equal(fixBlogClaims("<p>Studojo sends it. It is a one-time payment, not a subscription, so there is no renewal date to race.</p>"), `<p>Studojo sends it. ${PRICE_LINE}</p>`);
  assert.equal(fixBlogClaims("<td>One-time payment, not a subscription</td>"), "<td>Free to start, then credits to email the people hiring</td>");
  assert.equal(fixBlogClaims("<p>It is a yearly subscription, not a one-time payment.</p>"), "<p>It is a yearly subscription, not a one-time payment.</p>", "a rival's own pricing stays");
  assert.equal(fixBlogClaims('<p>Use <a href="/x">Studojo</a>: setup takes about 2 minutes, the people come sourced from 20,000+ databases, and it is a one-time payment, not a subscription. Next.</p>'), '<p>Use <a href="/x">Studojo</a>. Next.</p>');
  assert.equal(fixBlogClaims("<p>It finds the team lead, with people sourced from 20,000+ databases. Good.</p>"), "<p>It finds the team lead. Good.</p>");
  assert.doesNotMatch(processBlogHtmlB2c(`<p>${old}</p>`, "/b2cnew/join"), /8,500|4,000\+|28,000\+/, "the post page runs it");
}

console.log("site-v2: ok");
