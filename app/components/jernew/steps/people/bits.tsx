// Small shared pieces for the "Your people" steps (matches and email):
// the chosen recipient, the stage colour key, avatars, masked names and the
// fit dial. Owned by builder C. No shared-file changes needed.
import type { ReactNode } from "react";
import type { RankedMatch } from "../../data";
import { cx } from "../../ui";

// ── Chosen recipient ────────────────────────────────────────────────────────
// Matches lets the student pick who the sample email goes to. FlowData has no
// field for it, so it lives in memory for this tab only. It is read after
// hydration (both steps render only once f.ready is true), never on the server.
let chosenRecipient: string | null = null;

export function setChosenRecipient(id: string | null) {
  chosenRecipient = id;
}

export function getChosenRecipient(): string | null {
  return chosenRecipient;
}

/** Picks the chosen match if it is still in the ranked list, else the best fit. */
export function pickRecipient(ranked: RankedMatch[], id: string | null): RankedMatch {
  return ranked.find((m) => m.id === id) ?? ranked[0];
}

// ── Stage key ───────────────────────────────────────────────────────────────

export type StageBand = "early" | "scale" | "large";

export const STAGE_BANDS: { id: StageBand; label: string; fill: string; tint: string; text: string }[] = [
  { id: "early", label: "Early startup", fill: "#f59e0b", tint: "bg-studojo-orange-bg", text: "text-[#b45309]" },
  { id: "scale", label: "Scale-up", fill: "#14b8a6", tint: "bg-[#ccfbf1]", text: "text-[#0f766e]" },
  { id: "large", label: "Bigger team", fill: "#8b5cf6", tint: "bg-studojo-purple-bg", text: "text-studojo-purple-strong" },
];

export function bandOf(stage: number): StageBand {
  return stage <= 1 ? "early" : stage <= 2 ? "scale" : "large";
}

export const bandStyle = (stage: number) => STAGE_BANDS.find((b) => b.id === bandOf(stage)) ?? STAGE_BANDS[0];

// ── Avatar and masked name ──────────────────────────────────────────────────

/** Round initials badge for a fictional hiring manager. */
export function ManagerAvatar({ match, size = "md", className }: { match: RankedMatch; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = bandStyle(match.stage);
  const dim = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink font-clash font-semibold text-studojo-ink",
        s.tint,
        dim,
        className,
      )}
    >
      {match.manager.first.charAt(0)}
      {match.manager.maskedLast.charAt(0)}
    </span>
  );
}

/** "Ananya R•••" with the dots hidden from screen readers and a plain explanation. */
export function MaskedName({ match, className }: { match: RankedMatch; className?: string }) {
  const initial = match.manager.maskedLast.charAt(0);
  return (
    <span className={className}>
      {match.manager.first} {initial}
      <span aria-hidden className="tracking-[0.12em] text-studojo-muted">
        {match.manager.maskedLast.slice(1)}
      </span>
      <span className="sr-only"> (surname hidden in the preview)</span>
    </span>
  );
}

// ── Fit dial ────────────────────────────────────────────────────────────────

/** Static ring showing a 0 to 100 fit score. The number is the text equivalent. */
export function FitDial({ fit, size = 48, className }: { fit: number; size?: number; className?: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const tone = fit >= 85 ? "#10b981" : fit >= 75 ? "#f59e0b" : "#a3a3a3";
  return (
    <span className={cx("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg aria-hidden viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="white" stroke="#171717" strokeOpacity="0.12" strokeWidth="5" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(fit / 100) * c} ${c}`}
        />
        <circle cx="22" cy="22" r="20.5" fill="none" stroke="#171717" strokeWidth="1.5" />
      </svg>
      <span className="relative font-clash text-sm font-semibold tabular-nums text-studojo-ink">
        {fit}
        <span className="sr-only"> out of 100 fit</span>
      </span>
    </span>
  );
}

/** Small uppercase label used across both steps. */
export function MiniLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx("block font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted", className)}>
      {children}
    </span>
  );
}
