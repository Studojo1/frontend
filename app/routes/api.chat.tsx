import { matchIntent, NLP_CONFIDENCE_THRESHOLD } from "~/lib/chat/matcher";
import { generateLLMResponse } from "~/lib/chat/llm.server";
import type { Route } from "./+types/api.chat";

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

  const { message, history } = body as {
    message?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const trimmed = message.trim();

  // Cap message length
  if (trimmed.length > 500) {
    return Response.json({ error: "Message too long (max 500 characters)" }, { status: 400 });
  }

  // Phase 1: NLP matching
  const match = matchIntent(trimmed);

  if (match.intent && match.confidence >= NLP_CONFIDENCE_THRESHOLD) {
    return Response.json({
      reply: match.intent.response,
      links: match.intent.links || [],
      source: "nlp",
      confidence: match.confidence,
    });
  }

  // Phase 2: LLM fallback
  try {
    const llmReply = await generateLLMResponse(trimmed, history || []);
    return Response.json({
      reply: llmReply,
      links: [],
      source: "llm",
      confidence: match.confidence,
    });
  } catch (error) {
    console.error("[api.chat] LLM fallback failed:", error);
    // Phase 3: Escalation
    return Response.json({
      reply:
        "I'm not able to answer that right now. You can reach the team at admin@studojo.com or use our contact form — we typically respond within 24 hours.",
      links: [{ label: "Contact Form", url: "/contact" }],
      source: "escalation",
      confidence: 0,
    });
  }
}
