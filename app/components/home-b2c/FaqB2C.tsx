import type { ReactNode } from "react";
import { Link } from "react-router";
import { SectionEnd, TypeLink } from "./cta";
import { Plus } from "./icons";
import { PRIVACY, SECTION_FAQ } from "./links";

// 5. FAQ (#faq). Copy: a1v2-copy.md, with the owner's fix to "is it free?" (27 Oct). <details> works without JS.
const FAQS: { q: string; a: string; more?: ReactNode; open?: boolean }[] = [
  {
    q: "is it free?",
    a: "Free to start. Finding and matching jobs costs nothing. Some extras, like finding the people who hire so Stu can write to them, use credits.",
    open: true,
  },
  {
    q: "how long is the call?",
    a: "About 10 minutes. It's one conversation, mostly about the role you want and why. Have your resume handy as a PDF, and find a quiet spot. Headphones help.",
  },
  {
    q: "i'm a fresher. will it work for me?",
    a: "Yes. Stu asks about your studies, your projects and any internships, not just past jobs. You can look for an internship or a full-time role.",
  },
  {
    q: "can i type instead?",
    a: "Yes. Can't talk right now? Set up by typing instead, and you still get your matches.",
    more: <TypeLink label="set up by typing instead" />,
  },
  {
    q: "what happens to my data?",
    a: "Your profile is yours. Studojo uses it to find and explain your matches, and never sells it. You can download a copy or delete your account any time from Settings.",
    more: (
      <Link to={PRIVACY} className="sjb-link-type">
        read the privacy policy
      </Link>
    ),
  },
  {
    q: "what if i don't know what i want yet?",
    a: "Say so. Stu asks what you've enjoyed so far, the roles you'd consider and the ones you wouldn't, and starts from there. You can change your brief any time.",
  },
];

export function FaqB2C() {
  return (
    <section className="sjb-sec" id={SECTION_FAQ} aria-labelledby="faq-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">questions</span>
          <h2 className="sjb-h-sec" id="faq-h">
            before you call.
          </h2>
        </header>

        <div className="s-faq">
          {FAQS.map(({ q, a, more, open }) => (
            <details key={q} className="s-q" open={open}>
              <summary>
                {q}
                <span className="s-plus" aria-hidden="true">
                  <Plus />
                </span>
              </summary>
              <div className="s-a">
                <p>{a}</p>
                {more}
              </div>
            </details>
          ))}
        </div>

        <SectionEnd line="The rest is easier to say out loud." />
      </div>
    </section>
  );
}
