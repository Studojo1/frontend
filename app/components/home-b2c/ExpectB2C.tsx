// 8. What to expect (#expect): the first 10 to 15 minutes, credits and data in plain words.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function ExpectB2C() {
  return (
    <section className="sjb-sec" id="expect" aria-labelledby="expect-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">what to expect</span>
          <h2 className="sjb-h-sec" id="expect-h">your first 10 to 15 minutes.</h2>
          <p className="sjb-lead">Here is the whole thing, start to finish.</p>
        </header>
        <div className="st-exp">
          <ol className="sjb-card st-steps">
            <li><div><h3 className="sjb-h-card">join</h3><p className="sjb-body">Tap start and meet Stu.</p></div></li>
            <li><div><h3 className="sjb-h-card">sign up <span className="sjb-chip">ten seconds</span></h3><p className="sjb-body">A quick sign up. Free to start.</p></div></li>
            <li className="st-key"><div><h3 className="sjb-h-card">the call <span className="sjb-chip">about 10 minutes</span></h3><p className="sjb-body">Talk with Stu. Drop in your resume when Stu asks.</p></div></li>
            <li><div><h3 className="sjb-h-card">your brief</h3><p className="sjb-body">Check what Stu wrote down, add links or anything Stu missed, and fix what is off.</p></div></li>
            <li><div><h3 className="sjb-h-card">your first matches</h3><p className="sjb-body">Jobs that fit, each with a reason.</p></div></li>
          </ol>
          <div className="st-side">
            <div className="sjb-card st-end">
              <span className="st-mono">at the end you have</span>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>a brief in your words</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>a list of matches</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>Stu looking for more</li>
              </ul>
            </div>
            <div className="sjb-card st-plain">
              <span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg></span>
              <div><h3 className="sjb-h-card">free to start</h3><p className="sjb-body">Finding and matching jobs costs nothing. Some extras, like finding the right person at a company so Stu can email them, use credits. Your credit balance sits on the Outreach tab, and credits for emails that cannot go come back to you.</p></div>
            </div>
            <div className="sjb-card st-plain">
              <span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg></span>
              <div><h3 className="sjb-h-card">your data, in plain words</h3><p className="sjb-body">Only you and Studojo see your resume. Nothing goes out to an employer until you press send. Studojo never sells your data, and you can download a copy or delete your account any time from Settings.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
