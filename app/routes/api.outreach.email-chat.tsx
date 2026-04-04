/**
 * POST /api/outreach/email-chat
 *
 * AI email assistant — intent-classified, locked-anchor editing.
 * OpenAI gpt-4o-mini primary, Ollama llama3.2:1b fallback.
 */

import type { Route } from "./+types/api.outreach.email-chat";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ── Core writing rules (always injected) ─────────────────────────────

const BASE_RULES = `
COLD EMAIL RULES — non-negotiable:

LENGTH: Under 85 words in the body. Under 70 is ideal. Every word earns its place.

SUBJECT: 2-5 words. Lowercase except proper nouns. Never start with "Re:" or "Quick question".

OPENER (the most important line):
- MUST reference something SPECIFIC about the recipient or their company
- FORBIDDEN: "I admire how [company] is shaping/disrupting/revolutionising...", "I'm impressed by your work", "I hope this finds you well", "My name is", "I wanted to reach out", "I came across your profile"
- GOOD: Something specific you noticed → why it caught your attention
- If no hook available: open with a genuine observation about what their role must involve, or a specific question
- Example: "Saw you're building Stripe's developer marketing from scratch — that's a rare brief."

VOICE: You-centric, not I-centric. "Your team" not "I think your team". Lead sentences with "you/your" where possible. Max 2 uses of "I" in the whole body.

CTA: One question. Low friction. "Would you be open to a 15-min chat?" beats "Please schedule time using my calendar link."

FORBIDDEN WORDS: leverage, synergy, passionate, driven, hardworking, team player, motivated, innovative, excited to, thrilled to, love what you're doing, amazing work, incredible company

No em dashes. Use commas or hyphens. No bullet points in cold emails.`;

// ── Context builders ──────────────────────────────────────────────────

function buildStyleContext(p: any): string {
  if (!p) return "";
  const lines = ["SENDER PROFILE:"];
  if (p.name) lines.push(`Name: ${p.name}`);
  if (p.university) lines.push(`University: ${p.university}`);
  if (p.lookingFor) lines.push(`Seeking: ${p.lookingFor}`);
  if (p.targetRoles) lines.push(`Target roles/industries: ${p.targetRoles}`);
  if (p.topCredential) lines.push(`Best credential (use this): "${p.topCredential}"`);
  if (p.tone) {
    const t: Record<string, string> = {
      direct: "Direct, punchy — no filler, confident sentences",
      warm: "Warm, conversational — genuine curiosity, reads like a human wrote it",
      formal: "Professional, precise — polished but still personal",
    };
    lines.push(`Tone: ${t[p.tone] || p.tone}`);
  }
  if (p.sampleEmail) lines.push(`Voice sample (match this style):\n${p.sampleEmail.slice(0, 250)}`);
  return lines.join("\n");
}

function buildRecipientContext(r: any): string {
  if (!r) return "";
  const lines = ["RECIPIENT:"];
  if (r.recipientName) lines.push(`Name: ${r.recipientName}`);
  if (r.recipientTitle) lines.push(`Title: ${r.recipientTitle}`);
  if (r.company) lines.push(`Company: ${r.company}`);
  const ct: Record<string, string> = {
    startup: "early-stage startup",
    scaleup: "Series A–C scale-up",
    enterprise: "large enterprise / MNC",
    agency: "agency or consultancy",
  };
  if (r.companyType) lines.push(`Company type: ${ct[r.companyType] || r.companyType}`);
  const conn: Record<string, string> = {
    alumni: "SHARED UNIVERSITY — lead with this alumni connection in the opener",
    referral: "MUTUAL REFERRAL — mention the connection early",
    founder_post: "SAW THEIR POST — reference it specifically in the opener",
  };
  if (r.connectionType && r.connectionType !== "none") lines.push(`Connection: ${conn[r.connectionType]}`);
  if (r.specificHook) lines.push(`Research hook (MUST use this in the opener): "${r.specificHook}"`);
  const goals: Record<string, string> = {
    chat: "book a 15-min conversation",
    role: "enquire about a specific open role",
    general: "express genuine interest and open a conversation",
  };
  if (r.goal) lines.push(`Goal: ${goals[r.goal] || r.goal}`);
  return lines.join("\n");
}

// ── Prompts ───────────────────────────────────────────────────────────

function initialPrompt(style: any, recipient: any): string {
  return `${buildStyleContext(style)}

${buildRecipientContext(recipient)}

${BASE_RULES}

Write a cold email from scratch. Make it feel like it was written specifically for this person — not a template with names swapped in.

Use the research hook in the opener. Weave in the sender's credential naturally (not as a list). Keep it under 80 words in the body.

Also generate 3 subject line alternatives:
1. Direct reference to the company or specific hook
2. Shared context angle (alumni / mutual interest / specific trigger)
3. Curiosity — 2-4 words that raise a question without answering it

Return ONLY this JSON:
{
  "subject": "best subject line",
  "body": "email body here",
  "explanation": "one sentence about the approach you took",
  "edit_scope": "initial",
  "subject_variants": ["variant 1", "variant 2", "variant 3"]
}`;
}

const INTENT_GUIDE = `
INTENT CLASSIFICATION — pick one:
- subject_only: user wants to change only the subject line
- opener_only: user wants to change only the first sentence
- shorten: make the body shorter/more concise
- tone_shift: change tone, style, or feel
- cta_only: change only the closing ask
- full_rewrite: start completely fresh
- improve: vague "make it better" — do a meaningful rewrite fixing the 2-3 biggest problems
- general: any other specific change

IMPORTANT: For "improve" intent, actually fix things. Identify what's weakest (generic opener? too many I's? weak CTA?) and fix all of it. Don't just change one word.`;

function editPrompt(prompt: string, subject: string, body: string, style: any, recipient: any, history: string[]): string {
  const hist = history.length > 0
    ? `\nEDITS ALREADY APPLIED:\n${history.slice(-4).map((h, i) => `${i + 1}. ${h}`).join("\n")}\n`
    : "";

  return `${buildStyleContext(style)}

${buildRecipientContext(recipient)}

CURRENT EMAIL (locked reference):
Subject: ${subject || "(none)"}
Body:
${body || "(empty)"}
${hist}
USER SAYS: "${prompt}"

${INTENT_GUIDE}

${BASE_RULES}

Apply the instruction. Rules for each scope:
- subject_only → new subject only, body unchanged
- opener_only → rewrite first sentence only, rest of body unchanged
- shorten → cut to under 75 words, keep personalization and CTA, nothing else
- tone_shift → rewrite for new tone, keep structure and facts
- cta_only → change final sentence only
- full_rewrite → completely fresh, same profile/recipient context
- improve → fix the 2-3 biggest problems. Be aggressive. A new opener, tighter body, better CTA.
- general → make the specific change requested

Return ONLY this JSON:
{
  "subject": "subject line",
  "body": "email body",
  "explanation": "one sentence: what specifically changed and why",
  "edit_scope": "scope applied",
  "subject_variants": null
}`;
}

// ── LLM callers ───────────────────────────────────────────────────────

function sanitise(s: any): string {
  return String(s || "").replace(/[–—]/g, "-").trim();
}

async function callOpenAI(messages: { role: string; content: string }[]): Promise<any | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 25000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6,
        max_tokens: 750,
        response_format: { type: "json_object" },
      }),
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function callOllama(messages: { role: string; content: string }[]): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 35000);
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages,
        stream: false,
        options: { temperature: 0.5, num_predict: 750 },
      }),
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    const raw: string = (data?.message?.content || data?.response || "").trim();
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch { return null; }
}

function toMessages(system: string, user: string) {
  return [{ role: "system", content: system }, { role: "user", content: user }];
}

const SYSTEM = `You are an expert cold email coach for student job seekers. You write specific, human, short emails that get real replies. You always return valid JSON only — no markdown, no text outside JSON.`;

// ── Route ─────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST")
    return Response.json({ error: "Method not allowed" }, { status: 405 });

  let body: any;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const {
    prompt = "",
    subject = "",
    body: emailBody = "",
    style_profile,
    recipient_context,
    edit_history = [],
    is_initial = false,
  } = body;

  const userPrompt = (is_initial || (!emailBody && !subject))
    ? initialPrompt(style_profile, recipient_context)
    : editPrompt(prompt.trim(), subject, emailBody, style_profile, recipient_context, edit_history);

  if (!is_initial && !emailBody && !subject && !prompt.trim())
    return Response.json({ error: "prompt is required" }, { status: 400 });

  const msgs = toMessages(SYSTEM, userPrompt);
  const parsed = (await callOpenAI(msgs)) ?? (await callOllama(msgs));

  if (!parsed?.body && !parsed?.subject)
    return Response.json({ error: "AI unavailable. Please try again." }, { status: 503 });

  const variants = Array.isArray(parsed.subject_variants)
    ? parsed.subject_variants.slice(0, 3).map(sanitise).filter(Boolean)
    : null;

  return Response.json({
    subject: sanitise(parsed.subject || subject),
    body: sanitise(parsed.body || emailBody),
    explanation: sanitise(parsed.explanation || "Updated."),
    edit_scope: sanitise(parsed.edit_scope || "general"),
    subject_variants: variants,
  });
}
