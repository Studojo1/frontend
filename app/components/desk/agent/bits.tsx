// Small pieces the agent panel shares, in the Studojo look (2px ink borders,
// offset shadows that collapse on press). Copied from the b2cnew concept and
// stripped of its sample data: chip button, word diff, step row, plain text.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { stripDashes } from "~/lib/strip-dashes";
import type { Step } from "~/lib/desk/types";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-studojo-purple/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export const PRESS = "transition-[transform,box-shadow] duration-150 ease-out active:translate-x-[2px] active:translate-y-[2px]";

export interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "plain" | "soft" | "danger";
  icon?: ReactNode;
}

/** A rounded chip button: suggestions, card actions. At least 36px tall. */
export function ChipButton({ tone = "plain", icon, className, children, type, ...rest }: ChipButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cx(
        "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border-2 border-studojo-ink px-3 font-satoshi text-[13px] font-bold",
        tone === "primary" && "bg-studojo-purple-strong text-white shadow-[2px_2px_0_0_#191a23] active:shadow-none",
        tone === "plain" && "bg-white text-studojo-ink hover:bg-studojo-surface-muted",
        tone === "soft" && "bg-studojo-purple-bg text-studojo-purple-strong hover:bg-white",
        tone === "danger" && "bg-white text-[#be185d] hover:bg-studojo-pink-bg",
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

/** Model text as plain text: dashes stripped, line breaks kept, no markdown. */
export function PlainText({ text, className }: { text: string; className?: string }) {
  return <p className={cx("whitespace-pre-wrap break-words font-satoshi text-sm leading-relaxed text-studojo-ink", className)}>{stripDashes(text)}</p>;
}

/** A small uppercase kicker above a card title. */
export function Kicker({ children }: { children: ReactNode }) {
  return <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-purple-strong">{children}</p>;
}

/** The bordered shell every card in the thread sits in. */
export function CardShell({ children, tone = "white", label }: { children: ReactNode; tone?: "white" | "purple" | "yellow"; label?: string }) {
  return (
    <section
      aria-label={label}
      className={cx(
        "rounded-2xl border-2 border-studojo-ink px-3 py-2.5 shadow-[2px_2px_0_0_#191a23]",
        tone === "purple" ? "bg-studojo-purple-bg" : tone === "yellow" ? "bg-studojo-yellow-bg" : "bg-white",
      )}
    >
      {children}
    </section>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden className={cx("inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-studojo-purple border-t-transparent motion-reduce:animate-none", className)} />;
}

/** One tool line: running, done or failed, with the server's label and summary. */
export function StepRow({ step, stopped }: { step: Step; stopped?: boolean }) {
  const running = step.ok === null && !stopped;
  return (
    <li className="flex items-start gap-2 py-0.5 font-satoshi text-[13px] leading-snug">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {running ? (
          <Spinner />
        ) : step.ok ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-green text-[9px] text-studojo-ink">
            <FiCheck aria-hidden strokeWidth={4} />
          </span>
        ) : step.ok === null ? (
          <span aria-hidden className="h-4 w-4 rounded-full border-2 border-studojo-muted bg-white" />
        ) : (
          <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-pink-bg text-[9px] text-[#be185d]">
            <FiX aria-hidden strokeWidth={4} />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={running ? "text-studojo-purple-strong" : "text-studojo-ink"}>{stripDashes(step.label)}</span>
        {step.summary && step.summary !== step.label && !running ? (
          <span className="block text-xs text-studojo-muted">{stripDashes(step.summary)}</span>
        ) : step.ok === null && !running ? (
          <span className="block text-xs text-studojo-muted">Stopped before it finished</span>
        ) : null}
      </span>
      <span className="sr-only">{running ? "working" : step.ok ? "done" : step.ok === false ? "did not work" : "stopped"}</span>
    </li>
  );
}

// ------------------------------------------------------------------ word diff

export type DiffPart = { kind: "same" | "add" | "del"; text: string };

/** A word level diff (longest common subsequence). Small inputs only: one email. */
export function wordDiff(before: string, after: string): DiffPart[] {
  const a = before.split(/(\s+)/).filter(Boolean);
  const b = after.split(/(\s+)/).filter(Boolean);
  const n = a.length;
  const m = b.length;
  if (n * m > 400_000) return [{ kind: "del", text: before }, { kind: "add", text: after }];
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
export function DiffText({ parts }: { parts: DiffPart[] }) {
  return (
    <p className="whitespace-pre-wrap break-words font-satoshi text-sm leading-relaxed text-studojo-ink">
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
