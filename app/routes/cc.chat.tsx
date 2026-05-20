import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "CareerDojo Chat | Studojo" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_cc_student_id";

type Msg = { role: "user" | "agent"; content: string; state?: string };

const STATE_STEPS: Record<string, number> = {
  GREETING: 1, PROFILING: 1,
  CAREER_ANALYSIS: 2, DNA_REVIEW: 2, DNA_CORRECTION: 2,
  ROADMAP: 3, NEW_PATH_EXPLORATION: 3,
  ONGOING_SUPPORT: 4,
};
const DNA_STATES = new Set(["CAREER_ANALYSIS", "DNA_REVIEW", "DNA_CORRECTION"]);
const DASH_STATES = new Set(["ROADMAP", "NEW_PATH_EXPLORATION", "ONGOING_SUPPORT"]);

const HOOK_STATS = [
  { main: "B.Tech students applying on LinkedIn get a 1.4% callback rate.", emphasis: "Students who cold outreach hiring managers directly get 12 to 18%.", hook: "Let's figure out which companies you should be reaching." },
  { main: "Most applications are filtered by software before any human reads them.", emphasis: "A keyword-optimised resume gets through. A generic one gets rejected in seconds.", hook: "Let's see exactly where you stand right now." },
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

function StepBar({ state }: { state: string }) {
  const step = STATE_STEPS[state] || 1;
  const steps = ["AI Chat", "Career Analysis", "Recommendations", "Dashboard"];
  return (
    <div className="flex items-center justify-center gap-1 py-3 px-4 text-xs font-semibold border-b border-neutral-100 bg-white flex-wrap">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} className="flex items-center gap-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${active ? "bg-violet-500 border-violet-500 text-white" : done ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-300 text-neutral-400"}`}>{n}</div>
            <span className={`hidden sm:inline ${active ? "text-violet-600" : done ? "text-neutral-700" : "text-neutral-400"}`}>{label}</span>
            {i < steps.length - 1 && <div className={`w-5 h-px mx-1 ${done ? "bg-neutral-900" : "bg-neutral-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function CcChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [agentState, setAgentState] = useState("GREETING");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);

  // Hook overlay state
  const [hookVisible, setHookVisible] = useState(false);
  const [hookScreen, setHookScreen] = useState<"stats" | "commitment">("stats");
  const [hookStatIdx, setHookStatIdx] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [pendingGreeting, setPendingGreeting] = useState<string | null>(null);
  const [hookDismissed, setHookDismissed] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const initDone = useRef(false);
  const pendingMsg = useRef<string | null>(null);
  const studentIdRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ticker
  useEffect(() => {
    if (!hookVisible) return;
    const t = setInterval(() => setTickerIdx(i => (i + 1) % SOCIAL_PROOF.length), 4000);
    return () => clearInterval(t);
  }, [hookVisible]);

  // Hook stat cycle
  useEffect(() => {
    if (!hookVisible || hookScreen !== "stats") return;
    const t = setInterval(() => setHookStatIdx(i => (i + 1) % HOOK_STATS.length), 5000);
    return () => clearInterval(t);
  }, [hookVisible, hookScreen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const existingId = localStorage.getItem(STORAGE_KEY);

    // Show hook only for brand-new users
    if (!existingId) setHookVisible(true);

    (async () => {
      const body = existingId ? { student_id: existingId } : {};
      try {
        const res = await fetch(`${CC_API}/session/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const sd = await res.json();
        setStudentId(sd.student_id);
        studentIdRef.current = sd.student_id;
        localStorage.setItem(STORAGE_KEY, sd.student_id);

        if (sd.returning && sd.history?.length > 0) {
          setReturning(true);
          setHookVisible(false);
          const history: Msg[] = sd.history.map((m: any) => ({
            role: m.role === "assistant" ? "agent" : m.role,
            content: m.content,
            state: m.state,
          }));
          setMessages(history);
          const lastState = [...sd.history].reverse().find((m: any) => m.state)?.state;
          if (lastState) setAgentState(lastState);
          setSessionReady(true);
          return;
        }

        // New user — fetch greeting in background
        const gRes = await fetch(`${CC_API}/chat/greeting?student_id=${sd.student_id}&conversation_id=${sd.conversation_id}`);
        const gd = await gRes.json();
        const msg = gd.reply || gd.message || "Hey, what are you working through right now?";
        setPendingGreeting(msg);
        if (gd.orchestration?.current_state) setAgentState(gd.orchestration.current_state);
        setSessionReady(true);

        // If hook already dismissed (shouldn't happen for new user but guard it)
        if (hookDismissed) {
          setMessages([{ role: "agent", content: msg, state: "GREETING" }]);
          setPendingGreeting(null);
        }
      } catch {
        setPendingGreeting("Hey, what are you working through right now?");
        setSessionReady(true);
      }
    })();
  }, []);

  function dismissHook(level: string) {
    localStorage.setItem("studojo_commitment", level);
    setHookVisible(false);
    setHookDismissed(true);
    if (pendingGreeting) {
      setMessages([{ role: "agent", content: pendingGreeting, state: "GREETING" }]);
      setPendingGreeting(null);
    } else if (sessionReady) {
      // greeting not yet fetched, it will set messages when ready
    }
  }

  // When greeting arrives after hook dismissal
  useEffect(() => {
    if (hookDismissed && pendingGreeting && sessionReady) {
      setMessages([{ role: "agent", content: pendingGreeting, state: "GREETING" }]);
      setPendingGreeting(null);
    }
  }, [hookDismissed, pendingGreeting, sessionReady]);

  async function doSend(sid: string, content: string) {
    setMessages(prev => [...prev, { role: "user", content }]);
    setWaiting(true);
    try {
      const res = await fetch(`${CC_API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: sid, message: content }),
      });
      const data = await res.json();
      const newState = data.orchestration?.current_state || agentState;
      setAgentState(newState);
      setMessages(prev => [...prev, { role: "agent", content: data.reply, state: newState }]);
    } catch {
      setMessages(prev => [...prev, { role: "agent", content: "Something went wrong, try again.", state: agentState }]);
    }
    setWaiting(false);
  }

  function sendMsg() {
    const content = input.trim();
    if (!content || waiting) return;
    setInput("");
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
    const sid = studentIdRef.current || studentId;
    if (!sessionReady || !sid) {
      pendingMsg.current = content;
      setMessages(prev => [...prev, { role: "user", content }]);
      return;
    }
    doSend(sid, content);
  }

  const showDnaCta = messages.length > 0 && DNA_STATES.has(agentState) && studentId;
  const showDashCta = messages.length > 0 && DASH_STATES.has(agentState) && studentId;
  const stat = HOOK_STATS[hookStatIdx];

  return (
    <div style={{ height: "100dvh" }} className="flex flex-col bg-neutral-50 overflow-hidden relative">

      {/* Hook overlay */}
      {hookVisible && (
        <div className="absolute inset-0 z-50 flex flex-col bg-neutral-950 text-white">
          {hookScreen === "stats" ? (
            <div className="flex flex-col h-full px-6 pt-10 pb-6">
              <div className="font-['Clash_Display'] text-xl font-bold text-white mb-8">CareerDojo</div>
              <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                <p className="text-neutral-400 text-sm mb-2">{stat.main}</p>
                <p className="text-white text-xl font-bold leading-snug mb-3">{stat.emphasis}</p>
                <p className="text-violet-400 text-sm font-semibold mb-8">{stat.hook}</p>
                {/* dots */}
                <div className="flex gap-2 mb-10">
                  {HOOK_STATS.map((_, i) => (
                    <button key={i} onClick={() => setHookStatIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === hookStatIdx ? "bg-violet-400 w-5" : "bg-neutral-600"}`} />
                  ))}
                </div>
                {/* social proof */}
                <div className="text-xs text-neutral-400 mb-8 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  {SOCIAL_PROOF[tickerIdx]}
                </div>
                <button
                  onClick={() => setHookScreen("commitment")}
                  className="w-full bg-violet-500 text-white font-bold py-4 rounded-2xl border-2 border-violet-400 hover:bg-violet-400 transition-colors"
                >
                  See where I stand
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full px-6 pt-10 pb-6">
              <div className="font-['Clash_Display'] text-xl font-bold text-white mb-8">One quick question</div>
              <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                <p className="text-white text-xl font-bold mb-2">Where are you right now?</p>
                <p className="text-neutral-400 text-sm mb-10">This helps me give you the right guidance from the first message.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => dismissHook("active")} className="text-left px-5 py-4 bg-neutral-900 border-2 border-neutral-700 rounded-2xl hover:border-violet-500 transition-colors">
                    <div className="font-bold text-white text-sm">Actively searching</div>
                    <div className="text-neutral-400 text-xs mt-1">Applying or about to start applying soon</div>
                  </button>
                  <button onClick={() => dismissHook("exploring")} className="text-left px-5 py-4 bg-neutral-900 border-2 border-neutral-700 rounded-2xl hover:border-violet-500 transition-colors">
                    <div className="font-bold text-white text-sm">Exploring options</div>
                    <div className="text-neutral-400 text-xs mt-1">Figuring out what direction makes sense</div>
                  </button>
                  <button onClick={() => dismissHook("stuck")} className="text-left px-5 py-4 bg-neutral-900 border-2 border-neutral-700 rounded-2xl hover:border-violet-500 transition-colors">
                    <div className="font-bold text-white text-sm">Applying but not getting replies</div>
                    <div className="text-neutral-400 text-xs mt-1">Have tried job boards, need a different approach</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100 flex-shrink-0">
        <Link to="/cc" className="font-['Clash_Display'] font-bold text-neutral-900 text-lg">CareerDojo</Link>
        {studentId && (showDnaCta || showDashCta) && (
          <Link to={`/cc/analysis?id=${studentId}`} className="text-xs font-bold text-violet-600 border border-violet-300 rounded-xl px-3 py-1 hover:bg-violet-50 transition-colors">
            View Analysis
          </Link>
        )}
      </div>

      <div className="flex-shrink-0"><StepBar state={agentState} /></div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {returning && messages.length > 0 && (
            <div className="text-center text-xs text-neutral-400 mb-5 py-2 border-y border-neutral-100">Continuing your session</div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 mb-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "agent" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">S</div>
              )}
              <div className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-violet-500 text-white rounded-br-sm" : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm shadow-sm"}`}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Session loading dots (before first message) */}
          {!sessionReady && messages.length === 0 && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
              <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 h-4 items-center">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {waiting && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
              <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 h-4 items-center">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}

          {/* CTAs */}
          {showDnaCta && (
            <div className="ml-11 mb-4">
              <Link to={`/cc/analysis?id=${studentId}`} className="inline-flex items-center gap-2 bg-white border-2 border-neutral-900 rounded-2xl px-4 py-3 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all">
                <span>View your Career Analysis</span><span className="text-violet-500">→</span>
              </Link>
            </div>
          )}
          {showDashCta && (
            <div className="ml-11 mb-4">
              <Link to={`/cc/analysis?id=${studentId}`} className="inline-flex items-center gap-2 bg-violet-500 text-white border-2 border-neutral-900 rounded-2xl px-4 py-3 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all">
                <span>View your Dashboard</span><span>→</span>
              </Link>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-neutral-200 bg-white px-4 py-3">
        <div className="flex gap-3 items-end max-w-2xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none border-2 border-neutral-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors bg-neutral-50"
          />
          <button
            onClick={sendMsg}
            disabled={waiting || !input.trim()}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md disabled:opacity-40 hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
