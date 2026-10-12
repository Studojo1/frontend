// The Simulated day control: ‹ Day 6 › with a 0 to 14 slider. Every number
// in the app follows it. Shared file: owned by the foundation.
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MAX_DAY } from "../config";
import { useB2C } from "../core/store";
import { dayDate } from "../data";
import { QUICK } from "../motion";
import { cx, FOCUS_RING, RANGE_THUMB } from "../ui";

export function DayControl({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { s, dispatch } = useB2C();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const id = useId();
  const set = (day: number) => dispatch({ type: "SET_DAY", day });
  const date = dayDate(s.day);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Back to the Day button, so focus is not left inside a closed popover.
      wrap.current?.querySelector<HTMLElement>("[aria-controls]")?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const arrow = cx("inline-flex items-center justify-center rounded-lg hover:bg-studojo-purple-bg disabled:opacity-30", compact ? "h-7 w-7" : "h-9 w-9", FOCUS_RING);
  return (
    <div ref={wrap} className={cx("relative inline-flex items-center", className)}>
      <button type="button" className={arrow} aria-label="Previous simulated day" disabled={s.day <= 0} onClick={() => set(s.day - 1)}>
        <FiChevronLeft aria-hidden />
      </button>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Simulated day ${s.day}, ${date.label}. Change day`}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg font-satoshi font-bold tabular-nums hover:bg-studojo-purple-bg",
          compact ? "min-h-7 px-1.5 text-xs" : "min-h-9 border-2 border-studojo-ink bg-white px-2.5 text-sm",
          FOCUS_RING,
        )}
      >
        {compact ? null : <span className="font-medium text-studojo-muted">Simulated</span>}
        Day {s.day}
        {compact ? null : <span className="hidden font-medium text-studojo-muted xl:inline">· {date.label}</span>}
      </button>
      <button type="button" className={arrow} aria-label="Next simulated day" disabled={s.day >= MAX_DAY} onClick={() => set(s.day + 1)}>
        <FiChevronRight aria-hidden />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={QUICK}
            className="absolute left-1/2 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-brutal"
          >
            <label htmlFor={`${id}-r`} className="block font-satoshi text-sm font-bold text-studojo-ink">
              Simulated day: {s.day} ({date.label})
            </label>
            <p className="mt-0.5 font-satoshi text-xs text-studojo-muted">Move time to see sends, replies and events play out. Nothing is real.</p>
            <input
              id={`${id}-r`}
              type="range"
              min={0}
              max={MAX_DAY}
              step={1}
              value={s.day}
              onChange={(e) => set(Number(e.target.value))}
              className={cx("mt-3 h-9 w-full cursor-pointer appearance-none rounded-full border-2 border-studojo-ink bg-studojo-purple-bg", RANGE_THUMB, FOCUS_RING)}
            />
            <div aria-hidden className="mt-1 flex justify-between font-satoshi text-[11px] text-studojo-muted">
              <span>Day 0</span>
              <span>Day 7</span>
              <span>Day 14</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
