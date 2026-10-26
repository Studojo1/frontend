import { SectionEnd } from "./cta";
import { Check } from "./icons";
import { SECTION_WHAT } from "./links";

// 1. What Studojo is (#what). Copy: a1v2-copy.md, verbatim. The small pictures are decorative.
export function WhatB2C() {
  return (
    <section className="sjb-sec" id={SECTION_WHAT} aria-labelledby="what-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">what studojo is</span>
          <h2 className="sjb-h-sec" id="what-h">
            meet stu, your ai job agent.
          </h2>
          <p className="sjb-lead">
            You talk to Stu for about 10 minutes about the job you want. Stu finds the roles that fit, every day, and tells you why each one
            fits. Then Stu helps you apply, or writes to the people who hire.
          </p>
        </header>

        <div className="s-three">
          <article className="sjb-card s-what">
            <div className="s-vis" aria-hidden="true">
              <div className="s-say">
                <span className="s-stu">
                  <img src="/stu/stu2-speak.svg" alt="" width={34} height={34} />
                </span>
                <span className="s-bub">What kind of role do you want next?</span>
              </div>
              <span className="s-bub s-me">Product, at a small team. Not at a bank.</span>
              <span className="s-wave">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <h3 className="sjb-h-card">a call, not a form</h3>
            <p className="sjb-body">Stu asks what you want, and why. Your words, not checkboxes.</p>
          </article>

          <article className="sjb-card s-what">
            <div className="s-vis" aria-hidden="true">
              <div className="s-mini s-back">
                <b>product analyst intern</b>
              </div>
              <div className="s-mini">
                <b>growth associate</b>
                <small>
                  fintech startup
                  <i className="s-dot" />
                  bengaluru
                </small>
                <p>
                  <em>why it fits:</em> early stage, and growth work that isn&apos;t pure sales.
                </p>
              </div>
            </div>
            <h3 className="sjb-h-card">jobs that fit you</h3>
            <p className="sjb-body">Matched to what you want, not just your resume.</p>
          </article>

          <article className="sjb-card s-what">
            <div className="s-vis" aria-hidden="true">
              <div className="s-mini s-mail">
                <div className="s-ln">
                  to <span>head of growth</span>
                </div>
                <div className="s-ln">
                  re <span>your growth associate role</span>
                </div>
                <div className="s-bars">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <span className="s-tag">
                <Check width={2.4} />
                written for you
              </span>
            </div>
            <h3 className="sjb-h-card">the people who hire</h3>
            <p className="sjb-body">Stu finds them, and writes to them for you.</p>
          </article>
        </div>

        <SectionEnd line="It starts with one conversation." />
      </div>
    </section>
  );
}
