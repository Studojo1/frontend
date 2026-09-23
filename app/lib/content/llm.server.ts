import { playbookPrompt } from "./store.server";
import {
  ideasSystemPrompt,
  ideasUserPrompt,
  draftSystemPrompt,
  draftUserPrompt,
  killCheckSystemPrompt,
  killCheckUserPrompt,
  cleanTells,
  type DraftContext,
} from "./prompts.server";
import type { ContentAccount, KillCheck } from "./model";

export type { DraftContext };

/**
 * The model calls behind the idea generator, the writer and the kill check.
 *
 * Same provider and key as the rest of the repo (OPENAI_API_KEY, see
 * app/lib/chat/llm.server.ts). Model defaults to gpt-4o rather than the
 * gpt-4o-mini used for support chat: those answers are three sentences of
 * routing, these are posts that go out under a real person's name.
 *
 * Almost none of the voice lives in this file. It lives in the playbook rows,
 * which hold the studojo-content skill, and is pasted in whole. That is
 * deliberate: changing how posts read should be an edit on /content/playbook,
 * not a pull request.
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
      temperature: opts.temperature ?? 0.9,
      max_tokens: opts.maxTokens ?? 2000,
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

function parseJson<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ContentLlmError("The model returned something that was not JSON.");
  }
}

function str(v: unknown): string {
  return cleanTells(String(v ?? "").trim());
}

/* ------------------------------------------------------------------- ideas */

export type GeneratedIdea = {
  title: string;
  hook: string;
  hookType: string;
  hookTier: string;
  storyEngine: string;
  angle: string;
  cinematicDetail: string;
  whyDifferent: string;
  whyItWorks: string;
  pillar: string;
};

/**
 * Mode 3 from the playbook: idea brainstorm.
 *
 * Structured rather than prose so each idea can be shortlisted, binned, or
 * pushed straight into the writer with its hook type and story engine intact.
 * The writer then does not have to re-derive the angle from a title.
 */
export async function generateIdeas(input: {
  account: ContentAccount | null;
  brief: string;
  count?: number;
  usedAngles?: string[];
}): Promise<GeneratedIdea[]> {
  const count = Math.min(Math.max(input.count ?? 6, 1), 12);
  const playbook = await playbookPrompt();

  const raw = await chat(
    [
      { role: "system", content: ideasSystemPrompt(input.account, playbook) },
      {
        role: "user",
        content: ideasUserPrompt(input.brief, input.usedAngles ?? [], count),
      },
    ],
    { json: true, maxTokens: 3000, temperature: 0.95 }
  );

  const parsed = parseJson<{ ideas?: Record<string, unknown>[] }>(raw);
  const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
  if (ideas.length === 0) throw new ContentLlmError("No ideas came back.");

  return ideas.slice(0, count).map((i) => ({
    title: str(i.title).slice(0, 200),
    hook: str(i.hook),
    hookType: str(i.hookType).slice(0, 80),
    hookTier: str(i.hookTier).slice(0, 20),
    storyEngine: str(i.storyEngine).slice(0, 80),
    angle: str(i.angle),
    cinematicDetail: str(i.cinematicDetail),
    whyDifferent: str(i.whyDifferent),
    whyItWorks: str(i.whyItWorks),
    pillar: str(i.pillar).slice(0, 60),
  }));
}

/* ------------------------------------------------------------------ writer */

/**
 * Mode 2 from the playbook: full post.
 *
 * Returns the body only. That is what gets pasted into LinkedIn, and a model
 * that returns a title and a preamble means someone hand-deletes two lines
 * every single time.
 */
export async function draftPost(ctx: DraftContext): Promise<string> {
  const playbook = await playbookPrompt();

  const raw = await chat(
    [
      { role: "system", content: draftSystemPrompt(ctx, playbook) },
      { role: "user", content: draftUserPrompt(ctx) },
    ],
    { maxTokens: 1600, temperature: 0.85 }
  );

  // The model wraps the post in a fence now and then despite being told not to.
  const unfenced = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "");
  return cleanTells(unfenced.trim());
}

/* -------------------------------------------------------------- kill check */

/**
 * The playbook's kill check, run against a finished draft.
 *
 * A separate call rather than a line in the writer's prompt: a model grading
 * the draft it just produced in the same breath marks its own homework. This
 * one is given the draft cold, with no memory of having written it, and is
 * told to be hostile.
 */
export async function runKillCheck(input: {
  account: ContentAccount | null;
  body: string;
  hasVisual: boolean;
  usedAngles?: string[];
}): Promise<KillCheck> {
  const wordCount = input.body.trim().split(/\s+/).filter(Boolean).length;
  const playbook = await playbookPrompt();

  const raw = await chat(
    [
      { role: "system", content: killCheckSystemPrompt(input.account, playbook) },
      {
        role: "user",
        content: killCheckUserPrompt({
          body: input.body,
          hasVisual: input.hasVisual,
          wordCount,
          used: input.usedAngles ?? [],
        }),
      },
    ],
    { json: true, maxTokens: 2000, temperature: 0.2 }
  );

  const parsed = parseJson<{
    items?: { check?: unknown; pass?: unknown; note?: unknown }[];
  }>(raw);

  const items = (Array.isArray(parsed.items) ? parsed.items : []).map((i) => ({
    check: str(i.check).slice(0, 120),
    pass: Boolean(i.pass),
    note: str(i.note).slice(0, 300),
  }));

  if (items.length === 0) {
    throw new ContentLlmError("The kill check came back empty.");
  }

  // Derive the verdict rather than trusting it: the model has been seen
  // returning "pass" with failing items underneath it.
  const verdict = items.every((i) => i.pass) ? "pass" : "fix";

  return { items, wordCount, verdict };
}
