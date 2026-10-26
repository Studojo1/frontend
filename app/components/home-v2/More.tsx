import { ChatDots, Layers, LinkIcon, UserCheck } from "./icons";

// 6. And there's more (#more): what Stu remembers, mock interview, resume versions, your own page (simplified, the same four tiles).
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function More() {
  return (
    <section className="hv-sec" id="more" aria-labelledby="more-h">
      <div className="hv-sec-in">
        <header className="hv-sec-head">
          <span className="hv-kicker">and there&apos;s more</span>
          <h2 className="hv-h-sec" id="more-h">everything else stu helps with.</h2>
          <p className="hv-lead">From your call and your resume.</p>
        </header>
        <div className="hv-st-grid">
          <article className="hv-card hv-st-tile hv-st-shot">
            <span className="hv-st-ico"><UserCheck /></span>
            <h3 className="hv-h-card">what stu remembers</h3>
            <p className="hv-body">What Stu knows about you. Forget any of it.</p>
            <div className="hv-st-peek">
              <img src="/home/v2/knows-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="What Stu knows about you: each answer with where you said it, and a forget button" />
              <span className="hv-capt">an example, a made-up student</span>
            </div>
          </article>
          <article className="hv-card hv-st-tile">
            <span className="hv-st-ico"><ChatDots /></span>
            <h3 className="hv-h-card">a mock interview</h3>
            <p className="hv-body">Practise for a job you are applying to.</p>
          </article>
          <article className="hv-card hv-st-tile">
            <span className="hv-st-ico"><Layers /></span>
            <h3 className="hv-h-card">resume versions</h3>
            <p className="hv-body">One resume per job, tailored.</p>
          </article>
          <article className="hv-card hv-st-tile">
            <span className="hv-st-ico"><LinkIcon /></span>
            <h3 className="hv-h-card">your own page</h3>
            <p className="hv-body">A public page drafted from your resume. You choose who can see it.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
