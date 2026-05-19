// Banner shown on the outreach campaign dashboard summarising the user's
// ticket state. Three states:
//   - recently_resolved_id present → green "ticket cleared" banner (24h window)
//   - open_count > 0                → amber "in progress, < 24h" banner
//   - nothing                        → render nothing
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FiCheckCircle, FiClock, FiX } from "react-icons/fi";

interface Summary {
  total_unread: number;
  open_count: number;
  recently_resolved_id: number | null;
  recently_resolved_at: string | null;
}

const DISMISS_KEY = "studojo:ticket-banner-dismissed-v1";

export function TicketBanner() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    setDismissed(
      typeof window === "undefined" ? null : localStorage.getItem(DISMISS_KEY),
    );
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/tickets", { credentials: "include" });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (!cancelled && json?.summary) setSummary(json.summary);
      } catch {
        /* non-fatal */
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!summary) return null;

  // Resolved overrides open — fresh win is more interesting than "still
  // pending" if the user just got cleared.
  if (summary.recently_resolved_id) {
    const key = `resolved:${summary.recently_resolved_id}`;
    if (dismissed === key) return null;
    return (
      <div className="rounded-2xl border-2 border-studojo-ink bg-emerald-50 p-4 flex items-start gap-3 shadow-brutal">
        <FiCheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-700" />
        <div className="flex-1">
          <p className="text-sm font-satoshi font-bold text-studojo-ink">
            Ticket cleared.
          </p>
          <p className="text-xs font-satoshi text-studojo-muted mt-0.5">
            We've sorted your last ticket. Check details in{" "}
            <Link to="/profile" className="font-bold text-emerald-700 underline">
              your profile
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, key);
            setDismissed(key);
          }}
          aria-label="Dismiss"
          className="text-neutral-400 hover:text-neutral-900"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (summary.open_count > 0) {
    return (
      <div className="rounded-2xl border-2 border-studojo-ink/20 bg-violet-50 p-4 flex items-start gap-3">
        <FiClock className="h-5 w-5 mt-0.5 flex-shrink-0 text-violet-700" />
        <div className="flex-1">
          <p className="text-sm font-satoshi text-studojo-ink">
            <span className="font-bold">
              {summary.open_count === 1
                ? "Your ticket is in the queue."
                : `Your ${summary.open_count} tickets are in the queue.`}
            </span>{" "}
            The team will get back to you in <strong>24 hours or less</strong>.
          </p>
          <p className="text-xs font-satoshi text-studojo-muted mt-1">
            View progress in{" "}
            <Link to="/profile" className="font-bold text-violet-700 underline">
              your profile
            </Link>{" "}
            or via the support chat.
            {summary.total_unread > 0 && (
              <>
                {" "}
                <span className="font-bold text-rose-700">
                  ({summary.total_unread} unread reply
                  {summary.total_unread === 1 ? "" : "ies"})
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
