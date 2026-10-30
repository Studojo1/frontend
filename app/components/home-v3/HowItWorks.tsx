import type { CSSProperties } from "react";
import { Check } from "./icons";

// HOMEPAGE V3: how it works (#how), the same four steps as the cards around Stu in the hero, each with its title, one
// line and a small made-up example (labelled Example), not a screenshot: the screens behind it are being redone.
// 28 Oct 2026, the owner: "you've gone into super extreme details". What a reader already understands is not said:
// no sign-up, no call length, no "read it, change anything and press Start".
// The steps float in one after another, and each example plays out as it arrives (Motion.tsx, home-v3.css): the call's
// lines come in turn, the match ring fills to 86%, the person is found, the email types itself and is started.
// No button of its own (owner): only the hero, the floating agent and the footer start.

const d = (ms: number) => ({ "--hv3-d": `${ms}ms` }) as CSSProperties;

export function HowItWorks() {
  return (
    <section className="hv-sec hv3-sec" id="how" aria-labelledby="how-h">
      <div className="hv3-in">
        <header className="hv3-head" data-reveal>
          <h2 className="hv3-h2" id="how-h">How it works</h2>
        </header>
        <ol className="hv3-steps">
          <li className="hv-card hv3-step" data-reveal style={d(0)}>
            <span className="hv3-stepnum" aria-hidden="true">1</span>
            <h3 className="hv3-h3">Tell Stu what you want</h3>
            <p className="hv3-p">Talk to Stu about the role, the city and the pay you want.</p>
            <figure className="hv3-ex hv3-ex-call" aria-label="Example: part of a talk with Stu">
              <span className="hv3-ex-tag">Example</span>
              <p className="hv3-bub">
                <b>Stu</b>Which city would you like to work in?
              </p>
              <p className="hv3-bub hv3-bub-you">
                <b>You</b>Bengaluru, or remote.
              </p>
              <p className="hv3-bub">
                <b>Stu</b>Got it. What&apos;s the lowest pay you&apos;d say yes to?
              </p>
            </figure>
          </li>
          <li className="hv-card hv3-step" data-reveal style={d(140)}>
            <span className="hv3-stepnum" aria-hidden="true">2</span>
            <h3 className="hv3-h3">Stu finds jobs that fit you</h3>
            <p className="hv3-p">Every day, Stu checks company career sites and job boards for new roles, and shows you the best fits first.</p>
            <figure className="hv3-ex hv3-ex-job" aria-label="Example: a job Stu matched">
              <span className="hv3-ex-tag">Example</span>
              <div className="hv3-job">
                <span className="hv3-fit" data-count>
                  <svg viewBox="0 0 40 40" aria-hidden="true">
                    <circle className="hv3-fit-bg" cx="20" cy="20" r="16.5" />
                    <circle className="hv3-fit-fg" cx="20" cy="20" r="16.5" pathLength={100} />
                  </svg>
                  <b>86%</b>
                </span>
                <div>
                  <b>Business Analyst</b>
                  <span>Fintech startup · Bengaluru · Full time</span>
                </div>
              </div>
              <p className="hv3-why">
                <Check size={16} sw={2.6} />
                The analyst role you asked for, in Bengaluru, and it uses the SQL on your resume.
              </p>
            </figure>
          </li>
          <li className="hv-card hv3-step" data-reveal style={d(0)}>
            <span className="hv3-stepnum" aria-hidden="true">3</span>
            <h3 className="hv3-h3">Stu finds who&apos;s hiring</h3>
            <p className="hv3-p">Usually that&apos;s the hiring manager or a recruiter for the role.</p>
            <figure className="hv3-ex hv3-ex-person" aria-label="Example: the person Stu found for that job">
              <span className="hv3-ex-tag">Example</span>
              <div className="hv3-person">
                <span className="hv3-av" aria-hidden="true">A</span>
                <div>
                  <b>Ananya</b>
                  <span>Hiring Manager, Analytics · Fintech startup</span>
                </div>
              </div>
              <p className="hv3-why">
                <Check size={16} sw={2.6} />
                Direct contact found
              </p>
            </figure>
          </li>
          <li className="hv-card hv3-step" data-reveal style={d(140)}>
            <span className="hv3-stepnum" aria-hidden="true">4</span>
            <h3 className="hv3-h3">Stu reaches out for you</h3>
            <p className="hv3-p">Stu writes the email. It goes out from your own inbox, and Stu follows up if they don&apos;t reply.</p>
            <figure className="hv3-ex hv3-ex-mail" aria-label="Example: an email Stu wrote">
              <span className="hv3-ex-tag">Example</span>
              <p className="hv3-mail-to">
                <b>To</b> Ananya, Hiring Manager, Analytics
              </p>
              <p className="hv3-mail-body" data-type>
                Hi Ananya, I saw the Business Analyst opening on your team. I built a sales dashboard that cut a weekly report from six hours to two, and I&apos;d love to do that kind of work with you.
              </p>
              <div className="hv3-mail-foot">
                <span className="hv3-mail-sent" aria-hidden="true">
                  <Check size={14} sw={2.8} /> Started
                </span>
                <span className="hv3-mail-send">
                  Start sending
                  <svg className="hv3-plane" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </span>
              </div>
            </figure>
          </li>
        </ol>
      </div>
    </section>
  );
}
