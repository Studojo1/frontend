// 3. Your brief (#brief): what Stu writes down after the call.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function BriefB2C() {
  return (
    <section className="sjb-sec" id="brief" aria-labelledby="brief-h">
      <div className="sjb-sec-in">
        <div className="st-split st-flip st-wide st-swap">
          <div className="st-copy">
            <span className="sjb-kicker">your brief</span>
            <h2 className="sjb-h-sec" id="brief-h">what you want, in your words.</h2>
            <p className="sjb-lead">After the call, Stu writes your brief: the roles you want in your own words, then how Stu read them. Everything in it drives your matches, and you can change any of it.</p>
            <ul className="st-pts">
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg></span>The roles you want, why you want them, and work that is not for you.</li>
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg></span>Where, how and how much: city, office or home, pay.</li>
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></svg></span>What you can show, used in your cover letters and emails.</li>
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg></span>Tap anything to fix it, or just tell Stu.</li>
            </ul>
          </div>
          <div className="st-media">
            <div className="st-stage">
              <div className="st-phone st-only-phone"><div className="st-screen">
                <img src="/home/brief-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="A brief in the Studojo app: the role, the cities and the start date, in the student's words" />
                <div className="st-ph" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg><div className="st-ghost"><i /><i /><i /><i /><b></b></div><span className="st-mono">brief screen coming</span></div>
              </div></div>
              <div className="sjb-win st-mac st-only-desk"><div className="sjb-bar"><i /><i /><i /><span>your brief</span></div><div className="st-wscreen">
                <img src="/home/brief-1440.jpg" width="1440" height="900" loading="lazy" decoding="async" alt="A brief in the Studojo app on a laptop: the roles you want, and where, how and how much" />
                <div className="st-ph" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg><div className="st-ghost"><i /><i /><i /><i /><b></b></div><span className="st-mono">brief screen coming</span></div>
              </div></div>
            </div>
            <span className="sjb-capt">an example, a made-up student</span>
          </div>
        </div>
      </div>
    </section>
  );
}
