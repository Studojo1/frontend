import type { CSSProperties } from "react";

// HOMEPAGE V3: proof (#proof). 28 Oct 2026, the owner: not sign-ups ("why will I join just because 8,500 others signed
// up? pretty mid") and no footnotes under the numbers; "we have data across these many jobs, these many job boards,
// and hiring manager information from these many companies". The three counts were read from our own databases on
// 27 Oct 2026 (read-only, test and staff accounts left out; the queries are kept in
// ~/Documents/Internreach-ai/homepage_v3/round2/metrics_queries), each rounded down:
// - 1,856,712 distinct job postings across Stu's job index, Sensei and Mesa, one posting per job id or cleaned link;
// - 7,748 job boards and company career sites read in the 24 hours before (Stu re-reads each at least every 12 hours);
// - 8,384 companies (by email domain) where we hold a named founder, manager, head, director, VP, recruiter or HR
//   contact with a found work email (Outreach Dojo and Sensei, production).
// Stu's job index and its readers run on staging (studojo.pro), where this page runs; if this page reaches studojo.com
// before Stu does, the first two must be read again from production.
// Motion: the three counts float in and count up from 0 (the page's own text is what the server renders); the
// companies run past in two rows going opposite ways, and stop under the pointer (a still, wrapped list with reduced
// motion; the second copy of each row is hidden from assistive tech). The company strip is as published on
// studojo.com/outreach. No quotes or testimonials of any kind.

const COMPANIES = ["Google", "McKinsey", "BCG", "Amazon", "Razorpay", "Deloitte", "Microsoft", "CRED", "Bain & Co.", "Revolut", "Zepto", "Spotify", "Groww", "PwC", "Swiggy", "Airbnb", "Morgan Stanley", "Freshworks", "EY", "Zomato", "InMobi"];
const ROWS = [COMPANIES.slice(0, 11), COMPANIES.slice(11)];
const d = (ms: number) => ({ "--hv3-d": `${ms}ms` }) as CSSProperties;

export function Proof() {
  return (
    <section className="hv-sec hv3-sec" id="proof" aria-labelledby="proof-h">
      <div className="hv3-in">
        <header className="hv3-head" data-reveal>
          <h2 className="hv3-h2" id="proof-h">We know where the jobs are, and who&apos;s hiring</h2>
        </header>
        <div className="hv3-stats">
          <div className="hv-card hv3-stat" data-reveal data-count style={d(0)}><b>1,800,000+</b><span>job postings in our data</span></div>
          <div className="hv-card hv3-stat" data-reveal data-count style={d(120)}><b>7,700+</b><span>job boards and company career sites checked every day</span></div>
          <div className="hv-card hv3-stat" data-reveal data-count style={d(240)}><b>8,300+</b><span>companies where we&apos;ve found hiring managers</span></div>
        </div>
        <div className="hv3-logos" data-reveal>
          <p className="hv3-logos-label">People using Studojo have reached out to hiring managers at</p>
          {ROWS.map((row, i) => (
            <div className={`hv3-row${i ? " hv3-row-rev" : ""}`} key={i}>
              <ul>
                {row.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <ul aria-hidden="true">
                {row.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
