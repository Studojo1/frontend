// More shared primitives for /jernew: Switch, SignalMeter, AnimatedNumber,
// BrowserFrame, LiveRegion, Kbd. Import them from "../ui" (re-exported).
// Shared file: owned by the foundation.
import { useEffect, useId, useRef, type ReactNode } from "react";
import { animate, motion } from "framer-motion";
import { FiLock } from "react-icons/fi";
import { GROUP_STYLE } from "./config";
import { SPRING_SNAP, useSafeReducedMotion } from "./motion";
import type { GroupId } from "./types";
import { cx, FOCUS_RING } from "./ui-base";
import { formatCount } from "./data-people";

// ── Switch ──────────────────────────────────────────────────────────────────

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  /** Locked switches cannot be changed. Say why in lockedReason. */
  locked?: boolean;
  lockedReason?: ReactNode;
  tone?: GroupId;
  className?: string;
  /**
   * On, but waiting on something else (for example the 18+ check). Drawn as
   * a hatched track with the knob half-way, announced as "mixed", with
   * pendingCaption saying what turns it on.
   */
  pending?: boolean;
  pendingCaption?: ReactNode;
}

const HATCH = "repeating-linear-gradient(135deg, #fbcfe8 0 5px, #ffffff 5px 10px)";

/** A labelled row with a role="switch" toggle. The whole label is clickable. */
export function Switch({ checked, onChange, label, description, locked, lockedReason, tone = "you", className, pending, pendingCaption }: SwitchProps) {
  const id = useId();
  const style = GROUP_STYLE[tone];
  const half = checked && pending;
  return (
    <div className={cx("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className={cx("block font-satoshi text-base font-bold text-studojo-ink", locked ? "cursor-not-allowed" : "cursor-pointer")}>
          {label}
        </label>
        {description ? <p id={`${id}-d`} className="mt-1 font-satoshi text-sm text-studojo-muted">{description}</p> : null}
        {half && pendingCaption ? (
          <p id={`${id}-p`} className={cx("mt-1.5 font-satoshi text-sm font-bold", style.text)}>
            {pendingCaption}
          </p>
        ) : null}
        {locked && lockedReason ? (
          <p id={`${id}-l`} className="mt-1.5 inline-flex items-center gap-1.5 font-satoshi text-sm font-medium text-studojo-ink">
            <FiLock aria-hidden className="shrink-0" /> {lockedReason}
          </p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={half ? "mixed" : checked}
        aria-describedby={cx(description ? `${id}-d` : "", half && pendingCaption ? `${id}-p` : "", locked && lockedReason ? `${id}-l` : "") || undefined}
        disabled={locked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 inline-flex h-11 w-[4.25rem] shrink-0 items-center rounded-full border-2 border-studojo-ink p-1 transition-colors duration-200",
          FOCUS_RING,
          half ? "bg-white" : checked ? style.solid : "bg-white",
          locked && "cursor-not-allowed opacity-60",
        )}
        style={half ? { backgroundImage: HATCH } : undefined}
      >
        <span className="sr-only">{half ? "Waiting" : checked ? "On" : "Off"}</span>
        <motion.span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-studojo-ink bg-white shadow-[2px_2px_0_0_#191a23]"
          animate={{ x: half ? 11 : checked ? 22 : 0 }}
          initial={false}
          transition={SPRING_SNAP}
        >
          {locked ? <FiLock className="text-xs" /> : null}
        </motion.span>
      </button>
    </div>
  );
}

// ── SignalMeter ─────────────────────────────────────────────────────────────

export interface SignalMeterProps {
  /** 0 to 100. */
  value: number;
  label: string;
  /** Text after the label, for example "Specific" or "72%". Defaults to the value. */
  valueText?: string;
  bars?: number;
  tone?: GroupId;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Signal-strength bars that fill as the value grows. role="meter". */
export function SignalMeter({ value, label, valueText, bars = 5, tone = "you", size = "md", className }: SignalMeterProps) {
  const v = Math.max(0, Math.min(100, value));
  const lit = v === 0 ? 0 : Math.max(1, Math.round((v / 100) * bars));
  const h = size === "sm" ? 18 : size === "lg" ? 40 : 28;
  const style = GROUP_STYLE[tone];
  const text = valueText ?? `${Math.round(v)}%`;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-valuetext={text}
      className={cx("inline-flex items-end gap-3", className)}
    >
      <span aria-hidden className="flex items-end gap-1" style={{ height: h }}>
        {Array.from({ length: bars }, (_, i) => {
          const barH = Math.round(h * (0.35 + (0.65 * (i + 1)) / bars));
          return (
            <span key={i} className="relative block w-2.5 overflow-hidden rounded-[3px] border-2 border-studojo-ink bg-white" style={{ height: barH }}>
              <motion.span
                className={cx("absolute inset-0 origin-bottom", style.solid)}
                initial={false}
                animate={{ scaleY: i < lit ? 1 : 0 }}
                transition={{ ...SPRING_SNAP, delay: i * 0.03 }}
              />
            </span>
          );
        })}
      </span>
      <span className="font-satoshi text-sm leading-tight">
        <span className="block font-bold text-studojo-ink">{label}</span>
        <span className="block text-studojo-muted">{text}</span>
      </span>
    </div>
  );
}

// ── AnimatedNumber ──────────────────────────────────────────────────────────

export interface AnimatedNumberProps {
  value: number;
  /** Formats the number for display. Defaults to whole numbers with Indian grouping. */
  format?: (n: number) => string;
  /** Seconds. */
  duration?: number;
  className?: string;
}

const defaultFormat = formatCount;

/**
 * A number that counts to its new value. Server render and first frame show
 * the final value, so there is no hydration mismatch. Reduced motion: no count.
 */
export function AnimatedNumber({ value, format = defaultFormat, duration = 0.5, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const reduced = useSafeReducedMotion();
  const fmt = useRef(format);
  useEffect(() => {
    fmt.current = format;
  });
  useEffect(() => {
    const el = ref.current;
    const from = prev.current;
    prev.current = value;
    if (!el || from === value) return;
    if (reduced) {
      el.textContent = fmt.current(value);
      return;
    }
    const controls = animate(from, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        el.textContent = fmt.current(n);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduced]);
  return (
    <span ref={ref} className={cx("tabular-nums", className)}>
      {format(value)}
    </span>
  );
}

// ── BrowserFrame ────────────────────────────────────────────────────────────

export interface BrowserFrameProps {
  url: string;
  children: ReactNode;
  className?: string;
  /** Extra controls on the right of the address bar. */
  actions?: ReactNode;
}

/** A small browser window around a page preview. */
export function BrowserFrame({ url, children, className, actions }: BrowserFrameProps) {
  return (
    <div className={cx("overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal-lg", className)}>
      <div className="flex items-center gap-2 border-b-2 border-studojo-ink bg-studojo-surface-muted px-3 py-2">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-studojo-ink bg-studojo-pink" />
          <span className="h-3 w-3 rounded-full border-2 border-studojo-ink bg-studojo-yellow" />
          <span className="h-3 w-3 rounded-full border-2 border-studojo-ink bg-studojo-green" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border-2 border-studojo-ink bg-white px-2.5 py-1 font-satoshi text-xs text-studojo-muted">
          <FiLock aria-hidden className="shrink-0 text-[11px]" />
          <span className="truncate">{url}</span>
        </span>
        {actions}
      </div>
      {children}
    </div>
  );
}

// ── LiveRegion and Kbd ──────────────────────────────────────────────────────

/** Polite announcement for screen readers. visible shows it as a status line too. */
export function LiveRegion({ message, visible = false, className }: { message: string; visible?: boolean; className?: string }) {
  return (
    <div aria-live="polite" role="status" className={cx(visible ? className : "sr-only")}>
      {message}
    </div>
  );
}

/** A keyboard key cap, for hints like "Press Enter". */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={cx("inline-flex min-w-6 items-center justify-center rounded-md border-2 border-studojo-ink bg-white px-1.5 font-satoshi text-[11px] font-bold leading-5 text-studojo-ink shadow-[1px_1px_0_0_#191a23]", className)}>
      {children}
    </kbd>
  );
}
