import { useEffect, useRef, useState, useCallback } from "react";

export function meta() {
  return [{ title: "CareerDojo Chat | Studojo" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_student_id";

const HOOK_STATS = [
  { main: "B.Tech students applying on LinkedIn get a 1.4% callback rate.", emphasis: "Students who cold outreach hiring managers directly get 12 to 18%.", hook: "Let's figure out which companies you should be reaching." },
  { main: "Most applications are filtered by software before any human reads them.", emphasis: "A keyword-optimised resume gets through. A generic one gets rejected in seconds.", hook: "Let's see exactly where you stand right now." },
  { main: "The average student who books an interview has a readiness score of 74.", emphasis: "Most students start at 40 to 50.", hook: "Let's find your number and close the gap." },
  { main: "Sending 30 targeted cold emails gets replies in 1 to 2 weeks on average.", emphasis: "The same 30 applications on Naukri gets close to zero.", hook: "Let's build your outreach strategy, specific to your profile." },
];
const SOCIAL_PROOF = [
  "A B.Tech CSE student from Hyderabad improved their readiness from 38 to 71 in 3 weeks.",
  "A BCom student from Mumbai got a reply from a hiring manager at Deloitte using cold outreach.",
  "12 students in the Finance stream got internship replies this week.",
  "A BMS student targeting product roles went from 0 applications to 3 interview calls in 10 days.",
  "A student from a Tier-2 college landed a Data Analyst role by skipping job boards entirely.",
];

const CSS = `
.cc-root *,.cc-root *::before,.cc-root *::after{box-sizing:border-box;margin:0;padding:0;}
.cc-root{--bg-primary:#FAFAF9;--bg-secondary:#F5F5F4;--bg-white:#FFFFFF;--text-primary:#111111;--text-secondary:#71717A;--text-muted:#A1A1AA;--border-light:rgba(0,0,0,0.12);--accent-purple:#8B5CF6;--accent-light:#E9D5FF;--success:#10B981;--warning:#F59E0B;--gradient-primary:linear-gradient(90deg,#8B5CF6 0%,#A855F7 50%,#EC4899 100%);--sidebar-w:560px;height:100dvh;font-family:"Inter",sans-serif;background:var(--bg-primary);color:var(--text-primary);overflow:hidden;display:flex;flex-direction:column;}
#cc-float-logo{position:fixed;top:18px;left:22px;z-index:120;font-size:1.3rem;font-weight:800;letter-spacing:-0.04em;display:flex;align-items:center;gap:4px;text-decoration:none;color:var(--text-primary);background:var(--bg-white);border:2px solid #111;border-radius:999px;padding:7px 16px;box-shadow:3px 3px 0 #111;}
.cc-dot{width:8px;height:8px;border-radius:50%;background:var(--gradient-primary);display:inline-block;}
/* panel toggle sits just left of the sidebar and slides with it */
#cc-float-toggle{position:fixed;top:18px;z-index:120;display:flex;align-items:center;gap:7px;cursor:pointer;border:2px solid #111;border-radius:999px;padding:8px 16px;background:white;box-shadow:3px 3px 0 #111;font-size:0.8rem;font-weight:700;transition:right 0.28s ease,transform 0.15s,box-shadow 0.15s;font-family:"Inter",sans-serif;}
#cc-float-toggle.open{right:calc(var(--sidebar-w) + 22px);}
#cc-float-toggle.closed{right:22px;}
#cc-float-toggle:hover{transform:translateY(-1px);box-shadow:4px 4px 0 #111;}
#cc-layout{flex:1;display:flex;min-height:0;}
#cc-chat-col{flex:1;display:flex;flex-direction:column;min-width:0;padding:72px 16px 16px;}
#cc-chat-inner{flex:1;display:flex;flex-direction:column;max-width:680px;margin:0 auto;width:100%;min-height:0;}
.chat-card{flex:1;display:flex;flex-direction:column;border:2px solid #111;border-radius:20px;overflow:hidden;box-shadow:4px 4px 0 #111;background:white;min-height:0;}
.chat-setup-header{padding:14px 26px;flex-shrink:0;background:linear-gradient(135deg,#F3F0FF 0%,#FDF2FF 100%);border-bottom:1px solid rgba(139,92,246,0.15);}
.chat-setup-header.hidden{display:none;}
.chat-setup-header-title{font-size:1rem;font-weight:800;}
.chat-setup-header-sub{font-size:0.78rem;color:var(--text-muted);margin-top:2px;}
#cc-messages{flex:1;overflow-y:auto;padding:22px 26px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth;min-height:0;}
#cc-messages::-webkit-scrollbar{width:4px;}
#cc-messages::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:2px;}
.msg-row{display:flex;gap:12px;align-items:flex-end;}
.msg-row.agent{justify-content:flex-start;}
.msg-row.user{justify-content:flex-end;}
.agent-avatar{width:32px;height:32px;border-radius:50%;flex-shrink:0;background:var(--gradient-primary);border:2px solid #111;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;color:white;}
.msg-bubble-wrap{display:flex;flex-direction:column;max-width:76%;}
.msg-bubble{padding:13px 17px;font-size:0.92rem;line-height:1.55;border:2px solid #111;white-space:pre-wrap;}
.msg-row.agent .msg-bubble{background:#F3F0FF;border-radius:4px 18px 18px 18px;box-shadow:3px 3px 0 rgba(0,0,0,0.12);}
.msg-row.user .msg-bubble{background:var(--gradient-primary);border-radius:18px 4px 18px 18px;box-shadow:3px 3px 0 rgba(0,0,0,0.6);color:white;}
.msg-row.user .msg-bubble-wrap{align-items:flex-end;}
.msg-bubble a{color:var(--accent-purple);font-weight:600;}
.msg-row.user .msg-bubble a{color:#fff;text-decoration:underline;}
.msg-time{font-size:10px;color:var(--text-muted);margin-top:4px;}
.report-link-btn{align-self:flex-start;margin-top:5px;background:none;border:none;font-family:"Inter",sans-serif;font-size:0.7rem;font-weight:600;color:var(--text-muted);cursor:pointer;text-decoration:underline;padding:0;}
.report-link-btn:hover{color:var(--accent-purple);}
.typing-dots{display:flex;gap:5px;padding:4px 0;}
.typing-dots span{width:7px;height:7px;border-radius:50%;background:var(--accent-purple);animation:dotPulse 600ms ease-in-out infinite alternate;opacity:0.3;}
.typing-dots span:nth-child(2){animation-delay:200ms;}
.typing-dots span:nth-child(3){animation-delay:400ms;}
@keyframes dotPulse{to{opacity:1;transform:translateY(-2px);}}
.panel-cta{border:2px solid #111;border-radius:14px;padding:14px 18px;background:#F3F0FF;cursor:pointer;transition:all 0.2s ease;margin:2px 0 2px 44px;display:flex;align-items:center;justify-content:space-between;box-shadow:3px 3px 0 #111;max-width:76%;}
.panel-cta:hover{transform:translateY(-2px);box-shadow:5px 5px 0 #111;}
.panel-cta .cta-text{font-size:0.92rem;font-weight:700;}
.panel-cta .cta-sub{font-size:0.76rem;color:var(--text-secondary);margin-top:2px;}
.panel-cta .cta-arrow{font-size:1.25rem;color:var(--accent-purple);}
#cc-input-area{flex-shrink:0;background:var(--bg-white);border-top:2px solid rgba(0,0,0,0.1);padding:14px 22px;display:flex;gap:10px;align-items:flex-end;}
#cc-attach-btn{width:46px;height:46px;border-radius:50%;flex-shrink:0;background:white;border:2px solid #111;box-shadow:2px 2px 0 #111;cursor:pointer;font-size:1.05rem;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
#cc-attach-btn:hover{transform:translateY(-2px);box-shadow:3px 3px 0 #111;}
#cc-chat-input{flex:1;border:2px solid var(--accent-purple);border-radius:18px;padding:13px 17px;font-family:"Inter",sans-serif;font-size:0.93rem;background:white;color:var(--text-primary);resize:none;min-height:50px;max-height:130px;outline:none;transition:all 0.2s;line-height:1.5;}
#cc-chat-input:focus{box-shadow:0 0 0 4px rgba(139,92,246,0.12);}
#cc-send-btn{width:46px;height:46px;border-radius:50%;flex-shrink:0;background:var(--gradient-primary);border:2px solid #111;box-shadow:2px 2px 0 #111;color:white;font-size:1.05rem;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;}
#cc-send-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:3px 3px 0 #111;}
#cc-send-btn:disabled{opacity:0.5;cursor:not-allowed;}
#cc-sidebar{width:var(--sidebar-w);flex-shrink:0;background:var(--bg-white);border-left:2px solid #111;display:flex;flex-direction:column;transition:margin-right 0.28s ease;overflow:hidden;}
#cc-sidebar.collapsed{margin-right:calc(-1 * var(--sidebar-w));}
#cc-sidebar.expanded{position:fixed;inset:0;width:100vw;z-index:200;border-left:none;}
#cc-sidebar-tabs{display:flex;border-bottom:2px solid #111;flex-shrink:0;}
.side-tab{flex:1;padding:12px 6px;text-align:center;cursor:pointer;font-size:0.76rem;font-weight:700;color:var(--text-muted);background:var(--bg-secondary);border-right:1px solid var(--border-light);transition:all 0.15s;user-select:none;}
.side-tab:last-child{border-right:none;}
.side-tab.active{background:white;color:var(--accent-purple);box-shadow:inset 0 -3px 0 var(--accent-purple);}
.side-tab:hover:not(.active){background:#ededec;}
#cc-sidebar-actions{display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid var(--border-light);flex-shrink:0;background:var(--bg-secondary);}
.side-action-btn{flex:1;border:2px solid #111;border-radius:999px;background:white;padding:7px 10px;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:"Inter",sans-serif;box-shadow:2px 2px 0 #111;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:5px;}
.side-action-btn:hover{transform:translateY(-1px);box-shadow:3px 3px 0 #111;}
.side-action-btn.primary{background:var(--gradient-primary);color:white;}
#cc-sidebar-body{flex:1;overflow-y:auto;padding:18px;}
#cc-sidebar.expanded #cc-sidebar-body{max-width:760px;margin:0 auto;width:100%;}
#cc-sidebar-body::-webkit-scrollbar{width:5px;}
#cc-sidebar-body::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:3px;}
.side-empty{text-align:center;color:var(--text-muted);font-size:0.85rem;padding:48px 16px;line-height:1.6;}
.side-empty .se-icon{font-size:2rem;margin-bottom:12px;}
.scard{border:2px solid #111;border-radius:14px;padding:16px;margin-bottom:14px;background:white;box-shadow:3px 3px 0 #111;}
.scard-title{font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;}
.scard h3{font-size:1.05rem;font-weight:800;margin-bottom:4px;}
.scard .sub{font-size:0.8rem;color:var(--text-secondary);}
.scard ul{margin:6px 0 2px;padding-left:18px;}
.scard li{font-size:0.82rem;line-height:1.55;margin-bottom:4px;color:var(--text-secondary);}
.pill{display:inline-block;font-size:0.74rem;font-weight:600;padding:4px 11px;border-radius:999px;border:1.5px solid #111;margin:3px 4px 3px 0;}
.pill.have{background:#DCFCE7;color:#065F46;}
.pill.top{background:#EDE9FE;color:#5B21B6;}
.gap-item{border:1.5px solid var(--border-light);border-radius:10px;padding:11px 13px;margin-bottom:8px;}
.gap-item .gi-skill{font-size:0.86rem;font-weight:700;}
.gap-item .gi-how{font-size:0.78rem;color:var(--text-secondary);margin-top:3px;line-height:1.5;}
.gi-prio{font-size:0.62rem;font-weight:700;padding:2px 7px;border-radius:999px;text-transform:uppercase;}
.gi-prio.high{background:#FEE2E2;color:#991B1B;}
.gi-prio.medium{background:#FEF3C7;color:#92400E;}
.gi-prio.low{background:#E0E7FF;color:#3730A3;}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.stat-box{border:2px solid #111;border-radius:12px;padding:12px;background:#F3F0FF;box-shadow:2px 2px 0 #111;}
.stat-box .sb-num{font-size:1.5rem;font-weight:800;line-height:1;}
.stat-box .sb-label{font-size:0.68rem;color:var(--text-secondary);margin-top:4px;font-weight:600;}
/* interactive roadmap step — expands on hover */
.rm-step{border:2px solid #111;border-radius:12px;padding:13px 14px;margin-bottom:10px;background:white;box-shadow:3px 3px 0 #111;cursor:pointer;transition:all 0.18s ease;}
.rm-step:hover{box-shadow:5px 5px 0 var(--accent-purple);transform:translateY(-1px);}
.rm-step-head{display:flex;gap:11px;align-items:flex-start;}
.rm-num{width:24px;height:24px;border-radius:50%;background:var(--gradient-primary);border:2px solid #111;color:white;font-size:0.72rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rm-action{font-size:0.86rem;font-weight:700;line-height:1.45;}
.rm-detail{max-height:0;overflow:hidden;transition:max-height 0.25s ease,margin 0.25s ease,opacity 0.2s ease;opacity:0;}
.rm-step:hover .rm-detail{max-height:340px;opacity:1;margin-top:10px;}
.rm-detail .rm-why{font-size:0.78rem;color:var(--text-secondary);line-height:1.55;}
.rm-detail ul{margin:7px 0 2px;padding-left:18px;}
.rm-detail li{font-size:0.78rem;color:var(--text-secondary);line-height:1.5;margin-bottom:3px;}
.rm-hint{font-size:0.68rem;color:var(--text-muted);margin-top:4px;font-style:italic;}
.task-item{display:flex;align-items:center;gap:9px;padding:8px 0;font-size:0.84rem;cursor:pointer;border-bottom:1px solid var(--border-light);}
.task-item:last-child{border-bottom:none;}
.task-item input{width:17px;height:17px;accent-color:var(--accent-purple);cursor:pointer;flex-shrink:0;}
.task-weekly{border:2px solid var(--accent-purple);border-radius:12px;padding:12px 13px;background:rgba(233,213,255,0.18);margin-top:10px;}
.task-weekly .tw-label{font-size:0.66rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--accent-purple);margin-bottom:6px;}
.checkin-card{border:2px solid var(--accent-purple);border-radius:14px;padding:15px;margin-bottom:14px;background:rgba(233,213,255,0.12);}
.btn-sm{background:var(--gradient-primary);border:2px solid #111;border-radius:999px;box-shadow:2px 2px 0 #111;padding:8px 18px;color:white;font-weight:700;font-size:0.8rem;cursor:pointer;transition:all 0.15s;font-family:"Inter",sans-serif;}
.btn-sm:hover:not(:disabled){transform:translateY(-1px);box-shadow:3px 3px 0 #111;}
.btn-sm:disabled{opacity:0.5;cursor:not-allowed;}
.btn-primary{background:var(--gradient-primary);border:3px solid #111;border-radius:999px;box-shadow:4px 4px 0 #111;padding:11px 22px;color:white;font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s;font-family:"Inter",sans-serif;width:100%;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:6px 6px 0 #111;}
.btn-ghost{background:white;border:2px solid #111;border-radius:999px;box-shadow:3px 3px 0 #111;padding:9px 18px;font-weight:700;font-size:0.8rem;cursor:pointer;font-family:"Inter",sans-serif;width:100%;transition:all 0.15s;}
.btn-ghost:hover{transform:translateY(-1px);background:var(--bg-secondary);}
#cc-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:var(--text-primary);color:white;padding:12px 22px;border-radius:999px;font-size:0.85rem;font-weight:600;z-index:500;transition:transform 0.3s ease;box-shadow:4px 4px 0 rgba(0,0,0,0.3);}
#cc-toast.show{transform:translateX(-50%) translateY(0);}
/* analysis-ready popup, shown only when panel is collapsed */
#cc-ready-pop{position:fixed;bottom:24px;right:24px;z-index:400;background:white;border:2px solid #111;border-radius:16px;box-shadow:5px 5px 0 #111;padding:16px 18px;max-width:300px;transform:translateY(140px);opacity:0;transition:transform 0.35s ease,opacity 0.35s ease;}
#cc-ready-pop.show{transform:translateY(0);opacity:1;}
#cc-ready-pop .rp-title{font-size:0.92rem;font-weight:800;margin-bottom:3px;}
#cc-ready-pop .rp-sub{font-size:0.76rem;color:var(--text-secondary);margin-bottom:11px;line-height:1.5;}
#cc-ready-pop .rp-btns{display:flex;gap:8px;}
#cc-ready-pop .rp-open{flex:1;background:var(--gradient-primary);color:white;border:2px solid #111;border-radius:999px;padding:7px 12px;font-weight:700;font-size:0.76rem;cursor:pointer;font-family:"Inter",sans-serif;}
#cc-ready-pop .rp-later{background:white;border:2px solid #111;border-radius:999px;padding:7px 12px;font-weight:700;font-size:0.76rem;cursor:pointer;font-family:"Inter",sans-serif;}
#cc-hook{position:fixed;inset:0;z-index:600;background:var(--bg-primary);display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity 0.45s ease,transform 0.45s ease;}
#cc-hook.dismissing{opacity:0;transform:translateY(-24px);pointer-events:none;}
.hook-inner{max-width:580px;width:90%;text-align:center;}
.hook-logo{font-size:1.1rem;font-weight:800;letter-spacing:-0.04em;margin-bottom:40px;display:flex;align-items:center;justify-content:center;gap:4px;}
.hook-stat{font-size:clamp(1.35rem,3vw,1.75rem);font-weight:800;letter-spacing:-0.03em;line-height:1.3;margin-bottom:16px;min-height:4.5em;transition:opacity 0.3s ease;}
.hook-stat .hs-main{color:var(--text-primary);display:block;margin-bottom:6px;}
.hook-stat .hs-emphasis{color:var(--accent-purple);display:block;}
.hook-hook{font-size:1rem;color:var(--text-secondary);margin-bottom:36px;font-weight:500;}
.hook-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:var(--text-primary);color:white;border:2px solid #111;border-radius:999px;font-weight:700;font-size:1rem;cursor:pointer;box-shadow:4px 4px 0 #111;transition:all 0.15s;font-family:"Inter",sans-serif;}
.hook-cta:hover{transform:translateY(-2px);box-shadow:5px 6px 0 #111;}
.hook-meta{font-size:0.75rem;color:var(--text-muted);margin-top:16px;}
.hook-dots{display:flex;justify-content:center;gap:6px;margin-top:28px;}
.hook-dot{width:7px;height:7px;border-radius:50%;background:var(--border-light);transition:background 0.3s;cursor:pointer;border:none;}
.hook-dot.active{background:var(--accent-purple);}
.commit-q{font-size:1.3rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:10px;line-height:1.4;}
.commit-sub{font-size:0.9rem;color:var(--text-secondary);margin-bottom:28px;}
.commit-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.commit-btn{padding:13px 28px;border:2px solid #111;border-radius:16px;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:3px 3px 0 #111;transition:all 0.15s;font-family:"Inter",sans-serif;background:white;}
.commit-btn:hover{transform:translateY(-2px);}
.commit-btn.active-btn{background:var(--text-primary);color:white;}
.social-ticker{margin-top:24px;padding:10px 16px;background:var(--bg-secondary);border-radius:10px;font-size:0.75rem;color:var(--text-secondary);min-height:36px;display:flex;align-items:center;justify-content:center;transition:opacity 0.35s;}
.social-ticker .st-dot{width:6px;height:6px;border-radius:50%;background:var(--success);margin-right:8px;flex-shrink:0;}
.session-divider{text-align:center;font-size:0.72rem;color:var(--text-muted);padding:8px 0 4px;}
@media(max-width:900px){
  .cc-root{--sidebar-w:340px;}
  #cc-sidebar{position:fixed;top:0;right:0;bottom:0;z-index:90;box-shadow:-4px 0 0 rgba(0,0,0,0.1);}
  #cc-chat-col{padding:72px 8px 8px;}
}
`;

type Msg = { role: string; content: string; state?: string; time: string; cta?: string };
type CtaKind = "analysis" | "roadmap" | "dashboard";

// Render a plain-text bubble: capitalize the first letter, linkify URLs.
function renderBubbleText(text: string) {
  let t = String(text || "");
  // capitalize the very first alphabetic character
  t = t.replace(/^(\s*)([a-z])/, (_m, ws, ch) => ws + ch.toUpperCase());
  const urlRe = /(https?:\/\/[^\s)]+)/g;
  const parts = t.split(urlRe);
  return parts.map((part, i) =>
    urlRe.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
      : <span key={i}>{part}</span>
  );
}

export default function CcChat() {
  const [agentState, setAgentState] = useState("GREETING");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [returning, setReturning] = useState(false);

  // sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [panel, setPanel] = useState<CtaKind>("analysis");
  const [sidebarData, setSidebarData] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [checkInStatus, setCheckInStatus] = useState<any>(null);
  const [tasks, setTasks] = useState<{ daily: any[]; weekly: any } | null>(null);
  const [taskBoxes, setTaskBoxes] = useState<Record<string, boolean>>({});
  const [checkInSaving, setCheckInSaving] = useState(false);

  // analysis-ready popup
  const [readyPopVisible, setReadyPopVisible] = useState(false);
  const analysisAnnouncedRef = useRef(false);

  // hook
  const [hookVisible, setHookVisible] = useState(false);
  const [hookScreen, setHookScreen] = useState<"stats" | "commit">("stats");
  const [hookDismissing, setHookDismissing] = useState(false);
  const [statIdx, setStatIdx] = useState(0);
  const [statOpacity, setStatOpacity] = useState(1);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [toastMsg, setToastMsg] = useState("");

  const studentIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const pendingGreetingRef = useRef<any>(null);
  const hookDismissedRef = useRef(false);
  const sidebarLoadedRef = useRef(false);
  const sidebarOpenRef = useRef(false);
  const initDone = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const now12h = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  }

  // hook stat cycle
  useEffect(() => {
    if (!hookVisible || hookScreen !== "stats") return;
    const t = setInterval(() => {
      setStatOpacity(0);
      setTimeout(() => { setStatIdx(i => (i + 1) % HOOK_STATS.length); setStatOpacity(1); }, 200);
    }, 5000);
    return () => clearInterval(t);
  }, [hookVisible, hookScreen]);

  useEffect(() => {
    if (!hookVisible) return;
    const t = setInterval(() => setTickerIdx(i => (i + 1) % SOCIAL_PROOF.length), 4000);
    return () => clearInterval(t);
  }, [hookVisible]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  // ---- sidebar refresh ----
  const refreshSidebar = useCallback(async () => {
    const sid = studentIdRef.current;
    if (!sid) return;
    try {
      const dRes = await fetch(`${CC_API}/dashboard/${sid}`);
      const dData = await dRes.json();
      setSidebarData(dData);
      const pid = dData?.primary_path?.path_id;
      if (pid) {
        try {
          const gRes = await fetch(`${CC_API}/gap-analysis/${sid}/${pid}`);
          if (gRes.ok) setGapData(await gRes.json());
        } catch { /* gap analysis optional */ }
      }
      sidebarLoadedRef.current = true;
    } catch (e) {
      console.warn("sidebar refresh failed", e);
    }
  }, []);

  // load check-in status + fresh tasks whenever the dashboard panel is shown
  useEffect(() => {
    const sid = studentIdRef.current;
    if (!sidebarOpen || panel !== "dashboard" || !sid) return;
    (async () => {
      try {
        const r = await fetch(`${CC_API}/api/student/${sid}/check-in/status`);
        setCheckInStatus(r.ok ? await r.json() : { daily: { due: true }, weekly: { due: true } });
      } catch {
        setCheckInStatus({ daily: { due: true }, weekly: { due: true } });
      }
      try {
        const tr = await fetch(`${CC_API}/api/student/${sid}/progress-tasks`);
        if (tr.ok) setTasks(await tr.json());
      } catch { /* tasks optional */ }
    })();
  }, [sidebarOpen, panel, sidebarData]);

  function toggleSidebar(forceOpen?: boolean) {
    const willOpen = forceOpen === true ? true : !sidebarOpen;
    setSidebarOpen(willOpen);
    if (willOpen) {
      setReadyPopVisible(false);
      if (!sidebarLoadedRef.current) refreshSidebar();
    }
  }
  function openSidebarTo(p: CtaKind) {
    setPanel(p);
    toggleSidebar(true);
  }

  // ---- session init ----
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const existingId = localStorage.getItem(STORAGE_KEY);
    if (!existingId) setHookVisible(true);
    else { hookDismissedRef.current = true; }

    (async () => {
      try {
        const body: Record<string, string> = existingId ? { student_id: existingId } : {};
        const res = await fetch(`${CC_API}/session/start`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const sd = await res.json();
        studentIdRef.current = sd.student_id;
        conversationIdRef.current = sd.conversation_id;
        localStorage.setItem(STORAGE_KEY, sd.student_id);

        if (sd.returning && sd.history?.length > 0) {
          hookDismissedRef.current = true;
          setHookVisible(false);
          setHeaderHidden(true);
          setReturning(true);
          const hist: Msg[] = [];
          for (const m of sd.history) {
            const role = m.role === "assistant" ? "agent" : m.role;
            const chunks = role === "agent"
              ? String(m.content || "").split(/\n\s*\n/).map((s: string) => s.trim()).filter(Boolean)
              : [m.content];
            (chunks.length ? chunks : [""]).forEach((c: string) =>
              hist.push({ role, content: c, state: m.state, time: now12h() }));
          }
          setMessages(hist);
          const lastState = [...sd.history].reverse().find((m: any) => m.state)?.state;
          if (lastState) setAgentState(lastState);
          refreshSidebar();
          return;
        }

        const gRes = await fetch(`${CC_API}/chat/greeting?student_id=${sd.student_id}&conversation_id=${sd.conversation_id}`);
        pendingGreetingRef.current = await gRes.json();
        if (hookDismissedRef.current) showGreeting(pendingGreetingRef.current);
      } catch {
        pendingGreetingRef.current = { reply: "Hey, what are you working through? Job search stuff, or something else?" };
        if (hookDismissedRef.current) showGreeting(pendingGreetingRef.current);
      }
    })();
  }, [refreshSidebar]);

  function splitBubbles(text: string): string[] {
    const parts = String(text || "").split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    return parts.length ? parts : [""];
  }

  async function appendAgentBubbles(text: string, cta?: CtaKind, lastState?: string) {
    const parts = splitBubbles(text);
    for (let i = 0; i < parts.length; i++) {
      const isLast = i === parts.length - 1;
      setMessages(prev => [...prev, {
        role: "agent", content: parts[i], state: lastState, time: now12h(),
        cta: isLast ? cta : undefined,
      }]);
      if (!isLast) {
        setWaiting(true);
        await new Promise(r => setTimeout(r, Math.min(900, 350 + parts[i].length * 12)));
        setWaiting(false);
      }
    }
  }

  function showGreeting(gd: any) {
    setWaiting(true);
    setTimeout(async () => {
      setWaiting(false);
      const state = gd.orchestration?.current_state || "GREETING";
      setAgentState(state);
      await appendAgentBubbles(gd.reply || gd.message || "Hey, what's going on? What are you trying to figure out?", undefined, state);
    }, 500);
  }

  function dismissHook(level: string) {
    if (hookDismissedRef.current) return;
    hookDismissedRef.current = true;
    localStorage.setItem("studojo_commitment", level);
    setHookDismissing(true);
    setTimeout(() => setHookVisible(false), 450);
    if (pendingGreetingRef.current) showGreeting(pendingGreetingRef.current);
  }

  function ctaForState(state: string, o: any): CtaKind | undefined {
    if (state === "DNA_REVIEW" || o?.show_dna_card) return "analysis";
    if (state === "ROADMAP") return "roadmap";
    if (state === "ONGOING_SUPPORT" || o?.show_dashboard) return "dashboard";
    return undefined;
  }

  async function sendMsg(overrideText?: string) {
    const content = (overrideText ?? inputRef.current?.value ?? "").trim();
    if (!content || waiting) return;
    const sid = studentIdRef.current;
    if (!sid) return;
    if (inputRef.current) { inputRef.current.value = ""; inputRef.current.style.height = "auto"; }
    setHeaderHidden(true);
    setMessages(prev => [...prev, { role: "user", content, time: now12h() }]);
    setWaiting(true);
    const t0 = Date.now();
    try {
      const body: Record<string, string> = { student_id: sid, message: content };
      if (conversationIdRef.current) body.conversation_id = conversationIdRef.current;
      const res = await fetch(`${CC_API}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      await new Promise(r => setTimeout(r, Math.max(0, 600 - (Date.now() - t0))));
      setWaiting(false);
      const o = data.orchestration || {};
      const state = o.current_state || agentState;
      setAgentState(state);
      if (data.conversation_id) conversationIdRef.current = data.conversation_id;
      const cta = ctaForState(state, o);
      await appendAgentBubbles(data.reply, cta, state);
      if (["DNA_REVIEW", "ROADMAP", "ONGOING_SUPPORT", "DNA_CORRECTION"].includes(state)) {
        await refreshSidebar();
        // When Career Analysis becomes ready and the panel is closed, surface
        // a popup instead of a card in the chat.
        if (state === "DNA_REVIEW" && !analysisAnnouncedRef.current) {
          analysisAnnouncedRef.current = true;
          if (sidebarOpenRef.current) openSidebarTo("analysis");
          else setReadyPopVisible(true);
        } else if (state === "ROADMAP" && sidebarOpenRef.current) {
          openSidebarTo("roadmap");
        }
      }
    } catch {
      setWaiting(false);
      setMessages(prev => [...prev, {
        role: "agent", content: "Something went wrong on my end, try sending that again.", time: now12h(),
      }]);
    }
  }

  async function handleResumeUpload(file: File) {
    const sid = studentIdRef.current;
    if (!file || !sid) return;
    setMessages(prev => [...prev, { role: "user", content: "📎 " + file.name, time: now12h() }]);
    setWaiting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${CC_API}/api/student/${sid}/resume/upload`, { method: "POST", body: fd });
      const data = await res.json();
      setWaiting(false);
      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: "agent", content: (data?.detail ? String(data.detail) : "I could not read that file, you can keep answering here instead."), time: now12h(),
        }]);
      } else {
        const n = (data.fields_extracted || []).length;
        setHeaderHidden(true);
        await appendAgentBubbles(`Got your resume, that covers a lot.\n\nI pulled in ${n} details from it, so we can skip most of the questions.`);
        await sendMsg("I just uploaded my resume");
      }
    } catch {
      setWaiting(false);
      setMessages(prev => [...prev, {
        role: "agent", content: "The upload did not go through, you can keep answering here instead.", time: now12h(),
      }]);
    }
  }

  async function submitCheckIn(kind: string, items: Array<{ label: string; type: string; key: string }>) {
    const sid = studentIdRef.current;
    if (!sid) return;
    const payload = items.map(it => ({
      label: it.label, type: it.type, status: taskBoxes[it.key] ? "done" : "skipped",
    }));
    if (!payload.some(p => p.status === "done")) { toast("Tick at least one thing you did"); return; }
    setCheckInSaving(true);
    try {
      const r = await fetch(`${CC_API}/api/student/${sid}/check-in`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, items: payload }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error("check-in failed");
      const delta = data.improvement;
      toast(delta != null && delta !== 0
        ? `Readiness ${delta > 0 ? "up " : "down "}${Math.abs(delta)} to ${data.readiness_after}`
        : "Check-in logged");
      // The agent reacts in chat with the outreach impact line.
      if (data.outreach_message) {
        setMessages(prev => [...prev, { role: "agent", content: data.outreach_message, time: now12h() }]);
      }
      setTaskBoxes({});
      await refreshSidebar();
    } catch {
      toast("Could not save your check-in");
    }
    setCheckInSaving(false);
  }

  // ===== render helpers =====
  const pp = sidebarData?.primary_path;
  const dnaReady = !!(pp && pp.dna_id);

  function renderAnalysis() {
    if (!dnaReady) {
      return <div className="side-empty"><div className="se-icon">🧬</div>Your Career Analysis appears here once we have built your Career DNA. Keep chatting to get there.</div>;
    }
    const b = pp.benchmark || {};
    const have: string[] = pp.skills_you_have || [];
    const sg = (gapData?.skills_gap) || [];
    return (
      <>
        <div className="scard">
          <div className="scard-title">Your Career DNA</div>
          <h3>{pp.target_role || "Your target role"}</h3>
          <div className="sub">{pp.target_industry || ""}{pp.target_geography ? " · " + pp.target_geography : ""}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 8 }}>
            Reply probability ~{pp.reply_probability || 0}%
          </div>
        </div>
        {have.length > 0 && (
          <div className="scard">
            <div className="scard-title">Skills you have</div>
            {have.map((s, i) => <span key={i} className="pill have">{s}</span>)}
          </div>
        )}
        {(b.top_performer_skills || []).length > 0 && (
          <div className="scard">
            <div className="scard-title">Top performers in this industry have</div>
            {b.top_performer_skills.map((s: string, i: number) => <span key={i} className="pill top">{s}</span>)}
            {b.your_standing && (
              <div style={{ marginTop: 12, fontSize: "0.83rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Where you stand:</strong> {b.your_standing}
              </div>
            )}
          </div>
        )}
        {(b.gap_to_top || []).length > 0 && (
          <div className="scard">
            <div className="scard-title">How you close the gap</div>
            {b.gap_to_top.map((g: any, i: number) => (
              <div key={i} className="gap-item">
                <div className="gi-skill">{g.skill || ""}</div>
                <div className="gi-how">{g.how_to_close || ""}</div>
              </div>
            ))}
          </div>
        )}
        {sg.length > 0 && (
          <div className="scard">
            <div className="scard-title">Skill gaps for this role</div>
            {sg.map((g: any, i: number) => {
              const prio = (g.priority || "medium").toLowerCase();
              return (
                <div key={i} className="gap-item">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span className="gi-skill">{g.skill || ""}</span>
                    <span className={`gi-prio ${prio}`}>{prio}</span>
                  </div>
                  <div className="gi-how">{g.how_to_build || ""}</div>
                </div>
              );
            })}
          </div>
        )}
        <button className="btn-primary" style={{ marginBottom: 10 }} onClick={() => setPanel("roadmap")}>See your roadmap →</button>
        <button className="btn-ghost" onClick={() => sendMsg("This does not look like me, the reading is not quite right.")}>
          This doesn't look like me
        </button>
      </>
    );
  }

  function renderRoadmap() {
    const actions = (pp?.priority_actions) || [];
    if (!dnaReady || !actions.length) {
      return <div className="side-empty"><div className="se-icon">🗺️</div>Your Roadmap appears here once your Career DNA is ready. It is the ordered set of moves that raise your readiness fastest.</div>;
    }
    return (
      <>
        <div className="scard">
          <div className="scard-title">Your roadmap</div>
          <div className="sub">The moves that raise your readiness fastest, in order. Hover any step for the detail.</div>
        </div>
        {actions.map((a: any, i: number) => {
          const action = a.action || a.skill || (typeof a === "string" ? a : "");
          const why = a.why_it_matters || "";
          const how = a.how_to_close || a.how_to_build || "";
          const linked = a.linked_tool;
          return (
            <div key={i} className="rm-step">
              <div className="rm-step-head">
                <div className="rm-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="rm-action">{action}</div>
                  <div className="rm-hint">Hover for detail</div>
                </div>
              </div>
              <div className="rm-detail">
                <ul>
                  {why && <li><strong>Why it matters:</strong> {why}</li>}
                  {how && <li><strong>How to start:</strong> {how}</li>}
                  {a.priority && <li><strong>Priority:</strong> {String(a.priority)}</li>}
                  {linked && <li><strong>Tool that helps:</strong> {linked === "resume_maker" ? "Resume Maker" : linked === "outreach_dojo" ? "Outreach Dojo" : linked}</li>}
                </ul>
              </div>
            </div>
          );
        })}
        <button className="btn-primary" onClick={() => setPanel("dashboard")}>Go to dashboard →</button>
      </>
    );
  }

  function renderDashboard() {
    if (!dnaReady) {
      return <div className="side-empty"><div className="se-icon">📊</div>Your Dashboard appears here once your Career DNA is ready. It tracks your readiness over time and your weekly check-ins.</div>;
    }
    const sh = sidebarData.score_history || {};
    const student = sidebarData.student || {};
    const hist = (sh.history || []);
    const daily: any[] = tasks?.daily || [];
    const weekly = tasks?.weekly || null;

    const dailyItems = daily.map((t, i) => ({ label: t.label, type: t.type || "skill", key: "d" + i }));
    const weeklyItem = weekly ? { label: weekly.label, type: weekly.type || "skill", key: "w0" } : null;

    return (
      <>
        <div className="stat-grid">
          <div className="stat-box"><div className="sb-num">{pp.readiness_score || 0}</div><div className="sb-label">Readiness score</div></div>
          <div className="stat-box"><div className="sb-num">{pp.reply_probability || 0}%</div><div className="sb-label">Reply probability</div></div>
          <div className="stat-box"><div className="sb-num">{student.session_count || 1}</div><div className="sb-label">Sessions</div></div>
          <div className="stat-box"><div className="sb-num">{sh.improvement_total != null ? (sh.improvement_total >= 0 ? "+" : "") + sh.improvement_total : "0"}</div><div className="sb-label">Readiness change</div></div>
        </div>

        {/* DAILY TASKS */}
        <div className="checkin-card">
          <div style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: 2 }}>Today's tasks</div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginBottom: 6 }}>
            Small moves you can finish today. They refresh daily.
          </div>
          {dailyItems.length === 0 && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Loading your tasks...</div>}
          {dailyItems.map(it => (
            <label key={it.key} className="task-item">
              <input type="checkbox" checked={!!taskBoxes[it.key]}
                onChange={e => setTaskBoxes(prev => ({ ...prev, [it.key]: e.target.checked }))} />
              <span>{it.label}</span>
            </label>
          ))}
          {dailyItems.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button className="btn-sm" disabled={checkInSaving} onClick={() => submitCheckIn("daily", dailyItems)}>
                {checkInSaving ? "Saving..." : "Log daily check-in"}
              </button>
            </div>
          )}

          {/* WEEKLY TASK */}
          {weeklyItem && (
            <div className="task-weekly">
              <div className="tw-label">This week's big task</div>
              <label className="task-item" style={{ borderBottom: "none", paddingBottom: 0 }}>
                <input type="checkbox" checked={!!taskBoxes[weeklyItem.key]}
                  onChange={e => setTaskBoxes(prev => ({ ...prev, [weeklyItem.key]: e.target.checked }))} />
                <span>{weeklyItem.label}</span>
              </label>
              <div style={{ marginTop: 8 }}>
                <button className="btn-sm" disabled={checkInSaving} onClick={() => submitCheckIn("weekly", [weeklyItem])}>
                  {checkInSaving ? "Saving..." : "Log weekly check-in"}
                </button>
              </div>
            </div>
          )}
        </div>

        {hist.length > 1 && (
          <div className="scard">
            <div className="scard-title">Readiness over time</div>
            {hist.slice(-6).map((h: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", padding: "5px 0", borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ color: "var(--text-muted)" }}>{(h.date || "").slice(0, 10)}</span>
                <span style={{ fontWeight: 700 }}>{h.score}</span>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  const stat = HOOK_STATS[statIdx];
  const ctaCopy: Record<CtaKind, { title: string; sub: string }> = {
    analysis: { title: "Your Career Analysis is ready", sub: "See how you compare to top performers" },
    roadmap: { title: "Your Roadmap is ready", sub: "The steps that move your readiness fastest" },
    dashboard: { title: "Open your Dashboard", sub: "Track progress and log a check-in" },
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cc-root">
        {/* HOOK */}
        {hookVisible && (
          <div id="cc-hook" className={hookDismissing ? "dismissing" : ""}>
            <div className="hook-inner">
              <div className="hook-logo">studojo<span className="cc-dot" /></div>
              {hookScreen === "stats" ? (
                <>
                  <div className="hook-stat" style={{ opacity: statOpacity }}>
                    <span className="hs-main">{stat.main}</span>
                    <span className="hs-emphasis">{stat.emphasis}</span>
                  </div>
                  <div className="hook-hook">{stat.hook}</div>
                  <button className="hook-cta" onClick={() => setHookScreen("commit")}>Show me where I stand →</button>
                  <div className="hook-meta">8 minutes. Specific to you. No sign-up.</div>
                  <div className="hook-dots">
                    {HOOK_STATS.map((_, i) => (
                      <button key={i} className={`hook-dot${i === statIdx ? " active" : ""}`} onClick={() => setStatIdx(i)} />
                    ))}
                  </div>
                  <div className="social-ticker"><span className="st-dot" />{SOCIAL_PROOF[tickerIdx]}</div>
                </>
              ) : (
                <>
                  <div className="commit-q">Before we start — are you actively looking right now, or just exploring what is out there?</div>
                  <div className="commit-sub">This shapes the next 8 minutes.</div>
                  <div className="commit-btns">
                    <button className="commit-btn active-btn" onClick={() => dismissHook("active")}>Actively looking for a job</button>
                    <button className="commit-btn" onClick={() => dismissHook("exploring")}>Just exploring for now</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* FLOATING LOGO + PANEL TOGGLE (toggle slides with the panel) */}
        <a id="cc-float-logo" href="/cc">studojo<span className="cc-dot" /></a>
        {!sidebarExpanded && (
          <button id="cc-float-toggle" className={sidebarOpen ? "open" : "closed"} onClick={() => toggleSidebar()}>
            <span>{sidebarOpen ? "❯" : "❮"}</span> <span>{sidebarOpen ? "Hide panel" : "Show panel"}</span>
          </button>
        )}

        {/* LAYOUT */}
        <div id="cc-layout">
          <div id="cc-chat-col">
            <div id="cc-chat-inner">
              <div className="chat-card">
                <div className={`chat-setup-header${headerHidden ? " hidden" : ""}`}>
                  <div className="chat-setup-header-title">Quick Profile Setup</div>
                  <div className="chat-setup-header-sub">The more you talk to the coach, the better it knows you and the sharper your plan gets.</div>
                </div>
                <div id="cc-messages">
                  {returning && <div className="session-divider">Continuing your session</div>}
                  {messages.map((m, i) => {
                    const isLastInRun =
                      i === messages.length - 1 || messages[i + 1].role !== m.role;
                    const isLastMessage = i === messages.length - 1;
                    const hasLink = /(https?:\/\/[^\s)]+)/.test(m.content);
                    return (
                      <div key={i}>
                        <div className={`msg-row ${m.role}`}>
                          {m.role === "agent" && <div className="agent-avatar">S</div>}
                          <div className="msg-bubble-wrap">
                            <div className="msg-bubble">{renderBubbleText(m.content)}</div>
                            {m.role === "agent" && hasLink && (
                              <button className="report-link-btn"
                                onClick={() => sendMsg("One of the links you sent does not work or is wrong.")}>
                                Link not working? Report it
                              </button>
                            )}
                            {isLastInRun && <div className="msg-time">{m.time}</div>}
                          </div>
                        </div>
                        {/* CTA shows only on the most recent agent message, so it
                            disappears as the conversation continues. */}
                        {m.cta && isLastMessage && (
                          <div className="panel-cta" onClick={() => openSidebarTo(m.cta as CtaKind)}>
                            <div>
                              <div className="cta-text">{ctaCopy[m.cta as CtaKind].title}</div>
                              <div className="cta-sub">{ctaCopy[m.cta as CtaKind].sub}</div>
                            </div>
                            <div className="cta-arrow">→</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {waiting && (
                    <div className="msg-row agent">
                      <div className="agent-avatar">S</div>
                      <div className="msg-bubble-wrap">
                        <div className="msg-bubble"><div className="typing-dots"><span /><span /><span /></div></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div id="cc-input-area">
                  <button id="cc-attach-btn" title="Upload your resume" onClick={() => fileRef.current?.click()}>📎</button>
                  <input type="file" ref={fileRef} accept=".pdf,.docx,.txt" style={{ display: "none" }}
                    onChange={e => { if (e.target.files?.[0]) handleResumeUpload(e.target.files[0]); e.target.value = ""; }} />
                  <textarea
                    id="cc-chat-input" ref={inputRef} placeholder="Type your message..." rows={1}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                    onChange={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px"; }}
                  />
                  <button id="cc-send-btn" disabled={waiting} onClick={() => sendMsg()}>→</button>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside id="cc-sidebar" className={`${sidebarOpen ? "" : "collapsed"} ${sidebarExpanded ? "expanded" : ""}`}>
            <div id="cc-sidebar-tabs">
              {(["analysis", "roadmap", "dashboard"] as CtaKind[]).map(p => (
                <div key={p} className={`side-tab${panel === p ? " active" : ""}`} onClick={() => setPanel(p)}>
                  {p === "analysis" ? "Career Analysis" : p === "roadmap" ? "Roadmap" : "Dashboard"}
                </div>
              ))}
            </div>
            <div id="cc-sidebar-actions">
              {sidebarExpanded ? (
                <button className="side-action-btn primary" onClick={() => setSidebarExpanded(false)}>
                  ← Take me to chat
                </button>
              ) : (
                <>
                  <button className="side-action-btn" onClick={() => setSidebarExpanded(true)}>
                    ⤢ Expand to full page
                  </button>
                  <button className="side-action-btn" onClick={() => toggleSidebar(false)}>
                    ❯ Hide panel
                  </button>
                </>
              )}
            </div>
            <div id="cc-sidebar-body">
              {panel === "analysis" && renderAnalysis()}
              {panel === "roadmap" && renderRoadmap()}
              {panel === "dashboard" && renderDashboard()}
            </div>
          </aside>
        </div>

        {/* ANALYSIS-READY POPUP — only when panel is collapsed */}
        <div id="cc-ready-pop" className={readyPopVisible && !sidebarOpen ? "show" : ""}>
          <div className="rp-title">Your Career Analysis is ready</div>
          <div className="rp-sub">See how you compare to top performers and what to do next.</div>
          <div className="rp-btns">
            <button className="rp-open" onClick={() => openSidebarTo("analysis")}>View it</button>
            <button className="rp-later" onClick={() => setReadyPopVisible(false)}>Later</button>
          </div>
        </div>

        <div id="cc-toast" className={toastMsg ? "show" : ""}>{toastMsg}</div>
      </div>
    </>
  );
}
