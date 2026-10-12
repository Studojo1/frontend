// The deterministic half of the /pb pipeline. A model is told every one of
// these rules and still breaks some of them now and then, so the rules that
// code can hold are held here, and pinned by this file.
//
// Run: npx tsx app/lib/pb/polish.test.mjs
import assert from "node:assert";
import {
  polishPost,
  lintPost,
  hookOf,
  wordCount,
  ungroundedNumbers,
  parseAvoidList,
  similarity,
  voiceStats,
  normaliseChars,
  hasPartnerDisclosure,
  findLinks,
  BANNED_PHRASES,
  REVIEW_CHECKS,
} from "./polish.ts";

// Built from code points: this file must never contain the characters itself.
const EM = String.fromCodePoint(0x2014);
const EN = String.fromCodePoint(0x2013);
const CURLY_OPEN = String.fromCodePoint(0x201c);
const CURLY_CLOSE = String.fromCodePoint(0x201d);
const ARROW = String.fromCodePoint(0x2192);

const lintBase = { format: "story", mention: "none", relation: "none", emoji: "few", avoid: [], source: "" };
const codes = (body, o = {}) => lintPost(body, { ...lintBase, ...o }).map((i) => i.code);
const filler = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

// --- polish: typography ---------------------------------------------------
{
  const r = polishPost(`I applied to 34 roles ${EM} and got one reply.\n\nPay was 10${EN}15k.`);
  assert.ok(!r.body.includes(EM) && !r.body.includes(EN), "no em or en dash survives polish");
  assert.ok(r.body.includes("10-15k"), "a numeric range becomes a hyphen");
  assert.ok(r.body.includes("\n\n"), "paragraph breaks survive dash clean-up");
  assert.ok(/roles, and got/.test(r.body), "a dash mid-sentence becomes a comma");
}
{
  const r = polishPost(`She said ${CURLY_OPEN}come in${CURLY_CLOSE} and I did.`);
  assert.ok(r.body.includes('"come in"'), "curly quotes become straight quotes");
}

// --- polish: links, hashtags, bullets, markdown ---------------------------
{
  const r = polishPost("Here is what I learnt.\n\nRead it at https://studojo.com/dojos/internships today.\n\n#internship #marketing");
  assert.ok(!/https?:|studojo\.com/.test(r.body), "links are removed from the body");
  assert.ok(!r.body.includes("#"), "a hashtag line is removed");
  assert.ok(r.brokenLines.length === 1, "a line that lost a link mid-sentence is reported");
}
{
  const r = polishPost(`What worked:\n${ARROW} Sent to a person\n- First line about them\n* One ask`);
  assert.ok(!new RegExp(`^\\s*(?:${ARROW}|-|\\*)\\s`, "m").test(r.body), "bullet and arrow markers are removed");
  assert.ok(r.body.includes("Sent to a person"), "the words after a bullet are kept");
}
{
  const r = polishPost("**Big news**\n\n# Heading\n\nplain line");
  assert.ok(!r.body.includes("*") && !/^#/m.test(r.body), "markdown is stripped");
}
{
  const r = polishPost('```\n"A post in quotes"\n```');
  assert.strictEqual(r.body, "A post in quotes", "fences and wrapping quotes are removed");
}
{
  const once = polishPost(`line one ${EM} line two\n\n\n\nline three #tag`);
  const twice = polishPost(once.body);
  assert.strictEqual(twice.body, once.body, "polish is idempotent");
  assert.ok(!/\n{3,}/.test(once.body), "three or more blank lines collapse");
}
{
  const smile = String.fromCodePoint(0x1f600);
  assert.ok(!polishPost(`hello ${smile}`, { emoji: "none" }).body.includes(smile), "emoji removed when the student uses none");
  assert.ok(polishPost(`hello ${smile}`, { emoji: "few" }).body.includes(smile), "emoji kept otherwise");
}

// --- lint ------------------------------------------------------------------
{
  const body = `${filler(11)} twelve thirteen\n\n${filler(80)}`;
  assert.ok(codes(body).includes("hook_long"), "a first line over 12 words is flagged");
  assert.ok(!codes(`Short hook here\n\n${filler(80)}`).includes("hook_long"));
}
{
  assert.ok(codes(`Hook\n\n${filler(20)}`).includes("short"), "too short is flagged");
  assert.ok(codes(`Hook\n\n${Array.from({ length: 8 }, () => filler(40)).join("\n\n")}`).includes("long"), "too long is flagged");
}
{
  const body = `I got 3 interviews from 40 emails\n\n${filler(80)}`;
  const source = "I sent 40 cold emails last summer.";
  const issue = lintPost(body, { ...lintBase, source }).find((i) => i.code === "numbers");
  assert.ok(issue && issue.message.includes("3") && !/\b40\b/.test(issue.message), "a number the student never gave is flagged, a real one is not");
  assert.deepStrictEqual(ungroundedNumbers("Two replies out of 34", "I applied to 34 and got two replies"), [], "number words in the source count");
  assert.deepStrictEqual(ungroundedNumbers("My B2B and D2C work", "nothing"), [], "B2B and D2C are words, not numbers");
}
{
  assert.ok(codes(`Hook\n\n${filler(80)} Studojo helped.`).includes("mention_none"), "a mention in a no-mention post is flagged");
  assert.ok(codes(`Hook\n\n${filler(80)}`, { mention: "soft" }).includes("mention_missing"), "a missing planned mention is flagged");
  assert.ok(codes(`Hook\n\n${filler(80)} I'm an ambassador for Studojo.`, { mention: "cta", relation: "ambassador" }).includes("cta_ask"), "a cta post must point to the comments");
  assert.ok(!codes(`Hook\n\n${filler(80)} I'm an ambassador for Studojo. The link is in the comments.`, { mention: "cta", relation: "ambassador" }).includes("cta_ask"));
}
{
  const undisclosed = `Hook line\n\n${filler(80)} Studojo is useful.`;
  const disclosed = `Paid partnership with Studojo.\n\n${filler(80)}`;
  assert.ok(codes(undisclosed, { mention: "soft", relation: "partner" }).includes("disclosure"), "a paid partner post needs disclosure up top");
  assert.ok(!codes(disclosed, { mention: "soft", relation: "partner" }).includes("disclosure"));
  assert.ok(hasPartnerDisclosure(disclosed) && !hasPartnerDisclosure(undisclosed));
}
{
  assert.ok(codes(`Hook\n\n${filler(80)} We leverage synergy.`).includes("banned"), "banned words are flagged");
  assert.ok(codes(`Hook\n\n${filler(80)} It is not just a tool, but a mindset.`).includes("not_just"), "the not just X but Y pattern is flagged");
  assert.ok(codes(`Hook\n\n${filler(80)} The hustle is real.`, { avoid: parseAvoidList("hustle, grind") }).includes("avoid"), "the student's own never-use words are flagged");
  assert.ok(codes(`Hook\n\n${filler(80)} check studojo.com/x`).includes("link"), "a link left in the body is flagged");
  assert.ok(codes(`Hook\n\n${filler(80)}\n1. one thing\n2. two thing`).includes("list"), "a numbered list is flagged");
  assert.ok(codes(`Hook\n\n${filler(70)}`).length === 0 || !codes(`Hook\n\n${filler(70)}`).includes("banned"));
}
{
  const smile = String.fromCodePoint(0x1f600);
  assert.ok(codes(`Hook ${smile}\n\n${filler(80)}`, { emoji: "none" }).includes("emoji"), "emoji over the student's limit is flagged");
}

// --- small helpers ---------------------------------------------------------
assert.strictEqual(hookOf("\n\n  First line here \nsecond"), "First line here");
assert.strictEqual(wordCount("three plain words"), 3);
assert.deepStrictEqual(parseAvoidList("hustle, grind; Synergy"), ["hustle", "grind", "synergy"]);
assert.ok(similarity("I applied to 34 internships and got one reply", "I applied to 34 internships, got one reply") > 0.6);
assert.ok(similarity("The SPF number was wrong on the box", "My hostel app crashed on day one") < 0.2);
assert.strictEqual(voiceStats("too short"), null, "a thin sample gives no stats");
assert.ok(voiceStats("ok so nobody tells you this but the first week is mostly finding chai. spoiler: it is never the person with the title. I learnt that the hard way lol. Anyway. Week two was better.").markers.includes("lol"));
assert.ok(!normaliseChars(`a ${EM} b`).includes(EM));
assert.deepStrictEqual(findLinks("see https://a.com/x and studojo.com/dojos"), ["https://a.com/x", "studojo.com/dojos"]);
assert.ok(BANNED_PHRASES.includes("leverage") && BANNED_PHRASES.includes("ecosystem"));
assert.strictEqual(REVIEW_CHECKS.length, 12);

console.log("pb polish: all assertions passed");
