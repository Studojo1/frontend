// Primitives for /b2cnew, in Studojo's neo-brutalist style. Import every
// primitive from "../ui" (or "./ui"); this file re-exports the jernew ones that
// need no jernew context, plus Sheet, Segmented, TabStrip, HoldButton,
// EvidenceChip and Toast from the ui-*.tsx files.
// Shared file: owned by the foundation.
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { SKILL_STYLE, stageMeta } from "./config";
import type { Skill, Stage } from "./types";
import { cx, FOCUS_RING, PRESS } from "../jernew/ui-base";

export {
  AnimatedNumber,
  Badge,
  BrowserFrame,
  Button,
  Card,
  Chip,
  Kbd,
  LiveRegion,
  SignalMeter,
  Switch,
  type BadgeKind,
  type ButtonProps,
  type ButtonVariant,
  type CardTone,
} from "../jernew/ui";
export { cx, FOCUS_RING, POINTER_FINE, PRESS, RANGE_THUMB } from "../jernew/ui-base";
export * from "./ui-sheet";
export * from "./ui-controls";

// ── Small labels ────────────────────────────────────────────────────────────

/** Pipeline stage pill. Always carries text. */
export function StagePill({ stage, className }: { stage: Stage; className?: string }) {
  const m = stageMeta(stage);
  return (
    <span className={cx("inline-flex items-center whitespace-nowrap rounded-full border-2 border-studojo-ink px-2 py-0.5 font-satoshi text-[11px] font-bold", m.tint, m.text, className)}>
      {m.label}
    </span>
  );
}

/** Run-step skill chip: Scout, Write, Send, Inbox, Coach. */
export function SkillChip({ skill, className }: { skill: Skill; className?: string }) {
  const st = SKILL_STYLE[skill];
  return (
    <span
      title={st.does}
      className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-md border-2 border-studojo-ink px-1.5 py-px font-satoshi text-[11px] font-bold leading-4", st.tint, st.text, className)}
    >
      <span aria-hidden className={cx("h-1.5 w-1.5 rounded-full", st.solid)} />
      {st.label}
    </span>
  );
}

/** "Sample" or "Simulated" next to a number or outcome. Inline, quiet. */
export function SimNote({ kind = "simulated", children, className }: { kind?: "sample" | "simulated"; children?: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 font-satoshi text-[11px] font-bold uppercase tracking-wide", kind === "sample" ? "text-[#854d0e]" : "text-[#92400e]", className)}>
      <span aria-hidden className={cx("h-1.5 w-1.5 rounded-full", kind === "sample" ? "bg-studojo-yellow" : "bg-studojo-orange")} />
      {children ?? (kind === "sample" ? "Sample" : "Simulated")}
    </span>
  );
}

/** A small number badge for tabs and buttons. */
export function CountBadge({ n, tone = "ink", className }: { n: number; tone?: "ink" | "purple" | "pink"; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-studojo-ink px-1 font-satoshi text-[11px] font-bold tabular-nums leading-none",
        tone === "ink" ? "bg-studojo-ink text-white" : tone === "purple" ? "bg-studojo-purple text-white" : "bg-studojo-pink text-white",
        className,
      )}
    >
      {n}
    </span>
  );
}

// ── Avatar ──────────────────────────────────────────────────────────────────

const AVATAR_TINTS = ["bg-studojo-purple-bg", "bg-studojo-pink-bg", "bg-studojo-orange-bg", "bg-studojo-green-bg", "bg-studojo-yellow-bg", "bg-[#ccfbf1]"];

/** Initials in a circle; the tint is fixed per name, so server and client agree. */
export function Avatar({ first, last, size = "md", className }: { first: string; last?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const name = `${first}${last ?? ""}`;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const dim = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <span aria-hidden className={cx("inline-flex shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink font-clash font-semibold text-studojo-ink", AVATAR_TINTS[h % AVATAR_TINTS.length], dim, className)}>
      {first.charAt(0)}
      {last ? last.charAt(0) : ""}
    </span>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

/** A tab section heading with an optional right-side action. h2 by default. */
export function SectionHeader({ title, kicker, action, as = "h2", id, className }: { title: ReactNode; kicker?: ReactNode; action?: ReactNode; as?: "h2" | "h3"; id?: string; className?: string }) {
  const H = as;
  return (
    <div className={cx("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {kicker ? <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">{kicker}</p> : null}
        <H id={id} className={cx("font-clash font-semibold text-studojo-ink", as === "h2" ? "text-xl" : "text-base")}>
          {title}
        </H>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Calm empty state with one action. */
export function EmptyState({ icon, title, body, action, className }: { icon?: ReactNode; title: ReactNode; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-col items-center rounded-2xl border-2 border-dashed border-studojo-ink/40 bg-white/70 px-5 py-10 text-center", className)}>
      {icon ? <span aria-hidden className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg text-xl text-studojo-purple-strong">{icon}</span> : null}
      <p className="font-clash text-lg font-semibold text-studojo-ink">{title}</p>
      {body ? <p className="mt-1 max-w-sm font-satoshi text-sm text-studojo-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon buttons need a name. */
  label: string;
  icon: ReactNode;
  tone?: "plain" | "ink" | "purple";
  size?: "sm" | "md";
  ref?: Ref<HTMLButtonElement>;
}

/** Square icon button with an accessible name; 44px by default. */
export function IconButton({ label, icon, tone = "plain", size = "md", className, type, ...rest }: IconButtonProps) {
  return (
    <button
      type={type ?? "button"}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-xl border-2 font-satoshi",
        size === "md" ? "h-11 w-11 text-lg" : "h-9 w-9 text-base",
        tone === "plain" && "border-transparent text-studojo-ink hover:border-studojo-ink hover:bg-white",
        tone === "ink" && "border-studojo-ink bg-studojo-ink text-white",
        tone === "purple" && "border-studojo-ink bg-studojo-purple-bg text-studojo-purple-strong",
        PRESS,
        FOCUS_RING,
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}
