import type { ContentExample } from "~/lib/content/model";
import { describeError } from "~/lib/error-detail";
import type { hookSignals } from "~/lib/content/store.server";
import { PB_FORMATS, type NewPbPost, type PbProfile, type PbReviewItem, type PbStep } from "./model";
import { pbChat, PbPipelineError, type PbCallInfo, type PbChatMessage, type PbEffort } from "./llm.server";
import {
  dossierSystemPrompt,
  dossierUserPrompt,
  draftUserPrompt,
  fixUserPrompt,
  pickCraftExamples,
  planSystemPrompt,
  planUserPrompt,
  reviewSystemPrompt,
  reviewUserPrompt,
  reviseUserPrompt,
  sourceText,
  studentSourceText,
  writerSystemPrompt,
  type PbCandidate,
  type PbCohortPost,
  type PbDossier,
  type PbEnding,
  type PbFailedCheck,
  type PbMention,
  type PbPastPost,
  type PbPostPlan,
  type PbSeed,
  type PbVoice,
} from "./prompts.server";
import {
  REVIEW_CHECKS,
  hookOf,
  lintPost,
  normaliseChars,
  numbersIn,
  parseAvoidList,
  polishPost,
  similarity,
  firstCommentFor,
  voiceStats,
  wordCount,
  type LintIssue,
  type ReviewCheckId,
} from "./polish";

/**
 * The sequence that turns one student's profile into finished LinkedIn posts.
 *
 *   1. dossier  read what they told us and extract, never invent, the story
 *               seeds, the concrete details and how they write
 *   2. plan     propose several angles only this student could post, steering
 *               away from their past posts and from the rest of the cohort
 *   3. select   pick a varied set in code and decide where Studojo may appear
 *   4. draft    write each post in their voice (posts run side by side)
 *   5. review   a cold, hostile second reader plus the deterministic lint
 *   6. revise   fix only what failed, at most twice, and keep the best version
 *   7. polish   final deterministic clean-up, one targeted fix if the lint
 *               still objects, and the first comment for posts with a link
 *
 * DB-free on purpose: everything it needs comes in through the input, so the
 * same code runs in the job runner, in a test and in a local evaluation.
 */

export { PbPipelineError };

export type PbCorpus = {
  playbook: string;
  examples: ContentExample[];
  signals: Awaited<ReturnType<typeof hookSignals>>;
};

export type PbGenerateInput = {
  profile: PbProfile;
  brief: string;
  postsWanted: number;
  mention: "mix" | "none" | "soft" | "cta";
  /** Tracked link for the first comment of cta posts. */
  link: string | null;
  pastPosts: PbPastPost[];
  cohortPosts: PbCohortPost[];
  corpus: PbCorpus;
  onStep?: (step: PbStep) => void | Promise<void>;
  signal?: AbortSignal;
  /**
   * After this long, no new revise or fix round starts: each post returns its
   * best version so far, so a slow model costs polish, not the posts.
   */
  softDeadlineMs?: number;
  /** Every model call attempt, for timing in evaluations. */
  onCall?: (info: PbCallInfo) => void;
};

/** How hard the model thinks at each stage. Writing and judging get the most. */
const EFFORT: Record<string, PbEffort> = {
  dossier: "low",
  plan: "medium",
  draft: "medium",
  review: "medium",
  revise: "medium",
  fix: "low",
};

/** Output budgets. For reasoning models these include the thinking. */
const BUDGET = { dossier: 6000, plan: 8000, draft: 6000, review: 5000, revise: 6000, fix: 4000 } as const;

const MAX_REVISE_ROUNDS = 2;
/** Checks a model judges by taste. One lone taste failure does not buy a second rewrite. */
const TASTE_CHECKS: readonly ReviewCheckId[] = ["hook", "voice", "specific", "structure", "close"];

/* ------------------------------------------------------------- helpers */

function clean(v: unknown, max = 600): string {
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v !== "string") return "";
  return normaliseChars(v).replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanList(v: unknown, maxItems: number, maxLen = 300): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    const s = clean(x, maxLen);
    if (s && !out.includes(s)) out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

function num(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function record(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function fold(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function checkAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) throw new PbPipelineError("Generation was stopped.", true);
}

/* ------------------------------------------------------------- dossier */

/**
 * A detail belongs to the student only if their own words carry it: most of
 * its words and every one of its numbers must appear in what they typed. The
 * dossier stage is told to copy, and this is what holds it to that.
 */
function isGrounded(detail: string, foldedSource: string, sourceNumbers: Set<string>): boolean {
  const words = fold(detail).split(" ").filter((w) => w.length > 2);
  if (words.length === 0) return false;
  const hits = words.filter((w) => foldedSource.includes(w)).length;
  if (hits / words.length < 0.7) return false;
  return numbersIn(detail).every((n) => n === "0" || n === "1" || sourceNumbers.has(n));
}

function fallbackSeeds(p: PbProfile): PbSeed[] {
  const seeds: PbSeed[] = [];
  (p.stories ?? []).forEach((s, i) => {
    const text = s.text?.trim();
    if (!text) return;
    seeds.push({
      id: `s${seeds.length + 1}`,
      from: `story ${i + 1}`,
      summary: clean(text, 220),
      details: [],
      tension: "",
      potential: 5,
      why: "",
    });
  });
  if (seeds.length === 0 && wordCount(p.writingSample ?? "") >= 40) {
    seeds.push({
      id: "s1",
      from: "writing sample",
      summary: clean(p.writingSample, 220),
      details: [],
      tension: "",
      potential: 4,
      why: "",
    });
  }
  return seeds;
}

/** The model's dossier, checked against the student's own words before anything trusts it. */
export function toDossier(json: unknown, p: PbProfile): PbDossier {
  const j = record(json);
  const source = sourceText(p, "");
  const foldedSource = fold(source);
  const sourceNumbers = new Set(numbersIn(source));
  const sample = p.writingSample ?? "";
  const foldedSample = fold(sample);
  const stats = voiceStats(sample);

  const seeds: PbSeed[] = [];
  for (const raw of Array.isArray(j.seeds) ? j.seeds : []) {
    const s = record(raw);
    const summary = clean(s.summary, 260);
    if (!summary) continue;
    seeds.push({
      id: `s${seeds.length + 1}`,
      from: clean(s.from, 40) || "their input",
      summary,
      details: cleanList(s.details, 6, 160).filter((d) => isGrounded(d, foldedSource, sourceNumbers)),
      tension: clean(s.tension, 240),
      potential: num(s.potential, 1, 10, 5),
      why: clean(s.why, 240),
    });
    if (seeds.length >= 10) break;
  }
  seeds.sort((a, b) => b.potential - a.potential);
  seeds.forEach((s, i) => {
    s.id = `s${i + 1}`;
  });

  const v = record(j.voice);
  const hasSample = wordCount(sample) >= 40;
  const voice: PbVoice = {
    source: hasSample ? "sample" : "settings",
    sentences: clean(v.sentences, 240),
    vocabulary: clean(v.vocabulary, 240),
    opens: clean(v.opens, 240),
    humour: clean(v.humour, 240),
    quirks: clean(v.quirks, 300),
    capitalisation: clean(v.capitalisation, 200),
    // Only phrases that really are in the sample: the writer may borrow one.
    phrases: hasSample ? cleanList(v.phrases, 5, 80).filter((ph) => fold(ph).length > 2 && foldedSample.includes(fold(ph))) : [],
  };

  const saysStudojo = /studojo/i.test(source);
  return {
    who: clean(j.who, 260) || clean(`${p.name}, ${p.headline}`, 260),
    credibleOn: cleanList(j.credibleOn, 6, 80),
    seeds: seeds.length ? seeds : fallbackSeeds(p),
    voice,
    noGos: cleanList(j.noGos, 12, 160),
    // What they said about Studojo can only come from their own words.
    studojoFacts: saysStudojo ? cleanList(j.studojoFacts, 4, 200).filter((f) => isGrounded(f, foldedSource, sourceNumbers)) : [],
    stats,
  };
}

/* ---------------------------------------------------------------- plan */

/**
 * Which of the student's own pieces a seed comes from. Two seeds the dossier
 * split out of one story ("the app crashed", "the float bug") are still one
 * story to the student's followers, so variety is judged on this.
 */
function storyOf(seed: PbSeed): string {
  const from = fold(seed.from);
  return /^(story \d+|writing sample|headline|goals|extra)$/.test(from) ? from : seed.id;
}

const ENDINGS: readonly PbEnding[] = ["question", "line", "goal"];

/** Candidates from the planner, held to the dossier and kept clear of hooks already out there. */
export function toCandidates(json: unknown, d: PbDossier, taken: string[]): PbCandidate[] {
  const out: PbCandidate[] = [];
  const list = record(json).candidates;
  for (const raw of Array.isArray(list) ? list : []) {
    const c = record(raw);
    const hook = clean(c.hook, 200);
    const angle = clean(c.angle, 300);
    if (!hook || !angle) continue;
    const seedId = clean(c.seed, 10).toLowerCase();
    const detail = clean(c.detail, 200);
    // An id the dossier does not have ("1", "seed 2") is resolved through the
    // detail it names; failing that the candidate is dropped, never filed
    // under someone else's story.
    const seed =
      d.seeds.find((s) => s.id === seedId) ??
      (detail ? d.seeds.find((s) => s.details.some((x) => fold(x) === fold(detail))) : undefined);
    if (!seed) continue;
    // A planned hook that echoes a past post or another student's is dropped here, before any writing.
    if (taken.some((t) => similarity(t, hook) >= 0.6)) continue;
    const format = clean(c.format, 20).toLowerCase();
    const ending = clean(c.ending, 20).toLowerCase() as PbEnding;
    // The detail a post hangs on must be one the dossier already verified.
    const exact = seed.details.find((x) => fold(x) === fold(detail));
    const near = detail ? seed.details.find((x) => fold(x).includes(fold(detail)) || fold(detail).includes(fold(x))) : undefined;
    out.push({
      format: (PB_FORMATS as readonly string[]).includes(format) ? format : "story",
      seed: seed.id,
      story: storyOf(seed),
      detail: exact ?? near ?? seed.details[0] ?? "",
      hookType: clean(c.hookType, 80),
      storyEngine: clean(c.storyEngine, 80),
      hook,
      angle,
      ending: ENDINGS.includes(ending) ? ending : "line",
      whySuits: clean(c.whySuits, 240),
      whyDifferent: clean(c.whyDifferent, 240),
      studojoFit: num(c.studojoFit, 0, 10, 0),
      studojoHow: clean(c.studojoHow, 240),
      score: num(c.score, 1, 10, 5),
    });
  }
  return out;
}

/**
 * Pick the posts to write, in code. The planner scores; this enforces variety
 * (a different story, a different shape, a different first line for each) and
 * decides where Studojo appears, so no prompt can talk its way into three
 * posts on one story or a mention that is not true.
 */
export function selectPlans(
  candidates: PbCandidate[],
  want: number,
  ctx: {
    policy: "mix" | "none" | "soft" | "cta";
    relation: string;
    studojoFacts: string[];
    brief: string;
    hasLink: boolean;
    /** Seeds an earlier post already stood on. They lose to an unused story unless far stronger. */
    usedSeeds?: string[];
  }
): PbPostPlan[] {
  const used = new Set(ctx.usedSeeds ?? []);
  const rank = (c: PbCandidate) => c.score - (used.has(c.seed) || used.has(c.story ?? "") ? 3 : 0);
  const sorted = [...candidates].sort((a, b) => rank(b) - rank(a));
  const picked: PbCandidate[] = [];
  const tooClose = (c: PbCandidate) => picked.some((p) => similarity(p.hook, c.hook) >= 0.5);
  // One story per post: never two posts on the same story while another story is available.
  const storyKey = (c: PbCandidate) => c.story ?? c.seed;
  const sameStory = (c: PbCandidate) => picked.some((p) => storyKey(p) === storyKey(c));
  const rules: ((c: PbCandidate) => boolean)[] = [
    (c) => !sameStory(c) && !picked.some((p) => p.format === c.format) && !tooClose(c),
    (c) => !sameStory(c) && !tooClose(c),
    (c) => !picked.some((p) => p.seed === c.seed) && !tooClose(c),
    (c) => !picked.some((p) => p.seed === c.seed && p.format === c.format) && !tooClose(c),
    () => true,
  ];
  for (const ok of rules) {
    for (const c of sorted) {
      if (picked.length >= want) break;
      if (!picked.includes(c) && ok(c)) picked.push(c);
    }
  }

  // A mention has to be true. With no connection and nothing they said about
  // Studojo there is nothing honest to say, whatever the batch setting asks.
  // Someone who works with Studojo always has one true thing to say: their
  // role. A plain user only has what their own words say they did with it,
  // and only where the planner found that it truly belongs in the post.
  const affiliated = ["ambassador", "intern", "team", "partner"].includes(ctx.relation);
  const canMention = affiliated || ctx.studojoFacts.length > 0;
  const askLevel: PbMention = ctx.hasLink ? "cta" : "soft";
  const mentions: PbMention[] = picked.map(() => "none");
  if (canMention) {
    if (ctx.policy === "soft" || ctx.policy === "cta") {
      const level: PbMention = ctx.policy === "soft" ? "soft" : askLevel;
      picked.forEach((c, i) => {
        mentions[i] = affiliated || c.studojoFit >= 6 ? level : "none";
      });
    } else if (ctx.policy === "mix") {
      // Mostly none: the first post never mentions Studojo, at most one does,
      // and only where the planner found a natural, truthful place for it.
      // Someone who works with Studojo always has one true thing to say (their
      // role), so one of their later posts always carries it, in the place the
      // planner rated most natural. A plain user needs a real fit: their own
      // story has to involve Studojo.
      const bar = affiliated ? 0 : 6;
      let best = -1;
      picked.forEach((c, i) => {
        if (i > 0 && c.studojoFit >= bar && (best < 0 || c.studojoFit > picked[best].studojoFit)) best = i;
      });
      if (best > 0) mentions[best] = /studojo|dojo/i.test(ctx.brief) ? askLevel : "soft";
    }
  }
  const plans: PbPostPlan[] = picked.map((candidate, i) => ({
    candidate,
    mention: mentions[i],
    ending: mentions[i] === "cta" ? "ask" : candidate.ending,
  }));
  // Every post closing on a question is its own template. When all of one
  // student's posts would, the last one lands on a plain line instead.
  const open = plans.filter((p) => p.ending !== "ask");
  if (open.length >= 2 && open.every((p) => p.ending === "question")) open[open.length - 1].ending = "line";
  return plans;
}

/* -------------------------------------------------------------- review */

type ModelVerdicts = Map<string, { pass: boolean; note: string }>;

function toVerdicts(json: unknown): ModelVerdicts {
  const out: ModelVerdicts = new Map();
  const items = record(json).items;
  for (const entry of Array.isArray(items) ? items : []) {
    const it = record(entry);
    const given = clean(it.id ?? it.check, 80).toLowerCase();
    const bare = given.replace(/[^a-z]/g, "");
    const id = REVIEW_CHECKS.find((c) => c.id === given || c.id === bare || fold(c.label) === fold(given))?.id;
    if (!id || out.has(id)) continue;
    out.set(id, { pass: it.pass === true || it.pass === "true", note: clean(it.note, 320) });
  }
  return out;
}

type Assessment = {
  /** The model's own verdicts, kept so the lint half can be recomputed after a small fix. */
  model: ModelVerdicts;
  items: (PbReviewItem & { id: ReviewCheckId })[];
  failed: PbFailedCheck[];
  /** Failures a rewrite can act on: everything except a check the reviewer simply did not answer. */
  actionable: PbFailedCheck[];
  passed: string[];
  fails: number;
  hardFails: number;
  /** Failures on truth: invented facts, a private person named, a Studojo claim, a wrong disclosure. */
  critical: number;
};

/** Checks about what is TRUE in the post. One of these outweighs any number of style problems. */
const TRUTH_CHECKS: readonly ReviewCheckId[] = ["facts", "people", "studojo", "mention"];

export const NO_VERDICT_NOTE = "The reviewer gave no verdict on this check, so a person should read the post.";

/** One verdict per check: the model's judgement, overruled by the lint wherever code can tell. */
function assess(model: ModelVerdicts, lint: LintIssue[]): Assessment {
  const rows = REVIEW_CHECKS.map((c) => {
    const m = model.get(c.id);
    const issues = lint.filter((l) => l.check === c.id).map((l) => l.message);
    // An unanswered check fails: a reply that skips checks must never wave a post through.
    const modelFailed = m ? !m.pass : true;
    const pass = !modelFailed && issues.length === 0;
    const modelNote = m ? (modelFailed ? m.note : "") : NO_VERDICT_NOTE;
    const note = pass ? (m?.note ?? "") : [...issues, modelNote].filter(Boolean).join(" ");
    const actionNote = [...issues, m && modelFailed ? m.note : ""].filter(Boolean).join(" ");
    return { id: c.id, check: c.label as string, pass, note: note.slice(0, 500), missing: !m, actionNote };
  });
  const items = rows.map(({ id, check, pass, note }) => ({ id, check, pass, note }));
  const failedRows = rows.filter((i) => !i.pass);
  const lintChecks = new Set(lint.map((l) => l.check));
  return {
    model,
    items,
    failed: failedRows.map((i) => ({ id: i.id, label: i.check, note: i.note || "Does not meet this check." })),
    actionable: failedRows
      .filter((i) => i.actionNote)
      .map((i) => ({ id: i.id, label: i.check, note: i.actionNote })),
    passed: items.filter((i) => i.pass).map((i) => i.check),
    fails: failedRows.length,
    hardFails: failedRows.filter((i) => i.missing || !TASTE_CHECKS.includes(i.id) || lintChecks.has(i.id)).length,
    critical: failedRows.filter((i) => TRUTH_CHECKS.includes(i.id)).length,
  };
}

/** Compares two reviewed versions: truth failures first, then other hard failures, then all failures. Negative means `a` is better. */
function compareVersions(a: Assessment, b: Assessment): number {
  return a.critical - b.critical || a.hardFails - b.hardFails || a.fails - b.fails;
}

/** For revisions: at least as good, so a tie goes to `a`, the newer version that has had more fixes. */
function atLeastAsGood(a: Assessment, b: Assessment): boolean {
  return compareVersions(a, b) <= 0;
}

/** For the final fix: kept only when it is strictly better, never on a tie that might swap a style problem for a lie. */
function strictlyBetter(a: Assessment, b: Assessment): boolean {
  return compareVersions(a, b) < 0;
}

/* ------------------------------------------------------------ pipeline */

type Ctx = {
  input: PbGenerateInput;
  dossier: PbDossier;
  /** Every post planned in this batch, so each draft knows what the others tell. */
  plans: PbPostPlan[];
  source: string;
  studentSource: string;
  /** Epoch ms after which no new revise or fix round starts, or null for none. */
  softDeadline: number | null;
  avoid: string[];
  taken: { who: string; hook: string }[];
  writerSystem: string;
  reviewSystem: string;
  step: (s: PbStep) => Promise<void>;
};

/** Stages whose output is the post itself; they may use a different model. */
const WRITING_STAGES: readonly string[] = ["draft", "revise", "fix"];

function call(ctx: Ctx, stage: keyof typeof BUDGET, label: string, messages: PbChatMessage[], json: boolean) {
  return pbChat(messages, {
    label,
    role: WRITING_STAGES.includes(stage) ? "write" : "think",
    json,
    maxTokens: BUDGET[stage],
    effort: EFFORT[stage],
    temperature: json ? 0.3 : 0.85,
    signal: ctx.input.signal,
    onCall: ctx.input.onCall,
  });
}

function lintFor(ctx: Ctx, plan: PbPostPlan, body: string, brokenLines: string[]): LintIssue[] {
  const p = ctx.input.profile;
  const issues = lintPost(body, {
    format: plan.candidate.format,
    mention: plan.mention,
    relation: p.relation,
    emoji: p.emoji,
    avoid: ctx.avoid,
    source: ctx.source,
    studentSource: ctx.studentSource,
    sample: p.writingSample ?? "",
    brokenLines,
  });
  // The one cohort rule code can hold: a first line that echoes a past post
  // or another student's is a template, whatever the reviewer thinks of it.
  const hook = hookOf(body);
  const echo = ctx.taken.find((t) => similarity(t.hook, hook) >= 0.6);
  if (echo) {
    issues.push({
      code: "hook_echo",
      check: "specific",
      message: `The first line is too close to ${echo.who}: "${echo.hook.slice(0, 90)}". Open from a detail only this student has.`,
    });
  }
  return issues;
}

async function reviewPost(ctx: Ctx, plan: PbPostPlan, body: string, brokenLines: string[], n: number, round: number): Promise<Assessment> {
  const { profile, brief, cohortPosts } = ctx.input;
  const messages: PbChatMessage[] = [
    { role: "system", content: ctx.reviewSystem },
    { role: "user", content: reviewUserPrompt({ profile, dossier: ctx.dossier, brief, body, plan, cohort: cohortPosts }) },
  ];
  const res = await call(ctx, "review", `review ${n}.${round}`, messages, true);
  let verdicts = toVerdicts(res.json);
  if (verdicts.size < REVIEW_CHECKS.length) {
    // A reply that skipped checks gets one more ask for exactly the missing ones.
    const missing = REVIEW_CHECKS.filter((c) => !verdicts.has(c.id)).map((c) => c.id);
    checkAborted(ctx.input.signal);
    const again = await call(
      ctx,
      "review",
      `review ${n}.${round} again`,
      [
        ...messages,
        { role: "assistant", content: res.text.slice(0, 6000) },
        { role: "user", content: `You gave no verdict for: ${missing.join(", ")}. Return JSON with all twelve items, using exactly these ids: ${REVIEW_CHECKS.map((c) => c.id).join(", ")}.` },
      ],
      true
    );
    const second = toVerdicts(again.json);
    for (const [k, v] of verdicts) if (!second.has(k)) second.set(k, v);
    verdicts = second;
  }
  return assess(verdicts, lintFor(ctx, plan, body, brokenLines));
}

/** One line per other post in the batch: the story it stands on and its angle. */
function siblingsOf(ctx: Ctx, plan: PbPostPlan): string[] {
  return ctx.plans
    .filter((p) => p !== plan)
    .map((p) => {
      const seed = ctx.dossier.seeds.find((x) => x.id === p.candidate.seed);
      return [seed?.summary, seed?.details.join(", "), p.candidate.angle].filter(Boolean).join(". ");
    });
}

/** Draft, review, revise and polish one post. */
async function writeOne(ctx: Ctx, plan: PbPostPlan, n: number): Promise<NewPbPost> {
  const { profile, brief, pastPosts, cohortPosts, corpus, signal, link } = ctx.input;
  const d = ctx.dossier;
  const polish = (raw: string) => polishPost(raw, { emoji: profile.emoji });

  // 4. Draft. Their material and the plan first, their voice last.
  const examples = pickCraftExamples(corpus.examples, { seed: `${profile.userId}:${n}`, sample: profile.writingSample ?? "", n: 3 });
  const draft = await call(
    ctx,
    "draft",
    `draft ${n}`,
    [
      { role: "system", content: ctx.writerSystem },
      { role: "user", content: draftUserPrompt({ profile, dossier: d, brief, plan, past: pastPosts, cohort: cohortPosts, examples, siblings: siblingsOf(ctx, plan) }) },
    ],
    false
  );
  let current = polish(draft.text);
  if (!current.body) throw new PbPipelineError("The writing model returned an empty post.", true);
  checkAborted(signal);

  // 5. Review: a separate cold reader, so the writer is not marking its own homework.
  await ctx.step("review");
  let assessment = await reviewPost(ctx, plan, current.body, current.brokenLines, n, 1);
  let best = { body: current.body, brokenLines: current.brokenLines, assessment };
  let rounds = 1;
  const late = () => ctx.softDeadline !== null && Date.now() > ctx.softDeadline;

  // 6. Revise: only what failed, and never more than twice. A lone taste
  // failure after the first rewrite is left for staff to see rather than
  // paid for with another full round.
  for (let r = 1; r <= MAX_REVISE_ROUNDS; r++) {
    // Nothing a rewrite can act on (no failures, or only checks the reviewer left unanswered).
    if (assessment.actionable.length === 0) break;
    if (r > 1 && assessment.hardFails === 0 && assessment.fails < 2) break;
    if (late()) break;
    checkAborted(signal);
    await ctx.step("revise");
    const revised = await call(
      ctx,
      "revise",
      `revise ${n}.${r}`,
      [
        { role: "system", content: ctx.writerSystem },
        {
          role: "user",
          content: reviseUserPrompt({ profile, dossier: d, brief, plan, body: current.body, failed: assessment.actionable, passed: assessment.passed }),
        },
      ],
      false
    );
    current = polish(revised.text);
    if (!current.body) break;
    checkAborted(signal);
    assessment = await reviewPost(ctx, plan, current.body, current.brokenLines, n, r + 1);
    rounds++;
    // Keep the better version: factual failures weigh first; on a tie the later one, which has had more fixes.
    if (atLeastAsGood(assessment, best.assessment)) best = { body: current.body, brokenLines: current.brokenLines, assessment };
  }

  // 7. Polish. If the lint, or the reviewer on a matter of fact, still
  // objects, one small targeted correction: a few words changed, not another
  // rewrite, because rewrites are where new embellishments creep in.
  await ctx.step("polish");
  let body = best.body;
  let final = best.assessment;
  const lintLeft = lintFor(ctx, plan, body, best.brokenLines);
  const factual: string[] = [];
  for (const c of REVIEW_CHECKS) {
    const m = final.model.get(c.id);
    if (m && !m.pass && !TASTE_CHECKS.includes(c.id)) factual.push(`${c.label}: ${m.note || "does not meet this check."}`);
  }
  const issues = [...lintLeft.map((l) => l.message), ...factual];
  if (issues.length > 0 && !late()) {
    checkAborted(signal);
    const fixed = await call(
      ctx,
      "fix",
      `fix ${n}`,
      [
        { role: "system", content: ctx.writerSystem },
        { role: "user", content: fixUserPrompt({ profile, dossier: d, plan, body, issues }) },
      ],
      false
    );
    const after = polish(fixed.text);
    if (after.body) {
      // Every fix is judged again before it is kept: even a "small" fix is a
      // rewrite, and rewrites are where new embellishments creep in.
      checkAborted(signal);
      const again = await reviewPost(ctx, plan, after.body, after.brokenLines, n, rounds + 1);
      rounds++;
      if (strictlyBetter(again, final)) {
        body = after.body;
        final = again;
      }
    }
  }
  if (!body.trim()) throw new PbPipelineError("The writing model returned an empty post.", true);

  // First comment, for posts that end with an ask: a plain line and the
  // tracked link, both from code. Nothing a model writes can misdescribe it.
  const stats = d.stats;
  const lowercase = stats ? stats.lowercaseStarts * 2 > stats.sentences : false;
  const firstComment = plan.mention === "cta" && link ? firstCommentFor(`${profile.userId}:${n}`, link, lowercase) : null;

  const seed = d.seeds.find((s) => s.id === plan.candidate.seed);
  const angle = [plan.candidate.angle, seed ? `Built on: ${seed.summary}` : ""].filter(Boolean).join(" ").slice(0, 400);
  return {
    body,
    hook: hookOf(body),
    angle,
    format: plan.candidate.format,
    mention: plan.mention,
    firstComment,
    review: {
      items: final.items.map(({ check, pass, note }) => ({ check, pass, note })),
      verdict: final.fails === 0 ? "pass" : "fix",
      rounds,
    },
  };
}

export async function generatePbPosts(input: PbGenerateInput): Promise<NewPbPost[]> {
  const { profile, brief, pastPosts, cohortPosts, corpus, signal } = input;
  const startedAt = Date.now();
  const want = Math.min(3, Math.max(1, Math.round(Number(input.postsWanted) || 1)));
  const step = async (s: PbStep) => {
    await input.onStep?.(s);
  };

  // 1. Dossier. Extraction only: every later stage treats it as the truth about the student.
  checkAborted(signal);
  await step("dossier");
  const dossierRes = await pbChat(
    [
      { role: "system", content: dossierSystemPrompt() },
      { role: "user", content: dossierUserPrompt(profile) },
    ],
    { label: "dossier", json: true, maxTokens: BUDGET.dossier, effort: EFFORT.dossier, temperature: 0.2, signal, onCall: input.onCall }
  );
  const dossier = toDossier(dossierRes.json, profile);
  if (dossier.seeds.length === 0) {
    throw new PbPipelineError("This profile has no stories or writing sample yet, so there is nothing true to write from.", false);
  }

  // 2. Plan. More angles than needed, so selection has real choices.
  checkAborted(signal);
  await step("plan");
  const taken = [
    ...pastPosts.map((x) => ({ who: "one of their own past posts", hook: x.hook })),
    ...cohortPosts.map((x) => ({ who: "another student's post", hook: x.hook })),
  ].filter((t) => t.hook.trim());
  const count = want >= 3 ? 8 : 6;
  const planMessages: PbChatMessage[] = [
    { role: "system", content: planSystemPrompt(corpus.playbook, corpus.signals?.rejected ?? []) },
    { role: "user", content: planUserPrompt({ profile, dossier, brief, policy: input.mention, count, past: pastPosts, cohort: cohortPosts }) },
  ];
  const planOpts = { label: "plan", json: true, maxTokens: BUDGET.plan, effort: EFFORT.plan, temperature: 0.9, signal, onCall: input.onCall };
  let candidates = toCandidates((await pbChat(planMessages, planOpts)).json, dossier, taken.map((t) => t.hook));
  if (candidates.length < want) {
    // Too few survived the checks: one more ask rather than writing from a thin list.
    checkAborted(signal);
    const more = toCandidates((await pbChat(planMessages, { ...planOpts, label: "plan again" })).json, dossier, taken.map((t) => t.hook));
    candidates = [...candidates, ...more.filter((m) => !candidates.some((c) => similarity(c.hook, m.hook) >= 0.6))];
  }
  if (candidates.length === 0) throw new PbPipelineError("The planner found no usable angle for this profile.", true);

  // 3. Select. A story an earlier post already told waits behind the ones not yet used.
  const usedSeeds = dossier.seeds
    .filter((s) => pastPosts.some((x) => similarity(x.angle.split("Built on:")[1] ?? x.angle, s.summary) >= 0.5))
    .flatMap((s) => [s.id, storyOf(s)]);
  const plans = selectPlans(candidates, want, {
    policy: input.mention,
    relation: profile.relation,
    studojoFacts: dossier.studojoFacts,
    brief,
    hasLink: Boolean(input.link),
    usedSeeds,
  });

  const ctx: Ctx = {
    input,
    dossier,
    plans,
    source: sourceText(profile, brief),
    studentSource: studentSourceText(profile),
    softDeadline: input.softDeadlineMs ? startedAt + input.softDeadlineMs : null,
    avoid: parseAvoidList(profile.avoid),
    taken,
    writerSystem: writerSystemPrompt(corpus.playbook),
    reviewSystem: reviewSystemPrompt(corpus.playbook),
    step,
  };

  // 4 to 7, one chain per post, side by side.
  checkAborted(signal);
  await step("draft");
  const settled = await Promise.allSettled(plans.map((plan, i) => writeOne(ctx, plan, i + 1)));
  const posts: NewPbPost[] = [];
  let firstError: unknown = null;
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") {
      posts.push(s.value);
      return;
    }
    firstError ??= s.reason;
    // Staff only see the posts that made it; the log says why the others did not.
    const stack = s.reason instanceof Error && s.reason.stack ? ` | ${s.reason.stack.split("\n").slice(1, 4).map((l) => l.trim()).join(" | ")}` : "";
    console.error(`[pb-pipeline] post ${i + 1} of ${plans.length} failed: ${describeError(s.reason)}${s.reason instanceof PbPipelineError ? "" : stack}`);
  });
  checkAborted(signal);
  // One post failing does not throw away the ones that worked.
  if (posts.length === 0) {
    if (firstError instanceof PbPipelineError) throw firstError;
    // An error that is not the pipeline's own is a bug, and retrying a bug only triples the spend.
    throw new PbPipelineError(`No post could be written for this student: ${describeError(firstError)}`, false, { cause: firstError });
  }
  return posts;
}
