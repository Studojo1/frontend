import { stripDashesDeep } from "~/lib/strip-dashes";

/**
 * Reads one talk back to the fellow who gave it, as text (nothing is spoken
 * back): what we heard, what can become a post, what we'll leave out and why,
 * up to three follow-up questions they can answer next, and one tip for next
 * time. Fellows talk to their page for as long as they like, and not all of it
 * is material; this tells them which parts are, while they can still add more.
 *
 * Azure OpenAI, as in app/workers/prescreen.ts (AZURE_OPENAI_ENDPOINT and
 * AZURE_OPENAI_API_KEY from app-secrets). On 3 Nov 2026 the OpenAI and
 * Anthropic keys on this deployment had both run out of credit; Azure hadn't.
 * The job is telling a real moment from filler, and a vague read-back is worse
 * than none, so it gets gpt-4o (gpt-5-mini read as well but often took over a
 * minute on this resource): one call per talk, text only, a couple of rupees. The answer comes back in a fixed JSON shape.
 */

const AZURE_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/+$/, "");
const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";
const DEPLOYMENT = process.env.FELLOW_COACH_DEPLOYMENT?.trim() || "gpt-4o";

/** Characters of talk sent; a longer talk (well over an hour) keeps its start and its end. */
export const TALK_SENT_MAX = 60_000;
const LINE_MAX = 240;

export interface CoachProfile {
  first: string;
  course: string;
  college: string;
  field: string;
  wants: string;
  avoid: string;
}
export interface CoachInput {
  profile: CoachProfile;
  asked: string | null;
  talk: string;
  /** One line for each story they shared before, so the questions don't ask for those again. */
  earlier: string[];
  /** When the talk answers a follow-up question: the story that question was about. */
  followsUp?: string | null;
}
export interface Coach {
  heard: string[];
  useful: string[];
  skip: string[];
  next: string[];
  tip: string;
}
/** Sends the system and user messages and returns the model's answer as JSON text. Tests pass their own. */
export type CoachAsk = (system: string, user: string) => Promise<string>;

export class CoachUnavailable extends Error {}

export const COACH_SYSTEM = `You read back a talk from a student in the Studojo Growth Fellowship. They spoke (speech-to-text, so expect wrong words and missing punctuation) or typed about their own life. Writers turn what students share into LinkedIn posts under the student's name: three a week about their growth, their work and the people they meet, and two that mention Studojo. You don't write posts. You tell the student, briefly, what came through and how to make their next answer more useful.

Material for a post: one specific moment (where, when, who was there), what they did, what happened next, a result or a number, what changed in how they think, an honest setback, a person who helped them.
Not material: general opinions with no moment behind them, repeating the question, mic checks and filler, plans with nothing done yet, long background that leads nowhere, other people's private or confidential details (client work, a company's numbers, a friend's problems), complaints about named people or colleges.

Answer with these fields:
"heard": 1 to 3 short lines on what they talked about, in plain words, starting "You talked about" or similar.
"useful": 0 to 4 lines, each naming one specific bit that can become a post, with the exact detail they gave (the number, the name, the time, the place), so they recognise it. Empty when nothing can be used.
"skip": 0 to 3 lines, each a part we'll leave out with a short reason. Empty when nothing needs leaving out.
"next": 1 to 3 questions that would turn the best bit into a strong post. Each asks for one concrete missing fact only (a name, a date, a number, the exact moment, what happened next), in under 20 words, so they can answer it by talking. Not "how did it feel" or "what did it mean to you". Never ask for something they already said, here or before.
"tip": one line on how to talk next time.

Rules: talk to them as "you". At most 25 words a line. Warm but direct, like a good mentor: no praise words (great, amazing, awesome, impressive, wonderful), no exclamation marks, no emojis, no em dashes. If the talk is mostly irrelevant or empty, say so gently and without blame in "heard", leave "useful" empty, and use "next" to point them to a real moment worth telling. Never invent anything they didn't say.`;

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

export function coachUserMessage(i: CoachInput): string {
  const p = i.profile;
  const talk = i.talk.length > TALK_SENT_MAX
    ? `${i.talk.slice(0, TALK_SENT_MAX / 2)}\n[the middle of a long talk is left out here]\n${i.talk.slice(-TALK_SENT_MAX / 2)}`
    : i.talk;
  return [
    `Student: ${p.first || "the student"}${p.course ? `, ${p.course}` : ""}${p.college ? ` at ${p.college}` : ""}.${p.field ? ` Field: ${p.field}.` : ""}`,
    p.wants ? `What they want from the fellowship: ${p.wants}` : "",
    p.avoid ? `Topics they want to avoid: ${p.avoid}` : "",
    `Question they were answering: ${i.asked || "none, they picked their own topic"}`,
    i.followsUp ? `That was a follow-up question about this earlier story of theirs, so read the two together:\n"""\n${clip(i.followsUp, 6000)}\n"""` : "",
    i.earlier.length ? `Stories they shared before (don't ask for these again):\n${i.earlier.map((e) => `- ${e}`).join("\n")}` : "",
    `Their talk:\n"""\n${talk}\n"""`,
  ].filter(Boolean).join("\n\n");
}

/** The model's answer as a read-back, every line trimmed and capped; throws when it isn't one. */
export function parseCoach(raw: string): Coach {
  let o: Record<string, unknown>;
  try {
    o = JSON.parse(raw);
  } catch {
    throw new CoachUnavailable("the model's answer wasn't JSON");
  }
  if (!o || typeof o !== "object") throw new CoachUnavailable("the model's answer wasn't an object");
  const lines = (v: unknown, n: number) =>
    (Array.isArray(v) ? v : typeof v === "string" ? [v] : [])
      .filter((x): x is string => typeof x === "string")
      .map((x) => clip(x.replace(/\s+/g, " ").trim(), LINE_MAX))
      .filter(Boolean)
      .slice(0, n);
  const coach = stripDashesDeep({
    heard: lines(o.heard, 3),
    useful: lines(o.useful, 4),
    skip: lines(o.skip, 3),
    next: lines(o.next, 3),
    tip: lines(o.tip, 1)[0] ?? "",
  });
  if (!coach.heard.length || !coach.next.length) throw new CoachUnavailable("the model's answer missed heard or next");
  return coach;
}

const COACH_SHAPE = {
  name: "read_back",
  strict: true,
  schema: {
    type: "object",
    properties: {
      heard: { type: "array", items: { type: "string" } },
      useful: { type: "array", items: { type: "string" } },
      skip: { type: "array", items: { type: "string" } },
      next: { type: "array", items: { type: "string" } },
      tip: { type: "string" },
    },
    required: ["heard", "useful", "skip", "next", "tip"],
    additionalProperties: false,
  },
};

const askAzure: CoachAsk = async (system, user) => {
  if (!AZURE_ENDPOINT || !AZURE_KEY) throw new CoachUnavailable("AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY is not set");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(`${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2025-01-01-preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": AZURE_KEY },
      body: JSON.stringify({
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        max_completion_tokens: 4000,
        response_format: { type: "json_schema", json_schema: COACH_SHAPE },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new CoachUnavailable(`the model answered ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string; refusal?: string } }[] };
    const msg = data.choices?.[0]?.message;
    if (msg?.refusal) throw new CoachUnavailable("the model declined this talk");
    if (!msg?.content) throw new CoachUnavailable("the model sent no answer");
    return msg.content;
  } catch (e) {
    if (e instanceof CoachUnavailable) throw e;
    throw new CoachUnavailable(controller.signal.aborted ? "the model took too long" : "the model couldn't be reached");
  } finally {
    clearTimeout(timer);
  }
};

export async function readBack(input: CoachInput, ask: CoachAsk = askAzure): Promise<Coach> {
  return parseCoach(await ask(COACH_SYSTEM, coachUserMessage(input)));
}
