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
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px;}
.stat-card{border:2px solid #111;border-radius:20px;box-shadow:4px 4px 0 #111;padding:24px;position:relative;overflow:visible;}
.stat-card.card-purple{background:linear-gradient(135deg,#F3F0FF 0%,#EDE9FE 100%);}
.stat-card.card-amber{background:linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 100%);}
.stat-card.card-teal{background:linear-gradient(135deg,#F0FDFA 0%,#CCFBF1 100%);}
.stat-num{font-size:2.25rem;font-weight:800;letter-spacing:-0.03em;line-height:1;}
.stat-label{font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-top:6px;text-transform:uppercase;letter-spacing:0.04em;}
.stat-sub{font-size:0.68rem;color:var(--text-muted);margin-top:2px;}
.c-purple{color:var(--purple);}
.c-amber{color:var(--amber);}
.c-teal{color:var(--teal);}

/* Readiness hover tooltip */
.readiness-tooltip{
  position:absolute;top:calc(100% + 10px);left:0;right:0;z-index:200;
  background:white;border:2px solid #111;border-radius:16px;box-shadow:4px 4px 0 #111;
  padding:16px;opacity:0;pointer-events:none;transition:opacity 0.2s,transform 0.2s;
  transform:translateY(6px);min-width:260px;
}
.stat-card:hover .readiness-tooltip{opacity:1;pointer-events:auto;transform:translateY(0);}
.rt-title{font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.07em;color:var(--purple);margin-bottom:8px;}
.rt-row{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;}
.rt-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}
.rt-text{font-size:0.78rem;color:#374151;line-height:1.5;}

/* readiness bar in stat card */
.readiness-mini-bar{height:6px;background:rgba(0,0,0,0.1);border-radius:999px;margin-top:12px;overflow:hidden;}
.readiness-mini-fill{height:100%;border-radius:999px;background:var(--grad);transition:width 1s ease;}

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

/* This Week Card — big hero version */
.tw-hero-card{background:white;border:3px solid #111;border-radius:24px;box-shadow:5px 5px 0 #111;overflow:hidden;margin-bottom:20px;}
.tw-hero-strip{height:6px;background:var(--grad);}
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
.tw-hero-impact{background:linear-gradient(90deg,#F3F0FF,#FDF2FF);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:12px 16px;font-size:0.875rem;color:#374151;line-height:1.55;margin-bottom:14px;}
.tw-hero-impact strong{color:var(--purple);}
.tw-hero-alt{border-top:1px solid rgba(0,0,0,0.08);padding-top:14px;}
.tw-hero-alt-label{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;}
.tw-hero-alt-action{font-size:0.9rem;font-weight:700;margin-bottom:4px;}
.tw-hero-alt-why{font-size:0.78rem;color:var(--text-secondary);line-height:1.5;}
.tw-hero-date-pill{display:inline-flex;align-items:center;gap:6px;background:white;border:2px solid #111;border-radius:999px;padding:5px 14px;font-size:0.72rem;font-weight:700;box-shadow:2px 2px 0 #111;margin-bottom:16px;color:var(--purple);}

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
.quick-links-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.quick-link-card{display:flex;align-items:center;justify-content:space-between;background:white;border:2px solid #111;border-radius:16px;box-shadow:3px 3px 0 #111;padding:18px 22px;text-decoration:none;color:var(--text-primary);transition:all 0.2s;}
.quick-link-card:hover{transform:translateY(-2px);}
.qlc-icon{width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:800;color:white;margin-right:12px;}
.qlc-title{font-weight:700;font-size:0.9rem;}
.qlc-sub{font-size:0.72rem;color:var(--text-secondary);margin-top:2px;}
.qlc-arrow{font-size:1.2rem;flex-shrink:0;color:var(--text-muted);}
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
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
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

type ScorePoint = { score?: number; readiness_score?: number; recorded_at: string; milestone?: string };

function ScoreChart({ history }: { history: ScorePoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 640, H = 200;
    canvas.width = W; canvas.height = H;
    const scores = history.map((h) => h.score || h.readiness_score || 0);
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
      const hasMilestone = !!history[i]?.milestone;
      ctx.beginPath(); ctx.arc(xOf(i), yOf(v), hasMilestone ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = hasMilestone ? "#8B5CF6" : "white"; ctx.fill();
      ctx.strokeStyle = "#8B5CF6"; ctx.lineWidth = 2; ctx.stroke();
      if (hasMilestone) {
        ctx.fillStyle = "white"; ctx.font = "bold 9px Inter,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("★", xOf(i), yOf(v));
      }
    });
  }, [history]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const W = canvas.offsetWidth || 640;
    const pad = 28;
    const xStep = (W - pad * 2) / (history.length - 1);
    const i = Math.round((mx - pad) / xStep);
    if (i < 0 || i >= history.length) { setTooltip(null); return; }
    const h = history[i];
    const score = h.score || h.readiness_score || 0;
    const date = new Date(h.recorded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const milestone = h.milestone ? ` · ${h.milestone}` : "";
    const scores = history.map(p => p.score || p.readiness_score || 0);
    const minV = Math.max(0, Math.min(...scores) - 10);
    const maxV = Math.min(100, Math.max(...scores) + 10);
    const H = 200, yScale = (H - pad * 2) / (maxV - minV || 1);
    const yOf = (v: number) => H - pad - (v - minV) * yScale;
    const scaleY = rect.height / H;
    setTooltip({ x: e.clientX - rect.left, y: yOf(score) * scaleY, text: `${score}/100 on ${date}${milestone}` });
  }

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: 200 }}
        onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)} />
      {tooltip && (
        <div style={{ position: "absolute", left: Math.min(tooltip.x, 280), top: tooltip.y - 36, background: "#111", color: "white", borderRadius: 8, padding: "5px 10px", fontSize: "0.75rem", fontWeight: 600, pointerEvents: "none", whiteSpace: "nowrap" }}>
          {tooltip.text}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: "0.68rem", color: "#a1a1aa", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
        Starred points mark milestones — completed actions that moved your score up
      </div>
    </div>
  );
}

function padHistory(history: ScorePoint[], score: number): ScorePoint[] {
  if (!history || history.length === 0) {
    const s = Math.max(0, Math.round(score * 0.4));
    return [
      { score: s, recorded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { score, recorded_at: new Date().toISOString(), milestone: "Profile complete" },
    ];
  }
  if (history.length === 1) {
    const s = Math.max(0, Math.round((history[0].score || history[0].readiness_score || score) * 0.5));
    return [{ score: s, recorded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }, history[0]];
  }
  return history;
}

function BridgeGapBar({ skills, studentId }: { skills: any[]; studentId: string }) {
  const [barW, setBarW] = useState(0);
  const softFallback = ["Executive Communication", "Personal Branding (LinkedIn)", "Stakeholder Management", "Structured Problem Solving"];
  const toBuild = (skills.length ? skills : softFallback.map(s => ({ skill: s }))).slice(0, 6);
  const noHardGaps = !skills.length;
  const now = toBuild.filter((_, i) => {
    try { const p = JSON.parse(localStorage.getItem(`studojo_gaps_${studentId}`) || "{}"); return p[`action_${i}`] === "completed"; } catch { return false; }
  }).length;
  const potential = Math.min(95, 35 + now * 8 + toBuild.length * 3);

  useEffect(() => { const t = setTimeout(() => setBarW(Math.round((now / Math.max(toBuild.length, 1)) * 100)), 300); return () => clearTimeout(t); }, [now, toBuild.length]);

  return (
    <div className="bridge-gap-card">
      <div className="bridge-gap-header">
        <div>
          <div className="bridge-gap-title">Skill Gaps to Close</div>
          <div className="bridge-gap-sub">{toBuild.length - now} gap{(toBuild.length - now) !== 1 ? "s" : ""} remaining — close them to improve your readiness score</div>
        </div>
        <Link to={`/cc/roadmap?id=${studentId}`} className="bridge-gap-link">Full roadmap →</Link>
      </div>
      <div className="bridge-markers">
        <div className="bridge-marker bm-now" style={{ left: `${Math.max(4, Math.round((now / Math.max(toBuild.length, 1)) * 100))}%` }}>
          <div className="bm-val">{now}</div>
          <div className="bm-lbl">Closed</div>
        </div>
        <div className="bridge-marker bm-target" style={{ left: "96%" }}>
          <div className="bm-val">{toBuild.length}</div>
          <div className="bm-lbl">Total</div>
        </div>
      </div>
      <div className="bridge-impact-bar-track">
        <div className="bridge-impact-current" style={{ width: `${barW}%` }} />
      </div>
      <div className="bridge-bar-ends"><span>0 closed</span><span>All gaps closed</span></div>
      {noHardGaps && <div className="no-gap-bridge">No hard skill gaps detected — these soft skills are your next lever.</div>}
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
  const sessions = student.session_count || 0;
  const sh = data?.score_history || {};
  const history = padHistory(sh.history || [], readiness);
  const companies: string[] = Array.isArray(path.target_companies) ? path.target_companies : String(path.target_companies || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const alts: any[] = data?.alternative_paths || [];
  const skillsToBuild: any[] = path.skills_to_build || [];
  const topAction = (path.skills_gap_items || [])[0];
  const altAction = (path.skills_gap_items || [])[1];

  const readinessCount = useCountUp(readiness);
  const sessionsCount = useCountUp(sessions);
  const actionsCount = useCountUp(actionsCompleted);

  const readinessDesc = readiness >= 70 ? "Well-positioned to start applying" : readiness >= 40 ? "Building — a few gaps to close" : "Early stage — build your profile";
  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

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
              <h1>Dashboard</h1>
              <div className="header-sub">Your career readiness, gaps, and this week's focus.</div>
            </div>
            <div className="last-updated">Updated {lastUpdated}</div>
          </div>

          {/* OVERVIEW */}
          {section === "overview" && (
            <>
              {/* Stat cards — 3 cols, no reply rate ring */}
              <div className="stat-grid">
                {/* Readiness card with hover tooltip */}
                <div className="stat-card card-purple" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="stat-num c-purple readiness-pulse">{readinessCount}</div>
                      <div className="stat-label">Career Readiness</div>
                      <div className="stat-sub">{readinessDesc}</div>
                    </div>
                    <div style={{ fontSize: "1.2rem" }}>ⓘ</div>
                  </div>
                  <ReadinessMiniBar score={readiness} />
                  {/* Hover tooltip */}
                  <div className="readiness-tooltip">
                    <div className="rt-title">What is Career Readiness?</div>
                    <div className="rt-row">
                      <div className="rt-dot" style={{ background: "#10b981" }} />
                      <div className="rt-text"><strong>70–100:</strong> Strong profile. You can start applying and sending cold outreach now.</div>
                    </div>
                    <div className="rt-row">
                      <div className="rt-dot" style={{ background: "#f59e0b" }} />
                      <div className="rt-text"><strong>40–69:</strong> Solid foundation. A few focused skill gaps to close before outreach is effective.</div>
                    </div>
                    <div className="rt-row">
                      <div className="rt-dot" style={{ background: "#ef4444" }} />
                      <div className="rt-text"><strong>0–39:</strong> Early stage. Build your profile, close the skills gap, then start applying.</div>
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#f3f0ff", borderRadius: 8, fontSize: "0.75rem", color: "#4c1d95", fontWeight: 600 }}>
                      Every skill gap you close moves this score up. Come back daily.
                    </div>
                  </div>
                </div>

                <div className="stat-card card-amber">
                  <div className="stat-num c-amber">{sessionsCount}</div>
                  <div className="stat-label">Sessions completed</div>
                  <div className="stat-sub">with your career coach</div>
                </div>
                <div className="stat-card card-teal">
                  <div className="stat-num c-teal">{actionsCount}</div>
                  <div className="stat-label">Actions completed</div>
                  <div className="stat-sub">skills closed so far</div>
                </div>
              </div>

              {/* Quick links to analysis + roadmap */}
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

              {/* Bridge the gap — skill gap progress */}
              <BridgeGapBar skills={skillsToBuild} studentId={studentId} />

              {/* This week card — hero version */}
              {topAction && (
                <div className="tw-hero-card">
                  <div className="tw-hero-strip" />
                  <div className="tw-hero-body">
                    <div className="tw-hero-eyebrow">One thing. This week.</div>
                    <div className="tw-hero-date-pill">
                      <span>📅</span>{todayStr}
                    </div>
                    <div className="tw-hero-action">{topAction.action || topAction.skill || topAction.how_to_close || ""}</div>
                    {(topAction.why_it_matters || topAction.how_to_close || topAction.how_to_build) && (
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
                    {altAction && (
                      <div className="tw-hero-alt">
                        <div className="tw-hero-alt-label">Can't do this right now?</div>
                        <div className="tw-hero-alt-action">{altAction.action || altAction.skill || ""}</div>
                        {altAction.why_it_matters && <div className="tw-hero-alt-why">{altAction.why_it_matters}</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                    <div className="r-label"><span>Career Readiness</span><span>{readiness}%</span></div>
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
