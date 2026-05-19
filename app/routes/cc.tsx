import { useState, useRef, useEffect, useCallback } from "react";
import { redirect, useNavigate } from "react-router";
import { FiSend, FiLoader, FiUser, FiBarChart2, FiTarget, FiZap, FiArrowRight } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/cc";

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/cc");
  return { user: session.user };
}

export function meta() {
  return [
    { title: "Career Coach | Studojo" },
    {
      name: "description",
      content:
        "Get a personalised career plan from Studojo's AI career coach. Built for Indian students — specific advice, real strategies, zero fluff.",
    },
  ];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  state?: string;
}

interface DNAData {
  primary_role?: string;
  target_industry?: string;
  clarity_score?: number;
  readiness_score?: number;
  skills_you_have?: string[];
  skills_to_build?: string[];
  one_line_summary?: string;
  alternative_roles?: string[];
  recommended_next_step?: string;
}

interface Orchestration {
  current_state?: string;
  profile_completion?: number;
  show_progress_bar?: boolean;
  show_dna_card?: boolean;
  show_dashboard?: boolean;
  dna_generated?: boolean;
  enable_skip_profiling?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid() {
  return Math.random().toString(36).slice(2);
}

const STATE_LABELS: Record<string, string> = {
  GREETING: "Just started",
  PROFILING: "Getting to know you",
  CAREER_ANALYSIS: "Analysing your profile",
  DNA_REVIEW: "Reviewing Career DNA",
  DNA_CORRECTION: "Refining DNA",
  ROADMAP: "Building your roadmap",
  ONGOING_SUPPORT: "Ongoing coaching",
  NEW_PATH_EXPLORATION: "Exploring new path",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 font-['Clash_Display'] text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
        CC
      </div>
      <div className="rounded-2xl rounded-bl-sm border-2 border-neutral-900 bg-violet-50 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 animate-bounce rounded-full bg-violet-400"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentBubble({ content }: { content: string }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 font-['Clash_Display'] text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
        CC
      </div>
      <div className="max-w-[78%] rounded-2xl rounded-bl-sm border-2 border-neutral-900 bg-violet-50 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
        <p className="font-['Satoshi'] text-[0.9375rem] leading-relaxed text-neutral-800 whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-br-sm border-2 border-neutral-900 bg-violet-500 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
        <p className="font-['Satoshi'] text-[0.9375rem] leading-relaxed text-white whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}

function DNACard({ dna }: { dna: DNAData }) {
  return (
    <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-100">
          <FiZap className="h-3.5 w-3.5 text-violet-600" />
        </div>
        <span className="font-['Clash_Display'] text-xs font-bold uppercase tracking-widest text-neutral-500">
          Your Career DNA
        </span>
      </div>

      {dna.one_line_summary && (
        <p className="mb-4 font-['Satoshi'] text-sm leading-5 text-neutral-700 italic">
          "{dna.one_line_summary}"
        </p>
      )}

      <div className="mb-4 flex items-baseline gap-2">
        <span className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
          {dna.primary_role}
        </span>
        {dna.target_industry && (
          <span className="font-['Satoshi'] text-xs text-neutral-500">
            · {dna.target_industry}
          </span>
        )}
      </div>

      {dna.clarity_score != null && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between">
            <span className="font-['Satoshi'] text-xs text-neutral-500">Clarity</span>
            <span className="font-['Satoshi'] text-xs font-semibold text-violet-600">
              {dna.clarity_score}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full border border-neutral-900 bg-neutral-100">
            <div
              className="h-full bg-violet-500 transition-all duration-700"
              style={{ width: `${dna.clarity_score}%` }}
            />
          </div>
        </div>
      )}

      {dna.skills_to_build && dna.skills_to_build.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 font-['Satoshi'] text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Top gaps to close
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dna.skills_to_build.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-full border border-neutral-900 bg-amber-50 px-2.5 py-0.5 font-['Satoshi'] text-xs font-medium text-neutral-800"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {dna.recommended_next_step === "resume_maker" && (
        <a
          href="/resume-maker"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-500 py-2.5 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
        >
          Build your resume <FiArrowRight className="h-4 w-4" />
        </a>
      )}
      {dna.recommended_next_step === "outreach_dojo" && (
        <a
          href="/outreach"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 bg-emerald-400 py-2.5 font-['Satoshi'] text-sm font-semibold text-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
        >
          Start outreach <FiArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function ProfilePanel({
  orchestration,
  dna,
}: {
  orchestration: Orchestration | null;
  dna: DNAData | null;
}) {
  const completion = orchestration?.profile_completion ?? 0;
  const stateName = orchestration?.current_state
    ? STATE_LABELS[orchestration.current_state] ?? orchestration.current_state
    : "Starting up";

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="font-['Satoshi'] text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          {stateName}
        </span>
      </div>

      {/* Profile progress */}
      {orchestration?.show_progress_bar && (
        <div className="rounded-2xl border-2 border-neutral-900 bg-white p-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-['Satoshi'] text-xs font-semibold text-neutral-700">
              Profile completeness
            </span>
            <span className="font-['Clash_Display'] text-sm font-bold text-violet-600">
              {completion}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-neutral-900 bg-neutral-100">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-2 font-['Satoshi'] text-[0.7rem] text-neutral-400">
            The more context I have, the better your Career DNA.
          </p>
        </div>
      )}

      {/* DNA card */}
      {orchestration?.show_dna_card && dna && <DNACard dna={dna} />}

      {/* Placeholder when nothing to show yet */}
      {!orchestration?.show_progress_bar && !orchestration?.show_dna_card && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center opacity-40">
          <FiBarChart2 className="h-8 w-8 text-neutral-400" />
          <p className="font-['Satoshi'] text-sm text-neutral-500">
            Your Career DNA will appear here once we've had a chance to chat.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CareerCoach({ loaderData }: Route.ComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [orchestration, setOrchestration] = useState<Orchestration | null>(null);
  const [dna, setDna] = useState<DNAData | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Start session + fetch greeting on mount
  useEffect(() => {
    (async () => {
      try {
        // 1. Create session
        const sessRes = await fetch("/api/cc/session", { method: "POST" });
        const sessData = await sessRes.json();
        const sid = sessData.student_id;
        setStudentId(sid);

        // 2. Fetch greeting
        const greetRes = await fetch(
          `/api/v1/cc/chat/greeting?student_id=${sid}&conversation_id=${sessData.conversation_id}`
        );
        const greetData = await greetRes.json();

        setMessages([
          {
            id: uid(),
            role: "assistant",
            content: greetData.message,
            state: greetData.new_state,
          },
        ]);
        setSessionReady(true);
      } catch {
        setMessages([
          {
            id: uid(),
            role: "assistant",
            content:
              "Hey! I'm having a quick hiccup starting up — refresh the page and I'll be ready.",
          },
        ]);
      }
    })();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !studentId) return;

    setInput("");
    const userMsg: Message = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/cc/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, message: text }),
      });

      // Handle SSE stream
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        const assistantId = uid();

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "" },
        ]);
        setLoading(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = JSON.parse(line.slice(6));
            if (payload.chunk) {
              assistantContent += payload.chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
            if (payload.done) {
              if (payload.orchestration) setOrchestration(payload.orchestration);
              if (payload.dna_data) setDna(payload.dna_data);
            }
          }
        }
      } else {
        // Non-streaming fallback
        const data = await res.json();
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "assistant", content: data.reply },
        ]);
        if (data.orchestration) setOrchestration(data.orchestration);
        if (data.dna_data) setDna(data.dna_data);
      }
    } catch {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "Something went wrong on my end — give it another try.",
        },
      ]);
    }
  }, [input, loading, studentId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header />

      <main className="flex flex-1 overflow-hidden border-t-2 border-neutral-900">
        {/* Chat column */}
        <div className="flex flex-1 flex-col border-r-2 border-neutral-900">
          {/* Topbar */}
          <div className="flex items-center justify-between border-b-2 border-neutral-900 bg-white px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 font-['Clash_Display'] text-xs font-bold text-white">
                CC
              </div>
              <div>
                <p className="font-['Clash_Display'] text-sm font-bold text-neutral-900">
                  Career Coach
                </p>
                <p className="font-['Satoshi'] text-[0.7rem] text-neutral-500">
                  Powered by Studojo AI
                </p>
              </div>
            </div>
            {orchestration?.current_state && (
              <span className="rounded-full border-2 border-neutral-900 bg-violet-50 px-3 py-1 font-['Satoshi'] text-[0.7rem] font-semibold text-violet-700 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
                {STATE_LABELS[orchestration.current_state] ??
                  orchestration.current_state}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
            {!sessionReady && messages.length === 0 && (
              <TypingIndicator />
            )}
            {messages.map((m) =>
              m.role === "assistant" ? (
                <AgentBubble key={m.id} content={m.content} />
              ) : (
                <UserBubble key={m.id} content={m.content} />
              )
            )}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t-2 border-neutral-900 bg-white px-4 py-4">
            <div className="flex items-end gap-3 rounded-2xl border-2 border-neutral-900 bg-neutral-50 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] focus-within:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] focus-within:translate-x-0.5 focus-within:translate-y-0.5 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  sessionReady ? "Type your reply…" : "Starting session…"
                }
                disabled={!sessionReady || loading}
                className="flex-1 resize-none bg-transparent font-['Satoshi'] text-[0.9375rem] text-neutral-900 placeholder-neutral-400 outline-none disabled:opacity-50"
                style={{ minHeight: "24px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading || !sessionReady}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-neutral-900 bg-violet-500 text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                {loading ? (
                  <FiLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <FiSend className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center font-['Satoshi'] text-[0.65rem] text-neutral-400">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Profile panel — hidden on mobile */}
        <aside className="hidden w-80 shrink-0 bg-neutral-50 lg:block xl:w-96">
          <ProfilePanel orchestration={orchestration} dna={dna} />
        </aside>
      </main>

      <Footer />
    </div>
  );
}
