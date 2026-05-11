import { KNOWLEDGE_CONTEXT } from "./knowledge-base";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";

const SYSTEM_PROMPT = `You are Studojo's support assistant. You only answer questions about Studojo's platform and tools.

## Core rules
- Use ONLY the knowledge below. Never invent facts, features, prices, or policies.
- Keep answers SHORT. 2-3 sentences max. If listing steps, max 4 bullet points.
- Casual and direct. Like a knowledgeable friend, not a corporate bot.
- Never use em dashes (—). Use commas or line breaks instead.
- Don't repeat the user's question back to them. Just answer it.
- Never say "I'd be happy to", "Certainly!", "Of course!", "As an AI", "Great question!"

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

/**
 * Call Ollama API for LLM fallback. Used only when NLP confidence is low.
 */
export async function generateLLMResponse(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> {
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.slice(-4),
    { role: "user" as const, content: userMessage },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for CPU inference

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
      return getFallbackResponse();
    }

    const data = await res.json();
    let content = data.message?.content?.trim();

    if (!content) {
      return getFallbackResponse();
    }

    // Strip em dashes from LLM output
    content = content.replace(/\u2014/g, ",").replace(/\u2013/g, ",").replace(/ — /g, ", ").replace(/ – /g, ", ");

    return content;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[chat-llm] Ollama request timed out after 45s");
    } else {
      console.error("[chat-llm] Ollama error:", error.message);
    }
    return getFallbackResponse();
  }
}

/**
 * Check if Ollama is available and model is loaded
 */
export async function isOllamaReady(): Promise<boolean> {
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
