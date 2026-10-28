import { Check, Cross } from "./icons";

// HOMEPAGE V3 (27 Oct 2026): why email the person hiring instead of applying on a portal (#why). The simulated
// visitors only understood what Studojo is for once they read this argument, halfway down the old page; it now comes
// right after how it works. No claim beyond what is true of any posting: no reply rates, nothing guaranteed.
// Motion: the two sides slide in from either edge, their marks pop in one by one (Motion.tsx, home-v3.css).

export function WhyEmail() {
  return (
    <section className="hv-sec hv3-sec" id="why" aria-labelledby="why-h">
      <div className="hv3-in">
        <header className="hv3-head" data-reveal>
          <h2 className="hv3-h2" id="why-h">Portals bury your application. An email reaches a person.</h2>
        </header>
        <div className="hv3-vs">
          <div className="hv-card hv3-vs-col hv3-from-left" data-reveal>
            <h3 className="hv3-h3">Applying on a job portal</h3>
            <ul className="hv3-list">
              <li>
                <span className="hv3-mark hv3-mark-no" aria-hidden="true"><Cross size={14} sw={2.6} /></span>
                Popular postings get hundreds of applicants.
              </li>
              <li>
                <span className="hv3-mark hv3-mark-no" aria-hidden="true"><Cross size={14} sw={2.6} /></span>
                Filters can screen you out before a person reads a word.
              </li>
              <li>
                <span className="hv3-mark hv3-mark-no" aria-hidden="true"><Cross size={14} sw={2.6} /></span>
                You often never hear back.
              </li>
            </ul>
          </div>
          <div className="hv-card hv3-vs-col hv3-vs-yes hv3-from-right" data-reveal>
            <h3 className="hv3-h3">Emailing the person who&apos;s hiring</h3>
            <ul className="hv3-list">
              <li>
                <span className="hv3-mark" aria-hidden="true"><Check size={14} sw={2.8} /></span>
                It lands in their own inbox.
              </li>
              <li>
                <span className="hv3-mark" aria-hidden="true"><Check size={14} sw={2.8} /></span>
                A short note on why you fit, from your real work.
              </li>
              <li>
                <span className="hv3-mark" aria-hidden="true"><Check size={14} sw={2.8} /></span>
                Polite follow-ups that stop as soon as they reply.
              </li>
            </ul>
          </div>
        </div>
        <p className="hv3-note" data-reveal>Replies are never guaranteed. But your note reaches a person, not a filter.</p>
      </div>
    </section>
  );
}
