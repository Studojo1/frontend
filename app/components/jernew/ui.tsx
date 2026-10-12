// Shared primitives for /jernew, in Studojo's neo-brutalist style: 2px ink
// borders, offset shadows that collapse when pressed, rounded-2xl cards.
// Shared file: owned by the foundation. Step builders import, never edit.
//
// More primitives (Switch, SignalMeter, AnimatedNumber, BrowserFrame,
// LiveRegion, Kbd) live in ui-controls.tsx and are re-exported here, so a
// step only ever imports from "../ui".
import { useEffect, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { GROUP_STYLE, GROUPS, groupOf, RAIL_STEPS, STEP_META } from "./config";
import { useFlow, useStepScope } from "./flow";
import type { GroupId } from "./types";
import { cx, FOCUS_RING, PRESS } from "./ui-base";

export * from "./ui-controls";
export { cx, FOCUS_RING, POINTER_FINE, PRESS, RANGE_THUMB } from "./ui-base";

// ── Button ──────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "green";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-studojo-purple-strong text-white border-studojo-ink shadow-brutal hover:bg-[#5b21b6] active:shadow-[2px_2px_0_0_#191a23]",
  secondary:
    "bg-white text-studojo-ink border-studojo-ink shadow-brutal hover:bg-studojo-purple-bg active:shadow-[2px_2px_0_0_#191a23]",
  dark: "bg-studojo-ink text-white border-studojo-ink shadow-[4px_4px_0_0_#8b5cf6] active:shadow-[2px_2px_0_0_#8b5cf6]",
  green:
    "bg-studojo-green text-studojo-ink border-studojo-ink shadow-brutal hover:bg-[#34d399] active:shadow-[2px_2px_0_0_#191a23]",
  ghost: "bg-transparent text-studojo-ink border-transparent hover:bg-studojo-surface-muted active:translate-x-0 active:translate-y-0",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-sm rounded-xl",
  md: "min-h-12 px-5 text-base rounded-xl",
  lg: "min-h-14 px-7 text-lg rounded-2xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Real <button>. Use aria-disabled (not disabled) when the click should still
 * explain why nothing happened; it greys out the same way.
 */
export function Button({ variant = "primary", size = "md", icon, iconRight, className, children, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 border-2 font-satoshi font-bold leading-tight",
        PRESS,
        FOCUS_RING,
        VARIANT[variant],
        SIZE[size],
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:shadow-none",
        className,
      )}
      {...rest}
    >
      {icon ? <span aria-hidden className="shrink-0 text-[1.1em]">{icon}</span> : null}
      {children}
      {iconRight ? <span aria-hidden className="shrink-0 text-[1.1em]">{iconRight}</span> : null}
    </button>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────

export type CardTone = "white" | "purple" | "pink" | "orange" | "green" | "yellow" | "muted" | "ink";

const CARD_TONE: Record<CardTone, string> = {
  white: "bg-white",
  purple: "bg-studojo-purple-bg",
  pink: "bg-studojo-pink-bg",
  orange: "bg-studojo-orange-bg",
  green: "bg-studojo-green-bg",
  yellow: "bg-studojo-yellow-bg",
  muted: "bg-studojo-surface-muted",
  ink: "bg-studojo-ink text-white",
};

export interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: CardTone;
  /** Shadow size. "none" for nested cards. */
  shadow?: "none" | "sm" | "md" | "lg";
  /** Inner padding. Defaults to "md" (p-4 sm:p-6). */
  pad?: "none" | "sm" | "md" | "lg";
  as?: "div" | "section" | "article" | "li" | "aside";
}

const SHADOW = { none: "", sm: "shadow-[2px_2px_0_0_#191a23]", md: "shadow-brutal", lg: "shadow-brutal-lg" };
const PAD = { none: "", sm: "p-3 sm:p-4", md: "p-4 sm:p-6", lg: "p-5 sm:p-8" };

export function Card({ tone = "white", shadow = "md", pad = "md", as = "div", className, children, ...rest }: CardProps) {
  const Tag = as;
  return (
    <Tag className={cx("rounded-2xl border-2 border-studojo-ink", CARD_TONE[tone], SHADOW[shadow], PAD[pad], className)} {...rest}>
      {children}
    </Tag>
  );
}

// ── Chip ────────────────────────────────────────────────────────────────────

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  selected?: boolean;
  icon?: ReactNode;
  /** Shows a small key hint, for example 1 to 9 on quiz options. */
  kbd?: string;
  /** Tint when selected. Defaults to ink (white text). */
  tone?: GroupId | "ink";
  ref?: Ref<HTMLButtonElement>;
}

/** Selectable pill. aria-pressed carries the state. At least 44px tall. */
export function Chip({ selected = false, icon, kbd, tone = "ink", className, children, ...rest }: ChipProps) {
  const on = tone === "ink" ? "bg-studojo-ink text-white" : cx(GROUP_STYLE[tone].tint, "text-studojo-ink");
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        "inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-studojo-ink px-4 font-satoshi text-sm font-bold",
        PRESS,
        FOCUS_RING,
        selected ? cx(on, "shadow-[2px_2px_0_0_#191a23]") : "bg-white text-studojo-ink hover:bg-studojo-purple-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {icon ? <span aria-hidden className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
      {kbd ? (
        <span aria-hidden className={cx("ml-1 hidden rounded-md border px-1.5 text-[11px] leading-5 [@media(hover:hover)_and_(pointer:fine)]:inline", selected ? "border-white/50" : "border-studojo-ink/30 text-studojo-muted")}>
          {kbd}
        </span>
      ) : null}
    </button>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────

export type BadgeKind = "sample" | "simulated" | "concept" | "neutral" | "success" | "warning";

const BADGE: Record<BadgeKind, { cls: string; label: string }> = {
  sample: { cls: "bg-studojo-yellow-bg text-[#854d0e]", label: "Sample" },
  simulated: { cls: "bg-studojo-orange-bg text-[#92400e]", label: "Simulated" },
  concept: { cls: "bg-studojo-purple-bg text-studojo-purple-strong", label: "Concept preview" },
  neutral: { cls: "bg-white text-studojo-ink", label: "" },
  success: { cls: "bg-studojo-green-bg text-[#047857]", label: "" },
  warning: { cls: "bg-studojo-pink-bg text-[#be185d]", label: "" },
};

/** Small label pill. <Badge kind="sample" /> renders "Sample". */
export function Badge({ kind = "neutral", children, className, icon }: { kind?: BadgeKind; children?: ReactNode; className?: string; icon?: ReactNode }) {
  const b = BADGE[kind];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-studojo-ink px-2 py-0.5 font-satoshi text-[11px] font-bold uppercase tracking-wide",
        b.cls,
        className,
      )}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children ?? b.label}
    </span>
  );
}

// ── StepHeader ──────────────────────────────────────────────────────────────

export interface StepHeaderProps {
  /** Small line above the title. Defaults to "<Group> · Step n of 9". */
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Badges or a small control shown beside the kicker. */
  aside?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Every step starts with this. The title is the page's h1 and receives focus
 * (and the window scrolls to top) whenever the student arrives on the step.
 */
export function StepHeader({ kicker, title, description, aside, align = "left", className }: StepHeaderProps) {
  const f = useFlow();
  const scope = useStepScope();
  const ref = useRef<HTMLHeadingElement>(null);
  const id = scope ?? f.step;
  const group = groupOf(id);
  const style = GROUP_STYLE[group];

  useEffect(() => {
    if (f.navCount === 0 || scope !== f.step) return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    ref.current?.focus({ preventScroll: true });
    // Mount only: arriving on a step focuses its heading once.
  }, []);

  const railPos = RAIL_STEPS.indexOf(id);
  const groupLabel = GROUPS.find((g) => g.id === STEP_META[id].group)?.label;
  const autoKicker = railPos >= 0 && groupLabel ? `${groupLabel} · Step ${railPos + 1} of ${RAIL_STEPS.length}` : null;

  return (
    <header className={cx("mb-6 sm:mb-8", align === "center" && "text-center", className)}>
      {(kicker ?? autoKicker) || aside ? (
        <div className={cx("mb-3 flex flex-wrap items-center gap-2", align === "center" && "justify-center")}>
          {(kicker ?? autoKicker) ? (
            <span className={cx("inline-flex items-center gap-2 font-satoshi text-xs font-bold uppercase tracking-[0.14em]", style.text)}>
              <span aria-hidden className={cx("h-2.5 w-2.5 rounded-full border-2 border-studojo-ink", style.solid)} />
              {kicker ?? autoKicker}
            </span>
          ) : null}
          {aside}
        </div>
      ) : null}
      <h1
        ref={ref}
        tabIndex={-1}
        data-step-heading
        className="font-clash text-[1.75rem] font-semibold leading-[1.1] text-studojo-ink outline-none [word-spacing:0.06em] sm:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </h1>
      {description ? (
        <p className={cx("mt-3 max-w-2xl font-satoshi text-base text-studojo-muted sm:text-lg", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </header>
  );
}
