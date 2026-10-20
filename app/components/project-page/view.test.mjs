// The launched project page's render model (pageView) on the contract's fixture
// row and on hostile blocks: every block type, the checks in contract 3.2, the
// formats in 3.1, the limits in 3, and charts drawn to scale.
// Run: npx tsx app/components/project-page/view.test.mjs
// Fixture: __fixtures__/pages-fixture.json, a copy of career-agent's
// docs/b2c8/pages-fixture.json (its numbers are placeholders).
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { blocksOf, fmt, fmtDate, fmtSize, fmtTick, kindLabel, pageView, PROVIDERS, richOf, safeEmbed, safeHref, themeVars } from "./view.ts";
import { layoutBars, layoutLines, layoutPie, niceScale } from "./chart-scale.ts";
import { isPageHandle, isPageSlug, RESERVED } from "../../lib/project-pages.ts";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Block } from "./blocks.tsx";

const here = new URL(".", import.meta.url).pathname;
const FIXTURE = JSON.parse(readFileSync(`${here}__fixtures__/pages-fixture.json`, "utf8"));
const clone = (o) => JSON.parse(JSON.stringify(o));
const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);

let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};

/** One block through the checks: its model, or null when skipped. */
const one = (block) => blocksOf([{ id: "blk123", ...block }])[0] ?? null;
const P = (spans) => [{ kind: "p", spans }];

// ---------------------------------------------------------------- the fixture row
const page = pageView(FIXTURE);
const byId = Object.fromEntries(page.blocks.map((b) => [b.id, b]));

test("fixture: the row becomes a page", () => {
  assert.ok(page);
  assert.equal(page.id, 42);
  assert.equal(page.path, "/ananya/blinkit-vs-instamart");
  assert.equal(page.title, "Blinkit versus Instamart: what one order earns");
  assert.ok(page.summary.startsWith("I rebuilt order value"));
  assert.equal(page.launched, "20 Oct 2026");
  assert.equal(page.noindex, true);
  assert.equal(page.version, 2);
  assert.deepEqual(page.student, { name: "Ananya Kulkarni", initial: "A", about: "BTech, MIT World Peace University, Pune", profileHref: "/profile/ananya" });
  assert.equal(page.kind, "Side project");
  assert.deepEqual(page.skills, ["Excel", "Financial modelling", "Market research"]);
  assert.equal(page.company, "");
  assert.equal(page.cover, null);
  assert.equal(page.reportHref, "/b2cnew/report/42");
  assert.equal(page.viewHref, "/b2cnew/api/public/launches/42/view");
  // Nothing that would identify the student's account reaches the browser.
  assert.ok(!JSON.stringify(page).includes("user_id"));
});

test("fixture: every block type renders to a model", () => {
  const types = new Set(page.blocks.map((b) => b.type));
  for (const t of ["heading", "text", "image", "table", "chart", "metrics", "model", "quote", "callout", "timeline", "file", "embed", "web", "divider"]) assert.ok(types.has(t), t);
  assert.equal(FIXTURE.blocks.length, 22);
  assert.equal(page.blocks.length, 20);
  assert.deepEqual(
    page.blocks.filter((b) => b.type === "chart").map((b) => b.kind),
    ["bar", "line", "pie"],
  );
});

test("fixture: the three bad blocks are dropped or plain", () => {
  assert.equal(byId.xx1a2b3c, undefined, "an unknown block type is skipped");
  assert.equal(byId.bad1a2b3, undefined, "an embed on a host off the list is skipped");
  const bad = byId.bad2a2b3;
  assert.equal(bad.type, "text");
  const spans = bad.rich[0].spans;
  assert.deepEqual(
    spans.map((s) => [s.t, s.href]),
    [
      ["This link must render as plain text: ", null],
      ["click me", null],
      [" and this one too: ", null],
      ["data", null],
    ],
  );
  assert.ok(!JSON.stringify(page).includes("javascript:"));
  assert.ok(!JSON.stringify(page).includes("data:text"));
  assert.ok(!JSON.stringify(page).includes("evil.example"));
});

test("fixture: blocks keep their content", () => {
  assert.deepEqual(byId.h1a1b2c3, { id: "h1a1b2c3", type: "heading", level: 1, text: "What one quick commerce order earns" });
  const t = byId.tx1a2b3c.rich;
  assert.equal(t[0].spans[1].b, true);
  assert.equal(t[1].kind, "ul");
  assert.equal(t[1].items[0][1].href, "https://www.eternal.com/investor-relations/");
  assert.deepEqual(byId.mt1a2b3c.items[0], { label: "Average order value", value: "₹665", note: "Placeholder figure for the fixture" });
  assert.deepEqual(byId.tb1a2b3c.columns, ["Quarter", "Blinkit AOV", "Instamart AOV", "Blinkit margin", "Instamart margin"]);
  assert.deepEqual(byId.tb1a2b3c.align, ["left", "right", "right", "right", "right"]);
  assert.deepEqual(byId.tb1a2b3c.rows[0].map((c) => c.text), ["Q1", "635", "534", "3.8%", "-5.6%"]);
  assert.equal(byId.ch1a2b3c.source, "From the table above: Order value and margin by quarter (placeholders)");
  assert.equal(byId.ch2a2b3c.source, "");
  assert.deepEqual(byId.ch1a2b3c.series[0].shown, ["₹635", "₹660", "₹665", "₹669"]);
  assert.deepEqual(byId.ch2a2b3c.series[1].shown, ["-5.6%", "-4.6%", "-5.5%", "-6.2%"]);
  const model = byId.md1a2b3c;
  assert.deepEqual(model.rows.map((r) => [r.label, ...r.cells, r.bold]), [
    ["Order value", "₹669", "₹100", true],
    ["Commission and ads", "₹128", "₹19.1", false],
    ["Delivery cost", "-₹58", "-₹8.7", false],
    ["Dark store cost", "-₹67", "-₹10", false],
    ["Contribution", "₹3", "₹0.4", true],
  ]);
  assert.deepEqual(byId.qt1a2b3c, { id: "qt1a2b3c", type: "quote", text: "The fastest store is not the cheapest one to run.", by: "My note after the third letter" });
  assert.equal(byId.co1a2b3c.tone, "result");
  assert.equal(byId.co1a2b3c.label, "Result");
  assert.equal(byId.tx2a2b3c.rich[0].kind, "ol");
  assert.equal(byId.tl1a2b3c.items.length, 2);
  assert.deepEqual(byId.fl1a2b3c, { id: "fl1a2b3c", type: "file", href: "/b2cnew/media/0123456789abcdef0123", name: "Blinkit vs Instamart, full report.pdf", kind: "pdf", size: "471 KB" });
  assert.equal(byId.em1a2b3c.providerName, "Google Sheets");
  assert.equal(byId.em1a2b3c.src, "https://docs.google.com/spreadsheets/d/e/2PACX-fixture/pubhtml?widget=true");
  assert.equal(byId.em2a2b3c.aspect, "16:9");
  assert.deepEqual(byId.im1a2b3c, { id: "im1a2b3c", type: "image", src: "/b2cnew/media/abcdef0123456789abcd", alt: "A chart of order value by quarter drawn by hand", caption: "My first sketch of the numbers", width: 1200, height: 800 });
  assert.deepEqual(byId.wb1a2b3c, { id: "wb1a2b3c", type: "web", src: "/b2cnew/sites/42/2/index.html", title: "Try the order calculator", height: 520 });
  assert.deepEqual(byId.dv1a2b3c, { id: "dv1a2b3c", type: "divider" });
});

test("fixture: theme and fonts become CSS variables", () => {
  assert.equal(page.vars["--pp-accent"], "#c0321b");
  assert.ok(page.vars["--pp-head"].startsWith("'Clash Display'"));
  assert.ok(page.vars["--pp-body"].startsWith("'Satoshi'"));
  for (const k of ["--pp-bg", "--pp-surface", "--pp-ink", "--pp-muted", "--pp-line", "--pp-accent", "--pp-accent-soft", "--pp-s1", "--pp-s4"]) assert.ok(page.vars[k], k);
});

// ---------------------------------------------------------------- rendered markup
test("render: every fixture block draws, links and frames as the contract says", () => {
  const html = page.blocks.map((b) => renderToStaticMarkup(h(Block, { b }))).join("\n");
  assert.ok(!html.includes("javascript:") && !html.includes("data:text") && !html.includes("evil.example"));
  assert.ok(!html.includes(EM) && !html.includes(EN));
  // Links: new tab, no ranking, https or a media path only.
  const links = html.match(/<a [^>]*>/g) ?? [];
  assert.equal(links.length, 2, "the Eternal link and the PDF");
  for (const a of links) {
    assert.match(a, / rel="nofollow ugc noopener"/);
    assert.match(a, / target="_blank"/);
    assert.match(a, / href="(https:\/\/|\/b2cnew\/media\/)/);
  }
  // "click me" and "data" are plain text.
  assert.match(html, /<p>This link must render as plain text: click me and this one too: data<\/p>/);
  const frames = html.match(/<iframe [^>]*>/g) ?? [];
  assert.equal(frames.length, 3);
  const [sheet, video, web] = frames;
  for (const f of [sheet, video]) {
    assert.match(f, / title="[^"]+"/);
    assert.match(f, / loading="lazy"/);
    assert.match(f, / referrerPolicy="no-referrer"/i);
    assert.match(f, / allow="fullscreen"/);
    assert.match(f, / sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"/);
  }
  assert.match(sheet, / src="https:\/\/docs\.google\.com\/spreadsheets\/d\//);
  assert.match(video, / src="https:\/\/www\.youtube-nocookie\.com\/embed\//);
  assert.match(web, / src="\/b2cnew\/sites\/42\/2\/index\.html"/);
  assert.match(web, / sandbox="allow-scripts allow-forms"/);
  assert.match(web, / referrerPolicy="no-referrer"/i);
  assert.match(web, / title="Try the order calculator"/);
  assert.ok(!/allow-same-origin|allow-top-navigation|allow-popups|allow-modals/.test(web), "a web build gets scripts and forms for its own JavaScript, nothing more");
  assert.match(html, /<img [^>]*src="\/b2cnew\/media\/abcdef0123456789abcd"/);
  // Charts are drawn: bars, a line path and donut slices, with the numbers in a table for screen readers.
  assert.equal((html.match(/<rect /g) ?? []).length, 16, "8 bars, drawn for a phone and for wide screens");
  assert.ok((html.match(/<path /g) ?? []).length >= 4 + 5);
  assert.ok(html.includes('<table class="sr-only">'));
  // Headings sit under the page title's h1.
  assert.match(html, /<h2[^>]*>What one quick commerce order earns<\/h2>/);
  assert.match(html, /<h3[^>]*>What I would change<\/h3>/);
});

// ---------------------------------------------------------------- the row
test("row: a bad address, id or title is no page", () => {
  for (const patch of [{ id: 0 }, { id: "42" }, { id: 4.2 }, { handle: "dojos" }, { handle: "An" }, { handle: "123" }, { slug: "x" }, { slug: "Bad_Slug" }, { title: "" }, { title: "ab" }, { title: "x".repeat(91) }]) {
    assert.equal(pageView({ ...clone(FIXTURE), ...patch }), null, JSON.stringify(patch));
  }
  for (const junk of [null, undefined, 42, "row", [], {}, { blocks: "x" }]) assert.equal(pageView(junk), null);
});

test("row: missing or wrong optional parts fall back, never throw", () => {
  const r = clone(FIXTURE);
  r.theme = "neon";
  r.fonts = "comic";
  r.meta = { student: { name: 7, profile_slug: "../admin" }, kind: "<b>x</b>", skills: ["Excel", 4, "", "x".repeat(61)], cover: { image: "https://evil.example/x.png" } };
  r.summary = "x".repeat(281);
  r.published_on = "2026-02-30";
  r.noindex = "no";
  r.blocks = "not a list";
  const p = pageView(r);
  assert.equal(p.theme, "masala");
  assert.equal(p.fonts, "clash");
  assert.equal(p.student.name, "A Studojo student");
  assert.equal(p.student.profileHref, null);
  assert.equal(p.kind, "Project");
  assert.deepEqual(p.skills, ["Excel"]);
  assert.equal(p.cover, null);
  assert.equal(p.summary, "");
  assert.equal(p.launched, "");
  assert.equal(p.noindex, true, "anything but false keeps search engines out");
  assert.deepEqual(p.blocks, []);
  assert.equal(pageView({ ...clone(FIXTURE), noindex: false }).noindex, false);
  assert.equal(pageView({ ...clone(FIXTURE), meta: { ...FIXTURE.meta, cover: { image: "/b2cnew/media/abcdef0123456789abcd" } } }).cover, "/b2cnew/media/abcdef0123456789abcd");
});

test("row: at most 80 blocks, ids checked, repeats dropped", () => {
  const many = Array.from({ length: 90 }, (_, i) => ({ id: `dv${String(i).padStart(4, "0")}`, type: "divider" }));
  assert.equal(blocksOf(many).length, 80);
  assert.equal(blocksOf([{ id: "dup123", type: "divider" }, { id: "dup123", type: "heading", level: 2, text: "Second" }]).length, 1);
  for (const id of ["short", "UPPER123", "has-dash1", "x".repeat(17), 123456, null]) assert.equal(one({ id, type: "divider" }), null, String(id));
  const hostile = { id: "trap1234", get type() { throw new Error("boom"); } };
  assert.deepEqual(blocksOf([hostile, { id: "ok123456", type: "divider" }]).map((b) => b.id), ["ok123456"]);
});

test("kind labels", () => {
  assert.equal(kindLabel("side"), "Side project");
  assert.equal(kindLabel("college"), "College project");
  assert.equal(kindLabel("hackathon"), "Hackathon");
  assert.equal(kindLabel("case_study"), "Case study");
  assert.equal(kindLabel("<script>"), "Project");
  assert.equal(kindLabel(null), "Project");
});

// ---------------------------------------------------------------- contract 3.2
test("3.2: span links are https or a media path, else plain text", () => {
  for (const ok of ["https://example.com", "https://www.eternal.com/investor-relations/", "https://a.b/c?d=e#f", "/b2cnew/media/0123456789abcdef"]) assert.ok(safeHref(ok), ok);
  for (const bad of [
    "http://example.com",
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,hi",
    "vbscript:x",
    "//evil.example/x",
    "/profile/ananya",
    "/b2cnew/media/short",
    "/b2cnew/media/ABCDEF0123456789AB",
    "/b2cnew/media/0123456789abcdef/../x",
    "https://user:pw@example.com",
    "https://evil.example\\@good.com",
    " https://example.com",
    "https://exa mple.com",
    "https://",
    "HTTPS://example.com",
    42,
    null,
  ])
    assert.equal(safeHref(bad), null, String(bad));
  const b = one({ type: "text", rich: P([{ t: "a", href: "javascript:alert(1)" }, { t: "b", href: "https://ok.example/" }, { t: "c", href: "/b2cnew/media/0123456789abcdef" }]) });
  assert.deepEqual(b.rich[0].spans.map((s) => s.href), [null, "https://ok.example/", "/b2cnew/media/0123456789abcdef"]);
});

test("3.2: image, cover and file take a media path only", () => {
  const img = (src) => one({ type: "image", src, alt: "x", width: 10, height: 10 });
  const file = (href) => one({ type: "file", href, name: "a.pdf", kind: "pdf" });
  for (const ok of ["/b2cnew/media/0123456789abcdef", "/b2cnew/media/" + "a".repeat(40)]) {
    assert.ok(img(ok), ok);
    assert.ok(file(ok), ok);
  }
  for (const bad of ["/b2cnew/media/" + "a".repeat(15), "/b2cnew/media/" + "a".repeat(41), "https://evil.example/x.png", "/b2cnew/media/0123456789abcdef.svg", "data:image/svg+xml,<svg/>", "/b2cnew/sites/1/1/index.html", "b2cnew/media/0123456789abcdef"]) {
    assert.equal(img(bad), null, bad);
    assert.equal(file(bad), null, bad);
  }
  assert.equal(one({ type: "file", href: "/b2cnew/media/0123456789abcdef", name: "a", kind: "doc" }), null, "a file is a pdf");
});

test("3.2: a web build is a /b2cnew/sites index.html", () => {
  const web = (src, height = 520) => one({ type: "web", src, title: "Build", height });
  assert.ok(web("/b2cnew/sites/42/2/index.html"));
  for (const bad of ["/b2cnew/sites/42/2/other.html", "/b2cnew/sites/x/2/index.html", "/b2cnew/sites/42/index.html", "https://evil.example/b2cnew/sites/1/1/index.html", "/b2cnew/sites/42/2/index.html?x=1", "/b2cnew/sites/42/2/../../../admin/index.html"]) assert.equal(web(bad), null, bad);
  assert.ok(web("/b2cnew/sites/1/1/index.html", 320));
  assert.ok(web("/b2cnew/sites/1/1/index.html", 1600));
  assert.equal(web("/b2cnew/sites/1/1/index.html", 319), null);
  assert.equal(web("/b2cnew/sites/1/1/index.html", 1601), null);
  assert.equal(web("/b2cnew/sites/1/1/index.html", 500.5), null);
});

test("3.2: every embed provider's host and path start", () => {
  const good = {
    google_sheets: "https://docs.google.com/spreadsheets/d/e/2PACX-x/pubhtml?widget=true",
    google_slides: "https://docs.google.com/presentation/d/e/2PACX-x/embed",
    google_docs: "https://docs.google.com/document/d/e/2PACX-x/pub?embedded=true",
    figma: "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fx",
    notion: "https://ananya.notion.site/Blinkit-notes-123",
    loom: "https://www.loom.com/embed/abc123",
    youtube: "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ",
    canva: "https://www.canva.com/design/DAF/view?embed",
    tableau: "https://public.tableau.com/views/Book/Sheet?:embed=y",
    looker_studio: "https://lookerstudio.google.com/embed/reporting/abc/page/1",
  };
  assert.deepEqual(Object.keys(good).sort(), Object.keys(PROVIDERS).sort());
  for (const [p, src] of Object.entries(good)) {
    assert.ok(safeEmbed(p, src), `${p} ${src}`);
    const b = one({ type: "embed", provider: p, src, title: "T", aspect: "16:9" });
    assert.equal(b.type, "embed", p);
    // The wrong path start for the same provider (Notion takes any path on its own site).
    const u = new URL(src);
    if (PROVIDERS[p].path !== "/") assert.equal(safeEmbed(p, `https://${u.host}/elsewhere/x`), null, `${p} path`);
    // The right path on a host off the list.
    assert.equal(safeEmbed(p, `https://evil.example${u.pathname}${u.search}`), null, `${p} host`);
    // Plain http.
    assert.equal(safeEmbed(p, src.replace("https://", "http://")), null, `${p} http`);
  }
  // A provider must match its own row: a sheet is not a doc.
  assert.equal(safeEmbed("google_docs", good.google_sheets), null);
  assert.equal(safeEmbed("youtube", "https://www.youtube.com/embed/aqz-KE-bpKQ"), null);
  assert.equal(safeEmbed("notion", "https://notion.site/x"), null);
  assert.equal(safeEmbed("notion", "https://ananya.notion.site.evil.example/x"), null);
  assert.equal(safeEmbed("notion", "https://evilnotion.site/x"), null);
  assert.equal(safeEmbed("google_sheets", "https://user:pw@docs.google.com/spreadsheets/d/x"), null);
  assert.equal(safeEmbed("google_sheets", "https://docs.google.com:8443/spreadsheets/d/x"), null);
  assert.equal(safeEmbed("google_sheets", "https://docs.google.com/spreadsheets/d/../../evil"), null);
  assert.equal(safeEmbed("google_sheets", "https://evil.example\\@docs.google.com/spreadsheets/d/x"), null);
  assert.equal(safeEmbed("vimeo", "https://player.vimeo.com/video/1"), null);
  assert.equal(safeEmbed("youtube", "javascript:alert(1)"), null);
  assert.equal(one({ type: "embed", provider: "youtube", src: good.youtube, title: "T", aspect: "21:9" }), null);
  assert.equal(one({ type: "embed", provider: "youtube", src: good.youtube, title: "", aspect: "16:9" }), null);
});

test("3.2: text is plain: markup stays text, hidden characters and dashes go", () => {
  const b = one({ type: "text", rich: P([{ t: "<img src=x onerror=alert(1)> **bold** " }, { t: `a\u202eb${EM}c 2${EN}5` }]) });
  assert.equal(b.rich[0].spans[0].t, "<img src=x onerror=alert(1)> **bold** ");
  assert.equal(b.rich[0].spans[1].t, "ab, c 2-5");
  assert.ok(!JSON.stringify(page).includes(EM) && !JSON.stringify(page).includes(EN));
});

// ---------------------------------------------------------------- contract 3.1
test("3.1: formats", () => {
  assert.equal(fmt(12345678, "inr"), "₹1,23,45,678");
  assert.equal(fmt(123456, "inr"), "₹1,23,456");
  assert.equal(fmt(999, "inr"), "₹999");
  assert.equal(fmt(1000, "inr"), "₹1,000");
  assert.equal(fmt(-58, "inr"), "-₹58");
  assert.equal(fmt(19.1, "inr"), "₹19.1");
  assert.equal(fmt(123456, "number"), "1,23,456");
  assert.equal(fmt(1234567.891, "number"), "12,34,567.89");
  assert.equal(fmt(0.5, "number"), "0.5");
  assert.equal(fmt(12.5, "pct"), "12.5%");
  assert.equal(fmt(3, "pct"), "3.0%");
  assert.equal(fmt(-5.64, "pct"), "-5.6%");
  assert.equal(fmt(-0.04, "pct"), "0.0%");
  assert.equal(fmt(18.2, "x"), "18.2x");
  assert.equal(fmt(18, "x"), "18.0x");
  assert.equal(fmt(12345.6, "pct"), "12,345.6%");
  assert.equal(fmtTick(4, "pct", 2), "4%");
  assert.equal(fmtTick(-2.5, "pct", 0.5), "-2.5%");
  assert.equal(fmtTick(200000, "inr", 100000), "₹2,00,000");
  assert.equal(fmtDate("2026-10-20"), "20 Oct 2026");
  assert.equal(fmtDate("2026-01-05"), "5 Jan 2026");
  assert.equal(fmtDate("2026-13-01"), "");
  assert.equal(fmtDate("20 Oct 2026"), "");
  assert.equal(fmtSize(482113), "471 KB");
  assert.equal(fmtSize(512), "512 bytes");
  assert.equal(fmtSize(3 * 1024 * 1024), "3 MB");
  const chart = one({ type: "chart", kind: "bar", labels: ["a", "b"], series: [{ name: "s", values: [1234567, null] }], unit: "inr" });
  assert.deepEqual(chart.series[0].shown, ["₹12,34,567", ""], "null is a gap");
  const table = one({ type: "table", columns: ["a", "b"], rows: [[1234567, null]] });
  assert.deepEqual(table.rows[0].map((c) => c.text), ["12,34,567", ""], "null is an empty cell");
});

// ---------------------------------------------------------------- limits
const cols = (n) => Array.from({ length: n }, (_, i) => `c${i}`);
const row = (n) => Array.from({ length: n }, (_, i) => i);

test("limits: tables and models up to 12 columns and 60 rows", () => {
  assert.ok(one({ type: "table", columns: cols(12), rows: [row(12)] }));
  assert.equal(one({ type: "table", columns: cols(13), rows: [row(13)] }), null);
  assert.ok(one({ type: "table", columns: cols(2), rows: Array.from({ length: 60 }, () => row(2)) }));
  assert.equal(one({ type: "table", columns: cols(2), rows: Array.from({ length: 61 }, () => row(2)) }), null);
  assert.equal(one({ type: "table", columns: cols(2), rows: [row(3)] }), null, "a row longer than the columns");
  assert.deepEqual(one({ type: "table", columns: cols(3), rows: [row(1)] }).rows[0].map((c) => c.text), ["0", "", ""], "a short row is padded");
  assert.equal(one({ type: "table", columns: cols(2), rows: [[{}, 1]] }), null, "a cell is text, a number or null");
  assert.equal(one({ type: "table", columns: cols(2), rows: [[Infinity, 1]] }), null);
  assert.equal(one({ type: "table", columns: cols(2), rows: [row(2)], align: ["left"] }), null);
  assert.equal(one({ type: "table", columns: cols(2), rows: [row(2)], align: ["left", "center"] }), null);
  assert.deepEqual(one({ type: "table", columns: ["Name", "Pay"], rows: [["A", "₹8,000"], ["B", 9000]] }).align, ["left", "right"], "numbers line up on the right");
  const m = (n, r = 1, len = n) => one({ type: "model", columns: cols(n), rows: Array.from({ length: r }, () => ({ label: "x", values: row(len), format: "number" })) });
  assert.ok(m(12));
  assert.equal(m(13), null);
  assert.ok(m(2, 60));
  assert.equal(m(2, 61), null);
  assert.equal(m(2, 1, 3), null, "values longer than the columns");
  assert.equal(m(2, 1, 1), null, "values shorter than the columns");
  assert.equal(one({ type: "model", columns: cols(1), rows: [{ label: "x", values: [1], format: "usd" }] }), null);
});

test("limits: charts up to 24 labels and 4 series of matching length", () => {
  const ch = (labels, series, kind = "bar") => one({ type: "chart", kind, labels, series });
  const L = (n) => Array.from({ length: n }, (_, i) => `L${i}`);
  const S = (n, len) => Array.from({ length: n }, (_, i) => ({ name: `s${i}`, values: row(len).map((v) => v + 1) }));
  assert.ok(ch(L(24), S(4, 24)));
  assert.equal(ch(L(25), S(1, 25)), null);
  assert.equal(ch(L(4), S(5, 4)), null);
  assert.equal(ch(L(4), S(1, 3)), null, "series shorter than the labels");
  assert.equal(ch(L(4), S(1, 5)), null, "series longer than the labels");
  assert.equal(ch(L(4), [{ name: "s", values: [1, 2, 3, 4] }, { name: "t", values: [1, 2, 3] }]), null, "one series off");
  assert.equal(ch(L(2), [{ name: "s", values: [null, null] }]), null, "nothing to draw");
  assert.equal(ch(L(2), [{ name: "s", values: ["1", 2] }]), null);
  assert.equal(ch([], []), null);
  assert.equal(ch(L(2), S(2, 2), "pie"), null, "a pie is one series");
  assert.equal(ch(L(2), [{ name: "s", values: [-1, 2] }], "pie"), null, "a pie has no negative parts");
  assert.equal(ch(L(2), S(1, 2), "area"), null);
  assert.equal(one({ type: "chart", kind: "bar", labels: ["a"], series: [{ name: "s", values: [1] }], unit: "usd" }), null);
  assert.equal(one({ type: "chart", kind: "bar", labels: ["a"], series: [{ name: "s", values: [1] }], source: "../x" }), null);
});

test("limits: text, headings, metrics, web", () => {
  assert.ok(one({ type: "heading", level: 2, text: "x".repeat(160) }));
  assert.equal(one({ type: "heading", level: 2, text: "x".repeat(161) }), null);
  assert.equal(one({ type: "heading", level: 4, text: "x" }), null);
  assert.ok(one({ type: "text", rich: P([{ t: "x".repeat(2000) }]) }));
  assert.equal(one({ type: "text", rich: P([{ t: "x".repeat(2001) }]) }), null);
  assert.ok(richOf(Array.from({ length: 40 }, () => ({ kind: "p", spans: [{ t: "x" }] }))));
  assert.equal(richOf(Array.from({ length: 41 }, () => ({ kind: "p", spans: [{ t: "x" }] }))), null);
  assert.equal(richOf([{ kind: "h1", spans: [{ t: "x" }] }]), null);
  assert.equal(richOf([{ kind: "p", spans: [{ t: 5 }] }]), null);
  assert.equal(one({ type: "text", rich: P([{ t: "   " }]) }), null, "nothing to show");
  const metrics = (n) => one({ type: "metrics", items: Array.from({ length: n }, () => ({ label: "L", value: "1" })) });
  assert.equal(metrics(1), null);
  assert.ok(metrics(2));
  assert.ok(metrics(6));
  assert.equal(metrics(7), null);
  assert.equal(one({ type: "callout", tone: "danger", rich: P([{ t: "x" }]) }), null);
  assert.equal(one({ type: "timeline", items: [] }), null);
  assert.equal(one({ type: "quote", text: "" }), null);
});

// ---------------------------------------------------------------- charts drawn to scale
test("charts: bars start at zero and are drawn to scale", () => {
  const b = byId.ch1a2b3c;
  const L = layoutBars(b.labels, b.series, b.unit, { W: 720, H: 300, f: 12 });
  assert.equal(L.scale.min, 0);
  assert.ok(L.scale.max >= 669);
  const plotH = L.y(L.scale.min) - L.y(L.scale.max);
  for (const bar of L.bars) {
    assert.ok(Math.abs(bar.h - (bar.value / (L.scale.max - L.scale.min)) * plotH) < 1e-6, "height is value over span");
    assert.ok(Math.abs(bar.y + bar.h - L.zeroY) < 1e-6, "positive bars stand on zero");
  }
  assert.equal(L.bars.length, 8);
  assert.deepEqual(L.ticks.map((t) => t.label), L.scale.ticks.map((v) => fmtTick(v, "inr", L.scale.step)));
  // Negative bars hang from zero.
  const neg = layoutBars(["a", "b"], [{ values: [-4, 2], shown: ["-4", "2"] }], "number", { W: 340, H: 250, f: 11 });
  const [down, up] = neg.bars;
  assert.ok(Math.abs(down.y - neg.zeroY) < 1e-6);
  assert.ok(Math.abs(down.h / up.h - 2) < 1e-6);
});

test("charts: lines break at gaps and cover their values", () => {
  const b = byId.ch2a2b3c;
  const L = layoutLines(b.labels, b.series, b.unit, { W: 340, H: 250, f: 11 });
  assert.ok(L.scale.min <= -6.2 && L.scale.max >= 3.8);
  assert.ok(L.scale.ticks.includes(0));
  for (const l of L.lines) assert.equal(l.points.length, 4);
  const gap = layoutLines(["a", "b", "c", "d"], [{ values: [1, null, 3, 4], shown: ["1", "", "3", "4"] }], "number", { W: 340, H: 250, f: 11 });
  assert.equal((gap.lines[0].d.match(/M/g) ?? []).length, 2, "a null starts a new stroke");
  // Points are placed by value.
  const [p0, , p2] = gap.lines[0].points;
  assert.ok(p0.y > p2.y, "a bigger value sits higher");
});

test("charts: a percentage pie is parts of 100", () => {
  const b = byId.ch3a2b3c;
  const slices = layoutPie(b.labels, b.series[0].values, b.series[0].shown, b.unit);
  assert.deepEqual(slices.map((s) => s.label), ["Delivery", "Dark store", "Discounts", "Contribution", "Rest"]);
  assert.ok(Math.abs(slices[0].share - 0.087) < 1e-9);
  assert.equal(slices[4].text, "74.7%");
  assert.ok(Math.abs(slices.reduce((a, s) => a + s.share, 0) - 1) < 1e-9);
  const plain = layoutPie(["a", "b"], [30, 10], ["30", "10"], "number");
  assert.deepEqual(plain.map((s) => s.share), [0.75, 0.25]);
  const whole = layoutPie(["a"], [5], ["5"], "number");
  assert.equal(whole.length, 1);
  assert.ok(whole[0].d.includes("Z"));
});

test("charts: nice scales", () => {
  assert.deepEqual(niceScale(0, 669).ticks, [0, 100, 200, 300, 400, 500, 600, 700]);
  assert.deepEqual(niceScale(0, 0.9).ticks, [0, 0.2, 0.4, 0.6, 0.8, 1]);
  assert.deepEqual(niceScale(-6.2, 3.8).ticks, [-8, -6, -4, -2, 0, 2, 4]);
  assert.deepEqual(niceScale(5, 5).ticks.length > 1, true);
});

// ---------------------------------------------------------------- themes, fonts, addresses
test("themes and fonts", () => {
  for (const t of ["masala", "notebook", "night", "campus"]) {
    const v = themeVars(t, "clash");
    for (const k of ["--pp-bg", "--pp-surface", "--pp-ink", "--pp-muted", "--pp-line", "--pp-accent", "--pp-accent-soft"]) assert.match(v[k], /^#[0-9a-f]{6}$/, `${t} ${k}`);
  }
  assert.equal(themeVars("night", "clash")["--pp-accent"], "#c6f432");
  assert.equal(themeVars("notebook", "clash")["--pp-bg"], "#ffffff");
  const mono = themeVars("masala", "mono");
  assert.ok(mono["--pp-head"].startsWith("'Satoshi'"));
  assert.ok(mono["--pp-data"].startsWith("'JetBrains Mono'"));
  assert.ok(themeVars("masala", "satoshi")["--pp-head"].startsWith("'Satoshi'"));
});

test("addresses: handle and slug rules", () => {
  for (const h of ["ananya", "ana", "riya-menon", "a1b", "x".repeat(30)]) assert.ok(isPageHandle(h), h);
  for (const h of ["an", "x".repeat(31), "-ana", "ana-", "Ananya", "ana_k", "123", "999-111", "dojos", "admin", "b2cnew", "profile"]) assert.ok(!isPageHandle(h), h);
  for (const s of ["blinkit-vs-instamart", "abc", "a".repeat(60), "q1-2026"]) assert.ok(isPageSlug(s), s);
  for (const s of ["ab", "a".repeat(61), "-abc", "abc-", "Abc", "a_b_c", "a.b.c"]) assert.ok(!isPageSlug(s), s);
  assert.ok(RESERVED.has("well-known") && RESERVED.has("b2cnew") && RESERVED.size > 100);
});

console.log(`\nproject-page view: ${passed} passed`);
