// The opened email: mail chrome (from, to, subject), day tabs, and the body
// with the personal bits highlighted. The follow-up embeds the page card
// after its second paragraph. Owned by builder C.
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { FiPaperclip, FiLink, FiType } from "react-icons/fi";
import { PROFILE_DRAFT, STUDENT, type EmailDraft, type RankedMatch } from "../../data";
import { SPRING, SPRING_SOFT, useMotionPresets } from "../../motion";
import type { ProfileState } from "../../types";
import { cx, FOCUS_RING } from "../../ui";
import { ManagerAvatar, MaskedName } from "./bits";
import { PageCard } from "./page-card";

export const SHEET_LAYOUT_ID = "jernew-email-sheet";

type Kind = "you" | "them" | "page";

const MARK: Record<Kind, string> = {
  you: "bg-studojo-purple-bg shadow-[inset_0_-0.5em_0_0_#ddd6fe]",
  them: "bg-studojo-orange-bg shadow-[inset_0_-0.5em_0_0_#fde68a]",
  page: "bg-studojo-pink-bg shadow-[inset_0_-0.5em_0_0_#fbcfe8]",
};

const MARK_LABEL: Record<Kind, string> = { you: "from your answers", them: "about them", page: "your page link" };

/** Wraps known phrases in <mark>, earliest match first. */
function highlight(text: string, needles: { text: string; kind: Kind }[]): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let k = 0;
  while (rest) {
    let best: { at: number; n: { text: string; kind: Kind } } | null = null;
    for (const n of needles) {
      if (!n.text) continue;
      const at = rest.indexOf(n.text);
      if (at >= 0 && (!best || at < best.at)) best = { at, n };
    }
    if (!best) {
      out.push(rest);
      break;
    }
    if (best.at > 0) out.push(rest.slice(0, best.at));
    out.push(
      <mark key={k++} className={cx("rounded px-0.5 text-studojo-ink [box-decoration-break:clone]", MARK[best.n.kind])}>
        {best.n.text}
        <span className="sr-only"> ({MARK_LABEL[best.n.kind]})</span>
      </mark>,
    );
    rest = rest.slice(best.at + best.n.text.length);
  }
  return out;
}

export function wordCount(d: EmailDraft): number {
  return [...d.paragraphs, d.signoff, STUDENT.first].join(" ").split(/\s+/).filter(Boolean).length;
}

export interface LetterProps {
  drafts: EmailDraft[];
  index: number;
  onPick: (i: number) => void;
  match: RankedMatch;
  /** The student's project words as they appear in the email (highlighted). */
  project: string;
  profile: ProfileState;
  /** Set while the sheet is flying out of the envelope. */
  shared: boolean;
  panelId: string;
}

export function Letter({ drafts, index, onPick, match, project, profile, shared, panelId }: LetterProps) {
  const m = useMotionPresets();
  const d = drafts[index];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const needles = [
    { text: project, kind: "you" as Kind },
    { text: match.hook, kind: "them" as Kind },
    { text: match.company, kind: "them" as Kind },
    { text: PROFILE_DRAFT.url, kind: "page" as Kind },
  ];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (index + dir + drafts.length) % drafts.length;
    onPick(n);
    tabs.current[n]?.focus();
  };

  const links = d.pageCard ? 1 : d.paragraphs.some((p) => p.includes(PROFILE_DRAFT.url)) ? 1 : 0;

  return (
    <motion.article
      layoutId={shared && !m.reduced ? SHEET_LAYOUT_ID : undefined}
      transition={SPRING_SOFT}
      style={{ borderRadius: 16 }}
      className="overflow-hidden border-2 border-studojo-ink bg-white shadow-brutal-lg"
      aria-label={`${d.label} to ${match.manager.first} at ${match.company}`}
    >
      <motion.div layout={shared && !m.reduced ? "position" : false}>
        {/* Day tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-studojo-ink bg-studojo-orange-bg px-3 py-2">
          <div role="tablist" aria-label="Emails in the sequence" onKeyDown={onKey} className="flex gap-1">
            {drafts.map((x, i) => (
              <button
                key={x.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`email-tab-${x.id}`}
                aria-selected={i === index}
                aria-controls={panelId}
                tabIndex={i === index ? 0 : -1}
                onClick={() => onPick(i)}
                className={cx(
                  "relative min-h-11 rounded-lg px-3 font-satoshi text-sm font-bold text-studojo-ink",
                  FOCUS_RING,
                )}
              >
                {i === index ? (
                  <motion.span
                    layoutId={m.reduced ? undefined : "email-tab-pill"}
                    transition={SPRING}
                    className="absolute inset-0 rounded-lg border-2 border-studojo-ink bg-white shadow-[2px_2px_0_0_#191a23]"
                  />
                ) : null}
                <span className="relative">Day {x.day}</span>
              </button>
            ))}
          </div>
          <span className="font-satoshi text-xs font-bold uppercase tracking-[0.12em] text-[#b45309]">{d.label}</span>
        </div>

        {/* Mail chrome */}
        <dl className="divide-y-2 divide-studojo-ink/10 border-b-2 border-studojo-ink/15 px-4 font-satoshi text-sm sm:px-5">
          <div className="flex items-center gap-3 py-2">
            <dt className="w-14 shrink-0 text-studojo-muted">From</dt>
            <dd className="min-w-0 truncate font-medium text-studojo-ink">{STUDENT.name}, from your own Gmail</dd>
          </div>
          <div className="flex items-center gap-3 py-2">
            <dt className="w-14 shrink-0 text-studojo-muted">To</dt>
            <dd className="flex min-w-0 items-center gap-2">
              <ManagerAvatar match={match} size="sm" />
              <span className="min-w-0 truncate">
                <MaskedName match={match} className="font-bold text-studojo-ink" />
                <span className="text-studojo-muted">, {match.manager.title}, {match.company}</span>
              </span>
            </dd>
          </div>
          <div className="flex items-start gap-3 py-2">
            <dt className="w-14 shrink-0 text-studojo-muted">Subject</dt>
            <dd className="min-w-0 font-bold text-studojo-ink">{d.subject}</dd>
          </div>
        </dl>

        {/* Body */}
        <div id={panelId} role="tabpanel" aria-labelledby={`email-tab-${d.id}`} className="px-4 py-4 sm:px-5 sm:py-5">
          <motion.div key={`${d.id}-${match.id}`} variants={m.list} initial="hidden" animate="show" className="space-y-3 font-satoshi text-base leading-relaxed text-studojo-ink">
            {d.paragraphs.map((p, i) => (
              <Para key={i} variants={m.item} after={d.pageCard && i === 1 ? <PageCard profile={profile} reduced={m.reduced} className="my-1 max-w-md" /> : null}>
                {highlight(p, needles)}
              </Para>
            ))}
            <motion.p variants={m.item}>
              {d.signoff}
              <br />
              {STUDENT.first}
            </motion.p>
          </motion.div>
        </div>

        {/* Plain-text check */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t-2 border-studojo-ink/15 bg-studojo-surface-muted px-4 py-2.5 font-satoshi text-xs font-bold text-studojo-muted sm:px-5">
          <span className="inline-flex items-center gap-1.5">
            <FiType aria-hidden /> {wordCount(d)} words
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiLink aria-hidden /> {links === 0 ? "No links" : "1 link: your page"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiPaperclip aria-hidden /> No attachments
          </span>
        </div>
      </motion.div>
    </motion.article>
  );
}

function Para({ children, after, variants }: { children: ReactNode; after: ReactNode; variants: Variants }) {
  return (
    <>
      <motion.p variants={variants}>{children}</motion.p>
      {after}
    </>
  );
}
