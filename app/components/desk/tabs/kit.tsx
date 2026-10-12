// Small visual kit for the desk workspace screens (Home, People, Inbox,
// Profile, Settings and the outreach page). Studojo's brutal look: 2px ink
// borders, offset shadows that collapse on press, Clash headings, Satoshi body.
// Self contained so the screens do not depend on the concept pages.
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { FiAlertTriangle, FiLoader, FiX } from "react-icons/fi";
import { cx, FOCUS_RING, PRESS } from "../agent/bits";
import { errorCode, errorMessage, errorStatus } from "~/lib/desk/api";
import { stripDashes } from "~/lib/strip-dashes";

export { cx, FOCUS_RING, PRESS };

// ── Button ──────────────────────────────────────────────────────────────────

type Variant = "primary" | "secondary" | "ghost" | "dark" | "danger";
const VARIANT: Record<Variant, string> = {
  primary: "bg-studojo-purple-strong text-white border-studojo-ink shadow-[3px_3px_0_0_#191a23] hover:bg-[#5b21b6] active:shadow-[1px_1px_0_0_#191a23]",
  secondary: "bg-white text-studojo-ink border-studojo-ink shadow-[3px_3px_0_0_#191a23] hover:bg-studojo-purple-bg active:shadow-[1px_1px_0_0_#191a23]",
  dark: "bg-studojo-ink text-white border-studojo-ink shadow-[3px_3px_0_0_#8b5cf6] active:shadow-[1px_1px_0_0_#8b5cf6]",
  danger: "bg-white text-[#be185d] border-studojo-ink shadow-[3px_3px_0_0_#191a23] hover:bg-studojo-pink-bg active:shadow-[1px_1px_0_0_#191a23]",
  ghost: "bg-transparent text-studojo-ink border-transparent hover:bg-studojo-surface-muted active:translate-x-0 active:translate-y-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  icon?: ReactNode;
  busy?: boolean;
}

export function Button({ variant = "secondary", size = "sm", icon, busy, className, children, type, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cx(
        "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap border-2 font-satoshi font-bold leading-tight",
        PRESS,
        FOCUS_RING,
        VARIANT[variant],
        size === "sm" ? "min-h-10 rounded-xl px-3 text-sm" : "min-h-12 rounded-xl px-5 text-base",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0",
        className,
      )}
      {...rest}
    >
      {busy ? <FiLoader aria-hidden className="shrink-0 animate-spin" /> : icon ? <span aria-hidden className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
}

// ── Card, section, chip ─────────────────────────────────────────────────────

export function Card({ className, children, as: Tag = "div" }: { className?: string; children: ReactNode; as?: "div" | "section" | "article" | "li" }) {
  return <Tag className={cx("rounded-2xl border-2 border-studojo-ink bg-white shadow-[3px_3px_0_0_#191a23]", className)}>{children}</Tag>;
}

export function Section({ title, sub, actions, children, className }: { title: string; sub?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cx("min-w-0", className)}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={id} className="font-clash text-xl font-semibold text-studojo-ink sm:text-2xl">{title}</h2>
          {sub ? <p className="mt-0.5 font-satoshi text-sm text-studojo-muted">{sub}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function FilterChip({ selected, count, onClick, children }: { selected: boolean; count?: number | null; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border-2 border-studojo-ink px-3.5 font-satoshi text-sm font-bold",
        PRESS,
        FOCUS_RING,
        selected ? "bg-studojo-ink text-white shadow-[2px_2px_0_0_#8b5cf6]" : "bg-white text-studojo-ink hover:bg-studojo-purple-bg",
      )}
    >
      {children}
      {count != null ? (
        <span className={cx("rounded-full px-1.5 text-xs tabular-nums", selected ? "bg-white/20" : "bg-studojo-surface-muted")}>{count}</span>
      ) : null}
    </button>
  );
}

// ── Badges ──────────────────────────────────────────────────────────────────

const TONE = {
  purple: "bg-studojo-purple-bg text-studojo-purple-strong",
  yellow: "bg-studojo-yellow-bg text-[#854d0e]",
  green: "bg-studojo-green-bg text-[#047857]",
  pink: "bg-studojo-pink-bg text-[#be185d]",
  muted: "bg-studojo-surface-muted text-studojo-muted",
  white: "bg-white text-studojo-ink",
} as const;
export type Tone = keyof typeof TONE;

export function Pill({ tone = "white", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-studojo-ink px-2 py-0.5 font-satoshi text-[11px] font-bold uppercase tracking-wide", TONE[tone], className)}>
      {children}
    </span>
  );
}

/** The fit number. Null when the person is not scored yet. */
export function Score({ value, strong, className }: { value: number | null; strong?: boolean; className?: string }) {
  return (
    <span
      title={value == null ? "Not scored yet" : `Fit ${value} out of 100`}
      className={cx(
        "inline-flex h-11 min-w-11 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-studojo-ink px-1.5 font-clash text-lg font-semibold leading-none tabular-nums",
        strong ? "bg-studojo-green-bg" : "bg-studojo-surface-muted",
        className,
      )}
    >
      <span className="sr-only">Fit </span>
      {value ?? "?"}
      <span aria-hidden className="mt-0.5 block font-satoshi text-[10px] font-bold uppercase tracking-wide text-studojo-muted">fit</span>
    </span>
  );
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const text = ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  return (
    <span aria-hidden className={cx("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple-bg font-satoshi text-sm font-bold text-studojo-purple-strong", className)}>
      {text}
    </span>
  );
}

// ── States ──────────────────────────────────────────────────────────────────

export function Loading({ label = "Loading", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className="h-14 animate-pulse rounded-2xl border-2 border-studojo-ink/10 bg-studojo-surface-muted" />
      ))}
    </div>
  );
}

export function ErrorBox({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cx("flex flex-wrap items-center gap-3 rounded-2xl border-2 border-studojo-ink bg-studojo-pink-bg px-4 py-3", className)}>
      <FiAlertTriangle aria-hidden className="shrink-0 text-[#be185d]" />
      <p className="min-w-0 flex-1 font-satoshi text-sm text-studojo-ink">{errorText(error)}</p>
      {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
    </div>
  );
}

export function Empty({ title, body, action, className }: { title: string; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-2xl border-2 border-dashed border-studojo-ink/30 bg-white px-5 py-8 text-center", className)}>
      <p className="font-clash text-lg font-semibold text-studojo-ink">{title}</p>
      {body ? <p className="mx-auto mt-1 max-w-md font-satoshi text-sm text-studojo-muted">{body}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/** One line result of an action, shown where the action happened. */
export function Notice({ tone, children, onClose }: { tone: "ok" | "error"; children: ReactNode; onClose?: () => void }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex items-start gap-2 rounded-xl border-2 border-studojo-ink px-3 py-2 font-satoshi text-sm", tone === "ok" ? "bg-studojo-green-bg" : "bg-studojo-pink-bg")}>
      <p className="min-w-0 flex-1">{children}</p>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Dismiss" className={cx("-m-1 rounded-lg p-1 hover:bg-white/60", FOCUS_RING)}>
          <FiX aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

// ── Drawer ──────────────────────────────────────────────────────────────────

/** Right side panel on desktop, bottom sheet on phones. Esc closes, focus returns. */
export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => panel.current?.focus({ preventScroll: true }), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div aria-hidden className="absolute inset-0 bg-studojo-ink/40" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl border-t-2 border-studojo-ink bg-white outline-none sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[460px] sm:rounded-none sm:border-l-2 sm:border-t-0"
      >
        <div className="flex shrink-0 items-start gap-3 border-b-2 border-studojo-ink/10 px-4 pb-3 pt-4 sm:px-5">
          <h2 id={id} className="min-w-0 flex-1 font-clash text-xl font-semibold text-studojo-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className={cx("-mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg hover:bg-studojo-surface-muted", FOCUS_RING)}>
            <FiX aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
        {footer ? <div className="shrink-0 border-t-2 border-studojo-ink/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">{footer}</div> : null}
      </div>
    </div>
  );
}

// ── Text and time ───────────────────────────────────────────────────────────

/** Plain text with line breaks, dashes stripped. Never HTML. */
export function PlainText({ text, className }: { text: string | null | undefined; className?: string }) {
  return <div className={cx("whitespace-pre-wrap break-words", className)}>{stripDashes(text ?? "")}</div>;
}

export function clean(text: string | null | undefined): string {
  return stripDashes(text ?? "") ?? "";
}

/** "2m", "3h", "Tue", "12 Oct". Server times are naive UTC. */
export function when(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "";
  const t = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  const ms = t.getTime();
  if (Number.isNaN(ms)) return "";
  const diff = Math.round((now - ms) / 1000);
  if (diff >= 0 && diff < 60) return "now";
  if (diff >= 0 && diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff >= 0 && diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff >= 0 && diff < 6 * 86400) return t.toLocaleDateString(undefined, { weekday: "short" });
  return t.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Words for the student from any thrown error (the contract `detail.message`, else a plain fallback). */
export function errorText(err: unknown): string {
  if (errorStatus(err) === 401) return "Your session ended. Sign in again to continue.";
  return clean(errorMessage(err));
}

export { errorCode };
