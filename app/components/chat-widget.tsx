import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  links?: { label: string; url: string }[];
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hey! I'm Studojo's support assistant. Ask me anything about our products, your account, billing, or anything else.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m !== WELCOME_MESSAGE)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, links: data.links },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Something went wrong. Try again or email admin@studojo.com.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Couldn't connect. Check your internet and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] max-[400px]:bottom-0 max-[400px]:right-0 max-[400px]:h-full max-[400px]:w-full max-[400px]:rounded-none max-[400px]:shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-neutral-900 bg-violet-500 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <img src="/favicon.png" alt="" width="18" height="18" />
              </div>
              <div>
                <p className="font-['Satoshi'] text-sm font-semibold text-white">Studojo Support</p>
                <p className="font-['Satoshi'] text-xs text-white/70">Usually replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              aria-label="Close chat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 font-['Satoshi'] text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-500 text-white rounded-br-md"
                      : "border border-neutral-200 bg-neutral-50 text-neutral-800 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.links.map((link) => (
                        <Link
                          key={link.url}
                          to={link.url}
                          onClick={() => setOpen(false)}
                          className="inline-block rounded-lg border border-violet-300 bg-white px-3 py-1 font-['Satoshi'] text-xs font-medium text-violet-600 hover:bg-violet-50"
                        >
                          {link.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t-2 border-neutral-900 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                maxLength={500}
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-neutral-900 bg-violet-500 text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60 disabled:pointer-events-none"
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
            <p className="mt-1.5 text-center font-['Satoshi'] text-[10px] text-neutral-400">
              Powered by Studojo AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
