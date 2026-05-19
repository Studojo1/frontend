// Modal used by the support chat widget and the outreach campaign
// dashboard to raise a ticket. Category options are filtered by the
// caller-supplied `source`. The priority assigned server-side is not
// shown to the user.
import { useState } from "react";
import { FiX, FiSend } from "react-icons/fi";
import {
  categoriesFor,
  type TicketCategory,
  type TicketSource,
} from "~/lib/tickets";

export function TicketModal({
  open,
  source,
  context,
  onClose,
  onCreated,
}: {
  open: boolean;
  source: TicketSource;
  context?: Record<string, any>;
  onClose: () => void;
  onCreated?: (ticketId: number) => void;
}) {
  const categories = categoriesFor(source);
  const [category, setCategory] = useState<TicketCategory>(categories[0].id);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const canSubmit =
    description.trim().length >= 10 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category,
          source,
          description: description.trim(),
          context: {
            ...(context || {}),
            page_url:
              typeof window !== "undefined" ? window.location.href : null,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || `Couldn't submit (HTTP ${res.status})`);
        return;
      }
      onCreated?.(json.id);
      // Reset for the next open.
      setDescription("");
      setCategory(categories[0].id);
      onClose();
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Raise a ticket"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 px-4 backdrop-blur-sm font-['Satoshi']"
    >
      <div className="w-full max-w-md rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-['Clash_Display'] text-xl text-neutral-900">
              Raise a ticket
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tell us what's up, the team will get back to you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-900"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <label className="block text-xs font-bold text-neutral-700 mb-1">
          What's going on?
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TicketCategory)}
          className="w-full mb-3 rounded-lg border-2 border-neutral-900 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <label className="block text-xs font-bold text-neutral-700 mb-1">
          Describe it
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Be as specific as you can. Steps to reproduce, what you tried, what you expected."
          maxLength={5000}
          className="w-full rounded-lg border-2 border-neutral-900 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-none"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-neutral-400">
            Minimum 10 characters
          </span>
          <span className="text-[10px] text-neutral-400">
            {description.length} / 5000
          </span>
        </div>

        {error && (
          <p className="mt-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border-2 border-neutral-900 bg-white px-3 py-2 text-xs font-bold text-neutral-700 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_0px_rgba(25,26,35,1)] transition-transform"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-violet-500 px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 transition-transform"
          >
            <FiSend className="w-4 h-4" />
            {submitting ? "Sending..." : "Send ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
