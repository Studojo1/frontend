// PROFILE-V2 (27 Oct 2026): the student page's shared pieces in the site's look (b2c/profile.css), for studojo.pro
// only. Same words, same behaviour and the same data as the classic pieces (../atoms.tsx, which studojo.com keeps
// drawing, untouched): the source chip and the resume lines it opens, "Show N more", section frames and cards, the
// claims bar, Copy link and Email. Text helpers (Rich), icons and the milled seal are the classic ones.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, Rich } from "../atoms";
import type { Item, LineView } from "../profile-view";

/** "8 of 8 claims matched" as a bar: one segment per claim up to 16, then a plain fill. */
export function Meter({ matched, total }: { matched: number; total: number }) {
  if (!total) return null;
  const label = `${matched} of ${total} claims matched`;
  if (total <= 16) {
    return (
      <span className="pv-meter" role="img" aria-label={label}>
        {Array.from({ length: total }, (_, i) => (
          <i key={i} className={i < matched ? "pv-on" : undefined} />
        ))}
      </span>
    );
  }
  return (
    <span className="pv-meter-fill" role="img" aria-label={label}>
      <i style={{ width: `${Math.round((matched / total) * 100)}%` }} />
    </span>
  );
}

/** The source chip under a figure, an entry or a skill group: "Source · line 20". 44px tall on phones. */
export function SourceButton({ open, controls, onClick, label, context }: { open: boolean; controls: string; onClick: () => void; label: string; context: string }) {
  return (
    <button type="button" data-toggle="" aria-expanded={open} aria-controls={controls} onClick={onClick} className="pv-src">
      <span className="pv-src-ok">
        <Icon name="check" size={10} />
      </span>
      <span>Source</span>
      <span className="pv-src-line">
        {"·"} {label.replace(/^Resume l/, "l")}
      </span>
      <span className="pv-sr"> for {context}</span>
      <Icon name="chevron" size={14} className="sp-chev" />
    </button>
  );
}

/** Quoted resume lines, numbered as on the resume; context lines dimmed. */
export function LineList({ lines }: { lines: LineView[] }) {
  return (
    <ol role="list" className="pv-lines">
      {lines.map((l) => (
        <li key={l.id}>
          <span className="pv-ln">
            <span className="pv-sr">Line </span>
            {l.n}
          </span>
          <span className={`pv-lt${l.ctx ? " pv-ctx" : l.strong ? " pv-strong" : ""}`}>
            {l.ctx && <span className="pv-sr">Context: </span>}
            <Rich text={l.text} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The resume lines behind a claim, in a lilac panel. */
export function SourcePanel({ id, open, lines, poss }: { id: string; open: boolean; lines: LineView[]; poss: string }) {
  return (
    <div id={id} hidden={!open} className="pv-panel">
      <p className="pv-panel-cap">
        <Icon name="file" size={14} />
        <span>From {poss} resume</span>
      </p>
      <LineList lines={lines} />
    </div>
  );
}

/** "Show 15 more" / "Show fewer", in the same quiet purple as the source chip. */
export function MoreButton({ count, open, controls, onClick, what }: { count: number; open: boolean; controls: string; onClick: () => void; what: string }) {
  return (
    <button type="button" data-toggle="" aria-expanded={open} aria-controls={controls} onClick={onClick} className="pv-more">
      <span>{open ? "Show fewer" : `Show ${count} more`}</span>
      <span className="pv-sr"> from {what}</span>
      <Icon name="chevron" size={14} className="sp-chev" />
    </button>
  );
}

/** A section: the heading with a quiet line beside it, then its content. */
export function Section({ id, title, sub, children }: { id: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="pv-sec">
      <div className="pv-sec-head">
        <h2 id={`${id}-h`} className="pv-h2">
          {title}
        </h2>
        {sub && <p className="pv-sub">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

/** A white section card. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`pv-card ${className}`.trim()}>{children}</div>;
}

/** A list item from the resume: an optional run-in head, then the text. A strong line without a head is a sub-heading. */
export function ItemLi({ item }: { item: Item }) {
  if (item.strong && !item.head) {
    return (
      <li className="pv-item-head">
        <Rich text={item.text} />
      </li>
    );
  }
  return (
    <li className="pv-item">
      <span>
        {item.head && (
          <>
            <b>
              <Rich text={item.head} />.
            </b>{" "}
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
      <ul role="list" className="pv-items">
        {head.map((o, i) => (
          <ItemLi key={i} item={o} />
        ))}
      </ul>
      {rest.length > 0 && (
        <ul id={moreId} role="list" data-more-list="" hidden={!moreOpen} className="pv-items">
          {rest.map((o, i) => (
            <ItemLi key={i} item={o} />
          ))}
        </ul>
      )}
    </>
  );
}

/** Copy link: the page's own address (never window.location, which can carry tracking parameters). */
export function CopyLinkButton({ url, onStatus, small = false, className = "" }: { url: string; onStatus: (s: string) => void; small?: boolean; className?: string }) {
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
    <button type="button" data-copy="" data-flash={label !== "Copy link"} onClick={copy} className={`pv-hit ${className}`.trim()}>
      <span className={small ? "pv-ghost pv-ghost-sm" : "pv-ghost"}>
        <Icon name={done ? "check" : "link"} size={16} className={done ? "pv-ok" : ""} />
        <span className="pv-copy-text">{label}</span>
      </span>
    </button>
  );
}

/** Email, only when the student allows contact: the page's one purple pill. Its accessible name is always "Email {first}". */
export function EmailButton({ email, first, size = "small" }: { email: string | null; first: string; size?: "small" | "wide" }) {
  if (!email) return null;
  if (size === "wide") {
    return (
      <a href={`mailto:${email}`} className="pv-btn pv-btn-wide">
        <Icon name="mail" size={17} />
        Email {first}
      </a>
    );
  }
  return (
    <a href={`mailto:${email}`} className="pv-hit">
      <span className="pv-btn pv-btn-sm">
        <Icon name="mail" size={16} />
        <span className="pv-email-text">Email {first}</span>
      </span>
    </a>
  );
}
