// Quiz progress: a segmented counter you can tap to jump between cards, and
// on desktop a perforated "brief" ticket that fills in as you answer.
// Owned by builder A (You).
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import {
  cityLabel,
  isQuestionAnswered,
  JOB_TYPES,
  monthLabel,
  QUIZ_QUESTIONS,
  roleById,
  STAGES,
  toneById,
  type QuestionId,
} from "../../data";
import { SPRING_SNAP } from "../../motion";
import type { QuizAnswers } from "../../types";
import { cx, FOCUS_RING } from "../../ui";
import { joinList } from "./quiz-where";

export function QuizProgress({ q, card, onJump, reduced }: { q: QuizAnswers; card: number; onJump: (i: number) => void; reduced: boolean }) {
  const total = QUIZ_QUESTIONS.length;
  return (
    <nav aria-label="Questions" className="flex items-center gap-3 border-b-2 border-studojo-ink bg-studojo-purple-bg px-3 sm:px-4">
      <p className="shrink-0 whitespace-nowrap font-satoshi text-sm font-bold text-studojo-ink">
        <span className="tabular-nums">{card + 1}</span>
        <span className="font-medium text-studojo-muted"> of {total}</span>
      </p>
      <ol className="grid flex-1 grid-cols-6 gap-1.5">
        {QUIZ_QUESTIONS.map((qq, i) => {
          const done = isQuestionAnswered(q, qq.id);
          const here = i === card;
          return (
            <li key={qq.id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={here ? "step" : undefined}
                aria-label={`Question ${i + 1}, ${qq.kicker}${done ? ", answered" : ""}`}
                className={cx("group flex min-h-11 w-full items-center rounded-lg", FOCUS_RING)}
              >
                <span
                  aria-hidden
                  className={cx(
                    "relative block h-2.5 w-full overflow-hidden rounded-full border-2 border-studojo-ink",
                    here ? "bg-white" : "bg-white/70 group-hover:bg-white",
                  )}
                >
                  <motion.span
                    className={cx("absolute inset-0 origin-left", here ? "bg-studojo-purple-strong" : "bg-studojo-purple")}
                    initial={false}
                    animate={{ scaleX: done ? 1 : here ? 0.35 : 0 }}
                    transition={reduced ? { duration: 0 } : SPRING_SNAP}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** One-line answer for the brief ticket, or null when not answered yet. */
export function answerText(q: QuizAnswers, id: QuestionId): string | null {
  if (!isQuestionAnswered(q, id)) return null;
  switch (id) {
    case "role":
      return roleById(q.role).label;
    case "where":
      return joinList([...q.cities.map(cityLabel), ...(q.remote ? ["Remote"] : [])]);
    case "type":
      return `${JOB_TYPES.find((t) => t.id === q.jobType)?.label ?? ""}, from ${monthLabel(q.startMonth)}`;
    case "stage":
      return q.stage !== null ? STAGES[q.stage].label : null;
    case "project":
      return q.project.trim();
    case "tone":
      return toneById(q.tone).label;
  }
}

export function BriefTicket({ q, card, onJump, reduced }: { q: QuizAnswers; card: number; onJump: (i: number) => void; reduced: boolean }) {
  const answered = QUIZ_QUESTIONS.filter((qq) => isQuestionAnswered(q, qq.id)).length;
  return (
    <aside aria-label="Your brief so far" className="relative">
      <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal">
        <div className="flex items-center justify-between rounded-t-[14px] border-b-2 border-dashed border-studojo-ink bg-studojo-ink px-4 py-3 text-white">
          <span className="font-clash text-lg font-semibold">Your brief</span>
          <span className="font-satoshi text-xs font-bold tabular-nums text-white/80">
            {answered} of {QUIZ_QUESTIONS.length}
          </span>
        </div>
        <ul className="divide-y-2 divide-dashed divide-studojo-ink/15">
          {QUIZ_QUESTIONS.map((qq, i) => {
            const text = answerText(q, qq.id);
            return (
              <li key={qq.id}>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className={cx(
                    "flex min-h-12 w-full items-start gap-2.5 px-4 py-2.5 text-left font-satoshi hover:bg-studojo-purple-bg",
                    FOCUS_RING,
                    i === card && "bg-studojo-purple-bg",
                  )}
                >
                  <span
                    aria-hidden
                    className={cx(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink text-[10px] font-bold",
                      text ? "bg-studojo-purple text-white" : "bg-white text-studojo-muted",
                    )}
                  >
                    {text ? <FiCheck strokeWidth={4} /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">{qq.kicker}</span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={qq.id === "project" ? (text ? "set" : "empty") : (text ?? "empty")}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        className={cx("block text-sm leading-snug", text ? "line-clamp-2 font-bold text-studojo-ink" : "text-studojo-muted")}
                      >
                        {text ?? "Not yet"}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="rounded-b-[14px] border-t-2 border-dashed border-studojo-ink bg-studojo-purple-bg px-4 py-2.5 font-satoshi text-xs text-studojo-muted">
          This brief shapes who we match you with and how your first email reads.
        </p>
      </div>
    </aside>
  );
}
