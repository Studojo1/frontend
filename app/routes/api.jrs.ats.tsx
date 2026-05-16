// JRS ATS analysis — scores a resume against a job description.
// Primary: OpenAI gpt-4o-mini. Fallback: local keyword-overlap so the
// feature still works if the API key is missing or the call fails.
import type { Route } from "./+types/api.jrs.ats";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface AtsResult {
  score: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
  source: "ai" | "local";
}

// Words too generic to count as JD keywords.
const STOP = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "have", "has",
  "this", "that", "from", "all", "can", "who", "was", "but", "not", "they", "their",
  "a", "an", "to", "of", "in", "on", "at", "as", "is", "be", "or", "we", "it", "by",
  "work", "team", "role", "job", "looking", "ability", "strong", "good", "experience",
  "years", "year", "skills", "knowledge", "including", "etc", "must", "should", "able",
  "plus", "preferred", "required", "responsibilities", "requirements", "candidate",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** Pure-JS keyword-overlap analysis — no LLM. */
function localAnalysis(resumeText: string, jd: string): AtsResult {
  const resumeSet = new Set(tokens(resumeText));
  const jdTokens = tokens(jd);
  // Frequency-rank JD keywords, keep the top distinct ones.
  const freq = new Map<string, number>();
  for (const t of jdTokens) freq.set(t, (freq.get(t) || 0) + 1);
  const ranked = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w);
  const keywords = ranked.slice(0, 25);

  const matched = keywords.filter((k) => resumeSet.has(k));
  const missing = keywords.filter((k) => !resumeSet.has(k));
  const score = keywords.length
    ? Math.round((matched.length / keywords.length) * 100)
    : 0;

  const suggestions: string[] = [];
  if (missing.length)
    suggestions.push(
      `Work these missing keywords into your bullets where they're genuinely true: ${missing
        .slice(0, 6)
        .join(", ")}.`,
    );
  if (score < 60)
    suggestions.push("Mirror the job description's wording in your experience bullets.");
  suggestions.push("Quantify outcomes — numbers survive ATS keyword and recruiter scans.");

  return { score, matched, missing, suggestions, source: "local" };
}

async function aiAnalysis(resumeText: string, jd: string): Promise<AtsResult | null> {
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
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an ATS resume analyst. Compare a resume to a job description and return JSON only. " +
              "Schema: {\"score\": number 0-100, \"matched\": string[], \"missing\": string[], \"suggestions\": string[]}. " +
              "score = how well the resume matches the JD. matched = important JD keywords/skills present in the resume. " +
              "missing = important JD keywords/skills absent from the resume. suggestions = 3-5 short, concrete fixes. " +
              "Never suggest lying or adding skills the candidate does not have.",
          },
          {
            role: "user",
            content: `JOB DESCRIPTION:\n${jd}\n\nRESUME:\n${resumeText}`,
          },
        ],
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      matched: Array.isArray(parsed.matched) ? parsed.matched.slice(0, 30).map(String) : [],
      missing: Array.isArray(parsed.missing) ? parsed.missing.slice(0, 30).map(String) : [],
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 6).map(String)
        : [],
      source: "ai",
    };
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

  const resumeText = typeof body.resumeText === "string" ? body.resumeText.trim() : "";
  const jobDescription =
    typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";

  if (resumeText.length < 20) {
    return Response.json({ error: "Add more to your resume first" }, { status: 400 });
  }
  if (jobDescription.length < 20) {
    return Response.json({ error: "Paste a job description to analyse against" }, { status: 400 });
  }

  const ai = await aiAnalysis(resumeText.slice(0, 8000), jobDescription.slice(0, 6000));
  const result = ai ?? localAnalysis(resumeText, jobDescription);
  return Response.json(result);
}
