import type { ReactNode } from "react";
import { Board, Book, Building, Check, DocLines, Globe, Refresh } from "./icons";
import { SECTION_GET } from "./links";

// 4. What you get (#get, the "jobs" section). Copy: a1v2-copy.md. The matches window is an example, labelled so:
// no real company names, counts or outcomes.
const JOBS = [
  { title: "growth associate", meta: ["fintech startup", "bengaluru", "hybrid"], why: "Early stage, and growth work that isn't pure sales, like you asked.", src: "company careers page" },
  { title: "product analyst intern", meta: ["edtech", "remote"], why: "Product work, and you said an analyst role is fine to start.", src: "job board" },
  { title: "product associate", meta: ["climate startup", "dubai"], why: "A small team, and you'd move for the right one.", src: "company careers page" },
] as const;

const FEATS: { title: string; line: string; icon: ReactNode }[] = [
  { title: "a reason for every match", line: "Each job tells you why it fits what you asked for.", icon: <Check /> },
  { title: "straight from the source", line: "From employers' own career pages and job boards.", icon: <Building /> },
  { title: "the whole description, read", line: "Stu reads the full job description, not just the title.", icon: <Book /> },
  { title: "fresh every day", line: "Your matches are refreshed daily, so you see new roles early.", icon: <Refresh /> },
  { title: "india, and abroad", line: "India, plus the US, the UK, the UAE and Singapore.", icon: <Globe /> },
];

export function WhatYouGet() {
  return (
    <section className="sjb-sec" id={SECTION_GET} aria-labelledby="get-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">what you get</span>
          <h2 className="sjb-h-sec" id="get-h">
            jobs that fit, and why they fit.
          </h2>
          <p className="sjb-lead">After the call, Stu keeps looking. Every day you get new roles that match your brief, each with a reason.</p>
        </header>

        <div className="s-get">
          <div className="s-matches-wrap" aria-hidden="true">
            <div className="sjb-win s-matches">
              <div className="sjb-bar">
                <i />
                <i />
                <i />
                <span>matches.stu</span>
              </div>
              <div className="s-top">
                <b>your matches</b>
                <span className="s-mono">
                  <i className="s-live" />
                  updated today
                </span>
              </div>
              {JOBS.map((job) => (
                <div className="s-job" key={job.title}>
                  <div className="s-t">
                    <b>{job.title}</b>
                    <small>
                      {job.meta.map((m, i) => (
                        <span key={m}>
                          {i > 0 ? <i className="s-dot" /> : null}
                          {m}
                        </span>
                      ))}
                    </small>
                  </div>
                  <p className="s-why">
                    <span className="s-k">why</span>
                    {job.why}
                  </p>
                  <div className="s-src">
                    <span>
                      {job.src === "job board" ? <Board /> : <Building />}
                      {job.src}
                    </span>
                    <span>
                      <DocLines />
                      full description read
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <span className="sjb-capt">an example. yours follow your brief.</span>
          </div>

          <ul className="s-feats">
            {FEATS.map((f) => (
              <li key={f.title}>
                <span className="s-ico" aria-hidden="true">
                  {f.icon}
                </span>
                <div>
                  <h3 className="sjb-h-card">{f.title}</h3>
                  <p className="sjb-body">{f.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
