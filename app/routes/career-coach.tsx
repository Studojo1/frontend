import { motion } from "framer-motion";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import type { Route } from "./+types/career-coach";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Career Coach | Studojo — Your AI Career Advisor" },
    {
      name: "description",
      content: "Get a personalised Career DNA analysis. Know exactly what roles fit you, where your gaps are, and the one action that will get you your first recruiter reply.",
    },
    { property: "og:title", content: "Career Coach | Studojo" },
    { property: "og:description", content: "Personalised career analysis. Not generic advice — your exact gaps, your exact next step." },
  ];
}

const STATS = [
  { value: "3x", label: "more recruiter replies with a targeted profile" },
  { value: "74", label: "readiness score where interviews start happening" },
  { value: "6 wks", label: "average time from first chat to outreach-ready" },
  { value: "10k+", label: "students have used Studojo to land roles" },
];

const STEPS = [
  {
    num: "01",
    title: "Have a real conversation",
    body: "The AI coach asks you targeted questions — your background, goals, what has and has not worked. No forms. No dropdowns. Just a conversation that builds your Career DNA.",
  },
  {
    num: "02",
    title: "Get your Career DNA",
    body: "A personalised readiness score, your exact skill gaps with specific actions to close them, and a list of real companies that match your profile — not generic advice.",
  },
  {
    num: "03",
    title: "One action. This week.",
    body: "You leave with one specific thing to do. Not a to-do list. One action that moves your reply probability from where it is to where it needs to be.",
  },
];

export default function CareerCoach() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-[var(--section-max-width)] px-4 pt-20 pb-16 md:px-8 md:pt-28 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            <span className="font-['Satoshi'] text-sm font-medium text-violet-700">AI Career Coach — Beta</span>
          </div>
          <h1 className="font-['Satoshi'] text-5xl font-black leading-tight tracking-tight text-neutral-900 md:text-7xl">
            Know exactly<br />what to do next.
          </h1>
          <p className="mt-6 font-['Satoshi'] text-lg leading-relaxed text-neutral-600 md:text-xl">
            Most students apply to 50 jobs and hear nothing back. The problem is not effort — it is direction.
            The Career Coach figures out your exact gaps and gives you one specific action that changes your outcome.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/career-coach/chat"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-neutral-900 px-8 font-['Satoshi'] text-base font-semibold text-white transition-transform hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              Start your Career Analysis →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-neutral-200 px-8 font-['Satoshi'] text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              See how it works
            </a>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-100 bg-neutral-50">
        <div className="mx-auto grid max-w-[var(--section-max-width)] grid-cols-2 px-4 md:grid-cols-4 md:px-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.value}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="border-r border-neutral-200 px-6 py-8 last:border-r-0 md:py-10"
            >
              <div className="font-['Satoshi'] text-3xl font-black text-neutral-900 md:text-4xl">{s.value}</div>
              <div className="mt-1 font-['Satoshi'] text-sm text-neutral-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-[var(--section-max-width)] px-4 py-20 md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-600">How it works</div>
          <h2 className="font-['Satoshi'] text-4xl font-black tracking-tight text-neutral-900 md:text-5xl">
            Three steps.<br />One clear direction.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm"
            >
              <div className="mb-4 font-['Satoshi'] text-5xl font-black text-neutral-100">{step.num}</div>
              <h3 className="mb-3 font-['Satoshi'] text-xl font-bold text-neutral-900">{step.title}</h3>
              <p className="font-['Satoshi'] text-base leading-relaxed text-neutral-600">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[var(--section-max-width)] px-4 pb-24 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-neutral-900 px-10 py-16 text-center"
        >
          <h2 className="font-['Satoshi'] text-4xl font-black text-white md:text-5xl">
            Stop guessing.<br />Start with one right move.
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-['Satoshi'] text-lg text-neutral-400">
            Eight minutes. A personalised analysis. One action that actually changes your outcome.
          </p>
          <Link
            to="/career-coach/chat"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 font-['Satoshi'] text-base font-bold text-neutral-900 transition-transform hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Start your Career Analysis →
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
