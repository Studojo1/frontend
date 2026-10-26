// 6. And there's more (#more): what else Stu helps with.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function MoreB2C() {
  return (
    <section className="sjb-sec" id="more" aria-labelledby="more-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">and there&apos;s more</span>
          <h2 className="sjb-h-sec" id="more-h">everything else stu helps with.</h2>
          <p className="sjb-lead">Once Stu knows you, the rest gets easier. All of it is built from what you said and what is on your resume.</p>
        </header>
        <div className="st-grid">
          <article className="sjb-card st-tile st-shot">
            <span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M2 20a7 7 0 0 1 14 0" /><path d="m16 11 2 2 4-4" /></svg></span>
            <h3 className="sjb-h-card">what stu remembers</h3>
            <p className="sjb-body">Answers Stu keeps in mind, each with where it is used. Forget any of them.</p>
            <div className="st-peek">
              <img src="/home/knows-390.jpg" width="300" height="649" loading="lazy" decoding="async" alt="What Stu knows about you: each answer with where you said it, and a forget button" />
              <div className="st-ph" aria-hidden="true"><div className="st-ghost"><i /><i /><i /><i /></div><span className="st-mono">memory screen coming</span></div>
              <span className="sjb-capt">an example, a made-up student</span>
            </div>
          </article>
          <article className="sjb-card st-tile">
            <span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M9 10h.01M12 10h.01M15 10h.01" /></svg></span>
            <h3 className="sjb-h-card">a mock interview</h3>
            <p className="sjb-body">Practise for a job you are applying to, before the real one.</p>
          </article>
          <article className="sjb-card st-tile">
            <span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></svg></span>
            <h3 className="sjb-h-card">resume versions</h3>
            <p className="sjb-body">More than one version of your resume, each scored for how well it reads to hiring software.</p>
          </article>
          <article className="sjb-card st-tile">
            <span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg></span>
            <h3 className="sjb-h-card">your own page</h3>
            <p className="sjb-body">A public page drafted from your resume, if you want one.</p>
          </article>
          <article className="sjb-card st-tile">
            <span className="st-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></svg></span>
            <h3 className="sjb-h-card">talk to stu again</h3>
            <p className="sjb-body">A shorter call any time. Stu remembers the last one, so you only cover what is new.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
