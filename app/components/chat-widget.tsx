import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { authClient } from "~/lib/auth-client";
import { TicketModal } from "~/components/ticket-modal";
import { TicketThread } from "~/components/ticket-thread";
import { TICKET_CATEGORIES } from "~/lib/tickets";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  links?: { label: string; url: string }[];
}

interface TicketSummaryRow {
  id: number;
  category: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  preview: string;
  unread_admin_replies: number;
}

type ChatView = "chat" | "tickets" | "thread";

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hey! I'm here to help with anything Studojo related. What's up?",
};

function generateSessionId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useMemo(() => generateSessionId(), []);

  // Tickets state — logged-in users can switch to a Tickets tab.
  const { data: session } = authClient.useSession();
  const loggedIn = !!session?.user;
  const [view, setView] = useState<ChatView>("chat");
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [tickets, setTickets] = useState<TicketSummaryRow[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

  // Aggregate summary used by the chat bubble (notification dot) + Tickets tab.
  const [summary, setSummary] = useState<{
    total_unread: number;
    open_count: number;
  }>({ total_unread: 0, open_count: 0 });

  const fetchTickets = useCallback(async () => {
    if (!loggedIn) return;
    setTicketsLoading(true);
    try {
      const res = await fetch("/api/tickets", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setTickets(json.tickets || []);
        if (json.summary) setSummary(json.summary);
      }
    } catch {
      /* non-fatal */
    } finally {
      setTicketsLoading(false);
    }
  }, [loggedIn]);

  // Refresh tickets when the user enters the tab.
  useEffect(() => {
    if (open && view === "tickets") fetchTickets();
  }, [open, view, fetchTickets]);

  // Background poll for unread admin replies so the bubble badge stays
  // fresh even when the widget is closed. 60s is plenty — admin replies
  // are minutes-to-hours-scale events.
  useEffect(() => {
    if (!loggedIn) return;
    fetchTickets();
    const id = setInterval(fetchTickets, 60000);
    return () => clearInterval(id);
  }, [loggedIn, fetchTickets]);

  // Anonymous users can never reach tickets/thread views.
  useEffect(() => {
    if (!loggedIn && view !== "chat") setView("chat");
  }, [loggedIn, view]);

  const openTickets = useCallback(() => {
    setView("tickets");
    fetchTickets();
  }, [fetchTickets]);

  const openThread = useCallback((id: number) => {
    setActiveTicketId(id);
    setView("thread");
  }, []);

  const backFromThread = useCallback(() => {
    setActiveTicketId(null);
    setView("tickets");
    fetchTickets();
  }, [fetchTickets]);

  // Allow other parts of the app (profile, dashboard, etc.) to deep-link
  // into a specific ticket thread by dispatching a window event:
  //   window.dispatchEvent(new CustomEvent("studojo:open-ticket", { detail: { id } }))
  useEffect(() => {
    function handler(ev: Event) {
      const e = ev as CustomEvent<{ id?: number }>;
      const id = Number(e.detail?.id);
      if (!Number.isFinite(id) || id <= 0) return;
      setActiveTicketId(id);
      setView("thread");
      setOpen(true);
    }
    window.addEventListener("studojo:open-ticket", handler as EventListener);
    return () =>
      window.removeEventListener("studojo:open-ticket", handler as EventListener);
  }, []);

  // Drag state — null means use default CSS bottom-left position
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false); // distinguish click from drag

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragging.current = true;
    didDrag.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    didDrag.current = true;
    const x = Math.max(0, Math.min(window.innerWidth - 56, e.clientX - dragOffset.current.x));
    const y = Math.max(0, Math.min(window.innerHeight - 56, e.clientY - dragOffset.current.y));
    setPos({ x, y });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

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
        body: JSON.stringify({ message: trimmed, history, sessionId }),
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
      {/* Chat bubble — draggable */}
      <button
        onClick={() => { if (!didDrag.current) setOpen(!open); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ ...(pos ? { left: pos.x, top: pos.y, bottom: "auto", right: "auto" } : {}), touchAction: "none" }}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 cursor-grab items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] active:cursor-grabbing"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {/* Unread admin-reply badge — shows count from the background poll. */}
        {!open && summary.total_unread > 0 && (
          <span
            aria-label={`${summary.total_unread} unread message${summary.total_unread === 1 ? "" : "s"}`}
            className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-neutral-900 bg-rose-500 px-1 text-[10px] font-bold text-white"
          >
            {summary.total_unread > 9 ? "9+" : summary.total_unread}
          </span>
        )}
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

      {/* Chat window — anchors above/beside the bubble */}
      {open && (() => {
        let winStyle: React.CSSProperties = {};
        if (pos) {
          const winW = 360;
          const winH = 480;
          const gap = 12;
          const top = pos.y - winH - gap < 0 ? pos.y + 56 + gap : pos.y - winH - gap;
          const left = Math.max(8, Math.min(window.innerWidth - winW - 8, pos.x));
          winStyle = { top, left, bottom: "auto", right: "auto" };
        }
        return (
        <div
          style={pos ? winStyle : undefined}
          className="fixed bottom-24 left-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] max-[400px]:bottom-0 max-[400px]:left-0 max-[400px]:h-full max-[400px]:w-full max-[400px]:rounded-none max-[400px]:shadow-none">
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

          {/* Tab strip — only for logged-in users (Tickets tab needs auth). */}
          {loggedIn && view !== "thread" && (
            <div className="flex gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
              {(
                [
                  { id: "chat", label: "Chat" },
                  { id: "tickets", label: "Tickets" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => (t.id === "tickets" ? openTickets() : setView("chat"))}
                  className={`flex-1 rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                    view === t.id
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {t.label}
                  {t.id === "tickets" && summary.total_unread > 0 && (
                    <span
                      aria-label={`${summary.total_unread} unread`}
                      className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
                    >
                      {summary.total_unread > 9 ? "9+" : summary.total_unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Thread view (own height; takes over the body) */}
          {view === "thread" && activeTicketId !== null && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <TicketThread ticketId={activeTicketId} onBack={backFromThread} />
            </div>
          )}

          {/* Tickets list view */}
          {view === "tickets" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-neutral-50">
              {ticketsLoading && tickets.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-400">
                  Loading...
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  <p className="mb-2">No tickets yet.</p>
                  <button
                    type="button"
                    onClick={() => setRaiseOpen(true)}
                    className="rounded-lg border-2 border-neutral-900 bg-violet-500 px-3 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                  >
                    Raise a ticket
                  </button>
                </div>
              ) : (
                <>
                  {tickets.map((t) => {
                    const label =
                      TICKET_CATEGORIES.find((c) => c.id === t.category)
                        ?.label ?? t.category;
                    const statusColor =
                      t.status === "open"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : t.status === "in_progress"
                          ? "bg-violet-100 text-violet-800 border-violet-300"
                          : "bg-neutral-100 text-neutral-700 border-neutral-300";
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => openThread(t.id)}
                        className="w-full rounded-xl border-2 border-neutral-900 bg-white px-3 py-2 text-left shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_0px_rgba(25,26,35,1)] transition-transform"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-neutral-900 truncate">
                            #{t.id} · {label}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${statusColor}`}
                          >
                            {t.status.replace("_", " ")}
                          </span>
                        </div>
                        {t.preview && (
                          <p className="mt-1 text-[11px] text-neutral-500 line-clamp-2">
                            {t.preview}
                          </p>
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setRaiseOpen(true)}
                    className="w-full rounded-xl border-2 border-dashed border-neutral-300 px-3 py-3 text-xs font-bold text-neutral-600 hover:border-neutral-900 hover:bg-white"
                  >
                    + Raise a new ticket
                  </button>
                </>
              )}
            </div>
          )}

          {/* Messages — only visible on the Chat view */}
          {view === "chat" && (
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
          )}

          {/* Input — chat view only */}
          {view === "chat" && (
          <div className="border-t-2 border-neutral-900 bg-white p-3">
            {loggedIn && (
              <button
                type="button"
                onClick={() => setRaiseOpen(true)}
                className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] font-bold text-neutral-700 hover:border-neutral-900 hover:bg-white"
              >
                🎫 Raise a ticket — get the team on it
              </button>
            )}
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
          )}
        </div>
        );
      })()}

      <TicketModal
        open={raiseOpen}
        source="support_chat"
        onClose={() => setRaiseOpen(false)}
        onCreated={(id) => {
          fetchTickets();
          setActiveTicketId(id);
          setView("thread");
          if (!open) setOpen(true);
        }}
      />
    </>
  );
}
