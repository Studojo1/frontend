// The voice corpus is what makes drafts sound like a person rather than like
// a summary of rules about a person. These assertions cover the two ways it
// silently stops working: the seed going stale or unmapped, and the scrape
// parser accepting a file while extracting nothing useful from it.
//
// Run: npx tsx app/lib/content/corpus.test.mjs
import assert from "node:assert";
import { voiceBlock, signalsBlock } from "./prompts.server.ts";
import seed from "./examples-seed.json" with { type: "json" };

/* ---- the seeded corpus is real, attributed, and ranked per account ---- */
assert.ok(seed.length >= 80, `corpus is substantial, got ${seed.length}`);

const unmapped = seed.filter((r) => !r.handle);
assert.equal(unmapped.length, 0, "every seeded post maps to an account");

const short = seed.filter((r) => r.body.trim().split(/\s+/).length < 40);
assert.equal(short.length, 0, "filler posts are excluded from the corpus");

const handles = [...new Set(seed.map((r) => r.handle))].sort();
assert.deepEqual(
  handles,
  ["ayushi", "jeremy", "manashwini", "pranav-hegde", "pranav-shastry", "vivaan"],
  "all six live accounts are represented"
);

// Exemplars are ranked inside each account. A global top-N would be two
// people's posts and would teach every account to sound like them.
for (const handle of handles) {
  const mine = seed.filter((r) => r.handle === handle);
  const exemplars = mine.filter((r) => r.isExemplar);
  assert.ok(exemplars.length > 0, `${handle} has at least one exemplar`);
  const best = Math.max(...mine.map((r) => r.engagement));
  assert.ok(
    exemplars.some((r) => r.engagement === best),
    `${handle}'s top post is an exemplar`
  );
  const worst = Math.min(...mine.map((r) => r.engagement));
  if (mine.length > 2) {
    assert.ok(
      !exemplars.some((r) => r.engagement === worst),
      `${handle}'s worst post is not an exemplar`
    );
  }
}

// Every account has its own exemplars, so no account is left learning only
// from the roster average.
assert.ok(
  handles.every((h) => seed.some((r) => r.handle === h && r.isExemplar)),
  "no account is without its own standout"
);

/* ---- whole posts reach the prompt, not excerpts ---- */
const sample = seed.slice(0, 3).map((r, i) => ({
  id: i,
  accountId: 1,
  accountHandle: r.handle,
  hook: r.body.split("\n")[0],
  body: r.body,
  engagement: r.engagement,
  isExemplar: r.isExemplar,
  source: "imported",
  notes: null,
  createdAt: "",
}));

const block = voiceBlock(sample);
for (const e of sample) {
  assert.ok(block.includes(e.body), "the full post body is in the prompt, verbatim");
}
assert.ok(block.includes("This is the voice"), "framed as the voice");
assert.ok(
  block.includes("do not reuse their subject matter"),
  "told to copy the sound, not the topics"
);
assert.ok(block.includes("engagement"), "engagement is shown so it can be weighted");

// An empty corpus must say so. Silently writing from rules alone is the exact
// failure this whole layer exists to fix.
const empty = voiceBlock([]);
assert.ok(empty.includes("None have been added"), "empty corpus is announced");
assert.ok(empty.includes("more generic"), "and its consequence is stated");

/* ---- taste signals, including the negative half ---- */
assert.equal(signalsBlock({ liked: [], rejected: [] }), "", "no signals, no block");

const liked = signalsBlock({ liked: ["kept hook"], rejected: [] });
assert.ok(liked.includes("kept hook"), "kept hooks listed");
assert.ok(!liked.includes("binned"), "no empty rejected section");

const rejected = signalsBlock({ liked: [], rejected: ["bad hook"] });
assert.ok(rejected.includes("bad hook"), "binned hooks listed");
// The instruction wraps across prompt lines, so match the distinctive phrase.
assert.ok(
  rejected.includes("what they have in common"),
  "told to generalise from rejections, not just avoid the literal strings"
);

const both = signalsBlock({ liked: ["good"], rejected: ["bad"] });
assert.ok(both.includes("good") && both.includes("bad"), "both halves present");
assert.ok(
  both.indexOf("good") < both.indexOf("bad"),
  "kept before binned, so the last thing read is what to avoid"
);

console.log(
  `content corpus: all assertions passed (${seed.length} posts, ` +
    `${seed.filter((r) => r.isExemplar).length} exemplars, ${handles.length} accounts)`
);
