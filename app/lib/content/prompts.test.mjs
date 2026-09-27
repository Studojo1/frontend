// The prompts are the product here: the voice, the dedup discipline and the
// B2B rules all live in what reaches the model. A silently dropped playbook
// block produces fluent, generic, wrong output, which is the failure mode
// hardest to spot by eye. So assert on the assembled text.
//
// Run: npx tsx app/lib/content/prompts.test.mjs
import assert from "node:assert";
import {
  accountContext,
  playbookBlock,
  dedupBlock,
  ideasSystemPrompt,
  ideasUserPrompt,
  draftSystemPrompt,
  draftUserPrompt,
  killCheckUserPrompt,
  cleanTells,
} from "./prompts.server.ts";
import seed from "./playbook-seed.json" with { type: "json" };

const student = {
  id: 1,
  handle: "jeremy",
  platform: "linkedin",
  displayName: "Jeremy",
  persona: "Studojo founder.",
  audience: "Indian college students.",
  notes: null,
  accent: "purple",
  active: true,
  lane: "student",
  postsPerWeek: 2,
};
// Mirrors the seeded Vivan row, including its own audience: reusing the
// student audience here would make the lane assertions meaningless.
const b2b = {
  ...student,
  id: 4,
  handle: "vivan",
  displayName: "Vivan",
  lane: "b2b",
  persona: "Runs the B2B lane for Sensei, the automated employer prospecting product.",
  audience: "Founders and BD/placement teams at training institutes, TPOs, staffing agencies.",
  notes: "B2B. No webinar content, ever.",
};

const PLAYBOOK = seed.map((e) => `### ${e.title}\n${e.body}`).join("\n\n");

/* ---- the seed actually carries the skill, not a truncated copy ---- */
assert.ok(PLAYBOOK.includes("Confrontational Truth"), "hook types present");
assert.ok(PLAYBOOK.includes("The Kill Check"), "kill check present");
assert.ok(PLAYBOOK.includes("Do Not Sound Like AI"), "AI tells present");
assert.ok(PLAYBOOK.includes("Story Engine"), "story engines present");
assert.ok(PLAYBOOK.includes("Done Ideas"), "done ideas present");
assert.ok(PLAYBOOK.includes("Tier 1"), "hook tiers present");
assert.ok(!PLAYBOOK.includes("name: studojo-content"), "frontmatter stripped");
assert.ok(PLAYBOOK.length > 30000, `playbook is substantial, got ${PLAYBOOK.length}`);

/* ---- the lane changes the rules, it is not a label ---- */
const b2bCtx = accountContext(b2b);
assert.ok(b2bCtx.includes("No webinar content, ever"), "B2B bans webinars");
assert.ok(b2bCtx.includes("never a comment gate"), "B2B CTA rule stated");
assert.ok(!b2bCtx.includes("Indian college student"), "B2B is not student framed");

const studentCtx = accountContext(student);
assert.ok(studentCtx.includes("Indian college student"), "student framing");
assert.ok(!studentCtx.includes("No webinar content"), "no B2B rule leaks to student");
assert.ok(studentCtx.includes("Jeremy"), "names the account");

// No account still has to produce a usable frame, not an empty one.
const noneCtx = accountContext(null);
assert.ok(noneCtx.includes("student-facing"), "defaults to student lane");

/* ---- the playbook is pasted whole, never summarised away ---- */
const block = playbookBlock(PLAYBOOK);
assert.ok(block.includes(PLAYBOOK), "playbook passed through verbatim");
assert.ok(block.includes("overrides your own instincts"), "framed as authoritative");
// An empty playbook must announce itself rather than quietly producing slop.
assert.ok(
  playbookBlock("").includes("should not be trusted"),
  "empty playbook is flagged, not hidden"
);
assert.ok(playbookBlock("   ").includes("should not be trusted"), "whitespace counts as empty");

/* ---- dedup reaches the model, with the city-swap rule spelled out ---- */
const used = ["if you're not from IIT, nobody's coming to save your career", "Pune to Paris"];
const dedup = dedupBlock(used);
assert.ok(dedup.includes("Pune to Paris"), "used angles listed");
assert.ok(dedup.includes("different city is not a new story"), "city-swap rule stated");
assert.equal(dedupBlock([]), "", "no block when nothing is used");
// The list is capped so a year of history cannot crowd out the playbook.
const many = Array.from({ length: 300 }, (_, i) => `angle ${i}`);
const capped = dedupBlock(many);
assert.ok(capped.includes("angle 119"), "keeps the first 120");
assert.ok(!capped.includes("angle 120"), "caps at 120");

/* ---- the ideas prompt carries all three: account, playbook, dedup ---- */
const ideasSys = ideasSystemPrompt(b2b, PLAYBOOK);
assert.ok(ideasSys.includes("No webinar content, ever"), "lane rules in ideas prompt");
assert.ok(ideasSys.includes("Confrontational Truth"), "playbook in ideas prompt");
assert.ok(ideasSys.includes("Tier 1"), "tier guidance present");
assert.ok(ideasSys.includes("personal story or plain milestone"), "milestone quota present");

const ideasUser = ideasUserPrompt("cold email", used, 6);
assert.ok(ideasUser.includes("Return exactly 6 ideas"), "count is explicit");
assert.ok(ideasUser.includes("Pune to Paris"), "dedup reaches the user turn");
assert.ok(ideasUser.includes("cinematicDetail"), "asks for the concrete detail");
assert.ok(ideasUser.includes("Do not invent statistics"), "fabrication guard present");
assert.ok(
  ideasUserPrompt("", [], 3).includes("No brief"),
  "an empty brief is handled, not blank"
);

/* ---- the refine loop replays earlier corrections ---- */
const fresh = draftUserPrompt({ title: "t" });
assert.ok(!fresh.includes("Current draft"), "no draft block when writing from scratch");

const refine = draftUserPrompt({
  title: "t",
  existingBody: "the current text",
  instruction: "harder opening",
  priorInstructions: ["cut the last line", "name the company"],
});
assert.ok(refine.includes("Current draft"), "draft block when refining");
assert.ok(refine.includes("Change this round: harder opening"), "new instruction");
assert.ok(refine.includes("cut the last line"), "round-two correction replayed");
assert.ok(refine.includes("name the company"), "round-three correction replayed");
assert.ok(refine.includes("do not undo them"), "told to preserve corrections");
// Order matters: oldest first, so the model reads them as accumulated.
assert.ok(
  refine.indexOf("cut the last line") < refine.indexOf("name the company"),
  "prior instructions stay in order"
);

assert.ok(
  draftSystemPrompt({ title: "t", existingBody: "x" }, PLAYBOOK).includes("refine an existing post"),
  "system prompt switches mode when refining"
);
assert.ok(
  draftSystemPrompt({ title: "t" }, PLAYBOOK).includes("write a finished LinkedIn post"),
  "system prompt switches mode when writing fresh"
);

/* ---- the kill check is told the truth about the visual ---- */
const noVisual = killCheckUserPrompt({ body: "x", hasVisual: false, wordCount: 1, used: [] });
assert.ok(noVisual.includes("NOT planned"), "missing visual is reported");
const withVisual = killCheckUserPrompt({ body: "x", hasVisual: true, wordCount: 1, used: [] });
assert.ok(withVisual.includes("is planned"), "present visual is reported");
assert.ok(!withVisual.includes("NOT planned"), "no contradiction");

/* ---- the AI tells the playbook bans are stripped from output ---- */
assert.equal(cleanTells("a — b"), "a, b", "em dash becomes a comma");
assert.equal(cleanTells("a – b"), "a, b", "en dash too");
assert.equal(cleanTells("‘x’"), "'x'", "curly singles straightened");
assert.equal(cleanTells("“x”"), '"x"', "curly doubles straightened");
assert.equal(cleanTells("plain text"), "plain text", "clean text is untouched");

console.log("content prompts: all assertions passed");
