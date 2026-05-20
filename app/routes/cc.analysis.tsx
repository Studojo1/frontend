import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

export function meta() {
  return [{ title: "Career Analysis | CareerDojo" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_student_id";

const CSS = `
:root{
  --bg:#FAFAF9;--bg2:#F5F5F4;--white:#FFFFFF;
  --text:#111111;--muted:#71717A;--faint:#A1A1AA;
  --border:#111111;--border-light:rgba(0,0,0,0.1);
  --purple:#8B5CF6;--purple-light:#E9D5FF;
  --pink:#EC4899;--green:#10B981;--green-light:#D1FAE5;
  --amber:#F59E0B;--amber-light:#FEF3C7;
  --red:#EF4444;--teal:#14B8A6;
  --grad:linear-gradient(90deg,#8B5CF6 0%,#A855F7 50%,#EC4899 100%);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:"Inter",sans-serif;background:var(--bg);color:var(--text);}
#ca-navbar{
  position:sticky;top:0;height:64px;
  background:var(--white);border-bottom:2px solid #111;
  box-shadow:0 2px 0 #111;z-index:100;
  display:flex;align-items:center;justify-content:space-between;padding:0 32px;
}
.ca-nav-logo{font-size:1.35rem;font-weight:800;letter-spacing:-0.04em;display:flex;align-items:center;gap:4px;text-decoration:none;color:var(--text);}
.ca-nav-logo .dot{width:8px;height:8px;border-radius:50%;background:var(--grad);display:inline-block;}
.ca-nav-btns{display:flex;gap:10px;align-items:center;}
.btn-outline-nav{background:white;border:2px solid #111;border-radius:999px;box-shadow:3px 3px 0 #111;padding:7px 16px;font-weight:600;font-size:0.8rem;cursor:pointer;font-family:"Inter",sans-serif;text-decoration:none;color:var(--text);transition:all 0.15s;}
.btn-outline-nav:hover{transform:translateY(-1px);}
#ca-step-nav{
  position:sticky;top:64px;z-index:98;height:44px;
  background:var(--white);border-bottom:1px solid rgba(0,0,0,0.08);
  display:flex;align-items:center;justify-content:center;gap:0;
}
.step-item{display:flex;align-items:center;gap:7px;cursor:pointer;padding:5px 12px;border-radius:999px;transition:all 0.15s;user-select:none;text-decoration:none;}
.step-item:hover:not(.active){background:var(--bg2);}
.step-num{width:20px;height:20px;border-radius:50%;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#bbb;flex-shrink:0;}
.step-item.active .step-num{background:var(--grad);border-color:transparent;color:white;}
.step-item.done .step-num{background:var(--green);border-color:transparent;color:white;}
.step-label{font-size:0.78rem;font-weight:500;color:var(--faint);}
.step-item.active .step-label{font-weight:700;color:var(--purple);}
.step-item.done .step-label{color:var(--green);font-weight:600;}
.step-connector{width:28px;height:2px;background:#e8e8e8;flex-shrink:0;margin:0 2px;}
.step-connector.done{background:var(--green);}
#ca-page{max-width:860px;margin:0 auto;padding:40px 28px 80px;}
.section-label{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--faint);margin-bottom:8px;}

/* DNA CARD */
.dna-card{background:white;border:2px solid #111;border-radius:24px;box-shadow:5px 5px 0 #111;overflow:hidden;margin-bottom:24px;}
.dna-strip{height:6px;background:var(--grad);}
.dna-body{padding:28px 32px;}
.dna-top{display:flex;gap:24px;align-items:flex-start;margin-bottom:20px;}
.clarity-ring-wrap{flex-shrink:0;text-align:center;}
.ring-svg{transform:rotate(-90deg);}
.ring-bg{fill:none;stroke:var(--bg2);}
.ring-fill{fill:none;stroke-linecap:round;stroke-dasharray:283;transition:stroke-dashoffset 1s ease;}
.clarity-num{font-size:1.5rem;font-weight:800;margin-top:6px;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.clarity-label{font-size:0.62rem;color:var(--faint);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;}
.dna-info{flex:1;}
.dna-role{font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:4px;}
.dna-industry{font-size:0.95rem;font-weight:600;color:var(--purple);margin-bottom:10px;}
.dna-narrative{font-size:0.875rem;line-height:1.65;color:var(--muted);margin-bottom:14px;padding:10px 14px;background:var(--bg2);border-radius:10px;border-left:3px solid var(--purple);}
.meta-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}
.meta-pill{font-size:0.72rem;font-weight:600;padding:4px 12px;border:2px solid #111;border-radius:999px;box-shadow:2px 2px 0 #111;background:var(--bg2);}
.skills-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.skill-col label{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--faint);display:block;margin-bottom:8px;}
.pills-wrap{display:flex;flex-wrap:wrap;gap:6px;}
.pill{font-size:0.78rem;font-weight:600;padding:5px 12px;border:2px solid #111;border-radius:999px;box-shadow:2px 2px 0 #111;}
.pill-green{background:var(--green);color:white;}
.pill-amber{background:var(--amber);color:white;}
.readiness-row{display:flex;align-items:center;gap:16px;margin-bottom:16px;}
.readiness-bar-wrap{flex:1;}
.readiness-bar-label{display:flex;justify-content:space-between;font-size:0.78rem;font-weight:600;margin-bottom:6px;}
.readiness-bar-sub{font-size:0.68rem;color:var(--faint);margin-top:4px;}
.bar-track{height:10px;background:var(--bg2);border-radius:999px;border:1px solid #111;overflow:hidden;}
.bar-fill{height:100%;background:var(--grad);border-radius:999px;width:0%;transition:width 1s ease;}
.reply-badge{flex-shrink:0;background:var(--purple-light);border:2px solid #111;border-radius:12px;padding:10px 16px;text-align:center;box-shadow:3px 3px 0 #111;}
.reply-badge .rnum{font-size:1.4rem;font-weight:800;color:var(--purple);}
.reply-badge .rlbl{font-size:0.62rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;}
.dna-share-row{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap;}
.share-score-inline{flex:1;min-width:120px;background:var(--bg2);border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:8px;}
.ssi-num{font-size:1.25rem;font-weight:800;letter-spacing:-0.03em;}
.ssi-label{font-size:0.72rem;color:var(--muted);font-weight:600;}
.ssi-gap{font-size:0.72rem;color:var(--amber);font-weight:700;}
.not-accurate-btn{font-size:0.72rem;color:var(--faint);background:none;border:1px solid rgba(0,0,0,0.15);border-radius:999px;padding:4px 12px;cursor:pointer;font-family:"Inter",sans-serif;transition:all 0.15s;}
.not-accurate-btn:hover{color:var(--text);border-color:var(--border);background:var(--bg2);}
.clarity-tips{background:var(--amber-light);border:1px solid var(--amber);border-radius:12px;padding:12px 16px;margin-bottom:20px;}
.clarity-tips-title{font-size:0.72rem;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;}
.clarity-tips li{font-size:0.8rem;color:#78350F;line-height:1.6;padding-left:16px;}

/* SCORE CARD */
.score-card{background:white;border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:22px 26px;margin-bottom:20px;}

/* GAP BARS */
.gap-bar-section{background:white;border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:22px 26px;margin-bottom:20px;}

/* THIS WEEK CARD */
.this-week-card{background:white;border:3px solid #111;border-radius:20px;box-shadow:5px 5px 0 #111;overflow:hidden;margin-bottom:20px;}
.tw-strip{height:5px;background:var(--grad);}
.tw-body{padding:24px 28px;}
.tw-eyebrow{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--purple);margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.tw-eyebrow::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--purple);}
.tw-action{font-size:1.2rem;font-weight:800;letter-spacing:-0.02em;line-height:1.35;margin-bottom:12px;}
.tw-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.tw-meta-box{background:var(--bg2);border-radius:10px;padding:10px 14px;}
.tw-meta-label{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--faint);margin-bottom:4px;}
.tw-meta-val{font-size:0.82rem;font-weight:600;line-height:1.45;}
.tw-impact{background:linear-gradient(90deg,#F3F0FF,#FDF2FF);border:1px solid rgba(139,92,246,0.25);border-radius:10px;padding:10px 14px;font-size:0.83rem;}
.tw-impact strong{color:var(--purple);}
.tw-alt{border-top:1px solid rgba(0,0,0,0.08);padding-top:12px;margin-top:12px;}
.tw-alt-label{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--faint);margin-bottom:6px;}

/* BOTTOM CTA */
.ca-cta-section{background:white;border:2px solid #111;border-radius:24px;box-shadow:5px 5px 0 #111;padding:32px;text-align:center;margin-bottom:40px;}
.ca-cta-section h3{font-size:1.2rem;font-weight:800;margin-bottom:8px;}
.ca-cta-section p{color:var(--muted);font-size:0.875rem;margin-bottom:24px;}
.btn-primary{display:inline-block;background:var(--grad);border:3px solid #111;border-radius:999px;box-shadow:4px 4px 0 #111;padding:14px 28px;color:white;font-weight:700;font-size:0.95rem;cursor:pointer;transition:all 0.2s;font-family:"Inter",sans-serif;text-decoration:none;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:6px 6px 0 #111;}
.btn-secondary{display:inline-block;background:white;border:2px solid #111;border-radius:999px;box-shadow:3px 3px 0 #111;padding:13px 26px;color:var(--text);font-weight:700;font-size:0.875rem;cursor:pointer;transition:all 0.2s;font-family:"Inter",sans-serif;text-decoration:none;}
.btn-secondary:hover{transform:translateY(-2px);}
.cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}

@media(max-width:768px){
  #ca-page{padding:20px 16px 60px;}
  #ca-navbar{padding:0 16px;}
  #ca-step-nav{overflow-x:auto;justify-content:flex-start;padding:0 12px;}
  .dna-top{flex-direction:column;gap:16px;}
  .skills-grid{grid-template-columns:1fr;}
  .readiness-row{flex-direction:column;align-items:stretch;}
  .tw-meta-grid{grid-template-columns:1fr;}
}
`;

function AnimBar({ label, score }: { label: string; score: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 150); return () => clearTimeout(t); }, [score]);
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: 5 }}>
        <span>{label}</span><span style={{ color }}>{score}%</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${w}%`, background: color, transition: "width 0.9s ease" }} />
      </div>
    </div>
  );
}


function buildNarrative(path: any, student: any): string {
  const degree = student?.degree || "";
  const stream = student?.stream || "";
  const institution = student?.institution || "";
  const role = path?.target_role || "";
  const industry = path?.target_industry || "";
  const readiness = path?.readiness_score || 0;
  const skills = path?.skills_you_have || [];
  const gaps = path?.skills_to_build || [];
  const topGap = gaps.length ? (typeof gaps[0] === "object" ? (gaps[0].skill || gaps[0].name || "") : gaps[0]) : "";

  let who = "";
  if (degree && stream) who = `${degree} ${stream} student`;
  else if (degree) who = `${degree} student`;
  else if (stream) who = `${stream} student`;
  if (institution) who = who ? `${who} from ${institution}` : `Student from ${institution}`;
  if (!who) who = "You";

  let situation = "";
  if (role && industry) situation = `targeting ${role} roles in ${industry}`;
  else if (role) situation = `targeting ${role} roles`;
  else if (industry) situation = `targeting the ${industry} industry`;

  let insight = "";
  if (readiness < 50 && topGap) {
    insight = `The single biggest thing standing between you and your first reply is ${topGap}. That is fixable in two to three weeks.`;
  } else if (readiness >= 70) {
    insight = `You are in the top range of readiness for someone at your stage. A few targeted moves and you will be sending outreach this week.`;
  } else if (topGap) {
    insight = `You have a real foundation to work with. Closing the gap on ${topGap} is the move that unlocks the next stage.`;
  } else if (skills.length > 0) {
    insight = `You already have the foundation. The gap between you and your first interview is smaller than it feels right now.`;
  } else {
    insight = `This is more fixable than it looks. Most students in your position get to outreach-ready within four to six weeks with the right focus.`;
  }

  const fullWho = who.charAt(0).toUpperCase() + who.slice(1);
  return `${fullWho}${situation ? `, ${situation}` : ""}. ${insight}`;
}

export default function CcAnalysis() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const studentId = params.get("id") || (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : "") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ringOffset, setRingOffset] = useState(283);

  useEffect(() => {
    if (!studentId) { setError("No student ID found."); setLoading(false); return; }
    fetch(`${CC_API}/dashboard/${studentId}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
        setTimeout(() => {
          const clarity = d?.primary_path?.clarity_score || 0;
          setRingOffset(283 - (clarity / 100) * 283);
        }, 200);
      })
      .catch(() => { setError("Could not load analysis."); setLoading(false); });
  }, [studentId]);

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e9d5ff", borderTopColor: "#8b5cf6", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: "#71717a", fontSize: "0.9rem", fontFamily: "Inter,sans-serif" }}>Loading your analysis...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </>
  );

  if (error || !data?.ready) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf9", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 360, fontFamily: "Inter,sans-serif" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🧠</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12 }}>Analysis not ready yet</h2>
          <p style={{ color: "#71717a", fontSize: "0.875rem", marginBottom: 24, lineHeight: 1.6 }}>{error || "Keep chatting — your Career DNA generates once the coach has enough to work with."}</p>
          <Link to="/cc/chat" className="btn-primary">Continue chatting →</Link>
        </div>
      </div>
    </>
  );

  const path = data.primary_path || {};
  const student = data.student || {};
  const readiness = path.readiness_score || 0;
  const clarity = path.clarity_score || 0;
  const reply = path.reply_probability || 0;
  const summary = path.one_line_summary || "";
  const topAction = (path.skills_gap_items || [])[0];
  const altAction = (path.skills_gap_items || [])[1];
  const skillsHave: string[] = (path.skills_you_have || []).slice(0, 6);
  const skillsToBuild: any[] = (path.skills_to_build || (path.skills_gap_items || []).map((a: any) => ({ skill: a.skill || a.action || "" }))).slice(0, 6);
  const skillsGap = path.skills_gap_score || Math.max(0, 100 - readiness + 10);
  const industryGap = path.industry_gap_score || Math.max(0, 100 - readiness - 10);
  const expGap = path.experience_gap_score || Math.max(0, 100 - readiness);
  const clarityLabel = clarity >= 75 ? "Strong Clarity" : clarity >= 50 ? "Growing Clarity" : "Building Clarity";
  const narrative = buildNarrative(path, student);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAVBAR */}
      <nav id="ca-navbar">
        <Link to="/cc" className="ca-nav-logo">studojo<span className="dot" /></Link>
        <div className="ca-nav-btns">
          <Link to={`/cc/dashboard?id=${studentId}`} className="btn-outline-nav">Dashboard →</Link>
          <Link to="/cc/chat" className="btn-outline-nav">Back to chat</Link>
        </div>
      </nav>

      {/* STEP NAV */}
      <div id="ca-step-nav">
        {([
          ["AI Chat", "/cc/chat"],
          ["Career Analysis", `/cc/analysis?id=${studentId}`],
          ["Recommendations", `/cc/roadmap?id=${studentId}`],
          ["Dashboard", `/cc/dashboard?id=${studentId}`],
        ] as const).map(([label, href], i) => {
          const n = i + 1;
          // Analysis page is step 2 — steps 1 and 2 are "done", step 2 is active
          const cls = n === 2 ? "step-item active" : n < 2 ? "step-item done" : "step-item";
          return (
            <span key={n} style={{ display: "contents" }}>
              <a href={href} className={cls} style={{ textDecoration: "none" }}>
                <div className="step-num">{n}</div>
                <div className="step-label">{label}</div>
              </a>
              {i < 3 && <div className={`step-connector${n < 2 ? " done" : ""}`} />}
            </span>
          );
        })}
      </div>

      <div id="ca-page">

        {/* DNA CARD */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>Your Career DNA</div>
          <button className="not-accurate-btn" onClick={() => navigate(`/cc/chat?id=${studentId}`)}>Something look off?</button>
        </div>

        <div className="dna-card">
          <div className="dna-strip" />
          <div className="dna-body">
            <div className="dna-top">
              {/* Clarity ring */}
              <div className="clarity-ring-wrap">
                <svg width="100" height="100" viewBox="0 0 100 100" className="ring-svg">
                  <defs>
                    <linearGradient id="grad-dna" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-bg" cx="50" cy="50" r="45" strokeWidth="8" />
                  <circle className="ring-fill" cx="50" cy="50" r="45" strokeWidth="8"
                    stroke="url(#grad-dna)" strokeDashoffset={ringOffset} />
                </svg>
                <div className="clarity-num">{clarity}</div>
                <div className="clarity-label">{clarityLabel}</div>
              </div>

              {/* DNA info */}
              <div className="dna-info">
                <div className="dna-role">{path.target_role || "Your Target Role"}</div>
                <div className="dna-industry">{path.target_industry || ""}</div>
                <div className="meta-row">
                  {path.target_geography && <span className="meta-pill">{path.target_geography}</span>}
                  {path.job_type && <span className="meta-pill">{path.job_type}</span>}
                  {path.urgency_timeline && <span className="meta-pill">{path.urgency_timeline}</span>}
                </div>
                <div className="dna-narrative">{narrative || summary}</div>
              </div>
            </div>

            {/* Clarity tips */}
            {clarity < 65 && (
              <div className="clarity-tips">
                <div className="clarity-tips-title">How to improve your clarity score</div>
                <ul>
                  <li>Tell the coach specifically which companies you want to work at</li>
                  <li>Share your timeline — when are you looking to start?</li>
                  <li>Clarify your location and work preference (remote, hybrid, etc.)</li>
                </ul>
              </div>
            )}

            {/* Skills grid */}
            <div className="skills-grid">
              <div className="skill-col">
                <label>Skills you have</label>
                <div className="pills-wrap">
                  {skillsHave.length
                    ? skillsHave.map((s, i) => <span key={i} className="pill pill-green">{s}</span>)
                    : <span style={{ color: "#a1a1aa", fontSize: "0.8rem" }}>Keep chatting to unlock</span>}
                </div>
              </div>
              <div className="skill-col">
                <label>Skills to build</label>
                <div className="pills-wrap">
                  {skillsToBuild.map((s, i) => (
                    <span key={i} className="pill pill-amber">{typeof s === "object" ? (s.skill || s.name || "") : s}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* GAP ANALYSIS BARS */}
        <div className="gap-bar-section">
          <div style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: 16 }}>Gap Analysis</div>
          <AnimBar label="Skills" score={skillsGap} />
          <AnimBar label="Industry Knowledge" score={industryGap} />
          <AnimBar label="Experience" score={expGap} />
          <Link to={`/cc/roadmap?id=${studentId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: "0.8rem", fontWeight: 700, color: "#8b5cf6", textDecoration: "none", border: "2px solid #111", borderRadius: 999, padding: "5px 14px", boxShadow: "2px 2px 0 #111", background: "white" }}>
            See full gap breakdown and roadmap →
          </Link>
        </div>

        {/* THIS WEEK CARD */}
        {topAction && (
          <div className="this-week-card">
            <div className="tw-strip" />
            <div className="tw-body">
              <div className="tw-eyebrow">One thing. This week.</div>
              <div className="tw-action">{topAction.action || topAction.skill || topAction.how_to_close || ""}</div>
              {(topAction.why_it_matters || topAction.how_to_close || topAction.how_to_build) && (
                <div className="tw-meta-grid">
                  {topAction.why_it_matters && (
                    <div className="tw-meta-box">
                      <div className="tw-meta-label">Why this matters</div>
                      <div className="tw-meta-val">{topAction.why_it_matters}</div>
                    </div>
                  )}
                  {(topAction.how_to_close || topAction.how_to_build) && (
                    <div className="tw-meta-box">
                      <div className="tw-meta-label">Exactly how</div>
                      <div className="tw-meta-val" style={{ color: "#4c1d95" }}>{topAction.how_to_close || topAction.how_to_build}</div>
                    </div>
                  )}
                </div>
              )}
              <div className="tw-impact">
                This single action moves your reply rate from <strong>{reply}%</strong> toward <strong>{Math.min(99, reply + 5)}%</strong>. Everything else comes after this one.
              </div>
              {altAction && (
                <div className="tw-alt">
                  <div className="tw-alt-label">Can't do this right now?</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: 4 }}>{altAction.action || altAction.skill || ""}</div>
                  {altAction.why_it_matters && <div style={{ fontSize: "0.78rem", color: "#71717a", lineHeight: 1.5 }}>{altAction.why_it_matters}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Target companies */}
        {(path.target_companies || []).length > 0 && (
          <div className="score-card">
            <div style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: 14 }}>Target Companies</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(path.target_companies || []).map((c: string, i: number) => (
                <span key={i} style={{ fontSize: "0.83rem", fontWeight: 600, background: "#f3f0ff", color: "#8b5cf6", border: "2px solid #111", borderRadius: 999, padding: "5px 14px", boxShadow: "2px 2px 0 #111" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Alternative roles */}
        {(path.alternative_roles || []).length > 0 && (
          <div className="score-card">
            <div style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: 10 }}>Also Consider</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(path.alternative_roles || []).map((r: string, i: number) => (
                <span key={i} style={{ fontSize: "0.83rem", fontWeight: 600, background: "#f5f5f4", color: "#374151", border: "2px solid #111", borderRadius: 999, padding: "5px 14px", boxShadow: "2px 2px 0 #111" }}>{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="ca-cta-section">
          <h3>Ready to close the gap?</h3>
          <p>Your full roadmap with every priority action, skill plan, and industry gap is one click away.</p>
          <div className="cta-btns">
            <Link to={`/cc/roadmap?id=${studentId}`} className="btn-primary">View Full Roadmap →</Link>
            <Link to={`/cc/dashboard?id=${studentId}`} className="btn-secondary">Go to Dashboard</Link>
          </div>
        </div>

      </div>
    </>
  );
}
