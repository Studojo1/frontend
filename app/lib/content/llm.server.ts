import { playbookPrompt } from "./store.server";
import type { ContentAccount } from "./model";

/**
 * The model calls behind the idea generator and the writer.
 *
 * Same provider and key as the rest of the repo (OPENAI_API_KEY, see
 * app/lib/chat/llm.server.ts). Model defaults to gpt-4o rather than the
 * gpt-4o-mini used for support chat: those answers are three sentences of
 * routing, these are posts that go out under a real name.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.CONTENT_MODEL?.trim() || "gpt-4o";

export class ContentLlmError extends Error {}

type ChatMessage = { role: "system" | "user"; content: string };

async function chat(
  messages: ChatMessage[],
  opts: { json?: boolean; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new ContentLlmError(
      "OPENAI_API_KEY is not set on this environment, so generation is off."
    );
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts.temperature ?? 0.8,
      max_tokens: opts.maxTokens ?? 1600,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ContentLlmError(
      `The model call failed (${res.status}). ${detail.slice(0, 300)}`
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new ContentLlmError("The model returned nothing.");
  return content;
}

/** Em dashes are banned in Studojo copy, and the model emits them anyway. */
function stripEmDashes(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ", ").replace(/,\s*,/g, ",");
}

function accountContext(account: ContentAccount | null): string {
  if (!account) {
    return "No specific account selected. Write in a neutral, credible voice.";
  }
  return [
    `Account: ${account.displayName} (${account.handle}) on ${account.platform}.`,
    account.persona ? `Voice and persona: ${account.persona}` : null,
    account.audience ? `Audience: ${account.audience}` : null,
    account.notes ? `Notes: ${account.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function baseSystem(account: ContentAccount | null, task: string) {
  const playbook = await playbookPrompt();
  return [
    `You are the content lead for Studojo. Your job right now: ${task}`,
    "",
    "## Account you are writing for",
    accountContext(account),
    "",
    playbook
      ? `## The playbook. These rules override your own instincts.\n${playbook}`
      : "## The playbook\nNo playbook entries yet. Fall back on plain, concrete, specific writing.",
    "",
    "## Hard rules",
    "- Never use em dashes. Use a comma, a colon, or two sentences.",
    "- No engagement bait, no 'Agree?', no 'Thoughts?', no emoji walls.",
    "- Concrete over abstract. Name the number, the company, the situation.",
    "- Never invent statistics, names, or client results.",
    "- Write like a person who has actually done the thing, not a brand account.",
  ].join("\n");
}

export type GeneratedIdea = {
  title: string;
  angle: string;
  hook: string;
  whyItWorks: string;
  pillar: string;
};

/**
 * Idea generation. Returns structured ideas rather than prose so they can be
 * kept, binned, and promoted into a draft one by one.
 */
export async function generateIdeas(input: {
  account: ContentAccount | null;
  brief: string;
  count?: number;
  avoidTitles?: string[];
}): Promise<GeneratedIdea[]> {
  const count = Math.min(Math.max(input.count ?? 6, 1), 12);
  const system = await baseSystem(
    input.account,
    `generate ${count} post ideas that this account could credibly publish.`
  );

  const avoid = input.avoidTitles?.length
    ? `\n\nAlready used, do not repeat these or near-duplicates:\n${input.avoidTitles
        .slice(0, 40)
        .map((t) => `- ${t}`)
        .join("\n")}`
    : "";

  const user = [
    `Brief from the operator: ${input.brief || "No brief. Use the playbook and the account's usual pillars."}`,
    avoid,
    "",
    `Return JSON exactly in this shape: {"ideas":[{"title":"","angle":"","hook":"","whyItWorks":"","pillar":""}]}`,
    "- title: what the post is about, under 90 characters.",
    "- angle: the specific take, one or two sentences. Not the topic, the argument.",
    "- hook: the literal first line of the post.",
    "- whyItWorks: why this lands with this audience, one sentence.",
    "- pillar: which content pillar it belongs to, two or three words.",
    `Return exactly ${count} ideas.`,
  ].join("\n");

  const raw = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { json: true, maxTokens: 2000 }
  );

  let parsed: { ideas?: GeneratedIdea[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ContentLlmError("The model returned something that was not JSON.");
  }

  const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
  if (ideas.length === 0) throw new ContentLlmError("No ideas came back.");

  return ideas.slice(0, count).map((i) => ({
    title: stripEmDashes(String(i.title ?? "").trim()).slice(0, 200),
    angle: stripEmDashes(String(i.angle ?? "").trim()),
    hook: stripEmDashes(String(i.hook ?? "").trim()),
    whyItWorks: stripEmDashes(String(i.whyItWorks ?? "").trim()),
    pillar: stripEmDashes(String(i.pillar ?? "").trim()).slice(0, 60),
  }));
}

/**
 * The writer. Produces the post body only, ready to paste, because that is
 * what goes into the scheduler.
 */
export async function draftPost(input: {
  account: ContentAccount | null;
  title: string;
  angle?: string | null;
  hook?: string | null;
  instructions?: string | null;
  existingBody?: string | null;
}): Promise<string> {
  const rewriting = Boolean(input.existingBody?.trim());
  const system = await baseSystem(
    input.account,
    rewriting
      ? "rewrite an existing post so it follows the playbook more closely."
      : "write a finished post, ready to publish."
  );

  const user = [
    `Post topic: ${input.title}`,
    input.angle ? `Angle: ${input.angle}` : null,
    input.hook ? `Opening line to work from: ${input.hook}` : null,
    input.instructions ? `Extra instructions: ${input.instructions}` : null,
    rewriting ? `\nCurrent draft to rewrite:\n"""\n${input.existingBody}\n"""` : null,
    "",
    "Return the post body only. No title, no preamble, no commentary, no markdown fences.",
    "Use line breaks the way the platform renders them. Short paragraphs.",
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { maxTokens: 1600, temperature: 0.75 }
  );

  // The model sometimes wraps the post in a fence despite being told not to.
  const unfenced = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "");
  return stripEmDashes(unfenced.trim());
}
