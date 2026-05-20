import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/cc.analysis";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Career Analysis | CareerDojo" }];
}

const CC_API = "/api/v1/cc";

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - score / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
        <circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
        />
        <text x="64" y="60" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" style={{ fontSize: 28, fontWeight: 800, fill: "#111" }}>
          {score}
        </text>
        <text x="64" y="82" textAnchor="middle" style={{ fontSize: 11, fill: "#6b7280" }}>/ 100</text>
      </svg>
      <span className="text-sm font-semibold text-neutral-600">{label}</span>
    </div>
  );
}

function GapBar({ label, score }: { label: string; score: number }) {
  const color = score > 70 ? "#22c55e" : score > 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-neutral-700">{label}</span>
        <span style={{ color }}>{score}%</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function CcAnalysis() {
  const [params] = useSearchParams();
  const studentId = params.get("id");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setError("No student ID found."); setLoading(false); return; }
    fetch(`${CC_API}/dashboard/${studentId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Could not load your analysis."); setLoading(false); });
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-neutral-500 text-sm">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🧠</div>
          <h2 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900 mb-3">
            Analysis not ready yet
          </h2>
          <p className="text-neutral-500 text-sm mb-6">
            {error || "Keep chatting with the coach — your Career DNA generates once we have enough to work with."}
          </p>
          <Link
            to={`/cc/chat${studentId ? "" : ""}`}
            className="inline-block bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all text-sm"
          >
            Continue chatting
          </Link>
        </div>
      </div>
    );
  }

  const path = data.primary_path || {};
  const readiness = path.readiness_score || 0;
  const clarity = path.clarity_score || 0;
  const replyProb = path.reply_probability || 0;
  const skills = path.skills_gap_items || [];
  const companies = path.target_companies || [];
  const summary = path.one_line_summary || "";
  const skillsGap = path.skills_gap_score ?? Math.round(readiness * 0.9);
  const industryGap = path.industry_gap_score ?? Math.round(readiness * 0.85);
  const expGap = path.experience_gap_score ?? Math.round(readiness * 0.8);
  const topAction = skills[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-4 py-4 flex items-center justify-between">
        <Link to="/cc" className="font-['Clash_Display'] font-bold text-neutral-900 text-lg">
          CareerDojo
        </Link>
        <Link
          to={`/cc/chat`}
          className="text-xs font-bold text-violet-600 border border-violet-300 rounded-xl px-3 py-1 hover:bg-violet-50 transition-colors"
        >
          Back to chat
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Summary */}
        {summary && (
          <div className="bg-neutral-900 text-white rounded-2xl p-6 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">Career DNA</div>
            <p className="text-base font-semibold leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Scores */}
        <div className="bg-white border-2 border-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
          <h2 className="font-['Clash_Display'] font-bold text-lg text-neutral-900 mb-6">Your Scores</h2>
          <div className="flex justify-around flex-wrap gap-6">
            <ScoreRing score={readiness} label="Readiness" />
            <ScoreRing score={clarity} label="Clarity" />
            <ScoreRing score={replyProb} label="Reply Probability" />
          </div>
        </div>

        {/* Gap Analysis */}
        <div className="bg-white border-2 border-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
          <h2 className="font-['Clash_Display'] font-bold text-lg text-neutral-900 mb-5">Gap Analysis</h2>
          <GapBar label="Skills" score={skillsGap} />
          <GapBar label="Industry Knowledge" score={industryGap} />
          <GapBar label="Experience" score={expGap} />
        </div>

        {/* This week */}
        {topAction && (
          <div className="bg-white border-2 border-neutral-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
            <div className="p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2">One thing. This week.</div>
              <p className="font-bold text-neutral-900 text-base leading-snug mb-3">
                {topAction.action || topAction.skill || topAction.how_to_close || ""}
              </p>
              {topAction.why_it_matters && (
                <div className="bg-neutral-50 rounded-xl p-3 text-xs text-neutral-600 leading-relaxed">
                  <span className="font-bold text-neutral-700 block mb-1 uppercase tracking-wide text-[10px]">Why this matters</span>
                  {topAction.why_it_matters}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roadmap */}
        {skills.length > 1 && (
          <div className="bg-white border-2 border-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <h2 className="font-['Clash_Display'] font-bold text-lg text-neutral-900 mb-5">Priority Roadmap</h2>
            <div className="space-y-3">
              {skills.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 border-neutral-900 mt-0.5 ${i === 0 ? "bg-violet-500 text-white" : "bg-white text-neutral-500"}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{item.skill || item.action || item.type || ""}</p>
                    {item.why_it_matters && (
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{item.why_it_matters}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target companies */}
        {companies.length > 0 && (
          <div className="bg-white border-2 border-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <h2 className="font-['Clash_Display'] font-bold text-lg text-neutral-900 mb-5">Target Companies</h2>
            <div className="flex flex-wrap gap-2">
              {companies.map((c: string, i: number) => (
                <span key={i} className="text-sm font-semibold bg-violet-50 text-violet-700 border border-violet-200 rounded-xl px-3 py-1">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to chat CTA */}
        <div className="text-center pb-8">
          <Link
            to="/cc/chat"
            className="inline-block bg-violet-500 text-white font-bold px-8 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
          >
            Continue with coach
          </Link>
        </div>
      </div>
    </div>
  );
}
