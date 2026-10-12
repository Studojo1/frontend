// The parts of the /pb pipeline that decide what is TRUE and what gets
// written, tested without a model: the dossier is held to the student's own
// words, planned hooks that echo someone else's are dropped, and Studojo only
// appears where there is something honest to say.
//
// Run: npx tsx app/lib/pb/pipeline.test.mjs
import assert from "node:assert";
import { toDossier, toCandidates, selectPlans } from "./pipeline.server.ts";
import {
  writerSystemPrompt,
  reviewSystemPrompt,
  planSystemPrompt,
  dossierSystemPrompt,
  draftUserPrompt,
  pickCraftExamples,
  relationRule,
  APPROVED_STUDOJO_FACTS,
} from "./prompts.server.ts";

const profile = {
  userId: "u1",
  email: null,
  name: "Asha",
  headline: "3rd year BBA | Marketing intern at a D2C brand",
  stage: "3rd year",
  market: "India",
  relation: "ambassador",
  goals: "A growth marketing internship next summer.",
  topics: ["Internships", "Marketing"],
  stories: [
    { id: "st-1", text: "Applied to 34 marketing internships on job portals. Got 1 reply, an unpaid content role." },
    { id: "st-2", text: "Ran an Instagram giveaway that got 2,100 entries but almost zero sales." },
  ],
  writingSample:
    "ok so nobody tells you this but the first week of an internship is mostly figuring out where the good chai is and who actually makes decisions. spoiler: it's never the person with the biggest title. I learnt that the hard way lol. Anyway. Week 2 was better.",
  tone: { formality: 1, rhythm: 2, energy: 4 },
  emoji: "few",
  lang: "english",
  avoid: "hustle, grind",
  linkedinUrl: "",
  extra: "",
  createdAt: "2026-10-12T00:00:00.000Z",
  updatedAt: "2026-10-12T00:00:00.000Z",
};

// --- dossier: extract, never invent ----------------------------------------
{
  const d = toDossier(
    {
      who: "Third-year BBA student interning in marketing",
      credibleOn: ["internship applications"],
      seeds: [
        { id: "s1", from: "story 1", summary: "34 applications, one reply", details: ["34 marketing internships", "1 reply", "offer from Google worth 12 lakh"], tension: "effort vs result", potential: 6, why: "relatable" },
        { id: "s2", from: "story 2", summary: "Giveaway with entries but no sales", details: ["2,100 entries", "almost zero sales"], tension: "vanity numbers", potential: 9, why: "surprising" },
      ],
      voice: { source: "sample", sentences: "short", vocabulary: "casual", opens: "ok so", humour: "dry", quirks: "lol", capitalisation: "mixed", phrases: ["where the good chai is", "a phrase she never wrote"] },
      noGos: ["hustle"],
      studojoFacts: ["She built her resume on Studojo and got 5 offers"],
    },
    profile
  );
  assert.strictEqual(d.seeds[0].summary, "Giveaway with entries but no sales", "seeds are ordered by potential");
  assert.deepStrictEqual(d.seeds.map((s) => s.id), ["s1", "s2"], "seed ids follow the final order");
  const all = d.seeds.flatMap((s) => s.details);
  assert.ok(all.includes("2,100 entries") && all.includes("34 marketing internships"), "details in their own words are kept");
  assert.ok(!all.some((x) => /google|12 lakh/i.test(x)), "a detail the student never wrote is dropped");
  assert.deepStrictEqual(d.voice.phrases, ["where the good chai is"], "only phrases really in the sample survive");
  assert.deepStrictEqual(d.studojoFacts, [], "nothing about Studojo is kept unless the student said it");
  assert.ok(d.stats && d.stats.markers.includes("lol"), "voice is measured from the sample in code");
}
{
  // The model returns nothing usable: the stories themselves become the seeds.
  const d = toDossier({}, profile);
  assert.strictEqual(d.seeds.length, 2);
  assert.ok(d.who.includes("Asha"));
  // A thin sample means the voice comes from settings, whatever the model claims.
  const thin = toDossier({ voice: { source: "sample", phrases: ["made up"] } }, { ...profile, writingSample: "hi" });
  assert.strictEqual(thin.voice.source, "settings");
  assert.deepStrictEqual(thin.voice.phrases, []);
  // Nothing to write from at all.
  assert.strictEqual(toDossier({}, { ...profile, stories: [], writingSample: "" }).seeds.length, 0);
}

// --- plan: candidates held to the dossier, echoes dropped -------------------
const dossier = toDossier(
  {
    seeds: [
      { summary: "Giveaway with entries but no sales", details: ["2,100 entries", "almost zero sales"], potential: 9 },
      { summary: "34 applications, one reply", details: ["34 marketing internships", "1 reply"], potential: 6 },
    ],
  },
  profile
);
{
  const cands = toCandidates(
    {
      candidates: [
        { format: "story", seed: "s1", detail: "2,100 entries", hook: "2,100 entries and almost zero sales", angle: "Vanity numbers lie", ending: "question", score: 9, studojoFit: 2 },
        { format: "podcast", seed: "s9", detail: "made up", hook: "I sent 34 applications and heard back once", angle: "Portals are a lottery", ending: "shout", score: 7, studojoFit: 7 },
        { format: "take", seed: "s2", hook: "34 applications. One reply. Unpaid.", angle: "Same as another student", score: 8 },
        { format: "take", seed: "s2", hook: "", angle: "no hook" },
      ],
    },
    dossier,
    ["34 applications, one reply, unpaid"]
  );
  assert.strictEqual(cands.length, 2, "a hook echoing a post already out there is dropped, and so is one with no hook");
  assert.strictEqual(cands[1].format, "story", "an unknown format falls back to story");
  assert.strictEqual(cands[1].seed, "s1", "an unknown seed falls back to a real one");
  assert.ok(dossier.seeds[0].details.includes(cands[1].detail), "the detail is always one the dossier verified");
  assert.strictEqual(cands[1].ending, "line", "an unknown ending falls back to a plain line");
}

// --- select: variety, and Studojo only where it is true ---------------------
const c = (over) => ({ format: "story", seed: "s1", detail: "", hookType: "", storyEngine: "", hook: "h", angle: "a", ending: "line", whySuits: "", whyDifferent: "", studojoFit: 0, studojoHow: "", score: 5, ...over });
const pool = [
  c({ seed: "s1", format: "story", hook: "2,100 entries and almost zero sales", score: 9, studojoFit: 1 }),
  c({ seed: "s1", format: "lesson", hook: "The giveaway that taught me who our customer is", score: 8.5, studojoFit: 2 }),
  c({ seed: "s2", format: "take", hook: "Job portals are a lottery ticket", score: 8, studojoFit: 8, ending: "question" }),
  c({ seed: "s2", format: "story", hook: "34 applications and one unpaid reply", score: 7, studojoFit: 3 }),
];
const ctx = { policy: "mix", relation: "ambassador", studojoFacts: [], brief: "Studojo's Internship Dojo finds founder-posted roles.", hasLink: true };
{
  const plans = selectPlans(pool, 2, ctx);
  assert.deepStrictEqual(plans.map((p) => p.candidate.seed), ["s1", "s2"], "two posts never stand on the same story when another is available");
  assert.strictEqual(plans[0].mention, "none", "mix: the first post never mentions Studojo");
  assert.strictEqual(plans[1].mention, "cta", "mix: one natural, truthful mention, with a link when the brief is about a Studojo product");
  assert.strictEqual(plans[1].ending, "ask", "a cta post closes on the ask");
  assert.strictEqual(plans[0].ending, "line");
}
{
  // A story an earlier post already told waits behind an unused one.
  const fresh = selectPlans(pool, 1, { ...ctx, usedSeeds: ["s1"] });
  assert.strictEqual(fresh[0].candidate.seed, "s2", "an unused story beats a slightly stronger used one");
  // Two posts both closing on a question: the last one lands on a plain line instead.
  const asking = pool.map((x) => ({ ...x, ending: "question" }));
  assert.deepStrictEqual(selectPlans(asking, 2, { ...ctx, policy: "none" }).map((p) => p.ending), ["question", "line"]);
  // Affiliated students need less of a fit than a plain user for the one mixed mention.
  const midFit = pool.map((x) => ({ ...x, studojoFit: 4 }));
  assert.deepStrictEqual(selectPlans(midFit, 2, ctx).map((p) => p.mention), ["none", "cta"]);
  assert.deepStrictEqual(selectPlans(midFit, 2, { ...ctx, relation: "user", studojoFacts: ["used the resume builder"] }).map((p) => p.mention), ["none", "none"]);
}
{
  assert.deepStrictEqual(selectPlans(pool, 2, { ...ctx, brief: "Getting a first internship" }).map((p) => p.mention), ["none", "soft"], "mix without a Studojo brief is a passing mention, no ask");
  assert.deepStrictEqual(selectPlans(pool, 2, { ...ctx, policy: "none" }).map((p) => p.mention), ["none", "none"]);
  assert.deepStrictEqual(selectPlans(pool, 2, { ...ctx, policy: "cta", hasLink: false }).map((p) => p.mention), ["soft", "soft"], "no link means no ask");
  assert.deepStrictEqual(selectPlans(pool, 1, ctx).map((p) => p.mention), ["none"], "a single mixed post does not mention Studojo");
  // No connection and nothing they said about Studojo: no honest mention exists, whatever staff picked.
  assert.deepStrictEqual(selectPlans(pool, 2, { ...ctx, policy: "cta", relation: "none" }).map((p) => p.mention), ["none", "none"]);
  assert.deepStrictEqual(selectPlans(pool, 2, { ...ctx, policy: "soft", relation: "user", studojoFacts: ["used the resume builder"] }).map((p) => p.mention), ["soft", "soft"]);
  // Someone who works with Studojo gets exactly one mention in a mixed batch, never in the first post.
  const lowFit = pool.map((x) => ({ ...x, studojoFit: 3 }));
  assert.strictEqual(selectPlans(lowFit, 3, ctx).filter((p) => p.mention !== "none").length, 1);
  assert.strictEqual(selectPlans(lowFit, 3, ctx)[0].mention, "none");
  // A plain user with a low fit: mix stays silent rather than forcing it.
  assert.deepStrictEqual(selectPlans(lowFit, 3, { ...ctx, relation: "user", studojoFacts: ["used the resume builder"] }).map((p) => p.mention), ["none", "none", "none"]);
  assert.strictEqual(selectPlans(pool, 3, ctx).length, 3, "falls back to the best remaining when variety runs out");
  assert.strictEqual(selectPlans([], 2, ctx).length, 0);
}

// --- prompts: a student author, no staff persona, no statistics -------------
{
  const playbook = "### Voice (writing)\n## The Hook\nTwo moves.\n**Studojo appears** after the reader got something.\n## Do Not Sound Like AI\nNo delve.";
  const writer = writerSystemPrompt(playbook);
  const all = [writer, reviewSystemPrompt(playbook), planSystemPrompt(playbook), dossierSystemPrompt()].join("\n");
  assert.ok(/under the student's own name/.test(writer), "the writer is framed as a ghostwriter for a student");
  assert.ok(!/content lead for Studojo/i.test(all), "the Content Studio staff persona is not reused");
  assert.ok(/Never invent numbers/.test(writer) && /Extract, never invent/.test(dossierSystemPrompt()));
  assert.ok(/Hashtags\./.test(writer) && /no approved statistics/i.test(writer), "house rules: no hashtags, no Studojo numbers");
  assert.ok(!/10,000|5,000|95%/.test(all + APPROVED_STUDOJO_FACTS), "no marketing statistic reaches a prompt");
  assert.ok(/private person/.test(writer), "private people are never named");
  assert.ok(/paid partnership/i.test(relationRule("partner")) && /no connection/i.test(relationRule("none")));
  // An empty playbook must not break anything: the built-in rules carry the pipeline.
  assert.ok(writerSystemPrompt("").length > 1500);
}
{
  const plan = { candidate: c({ seed: "s1", hook: "2,100 entries and almost zero sales", angle: "Vanity numbers lie" }), mention: "none", ending: "line" };
  const user = draftUserPrompt({ profile, dossier, brief: "", plan, past: [], cohort: [{ name: "Rahul", hook: "My hostel app crashed on day one", angle: "x" }], examples: [] });
  assert.ok(user.indexOf("Their voice") > user.indexOf("Their material"), "the voice block comes last, after the material");
  assert.ok(/Do not mention Studojo at all/.test(user));
  assert.ok(/hostel app crashed/.test(user), "the cohort's hooks are shown so they can be avoided");
  assert.ok(/where the good chai is/.test(user), "their own writing sample is the voice reference");
}
{
  const ex = (body, i) => ({ id: i, accountId: null, accountHandle: "x", hook: "", body, engagement: null, isExemplar: false, source: "imported", notes: null, createdAt: "" });
  const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
  const picked = pickCraftExamples(
    [ex(`Studojo helped me ${words(60)}`, 1), ex(`comment YES for the link ${words(60)}`, 2), ex(`a clean story about a night shift ${words(60)}`, 3), ex(`we built this for b2b ${words(60)}`, 4)],
    { seed: "u1:1", sample: profile.writingSample, n: 3 }
  );
  assert.deepStrictEqual(picked.map((e) => e.id), [3], "team posts that mention Studojo, gate comments or sell are never shown to the writer");
}

console.log("pb pipeline logic: all assertions passed");
