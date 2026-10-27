import { Checklist, Headphones, Keyboard, MicOff, Speaker } from "./icons";
import { StuArt } from "./StuArt";

// 2. The call (#call): how the call goes, an example exchange (Stu's logo head in the card), and the call screen.
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function Call() {
  return (
    <section className="hv-sec" id="call" aria-labelledby="call-h">
      <div className="hv-sec-in">
        <div className="hv-st-split hv-st-call">
          <div className="hv-st-copy">
            <span className="hv-kicker">the call</span>
            <h2 className="hv-h-sec" id="call-h">about 10 minutes, out loud.</h2>
            <p className="hv-lead">Stu talks and you answer, like a call with a friend who asks good questions.</p>
            <div className="hv-st-chips" aria-label="on the call">
              <span className="hv-chip"><Speaker />turn your sound on</span>
              <span className="hv-chip hv-st-chip-q"><MicOff />mute any time</span>
              <span className="hv-chip hv-st-chip-q"><Keyboard />or type</span>
            </div>
            <div className="hv-card hv-st-talk">
              <div className="hv-st-talk-h">
                <span className="hv-stu-cell" aria-hidden="true"><StuArt small face="grin" /></span>
                <div><b>Stu</b><small>on the call</small></div>
                <span className="hv-st-live" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
              </div>
              <div className="hv-st-msgs">
                <p className="hv-st-msg"><span className="hv-st-who">stu</span>Alright, let&apos;s start with your resume. Drop it in the box on your screen.</p>
                <p className="hv-st-msg"><span className="hv-st-who">stu</span>Got it, give me a few seconds.</p>
                <p className="hv-st-msg"><span className="hv-st-who">stu</span>A college fest you ran yourself, nice. Our plan&apos;s on your screen, quick basics first. Which city would you like to work in?</p>
                <p className="hv-st-msg hv-me"><span className="hv-st-who">you</span>Bangalore. But I&apos;d move for the right team.</p>
                <p className="hv-st-msg"><span className="hv-st-who">stu</span>Bangalore, nice. Are you looking for an internship, or a full-time job?</p>
              </div>
              <span className="hv-capt">an example of how Stu talks</span>
            </div>
            <ul className="hv-st-pts">
              <li><span className="hv-st-ico"><Checklist /></span>The plan stays on screen: your resume, the basics, what you want next, the kind of company, your best work, pay, why now.</li>
              <li><span className="hv-st-ico"><Headphones /></span>Have your resume as a PDF and find a quiet spot. Headphones help.</li>
            </ul>
          </div>
          <div className="hv-st-media">
            <div className="hv-st-stage">
              <div className="hv-st-phone"><div className="hv-st-screen">
                <img src="/home/v2/call-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="The call screen in the Studojo app: Stu talking, with the plan on screen" />
              </div></div>
            </div>
            <span className="hv-capt">an example, a made-up student</span>
          </div>
        </div>
      </div>
    </section>
  );
}
