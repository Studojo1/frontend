import { ArrowDown, Mail, Mic, Target } from "./icons";

// 1. What Studojo does (#what): one line on Stu, who it is for, three cards that jump to the parts below (in-page links, not calls to action).
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function What() {
  return (
    <section className="hv-sec" id="what" aria-labelledby="what-h">
      <div className="hv-sec-in">
        <header className="hv-sec-head">
          <span className="hv-kicker">what studojo does</span>
          <h2 className="hv-h-sec" id="what-h">a career agent you talk to.</h2>
          <p className="hv-lead">Talk to Stu, your career agent, for about 10 minutes about the job you want. Stu finds roles that fit, says why, and helps you reach the people who hire.</p>
          <p className="hv-st-for">Students and freshers looking for an internship or a full-time job.</p>
        </header>
        <div className="hv-st-three">
          <a className="hv-card hv-st-jump" href="#call">
            <span className="hv-st-row"><span className="hv-st-ico"><Mic /></span><span className="hv-st-mono">01</span></span>
            <h3 className="hv-h-card">a call, not a form</h3>
            <p className="hv-body">Stu asks what you want and why. You answer out loud.</p>
            <span className="hv-st-go">how the call goes <ArrowDown /></span>
          </a>
          <a className="hv-card hv-st-jump" href="#matches">
            <span className="hv-st-row"><span className="hv-st-ico"><Target /></span><span className="hv-st-mono">02</span></span>
            <h3 className="hv-h-card">jobs that fit what you want</h3>
            <p className="hv-body">Not just your resume. Each match says why it fits.</p>
            <span className="hv-st-go">see your matches <ArrowDown /></span>
          </a>
          <a className="hv-card hv-st-jump" href="#getjob">
            <span className="hv-st-row"><span className="hv-st-ico"><Mail /></span><span className="hv-st-mono">03</span></span>
            <h3 className="hv-h-card">help writing to the people who hire</h3>
            <p className="hv-body">Stu finds the right person and drafts the email. You send it.</p>
            <span className="hv-st-go">how you get the job <ArrowDown /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
