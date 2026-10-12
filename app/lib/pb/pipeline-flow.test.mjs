// The whole /pb pipeline, end to end, against a scripted stand-in for the
// model. No network and no key: fetch is replaced, so this pins the
// orchestration itself (what is called, in what order, which version of a
// post is kept, what happens when calls fail) without spending anything.
//
// Run: npx tsx app/lib/pb/pipeline-flow.test.mjs
import assert from "node:assert";
import { generatePbPosts, PbPipelineError } from "./pipeline.server.ts";

process.env.OPENAI_API_KEY = "test-key-not-real";
delete process.env.PB_MODEL;

const EM = String.fromCodePoint(0x2014);
const LINK = "https://studojo.com/dojos/internships?utm_source=linkedin&utm_medium=ugc&utm_campaign=pb-run-1&utm_content=asha";

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
    { id: "st-1", text: "Ran an Instagram giveaway that got 2,100 entries but almost zero sales. Most entries were giveaway-hunter accounts." },
    { id: "st-2", text: "Applied to 34 marketing internships on job portals. Got 1 reply, an unpaid content role." },
  ],
  writingSample:
    "ok so nobody tells you this but the first week of an internship is mostly figuring out where the good chai is and who actually makes decisions. spoiler: it's never the person with the biggest title. I learnt that the hard way lol. Anyway. Week 2 was better.",
  tone: { formality: 1, rhythm: 2, energy: 4 },
  emoji: "none",
  lang: "english",
  avoid: "hustle",
  linkedinUrl: "",
  extra: "",
  createdAt: "2026-10-12T00:00:00.000Z",
  updatedAt: "2026-10-12T00:00:00.000Z",
};

const DOSSIER = {
  who: "Third-year BBA student interning in marketing at a D2C brand",
  credibleOn: ["internship applications", "giveaways"],
  seeds: [
    { summary: "Giveaway with 2,100 entries but almost zero sales", details: ["2,100 entries", "almost zero sales", "giveaway-hunter accounts"], tension: "big number, no result", potential: 9, why: "surprising" },
    { summary: "34 applications on job portals, 1 reply", details: ["34 marketing internships", "1 reply", "unpaid content role"], tension: "effort vs result", potential: 7, why: "relatable" },
  ],
  voice: { source: "sample", sentences: "short", vocabulary: "casual", opens: "ok so", humour: "dry", quirks: "lol", capitalisation: "mixed", phrases: ["where the good chai is"] },
  noGos: ["hustle"],
  studojoFacts: [],
};

const PLAN = {
  candidates: [
    { format: "lesson", seed: "s1", detail: "2,100 entries", hookType: "Data and Personal Sting", storyEngine: "moment of surprise", hook: "2,100 entries and almost zero sales", angle: "A big number can be the wrong number", ending: "question", whySuits: "her story", whyDifferent: "her data", studojoFit: 1, studojoHow: "", score: 9 },
    { format: "story", seed: "s2", detail: "34 marketing internships", hookType: "Plain Milestone", storyEngine: "before and after", hook: "34 applications. 1 reply.", angle: "Job portals reward volume, not fit", ending: "line", whySuits: "her story", whyDifferent: "her numbers", studojoFit: 8, studojoHow: "as an ambassador, where founder-posted roles come up", score: 8 },
    { format: "take", seed: "s2", detail: "1 reply", hookType: "Confrontational Truth", storyEngine: "pov", hook: "An unpaid role taught me more than two semesters", angle: "Take the small role", ending: "question", whySuits: "x", whyDifferent: "y", studojoFit: 2, studojoHow: "", score: 6 },
  ],
};

const GIVEAWAY = [
  "2,100 entries and almost zero sales",
  "",
  `we ran an Instagram giveaway at my internship ${EM} it looked great.`,
  "",
  "2,100 entries.",
  "",
  "the number looked very nice on the screen.",
  "",
  "then we checked sales.",
  "",
  "almost zero.",
  "",
  "most of the entries were giveaway-hunter accounts, not people who actually needed the product we were selling.",
  "",
  "that was the first time a big number felt wrong to me.",
  "",
  "now I check who is inside the number before I get happy about the number.",
  "",
  "what number looked good for you until you checked properly?",
  "",
  "#marketing #internship",
].join("\n");

const PORTALS = (extra = "") =>
  [
    "34 applications. 1 reply.",
    "",
    "in 2nd year I applied to 34 marketing internships on job portals.",
    "",
    "I got 1 reply.",
    "",
    "it was an unpaid content role.",
    "",
    "I took it anyway, because one reply is still one more than zero and I wanted to learn something real.",
    extra,
    "",
    "portals made me feel busy without making me feel seen.",
    "",
    "I'm a campus ambassador for Studojo, and the founder-posted roles there are the part that makes sense to me.",
    "",
    "the link is in the comments if you want it.",
  ].join("\n");

const allPass = () => ({ items: ["hook", "voice", "specific", "facts", "tells", "format", "people", "studojo", "structure", "close", "mention", "length"].map((id) => ({ id, pass: true, note: "ok" })) });
const failing = (id, note) => {
  const r = allPass();
  r.items.find((i) => i.id === id).pass = false;
  r.items.find((i) => i.id === id).note = note;
  return r;
};

/** Replaces fetch with a script. `script` decides every reply from the kind of call and the prompt. */
function fakeModel(script) {
  const calls = [];
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    const sys = body.messages[0].content;
    const user = body.messages[1].content;
    let kind = "draft";
    if (sys.startsWith("You read what a student told us")) kind = "dossier";
    else if (sys.startsWith("You plan LinkedIn posts")) kind = "plan";
    else if (sys.startsWith("You are a hostile editor")) kind = "review";
    else if (user.includes("## What an editor flagged")) kind = "revise";
    else if (user.includes("## Fix only these")) kind = "fix";
    else if (user.startsWith("Write the first comment")) kind = "comment";
    // Which post a call is about: the plan for a draft, the quoted post for everything after it.
    const quoted = user.match(/## (?:The current post|The post|Their post)\n"""\n([\s\S]*?)\n"""/)?.[1];
    const about = kind === "draft" ? (user.split("## This post")[1]?.split("\n## ")[0] ?? "") : (quoted ?? "");
    const post = /giveaway/i.test(about) ? "giveaway" : "portals";
    calls.push({ kind, post, model: body.model, json: Boolean(body.response_format), user });
    const out = await script({ kind, post, user, body, n: calls.filter((c) => c.kind === kind && c.post === post).length });
    if (out && out.status) {
      return { status: out.status, headers: { get: () => null }, text: async () => JSON.stringify(out.body ?? { error: { message: "bad" } }) };
    }
    const content = typeof out === "string" ? out : JSON.stringify(out);
    return {
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ choices: [{ finish_reason: "stop", message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 10 } }),
    };
  };
  return calls;
}

const base = {
  profile,
  brief: "This week: first internships without job portals. Studojo's Internship Dojo finds roles that founders post directly.",
  postsWanted: 2,
  mention: "mix",
  link: LINK,
  pastPosts: [],
  cohortPosts: [{ name: "Rahul", hook: "My hostel app crashed on day one", angle: "floats" }],
  corpus: { playbook: "", examples: [], signals: { liked: [], rejected: [] } },
};
const count = (calls, kind) => calls.filter((c) => c.kind === kind).length;

// --- A. the happy path -------------------------------------------------------
{
  const steps = [];
  const calls = fakeModel(({ kind, post }) => {
    if (kind === "dossier") return DOSSIER;
    if (kind === "plan") return PLAN;
    if (kind === "draft") return post === "giveaway" ? GIVEAWAY : PORTALS();
    if (kind === "review") return allPass();
    if (kind === "comment") return "here's the Internship Dojo link I mentioned #link";
    throw new Error(`unexpected ${kind}`);
  });
  const posts = await generatePbPosts({ ...base, onStep: (s) => void steps.push(s) });
  assert.strictEqual(posts.length, 2);
  const [a, b] = posts;
  assert.strictEqual(a.mention, "none", "mix: the strongest post carries no mention");
  assert.strictEqual(b.mention, "cta", "mix: one later post mentions Studojo, with an ask because the brief is about a Studojo product");
  assert.ok(!a.body.includes(EM) && !a.body.includes("#"), "a dash and a hashtag line the model wrote anyway are cleaned out in code");
  assert.ok(a.body.includes("internship, it looked great"), "the dash became a comma, the words stayed");
  assert.strictEqual(a.hook, "2,100 entries and almost zero sales");
  assert.strictEqual(a.review.verdict, "pass");
  assert.strictEqual(a.review.rounds, 1, "a clean first review means no rewrite");
  assert.strictEqual(a.review.items.length, 12);
  assert.strictEqual(a.firstComment, null, "no first comment on a post without an ask");
  assert.ok(b.firstComment.endsWith(`\n${LINK}`), "the tracked link is appended exactly, by code");
  assert.ok(!b.firstComment.includes("#"), "the comment is cleaned too");
  assert.ok(/Built on:/.test(a.angle), "the staff note says which story the post stands on");
  assert.strictEqual(count(calls, "revise"), 0);
  assert.strictEqual(count(calls, "fix"), 0);
  assert.strictEqual(count(calls, "draft"), 2);
  assert.strictEqual(count(calls, "comment"), 1);
  assert.deepStrictEqual(steps.slice(0, 3), ["dossier", "plan", "draft"]);
  assert.ok(steps.includes("review") && steps.includes("polish"));
  assert.ok(calls.every((c) => c.model === "gpt-5.5"));
  const draft = calls.find((c) => c.kind === "draft");
  assert.ok(/hostel app crashed/.test(draft.user), "the writer sees what the cohort already posted");
  assert.ok(/where the good chai is/.test(draft.user), "and the student's own writing sample");
}

// --- B. an invented detail survives two rewrites, then gets one surgical fix -
{
  const lie = "they offered me 5 lakh a month.";
  const calls = fakeModel(({ kind, post, user }) => {
    if (kind === "dossier") return DOSSIER;
    if (kind === "plan") return PLAN;
    if (kind === "draft") return post === "giveaway" ? GIVEAWAY : PORTALS(lie);
    if (kind === "revise") return PORTALS(lie);
    if (kind === "fix") {
      assert.ok(/5/.test(user), "the fix is told exactly what to remove");
      return PORTALS();
    }
    if (kind === "review") {
      if (post === "giveaway") return allPass();
      return user.includes(lie) ? failing("facts", `"${lie}" is not in the source material. Remove it.`) : allPass();
    }
    if (kind === "comment") return "the link I mentioned";
    throw new Error(`unexpected ${kind}`);
  });
  const posts = await generatePbPosts({ ...base });
  const b = posts.find((p) => p.mention === "cta");
  assert.ok(b && !b.body.includes("lakh"), "the invented detail is gone from the final post");
  assert.strictEqual(b.review.verdict, "pass");
  assert.strictEqual(calls.filter((c) => c.kind === "revise" && c.post === "portals").length, 2, "never more than two rewrites");
  assert.strictEqual(calls.filter((c) => c.kind === "fix" && c.post === "portals").length, 1, "then one targeted fix");
  assert.strictEqual(b.review.rounds, 4, "and the corrected post is reviewed again");
  assert.strictEqual(calls.filter((c) => c.kind === "revise" && c.post === "giveaway").length, 0, "the clean post is left alone");
}

// --- C. the reviewer never passes it: the least bad version is kept, flagged --
{
  fakeModel(({ kind, post }) => {
    if (kind === "dossier") return DOSSIER;
    if (kind === "plan") return PLAN;
    if (kind === "draft" || kind === "revise" || kind === "fix") return post === "giveaway" ? GIVEAWAY : PORTALS();
    if (kind === "review") return post === "giveaway" ? failing("voice", "Too polished.") : allPass();
    if (kind === "comment") return "the link";
    throw new Error(`unexpected ${kind}`);
  });
  const posts = await generatePbPosts({ ...base });
  const a = posts.find((p) => p.mention === "none");
  assert.strictEqual(a.review.verdict, "fix", "a post that never passes is still delivered to staff, marked");
  assert.ok(a.review.items.some((i) => !i.pass && /polished/.test(i.note)), "with the reviewer's note for staff to read");
  assert.strictEqual(a.review.rounds, 2, "a lone taste failure does not buy a second rewrite");
}

// --- D. one post's calls fail: the other is still returned -------------------
{
  fakeModel(({ kind, post }) => {
    if (kind === "dossier") return DOSSIER;
    if (kind === "plan") return PLAN;
    if (kind === "draft") return post === "giveaway" ? GIVEAWAY : { status: 400, body: { error: { message: "bad request", code: "invalid" } } };
    if (kind === "review") return allPass();
    throw new Error(`unexpected ${kind}`);
  });
  const posts = await generatePbPosts({ ...base });
  assert.strictEqual(posts.length, 1, "one failed post does not throw away the one that worked");
}

// --- E. out of credits: a clear, permanent error -----------------------------
{
  fakeModel(() => ({ status: 429, body: { error: { message: "You exceeded your current quota", code: "insufficient_quota", type: "insufficient_quota" } } }));
  await assert.rejects(
    () => generatePbPosts({ ...base }),
    (err) => err instanceof PbPipelineError && err.transient === false && /out of quota/.test(err.message)
  );
}

// --- F. nothing to write from -------------------------------------------------
{
  fakeModel(({ kind }) => (kind === "dossier" ? {} : PLAN));
  await assert.rejects(
    () => generatePbPosts({ ...base, profile: { ...profile, stories: [], writingSample: "" } }),
    (err) => err instanceof PbPipelineError && err.transient === false && /nothing true to write from/.test(err.message)
  );
}

// --- G. cancelled before it starts ---------------------------------------------
{
  const calls = fakeModel(() => DOSSIER);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() => generatePbPosts({ ...base, signal: controller.signal }), (err) => err instanceof PbPipelineError && err.transient === true);
  assert.strictEqual(calls.length, 0, "a cancelled job makes no model call");
}

console.log("pb pipeline flow: all assertions passed");
