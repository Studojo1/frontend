// CRAWL POLICY (4 Nov 2026, the owner: "ban crawlers from the website except reports and blogs"): studojo.com's
// robots.txt read the way Google reads it (one group per crawler, else *; the longest matching rule wins, Allow on a
// tie; * and $ in paths), the noindex header on the real page handler (HEAD), and the sitemap naming only pages that
// may be indexed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CRAWL_NOINDEX, indexablePath, robotsTxt } from "./crawl-policy.ts";

const { default: handleRequest } = await import("../entry.server.tsx");
const { loader: robots } = await import("../routes/robots.txt.tsx");

// ── 1. The pages search engines may index.
for (const p of ["/", "/blog", "/blog/", "/blog/how-to-email-a-hiring-manager", "/reports", "/reports/ghost-jobs-2026", "/terms", "/privacy", "/refund-policy", "/terms/", "/tools/emailer", "/tools/emailer/"])
  assert.equal(indexablePath(p), true, p);
for (const p of ["/about", "/contact", "/sensei", "/mesa", "/go/li-dm", "/time-machine", "/auth", "/settings", "/asha/my-project", "/blogger", "/reportsx", "/terms-old", "/api/journey", "/tools", "/tools/emailer/s/abc123", "/tools/emailerx"])
  assert.equal(indexablePath(p), false, p);

// ── 2. robots.txt, as a crawler reads it.
function parse(txt) {
  const groups = [];
  let cur = null;
  let inAgents = false;
  for (const raw of txt.split("\n")) {
    const line = raw.replace(/#.*/, "").trim();
    const m = /^([A-Za-z-]+):\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, key, value] = m;
    if (key.toLowerCase() === "user-agent") {
      if (!inAgents) groups.push((cur = { agents: [], rules: [] }));
      cur.agents.push(value.toLowerCase());
      inAgents = true;
    } else if (/^(allow|disallow)$/i.test(key)) {
      cur.rules.push({ allow: key.toLowerCase() === "allow", path: value });
      inAgents = false;
    } else inAgents = false;
  }
  return groups;
}
function matches(pattern, path) {
  const end = pattern.endsWith("$");
  const body = (end ? pattern.slice(0, -1) : pattern).split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
  return new RegExp(`^${body}${end ? "$" : ""}`).test(path);
}
function allowed(txt, bot, path) {
  const groups = parse(txt);
  const token = bot.toLowerCase();
  const rules = (groups.filter((g) => g.agents.includes(token)).length ? groups.filter((g) => g.agents.includes(token)) : groups.filter((g) => g.agents.includes("*"))).flatMap((g) => g.rules);
  let best = null;
  for (const r of rules) {
    if (!r.path || !matches(r.path, path)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return best ? best.allow : true;
}

const res = await robots({ request: new Request("https://studojo.com/robots.txt", { headers: { host: "studojo.com" } }) });
const txt = await res.text();
assert.equal(txt, robotsTxt("https://studojo.com"));
assert.equal(res.headers.get("x-robots-tag"), null);
assert.match(txt, /\nSitemap: https:\/\/studojo\.com\/sitemap\.xml\n$/);

const SEARCH_OPEN = [
  "/", "/?fbclid=abc&utm_source=facebook", "/blog", "/blog/how-to-email-a-hiring-manager", "/reports", "/reports/ghost-jobs-2026",
  "/terms", "/privacy", "/refund-policy", "/assets/root-B1x2.js", "/assets/root-B1x2.css", "/og-home.png", "/logos/acme.svg",
  "/fonts/inter.woff2", "/favicon.ico", "/api/blog-og/how-to-email-a-hiring-manager", "/api/images/blog-images/a.png",
  "/sitemap.xml", "/llms.txt", "/tools/emailer", "/tools/emailer?utm_source=x&tab=grade",
];
const SEARCH_SHUT = ["/about", "/contact", "/sensei", "/mesa", "/go/li-dm", "/time-machine", "/auth", "/settings", "/api/journey", "/api/images/private/x", "/asha/my-project", "/apidocs", "/tools/emailer/s/abc123", "/tools/emailerx"];
for (const bot of ["Googlebot", "Bingbot", "Applebot", "DuckDuckBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Claude-SearchBot"]) {
  for (const p of SEARCH_OPEN) assert.equal(allowed(txt, bot, p), true, `${bot} ${p}`);
  for (const p of SEARCH_SHUT) assert.equal(allowed(txt, bot, p), false, `${bot} ${p}`);
}
// AI training crawlers and SEO scrapers: nothing, not even the reports.
for (const bot of ["GPTBot", "CCBot", "Bytespider", "PetalBot", "AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "ClaudeBot", "Google-Extended", "meta-externalagent", "Amazonbot", "DataForSeoBot"])
  for (const p of ["/", "/blog/how-to-email-a-hiring-manager", "/reports/ghost-jobs-2026", "/about", "/assets/root-B1x2.js"]) assert.equal(allowed(txt, bot, p), false, `${bot} ${p}`);
// Link previews: any page a person shares, a /go short link too.
for (const bot of ["facebookexternalhit", "LinkedInBot", "Twitterbot", "WhatsApp", "Slackbot", "TelegramBot"])
  for (const p of ["/", "/go/li-dm", "/about", "/reports/ghost-jobs-2026", "/og-home.png", "/tools/emailer/s/abc123"]) assert.equal(allowed(txt, bot, p), true, `${bot} ${p}`);

// ── 3. The header on the real page handler: noindex outside the indexable pages, on studojo.com only.
const head = (host, path) => handleRequest(new Request(`https://${host}${path}`, { method: "HEAD", headers: { host } }), 200, new Headers(), {}, {});
for (const p of ["/", "/blog/how-to-email-a-hiring-manager", "/reports/ghost-jobs-2026", "/terms", "/privacy", "/refund-policy"])
  assert.equal((await head("studojo.com", p)).headers.get("x-robots-tag"), null, p);
for (const p of ["/about", "/contact", "/sensei", "/asha/my-project", "/time-machine"])
  assert.equal((await head("studojo.com", p)).headers.get("x-robots-tag"), CRAWL_NOINDEX, p);
assert.equal((await head("studojo.pro", "/")).headers.get("x-robots-tag"), "noindex, nofollow", "staging keeps its own rule");
assert.equal((await head("studojo.pro", "/about")).headers.get("x-robots-tag"), "noindex, nofollow");
assert.equal((await head("studojo.com", "/about")).headers.get("x-frame-options"), "SAMEORIGIN", "the other headers as before");

// ── 4. The sitemap names only pages that may be indexed.
const sitemap = readFileSync(new URL("../routes/sitemap.xml.tsx", import.meta.url), "utf8");
const locs = [...sitemap.matchAll(/loc: "([^"]+)"/g)].map((m) => m[1]);
assert.ok(locs.length > 50);
for (const loc of locs) assert.equal(indexablePath(loc), true, `sitemap ${loc}`);

console.log("crawl-policy: ok");
