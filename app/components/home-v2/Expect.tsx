import { Check, Tag } from "./icons";

// 8. What to expect (#expect): sign up, the call (resume inside the call), the brief and first matches; free to start and what a credit is.
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function Expect() {
  return (
    <section className="hv-sec" id="expect" aria-labelledby="expect-h">
      <div className="hv-sec-in">
        <header className="hv-sec-head">
          <span className="hv-kicker">what to expect</span>
          <h2 className="hv-h-sec" id="expect-h">your first 10 to 15 minutes.</h2>
        </header>
        <div className="hv-st-exp">
          <ol className="hv-card hv-st-steps">
            <li><div><h3 className="hv-h-card">sign up <span className="hv-chip">ten seconds</span></h3><p className="hv-body">Tap start the call and Stu says hi. Sign up with Google or email, then the call starts.</p></div></li>
            <li className="hv-st-key"><div><h3 className="hv-h-card">the call <span className="hv-chip">about 10 minutes</span></h3><p className="hv-body">Talk with Stu. Add your resume when Stu asks, and Stu reads it while you talk.</p></div></li>
            <li><div><h3 className="hv-h-card">your brief and first matches</h3><p className="hv-body">Check your brief, add links or anything Stu missed, then see jobs that fit.</p></div></li>
          </ol>
          <div className="hv-st-side">
            <div className="hv-card hv-st-end">
              <span className="hv-st-mono">at the end you have</span>
              <ul>
                <li><Check sw={2.4} />a brief in your words</li>
                <li><Check sw={2.4} />a list of matches</li>
                <li><Check sw={2.4} />Stu looking for more</li>
              </ul>
            </div>
            <div className="hv-card hv-st-plain">
              <span className="hv-st-ico"><Tag /></span>
              <div><h3 className="hv-h-card">free to start</h3><p className="hv-body">Finding and matching jobs costs nothing. Some extras, like finding the right person at a company so Stu can email them, use credits. One credit is one verified email of the right person. No email found, no credit used.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
