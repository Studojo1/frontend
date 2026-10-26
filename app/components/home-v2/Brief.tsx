import { Chat, Pin, Star } from "./icons";

// 3. Your brief (#brief): what Stu writes after the call; the phone shot on phones, the laptop shot on desktop.
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function Brief() {
  return (
    <section className="hv-sec" id="brief" aria-labelledby="brief-h">
      <div className="hv-sec-in">
        <div className="hv-st-split hv-st-flip hv-st-wide hv-st-swap">
          <div className="hv-st-copy">
            <span className="hv-kicker">your brief</span>
            <h2 className="hv-h-sec" id="brief-h">what you want, in your words.</h2>
            <p className="hv-lead">After the call, Stu writes your brief. It drives your matches, and you can change any of it.</p>
            <ul className="hv-st-pts">
              <li><span className="hv-st-ico"><Chat /></span>The roles you want, in your words, then how Stu read them.</li>
              <li><span className="hv-st-ico"><Pin /></span>Where, how and how much: city, office or home, pay.</li>
              <li><span className="hv-st-ico"><Star /></span>What you can show, from your call and your resume.</li>
            </ul>
          </div>
          <div className="hv-st-media">
            <div className="hv-st-stage">
              <div className="hv-st-phone hv-st-only-phone"><div className="hv-st-screen">
                <img src="/home/v2/brief-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="A brief in the Studojo app: the role, the cities and the start date, in the student's words" />
              </div></div>
              <div className="hv-win hv-st-mac hv-st-only-desk"><div className="hv-bar"><i></i><i></i><i></i><span>your brief</span></div><div className="hv-st-wscreen">
                <img src="/home/v2/brief-1440.jpg" width="1440" height="900" loading="lazy" decoding="async" alt="A brief in the Studojo app on a laptop: the roles you want, and where, how and how much" />
              </div></div>
            </div>
            <span className="hv-capt">an example, a made-up student</span>
          </div>
        </div>
      </div>
    </section>
  );
}
