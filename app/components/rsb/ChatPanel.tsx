import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import type { ChatMsg } from "~/lib/rsb/types";

export function ChatPanel({
  messages,
  streamingText,
  onSend,
  sending,
}: {
  messages: ChatMsg[];
  streamingText: string;
  onSend: (text: string) => void;
  sending: boolean;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, streamingText]);

  const submit = () => {
    const t = input.trim();
    if (!t || sending) return;
    onSend(t);
    setInput("");
  };

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] flex flex-col h-full overflow-hidden font-['Satoshi']">
      <div className="bg-neutral-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Resume coach
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: "calc(100vh - 320px)" }}
      >
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.content} />
        ))}
        {streamingText && <Bubble role="assistant" text={streamingText} streaming />}
      </div>

      <div className="border-t-2 border-neutral-900 p-3 bg-violet-50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Type your answer..."
            className="flex-1 px-3 py-2 bg-white border-2 border-neutral-900 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-none"
          />
          <button
            onClick={submit}
            disabled={sending || !input.trim()}
            className="px-4 bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text, streaming }: { role: "user" | "assistant"; text: string; streaming?: boolean }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-violet-500 text-neutral-900 px-4 py-2.5 border-2 border-neutral-900 rounded-2xl rounded-br-md shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] text-sm whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-white text-neutral-900 px-4 py-2.5 border-2 border-neutral-900 rounded-2xl rounded-bl-md shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] text-sm whitespace-pre-wrap">
        {text}
        {streaming && <span className="inline-block w-1.5 h-4 bg-neutral-900 ml-0.5 animate-pulse align-middle" />}
      </div>
    </div>
  );
}
