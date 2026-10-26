// 4. Your matches (#matches): jobs that fit, each with a reason.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function MatchesB2C() {
  return (
    <section className="sjb-sec" id="matches" aria-labelledby="matches-h">
      <div className="sjb-sec-in">
        <div className="st-split st-wide st-swap">
          <div className="st-copy">
            <span className="sjb-kicker">your matches</span>
            <h2 className="sjb-h-sec" id="matches-h">jobs that fit, each with a reason.</h2>
            <p className="sjb-lead">Stu looks for new roles every day and puts the best fits first. Each one says why it fits, in your words.</p>
            <ul className="st-pts">
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" /></svg></span>From employers&apos; own career sites and job boards.</li>
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg></span>The job description read where the posting has one, not just the title.</li>
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg></span>India, plus the US, the UK, the UAE and Singapore.</li>
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M7 12h10M10 18h4" /></svg></span>Hide work you said no to, or ask Stu to widen the search.</li>
            </ul>
          </div>
          <div className="st-media">
            <div className="st-stage">
              <div className="st-phone st-only-phone"><div className="st-screen">
                <img src="/home/jobs-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="Matches in the Studojo app: each job with a fit score and a line on why it fits" />
                <div className="st-ph" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg><div className="st-ghost"><i /><i /><i /><i /><b></b></div><span className="st-mono">matches screen coming</span></div>
              </div></div>
              <div className="sjb-win st-mac st-only-desk"><div className="sjb-bar"><i /><i /><i /><span>your matches</span></div><div className="st-wscreen">
                <img src="/home/jobs-1440.jpg" width="1440" height="900" loading="lazy" decoding="async" alt="Matches in the Studojo app on a laptop: the brief on the left, jobs with reasons on the right" />
                <div className="st-ph" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg><div className="st-ghost"><i /><i /><i /><i /><b></b></div><span className="st-mono">matches screen coming</span></div>
              </div></div>
            </div>
            <span className="sjb-capt">an example, a made-up student</span>
          </div>
        </div>
      </div>
    </section>
  );
}
