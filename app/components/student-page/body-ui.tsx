// Copied from Studojo1/outreach-flow (app/components/profile-ideas/v2/body-ui.tsx), which
// drafts the page in its onboarding flow; keep the two in step.
// Small shared pieces for the v2 profile body, drawn in the onboarding's
// language: marker highlights, purple dotted kickers, 2px ink borders and
// offset shadows. The portrait (with its monogram fallback), org logo tiles,
// the duration chip, the resume-line list, the CTA buttons and copy-link.
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiFileText, FiLink, FiMail } from "react-icons/fi";
import { cx, FOCUS_RING, PRESS } from "./ui";
import { linesFor, SECTION_LABEL, type Line, type Org, type Profile } from "./types";

/** The page's own resume lines, for every "Resume lines" reveal under ProfileBody. */
export const LinesContext = createContext<Line[]>([]);

export const INK = "#191a23";
export const FOCUS = FOCUS_RING;

/** The flow shell's off-white lilac with a faint dot grid. */
export const DOTS: CSSProperties = {
  backgroundColor: "#fcfbff",
  backgroundImage: "radial-gradient(circle, rgba(23,23,23,0.13) 1px, transparent 1.3px)",
  backgroundSize: "22px 22px",
};

/** Same grid, in white, for the dark footer band. */
export const DOTS_DARK: CSSProperties = {
  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1.3px)",
  backgroundSize: "22px 22px",
};

export const MARK = { lilac: "#ddd6fe", yellow: "#fde68a", pink: "#fbcfe8", green: "#a7f3d0", purple: "#7c3aed" } as const;

/** Highlighter stroke behind a phrase in a headline. Wraps cleanly across lines. */
export function Mark({ color = MARK.yellow, children }: { color?: string; children: ReactNode }) {
  return (
    <span
      className="[box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
      style={{ backgroundImage: `linear-gradient(transparent 58%, ${color} 58%, ${color} 92%, transparent 92%)` }}
    >
      {children}
    </span>
  );
}

const KICKER_TONE = {
  purple: { text: "text-studojo-purple-strong", dot: "bg-studojo-purple" },
  pink: { text: "text-[#be185d]", dot: "bg-studojo-pink" },
  orange: { text: "text-[#b45309]", dot: "bg-studojo-orange" },
  green: { text: "text-[#047857]", dot: "bg-studojo-green" },
  light: { text: "text-[#c4b5fd]", dot: "bg-studojo-purple" },
} as const;
export type KickerTone = keyof typeof KICKER_TONE;

/** "● STUDOJO OUTREACH, REBUILT": small, uppercase, wide-tracked, with a ringed dot. */
export function Kicker({ children, tone = "purple", className }: { children: ReactNode; tone?: KickerTone; className?: string }) {
  const t = KICKER_TONE[tone];
  return (
    <span className={cx("inline-flex items-center gap-2 font-satoshi text-xs font-bold uppercase tracking-[0.14em]", t.text, className)}>
      <span aria-hidden className={cx("h-2.5 w-2.5 shrink-0 rounded-full border-2", tone === "light" ? "border-white" : "border-studojo-ink", t.dot)} />
      {children}
    </span>
  );
}

/** Numbered ink-ringed circle, like the intro's (1) (2) (3). */
export function Num({ n, className }: { n: ReactNode; className?: string }) {
  return (
    <span aria-hidden className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-white font-clash text-[13px] font-semibold", className)}>
      {n}
    </span>
  );
}

/** Only when the student allows contact (p.email is null otherwise). */
export const mailto = (p: Profile) =>
  p.email ? `mailto:${p.email}?subject=${encodeURIComponent(`Saw your Studojo profile, ${p.first}`)}` : "";

/** "Pune · 2027", leaving out whatever is missing. */
export const joinDot = (...xs: (string | null | undefined)[]) => xs.filter(Boolean).join(" · ");

/** Her photo, or a pastel monogram card in our style. */
export function Portrait({ p, size = "card", className = "" }: { p: Profile; size?: "card" | "thumb"; className?: string }) {
  if (p.photo) return <img src={p.photo} alt={`Portrait of ${p.name}`} className={`h-full w-full object-cover ${className}`} />;
  if (size === "thumb") {
    return (
      <div role="img" aria-label={`${p.name}: no photo yet`} className={cx("grid h-full w-full place-items-center bg-studojo-pink-bg font-clash text-[15px] font-semibold text-studojo-ink", className)}>
        {p.initials}
      </div>
    );
  }
  return (
    <div role="img" aria-label={`${p.name}: no photo yet`} className={cx("relative isolate h-full w-full overflow-hidden bg-studojo-pink-bg", className)}>
      <div aria-hidden className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle, rgba(190,24,93,0.22) 1px, transparent 1.4px)", backgroundSize: "14px 14px" }} />
      <div aria-hidden className="absolute -right-[10%] -top-[22%] aspect-square w-[40%] rounded-full border-2 border-studojo-ink bg-[#fbcfe8]" />
      <div aria-hidden className="absolute -bottom-[26%] -left-[8%] aspect-square w-[36%] rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg" />
      <span aria-hidden className="absolute inset-0 grid place-items-center pb-2 font-clash text-[96px] font-bold leading-none tracking-[-0.03em] text-studojo-ink">
        <span className="relative isolate">
          {p.initials}
          <span className="absolute -bottom-1 left-1 right-1 -z-10 h-[38%] bg-[#ddd6fe]" />
        </span>
      </span>
      {joinDot(p.city, p.classOf) && (
        <span aria-hidden className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-studojo-ink bg-white px-2 py-0.5 font-satoshi text-[10px] font-bold uppercase tracking-wide">
          {joinDot(p.city, p.classOf)}
        </span>
      )}
    </div>
  );
}

/** Logo tile: a bordered rounded square in the org's colour with an offset ink shadow. */
export function OrgTile({ org, size = 52, className }: { org: Org; size?: number; className?: string }) {
  const long = org.short.length > 2;
  const off = size >= 48 ? 3 : 2;
  return (
    <div
      aria-hidden
      className={cx("relative grid shrink-0 place-items-center rounded-xl border-2 border-studojo-ink font-clash font-bold", className)}
      style={{
        width: size,
        height: size,
        background: org.tint,
        color: org.ink,
        fontSize: size * (long ? 0.28 : 0.38),
        letterSpacing: long ? "-0.02em" : "-0.01em",
        boxShadow: `${off}px ${off}px 0 0 ${INK}`,
      }}
    >
      {org.short}
    </div>
  );
}

/** "May 2026 [← 3 mos →] Jul 2026", the span as a bordered chip. */
export function Span({ from, span, to }: { from: string; span: string; to: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-satoshi text-sm font-medium text-studojo-muted tabular-nums">
      <span>{from}</span>
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-studojo-ink bg-white px-2.5 py-0.5 text-xs font-bold text-studojo-ink">
        <FiArrowLeft className="h-3 w-3" aria-hidden />
        <span className="sr-only">for</span>
        {span}
        <FiArrowRight className="h-3 w-3" aria-hidden />
      </span>
      <span>{to}</span>
    </div>
  );
}

/** The exact resume lines behind something, each with its section label. */
export function ResumeLines({ ids, title = "From the resume", stacked = false }: { ids: string[]; title?: string; stacked?: boolean }) {
  const lines = linesFor(useContext(LinesContext), ids);
  return (
    <div className={stacked ? "" : "overflow-hidden rounded-xl border-2 border-studojo-ink bg-white"}>
      <p className="flex items-center gap-1.5 border-b-2 border-dashed border-studojo-ink/25 bg-studojo-purple-bg px-3.5 py-2 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-purple-strong">
        <FiFileText aria-hidden className="h-3.5 w-3.5" />
        {title}
      </p>
      <ul className="divide-y-2 divide-dashed divide-studojo-ink/10">
        {lines.map((l, i) => (
          <li
            key={l.id}
            className={cx(
              "px-3.5 py-2.5 font-satoshi text-sm leading-[1.5]",
              stacked ? "flex flex-col gap-0.5" : "grid grid-cols-1 gap-0.5 sm:grid-cols-[92px_1fr] sm:gap-3",
            )}
          >
            <span className={cx("pt-[2px] text-[10.5px] font-bold uppercase tracking-[0.1em] text-studojo-muted", stacked && "empty:hidden")}>
              {i > 0 && lines[i - 1].section === l.section ? "" : (SECTION_LABEL[l.section] ?? l.section) || "Header"}
            </span>
            <span className={l.strong ? "font-bold text-studojo-ink" : "text-studojo-ink"}>{l.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Height-animated disclosure; static when reduced. */
export function Reveal({ open, reduced, children, id }: { open: boolean; reduced: boolean; children: ReactNode; id?: string }) {
  if (reduced) return open ? <div id={id}>{children}</div> : null;
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={id}
          key="r"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ height: { type: "spring", stiffness: 420, damping: 40 }, opacity: { duration: 0.18 } }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A section card that lifts once as it scrolls into view. It is never hidden:
 * the page must read in full without scrolling (screenshots, link previews,
 * and search engines, which is the point of a public profile).
 */
export function Rise({ children, reduced, className, delay = 0 }: { children: ReactNode; reduced: boolean; className?: string; delay?: number }) {
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ type: "spring", stiffness: 380, damping: 30, delay }}
    >
      {children}
    </motion.div>
  );
}

const BTN = "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap border-2 font-satoshi font-bold leading-tight";
const BTN_SIZE = { sm: "min-h-11 px-3.5 text-sm rounded-xl", md: "min-h-12 px-5 text-base rounded-xl", lg: "min-h-14 px-7 text-lg rounded-2xl" };

/** "Email Riya": the flow's primary purple button, as a real mailto link. Hidden unless the student allows contact. */
export function EmailPill({ p, size = "md", tone = "dark", className = "" }: { p: Profile; size?: "sm" | "md" | "lg"; tone?: "dark" | "light"; className?: string }) {
  if (!p.email) return null;
  const look =
    tone === "dark"
      ? "bg-studojo-purple-strong text-white border-studojo-ink shadow-brutal hover:bg-[#5b21b6] active:shadow-[2px_2px_0_0_#191a23]"
      : "bg-studojo-purple-strong text-white border-white shadow-[4px_4px_0_0_#ffffff] hover:bg-[#5b21b6] active:shadow-[2px_2px_0_0_#ffffff] focus-visible:ring-offset-studojo-ink";
  return (
    <a href={mailto(p)} className={cx(BTN, PRESS, FOCUS_RING, BTN_SIZE[size], look, className)}>
      <FiMail aria-hidden className="shrink-0 text-[1.05em]" />
      Email {p.first}
    </a>
  );
}

/** Copies the profile URL; the link icon turns into a check for a moment. */
export function useCopy(text: string) {
  const [done, setDone] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setDone(false), 1800);
  };
  return { done, copy };
}

/**
 * "Copy profile link". variant "secondary" is the flow's white bordered button;
 * "ghost" is unbordered; "icon" is a square bordered button.
 */
export function CopyLink({
  p,
  reduced,
  className = "",
  label = "Copy profile link",
  variant = "secondary",
  size = "md",
}: {
  p: Profile;
  reduced: boolean;
  className?: string;
  label?: string;
  variant?: "secondary" | "ghost" | "icon" | "onDark";
  size?: "sm" | "md" | "lg";
}) {
  const { done, copy } = useCopy(`https://${p.url}`);
  const iconOnly = variant === "icon";
  const look = {
    secondary: cx(BTN, BTN_SIZE[size], "bg-white text-studojo-ink border-studojo-ink shadow-brutal hover:bg-studojo-purple-bg active:shadow-[2px_2px_0_0_#191a23]"),
    ghost: cx(BTN, BTN_SIZE[size], "border-transparent bg-transparent text-studojo-ink hover:bg-studojo-surface-muted"),
    icon: "grid h-11 w-11 place-items-center rounded-xl border-2 border-studojo-ink bg-white text-studojo-ink shadow-[2px_2px_0_0_#191a23] hover:bg-studojo-purple-bg active:shadow-none",
    onDark: cx(BTN, BTN_SIZE[size], "border-white/70 bg-transparent text-white hover:bg-white/10 focus-visible:ring-offset-studojo-ink"),
  }[variant];
  return (
    <button type="button" onClick={copy} aria-label={iconOnly ? (done ? "Link copied" : label) : undefined} className={cx(PRESS, FOCUS_RING, look, className)}>
      <span className="relative inline-grid h-4 w-4 shrink-0 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={done ? "c" : "l"}
            initial={reduced ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 520, damping: 30 }}
            className="absolute inset-0 grid place-items-center"
          >
            {done ? <FiCheck className="h-4 w-4" strokeWidth={3} /> : <FiLink className="h-4 w-4" strokeWidth={2.5} />}
          </motion.span>
        </AnimatePresence>
      </span>
      {!iconOnly && <span aria-live="polite">{done ? "Link copied" : label}</span>}
    </button>
  );
}

/** The studojo wordmark, as the flow's top bar draws it. */
export function Wordmark({ dark = false, className }: { dark?: boolean; className?: string }) {
  return <span className={cx("font-clash text-2xl font-bold tracking-tight", dark ? "text-white" : "text-studojo-ink", className)}>studojo</span>;
}
