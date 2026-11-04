// CTA-NEW (4 Nov 2026, the owner: "on the blogs change the cta to the new product and rewrite all cta's for the new
// product"). Every blog and report CTA is the one Stu card (components/site-b2c/StuCta.tsx, stu-cta.ts) to the
// platform's /join with via=blog-<slug> or via=report-<slug>; no template, report route or llms.txt links a retired
// path or sells a retired product; the blog body migration (app/lib/blog-cta-migrate.ts) leaves no old link or claim.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const ROOT = new URL("../../", import.meta.url).pathname;
const APP = ROOT + "app/";
const read = (p) => readFileSync(ROOT + p, "utf8");

const cta = await import("../components/site-b2c/stu-cta.ts");
const blog = await import("../components/site-b2c/blog/blog-b2c.ts");
const mig = await import("./blog-cta-migrate.ts");
const { isRetiredPath } = await import("./retired-routes.ts");

// ── 1. The card's pure parts.
assert.equal(cta.stuVia("blog", "how-to-email-a-hiring-manager"), "blog-how-to-email-a-hiring-manager");
assert.equal(cta.stuVia("report", "ghost-jobs-2026"), "report-ghost-jobs-2026");
assert.equal(cta.stuVia("blog", " Odd Slug/!"), "blog-odd-slug");
assert.equal(cta.withVia("/b2cnew/join?utm_source=ig&via=site&how=voice", "report-x"), "/b2cnew/join?utm_source=ig&via=report-x&how=voice");
assert.equal(cta.withVia("/b2cnew", "report-x"), "/b2cnew", "signed in: the desk link has no query and passes through");
assert.equal(cta.stuStartFallback("blog-a", "https://platform.studojo.com/join"), "https://platform.studojo.com/join?via=blog-a&how=voice");
const card = cta.stuCtaHtml({ href: "/b2cnew/join?via=blog-a&how=voice", size: "card", title: 'A "title" <b>', line: "One line." });
assert.match(card, /^<aside class="sv-stu-cta" data-size="card" data-studojo-cta="stu"/);
assert.match(card, /href="\/b2cnew\/join\?via=blog-a&amp;how=voice" data-sv-blog-start="" data-start="blog-inline"/);
assert.match(card, /A &quot;title&quot; &lt;b&gt;/, "copy is escaped");
assert.match(card, /<span>start the call<\/span>/);
assert.match(cta.stuCtaHtml({ href: "/x" }), /data-size="quiet"[\s\S]*Stu, Studojo's career agent/);
for (const s of [cta.STU_CTA_TITLE, cta.STU_CTA_LINE, cta.STU_CTA_QUIET, cta.STU_CTA_GO, cta.STU_CTA_NOTE]) {
  assert.doesNotMatch(s, /[\u2013\u2014]/);
  for (const p of cta.RETIRED_PRODUCT_PHRASES) assert.doesNotMatch(s, p);
}

// ── 2. The post page: every CTA spot is the Stu card, every start link in the text is this post's start link.
const start = blog.blogStartHref("my-post", "?utm_source=ig&page=2");
assert.equal(start, "/b2cnew/join?utm_source=ig&via=blog-my-post&how=voice");
const page = blog.processBlogHtmlB2c(
  [
    '<p>Intro.</p><div data-studojo-cta="stu"></div>',
    '<div variant="outreach" data-studojo-cta="outreach"></div>',
    '<p>Then <a href="https://platform.studojo.com/join?via=blog-my-post&amp;how=voice" data-stu-start="">start a call with Stu</a>.</p>',
    '<p><a href="/outreach">old</a> <a href="https://studojo.com/outreach?x=1">old2</a> <a class="u" href="http://jobs.studojo.com">old3</a></p>',
    '<p><a href="/reports/ghost-jobs-2026">a report</a></p>',
  ].join(""),
  start,
);
assert.equal((page.match(/<aside class="sv-stu-cta"/g) ?? []).length, 2, "both placeholders became the card");
assert.equal((page.match(/data-sv-blog-link=""/g) ?? []).length, 4, "the start link and the three retired links point at the post's start");
assert.doesNotMatch(page, /href="[^"]*(?:\/outreach|jobs?\.studojo)/i);
assert.match(page, /<a href="\/reports\/ghost-jobs-2026">a report<\/a>/, "other links stay");
assert.match(page, />start a call with Stu<\/a>/, "the writer's words stay");

// ── 3. The migration: old links, placeholders and claims go; nothing else changes; idempotent.
const ORIGIN = "https://platform.studojo.com";
const before = [
  "<h2>Why email?</h2><p>Facts stay: 242 applications per opening (Business Insider).</p>",
  '<div variant="outreach" data-studojo-cta="outreach"></div>',
  '<p>When you know the role you want, <a href="/outreach">email the hiring manager with Studojo</a>.</p>',
  '<p>Try <a target="_blank" class="x" href="http://job.studojo.com">job.studojo.com</a> today. Also jobs.studojo.com.</p>',
  "<p>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026).</p>",
  "<p>Setup takes about 2 minutes: you upload your resume.</p><table><tr><td>Setup</td><td>About 2 minutes: upload your resume</td></tr></table>",
].join("");
const rewrites = [
  {
    slug: "my-post",
    old: '<p>When you know the role you want, <a href="/outreach">email the hiring manager with Studojo</a>.</p>',
    new: '<p>When you know the role you want, <a href="{START}" data-stu-start="">start a call with Stu</a>, Studojo\'s career agent.</p>',
  },
];
const r = mig.migratePost(before, "my-post", ORIGIN, rewrites);
assert.deepEqual(mig.retiredLeft(r.content), [], r.content);
assert.match(r.content, /^<h2>Why email\?<\/h2><p>Facts stay: 242 applications per opening \(Business Insider\)\.<\/p>/, "facts untouched");
assert.match(r.content, /<div data-studojo-cta="stu"><\/div>/);
assert.match(r.content, /<a href="https:\/\/platform\.studojo\.com\/join\?via=blog-my-post&amp;how=voice" data-stu-start="">start a call with Stu<\/a>, Studojo's career agent\./);
assert.match(r.content, /Try <a href="https:\/\/platform\.studojo\.com\/join\?via=blog-my-post&amp;how=voice" data-stu-start="">Stu, Studojo's career agent<\/a> today\./, "a bare domain link becomes words");
assert.match(r.content, /8,700\+ students have signed up to Studojo\./);
assert.match(r.content, /<p>You start with one short call with Stu\.<\/p><table><tr><td>Setup<\/td><td>One short call with Stu<\/td>/, "the old setup line");
assert.deepEqual(r.counts, { claims: 1, setup: 2, placeholders: 1, rewrites: 1, fallbackLinks: 1, fallbackText: 1 });
assert.equal(mig.migratePost(r.content, "my-post", ORIGIN, rewrites).content, r.content, "a migrated post comes back unchanged");
assert.equal(mig.migratePost("<p>Clean.</p>", "x", ORIGIN, rewrites).content, "<p>Clean.</p>");
assert.equal(mig.BACKUP_TABLE, "blog_posts_backup_20261104");
assert.equal(mig.blogStartLink("https://platform.studojo.pro/", "a-b"), "https://platform.studojo.pro/join?via=blog-a-b&amp;how=voice");

// The hand rewrites themselves: new-product copy only, one start link at most, no dashes.
const hand = JSON.parse(read("scripts/cta-new-blog-rewrites.json"));
assert.ok(hand.length > 100, `${hand.length} hand rewrites`);
for (const w of hand) {
  assert.ok(w.slug && w.old && w.new && w.new !== w.old, w.slug);
  assert.doesNotMatch(w.new, /[\u2013\u2014]/, `${w.slug}: no dashes`);
  assert.ok(w.new.split(mig.START_TOKEN).length - 1 <= 1, `${w.slug}: one start link at most`);
  assert.deepEqual(mig.retiredLeft(w.new), [], `${w.slug}: ${w.new.slice(0, 160)}`);
}

// ── 4. Templates, report routes and llms.txt: no retired link, no retired product for sale.
const noComments = (src) => src.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const reportFiles = readdirSync(APP + "routes").filter((f) => /^reports(\..+)?\.tsx$/.test(f));
assert.ok(reportFiles.length > 100, `${reportFiles.length} report routes`);
const files = [
  ...reportFiles.map((f) => `app/routes/${f}`),
  "app/routes/blog.$slug.tsx",
  "app/routes/blog._index.tsx",
  "app/components/site-b2c/blog/BlogPostB2C.tsx",
  "app/components/site-b2c/blog/BlogIndexB2C.tsx",
  "app/components/site-b2c/reports/ReportsIndexB2C.tsx",
  "app/components/site-b2c/StuCta.tsx",
  "app/components/site-b2c/SiteFooter.tsx",
  "app/components/site-b2c/SiteHeader.tsx",
  "public/llms.txt",
];
const LINK = /(?:\bto|\bhref)=\{?\s*["'`]([^"'`]+)["'`]|productHref\(\s*["'`]([^"'`]+)["'`]|https?:\/\/[^\s"'`)<>]+/g;
for (const f of files) {
  const src = f.endsWith(".txt") ? read(f) : noComments(read(f));
  for (const m of src.matchAll(LINK)) {
    const raw = m[1] ?? m[2] ?? m[0];
    for (const h of cta.RETIRED_HOSTS) assert.doesNotMatch(raw, h, `${f} links a retired host: ${raw}`);
    let path = null;
    if (raw.startsWith("/")) path = raw;
    else if (/^https?:\/\/(?:www\.)?studojo\.com(?:[/?#]|$)/i.test(raw)) path = new URL(raw).pathname;
    if (path === null || m[2] !== undefined) continue; // productHref paths are the product's own (/join, /start)
    const p = path.split(/[?#]/)[0];
    assert.equal(isRetiredPath(p), false, `${f} links a retired path: ${raw}`);
  }
  for (const p of cta.RETIRED_PRODUCT_PHRASES) {
    const hit = p.exec(src);
    assert.equal(hit, null, `${f} sells a retired product: ${hit?.[0]}`);
  }
  assert.doesNotMatch(src, /\bone-time purchase\b|Start here: \/outreach|studojo\.com\/outreach/i, f);
}

// Every report: the end card, every card counted to the report (via=report-<slug>), no start link of its own.
let cards = 0;
for (const f of reportFiles.filter((x) => x !== "reports.tsx")) {
  const slug = f.slice("reports.".length, -".tsx".length);
  const src = read(`app/routes/${f}`);
  const all = [...src.matchAll(/<StuCta\b([\s\S]*?)\/>/g)].map((m) => m[1]);
  assert.ok(all.length >= 1 && all.length <= 4, `${f}: ${all.length} Stu cards`);
  assert.ok(all.some((a) => /place="report-end"/.test(a) && !/size="quiet"/.test(a)), `${f}: the closing card`);
  for (const a of all) {
    assert.match(a, new RegExp(`via="report-${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), `${f}: via`);
    assert.doesNotMatch(a, /[\u2013\u2014\u2192]/, `${f}: no dashes or arrows in the card`);
  }
  assert.doesNotMatch(src, /productHref\(\s*["'`]\/(?:join|start)/, `${f}: a start link outside the Stu card`);
  assert.doesNotMatch(src, /Join (?:the )?(?:Student )?Community/, `${f}: one ask per block`);
  cards += all.length;
}
assert.match(read("app/components/site-b2c/StuCta.tsx"), /useSiteStart\(\)/, "the card's button is the homepage's own start");
const llms = read("public/llms.txt");
assert.match(llms, /Stu/);
assert.doesNotMatch(llms, /\/outreach|one-time purchase/i);

console.log(`cta-new: ${reportFiles.length} report routes (${cards} Stu cards), ${hand.length} blog rewrites, templates and llms.txt clean`);
