// The sticky bar: the studojo wordmark and Copy link always; the student's name
// and Email join once the identity block has scrolled away; its actions step
// aside while the closing row (which has its own) is on screen, so Email and
// Copy link never show twice at once. On phones Email lives here from the start.
import { useEffect, useState, type RefObject } from "react";
import { CopyLinkButton, EmailButton } from "./atoms";
import type { ProfileView } from "./profile-view";

const BAR_HEIGHT = 56;

export function StickyBar({ v, introRef, closingRef, onStatus }: { v: ProfileView; introRef: RefObject<HTMLElement | null>; closingRef: RefObject<HTMLElement | null>; onStatus: (s: string) => void }) {
  const [compact, setCompact] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  // Server render: the bar Email counts as live; CSS keeps it invisible (and out of the tab order) on desktop until it applies.
  const [isPhone, setIsPhone] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const phone = window.matchMedia("(max-width: 639px)");
    const onPhone = () => setIsPhone(phone.matches);
    onPhone();
    phone.addEventListener("change", onPhone);
    const observers: IntersectionObserver[] = [];
    if ("IntersectionObserver" in window) {
      if (introRef.current) {
        const io = new IntersectionObserver(
          ([en]) => setCompact(!en.isIntersecting && en.boundingClientRect.top < BAR_HEIGHT),
          { rootMargin: `-${BAR_HEIGHT}px 0px 0px 0px` },
        );
        io.observe(introRef.current);
        observers.push(io);
      }
      if (closingRef.current) {
        const io = new IntersectionObserver(([en]) => setAtEnd(en.isIntersecting));
        io.observe(closingRef.current);
        observers.push(io);
      }
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      phone.removeEventListener("change", onPhone);
      observers.forEach((o) => o.disconnect());
    };
  }, [introRef, closingRef]);

  const emailLive = compact || isPhone;
  return (
    <header className="sp-bar sticky top-0 z-30 bg-white/95 backdrop-blur-[4px]" data-compact={compact} data-scrolled={scrolled} data-end={atEnd}>
      <div className="mx-auto flex h-14 w-full max-w-[720px] items-center gap-3 px-5 sm:px-8 md:px-0">
        <a href="https://studojo.com" className="inline-flex min-h-[44px] flex-none items-center text-[21px] font-black leading-none tracking-[-0.02em] text-studojo-ink">
          studojo
        </a>
        <div className="sp-bar-name flex min-w-0 items-center gap-3" aria-hidden={!compact} inert={!compact}>
          <span className="h-4 w-px flex-none bg-neutral-300" />
          <span className="truncate text-[14px] font-medium text-studojo-ink">{v.name}</span>
        </div>
        <div className="sp-bar-actions ml-auto flex flex-none items-center gap-2" aria-hidden={atEnd} inert={atEnd}>
          {v.email && (
            <span className="sp-bar-email" aria-hidden={!emailLive} inert={!emailLive}>
              <EmailButton email={v.email} first={v.first} place="bar" />
            </span>
          )}
          <CopyLinkButton url={v.shareUrl} onStatus={onStatus} />
        </div>
      </div>
    </header>
  );
}
