/**
 * POST /api/outreach/email-chat
 *
 * AI email assistant for the outreach compose page.
 *
 * Modes:
 *  1. Initial generation — body is empty, generate from profile + recipient context
 *  2. Edit mode — classify intent, apply locked-anchor edit to the relevant scope only
 *
 * Intent classes: subject_only | opener_only | shorten | tone_shift | cta_only | full_rewrite | general
 *
 * Always returns: { subject, body, explanation, edit_scope, subject_variants? }
 */

import type { Route } from "./+types/api.outreach.email-chat";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ── Prompt builders ───────────────────────────────────────────────────

const BASE_RULES = `Cold email rules you never break:
- Body under 100 words. Under 80 is ideal.
- Subject line: 2-6 words, lowercase except proper nouns
- Never open with: "I hope this finds you well", "My name is", "I wanted to reach out", "Just following up"
- First sentence must be about the RECIPIENT, not the sender
- Exactly ONE call to action — a low-friction ask for a conversation
- Never use: leverage, synergy, passionate, driven, hardworking, team player
- Preserve template variables exactly: {name}, {company}, {title} and [bracketed placeholders]
- No em dashes. Use commas or hyphens.
- Tone: warm, direct, and human — not corporate`;

function buildStyleContext(profile: any): string {
  if (!profile) return "";
  const lines: string[] = ["STUDENT PROFILE:"];
  if (profile.name) lines.push(`Name: ${profile.name}`);
  if (profile.university) lines.push(`University: ${profile.university}`);
  if (profile.lookingFor) lines.push(`Goal: ${profile.lookingFor}`);
  if (profile.targetRoles) lines.push(`Target roles/industries: ${profile.targetRoles}`);
  if (profile.topCredential) lines.push(`#1 credential: ${profile.topCredential}`);
  if (profile.tone) {
    const toneMap: Record<string, string> = {
      direct: "Direct and punchy — short sentences, confident, no fluff",
      warm: "Warm and conversational — personable, genuine interest shows",
      formal: "Professional and formal — polished, respectful, precise",
    };
    lines.push(`Preferred tone: ${toneMap[profile.tone] || profile.tone}`);
  }
  if (profile.sampleEmail) {
    lines.push(`Sample email (match this writing style):\n${profile.sampleEmail.slice(0, 300)}`);
  }
  return lines.join("\n");
}

function buildRecipientContext(recipient: any): string {
  if (!recipient) return "";
  const lines: string[] = ["RECIPIENT CONTEXT:"];
  if (recipient.recipientName) lines.push(`Name: ${recipient.recipientName}`);
  if (recipient.recipientTitle) lines.push(`Title: ${recipient.recipientTitle}`);
  if (recipient.company) lines.push(`Company: ${recipient.company}`);
  if (recipient.companyType) {
    const typeMap: Record<string, string> = {
      startup: "Early-stage startup (pre-seed to seed)",
      scaleup: "Scale-up (Series A–C)",
      enterprise: "Enterprise / large corporation",
      agency: "Agency or consulting firm",
    };
    lines.push(`Company type: ${typeMap[recipient.companyType] || recipient.companyType}`);
  }
  if (recipient.connectionType && recipient.connectionType !== "none") {
    const connMap: Record<string, string> = {
      alumni: "Student shares the same university as recipient — USE this in the opener",
      referral: "Student was referred by a mutual connection — MENTION this early",
      founder_post: "Student saw a post by the founder/hiring manager — REFERENCE this specifically",
    };
    lines.push(`Connection: ${connMap[recipient.connectionType] || recipient.connectionType}`);
  }
  if (recipient.specificHook) {
    lines.push(`Specific research / hook: "${recipient.specificHook}" — WEAVE this into the email naturally`);
  }
  if (recipient.goal) {
    const goalMap: Record<string, string> = {
      chat: "Book a 15-minute conversation",
      role: "Enquire about a specific open role",
      general: "Express interest in the company and ask about opportunities",
    };
    lines.push(`Desired outcome: ${goalMap[recipient.goal] || recipient.goal}`);
  }
  return lines.join("\n");
}

const INTENT_CLASSIFIER = `Classify the user's instruction into exactly one of these scopes:
- subject_only: wants to change only the subject line
- opener_only: wants to change only the first sentence/opening line
- shorten: wants the body to be shorter/more concise
- tone_shift: wants a different tone, style, or feel
- cta_only: wants to change only the closing ask
- full_rewrite: wants to start completely fresh or try a totally different approach
- general: any other improvement or specific change not in the above

Return the scope as a JSON field "edit_scope".`;

function buildInitialPrompt(styleProfile: any, recipientCtx: any): string {
  return `${buildStyleContext(styleProfile)}

${buildRecipientContext(recipientCtx)}

${BASE_RULES}

Write a cold email from scratch for this student to send to this recipient.
Make it specific, not generic — use the hook and connection type above.
Also generate 3 alternative subject line options.

Return ONLY this JSON (no other text):
{
  "subject": "chosen subject line",
  "body": "email body here",
  "explanation": "one sentence about the email approach taken",
  "edit_scope": "initial",
  "subject_variants": ["option 1", "option 2", "option 3"]
}

The 3 subject variants should be distinctly different approaches:
1. Direct reference: company name or recipient name + brief hook
2. Shared context: university connection / mutual interest / specific trigger
3. Curiosity: intriguing 2-4 words that don't give it all away`;
}

function buildEditPrompt(
  prompt: string,
  subject: string,
  body: string,
  styleProfile: any,
  recipientCtx: any,
  editHistory: string[],
): string {
  const historySection =
    editHistory.length > 0
      ? `\nEDIT HISTORY (instructions already applied):\n${editHistory.slice(-4).map((h, i) => `${i + 1}. ${h}`).join("\n")}\n`
      : "";

  return `${buildStyleContext(styleProfile)}

${buildRecipientContext(recipientCtx)}

CURRENT EMAIL (locked reference — only edit what the instruction requires):
Subject: ${subject || "(no subject)"}
Body:
${body || "(empty)"}
${historySection}
USER INSTRUCTION: "${prompt}"

${INTENT_CLASSIFIER}

${BASE_RULES}

Apply the instruction. Edit ONLY the scope determined by the classification.
- subject_only → change subject only, return body unchanged
- opener_only → change first sentence only, return rest of body unchanged
- shorten → reduce body word count, preserve personalization and CTA
- tone_shift → rewrite body for new tone, keep structure
- cta_only → change only the closing sentence/ask
- full_rewrite → completely fresh email using the same profile/recipient context
- general → make the specific improvement requested

Return ONLY this JSON:
{
  "subject": "subject line",
  "body": "email body",
  "explanation": "one sentence: exactly what changed",
  "edit_scope": "the scope you applied",
  "subject_variants": null
}`;
}

// ── LLM callers ───────────────────────────────────────────────────────

function sanitise(s: any): string {
  return String(s || "")
    .replace(/[–—]/g, "-")
    .trim();
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<any | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 25000);
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.55,
        max_tokens: 700,
        response_format: { type: "json_object" },
      }),
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function callOllama(systemPrompt: string, userPrompt: string): Promise<any | null> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 35000);
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        options: { temperature: 0.45, num_predict: 700 },
      }),
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    const raw: string = (data?.message?.content || data?.response || "").trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function parseResult(parsed: any, fallbackSubject: string, fallbackBody: string) {
  if (!parsed?.body && !parsed?.subject) return null;
  const variants = Array.isArray(parsed.subject_variants)
    ? parsed.subject_variants.slice(0, 3).map(sanitise).filter(Boolean)
    : null;
  return {
    subject: sanitise(parsed.subject || fallbackSubject),
    body: sanitise(parsed.body || fallbackBody),
    explanation: sanitise(parsed.explanation || "Email updated."),
    edit_scope: sanitise(parsed.edit_scope || "general"),
    subject_variants: variants,
  };
}

// ── Route handler ─────────────────────────────────────────────────────

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

  const {
    prompt,
    subject = "",
    body: emailBody = "",
    style_profile,
    recipient_context,
    edit_history = [],
    is_initial = false,
  } = body;

  const SYSTEM = `You are an expert cold email writing assistant for student job seekers. You write short, specific, human emails that get replies. You always return valid JSON only — no markdown, no explanation outside the JSON.`;

  let userPrompt: string;

  if (is_initial || (!emailBody && !subject)) {
    // Initial generation
    userPrompt = buildInitialPrompt(style_profile, recipient_context);
  } else {
    // Edit mode
    if (!prompt?.trim()) {
      return Response.json({ error: "prompt is required for edits" }, { status: 400 });
    }
    userPrompt = buildEditPrompt(
      prompt.trim(),
      subject,
      emailBody,
      style_profile,
      recipient_context,
      edit_history,
    );
  }

  const parsed =
    (await callOpenAI(SYSTEM, userPrompt)) ??
    (await callOllama(SYSTEM, userPrompt));

  if (!parsed) {
    return Response.json(
      { error: "AI assistant is unavailable. Please try again." },
      { status: 503 },
    );
  }

  const result = parseResult(parsed, subject, emailBody);
  if (!result) {
    return Response.json(
      { error: "Failed to parse AI response. Please try again." },
      { status: 500 },
    );
  }

  return Response.json(result);
}
