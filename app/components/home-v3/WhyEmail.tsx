import whyCss from "./why.css?url";
import { Arrow, Check, Cross } from "./icons";

// HOMEPAGE V3 (27 Oct 2026): why reach the person hiring instead of applying on a portal (#why). The simulated
// visitors only understood what Studojo is for once they read this argument, halfway down the old page; it now comes
// right after how it works. No claim beyond what is true of any posting: no reply rates, nothing guaranteed.
// 30 Oct 2026, the owner: "email is just a channel". The case is for reaching the person who's hiring, so email
// itself is not named here.
// 1 Nov 2026, the founder: the boxes and fonts were too small to read well; make it more appealing, with larger,
// useful fonts. Bigger type (on a laptop the title is 56px, the cards' titles 29px and their lines 21px), roomier
// cards, and the two sides told apart at a glance: the portal in greys, a pile of applications with yours buried in
// it; reaching the person in violet, a short note from you to a named hiring manager, and a reply. Both pictures are
// made-up examples (Ananya and her note are the ones in how it works), decorative and hidden from assistive tech; the
// line under them still says replies are never guaranteed. Styles: why.css, linked here, so only this page loads it.
// Motion: the two sides slide in from either edge; the applications land on the pile, the note rises and its reply
// pops up; the lines come in one by one and their marks shake or pop (Motion.tsx's hv3-rv-in, why.css).

const PORTAL = [
  "Popular postings get hundreds of applicants.",
  "Filters can screen you out before a person reads a word.",
  "You often never hear back.",
] as const;

const DIRECT = [
  "They hear from you directly.",
  "Stu writes a short note on why you fit, from your real work.",
  "Stu follows up politely, and stops as soon as they reply.",
] as const;

/** A sheet in the pile: a face and two lines of an application nobody has read yet. */
function Sheet() {
  return (
    <span className="hv3-cmp-sheet">
      <span className="hv3-cmp-face" />
      <span className="hv3-cmp-bars">
        <i />
        <i />
      </span>
    </span>
  );
}

export function WhyEmail() {
  return (
    <>
      <link rel="stylesheet" href={whyCss} precedence="default" />
      <section className="hv-sec hv3-sec" id="why" aria-labelledby="why-h">
        <div className="hv3-in">
          <header className="hv3-head" data-reveal>
            <h2 className="hv3-h2" id="why-h">
              <span className="hv3-cmp-l1">Portals bury your application.</span>{" "}
              <span className="hv3-cmp-l2">
                With Stu, it reaches <span className="hv3-cmp-hl">a person.</span>
              </span>
            </h2>
          </header>
          <div className="hv3-cmp">
            <div className="hv-card hv3-cmp-card hv3-cmp-no hv3-from-left" data-reveal>
              <div className="hv3-cmp-art hv3-cmp-pile" aria-hidden="true">
                <Sheet />
                <span className="hv3-cmp-sheet hv3-cmp-mine">
                  <span className="hv3-cmp-face">Y</span>
                  <b>Your application</b>
                </span>
                <Sheet />
                <Sheet />
              </div>
              <h3 className="hv3-h3">Applying on a job portal</h3>
              <ul className="hv3-cmp-list">
                {PORTAL.map((line) => (
                  <li key={line}>
                    <span className="hv3-cmp-mark" aria-hidden="true">
                      <Cross size={17} sw={2.6} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <span className="hv3-cmp-vs" aria-hidden="true">vs</span>
            <div className="hv-card hv3-cmp-card hv3-cmp-yes hv3-from-right" data-reveal>
              <div className="hv3-cmp-art hv3-cmp-reach" aria-hidden="true">
                <div className="hv3-cmp-msg">
                  <p className="hv3-cmp-msg-head">
                    <span className="hv3-cmp-from">You</span>
                    <Arrow size={15} sw={2.4} />
                    <span className="hv3-cmp-av">A</span>
                    <span className="hv3-cmp-to">
                      <b>Ananya</b> Hiring Manager
                    </span>
                  </p>
                  <p className="hv3-cmp-msg-body">
                    Hi Ananya, I saw the Business Analyst opening on your team. I built a sales dashboard that cut a weekly report from six hours to two.
                  </p>
                </div>
                <span className="hv3-cmp-reply">
                  <span className="hv3-cmp-live" />
                  Ananya replied
                </span>
              </div>
              <h3 className="hv3-h3">Reaching the person who&apos;s hiring</h3>
              <ul className="hv3-cmp-list">
                {DIRECT.map((line) => (
                  <li key={line}>
                    <span className="hv3-cmp-mark" aria-hidden="true">
                      <Check size={17} sw={2.8} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="hv3-note" data-reveal>Replies are never guaranteed. But your note reaches a person, not a filter.</p>
        </div>
      </section>
    </>
  );
}
