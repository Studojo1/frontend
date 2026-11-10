// EMAILER (11 Nov 2026): the free job email writer at /tools/emailer. The page's pure parts (lib/emailer/contract.ts),
// its copy rules (components/emailer/copy.ts and every emailer file: no em or en dashes, never the word for people in
// school, no prices, no retired product), its links (every Stu link is the product's /join with via=emailer; no
// retired path) and the dev-only mock (never in the production path).
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const ROOT = new URL("../../../", import.meta.url).pathname;
const read = (p) => readFileSync(ROOT + p, "utf8");

const c = await import("./contract.ts");
const { COPY, FORM, GRADE, RESULT, LOCK, ERRORS, STU, STEPS, SEO, FAQ, MORE_FREE, EXAMPLE, LOCKED_FOLLOWUP, SHARE, HIGHLIGHTS, MORE_TODAY } = await import(
  "../../components/emailer/copy.ts"
);
const { isRetiredPath } = await import("../retired-routes.ts");
const { RETIRED_PRODUCT_PHRASES } = await import("../../components/site-b2c/stu-cta.ts");

// ── 1. Building the write request ────────────────────────────────────────────────────────────────────────────────
const form = () => ({ ...c.emptyWriteForm(), company: "Northwind", role: "Product analyst", name: "Sam Rivera", now: "Final year, computer science", results: ["Cut load time from 4.1s to 1.3s", "", ""] });
assert.deepEqual(c.validateWrite(form()), {});
{
  const e = c.validateWrite(c.emptyWriteForm());
  assert.deepEqual(Object.keys(e).sort(), ["company", "name", "now", "results.0", "role"]);
}
assert.ok(c.validateWrite({ ...form(), results: ["x".repeat(301), "", ""] })["results.0"], "a result over 300 characters");
assert.ok(c.validateWrite({ ...form(), jobMode: "link", jobUrl: "not a link" }).jobUrl);
assert.ok(c.validateWrite({ ...form(), jobPost: "x".repeat(8001) }).jobPost);

{
  const r = c.buildWriteRequest(form());
  assert.deepEqual(r, {
    company: "Northwind",
    role: "Product analyst",
    jobType: "job",
    you: { name: "Sam Rivera", now: "Final year, computer science", results: ["Cut load time from 4.1s to 1.3s"] },
  });
}
{
  const r = c.buildWriteRequest(
    { ...form(), company: "northwind.io", jobType: "internship", jobPost: "  We need someone who...  ", toName: "Maya Chen", toTitle: "", why: "I use the app", links: "github.com/sam, sam.dev  x.com/sam extra.com", results: [" a ", "", "b"] },
    { utm_source: "x" },
    "run_1",
  );
  assert.equal(r.website, "https://northwind.io", "a company typed as a domain is also the website");
  assert.equal(r.company, "northwind.io");
  assert.equal(r.jobType, "internship");
  assert.equal(r.jobPost, "We need someone who...");
  assert.equal(r.jobUrl, undefined);
  assert.deepEqual(r.to, { name: "Maya Chen" });
  assert.deepEqual(r.you.results, ["a", "b"]);
  assert.deepEqual(r.you.links, ["github.com/sam", "sam.dev", "x.com/sam"], "at most 3 links");
  assert.equal(r.you.why, "I use the app");
  assert.equal(r.regenerateOf, "run_1");
  assert.deepEqual(r.utm, { utm_source: "x" });
}
assert.equal(c.buildWriteRequest({ ...form(), jobPost: "https://northwind.io/jobs/42" }).jobUrl, "https://northwind.io/jobs/42", "a pasted link alone is a link");
assert.equal(c.buildWriteRequest({ ...form(), jobMode: "link", jobUrl: "northwind.io/jobs/42", jobPost: "ignored" }).jobUrl, "https://northwind.io/jobs/42");
assert.equal(c.buildWriteRequest({ ...form(), jobMode: "link", jobUrl: "northwind.io/jobs/42", jobPost: "ignored" }).jobPost, undefined);
assert.equal(c.buildWriteRequest({ ...form(), jobPost: "y".repeat(9000) }).jobPost.length, 8000);
assert.equal(c.looksLikeUrl("Acme Robotics"), false);
assert.equal(c.looksLikeUrl("acme.io"), true);

assert.deepEqual(c.validateGrade({ ...c.emptyGradeForm(), email: "short" }).email ? true : false, true);
assert.deepEqual(c.validateGrade({ ...c.emptyGradeForm(), email: "x".repeat(40) }), {});
assert.ok(c.validateGrade({ ...c.emptyGradeForm(), email: "x".repeat(3001) }).email);
assert.deepEqual(c.buildGradeRequest({ email: " hi there ", subject: "", role: "Analyst", company: "" }, "Sam"), { email: "hi there", role: "Analyst", you: { name: "Sam" } });

// ── 2. Errors ────────────────────────────────────────────────────────────────────────────────────────────────────
assert.deepEqual(c.classifyError(429, { error: "limit", message: "m", signIn: true }), { kind: "signin", message: "m" });
assert.equal(c.classifyError(429, { error: "limit", message: "m", signIn: false }).kind, "limit");
assert.equal(c.classifyError(429, { error: "limit", message: "m" }).kind, "limit");
assert.equal(c.classifyError(429, { error: "busy", message: "m" }).kind, "busy");
assert.equal(c.classifyError(503, { error: "off", message: "m" }).kind, "off");
assert.deepEqual(c.classifyError(400, { error: "invalid", message: "Bad role", field: "role" }), { kind: "field", field: "role", message: "Bad role" });
assert.equal(c.classifyError(500, null).kind, "error");
assert.equal(c.classifyError(0, undefined).kind, "error");
for (const [api, key] of [["you.results.1", "results.1"], ["you.results", "results.0"], ["results", "results.0"], ["you.name", "name"], ["you.now", "now"], ["to.name", "to"], ["website", "company"], ["jobUrl", "jobUrl"], ["email", "email"], ["you.links.2", "links"], ["what", "form"], [undefined, "form"]])
  assert.equal(c.formFieldFor(api), key, String(api));

// ── 3. The result meter ──────────────────────────────────────────────────────────────────────────────────────────
assert.equal(c.resultStrength(""), "empty");
assert.equal(c.resultStrength("did stuff"), "short");
assert.equal(c.resultStrength("Led the design club's events"), "nonumber");
assert.equal(c.resultStrength("Grew the newsletter from 300 to 2,100 readers"), "good");
assert.equal(c.resultStrength("Doubled the club's newsletter readers"), "good", "a number in words");
assert.deepEqual(["empty", "short", "nonumber", "good"].map(c.strengthSteps), [0, 1, 2, 3]);

// ── 4. Highlights ────────────────────────────────────────────────────────────────────────────────────────────────
{
  const body = "Hi Maya,\n\nI cut load time by 70%. I'd love to join.\n\nI really love what you're building.\n\nCould we grab 15 minutes?\n\nSam";
  const segs = c.highlightSegments(body, { result: "I cut load time by 70%.", company: "I really love what you're building.", ask: "Could we grab 15 minutes?" });
  assert.equal(segs.map((s) => s.text).join(""), body, "the runs join back to the body");
  assert.deepEqual(segs.filter((s) => s.kind).map((s) => s.kind), ["result", "company", "ask"]);
  assert.deepEqual(c.highlightSegments(body, { result: "not in it", company: null, ask: "" }), [{ text: body }], "a missing highlight is left out");
  const overlap = c.highlightSegments("abc def ghi", { result: "abc def", company: "def ghi", ask: null });
  assert.deepEqual(overlap.filter((s) => s.kind).map((s) => s.text), ["abc def"], "an overlapping one is left out");
  assert.deepEqual(c.highlightSegments("", null), []);
}

// ── 5. Scores, Gmail, sharing ────────────────────────────────────────────────────────────────────────────────────
assert.deepEqual([7, 7.5, 7.04, 11, -1, NaN].map(c.formatScore), ["7", "7.5", "7", "10", "0", "0"]);
assert.deepEqual([9, 8, 7, 5, 4].map(c.scoreTone), ["high", "high", "mid", "mid", "low"]);
assert.equal(c.gmailComposeUrl("Hi & bye", "Line 1\nLine 2"), "https://mail.google.com/mail/?view=cm&fs=1&su=Hi%20%26%20bye&body=Line%201%0ALine%202");
assert.equal(c.shareText(8), "My cold email scored 8/10 on @studojo's free email writer. Try yours:");
assert.equal(c.shareText(8, 4), "My cold email went from 4/10 to 8/10 on @studojo's free email writer. Try yours:");
assert.equal(c.withShareUtm("https://studojo.pro/tools/emailer/s/abc1", "x"), "https://studojo.pro/tools/emailer/s/abc1?utm_source=x&utm_medium=share&utm_campaign=emailer");
assert.equal(c.xShareUrl("a b", "https://studojo.com/x?y=1"), "https://x.com/intent/post?text=a%20b&url=https%3A%2F%2Fstudojo.com%2Fx%3Fy%3D1");
assert.equal(c.linkedinShareUrl("https://studojo.com/x"), "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fstudojo.com%2Fx");

// ── 6. The Stu links ─────────────────────────────────────────────────────────────────────────────────────────────
assert.equal(c.ctaSource("?utm_source=X", null, "https://t.co/abc"), "x", "the page's own utm_source first");
assert.equal(c.ctaSource("", new URLSearchParams("utm_source=newsletter"), "https://t.co/abc"), "newsletter", "then the held first touch");
assert.equal(c.ctaSource("", null, "https://t.co/abc"), "x", "then the referrer: t.co is X");
assert.equal(c.ctaSource("", null, "https://www.linkedin.com/feed/"), "linkedin");
assert.equal(c.ctaSource("", null, "https://www.google.co.in/"), "google");
assert.equal(c.ctaSource("", null, "https://news.ycombinator.com/item?id=1"), "news.ycombinator.com");
assert.equal(c.ctaSource("", null, "https://studojo.pro/blog"), "direct", "our own pages are never a source");
assert.equal(c.ctaSource("", null, ""), "direct");
assert.equal(c.ctaSource("?utm_source=%3Cscript%3E", null, null), "script", "cleaned");
assert.equal(
  c.stuJoinHref("https://platform.studojo.pro/join", "result", "x"),
  "https://platform.studojo.pro/join?via=emailer&how=voice&utm_source=x&utm_medium=tool&utm_campaign=emailer&utm_content=result",
);
assert.equal(c.stuJoinHref("https://platform.studojo.com/join", "bar", "direct").split("?")[0], "https://platform.studojo.com/join");
assert.deepEqual(c.pageUtm("?utm_source=x&utm_medium=social&page=2&ref=share"), { utm_source: "x", utm_medium: "social", ref: "share" });

// ── 7. The saved draft, the share data, the origin ───────────────────────────────────────────────────────────────
{
  const now = Date.parse("2026-11-11T10:00:00Z");
  const d = { v: 1, savedAt: now - 1000, tab: "grade", write: { ...form(), results: ["a"] }, writeResult: { id: "r1", subject: "s", body: "b", score: { value: 7, verdict: "v", fixes: [] } }, grade: { email: "e" }, gradeResult: null };
  const back = c.readDraft(JSON.stringify(d), now);
  assert.equal(back.tab, "grade");
  assert.deepEqual(back.write.results, ["a", "", ""], "always three result slots");
  assert.equal(back.write.jobType, "job");
  assert.equal(back.writeResult.id, "r1");
  assert.deepEqual(back.grade, { email: "e", subject: "", role: "", company: "" });
  assert.equal(c.readDraft(JSON.stringify({ ...d, savedAt: now - 8 * 864e5 }), now), null, "older than a week");
  assert.equal(c.readDraft("{not json", now), null);
  assert.equal(c.readDraft(JSON.stringify({ ...d, v: 2 }), now), null);
  assert.equal(c.readDraft(JSON.stringify({ ...d, writeResult: { id: 1 } }), now).writeResult, null, "a broken result is dropped");
}
assert.equal(c.readShare({ score: "8" }), null);
assert.deepEqual(c.readShare({ kind: "grade", score: 8, before: 4, after: 8, role: " Analyst ", company: "", companyLogo: "http://x/logo.png", firstName: "Sam", createdAt: "t" }), {
  kind: "grade", score: 8, before: 4, after: 8, role: "Analyst", company: null, companyLogo: null, firstName: "Sam", createdAt: "t",
});
assert.equal(c.roleAt("Analyst", "Northwind"), "Analyst at Northwind");
assert.equal(c.roleAt(null, "Northwind"), "Northwind");
assert.equal(c.roleAt("", ""), "");
for (const [h, o] of [["studojo.com", "https://studojo.com"], ["www.studojo.pro", "https://studojo.pro"], ["localhost:5173", "http://localhost:5173"], ["evil.com", "https://studojo.com"], [null, "https://studojo.com"], ["localhost:5173/x", "https://studojo.com"]])
  assert.equal(c.originForHost(h), o, String(h));
assert.ok(c.SHARE_ID_RE.test("Ab_3-9xYz"));
for (const bad of ["abc", "a/b/c/d", "../../etc", "a b c d", "x".repeat(65)]) assert.equal(c.SHARE_ID_RE.test(bad), false, bad);
assert.equal(c.sharePath("ab c"), "/tools/emailer/s/ab%20c");
assert.equal(c.API.card("abc1"), "/api/emailer/card/abc1.png");

// ── 8. Copy rules: every string the page shows ───────────────────────────────────────────────────────────────────
const strings = [];
(function walk(v) {
  if (typeof v === "string") strings.push(v);
  else if (typeof v === "function") {
    for (const arg of [[3, 5], ["Northwind"], ["8", "9"], [3]]) {
      try {
        walk(v(...arg));
      } catch {
        // not that shape
      }
    }
  } else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === "object") Object.values(v).forEach(walk);
})([COPY, FORM, GRADE, RESULT, LOCK, ERRORS, STU, STEPS, SEO, FAQ, MORE_FREE, EXAMPLE, LOCKED_FOLLOWUP, SHARE, HIGHLIGHTS]);
assert.ok(strings.length > 120, `${strings.length} strings`);
for (const s of strings) {
  assert.doesNotMatch(s, /[\u2013\u2014]/, `no em or en dash: ${s}`);
  assert.doesNotMatch(s, /\bstudents?\b/i, `never that word: ${s}`);
  assert.doesNotMatch(s, /[₹$€£]|\bRs\.?\s?\d|\bINR\b|\bUSD\b|\bper month\b|\/month|\bprice|\bpricing\b|\bcredits?\b|\bpaid\b/i, `no pricing: ${s}`);
  assert.doesNotMatch(s, /\b(he|she|him|his|her|hers)\b/i, `they/them for people: ${s}`);
  for (const p of RETIRED_PRODUCT_PHRASES) assert.doesNotMatch(s, p, `no retired product: ${s}`);
}
assert.equal(MORE_TODAY, 4, "free one used, 4 more of 5");
assert.match(LOCK.line, /^Sign in free to unlock your follow-ups, regenerate, and 4 more emails today\.$/);
assert.equal(ERRORS.limit, "That's 5 for today, back tomorrow, or let Stu do it daily.");
assert.equal(STU.resultLine, "Stu finds the hiring manager's email and sends this from your inbox, then follows up.");
for (const it of MORE_FREE.items) assert.equal(isRetiredPath(it.href), false, `more free: ${it.href} is live`);
for (const [k, v] of Object.entries(EXAMPLE.highlights)) assert.ok(EXAMPLE.body.includes(v), `the example's ${k} highlight is in its body`);

// ── 9. The files: no dash, no retired link, the mock only in dev, every Stu link known ───────────────────────────
const files = [
  ...readdirSync(ROOT + "app/components/emailer").map((f) => `app/components/emailer/${f}`),
  ...readdirSync(ROOT + "app/lib/emailer").filter((f) => !f.endsWith(".test.mjs")).map((f) => `app/lib/emailer/${f}`),
  "app/routes/tools.emailer.tsx",
  "app/routes/tools.emailer_.s.$id.tsx",
];
const LINK = /(?:\bto|\bhref)=\{?\s*["'`]([^"'`$]+)["'`]/g;
for (const f of files) {
  const src = read(f);
  assert.doesNotMatch(src, /[\u2013\u2014]/, `${f}: no em or en dash`);
  if (!f.endsWith(".css")) assert.doesNotMatch(src.replace(/^\s*\/\/.*$/gm, ""), /\bstudents?\b/i, `${f}: never that word`);
  for (const m of src.matchAll(LINK)) {
    const raw = m[1];
    if (!raw.startsWith("/")) continue;
    assert.equal(isRetiredPath(raw.split(/[?#]/)[0]), false, `${f} links a retired path: ${raw}`);
  }
  for (const m of src.matchAll(/<StuLink[^>]*\bcta="([a-z]+)"/g)) assert.ok(c.CTA_IDS.includes(m[1]), `${f}: unknown cta ${m[1]}`);
  if (f !== "app/lib/emailer/api.ts" && f !== "app/lib/emailer/mock.ts") assert.doesNotMatch(src, /emailer\/mock|from "\.\/mock"/, `${f}: only api.ts loads the mock`);
}
const api = read("app/lib/emailer/api.ts");
assert.match(api, /if \(import\.meta\.env\.DEV\) \{\n\s+const mode = devMockMode\(\);\n\s+if \(mode\) \{\n\s+const \{ mockFetch \} = await import\("\.\/mock"\);/, "the mock is behind import.meta.env.DEV");
assert.match(api, /if \(!import\.meta\.env\.DEV \|\| typeof window === "undefined"\) return "";/);
assert.doesNotMatch(read("app/lib/emailer/mock.ts"), /@[a-z0-9-]+\.(com|in|io)\b/i, "no email addresses in the mock");

// The routes: the share page is its own page (not a child of /tools/emailer), its preview image is the engine's card.
const share = read("app/routes/tools.emailer_.s.$id.tsx");
assert.match(share, /\{ name: "twitter:card", content: "summary_large_image" \}/);
assert.match(share, /\{ property: "og:image", content: image \}/);
assert.match(share, /const image = `\$\{data\.origin\}\$\{API\.card\(data\.id\)\}`;/);
assert.match(share, /\{ name: "robots", content: "noindex" \}/);
assert.doesNotMatch(share, /\.body\b/, "a share never shows an email body");
const tool = read("app/routes/tools.emailer.tsx");
assert.match(tool, /<StartViaContext\.Provider value="emailer">/, "the header and footer start the call with via=emailer");
assert.match(read("app/components/emailer/EmailerTool.tsx"), /const SIGN_IN = authUrl\("signin", TOOL_PATH\);/, "sign-in comes back to the tool");
assert.equal((await import("../return-to.ts")).authUrl("signin", c.TOOL_PATH), "/auth?mode=signin&redirect=%2Ftools%2Femailer");

console.log(`emailer: ${strings.length} strings and ${files.length} files clean, contract helpers ok`);
