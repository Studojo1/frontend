import { Link } from "react-router";
import { StartLink } from "./start";
import { StuArt } from "./StuArt";

// The homepage's own footer: the one closing start (HOMEPAGE V3; 28 Oct 2026, no call length: "Ready to find your next
// job?"), with Stu's head and the same start (StartLink: signed out it opens the call takeover, signed in it is "Open
// my jobs" to /b2cnew), then the logo, one line, the links and the company's legal name. The floating agent watches #hv-foot-btn
// and steps aside when it comes into view. Motion: the closing start floats in, Stu bounces, the button pulses twice.
export function HomeFooter() {
  return (
    <footer className="hv-foot hv3-foot">
      <div className="hv-foot-cta hv3-foot-cta" data-reveal>
        <StuArt />
        <h2 className="hv3-h2">Ready to find your next job?</h2>
        <p className="hv3-lead">Tell Stu what you want. Stu takes it from there.</p>
        <StartLink place="footer" className="hv-btn-start" id="hv-foot-btn" />
      </div>
      <div className="hv-foot-row">
        <Link className="hv-brand" to="/" aria-label="studojo home">
          <img src="/stu/logo-doodle.png" width={24} height={30} alt="" />
          <b>studojo</b>
        </Link>
        <span className="hv-line">Stu, your career agent at Studojo.</span>
        <nav className="hv-foot-links" aria-label="footer">
          <a href="#how">How it works</a>
          <Link to="/blog">Blog</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      <p className="hv-legal">
        Studojo Labs Private Limited <span aria-hidden="true">·</span> <Link to="/refund-policy">Refund policy</Link>
      </p>
    </footer>
  );
}
