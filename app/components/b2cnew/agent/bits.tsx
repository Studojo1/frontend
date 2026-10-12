// Small pieces the agent panel shares: Senpai's mark, the chip button used
// for quick chips and decisions, and a word diff.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx, FOCUS_RING, PRESS } from "../ui";

/** Senpai's round mark. */
export function SenpaiMark({ size = "md", busy, className }: { size?: "sm" | "md"; busy?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple font-clash font-bold text-white",
        size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm",
        className,
      )}
    >
      S
      {busy !== undefined ? (
        <span className={cx("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white", busy ? "bg-studojo-green" : "bg-studojo-ink/25")} />
      ) : null}
    </span>
  );
}

export interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "plain" | "soft";
  icon?: ReactNode;
  size?: "sm" | "md";
}

/** A rounded chip button: quick chips, decision actions, filters. */
export function ChipButton({ tone = "plain", icon, size = "sm", className, children, type, ...rest }: ChipButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-studojo-ink font-satoshi font-bold",
        size === "sm" ? "min-h-9 px-3 text-[13px]" : "min-h-11 px-4 text-sm",
        tone === "primary" && "bg-studojo-purple-strong text-white shadow-[2px_2px_0_0_#191a23] active:shadow-none",
        tone === "plain" && "bg-white text-studojo-ink hover:bg-studojo-surface-muted",
        tone === "soft" && "bg-studojo-purple-bg text-studojo-purple-strong hover:bg-white",
        PRESS,
        FOCUS_RING,
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {icon ? <span aria-hidden className="text-[1.05em]">{icon}</span> : null}
      {children}
    </button>
  );
}

// ── Word diff ───────────────────────────────────────────────────────────────

export type DiffPart = { kind: "same" | "add" | "del"; text: string };

/** A word-level diff (LCS) of two texts. Small inputs only (emails, headlines). */
export function wordDiff(before: string, after: string): DiffPart[] {
  const a = before.split(/(\s+)/).filter(Boolean);
  const b = after.split(/(\s+)/).filter(Boolean);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array.from({ length: m + 1 }, () => 0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const out: DiffPart[] = [];
  const push = (kind: DiffPart["kind"], text: string) => {
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ kind, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push("same", a[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) push("del", a[i++]);
    else push("add", b[j++]);
  }
  while (i < n) push("del", a[i++]);
  while (j < m) push("add", b[j++]);
  return out;
}

/** Renders a diff: additions highlighted violet, removals struck through. */
export function DiffText({ parts, className }: { parts: DiffPart[]; className?: string }) {
  return (
    <p className={cx("whitespace-pre-wrap font-satoshi text-sm leading-relaxed text-studojo-ink", className)}>
      {parts.map((p, i) =>
        p.kind === "same" ? (
          <span key={i}>{p.text}</span>
        ) : p.kind === "add" ? (
          <ins key={i} className="rounded-sm bg-studojo-purple-bg px-0.5 font-bold text-studojo-purple-strong no-underline">
            <span className="sr-only">Added: </span>
            {p.text}
          </ins>
        ) : (
          <del key={i} className="rounded-sm bg-studojo-pink-bg/70 px-0.5 text-studojo-muted line-through decoration-2">
            <span className="sr-only">Removed: </span>
            {p.text}
          </del>
        ),
      )}
    </p>
  );
}

/** Lower-cases the first letter: "Checked addresses" to "checked addresses". */
export const lowerFirst = (t: string) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);
