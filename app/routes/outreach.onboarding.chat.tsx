import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiSend } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { ProgressSteps } from "~/components/outreach/ProgressSteps";
import { ChatInterface } from "~/components/outreach/ChatInterface";
import { MCQSelector } from "~/components/outreach/MCQSelector";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import type { ChatMessage, AgentResponse } from "~/lib/outreach/types";

export default function ChatPage() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { candidateId, chatHistory, addChatMessage, setCurrentStep } = useOutreachStore();
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(null);
  const [textInput, setTextInput] = useState("");
  const [started, setStarted] = useState(false);
  const autoStarted = useRef(false);

  const sendMessage = async (content: string) => {
    if (!candidateId) return;

    const userMsg: ChatMessage = { role: "user", content };
    addChatMessage(userMsg);
    setLoading(true);

    try {
      const response = await outreachFetch<AgentResponse>(`/candidate/${candidateId}/chat/v2`, {
        method: "POST",
        timeout: 30_000,
        body: JSON.stringify({
          message: content,
          chat_history: [...chatHistory, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      addChatMessage({ role: "assistant", content: response.message });
      setCurrentResponse(response);

      if (response.is_complete) {
        const fullHistory = [...chatHistory, userMsg, { role: "assistant" as const, content: response.message }];
        // Fire payload generation in background — profile page polls until ready
        outreachFetch(`/candidate/${candidateId}/generate-payload`, {
          method: "POST",
          timeout: 120_000,
          body: JSON.stringify({
            message: "__generate__",
            chat_history: fullHistory.map((m) => ({ role: m.role, content: m.content })),
          }),
        }).catch(() => {
          // Silently handled — profile page will retry if payload isn't ready yet
        });
        setCurrentStep(3);
        navigate("/outreach/onboarding/profile");
      }
    } catch {
      addChatMessage({ role: "assistant", content: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const response = await outreachFetch<AgentResponse>(`/candidate/${candidateId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message: "__start__", chat_history: [] }),
      });
      addChatMessage({ role: "assistant", content: response.message });
      setCurrentResponse(response);
    } catch {
      addChatMessage({ role: "assistant", content: "Failed to start chat. Please refresh." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId && !started && !autoStarted.current && chatHistory.length === 0) {
      autoStarted.current = true;
      startChat();
    }
  }, [candidateId]);

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
          <ChatInterface messages={chatHistory} loading={loading}>
            {currentResponse?.is_complete ? (
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
            ) : currentResponse?.text_input || (!currentResponse?.mcq && started) ? (
              <div className="flex gap-2">
                <input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer..."
                  onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
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
            ) : null}
          </ChatInterface>
        </div>
      </div>
    </div>
  );
}