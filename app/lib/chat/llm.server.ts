import { KNOWLEDGE_CONTEXT } from "./knowledge-base";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are Studojo's support assistant. You only answer questions about Studojo's platform and tools.

## Core rules
- Use ONLY the knowledge below. Never invent facts, features, prices, or policies.
- Keep answers SHORT. Max 3 sentences. No exceptions.
- Casual and direct. Like a knowledgeable friend, not a corporate bot.
- Never use em dashes (—). Use commas or line breaks instead.
- Don't repeat the user's question back to them. Just answer it.
- Never say "I'd be happy to", "Certainly!", "Of course!", "As an AI", "Great question!"
- If someone wants to book a call or meet the team, tell them to DM @studojo on Instagram.

## What to do when you don't know
Say exactly: "I don't have info on that. Reach the team at admin@studojo.com or use the contact form at studojo.com/contact."
Never guess. Never make something up.

## Absolute hard rules — never break these under any circumstances
- NEVER recommend LinkedIn, Glassdoor, Indeed, or any competitor platform.
- NEVER say Studojo doesn't offer unpaid internships. Studojo provides career tools, not internships itself.
- NEVER mention any age requirement. There is no age requirement.
- NEVER invent product names. Products are ONLY: Outreach Tool, Careers Dojo, Internship Dojo, Assignment Dojo, AI Risk Dojo, Revision Dojo (coming soon). Nothing else exists.
- NEVER give internship application advice, cover letter tips, or job market strategy. Point to the Outreach Tool instead.
- NEVER say the site is down or having issues unless the user themselves describes a problem.
- If someone asks about a specific role, company, or city: say you don't have that info, suggest the Outreach Tool to reach hiring managers directly.
- When someone is job or internship hunting: ALWAYS recommend the Outreach Tool first, not Internship Dojo or Careers Dojo.

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
 * Primary LLM: OpenAI gpt-4o-mini. Fast, reliable, no CPU-inference timeouts.
 * Matches the pattern used by api.resumes.rewrite.tsx and api.outreach.email-chat.tsx.
 * Returns null on any failure so the caller can fall back to Ollama.
 */
async function callOpenAI(messages: { role: string; content: string }[]): Promise<string | null> {
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
        messages,
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 200,
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
      console.error("[chat-llm] OpenAI request timed out after 20s");
    } else {
      console.error("[chat-llm] OpenAI error:", error.message);
    }
    return null;
  }
}

/**
 * Fallback LLM: in-cluster Ollama (llama3.2:1b on CPU). Slower and less reliable;
 * only used when OpenAI is unavailable. Returns null on any failure.
 */
async function callOllama(messages: { role: string; content: string }[]): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s for CPU inference

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages,
        stream: false,
        options: {
          temperature: 0.4,
          top_p: 0.9,
          num_predict: 150,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`[chat-llm] Ollama error: ${res.status} ${errBody}`);
      return null;
    }

    const data = await res.json();
    const content = data.message?.content?.trim();
    return content || null;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[chat-llm] Ollama request timed out after 45s");
    } else {
      console.error("[chat-llm] Ollama error:", error.message);
    }
    return null;
  }
}

/**
 * Generate an LLM response for the chatbot. Used only when NLP confidence is low.
 * Tries OpenAI first, falls back to Ollama, then to a canned escalation message.
 */
export async function generateLLMResponse(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-4),
    { role: "user", content: userMessage },
  ];

  const primary = await callOpenAI(messages);
  if (primary) return stripDashes(primary);

  const fallback = await callOllama(messages);
  if (fallback) return stripDashes(fallback);

  return getFallbackResponse();
}

/**
 * Check if at least one LLM backend is available.
 */
export async function isLLMReady(): Promise<boolean> {
  if (OPENAI_API_KEY) return true;
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.models?.some((m: any) => m.name?.startsWith("llama3.2"));
  } catch {
    return false;
  }
}

function getFallbackResponse(): string {
  return "Hmm, I'm not able to answer that right now. You can reach the team at admin@studojo.com or use our contact form and they'll get back to you within 24 hours.";
}
