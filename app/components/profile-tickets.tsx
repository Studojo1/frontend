// User's own ticket list, embedded in /profile. Lists recent tickets
// with status badges; clicking a row opens the in-chat thread by
// dispatching a window event the chat widget listens for.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { TICKET_CATEGORIES } from "~/lib/tickets";

interface TicketRow {
  id: number;
  category: string;
  status: "open" | "in_progress" | "resolved" | "wont_fix";
  source: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  preview: string;
  unread_admin_replies: number;
  attachments?: Array<{ url: string }>;
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

function categoryLabel(id: string): string {
  return TICKET_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ProfileTickets() {
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tickets", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) setTickets([]);
          return;
        }
        const json = await res.json();
        if (!cancelled) setTickets(json.tickets || []);
      } catch {
        if (!cancelled) setTickets([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (tickets === null) {
    return (
      <>
        <div className="h-14 rounded-xl border-2 border-neutral-200 bg-neutral-50 animate-pulse mb-2" />
        <div className="h-14 rounded-xl border-2 border-neutral-200 bg-neutral-50 animate-pulse" />
      </>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="font-['Satoshi'] text-sm text-neutral-500 mb-3">
          No tickets yet. Raise one from the support chat or your outreach
          dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((t) => {
        const isOpen = t.status === "open" || t.status === "in_progress";
        const StatusIcon = isOpen
          ? FiClock
          : t.status === "resolved"
            ? FiCheckCircle
            : FiAlertCircle;
        const statusColor = isOpen
          ? "text-amber-700 bg-amber-50 border-amber-300"
          : t.status === "resolved"
            ? "text-emerald-700 bg-emerald-50 border-emerald-300"
            : "text-neutral-700 bg-neutral-100 border-neutral-300";

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              // Open the in-chat thread via a custom event the chat widget
              // listens for. The widget also handles opening itself.
              window.dispatchEvent(
                new CustomEvent("studojo:open-ticket", { detail: { id: t.id } }),
              );
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-neutral-200 hover:border-violet-400 hover:bg-violet-50 transition-all text-left group"
          >
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${statusColor}`}
            >
              <StatusIcon className="h-3 w-3" />
              {isOpen
                ? t.status === "open"
                  ? "Open"
                  : "In progress"
                : t.status === "resolved"
                  ? "Resolved"
                  : "Closed"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900 truncate">
                #{t.id} · {categoryLabel(t.category)}
              </div>
              <div className="font-['Satoshi'] text-xs text-neutral-500 truncate">
                {t.preview}
              </div>
            </div>
            <div className="text-xs text-neutral-400 font-['Satoshi'] flex-shrink-0">
              {relativeTime(t.updated_at)}
            </div>
            {t.unread_admin_replies > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-neutral-900 bg-rose-500 px-1 text-[10px] font-bold text-white">
                {t.unread_admin_replies > 9 ? "9+" : t.unread_admin_replies}
              </span>
            )}
          </button>
        );
      })}
      <p className="text-[11px] text-neutral-400 mt-2 text-center">
        Tap a ticket to open the thread in the support chat.{" "}
        <Link to="/contact" className="text-violet-600 hover:underline">
          Need urgent help?
        </Link>
      </p>
    </div>
  );
}
