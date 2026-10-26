import { Link } from "react-router";
import "./b2c.css";
import { StartButton, useSignedIn } from "./cta";
import { BLOG, CONTACT_EMAIL, PRIVACY, REFUNDS, REPORTS, TERMS } from "./links";
import { Logo } from "./Logo";

// The footer on B2C hosts (studojo.pro), nb.html: a stone band with one closing line, one button, then the links.
// Used by the B2C homepage and, through components/common/footer.tsx, by every other page there. No old products.

export function FooterB2C() {
  const signedIn = useSignedIn();
  return (
    <footer className="sjb sjb-foot">
      <div className="sjb-foot-cta">
        <h2 className="nb-h2">
          {signedIn ? (
            <>
              <span className="nb-s">Your jobs are waiting.</span> <span className="nb-s">Stu keeps looking, every day.</span>
            </>
          ) : (
            <>
              <span className="nb-s">About ten minutes with Stu.</span> <span className="nb-s">Jobs that fit, every day.</span>
            </>
          )}
        </h2>
        <StartButton place="footer" />
        {signedIn ? null : <p className="nb-micro">free · about 10 minutes</p>}
      </div>
      <div className="sjb-foot-row">
        <Logo />
        <nav className="sjb-foot-links" aria-label="footer">
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
