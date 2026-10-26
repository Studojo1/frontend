import { Link, useLocation } from "react-router";
import "./b2c.css";
import { StartButton, StuOrb, TypeLink, useSignedIn } from "./cta";
import { BLOG, CONTACT_EMAIL, PRIVACY, REFUNDS, REPORTS, SECTION_HOW, TERMS } from "./links";
import { Logo } from "./Logo";

// The footer on B2C hosts (studojo.pro): used by the B2C homepage and, through components/common/footer.tsx,
// by every other page there. It ends the page with the same button, then the links: with no nav links in the
// header (owner, 27 Oct) this is where blog and reports are always reachable. No old products.

export function FooterB2C() {
  const { pathname } = useLocation();
  const signedIn = useSignedIn();
  const onHome = pathname === "/";
  return (
    <footer className="sjb sjb-foot">
      <div className="sjb-foot-cta">
        <StuOrb />
        <h2 className="sjb-h-sec">{signedIn ? "your jobs are waiting." : "ready when you are."}</h2>
        <p className="sjb-lead">{signedIn ? "stu keeps looking, every day." : "one short call. then stu gets to work."}</p>
        <StartButton size="xl" place="footer" />
        <TypeLink />
      </div>
      <div className="sjb-foot-row">
        <Logo />
        <span className="sjb-line">{"stu is studojo's ai job agent."}</span>
        <nav className="sjb-foot-links" aria-label="footer">
          {/* On the homepage the section is in the page; anywhere else it is on the homepage. */}
          {onHome ? <a href={`#${SECTION_HOW}`}>how it works</a> : <Link to={`/#${SECTION_HOW}`}>how it works</Link>}
          <Link to={BLOG}>blog</Link>
          <Link to={REPORTS}>reports</Link>
          <Link to={TERMS}>terms</Link>
          <Link to={PRIVACY}>privacy</Link>
          <Link to={REFUNDS}>refunds</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>contact</a>
        </nav>
      </div>
      <p className="sjb-legal">Studojo Labs Private Limited</p>
    </footer>
  );
}
