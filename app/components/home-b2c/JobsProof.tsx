import { SECTION_JOBS } from "./links";

// Jobs (#jobs, the header's second link): proof that the jobs are real. Placeholder until the owner picks a
// direction. The chosen design fills it with real, live roles from the job agent's data (a loader or a
// career-agent endpoint), never with invented companies, counts or outcomes.
export function JobsProof({ stuHref }: { stuHref: string }) {
  return (
    <section id={SECTION_JOBS} aria-labelledby="jobs-title" className="scroll-mt-20 bg-lilac-50">
      <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24">
        <h2 id="jobs-title" className="font-clash text-3xl font-medium text-studojo-ink md:text-5xl">
          Real jobs, open now
        </h2>
        <p className="mt-4 max-w-2xl font-satoshi text-lg text-studojo-muted">
          Stu shows you roles that are open today, with a link to the real posting.
        </p>
        {/* Live role cards go here (data-slot for the design pass). */}
        <div data-slot="jobs-list" className="mt-10 grid gap-4 md:grid-cols-3" />
        <a
          href={stuHref}
          className="mt-10 inline-flex h-12 items-center justify-center rounded-2xl bg-studojo-purple-strong px-6 font-satoshi text-base font-medium text-white hover:bg-studojo-ink"
        >
          Ask Stu for jobs
        </a>
      </div>
    </section>
  );
}
