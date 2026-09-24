import type { ContentAccount, ContentExample } from "./model";

/**
 * Prompt construction for the studio, kept free of the network and the
 * database so it can be tested directly.
 *
 * The voice is not in here. It arrives as `playbook`, the text of the rows on
 * /content/playbook, and is pasted in whole. What this file owns is the frame
 * around it: which account, which lane, what has already been said, and what
 * shape the answer has to come back in.
 */

/**
 * The account block.
 *
 * The lane is stated as a hard rule rather than left for the model to infer.
 * The playbook forbids webinar content on B2B profiles outright and switches
 * the CTA mechanic, and "Vivan runs Sensei" buried in a persona field is not
 * reliably read as either.
 */
export function accountContext(account: ContentAccount | null): string {
  if (!account) {
    return [
      "No specific account selected. Write in the shared Studojo founder voice.",
      "Treat this as a student-facing profile.",
    ].join("\n");
  }

  const lines = [
    `You are writing as ${account.displayName} (${account.handle}) on ${account.platform}.`,
    account.persona ? `Who they are: ${account.persona}` : null,
    account.audience ? `Who reads them: ${account.audience}` : null,
    account.notes ? `Notes: ${account.notes}` : null,
  ].filter(Boolean);

  if (account.lane === "b2b") {
    lines.push(
      "",
      "This is a B2B profile. Non-negotiable for this account:",
      "- No webinar content, ever. Not a mention, not a tie-in.",
      "- The reader is the person doing the prospecting, not the student being placed.",
      "- Work from the B2B employer-prospecting frame in the playbook.",
      "- CTA is direct response (DM me / my DMs are open), never a comment gate."
    );
  } else {
    lines.push(
      "",
      "This is a student-facing profile. The reader is an Indian college student",
      "who is applying and hearing nothing back."
    );
  }

  return lines.join("\n");
}

export function playbookBlock(playbook: string): string {
  if (!playbook.trim()) {
    return [
      "## The playbook",
      "No playbook entries are switched on. Say so rather than inventing a voice:",
      "the output will be generic and should not be trusted.",
    ].join("\n");
  }
  return [
    "## The playbook. This is the voice. It overrides your own instincts everywhere.",
    "Follow it literally, including the tier ordering, the kill check and the",
    "list of words that read as machine-written.",
    "",
    playbook,
  ].join("\n");
}

/**
 * Roster-wide dedup block.
 *
 * The playbook is explicit that an idea is done once it has run on any profile,
 * and that swapping the city or the number does not make it new, so both points
 * are said here rather than assumed.
 */
export function dedupBlock(used: string[]): string {
  if (used.length === 0) return "";
  return [
    "",
    "## Already used across the whole roster. Do not repeat these, and do not",
    "## repeat them with a different city, number, or name swapped in. The",
    "## playbook is explicit: a different city is not a new story.",
    ...used.slice(0, 120).map((t) => `- ${t}`),
  ].join("\n");
}

/**
 * Real posts, pasted in whole.
 *
 * This is the part that makes output sound like a person. The playbook
 * describes the voice; these are the voice. A model given rules about writing
 * produces competent generic writing, and a model given twelve real posts
 * produces something closer to a pastiche of them, which is what is wanted.
 *
 * Whole posts, never excerpts: the rhythm, the line breaks, where a paragraph
 * stops, and how a post ends are exactly the things an excerpt loses.
 */
export function voiceBlock(examples: ContentExample[]): string {
  if (examples.length === 0) {
    return [
      "## Real posts",
      "None have been added yet. Work from the playbook alone and expect the",
      "result to read more generic than it should.",
    ].join("\n");
  }

  return [
    "## Real posts that actually went out. This is the voice.",
    "Study the rhythm, the line breaks, where sentences stop, how the first",
    "line lands, and how each one ends. Match that. Do not quote or rework",
    "these, and do not reuse their subject matter: they are here for how they",
    "sound, not for what they are about.",
    "",
    ...examples.map((e, i) => {
      const meta = [
        e.accountHandle ? e.accountHandle : null,
        e.engagement != null ? `${e.engagement} engagement` : null,
        e.isExemplar ? "marked as a standout" : null,
      ]
        .filter(Boolean)
        .join(", ");
      return [
        `### Post ${i + 1}${meta ? ` (${meta})` : ""}`,
        '"""',
        e.body,
        '"""',
        "",
      ].join("\n");
    }),
  ].join("\n");
}

/**
 * What has been shortlisted and what has been binned.
 *
 * Taste that the playbook cannot state. A rejected hook is the more useful
 * half: "not this, in this specific way" is the thing rules are worst at
 * capturing and a person is fastest at supplying with one click.
 */
export function signalsBlock(signals: {
  liked: string[];
  rejected: string[];
}): string {
  const { liked, rejected } = signals;
  if (liked.length === 0 && rejected.length === 0) return "";

  const out = [
    "",
    "## Taste, learned from what actually gets picked",
    "These are real judgements made on generated hooks. They override your own",
    "sense of what is good.",
  ];

  if (liked.length) {
    out.push(
      "",
      "Hooks that were kept or written up. More like these:",
      ...liked.slice(0, 25).map((h) => `- ${h}`)
    );
  }
  if (rejected.length) {
    out.push(
      "",
      "Hooks that were binned. Do not produce hooks like these, and work out",
      "what they have in common before you write:",
      ...rejected.slice(0, 25).map((h) => `- ${h}`)
    );
  }
  return out.join("\n");
}

export function ideasSystemPrompt(
  account: ContentAccount | null,
  playbook: string,
  examples: ContentExample[] = [],
  signals: { liked: string[]; rejected: string[] } = { liked: [], rejected: [] }
): string {
  return [
    "You are the content lead for Studojo, running Mode 3 of the playbook below:",
    "idea brainstorm.",
    "",
    "## The account",
    accountContext(account),
    "",
    playbookBlock(playbook),
    "",
    voiceBlock(examples),
    signalsBlock(signals),
    "",
    "## What a good batch looks like",
    "- Ideas should surprise even you. If an idea could have come from any",
    "  careers brand, it is not an idea, it is a topic.",
    "- Push toward ideas the audience would argue with, ideas that connect two",
    "  things nobody has connected, or ideas that make the reader uncomfortable.",
    "- At least one personal story or plain milestone idea per batch. The",
    "  playbook marks these as the strongest and most underused format.",
    "- Weight hooks toward Tier 1. Reach for Tier 2 when the situation fits.",
    "  Do not lead a batch with Tier 3.",
    "- Every idea needs a story engine. An idea with no engine is an essay.",
    "- Each hook must pass the viral bar: would someone screenshot that line",
    "  alone and send it to a friend?",
    "- The hook is the literal first line of the post. Lowercase first word,",
    "  except the sanctioned webinar/value register.",
    "",
    "## The hook has to be personal",
    "This is where generated ideas usually fail, so treat it as the bar, not a",
    "preference. A hook is personal when it could only have been written by the",
    "person whose account this is.",
    "- First person. Something they did, saw, got told, or got wrong.",
    "- A real moment with a time, a place, a name, or a number in it. Not a",
    "  category of moment.",
    "- If the hook would still make sense posted from any other careers account,",
    "  it is not personal enough. Throw it out and write another.",
    "- No rhetorical questions at the reader, no \"here is what I learned\", no",
    "  observations about the industry in the abstract.",
    "Look at the real posts above and note how often the first line is something",
    "that happened rather than something believed. Do that.",
  ].join("\n");
}

export function ideasUserPrompt(
  brief: string,
  used: string[],
  count: number
): string {
  return [
    brief
      ? `Brief: ${brief}`
      : "No brief. Work from the playbook, this account's lane, and what has not been used.",
    dedupBlock(used),
    "",
    'Return JSON: {"ideas":[{"title":"","hook":"","hookType":"","hookTier":"","storyEngine":"","angle":"","cinematicDetail":"","whyItWorks":"","whyDifferent":"","pillar":""}]}',
    "",
    "- title: what the post is, under 90 characters. Not the hook.",
    "- hook: the literal first line, exactly as it would be typed.",
    "- hookType: the playbook hook type by name, for example Confrontational Truth.",
    "- hookTier: Tier 1, Tier 2 or Tier 3.",
    "- storyEngine: which of the seven engines carries it, by name.",
    "- angle: the specific argument, one or two sentences. Not the topic.",
    "- cinematicDetail: the one concrete detail the post is built around. A name,",
    "  a city, a time, a number, a line someone actually said. If you cannot name",
    "  one, the idea is not ready, replace it.",
    "- whyItWorks: why this lands with this audience, one sentence.",
    "- whyDifferent: how this differs from the used list above. Be specific about",
    "  which used idea it is closest to and what makes it a different entry point.",
    "- pillar: two or three words.",
    "",
    `Return exactly ${count} ideas. Do not invent statistics, client results, or`,
    "named people who did not do the thing. Where a real number would go and you",
    "do not have one, say what number is needed in cinematicDetail.",
  ].join("\n");
}

export type DraftContext = {
  account: ContentAccount | null;
  title: string;
  hook?: string | null;
  hookType?: string | null;
  storyEngine?: string | null;
  angle?: string | null;
  cinematicDetail?: string | null;
  /** The current draft. Present means refine, absent means write from scratch. */
  existingBody?: string | null;
  /** What to change this round. The "retrain it" half of the loop. */
  instruction?: string | null;
  /** Earlier instructions, oldest first, so corrections are not undone. */
  priorInstructions?: string[];
};

export function draftSystemPrompt(
  ctx: DraftContext,
  playbook: string,
  examples: ContentExample[] = [],
  signals: { liked: string[]; rejected: string[] } = { liked: [], rejected: [] }
): string {
  const refining = Boolean(ctx.existingBody?.trim());
  return [
    "You are the content lead for Studojo, running Mode 2 of the playbook below:",
    refining
      ? "refine an existing post so it lands harder and follows the playbook."
      : "write a finished LinkedIn post, ready to publish.",
    "",
    "## The account",
    accountContext(ctx.account),
    "",
    playbookBlock(playbook),
    "",
    voiceBlock(examples),
    signalsBlock(signals),
    "",
    "## Order of work",
    "1. Fix the story engine before writing a word.",
    "2. Write the hook. Apply the viral bar. Favour Tier 1.",
    "3. Build the body around the story, not around the information.",
    "4. 80 to 150 words for an insight or hook-driven post. Up to 250 only when",
    "   there is a real scene to build. Webinar and value posts follow their own",
    "   register and can run longer.",
    "5. Studojo appears after the reader has got something, except on milestone",
    "   and personal-story posts.",
    "6. The CTA matches the goal. Comment-gate for offers on student profiles,",
    "   a real question for stories, direct response on B2B.",
    "7. Run the Do Not Sound Like AI checklist against your own draft.",
    "8. Run the kill check. Fix anything that fails before you answer.",
    "",
    "## Before you answer",
    "Read your draft next to the real posts above. If it reads smoother, more",
    "even, or more explained than they do, it is wrong. Those posts have",
    "fragments, abrupt stops, and lines that do not balance. Match that, do not",
    "improve on it.",
    "",
    "## Output",
    "The post body only. No title, no preamble, no commentary, no markdown",
    "fences, no hashtags. Line breaks as LinkedIn renders them, short paragraphs.",
  ].join("\n");
}

export function draftUserPrompt(ctx: DraftContext): string {
  const refining = Boolean(ctx.existingBody?.trim());
  return [
    `Post: ${ctx.title}`,
    ctx.hook ? `Hook to work from: ${ctx.hook}` : null,
    ctx.hookType ? `Hook type: ${ctx.hookType}` : null,
    ctx.storyEngine ? `Story engine: ${ctx.storyEngine}` : null,
    ctx.angle ? `Angle: ${ctx.angle}` : null,
    ctx.cinematicDetail ? `Build it around this detail: ${ctx.cinematicDetail}` : null,
    ctx.priorInstructions?.length
      ? [
          "",
          "Corrections already applied on earlier rounds. Keep honouring these,",
          "do not undo them while making the new change:",
          ...ctx.priorInstructions.map((i) => `- ${i}`),
        ].join("\n")
      : null,
    refining
      ? [
          "",
          "Current draft:",
          '"""',
          ctx.existingBody,
          '"""',
          "",
          ctx.instruction
            ? `Change this round: ${ctx.instruction}`
            : "No specific instruction. Make it land harder against the playbook and cut anything that reads as machine-written.",
          "",
          "Rewrite the whole post. Keep what is working, do not restart from nothing.",
        ].join("\n")
      : ctx.instruction
        ? `\nExtra instructions: ${ctx.instruction}`
        : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function killCheckSystemPrompt(
  account: ContentAccount | null,
  playbook: string,
  examples: ContentExample[] = []
): string {
  return [
    "You are a hostile editor running the kill check from the playbook below on",
    "a draft LinkedIn post. You did not write it. Your job is to find what is",
    "wrong with it, not to be encouraging.",
    "",
    "## The account",
    accountContext(account),
    "",
    playbookBlock(playbook),
    "",
    voiceBlock(examples),
    "",
    "Judge only what is in the draft. Do not rewrite it. A check passes only if",
    "it clearly passes: when you are unsure, it fails.",
  ].join("\n");
}

export function killCheckUserPrompt(input: {
  body: string;
  hasVisual: boolean;
  wordCount: number;
  used: string[];
}): string {
  return [
    "Draft:",
    '"""',
    input.body,
    '"""',
    "",
    `A visual (image, carousel or video) is ${input.hasVisual ? "planned" : "NOT planned"}.`,
    `Word count: ${input.wordCount}.`,
    input.used.length ? dedupBlock(input.used) : "",
    "",
    'Return JSON: {"items":[{"check":"","pass":true,"note":""}],"verdict":"pass"}',
    "",
    "One item per kill-check point in the playbook, in the playbook's order,",
    'then one item named "Sounds like AI" covering the Do Not Sound Like AI',
    'list, then one named "Sounds like the real posts" comparing the draft',
    "against the real posts above: it fails if the draft is smoother, more even",
    'or more explained than they are. Finally one named "Hook is personal": it',
    "fails if the first line could have been posted from any other careers",
    "account. Use the playbook's own wording for the playbook's own checks.",
    "note: one short sentence. On a fail, name the exact word, line or missing",
    "thing. On a pass, say nothing longer than a few words.",
    'verdict: "pass" only if every item passes, otherwise "fix".',
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * The playbook bans em dashes and curly quotes as AI tells, and the model
 * emits both anyway. Cheaper to strip than to re-prompt.
 */
export function cleanTells(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}
