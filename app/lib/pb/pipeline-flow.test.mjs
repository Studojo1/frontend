// The whole /pb pipeline, end to end, against a scripted stand-in for the
// model. No network and no key: fetch is replaced, so this pins the
// orchestration itself (what is called, in what order, which version of a
// post is kept, what happens when calls fail) without spending anything.
//
// Run: npx tsx app/lib/pb/pipeline-flow.test.mjs
import assert from "node:assert";
import { generatePbPosts, PbPipelineError } from "./pipeline.server.ts";
import { pbModelChain } from "./llm.server.ts";

const AZURE = "https://example-resource.cognitiveservices.azure.com/";
process.env.AZURE_OPENAI_ENDPOINT = AZURE;
process.env.AZURE_OPENAI_API_KEY = "azure-test-key-not-real";
// The direct OpenAI key is retired. It is set here only to prove nothing reads it.
process.env.OPENAI_API_KEY = "sk-retired-never-read";
delete process.env.PB_MODEL;
delete process.env.PB_WRITER_MODEL;

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
  globalThis.fetch = async (url, init) => {
    if (!String(url).startsWith(`${AZURE}openai/deployments/`)) throw new Error(`a model call left Azure: ${url}`);
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
    const model = String(url).match(/\/deployments\/([^/]+)\//)?.[1] ?? "";
    calls.push({ kind, post, model, json: Boolean(body.response_format), user });
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
  assert.ok(/^(here's the link i mentioned:|the link, if you want it:|link from the post:)\n/i.test(b.firstComment), "the comment line is written by code, so it cannot misdescribe the link");
  assert.ok(/Built on:/.test(a.angle), "the staff note says which story the post stands on");
  assert.strictEqual(count(calls, "revise"), 0);
  assert.strictEqual(count(calls, "fix"), 0);
  assert.strictEqual(count(calls, "draft"), 2);
  assert.strictEqual(count(calls, "comment"), 0, "no model call for the first comment");
  assert.deepStrictEqual(steps.slice(0, 3), ["dossier", "plan", "draft"]);
  assert.ok(steps.includes("review") && steps.includes("polish"));
  assert.ok(calls.every((c) => c.model === "gpt-5-mini"), "by default every call goes to the gpt-5-mini deployment on Azure");
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

// --- I. a review that skips checks is asked again, and never waves a post through
{
  const calls = fakeModel(({ kind, post, user }) => {
    if (kind === "dossier") return DOSSIER;
    if (kind === "plan") return PLAN;
    if (kind === "draft") return post === "giveaway" ? GIVEAWAY : PORTALS();
    if (kind === "review") return post === "giveaway" ? {} : allPass();
    if (kind === "comment") return "the link";
    if (kind === "revise" || kind === "fix") return post === "giveaway" ? GIVEAWAY : PORTALS();
    throw new Error(`unexpected ${kind} ${user.slice(0, 40)}`);
  });
  const posts = await generatePbPosts({ ...base });
  const a = posts.find((p) => p.hook.startsWith("2,100"));
  assert.strictEqual(a.review.verdict, "fix", "a post the reviewer never judged is held for a person, not delivered");
  assert.ok(a.review.items.every((i) => !i.pass) && a.review.items.every((i) => /no verdict/.test(i.note)), "and staff are told why");
  const giveawayReviews = calls.filter((c) => c.kind === "review" && c.post === "giveaway");
  assert.ok(giveawayReviews.length >= 2, "the reviewer is asked again for the missing checks");
  assert.strictEqual(calls.filter((c) => c.kind === "revise" && c.post === "giveaway").length, 0, "no rewrite is paid for when there is nothing to act on");
}

// --- J. a lint-only fix is reviewed again, and a fix that adds a lie is refused
{
  const SHORT = "34 applications. 1 reply.\n\nin 2nd year I applied to 34 marketing internships on job portals.\n\nI got 1 reply.\n\nI'm a campus ambassador for Studojo.\n\nthe link is in the comments if you want it.";
  const LIE = PORTALS("my manager Ritu Sharma said this is why nobody trusts interns.");
  fakeModel(({ kind, post, user }) => {
    if (kind === "dossier") return DOSSIER;
    if (kind === "plan") return PLAN;
    if (kind === "draft") return post === "giveaway" ? GIVEAWAY : SHORT;
    if (kind === "revise") return post === "giveaway" ? GIVEAWAY : SHORT;
    if (kind === "fix") return post === "giveaway" ? GIVEAWAY : LIE;
    if (kind === "review") {
      if (post !== "giveaway" && user.includes("Ritu Sharma")) return failing("people", '"Ritu Sharma" is a private person. Use "my manager".');
      return allPass();
    }
    if (kind === "comment") return "the link";
    throw new Error(`unexpected ${kind}`);
  });
  const posts = await generatePbPosts({ ...base });
  const b = posts.find((p) => p.mention === "cta");
  assert.ok(!b.body.includes("Ritu"), "a fix that names a private person is rejected after its review");
  assert.strictEqual(b.body, SHORT, "the reviewed version is kept instead");
}

// --- K. the first comment follows the student's capitalisation, and posts see each other's stories
{
  const calls = fakeModel(({ kind, post }) => {
    if (kind === "dossier") return DOSSIER;
    if (kind === "plan") return PLAN;
    if (kind === "draft") return post === "giveaway" ? GIVEAWAY : PORTALS();
    if (kind === "review") return allPass();
    throw new Error(`unexpected ${kind}`);
  });
  const lower = { ...profile, writingSample: "ok so this is how i write. everything starts small. no capitals here. that's just me lol. anyway it works for me and my friends. we all write like this most days. week 2 was better." };
  const posts = await generatePbPosts({ ...base, profile: lower });
  const b = posts.find((p) => p.mention === "cta");
  assert.ok(/^[a-z]/.test(b.firstComment), "a student who writes in lowercase gets a lowercase comment line");
  const drafts = calls.filter((c) => c.kind === "draft");
  assert.ok(drafts.every((c) => c.user.includes("## The other posts going out this week")), "each draft is told what the other posts in the batch tell");
  const giveawayDraft = drafts.find((c) => c.post === "giveaway");
  assert.ok(/34 applications/.test(giveawayDraft.user.split("## The other posts going out this week")[1].split("\n## ")[0]), "and so must not retell the portals story");
}

// --- H. Azure deployments, in order -------------------------------------------
{
  process.env.PB_WRITER_MODEL = "azure:gpt-4o-mini";
  const seen = [];
  const script = ({ kind, post }) => {
    if (kind === "dossier") return DOSSIER;
    if (kind === "plan") return PLAN;
    if (kind === "draft") return post === "giveaway" ? GIVEAWAY : PORTALS();
    if (kind === "review") return allPass();
    throw new Error(`unexpected ${kind}`);
  };
  fakeModel(script);
  const inner = globalThis.fetch;
  let missing = "";
  let quotaGone = false;
  const reply = (status, error) => ({ status, headers: { get: () => null }, text: async () => JSON.stringify({ error }) });
  globalThis.fetch = async (url, init) => {
    seen.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) });
    if (missing && String(url).includes(`/deployments/${missing}/`)) {
      return reply(404, { code: "DeploymentNotFound", message: "The API deployment for this resource does not exist." });
    }
    if (quotaGone) return reply(429, { code: "insufficient_quota", message: "quota exceeded" });
    return inner(url, init);
  };
  const posts = await generatePbPosts({ ...base });
  assert.strictEqual(posts.length, 2);
  assert.ok(seen.every((c) => c.url.startsWith(`${AZURE}openai/deployments/`) && c.url.includes("api-version=")), "every call goes to Azure, and the endpoint's trailing slash is handled");
  assert.ok(seen.every((c) => c.headers["api-key"] === "azure-test-key-not-real" && !c.headers.Authorization), "Azure is called with its own key header");
  assert.ok(seen.every((c) => !("model" in c.body)), "the deployment comes from the URL, not the body");
  const dossierCall = seen.find((c) => c.body.messages[0].content.startsWith("You read what a student told us"));
  const draftCall = seen.find((c) => c.body.messages[1].content.includes("## This post"));
  assert.ok(dossierCall.url.includes("/deployments/gpt-5-mini/"), "thinking stages use the main chain (gpt-5-mini first)");
  assert.ok(draftCall.url.includes("/deployments/gpt-4o-mini/"), "writing stages use PB_WRITER_MODEL");
  assert.ok("max_completion_tokens" in dossierCall.body && !("temperature" in dossierCall.body), "gpt-5-mini gets reasoning-model parameters");
  assert.ok("max_tokens" in draftCall.body && "temperature" in draftCall.body, "gpt-4o-mini gets classic parameters");

  // The writer's deployment is missing: writing moves to the next deployment and the job finishes.
  seen.length = 0;
  missing = "gpt-4o-mini";
  const after = await generatePbPosts({ ...base });
  assert.strictEqual(after.length, 2, "a missing deployment does not fail the job");
  assert.ok(seen.some((c) => c.url.includes("/deployments/gpt-4o-mini/")), "the missing deployment was tried");
  assert.ok(seen.some((c) => c.url.includes("/deployments/gpt-5-mini/") && c.body.messages[1].content.includes("## This post")), "and drafting moved on to gpt-5-mini");
  assert.ok(seen.every((c) => c.url.startsWith(AZURE)), "nothing falls back to OpenAI direct");
  missing = "";

  // An openai: override is ignored; Azure deployments stay.
  process.env.PB_MODEL = "openai:gpt-5.5, azure:gpt-4o-mini";
  assert.deepStrictEqual(pbModelChain(), ["azure:gpt-4o-mini", "azure:gpt-5-mini"]);
  delete process.env.PB_MODEL;

  // Out of quota on every deployment: a clear, permanent error, no other provider.
  seen.length = 0;
  quotaGone = true;
  await assert.rejects(() => generatePbPosts({ ...base }), (err) => err instanceof PbPipelineError && err.transient === false && /out of quota/.test(err.message));
  assert.ok(seen.length > 0 && seen.every((c) => c.url.startsWith(AZURE)), "only Azure was asked");
  quotaGone = false;

  // Azure not configured: a clear, permanent error. The retired key is still set and still unused.
  delete process.env.AZURE_OPENAI_ENDPOINT;
  delete process.env.AZURE_OPENAI_API_KEY;
  delete process.env.PB_WRITER_MODEL;
  await assert.rejects(() => generatePbPosts({ ...base }), (err) => err instanceof PbPipelineError && err.transient === false && /Azure OpenAI is not configured/.test(err.message));
}

console.log("pb pipeline flow: all assertions passed");
