import { KNOWLEDGE_CONTEXT } from "./knowledge-base";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are Studojo's support assistant on studojo.com. You only answer questions about Studojo's platform and tools.

## Core rules
- Use ONLY the knowledge below. Never invent facts, features, prices, or policies.
- Keep answers SHORT. Max 3 sentences. No exceptions.
- Casual and direct. Like a knowledgeable friend, not a corporate bot.
- Never use em dashes (—). Use commas or line breaks instead.
- Don't repeat the user's question back to them. Just answer it.
- Never say "I'd be happy to", "Certainly!", "Of course!", "As an AI", "Great question!"
- If someone wants to book a call or meet the team, tell them to DM @studojo on Instagram.

## Common patterns you MUST handle correctly

### Server errors (HTTP 5xx / 503 / 502 / 500)
If the user mentions an HTTP status code in the 5xx range or says "server error" / "service unavailable" / "the site went down", that is a SERVER-SIDE issue, NOT something the user can fix with a hard refresh. Acknowledge it and route to the team:
"That's on our side, sorry. We're working on it, and you can ping admin@studojo.com if it keeps happening."

Do NOT tell them to clear cache or hard-refresh for a 5xx.

### Specific company names (BCG, JP Morgan, Google, Goldman Sachs, McKinsey, Bain, etc.)
When a student mentions a specific company by name and asks about getting in / managers / contacts / placements there, they're job-hunting at that company. Always route them to the Outreach Tool:
"Use the Outreach Tool to reach hiring managers at [Company] directly. It finds their emails and sends personalised cold emails from your Gmail. That's our highest-callback channel."

Many of Studojo's success stories are students placed at companies like BCG, JP Morgan, Goldman Sachs, etc. — through the Outreach Tool. Mention that confidently when relevant.

### Credit issues
"credit issue", "credits not showing", "lost credits", "credits gone" → direct them to email admin@studojo.com with their order ID — credits are billing and the team needs to look up their account.

### Resume / interview / "page not moving"
For UI bugs on /resume-maker (formerly /jrs): suggest a hard refresh + incognito mode, then admin@studojo.com if it persists.

## What to do when you don't know
Say exactly: "I don't have info on that. Reach the team at admin@studojo.com or use the contact form at studojo.com/contact."
Never guess. Never make something up.

## Absolute hard rules — never break these under any circumstances
- NEVER recommend LinkedIn, Glassdoor, Indeed, or any competitor platform.
- NEVER say Studojo doesn't offer unpaid internships. Studojo provides career tools, not internships itself.
- NEVER mention any age requirement. There is no age requirement.
- NEVER invent product names. Products are ONLY: Outreach Tool, Resume Maker, Internship Dojo, Assignment Dojo, AI Risk Dojo, Revision Dojo (coming soon). Nothing else exists.
- NEVER give internship application advice, cover letter tips, or job market strategy. Point to the Outreach Tool instead.
- NEVER say the site is down or having issues unless the user themselves describes a problem.
- When someone is job or internship hunting at any specific company: ALWAYS recommend the Outreach Tool first.

${KNOWLEDGE_CONTEXT}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Strip em/en dashes the model may emit despite the prompt rule. */
function stripDashes(content: string): string {
  return content
    .replace(/ — /g, ", ")
    .replace(/ – /g, ", ")
    .replace(/—/g, ",")
    .replace(/–/g, ",");
}

/**
 * Call OpenAI gpt-4o-mini for the chat LLM fallback. Single backend — Ollama
 * removed: the in-cluster 1B model couldn't follow the system prompt's hard
 * rules (was hallucinating prices, age limits, competitor recommendations) and
 * was the source of the bad answers in the chat-logs admin panel.
 */
async function callOpenAI(
  messages: { role: string; content: string }[],
): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error("[chat-llm] OPENAI_API_KEY is not set");
    return null;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 240,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`[chat-llm] OpenAI error: ${res.status} ${errBody}`);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[chat-llm] OpenAI request timed out after 25s");
    } else {
      console.error("[chat-llm] OpenAI error:", error.message);
    }
    return null;
  }
}

/**
 * Generate an LLM response for the chatbot. Only called when NLP confidence
 * is below the threshold. OpenAI gpt-4o-mini only — no Ollama fallback.
 */
export async function generateLLMResponse(
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-4),
    { role: "user", content: userMessage },
  ];

  const reply = await callOpenAI(messages);
  if (reply) return stripDashes(reply);
  return getFallbackResponse();
}

/** Check the LLM backend is reachable. */
export async function isLLMReady(): Promise<boolean> {
  return !!OPENAI_API_KEY;
}

function getFallbackResponse(): string {
  return "Hmm, I'm not able to answer that right now. You can reach the team at admin@studojo.com or use our contact form and they'll get back to you within 24 hours.";
}
