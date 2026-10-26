import { CONTACT_EMAIL } from "./links";

// FAQ. Placeholder questions until the owner picks a direction and signs off the answers. Only facts that
// hold today: no prices, counts or outcomes here until they are confirmed. <details> works without JS.
const FAQS = [
  {
    q: "Who is Stu?",
    a: "Stu is Studojo's job agent. You tell Stu what you are looking for, and Stu finds roles that fit and helps you go after them.",
  },
  {
    q: "Where do the jobs come from?",
    a: "From company career pages and job boards. Every role links to the real posting.",
  },
  {
    q: "Who is behind Studojo?",
    a: "Studojo Labs Private Limited, based in Bangalore, India.",
  },
  {
    q: "How do I get help?",
    a: `Write to us at ${CONTACT_EMAIL}.`,
  },
] as const;

export function FaqB2C() {
  return (
    <section aria-labelledby="faq-title" className="bg-lilac-50">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <h2 id="faq-title" className="font-clash text-3xl font-medium text-studojo-ink md:text-5xl">
          Questions
        </h2>
        <div className="mt-8 flex flex-col gap-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group rounded-[var(--radius-card)] border border-lilac-line bg-white p-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-satoshi text-lg font-bold text-studojo-ink">
                {q}
                <span aria-hidden className="text-studojo-purple-strong transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 font-satoshi text-base text-studojo-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
