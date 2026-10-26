// 4. Proof (#proof): dated counts from Studojo's own records and employer names, exactly as published.
// Ported from the design mock nb-sections.html (copy: nb-copy.md); the look is in b2c.css (nb-, nbs-).
export function ProofB2C() {
  return (
    <section className="nb-sec nb-fill" id="proof">
      <div className="nb-in">
        <div className="nb-head">
          <h2 className="nb-h2">Students have already reached hiring managers.</h2>
          <p className="nbs-intro">These numbers come from Studojo&apos;s earlier outreach product. Stu now does that work for you.</p>
        </div>
        <div className="nbs-counts">
          <div className="nb-card nbs-count"><b>8,500+</b><span>students signed up</span></div>
          <div className="nb-card nbs-count"><b>4,000+</b><span>matched with hiring managers</span></div>
          <div className="nb-card nbs-count"><b>28,000+</b><span>personal emails sent from students&apos; own inboxes</span></div>
        </div>
        <p className="nbs-foot">From Studojo&apos;s own records, as of September 2026. Replies are not guaranteed.</p>
        <div className="nbs-strip">
          <span className="nb-kicker">Students have emailed hiring managers at</span>
          <ul>
            <li className="nb-chip">Google</li><li className="nb-chip">McKinsey</li><li className="nb-chip">BCG</li><li className="nb-chip">Amazon</li><li className="nb-chip">Razorpay</li><li className="nb-chip">Deloitte</li><li className="nb-chip">Microsoft</li><li className="nb-chip">CRED</li><li className="nb-chip">Bain &amp; Co.</li><li className="nb-chip">Revolut</li><li className="nb-chip">Zepto</li><li className="nb-chip">Spotify</li><li className="nb-chip">Groww</li><li className="nb-chip">PwC</li><li className="nb-chip">Swiggy</li><li className="nb-chip">Airbnb</li><li className="nb-chip">Morgan Stanley</li><li className="nb-chip">Freshworks</li><li className="nb-chip">EY</li><li className="nb-chip">Zomato</li><li className="nb-chip">InMobi</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
