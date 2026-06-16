import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { capturePostHog } from "~/lib/posthog";
import { FiSend, FiCheck } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { ChatInterface } from "~/components/outreach/ChatInterface";
import { MCQSelector } from "~/components/outreach/MCQSelector";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch, outreachStreamFetch } from "~/lib/outreach/api";
import type { ChatMessage, AgentResponse } from "~/lib/outreach/types";

const STEPS = ["Upload Resume", "AI Chat", "Your Profile"];

// Soft estimate of total questions for the progress bar. The new quiz is
// dynamic (8-10 questions depending on clarity score), so we estimate
// generously and display "Q n" when n exceeds the estimate.
const ESTIMATED_TOTAL = 10;


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

export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useOutreachAuth();
  const { candidateId, chatHistory, addChatMessage, clearChatHistory } = useOutreachStore();
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(null);
  const [textInput, setTextInput] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const autoStarted = useRef(false);

  // Always start fresh — clears any stale localStorage chatHistory
  useEffect(() => {
    if (candidateId && !autoStarted.current) {
      autoStarted.current = true;
      clearChatHistory();
      addChatMessage({ role: "assistant", content: Q1_STATIC.message });
      setCurrentResponse(Q1_STATIC);
      capturePostHog("quiz_started", { candidate_id: candidateId });
    }
  }, [candidateId]);

  const questionsAsked = currentResponse?.questions_asked_so_far ?? 0;
  // Cap progress at 100% if the user is past the estimate (rare but possible for high-clarity flows)
  const quizProgress = Math.min(100, (questionsAsked / ESTIMATED_TOTAL) * 100);
  const sidebarStep = currentResponse?.is_complete ? 3 : 2;

  const sendMessage = async (content: string, answerType: string = "text") => {
    if (!candidateId) return;

    const userMsg: ChatMessage = { role: "user", content };
    addChatMessage(userMsg);
    // Track how far each student gets through the quiz (drop-off per question).
    capturePostHog("quiz_question_answered", { question_number: questionsAsked + 1, answer_type: answerType, candidate_id: candidateId });
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
              input_placeholder: evt.input_placeholder ?? null,
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
        if (finalResponse.is_complete) {
          addChatMessage({ role: "assistant", content: finalResponse.message });
          setCurrentResponse(finalResponse);

          const historyForPayload = [
            ...fullHistory,
            { role: "assistant" as const, content: finalResponse.message },
          ];

          outreachFetch(`/candidate/${candidateId}/generate-payload`, {
            method: "POST",
            body: JSON.stringify({
              message: "__generate__",
              chat_history: historyForPayload.map((m) => ({ role: m.role, content: m.content })),
            }),
          }).catch(() => {});

          capturePostHog("profile_quiz_completed", {
            candidate_id: candidateId,
            questions_asked: questionsAsked,
          });

          if (user?.id) {
            // New efficient flow: completing the outreach onboarding means the
            // student used the outreach tool. Starts the high-intent push
            // sequence and cancels any pending not-used nudge chain. This runs
            // in the browser, so it goes through the server resource route which
            // holds the internal secret (the emailer endpoint is gated).
            import("~/lib/events").then(({ publishEmailEventFromClient }) => {
              publishEmailEventFromClient("event.cc.outreach_used", {
                user_id: user.id,
                email: user.email,
                name: user.name,
              }).catch(() => {});
            }).catch(() => {});
          }

          navigate("/outreach/onboarding/loading");
        } else {
          addChatMessage({ role: "assistant", content: finalResponse.message });
          setCurrentResponse(finalResponse);
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
    sendMessage(selected.join(", "), currentResponse?.mcq?.allow_multiple ? "mcq_multi" : "mcq");
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      sendMessage(textInput.trim(), "text");
      setTextInput("");
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

  // Input area for chat — hidden while streaming or loading
  const inputArea = streamingText !== null ? null
    : currentResponse?.is_complete ? null
    : currentResponse?.mcq ? (
      <MCQSelector
        question={currentResponse.mcq.question}
        options={currentResponse.mcq.options}
        allowMultiple={currentResponse.mcq.allow_multiple}
        onSubmit={handleMCQSubmit}
        loading={loading}
      />
    ) : (currentResponse?.text_input || (!currentResponse?.mcq && currentResponse !== null && !loading)) ? (
      <div className="flex gap-2 items-end">
        <textarea
          value={textInput}
          onChange={(e: any) => setTextInput(e.target.value)}
          placeholder={currentResponse?.input_placeholder || "Type your answer..."}
          onKeyDown={(e: any) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleTextSubmit())}
          rows={2}
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple resize-none"
        />
        <button
          onClick={handleTextSubmit}
          disabled={!textInput.trim() || loading}
          className="h-10 w-10 rounded-xl bg-studojo-purple text-white flex items-center justify-center border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none flex-shrink-0"
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
        <aside className="hidden md:flex flex-col w-56 border-r border-studojo-ink/10 bg-studojo-surface-muted/30 items-center justify-center flex-shrink-0">
          <div className="flex flex-col" style={{ alignItems: "flex-start" }}>
            {STEPS.map((step, i) => {
              const num = i + 1;
              const done = num < sidebarStep;
              const active = num === sidebarStep;
              const isLast = i === STEPS.length - 1;
              return (
                <div key={i} className="flex flex-col items-start">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <p className={`text-sm font-satoshi leading-tight ${
                        active ? "text-studojo-ink font-semibold"
                              : done ? "text-studojo-green font-medium"
                              : "text-studojo-muted"
                      }`}>
                        {step}
                      </p>
                      {active && num === 2 && questionsAsked > 0 && (
                        <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
                          Q {questionsAsked}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                Q{questionsAsked}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="flex-shrink-0 px-6 pt-6 md:pt-8 pb-2">
            <h1 className="font-clash text-xl md:text-2xl font-bold text-studojo-ink">
              Quick Profile Setup
            </h1>
            <p className="text-sm text-studojo-muted font-satoshi mt-1">
              A few quick questions so we can find the right hiring managers for you.
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
        </div>
      </div>
    </div>
  );
}
