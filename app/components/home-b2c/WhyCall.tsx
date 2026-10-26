import type { ReactNode } from "react";
import { SectionEnd } from "./cta";
import { Ban, Chat, Mic, Money, Pencil, Pin, Question } from "./icons";
import { SECTION_WHY } from "./links";

// 3. Why a call (#why). Copy: a1v2-copy.md. The brief on the right is an example, labelled so.
const LEARNS: { text: string; icon: ReactNode }[] = [
  { text: "what you want, in your own words", icon: <Chat /> },
  { text: "why you want it", icon: <Question /> },
  { text: "where you want to work, and whether you'd move", icon: <Pin /> },
  { text: "the pay you need, and how you got to it", icon: <Money /> },
  { text: "the work you won't do", icon: <Ban /> },
];

const BRIEF: [string, string][] = [
  ["wants", "Product work at a small team. An analyst role is fine to start."],
  ["why", "Wants to own a feature end to end, not just report on it."],
  ["where", "Bengaluru or remote. Would move for the right team."],
  ["pay", "A clear number, and how it was worked out."],
  ["won't do", "Cold calling. Pure sales targets."],
];

export function WhyCall() {
  return (
    <section className="sjb-sec" id={SECTION_WHY} aria-labelledby="why-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">why a call</span>
          <h2 className="sjb-h-sec" id="why-h">
            a form asks for skills. stu asks why.
          </h2>
          <p className="sjb-lead">
            {"A form can't hear that you want product work but not at a bank, or that you'd move for the right team. A call can. In about 10 minutes, Stu learns what a resume and a form miss, and keeps it for next time."}
          </p>
        </header>

        <div className="s-split">
          <div className="sjb-card s-learn">
            <span className="s-mono">what stu learns on the call</span>
            <ul>
              {LEARNS.map(({ text, icon }) => (
                <li key={text}>
                  <span className="s-ico" aria-hidden="true">
                    {icon}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <p className="s-note">
              <Pencil size={16} />
              Change anything later. Talk to Stu again, or edit your brief yourself.
            </p>
          </div>

          <div className="s-brief-wrap" aria-hidden="true">
            <div className="sjb-win s-brief">
              <div className="sjb-bar">
                <i />
                <i />
                <i />
                <span>brief.stu</span>
              </div>
              <div className="s-top">
                <span className="s-stu">
                  <img src="/stu/stu2-listen.svg" alt="" width={34} height={34} />
                </span>
                <div>
                  <b>your brief</b>
                  <small>written by Stu, after your call</small>
                </div>
                <span className="sjb-chip">
                  <Pencil size={12} width={2.2} />
                  edit
                </span>
              </div>
              <dl>
                {BRIEF.map(([k, v]) => (
                  <div className="s-row" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="s-foot">
                <span className="s-pill">
                  <Mic />
                  talk to stu
                </span>
                <span className="s-pill">
                  <Pencil />
                  edit it yourself
                </span>
              </div>
            </div>
            <span className="sjb-capt">an example brief</span>
          </div>
        </div>

        <SectionEnd line="Say it once. Stu remembers." />
      </div>
    </section>
  );
}
