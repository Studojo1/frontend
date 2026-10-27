import { Building, DocLines, Globe } from "./icons";

// 4. Your matches (#matches): jobs with a reason each; sources named as employers' own career sites and job boards.
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function Matches() {
  return (
    <section className="hv-sec" id="matches" aria-labelledby="matches-h">
      <div className="hv-sec-in">
        <div className="hv-st-split hv-st-wide hv-st-swap">
          <div className="hv-st-copy">
            <span className="hv-kicker">your matches</span>
            <h2 className="hv-h-sec" id="matches-h">jobs that fit, each with a reason.</h2>
            <p className="hv-lead">Stu looks for new roles every day and puts the best fits first, each with a reason.</p>
            <ul className="hv-st-pts">
              <li><span className="hv-st-ico"><Building /></span>From employers&apos; own career sites and job boards.</li>
              <li><span className="hv-st-ico"><DocLines /></span>The job description read where the posting has one, not just the title.</li>
              <li><span className="hv-st-ico"><Globe /></span>India, plus the US, the UK, the UAE and Singapore.</li>
            </ul>
          </div>
          <div className="hv-st-media">
            <div className="hv-st-stage">
              <div className="hv-st-phone hv-st-only-phone"><div className="hv-st-screen">
                <img src="/home/v2/jobs-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="Matches in the Studojo app: each job with a fit score and a line on why it fits" />
              </div></div>
              <div className="hv-win hv-st-mac hv-st-only-desk"><div className="hv-bar"><i></i><i></i><i></i><span>your matches</span></div><div className="hv-st-wscreen">
                <img src="/home/v2/jobs-1440.jpg" width="1440" height="900" loading="lazy" decoding="async" alt="Matches in the Studojo app on a laptop: the brief on the left, jobs with reasons on the right" />
              </div></div>
            </div>
            <span className="hv-capt">an example, a made-up student</span>
          </div>
        </div>
      </div>
    </section>
  );
}
