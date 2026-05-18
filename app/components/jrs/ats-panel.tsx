// JRS ATS panel — paste a job description, score the resume against it.
import { useState } from "react";
import { type ResumeData, resumeToText } from "~/lib/jrs/types";

interface AtsResult {
  score: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
  source: "ai" | "local";
}

function scoreColor(score: number): string {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

export function AtsPanel({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (d: ResumeData) => void;
}) {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [error, setError] = useState("");
  const [tailored, setTailored] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);

  const analyse = async () => {
    if (jd.trim().length < 20 || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resume-maker/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resumeToText(data), jobDescription: jd }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not analyse. Try again.");
      } else {
        setResult(json as AtsResult);
      }
    } catch {
      setError("Couldn't connect. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const tailor = async () => {
    if (jd.trim().length < 20 || tailoring) return;
    setTailoring(true);
    setError("");
    setTailored(false);
    try {
      const res = await fetch("/api/resume-maker/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, jobDescription: jd }),
      });
      const json = await res.json();
      if (!res.ok || !json.data) {
        setError(json.error || "Could not tailor the resume. Try again.");
      } else {
        onChange(json.data as ResumeData);
        setTailored(true);
      }
    } catch {
      setError("Couldn't connect. Check your internet and try again.");
    } finally {
      setTailoring(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-bold text-neutral-900">ATS &amp; job-match check</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Paste a job description — we'll score how well your resume matches and show the gaps.
        </p>
      </div>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={6}
        placeholder="Paste the full job description here..."
        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={analyse}
          disabled={loading || jd.trim().length < 20}
          className="flex-1 bg-violet-600 text-white font-semibold rounded-lg py-2.5 text-sm hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analysing..." : "Analyse match"}
        </button>
        <button
          type="button"
          onClick={tailor}
          disabled={tailoring || jd.trim().length < 20}
          title="Rewrite your whole resume to target this job"
          className="flex-1 rounded-lg border-2 border-neutral-900 bg-amber-300 py-2.5 text-sm font-bold text-neutral-900 transition-transform hover:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {tailoring ? "Tailoring..." : "✨ Tailor my resume"}
        </button>
      </div>

      {tailored && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Resume tailored to this job. Check the preview — every fact was kept,
          only the wording changed. Re-run "Analyse match" to see the new score.
        </p>
      )}

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-white"
              style={{ background: scoreColor(result.score) }}
            >
              {result.score}
            </div>
            <div>
              <p className="font-bold text-neutral-900">
                {result.score >= 75
                  ? "Strong match"
                  : result.score >= 50
                    ? "Decent match — tighten it up"
                    : "Weak match — needs work"}
              </p>
              <p className="text-xs text-neutral-500">
                {result.matched.length} matched / {result.missing.length} missing keywords
                {result.source === "local" ? " · keyword scan" : " · AI analysis"}
              </p>
            </div>
          </div>

          {result.matched.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-600 mb-1.5">Matched keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((k) => (
                  <span
                    key={k}
                    className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-600 mb-1.5">Missing keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((k) => (
                  <span
                    key={k}
                    className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-700"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-600 mb-1.5">How to improve</p>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-700">
                    <span className="text-violet-500">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
