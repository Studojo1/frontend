import { Link } from "react-router";
import { BLOG, CONTACT, HOW_IT_WORKS, PRIVACY, REFUNDS, REPORTS, TERMS } from "./site-links";
import { Brand, StartPill, StuHead, useSignedInSite } from "./ui";

// SITE-V2 footer (h1.html): on every studojo.pro page but the homepage (components/common/footer.tsx picks it on B2C
// hosts). Stu's head, one closing line, the one button, then the wordmark, the line about Stu and the links.
// `compact` (the sign-in and password pages): only the bottom row, no closing button.

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
        <span className="sv-foot-line">stu is studojo's ai job agent.</span>
        <nav className="sv-foot-links" aria-label="footer">
          <a href={HOW_IT_WORKS}>how it works</a>
          <Link to={BLOG}>blog</Link>
          <Link to={REPORTS}>reports</Link>
          <Link to={TERMS}>terms</Link>
          <Link to={PRIVACY}>privacy</Link>
          <Link to={CONTACT}>contact</Link>
        </nav>
      </div>
      <p className="sv-legal">
        Studojo Labs Private Limited <span aria-hidden="true">·</span> <Link to={REFUNDS}>refund policy</Link>
      </p>
    </footer>
  );
}
