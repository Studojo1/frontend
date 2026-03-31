import { matchIntent, NLP_CONFIDENCE_THRESHOLD } from "~/lib/chat/matcher";
import { generateLLMResponse } from "~/lib/chat/llm.server";
import { logChatInteraction } from "~/lib/chat/logger.server";
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

  const { message, history, sessionId } = body as {
    message?: string;
    history?: { role: "user" | "assistant"; content: string }[];
    sessionId?: string;
  };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const trimmed = message.trim();
  const sid = sessionId || "anonymous";

  if (trimmed.length > 500) {
    return Response.json({ error: "Message too long (max 500 characters)" }, { status: 400 });
  }

  // Phase 1: NLP matching
  const match = matchIntent(trimmed);

  if (match.intent && match.confidence >= NLP_CONFIDENCE_THRESHOLD) {
    const reply = match.intent.response;

    // Log async, don't block response
    logChatInteraction({
      sessionId: sid,
      userMessage: trimmed,
      botResponse: reply,
      source: "nlp",
      confidence: match.confidence,
      intentId: match.intent.id,
    });

    return Response.json({
      reply,
      links: match.intent.links || [],
      source: "nlp",
      confidence: match.confidence,
    });
  }

  // Phase 2: LLM fallback
  try {
    const llmReply = await generateLLMResponse(trimmed, history || []);

    logChatInteraction({
      sessionId: sid,
      userMessage: trimmed,
      botResponse: llmReply,
      source: "llm",
      confidence: match.confidence,
    });

    return Response.json({
      reply: llmReply,
      links: [],
      source: "llm",
      confidence: match.confidence,
    });
  } catch (error) {
    console.error("[api.chat] LLM fallback failed:", error);

    const escalationReply =
      "Hmm, I'm not able to answer that right now. You can reach the team at admin@studojo.com or use our contact form and they'll get back to you within 24 hours.";

    logChatInteraction({
      sessionId: sid,
      userMessage: trimmed,
      botResponse: escalationReply,
      source: "escalation",
      confidence: 0,
    });

    return Response.json({
      reply: escalationReply,
      links: [{ label: "Contact form", url: "/contact" }],
      source: "escalation",
      confidence: 0,
    });
  }
}
