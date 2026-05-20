import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "~/components/common/header";

const CC_API = "/api/v1/cc";

type Msg = { role: "user" | "assistant"; text: string };

export function meta() {
  return [
    { title: "CareerDojo Chat | studojo" },
    { name: "description", content: "Talk to your AI career coach." },
  ];
}

export default function CcChatPage() {
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(true);
  const [showDnaCta, setShowDnaCta] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didInit = useRef(false);

  const push = (role: Msg["role"], text: string) =>
    setMsgs((prev) => [...prev, { role, text }]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      try {
        const saved =
          typeof window !== "undefined"
            ? localStorage.getItem("studojo_cc_student_id")
            : null;

        let sid: string;
        let cid: string;

        if (saved) {
          sid = saved;
          const r = await fetch(`${CC_API}/session/new-thread`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: saved }),
          });
          const d = await r.json();
          cid = d.conversation_id;
        } else {
          const r = await fetch(`${CC_API}/session/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const d = await r.json();
          sid = d.student_id;
          cid = d.conversation_id;
          localStorage.setItem("studojo_cc_student_id", sid);
        }

        setStudentId(sid);

        const gr = await fetch(
          `${CC_API}/chat/greeting?student_id=${sid}&conversation_id=${cid}`
        );
        const gd = await gr.json();
        push("assistant", gd.message || gd.text || "Hi! What role are you going after?");
      } catch {
        push("assistant", "Something went wrong. Please refresh and try again.");
      } finally {
        setBusy(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    })();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || !studentId || busy) return;
    setInput("");
    push("user", text);
    setBusy(true);

    try {
      const r = await fetch(`${CC_API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, message: text }),
      });
      const d = await r.json();
      if (d.message) push("assistant", d.message);

      const dnaStates = ["CAREER_ANALYSIS", "DNA_REVIEW", "ROADMAP", "ONGOING_SUPPORT"];
      if (
        d.orchestration?.show_analysis_cta ||
        dnaStates.includes(d.state)
      ) {
        setShowDnaCta(true);
      }
    } catch {
      push("assistant", "Sorry, something went wrong. Please try again.");
    } finally {
      setBusy(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Header />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b-2 border-neutral-900 bg-purple-50 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
              CD
            </div>
            <div>
              <p className="font-['Satoshi'] text-sm font-bold text-neutral-900">
                CareerDojo
              </p>
              <p className="font-['Satoshi'] text-xs text-neutral-500">AI Career Coach</p>
            </div>
          </div>

          {showDnaCta && studentId && (
            <Link
              to={`/cc/analysis?id=${studentId}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-2xl border-2 border-neutral-900 bg-violet-500 px-4 font-['Satoshi'] text-xs font-semibold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
            >
              View Career DNA
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-2xl space-y-4">
            {msgs.length === 0 && busy && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-xs font-bold text-white">
                  CD
                </div>
                <div className="rounded-2xl rounded-tl-none border-2 border-neutral-900 bg-white px-4 py-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 animate-bounce rounded-full bg-neutral-300"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-xs font-bold text-white">
                    CD
                  </div>
                )}
                <div
                  className={`max-w-[78%] whitespace-pre-wrap font-['Satoshi'] text-sm leading-6 ${
                    m.role === "user"
                      ? "rounded-2xl rounded-tr-none border-2 border-neutral-900 bg-neutral-900 px-4 py-3 text-white"
                      : "rounded-2xl rounded-tl-none border-2 border-neutral-900 bg-white px-4 py-3 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {busy && msgs.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-xs font-bold text-white">
                  CD
                </div>
                <div className="rounded-2xl rounded-tl-none border-2 border-neutral-900 bg-white px-4 py-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 animate-bounce rounded-full bg-neutral-300"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t-2 border-neutral-900 bg-white px-4 py-4 md:px-8">
          <div className="mx-auto flex max-w-2xl items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={autoResize}
              onKeyDown={onKey}
              placeholder="Type your message… (Enter to send)"
              rows={1}
              disabled={busy}
              className="flex-1 resize-none overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:border-violet-500 disabled:opacity-60"
              style={{ minHeight: "48px" }}
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || busy || !studentId}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:cursor-not-allowed disabled:opacity-40 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center font-['Satoshi'] text-xs text-neutral-400">
            Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
