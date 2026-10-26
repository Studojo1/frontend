// 7. What students say (#proof). PLACEHOLDERS: no real, publishable testimonials yet (story-proof.md, 27 Oct).
// Replace a card only with a real quote, the student's written permission and the attribution exactly as given.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function ProofB2C() {
  return (
    <section className="sjb-sec" id="proof" aria-labelledby="proof-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">so far</span>
          <h2 className="sjb-h-sec" id="proof-h">students have already reached hiring managers with studojo.</h2>
          <p className="sjb-lead">These numbers come from Studojo&apos;s outreach, which now lives inside Stu.</p>
        </header>
        <div className="st-counts" data-proof="outreach-counts">
          <div className="st-nums">
            <div className="sjb-card st-num"><b>8,500+</b><span>students signed up</span></div>
            <div className="sjb-card st-num"><b>4,000+</b><span>matched with hiring managers</span></div>
            <div className="sjb-card st-num"><b>28,000+</b><span>personal emails sent from students&apos; own Gmail</span></div>
          </div>
          <p className="st-foot">From Studojo&apos;s own records, September 2026. Replies are not guaranteed.</p>
        </div>
        <div className="st-strip" data-proof="company-strip">
          <p className="st-mono">Students have emailed hiring managers at</p>
          <ul>
            <li>Google</li><li>McKinsey</li><li>BCG</li><li>Amazon</li><li>Razorpay</li><li>Deloitte</li><li>Microsoft</li><li>CRED</li><li>Bain &amp; Co.</li><li>Revolut</li><li>Zepto</li><li>Spotify</li><li>Groww</li><li>PwC</li><li>Swiggy</li><li>Airbnb</li><li>Morgan Stanley</li><li>Freshworks</li><li>EY</li><li>Zomato</li><li>InMobi</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
