// Quiz card 5: your best project. A live highlighter marks numbers, tools
// and outcomes as you type; three proof lights and a specificity meter
// reward them; hint chips add what is missing. Owned by builder A (You).
import { useEffect, useId, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFileText, FiPlus } from "react-icons/fi";
import { QUIZ_MIN_PROJECT_CHARS } from "../../config";
import { PROJECT_HINTS, SAMPLE_PROJECT, scoreSpecificity, type Specificity } from "../../data";
import { SPRING_SNAP } from "../../motion";
import { Chip, cx, LiveRegion, SignalMeter } from "../../ui";
import { highlightRuns, MARK_STYLE, type MarkKind } from "./quiz-highlight";
import type { QuizCardProps } from "./quiz-keys";

const FIELD = "px-4 py-3 font-satoshi text-base leading-relaxed whitespace-pre-wrap break-words";

export function ProjectMeter({ q, set, reduced, advance }: QuizCardProps) {
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const text = q.project;
  const spec = scoreSpecificity(text);
  const runs = useMemo(() => highlightRuns(text), [text]);
  const left = Math.max(0, QUIZ_MIN_PROJECT_CHARS - text.trim().length);

  // Grow with the text, so the highlighter behind it never has to scroll.
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const write = (next: string, focus = true) => {
    set({ project: next });
    if (!focus) return;
    requestAnimationFrame(() => {
      const el = area.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.length, next.length);
    });
  };

  const lights: { kind: MarkKind; on: boolean }[] = [
    { kind: "number", on: spec.hasNumber },
    { kind: "tool", on: spec.hasTool },
    { kind: "outcome", on: spec.hasOutcome },
  ];

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl border-2 border-studojo-ink bg-white shadow-[3px_3px_0_0_#191a23] focus-within:ring-4 focus-within:ring-studojo-purple/40">
        <div aria-hidden className={cx("pointer-events-none absolute inset-0 border-2 border-transparent text-transparent", FIELD)}>
          {runs.map((r, i) =>
            r.kind ? (
              <mark key={i} className="rounded-[4px] text-transparent" style={{ backgroundColor: MARK_STYLE[r.kind].bg, boxShadow: `0 0 0 2px ${MARK_STYLE[r.kind].bg}` }}>
                {r.text}
              </mark>
            ) : (
              <span key={i}>{r.text}</span>
            ),
          )}
          {"​"}
        </div>
        <label htmlFor={id} className="sr-only">
          Your best project
        </label>
        <textarea
          id={id}
          ref={area}
          rows={4}
          value={text}
          maxLength={400}
          onChange={(e) => set({ project: e.currentTarget.value })}
          onKeyDown={(e) => {
            // Enter moves on (it is a sentence or two); Shift+Enter still adds a line.
            if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
            e.preventDefault();
            if (left === 0) advance();
          }}
          placeholder="Built a campus expense tracker used by 1,200 students with React; settles a bill in one tap."
          aria-describedby={`${id}-count ${id}-keys`}
          className={cx(
            "relative block min-h-32 w-full resize-none overflow-hidden rounded-2xl border-2 border-transparent bg-transparent text-studojo-ink outline-none placeholder:text-studojo-muted",
            FIELD,
          )}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p id={`${id}-count`} className="font-satoshi text-sm text-studojo-muted">
          {left > 0 ? (
            <>
              <span className="font-bold text-studojo-ink">{left}</span> more characters to go
            </>
          ) : (
            <span className={cx(spec.level === "Sharp" && "font-bold text-studojo-ink")}>{statusFor(spec)}</span>
          )}
        </p>
        <span className="font-satoshi text-xs text-studojo-muted">
          <span id={`${id}-keys`} className="hidden sm:inline">Enter for next, Shift+Enter for a new line. </span>
          {text.length} of 400
        </span>
      </div>

      <div className="grid gap-3 rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg p-3 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-5 sm:p-4">
        <SignalMeter value={spec.score} label="Specificity" valueText={spec.level} size="lg" />
        <ul className="flex flex-wrap gap-2" aria-label="What we look for">
          {lights.map(({ kind, on }) => (
            <li
              key={kind}
              className={cx(
                "inline-flex min-h-9 items-center gap-2 rounded-full border-2 px-3 font-satoshi text-sm font-bold",
                on ? "border-studojo-ink bg-white text-studojo-ink" : "border-dashed border-studojo-ink/30 text-studojo-muted",
              )}
            >
              <span aria-hidden className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-studojo-ink bg-white">
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: MARK_STYLE[kind].bg }}
                  initial={false}
                  animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : SPRING_SNAP}
                />
              </span>
              {MARK_STYLE[kind].label}
              <span className="sr-only">{on ? ", found" : ", not yet"}</span>
            </li>
          ))}
        </ul>
      </div>
      <LiveRegion message={text.trim() ? `Specificity: ${spec.level}` : ""} />

      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {PROJECT_HINTS.filter((h) => spec.missing.includes(h.id)).map((h) => (
            <motion.span
              key={h.id}
              layout={!reduced}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={SPRING_SNAP}
            >
              <Chip icon={<FiPlus />} onClick={() => write(appendHint(text, h.insert))}>
                {h.label}
              </Chip>
            </motion.span>
          ))}
          {text.trim() !== SAMPLE_PROJECT ? (
            <motion.span key="resume" layout={!reduced} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Chip icon={<FiFileText />} tone="you" onClick={() => write(SAMPLE_PROJECT)}>
                Use Splitkart from my resume
              </Chip>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * The line under the box follows the meter, so it never praises a vague
 * answer. Only Specific and Sharp answers go into the email as written.
 */
function statusFor(spec: Specificity): string {
  if (spec.level === "Sharp") return "Sharp. This line goes into your first email.";
  if (spec.level === "Specific") {
    const next = spec.missing[0];
    const what = next === "number" ? "A number" : next === "outcome" ? "Saying what changed" : next === "tool" ? "Naming the tool" : "A little more detail";
    return `Good. ${what} would make it sharper.`;
  }
  return spec.hasNumber || spec.hasOutcome ? "Getting there. Name the tool or what changed." : "Add a number or a result to make this land.";
}

/** Adds a hint to the end of the text, before any closing full stop. */
function appendHint(text: string, insert: string): string {
  const t = text.trimEnd();
  if (!t) return insert.replace(/^[\s,]+/, "").replace(/^./, (c) => c.toUpperCase());
  const stop = t.endsWith(".");
  return `${stop ? t.slice(0, -1) : t}${insert}${stop ? "." : ""}`;
}
