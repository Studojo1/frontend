import type { CSSProperties } from "react";
import { Link } from "react-router";
import { Plus } from "./icons";

// HOMEPAGE V3 (27 Oct 2026): questions (#faq). Native details, so it works without JS; with it, they open and close
// smoothly (Motion.tsx) and float in.
// 28 Oct 2026, the owner: like a reference he liked (a plain list between thin lines, a plus that turns into a cross),
// but not its words; then "make it as polished, good answers as possible... not 'it shouldn't'". Each answer says
// plainly what Stu does, and each is true of career-agent as built (27 Oct): the email writer researches the company,
// reads the posting and leads with the project that fits (mail/writer-facts.server.ts, company-research.ts), never
// states anything about the person that is not theirs (the truth guard), in the tone they pick (mail/tone.ts); the
// send gate writes to one person per company at a time and never to someone already emailed or on the do not contact
// list (mail/send-gate.ts, do-not-contact.server.ts); replies are checked every 5 minutes (mail/sequence.ts); avoided
// companies are never shown (profile avoid_companies). The counts are Proof.tsx's. No price: none on the homepage.
// 29 Oct 2026: the cost answer follows the owner's pricing of 28 Oct (your top matches each day are free; seeing every
// match and emailing the people hiring are paid), still with no price and no amount.

const QA: { q: string; a: string }[] = [
  {
    q: "Is Stu a real person?",
    a: "No. Stu is your AI career agent, working for you every day: finding jobs, finding the people hiring and writing your emails. Talk to it or type, whichever suits you.",
  },
  {
    q: "Where do the jobs come from?",
    a: "From over 7,700 job boards and company career sites, which Stu checks every day. Every new role is matched against what you told Stu, and the best fits come to you first, each with the reason it fits.",
  },
  {
    q: "How does Stu know who's hiring?",
    a: "Stu goes straight to the people behind the role, usually the hiring manager or the head of the team, and finds their verified work email. We've already found hiring managers at over 8,300 companies.",
  },
  {
    q: "Will the email sound like a bot wrote it?",
    a: "Not at all. Every email is written for one person and one job: Stu researches the company, reads the posting, and leads with the project or experience of yours that fits it best. It never invents anything about you, and it writes in the tone you pick: warm, direct or formal.",
  },
  {
    q: "Will Stu spam the company?",
    a: "No. Stu emails one person per company at a time, never pitches the same person twice, and skips anyone who has asked not to be contacted.",
  },
  {
    q: "I'm a fresher. Is this for me?",
    a: "Yes. Stu builds your pitch from your projects, studies and internships, so your email shows what you can do, not just where you've worked.",
  },
  {
    q: "Can I keep my current employer out of it?",
    a: "Yes. Tell Stu which companies to avoid, like the one you work at now, and they never show up in your matches.",
  },
  {
    q: "Do you read my inbox?",
    a: "No. Studojo only reads the replies to emails you send through it. Stu checks for them every few minutes and stops following up as soon as someone answers.",
  },
  {
    q: "What's free, and what do I pay for?",
    a: "Talking to Stu is free, and so are your top matches every day. You pay to see every match Stu finds, and emailing the people who are hiring uses credits. One credit is one verified email of the right person. No email found, no credit used.",
  },
  {
    q: "Am I guaranteed a job?",
    a: "No one can honestly promise a job. What Stu does is put you in front of the people who decide: jobs that fit you, the right person to contact, and a sharp, personal email to send them. From there, the job is yours to win.",
  },
];

export function Faq() {
  return (
    <section className="hv-sec hv3-sec" id="faq" aria-labelledby="faq-h">
      <div className="hv3-in hv3-narrow">
        <header className="hv3-head" data-reveal>
          <h2 className="hv3-h2" id="faq-h">Questions people ask</h2>
        </header>
        <div className="hv3-faq">
          {QA.map(({ q, a }, i) => (
            <details className="hv3-q" key={q} data-reveal style={{ "--hv3-d": `${i * 50}ms` } as CSSProperties}>
              <summary>
                {q}
                <span className="hv3-plus" aria-hidden="true">
                  <Plus size={20} sw={1.8} noJoin />
                </span>
              </summary>
              <p className="hv3-p">{a}</p>
            </details>
          ))}
        </div>
        <p className="hv3-note">
          <Link className="hv-link-type" to="/privacy">
            Read the privacy policy
          </Link>
        </p>
      </div>
    </section>
  );
}
