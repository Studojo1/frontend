import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

export function meta() {
  return [{ title: "Bridge the Gap | CareerDojo" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_student_id";

type GapStatus = "todo" | "in_progress" | "completed";

const SOFT_SKILLS_FALLBACK = [
  { skill: "Executive Communication", priority: "high", why_it_matters: "Every hiring manager values clear, concise communication above almost everything else.", how_to_close: "Write one cold email per day. Ask someone senior to review it. Iterate." },
  { skill: "Personal Branding on LinkedIn", priority: "high", why_it_matters: "A LinkedIn profile that looks like a professional signals you are serious. Recruiters check before replying.", how_to_close: "Rewrite your headline to include your target role. Add a summary in first person. Add your top 3 projects." },
  { skill: "Structured Problem Solving", priority: "medium", why_it_matters: "Every interview round tests how you break down problems. Structured thinking is learnable.", how_to_close: "Practice 3 case-style problems per week. Use the MECE framework. Write the answer before speaking." },
  { skill: "Stakeholder Management", priority: "medium", why_it_matters: "The ability to manage up, down, and sideways is what separates candidates who get offers from those who don't.", how_to_close: "In every group project, take the lead on one communication touchpoint. Document it for your resume." },
  { skill: "Data Interpretation", priority: "medium", why_it_matters: "Most roles — even non-technical ones — now require reading dashboards and drawing conclusions from numbers.", how_to_close: "Download a free dataset from Kaggle. Describe 5 trends you see. Write it as a short report." },
  { skill: "Cold Outreach Personalisation", priority: "high", why_it_matters: "Generic emails get zero replies. Personalised ones that reference specific company context get 15–20%.", how_to_close: "Before every outreach, spend 5 minutes researching the person's LinkedIn and the company's recent news. Lead with that." },
];

function gapKey(studentId: string) { return `studojo_gaps_${studentId}`; }
function loadProgress(sid: string): Record<string, GapStatus> {
  try { return JSON.parse(localStorage.getItem(gapKey(sid)) || "{}"); } catch { return {}; }
}
function saveProgress(sid: string, data: Record<string, GapStatus>) {
  localStorage.setItem(gapKey(sid), JSON.stringify(data));
}

const STATUS_NEXT: Record<GapStatus, GapStatus> = { todo: "in_progress", in_progress: "completed", completed: "todo" };
const STATUS_LABEL: Record<GapStatus, string> = { todo: "Not started", in_progress: "In progress", completed: "Done" };
const STATUS_COLOR: Record<GapStatus, string> = {
  todo: "background:#f5f5f4;color:#71717a;border:2px solid rgba(0,0,0,0.15)",
  in_progress: "background:#fef3c7;color:#92400e;border:2px solid #f59e0b",
  completed: "background:#d1fae5;color:#065f46;border:2px solid #10b981",
};

const PRIORITY_STYLE: Record<string, string> = {
  high: "background:#ef4444;color:white;border:2px solid #111",
  medium: "background:#f59e0b;color:white;border:2px solid #111",
  low: "background:#8b5cf6;color:white;border:2px solid #111",
};

type ActionItem = {
  skill?: string; action?: string; type?: string;
  why_it_matters?: string; how_to_close?: string; how_to_build?: string;
  priority?: string;
};

function ActionCard({ item, idx, progress, onToggle }: {
  item: ActionItem; idx: number;
  progress: Record<string, GapStatus>; onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const key = `action_${idx}`;
  const status = progress[key] || "todo";
  const label = item.action || item.skill || item.type || "";
  const why = item.why_it_matters || "";
  const how = item.how_to_close || item.how_to_build || "";
  const priority = (item.priority || "medium").toLowerCase();
  const priStyle = PRIORITY_STYLE[priority] || PRIORITY_STYLE.medium;
  const stStyle = STATUS_COLOR[status];
  const isFirst = idx === 0 && status === "todo";

  return (
    <div style={{
      border: status === "completed" ? "2px solid #10b981" : status === "in_progress" ? "2px solid #f59e0b" : "2px solid #111",
      borderRadius: 16, overflow: "hidden", marginBottom: 12,
      background: status === "completed" ? "#f0fdf4" : status === "in_progress" ? "#fffbeb" : "white",
      boxShadow: isFirst ? "4px 4px 0 #111" : "3px 3px 0 #111",
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.7rem", fontWeight: 800, border: "2px solid #111",
          background: isFirst ? "linear-gradient(135deg,#8b5cf6,#ec4899)" : status === "completed" ? "#10b981" : "white",
          color: isFirst || status === "completed" ? "white" : "#a1a1aa",
        }}>
          {status === "completed" ? "✓" : idx + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: "0.9rem", fontWeight: 700,
              textDecoration: status === "completed" ? "line-through" : "none",
              color: status === "completed" ? "#a1a1aa" : "#111",
            }}>{label}</span>
            {priority && <span style={{ ...Object.fromEntries(priStyle.split(";").map(s => { const [k,v] = s.split(":"); return [k.trim().replace(/-([a-z])/g, (_,c) => c.toUpperCase()), v?.trim()]; }).filter(([k]) => k)), fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, boxShadow: "1px 1px 0 #111" }}>
              {priority}
            </span>}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggle(key); }}
          style={{ ...Object.fromEntries(stStyle.split(";").map(s => { const [k,v] = s.split(":"); return [k.trim().replace(/-([a-z])/g, (_,c) => c.toUpperCase()), v?.trim()]; }).filter(([k]) => k)), fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 8, cursor: "pointer", flexShrink: 0, fontFamily: "Inter,sans-serif" }}
        >{STATUS_LABEL[status]}</button>
        <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>{open ? "↑" : "↓"}</span>
      </div>
      {open && (why || how) && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
          {why && (
            <div style={{ background: "#f5f5f4", borderRadius: 10, padding: "10px 14px", marginTop: 10 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a1a1aa", marginBottom: 4 }}>Why this matters</div>
              <p style={{ fontSize: "0.83rem", color: "#374151", lineHeight: 1.6 }}>{why}</p>
            </div>
          )}
          {how && (
            <div style={{ background: "#f3f0ff", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8b5cf6", marginBottom: 4 }}>How to close it</div>
              <p style={{ fontSize: "0.83rem", color: "#4c1d95", lineHeight: 1.6 }}>{how}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnimBar({ label, score, color }: { label: string; score: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 150); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: 5 }}>
        <span style={{ color: "#374151" }}>{label}</span>
        <span style={{ color }}>{score}%</span>
      </div>
      <div style={{ height: 10, background: "#f5f5f4", borderRadius: 999, border: "1px solid #111", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#8b5cf6,#ec4899)", width: `${w}%`, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

export default function CcRoadmap() {
  const [params] = useSearchParams();
  const studentId = params.get("id") || (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : "") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, GapStatus>>({});
  const [tab, setTab] = useState<"roadmap" | "skills" | "industry" | "experience">("roadmap");

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    setProgress(loadProgress(studentId));
    fetch(`${CC_API}/dashboard/${studentId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [studentId]);

  function toggleStatus(key: string) {
    setProgress(prev => {
      const next = { ...prev, [key]: STATUS_NEXT[prev[key] || "todo"] };
      saveProgress(studentId, next);
      return next;
    });
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf9", fontFamily: "Inter,sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e9d5ff", borderTopColor: "#8b5cf6", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ color: "#71717a", fontSize: "0.875rem" }}>Loading your roadmap...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!data?.ready) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf9", fontFamily: "Inter,sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 360, padding: 24 }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🗺️</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 10 }}>Roadmap not ready yet</h2>
        <p style={{ color: "#71717a", fontSize: "0.875rem", marginBottom: 24 }}>Complete your coaching session first. Your personalised roadmap generates after Career DNA analysis.</p>
        <Link to="/cc/chat" style={{ display: "inline-block", background: "linear-gradient(90deg,#8b5cf6,#ec4899)", border: "3px solid #111", borderRadius: 999, boxShadow: "4px 4px 0 #111", padding: "13px 28px", color: "white", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
          Continue with coach →
        </Link>
      </div>
    </div>
  );

  const path = data.primary_path || {};
  const readiness = path.readiness_score || 0;
  const reply = path.reply_probability || 0;
  const allActions: ActionItem[] = path.skills_gap_items?.length ? path.skills_gap_items : SOFT_SKILLS_FALLBACK;
  const topAction = allActions[0];
  const altAction = allActions[1];
  const completedCount = allActions.filter((_, i) => (progress[`action_${i}`] || "todo") === "completed").length;
  const inProgressCount = allActions.filter((_, i) => (progress[`action_${i}`] || "todo") === "in_progress").length;
  const pct = allActions.length ? Math.round((completedCount / allActions.length) * 100) : 0;
  const potentialReply = Math.min(99, reply + completedCount * 3);
  const skillsGap = path.skills_gap_score || Math.max(0, 100 - readiness + 10);
  const industryGap = path.industry_gap_score || Math.max(0, 100 - readiness - 10);
  const expGap = path.experience_gap_score || Math.max(0, 100 - readiness);
  const gapColor = (s: number) => s >= 70 ? "#10b981" : s >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "Inter,sans-serif", color: "#111" }}>
      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, height: 64, background: "white", borderBottom: "2px solid #111", boxShadow: "0 2px 0 #111", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <Link to="/cc" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", color: "#111" }}>
          studojo<span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(90deg,#8b5cf6,#ec4899)", display: "inline-block" }} />
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to={`/cc/dashboard?id=${studentId}`} style={{ background: "white", border: "2px solid #111", borderRadius: 999, boxShadow: "3px 3px 0 #111", padding: "7px 16px", fontWeight: 600, fontSize: "0.8rem", textDecoration: "none", color: "#111" }}>← Dashboard</Link>
          <Link to={`/cc/analysis?id=${studentId}`} style={{ background: "white", border: "2px solid #111", borderRadius: 999, boxShadow: "3px 3px 0 #111", padding: "7px 16px", fontWeight: 600, fontSize: "0.8rem", textDecoration: "none", color: "#111" }}>Career Analysis</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa", marginBottom: 6 }}>Bridge the Gap</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 8 }}>
            Your Personalised Roadmap
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.9rem" }}>
            {path.target_role ? `Target: ${path.target_role}${path.target_industry ? ` in ${path.target_industry}` : ""}` : "Close the gaps. Track your progress. Keep coming back."}
          </p>
        </div>

        {/* SCORES STRIP */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Readiness", val: `${readiness}`, sub: "/100", color: "#8b5cf6" },
            { label: "Reply Rate", val: `${reply}%`, sub: "cold outreach", color: "#10b981" },
            { label: "Actions Done", val: `${completedCount}`, sub: `of ${allActions.length}`, color: "#f59e0b" },
          ].map(({ label, val, sub, color }) => (
            <div key={label} style={{ background: "white", border: "2px solid #111", borderRadius: 16, boxShadow: "3px 3px 0 #111", padding: "18px 20px" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color, letterSpacing: "-0.03em" }}>{val}<span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#a1a1aa" }}>{sub}</span></div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* OVERALL PROGRESS BAR */}
        <div style={{ background: "white", border: "2px solid #111", borderRadius: 16, boxShadow: "3px 3px 0 #111", padding: "18px 22px", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Gap Closure Progress</div>
              <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: 2 }}>
                {completedCount === allActions.length && allActions.length > 0
                  ? "All gaps closed — you are outreach ready."
                  : inProgressCount > 0
                  ? `${inProgressCount} in progress. Keep going.`
                  : completedCount > 0
                  ? `Readiness trending up. ${allActions.length - completedCount} gaps remaining.`
                  : "Mark each action as you complete it to track progress."}
              </div>
            </div>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#10b981" }}>{completedCount} of {allActions.length} closed</div>
          </div>
          <div style={{ height: 10, background: "#f5f5f4", borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#10b981,#14b8a6)", borderRadius: 999, width: `${pct}%`, transition: "width 0.5s ease" }} />
          </div>
          {completedCount > 0 && (
            <div style={{ marginTop: 10, background: "#f0fdf4", border: "1px solid #10b981", borderRadius: 10, padding: "8px 14px", fontSize: "0.78rem", color: "#065f46", fontWeight: 600 }}>
              {completedCount} action{completedCount > 1 ? "s" : ""} completed — reply rate could reach <strong>{potentialReply}%</strong>
            </div>
          )}
        </div>

        {/* THIS WEEK CARD */}
        {topAction && (
          <div style={{ background: "white", border: "3px solid #111", borderRadius: 20, boxShadow: "5px 5px 0 #111", overflow: "hidden", marginBottom: 28 }}>
            <div style={{ height: 5, background: "linear-gradient(90deg,#8b5cf6,#ec4899)" }} />
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8b5cf6", marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
                One thing. This week.
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.35, marginBottom: 14 }}>
                {topAction.action || topAction.skill || topAction.how_to_close || ""}
              </div>
              {(topAction.why_it_matters || topAction.how_to_close || topAction.how_to_build) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {topAction.why_it_matters && (
                    <div style={{ background: "#f5f5f4", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#a1a1aa", marginBottom: 4 }}>Why this matters</div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.45 }}>{topAction.why_it_matters}</div>
                    </div>
                  )}
                  {(topAction.how_to_close || topAction.how_to_build) && (
                    <div style={{ background: "#f3f0ff", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8b5cf6", marginBottom: 4 }}>Exactly how</div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.45, color: "#4c1d95" }}>{topAction.how_to_close || topAction.how_to_build}</div>
                    </div>
                  )}
                </div>
              )}
              <div style={{ background: "linear-gradient(90deg,#f3f0ff,#fdf2ff)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: "0.83rem", marginBottom: altAction ? 14 : 0 }}>
                This single action moves your reply rate from <strong style={{ color: "#8b5cf6" }}>{reply}%</strong> toward <strong style={{ color: "#8b5cf6" }}>{Math.min(99, reply + 5)}%</strong>. Everything else comes after this one.
              </div>
              {altAction && (
                <details style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 12, marginTop: 2 }}>
                  <summary style={{ fontSize: "0.78rem", fontWeight: 600, color: "#71717a", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 6 }}>
                    Can't do this right now? <span style={{ color: "#8b5cf6" }}>↓</span>
                  </summary>
                  <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: "3px solid #e9d5ff" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{altAction.action || altAction.skill || ""}</div>
                    {altAction.why_it_matters && <div style={{ fontSize: "0.78rem", color: "#71717a", marginTop: 4, lineHeight: 1.5 }}>{altAction.why_it_matters}</div>}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* TAB NAV */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "white", border: "2px solid #111", borderRadius: 14, padding: 4, boxShadow: "3px 3px 0 #111" }}>
          {([
            { key: "roadmap", label: "Full Roadmap" },
            { key: "skills", label: `Skills Gap` },
            { key: "industry", label: "Industry Gap" },
            { key: "experience", label: "Experience Gap" },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "8px 4px", border: "none", borderRadius: 10, fontFamily: "Inter,sans-serif",
              fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s",
              background: tab === key ? "linear-gradient(90deg,#8b5cf6,#a855f7)" : "transparent",
              color: tab === key ? "white" : "#71717a",
              boxShadow: tab === key ? "2px 2px 0 #111" : "none",
            }}>{label}</button>
          ))}
        </div>

        {/* FULL ROADMAP TAB */}
        {tab === "roadmap" && (
          <div>
            <div style={{ background: "white", border: "2px solid #111", borderRadius: 20, boxShadow: "4px 4px 0 #111", padding: "22px 26px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 800 }}>Priority Actions</div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: 2 }}>Complete these in order. The highest priority items are listed first.</div>
                </div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#71717a" }}>{completedCount}/{allActions.length} done</div>
              </div>
              {allActions.map((item, i) => (
                <ActionCard key={i} item={item} idx={i} progress={progress} onToggle={toggleStatus} />
              ))}
            </div>

            {/* Target companies */}
            {(path.target_companies || []).length > 0 && (
              <div style={{ background: "white", border: "2px solid #111", borderRadius: 20, boxShadow: "4px 4px 0 #111", padding: "22px 26px", marginBottom: 20 }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a1a1aa", marginBottom: 8 }}>Target Companies</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(path.target_companies || []).map((c: string, i: number) => (
                    <span key={i} style={{ fontSize: "0.83rem", fontWeight: 600, background: "#f3f0ff", color: "#8b5cf6", border: "2px solid #111", borderRadius: 999, padding: "5px 14px", boxShadow: "2px 2px 0 #111" }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative roles */}
            {(path.alternative_roles || []).length > 0 && (
              <div style={{ background: "white", border: "2px solid #111", borderRadius: 20, boxShadow: "4px 4px 0 #111", padding: "22px 26px", marginBottom: 20 }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a1a1aa", marginBottom: 8 }}>Also Consider</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(path.alternative_roles || []).map((r: string, i: number) => (
                    <span key={i} style={{ fontSize: "0.83rem", fontWeight: 600, background: "#f5f5f4", color: "#374151", border: "2px solid #111", borderRadius: 999, padding: "5px 14px", boxShadow: "2px 2px 0 #111" }}>{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SKILLS GAP TAB */}
        {tab === "skills" && (
          <div style={{ background: "white", border: "2px solid #111", borderRadius: 20, boxShadow: "4px 4px 0 #111", overflow: "hidden" }}>
            <div style={{ height: 6, background: "#ef4444" }} />
            <div style={{ padding: "22px 26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: "1rem", fontWeight: 700 }}>Skills Gap</div>
                <div style={{ background: "#ef4444", color: "white", border: "2px solid #111", borderRadius: 999, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700, boxShadow: "2px 2px 0 #111" }}>{allActions.length}</div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#71717a", marginBottom: 20 }}>Skills the market expects for {path.target_role || "your target role"}. Close these to unlock your first reply.</div>
              <AnimBar label="Current skill readiness" score={skillsGap} color={gapColor(skillsGap)} />
              <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "16px 0" }} />
              {allActions.map((item, i) => (
                <ActionCard key={i} item={item} idx={i} progress={progress} onToggle={toggleStatus} />
              ))}
              <div style={{ marginTop: 16, background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: 12, padding: "12px 16px", fontSize: "0.78rem", fontWeight: 600, color: "#92400e" }}>
                Keep coming back to update your progress. New actions unlock as you close gaps.
              </div>
            </div>
          </div>
        )}

        {/* INDUSTRY GAP TAB */}
        {tab === "industry" && (
          <div style={{ background: "white", border: "2px solid #111", borderRadius: 20, boxShadow: "4px 4px 0 #111", overflow: "hidden" }}>
            <div style={{ height: 6, background: "#8b5cf6" }} />
            <div style={{ padding: "22px 26px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Industry & Market Gap</div>
              <div style={{ fontSize: "0.78rem", color: "#71717a", marginBottom: 20 }}>How well you understand the industry, hiring signals, and market context for {path.target_industry || "your target industry"}.</div>
              <AnimBar label="Industry knowledge readiness" score={industryGap} color={gapColor(industryGap)} />
              <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "16px 0" }} />
              {[
                { skill: "Industry Terminology", priority: "high", why_it_matters: "Recruiters filter candidates who don't speak the language of the industry.", how_to_close: "Read 2 industry news articles per week. Follow 5 thought leaders in your target field on LinkedIn." },
                { skill: "Hiring Manager Research", priority: "high", why_it_matters: "Personalised outreach that references the company's actual challenges gets 3x more replies.", how_to_close: "Before any outreach, spend 10 minutes on the company's LinkedIn page and recent news." },
                { skill: "Market Landscape Awareness", priority: "medium", why_it_matters: "Being able to discuss competitors, trends, and challenges in interviews shows you're serious.", how_to_close: "For your top 3 target companies, write a 3-sentence summary of what makes each unique. Update it monthly." },
                { skill: "Salary Benchmarks", priority: "medium", why_it_matters: "Knowing the right range prevents you from underselling or pricing yourself out.", how_to_close: "Check Glassdoor, AmbitionBox, and LinkedIn Salary for your exact role and location. Note the median." },
              ].map((item, i) => (
                <ActionCard key={`ind_${i}`} item={item} idx={i + allActions.length} progress={progress} onToggle={toggleStatus} />
              ))}
              <div style={{ marginTop: 16, background: "#ede9fe", border: "2px solid #8b5cf6", borderRadius: 12, padding: "12px 16px", fontSize: "0.78rem", fontWeight: 600, color: "#4c1d95" }}>
                Industry knowledge compounds. Come back every 2 weeks — as your understanding deepens, your readiness score improves automatically.
              </div>
            </div>
          </div>
        )}

        {/* EXPERIENCE GAP TAB */}
        {tab === "experience" && (
          <div style={{ background: "white", border: "2px solid #111", borderRadius: 20, boxShadow: "4px 4px 0 #111", overflow: "hidden" }}>
            <div style={{ height: 6, background: "#f59e0b" }} />
            <div style={{ padding: "22px 26px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Experience Gap</div>
              <div style={{ fontSize: "0.78rem", color: "#71717a", marginBottom: 20 }}>The gap between the experience you have and what recruiters expect to see in applications for {path.target_role || "your target role"}.</div>
              <AnimBar label="Experience readiness" score={expGap} color={gapColor(expGap)} />
              <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "16px 0" }} />
              {[
                { skill: "Portfolio / Projects", priority: "high", why_it_matters: "One strong, relevant project outweighs five generic certificates. It shows you can do, not just know.", how_to_close: "Pick one problem in your target field. Build something small that solves it. Document the process. Host it publicly." },
                { skill: "Quantified Achievements", priority: "high", why_it_matters: "Hiring managers scan resumes for numbers. 'Improved X by Y%' gets read. 'Worked on X' gets skipped.", how_to_close: "For every responsibility on your resume, ask: how much? How many? What changed? Add the number." },
                { skill: "Practical Exposure", priority: "medium", why_it_matters: "Even 4 weeks of relevant experience signals commitment. It is better than none at all.", how_to_close: "Find a student club, NGO, or startup that needs help in your target function. Volunteer for 1 month. Document it." },
                { skill: "Demonstrated Initiative", priority: "medium", why_it_matters: "Evidence that you started something without being asked is one of the strongest hiring signals at the fresher level.", how_to_close: "Write one public post, report, or analysis in your target field this month. Share it. This becomes a portfolio signal." },
              ].map((item, i) => (
                <ActionCard key={`exp_${i}`} item={item} idx={i + allActions.length + 4} progress={progress} onToggle={toggleStatus} />
              ))}
              <div style={{ marginTop: 16, background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 12, padding: "12px 16px", fontSize: "0.78rem", fontWeight: 600, color: "#92400e" }}>
                Experience gaps close with action, not waiting. Every week you do something relevant, update the coach. Your readiness score will reflect it.
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM CTA */}
        <div style={{ background: "white", border: "2px solid #111", borderRadius: 20, boxShadow: "5px 5px 0 #111", padding: "28px 32px", textAlign: "center", marginTop: 32 }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 8 }}>Ready to start applying?</div>
          <p style={{ color: "#71717a", fontSize: "0.875rem", marginBottom: 24 }}>
            Once your readiness is above 60%, cold outreach becomes 5x more effective. Your current score is <strong style={{ color: readiness >= 60 ? "#10b981" : "#f59e0b" }}>{readiness}/100</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to={`/cc/dashboard?id=${studentId}`} style={{ background: "linear-gradient(90deg,#8b5cf6,#ec4899)", border: "3px solid #111", borderRadius: 999, boxShadow: "4px 4px 0 #111", padding: "13px 26px", color: "white", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
              View Dashboard →
            </Link>
            <Link to="/cc/chat" style={{ background: "white", border: "2px solid #111", borderRadius: 999, boxShadow: "3px 3px 0 #111", padding: "13px 26px", color: "#111", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
              Continue with coach
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
