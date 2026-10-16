// Small shared pieces of the student page: text with its quiet details, the
// chevron, the claims mark, text toggles, quoted resume lines, the section
// frame, and the Copy link and Email buttons.
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Item, LineView } from "./profile-view";

/** A disclosure's open state and the id its panel uses (aria-controls). */
export function useDisclosure(initial = false) {
  const id = useId();
  const [open, setOpen] = useState(initial);
  return { id, open, setOpen, toggle: () => setOpen((o) => !o) };
}

// Short hyphenated words never split at a line end ("hands-on", "Push-Pull", "end-to-end").
const HYPHENATED = /(^|[\s(])([A-Za-z0-9\u2019]+(?:-[A-Za-z0-9\u2019]+)+)(?=$|[\s,.;:!?)])/g;
const REDACTED = /\[(?:phone|email) hidden\]/g;

function keepHyphenated(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  HYPHENATED.lastIndex = 0;
  while ((m = HYPHENATED.exec(text))) {
    const word = m[2];
    if (word.length > 16) continue;
    const start = m.index + m[1].length;
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <span key={`${key}-${start}`} className="whitespace-nowrap">
        {word}
      </span>,
    );
    last = start + word.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** A view string: redaction marks are quiet, short hyphenated words stay whole. Never used for the name. */
export function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  REDACTED.lastIndex = 0;
  while ((m = REDACTED.exec(text))) {
    if (m.index > last) parts.push(...keepHyphenated(text.slice(last, m.index), `t${last}`));
    parts.push(
      <span key={`r${m.index}`} className="text-neutral-500">
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(...keepHyphenated(text.slice(last), `t${last}`));
  return <>{parts.map((p, i) => (typeof p === "string" ? <Fragment key={`s${i}`}>{p}</Fragment> : p))}</>;
}

export function Chevron() {
  return (
    <svg className="sp-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.75 4.5 6 7.75 9.25 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The claims summary mark: a filled purple check only when every claim matched, otherwise a plain grey ring. Nothing else on the page uses a check. */
export function SummaryMark({ all }: { all: boolean }) {
  return all ? (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="flex-none">
      <circle cx="8" cy="8" r="8" fill="#6d28d9" />
      <path d="M4.8 8.2 7 10.3l4.2-4.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="flex-none">
      <circle cx="8" cy="8" r="7.1" fill="none" stroke="#737373" strokeWidth="1.6" />
    </svg>
  );
}

export function RingIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="flex-none">
      <circle cx="5" cy="5" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * The quiet text button ("Resume lines 30 to 33", "Show 15 more", "Open all"):
 * a small look with a full hit area, 44px tall on phones and 28px from 640px,
 * with negative margins so the layout does not move.
 */
export function TextToggle({ open, controls, onClick, className = "", children, all }: { open: boolean; controls: string; onClick: () => void; className?: string; children: ReactNode; all?: boolean }) {
  return (
    <button
      type="button"
      data-toggle=""
      data-all={all ? "" : undefined}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
      className={`relative -my-3 inline-flex min-h-[44px] items-center gap-1.5 py-3 text-[13px] font-medium leading-5 text-neutral-600 transition-colors hover:text-studojo-purple-strong aria-expanded:text-studojo-purple-strong sm:-my-1 sm:min-h-[28px] sm:py-1 ${className}`}
    >
      {children}
      <Chevron />
    </button>
  );
}

/** One row of quiet controls under a block: "Show N more" and its citation side by side, so their hit areas never overlap. */
export function Controls({ children }: { children: ReactNode[] }) {
  const kids = children.filter(Boolean);
  if (!kids.length) return null;
  return <div className="mt-3 flex flex-wrap items-center gap-x-6">{kids}</div>;
}

/** The quoted resume lines, numbered as on the resume; context lines are dimmed. */
export function LineList({ lines }: { lines: LineView[] }) {
  return (
    <ol role="list" className="space-y-1.5 border-l border-neutral-200 pl-3 sm:pl-4">
      {lines.map((l) => (
        <li key={l.id} className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-2 sm:grid-cols-[28px_minmax(0,1fr)] sm:gap-x-2.5">
          <span className="text-right text-[12px] leading-[22px] tabular-nums text-neutral-500">
            <span className="sr-only">Line </span>
            {l.n}
          </span>
          <span className={`text-[14px] leading-[22px] ${l.ctx ? "text-neutral-500" : l.strong ? "font-medium text-studojo-ink" : "text-neutral-800"}`}>
            {l.ctx && <span className="sr-only">Context: </span>}
            <Rich text={l.text} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/** A panel of quoted lines. It uses the hidden attribute, never conditional rendering, so aria-controls always resolves. */
export function SourcePanel({ id, open, lines, className = "" }: { id: string; open: boolean; lines: LineView[]; className?: string }) {
  return (
    <div id={id} hidden={!open} className={`mt-3 ${className}`}>
      <LineList lines={lines} />
    </div>
  );
}

// Tailwind only generates classes it can read whole in the source, so the label offsets are a static map.
const LABEL_PT = { 3: "md:pt-[3px]", 4: "md:pt-[4px]", 5: "md:pt-[5px]", 6: "md:pt-[6px]", 7: "md:pt-[7px]", 8: "md:pt-[8px]", 11: "md:pt-[11px]", 13: "md:pt-[13px]" } as const;

/** A section: a hairline above, the small uppercase label on the left on desktop (lined up with the first line of content), above on phones. */
export function Section({ id, label, labelTop, children }: { id: string; label: string; labelTop: keyof typeof LABEL_PT; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-[72px] border-t border-neutral-200 py-8 md:grid md:grid-cols-[144px_minmax(0,1fr)] md:gap-x-8 md:py-11">
      <h2 id={`${id}-h`} className={`sp-label mb-3 md:mb-0 ${LABEL_PT[labelTop]}`}>
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** A list item from the resume: an optional run-in head, then the text. A strong line without a head is a sub-heading. */
export function ItemLi({ item }: { item: Item }) {
  if (item.strong && !item.head) {
    return (
      <li className="pl-0! text-[15px] font-medium leading-[1.6] text-studojo-ink before:hidden!">
        <Rich text={item.text} />
      </li>
    );
  }
  return (
    <li className="text-[15px] leading-[1.6] text-neutral-700">
      {item.head && (
        <>
          <span className="font-medium text-studojo-ink">
            <Rich text={item.head} />.
          </span>{" "}
        </>
      )}
      <Rich text={item.text} />
    </li>
  );
}

/** The first `shown` items, then the rest in a list the "Show N more" toggle reveals (and print always shows). */
export function ItemLists({ items, shown, moreId, moreOpen }: { items: Item[]; shown: number; moreId: string; moreOpen: boolean }) {
  const head = items.slice(0, shown);
  const rest = items.slice(shown);
  return (
    <>
      <ul role="list" className="sp-dots max-w-[35em] space-y-1.5">
        {head.map((o, i) => (
          <ItemLi key={i} item={o} />
        ))}
      </ul>
      {rest.length > 0 && (
        <ul id={moreId} role="list" data-more-list="" hidden={!moreOpen} className="sp-dots mt-1.5 max-w-[35em] space-y-1.5">
          {rest.map((o, i) => (
            <ItemLi key={i} item={o} />
          ))}
        </ul>
      )}
    </>
  );
}

/** "Show 15 more" / "Show fewer", with the list it belongs to for screen readers. */
export function MoreToggle({ count, open, controls, onClick, what }: { count: number; open: boolean; controls: string; onClick: () => void; what: string }) {
  return (
    <TextToggle open={open} controls={controls} onClick={onClick}>
      <span>{open ? "Show fewer" : `Show ${count} more`}</span>
      <span className="sr-only"> from {what}</span>
    </TextToggle>
  );
}

function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" className="flex-none">
      <path d="M6.6 9.4a2.9 2.9 0 0 0 4.1 0l2.2-2.2a2.9 2.9 0 0 0-4.1-4.1l-.9.9M9.4 6.6a2.9 2.9 0 0 0-4.1 0L3.1 8.8a2.9 2.9 0 0 0 4.1 4.1l.9-.9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" className="flex-none">
      <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m2.5 4.5 5.5 4 5.5-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const CHIP = "inline-flex h-9 items-center gap-2 rounded-md text-[13.5px] font-medium transition-colors";

/** Copy link: the page's own address (never window.location, which can carry tracking parameters). */
export function CopyLinkButton({ url, onStatus }: { url: string; onStatus: (s: string) => void }) {
  const [label, setLabel] = useState("Copy link");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // In-app browsers (LinkedIn, Instagram) often block the clipboard API.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.readOnly = true;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
    }
    setLabel(ok ? "Copied" : "Copy failed");
    onStatus(ok ? "Link copied" : "Could not copy the link");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLabel("Copy link"), 1800);
  }
  return (
    <button type="button" data-copy="" onClick={copy} className="group -my-1 inline-flex min-h-[44px] items-center focus-visible:outline-none sm:my-0 sm:min-h-0">
      <span className={`sp-copy-chip ${CHIP} border border-neutral-300 bg-white px-3 text-studojo-ink group-hover:border-neutral-400 group-hover:bg-neutral-50 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-studojo-purple-strong`}>
        <LinkIcon />
        <span className="sp-copy-text">{label}</span>
      </span>
    </button>
  );
}

/** Email, only when the student allows contact. In the bar it reads "Email" on phones and "Email {first}" from 640px; its accessible name is always "Email {first}". */
export function EmailButton({ email, first, place }: { email: string | null; first: string; place: "bar" | "intro" | "closing" }) {
  if (!email) return null;
  return (
    <a href={`mailto:${email}`} className="group -my-1 inline-flex min-h-[44px] items-center focus-visible:outline-none sm:my-0 sm:min-h-0">
      <span className={`sp-email-chip ${CHIP} bg-studojo-ink px-3 text-white group-hover:bg-neutral-700 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-studojo-purple-strong`}>
        <MailIcon />
        {place === "bar" ? (
          <span className="sp-email-text">
            <span>Email</span>
            <span className="sr-only sm:not-sr-only"> {first}</span>
          </span>
        ) : (
          <span>Email {first}</span>
        )}
      </span>
    </a>
  );
}
