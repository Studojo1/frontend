// The student page at /profile/:slug, as a typeset CV: one 720px column, a
// small label column on desktop, hairlines between sections, Satoshi for text
// and Newsreader for the name, the figures and the student's own words. No
// cards, badges, seals or travel motifs. The data rules live in profileView().
import { forwardRef, useMemo, useRef, useState } from "react";
import { CopyLinkButton, EmailButton } from "./atoms";
import { StickyBar } from "./bar";
import { profileView, type ProfileView } from "./profile-view";
import { About, Awards, Highlights, Identity, LookingFor, Skills, StintSection } from "./sections";
import { Sources } from "./sources";
import type { Profile } from "./types";

const Closing = forwardRef<HTMLDivElement, { v: ProfileView; onStatus: (s: string) => void }>(function Closing({ v, onStatus }, ref) {
  return (
    <footer className="mx-auto w-full max-w-[720px] px-5 sm:px-8 md:px-0">
      <div id="closing" ref={ref} className="flex flex-col gap-3 border-t border-neutral-200 pb-6 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 break-all text-[14px] text-neutral-600">{v.url}</p>
        <div className="sp-no-print flex flex-wrap gap-2">
          <EmailButton email={v.email} first={v.first} place="closing" />
          <CopyLinkButton url={v.shareUrl} onStatus={onStatus} />
        </div>
      </div>
      <div className="flex flex-col pb-10 pt-2 text-[13px] text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center">
          Made with
          <a href="https://studojo.com" className="ml-1.5 inline-flex min-h-[44px] items-center text-[15px] font-black tracking-[-0.02em] text-studojo-ink transition-colors hover:text-studojo-purple-strong sm:min-h-[28px]">
            studojo
          </a>
        </p>
        <p>Work on things that matter.</p>
      </div>
    </footer>
  );
});

export default function StudentPage({ p }: { p: Profile }) {
  const v = useMemo(() => profileView(p), [p]);
  const introRef = useRef<HTMLElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  return (
    <div className="student-page min-h-screen bg-white font-satoshi text-studojo-ink antialiased">
      <StickyBar v={v} introRef={introRef} closingRef={closingRef} onStatus={setStatus} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[720px] px-5 focus:outline-none sm:px-8 md:px-0">
        <Identity v={v} ref={introRef} />
        {v.looking && <LookingFor looking={v.looking} />}
        {v.highlights.length > 0 && <Highlights items={v.highlights} />}
        {v.about && <About about={v.about} />}
        {v.stints.map((s) => (
          <StintSection key={s.kind} section={s} />
        ))}
        {v.awards && <Awards awards={v.awards} />}
        {v.skills.length > 0 && <Skills groups={v.skills} />}
        {v.sources && v.proof && <Sources sources={v.sources} proof={v.proof} first={v.first} poss={v.poss} updated={v.updated} />}
      </main>
      <Closing v={v} ref={closingRef} onStatus={setStatus} />
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}
