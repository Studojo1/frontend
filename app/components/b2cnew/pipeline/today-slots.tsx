// The slot bar for today's sends: one slot per email under the daily cap.
// Slots fill left to right; failed sends turn green under one "+2 back" label.
// Under reduced motion they simply fade in. Owned by Group 2.
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "../motion";
import { cx } from "../ui";

export function SlotBar({ cap, used, failed, held }: { cap: number; used: number; failed: number; held: boolean }) {
  const reduced = useSafeReducedMotion();
  const label = held
    ? `Sending held. 0 of ${cap} slots used today`
    : `${used} of ${cap} sending slots used today${failed ? `, ${failed} failed and given back` : ""}`;
  return (
    <div role="img" aria-label={label} className="relative pt-5">
      {!held && failed > 0 && used >= failed ? (
        <motion.span
          aria-hidden
          className="absolute top-0 whitespace-nowrap font-satoshi text-[11px] font-bold text-[#047857]"
          style={{ right: `${100 - (used / cap) * 100}%` }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0.18 } : { delay: 1.1, type: "spring", stiffness: 420, damping: 22 }}
        >
          +{failed} back
        </motion.span>
      ) : null}
      <div className="flex h-7 gap-[2px]">
        {Array.from({ length: cap }, (_, i) => {
          const on = !held && i < used;
          const back = on && i >= used - failed;
          // Fill in under a second however big the cap is.
          const delay = reduced ? 0 : Math.min(0.9, (i / Math.max(1, cap)) * 0.9);
          return (
            <span key={i} className="relative flex-1">
              <span
                className={cx(
                  "absolute inset-0 rounded-[3px] border",
                  held ? "border-dashed border-studojo-ink/30 bg-studojo-orange-bg" : "border-studojo-ink/25 bg-white",
                )}
              />
              {on ? (
                <motion.span
                  className={cx("absolute inset-0 origin-bottom rounded-[3px] border", back ? "border-studojo-green bg-studojo-green-bg" : "border-studojo-ink bg-studojo-ink")}
                  initial={reduced ? { opacity: 0 } : { scaleY: 0 }}
                  animate={reduced ? { opacity: 1 } : { scaleY: 1 }}
                  transition={reduced ? { duration: 0.18 } : { delay, type: "spring", stiffness: 600, damping: 30 }}
                />
              ) : null}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-satoshi text-xs text-studojo-muted" aria-hidden>
        <Legend cls="border-studojo-ink bg-studojo-ink">Sent</Legend>
        <Legend cls="border-studojo-green bg-studojo-green-bg">Failed, credit back</Legend>
        <Legend cls="border-studojo-ink/25 bg-white">Free slot</Legend>
      </div>
    </div>
  );
}

function Legend({ cls, children }: { cls: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cx("h-3 w-2 rounded-[2px] border", cls)} />
      {children}
    </span>
  );
}
