import { Link } from "react-router";
import { StartLink } from "./start";
import { StuArt } from "./StuArt";

// The homepage's own footer (h1.html, as the prototype hp/v2.html has it): the one closing call to action, "ready
// when you are." with Stu's head and the same start (StartLink: signed out it opens the live agent in place, signed
// in it is "open my jobs" to /b2cnew), then the logo, one line, the links and the company's legal name. The
// floating agent watches #hv-foot-btn and steps aside when it comes into view.
export function HomeFooter() {
  return (
    <footer className="hv-foot">
      <div className="hv-foot-cta">
        <StuArt />
        <h2 className="hv-h-sec">ready when you are.</h2>
        <p className="hv-lead">one short call. then stu gets to work.</p>
        <StartLink place="footer" className="hv-btn-start" id="hv-foot-btn" />
      </div>
      <div className="hv-foot-row">
        <Link className="hv-brand" to="/" aria-label="studojo home">
          <img src="/stu/logo-doodle.png" width={24} height={30} alt="" />
          <b>studojo</b>
        </Link>
        <span className="hv-line">Stu, your career agent at Studojo.</span>
        <nav className="hv-foot-links" aria-label="footer">
          <a href="#what">how it works</a>
          <Link to="/blog">blog</Link>
          <Link to="/reports">reports</Link>
          <Link to="/terms">terms</Link>
          <Link to="/privacy">privacy</Link>
          <Link to="/contact">contact</Link>
        </nav>
      </div>
      <p className="hv-legal">
        Studojo Labs Private Limited <span aria-hidden="true">·</span> <Link to="/refund-policy">refund policy</Link>
      </p>
    </footer>
  );
}
