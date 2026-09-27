import type { ReactNode } from "react";

/**
 * The few pieces of chrome every /content page repeats. Kept here rather than
 * in app/components/index.ts because nothing outside the studio uses them and
 * the studio is staging only.
 */

export const CARD =
  "rounded-2xl border-2 border-neutral-900 bg-white shadow-[5px_5px_0px_0px_rgba(23,23,23,1)]";

export const INPUT =
  "w-full rounded-xl border-2 border-neutral-900 bg-white px-3 py-2 font-satoshi text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-studojo-purple";

export const LABEL =
  "block font-satoshi text-xs font-bold uppercase tracking-[0.12em] text-neutral-500";

export function PageHead({
  title,
  blurb,
  actions,
}: {
  title: string;
  blurb?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-clash text-3xl font-medium text-neutral-900">{title}</h1>
        {blurb && (
          <p className="mt-2 max-w-2xl font-satoshi text-[15px] leading-relaxed text-neutral-600">
            {blurb}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const tone =
    variant === "primary"
      ? "bg-studojo-purple text-white"
      : variant === "danger"
        ? "bg-white text-red-600"
        : "bg-white text-neutral-900";
  return (
    <button
      {...rest}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 px-4 py-2 font-satoshi text-sm font-bold shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 ${tone} ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className={`${CARD} p-5`}>
      <div className="font-satoshi text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </div>
      <div className="mt-1 font-clash text-3xl font-medium tracking-tight text-neutral-900">
        {value}
      </div>
      {sub && <div className="mt-1 font-satoshi text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  idea: "bg-neutral-100 text-neutral-700",
  drafted: "bg-studojo-yellow-bg text-yellow-800",
  ready: "bg-studojo-purple-bg text-studojo-purple",
  scheduled: "bg-studojo-orange-bg text-orange-800",
  posted: "bg-studojo-green-bg text-emerald-800",
  new: "bg-neutral-100 text-neutral-700",
  kept: "bg-studojo-green-bg text-emerald-800",
  binned: "bg-neutral-100 text-neutral-400 line-through",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 font-satoshi text-xs font-bold capitalize ${
        STATUS_TONE[status] ?? "bg-neutral-100 text-neutral-700"
      }`}
    >
      {status}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white/60 p-10 text-center font-satoshi text-[15px] text-neutral-500">
      {children}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 font-satoshi text-sm text-red-700">
      {children}
    </div>
  );
}
