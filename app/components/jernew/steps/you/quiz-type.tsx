// Quiz card 3: internship, full-time or either as a sliding segmented
// switch, then a start month on tear-off calendar tiles.
// Owned by builder A (You).
import { motion } from "framer-motion";
import { JOB_TYPES, START_MONTHS } from "../../data";
import { SPRING, SPRING_SNAP } from "../../motion";
import { cx, FOCUS_RING } from "../../ui";
import { radioKeyDown, rovingTab, useNumberKeys, type QuizCardProps } from "./quiz-keys";

export function TypeSwitch({ q, set, reduced, active, advance }: QuizCardProps) {
  const typeIdx = JOB_TYPES.findIndex((t) => t.id === q.jobType);
  const monthIdx = START_MONTHS.findIndex((m) => m.id === q.startMonth);

  useNumberKeys(active, (n) => {
    const t = JOB_TYPES[n - 1];
    if (t) set({ jobType: t.id });
  });

  return (
    <div className="space-y-6">
      <div>
        <p id="jn-type-label" className="mb-2 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">
          Kind of role
        </p>
        <div
          role="radiogroup"
          aria-labelledby="jn-type-label"
          className="grid grid-cols-3 gap-1 rounded-2xl border-2 border-studojo-ink bg-studojo-surface-muted p-1 shadow-[3px_3px_0_0_#191a23]"
        >
          {JOB_TYPES.map((t, i) => {
            const on = q.jobType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={rovingTab(i, typeIdx)}
                onClick={() => set({ jobType: t.id })}
                onKeyDown={(e) => radioKeyDown(e, i, JOB_TYPES.length, (k) => set({ jobType: JOB_TYPES[k].id }), advance)}
                className={cx(
                  "relative min-h-16 rounded-xl px-2 py-2 text-center font-satoshi",
                  FOCUS_RING,
                  on ? "text-white" : "text-studojo-ink hover:bg-white/70",
                )}
              >
                {on ? (
                  <motion.span
                    layoutId="jn-type-thumb"
                    aria-hidden
                    className="absolute inset-0 rounded-xl border-2 border-studojo-ink bg-studojo-purple-strong"
                    transition={reduced ? { duration: 0 } : SPRING}
                  />
                ) : null}
                <span className="relative block text-base font-bold leading-tight">{t.label}</span>
                <span className={cx("relative mt-0.5 block text-xs leading-tight", on ? "text-white/85" : "text-studojo-muted")}>
                  {t.blurb}
                </span>
                <span
                  aria-hidden
                  className={cx(
                    "absolute right-1.5 top-1 hidden text-[10px] font-bold sm:block",
                    on ? "text-white/70" : "text-studojo-muted",
                  )}
                >
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p id="jn-month-label" className="mb-2 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">
          When can you start?
        </p>
        <div role="radiogroup" aria-labelledby="jn-month-label" className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
          {START_MONTHS.map((mo, i) => {
            const on = q.startMonth === mo.id;
            const [mon, year] = mo.id === "flexible" ? ["Any", "Flexible"] : mo.label.split(" ");
            return (
              <motion.button
                key={mo.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={mo.label}
                tabIndex={rovingTab(i, monthIdx)}
                onClick={() => set({ startMonth: mo.id })}
                onKeyDown={(e) => radioKeyDown(e, i, START_MONTHS.length, (k) => set({ startMonth: START_MONTHS[k].id }), advance)}
                initial={false}
                animate={reduced ? undefined : { y: on ? -5 : 0, rotate: on ? -2 : 0 }}
                transition={SPRING_SNAP}
                className={cx(
                  "overflow-hidden rounded-xl border-2 border-studojo-ink text-center font-satoshi",
                  FOCUS_RING,
                  on ? "bg-studojo-purple-strong text-white shadow-[3px_3px_0_0_#191a23]" : "bg-white text-studojo-ink hover:bg-studojo-purple-bg",
                )}
              >
                <span aria-hidden className={cx("flex h-3 items-center justify-center gap-3 border-b-2 border-studojo-ink", on ? "bg-studojo-ink" : "bg-studojo-pink-bg")}>
                  <span className="h-1.5 w-1.5 rounded-full border border-studojo-ink bg-white" />
                  <span className="h-1.5 w-1.5 rounded-full border border-studojo-ink bg-white" />
                </span>
                <span aria-hidden className="block px-1 pb-1.5 pt-1">
                  <span className="block font-clash text-lg font-semibold leading-tight">{mon}</span>
                  <span className={cx("block text-[11px] font-bold", on ? "text-white/80" : "text-studojo-muted")}>{year}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
