// PROFILE-V2 (27 Oct 2026): a student's public page (/profile/:slug) on studojo.pro, in the site's look: the site
// header and footer (site-b2c), then the owner's structure of 16 Oct, kept whole: the lilac hero card (photo, name,
// labelled facts, Copy link), the floating "{first} is looking for" card, the resume-check strip, highlight tiles,
// About, the section cards, skill pills, and the proof report last. Once the hero has scrolled away, a slim bar under
// the header carries the student's name, Email (when allowed) and Copy link, as the classic page's bar did.
// Rendered by routes/profile_.$slug.tsx on B2C hosts only (site-b2c/host.tsx); studojo.com keeps the classic page
// (../page.tsx), untouched. Data rules: profileView() (../profile-view.ts), shared by both.
// The footer is the compact one: on someone's page the one purple pill is Email, not "start the call".
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { SiteFooter } from "../../site-b2c/SiteFooter";
import { SiteHeader } from "../../site-b2c/SiteHeader";
import { profileView, type ProfileView } from "../profile-view";
import type { Profile } from "../types";
import { CopyLinkButton, EmailButton } from "./atoms";
import profileCss from "./profile.css?url";
import { About, Awards, Hero, Highlights, Skills, StintSection } from "./sections";
import { Proof } from "./sources";

export function StudentPageB2c({ p }: { p: Profile }) {
  const v = useMemo(() => profileView(p), [p]);
  const heroRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState("");
  return (
    <div className="student-page pv">
      {/* Linked here, not by the route: studojo.com never renders this component, so it never links this file. */}
      <link rel="stylesheet" href={profileCss} precedence="default" />
      <SiteHeader />
      <ProfileBar v={v} heroRef={heroRef} onStatus={setStatus} />
      <main id="main" tabIndex={-1} className="pv-main">
        <Hero v={v} ref={heroRef} onStatus={setStatus} />
        {v.highlights.length > 0 && <Highlights items={v.highlights} stacked={v.figCol.stack !== "none"} poss={v.poss} />}
        {v.about && <About about={v.about} poss={v.poss} />}
        {v.stints.map((s) => (
          <StintSection key={s.kind} section={s} poss={v.poss} />
        ))}
        {v.awards && <Awards awards={v.awards} poss={v.poss} />}
        {v.skills.length > 0 && <Skills groups={v.skills} first={v.first} poss={v.poss} />}
        {v.sources && v.proof && <Proof sources={v.sources} proof={v.proof} first={v.first} poss={v.poss} updated={v.updated} />}
      </main>
      <SiteFooter compact />
      <p aria-live="polite" className="pv-sr">
        {status}
      </p>
    </div>
  );
}

/** Under the site header once the hero has gone up behind it: the name, Email and Copy link. Hidden (and out of the
 * tab order) until then, so nothing is on screen twice. */
function ProfileBar({ v, heroRef, onStatus }: { v: ProfileView; heroRef: RefObject<HTMLElement | null>; onStatus: (s: string) => void }) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const hdr = Math.round(document.querySelector(".sv-hdr")?.getBoundingClientRect().height ?? 0) || 60;
    const io = new IntersectionObserver(([en]) => setCompact(!en.isIntersecting && en.boundingClientRect.top < hdr), { rootMargin: `-${hdr}px 0px 0px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [heroRef]);
  return (
    <div className="pv-bar" data-compact={compact} aria-hidden={!compact} inert={!compact}>
      <div className="pv-bar-in">
        <span className="pv-bar-name">{v.name}</span>
        <span className="pv-bar-acts">
          {v.email && <EmailButton email={v.email} first={v.first} />}
          <CopyLinkButton url={v.shareUrl} onStatus={onStatus} small />
        </span>
      </div>
    </div>
  );
}
