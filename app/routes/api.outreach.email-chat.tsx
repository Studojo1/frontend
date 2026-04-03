/**
 * POST /api/outreach/email-chat
 *
 * AI-powered email refinement assistant for the outreach compose page.
 *
 * Flow:
 *  1. Receive prompt + current email (subject, body) + optional candidate context
 *  2. Try OpenAI gpt-4o-mini first (higher quality)
 *  3. Fall back to Ollama llama3.2:1b if no key
 *  4. Return { subject, body, explanation }
 */

import type { Route } from "./+types/api.outreach.email-chat";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are an expert email writing assistant helping job seekers craft compelling cold outreach emails to hiring managers and recruiters.

Your job: take the user's current email draft and their instruction, then return an improved version.

Rules:
- Return ONLY valid JSON. No markdown. No explanation outside JSON.
- Keep emails under 200 words. Concise emails get more replies.
- Maintain professional but warm tone — not robotic, not overly casual.
- Preserve template variables exactly as-is: {name}, {company}, {title}, and any [bracketed placeholders].
- The "explanation" field: 1 short sentence describing the key change you made.
- If the subject line should change, update it. Otherwise keep it.
- Never start the body with "I hope this email finds you well" or similar clichés.
- Never use em dashes. Use commas or hyphens.

Return this exact JSON shape:
{
  "subject": "updated subject line",
  "body": "updated email body",
  "explanation": "one sentence about what changed"
}`;

function buildPrompt(
  prompt: string,
  subject: string,
  body: string,
  candidateContext?: string,
): string {
  const contextSection = candidateContext
    ? `\nCandidate context:\n${candidateContext}\n`
    : "";

  return `Current email:
Subject: ${subject}
Body:
${body}
${contextSection}
User instruction: ${prompt}

Return the improved email as JSON.`;
}

type EmailChatResult = {
  subject: string;
  body: string;
  explanation: string;
};

function sanitise(s: any): string {
  return String(s || "")
    .replace(/[–—]/g, "-")
    .trim();
}

async function refineWithOpenAI(
  prompt: string,
  subject: string,
  body: string,
  candidateContext?: string,
): Promise<EmailChatResult | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildPrompt(prompt, subject, body, candidateContext),
          },
        ],
        temperature: 0.5,
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed.subject || !parsed.body) return null;

    return {
      subject: sanitise(parsed.subject),
      body: sanitise(parsed.body),
      explanation: sanitise(parsed.explanation || "Email updated."),
    };
  } catch {
    return null;
  }
}

async function refineWithOllama(
  prompt: string,
  subject: string,
  body: string,
  candidateContext?: string,
): Promise<EmailChatResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildPrompt(prompt, subject, body, candidateContext),
          },
        ],
        stream: false,
        options: { temperature: 0.4, num_predict: 600 },
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = (data?.message?.content || data?.response || "").trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.subject || !parsed.body) return null;

    return {
      subject: sanitise(parsed.subject),
      body: sanitise(parsed.body),
      explanation: sanitise(parsed.explanation || "Email updated."),
    };
  } catch {
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt: string = (body?.prompt || "").trim();
  const subject: string = (body?.subject || "").trim();
  const emailBody: string = (body?.body || "").trim();
  const candidateContext: string | undefined = body?.candidate_context || undefined;

  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  if (!subject && !emailBody) {
    return Response.json({ error: "Email subject or body is required" }, { status: 400 });
  }

  // Try OpenAI first, then Ollama
  const result =
    (await refineWithOpenAI(prompt, subject, emailBody, candidateContext)) ??
    (await refineWithOllama(prompt, subject, emailBody, candidateContext));

  if (!result) {
    return Response.json(
      { error: "AI assistant is unavailable right now. Please try again." },
      { status: 503 },
    );
  }

  return Response.json(result);
}
