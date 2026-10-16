// The student page at /profile/:slug: a soft lilac hero (who they are, what they
// are looking for, and a resume-check strip), then lilac highlight tiles and
// white section cards, ending with the proof report. Clash Display for the name,
// headings and figures, Satoshi for text. The data rules live in profileView().
import { useMemo, useRef, useState } from "react";
import { StickyBar } from "./bar";
import { profileView } from "./profile-view";
import { About, Awards, Hero, Highlights, Skills, StintSection } from "./sections";
import { Proof } from "./sources";
import type { Profile } from "./types";

export default function StudentPage({ p }: { p: Profile }) {
  const v = useMemo(() => profileView(p), [p]);
  const heroRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState("");
  return (
    <div className="student-page min-h-screen bg-[#fcfbff] font-satoshi text-studojo-ink antialiased">
      <StickyBar v={v} heroRef={heroRef} onStatus={setStatus} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[1040px] px-4 pt-4 focus:outline-none sm:px-6 sm:pt-8">
        <Hero v={v} ref={heroRef} />
        {v.highlights.length > 0 && <Highlights items={v.highlights} stacked={v.figCol.stack !== "none"} poss={v.poss} />}
        {v.about && <About about={v.about} poss={v.poss} />}
        {v.stints.map((s) => (
          <StintSection key={s.kind} section={s} poss={v.poss} />
        ))}
        {v.awards && <Awards awards={v.awards} poss={v.poss} />}
        {v.skills.length > 0 && <Skills groups={v.skills} first={v.first} poss={v.poss} />}
        {v.sources && v.proof && <Proof sources={v.sources} proof={v.proof} first={v.first} poss={v.poss} updated={v.updated} />}
      </main>
      <footer className="mt-20 border-t border-lilac-line">
        <div className="mx-auto flex max-w-[1040px] flex-col gap-1.5 px-4 py-8 text-[14px] text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-1.5">
            Made with
            <a href="https://studojo.com" className="inline-flex min-h-[44px] items-center rounded-md text-[15px] font-black tracking-[-0.02em] text-studojo-ink transition-colors hover:text-studojo-purple-strong sm:min-h-[28px]">
              studojo
            </a>
          </p>
          <p>Work on things that matter.</p>
        </div>
      </footer>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}
