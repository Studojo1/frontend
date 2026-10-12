// Pieces of the autopilot lever: the hold hook, the throttle track and the
// guardrails that unfold when you reach for notch 3.
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiLock } from "react-icons/fi";
import { GUARDRAILS, NOTCHES } from "../config";
import { SPRING, useMotionPresets } from "../motion";
import type { Notch } from "../types";
import { cx, FOCUS_RING } from "../ui";

/** Height of one notch row in the full lever (px). The knob moves by this much. */
export const ROW_H = 96;
export const notchY = (n: Notch) => (3 - n) * ROW_H + ROW_H / 2;

/** Press and hold for `ms` (pointer, Space or Enter). `holding` drives the knob while you hold. */
export function useHold(ms: number, onDone: () => void) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  const begin = () => {
    if (timer.current) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setHolding(false);
      done.current();
    }, ms);
  };
  useEffect(() => cancel, []);
  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      if (e.button === 0) begin();
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onKeyDown: (e: KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        begin();
      }
    },
    onKeyUp: (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") cancel();
    },
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  };
  return { holding, handlers };
}

/** The chunky throttle: a slot with three detents and a knob. */
export function Throttle({ notch, target, holding, ms, lockedFrom }: { notch: Notch; target: Notch | null; holding: boolean; ms: number; lockedFrom: Notch | null }) {
  const { reduced } = useMotionPresets();
  const y = holding && target ? notchY(target) : notchY(notch);
  return (
    <div aria-hidden className="relative w-14 shrink-0" style={{ height: ROW_H * 3 }}>
      <div className="absolute inset-y-3 left-1/2 w-4 -translate-x-1/2 rounded-full border-2 border-studojo-ink bg-studojo-surface-muted shadow-[inset_2px_2px_0_0_rgba(23,23,23,0.15)]" />
      {NOTCHES.map((n) => (
        <span
          key={n.n}
          className={cx(
            "absolute left-1/2 h-1 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full",
            lockedFrom !== null && n.n >= lockedFrom ? "bg-studojo-ink/20" : "bg-studojo-ink/50",
          )}
          style={{ top: notchY(n.n) }}
        />
      ))}
      {/* The lit stretch from the bottom to the knob. */}
      <motion.div
        className="absolute left-1/2 w-2 -translate-x-1/2 rounded-full bg-studojo-purple"
        style={{ bottom: 18 }}
        initial={false}
        animate={{ height: Math.max(0, ROW_H * 3 - y - 18) }}
        transition={holding ? { duration: ms / 1000, ease: "linear" } : reduced ? { duration: 0 } : SPRING}
      />
      <motion.div
        className="absolute left-1/2 top-0 -ml-6 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-studojo-ink shadow-[3px_3px_0_0_#8b5cf6]"
        initial={false}
        animate={{ y: y - 24, rotate: holding && !reduced ? -4 : 0 }}
        transition={holding ? { duration: ms / 1000, ease: "linear" } : reduced ? { duration: 0 } : SPRING}
      >
        <span className="flex flex-col gap-1">
          <span className="h-0.5 w-5 rounded-full bg-white/80" />
          <span className="h-0.5 w-5 rounded-full bg-white/80" />
          <span className="h-0.5 w-5 rounded-full bg-white/80" />
        </span>
      </motion.div>
    </div>
  );
}

/** One notch: a radio-like row with its name and what Senpai may do. */
export function NotchRow({ n, current, picked, locked, onPick }: { n: Notch; current: Notch; picked: boolean; locked: string | null; onPick: () => void }) {
  const meta = NOTCHES[n - 1];
  const on = n === current;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-describedby={`notch-${n}-may`}
      onClick={onPick}
      style={{ height: ROW_H - 8 }}
      className={cx(
        "my-1 flex w-full flex-col justify-center rounded-xl border-2 px-3 text-left transition-colors duration-150",
        on ? "border-studojo-ink bg-studojo-purple-bg shadow-[2px_2px_0_0_#191a23]" : picked ? "border-studojo-purple border-dashed bg-white" : "border-transparent hover:border-studojo-ink/30 hover:bg-white",
        FOCUS_RING,
      )}
    >
      <span className="flex items-center gap-2 font-satoshi text-sm font-bold text-studojo-ink">
        <span className="tabular-nums text-studojo-muted">{n}</span>
        {meta.name}
        {on ? <span className="rounded-full bg-studojo-ink px-1.5 text-[10px] uppercase tracking-wide text-white">Now</span> : null}
        {locked ? <FiLock aria-label="Locked" className="text-studojo-muted" /> : null}
      </span>
      <span id={`notch-${n}-may`} className="mt-0.5 line-clamp-3 font-satoshi text-xs leading-snug text-studojo-muted">
        {locked ?? meta.may}
      </span>
    </button>
  );
}

/** The seven notch-3 guardrails, unfolding row by row. */
export function Guardrails({ fitFloor, dim }: { fitFloor: number; dim?: boolean }) {
  const m = useMotionPresets();
  return (
    <motion.ol variants={m.list} initial="hidden" animate="show" className={cx("space-y-1.5", dim && "opacity-60")} aria-label={dim ? "Guardrails notch 3 would keep (locked)" : "Guardrails at notch 3"}>
      {GUARDRAILS.map((g, i) => (
        <motion.li
          key={g}
          variants={m.reduced ? m.fade : { hidden: { opacity: 0, height: 0, y: -6 }, show: { opacity: 1, height: "auto", y: 0, transition: { ...SPRING, delay: i * 0.07 } } }}
          className="overflow-hidden"
        >
          <span className="flex items-start gap-2 rounded-lg border-2 border-studojo-ink bg-white px-2.5 py-1.5 font-satoshi text-sm">
            {dim ? <FiLock aria-hidden className="mt-0.5 shrink-0 text-studojo-muted" /> : <FiCheck aria-hidden className="mt-0.5 shrink-0 text-[#047857]" />}
            {i === 0 ? g.replace("75", String(fitFloor)) : g}
          </span>
        </motion.li>
      ))}
    </motion.ol>
  );
}
