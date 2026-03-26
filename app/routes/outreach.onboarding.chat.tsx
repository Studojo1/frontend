import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiSend, FiCheck } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { ChatInterface } from "~/components/outreach/ChatInterface";
import { MCQSelector } from "~/components/outreach/MCQSelector";
import { PsychometricResult } from "~/components/outreach/PsychometricResult";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch, outreachStreamFetch } from "~/lib/outreach/api";
import type { ChatMessage, AgentResponse, PsychometricResult as PsychometricData } from "~/lib/outreach/types";

const STEPS = ["Upload Resume", "AI Chat", "Your Profile"];
const TOTAL_QUESTIONS = 13;

/**
 * Q1 is served client-side immediately — zero network latency.
 * Options must match question_engine.py _Q1_CAREER_STAGE exactly.
 */
const Q1_STATIC: AgentResponse = {
  message: "Let's map out your career goals! Which of these best describes where you are right now?",
  current_state: "MCQ",
  mcq: {
    question: "Which best describes you right now?",
    options: [
      { label: "A", text: "Student, not graduating soon" },
      { label: "B", text: "Student, graduating within 6 months" },
      { label: "C", text: "Recent graduate (0-2 years exp.)" },
      { label: "D", text: "Experienced professional (3+ years)" },
      { label: "E", text: "Switching careers / exploring new fields" },
      { label: "F", text: "Other" },
    ],
    allow_multiple: false,
  },
  text_input: false,
  is_complete: false,
  questions_asked_so_far: 1,
};

/**
 * Partial message extraction — NO closing quote so it captures progressive
 * text as the LLM streams the "message" JSON field token by token.
 */
const PARTIAL_MSG_RE = /"message"\s*:\s*"((?:[^"\\]|\\.)*)/;

/**
 * Fallback completion handler — auto-polls profile-status and redirects.
 * Shows a button escape hatch if polling takes too long.
 */
function CompletionRedirect({ candidateId, onReady }: { candidateId: number; onReady: () => void }) {
  const [polling, setPolling] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        for (let i = 0; i < 45; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const status = await outreachFetch<{ ready: boolean }>(
            `/candidate/${candidateId}/profile-status`
          );
          if (status.ready) {
            onReady();
            return;
          }
        }
      } catch {}
      setPolling(false);
    })();
  }, [candidateId, onReady]);

  return (
    <div className="text-center p-4 space-y-3">
      {polling ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-studojo-green font-semibold font-satoshi">
            Generating your profile...
          </p>
        </div>
      ) : (
        <p className="text-sm text-studojo-muted font-satoshi">
          Taking longer than expected.
        </p>
      )}
      <button
        onClick={onReady}
        className="h-9 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Continue to Profile
      </button>
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { candidateId, chatHistory, addChatMessage, setCurrentStep } = useOutreachStore();
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(null);
  const [textInput, setTextInput] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [psychResult, setPsychResult] = useState<PsychometricData | null>(null);
  const [profileGenerating, setProfileGenerating] = useState(false);
  const autoStarted = useRef(false);
  // Pre-fetch: set to true once profile-status returns ready
  const profileReady = useRef(false);
  const prefetchStarted = useRef(false);

  // Serve Q1 instantly on mount — no API call
  useEffect(() => {
    if (candidateId && !autoStarted.current && chatHistory.length === 0) {
      autoStarted.current = true;
      addChatMessage({ role: "assistant", content: Q1_STATIC.message });
      setCurrentResponse(Q1_STATIC);
    }
  }, [candidateId]);

  const questionsAsked = currentResponse?.questions_asked_so_far ?? 0;
  const quizProgress = (questionsAsked / TOTAL_QUESTIONS) * 100;
  const sidebarStep = (psychResult || currentResponse?.is_complete) ? 3 : 2;

  const sendMessage = async (content: string) => {
    if (!candidateId) return;

    const userMsg: ChatMessage = { role: "user", content };
    addChatMessage(userMsg);
    setLoading(true);
    setStreamingText(null);

    const fullHistory = [...chatHistory, userMsg];

    try {
      const res = await outreachStreamFetch(`/candidate/${candidateId}/chat/stream`, {
        method: "POST",
        body: JSON.stringify({
          message: content,
          chat_history: fullHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Stream failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let accumulated = "";
      let finalResponse: AgentResponse | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let evt: any;
          try { evt = JSON.parse(raw); } catch { continue; }

          if (evt.type === "chunk" && typeof evt.text === "string") {
            accumulated += evt.text;
            const match = PARTIAL_MSG_RE.exec(accumulated);
            setStreamingText(match ? match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "");
          } else if (evt.type === "complete") {
            finalResponse = {
              message: evt.message ?? "",
              current_state: evt.current_state ?? "MCQ",
              mcq: evt.mcq ?? null,
              text_input: evt.text_input ?? false,
              is_complete: evt.is_complete ?? false,
              questions_asked_so_far: evt.questions_asked_so_far ?? 0,
              psychometric: evt.psychometric ?? null,
            } as AgentResponse;
          } else if (evt.type === "error") {
            throw new Error(evt.message ?? "Stream error");
          }
        }
      }

      setStreamingText(null);

      if (finalResponse) {
        addChatMessage({ role: "assistant", content: finalResponse.message });
        setCurrentResponse(finalResponse);

        if (finalResponse.is_complete) {
          const historyForPayload = [
            ...fullHistory,
            { role: "assistant" as const, content: finalResponse.message },
          ];

          // Start payload generation in background immediately
          outreachFetch(`/candidate/${candidateId}/generate-payload`, {
            method: "POST",
            body: JSON.stringify({
              message: "__generate__",
              chat_history: historyForPayload.map((m) => ({ role: m.role, content: m.content })),
            }),
          }).catch(() => {});

          if (finalResponse.psychometric) {
            // Show psychometric results card — user clicks Continue
            setPsychResult(finalResponse.psychometric);
            setLoading(false);

            // Pre-fetch: start polling profile-status in the background
            // so it's ready (or nearly ready) by the time user clicks Continue
            if (!prefetchStarted.current && candidateId) {
              prefetchStarted.current = true;
              (async () => {
                try {
                  for (let i = 0; i < 45; i++) {
                    await new Promise((r) => setTimeout(r, 2000));
                    const status = await outreachFetch<{ ready: boolean }>(
                      `/candidate/${candidateId}/profile-status`
                    );
                    if (status.ready) {
                      profileReady.current = true;
                      break;
                    }
                  }
                } catch {}
              })();
            }
          } else {
            // No psychometric data — auto-poll and redirect
            setLoading(true);
            try {
              for (let i = 0; i < 45; i++) {
                await new Promise((r) => setTimeout(r, 2000));
                const status = await outreachFetch<{ ready: boolean }>(
                  `/candidate/${candidateId}/profile-status`
                );
                if (status.ready) break;
              }
              setCurrentStep(3);
              navigate("/outreach/onboarding/profile");
            } catch {
              addChatMessage({ role: "assistant", content: "Profile generation failed. Please try again." });
              setLoading(false);
            }
          }
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setStreamingText(null);
      addChatMessage({ role: "assistant", content: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  const handleMCQSubmit = (selected: string[]) => {
    sendMessage(selected.join(", "));
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      sendMessage(textInput.trim());
      setTextInput("");
    }
  };

  const handleContinueAfterPsych = async () => {
    if (!candidateId) return;

    // If pre-fetch already confirmed the profile is ready, navigate immediately
    if (profileReady.current) {
      setCurrentStep(3);
      navigate("/outreach/onboarding/profile");
      return;
    }

    setProfileGenerating(true);
    try {
      // Poll until profile ready (payload gen already started in background)
      for (let i = 0; i < 45; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const status = await outreachFetch<{ ready: boolean }>(
          `/candidate/${candidateId}/profile-status`
        );
        if (status.ready || profileReady.current) break;
      }
      setCurrentStep(3);
      navigate("/outreach/onboarding/profile");
    } catch {
      setProfileGenerating(false);
    }
  };

  if (!candidateId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 text-center">
          <p className="text-base text-studojo-muted mt-8 font-satoshi">Please upload your resume first.</p>
          <button
            onClick={() => navigate("/outreach/onboarding/upload")}
            className="mt-6 h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  // Input area for chat — hidden while streaming or when psychResult is shown as full panel
  const inputArea = streamingText !== null ? null
    : currentResponse?.is_complete ? (
      <CompletionRedirect candidateId={candidateId!} onReady={() => { setCurrentStep(3); navigate("/outreach/onboarding/profile"); }} />
    ) : currentResponse?.mcq ? (
      <MCQSelector
        question={currentResponse.mcq.question}
        options={currentResponse.mcq.options}
        allowMultiple={currentResponse.mcq.allow_multiple}
        onSubmit={handleMCQSubmit}
        loading={loading}
      />
    ) : (currentResponse?.text_input || (!currentResponse?.mcq && currentResponse !== null && !loading)) ? (
      <div className="flex gap-2">
        <input
          value={textInput}
          onChange={(e: any) => setTextInput(e.target.value)}
          placeholder="Type your answer..."
          onKeyDown={(e: any) => e.key === "Enter" && handleTextSubmit()}
          className="flex-1 h-10 px-4 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
        />
        <button
          onClick={handleTextSubmit}
          disabled={!textInput.trim() || loading}
          className="h-10 w-10 rounded-xl bg-studojo-purple text-white flex items-center justify-center border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </div>
    ) : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar — vertical progress timeline */}
        <aside className="hidden md:flex flex-col w-52 border-r border-studojo-ink/10 bg-studojo-surface-muted/30 pl-6 pr-4 pt-10 flex-shrink-0">
          {STEPS.map((step, i) => {
            const num = i + 1;
            const done = num < sidebarStep;
            const active = num === sidebarStep;
            const isLast = i === STEPS.length - 1;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                      done
                        ? "bg-studojo-green text-white border-studojo-green"
                        : active
                        ? "bg-studojo-purple text-white border-studojo-purple"
                        : "bg-white text-studojo-muted border-studojo-ink/15"
                    }`}
                  >
                    {done ? <FiCheck className="w-4 h-4" /> : num}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-10 ${done ? "bg-studojo-green" : "bg-studojo-ink/10"}`} />
                  )}
                </div>
                <div className="pt-1.5">
                  <p
                    className={`text-sm font-satoshi leading-tight ${
                      active
                        ? "text-studojo-ink font-semibold"
                        : done
                        ? "text-studojo-green font-medium"
                        : "text-studojo-muted"
                    }`}
                  >
                    {step}
                  </p>
                  {active && num === 2 && questionsAsked > 0 && (
                    <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
                      Question {questionsAsked} of {TOTAL_QUESTIONS}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {psychResult ? (
            /* Full-panel psychometric result — replaces the chat view */
            <div className="flex-1 overflow-y-auto">
              <PsychometricResult
                data={psychResult}
                onContinue={handleContinueAfterPsych}
                loading={profileGenerating}
              />
            </div>
          ) : (
            /* Chat view */
            <>
              {/* Mobile: compact progress dots + question count */}
              <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-1 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i + 1 < sidebarStep
                          ? "bg-studojo-green"
                          : i + 1 === sidebarStep
                          ? "bg-studojo-purple"
                          : "bg-studojo-ink/15"
                      }`}
                    />
                  ))}
                </div>
                {questionsAsked > 0 && (
                  <span className="text-xs font-satoshi text-studojo-muted">
                    {questionsAsked}/{TOTAL_QUESTIONS}
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="flex-shrink-0 px-6 pt-6 md:pt-8 pb-2">
                <h1 className="font-clash text-xl md:text-2xl font-bold text-studojo-ink">
                  Career Intelligence Chat
                </h1>
                <p className="text-sm text-studojo-muted font-satoshi mt-1">
                  Our AI will ask you a few questions to understand your career goals.
                </p>
              </div>

              {/* Chat container */}
              <div className="flex-1 overflow-hidden px-4 md:px-6 pb-4">
                <ChatInterface
                  messages={chatHistory}
                  loading={loading}
                  streamingText={streamingText}
                  quizProgress={quizProgress}
                >
                  {inputArea}
                </ChatInterface>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
