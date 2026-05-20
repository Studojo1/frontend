import { motion } from "framer-motion";

export function meta() {
  return [
    { title: "Career Coach | studojo" },
    { name: "description", content: "AI-powered career coaching — know exactly where you stand, what to fix, and how to get hired." },
  ];
}

export default function CareerCoachPage() {
  return (
    <main className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24">
      <motion.div
        className="flex flex-col items-start gap-10 md:gap-14"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-['Satoshi'] text-sm font-medium text-neutral-600">
            AI Career Coach · Beta
          </span>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-5">
          <h1 className="font-['Satoshi'] text-4xl font-black leading-tight text-neutral-900 md:text-6xl">
            Know exactly
            <br />
            where you stand.
          </h1>
          <p className="max-w-xl font-['Satoshi'] text-lg leading-relaxed text-neutral-500 md:text-xl">
            CareerDojo analyses your profile, finds the gaps between you and
            your target role, and hands you a week-by-week plan to close them —
            no fluff, no generic advice.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href="https://career.studojo.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-neutral-900 px-8 font-['Satoshi'] text-base font-semibold text-white transition-transform hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Start your career analysis →
          </a>
          <span className="font-['Satoshi'] text-sm text-neutral-400">
            Free · No sign-up needed
          </span>
        </div>

        {/* Feature grid */}
        <div className="grid w-full gap-4 sm:grid-cols-3">
          {[
            {
              icon: "🧬",
              title: "Career DNA",
              desc: "A single readiness score built from your skills, gaps, and target role — calibrated to India's job market.",
            },
            {
              icon: "📍",
              title: "Gap Analysis",
              desc: "Skills, industry, and experience gaps mapped against what top companies actually hire for.",
            },
            {
              icon: "🗓️",
              title: "Weekly Roadmap",
              desc: "Prioritised actions you can take this week — linked to Resume Maker and Outreach Dojo.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-6"
            >
              <span className="text-2xl">{icon}</span>
              <h3 className="font-['Satoshi'] text-base font-bold text-neutral-900">
                {title}
              </h3>
              <p className="font-['Satoshi'] text-sm leading-relaxed text-neutral-500">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA repeat */}
        <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-neutral-900 bg-neutral-900 px-8 py-10 text-center">
          <h2 className="font-['Satoshi'] text-2xl font-black text-white md:text-3xl">
            Ready to close your gaps?
          </h2>
          <p className="font-['Satoshi'] text-base text-neutral-400">
            Talk to the AI coach and get your Career DNA in under 5 minutes.
          </p>
          <a
            href="https://career.studojo.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-8 font-['Satoshi'] text-base font-semibold text-neutral-900 transition-transform hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Launch Career Coach →
          </a>
        </div>
      </motion.div>
    </main>
  );
}
