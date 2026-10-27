

// 7. So far (#proof): the dated counts and the company strip exactly as published on studojo.com/outreach. No quotes or testimonials of any kind.
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function Proof() {
  return (
    <section className="hv-sec" id="proof" aria-labelledby="proof-h">
      <div className="hv-sec-in">
        <header className="hv-sec-head">
          <span className="hv-kicker">so far</span>
          <h2 className="hv-h-sec" id="proof-h">students have already reached hiring managers with studojo.</h2>
          <p className="hv-lead">These numbers come from Studojo&apos;s earlier outreach product. Stu now does that work for you.</p>
        </header>
        <div className="hv-st-counts" data-proof="outreach-counts">
          <div className="hv-st-nums">
            <div className="hv-card hv-st-num"><b>8,500+</b><span>students signed up</span></div>
            <div className="hv-card hv-st-num"><b>4,000+</b><span>matched with hiring managers</span></div>
            <div className="hv-card hv-st-num"><b>28,000+</b><span>personal emails sent from students&apos; own inboxes</span></div>
          </div>
          <p className="hv-st-foot">From Studojo&apos;s own records, as of September 2026. Replies are not guaranteed.</p>
        </div>
        <div className="hv-st-strip" data-proof="company-strip">
          <p className="hv-st-mono">Students have emailed hiring managers at</p>
          <ul>
            <li>Google</li><li>McKinsey</li><li>BCG</li><li>Amazon</li><li>Razorpay</li><li>Deloitte</li><li>Microsoft</li><li>CRED</li><li>Bain &amp; Co.</li><li>Revolut</li><li>Zepto</li><li>Spotify</li><li>Groww</li><li>PwC</li><li>Swiggy</li><li>Airbnb</li><li>Morgan Stanley</li><li>Freshworks</li><li>EY</li><li>Zomato</li><li>InMobi</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
