// The sticky top bar: the studojo wordmark and Copy link always; the student's
// name and Email join it once the hero has scrolled away (the hero's own card
// carries Email until then, so it is never on screen twice).
import { useEffect, useState, type RefObject } from "react";
import { CopyLinkButton, EmailButton } from "./atoms";
import type { ProfileView } from "./profile-view";

const BAR_HEIGHT = 64;

export function StickyBar({ v, heroRef, onStatus }: { v: ProfileView; heroRef: RefObject<HTMLElement | null>; onStatus: (s: string) => void }) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([en]) => setCompact(!en.isIntersecting && en.boundingClientRect.top < BAR_HEIGHT), { rootMargin: `-${BAR_HEIGHT}px 0px 0px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [heroRef]);
  return (
    <header className="sp-bar sticky top-0 z-40 border-b border-lilac-line/80 bg-[#fcfbff]/85 backdrop-blur-md" data-compact={compact}>
      <div className="mx-auto flex h-14 max-w-[1040px] items-center gap-3 px-4 sm:h-16 sm:px-6">
        <a href="https://studojo.com" className="inline-flex min-h-[44px] flex-none items-center rounded-md text-[21px] font-black leading-none tracking-[-0.02em] text-studojo-ink">
          studojo
        </a>
        <div className="sp-bar-name flex min-w-0 items-center gap-3" aria-hidden={!compact} inert={!compact}>
          <span className="h-4 w-px flex-none bg-lilac-300" />
          <span className="truncate text-[14px] font-medium text-studojo-ink">{v.name}</span>
        </div>
        <div className="ml-auto flex flex-none items-center gap-2">
          {v.email && (
            <span className="sp-bar-email" aria-hidden={!compact} inert={!compact}>
              <EmailButton email={v.email} first={v.first} />
            </span>
          )}
          <CopyLinkButton url={v.shareUrl} onStatus={onStatus} />
        </div>
      </div>
    </header>
  );
}
