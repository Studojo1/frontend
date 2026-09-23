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
  const {
    candidateId,
    chatHistory,
    addChatMessage,
    removeLastChatMessage,
    clearChatHistory,
    chatCandidateId,
    setChatCandidateId,
  } = useOutreachStore();
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(null);
  const [textInput, setTextInput] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);
  // The answer whose turn failed, held so it can be resent verbatim. The error
  // used to be dropped into the transcript as a chatbot line with no way to act
  // on it, which read as the quiz talking rather than as something gone wrong.
  const [failedAnswer, setFailedAnswer] = useState<{ content: string; answerType: string } | null>(null);
  const autoStarted = useRef(false);

  // Restore an in-progress quiz, or start a fresh one.
  //
  // This used to clear chatHistory unconditionally, which (together with
  // chatHistory not being persisted at all) meant a refresh, a back gesture or
  // a mobile tab eviction threw the quiz away and dropped the student back at
  // question one. On a phone, a backgrounded tab being evicted is routine.
  //
  // Restoring is cheap because the stream endpoint is a stateless replay: post
  // the transcript we saved and it returns the question that comes next. No
  // backend call is needed to work out where the student had got to.
  useEffect(() => {
    if (!candidateId || autoStarted.current) return;
    autoStarted.current = true;

    // Don't resurrect a quiz that is already finished. Browser-back onto this
    // page after completing sets up a replay that would re-run the completion
    // branch; the same localStorage key that guards the completion side-effects
    // tells us to leave it alone.
    let alreadyDone = false;
    try {
      alreadyDone =
        typeof window !== "undefined" &&
        localStorage.getItem(`quiz_completed_${candidateId}`) === "1";
    } catch {}

    // Only restore a transcript that belongs to THIS candidate. Uploading a new
    // resume makes a new candidate, and replaying the previous quiz onto it
    // would answer the new quiz with the old resume's answers.
    const restorable =
      !alreadyDone &&
      chatCandidateId === candidateId &&
      chatHistory.length > 0 &&
      chatHistory.some((m) => m.role === "user");

    if (restorable) {
      capturePostHog("quiz_resumed", {
        candidate_id: candidateId,
        messages_restored: chatHistory.length,
      });
      void resumeFromHistory(chatHistory);
      return;
    }

    clearChatHistory();
    setChatCandidateId(candidateId);
    addChatMessage({ role: "assistant", content: Q1_STATIC.message });
    setCurrentResponse(Q1_STATIC);
    capturePostHog("quiz_started", { candidate_id: candidateId });
  }, [candidateId]);

  const questionsAsked = currentResponse?.questions_asked_so_far ?? 0;
  // Prefer the real sequence length the backend now sends. ESTIMATED_TOTAL is
  // the fallback for a response that predates it, and was previously the only
  // denominator: a hardcoded 10 against a quiz that is 8 to 11 questions long,
  // so the bar was wrong for most students and never told them what was left.
  const questionsTotal = currentResponse?.questions_total ?? ESTIMATED_TOTAL;
  const quizProgress = Math.min(100, (questionsAsked / questionsTotal) * 100);
  const sidebarStep = currentResponse?.is_complete ? 3 : 2;

  /**
   * Re-request the current question for a transcript we already hold.
   *
   * Used when returning to a quiz that was interrupted. The stream endpoint is
   * a pure replay of the history it is given, so posting the restored
   * transcript returns whichever question the student was on. Nothing is
   * appended to the history here: the answers are already in it.
   */
  const resumeFromHistory = async (history: ChatMessage[]) => {
    if (!candidateId) return;
    setLoading(true);
    setStreamingText(null);

    try {
      const res = await outreachStreamFetch(`/candidate/${candidateId}/chat/stream`, {
        method: "POST",
        body: JSON.stringify({
          message: "__resume__",
          chat_history: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Resume failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let restored: AgentResponse | null = null;

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
          if (evt.type === "complete") {
            restored = {
              message: evt.message ?? "",
              current_state: evt.current_state ?? "MCQ",
              mcq: evt.mcq ?? null,
              text_input: evt.text_input ?? false,
              input_placeholder: evt.input_placeholder ?? null,
              is_complete: evt.is_complete ?? false,
              questions_asked_so_far: evt.questions_asked_so_far ?? 0,
              questions_total: evt.questions_total ?? undefined,
              psychometric: evt.psychometric ?? null,
            } as AgentResponse;
          }
        }
      }

      if (restored && !restored.is_complete) {
        // The question itself is already the last assistant message in the
        // restored transcript, so only the controls need rebuilding.
        setCurrentResponse(restored);
      } else {
        // Either the quiz had already finished or the reply was unusable.
        // Sending the student back to a clean question one is the safe fallback.
        clearChatHistory();
        setChatCandidateId(candidateId);
        addChatMessage({ role: "assistant", content: Q1_STATIC.message });
        setCurrentResponse(Q1_STATIC);
      }
    } catch {
      // Restoring is best-effort. If it fails, start the quiz rather than leave
      // the student on a transcript with no way to answer.
      clearChatHistory();
      setChatCandidateId(candidateId);
      addChatMessage({ role: "assistant", content: Q1_STATIC.message });
      setCurrentResponse(Q1_STATIC);
    } finally {
      setLoading(false);
      setStreamingText(null);
    }
  };

  const sendMessage = async (content: string, answerType: string = "text") => {
    if (!candidateId) return;

    setFailedAnswer(null);
    const userMsg: ChatMessage = { role: "user", content };
    addChatMessage(userMsg);
    // Stamp ownership of the persisted transcript, so it is only ever restored
    // onto the candidate whose quiz produced it.
    if (chatCandidateId !== candidateId) setChatCandidateId(candidateId);
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
              questions_total: evt.questions_total ?? undefined,
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

          // Await the profile write instead of firing it into the void.
          //
          // This is the quiz's only write, and it used to be fire-and-forget:
          // if it failed, the student was still sent to the loading screen,
          // which then waited on a profile that was never going to arrive. The
          // ten second skip button was the only way out, and it skipped past a
          // profile that did not exist.
          //
          // outreachFetch already retries transient failures internally and
          // throws on a non-2xx, so awaiting it and catching the throw is the
          // whole check.
          let payloadWritten = true;
          try {
            await outreachFetch(`/candidate/${candidateId}/generate-payload`, {
              method: "POST",
              body: JSON.stringify({
                message: "__generate__",
                chat_history: historyForPayload.map((m) => ({ role: m.role, content: m.content })),
              }),
            });
          } catch {
            payloadWritten = false;
          }

          if (!payloadWritten) {
            // Say so plainly and keep them on the quiz, where the answers still
            // are, rather than sending them to a screen that will spin.
            addChatMessage({
              role: "assistant",
              content:
                "Your answers are saved, but building your profile did not go through. Tap Continue to try again.",
            });
            setCurrentResponse(finalResponse);
            setLoading(false);
            return;
          }

          // Fire completion side-effects ONCE per candidate. Without this guard,
          // profile_quiz_completed (and the outreach_used email) re-fired on
          // resubmits, re-renders, and browser-back revisits — logging far more
          // "completions" than there were quiz starts.
          const completedKey = `quiz_completed_${candidateId}`;
          const alreadyCompleted = typeof window !== "undefined" && localStorage.getItem(completedKey);
          if (!alreadyCompleted) {
            try { localStorage.setItem(completedKey, "1"); } catch {}

            capturePostHog("profile_quiz_completed", {
              candidate_id: candidateId,
              questions_asked: questionsAsked,
            });

            if (user?.id) {
              // Completing outreach onboarding means the student used the outreach
              // tool. Starts the high-intent push sequence and cancels any pending
              // not-used nudge chain. Runs in the browser via the server resource
              // route which holds the internal secret (emailer endpoint is gated).
              import("~/lib/events").then(({ publishEmailEventFromClient }) => {
                publishEmailEventFromClient("event.cc.outreach_used", {
                  user_id: user.id,
                  email: user.email,
                  name: user.name,
                }).catch(() => {});
              }).catch(() => {});
            }
          }

          navigate("/outreach/onboarding/loading");
        } else {
          addChatMessage({ role: "assistant", content: finalResponse.message });
          setCurrentResponse(finalResponse);
          setLoading(false);
        }
      } else {
        // The stream ended without a 'complete' event, so the turn produced no
        // question. Silently re-enabling the UI here left the student looking at
        // their own answer with the previous question still on screen, and the
        // answer itself never reached the server. Treat it as the failure it is.
        throw new Error("Stream ended without a complete event");
      }
    } catch {
      setStreamingText(null);
      // Take the answer back out of the history before showing the error.
      //
      // It was added optimistically above, but the turn never landed. Leaving it
      // in means a retry sends the same answer twice, and the backend assigns
      // answers by position while replaying, so every later answer shifts onto
      // the wrong question: the student's city ends up stored as their company
      // stage and nothing errors. The bubble disappearing is also the honest
      // signal that the answer did not go through and needs re-entering.
      removeLastChatMessage();
      // Keep the answer so the retry button can resend it verbatim, rather than
      // making the student retype what they already typed.
      setFailedAnswer({ content, answerType });
      setLoading(false);
    }
  };

  const retryFailedAnswer = () => {
    if (!failedAnswer) return;
    const { content, answerType } = failedAnswer;
    setFailedAnswer(null);
    void sendMessage(content, answerType);
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

  // A failed turn shows a real error with a real retry, above the controls. The
  // student's answer is held in failedAnswer, so retrying resends it rather
  // than asking them to type it again.
  const errorBanner = failedAnswer ? (
    <div
      role="alert"
      className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border-2 border-studojo-ink bg-red-50 px-4 py-3"
    >
      <p className="flex-1 text-sm font-satoshi text-studojo-ink">
        That answer did not go through. Your place in the quiz is saved.
      </p>
      <button
        onClick={retryFailedAnswer}
        disabled={loading}
        className="min-h-[44px] px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
      >
        Try again
      </button>
    </div>
  ) : null;

  // Input area for chat — hidden while streaming or loading
  const controls = streamingText !== null ? null
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
          // Enter submits on a physical keyboard, where Shift+Enter is the
          // well-known way to get a newline. On a touch keyboard there is no
          // Shift+Enter, so return would submit a half-typed answer and the
          // student could never start a second line in a box that shows two.
          // There, return does what it looks like it does and the send button
          // submits.
          //
          // The loading guard matters on both: without it a second press sends
          // the same answer again, which the position-keyed replay then treats
          // as the answer to the next question.
          onKeyDown={(e: any) => {
            if (e.key !== "Enter" || e.shiftKey || loading) return;
            const isTouch =
              typeof window !== "undefined" &&
              window.matchMedia?.("(pointer: coarse)").matches;
            if (isTouch) return;
            e.preventDefault();
            handleTextSubmit();
          }}
          rows={2}
          id="quiz-answer"
          aria-label="Your answer"
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-studojo-ink/20 text-base font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple resize-none"
        />
        <button
          type="button"
          onClick={handleTextSubmit}
          aria-label="Send answer"
          disabled={!textInput.trim() || loading}
          className="h-11 w-11 rounded-xl bg-studojo-purple text-white flex items-center justify-center border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none flex-shrink-0"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </div>
    ) : null;

  // The banner sits above whichever controls are showing. It survives on its
  // own when the controls are hidden, so a failure during streaming still gives
  // the student a way forward.
  const inputArea = (errorBanner || controls) ? (
    <>
      {errorBanner}
      {controls}
    </>
  ) : null;

  // The quiz page uses min-h-[100dvh] rather than h-screen + overflow-hidden.
  //
  // That old pair capped the page at exactly one viewport and forbade it from
  // scrolling, so any question taller than the screen had its Continue button
  // pushed out of reach with no way to get to it. The twelve-option niche
  // question does exactly that on a 360x640 phone: the student can see the
  // options, pick one, and then cannot submit.
  //
  // dvh rather than vh because mobile browsers shrink the viewport when the
  // address bar is showing, and vh ignores that.
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Header />

      <div className="flex-1 flex">
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
              questionsAsked={questionsAsked}
              questionsTotal={currentResponse?.questions_total}
            >
              {inputArea}
            </ChatInterface>
          </div>
        </div>
      </div>
    </div>
  );
}
