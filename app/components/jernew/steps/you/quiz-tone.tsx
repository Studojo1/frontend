// Quiz card 6: email tone as three fanned letters (Direct, Warm, Bold). The
// one you pick straightens, lifts and gets a "Sounds like me" stamp. Each
// letter shows the real opening of your first email to your best match, built
// by the same code as the email step, so you pick exactly what gets sent.
// Owned by builder A (You).
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { emailOpener, projectLine, projectSentence, rankMatches, STUDENT, TONES } from "../../data";
import { SPRING, SPRING_SOFT } from "../../motion";
import { cx, FOCUS_RING } from "../../ui";
import { radioKeyDown, rovingTab, useNumberKeys, type QuizCardProps } from "./quiz-keys";

const FAN = [-2, 0, 2];
const ACCENT = ["bg-studojo-teal", "bg-studojo-pink", "bg-studojo-orange"];

export function TonePicker({ q, set, reduced, active, advance }: QuizCardProps) {
  const selected = TONES.findIndex((t) => t.id === q.tone);
  const best = useMemo(() => rankMatches(q)[0], [q]);
  const proof = projectSentence(projectLine(q)).sentence;

  useNumberKeys(active, (n) => {
    const t = TONES[n - 1];
    if (t) set({ tone: t.id });
  });

  return (
    <div role="radiogroup" aria-label="Email tone" className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5 lg:pt-3">
      {TONES.map((t, i) => {
        const on = selected === i;
        const dim = selected >= 0 && !on;
        return (
          <motion.button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={rovingTab(i, selected)}
            onClick={() => set({ tone: t.id })}
            onKeyDown={(e) => radioKeyDown(e, i, TONES.length, (k) => set({ tone: TONES[k].id }), advance)}
            initial={false}
            animate={
              reduced
                ? { opacity: dim ? 0.75 : 1 }
                : { rotate: on ? 0 : FAN[i], y: on ? -8 : 0, scale: on ? 1.02 : 1, opacity: dim ? 0.75 : 1 }
            }
            whileHover={reduced || on ? undefined : { rotate: 0, y: -4 }}
            transition={SPRING}
            className={cx(
              "relative flex flex-col overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white text-left font-satoshi",
              FOCUS_RING,
              on ? "shadow-brutal-lg" : "shadow-[3px_3px_0_0_#191a23]",
            )}
          >
            <span aria-hidden className={cx("h-2 w-full border-b-2 border-studojo-ink", ACCENT[i])} />
            <span className="flex items-center gap-2 px-4 pt-3">
              <span className="font-clash text-xl font-semibold text-studojo-ink">{t.label}</span>
              <span aria-hidden className={on ? "hidden" : "ml-auto hidden rounded-md border-2 border-studojo-ink/30 px-1.5 text-[11px] font-bold leading-5 text-studojo-muted [@media(hover:hover)_and_(pointer:fine)]:inline"}>
                {i + 1}
              </span>
            </span>
            <span className="px-4 text-sm text-studojo-muted">{t.blurb}</span>
            <span className="mx-4 mb-4 mt-3 block rounded-xl border-2 border-dashed border-studojo-ink/25 bg-studojo-surface-muted p-3">
              <span className="sr-only">How it opens: </span>
              <span className="block text-[15px] leading-relaxed text-studojo-ink">
                Hi {best.manager.first}, {emailOpener(t.id, best)} {proof}
              </span>
              <span className="mt-2 block text-sm text-studojo-muted">
                {t.signoff} {STUDENT.first}
              </span>
            </span>
            <AnimatePresence>
              {on ? (
                <motion.span
                  key="stamp"
                  aria-hidden
                  className="absolute right-3 top-4 inline-flex items-center gap-1 rounded-lg border-[3px] border-studojo-purple-strong bg-white px-2 py-0.5 font-clash text-xs font-semibold uppercase tracking-wider text-studojo-purple-strong"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.8, rotate: -16 }}
                  animate={{ opacity: 1, scale: 1, rotate: -6 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0.15 } : SPRING_SOFT}
                >
                  <FiCheck /> Sounds like me
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
