import { Link } from "react-router";
import { Arrow } from "./icons";

// 10. Read before you call (#read): three reports and the blog.
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function Read() {
  return (
    <section className="hv-sec" id="read" aria-labelledby="read-h">
      <div className="hv-sec-in">
        <header className="hv-sec-head">
          <span className="hv-kicker">blogs and reports</span>
          <h2 className="hv-h-sec" id="read-h">read before you call.</h2>
          <p className="hv-lead">Plain answers on getting hired, from the Studojo team.</p>
        </header>
        <div className="hv-st-reads">
          <Link className="hv-card hv-st-rep" to="/reports/first-job-india-2026">
            <span className="hv-st-mono">report</span>
            <h3 className="hv-h-card">First Job Report India 2026: What Entry-Level Actually Looks Like</h3>
            <span className="hv-st-go">read the report <Arrow /></span>
          </Link>
          <Link className="hv-card hv-st-rep" to="/reports/cold-outreach-what-gets-reply-2026">
            <span className="hv-st-mono">report</span>
            <h3 className="hv-h-card">Cold Outreach: What Actually Gets a Reply</h3>
            <span className="hv-st-go">read the report <Arrow /></span>
          </Link>
          <Link className="hv-card hv-st-rep" to="/reports/ghost-jobs-2026">
            <span className="hv-st-mono">report</span>
            <h3 className="hv-h-card">Why Companies Post Jobs Without Planning to Hire</h3>
            <span className="hv-st-go">read the report <Arrow /></span>
          </Link>
          <Link className="hv-card hv-st-rep hv-st-blog" to="/blog">
            <span className="hv-st-mono">blog</span>
            <h3 className="hv-h-card">the studojo blog</h3>
            <p className="hv-body">Short reads on internships, applying and choosing an offer.</p>
            <span className="hv-st-go">all posts <Arrow /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
