import { useEffect, useRef, useState } from "react";
import { FiSend, FiMic, FiMicOff } from "react-icons/fi";
import type { ChatMsg, StepInfo } from "~/lib/rsb/types";

export function ChatPanel({
  messages,
  step,
  onSend,
  sending,
  onGenerate,
  generating,
}: {
  messages: ChatMsg[];
  step: StepInfo | null;
  onSend: (text: string) => void;
  sending: boolean;
  onGenerate: () => void;
  generating: boolean;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);
  const keepListeningRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  const submit = (override?: string) => {
    const t = (override ?? input).trim();
    if (!t || sending) return;
    onSend(t);
    setInput("");
  };

  const toggleMic = () => {
    if (typeof window === "undefined") return;
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input is not supported in this browser. Use Chrome or Edge.");
      return;
    }
    if (listening) {
      keepListeningRef.current = false;
      try {
        recogRef.current?.stop();
      } catch {}
      setListening(false);
      return;
    }

    keepListeningRef.current = true;
    let finalTranscript = "";

    const startOnce = () => {
      const r = new SR();
      r.lang = "en-US";
      r.interimResults = true;
      r.continuous = true;
      r.onresult = (evt: any) => {
        let interim = "";
        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          const res = evt.results[i];
          if (res.isFinal) finalTranscript += res[0].transcript + " ";
          else interim += res[0].transcript;
        }
        setInput((finalTranscript + interim).trim());
      };
      r.onerror = (evt: any) => {
        if (evt?.error === "no-speech" || evt?.error === "aborted") return;
        keepListeningRef.current = false;
        setListening(false);
      };
      r.onend = () => {
        if (keepListeningRef.current) {
          try {
            r.start();
          } catch {
            setTimeout(() => {
              if (keepListeningRef.current) startOnce();
            }, 150);
          }
        } else {
          setListening(false);
        }
      };
      try {
        r.start();
        recogRef.current = r;
      } catch {
        keepListeningRef.current = false;
        setListening(false);
      }
    };

    startOnce();
    setListening(true);
  };

  const isDone = step?.is_complete ?? false;
  const isMcq = step?.kind === "mcq" && !isDone;

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] flex flex-col h-full overflow-hidden font-['Satoshi']">
      <div className="bg-neutral-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Resume coach
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: "calc(100vh - 360px)" }}
      >
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.content} />
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-neutral-900 rounded-2xl rounded-bl-md px-3 py-2 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-bounce" style={{ animationDelay: "120ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-bounce" style={{ animationDelay: "240ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {isDone ? (
        <div className="border-t-2 border-neutral-900 p-4 bg-violet-50 flex flex-col gap-2">
          <p className="text-sm text-neutral-700">
            Chat complete. Build the polished resume now.
          </p>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl py-2.5 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-50"
          >
            {generating ? "Building your resume..." : "Build my resume"}
          </button>
        </div>
      ) : (
        <div className="border-t-2 border-neutral-900 p-3 bg-violet-50">
          {isMcq && (
            <div className="flex flex-wrap gap-2 mb-3">
              {step!.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => submit(opt)}
                  disabled={sending}
                  className="px-3 py-1.5 bg-white text-neutral-900 text-sm border-2 border-neutral-900 rounded-full shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] hover:bg-violet-500 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-40"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
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
              placeholder={isMcq ? "Or type your own answer..." : "Type your answer..."}
              className="flex-1 px-3 py-2 bg-white border-2 border-neutral-900 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-none"
            />
            <button
              onClick={toggleMic}
              title={listening ? "Stop listening" : "Speak your answer"}
              className={`px-3 border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all ${
                listening ? "bg-rose-400" : "bg-white"
              }`}
            >
              {listening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
            </button>
            <button
              onClick={() => submit()}
              disabled={sending || !input.trim()}
              className="px-4 bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
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
      </div>
    </div>
  );
}
