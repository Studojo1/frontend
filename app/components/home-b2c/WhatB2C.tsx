// 1. What Studojo does (#what): one sentence, who it is for, three cards that jump to the parts below.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function WhatB2C() {
  return (
    <section className="sjb-sec" id="what" aria-labelledby="what-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">what studojo does</span>
          <h2 className="sjb-h-sec" id="what-h">an ai job agent you talk to.</h2>
          <p className="sjb-lead">Studojo gives you Stu, an AI job agent. You talk to Stu for about 10 minutes about the job you want, and Stu finds the roles that fit, tells you why, and helps you reach the people who hire.</p>
          <p className="st-for">Students and freshers looking for an internship or a full-time job.</p>
        </header>
        <div className="st-three">
          <a className="sjb-card st-jump" href="#call">
            <span className="st-row"><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg></span><span className="st-mono">01</span></span>
            <h3 className="sjb-h-card">a call, not a form</h3>
            <p className="sjb-body">Stu asks what you want, and why. You answer out loud, in your own words.</p>
            <span className="st-go">how the call goes <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg></span>
          </a>
          <a className="sjb-card st-jump" href="#matches">
            <span className="st-row"><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg></span><span className="st-mono">02</span></span>
            <h3 className="sjb-h-card">jobs that fit what you want</h3>
            <p className="sjb-body">Not just your resume. Each match says why it fits.</p>
            <span className="st-go">see your matches <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg></span>
          </a>
          <a className="sjb-card st-jump" href="#getjob">
            <span className="st-row"><span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></span><span className="st-mono">03</span></span>
            <h3 className="sjb-h-card">help writing to the people who hire</h3>
            <p className="sjb-body">Stu finds the right person and drafts the email. You send it.</p>
            <span className="st-go">how you get the job <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg></span>
          </a>
        </div>
      </div>
    </section>
  );
}
