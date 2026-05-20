import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "CareerDojo Chat | Studojo" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_cc_student_id";

type Message = { role: "user" | "agent"; content: string; state?: string };

const STATE_STEPS: Record<string, number> = {
  GREETING: 1,
  PROFILING: 1,
  CAREER_ANALYSIS: 2,
  DNA_REVIEW: 2,
  ROADMAP: 3,
  ONGOING_SUPPORT: 4,
};

function StepBar({ state }: { state: string }) {
  const step = STATE_STEPS[state] || 1;
  const steps = ["AI Chat", "Career Analysis", "Recommendations", "Dashboard"];
  return (
    <div className="flex items-center justify-center gap-2 py-3 text-xs font-semibold border-b border-neutral-100 bg-white flex-wrap">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${active ? "bg-violet-500 border-violet-500 text-white" : done ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-300 text-neutral-400"}`}>
              {n}
            </div>
            <span className={active ? "text-violet-600" : done ? "text-neutral-700" : "text-neutral-400"}>{label}</span>
            {i < steps.length - 1 && <div className={`w-6 h-px ${done ? "bg-neutral-900" : "bg-neutral-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function CcChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [state, setState] = useState("GREETING");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initDone = useRef(false);
  // Queue messages typed before session is ready
  const pendingMsg = useRef<string | null>(null);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    (async () => {
      const existingId = localStorage.getItem(STORAGE_KEY);
      const body = existingId ? { student_id: existingId } : {};
      try {
        const res = await fetch(`${CC_API}/session/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const sd = await res.json();
        setStudentId(sd.student_id);
        localStorage.setItem(STORAGE_KEY, sd.student_id);

        if (sd.returning && sd.history?.length > 0) {
          setReturning(true);
          const history: Message[] = sd.history.map((m: any) => ({
            role: m.role === "assistant" ? "agent" : m.role,
            content: m.content,
            state: m.state,
          }));
          setMessages(history);
          const lastState = [...sd.history].reverse().find((m: any) => m.state)?.state;
          if (lastState) setState(lastState);
          setSessionReady(true);
          return;
        }

        // New user — fetch greeting
        const gRes = await fetch(`${CC_API}/chat/greeting?student_id=${sd.student_id}&conversation_id=${sd.conversation_id}`);
        const gd = await gRes.json();
        setMessages([{ role: "agent", content: gd.reply || gd.message || "Hey — what are you working through?", state: "GREETING" }]);
        if (gd.orchestration?.current_state) setState(gd.orchestration.current_state);
        setSessionReady(true);

        // Send anything the user typed while loading
        if (pendingMsg.current) {
          const queued = pendingMsg.current;
          pendingMsg.current = null;
          await doSend(sd.student_id, queued);
        }
      } catch {
        setMessages([{ role: "agent", content: "Hey — what are you working through?", state: "GREETING" }]);
        setSessionReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  async function doSend(sid: string, content: string) {
    setMessages((prev) => [...prev, { role: "user", content }]);
    setWaiting(true);
    try {
      const res = await fetch(`${CC_API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: sid, message: content }),
      });
      const data = await res.json();
      const newState = data.orchestration?.current_state || state;
      setState(newState);
      setMessages((prev) => [...prev, { role: "agent", content: data.reply, state: newState }]);
    } catch {
      setMessages((prev) => [...prev, { role: "agent", content: "Something went wrong — try again.", state }]);
    }
    setWaiting(false);
  }

  function sendMsg() {
    const content = input.trim();
    if (!content || waiting) return;
    setInput("");
    if (!sessionReady || !studentId) {
      // Queue it — session still loading
      pendingMsg.current = content;
      setMessages((prev) => [...prev, { role: "user", content }]);
      return;
    }
    doSend(studentId, content);
  }

  const showAnalysisCta = ["CAREER_ANALYSIS", "DNA_REVIEW"].includes(state);
  const showDashboardCta = ["ROADMAP", "ONGOING_SUPPORT"].includes(state);

  return (
    <div style={{ height: "100dvh" }} className="flex flex-col bg-neutral-50 overflow-hidden">
      {/* Top nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100 flex-shrink-0">
        <Link to="/cc" className="font-['Clash_Display'] font-bold text-neutral-900 text-lg">CareerDojo</Link>
        {studentId && (showAnalysisCta || showDashboardCta) && (
          <Link to={`/cc/analysis?id=${studentId}`} className="text-xs font-bold text-violet-600 border border-violet-300 rounded-xl px-3 py-1 hover:bg-violet-50 transition-colors">
            View Analysis
          </Link>
        )}
      </div>

      <div className="flex-shrink-0"><StepBar state={state} /></div>

      {/* Messages — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto w-full">
        {returning && messages.length > 0 && (
          <div className="text-center text-xs text-neutral-400 mb-4">Continuing your session</div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 mb-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "agent" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">S</div>
            )}
            <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-violet-500 text-white rounded-br-sm" : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm shadow-sm"}`}>
              {m.content}
            </div>
          </div>
        ))}

        {messages.length > 0 && showAnalysisCta && studentId && (
          <div className="ml-11 mb-4">
            <Link to={`/cc/analysis?id=${studentId}`} className="inline-flex items-center gap-2 bg-white border-2 border-neutral-900 rounded-2xl px-4 py-3 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all">
              <span>View your Career Analysis</span><span className="text-violet-500">→</span>
            </Link>
          </div>
        )}
        {messages.length > 0 && showDashboardCta && studentId && (
          <div className="ml-11 mb-4">
            <Link to={`/cc/analysis?id=${studentId}`} className="inline-flex items-center gap-2 bg-violet-500 text-white border-2 border-neutral-900 rounded-2xl px-4 py-3 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all">
              <span>View your Dashboard</span><span>→</span>
            </Link>
          </div>
        )}

        {waiting && (
          <div className="flex gap-3 mb-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
            <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading state before session ready */}
        {!sessionReady && messages.length === 0 && (
          <div className="flex gap-3 mb-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
            <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input — always pinned to bottom */}
      <div className="flex-shrink-0 border-t border-neutral-200 bg-white px-4 py-3">
        <div className="flex gap-3 items-end max-w-2xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
            }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none border-2 border-neutral-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors bg-neutral-50"
          />
          <button
            onClick={sendMsg}
            disabled={waiting}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md disabled:opacity-40 hover:scale-105 transition-transform flex-shrink-0"
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
