// Interactive primitives for /b2cnew: TabStrip (also used as a segmented
// control), HoldButton, EvidenceChip with its proof-lens popover, and the
// Toast view. Import from "../ui". Shared file: owned by the foundation.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFileText } from "react-icons/fi";
import { lineById, RESUME_SECTION_LABEL } from "./data";
import { bumpAnimation, QUICK, SPRING_SNAP, useSafeReducedMotion } from "./motion";
import { cx, FOCUS_RING, PRESS } from "../jernew/ui-base";

// ── TabStrip and Segmented ─────────────────────────────────────────────────

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number | null;
  /** A small dot (unseen). */
  dot?: boolean;
  icon?: ReactNode;
  /** Key hint shown on fine pointers. */
  kbd?: string;
}

export interface TabStripProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Accessible name of the tablist. */
  label: string;
  /** Shared layoutId for the sliding pill (see LAYOUT in motion.ts). */
  layoutId: string;
  /** id prefix: each tab gets id `${idPrefix}-tab-${id}` and controls `${idPrefix}-panel`. */
  idPrefix?: string;
  size?: "sm" | "md";
  /** "underline" for the workspace tabs, "pill" for segmented controls. */
  look?: "underline" | "pill";
  /** Bumps that tab's count once per new key (results landed). */
  bump?: { id: T; key: number } | null;
  className?: string;
}

/**
 * role="tablist" with roving tabindex and arrow keys (Home and End too).
 * Render the panel with id `${idPrefix}-panel`, role="tabpanel" and
 * aria-labelledby `${idPrefix}-tab-${value}`.
 */
export function TabStrip<T extends string>({ items, value, onChange, label, layoutId, idPrefix = "b2c", size = "md", look = "underline", bump, className }: TabStripProps<T>) {
  const reduced = useSafeReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = items.length;
    const to = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    refs.current[to]?.focus();
    onChange(items[to].id);
  };
  return (
    <div role="tablist" aria-label={label} className={cx("flex min-w-0 items-stretch", look === "pill" ? "gap-1 rounded-xl border-2 border-studojo-ink bg-white p-1" : "gap-1", className)}>
      {items.map((t, i) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${t.id}`}
            aria-selected={on}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              "relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-satoshi font-bold",
              size === "sm" ? "min-h-9 px-2.5 text-[13px]" : "min-h-11 px-3 text-sm",
              look === "pill" ? "flex-1 rounded-lg" : "rounded-xl",
              on ? (look === "pill" ? "text-white" : "text-studojo-ink") : "text-studojo-muted hover:text-studojo-ink",
              FOCUS_RING,
            )}
          >
            {on ? (
              <motion.span
                layoutId={layoutId}
                transition={SPRING_SNAP}
                aria-hidden
                className={cx(
                  "absolute",
                  look === "pill" ? "inset-0 rounded-lg bg-studojo-ink" : "inset-x-2 -bottom-[2px] h-[3px] rounded-full bg-studojo-ink",
                )}
              />
            ) : null}
            <span className="relative inline-flex items-center gap-1.5">
              {t.icon ? <span aria-hidden className="text-[1.05em]">{t.icon}</span> : null}
              {t.label}
              {t.count != null ? (
                <motion.span
                  key={bump?.id === t.id ? bump.key : "c"}
                  {...(bump?.id === t.id ? bumpAnimation(reduced) : {})}
                  className={cx("rounded-full px-1.5 text-[11px] tabular-nums", on ? (look === "pill" ? "bg-white/20" : "bg-studojo-ink text-white") : "bg-studojo-ink/10")}
                >
                  {t.count}
                </motion.span>
              ) : null}
              {t.dot ? <span aria-label="new" className="h-2 w-2 rounded-full border border-studojo-ink bg-studojo-pink" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** A segmented control: TabStrip with the pill look. */
export function Segmented<T extends string>(props: Omit<TabStripProps<T>, "look">) {
  return <TabStrip {...props} look="pill" />;
}

// ── HoldButton ──────────────────────────────────────────────────────────────

export interface HoldButtonProps {
  onConfirm: () => void;
  children: ReactNode;
  /** Hold time in ms. Raising the autopilot lever and mock payments use 600. */
  ms?: number;
  /** Read by screen readers, for example "Hold to approve all 12". */
  label?: string;
  tone?: "primary" | "dark" | "green";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

/** Press and hold (pointer, Space or Enter) to confirm. A fill shows progress; letting go early cancels. */
export function HoldButton({ onConfirm, children, ms = 600, label, tone = "primary", size = "md", disabled, className }: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);
  const reduced = useSafeReducedMotion();
  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  const begin = () => {
    if (disabled || timer.current) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setHolding(false);
      onConfirm();
    }, ms);
  };
  useEffect(() => cancel, []);
  const base =
    tone === "primary" ? "bg-studojo-purple-strong text-white" : tone === "dark" ? "bg-studojo-ink text-white" : "bg-studojo-green text-studojo-ink";
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onPointerDown={(e) => {
        if (e.button === 0) begin();
      }}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          begin();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") cancel();
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={cx(
        "relative inline-flex select-none items-center justify-center gap-2 overflow-hidden border-2 border-studojo-ink font-satoshi font-bold shadow-brutal touch-none",
        size === "sm" ? "min-h-11 rounded-xl px-3 text-sm" : "min-h-12 rounded-xl px-5 text-base",
        base,
        PRESS,
        FOCUS_RING,
        disabled && "cursor-not-allowed opacity-50 shadow-none",
        className,
      )}
    >
      <motion.span
        aria-hidden
        className={cx("absolute inset-y-0 left-0 origin-left", tone === "green" ? "bg-[#34d399]" : "bg-white/25")}
        style={{ width: "100%" }}
        initial={false}
        animate={{ scaleX: holding ? 1 : 0 }}
        transition={holding ? { duration: ms / 1000, ease: "linear" } : reduced ? { duration: 0 } : QUICK}
      />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

// ── EvidenceChip (proof lens) ───────────────────────────────────────────────

/**
 * A chip naming the resume line that backs a claim. Tapping it opens a small
 * popover with the highlighted line, like /jernew's proof lens.
 */
export function EvidenceChip({ lineId, label, className }: { lineId: string; label?: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrap = useRef<HTMLSpanElement>(null);
  const line = lineById(lineId);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  if (!line) return null;
  return (
    <span ref={wrap} className={cx("relative inline-flex", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "inline-flex min-h-8 items-center gap-1 rounded-lg border-2 border-studojo-ink bg-studojo-purple-bg px-2 font-satoshi text-xs font-bold text-studojo-purple-strong",
          FOCUS_RING,
        )}
      >
        <FiFileText aria-hidden />
        {label ?? "Resume line"}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.span
            id={id}
            role="note"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={QUICK}
            className="absolute left-0 top-full z-40 mt-2 block w-[min(18rem,calc(100vw-2rem))] rounded-xl border-2 border-studojo-ink bg-white p-3 text-left shadow-brutal"
          >
            <span className="block font-satoshi text-[11px] font-bold uppercase tracking-wide text-studojo-muted">
              From your resume{RESUME_SECTION_LABEL[line.section] ? ` · ${RESUME_SECTION_LABEL[line.section]}` : ""}
            </span>
            <span className="mt-1 block rounded-md bg-studojo-yellow-bg px-1.5 py-1 font-satoshi text-sm text-studojo-ink [box-decoration-break:clone]">
              {line.text}
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

// ── Toast ───────────────────────────────────────────────────────────────────

/** The toast view. The shell renders the store's toast with it; tabs dispatch TOAST instead. */
export function ToastView({ text, onUndo, onClose, undoLabel = "Undo" }: { text: string; onUndo?: () => void; onClose: () => void; undoLabel?: string }) {
  return (
    <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border-2 border-studojo-ink bg-studojo-ink py-2 pl-4 pr-2 font-satoshi text-sm text-white shadow-[4px_4px_0_0_#8b5cf6]">
      <span className="min-w-0 flex-1">{text}</span>
      {onUndo ? (
        <button type="button" onClick={onUndo} className={cx("min-h-9 rounded-lg border-2 border-white px-3 font-bold", FOCUS_RING)}>
          {undoLabel}
        </button>
      ) : null}
      <button type="button" onClick={onClose} aria-label="Dismiss" className={cx("min-h-9 rounded-lg px-2 text-white/70 hover:text-white", FOCUS_RING)}>
        ×
      </button>
    </div>
  );
}
