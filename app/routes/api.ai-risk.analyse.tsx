/**
 * POST /api/ai-risk/analyse
 *
 * Server-side AI risk analysis with LLM fallback for unknown / abbreviated roles.
 *
 * Flow:
 *  1. Strip "at [Company]" from input
 *  2. Run deterministic engine (analyseJob) — instant for known roles (high/medium confidence)
 *  3. If confidence is "low" (engine doesn't recognise the role):
 *     → Single Ollama call: normalise title + risk analysis + 3 contextual pivot recommendations
 *     → Try engine again on normalised title (may hit now)
 *     → If engine still low confidence, use LLM output directly
 *  4. Return AnalysisResult + optional suggested_pivots for instant pivot rendering
 */

import type { Route } from "./+types/api.ai-risk.analyse";
import { analyseJob } from "~/lib/ai-risk/engine";
import type { AnalysisResult } from "~/lib/ai-risk/engine";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";

const SYSTEM_PROMPT = `You are an expert labour economist and AI career strategist. You return valid JSON only. No explanation, no markdown, no em dashes, no en dashes. Use plain hyphens everywhere (e.g. "3-6 months").`;

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
    "Specific, concrete AI threat for this exact role",
    "Another concrete threat"
  ],
  "human_edges": [
    "Specific human advantage AI cannot replicate in this role",
    "Another irreplaceable human skill"
  ],
  "pivots": [
    {
      "role": "Specific pivot role title",
      "risk_pct": 20,
      "why": "One sentence connecting from this role to the pivot, starting with a verb",
      "skills": ["skill1", "skill2", "skill3"],
      "timeline": "3-6 months",
      "difficulty": 1
    },
    {
      "role": "Another pivot role",
      "risk_pct": 25,
      "why": "One sentence why this transition makes sense",
      "skills": ["skill1", "skill2", "skill3"],
      "timeline": "6-12 months",
      "difficulty": 2
    },
    {
      "role": "Third pivot role",
      "risk_pct": 30,
      "why": "One sentence explanation",
      "skills": ["skill1", "skill2", "skill3"],
      "timeline": "12-24 months",
      "difficulty": 3
    }
  ]
}

Rules:
- risk_pct: 0-100, realistic estimate of AI automation probability in 5-10 years
- risk_level: "low" (<30%), "medium" (30-59%), "high" (60-79%), "critical" (>=80%)
- timeline_years: 2-15, years before significant displacement
- risk_drivers and human_edges: specific to this exact role, not generic platitudes
- pivots: 3 specific roles that leverage existing skills with lower AI risk than current role
- each pivot risk_pct must be lower than the main risk_pct
- pivot difficulty: 1=easy transition, 2=moderate upskilling, 3=significant career shift
- pivot why: start with a verb or noun, never "You"
- No em dashes or en dashes anywhere - use plain hyphens`;
}

type LLMResult = {
  normalized_title: string;
  risk_pct: number;
  timeline_years: number;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_drivers: string[];
  human_edges: string[];
  pivots: SuggestedPivot[];
};

export type SuggestedPivot = {
  role: string;
  risk_pct: number;
  why: string;
  skills: string[];
  timeline: string;
  difficulty: 1 | 2 | 3;
};

function getRiskLevelFromPct(pct: number): "low" | "medium" | "high" | "critical" {
  if (pct >= 80) return "critical";
  if (pct >= 60) return "high";
  if (pct >= 30) return "medium";
  return "low";
}

function stripCompany(input: string): string {
  return input.replace(/\s+(at|@|in|for|with)\s+[\w\s&.,'()-]{1,60}$/i, "").trim();
}

function sanitiseStr(s: any): string {
  return String(s || "").replace(/[–—]/g, "-").trim();
}

function parsePivots(raw: any[]): SuggestedPivot[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => p?.role && p?.why)
    .map((p) => ({
      role: sanitiseStr(p.role),
      risk_pct: Math.max(1, Math.min(79, Math.round(Number(p.risk_pct) || 20))),
      why: sanitiseStr(p.why),
      skills: Array.isArray(p.skills)
        ? p.skills.slice(0, 4).map((s: any) => sanitiseStr(s))
        : ["Domain expertise", "AI tool fluency"],
      timeline: sanitiseStr(p.timeline || "6-12 months"),
      difficulty: ([1, 2, 3].includes(Number(p.difficulty)) ? Number(p.difficulty) : 2) as 1 | 2 | 3,
    }))
    .slice(0, 3);
}

async function llmAnalyse(rawTitle: string): Promise<LLMResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);

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
        options: { temperature: 0.25, num_predict: 600 },
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = (data?.message?.content || data?.response || "").trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.normalized_title || typeof parsed.risk_pct !== "number") return null;

    const risk_pct = Math.max(1, Math.min(99, Math.round(Number(parsed.risk_pct))));

    return {
      normalized_title: sanitiseStr(parsed.normalized_title),
      risk_pct,
      timeline_years: Math.max(2, Math.min(20, Math.round(Number(parsed.timeline_years) || 7))),
      risk_level: getRiskLevelFromPct(risk_pct),
      risk_drivers: Array.isArray(parsed.risk_drivers)
        ? parsed.risk_drivers.slice(0, 3).map(sanitiseStr)
        : ["AI automation is affecting routine tasks in this role"],
      human_edges: Array.isArray(parsed.human_edges)
        ? parsed.human_edges.slice(0, 3).map(sanitiseStr)
        : ["Human judgment and contextual expertise remain valuable"],
      pivots: parsePivots(parsed.pivots || []),
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

  // Step 3: high/medium confidence — engine knows this role, return instantly
  // The frontend will still call /api/ai-risk/suggest for LLM pivot enhancement
  if (engineResult.confidence === "high" || engineResult.confidence === "medium") {
    return Response.json({ ...engineResult, job_input: rawInput, suggested_pivots: null });
  }

  // Step 4: low confidence — call LLM for full analysis + pivots in one shot
  const llmResult = await llmAnalyse(rawInput);

  if (llmResult) {
    // Try engine again on the normalised title — may match now (e.g. "gtm" -> "Go-to-Market Manager")
    const secondPass = analyseJob(llmResult.normalized_title);

    if (secondPass.confidence === "high" || secondPass.confidence === "medium") {
      // Engine has authoritative data for this role; use engine analysis but LLM pivots
      return Response.json({
        ...secondPass,
        job_input: rawInput,
        suggested_pivots: llmResult.pivots.length > 0 ? llmResult.pivots : null,
      });
    }

    // Engine still doesn't know it — use LLM analysis + LLM pivots entirely
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
      confidence: "medium" as const,
      suggested_pivots: llmResult.pivots.length > 0 ? llmResult.pivots : null,
    } satisfies AnalysisResult & { suggested_pivots: SuggestedPivot[] | null });
  }

  // Step 5: LLM failed — return keyword-inferred result with title-cased title, no pivots override
  const titleCased = cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return Response.json({
    ...engineResult,
    job_input: rawInput,
    matched_title: titleCased,
    suggested_pivots: null,
  });
}
