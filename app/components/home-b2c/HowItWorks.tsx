import type { ReactNode } from "react";
import { SectionEnd } from "./cta";
import { Doc, Mic, Send, Target } from "./icons";
import { SECTION_HOW } from "./links";

// 2. How it works (#how, the header's "how it works" before the owner dropped nav links). Copy: a1v2-copy.md.
const STEPS: { n: string; title: string; line: string; icon: ReactNode }[] = [
  { n: "01", title: "the call", line: "About 10 minutes with Stu, mostly about the role you want and why.", icon: <Mic /> },
  { n: "02", title: "your brief", line: "Stu writes up what you want, in your words. Change it any time.", icon: <Doc /> },
  { n: "03", title: "matches, every day", line: "New jobs that fit your brief, each with a line on why it fits you.", icon: <Target /> },
  { n: "04", title: "apply or reach out", line: "Apply yourself, or let Stu find the people who hire and write to them.", icon: <Send /> },
];

export function HowItWorks() {
  return (
    <section className="sjb-sec" id={SECTION_HOW} aria-labelledby="how-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">how it works</span>
          <h2 className="sjb-h-sec" id="how-h">
            four steps. the first one is a call.
          </h2>
        </header>

        <ol className="s-steps">
          {STEPS.map((step, i) => (
            <li key={step.n} className={`sjb-card s-step${i === 0 ? " s-first" : ""}`}>
              <span className="s-mono s-num">{step.n}</span>
              <span className="s-ico" aria-hidden="true">
                {step.icon}
              </span>
              <h3 className="sjb-h-card">{step.title}</h3>
              <p className="sjb-body">{step.line}</p>
              {i === 0 ? <span className="sjb-chip">you start here</span> : null}
            </li>
          ))}
        </ol>

        <SectionEnd line="Step one takes about 10 minutes." />
      </div>
    </section>
  );
}
