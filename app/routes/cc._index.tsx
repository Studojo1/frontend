import { motion } from "framer-motion";
import { Link } from "react-router";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";

const STEPS = [
  {
    number: "01",
    title: "Tell us your target",
    desc: "Role, industry, skills — takes 3 minutes. The coach asks you the right questions to build your profile.",
  },
  {
    number: "02",
    title: "Get your Career DNA",
    desc: "A readiness score built from your gaps, background, and target role — calibrated to India's real hiring bar.",
  },
  {
    number: "03",
    title: "Follow your roadmap",
    desc: "Prioritised actions linked to Resume Maker and Outreach Dojo. Fix one thing this week. Repeat.",
  },
];

const FEATURES = [
  {
    title: "Career DNA Score",
    desc: "A single number that tells you how ready you are to land your target role — and exactly what's pulling it down.",
  },
  {
    title: "Gap Analysis",
    desc: "Skills, industry knowledge, and experience gaps mapped against what top companies actually hire for.",
  },
  {
    title: "Weekly Roadmap",
    desc: "Three actions, every week. Not a list of 50 things — just what moves the needle right now.",
  },
  {
    title: "India-Calibrated",
    desc: "Built for Indian students targeting startups, MNCs, and tier-1 product companies. Not a generic global tool.",
  },
];

export function meta() {
  return [
    { title: "CareerDojo | studojo" },
    {
      name: "description",
      content:
        "Know exactly where you stand. CareerDojo analyses your profile, finds your gaps, and gives you a week-by-week plan to get hired.",
    },
  ];
}

export default function CareerDojoIndex() {
  return (
    <div className="w-full bg-white">
      <Header />

      <section className="border-b-2 border-neutral-900 bg-gradient-to-br from-violet-700 via-purple-700 to-violet-800">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-20">
          <motion.div
            className="flex flex-col gap-6 md:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-white/80">
                AI Career Coach · Free Beta
              </span>
            </div>

            <h1 className="max-w-3xl font-['Clash_Display'] text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Know exactly where you stand.
              <br className="hidden md:block" /> Close the gap. Get hired.
            </h1>

            <p className="max-w-xl font-['Satoshi'] text-sm font-normal leading-6 text-white/90 md:text-base md:leading-7">
              CareerDojo reads your profile, runs it against what companies actually
              hire for, and gives you a precise readiness score and week-by-week
              action plan — no fluff.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/cc/chat"
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl border-2 border-white bg-white font-['Satoshi'] text-base font-semibold text-violet-700 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none sm:w-auto sm:px-10"
              >
                Start your career analysis
              </Link>
              <span className="font-['Satoshi'] text-sm text-white/60 sm:pl-2">
                Free · No sign-up needed
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b-2 border-neutral-900">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-16">
          <motion.div
            className="flex flex-col gap-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-2">
              <span className="font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-violet-600">
                How it works
              </span>
              <h2 className="font-['Clash_Display'] text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
                Three steps. Under five minutes.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map(({ number, title, desc }) => (
                <div
                  key={number}
                  className="flex flex-col gap-4 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                >
                  <span className="font-['Clash_Display'] text-4xl font-bold text-violet-200">
                    {number}
                  </span>
                  <h3 className="font-['Satoshi'] text-base font-bold text-neutral-900">
                    {title}
                  </h3>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-500">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b-2 border-neutral-900 bg-purple-50">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-16">
          <motion.div
            className="flex flex-col gap-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <h2 className="font-['Clash_Display'] text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
              What you get
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map(({ title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 rounded-2xl border-2 border-neutral-900 bg-white p-6"
                >
                  <h3 className="font-['Satoshi'] text-base font-bold text-neutral-900">
                    {title}
                  </h3>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-500">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-16">
          <motion.div
            className="flex flex-col items-center gap-6 rounded-2xl border-2 border-neutral-900 bg-neutral-900 px-8 py-12 text-center shadow-[6px_6px_0px_0px_rgba(109,40,217,1)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <h2 className="font-['Clash_Display'] text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Ready to close your gaps?
            </h2>
            <p className="max-w-md font-['Satoshi'] text-sm leading-6 text-neutral-400 md:text-base">
              Get your Career DNA score in under 5 minutes and know exactly what to fix first.
            </p>
            <Link
              to="/cc/chat"
              className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-violet-500 bg-violet-500 px-10 font-['Satoshi'] text-base font-semibold text-white shadow-[4px_4px_0px_0px_rgba(109,40,217,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(109,40,217,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Launch CareerDojo
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
