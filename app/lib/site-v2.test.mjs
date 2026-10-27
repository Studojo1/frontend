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
assert.equal(HOW_IT_WORKS, "/#what");
for (const [p, kind] of [
  ["/blog", "blog"], ["/blog/", "blog"], ["/blog/some-post", "blog"], ["/reports", "reports"], ["/reports/ghost-jobs-2026", "report"],
  ["/terms", "legal"], ["/privacy", "legal"], ["/refund-policy", "legal"], ["/contact", "contact"], ["/about", "about"],
  ["/auth", "auth"], ["/auth/2fa", "auth"], ["/forgot-password", "auth"], ["/reset-password", "auth"],
  ["/profile/riya-menon", "profile"], ["/profile/x/", "profile"],
]) assert.equal(sv2PageFor(p), kind, p);
// the homepage (its own look), the retired products and the apps keep what they have
for (const p of ["/", "/outreach", "/dojos/internships", "/resume-maker", "/cc", "/webinar", "/settings", "/b2cnew", "/profile", "/profile/x/photo", "/blogger", "/reportsx"]) {
  assert.equal(sv2PageFor(p), null, p);
}

// ---------- 1a. the root: the mark and the stylesheets only on B2C hosts ----------
const root = read("root.tsx");
assert.match(root, /\n  const b2c = useSiteB2c\(\);\n  const routeError = useRouteError\(\);\n  const sv2 = b2c \? \(routeError \? "error" : sv2PageFor\(pathname\)\) : null;\n/);
assert.match(root, /<html lang="en" data-sv2=\{sv2 \?\? undefined\}>/, "no attribute at all off B2C hosts");
const links = root.slice(root.indexOf("{sv2 ? ("), root.indexOf(") : null}", root.indexOf("{sv2 ? (")));
assert.equal((links.match(/<link rel="stylesheet" href=\{sv2[A-Za-z]*Css\} \/>/g) ?? []).length, 4);
assert.equal((root.match(/sv2[A-Za-z]*Css\b/g) ?? []).length, 8, "each SITE-V2 stylesheet is imported once and linked once, inside the gate");
assert.match(root, /import sv2Css from "\.\/components\/site-b2c\/site\.css\?url";/, "linked by URL, never bundled into every page's CSS");
// The 404 case (no root loader): the server's own answer under the router, the browser's host rule on the client.
const host = read("components/site-b2c/host.tsx");
assert.match(host, /if \(data && typeof data\.b2cHost === "boolean"\) return data\.b2cHost;/);
assert.match(host, /if \(typeof window !== "undefined"\) return b2cHomeHost\(window\.location\.host, undefined\);/);
const entry = read("entry.server.tsx");
assert.match(entry, /<Sv2HostContext\.Provider value=\{isB2cRequest\(request\)\}>\n\s+<ServerRouter context=\{routerContext\} url=\{request\.url\} \/>\n\s+<\/Sv2HostContext\.Provider>/);
const { b2cHomeHost } = await import("./b2c-home.ts");
assert.equal(b2cHomeHost("studojo.com", undefined), false, "the browser rule never makes studojo.com B2C");
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
  "routes/reports.tsx": "8bc2e922915ee37f", // re-pinned 27 Oct after PR #383 (14 reports): equals staging ab28a6a
  "routes/terms.tsx": "e565ab6f9433ba94",
  "routes/privacy.tsx": "8288874388100760",
  "routes/refund-policy.tsx": "dbb5edf23c3dd454",
  "routes/contact.tsx": "fdd5914095deaa8a",
  "routes/about.tsx": "8df5740170b73da6",
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
// No report page was edited for SITE-V2 (the restyle is site-reports.css only).
for (const f of readdirSync(new URL("routes/", APP)).filter((x) => /^reports\..+\.tsx$/.test(x))) {
  assert.doesNotMatch(read(`routes/${f}`), /site-b2c|useSiteB2c|data-sv2/, `routes/${f}`);
}

// ---------- 2. the B2C header and footer, and no retired product anywhere in SITE-V2 ----------
const siteHeader = read("components/site-b2c/SiteHeader.tsx");
const siteFooter = read("components/site-b2c/SiteFooter.tsx");
const linkTargets = (src) => [...src.matchAll(/<(?:Link to|a href)=\{([A-Z_a-z]+)\}/g)].map((m) => m[1]);
assert.deepEqual([...new Set(linkTargets(siteHeader))].sort(), ["BLOG", "HOW_IT_WORKS", "REPORTS", "SETTINGS", "signIn"]);
assert.match(siteHeader, /<StartPill size="sm" place="header" \/>/, "every page: start the call in the header");
assert.match(siteHeader, /const signIn = authUrl\("signin", STU_HOME\);/);
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

console.log("site-v2: ok");
