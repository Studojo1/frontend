import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

export function meta() {
  return [{ title: "Career Analysis | CareerDojo" }];
}

const CC_API = "/api/v1/cc";

type GapStatus = "todo" | "in_progress" | "completed";
type GapItem = { skill?: string; action?: string; type?: string; why_it_matters?: string; how_to_close?: string; how_to_build?: string; priority?: string };

function gapKey(studentId: string) { return `studojo_gaps_${studentId}`; }
function loadProgress(sid: string): Record<string, GapStatus> {
  try { return JSON.parse(localStorage.getItem(gapKey(sid)) || "{}"); } catch { return {}; }
}
function saveProgress(sid: string, data: Record<string, GapStatus>) {
  localStorage.setItem(gapKey(sid), JSON.stringify(data));
}

function ScoreRing({ score, label, size = 110 }: { score: number; label: string; size?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, score)) / 100);
  const color = score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#8b5cf6";
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={animated ? offset : circ}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
        <text x={size/2} y={size/2 - 4} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: size * 0.22, fontWeight: 800, fill: "#111" }}>{score}</text>
        <text x={size/2} y={size/2 + size*0.16} textAnchor="middle"
          style={{ fontSize: size * 0.1, fill: "#9ca3af" }}>/100</text>
      </svg>
      <span className="text-xs font-semibold text-neutral-500">{label}</span>
    </div>
  );
}

function GapBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 120); return () => clearTimeout(t); }, [score]);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-neutral-700">{label}</span>
        <span style={{ color }}>{score}%</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${w}%`, background: color, transition: "width 0.9s ease" }} />
      </div>
    </div>
  );
}

const STATUS_NEXT: Record<GapStatus, GapStatus> = { todo: "in_progress", in_progress: "completed", completed: "todo" };
const STATUS_LABEL: Record<GapStatus, string> = { todo: "Not started", in_progress: "In progress", completed: "Done" };
const STATUS_COLOR: Record<GapStatus, string> = {
  todo: "bg-neutral-100 text-neutral-500 border-neutral-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

function ActionItem({ item, idx, progress, onToggle }: {
  item: GapItem; idx: number;
  progress: Record<string, GapStatus>; onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const key = `action_${idx}`;
  const status = progress[key] || "todo";
  const label = item.skill || item.action || item.type || "";
  const why = item.why_it_matters || "";
  const how = item.how_to_close || item.how_to_build || "";
  const priority = (item.priority || "").toLowerCase();

  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all ${status === "completed" ? "border-green-200 bg-green-50/50" : status === "in_progress" ? "border-amber-200 bg-amber-50/30" : "border-neutral-200 bg-white"}`}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${idx === 0 && status === "todo" ? "bg-violet-500 border-violet-500 text-white" : "bg-white border-neutral-300 text-neutral-500"}`}>{idx + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${status === "completed" ? "line-through text-neutral-400" : "text-neutral-800"}`}>{label}</span>
            {priority === "high" && <span className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full">High</span>}
            {priority === "medium" && <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">Medium</span>}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggle(key); }}
          className={`text-xs font-semibold px-2 py-1 rounded-lg border flex-shrink-0 ${STATUS_COLOR[status]}`}
        >{STATUS_LABEL[status]}</button>
        <span className="text-neutral-400 text-xs">{open ? "↑" : "↓"}</span>
      </div>
      {open && (why || how) && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-neutral-100">
          {why && (
            <div className="mt-3 bg-neutral-50 rounded-xl p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1">Why this matters</div>
              <p className="text-sm text-neutral-700 leading-relaxed">{why}</p>
            </div>
          )}
          {how && (
            <div className="bg-violet-50 rounded-xl p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-violet-400 mb-1">How to close it</div>
              <p className="text-sm text-violet-800 leading-relaxed">{how}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CcAnalysis() {
  const [params] = useSearchParams();
  const studentId = params.get("id") || localStorage.getItem("studojo_cc_student_id") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<Record<string, GapStatus>>({});

  useEffect(() => {
    if (!studentId) { setError("No student ID found. Go back to chat."); setLoading(false); return; }
    setProgress(loadProgress(studentId));
    fetch(`${CC_API}/dashboard/${studentId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Could not load your analysis."); setLoading(false); });
  }, [studentId]);

  function toggleStatus(key: string) {
    setProgress(prev => {
      const current = prev[key] || "todo";
      const next = STATUS_NEXT[current];
      const updated = { ...prev, [key]: next };
      saveProgress(studentId, updated);
      return updated;
    });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-neutral-500 text-sm">Loading your analysis...</p>
      </div>
    </div>
  );

  if (error || !data?.ready) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🧠</div>
        <h2 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900 mb-3">Analysis not ready yet</h2>
        <p className="text-neutral-500 text-sm mb-6">{error || "Keep chatting — your Career DNA generates once the coach has enough to work with."}</p>
        <Link to="/cc/chat" className="inline-block bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all text-sm">
          Continue chatting
        </Link>
      </div>
    </div>
  );

  const path = data.primary_path || {};
  const readiness = path.readiness_score || 0;
  const clarity = path.clarity_score || 0;
  const replyProb = path.reply_probability || 0;
  const summary = path.one_line_summary || "";
  const actions: GapItem[] = path.skills_gap_items || [];
  const companies: string[] = path.target_companies || [];
  const altRoles: string[] = path.alternative_roles || [];
  const skillsGap = path.skills_gap_score || Math.round(readiness * 0.9);
  const industryGap = path.industry_gap_score || Math.round(readiness * 0.85);
  const expGap = path.experience_gap_score || Math.round(readiness * 0.8);
  const topAction = actions[0];
  const altAction = actions[1];
  const completedCount = actions.filter((_, i) => (progress[`action_${i}`] || "todo") === "completed").length;
  const potentialReply = Math.min(99, replyProb + Math.round(completedCount * 2.5));

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/cc" className="font-['Clash_Display'] font-bold text-neutral-900 text-lg">CareerDojo</Link>
        <Link to="/cc/chat" className="text-xs font-bold text-violet-600 border border-violet-300 rounded-xl px-3 py-1 hover:bg-violet-50 transition-colors">Back to chat</Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* DNA summary */}
        {summary && (
          <div className="bg-neutral-900 text-white rounded-2xl p-5 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">Career DNA</div>
            <p className="text-sm font-semibold leading-relaxed">{summary}</p>
            {(path.target_role || path.target_industry) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {path.target_role && <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{path.target_role}</span>}
                {path.target_industry && <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{path.target_industry}</span>}
              </div>
            )}
          </div>
        )}

        {/* Scores */}
        <div className="bg-white border-2 border-neutral-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
          <h2 className="font-['Clash_Display'] font-bold text-neutral-900 mb-5">Your Scores</h2>
          <div className="flex justify-around flex-wrap gap-4">
            <ScoreRing score={readiness} label="Readiness" />
            <ScoreRing score={clarity} label="Clarity" />
            <ScoreRing score={replyProb} label="Reply Rate" />
          </div>
          {completedCount > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-green-700 font-semibold">{completedCount} action{completedCount > 1 ? "s" : ""} completed — reply rate could reach <strong>{potentialReply}%</strong></p>
            </div>
          )}
        </div>

        {/* Gap analysis */}
        <div className="bg-white border-2 border-neutral-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
          <h2 className="font-['Clash_Display'] font-bold text-neutral-900 mb-4">Gap Analysis</h2>
          <GapBar label="Skills" score={skillsGap} />
          <GapBar label="Industry Knowledge" score={industryGap} />
          <GapBar label="Experience" score={expGap} />
        </div>

        {/* This week card */}
        {topAction && (
          <div className="bg-white border-2 border-neutral-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] group">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
            <div className="p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2">One thing. This week.</div>
              <p className="font-bold text-neutral-900 text-base leading-snug mb-1">{topAction.action || topAction.skill || topAction.how_to_close || ""}</p>
              <p className="text-xs text-neutral-400 mb-3 group-hover:hidden">Hover to see why and how</p>
              <div className="max-h-0 overflow-hidden group-hover:max-h-64 transition-all duration-300">
                {topAction.why_it_matters && (
                  <div className="bg-neutral-50 rounded-xl p-3 mb-2">
                    <div className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1">Why this matters</div>
                    <p className="text-sm text-neutral-700 leading-relaxed">{topAction.why_it_matters}</p>
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl px-3 py-2 text-xs text-neutral-700 mb-3">
                This moves your reply rate from <strong className="text-violet-600">{replyProb}%</strong> toward <strong className="text-violet-600">{Math.min(99, replyProb + 5)}%</strong>. Everything else comes after this.
              </div>
              {altAction && (
                <details className="border-t border-neutral-100 pt-3">
                  <summary className="text-xs font-semibold text-neutral-500 cursor-pointer hover:text-neutral-700 list-none flex items-center gap-1">
                    <span>Can't do this right now?</span><span className="text-violet-400">↓</span>
                  </summary>
                  <div className="mt-2 pl-2 border-l-2 border-violet-200">
                    <p className="text-sm font-semibold text-neutral-800">{altAction.action || altAction.skill || ""}</p>
                    {altAction.why_it_matters && <p className="text-xs text-neutral-500 mt-1">{altAction.why_it_matters}</p>}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Full roadmap with status tracking */}
        {actions.length > 0 && (
          <div className="bg-white border-2 border-neutral-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Clash_Display'] font-bold text-neutral-900">Full Roadmap</h2>
              <span className="text-xs text-neutral-500">{completedCount}/{actions.length} done</span>
            </div>
            {actions.length > 1 && (
              <div className="h-1.5 bg-neutral-100 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${Math.round(completedCount / actions.length * 100)}%` }} />
              </div>
            )}
            <div className="flex flex-col gap-3">
              {actions.map((item, i) => (
                <ActionItem key={i} item={item} idx={i} progress={progress} onToggle={toggleStatus} />
              ))}
            </div>
          </div>
        )}

        {/* Target companies */}
        {companies.length > 0 && (
          <div className="bg-white border-2 border-neutral-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <h2 className="font-['Clash_Display'] font-bold text-neutral-900 mb-4">Target Companies</h2>
            <div className="flex flex-wrap gap-2">
              {companies.map((c, i) => (
                <span key={i} className="text-sm font-semibold bg-violet-50 text-violet-700 border border-violet-200 rounded-xl px-3 py-1">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Alternative roles */}
        {altRoles.length > 0 && (
          <div className="bg-white border-2 border-neutral-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <h2 className="font-['Clash_Display'] font-bold text-neutral-900 mb-3">Also Consider</h2>
            <div className="flex flex-wrap gap-2">
              {altRoles.map((r, i) => (
                <span key={i} className="text-sm font-medium bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl px-3 py-1">{r}</span>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pb-6">
          <Link to="/cc/chat" className="inline-block bg-violet-500 text-white font-bold px-8 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all">
            Continue with coach
          </Link>
        </div>
      </div>
    </div>
  );
}
