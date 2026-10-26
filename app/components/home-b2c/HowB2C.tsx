// 2. How Stu helps you get the job (#how): three steps, one app screen each (a made-up student).
// Ported from the design mock nb-sections.html (copy: nb-copy.md); the look is in b2c.css (nb-, nbs-).
export function HowB2C() {
  return (
    <section className="nb-sec" id="how">
      <div className="nb-in">
        <div className="nb-head"><h2 className="nb-h2">How Stu helps you get the job.</h2></div>
        <ol className="nbs-steps" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          <li className="nbs-step">
            <div className="nbs-copy">
              <span className="nbs-num" aria-hidden="true">1</span>
              <h3 className="nb-h3">Talk to Stu</h3>
              <p className="nb-body">Stu says hi. Sign up with Google or email, then the call starts.</p>
              <p className="nb-body">About 10 minutes on what you want and why. Add your resume when Stu asks.</p>
            </div>
            <figure className="nbs-shot" style={{ margin: 0 }}>
              <div className="nbs-stage"><div className="nb-phone"><img src="/home/call-390.jpg" width="560" height="1212" loading="lazy" alt="The Studojo screen just before the call with Stu" /></div></div>
              <figcaption className="nb-cap">An example, a made-up student</figcaption>
            </figure>
          </li>
          <li className="nbs-step nbs-flip">
            <div className="nbs-copy">
              <span className="nbs-num" aria-hidden="true">2</span>
              <h3 className="nb-h3">Stu finds roles every day</h3>
              <p className="nb-body">New roles that fit your brief, each with a reason.</p>
              <p className="nb-body">From employers&apos; own career sites and job boards. India, plus the US, the UK, the UAE and Singapore.</p>
            </div>
            <figure className="nbs-shot" style={{ margin: 0 }}>
              <div className="nbs-stage"><div className="nb-phone"><img src="/home/jobs-390.jpg" width="560" height="1212" loading="lazy" alt="Jobs that fit a student's brief, each with a reason" /></div></div>
              <figcaption className="nb-cap">An example, a made-up student</figcaption>
            </figure>
          </li>
          <li className="nbs-step">
            <div className="nbs-copy">
              <span className="nbs-num" aria-hidden="true">3</span>
              <h3 className="nb-h3">Stu helps you email the hiring person</h3>
              <p className="nb-body">Stu finds the right person and writes a personal email in your voice, from your own inbox.</p>
              <p className="nb-body">You press send on an email, or start a sequence. Follow ups go on their own, and Stu suggests replies.</p>
            </div>
            <figure className="nbs-shot" style={{ margin: 0 }}>
              <div className="nbs-stage"><div className="nb-phone"><img src="/home/emails-390.jpg" width="560" height="1212" loading="lazy" alt="A personal email to a hiring manager, ready to start" /></div></div>
              <figcaption className="nb-cap">An example, a made-up student</figcaption>
            </figure>
          </li>
        </ol>
      </div>
    </section>
  );
}
