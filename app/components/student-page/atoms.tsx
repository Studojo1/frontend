// Shared pieces of the student page: text with its quiet details, icons, the
// source chip and the resume lines it opens, section frames and cards, the
// resume-check seal and bar, and the Copy link and Email buttons.
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Item, LineView } from "./profile-view";

/** A disclosure's open state and the id its panel uses (aria-controls). */
export function useDisclosure(initial = false) {
  const id = useId();
  const [open, setOpen] = useState(initial);
  return { id, open, setOpen, toggle: () => setOpen((o) => !o) };
}

// Short hyphenated words never split at a line end ("hands-on", "Push-Pull", "end-to-end").
const HYPHENATED = /(^|[\s(])([A-Za-z0-9’]+(?:-[A-Za-z0-9’]+)+)(?=$|[\s,.;:!?)])/g;
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
      <span key={`r${m.index}`} className="text-neutral-600">
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(...keepHyphenated(text.slice(last), `t${last}`));
  return <>{parts.map((p, i) => (typeof p === "string" ? <Fragment key={`s${i}`}>{p}</Fragment> : p))}</>;
}

const ICONS = {
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9.25" />
      <path d="m8.5 12.25 2.4 2.4 4.6-4.9" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="9.25" />,
  cap: (
    <>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
} as const;

export function Icon({ name, size = 16, className = "" }: { name: keyof typeof ICONS; size?: number; className?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      {ICONS[name]}
    </svg>
  );
}

/** The resume-check seal: a milled ring around a solid check. Green only when every claim matched; otherwise neutral. */
export function Seal({ all, size }: { all: boolean; size: number }) {
  const c = all
    ? { face: "#f1fcf7", rim: "#a7f3d0", tick: "#6ee7b7", disc: "#10b981", discRim: "#10b981", check: "#ffffff" }
    : { face: "#fafafa", rim: "#e5e5e5", tick: "#d4d4d4", disc: "#ffffff", discRim: "#a3a3a3", check: "#525252" };
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = (i * 5 * Math.PI) / 180;
    ticks.push(<line key={i} x1={(32 + Math.cos(a) * 27.6).toFixed(2)} y1={(32 + Math.sin(a) * 27.6).toFixed(2)} x2={(32 + Math.cos(a) * 30.2).toFixed(2)} y2={(32 + Math.sin(a) * 30.2).toFixed(2)} />);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <circle cx="32" cy="32" r="31.3" fill={c.face} stroke={c.rim} strokeWidth="1.2" />
      <g stroke={c.tick} strokeWidth="0.9" strokeLinecap="round">
        {ticks}
      </g>
      <circle cx="32" cy="32" r="24.5" fill={c.disc} stroke={c.discRim} strokeWidth="1.2" />
      {all && <circle cx="32" cy="32" r="21.8" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.8" />}
      <path d="m22.8 32.6 6.2 6.2 12.4-13.2" fill="none" stroke={c.check} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "8 of 8 claims matched" as a bar: one segment per claim up to 16, then a plain fill. */
export function Meter({ matched, total }: { matched: number; total: number }) {
  if (!total) return null;
  const label = `${matched} of ${total} claims matched`;
  if (total <= 16) {
    return (
      <div className="flex gap-1" role="img" aria-label={label}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < matched ? "bg-studojo-green" : "bg-ok-soft ring-1 ring-inset ring-studojo-green/25"}`} />
        ))}
      </div>
    );
  }
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-ok-soft" role="img" aria-label={label}>
      <div className="h-full rounded-full bg-studojo-green" style={{ width: `${Math.round((matched / total) * 100)}%` }} />
    </div>
  );
}

/**
 * The source chip under a figure, an entry or a skill group: "Source · line 20".
 * A small look with a full hit area (44px tall on phones), negative margins so the layout does not move.
 */
export function SourceButton({ open, controls, onClick, label, context }: { open: boolean; controls: string; onClick: () => void; label: string; context: string }) {
  return (
    <button
      type="button"
      data-toggle=""
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
      className="-mx-2 -my-2.5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-2 py-2.5 text-[13px] font-medium text-studojo-purple-strong transition-colors hover:bg-lilac-100 sm:-my-1 sm:min-h-[32px] sm:py-1"
    >
      <span className="grid h-4 w-4 place-items-center rounded-full bg-studojo-green-bg text-ok-ink">
        <Icon name="check" size={10} />
      </span>
      <span>Source</span>
      <span className="font-normal text-neutral-600">
        {"·"} {label.replace(/^Resume l/, "l")}
      </span>
      <span className="sr-only"> for {context}</span>
      <Icon name="chevron" size={14} className="sp-chev opacity-70" />
    </button>
  );
}

/** Quoted resume lines, numbered as on the resume; context lines dimmed. */
export function LineList({ lines }: { lines: LineView[] }) {
  return (
    <ol role="list" className="space-y-2">
        {lines.map((l) => (
          <li key={l.id} className="grid grid-cols-[26px_minmax(0,1fr)] gap-x-2">
            <span className="sp-tnum pt-px text-right text-[12px] leading-[22px] text-neutral-600">
              <span className="sr-only">Line </span>
              {l.n}
            </span>
            <span className={`border-l-2 pl-3 text-[14.5px] leading-[22px] ${l.ctx ? "border-lilac-200 text-neutral-600" : l.strong ? "border-lilac-300 font-medium text-studojo-ink" : "border-lilac-300 text-studojo-ink"}`}>
              {l.ctx && <span className="sr-only">Context: </span>}
              <Rich text={l.text} />
            </span>
          </li>
        ))}
    </ol>
  );
}

/** The resume lines behind a claim, in a lilac panel. */
export function SourcePanel({ id, open, lines, poss, className = "" }: { id: string; open: boolean; lines: LineView[]; poss: string; className?: string }) {
  return (
    <div id={id} hidden={!open} className={`mt-2.5 rounded-2xl border border-lilac-200 bg-lilac-50 px-4 py-3.5 ${className}`}>
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-studojo-purple-strong">
        <Icon name="file" size={14} />
        <span>From {poss} resume</span>
      </p>
      <div className="mt-2.5">
        <LineList lines={lines} />
      </div>
    </div>
  );
}

/** "Show 15 more" / "Show fewer", in the same quiet purple as the source chip. */
export function MoreButton({ count, open, controls, onClick, what }: { count: number; open: boolean; controls: string; onClick: () => void; what: string }) {
  return (
    <button
      type="button"
      data-toggle=""
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
      className="-mx-2 -my-2.5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-2 py-2.5 text-[13.5px] font-medium text-studojo-purple-strong transition-colors hover:bg-lilac-100 sm:-my-1 sm:min-h-[32px] sm:py-1"
    >
      <span>{open ? "Show fewer" : `Show ${count} more`}</span>
      <span className="sr-only"> from {what}</span>
      <Icon name="chevron" size={14} className="sp-chev opacity-70" />
    </button>
  );
}

/** A section: a Clash Display heading with a quiet line beside it, then its content. */
export function Section({ id, title, sub, children }: { id: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 pt-14 sm:pt-16">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <h2 id={`${id}-h`} className="font-clash text-[23px] font-medium leading-tight tracking-[-0.01em] text-studojo-ink sm:text-[26px]">
          {title}
        </h2>
        {sub && <p className="text-pretty text-[14.5px] leading-snug text-neutral-600 sm:text-right">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

/** A white section card. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-[24px] border border-lilac-line bg-white shadow-lilac-soft ${className}`}>{children}</div>;
}

/** A list item from the resume: an optional run-in head, then the text. A strong line without a head is a sub-heading. */
export function ItemLi({ item }: { item: Item }) {
  if (item.strong && !item.head) {
    return (
      <li className="max-w-[74ch] text-[15px] font-medium leading-relaxed text-studojo-ink">
        <Rich text={item.text} />
      </li>
    );
  }
  return (
    <li className="flex max-w-[74ch] gap-3 text-[15px] leading-relaxed text-neutral-700">
      <span aria-hidden="true" className="mt-[0.68em] h-[5px] w-[5px] shrink-0 rounded-full bg-lilac-400" />
      <span className="min-w-0 text-pretty">
        {item.head && (
          <>
            <span className="font-medium text-studojo-ink">
              <Rich text={item.head} />.
            </span>{" "}
          </>
        )}
        <Rich text={item.text} />
      </span>
    </li>
  );
}

/** The first `shown` items, then the rest in a list "Show N more" reveals (and print always shows). */
export function ItemLists({ items, shown, moreId, moreOpen }: { items: Item[]; shown: number; moreId: string; moreOpen: boolean }) {
  const head = items.slice(0, shown);
  const rest = items.slice(shown);
  return (
    <>
      <ul role="list" className="space-y-2.5">
        {head.map((o, i) => (
          <ItemLi key={i} item={o} />
        ))}
      </ul>
      {rest.length > 0 && (
        <ul id={moreId} role="list" data-more-list="" hidden={!moreOpen} className="mt-2.5 space-y-2.5">
          {rest.map((o, i) => (
            <ItemLi key={i} item={o} />
          ))}
        </ul>
      )}
    </>
  );
}

/** Copy link: the page's own address (never window.location, which can carry tracking parameters). */
export function CopyLinkButton({ url, onStatus }: { url: string; onStatus: (s: string) => void }) {
  const [label, setLabel] = useState("Copy link");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
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
  const done = label === "Copied";
  return (
    <button type="button" data-copy="" data-flash={label !== "Copy link"} onClick={copy} className="group -my-1 inline-flex min-h-[44px] items-center focus-visible:outline-none">
      <span className="sp-copy-chip inline-flex h-9 items-center gap-2 rounded-full border border-lilac-line bg-white px-3.5 text-[14px] font-medium text-studojo-ink shadow-lilac-soft transition-colors group-hover:border-lilac-300 group-hover:bg-lilac-50 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-studojo-purple-strong">
        <Icon name={done ? "check" : "link"} size={16} className={done ? "text-ok-ink" : ""} />
        <span className="sp-copy-text">{label}</span>
      </span>
    </button>
  );
}

/** Email, only when the student allows contact. Its accessible name is always "Email {first}". */
export function EmailButton({ email, first, size = "chip" }: { email: string | null; first: string; size?: "chip" | "wide" }) {
  if (!email) return null;
  if (size === "wide") {
    return (
      <a href={`mailto:${email}`} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-studojo-purple-strong text-[15px] font-medium text-white transition-colors hover:bg-[#5b21b6]">
        <Icon name="mail" size={17} />
        Email {first}
      </a>
    );
  }
  return (
    <a href={`mailto:${email}`} className="group -my-1 inline-flex min-h-[44px] items-center focus-visible:outline-none">
      <span className="sp-email-chip inline-flex h-9 items-center gap-2 rounded-full bg-studojo-purple-strong px-4 text-[14px] font-medium text-white transition-colors group-hover:bg-[#5b21b6] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-studojo-purple-strong">
        <Icon name="mail" size={16} />
        <span className="sp-email-text">
          Email<span className="sr-only sm:not-sr-only"> {first}</span>
        </span>
      </span>
    </a>
  );
}
