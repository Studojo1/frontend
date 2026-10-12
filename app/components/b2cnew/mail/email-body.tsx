// Email body pieces for Approvals: evidence underlines with the proof lens,
// the word diff, and the Day 0, 4, 9 timeline.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFileText, FiX } from "react-icons/fi";
import { lineById, RESUME_SECTION_LABEL, SEND_TIMELINE } from "../data";
import { QUICK } from "../motion";
import type { Draft } from "../types";
import { cx, FOCUS_RING } from "../ui";
import { diffParagraphs, segmentsOf, type DiffPart } from "./helpers";

/** Paragraphs with violet underlines on evidence phrases. Tapping one slides in the resume line behind it. */
export function EmailBody({ paragraphs, evidence, signoff, className, clamp }: { paragraphs: string[]; evidence: Draft["evidence"]; signoff?: string; className?: string; clamp?: boolean }) {
  const [lens, setLens] = useState<string | null>(null);
  const line = lens ? lineById(lens) : undefined;
  const toggle = (id: string | undefined) => setLens((v) => (v === id ? null : (id ?? null)));
  return (
    <div className={className}>
      <Clamp on={!!clamp} resetKey={paragraphs.join("|")}>
      <div className="space-y-2 font-satoshi text-[15px] leading-relaxed text-studojo-ink">
        {paragraphs.map((p, i) => (
          <p key={i}>
            {segmentsOf(p, evidence).map((seg, j) =>
              seg.lineId ? (
                // A span, not a button: buttons cannot wrap across lines, and these phrases sit mid-sentence.
                <span
                  key={j}
                  role="button"
                  tabIndex={0}
                  aria-expanded={lens === seg.lineId}
                  aria-label={`${seg.text}: show the resume line behind it`}
                  onClick={() => toggle(seg.lineId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(seg.lineId);
                    }
                  }}
                  className={cx(
                    "cursor-pointer rounded-sm underline decoration-studojo-purple decoration-2 underline-offset-4 [box-decoration-break:clone] hover:bg-studojo-purple-bg",
                    lens === seg.lineId && "bg-studojo-purple-bg",
                    FOCUS_RING,
                  )}
                >
                  {seg.text}
                </span>
              ) : (
                <span key={j}>{seg.text}</span>
              ),
            )}
          </p>
        ))}
        {signoff ? <p className="whitespace-pre-line text-studojo-muted">{signoff}</p> : null}
      </div>
      </Clamp>
      <AnimatePresence initial={false}>
        {line ? (
          <motion.div
            key={line.id}
            role="note"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={QUICK}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-studojo-ink bg-white p-2.5 shadow-[2px_2px_0_0_#191a23]">
              <FiFileText aria-hidden className="mt-0.5 shrink-0 text-studojo-purple-strong" />
              <div className="min-w-0 flex-1">
                <p className="font-satoshi text-[11px] font-bold uppercase tracking-wide text-studojo-muted">
                  From your resume{RESUME_SECTION_LABEL[line.section] ? ` · ${RESUME_SECTION_LABEL[line.section]}` : ""}
                </p>
                <p className="mt-0.5 rounded-md bg-studojo-yellow-bg px-1.5 py-0.5 font-satoshi text-sm text-studojo-ink">{line.text}</p>
              </div>
              <button type="button" aria-label="Close the resume line" onClick={() => setLens(null)} className={cx("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-studojo-surface-muted", FOCUS_RING)}>
                <FiX aria-hidden />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * About six lines of the body, with "Read all" when there is more. Keeps the
 * card short enough that its actions stay in reach.
 */
function Clamp({ on, resetKey, children }: { on: boolean; resetKey: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  useLayoutEffect(() => {
    setOpen(false);
  }, [resetKey]);
  useLayoutEffect(() => {
    const el = box.current;
    setMore(!!el && el.scrollHeight > el.clientHeight + 4);
  }, [resetKey, open, on]);
  if (!on) return <>{children}</>;
  const clamped = !open;
  return (
    <div>
      <div ref={box} className={cx("relative", clamped && "max-h-[10.25rem] overflow-hidden")}>
        {children}
        {clamped && more ? <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" /> : null}
      </div>
      {more || open ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cx("mt-1 min-h-9 rounded-lg px-1 font-satoshi text-sm font-bold text-studojo-purple-strong underline underline-offset-4", FOCUS_RING)}
        >
          {open ? "Show less" : "Read all"}
        </button>
      ) : null}
    </div>
  );
}

/** A word diff: removed words struck through, added words in violet. */
export function DiffBody({ before, after }: { before: string[]; after: string[] }) {
  const parts = diffParagraphs(before, after);
  return (
    <div className="space-y-2 font-satoshi text-[15px] leading-relaxed text-studojo-ink">
      {parts.map((para, i) => (
        <p key={i}>
          {para.map((x, j) => (
            <DiffSpan key={j} part={x} />
          ))}
        </p>
      ))}
    </div>
  );
}

function DiffSpan({ part }: { part: DiffPart }) {
  if (part.op === "same") return <span>{part.text}</span>;
  if (part.op === "del")
    return (
      <del className="rounded-sm bg-studojo-pink-bg text-[#be185d] decoration-2">
        <span className="sr-only">Removed: </span>
        {part.text}
      </del>
    );
  return (
    <ins className="rounded-sm bg-studojo-purple-bg font-bold text-studojo-purple-strong no-underline">
      <span className="sr-only">Added: </span>
      {part.text}
    </ins>
  );
}

/**
 * The sequence this draft belongs to. The draft's own email is solid; the
 * others can be previewed. `onPick` gets the email id.
 */
export function SequenceTimeline({ kind, view, onPick, pageLive }: { kind: Draft["kind"]; view: Draft["kind"]; onPick: (k: Draft["kind"]) => void; pageLive: boolean }) {
  return (
    <ol aria-label="When each email goes" className="flex items-stretch gap-1.5">
      {SEND_TIMELINE.map((t, i) => {
        const own = t.id === kind;
        const on = t.id === view;
        return (
          <li key={t.id} className="flex min-w-0 flex-1 items-center gap-1.5">
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onPick(t.id)}
              title={t.id === "follow" && !pageLive ? "Goes without the link while your page is private" : t.note}
              className={cx(
                "flex min-h-11 w-full min-w-0 flex-col items-start justify-center rounded-lg border-2 px-2 py-1 text-left font-satoshi",
                on ? "border-studojo-ink bg-studojo-ink text-white" : own ? "border-studojo-ink bg-white" : "border-dashed border-studojo-ink/40 bg-white text-studojo-muted",
                FOCUS_RING,
              )}
            >
              <span className={cx("text-[11px] font-bold uppercase tracking-wide", on ? "text-white/70" : "text-studojo-muted")}>Day {t.day}</span>
              <span className="w-full truncate text-xs font-bold">{t.label}</span>
            </button>
            {i < SEND_TIMELINE.length - 1 ? <span aria-hidden className="hidden h-0.5 w-2 shrink-0 bg-studojo-ink/30 sm:block" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
