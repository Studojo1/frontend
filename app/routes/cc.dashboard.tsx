import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

export function meta() {
  return [{ title: "Dashboard | CareerDojo" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_student_id";
const DOT_COLORS = ["#EF4444", "#F59E0B", "#8B5CF6", "#3B82F6", "#14B8A6", "#EC4899"];

const CSS = `
:root{
  --bg-primary:#FAFAF9;--bg-secondary:#F5F5F4;--bg-white:#FFFFFF;
  --text-primary:#111111;--text-secondary:#71717A;--text-muted:#A1A1AA;
  --border:#111111;--border-light:rgba(0,0,0,0.10);
  --purple:#8B5CF6;--purple-mid:#A855F7;--pink:#EC4899;
  --purple-light:#E9D5FF;--purple-mid2:#C084FC;
  --green:#10B981;--green-light:#D1FAE5;
  --amber:#F59E0B;--amber-light:#FEF3C7;
  --red:#EF4444;--red-light:#FEE2E2;
  --blue:#3B82F6;--blue-light:#DBEAFE;
  --teal:#14B8A6;--teal-light:#CCFBF1;
  --grad:linear-gradient(90deg,#8B5CF6 0%,#A855F7 50%,#EC4899 100%);
  --sidebar-w:256px;--navbar-h:64px;
}
.db-root*,
.db-root *::before,
.db-root *::after{box-sizing:border-box;margin:0;padding:0;}
.db-root{min-height:100vh;font-family:"Inter",sans-serif;background:var(--bg-primary);color:var(--text-primary);}
#db-sidebar{
  position:fixed;top:0;left:0;bottom:0;width:var(--sidebar-w);
  background:var(--bg-white);border-right:2px solid #111;padding:28px 20px;
  display:flex;flex-direction:column;z-index:50;overflow-y:auto;
}
.sidebar-logo{font-size:1.2rem;font-weight:800;letter-spacing:-0.04em;margin-bottom:6px;display:flex;align-items:center;gap:4px;text-decoration:none;color:var(--text-primary);}
.sidebar-logo .dot{width:7px;height:7px;border-radius:50%;background:var(--grad);display:inline-block;}
.sidebar-name{font-size:0.9rem;font-weight:700;color:var(--text-primary);margin-bottom:2px;}
.sidebar-last{font-size:0.68rem;color:var(--text-muted);margin-bottom:24px;}
.nav-item{
  display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;
  border-radius:12px;font-size:0.85rem;font-weight:600;cursor:pointer;
  border:none;background:transparent;color:var(--text-primary);text-align:left;
  transition:all 0.15s;margin-bottom:4px;text-decoration:none;
}
.nav-item:hover{background:var(--bg-secondary);}
.nav-item.active{background:var(--purple-light);border:2px solid #111;box-shadow:3px 3px 0 #111;color:var(--purple);}
.nav-icon{
  width:26px;height:26px;border-radius:8px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:0.72rem;font-weight:800;color:white;
}
.ic-overview{background:linear-gradient(135deg,#8B5CF6,#A855F7);}
.ic-paths{background:linear-gradient(135deg,#3B82F6,#6366F1);}
.ic-analysis{background:linear-gradient(135deg,#14B8A6,#10B981);}
.ic-chat{background:linear-gradient(135deg,#F59E0B,#EF4444);}
.sidebar-bottom{margin-top:auto;padding-top:20px;border-top:1px solid var(--border-light);}
.btn-new-path{
  width:100%;background:white;border:2px solid #111;border-radius:999px;
  box-shadow:3px 3px 0 #111;padding:10px 14px;font-weight:600;font-size:0.78rem;
  cursor:pointer;transition:all 0.2s;font-family:"Inter",sans-serif;
}
.btn-new-path:hover{transform:translateY(-1px);background:var(--bg-secondary);}
#db-main{margin-left:var(--sidebar-w);padding:40px;min-height:100vh;}
.main-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;}
.main-header h1{font-size:1.9rem;font-weight:800;letter-spacing:-0.04em;}
.main-header .header-sub{font-size:0.85rem;color:var(--text-secondary);margin-top:4px;}
.last-updated{font-size:0.72rem;color:var(--text-muted);}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
.stat-card{border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:24px;display:flex;justify-content:space-between;align-items:flex-start;}
.stat-card.card-purple{background:linear-gradient(135deg,#F3F0FF 0%,#EDE9FE 100%);}
.stat-card.card-green{background:linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 100%);}
.stat-card.card-amber{background:linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 100%);}
.stat-card.card-teal{background:linear-gradient(135deg,#F0FDFA 0%,#CCFBF1 100%);}
.stat-num{font-size:2.25rem;font-weight:800;letter-spacing:-0.03em;line-height:1;}
.stat-label{font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-top:6px;text-transform:uppercase;letter-spacing:0.04em;}
.stat-sub{font-size:0.68rem;color:var(--text-muted);margin-top:2px;}
.c-purple{color:var(--purple);}
.c-green{color:var(--green);}
.c-amber{color:var(--amber);}
.c-teal{color:var(--teal);}
.ring-svg2{transform:rotate(-90deg);}
.ring-bg2{fill:none;stroke:rgba(0,0,0,0.1);}
.ring-fill2{fill:none;stroke-linecap:round;transition:stroke-dashoffset 0.8s ease;}
.chart-card{background:white;border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:24px;margin-bottom:20px;}
.chart-card h3{font-size:0.95rem;font-weight:700;margin-bottom:18px;}
.ba-card{background:white;border:2px solid var(--green);border-radius:20px;box-shadow:4px 4px 0 #111;padding:24px;margin-bottom:20px;display:flex;align-items:center;gap:20px;}
.ba-score{text-align:center;}
.ba-score .num{font-size:1.9rem;font-weight:800;}
.ba-score .lbl{font-size:0.68rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;}
.ba-arrow{font-size:1.9rem;font-weight:800;color:var(--purple);}
.ba-improvement{font-size:0.875rem;font-weight:700;color:var(--green);margin-top:8px;}
.bridge-gap-card{background:linear-gradient(135deg,#F3F0FF 0%,#EDE9FE 100%);border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:22px 26px;margin-bottom:20px;}
.bridge-gap-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;}
.bridge-gap-title{font-size:0.95rem;font-weight:700;}
.bridge-gap-sub{font-size:0.78rem;color:var(--text-secondary);margin-top:3px;}
.bridge-gap-link{font-size:0.78rem;font-weight:600;color:var(--purple);text-decoration:none;white-space:nowrap;border:2px solid #111;border-radius:999px;padding:5px 12px;box-shadow:2px 2px 0 #111;background:white;transition:all 0.15s;cursor:pointer;}
.bridge-gap-link:hover{transform:translateY(-1px);}
.bridge-markers{position:relative;height:32px;margin-bottom:4px;}
.bridge-marker{position:absolute;transform:translateX(-50%);text-align:center;}
.bm-val{font-size:0.9rem;font-weight:800;line-height:1;}
.bm-lbl{font-size:0.6rem;color:var(--text-muted);font-weight:600;white-space:nowrap;}
.bm-now .bm-val{color:var(--text-primary);}
.bm-target .bm-val{color:var(--green);}
.bridge-impact-bar-track{height:14px;background:rgba(0,0,0,0.1);border-radius:999px;overflow:hidden;margin-bottom:6px;}
.bridge-impact-current{height:100%;background:var(--grad);border-radius:999px;transition:width 1s ease;}
.bridge-bar-ends{display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);margin-bottom:14px;}
.bridge-skills-row{display:flex;flex-wrap:wrap;gap:8px;}
.bridge-skill-item{display:flex;align-items:center;gap:6px;padding:5px 12px;border:2px solid #111;border-radius:999px;box-shadow:2px 2px 0 #111;font-size:0.75rem;font-weight:600;background:white;}
.bridge-skill-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.no-gap-bridge{background:var(--green-light);border:2px solid var(--green);border-radius:14px;padding:12px 16px;font-size:0.82rem;font-weight:600;color:#065F46;margin-bottom:12px;}
.checkin-card{border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;background:linear-gradient(135deg,#FDF4FF,#EDE9FE);padding:24px 28px;margin-top:20px;display:flex;align-items:flex-start;gap:18px;}
.checkin-icon{width:44px;height:44px;border-radius:12px;background:var(--purple);display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:800;color:white;flex-shrink:0;}
.checkin-body{flex:1;}
.checkin-title{font-size:0.85rem;font-weight:700;color:var(--purple);margin-bottom:6px;}
.checkin-stats{font-size:0.83rem;color:var(--text-primary);line-height:1.6;margin-bottom:10px;}
.checkin-action-box{background:white;border:2px solid #111;border-radius:12px;box-shadow:2px 2px 0 #111;padding:12px 16px;}
.checkin-action-box .lbl{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--purple);margin-bottom:4px;}
.checkin-action-box .msg{font-size:0.83rem;font-weight:600;line-height:1.5;}
.primary-path-card{background:white;border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;overflow:hidden;margin-bottom:20px;}
.path-strip{height:6px;background:var(--grad);}
.path-body{padding:24px;}
.primary-pill{display:inline-block;background:var(--purple-light);color:var(--purple);border:2px solid #111;border-radius:999px;padding:4px 12px;font-size:0.7rem;font-weight:700;box-shadow:2px 2px 0 #111;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.04em;}
.path-role{font-size:1.4rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:12px;}
.path-meta-pills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
.outline-pill{border:2px solid #111;border-radius:999px;padding:4px 12px;font-size:0.72rem;font-weight:600;background:white;box-shadow:2px 2px 0 #111;}
.target-co-item{font-size:0.85rem;font-weight:600;color:var(--purple);margin-bottom:4px;}
.target-co-item::before{content:"→  ";}
.bar-track{height:8px;background:var(--bg-secondary);border-radius:999px;border:1px solid #111;overflow:hidden;margin-top:6px;}
.bar-fill{height:100%;background:var(--grad);border-radius:999px;transition:width 0.8s ease;}
.r-label{display:flex;justify-content:space-between;font-size:0.78rem;font-weight:600;margin-bottom:4px;}
.alt-paths-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;}
.alt-path-card{background:white;border:2px solid #111;border-radius:16px;box-shadow:3px 3px 0 #111;padding:18px;}
.exploring-badge{display:inline-block;background:var(--blue-light);border:1px solid var(--blue);color:var(--blue);border-radius:999px;padding:3px 10px;font-size:0.68rem;font-weight:600;margin-bottom:8px;}
.alt-path-role{font-size:0.95rem;font-weight:700;margin-bottom:4px;}
.alt-path-industry{font-size:0.78rem;color:var(--text-secondary);margin-bottom:10px;}
.btn-promote{width:100%;background:white;border:2px solid #111;border-radius:999px;box-shadow:2px 2px 0 #111;padding:8px 14px;font-weight:600;font-size:0.72rem;cursor:pointer;transition:all 0.2s;font-family:"Inter",sans-serif;margin-top:10px;}
.btn-promote:hover{transform:translateY(-1px);background:var(--bg-secondary);}
.explore-cta{border:2px dashed var(--purple);border-radius:20px;padding:28px;background:rgba(233,213,255,0.12);text-align:center;}
.explore-cta h3{font-size:0.95rem;font-weight:700;margin-bottom:14px;color:var(--text-secondary);}
.btn-explore-path{display:inline-block;background:var(--grad);border:3px solid #111;border-radius:999px;box-shadow:4px 4px 0 #111;padding:12px 22px;color:white;font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s;font-family:"Inter",sans-serif;text-decoration:none;}
.btn-explore-path:hover{transform:translateY(-2px);box-shadow:6px 6px 0 #111;}
.sec-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.sec-header h2{font-size:1.4rem;font-weight:800;letter-spacing:-0.03em;}
.empty-state{text-align:center;padding:80px 40px;color:var(--text-secondary);}
.empty-state h2{font-size:1.2rem;font-weight:700;color:var(--text-primary);margin-bottom:8px;}
.empty-state p{font-size:0.875rem;margin-bottom:20px;}
.btn-start{display:inline-block;background:var(--grad);border:3px solid #111;border-radius:999px;box-shadow:4px 4px 0 #111;padding:13px 26px;color:white;font-weight:700;font-size:0.875rem;text-decoration:none;transition:all 0.2s;}
.btn-start:hover{transform:translateY(-2px);box-shadow:6px 6px 0 #111;}
.analysis-link-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px;}
.analysis-link-card{flex:1;min-width:180px;display:flex;align-items:center;justify-content:space-between;background:white;border:2px solid #111;border-radius:14px;box-shadow:3px 3px 0 #111;padding:16px 20px;text-decoration:none;color:var(--text-primary);transition:all 0.2s;}
.analysis-link-card:hover{transform:translateY(-2px);}
.analysis-link-card .alc-title{font-weight:700;font-size:0.9rem;}
.analysis-link-card .alc-sub{font-size:0.75rem;color:var(--text-secondary);margin-top:2px;}
.analysis-link-card .alc-arrow{font-size:1.2rem;flex-shrink:0;}
#db-tab-bar{display:none;position:fixed;bottom:0;left:0;right:0;height:58px;background:white;border-top:2px solid #111;z-index:60;align-items:center;justify-content:space-around;padding:0 8px;}
.tab-item{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:0.58rem;font-weight:600;color:var(--text-muted);cursor:pointer;padding:4px 8px;border-radius:8px;}
.tab-item.active{color:var(--purple);}
.tab-icon-box{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:800;color:white;margin-bottom:1px;}
@media(max-width:768px){
  #db-sidebar{display:none;}
  #db-main{margin-left:0;padding:20px 14px 80px;}
  #db-tab-bar{display:flex;}
  .stat-grid{grid-template-columns:1fr 1fr;}
  .alt-paths-grid{grid-template-columns:1fr;}
  .stat-num{font-size:1.65rem;}
}
`;

function useCountUp(target: number, duration = 700) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function MiniRing({ score }: { score: number }) {
  const circ = 176;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 120); return () => clearTimeout(t); }, []);
  return (
    <svg width="56" height="56" viewBox="0 0 70 70" className="ring-svg2">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle className="ring-bg2" cx="35" cy="35" r="28" strokeWidth="6" />
      <circle className="ring-fill2" cx="35" cy="35" r="28" strokeWidth="6"
        stroke="url(#g1)" strokeDasharray={circ}
        strokeDashoffset={animated ? circ - (score / 100) * circ : circ} />
    </svg>
  );
}

function ScoreChart({ history }: { history: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 640, H = 200;
    canvas.width = W; canvas.height = H;
    const scores = history.map((h: any) => h.score || h.readiness_score || 0);
    const pad = 28;
    const minV = Math.max(0, Math.min(...scores) - 10);
    const maxV = Math.min(100, Math.max(...scores) + 10);
    const xStep = (W - pad * 2) / (scores.length - 1);
    const yScale = (H - pad * 2) / (maxV - minV || 1);
    const xOf = (i: number) => pad + i * xStep;
    const yOf = (v: number) => H - pad - (v - minV) * yScale;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    for (let g = 0; g <= 4; g++) { const y = pad + g * (H - pad * 2) / 4; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke(); }
    ctx.setLineDash([]);
    const grad = ctx.createLinearGradient(0, pad, 0, H - pad);
    grad.addColorStop(0, "rgba(139,92,246,0.15)"); grad.addColorStop(1, "rgba(139,92,246,0)");
    ctx.beginPath(); ctx.moveTo(xOf(0), yOf(scores[0]));
    scores.forEach((_, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(scores[i])); });
    ctx.lineTo(xOf(scores.length - 1), H - pad); ctx.lineTo(xOf(0), H - pad); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = "#8B5CF6"; ctx.lineWidth = 3; ctx.lineJoin = "round";
    ctx.moveTo(xOf(0), yOf(scores[0]));
    scores.forEach((_, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(scores[i])); });
    ctx.stroke();
    scores.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(xOf(i), yOf(v), 5, 0, Math.PI * 2);
      ctx.fillStyle = "white"; ctx.fill(); ctx.strokeStyle = "#8B5CF6"; ctx.lineWidth = 2; ctx.stroke();
    });
  }, [history]);
  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: 200 }} />;
}

function padHistory(history: any[], score: number) {
  if (!history || history.length === 0) {
    const s = Math.max(0, Math.round(score * 0.4));
    return [
      { score: s, recorded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { score, recorded_at: new Date().toISOString() },
    ];
  }
  if (history.length === 1) {
    const s = Math.max(0, Math.round((history[0].score || history[0].readiness_score || score) * 0.5));
    return [{ score: s, recorded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }, history[0]];
  }
  return history;
}

function BridgeGapBar({ reply, skills, studentId }: { reply: number; skills: any[]; studentId: string }) {
  const [barW, setBarW] = useState(0);
  const softFallback = ["Executive Communication", "Personal Branding (LinkedIn)", "Stakeholder Management", "Structured Problem Solving"];
  const toBuild = (skills.length ? skills : softFallback.map(s => ({ skill: s }))).slice(0, 6);
  const noHardGaps = !skills.length;
  const boostPerSkill = Math.min(5, Math.max(2, Math.floor((100 - reply) / 10)));
  const potential = Math.min(reply + toBuild.length * boostPerSkill, 88);
  const nowLeft = Math.max(Math.round((reply / 100) * 100), 4);
  const targetLeft = Math.min(Math.round((potential / 100) * 100), 96);

  useEffect(() => { const t = setTimeout(() => setBarW(Math.round((reply / 100) * 100)), 300); return () => clearTimeout(t); }, [reply]);

  return (
    <div className="bridge-gap-card">
      <div className="bridge-gap-header">
        <div>
          <div className="bridge-gap-title">Bridge the Gap</div>
          <div className="bridge-gap-sub">Close {toBuild.length} gap{toBuild.length !== 1 ? "s" : ""} — reply rate goes from <strong>{reply}%</strong> to <strong>{potential}%</strong></div>
        </div>
        <Link to={`/cc/roadmap?id=${studentId}`} className="bridge-gap-link">Full roadmap →</Link>
      </div>
      <div className="bridge-markers">
        <div className="bridge-marker bm-now" style={{ left: `${nowLeft}%` }}>
          <div className="bm-val">{reply}%</div>
          <div className="bm-lbl">Now</div>
        </div>
        <div className="bridge-marker bm-target" style={{ left: `${targetLeft}%` }}>
          <div className="bm-val">{potential}%</div>
          <div className="bm-lbl">Target</div>
        </div>
      </div>
      <div className="bridge-impact-bar-track">
        <div className="bridge-impact-current" style={{ width: `${barW}%` }} />
      </div>
      <div className="bridge-bar-ends"><span>0%</span><span>100% reply rate</span></div>
      {noHardGaps && <div className="no-gap-bridge">No hard skill gaps — these soft skills are your next lever to improve reply rate.</div>}
      <div className="bridge-skills-row">
        {toBuild.map((s: any, i: number) => (
          <div key={i} className="bridge-skill-item">
            <div className="bridge-skill-dot" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
            {typeof s === "object" ? (s.skill || s.name || "") : s}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CcDashboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const studentId = params.get("id") || (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : "") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<"overview" | "paths">("overview");
  const [actionsCompleted, setActionsCompleted] = useState(0);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    try {
      const key = `studojo_gaps_${studentId}`;
      const progress = JSON.parse(localStorage.getItem(key) || "{}");
      const count = Object.values(progress).filter((v: any) => v === "completed").length;
      setActionsCompleted(count);
    } catch {}
    fetch(`${CC_API}/dashboard/${studentId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [studentId]);

  const path = data?.primary_path || {};
  const student = data?.student || {};
  const readiness = path.readiness_score || 0;
  const reply = path.reply_probability || 0;
  const sessions = student.session_count || 0;
  const sh = data?.score_history || {};
  const history = padHistory(sh.history || [], readiness);
  const companies: string[] = Array.isArray(path.target_companies) ? path.target_companies : String(path.target_companies || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const alts: any[] = data?.alternative_paths || [];
  const skillsToBuild: any[] = path.skills_to_build || [];
  const topAction = (path.skills_gap_items || [])[0];

  const readinessCount = useCountUp(readiness);
  const replyCount = useCountUp(reply);
  const sessionsCount = useCountUp(sessions);
  const actionsCount = useCountUp(actionsCompleted);

  const lastSeen = student.last_seen ? new Date(student.last_seen).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Just updated";
  const lastUpdated = student.last_seen ? new Date(student.last_seen).toLocaleString("en-IN", { day: "numeric", month: "short" }) : "Just now";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#FAFAF9" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #E9D5FF", borderTopColor: "#8B5CF6", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#71717A", fontSize: "0.9rem" }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!studentId || !data?.ready) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="db-root">
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="empty-state">
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📊</div>
            <h2>Dashboard not ready yet</h2>
            <p>Complete more of your coaching session to unlock your dashboard.</p>
            <Link to="/cc/chat" className="btn-start">Continue your session →</Link>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="db-root">
        {/* SIDEBAR */}
        <aside id="db-sidebar">
          <Link to="/cc" className="sidebar-logo">studojo<span className="dot" /></Link>
          <div className="sidebar-name">{student.name || "Your Dashboard"}</div>
          <div className="sidebar-last">Last seen {lastSeen}</div>
          <nav>
            <button className={`nav-item${section === "overview" ? " active" : ""}`} onClick={() => setSection("overview")}>
              <span className="nav-icon ic-overview">OV</span> Overview
            </button>
            <button className={`nav-item${section === "paths" ? " active" : ""}`} onClick={() => setSection("paths")}>
              <span className="nav-icon ic-paths">CP</span> Career Paths
            </button>
            <Link to={`/cc/analysis?id=${studentId}`} className="nav-item">
              <span className="nav-icon ic-analysis">CA</span> Career Analysis
            </Link>
            <Link to={`/cc/roadmap?id=${studentId}`} className="nav-item">
              <span className="nav-icon ic-chat" style={{ background: "linear-gradient(135deg,#14B8A6,#10B981)" }}>RM</span> Roadmap
            </Link>
            <Link to="/cc/chat" className="nav-item">
              <span className="nav-icon ic-chat">←</span> Back to Chat
            </Link>
          </nav>
          <div className="sidebar-bottom">
            <Link to="/cc/chat" className="btn-new-path">+ Explore new path</Link>
          </div>
        </aside>

        {/* MAIN */}
        <main id="db-main">
          <div className="main-header">
            <div>
              <h1>Bridge the Gap</h1>
              <div className="header-sub">Track your readiness and close what's holding you back.</div>
            </div>
            <div className="last-updated">Updated {lastUpdated}</div>
          </div>

          {/* OVERVIEW */}
          {section === "overview" && (
            <>
              {/* Stat cards */}
              <div className="stat-grid">
                <div className="stat-card card-purple">
                  <div>
                    <div className="stat-num c-purple">{readinessCount}</div>
                    <div className="stat-label">Outreach Readiness</div>
                  </div>
                  <MiniRing score={readiness} />
                </div>
                <div className="stat-card card-green">
                  <div>
                    <div className="stat-num c-green">{replyCount}%</div>
                    <div className="stat-label">Reply Probability</div>
                    <div className="stat-sub">cold outreach</div>
                  </div>
                </div>
                <div className="stat-card card-amber">
                  <div>
                    <div className="stat-num c-amber">{sessionsCount}</div>
                    <div className="stat-label">Sessions completed</div>
                  </div>
                </div>
                <div className="stat-card card-teal">
                  <div>
                    <div className="stat-num c-teal">{actionsCount}</div>
                    <div className="stat-label">Actions completed</div>
                  </div>
                </div>
              </div>

              {/* Score chart */}
              <div className="chart-card">
                <h3>Readiness Score Over Time</h3>
                {history.length >= 2 ? <ScoreChart history={history} /> : (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#71717A", fontSize: "0.875rem" }}>Complete more actions to see your progress here.</div>
                )}
              </div>

              {/* Before/after if improved */}
              {(sh.improvement_total || 0) > 0 && (
                <div className="ba-card">
                  <div className="ba-score"><div className="num" style={{ color: "#A1A1AA" }}>{sh.first_score || 0}</div><div className="lbl">When you started</div></div>
                  <div className="ba-arrow">→</div>
                  <div className="ba-score"><div className="num" style={{ color: "#10B981" }}>{sh.current_score || 0}</div><div className="lbl">Right now</div></div>
                  <div style={{ flex: 1 }}><div className="ba-improvement">Improved by {sh.improvement_total} points</div></div>
                </div>
              )}

              {/* Bridge the gap */}
              <BridgeGapBar reply={reply} skills={skillsToBuild} studentId={studentId} />

              {/* Weekly check-in */}
              {topAction && (
                <div className="checkin-card">
                  <div className="checkin-icon">✓</div>
                  <div className="checkin-body">
                    <div className="checkin-title">This week's focus</div>
                    <div className="checkin-stats">{actionsCompleted} of {(path.skills_gap_items || []).length} actions completed. Reply rate potential: {Math.min(99, reply + actionsCompleted * 3)}%</div>
                    <div className="checkin-action-box">
                      <div className="lbl">One thing this week</div>
                      <div className="msg">{topAction.action || topAction.skill || ""}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Links to analysis sections */}
              <div className="analysis-link-row" style={{ marginTop: 20 }}>
                <Link to={`/cc/analysis?id=${studentId}`} className="analysis-link-card" style={{ borderLeft: "4px solid #8B5CF6" }}>
                  <div><div className="alc-title">Career Analysis</div><div className="alc-sub">DNA, scores, and target companies</div></div>
                  <span className="alc-arrow" style={{ color: "#8B5CF6" }}>→</span>
                </Link>
                <Link to={`/cc/roadmap?id=${studentId}`} className="analysis-link-card" style={{ borderLeft: "4px solid #14B8A6" }}>
                  <div><div className="alc-title">Full Roadmap</div><div className="alc-sub">Skills, gaps, and priority actions</div></div>
                  <span className="alc-arrow" style={{ color: "#14B8A6" }}>→</span>
                </Link>
              </div>
            </>
          )}

          {/* CAREER PATHS */}
          {section === "paths" && (
            <>
              <div className="sec-header">
                <h2>Career Paths</h2>
                <Link to="/cc/chat" className="btn-explore-path" style={{ fontSize: "0.78rem", padding: "9px 18px" }}>+ Explore new path</Link>
              </div>

              {/* Primary path card */}
              <div className="primary-path-card">
                <div className="path-strip" />
                <div className="path-body">
                  <div className="primary-pill">Primary Focus</div>
                  <div className="path-role">{path.target_role || "Your Target Role"}</div>
                  <div className="path-meta-pills">
                    {path.target_industry && <span className="outline-pill">{path.target_industry}</span>}
                    {path.target_geography && <span className="outline-pill">{path.target_geography}</span>}
                    {path.job_type && <span className="outline-pill">{path.job_type}</span>}
                  </div>
                  {companies.slice(0, 4).map((c, i) => <div key={i} className="target-co-item">{c}</div>)}
                  <div style={{ marginTop: 14 }}>
                    <div className="r-label"><span>Readiness</span><span>{readiness}%</span></div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${readiness}%` }} /></div>
                  </div>
                </div>
              </div>

              {/* Alt paths */}
              {alts.length > 0 && (
                <div className="alt-paths-grid">
                  {alts.map((a: any, i: number) => (
                    <div key={i} className="alt-path-card">
                      <div className="exploring-badge">Exploring</div>
                      <div className="alt-path-role">{a.target_role || ""}</div>
                      <div className="alt-path-industry">{a.target_industry || ""}</div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${a.readiness_score || 0}%`, background: "linear-gradient(90deg,#14B8A6,#3B82F6)" }} /></div>
                      <button className="btn-promote" onClick={async () => {
                        await fetch(`${CC_API}/dashboard/${studentId}/promote-path`, {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ path_id: a.path_id || a.id }),
                        });
                        const r = await fetch(`${CC_API}/dashboard/${studentId}`);
                        setData(await r.json());
                      }}>Promote to primary →</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="explore-cta">
                <h3>Want to explore a different direction?</h3>
                <Link to="/cc/chat" className="btn-explore-path">+ Explore new path</Link>
              </div>
            </>
          )}
        </main>

        {/* MOBILE TAB BAR */}
        <div id="db-tab-bar">
          <div className={`tab-item${section === "overview" ? " active" : ""}`} onClick={() => setSection("overview")}>
            <div className="tab-icon-box" style={{ background: "linear-gradient(135deg,#8B5CF6,#A855F7)" }}>OV</div>
            <span>Overview</span>
          </div>
          <div className={`tab-item${section === "paths" ? " active" : ""}`} onClick={() => setSection("paths")}>
            <div className="tab-icon-box" style={{ background: "linear-gradient(135deg,#3B82F6,#6366F1)" }}>CP</div>
            <span>Paths</span>
          </div>
          <div className="tab-item" onClick={() => navigate(`/cc/roadmap?id=${studentId}`)}>
            <div className="tab-icon-box" style={{ background: "linear-gradient(135deg,#14B8A6,#10B981)" }}>RM</div>
            <span>Roadmap</span>
          </div>
          <div className="tab-item" onClick={() => navigate("/cc/chat")}>
            <div className="tab-icon-box" style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}>←</div>
            <span>Chat</span>
          </div>
        </div>
      </div>
    </>
  );
}
