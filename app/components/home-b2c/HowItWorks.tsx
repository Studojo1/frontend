import { SECTION_HOW } from "./links";

// How it works (#how, the header's first link). Placeholder steps until the owner picks a direction.
const STEPS = [
  { title: "Tell Stu what you want", body: "The roles you are after, where you want to work, and your resume." },
  { title: "Stu finds roles that fit", body: "Stu looks across company career pages and job boards and shows you why each role fits." },
  { title: "Go after the ones you like", body: "Stu helps you apply and write to the people hiring." },
] as const;

export function HowItWorks() {
  return (
    <section id={SECTION_HOW} aria-labelledby="how-title" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24">
        <h2 id="how-title" className="font-clash text-3xl font-medium text-studojo-ink md:text-5xl">
          How it works
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-[var(--radius-card)] border border-lilac-line bg-white p-6 shadow-lilac-soft">
              <span className="font-clash text-2xl font-medium text-studojo-purple-strong">{i + 1}</span>
              <h3 className="mt-3 font-satoshi text-lg font-bold text-studojo-ink">{step.title}</h3>
              <p className="mt-2 font-satoshi text-base text-studojo-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
