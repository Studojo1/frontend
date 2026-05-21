import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

export function meta() {
  return [{ title: "Dashboard | CareerDojo" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_student_id";
const DOT_COLORS = ["#EF4444", "#F59E0B", "#8B5CF6", "#3B82F6", "#14B8A6", "#EC4899"];

// localStorage helpers
function gapKey(sid: string) { return `studojo_gaps_${sid}`; }
function weekKey(sid: string) { return `studojo_week_${sid}`; }
function streakKey(sid: string) { return `studojo_streak_${sid}`; }

function todayDateStr() { return new Date().toISOString().slice(0, 10); }
function thisWeekKey() {
  const d = new Date();
  const day = d.getDay() || 7;
  const mon = new Date(d); mon.setDate(d.getDate() - day + 1);
  return mon.toISOString().slice(0, 10);
}
function lastWeekKey() {
  const d = new Date(); d.setDate(d.getDate() - 7);
  const day = d.getDay() || 7;
  const mon = new Date(d); mon.setDate(d.getDate() - day + 1);
  return mon.toISOString().slice(0, 10);
}

function loadStreak(sid: string): { count: number; lastDate: string } {
  try { return JSON.parse(localStorage.getItem(streakKey(sid)) || "{}"); } catch { return { count: 0, lastDate: "" }; }
}
function updateStreak(sid: string): number {
  const today = todayDateStr();
  const s = loadStreak(sid);
  if (s.lastDate === today) return s.count;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const ystr = yesterday.toISOString().slice(0, 10);
  const newCount = s.lastDate === ystr ? s.count + 1 : 1;
  localStorage.setItem(streakKey(sid), JSON.stringify({ count: newCount, lastDate: today }));
  return newCount;
}

function loadWeekData(sid: string, wk: string): { status?: string; note?: string; response?: string } {
  try {
    const all = JSON.parse(localStorage.getItem(weekKey(sid)) || "{}");
    return all[wk] || {};
  } catch { return {}; }
}
function saveWeekData(sid: string, wk: string, data: object) {
  try {
    const all = JSON.parse(localStorage.getItem(weekKey(sid)) || "{}");
    all[wk] = { ...all[wk], ...data };
    localStorage.setItem(weekKey(sid), JSON.stringify(all));
  } catch {}
}

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
  --sidebar-w:256px;
}
.db-root*,.db-root *::before,.db-root *::after{box-sizing:border-box;margin:0;padding:0;}
.db-root{min-height:100vh;font-family:"Inter",sans-serif;background:var(--bg-primary);color:var(--text-primary);}
#db-sidebar{position:fixed;top:0;left:0;bottom:0;width:var(--sidebar-w);background:var(--bg-white);border-right:2px solid #111;padding:28px 20px;display:flex;flex-direction:column;z-index:50;overflow-y:auto;}
.sidebar-logo{font-size:1.2rem;font-weight:800;letter-spacing:-0.04em;margin-bottom:6px;display:flex;align-items:center;gap:4px;text-decoration:none;color:var(--text-primary);}
.sidebar-logo .dot{width:7px;height:7px;border-radius:50%;background:var(--grad);display:inline-block;}
.sidebar-name{font-size:0.9rem;font-weight:700;color:var(--text-primary);margin-bottom:2px;}
.sidebar-last{font-size:0.68rem;color:var(--text-muted);margin-bottom:24px;}
.nav-item{display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;border-radius:12px;font-size:0.85rem;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--text-primary);text-align:left;transition:all 0.15s;margin-bottom:4px;text-decoration:none;}
.nav-item:hover{background:var(--bg-secondary);}
.nav-item.active{background:var(--purple-light);border:2px solid #111;box-shadow:3px 3px 0 #111;color:var(--purple);}
.nav-icon{width:26px;height:26px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;color:white;}
.ic-overview{background:linear-gradient(135deg,#8B5CF6,#A855F7);}
.ic-chat{background:linear-gradient(135deg,#F59E0B,#EF4444);}
#db-main{margin-left:var(--sidebar-w);padding:40px;min-height:100vh;}
.main-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;}
.main-header h1{font-size:1.9rem;font-weight:800;letter-spacing:-0.04em;}
.main-header .header-sub{font-size:0.85rem;color:var(--text-secondary);margin-top:4px;}
.last-updated{font-size:0.72rem;color:var(--text-muted);}

/* STAT GRID */
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px;}
.stat-card{border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:24px;position:relative;overflow:visible;}
.stat-card.card-purple{background:linear-gradient(135deg,#F3F0FF 0%,#EDE9FE 100%);}
.stat-card.card-amber{background:linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 100%);}
.stat-card.card-teal{background:linear-gradient(135deg,#F0FDFA 0%,#CCFBF1 100%);cursor:pointer;}
.stat-num{font-size:2.25rem;font-weight:800;letter-spacing:-0.03em;line-height:1;}
.stat-label{font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-top:6px;text-transform:uppercase;letter-spacing:0.04em;}
.stat-sub{font-size:0.68rem;color:var(--text-muted);margin-top:2px;}
.c-purple{color:var(--purple);}
.c-amber{color:var(--amber);}
.c-teal{color:var(--teal);}
.c-green{color:var(--green);}

/* Readiness hover tooltip */
.stat-tooltip{position:absolute;top:calc(100% + 10px);left:0;z-index:200;background:white;border:2px solid #111;border-radius:16px;box-shadow:4px 4px 0 #111;padding:16px;opacity:0;pointer-events:none;transition:opacity 0.2s,transform 0.2s;transform:translateY(6px);width:260px;}
.stat-card:hover .stat-tooltip{opacity:1;pointer-events:auto;transform:translateY(0);}
.rt-title{font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.07em;color:var(--purple);margin-bottom:8px;}
.rt-row{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;}
.rt-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}
.rt-text{font-size:0.78rem;color:#374151;line-height:1.5;}
.readiness-mini-bar{height:6px;background:rgba(0,0,0,0.1);border-radius:999px;margin-top:12px;overflow:hidden;}
.readiness-mini-fill{height:100%;border-radius:999px;background:var(--grad);transition:width 1s ease;}
.streak-flame{font-size:1.6rem;line-height:1;}
.streak-best{font-size:0.65rem;color:var(--text-muted);margin-top:2px;}

/* CHART */
.chart-card{background:white;border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:24px;margin-bottom:20px;}
.chart-card h3{font-size:0.95rem;font-weight:700;margin-bottom:4px;}
.chart-sub{font-size:0.72rem;color:var(--text-muted);margin-bottom:16px;}
.chart-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;}
.chart-legend-item{display:flex;align-items:center;gap:5px;font-size:0.68rem;font-weight:600;color:#374141;}
.chart-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}

/* BEFORE/AFTER */
.ba-card{background:white;border:2px solid var(--green);border-radius:20px;box-shadow:4px 4px 0 #111;padding:24px;margin-bottom:20px;display:flex;align-items:center;gap:20px;}
.ba-score{text-align:center;}
.ba-score .num{font-size:1.9rem;font-weight:800;}
.ba-score .lbl{font-size:0.68rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;}
.ba-arrow{font-size:1.9rem;font-weight:800;color:var(--purple);}
.ba-improvement{font-size:0.875rem;font-weight:700;color:var(--green);margin-top:8px;}

/* TODAY'S GAPS */
.bridge-gap-card{background:linear-gradient(135deg,#F3F0FF 0%,#EDE9FE 100%);border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:22px 26px;margin-bottom:20px;}
.bridge-gap-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;}
.bridge-gap-title{font-size:0.95rem;font-weight:700;}
.bridge-gap-sub{font-size:0.78rem;color:var(--text-secondary);margin-top:3px;}
.bridge-gap-link{font-size:0.78rem;font-weight:600;color:var(--purple);text-decoration:none;white-space:nowrap;border:2px solid #111;border-radius:999px;padding:5px 12px;box-shadow:2px 2px 0 #111;background:white;transition:all 0.15s;}
.bridge-gap-link:hover{transform:translateY(-1px);}
.bridge-skills-row{display:flex;flex-wrap:wrap;gap:8px;}
.bridge-skill-item{display:flex;align-items:center;gap:6px;padding:5px 12px;border:2px solid #111;border-radius:999px;box-shadow:2px 2px 0 #111;font-size:0.75rem;font-weight:600;background:white;}
.bridge-skill-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.no-gap-bridge{background:var(--green-light);border:2px solid var(--green);border-radius:14px;padding:12px 16px;font-size:0.82rem;font-weight:600;color:#065F46;margin-bottom:12px;}

/* THIS WEEK CARD */
.tw-hero-card{background:white;border:3px solid #111;border-radius:24px;box-shadow:5px 5px 0 #111;overflow:visible;margin-bottom:20px;}
.tw-hero-strip{height:6px;background:var(--grad);border-radius:24px 24px 0 0;}
.tw-hero-body{padding:28px 32px;}
.tw-hero-eyebrow{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--purple);margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.tw-hero-eyebrow::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--purple);}
.tw-hero-action{font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;line-height:1.3;margin-bottom:16px;color:#111;}
.tw-hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;}
.tw-hero-box{border-radius:14px;padding:14px 18px;}
.tw-hero-box-why{background:#F5F5F4;}
.tw-hero-box-how{background:#F3F0FF;}
.tw-hero-box-label{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;}
.tw-hero-box-how .tw-hero-box-label{color:var(--purple);}
.tw-hero-box-val{font-size:0.875rem;font-weight:600;line-height:1.55;color:#374151;}
.tw-hero-box-how .tw-hero-box-val{color:#4C1D95;}
.tw-hero-impact{background:linear-gradient(90deg,#F3F0FF,#FDF2FF);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:12px 16px;font-size:0.875rem;color:#374151;line-height:1.55;margin-bottom:16px;}
.tw-hero-impact strong{color:var(--purple);}
.tw-hero-alt{border-top:1px solid rgba(0,0,0,0.08);padding-top:14px;margin-top:2px;}
.tw-hero-alt-label{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;}
.tw-hero-alt-action{font-size:0.9rem;font-weight:700;margin-bottom:4px;}
.tw-hero-alt-why{font-size:0.78rem;color:var(--text-secondary);line-height:1.5;}
.tw-hero-date-pill{display:inline-flex;align-items:center;gap:6px;background:white;border:2px solid #111;border-radius:999px;padding:5px 14px;font-size:0.72rem;font-weight:700;box-shadow:2px 2px 0 #111;margin-bottom:16px;color:var(--purple);}

/* WEEK CHECK-IN PANEL */
.week-checkin{position:relative;border-top:1px solid rgba(0,0,0,0.08);padding-top:16px;margin-top:4px;}
.wc-label{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:10px;}
.wc-options{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
.wc-btn{padding:8px 14px;border:2px solid #111;border-radius:999px;background:white;font-size:0.78rem;font-weight:600;font-family:"Inter",sans-serif;cursor:pointer;box-shadow:2px 2px 0 #111;transition:all 0.15s;display:flex;align-items:center;gap:6px;}
.wc-btn:hover{transform:translateY(-1px);}
.wc-btn.selected-done{background:#d1fae5;border-color:#10b981;color:#065f46;}
.wc-btn.selected-partial{background:#fef3c7;border-color:#f59e0b;color:#92400e;}
.wc-btn.selected-custom{background:#ede9fe;border-color:#8b5cf6;color:#4c1d95;}
.wc-custom-input{width:100%;border:2px solid #111;border-radius:12px;padding:10px 14px;font-size:0.83rem;font-family:"Inter",sans-serif;background:white;box-shadow:2px 2px 0 #111;resize:none;outline:none;margin-bottom:8px;}
.wc-submit{background:linear-gradient(90deg,#8b5cf6,#ec4899);border:2px solid #111;border-radius:999px;box-shadow:3px 3px 0 #111;padding:9px 20px;color:white;font-weight:700;font-size:0.78rem;cursor:pointer;font-family:"Inter",sans-serif;transition:all 0.15s;}
.wc-submit:hover{transform:translateY(-1px);}
.wc-suggestion{background:linear-gradient(90deg,#f3f0ff,#fdf2ff);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:12px 16px;font-size:0.83rem;color:#374151;line-height:1.55;margin-top:10px;}
.wc-suggestion strong{color:var(--purple);}
.wc-locked{display:flex;align-items:center;gap:8px;background:#f5f5f4;border:1px solid rgba(0,0,0,0.1);border-radius:12px;padding:10px 14px;font-size:0.78rem;color:var(--text-muted);font-weight:600;}

/* LAST WEEK REVIEW */
.lw-card{background:linear-gradient(135deg,#FFF7ED,#FEF3C7);border:2px solid #f59e0b;border-radius:20px;box-shadow:4px 4px 0 #111;padding:22px 26px;margin-bottom:20px;}
.lw-eyebrow{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#92400e;margin-bottom:8px;}
.lw-task{font-size:1rem;font-weight:700;color:#111;margin-bottom:14px;line-height:1.4;}

/* QUICK LINKS */
.quick-links-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.quick-link-card{display:flex;align-items:center;justify-content:space-between;background:white;border:2px solid #111;border-radius:16px;box-shadow:3px 3px 0 #111;padding:18px 22px;text-decoration:none;color:var(--text-primary);transition:all 0.2s;}
.quick-link-card:hover{transform:translateY(-2px);}
.qlc-icon{width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:800;color:white;margin-right:12px;}
.qlc-title{font-weight:700;font-size:0.9rem;}
.qlc-sub{font-size:0.72rem;color:var(--text-secondary);margin-top:2px;}
.qlc-arrow{font-size:1.2rem;flex-shrink:0;color:var(--text-muted);}

/* CAREER PATHS */
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
.sec-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.sec-header h2{font-size:1.4rem;font-weight:800;letter-spacing:-0.03em;}
.empty-state{text-align:center;padding:80px 40px;color:var(--text-secondary);}
.empty-state h2{font-size:1.2rem;font-weight:700;color:var(--text-primary);margin-bottom:8px;}
.empty-state p{font-size:0.875rem;margin-bottom:20px;}
.btn-start{display:inline-block;background:var(--grad);border:3px solid #111;border-radius:999px;box-shadow:4px 4px 0 #111;padding:13px 26px;color:white;font-weight:700;font-size:0.875rem;text-decoration:none;transition:all 0.2s;}
.btn-start:hover{transform:translateY(-2px);box-shadow:6px 6px 0 #111;}

/* MOBILE */
#db-tab-bar{display:none;position:fixed;bottom:0;left:0;right:0;height:58px;background:white;border-top:2px solid #111;z-index:60;align-items:center;justify-content:space-around;padding:0 8px;}
.tab-item{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:0.58rem;font-weight:600;color:var(--text-muted);cursor:pointer;padding:4px 8px;border-radius:8px;}
.tab-item.active{color:var(--purple);}
.tab-icon-box{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:800;color:white;margin-bottom:1px;}
@media(max-width:768px){
  #db-sidebar{display:none;}
  #db-main{margin-left:0;padding:20px 14px 80px;}
  #db-tab-bar{display:flex;}
  .stat-grid{grid-template-columns:1fr 1fr;}

  .stat-num{font-size:1.65rem;}
  .tw-hero-grid{grid-template-columns:1fr;}
  .quick-links-row{grid-template-columns:1fr;}
}
@keyframes pulse-ring{0%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.7}100%{transform:scale(1);opacity:1}}
.readiness-pulse{animation:pulse-ring 2.5s ease-in-out infinite;}
`;

function useCountUp(target: number, duration = 700) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return val;
}

function ReadinessMiniBar({ score }: { score: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 400); return () => clearTimeout(t); }, [score]);
  return (
    <div className="readiness-mini-bar">
      <div className="readiness-mini-fill" style={{ width: `${w}%` }} />
    </div>
  );
}

type ScorePoint = { score?: number; readiness_score?: number; recorded_at: string; milestone?: string; event_type?: string };
const EVENT_COLORS: Record<string, string> = {
  "skill_closed": "#8B5CF6",
  "industry_gap": "#3B82F6",
  "experience_gap": "#F59E0B",
  "profile_complete": "#10B981",
  "session": "#14B8A6",
  "default": "#8B5CF6",
};

function ScoreChart({ history }: { history: ScorePoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; color: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 640, H = 200;
    canvas.width = W; canvas.height = H;
    const scores = history.map(h => h.score || h.readiness_score || 0);
    const pad = 32;
    const minV = Math.max(0, Math.min(...scores) - 10);
    const maxV = Math.min(100, Math.max(...scores) + 10);
    const xStep = (W - pad * 2) / Math.max(scores.length - 1, 1);
    const yScale = (H - pad * 2) / (maxV - minV || 1);
    const xOf = (i: number) => pad + i * xStep;
    const yOf = (v: number) => H - pad - (v - minV) * yScale;

    ctx.clearRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    for (let g = 0; g <= 4; g++) { const y = pad + g * (H - pad * 2) / 4; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke(); }
    ctx.setLineDash([]);
    // Fill
    const grad = ctx.createLinearGradient(0, pad, 0, H - pad);
    grad.addColorStop(0, "rgba(139,92,246,0.12)"); grad.addColorStop(1, "rgba(139,92,246,0)");
    ctx.beginPath(); ctx.moveTo(xOf(0), yOf(scores[0]));
    scores.forEach((_, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(scores[i])); });
    ctx.lineTo(xOf(scores.length - 1), H - pad); ctx.lineTo(xOf(0), H - pad); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    // Line
    ctx.beginPath(); ctx.strokeStyle = "#8B5CF6"; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.moveTo(xOf(0), yOf(scores[0]));
    scores.forEach((_, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(scores[i])); });
    ctx.stroke();
    // Dots — colour by event type
    scores.forEach((v, i) => {
      const evType = history[i]?.event_type || (history[i]?.milestone ? "skill_closed" : "default");
      const dotColor = EVENT_COLORS[evType] || EVENT_COLORS.default;
      const r = history[i]?.milestone ? 8 : 5;
      ctx.beginPath(); ctx.arc(xOf(i), yOf(v), r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor; ctx.fill();
      ctx.strokeStyle = "#111"; ctx.lineWidth = 1.5; ctx.stroke();
      if (history[i]?.milestone) {
        ctx.fillStyle = "white"; ctx.font = "bold 8px Inter,sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("+", xOf(i), yOf(v));
      }
    });
  }, [history]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const W = canvas.offsetWidth || 640, pad = 32;
    const xStep = (W - pad * 2) / Math.max(history.length - 1, 1);
    const i = Math.round((mx - pad) / xStep);
    if (i < 0 || i >= history.length) { setTooltip(null); return; }
    const h = history[i];
    const score = h.score || h.readiness_score || 0;
    const milestone = h.milestone || "";
    const prev = i > 0 ? (history[i - 1].score || history[i - 1].readiness_score || 0) : score;
    const delta = score - prev;
    const deltaStr = delta > 0 ? ` (+${delta})` : delta < 0 ? ` (${delta})` : "";
    const cause = milestone ? ` — ${milestone}` : "";
    const scores = history.map(p => p.score || p.readiness_score || 0);
    const minV = Math.max(0, Math.min(...scores) - 10);
    const maxV = Math.min(100, Math.max(...scores) + 10);
    const H = 200, yScale = (H - 64) / (maxV - minV || 1);
    const yOf = (v: number) => H - 32 - (v - minV) * yScale;
    const scaleY = rect.height / H;
    const evType = h.event_type || (h.milestone ? "skill_closed" : "default");
    setTooltip({ x: e.clientX - rect.left, y: yOf(score) * scaleY, text: `${score}/100${deltaStr}${cause}`, color: EVENT_COLORS[evType] || EVENT_COLORS.default });
  }

  const eventTypes = [...new Set(history.map(h => h.event_type || (h.milestone ? "skill_closed" : null)).filter(Boolean))] as string[];
  const legendMap: Record<string, string> = {
    skill_closed: "Skill gap closed",
    industry_gap: "Industry knowledge",
    experience_gap: "Experience added",
    profile_complete: "Profile completed",
    session: "Coaching session",
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: 200, cursor: "crosshair" }}
        onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)} />
      {tooltip && (
        <div style={{ position: "absolute", left: Math.min(tooltip.x + 8, 260), top: tooltip.y - 36, background: "#111", color: "white", borderRadius: 8, padding: "6px 11px", fontSize: "0.75rem", fontWeight: 600, pointerEvents: "none", whiteSpace: "nowrap", border: `2px solid ${tooltip.color}` }}>
          {tooltip.text}
        </div>
      )}
      {eventTypes.length > 0 && (
        <div className="chart-legend">
          {eventTypes.map(et => (
            <div key={et} className="chart-legend-item">
              <div className="chart-legend-dot" style={{ background: EVENT_COLORS[et] || EVENT_COLORS.default }} />
              {legendMap[et] || et}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: "0.68rem", color: "#a1a1aa" }}>
        Hover dots to see what caused each score change
      </div>
    </div>
  );
}

function padHistory(history: ScorePoint[], score: number): ScorePoint[] {
  if (!history || history.length === 0) {
    return [
      { score: Math.max(0, Math.round(score * 0.4)), recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(), event_type: "session" },
      { score, recorded_at: new Date().toISOString(), milestone: "Profile complete", event_type: "profile_complete" },
    ];
  }
  if (history.length === 1) {
    return [
      { score: Math.max(0, Math.round((history[0].score || history[0].readiness_score || score) * 0.5)), recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(), event_type: "session" },
      history[0],
    ];
  }
  return history;
}

// Suggestion text based on check-in status
function weekSuggestion(status: string, note: string, taskLabel: string, nextTaskLabel: string): string {
  if (status === "done") {
    return `Great work completing "${taskLabel}". Your readiness has moved up. This week's focus: ${nextTaskLabel}. Keep the momentum — one gap at a time.`;
  }
  if (status === "partial") {
    return `Partially done is still progress. Carry forward what's left of "${taskLabel}" alongside this week's focus: ${nextTaskLabel}. Partial reps still build the muscle.`;
  }
  if (status === "custom" && note) {
    return `You said: "${note}". That context helps. This week refocus on ${nextTaskLabel}. If something blocked you last week, flag it to the coach so we can adjust your plan.`;
  }
  return `Pick up from where you left off. This week: ${nextTaskLabel}.`;
}

function ThisWeekCard({ topAction, altAction, readiness, studentId }: {
  topAction: any; altAction: any; readiness: number; studentId: string;
}) {
  const wk = thisWeekKey();
  const lwk = lastWeekKey();
  const [weekData, setWeekData] = useState(() => loadWeekData(studentId, wk));
  const [lwData] = useState(() => loadWeekData(studentId, lwk));
  // Only show last-week review if: student used the app last week (lwData has a stored response key),
  // they haven't already reviewed it (no lwData.status), and this week hasn't been submitted yet.
  const [showLastWeek, setShowLastWeek] = useState(() => {
    try {
      const all = JSON.parse(localStorage.getItem(weekKey(studentId)) || "{}");
      const hadLastWeek = lwk in all;           // they interacted last week
      const lw = all[lwk] || {};
      const thisW = all[wk] || {};
      return hadLastWeek && !lw.status && !thisW.status;
    } catch { return false; }
  });
  const [customNote, setCustomNote] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const taskLabel = topAction?.action || topAction?.skill || "";
  const nextTaskLabel = altAction?.action || altAction?.skill || taskLabel;
  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  // Check if locked: status was set today and it's not a new week
  const isLocked = !!weekData.status;
  const unlocksAt = (() => {
    const now = new Date();
    const next = new Date(now); next.setDate(next.getDate() + (7 - (now.getDay() || 7) + 1));
    next.setHours(0, 0, 0, 0);
    return next.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  })();

  function handleSelect(status: string) {
    if (isLocked) return;
    const data = { status, note: status === "custom" ? customNote : "" };
    saveWeekData(studentId, wk, data);
    setWeekData(data);
    setSuggestion(weekSuggestion(status, customNote, taskLabel, nextTaskLabel));
  }

  function handleLwSelect(status: string) {
    const data = { status, note: status === "custom" ? customNote : "" };
    saveWeekData(studentId, lwk, data);
    setShowLastWeek(false);
    setSuggestion(weekSuggestion(status, customNote, taskLabel, nextTaskLabel));
  }

  return (
    <div className="tw-hero-card">
      <div className="tw-hero-strip" />
      <div className="tw-hero-body">
        <div className="tw-hero-eyebrow">One thing. This week.</div>
        <div className="tw-hero-date-pill"><span>📅</span>{todayStr}</div>
        <div className="tw-hero-action">{taskLabel}</div>
        {(topAction?.why_it_matters || topAction?.how_to_close || topAction?.how_to_build) && (
          <div className="tw-hero-grid">
            {topAction.why_it_matters && (
              <div className="tw-hero-box tw-hero-box-why">
                <div className="tw-hero-box-label">Why this matters</div>
                <div className="tw-hero-box-val">{topAction.why_it_matters}</div>
              </div>
            )}
            {(topAction.how_to_close || topAction.how_to_build) && (
              <div className="tw-hero-box tw-hero-box-how">
                <div className="tw-hero-box-label">Exactly how</div>
                <div className="tw-hero-box-val">{topAction.how_to_close || topAction.how_to_build}</div>
              </div>
            )}
          </div>
        )}
        <div className="tw-hero-impact">
          Completing this moves your Career Readiness toward <strong>{Math.min(100, readiness + 7)}/100</strong>. Come back tomorrow for the next one.
        </div>

        {/* Last week review — shown once at the start of a new week */}
        {showLastWeek && lwData.status === undefined && (
          <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <div className="lw-eyebrow">How did last week go?</div>
            <div className="lw-task">{taskLabel}</div>
            <div className="wc-options">
              {[
                { key: "done", icon: "✅", label: "Completed" },
                { key: "partial", icon: "⚡", label: "Partially done" },
                { key: "custom", icon: "✏️", label: "Something else" },
              ].map(o => (
                <button key={o.key} className="wc-btn" onClick={() => { if (o.key !== "custom") handleLwSelect(o.key); else setShowLastWeek(true); }}>
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
            {lwData.status === "custom_pending" && (
              <>
                <textarea className="wc-custom-input" rows={2} placeholder="Tell us what happened..." value={customNote} onChange={e => setCustomNote(e.target.value)} />
                <button className="wc-submit" onClick={() => handleLwSelect("custom")}>Submit →</button>
              </>
            )}
          </div>
        )}

        {/* This week check-in */}
        <div className="week-checkin">
          <div className="wc-label">How is this going? Update your progress</div>
          {isLocked ? (
            <div className="wc-locked">
              <span>🔒</span>
              <span>Locked until {unlocksAt} — come back next week to update</span>
            </div>
          ) : (
            <>
              <div className="wc-options">
                {[
                  { key: "done", icon: "✅", label: "Completed", cls: "selected-done" },
                  { key: "partial", icon: "⚡", label: "Completed partially", cls: "selected-partial" },
                  { key: "custom", icon: "✏️", label: "Custom update", cls: "selected-custom" },
                ].map(o => (
                  <button key={o.key}
                    className={`wc-btn${weekData.status === o.key ? ` ${o.cls}` : ""}`}
                    onClick={() => { if (o.key === "custom") { setCustomNote(""); } else { handleSelect(o.key); } }}>
                    {o.icon} {o.label}
                  </button>
                ))}
              </div>
              {(!weekData.status || weekData.status === "custom") && (
                <div style={{ display: weekData.status === "custom" || customNote !== "" ? "block" : "none" }}>
                  <textarea className="wc-custom-input" rows={2}
                    placeholder="What did you actually do? Even partial progress counts..."
                    value={customNote} onChange={e => setCustomNote(e.target.value)} />
                  <button className="wc-submit" onClick={() => handleSelect("custom")}>Get suggestion →</button>
                </div>
              )}
            </>
          )}
          {(suggestion || (weekData.status && weekData.response)) && (
            <div className="wc-suggestion">
              {suggestion || weekData.response}
            </div>
          )}
        </div>

        {altAction && !isLocked && (
          <div className="tw-hero-alt">
            <div className="tw-hero-alt-label">Can't do this right now?</div>
            <div className="tw-hero-alt-action">{altAction.action || altAction.skill || ""}</div>
            {altAction.why_it_matters && <div className="tw-hero-alt-why">{altAction.why_it_matters}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function TodayGapsCard({ skills, studentId }: { skills: any[]; studentId: string }) {
  const softFallback = ["Executive Communication", "Personal Branding (LinkedIn)", "Stakeholder Management", "Structured Problem Solving"];
  const allSkills = (skills.length ? skills : softFallback.map(s => ({ skill: s })));

  // Pick today's 3 gaps using day-of-year so it rotates daily
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const offset = dayOfYear % Math.max(1, allSkills.length);
  const todayGaps = [
    allSkills[offset % allSkills.length],
    allSkills[(offset + 1) % allSkills.length],
    allSkills[(offset + 2) % allSkills.length],
  ].filter(Boolean).slice(0, 3);

  const noHardGaps = !skills.length;

  return (
    <div className="bridge-gap-card">
      <div className="bridge-gap-header">
        <div>
          <div className="bridge-gap-title">Today's Skill Gaps</div>
          <div className="bridge-gap-sub">Focus on these 3 today — come back tomorrow for the next set</div>
        </div>
        <Link to={`/cc/roadmap?id=${studentId}`} className="bridge-gap-link">Full roadmap →</Link>
      </div>
      {noHardGaps && <div className="no-gap-bridge">No hard skill gaps detected — these soft skills are your next lever.</div>}
      <div className="bridge-skills-row">
        {todayGaps.map((s: any, i: number) => (
          <div key={i} className="bridge-skill-item">
            <div className="bridge-skill-dot" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
            {typeof s === "object" ? (s.skill || s.name || "") : s}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: "0.72rem", color: "#71717a", fontWeight: 500 }}>
        ↻ Refreshes daily — there will always be something new to work on
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
  const [section, setSection] = useState<"overview">("overview");
  const [streak, setStreak] = useState(0);
  const [outreachScore, setOutreachScore] = useState(0);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    // Update streak on every dashboard visit
    const s = updateStreak(studentId);
    setStreak(s);
    fetch(`${CC_API}/dashboard/${studentId}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
        // Outreach score: reply probability + bonus for closed gaps
        const reply = d?.primary_path?.reply_probability || 0;
        try {
          const prog = JSON.parse(localStorage.getItem(gapKey(studentId)) || "{}");
          const closed = Object.values(prog).filter((v: any) => v === "completed").length;
          setOutreachScore(Math.min(99, reply + closed * 3));
        } catch { setOutreachScore(reply); }
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  const path = data?.primary_path || {};
  const student = data?.student || {};
  const readiness = path.readiness_score || 0;
  const sh = data?.score_history || {};
  const history = padHistory(sh.history || [], readiness);
  const companies: string[] = Array.isArray(path.target_companies) ? path.target_companies : String(path.target_companies || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const skillsToBuild: any[] = path.skills_to_build || [];
  const topAction = (path.skills_gap_items || [])[0];
  const altAction = (path.skills_gap_items || [])[1];
  const readinessDesc = readiness >= 70 ? "Well-positioned to apply" : readiness >= 40 ? "A few gaps to close" : "Early stage — build profile";

  const readinessCount = useCountUp(readiness);
  const streakCount = useCountUp(streak);
  const outreachCount = useCountUp(outreachScore);

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
            <Link to="/cc/chat?force=1" className="btn-start">Continue your session →</Link>
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
            <Link to="/cc/chat?force=1" className="nav-item">
              <span className="nav-icon ic-chat">←</span> Back to Chat
            </Link>
          </nav>
          <div className="sidebar-bottom" />
        </aside>

        {/* MAIN */}
        <main id="db-main">
          <div className="main-header">
            <div>
              <h1>Dashboard</h1>
              <div className="header-sub">Your career readiness, gaps, and this week's focus.</div>
            </div>
            <div className="last-updated">Updated {lastUpdated}</div>
          </div>

          {section === "overview" && (
            <>
              {/* STAT CARDS */}
              <div className="stat-grid">
                {/* Card 1: Career Readiness with hover tooltip */}
                <div className="stat-card card-purple" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="stat-num c-purple readiness-pulse">{readinessCount}</div>
                      <div className="stat-label">Career Readiness</div>
                      <div className="stat-sub">{readinessDesc}</div>
                    </div>
                    <span style={{ fontSize: "1.1rem", opacity: 0.5 }}>ⓘ</span>
                  </div>
                  <ReadinessMiniBar score={readiness} />
                  <div className="stat-tooltip">
                    <div className="rt-title">What is Career Readiness?</div>
                    <div className="rt-row"><div className="rt-dot" style={{ background: "#10b981" }} /><div className="rt-text"><strong>70–100:</strong> Strong — start applying and sending outreach now.</div></div>
                    <div className="rt-row"><div className="rt-dot" style={{ background: "#f59e0b" }} /><div className="rt-text"><strong>40–69:</strong> Building — close a few skill gaps first.</div></div>
                    <div className="rt-row"><div className="rt-dot" style={{ background: "#ef4444" }} /><div className="rt-text"><strong>0–39:</strong> Early stage — focus on closing today's skill gaps.</div></div>
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#f3f0ff", borderRadius: 8, fontSize: "0.75rem", color: "#4c1d95", fontWeight: 600 }}>
                      Every skill gap you close moves this score up. Come back daily.
                    </div>
                  </div>
                </div>

                {/* Card 2: Streak */}
                <div className="stat-card card-amber">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="streak-flame">{streak >= 3 ? "🔥" : streak >= 1 ? "⚡" : "💤"}</div>
                      <div className="stat-num c-amber" style={{ marginTop: 4 }}>{streakCount}<span style={{ fontSize: "1rem", fontWeight: 600 }}>d</span></div>
                      <div className="stat-label">Daily Streak</div>
                      <div className="stat-sub">{streak >= 7 ? "Unstoppable! 🏆" : streak >= 3 ? "Keep it going!" : "Visit daily to build it"}</div>
                    </div>
                  </div>
                  <div className="streak-best">Streak increases when you close a skill gap or chat with the coach</div>
                </div>

                {/* Card 3: Outreach Score — click goes to outreach tool */}
                <div className="stat-card card-teal" onClick={() => window.open("https://studojo.com/outreach", "_blank")} title="Go to Outreach Dojo">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="stat-num c-teal">{outreachCount}<span style={{ fontSize: "1rem", fontWeight: 600 }}>%</span></div>
                      <div className="stat-label">Outreach Score</div>
                      <div className="stat-sub">recruiter reply rate</div>
                    </div>
                    <span style={{ fontSize: "1.1rem", opacity: 0.5 }}>↗</span>
                  </div>
                  <div className="stat-tooltip" style={{ cursor: "default" }} onClick={e => e.stopPropagation()}>
                    <div className="rt-title">Your Outreach Score</div>
                    <div className="rt-text" style={{ marginBottom: 8 }}>This is the estimated reply rate when you send a cold email to a recruiter. Closing skill gaps moves it up.</div>
                    <div style={{ padding: "8px 12px", background: "#f0fdfa", borderRadius: 8, fontSize: "0.75rem", color: "#065f46", fontWeight: 600 }}>
                      Come back daily and close gaps to increase this score. Click to start sending outreach.
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="quick-links-row">
                <Link to={`/cc/analysis?id=${studentId}`} className="quick-link-card" style={{ borderLeft: "4px solid #8B5CF6" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="qlc-icon" style={{ background: "linear-gradient(135deg,#8B5CF6,#A855F7)" }}>CA</div>
                    <div><div className="qlc-title">Career Analysis</div><div className="qlc-sub">Your DNA, clarity score, and target companies</div></div>
                  </div>
                  <span className="qlc-arrow">→</span>
                </Link>
                <Link to={`/cc/roadmap?id=${studentId}`} className="quick-link-card" style={{ borderLeft: "4px solid #14B8A6" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="qlc-icon" style={{ background: "linear-gradient(135deg,#14B8A6,#10B981)" }}>RM</div>
                    <div><div className="qlc-title">Full Roadmap</div><div className="qlc-sub">All gaps, actions, and upskilling plan</div></div>
                  </div>
                  <span className="qlc-arrow">→</span>
                </Link>
              </div>

              {/* Score chart */}
              <div className="chart-card">
                <h3>Readiness Score Over Time</h3>
                <div className="chart-sub">Each dot shows what caused the change — hover to see</div>
                {history.length >= 2
                  ? <ScoreChart history={history} />
                  : <div style={{ textAlign: "center", padding: "40px 0", color: "#71717A", fontSize: "0.875rem" }}>Close skill gaps to see your progress chart build here.</div>}
              </div>

              {/* Before/after */}
              {(sh.improvement_total || 0) > 0 && (
                <div className="ba-card">
                  <div className="ba-score"><div className="num" style={{ color: "#A1A1AA" }}>{sh.first_score || 0}</div><div className="lbl">When you started</div></div>
                  <div className="ba-arrow">→</div>
                  <div className="ba-score"><div className="num" style={{ color: "#10B981" }}>{sh.current_score || 0}</div><div className="lbl">Right now</div></div>
                  <div style={{ flex: 1 }}><div className="ba-improvement">Improved by {sh.improvement_total} points</div></div>
                </div>
              )}

              {/* Today's skill gaps — rotating daily, no progress bar */}
              <TodayGapsCard skills={skillsToBuild} studentId={studentId} />

              {/* This week hero card with check-in */}
              {topAction && (
                <ThisWeekCard topAction={topAction} altAction={altAction} readiness={readiness} studentId={studentId} />
              )}
            </>
          )}

        </main>

        {/* MOBILE TAB BAR */}
        <div id="db-tab-bar">
          <div className={`tab-item${section === "overview" ? " active" : ""}`} onClick={() => setSection("overview")}>
            <div className="tab-icon-box" style={{ background: "linear-gradient(135deg,#8B5CF6,#A855F7)" }}>OV</div>
            <span>Overview</span>
          </div>

          <div className="tab-item" onClick={() => navigate(`/cc/roadmap?id=${studentId}`)}>
            <div className="tab-icon-box" style={{ background: "linear-gradient(135deg,#14B8A6,#10B981)" }}>RM</div>
            <span>Roadmap</span>
          </div>
          <div className="tab-item" onClick={() => navigate("/cc/chat?force=1")}>
            <div className="tab-icon-box" style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}>←</div>
            <span>Chat</span>
          </div>
        </div>
      </div>
    </>
  );
}
