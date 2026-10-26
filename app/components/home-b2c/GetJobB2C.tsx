// 5. How you actually get the job (#getjob): why boards fail, what works, how Stu does it.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function GetJobB2C() {
  return (
    <section className="sjb-sec" id="getjob" aria-labelledby="getjob-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">getting hired</span>
          <h2 className="sjb-h-sec" id="getjob-h">how you actually get the job.</h2>
        </header>
        <div className="st-why">
          <div className="sjb-card st-old">
            <span className="st-mono">why job boards don&apos;t work</span>
            <ul>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>Popular postings get hundreds of applicants.</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>Forms and filters screen you out before a person reads a word.</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>A generic application just disappears.</li>
            </ul>
          </div>
          <span className="st-then" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
          <div className="sjb-card st-new">
            <span className="st-mono">what works</span>
            <p>Reaching the person who is hiring, with a short note that shows you fit.</p>
          </div>
        </div>
        <div className="st-split st-wide st-swap st-how">
          <div className="st-copy">
            <h3 className="st-h3">how stu does it</h3>
            <ol className="st-seq">
              <li><b>finds the roles that fit you</b><span>Each with a reason.</span></li>
              <li><b>finds the right person</b><span>At the company: the hiring manager or a recruiter.</span></li>
              <li><b>writes a personal email in your voice</b><span>From your resume and the job. It goes from your own email address.</span></li>
              <li className="st-key"><b>nothing goes until you say so</b><span>Press send on an email, or start a sequence once you have checked it.</span></li>
              <li><b>follows up for you</b><span>A first email and two follow ups, a few a day.</span></li>
              <li><b>suggests your replies</b><span>When someone replies, Stu suggests an answer. You decide whether it goes.</span></li>
              <li><b>tracks everything</b><span>Every company you reached out to and every application, in one place.</span></li>
              <li><b>gets you ready for the interview</b><span>When you get one, practise with a mock interview for that job.</span></li>
            </ol>
          </div>
          <div className="st-media">
            <div className="st-stage">
              <div className="st-phone st-only-phone"><div className="st-screen">
                <img src="/home/emails-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="Emails in the Studojo app: a personal email to the person who is hiring, with follow ups" />
                <div className="st-ph" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg><div className="st-ghost"><i /><i /><i /><i /><b></b></div><span className="st-mono">emails screen coming</span></div>
              </div></div>
              <div className="sjb-win st-mac st-only-desk"><div className="sjb-bar"><i /><i /><i /><span>your emails</span></div><div className="st-wscreen">
                <img src="/home/emails-1440.jpg" width="1440" height="900" loading="lazy" decoding="async" alt="Emails in the Studojo app on a laptop: drafts, follow ups and replies" />
                <div className="st-ph" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg><div className="st-ghost"><i /><i /><i /><i /><b></b></div><span className="st-mono">emails screen coming</span></div>
              </div></div>
            </div>
            <span className="sjb-capt">an example, a made-up student</span>
          </div>
        </div>
      </div>
    </section>
  );
}
