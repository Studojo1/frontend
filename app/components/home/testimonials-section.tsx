const TESTIMONIALS = [
  {
    id: "1",
    quote:
      "Got 4 interview calls in 10 days. I'd been applying for 3 months before this with nothing. The outreach actually works.",
    name: "Priya M.",
    meta: "Computer Science, Delhi University",
    role: "Placed at Razorpay",
    avatarColor: "bg-violet-400",
  },
  {
    id: "2",
    quote:
      "The resume builder is scary good. It took my random internships and made them sound like a proper career story. Free too.",
    name: "Rahul K.",
    meta: "MBA, IIM Bangalore",
    role: "Placed at BCG",
    avatarColor: "bg-emerald-400",
  },
  {
    id: "3",
    quote:
      "I was applying to 20 jobs a day and hearing nothing. Studojo showed me exactly who to contact and why. Two weeks later I had an offer.",
    name: "Sarah D.",
    meta: "Engineering, VIT",
    role: "Placed at Figma",
    avatarColor: "bg-amber-400",
  },
  {
    id: "4",
    quote:
      "The assignment helper sounds like me, not a robot. Finally passed my lit review without spending 6 hours on it.",
    name: "Marcus T.",
    meta: "Business, University of Michigan",
    role: "Summer intern at Deloitte",
    avatarColor: "bg-sky-400",
  },
  {
    id: "5",
    quote:
      "Reached out to 12 hiring managers in Singapore through Studojo. 5 replied. 2 led to interviews. That hit rate is unreal.",
    name: "Aisha R.",
    meta: "Finance, NUS",
    role: "Placed at Goldman Sachs",
    avatarColor: "bg-rose-400",
  },
  {
    id: "6",
    quote:
      "I thought cold outreach was cringe. It's not when you're saying the right thing to the right person. Studojo figures that part out.",
    name: "Tom B.",
    meta: "Computer Science, UCL",
    role: "Placed at Monzo",
    avatarColor: "bg-orange-400",
  },
];

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 shrink-0 text-yellow-400"
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-b-2 border-neutral-900 bg-white px-4 pt-16 pb-16 md:px-8 md:pt-24 md:pb-20"
    >
      <div className="mx-auto max-w-[var(--section-max-width)]">

        {/* Header */}
        <div className="mb-4 text-center md:mb-6">
          <p className="inline-block rounded-full border-2 border-neutral-900 bg-violet-100 px-4 py-1.5 font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-violet-700 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] mb-4">
            Student Stories
          </p>
          <h2 className="font-['Clash_Display'] text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl leading-tight">
            138 students placed.<br className="hidden sm:block" />
            <span className="text-violet-600"> As of yesterday.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-['Satoshi'] text-base text-neutral-500 md:text-lg">
            Real students. Real roles. No fluff.
          </p>
        </div>

        {/* Stats strip */}
        <div className="mb-12 flex flex-wrap justify-center gap-6 md:gap-10">
          {[
            { value: "138", label: "Students placed" },
            { value: "95%", label: "Satisfaction rate" },
            { value: "4.9", label: "Average rating" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-['Clash_Display'] text-3xl font-bold text-neutral-900 md:text-4xl">{s.value}</p>
              <p className="font-['Satoshi'] text-sm text-neutral-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.id}
              className="flex flex-col gap-4 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5" aria-hidden>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <span className="rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 font-['Satoshi'] text-xs font-semibold text-violet-700">
                  {t.role}
                </span>
              </div>
              <blockquote className="flex-1 font-['Satoshi'] text-sm leading-relaxed text-neutral-700 md:text-base">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3 border-t border-neutral-100 pt-4 mt-auto">
                <div
                  className={`h-9 w-9 shrink-0 rounded-full ${t.avatarColor} flex items-center justify-center border-2 border-neutral-900`}
                  aria-hidden
                >
                  <span className="font-['Clash_Display'] text-sm font-bold text-white">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900">
                    {t.name}
                  </p>
                  <p className="font-['Satoshi'] text-xs text-neutral-500">
                    {t.meta}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
