import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiSend } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { ProgressSteps } from "~/components/outreach/ProgressSteps";
import { ChatInterface } from "~/components/outreach/ChatInterface";
import { MCQSelector } from "~/components/outreach/MCQSelector";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch, outreachStreamFetch } from "~/lib/outreach/api";
import type { ChatMessage, AgentResponse } from "~/lib/outreach/types";

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
  useOutreachAuth();
  const { candidateId, chatHistory, addChatMessage, setCurrentStep } = useOutreachStore();
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(null);
  const [textInput, setTextInput] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const autoStarted = useRef(false);

  // Serve Q1 instantly on mount — no API call
  useEffect(() => {
    if (candidateId && !autoStarted.current && chatHistory.length === 0) {
      autoStarted.current = true;
      addChatMessage({ role: "assistant", content: Q1_STATIC.message });
      setCurrentResponse(Q1_STATIC);
    }
  }, [candidateId]);

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
            // Show blinking cursor immediately on first chunk (streamingText=""),
            // then fill in progressive message text as the field builds up.
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
          try {
            setLoading(true);
            await outreachFetch(`/candidate/${candidateId}/generate-payload`, {
              method: "POST",
              timeout: 120_000,
              body: JSON.stringify({
                message: "__generate__",
                chat_history: historyForPayload.map((m) => ({ role: m.role, content: m.content })),
              }),
            });
            await new Promise((r) => setTimeout(r, 1500));
            setCurrentStep(3);
            navigate("/outreach/onboarding/profile");
          } catch {
            addChatMessage({ role: "assistant", content: "Profile generation failed. Please try again." });
            setLoading(false);
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

  // Input area — hidden while LLM is streaming (streamingText !== null)
  const inputArea = streamingText !== null ? null
    : currentResponse?.is_complete ? (
      <div className="text-center p-4">
        <p className="text-sm text-studojo-green font-semibold font-satoshi">
          Profile complete! Redirecting...
        </p>
      </div>
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

      <div className="flex-1 flex flex-col overflow-hidden mx-auto w-full max-w-3xl px-4 md:px-8">
        <div className="pt-8 pb-2 flex-shrink-0">
          <ProgressSteps steps={["Upload Resume", "AI Chat", "Your Profile"]} currentStep={2} />
        </div>

        <div className="flex-shrink-0 mt-4">
          <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Career Intelligence Chat</h1>
          <p className="text-sm text-studojo-muted font-satoshi mb-4">
            Our AI will ask you a few questions to understand your career goals.
          </p>
        </div>

        <div className="flex-1 overflow-hidden pb-4">
          <ChatInterface messages={chatHistory} loading={loading} streamingText={streamingText}>
            {inputArea}
          </ChatInterface>
        </div>
      </div>
    </div>
  );
}
