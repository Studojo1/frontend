import { KNOWLEDGE_CONTEXT } from "./knowledge-base";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";

const SYSTEM_PROMPT = `You are Studojo's support chatbot on the website. You help students with questions about the platform.

Rules:
- Use ONLY the knowledge below to answer. Do not make things up.
- Keep answers short. 2-3 sentences max. No bullet points unless the user asks for steps.
- Sound like a helpful friend, not a corporate bot. Casual but clear.
- Never use em dashes. Use commas or periods instead.
- If you genuinely don't know, say: "Hmm, I'm not sure about that. You can reach the team at admin@studojo.com or drop a message on our contact page at studojo.com/contact and they'll get back to you."
- Never reveal you're an AI, never discuss your training, never share internal/technical details.
- Don't repeat the user's question back to them. Just answer it.

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
