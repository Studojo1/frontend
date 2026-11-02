import type { CSSProperties } from "react";
import howCss from "./how.css?url";
import { CallExample, MailExample, MatchesExample, PersonExample } from "./HowExamples";

// HOMEPAGE V3: how it works (#how), the same four steps as the cards around Stu in the hero, each with its title, one
// line and a made-up example (labelled Example).
// 28 Oct 2026, the owner: "you've gone into super extreme details". What a reader already understands is not said:
// no sign-up, no call length, no "read it, change anything and press Start".
// 1 Nov 2026, the founder: "more visuals throughout the page with actual UI components of our product". Each example
// is now drawn as the Stu desk draws it (HowExamples.tsx, styles in how.css, linked here): the call with Stu, My
// matches, who's hiring on a campaign row, the email with its Start and a reply. From a tablet up the four cards line
// up in rows (their title, line and example on the same lines), each example flush at the foot of its card.
// The steps float in one after another, and each example plays out as it arrives (Motion.tsx, how.css): the call's
// lines come in turn, the match ring fills to 86%, the person is found with their work email, the email types itself,
// is started, and a reply comes in.
// No button of its own (owner): only the hero, the floating agent and the footer start.

const d = (ms: number) => ({ "--hv3-d": `${ms}ms` }) as CSSProperties;

export function HowItWorks() {
  return (
    <section className="hv-sec hv3-sec" id="how" aria-labelledby="how-h">
      <link rel="stylesheet" href={howCss} precedence="default" />
      <div className="hv3-in">
        <header className="hv3-head" data-reveal>
          <h2 className="hv3-h2" id="how-h">How it works</h2>
        </header>
        <ol className="hv3-steps">
          <li className="hv-card hv3-step" data-reveal style={d(0)}>
            <span className="hv3-stepnum" aria-hidden="true">1</span>
            <h3 className="hv3-h3">Tell Stu what you want</h3>
            <p className="hv3-p">Talk to Stu about the role, the city and the pay you want.</p>
            <CallExample />
          </li>
          <li className="hv-card hv3-step" data-reveal style={d(140)}>
            <span className="hv3-stepnum" aria-hidden="true">2</span>
            <h3 className="hv3-h3">Stu finds jobs that fit you</h3>
            <p className="hv3-p">Every day, Stu checks company career sites and job boards for new roles, and shows you the best fits first.</p>
            <MatchesExample />
          </li>
          <li className="hv-card hv3-step" data-reveal style={d(0)}>
            <span className="hv3-stepnum" aria-hidden="true">3</span>
            <h3 className="hv3-h3">Stu finds who&apos;s hiring</h3>
            <p className="hv3-p">Usually that&apos;s the hiring manager or a recruiter for the role.</p>
            <PersonExample />
          </li>
          <li className="hv-card hv3-step" data-reveal style={d(140)}>
            <span className="hv3-stepnum" aria-hidden="true">4</span>
            <h3 className="hv3-h3">Stu reaches out for you</h3>
            <p className="hv3-p">Stu writes the email. Nothing goes out until you start a campaign. Then Stu sends from your own inbox, follows up, and stops when someone replies.</p>
            <MailExample />
          </li>
        </ol>
      </div>
    </section>
  );
}
