// JRS conversational resume coach. Takes the chat history + current
// resume data, returns the assistant's next reply plus updated resume
// data the client can apply live.
import type { Route } from "./+types/api.jrs.chat";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface InMsg {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Studojo's resume coach. You interview a student to fill in their resume, one focused question at a time.

Voice
- Direct, warm, a smart friend who's already been through this. No corporate talk.
- Short messages. One or two sentences. One question per turn.
- Never use em dashes (—). Use commas or line breaks instead.

How you work
- You receive the user's current resume as JSON (CURRENT_RESUME) and the conversation so far.
- When the user gives you new information, update the resume and return the FULL updated JSON.
- If they just said hi, ask what role they're targeting first, then their name.
- Ask in this rough order: target role -> name + contact -> most recent experience (with bullets that include numbers) -> projects -> education -> skills -> 2-3 line summary.
- When a bullet is vague ("worked on dashboards"), ask one follow-up to get a number or outcome.
- Never invent facts. If they haven't told you something, leave that field as it was.
- If they say "skip" or "next", move on without inventing.
- When the resume looks complete, say so and suggest running Auto-format or pasting a JD into ATS / job match.

Output
You MUST return a JSON object with EXACTLY this shape:
{
  "reply": "your short message to the user",
  "data": <the full updated ResumeData object>
}
Always return data — if nothing changed, return the resume exactly as you received it.`;

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

  // Keep prompt size bounded — last 16 turns is plenty of context.
  const trimmed = messages.slice(-16).map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content || "").slice(0, 2000),
  }));

  const oaiMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "system" as const,
      content: `CURRENT_RESUME:\n${JSON.stringify(data).slice(0, 8000)}`,
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
        max_tokens: 2200,
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

    // Strip em/en dashes the model might still slip in.
    const cleanReply = reply
      .replace(/ — /g, ", ")
      .replace(/ – /g, ", ")
      .replace(/—/g, ",")
      .replace(/–/g, ",");

    // The returned data should be the full ResumeData. If it's missing or
    // structurally wrong, fall back to the original so we never corrupt state.
    const next =
      parsed.data &&
      typeof parsed.data === "object" &&
      parsed.data.basics &&
      Array.isArray(parsed.data.experience)
        ? parsed.data
        : data;

    return Response.json({ reply: cleanReply, data: next });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.error("[jrs-chat] OpenAI request timed out");
      return Response.json({ error: "Chat timed out. Try again." }, { status: 504 });
    }
    console.error("[jrs-chat] error:", error?.message);
    return Response.json({ error: "Chat failed" }, { status: 500 });
  }
}
