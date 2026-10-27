import { useEffect, useRef, useState } from "react";

// SITE-V2 legal pages (/terms, /privacy, /refund-policy) on B2C hosts: "on this page", built in the browser from the
// page's own section headings (every section already carries an id), so the generated legal markup stays exactly as
// it is. Desktop (site-pages.css, 1140px and up): a sticky list beside the reading column, the section in view marked.
// Below that: a closed "on this page" card above the text (`phone`; the refund policy has its own Contents list there).
// The routes render this only on B2C hosts, so studojo.com never gets it. The server renders the empty frame; the
// list fills in after hydration, in a column that is already reserved, so nothing moves.

type Item = { id: string; text: string };

const SPY_LINE = 160; // px from the top of the window: below the sticky header, where a section counts as "in view"

export function LegalToc({ phone = true }: { phone?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDetailsElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const main = ref.current?.parentElement;
    if (!main) return;
    const found: Item[] = [];
    for (const h of Array.from(main.querySelectorAll<HTMLElement>(":scope > section [id] > h2"))) {
      const id = h.parentElement?.id ?? "";
      const text = (h.textContent ?? "").replace(/\s+/g, " ").trim();
      if (id && text) found.push({ id, text });
    }
    setItems(found);
    if (!found.length) return;
    const targets = found.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    let raf = 0;
    const spy = () => {
      raf = 0;
      let cur = found[0].id;
      for (const t of targets) {
        if (t.getBoundingClientRect().top - SPY_LINE <= 0) cur = t.id;
        else break;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(spy);
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Keep the marked entry visible inside the sticky list when it is taller than the window (the Terms have 26).
  useEffect(() => {
    const box = deskRef.current;
    if (!box || !active) return;
    const link = box.querySelector<HTMLElement>(`a[data-id="${CSS.escape(active)}"]`);
    if (!link || box.scrollHeight <= box.clientHeight) return;
    const top = link.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    if (top < box.scrollTop + 40 || top > box.scrollTop + box.clientHeight - 60) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 3);
    }
  }, [active]);

  const list = (onPick?: () => void) => (
    <ol>
      {items.map((i) => (
        <li key={i.id}>
          <a href={`#${i.id}`} data-id={i.id} aria-current={active === i.id ? "true" : undefined} onClick={onPick}>
            {i.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div ref={ref} className={`sv-ltoc${phone ? "" : " sv-ltoc-nophone"}`}>
      {phone ? (
        <details ref={phoneRef} className="sv-ltoc-ph">
          <summary>
            <span className="sv-kicker">on this page</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          {list(() => {
            if (phoneRef.current) phoneRef.current.open = false;
          })}
        </details>
      ) : null}
      <nav ref={deskRef} className="sv-ltoc-desk" aria-label="on this page">
        <span className="sv-kicker">on this page</span>
        {list()}
      </nav>
    </div>
  );
}
