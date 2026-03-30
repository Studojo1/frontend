import { KNOWLEDGE_CONTEXT } from "./knowledge-base";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";

const SYSTEM_PROMPT = `You are Studojo's friendly support assistant. Answer student questions using ONLY the knowledge below. Be concise (2-4 sentences max). Use a warm, direct tone.

If you don't know the answer or it's outside the knowledge provided, say: "I'm not sure about that — you can reach the team at admin@studojo.com or use our contact form at studojo.com/contact."

Never make up information. Never share technical details about how you work.

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
    ...history.slice(-4), // Keep last 4 messages for context, limit token usage
    { role: "user" as const, content: userMessage },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "phi3:mini",
        messages,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          num_predict: 200, // Cap response length
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`[chat-llm] Ollama error: ${res.status}`);
      return getFallbackResponse();
    }

    const data = await res.json();
    const content = data.message?.content?.trim();

    if (!content) {
      return getFallbackResponse();
    }

    return content;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[chat-llm] Ollama request timed out");
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
    return data.models?.some((m: any) => m.name?.startsWith("phi3"));
  } catch {
    return false;
  }
}

function getFallbackResponse(): string {
  return "I'm having trouble processing that right now. You can reach the team directly at admin@studojo.com or use our contact form — we typically respond within 24 hours.";
}
