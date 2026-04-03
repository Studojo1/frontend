/**
 * POST /api/ai-risk/suggest
 *
 * LLM-powered career pivot recommendations.
 * Uses the same Ollama instance as the chat widget.
 * Falls back to empty array so the client can use engine data instead.
 */

import type { Route } from "./+types/api.ai-risk.suggest";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";

const SYSTEM_PROMPT = `You are a career transition expert. You return valid JSON only. No explanations, no markdown, no em dashes, no en dashes. Use plain hyphens in ranges (e.g. "3-6 months").`;

function buildUserPrompt(
  jobTitle: string,
  riskPct: number,
  riskLevel: string,
  riskDrivers: string[],
  humanEdges: string[]
): string {
  return `Job: ${jobTitle}
AI replacement risk: ${riskPct}%
Risk level: ${riskLevel}
Main AI threats: ${riskDrivers.slice(0, 2).join("; ")}
Human advantages: ${humanEdges.slice(0, 2).join("; ")}

Return 3 specific career pivots for someone in this role. Make them highly relevant and contextual to the job.
Output ONLY this JSON (no other text):
{"pivots":[{"role":"Job Title Here","risk_pct":20,"why":"One sentence connecting from ${jobTitle} to this role","skills":["skill1","skill2","skill3"],"timeline":"3-6 months","difficulty":1}]}

Rules:
- risk_pct for each pivot must be lower than ${riskPct}
- difficulty: 1=easy, 2=medium, 3=hard
- No em dashes, no en dashes. Use commas or plain hyphens.
- timeline uses plain hyphens: "3-6 months" not "3-6 months"
- why must start with a verb or noun, not "You"`;
}

function parsePivots(raw: string): any[] | null {
  try {
    // Try to extract JSON object from response
    const jsonMatch = raw.match(/\{[\s\S]*"pivots"[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.pivots) || parsed.pivots.length === 0) return null;

    // Validate and sanitise each pivot
    return parsed.pivots
      .filter((p: any) => p.role && p.why && Array.isArray(p.skills))
      .map((p: any) => ({
        role: String(p.role).replace(/[–—]/g, "-"),
        risk_pct: Math.max(5, Math.min(70, Number(p.risk_pct) || 20)),
        why: String(p.why).replace(/[–—]/g, ","),
        skills: (p.skills as any[]).slice(0, 4).map((s: any) => String(s).replace(/[–—]/g, "-")),
        timeline: String(p.timeline || "3-6 months").replace(/[–—]/g, "-"),
        difficulty: ([1, 2, 3].includes(Number(p.difficulty)) ? Number(p.difficulty) : 2) as 1 | 2 | 3,
      }))
      .slice(0, 4);
  } catch {
    return null;
  }
}

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

  const { job_title, risk_pct, risk_level, risk_drivers, human_edges } = body as {
    job_title?: string;
    risk_pct?: number;
    risk_level?: string;
    risk_drivers?: string[];
    human_edges?: string[];
  };

  if (!job_title || typeof risk_pct !== "number") {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userPrompt = buildUserPrompt(
    job_title,
    risk_pct,
    risk_level || "medium",
    risk_drivers || [],
    human_edges || []
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.85,
          num_predict: 400,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return Response.json({ pivots: null, source: "llm_error" });
    }

    const data = await res.json();
    const raw: string = data?.message?.content || data?.response || "";
    const pivots = parsePivots(raw);

    return Response.json({ pivots, source: "llm" });
  } catch (err: any) {
    // Timeout or network error — client falls back to engine data
    console.warn("[ai-risk/suggest] LLM failed:", err?.message);
    return Response.json({ pivots: null, source: "fallback" });
  }
}
