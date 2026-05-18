// JRS AI writing help — small, fast assists for the editor.
// One endpoint, switched on `task`. OpenAI gpt-4o-mini.
// Never invents facts: rewrites keep the user's content; suggestions are
// clearly fill-in-the-blank templates or skill names to choose from.
import type { Route } from "./+types/api.resume-maker.assist";
import type { ResumeData } from "~/lib/jrs/types";
import { resumeToText } from "~/lib/jrs/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function chat(
  messages: { role: string; content: string }[],
  opts: { json?: boolean; maxTokens?: number } = {},
): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);
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
        max_tokens: opts.maxTokens ?? 220,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        messages,
      }),
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.error(`[jrs-assist] OpenAI ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (e: any) {
    console.error("[jrs-assist] error:", e?.message);
    return null;
  }
}

function clean(s: string): string {
  // Strip wrapping quotes, leading bullet glyphs, and em dashes.
  return s
    .replace(/^["'`\s•\-*]+/, "")
    .replace(/["'`\s]+$/, "")
    .replace(/—/g, ",")
    .trim();
}

const FAIL = { error: "AI help is unavailable right now. Try again in a moment." };

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

  const task = String(body?.task || "");

  // ── Improve a single bullet ───────────────────────────────────────────────
  if (task === "improve-bullet") {
    const bullet = String(body?.bullet || "").trim();
    const role = String(body?.role || "").trim();
    if (bullet.length < 3) {
      return Response.json({ error: "Write a rough bullet first" }, { status: 400 });
    }
    const out = await chat(
      [
        {
          role: "system",
          content:
            "You rewrite a single resume bullet point. Keep it to ONE line. Open with a strong past-tense action verb. Keep every real fact, number and tool the user gave; never invent new ones. If no metric exists, do not fabricate one. Return ONLY the rewritten bullet, no quotes, no bullet glyph.",
        },
        {
          role: "user",
          content: role ? `Role: ${role}\nBullet: ${bullet}` : `Bullet: ${bullet}`,
        },
      ],
      { maxTokens: 90 },
    );
    if (!out) return Response.json(FAIL, { status: 503 });
    return Response.json({ text: clean(out) });
  }

  // ── Improve a set of bullets at once ──────────────────────────────────────
  if (task === "improve-bullets") {
    const bullets = Array.isArray(body?.bullets)
      ? body.bullets.map((b: any) => String(b)).filter((b: string) => b.trim())
      : [];
    const role = String(body?.role || "").trim();
    if (bullets.length === 0) {
      return Response.json({ error: "Write some bullets first" }, { status: 400 });
    }
    const out = await chat(
      [
        {
          role: "system",
          content:
            "You rewrite resume bullet points. For EACH input bullet, return one improved version: open with a strong past-tense action verb, one line, keep every real fact, number and tool, never invent new ones. Keep the SAME number of bullets in the same order. Return JSON: {\"bullets\": [\"...\", ...]}.",
        },
        {
          role: "user",
          content: `${role ? `Role: ${role}\n` : ""}Bullets:\n${bullets
            .map((b: string, i: number) => `${i + 1}. ${b}`)
            .join("\n")}`,
        },
      ],
      { json: true, maxTokens: 400 },
    );
    if (!out) return Response.json(FAIL, { status: 503 });
    try {
      const parsed = JSON.parse(out);
      const result = Array.isArray(parsed?.bullets)
        ? parsed.bullets.map((x: any) => clean(String(x))).filter(Boolean)
        : [];
      return Response.json({ bullets: result.length ? result : bullets });
    } catch {
      return Response.json(FAIL, { status: 503 });
    }
  }

  // ── Write a summary from the rest of the resume ───────────────────────────
  if (task === "write-summary") {
    const data = body?.data as ResumeData | undefined;
    if (!data || !data.basics) {
      return Response.json({ error: "Invalid resume data" }, { status: 400 });
    }
    const out = await chat(
      [
        {
          role: "system",
          content:
            "Write a resume summary, 2-3 sentences, first person implied (no 'I'). Base it ONLY on the resume content given. Never invent experience, skills or numbers. Punchy and concrete. Return ONLY the summary text.",
        },
        { role: "user", content: resumeToText(data).slice(0, 4000) },
      ],
      { maxTokens: 160 },
    );
    if (!out) return Response.json(FAIL, { status: 503 });
    return Response.json({ text: clean(out) });
  }

  // ── Suggest fill-in-the-blank bullet templates for a role ─────────────────
  if (task === "suggest-bullets") {
    const role = String(body?.role || "").trim();
    if (role.length < 2) {
      return Response.json({ error: "Add a role title first" }, { status: 400 });
    }
    const out = await chat(
      [
        {
          role: "system",
          content:
            "Suggest 4 resume bullet TEMPLATES for the given role. Each must be a fill-in-the-blank starter with [SQUARE BRACKET] placeholders the user replaces with their real facts — never a fabricated achievement. Each starts with a strong action verb, one line. Return JSON: {\"items\": [\"...\", ...]}.",
        },
        { role: "user", content: `Role: ${role}` },
      ],
      { json: true, maxTokens: 240 },
    );
    if (!out) return Response.json(FAIL, { status: 503 });
    try {
      const parsed = JSON.parse(out);
      const items = Array.isArray(parsed?.items)
        ? parsed.items.map((x: any) => clean(String(x))).filter(Boolean).slice(0, 6)
        : [];
      return Response.json({ items });
    } catch {
      return Response.json(FAIL, { status: 503 });
    }
  }

  // ── Suggest skills from the user's role titles ────────────────────────────
  if (task === "suggest-skills") {
    const roles = Array.isArray(body?.roles)
      ? body.roles.map((r: any) => String(r)).filter(Boolean)
      : [];
    const have = String(body?.have || "");
    if (roles.length === 0) {
      return Response.json({ error: "Add a role first so we can suggest skills" }, { status: 400 });
    }
    const out = await chat(
      [
        {
          role: "system",
          content:
            "Given a person's role titles, suggest concrete, widely-recognised skills they might list (tools, methods, platforms). Suggest ONLY skill names — the user picks the ones they actually have. Exclude skills they already listed. Return JSON: {\"items\": [\"...\", ...]} with up to 12 short skill names.",
        },
        {
          role: "user",
          content: `Roles: ${roles.join(", ")}\nAlready listed: ${have || "(none)"}`,
        },
      ],
      { json: true, maxTokens: 200 },
    );
    if (!out) return Response.json(FAIL, { status: 503 });
    try {
      const parsed = JSON.parse(out);
      const items = Array.isArray(parsed?.items)
        ? parsed.items.map((x: any) => clean(String(x))).filter(Boolean).slice(0, 12)
        : [];
      return Response.json({ items });
    } catch {
      return Response.json(FAIL, { status: 503 });
    }
  }

  return Response.json({ error: "Unknown task" }, { status: 400 });
}
