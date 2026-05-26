import { motion } from "framer-motion";
import { Link } from "react-router";
import { FiTarget, FiTrendingUp, FiCalendar, FiArrowRight } from "react-icons/fi";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";

export function meta() {
  return [
    { title: "Career Coach | Studojo" },
    {
      name: "description",
      content:
        "See exactly how much better you are than the typical fresher chasing your role. Climb three levels — Industry-Ready, Well-Rounded, Standout — with a weekly action plan built around your profile.",
    },
  ];
}

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Tell the coach about yourself",
    desc: "No forms. Just a conversation. The AI asks about your degree, skills, experience, and what you're going after — and listens. The more you talk to it, the sharper it gets.",
  },
  {
    num: "02",
    title: "Get your Career DNA",
    desc: "You see exactly how much better you are than the typical fresher chasing your role in your industry, the specific gaps holding that number back, and your current level on the 3-step ladder.",
  },
  {
    num: "03",
    title: "Climb the three levels",
    desc: "Show up daily, log your weekly progress, and watch your standing climb. Six weeks of consistent follow-through promotes you to the next level: Industry-Ready → Well-Rounded → Standout.",
  },
];

const WHAT_YOU_GET = [
  {
    label: "Career DNA",
    title: "Know exactly where you stand",
    bullets: [
      "How much % better you are than your industry",
      "Skills, industry, and experience gaps",
      "Your current level: Industry-Ready, Well-Rounded, or Standout",
    ],
    cta: "Get your Career DNA",
    accent: "bg-violet-500",
    iconBg: "bg-violet-200",
    iconColor: "text-violet-600",
    icon: <FiTarget />,
  },
  {
    label: "Gap Analysis",
    title: "See what's holding you back",
    bullets: [
      "Skill gaps ranked by impact for your role",
      "Industry knowledge gaps",
      "Experience gaps vs the top fresher candidates",
    ],
    cta: "Run your gap analysis",
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-200",
    iconColor: "text-emerald-600",
    icon: <FiTrendingUp />,
  },
  {
    label: "Weekly Action Plan",
    title: "Climb the ladder, week by week",
    bullets: [
      "Highest-leverage move for your level",
      "Daily check-ins compound your standing",
      "Six weeks of follow-through gets you to the next level",
    ],
    cta: "Get your action plan",
    accent: "bg-amber-500",
    iconBg: "bg-amber-200",
    iconColor: "text-amber-700",
    icon: <FiCalendar />,
  },
];

const QUOTES = [
  {
    text: "I had no idea what was actually stopping me from getting replies. Seeing exactly where I stood vs other CS freshers — and the one skill that was dragging it down — told me what to build first. Got an interview at Razorpay two weeks later.",
    name: "Arjun S.",
    detail: "B.Tech CS, SRM — targeting Product",
  },
  {
    text: "Every career counsellor I talked to gave me the same generic advice. This actually read my profile and told me the specific gap I needed to close.",
    name: "Priya M.",
    detail: "BCom, Mumbai — Finance track",
  },
  {
    text: "I was applying to everything and getting nothing. The coach told me I was going too broad. Narrowed my target, updated my approach, got three replies in 10 days.",
    name: "Rahul K.",
    detail: "MBA, non-IIM — Consulting pivot",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function CcIndex() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero — 9:16 on mobile, 16:9 on desktop */}
        <section className="relative w-full overflow-hidden border-b-2 border-neutral-900" style={{backgroundColor:"#1a0a2e"}}>
          <div
            className="hero-aspect relative w-full"
            style={{ paddingBottom: "177.78%" }}
          >
            {/* Mobile image (portrait 9:16) — hidden on md+ */}
            <img
              src="/cc-hero-mobile.png"
              alt="Bobie the career coach in front of the Studojo dojo gate"
              className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
              loading="eager"
            />
            {/* Desktop image (landscape 16:9) — shown on md+ via aspect ratio override */}
            <img
              src="/cc-hero.png"
              alt="Bobie the career coach in front of the Studojo dojo gate"
              className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
              loading="eager"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent" />

            {/* How it works — top-left */}
            <motion.div
              className="absolute left-4 top-4 md:left-8 md:top-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-4 py-2 font-['Satoshi'] text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                How it works
                <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10m0 0L3 8m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </motion.div>

            {/* CTA — positioned 30% from bottom so it's visible without scrolling */}
            <motion.div
              className="absolute bottom-[30%] right-0 flex flex-col items-end pr-4 md:pr-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="mb-4 text-right font-['Satoshi'] text-sm font-medium tracking-wide text-white/80">
                Takes 8 minutes. Gets sharper the more you talk to it.
              </p>
              <Link
                to="/cc/chat"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-10 font-['Satoshi'] text-base font-bold text-violet-700 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                Get my Career DNA <FiArrowRight />
              </Link>
            </motion.div>
          </div>
          {/* Desktop: override aspect ratio to 16:9 */}
          <style>{`@media(min-width:768px){.hero-aspect{padding-bottom:56.25%!important}}`}</style>
        </section>


        {/* How it works */}
        <section id="how-it-works" className="border-b border-neutral-900 bg-white py-16 md:py-24">
          <Section>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={containerVariants}
            >
              <motion.p variants={itemVariants} className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-600">
                How it works
              </motion.p>
              <motion.h2
                variants={itemVariants}
                className="font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900 md:text-4xl lg:text-5xl"
              >
                Three steps. Your roadmap is ready.
              </motion.h2>
              <motion.p variants={itemVariants} className="mt-3 max-w-2xl font-['Satoshi'] text-base text-neutral-600 md:text-lg">
                No forms, no uploads. Just a conversation that builds your complete career picture.
              </motion.p>
              <motion.div variants={itemVariants} className="mt-12 grid gap-6 md:grid-cols-3">
                {HOW_IT_WORKS.map((s) => (
                  <div
                    key={s.num}
                    className="rounded-2xl border-2 border-neutral-900 bg-white p-7 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                  >
                    <div className="font-['Clash_Display'] text-5xl font-medium leading-none text-violet-100">
                      {s.num}
                    </div>
                    <h3 className="mt-3 font-['Satoshi'] text-lg font-bold text-neutral-900">
                      {s.title}
                    </h3>
                    <p className="mt-2 font-['Satoshi'] text-sm leading-6 text-neutral-600">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Section>
        </section>

        {/* What you get */}
        <section className="border-b border-neutral-900 bg-neutral-50 py-16 md:py-24">
          <Section>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={containerVariants}
            >
              <motion.p variants={itemVariants} className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-600">
                What you get
              </motion.p>
              <motion.h2 variants={itemVariants} className="font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900 md:text-4xl lg:text-5xl">
                Everything in one session.
              </motion.h2>
              <motion.p variants={itemVariants} className="mt-3 max-w-2xl font-['Satoshi'] text-base text-neutral-600 md:text-lg">
                Built around your degree, skills, and target role — not a generic checklist.
              </motion.p>
              <motion.div variants={itemVariants} className="mt-12 grid gap-6 md:grid-cols-3">
                {WHAT_YOU_GET.map((c) => (
                  <div
                    key={c.label}
                    className="flex h-full flex-col rounded-2xl border-2 border-neutral-900 bg-white p-7 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-neutral-900 ${c.iconBg} text-xl ${c.iconColor} shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]`}>
                      {c.icon}
                    </div>
                    <p className="mt-5 font-['Satoshi'] text-xs font-bold uppercase tracking-wider text-neutral-500">
                      {c.label}
                    </p>
                    <h3 className="mt-1 font-['Clash_Display'] text-xl font-medium leading-snug text-neutral-900">
                      {c.title}
                    </h3>
                    <ul className="mt-5 space-y-2.5">
                      {c.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 font-['Satoshi'] text-sm leading-6 text-neutral-700"
                        >
                          <span className={`mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${c.accent}`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/cc/chat"
                      className="mt-auto inline-flex items-center gap-1.5 pt-6 font-['Satoshi'] text-sm font-semibold text-violet-600 hover:text-violet-800"
                    >
                      {c.cta} <FiArrowRight />
                    </Link>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Section>
        </section>

        {/* Quotes */}
        <section className="border-b border-neutral-900 bg-white py-16 md:py-24">
          <Section>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={containerVariants}
            >
              <motion.p variants={itemVariants} className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-600">
                What students say
              </motion.p>
              <motion.h2 variants={itemVariants} className="font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900 md:text-4xl lg:text-5xl">
                Real feedback from real profiles.
              </motion.h2>
              <motion.div variants={itemVariants} className="mt-12 grid gap-6 md:grid-cols-3">
                {QUOTES.map((q) => (
                  <div
                    key={q.name}
                    className="rounded-2xl border-2 border-neutral-900 bg-white p-7 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                  >
                    <p className="font-['Satoshi'] text-base italic leading-7 text-neutral-700">
                      "{q.text}"
                    </p>
                    <div className="mt-5 border-t border-neutral-200 pt-4">
                      <p className="font-['Satoshi'] text-sm font-bold text-neutral-900">
                        {q.name}
                      </p>
                      <p className="mt-0.5 font-['Satoshi'] text-xs text-neutral-500">
                        {q.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Section>
        </section>

        {/* CTA banner */}
        <section className="border-b border-neutral-900 bg-violet-600 py-16 md:py-24">
          <Section width="narrow" className="mx-auto text-center">
            <h2 className="font-['Clash_Display'] text-3xl font-medium leading-tight text-white md:text-5xl lg:text-6xl">
              Know exactly{" "}
              <span className="text-yellow-300">where you stand.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-['Satoshi'] text-lg text-violet-100">
              Takes 8 minutes. Built around your real profile, not a quiz.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/cc/chat"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-8 font-['Satoshi'] text-base font-medium text-violet-600 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                Get my Career DNA <FiArrowRight />
              </Link>
            </div>
          </Section>
        </section>
      </main>
      <Footer />
    </>
  );
}
