import { StuArt } from "./cta";

// 2. The call (#call): an example of how Stu talks, and the call screen.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function CallB2C() {
  return (
    <section className="sjb-sec" id="call" aria-labelledby="call-h">
      <div className="sjb-sec-in">
        <div className="st-split st-call">
          <div className="st-copy">
            <span className="sjb-kicker">the call</span>
            <h2 className="sjb-h-sec" id="call-h">about 10 minutes, out loud.</h2>
            <p className="sjb-lead">Turn your sound on. Stu talks, you answer, like a call with a friend who asks good questions. Your screen shows the plan, so you always know what is left.</p>
            <div className="st-chips" aria-label="on the call">
              <span className="sjb-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>turn your sound on</span>
              <span className="sjb-chip st-chip-q"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 2l20 20" /><path d="M9 9v2a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.7-1.3" /><path d="M17 16.9A7 7 0 0 1 5 11M19 11a7 7 0 0 1-.1 1.2M12 18v3" /></svg>mute any time</span>
              <span className="sjb-chip st-chip-q"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></svg>or type</span>
            </div>
            <div className="sjb-card st-talk">
              <div className="st-talk-h">
                <StuArt />
                <div><b>Stu</b><small>on the call</small></div>
                <span className="st-live" aria-hidden="true"><i /><i /><i /><i /><i /></span>
              </div>
              <div className="st-msgs">
                <p className="st-msg"><span className="st-who">stu</span>Alright, let&apos;s start with your resume. Drop it in the box on your screen.</p>
                <p className="st-msg"><span className="st-who">stu</span>Got it, give me a few seconds.</p>
                <p className="st-msg"><span className="st-who">stu</span>A college fest you ran yourself, nice. Our plan&apos;s on your screen, quick basics first. Which city would you like to work in?</p>
                <p className="st-msg st-me"><span className="st-who">you</span>Bangalore. But I&apos;d move for the right team.</p>
                <p className="st-msg"><span className="st-who">stu</span>Bangalore, nice. Are you looking for an internship, or a full-time job?</p>
              </div>
              <span className="sjb-capt">an example of how Stu talks</span>
            </div>
            <ul className="st-pts">
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg></span>Drop in your resume when Stu asks, and Stu reads it while you talk.</li>
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3 6 1 1 2-2M3 12l1 1 2-2" /><circle cx="4.5" cy="18" r="1" /></svg></span>The plan stays on screen: your resume, the basics, what you want next, the kind of company, your best work, pay, why now.</li>
              <li><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" /></svg></span>Have your resume as a PDF, and find a quiet spot. Headphones help.</li>
            </ul>
          </div>
          <div className="st-media">
            <div className="st-stage">
              <div className="st-phone"><div className="st-screen">
                <img src="/home/call-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="The call screen in the Studojo app: Stu talking, with the plan on screen" />
                <div className="st-ph" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg><div className="st-ghost"><i /><i /><i /><i /><b></b></div><span className="st-mono">call screen coming</span></div>
              </div></div>
            </div>
            <span className="sjb-capt">an example, a made-up student</span>
          </div>
        </div>
      </div>
    </section>
  );
}
