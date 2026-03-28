import { useRef, useEffect, type ReactNode } from "react";
import { FiUser } from "react-icons/fi";
import { RiRobot2Fill } from "react-icons/ri";
import type { ChatMessage } from "~/lib/outreach/types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  children?: ReactNode;
  loading?: boolean;
  streamingText?: string | null;
  quizProgress?: number;
}

export function ChatInterface({ messages, children, loading, streamingText, quizProgress }: ChatInterfaceProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading, streamingText]);

  return (
    <div className="flex flex-col h-full bg-white border-2 border-studojo-ink rounded-2xl overflow-hidden shadow-brutal">
      {/* Quiz progress bar */}
      {quizProgress != null && quizProgress > 0 && (
        <div className="h-1 bg-studojo-surface-muted flex-shrink-0">
          <div
            className="h-full bg-gradient-to-r from-studojo-purple to-studojo-pink rounded-r-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(quizProgress, 100)}%` }}
          />
        </div>
      )}

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => {
          const parts = msg.role === "assistant" ? msg.content.split("|||") : [msg.content];

          return (
            <div
              key={i}
              className={`flex gap-2.5 animate-fade-in ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-studojo-purple to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 border-2 border-studojo-ink">
                  <RiRobot2Fill className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-studojo-purple text-white rounded-br-md border-2 border-studojo-ink shadow-brutal"
                    : "bg-purple-50 text-studojo-ink rounded-bl-md border border-studojo-ink/20"
                }`}
              >
                {parts.map((part, j) => (
                  <p key={j} className={`text-[14px] leading-relaxed font-satoshi ${j > 0 ? "mt-2" : ""}`}>
                    {part.trim()}
                  </p>
                ))}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-studojo-ink flex items-center justify-center flex-shrink-0 mt-0.5 border-2 border-studojo-ink">
                  <FiUser className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {/* Streaming text bubble */}
        {streamingText !== null && streamingText !== undefined && (
          <div className="flex gap-2.5 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-studojo-purple to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 border-2 border-studojo-ink">
              <RiRobot2Fill className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[75%] bg-purple-50 rounded-2xl rounded-bl-md px-4 py-3 border border-studojo-ink/20">
              <p className="text-[14px] leading-relaxed font-satoshi text-studojo-ink">
                {streamingText || <span className="opacity-0">…</span>}
                <span className="inline-block w-0.5 h-4 bg-studojo-purple ml-0.5 animate-pulse align-middle" />
              </p>
            </div>
          </div>
        )}

        {/* Bouncing dots */}
        {loading && streamingText === null && (
          <div className="flex gap-2.5 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-studojo-purple to-purple-600 flex items-center justify-center flex-shrink-0 border-2 border-studojo-ink">
              <RiRobot2Fill className="w-4 h-4 text-white" />
            </div>
            <div className="bg-purple-50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 border border-studojo-ink/20">
              <div className="w-2 h-2 bg-studojo-purple/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-studojo-purple/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-studojo-purple/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div />
      </div>

      {children && (
        <div className="border-t-2 border-studojo-ink bg-studojo-surface-muted px-4 py-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
