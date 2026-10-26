import { Link } from "react-router";

// 10. Read before you call (#read): three reports and the blog (real routes in this app).
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function BlogReports() {
  return (
    <section className="sjb-sec" id="read" aria-labelledby="read-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">blogs and reports</span>
          <h2 className="sjb-h-sec" id="read-h">read before you call.</h2>
          <p className="sjb-lead">Plain answers on getting hired, from the Studojo team.</p>
        </header>
        <div className="st-reads">
          <Link className="sjb-card st-rep" to="/reports/first-job-india-2026">
            <span className="st-mono">report</span>
            <h3 className="sjb-h-card">First Job Report India 2026: What Entry-Level Actually Looks Like</h3>
            <span className="st-go">read the report <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
          </Link>
          <Link className="sjb-card st-rep" to="/reports/cold-outreach-what-gets-reply-2026">
            <span className="st-mono">report</span>
            <h3 className="sjb-h-card">Cold Outreach: What Actually Gets a Reply</h3>
            <span className="st-go">read the report <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
          </Link>
          <Link className="sjb-card st-rep" to="/reports/ghost-jobs-2026">
            <span className="st-mono">report</span>
            <h3 className="sjb-h-card">Why Companies Post Jobs Without Planning to Hire</h3>
            <span className="st-go">read the report <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
          </Link>
          <Link className="sjb-card st-rep st-blog" to="/blog">
            <span className="st-mono">blog</span>
            <h3 className="sjb-h-card">the studojo blog</h3>
            <p className="sjb-body">Short reads on internships, applying and choosing an offer.</p>
            <span className="st-go">all posts <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
