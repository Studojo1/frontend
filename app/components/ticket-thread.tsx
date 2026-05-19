// Thread view rendered inside the support chat widget's "Tickets" tab.
// Shows messages + a reply input (hidden when the ticket is closed).
import { useEffect, useRef, useState, useCallback } from "react";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import type { TicketDetail } from "~/lib/tickets";
import { TICKET_CATEGORIES } from "~/lib/tickets";

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return `${Math.round(diff)}s`;
  if (diff < 3600) return `${Math.round(diff / 60)}m`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h`;
  return `${Math.round(diff / 86400)}d`;
}

function categoryLabel(id: string): string {
  return TICKET_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function TicketThread({
  ticketId,
  onBack,
}: {
  ticketId: number;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchDetail = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setError(`Couldn't load (HTTP ${res.status})`);
        return;
      }
      const json = await res.json();
      setDetail(json as TicketDetail);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchDetail();
    const id = setInterval(fetchDetail, 30000);
    // Mark the thread as viewed so the unread badge clears for this ticket.
    fetch(`/api/tickets/${ticketId}/view`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {
      /* non-fatal */
    });
    return () => clearInterval(id);
  }, [fetchDetail, ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages.length]);

  const isClosed =
    detail?.status === "resolved" || detail?.status === "wont_fix";

  const send = async () => {
    const text = reply.trim();
    if (!text || sending || isClosed) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || `Couldn't send (HTTP ${res.status})`);
        return;
      }
      setReply("");
      await fetchDetail();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Loading...
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-2 p-4 text-center">
        <p className="text-sm text-rose-600">{error || "Couldn't load this ticket"}</p>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-violet-600 hover:underline"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-['Satoshi']">
      <div className="flex items-center gap-2 border-b-2 border-neutral-900 bg-violet-50 px-3 py-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="text-neutral-700 hover:text-neutral-900"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <div className="text-xs font-bold text-neutral-900 truncate">
            Ticket #{detail.id}
          </div>
          <div className="text-[10px] text-neutral-500 truncate">
            {categoryLabel(detail.category)} · {detail.status}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-neutral-50">
        {detail.attachments && detail.attachments.length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white p-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Attached screenshots
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {detail.attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-md border border-neutral-300 bg-neutral-100"
                >
                  <img
                    src={a.url}
                    alt={a.filename || `Screenshot ${i + 1}`}
                    className="block h-16 w-full object-cover hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        {detail.messages.map((m) => {
          const isUser = m.author_type === "user";
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl border-2 border-neutral-900 px-3 py-2 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] ${
                  isUser
                    ? "bg-violet-500 text-white rounded-br-md"
                    : m.author_type === "admin"
                      ? "bg-white text-neutral-900 rounded-bl-md"
                      : "bg-neutral-100 text-neutral-700 rounded-bl-md"
                }`}
              >
                {!isUser && (
                  <div className="text-[10px] font-bold text-neutral-500 mb-0.5">
                    {m.author_type === "admin" ? "studojo team" : "system"}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                <div
                  className={`text-[10px] mt-1 ${
                    isUser ? "text-white/70" : "text-neutral-400"
                  }`}
                >
                  {relativeTime(m.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {isClosed ? (
        <div className="border-t-2 border-neutral-900 bg-neutral-100 px-3 py-3 text-center text-xs text-neutral-600">
          This ticket is {detail.status === "resolved" ? "resolved" : "closed"}.
          Open a new one if you need more help.
        </div>
      ) : (
        <div className="border-t-2 border-neutral-900 bg-white p-2">
          <div className="flex gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="Add an update..."
              className="flex-1 rounded-xl border-2 border-neutral-900 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || !reply.trim()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-neutral-900 bg-violet-500 text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
