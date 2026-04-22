import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.resumes.rewrite";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama:11434";

const CONTENT_RULES =
  "STRICT RULES: Only use information present in the provided text. Do not add new tools, technologies, skills, metrics, or achievements that are not explicitly mentioned. Do not invent or guess any details. Never use em dashes. Return only the rewritten text, no explanations.";

const PROMPTS: Record<string, string> = {
  rephrase: `Rephrase the following resume text to sound more professional and impactful. Use strong action verbs. Keep it concise. ${CONTENT_RULES}`,
  polish: `Polish the following resume text to improve clarity, grammar, and professionalism. Keep the same meaning and length. ${CONTENT_RULES}`,
  shorten: `Shorten the following resume text to roughly half its length while keeping the most impactful points. ${CONTENT_RULES}`,
  improve: `Improve the following resume bullet point to be more achievement-focused and impactful. Strengthen the wording without adding any information not already present. ${CONTENT_RULES}`,
};

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { text, action: rewriteAction } = body;

  if (!text || typeof text !== "string" || text.trim().length < 5) {
    return Response.json({ error: "Text too short to rewrite" }, { status: 400 });
  }

  const systemPrompt = PROMPTS[rewriteAction] || PROMPTS.polish;

  // Try OpenAI first
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text.trim() },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.choices?.[0]?.message?.content?.trim();
        if (result) {
          return Response.json({ result });
        }
      }
    } catch (e) {
      console.error("[rewrite] OpenAI error:", e);
    }
  }

  // Fallback: Ollama
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt: `${systemPrompt}\n\n${text.trim()}`,
        stream: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const result = data.response?.trim();
      if (result) {
        return Response.json({ result });
      }
    }
  } catch (e) {
    console.error("[rewrite] Ollama error:", e);
  }

  return Response.json({ error: "Rewrite service unavailable" }, { status: 503 });
}
