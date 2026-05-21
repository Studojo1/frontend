import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function meta() {
  return [{ title: "CareerDojo Chat | Studojo" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_student_id";

const STATE_LABELS: Record<string, string> = {
  GREETING: "Getting started", PROFILING: "Building your profile",
  CAREER_ANALYSIS: "Building your Career DNA", DNA_REVIEW: "Career DNA ready",
  ROADMAP: "Roadmap ready", ONGOING_SUPPORT: "Welcome back",
  DNA_CORRECTION: "Refining your DNA", NEW_PATH_EXPLORATION: "Exploring new paths",
};
const STATE_TO_STEP: Record<string, number> = {
  GREETING: 1, PROFILING: 1, CAREER_ANALYSIS: 2, DNA_REVIEW: 2, DNA_CORRECTION: 2,
  ROADMAP: 3, NEW_PATH_EXPLORATION: 3, ONGOING_SUPPORT: 4,
};
const DNA_STATES = new Set(["CAREER_ANALYSIS", "DNA_REVIEW", "DNA_CORRECTION"]);
const DASH_STATES = new Set(["DNA_REVIEW", "DNA_CORRECTION", "ROADMAP", "NEW_PATH_EXPLORATION", "ONGOING_SUPPORT"]);

const HOOK_STATS = [
  { main: "B.Tech students applying on LinkedIn get a 1.4% callback rate.", emphasis: "Students who cold outreach hiring managers directly get 12 to 18%.", hook: "Let's figure out which companies you should be reaching." },
  { main: "Most applications are filtered by software before any human ever reads them.", emphasis: "A keyword-optimised resume gets through. A generic one gets rejected in seconds.", hook: "Let's see exactly where you stand right now." },
  { main: "The average student who books an interview has a readiness score of 74.", emphasis: "Most students start at 40 to 50.", hook: "Let's find your number and close the gap." },
  { main: "Sending 30 targeted cold emails gets replies in 1 to 2 weeks on average.", emphasis: "The same 30 applications on Naukri gets close to zero.", hook: "Let's build your outreach strategy, specific to your profile." },
];
const SOCIAL_PROOF = [
  "A B.Tech CSE student from Hyderabad improved their readiness from 38% to 71% in 3 weeks.",
  "A BCom student from Mumbai got a reply from a hiring manager at Deloitte using cold outreach.",
  "12 students in the Finance stream got internship replies this week.",
  "A BMS student targeting product roles went from 0 applications to 3 interview calls in 10 days.",
  "A student from a Tier-2 college landed a Data Analyst role by skipping job boards entirely.",
  "An MBA student from a non-IIM college got a consulting internship through targeted cold email.",
];

const CSS = `
:root {
  --bg-primary:#FAFAF9;--bg-secondary:#F5F5F4;--bg-white:#FFFFFF;
  --text-primary:#111111;--text-secondary:#71717A;--text-muted:#A1A1AA;
  --border:#111111;--border-light:rgba(0,0,0,0.12);
  --accent-purple:#8B5CF6;--accent-light:#E9D5FF;
  --success:#10B981;--warning:#F59E0B;
  --gradient-primary:linear-gradient(90deg,#8B5CF6 0%,#A855F7 50%,#EC4899 100%);
  --navbar-h:64px;--step-nav-h:44px;--total-top:calc(var(--navbar-h) + var(--step-nav-h));
}
.cc-root *,
.cc-root *::before,
.cc-root *::after{box-sizing:border-box;margin:0;padding:0;}
.cc-root{height:100dvh;font-family:"Inter",sans-serif;background:var(--bg-primary);color:var(--text-primary);overflow:hidden;display:flex;flex-direction:column;}
#cc-navbar{height:var(--navbar-h);background:var(--bg-white);border-bottom:2px solid #111;box-shadow:0 2px 0px #111;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;flex-shrink:0;}
#cc-nav-logo{font-size:1.35rem;font-weight:800;letter-spacing:-0.04em;color:var(--text-primary);display:flex;align-items:center;gap:4px;cursor:pointer;text-decoration:none;}
.cc-dot{width:8px;height:8px;border-radius:50%;background:var(--gradient-primary);display:inline-block;}
#cc-navbar-center{text-align:center;flex:1;}
.nav-setup-title{font-size:0.9rem;font-weight:700;color:var(--text-primary);}
.nav-setup-sub{font-size:0.68rem;color:var(--text-muted);margin-top:1px;}
.nav-state-label{font-size:0.85rem;font-weight:600;color:var(--accent-purple);background:var(--accent-light);padding:5px 14px;border-radius:999px;border:2px solid #111;box-shadow:2px 2px 0 #111;display:inline-block;}
#cc-step-nav{height:var(--step-nav-h);background:var(--bg-white);border-bottom:1px solid rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;gap:0;flex-shrink:0;}
.step-item{display:flex;align-items:center;gap:7px;cursor:pointer;padding:5px 12px;border-radius:999px;transition:all 0.15s;user-select:none;}
.step-item:hover:not(.active){background:var(--bg-secondary);}
.step-num{width:20px;height:20px;border-radius:50%;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#bbb;flex-shrink:0;transition:all 0.25s;}
.step-item.active .step-num{background:var(--gradient-primary);border-color:transparent;color:white;}
.step-item.done .step-num{background:var(--success);border-color:transparent;color:white;}
.step-label{font-size:0.78rem;font-weight:500;color:var(--text-muted);transition:color 0.2s;}
.step-item.active .step-label{font-weight:700;color:var(--accent-purple);}
.step-item.done .step-label{color:var(--success);font-weight:600;}
.step-connector{width:28px;height:2px;background:#e8e8e8;flex-shrink:0;margin:0 2px;transition:background 0.3s;}
.step-connector.done{background:var(--success);}
#cc-layout{flex:1;display:flex;min-height:0;padding:16px;}
#cc-chat-col{flex:1;display:flex;flex-direction:column;max-width:820px;margin:0 auto;width:100%;}
.chat-card{flex:1;display:flex;flex-direction:column;border:2px solid #111;border-radius:20px;overflow:hidden;box-shadow:4px 4px 0 #111;background:white;min-height:0;}
.chat-setup-header{padding:16px 28px;flex-shrink:0;background:linear-gradient(135deg,#F3F0FF 0%,#FDF2FF 100%);border-bottom:1px solid rgba(139,92,246,0.15);transition:all 0.3s ease;}
.chat-setup-header.hidden{display:none;}
.chat-setup-header-title{font-size:1rem;font-weight:800;margin-bottom:2px;}
.chat-setup-header-sub{font-size:0.78rem;color:var(--text-muted);}
#cc-messages{flex:1;overflow-y:auto;padding:24px 28px;display:flex;flex-direction:column;gap:18px;scroll-behavior:smooth;min-height:0;}
#cc-messages::-webkit-scrollbar{width:4px;}
#cc-messages::-webkit-scrollbar-track{background:transparent;}
#cc-messages::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:2px;}
.msg-row{display:flex;gap:12px;align-items:flex-end;}
.msg-row.agent{justify-content:flex-start;}
.msg-row.user{justify-content:flex-end;}
.agent-avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:var(--gradient-primary);border:2px solid #111;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800;color:white;}
.msg-bubble-wrap{display:flex;flex-direction:column;max-width:72%;}
.msg-bubble{padding:14px 18px;font-size:0.9375rem;line-height:1.55;border:2px solid #111;white-space:pre-wrap;}
.msg-row.agent .msg-bubble{background:#F3F0FF;border-radius:4px 18px 18px 18px;box-shadow:3px 3px 0 rgba(0,0,0,0.12);}
.msg-row.user .msg-bubble{background:var(--gradient-primary);border-radius:18px 4px 18px 18px;box-shadow:3px 3px 0 rgba(0,0,0,0.6);color:white;}
.msg-row.user .msg-bubble-wrap{align-items:flex-end;}
.msg-time{font-size:10px;color:var(--text-muted);margin-top:4px;}
.typing-dots{display:flex;gap:5px;padding:4px 0;}
.typing-dots span{width:7px;height:7px;border-radius:50%;background:var(--accent-purple);animation:dotPulse 600ms ease-in-out infinite alternate;opacity:0.3;}
.typing-dots span:nth-child(2){animation-delay:200ms;}
.typing-dots span:nth-child(3){animation-delay:400ms;}
@keyframes dotPulse{to{opacity:1;transform:translateY(-2px);}}
.analysis-cta-inline{border:2px solid #111;border-radius:14px;padding:16px 20px;background:#F3F0FF;cursor:pointer;transition:all 0.2s ease;margin:6px 0;display:flex;align-items:center;justify-content:space-between;box-shadow:3px 3px 0 #111;}
.analysis-cta-inline:hover{transform:translateY(-2px);box-shadow:5px 5px 0 #111;}
.analysis-cta-inline .cta-text{font-size:0.95rem;font-weight:700;color:var(--text-primary);}
.analysis-cta-inline .cta-sub{font-size:0.78rem;color:var(--text-secondary);margin-top:2px;}
.analysis-cta-inline .cta-arrow{font-size:1.3rem;color:var(--accent-purple);}
.dashboard-cta-inline{border:2px solid var(--accent-purple);border-radius:14px;padding:16px 20px;background:rgba(233,213,255,0.2);cursor:pointer;transition:all 0.2s ease;margin:6px 0;display:flex;align-items:center;justify-content:space-between;}
.dashboard-cta-inline:hover{background:rgba(233,213,255,0.4);transform:translateY(-1px);box-shadow:4px 4px 0 #111;}
.dashboard-cta-inline .cta-text{font-size:0.95rem;font-weight:700;color:var(--accent-purple);}
.dashboard-cta-inline .cta-sub{font-size:0.78rem;color:var(--text-secondary);margin-top:2px;}
.dashboard-cta-inline .cta-arrow{font-size:1.3rem;color:var(--accent-purple);}
#cc-input-area{flex-shrink:0;background:var(--bg-white);border-top:2px solid rgba(0,0,0,0.1);padding:16px 24px;display:flex;gap:12px;align-items:flex-end;}
#cc-chat-input{flex:1;border:2px solid var(--accent-purple);border-radius:18px;padding:14px 18px;font-family:"Inter",sans-serif;font-size:0.95rem;background:white;color:var(--text-primary);resize:none;min-height:52px;max-height:140px;outline:none;transition:all 0.2s ease;line-height:1.5;}
#cc-chat-input:focus{box-shadow:0 0 0 4px rgba(139,92,246,0.12);}
#cc-chat-input::placeholder{color:var(--text-muted);}
#cc-send-btn{width:48px;height:48px;border-radius:50%;flex-shrink:0;background:var(--gradient-primary);border:2px solid #111;box-shadow:3px 3px 0 #111;color:white;font-size:1.1rem;font-weight:700;cursor:pointer;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;}
#cc-send-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:5px 5px 0 #111;}
#cc-send-btn:disabled{opacity:0.5;cursor:not-allowed;}
.session-divider{text-align:center;font-size:0.72rem;color:var(--text-muted);padding:4px 0 8px;}
/* HOOK */
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
.hook-commit{display:none;}
.hook-commit.show{display:block;}
.commit-q{font-size:1.3rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:10px;line-height:1.4;}
.commit-sub{font-size:0.9rem;color:var(--text-secondary);margin-bottom:28px;}
.commit-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.commit-btn{padding:13px 28px;border:2px solid #111;border-radius:16px;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:3px 3px 0 #111;transition:all 0.15s;font-family:"Inter",sans-serif;background:white;}
.commit-btn:hover{transform:translateY(-2px);}
.commit-btn.active-btn{background:var(--text-primary);color:white;}
.social-ticker{margin-top:24px;padding:10px 16px;background:var(--bg-secondary);border-radius:10px;font-size:0.75rem;color:var(--text-secondary);min-height:36px;display:flex;align-items:center;justify-content:center;transition:opacity 0.35s;}
.social-ticker .st-dot{width:6px;height:6px;border-radius:50%;background:var(--success);margin-right:8px;flex-shrink:0;animation:pulse 2s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
@media(max-width:768px){
  #cc-input-area{padding:12px 16px;}
  #cc-messages{padding:16px;}
  #cc-navbar{padding:0 16px;}
  .nav-setup-sub{display:none;}
  .msg-bubble-wrap{max-width:86%;}
  #cc-chat-col{padding:8px;}
  #cc-step-nav{overflow-x:auto;justify-content:flex-start;padding:0 12px;}
}
`;

export default function CcChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forceChat = searchParams.get("force") === "1";
  const pathId = searchParams.get("path_id") || null;   // resume a specific career path
  const newPath = searchParams.get("new") === "1";       // start a brand-new path thread
  const [pathLabel, setPathLabel] = useState<string | null>(null); // banner label for current path
  const [agentState, setAgentState] = useState("GREETING");
  const [messages, setMessages] = useState<Array<{ role: string; content: string; state?: string; time: string }>>([]);
  const [waiting, setWaiting] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [dnaConfirmed, setDnaConfirmed] = useState(false);
  const [returning, setReturning] = useState(false);

  // Hook state
  const [hookVisible, setHookVisible] = useState(false);
  const [hookScreen, setHookScreen] = useState<"stats" | "commit">("stats");
  const [hookDismissing, setHookDismissing] = useState(false);
  const [statIdx, setStatIdx] = useState(0);
  const [statOpacity, setStatOpacity] = useState(1);
  const [tickerIdx, setTickerIdx] = useState(0);

  const studentIdRef = useRef<string | null>(null);
  const pendingGreetingRef = useRef<any>(null);
  const hookDismissedRef = useRef(false);
  const initDone = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function now12h() {
    return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  // Hook stat cycle
  useEffect(() => {
    if (!hookVisible || hookScreen !== "stats") return;
    const t = setInterval(() => {
      setStatOpacity(0);
      setTimeout(() => {
        setStatIdx(i => (i + 1) % HOOK_STATS.length);
        setStatOpacity(1);
      }, 200);
    }, 5000);
    return () => clearInterval(t);
  }, [hookVisible, hookScreen]);

  // Ticker cycle
  useEffect(() => {
    if (!hookVisible) return;
    const t = setInterval(() => setTickerIdx(i => (i + 1) % SOCIAL_PROOF.length), 4000);
    return () => clearInterval(t);
  }, [hookVisible]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const existingId = localStorage.getItem(STORAGE_KEY);
    if (!existingId) setHookVisible(true);

    (async () => {
      try {
        let conversationId: string;
        let sd: any;

        if (newPath && existingId) {
          // Start a brand-new path thread — student has context but fresh conversation
          const res = await fetch(`${CC_API}/session/new-thread`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: existingId }),
          });
          const newThread = await res.json();
          studentIdRef.current = newThread.student_id;
          conversationId = newThread.conversation_id;
          // Show greeting immediately (no history)
          setHookVisible(false);
          hookDismissedRef.current = true;
          setPathLabel("New career path");
          const gRes = await fetch(`${CC_API}/chat/greeting?student_id=${newThread.student_id}&conversation_id=${conversationId}`);
          const gd = await gRes.json();
          pendingGreetingRef.current = gd;
          showGreeting(gd);
          return;
        }

        // Build session/start body
        const body: Record<string, string> = existingId ? { student_id: existingId } : {};
        if (pathId) body.path_id = pathId;

        const res = await fetch(`${CC_API}/session/start`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        sd = await res.json();
        studentIdRef.current = sd.student_id;
        localStorage.setItem(STORAGE_KEY, sd.student_id);
        conversationId = sd.conversation_id;

        // Set path label banner when on a specific path thread
        if (sd.career_path_id || pathId) {
          setPathLabel(sd.thread_type === "explore_new_path" ? "Exploring new path" : null);
        }

        if (sd.returning && sd.history?.length > 0) {
          const lastState = [...sd.history].reverse().find((m: any) => m.state)?.state;
          // Returning user with DNA on default path — redirect to dashboard
          // Skip if ?force=1 or if loading a specific path_id
          if (!forceChat && !pathId && lastState && DASH_STATES.has(lastState)) {
            navigate(`/cc/dashboard?id=${sd.student_id}`);
            return;
          }
          setHookVisible(false);
          hookDismissedRef.current = true;
          setReturning(true);
          const hist = sd.history.map((m: any) => ({
            role: m.role === "assistant" ? "agent" : m.role,
            content: m.content, state: m.state, time: now12h(),
          }));
          setMessages(hist);
          if (lastState) setAgentState(lastState);
          return;
        }

        const gRes = await fetch(`${CC_API}/chat/greeting?student_id=${sd.student_id}&conversation_id=${conversationId}`);
        const gd = await gRes.json();
        pendingGreetingRef.current = gd;
        if (hookDismissedRef.current) showGreeting(gd);
      } catch {
        pendingGreetingRef.current = { reply: "Hey, what are you working through right now?" };
        if (hookDismissedRef.current) showGreeting(pendingGreetingRef.current);
      }
    })();
  }, []);

  function showGreeting(gd: any) {
    setWaiting(true);
    setTimeout(() => {
      setWaiting(false);
      const newState = gd.orchestration?.current_state || "GREETING";
      setAgentState(newState);
      setMessages([{ role: "agent", content: gd.reply || gd.message || "Hey, what are you working through?", state: newState, time: now12h() }]);
    }, 500);
  }

  function dismissHook(level: string) {
    if (hookDismissedRef.current) return;
    hookDismissedRef.current = true;
    localStorage.setItem("studojo_commitment", level);
    setHookDismissing(true);
    setTimeout(() => setHookVisible(false), 450);
    if (pendingGreetingRef.current) {
      showGreeting(pendingGreetingRef.current);
    }
  }

  async function sendMsg(overrideText?: string) {
    const content = (overrideText || inputRef.current?.value || "").trim();
    if (!content || waiting) return;
    if (inputRef.current) { inputRef.current.value = ""; inputRef.current.style.height = "auto"; }
    setHeaderHidden(true);
    const sid = studentIdRef.current;
    if (!sid) return;
    setMessages(prev => [...prev, { role: "user", content, time: now12h() }]);
    setWaiting(true);
    const t0 = Date.now();
    try {
      const res = await fetch(`${CC_API}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: sid, message: content }),
      });
      const data = await res.json();
      const elapsed = Date.now() - t0;
      await new Promise(r => setTimeout(r, Math.max(0, 600 - elapsed)));
      const newState = data.orchestration?.current_state || agentState;
      setAgentState(newState);
      if (data.orchestration?.dna_generated || DASH_STATES.has(newState)) setDnaConfirmed(true);
      setMessages(prev => [...prev, { role: "agent", content: data.reply, state: newState, time: now12h() }]);
    } catch {
      setMessages(prev => [...prev, { role: "agent", content: "Something went wrong on my end — try sending that again.", time: now12h() }]);
    }
    setWaiting(false);
  }

  const step = STATE_TO_STEP[agentState] || 1;
  const sid = studentIdRef.current;
  const showDnaCta = DNA_STATES.has(agentState) && sid;
  const showDashCta = dnaConfirmed && sid;
  const stat = HOOK_STATS[statIdx];

  const navCenter = (!agentState || agentState === "GREETING" || agentState === "PROFILING")
    ? <div id="cc-navbar-center"><div className="nav-setup-title">Quick Profile Setup</div><div className="nav-setup-sub">A few quick questions so we can find the right path for you</div></div>
    : <div id="cc-navbar-center"><span className="nav-state-label">{STATE_LABELS[agentState] || agentState}</span></div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cc-root">

        {/* HOOK OVERLAY */}
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
                  <div className="social-ticker">
                    <span className="st-dot" />{SOCIAL_PROOF[tickerIdx]}
                  </div>
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

        {/* PATH BANNER — shown when on a specific career path thread */}
        {pathLabel && (
          <div style={{ background: "linear-gradient(90deg,#8B5CF6,#A855F7)", color: "white", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, padding: "6px 16px", letterSpacing: "0.05em", flexShrink: 0 }}>
            {pathLabel.toUpperCase()} · <a href="/cc/dashboard" style={{ color: "white", textDecoration: "underline", fontWeight: 700 }}>Back to Dashboard</a>
          </div>
        )}

        {/* NAVBAR */}
        <nav id="cc-navbar">
          <a id="cc-nav-logo" href="/cc">studojo<span className="cc-dot" /></a>
          {navCenter}
          <div style={{ width: 120 }} />
        </nav>

        {/* STEP NAV */}
        <div id="cc-step-nav">
          {[["AI Chat", "/cc/chat"], ["Career Analysis", `/cc/analysis${sid ? "?id="+sid : ""}`], ["Recommendations", `/cc/roadmap${sid ? "?id="+sid : ""}`], ["Dashboard", `/cc/dashboard${sid ? "?id="+sid : ""}`]].map(([label, href], i) => {
            const n = i + 1;
            const cls = n === step ? "step-item active" : n < step ? "step-item done" : "step-item";
            return (
              <div key={n} style={{ display: "contents" }}>
                <div className={cls} onClick={() => n < step && navigate(href)}>
                  <div className="step-num">{n}</div>
                  <div className="step-label">{label}</div>
                </div>
                {i < 3 && <div className={`step-connector${n < step ? " done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* LAYOUT */}
        <div id="cc-layout">
          <div id="cc-chat-col">
            <div className="chat-card">
              <div className={`chat-setup-header${headerHidden ? " hidden" : ""}`}>
                <div className="chat-setup-header-title">Quick Profile Setup</div>
                <div className="chat-setup-header-sub">A few quick questions so we can find the right path for you</div>
              </div>

              <div id="cc-messages">
                {returning && <div className="session-divider">Continuing your session</div>}
                {messages.map((m, i) => (
                  <div key={i}>
                    <div className={`msg-row ${m.role}`}>
                      {m.role === "agent" && <div className="agent-avatar">S</div>}
                      <div className="msg-bubble-wrap">
                        <div className="msg-bubble">{m.content}</div>
                        <div className="msg-time">{m.time}</div>
                      </div>
                    </div>
                    {/* CTAs after last agent message */}
                    {m.role === "agent" && i === messages.length - 1 && (
                      <>
                        {showDnaCta && (
                          <div style={{ marginLeft: 46 }}>
                            <div className="analysis-cta-inline" onClick={() => navigate(`/cc/analysis?id=${sid}`)}>
                              <div><div className="cta-text">View your Career Analysis</div><div className="cta-sub">Career DNA, skill gaps, and your recommended roadmap</div></div>
                              <div className="cta-arrow">→</div>
                            </div>
                          </div>
                        )}
                        {showDashCta && (
                          <div style={{ marginLeft: 46 }}>
                            <div className="analysis-cta-inline" style={{ borderColor: "#8b5cf6", background: "rgba(233,213,255,0.2)" }} onClick={() => navigate(`/cc/roadmap?id=${sid}`)}>
                              <div><div className="cta-text" style={{ color: "#8b5cf6" }}>View your Recommendations</div><div className="cta-sub">Full roadmap, skill gaps, and priority actions</div></div>
                              <div className="cta-arrow" style={{ color: "#8b5cf6" }}>→</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
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
                <textarea
                  id="cc-chat-input"
                  ref={inputRef}
                  placeholder="Type your message..."
                  rows={1}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                  onChange={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
                />
                <button id="cc-send-btn" disabled={waiting} onClick={() => sendMsg()}>→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
