import { BLOG, CONTACT, EMAILER, HOW_IT_WORKS, PRIVACY, REFUNDS, REPORTS, TERMS } from "./site-links";
import { emailerLive } from "~/lib/emailer/live";
import { Brand, SiteLink, StartPill, StuHead, useSignedInSite } from "./ui";

// SITE-V2 footer (h1.html): on every studojo.pro page but the homepage (components/common/footer.tsx picks it on B2C
// hosts). Stu's head, one closing line, the one button, then the wordmark, the line about Stu and the links.
// `compact` (the sign-in and password pages): only the bottom row, no closing button.
// Every link is a SiteLink: on the product's own host (platform.studojo.com or .pro) it goes to the main site.

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const signedIn = useSignedInSite();
  return (
    <footer className={`sv-foot${compact ? " sv-foot-compact" : ""}`}>
      {compact ? null : (
        <div className="sv-foot-cta">
          <StuHead size={92} />
          <h2 className="sv-h2">{signedIn ? "your jobs are waiting." : "ready when you are."}</h2>
          <p className="sv-lead">{signedIn ? "stu keeps looking, every day." : "one short call. then stu gets to work."}</p>
          <StartPill place="footer" className="sv-foot-btn" />
        </div>
      )}
      <div className="sv-foot-row">
        <Brand />
        <span className="sv-foot-line">Stu, your career agent at Studojo.</span>
        <nav className="sv-foot-links" aria-label="footer">
          <SiteLink to={HOW_IT_WORKS}>how it works</SiteLink>
          <SiteLink to={BLOG}>blog</SiteLink>
          <SiteLink to={REPORTS}>reports</SiteLink>
          {emailerLive() ? <SiteLink to={EMAILER}>email writer</SiteLink> : null}
          <SiteLink to={TERMS}>terms</SiteLink>
          <SiteLink to={PRIVACY}>privacy</SiteLink>
          <SiteLink to={CONTACT}>contact</SiteLink>
        </nav>
      </div>
      <p className="sv-legal">
        Studojo Labs Private Limited <span aria-hidden="true">·</span> <SiteLink to={REFUNDS}>refund policy</SiteLink>
      </p>
    </footer>
  );
}
