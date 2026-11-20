// The Growth Fellowship page's shell and script, without a database: every tab gets the right shell, the
// page's strict CSP holds (no inline styles or scripts), message pages carry nothing of the fellow, and the
// script calls every change the API takes, with nothing about other fellows and no partnership line.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const { fellowPageHtml, FELLOW_TABS, FELLOW_SUBPAGES, isFellowSubpage, ASSET_VERSION, PAGE_HEADERS, PAGE_DATA_HEADERS } = await import("./fellow-page-html.server.ts");

const SLUG = "asha-k3m9x2qa";
const pages = ["today", ...FELLOW_SUBPAGES];
assert.deepEqual(FELLOW_TABS.map((t) => t.id), ["today", "post", "talk", "numbers", "you"], "five tabs, in order");
assert.deepEqual([...FELLOW_SUBPAGES].sort(), ["learn", "numbers", "post", "talk", "you"]);
for (const bad of ["", "today", "admin", "post/x", "POST", undefined]) assert.equal(isFellowSubpage(bad), false, `${bad} is not a tab address`);

for (const page of pages) {
  const html = fellowPageHtml("ok", page, SLUG);
  assert.match(html, new RegExp(`<body data-page="${page}" class="has-tabs">`), `${page}: the script knows which page to draw`);
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
  assert.ok(html.includes(`/fellowship/fellow.js?v=${ASSET_VERSION}`) && html.includes(`/fellowship/fellow.css?v=${ASSET_VERSION}`), `${page}: versioned assets`);
  assert.ok(!html.includes("feed.js") && !html.includes("tour.js"), `${page}: the old page's files are gone`);
  // The CSP is script-src 'self' and style-src 'self': nothing inline.
  assert.ok(!/<script(?![^>]*\bsrc=)/.test(html), `${page}: no inline script`);
  assert.ok(!/<style|\sstyle="/.test(html), `${page}: no inline style`);
  assert.ok(!/https?:\/\//.test(html), `${page}: nothing from another site`);
  // Studojo's logo, not a letter mark.
  assert.match(html, /<img class="mark" src="\/logo\.png" alt="Studojo"/);
  assert.ok(!/class="mark"[^>]*>S</.test(html), `${page}: no "S" mark`);
  // Both navs (top on desktop, bottom on phones) link every tab under this fellow's address.
  for (const t of FELLOW_TABS) {
    const href = t.path ? `/fellowship-growth/${SLUG}/${t.path}` : `/fellowship-growth/${SLUG}`;
    assert.equal(html.split(`href="${href}"`).length - 1, t.id === "today" ? 3 : t.id === "you" ? 3 : 2, `${page}: ${t.id} linked from both navs`);
  }
  const current = [...html.matchAll(/<a class="tab" href="([^"]+)" aria-current="page">/g)].map((m) => m[1]);
  const want = page === "today" ? `/fellowship-growth/${SLUG}` : `/fellowship-growth/${SLUG}/${page === "learn" ? "you" : page}`;
  assert.deepEqual(current, [want, want], `${page}: the right tab is current`);
}

for (const state of ["missing", "error"]) {
  const html = fellowPageHtml(state, "post", SLUG);
  assert.match(html, /<body data-page="message" class="no-tabs">/);
  assert.ok(!html.includes(SLUG) && !html.includes("<script"), `${state}: no fellow, no script`);
  assert.ok(!/\sstyle="/.test(html));
}
assert.match(fellowPageHtml("missing"), /This link isn't working/);
assert.match(fellowPageHtml("error"), /We couldn't load your page/);
assert.match(fellowPageHtml("ok", "today", ""), /This link isn't working/, "no slug, no page");

assert.equal(PAGE_HEADERS["Cache-Control"], "no-store");
assert.equal(PAGE_HEADERS["Referrer-Policy"], "no-referrer");
assert.match(PAGE_HEADERS["X-Robots-Tag"], /noindex/);
assert.match(PAGE_HEADERS["Content-Security-Policy"], /style-src 'self';/);
assert.match(PAGE_HEADERS["Content-Security-Policy"], /frame-ancestors 'none'/);
assert.equal(PAGE_DATA_HEADERS["Content-Type"], undefined);

// ---------------------------------------------------------------- the script and styles
const js = readFileSync(new URL("../../public/fellowship/fellow.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../../public/fellowship/fellow.css", import.meta.url), "utf8");
// Every change the API takes (applyFellowChange), and the photo, stock and analytics addresses.
for (const intent of ["copied", "line", "posted", "rewrite", "rewrite-withdraw", "photo-help", "stock-use", "numbers", "connections", "story", "story-name", "coach"]) {
  assert.ok(js.includes(`intent: "${intent}"`), `fellow.js sends ${intent}`);
}
assert.ok(js.includes("/proof?post=") && js.includes("&kind=photo") && js.includes('method: "DELETE"'), "photos are added and removed");
assert.ok(js.includes("/stock?post=") && js.includes("/analytics`"), "stock photos and the analytics file");
assert.ok(js.includes('"Content-Type": "image/jpeg"') && js.includes('"Content-Type": XLSX'), "uploads use types a plain form can't send");
assert.ok(js.includes('r.lang = "en-IN"'), "speech to text in Indian English");
assert.ok(js.includes('"fellowNewLook:v1:" + SLUG'), "the new look note is remembered per fellow");
// The page's strict CSP: nothing the script draws carries an inline style.
assert.ok(!/\sstyle="/.test(js), "fellow.js draws no inline styles");
// Fellows see only themselves; Studojo posts carry no partnership line, and fellows tag @Studojo.
assert.ok(!/cohort(Size|Posted|Position|Feed|Rank)|leaderboard|other fellows/i.test(js), "nothing about other fellows");
assert.ok(!/In partnership|collaborator/i.test(js), "no partnership line, never 'collaborator'");
assert.ok(js.includes("Tag @Studojo"), "Studojo posts say to tag @Studojo");
// Only this site and LinkedIn: the composer link, and the fellow's own post links.
const hosts = new Set([...js.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1].toLowerCase()));
for (const h of hosts) assert.ok(/(^|\.)linkedin\.com$/.test(h) || h.endsWith("entrepreneur.com"), `fellow.js only names LinkedIn (and its sources), not ${h}`);
for (const f of [js, css]) assert.ok(!/[\u2013\u2014]/.test(f), "no em or en dashes in the page's copy");
// The analytics guide's screenshots and the logo are served from this site.
for (const img of ["export-1-impressions.png", "export-2-range.png", "export-3-export.png", "export-4-confirm.png"]) {
  assert.ok(js.includes(`/fellowship/guide/${img}`), `${img} is shown`);
  assert.ok(existsSync(new URL(`../../public/fellowship/guide/${img}`, import.meta.url)), `${img} exists`);
}
assert.ok(existsSync(new URL("../../public/logo.png", import.meta.url)));

console.log("fellow-page-html: ok");
