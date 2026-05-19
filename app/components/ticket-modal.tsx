// Modal used by the support chat widget and the outreach campaign
// dashboard to raise a ticket. Category options are filtered by the
// caller-supplied `source`. The priority assigned server-side is not
// shown to the user. Every ticket requires at least one screenshot.
import { useRef, useState } from "react";
import { FiX, FiSend, FiPaperclip, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router";
import {
  categoriesFor,
  type TicketCategory,
  type TicketSource,
} from "~/lib/tickets";

interface Attachment {
  url: string;
  content_type?: string;
  filename?: string;
  size?: number;
  // Local-only flag while the file is still uploading.
  uploading?: boolean;
  // Local-only error message for failed uploads.
  error?: string;
}

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
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<TicketCategory>(categories[0].id);
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<number | null>(null);

  if (!open) return null;

  const uploadingCount = attachments.filter((a) => a.uploading).length;
  const usableAttachments = attachments.filter(
    (a) => !a.uploading && !a.error,
  );
  const canSubmit =
    description.trim().length >= 10 &&
    usableAttachments.length >= 1 &&
    uploadingCount === 0 &&
    !submitting;

  const reset = () => {
    setDescription("");
    setAttachments([]);
    setCategory(categories[0].id);
    setError("");
    setCreatedId(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, 6 - attachments.length);
    if (files.length === 0) return;

    // Stash placeholders so the UI shows them as uploading.
    const startIndex = attachments.length;
    setAttachments((prev) => [
      ...prev,
      ...files.map(
        (f): Attachment => ({
          url: "",
          uploading: true,
          filename: f.name,
          content_type: f.type,
          size: f.size,
        }),
      ),
    ]);

    await Promise.all(
      files.map(async (file, i) => {
        const idx = startIndex + i;
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/tickets/upload", {
            method: "POST",
            body: fd,
            credentials: "include",
          });
          const json = await res.json();
          setAttachments((prev) => {
            const next = [...prev];
            if (!res.ok) {
              next[idx] = {
                ...next[idx],
                uploading: false,
                error: json?.error || `Upload failed (HTTP ${res.status})`,
              };
            } else {
              next[idx] = {
                url: json.url,
                content_type: json.content_type,
                filename: json.filename,
                size: json.size,
                uploading: false,
              };
            }
            return next;
          });
        } catch {
          setAttachments((prev) => {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              uploading: false,
              error: "Upload failed. Try again.",
            };
            return next;
          });
        }
      }),
    );

    if (fileRef.current) fileRef.current.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

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
          attachments: usableAttachments.map((a) => ({
            url: a.url,
            content_type: a.content_type,
            filename: a.filename,
          })),
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
      setCreatedId(json.id);
      onCreated?.(json.id);
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
      <div className="w-full max-w-md rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] max-h-[90vh] overflow-y-auto">
        {createdId ? (
          // ── Thank-you state after a successful create ────────────
          <div className="text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-emerald-400">
              <FiCheckCircle className="h-6 w-6 text-neutral-900" />
            </div>
            <h2 className="mt-4 font-['Clash_Display'] text-xl text-neutral-900">
              Thanks, we've got it.
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Ticket <strong>#{createdId}</strong> is in. The team will be in
              touch to clear this within <strong>48 hours</strong>.
            </p>
            <p className="mt-3 text-xs text-neutral-500">
              To check the status, visit{" "}
              <Link
                to="/profile"
                onClick={close}
                className="font-bold text-violet-600 hover:underline"
              >
                your profile
              </Link>
              .
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-5 w-full rounded-xl border-2 border-neutral-900 bg-violet-500 px-4 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
            >
              Done
            </button>
          </div>
        ) : (
          // ── Form state ──────────────────────────────────────────
          <>
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
                onClick={close}
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

            {/* Mandatory screenshot picker */}
            <div className="mt-3">
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Screenshot <span className="text-rose-600">(required)</span>
              </label>
              <p className="text-[11px] text-neutral-500 mb-2">
                Show us what you're seeing. A screenshot saves a lot of
                back-and-forth.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={attachments.length >= 6}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-400 bg-white px-3 py-3 text-xs font-bold text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
              >
                <FiPaperclip className="h-4 w-4 text-violet-600" />
                {attachments.length === 0
                  ? "Add a screenshot"
                  : "Add another"}
              </button>

              {attachments.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {attachments.map((a, i) => (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-lg border-2 ${
                        a.error
                          ? "border-rose-300"
                          : a.uploading
                            ? "border-neutral-300"
                            : "border-neutral-900"
                      } bg-neutral-100`}
                    >
                      {a.url && !a.uploading && !a.error ? (
                        <img
                          src={a.url}
                          alt={a.filename || "Screenshot"}
                          className="block h-20 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-full items-center justify-center px-1 text-center text-[10px] text-neutral-500">
                          {a.error
                            ? a.error
                            : a.uploading
                              ? "Uploading…"
                              : "Pending"}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        aria-label="Remove"
                        className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 bg-white text-neutral-700 hover:bg-rose-100"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={close}
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
                {submitting
                  ? "Sending..."
                  : uploadingCount > 0
                    ? "Uploading…"
                    : "Send ticket"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
