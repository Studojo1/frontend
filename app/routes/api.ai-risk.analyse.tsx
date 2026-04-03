/**
 * POST /api/ai-risk/analyse
 *
 * Server-side AI risk analysis with LLM fallback for unknown / abbreviated roles.
 *
 * Flow:
 *  1. Strip "at [Company]" from input
 *  2. Run deterministic engine (analyseJob) — instant for known roles
 *  3. If confidence is "high" or "medium" → return immediately
 *  4. If confidence is "low" (engine doesn't recognise the role):
 *     → Call Ollama once to normalise the title (expand abbreviations, clarify role)
 *       AND generate risk analysis (risk_pct, drivers, human edges)
 *     → Merge LLM output with engine shell result
 *  5. Return AnalysisResult-compatible JSON
 */

import type { Route } from "./+types/api.ai-risk.analyse";
import { analyseJob } from "~/lib/ai-risk/engine";
import type { AnalysisResult } from "~/lib/ai-risk/engine";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";

const SYSTEM_PROMPT = `You are an expert labour economist and AI risk analyst. You return valid JSON only. No explanation, no markdown, no em dashes. Use plain hyphens.`;

function buildAnalysisPrompt(rawTitle: string): string {
  return `Analyse the AI replacement risk for this job input: "${rawTitle}"

The input may be an abbreviation (e.g. "gtm", "swe", "pm") or include a company name (e.g. "at Stripe").
First normalise it to a clean, full job title.

Return ONLY this JSON (no other text):
{
  "normalized_title": "Full job title here",
  "risk_pct": 45,
  "timeline_years": 7,
  "risk_level": "medium",
  "risk_drivers": [
    "Specific AI threat relevant to this role",
    "Another concrete AI automation threat",
    "Third threat if applicable"
  ],
  "human_edges": [
    "Specific human advantage AI cannot replicate",
    "Another irreplaceable human skill in this role"
  ]
}

Rules:
- risk_pct: 0-100, realistic estimate of AI automation probability in 5-10 years
- risk_level: "low" (<30%), "medium" (30-59%), "high" (60-79%), "critical" (>=80%)
- timeline_years: years before significant displacement (5-15 typical range)
- risk_drivers: 2-3 specific, concrete threats (not generic)
- human_edges: 2-3 specific human advantages in this exact role
- No em dashes or en dashes anywhere`;
}

function getRiskLevelFromPct(pct: number): "low" | "medium" | "high" | "critical" {
  if (pct >= 80) return "critical";
  if (pct >= 60) return "high";
  if (pct >= 30) return "medium";
  return "low";
}

function stripCompany(input: string): string {
  // "Fin Crime Associate at Stripe" -> "Fin Crime Associate"
  return input.replace(/\s+(at|@|in|for|with)\s+[\w\s&.,'()-]{1,60}$/i, "").trim();
}

async function llmAnalyse(rawTitle: string): Promise<{
  normalized_title: string;
  risk_pct: number;
  timeline_years: number;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_drivers: string[];
  human_edges: string[];
} | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildAnalysisPrompt(rawTitle) },
        ],
        stream: false,
        options: { temperature: 0.2, num_predict: 300 },
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = (data?.message?.content || data?.response || "").trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.normalized_title || typeof parsed.risk_pct !== "number") return null;

    return {
      normalized_title: String(parsed.normalized_title).replace(/[–—]/g, "-").trim(),
      risk_pct: Math.max(1, Math.min(99, Math.round(Number(parsed.risk_pct)))),
      timeline_years: Math.max(2, Math.min(20, Math.round(Number(parsed.timeline_years) || 7))),
      risk_level: getRiskLevelFromPct(Math.round(Number(parsed.risk_pct))),
      risk_drivers: Array.isArray(parsed.risk_drivers)
        ? parsed.risk_drivers.slice(0, 3).map((d: any) => String(d).replace(/[–—]/g, "-"))
        : ["AI automation is affecting this role"],
      human_edges: Array.isArray(parsed.human_edges)
        ? parsed.human_edges.slice(0, 3).map((e: any) => String(e).replace(/[–—]/g, "-"))
        : ["Human judgment and context remain valuable"],
    };
  } catch {
    return null;
  }
}

function getVerdict(title: string, risk_pct: number, timeline_years: number): string {
  if (risk_pct >= 80)
    return `${title} faces critical AI displacement risk within ${timeline_years} years. Immediate pivot is advised.`;
  if (risk_pct >= 60)
    return `${title} is at high risk of significant AI disruption within ${timeline_years} years.`;
  if (risk_pct >= 30)
    return `${title} will be partially automated but human judgment keeps it viable for ${timeline_years}+ years.`;
  return `${title} is resilient to AI replacement. Human skills dominate for ${timeline_years}+ years.`;
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

  const rawInput: string = (body?.job_title || "").trim();
  if (!rawInput) {
    return Response.json({ error: "job_title required" }, { status: 400 });
  }

  // Step 1: strip "at Company" for engine matching
  const cleaned = stripCompany(rawInput);

  // Step 2: try deterministic engine
  const engineResult = analyseJob(cleaned);

  // Step 3: high/medium confidence — return engine result instantly
  if (engineResult.confidence === "high" || engineResult.confidence === "medium") {
    return Response.json({ ...engineResult, job_input: rawInput });
  }

  // Step 4: low confidence — call LLM to normalise + analyse
  const llmResult = await llmAnalyse(rawInput);

  if (llmResult) {
    // Try engine again with normalised title (might match now)
    const secondPass = analyseJob(llmResult.normalized_title);

    if (secondPass.confidence === "high" || secondPass.confidence === "medium") {
      // Engine matched on the normalised title — use engine data, show proper title
      return Response.json({
        ...secondPass,
        job_input: rawInput,
        matched_title: secondPass.matched_title,
      });
    }

    // Engine still low confidence — use LLM analysis directly
    return Response.json({
      ...engineResult,
      job_input: rawInput,
      matched_title: llmResult.normalized_title,
      risk_pct: llmResult.risk_pct,
      timeline_years: llmResult.timeline_years,
      risk_level: llmResult.risk_level,
      verdict: getVerdict(llmResult.normalized_title, llmResult.risk_pct, llmResult.timeline_years),
      risk_drivers: llmResult.risk_drivers,
      human_edges: llmResult.human_edges,
      confidence: "medium" as const, // LLM gave a real answer, upgrade from "low"
    } satisfies AnalysisResult);
  }

  // Step 5: LLM failed — return engine keyword-inferred result with cleaned title
  const titleCased = cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return Response.json({
    ...engineResult,
    job_input: rawInput,
    matched_title: titleCased,
  });
}
