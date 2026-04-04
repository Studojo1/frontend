/**
 * POST /api/outreach/email-chat
 *
 * AI cold email assistant for student job seekers.
 * Intent-classified, locked-anchor editing.
 * OpenAI gpt-4o-mini primary, Ollama llama3.2:1b fallback.
 */

import type { Route } from "./+types/api.outreach.email-chat";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ── Core framework ────────────────────────────────────────────────────

const COLD_EMAIL_FRAMEWORK = `
You write cold emails for students reaching out to hiring managers and founders.
These emails need to show genuine intent, specific research, and a relevant credential.
They are NOT sales emails. They are one person writing to another person they genuinely admire.

═══════════════════════════════════════════════
STRUCTURE — follow this every time:

1. OPENER (1-2 sentences)
   → Something SPECIFIC about their work, post, company, or decision
   → Must be something most people wouldn't know or say
   → Shows you actually paid attention

2. BRIDGE (2-3 sentences)
   → Who you are, in one line
   → Your #1 credential — woven in naturally, as evidence not a claim
   → Connect your background to something relevant about their work

3. WHY YOU / WHY NOW (1 sentence)
   → Why this person specifically, or why this company right now
   → Not generic — reference the hook or something about their stage

4. ASK (1 sentence)
   → One low-friction question
   → Ask for a conversation, not a job
   → "Would you be open to a 15-minute chat?" beats "Are there any openings?"

═══════════════════════════════════════════════
WORD COUNT: 110-150 words in the body.
Long enough to show genuine intent.
Short enough to respect their time.
Student cold emails need to do more work than SDR emails — you have no existing relationship.

═══════════════════════════════════════════════
SUBJECT LINE — this is critical:

GOOD patterns (use one):
• [Credential] → [Company]: "fintech newsletter → Stripe"
• [Specific trigger]: "your developer marketing post"
• [University connection]: "BITS Pilani → Stripe"
• [Specific role + company]: "growth internship — Stripe"
• [Curious / intriguing]: "something I noticed about Stripe's India push"

BAD patterns (NEVER use):
• "Internship opportunities at [company]" — sounds like a mass email
• "Following up on [company]" — too vague
• "Quick question" — overused, spam-flagged
• "Reaching out about [role]" — generic
• Any subject that could be sent to 100 companies unchanged

═══════════════════════════════════════════════
OPENER — this is where most people fail:

FORBIDDEN openers:
• "I admire how [company] is shaping/disrupting/revolutionising..."
• "I'm impressed by [company]'s work"
• "I came across your profile on LinkedIn"
• "I hope this email finds you well"
• "My name is [X] and I'm a student at..."
• "I'm reaching out because I'm looking for..."
• "I wanted to connect with you because..."
• "[Company] is one of the most exciting companies in [industry]"

GOOD opener patterns:
• "[Specific thing they wrote/said/did] — [what you noticed about it]"
• "Saw your post on [specific topic] — [one genuine reaction to it]"
• "[Specific decision or move their company made] caught my attention because [why]"
• "Your [specific piece of work] made me think about [relevant connection to your work]"

If no specific hook is provided: open with a genuine question or observation about what their role must be like, or something specific about the company stage.

═══════════════════════════════════════════════
VOICE AND TONE:

• Write like a smart person talking to someone they genuinely respect
• Not desperate. Not obsequious. Confident but humble.
• Use "you/your" more than "I/my" — lead sentences with their world, not yours
• Max 3 uses of "I" in the entire body
• No bullet points in cold emails
• No em dashes — use commas or hyphens
• No corporate words: leverage, synergy, passionate, driven, excited to, thrilled to, love what you're doing, amazing work, impactful, innovative, game-changing

═══════════════════════════════════════════════
EXAMPLE — BAD email:

Subject: internship opportunities at stripe

Hi Manoj,

I admire how Stripe is shaping the fintech landscape. I recently grew a fintech newsletter to 4,200 subscribers in just 3 months, and I'm eager to learn from your growth journey. Would you be open to a brief chat about internship opportunities?

Thanks

[WHY IT'S BAD: Generic opener, subject is mass-email, credential mentioned without context, ask is too transactional]

═══════════════════════════════════════════════
EXAMPLE — GOOD email:

Subject: fintech newsletter → Stripe growth team

Hi Manoj,

Your post on Stripe's approach to developer adoption in India stuck with me — specifically the point about building for UPI-first users before adapting for card rails. That's a problem I've been covering from the outside.

I run a fintech newsletter (4,200 subscribers, 3 months) and most of what I write about is exactly this — how payments infrastructure shapes product decisions in emerging markets.

I'm a 3rd-year student at BITS Pilani finishing a business degree, actively looking to go deeper on this from the inside.

Would a 15-minute call make sense?

Arjun

[WHY IT'S GOOD: Specific opener showing real research, credential comes with context, "from the outside" shows self-awareness, ask is natural]
`;

// ── Context builders ──────────────────────────────────────────────────

function buildStyleContext(p: any): string {
  if (!p) return "";
  const lines = ["SENDER PROFILE:"];
  if (p.name) lines.push(`Name: ${p.name}`);
  if (p.university) lines.push(`University: ${p.university}`);
  if (p.lookingFor) lines.push(`Looking for: ${p.lookingFor}`);
  if (p.targetRoles) lines.push(`Target roles/industries: ${p.targetRoles}`);
  if (p.topCredential) lines.push(`Best credential — use this, it's specific and real: "${p.topCredential}"`);
  if (p.tone) {
    const t: Record<string, string> = {
      direct: "Direct and punchy — confident, no filler, short sentences",
      warm: "Warm and conversational — reads like a real human, genuine curiosity",
      formal: "Professional — polished, precise, still personal",
    };
    lines.push(`Preferred tone: ${t[p.tone] || p.tone}`);
  }
  if (p.sampleEmail) {
    lines.push(`Voice reference — match this style:\n"${p.sampleEmail.slice(0, 300)}"`);
  }
  return lines.join("\n");
}

function buildRecipientContext(r: any): string {
  if (!r) return "";
  const lines = ["RECIPIENT:"];
  if (r.recipientName) lines.push(`Name: ${r.recipientName}`);
  if (r.recipientTitle) lines.push(`Role: ${r.recipientTitle}`);
  if (r.company) lines.push(`Company: ${r.company}`);
  const ct: Record<string, string> = {
    startup: "Early-stage startup — likely founder or small team, personal emails land well",
    scaleup: "Series A-C — growing fast, specific roles, show you know the stage",
    enterprise: "Large enterprise — more formal, route through right person",
    agency: "Agency — project-based, show portfolio awareness",
  };
  if (r.companyType) lines.push(`Company context: ${ct[r.companyType] || r.companyType}`);

  const conn: Record<string, string> = {
    alumni: "SHARED UNIVERSITY ALUMNI — this is your strongest hook. Use it in the first line.",
    referral: "MUTUAL REFERRAL — mention the person's name who referred you, early.",
    founder_post: "SAW THEIR LINKEDIN/SOCIAL POST — reference the specific post in the opener.",
  };
  if (r.connectionType && r.connectionType !== "none") {
    lines.push(`Connection (USE THIS): ${conn[r.connectionType]}`);
  }

  if (r.specificHook) {
    lines.push(`Specific research — THIS MUST GO IN THE OPENER: "${r.specificHook}"`);
  } else {
    lines.push(`No specific hook provided — open with an observation about their role or company stage instead.`);
  }

  const goals: Record<string, string> = {
    chat: "Book a 15-minute conversation",
    role: "Ask about a specific open role",
    general: "Open a genuine conversation about opportunities",
  };
  if (r.goal) lines.push(`Goal: ${goals[r.goal] || r.goal}`);
  return lines.join("\n");
}

// ── Prompts ───────────────────────────────────────────────────────────

function initialPrompt(style: any, recipient: any): string {
  return `${COLD_EMAIL_FRAMEWORK}

---

${buildStyleContext(style)}

${buildRecipientContext(recipient)}

---

Write the cold email now. Follow the structure: opener → bridge → why you/why now → ask.
Use the specific hook in the opener. Weave the credential into the bridge naturally.
110-150 words in body. Subject using one of the good patterns above.

Generate 3 alternative subject lines too:
1. Credential-forward: [their credential/result] → [company]
2. Specific trigger: reference something specific about company/person
3. Curiosity angle: intriguing but honest, 3-5 words

Return ONLY this JSON (no markdown, no other text):
{
  "subject": "best subject line",
  "body": "full email body",
  "explanation": "one sentence: the specific angle you took and why",
  "edit_scope": "initial",
  "subject_variants": ["credential variant", "trigger variant", "curiosity variant"]
}`;
}

const INTENT_GUIDE = `
CLASSIFY the user's instruction into one of:
- subject_only     → change only the subject line
- opener_only      → rewrite only the first 1-2 sentences
- shorten          → cut the body down (keep opener, credential, ask — cut filler)
- lengthen         → add more substance and intent
- tone_shift       → change tone/feel/style
- cta_only         → change only the closing ask
- full_rewrite     → start completely fresh
- improve          → vague "make it better" — ACTUALLY fix the biggest problems. Look for: generic opener, missing credential context, weak subject, too short on intent, too many I's, soft CTA. Fix all of them.
- general          → any other specific change

For "improve": be aggressive. Rewrite the opener to be specific. Add context. Make the credential land. This is not a minor edit.`;

function editPrompt(
  prompt: string,
  subject: string,
  body: string,
  style: any,
  recipient: any,
  history: string[],
): string {
  const hist =
    history.length > 0
      ? `\nEDITS ALREADY APPLIED:\n${history
          .slice(-4)
          .map((h, i) => `${i + 1}. ${h}`)
          .join("\n")}\n`
      : "";

  return `${COLD_EMAIL_FRAMEWORK}

---

${buildStyleContext(style)}

${buildRecipientContext(recipient)}

---

CURRENT EMAIL (reference — only edit what the instruction requires):
Subject: ${subject || "(none)"}
Body:
${body || "(empty)"}
${hist}
USER INSTRUCTION: "${prompt}"

${INTENT_GUIDE}

Apply the instruction:
- subject_only → new subject, body unchanged
- opener_only → first 1-2 sentences only, rest unchanged
- shorten → under 100 words, keep specifics and credential, cut filler
- lengthen → 120-150 words, add more research context and substance
- tone_shift → rewrite for new feel, same facts
- cta_only → last sentence only
- full_rewrite → start fresh using the framework
- improve → aggressive rewrite: fix opener, subject, and any thin spots
- general → specific change requested

Return ONLY this JSON:
{
  "subject": "subject line",
  "body": "full email body",
  "explanation": "what specifically changed and why",
  "edit_scope": "scope applied",
  "subject_variants": null
}`;
}

// ── LLM callers ───────────────────────────────────────────────────────

function sanitise(s: any): string {
  return String(s || "")
    .replace(/[–—]/g, "-")
    .trim();
}

async function callOpenAI(userPrompt: string): Promise<any | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 25000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert cold email coach for student job seekers. You write specific, researched, human emails. Return valid JSON only — no markdown, no text outside JSON.",
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.65,
        max_tokens: 900,
        response_format: { type: "json_object" },
      }),
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function callOllama(userPrompt: string): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 40000);
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages: [
          {
            role: "system",
            content:
              "You are a cold email expert for student job seekers. Return valid JSON only.",
          },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        options: { temperature: 0.55, num_predict: 900 },
      }),
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    const raw: string = (data?.message?.content || data?.response || "").trim();
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

// ── Route ─────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST")
    return Response.json({ error: "Method not allowed" }, { status: 405 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    prompt = "",
    subject = "",
    body: emailBody = "",
    style_profile,
    recipient_context,
    edit_history = [],
    is_initial = false,
  } = body;

  const userPrompt =
    is_initial || (!emailBody && !subject)
      ? initialPrompt(style_profile, recipient_context)
      : editPrompt(
          prompt.trim(),
          subject,
          emailBody,
          style_profile,
          recipient_context,
          edit_history,
        );

  if (!is_initial && !emailBody && !subject && !prompt.trim())
    return Response.json({ error: "prompt is required" }, { status: 400 });

  const parsed = (await callOpenAI(userPrompt)) ?? (await callOllama(userPrompt));

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
