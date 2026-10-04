// JRS coach: what it can and cannot do.
//
// The coach only edits the resume's written content (through ops). It has no
// way to touch the template, fonts, spacing or layout, and before this file it
// never said so: asked to "change the format" it answered as if it could.
// The wording lives here so the panel, the scripted onboarding and the LLM
// endpoint all say the same thing, and the endpoint enforces it rather than
// trusting the model to remember.

/** Always visible at the top of the chat panel. */
export const COACH_SCOPE_NOTE =
  "I can add, rewrite and remove what's written on your resume. I can't change its format (template, fonts, spacing, colours, layout). Use the Template button and the Edit tab for that.";

/** The reply to any request to change how the resume looks. */
export const FORMAT_LIMIT_REPLY =
  "I can't change the format of your resume. That means the template, fonts, text size, spacing, colours and layout. You can change those yourself: the Template button at the top switches the design, Compact / Normal / Roomy sets the spacing, and the toolbar in the Edit tab sets the font, size and line spacing. What I can do is add, rewrite or remove what's written on the resume.";

/** Prepended when a message mixed a format request with a content change. */
export const FORMAT_LIMIT_SHORT =
  "I can't change the format of your resume, only what's written on it. Use the Template button and the Edit tab for the look.";

/** Section of the system prompt that states the coach's limits. */
export const COACH_SCOPE_PROMPT = `WHAT YOU CAN AND CANNOT DO
- You can ONLY change the written content of the resume, through OPS: contact details, summary, experience, education, projects and skills. You can add, rewrite, shorten or remove them.
- You CANNOT change how the resume looks. That covers the format, template, design, theme, fonts, text size, bold/italic/underline, colours, margins, spacing, line height, columns, alignment, layout, section order and page breaks. No op does any of this.
- You also CANNOT download, export, print or email the resume, read or upload files, change the order of entries, score the resume against a job, or write cover letters.
- When the user asks for something you cannot do, say plainly in your FIRST sentence that you can't do it. Never say or imply that you did it. Never answer "done" or "sure". Then tell them where they can do it themselves:
  - Template or design: the Template button at the top.
  - Spacing: the Compact / Normal / Roomy switch at the top.
  - Font, text size, line spacing, heading bold/italic/underline, page breaks: the toolbar in the Edit tab.
  - Colours and overall layout come from the template, so they need a different template.
  - Order of entries: the up and down arrows in the Edit tab.
  - Download: the Download PDF button. Job scoring and tailoring: the Job match tab.
  - The Auto-format button only polishes wording, it does not change the look.
- Page length: you can't set the page count. Say so, suggest Compact spacing, and offer to shorten the content.
- If one message mixes something you can do with something you can't, do the content part with ops and say clearly which part you can't do.
- If the user asks what you can do or how you can help, tell them both what you can and what you cannot do.
- Never claim a change you did not emit an op for.
- Set "limit" in your output: "format" when the user asked to change how the resume looks, "other" for any other request you cannot do, null otherwise.`;

const ASK =
  /\b(change|switch|swap|make|use|set|update|modify|edit|fix|adjust|redo|redesign|increase|decrease|reduce|bigger|smaller|larger|different|another|new|better|can you|could you|can u|will you|how do i|how to|i want|i need|i'd like|please|pls)\b/i;
const LOOK =
  /\b(format|formatting|reformat|template|templates|layout|font|fonts|typeface|font size|text size|colou?rs?|margins?|spacing|line height|columns?|theme|bold|italics?|underline|alignment)\b/i;

/**
 * True when the text asks to change how the resume looks. Needs both a
 * request word and a look word, so a role like "Layout Designer" or a bullet
 * about "a new colour palette" on its own noun does not trip it.
 */
export function isFormatRequest(text: string): boolean {
  const t = String(text || "");
  if (/\breformat\b/i.test(t)) return true;
  return ASK.test(t) && LOOK.test(t);
}

const SAYS_CANNOT = /\b(can[’']?t|cannot|can not|not able to|unable to)\b/i;

/**
 * Final say on the reply. The model is told to refuse format requests and to
 * flag them with limit:"format"; this makes the refusal explicit even when it
 * waffles, forgets the flag, or claims it did the change.
 */
export function enforceCoachLimits(input: {
  userText: string;
  reply: string;
  limit: unknown;
  opsCount: number;
}): string {
  const { userText, reply, limit, opsCount } = input;
  const flagged = limit === "format";
  if (opsCount === 0) {
    return flagged || isFormatRequest(userText) ? FORMAT_LIMIT_REPLY : reply;
  }
  // Content was changed too: keep the model's account of that, and make sure
  // the format refusal is in there.
  if (flagged && !SAYS_CANNOT.test(reply)) return `${FORMAT_LIMIT_SHORT} ${reply}`.trim();
  return reply;
}
