// The scrape importer. Fixture mirrors the shape of a real Apify LinkedIn
// profile-posts export, including the detail that the scraper's
// publicIdentifier is never quite equal to our handle.
//
// Run: npx tsx app/lib/content/scrape.test.mjs
import assert from "node:assert";
import {
  parseScrapeExport,
  matchAccountHandle,
  hookOf,
  splitPastedPosts,
} from "./store.server.ts";

const post = (publicIdentifier, content, likes = 0, comments = 0) => ({
  author: { publicIdentifier, name: publicIdentifier },
  content,
  engagement: { likes, comments, shares: 0 },
  postedAt: { date: "2026-09-07T07:00:46.839Z" },
  linkedinUrl: "https://www.linkedin.com/feed/update/x",
});

const raw = JSON.stringify([
  post("jeremy-zechariah-abraham", "studojo is growing faster than ever", 1100, 11),
  post("pranav-hegde13", "your LinkedIn is invisible to recruiters", 60, 2),
  post("pranav-shastry--", "found my dream job today", 2),
  post("ayushi-ladha-999a163b7", "nobody replies to your cold emails", 150, 7),
  post("vivaan-nagpal", "pov: it's a wednesday and your BD lead walks in", 30, 3),
  post("someone-else", "a post by a stranger", 5),
  post("jeremy-zechariah-abraham", "   ", 0), // blank, must be dropped
]);

const posts = parseScrapeExport(raw);
assert.equal(posts.length, 6, "blank-content posts are dropped");
assert.equal(posts[0].engagement, 1111, "likes, comments and shares are summed");
assert.equal(posts[0].postedAt, "2026-09-07", "date is trimmed to a day");
assert.ok(posts.every((p) => p.body.trim().length > 0), "no empty bodies");

const accounts = [
  { id: 1, handle: "jeremy" },
  { id: 2, handle: "pranav-hegde" },
  { id: 3, handle: "pranav-shastry" },
  { id: 4, handle: "vivaan" },
  { id: 5, handle: "manashwini" },
  { id: 6, handle: "ayushi" },
  { id: 7, handle: "vanshika" },
];

// The scraper's ids carry suffixes, so exact matching alone would attribute
// nothing and every post would land unattributed.
assert.equal(matchAccountHandle("jeremy-zechariah-abraham", accounts), 1);
assert.equal(matchAccountHandle("pranav-hegde13", accounts), 2, "numeric suffix");
assert.equal(matchAccountHandle("pranav-shastry--", accounts), 3, "dash suffix");
assert.equal(matchAccountHandle("vivaan-nagpal", accounts), 4);
assert.equal(matchAccountHandle("ayushi-ladha-999a163b7", accounts), 6, "random suffix");
assert.equal(matchAccountHandle("VIVAAN-NAGPAL", accounts), 4, "case insensitive");

// The two Pranavs share a first name and must not collide.
assert.notEqual(
  matchAccountHandle("pranav-hegde13", accounts),
  matchAccountHandle("pranav-shastry--", accounts),
  "the two Pranavs stay separate"
);

// An unknown profile is left unattributed rather than guessed onto someone.
assert.equal(matchAccountHandle("someone-else", accounts), null);
assert.equal(matchAccountHandle(null, accounts), null);
assert.equal(matchAccountHandle("", accounts), null);

// Bad input fails loudly: a silent zero-row import looks like a successful one.
assert.throws(() => parseScrapeExport("not json"), /not valid JSON/);
assert.throws(() => parseScrapeExport('{"a":1}'), /array of posts/);
assert.throws(() => parseScrapeExport("[]"), /No posts with content/);
assert.throws(() => parseScrapeExport('[{"content":"  "}]'), /No posts with content/);

// The hook is the first non-empty line, which is what LinkedIn shows collapsed.
assert.equal(hookOf("\n\nfirst line\n\nsecond"), "first line");
assert.equal(hookOf("   \n  padded  \nx"), "padded");
assert.equal(hookOf(""), "");

// Hand-paste splitting, the fallback path.
assert.deepEqual(splitPastedPosts("a\n---\nb"), ["a", "b"]);
assert.deepEqual(splitPastedPosts("a\n-----\nb"), ["a", "b"], "longer rules work");
assert.deepEqual(splitPastedPosts("only one"), ["only one"]);
assert.deepEqual(splitPastedPosts("\n\n"), [], "blank input yields nothing");
assert.equal(splitPastedPosts("a - b\nmore").length, 1, "inline dashes do not split");

console.log("scrape importer: all assertions passed");
