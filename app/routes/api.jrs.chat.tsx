// JRS conversational resume coach.
//
// Token-optimised model: instead of writing the whole resume back every turn,
// the LLM emits a short list of OPS. The server validates and applies them,
// returning both the ops (small) and the final data (for the client to use).
import type { Route } from "./+types/api.jrs.chat";
import { applyOps, compactResume, type Op } from "~/lib/jrs/coach";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface InMsg {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Studojo's resume coach. You help a student fill in their resume one focused question at a time.

VOICE
- Direct, warm, like a smart friend. No corporate talk.
- One or two short sentences. One question per turn.
- Never use em dashes (—). Use commas instead.

HOW IT WORKS
- The user's current resume is below as CURRENT_RESUME (compact JSON, may omit empty fields).
- When the user tells you something new, return ONE or more OPS that update the resume. If nothing changed, return an empty ops array.
- Push for numbers/outcomes in bullets. If a bullet is vague, ask one follow-up.
- Never invent facts. If the user said "skip" or "next", just move on with no ops.
- Don't ask about info already on the resume.

OPS SCHEMA — emit only these shapes:
  { "op":"set", "path":"basics.name", "value":"Aanya Sharma" }
  { "op":"set", "path":"basics.title|email|phone|location|website|linkedin", "value":"..." }
  { "op":"set", "path":"summary", "value":"..." }
  { "op":"add", "path":"experience|education|projects|skills", "value":{ ...item fields... } }
  { "op":"update", "path":"experience.<id>", "value":{ ...partial fields... } }
  { "op":"remove", "path":"experience.<id>" }

OUTPUT
Return strict JSON only:
{
  "reply": "your short message to the user",
  "ops": [ ... ops here, [] if nothing changed ... ]
}`;

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (!OPENAI_API_KEY) {
    return Response.json(
      { error: "Chat is temporarily unavailable. Try again later." },
      { status: 503 },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages: InMsg[] = Array.isArray(body.messages) ? body.messages : [];
  const data = body.data;
  if (!data || typeof data !== "object") {
    return Response.json({ error: "Resume data is required" }, { status: 400 });
  }

  // Keep prompt size bounded — 8 turns is plenty for context.
  const trimmed = messages.slice(-8).map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content || "").slice(0, 1500),
  }));

  // Send a compact projection: no empty fields, no starter values.
  const compact = compactResume(data);

  const oaiMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "system" as const,
      content: `CURRENT_RESUME:\n${JSON.stringify(compact)}`,
    },
    ...trimmed,
  ];

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
        temperature: 0.4,
        // Reply + ops is small. 500 tokens is plenty unless the LLM dumps a
        // huge summary/experience all at once.
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: oaiMessages,
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`[jrs-chat] OpenAI error: ${res.status} ${errBody}`);
      return Response.json(
        { error: "Chat is temporarily unavailable. Try again in a moment." },
        { status: 502 },
      );
    }

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return Response.json({ error: "No reply produced" }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Response.json({ error: "Coach response was malformed" }, { status: 502 });
    }

    const reply: string = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    if (!reply) {
      return Response.json({ error: "Empty coach reply" }, { status: 502 });
    }

    // Em/en dash cleanup.
    const cleanReply = reply
      .replace(/ — /g, ", ")
      .replace(/ – /g, ", ")
      .replace(/—/g, ",")
      .replace(/–/g, ",");

    // Validate ops shape: must be an array; each item is an object with `op`
    // and `path` strings. Apply server-side so the client gets clean data.
    const rawOps: Op[] = Array.isArray(parsed.ops)
      ? parsed.ops.filter(
          (o: any) =>
            o && typeof o === "object" && typeof o.op === "string" && typeof o.path === "string",
        )
      : [];
    const next = applyOps(data, rawOps);

    return Response.json({ reply: cleanReply, ops: rawOps, data: next });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.error("[jrs-chat] OpenAI request timed out");
      return Response.json({ error: "Chat timed out. Try again." }, { status: 504 });
    }
    console.error("[jrs-chat] error:", error?.message);
    return Response.json({ error: "Chat failed" }, { status: 500 });
  }
}
