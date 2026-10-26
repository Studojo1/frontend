import { Arrow, Cross } from "./icons";

// 5. Getting hired (#getjob): why job boards don't work, what works, then how Stu does it (simplified, the same five steps).
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function GetJob() {
  return (
    <section className="hv-sec" id="getjob" aria-labelledby="getjob-h">
      <div className="hv-sec-in">
        <header className="hv-sec-head">
          <span className="hv-kicker">getting hired</span>
          <h2 className="hv-h-sec" id="getjob-h">how you actually get the job.</h2>
        </header>
        <div className="hv-st-why">
          <div className="hv-card hv-st-old">
            <span className="hv-st-mono">why job boards don&apos;t work</span>
            <ul>
              <li><Cross />Popular postings get hundreds of applicants.</li>
              <li><Cross />Filters screen you out before a person reads a word.</li>
              <li><Cross />A generic application just disappears.</li>
            </ul>
          </div>
          <span className="hv-st-then" aria-hidden="true"><Arrow /></span>
          <div className="hv-card hv-st-new">
            <span className="hv-st-mono">what works</span>
            <p>A short note to the person who is hiring, showing why you fit.</p>
          </div>
        </div>
        <div className="hv-st-split hv-st-wide hv-st-swap hv-st-how">
          <div className="hv-st-copy">
            <h3 className="hv-st-h3">how stu does it</h3>
            <ol className="hv-st-seq">
              <li><b>finds the right person</b><span>The hiring manager or a recruiter.</span></li>
              <li><b>writes the email in your voice</b><span>It goes from your own inbox.</span></li>
              <li className="hv-st-key"><b>nothing goes until you say so</b><span>Send one, or start a sequence that follows up.</span></li>
              <li><b>suggests replies, tracks it all</b><span>You pick what goes back.</span></li>
              <li><b>gets you ready for the interview</b><span>A mock interview for that job.</span></li>
            </ol>
          </div>
          <div className="hv-st-media">
            <div className="hv-st-stage">
              <div className="hv-st-phone hv-st-only-phone"><div className="hv-st-screen">
                <img src="/home/v2/emails-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="Emails in the Studojo app: a personal email to the person who is hiring, with follow ups" />
              </div></div>
              <div className="hv-win hv-st-mac hv-st-only-desk"><div className="hv-bar"><i></i><i></i><i></i><span>your emails</span></div><div className="hv-st-wscreen">
                <img src="/home/v2/emails-1440.jpg" width="1440" height="900" loading="lazy" decoding="async" alt="Emails in the Studojo app on a laptop: drafts, follow ups and replies" />
              </div></div>
            </div>
            <span className="hv-capt">an example, a made-up student</span>
          </div>
        </div>
      </div>
    </section>
  );
}
