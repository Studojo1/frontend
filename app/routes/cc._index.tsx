import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { FiTarget, FiTrendingUp, FiCalendar, FiArrowRight } from "react-icons/fi";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import { authClient } from "~/lib/auth-client";

// For a returning, logged-in student who already has a Career DNA, show their
// progress + a "continue" action ON the coach page (not a homepage banner).
// New/logged-out users see nothing here. Uses the same-origin summary proxy.
function ReturningStudentProgress() {
  const { data: auth } = authClient.useSession();
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => {
    if (!auth?.user) return;
    fetch("/api/career-coach/summary")
      .then((r) => r.json())
      .then((d) => setSummary(d))
      .catch(() => setSummary(null));
  }, [auth?.user]);

  if (!auth?.user || !summary?.found || !summary?.has_analysis) return null;
  return (
    <section className="px-4 py-6 md:px-8" style={{ backgroundColor: PAGE_BG }}>
      <div className="mx-auto max-w-3xl rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-full border-2 border-violet-500 bg-violet-100">
            <span className="font-['Clash_Display'] text-xl font-black leading-none text-violet-700">{summary.readiness_score ?? 0}</span>
            <span className="font-['Satoshi'] text-[9px] text-violet-500">/100</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-['Clash_Display'] text-lg font-bold text-neutral-900">Welcome back</span>
              {summary.level_label && (
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                  Level {summary.level} · {summary.level_label}
                </span>
              )}
            </div>
            {summary.next_action && (
              <p className="mt-1 font-['Satoshi'] text-sm text-neutral-600">
                <span className="font-semibold text-neutral-800">Next step:</span> {summary.next_action}
              </p>
            )}
          </div>
          <Link
            to={summary.chat_url || "/cc/chat"}
            className="inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-500 px-6 font-['Satoshi'] text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
          >
            Continue with your Career Coach <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function meta() {
  return [
    { title: "Career Coach | Studojo" },
    {
      name: "description",
      content:
        "See exactly how much better you are than the typical fresher chasing your role. Climb three levels (Industry-Ready, Well-Rounded, Standout) with a weekly action plan built around your profile.",
    },
  ];
}

export function links() {
  return [{ rel: "stylesheet", href: "data:text/css,body{background:%23130D24}" }];
}

/* ─── accent palette ─────────────────────────────────────────────────────────
   Purple  #7C3AED / #A78BFA  → navigation, steps, identity
   Teal    #0D9488 / #2DD4BF  → growth, analysis, Career DNA
   Gold    #B45309 / #FCD34D  → action, plans, roadmap
   Base    #130D24             → page ground
   Glass   rgba(255,255,255,0.04) + border rgba(255,255,255,0.08)
────────────────────────────────────────────────────────────────────────────── */

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Tell the coach about yourself",
    desc: "No forms. Just a conversation. The AI asks about your degree, skills, experience, and what you're going after, and listens. The more you talk to it, the sharper it gets.",
    accent: "#A78BFA",
    border: "rgba(167,139,250,0.2)",
  },
  {
    num: "02",
    title: "Get your Career DNA",
    desc: "You see exactly how much better you are than the typical fresher chasing your role in your industry, the specific gaps holding that number back, and your current level on the 3-step ladder.",
    accent: "#2DD4BF",
    border: "rgba(45,212,191,0.2)",
  },
  {
    num: "03",
    title: "Climb the three levels",
    desc: "Show up daily, log your weekly progress, and watch your standing climb. Six weeks of consistent follow-through promotes you to the next level: Industry-Ready → Well-Rounded → Standout.",
    accent: "#FCD34D",
    border: "rgba(252,211,77,0.2)",
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
    accent: "#2DD4BF",
    border: "rgba(45,212,191,0.2)",
    iconBg: "rgba(45,212,191,0.1)",
    iconColor: "#2DD4BF",
    dotColor: "#2DD4BF",
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
    accent: "#A78BFA",
    border: "rgba(167,139,250,0.2)",
    iconBg: "rgba(167,139,250,0.1)",
    iconColor: "#A78BFA",
    dotColor: "#A78BFA",
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
    accent: "#FCD34D",
    border: "rgba(252,211,77,0.2)",
    iconBg: "rgba(252,211,77,0.08)",
    iconColor: "#FCD34D",
    dotColor: "#FCD34D",
    icon: <FiCalendar />,
  },
];

const QUOTES = [
  {
    text: "I had no idea what was actually stopping me from getting replies. Seeing exactly where I stood vs other CS freshers, and the one skill that was dragging it down, told me what to build first. Got an interview at Razorpay two weeks later.",
    name: "Arjun S.",
    detail: "B.Tech CS, SRM, targeting Product",
    accent: "#A78BFA",
  },
  {
    text: "Every career counsellor I talked to gave me the same generic advice. This actually read my profile and told me the specific gap I needed to close.",
    name: "Priya M.",
    detail: "BCom, Mumbai, Finance track",
    accent: "#2DD4BF",
  },
  {
    text: "I was applying to everything and getting nothing. The coach told me I was going too broad. Narrowed my target, updated my approach, got three replies in 10 days.",
    name: "Rahul K.",
    detail: "MBA, non-IIM, Consulting pivot",
    accent: "#FCD34D",
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

const PAGE_BG = "#130D24";
const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export default function CcIndex() {
  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ backgroundColor: PAGE_BG }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="relative w-full overflow-hidden"
          style={{
            backgroundColor: PAGE_BG,
            borderBottom: `1px solid ${GLASS_BORDER}`,
          }}
        >
          <div className="hero-aspect relative w-full" style={{ paddingBottom: "177.78%" }}>
            <img
              src="/cc-hero-mobile.png"
              alt="Bobie the career coach in front of the Studojo dojo gate"
              className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
              loading="eager"
            />
            <img
              src="/cc-hero.png"
              alt="Bobie the career coach in front of the Studojo dojo gate"
              className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
              loading="eager"
            />

            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/50 to-transparent" />

            {/* Hero title */}
            <motion.h1
              className="absolute inset-x-0 top-[14%] z-10 px-4 text-center font-['Clash_Display'] text-4xl font-semibold leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-5xl md:top-[16%] md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Your Career Coach
            </motion.h1>

            {/* How it works pill — purple accent */}
            <motion.div
              className="absolute left-4 top-4 md:left-8 md:top-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-['Satoshi'] text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                style={{
                  border: "1px solid rgba(167,139,250,0.4)",
                  background: "rgba(124,58,237,0.15)",
                  color: "#A78BFA",
                }}
              >
                How it works
                <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10m0 0L3 8m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </motion.div>

            {/* CTA — gold action accent */}
            <motion.div
              className="absolute bottom-[30%] right-0 flex flex-col items-end pr-4 md:pr-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="mb-4 text-right font-['Satoshi'] text-sm font-medium tracking-wide text-white/70">
                Takes 8 minutes. Gets sharper the more you talk to it.
              </p>
              <Link
                to="/cc/chat?new=1"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-10 font-['Satoshi'] text-base font-bold transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
                  color: "#1a0a2e",
                }}
              >
                Get my Career DNA <FiArrowRight />
              </Link>
            </motion.div>
          </div>
          <style>{`@media(min-width:768px){.hero-aspect{padding-bottom:56.25%!important}}`}</style>
        </section>

        {/* Returning logged-in students see their progress here (not a banner) */}
        <ReturningStudentProgress />


        {/* ── How it works ─────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="py-16 md:py-24"
          style={{
            backgroundColor: PAGE_BG,
            borderBottom: `1px solid ${GLASS_BORDER}`,
          }}
        >
          <Section>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={containerVariants}
            >
              <motion.p
                variants={itemVariants}
                className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest"
                style={{ color: "#A78BFA" }}
              >
                How it works
              </motion.p>
              <motion.h2
                variants={itemVariants}
                className="font-['Clash_Display'] text-3xl font-medium leading-tight text-white md:text-4xl lg:text-5xl"
              >
                Three steps. Your roadmap is ready.
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="mt-3 max-w-2xl font-['Satoshi'] text-base md:text-lg"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                No forms, no uploads. Just a conversation that builds your complete career picture.
              </motion.p>
              <motion.div variants={itemVariants} className="mt-12 grid gap-6 md:grid-cols-3">
                {HOW_IT_WORKS.map((s) => (
                  <div
                    key={s.num}
                    className="rounded-2xl p-7 transition-all duration-300 hover:brightness-110"
                    style={{
                      background: GLASS_BG,
                      border: `1px solid ${s.border}`,
                      borderTop: `2px solid ${s.accent}`,
                    }}
                  >
                    <div
                      className="font-['Clash_Display'] text-5xl font-medium leading-none"
                      style={{ color: s.accent, opacity: 0.25 }}
                    >
                      {s.num}
                    </div>
                    <h3
                      className="mt-3 font-['Satoshi'] text-lg font-bold"
                      style={{ color: s.accent }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="mt-2 font-['Satoshi'] text-sm leading-6"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {s.desc}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Section>
        </section>

        {/* ── What you get ─────────────────────────────────────────────── */}
        <section
          className="py-16 md:py-24"
          style={{
            backgroundColor: "#0e0820",
            borderBottom: `1px solid ${GLASS_BORDER}`,
          }}
        >
          <Section>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={containerVariants}
            >
              <motion.p
                variants={itemVariants}
                className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest"
                style={{ color: "#2DD4BF" }}
              >
                What you get
              </motion.p>
              <motion.h2
                variants={itemVariants}
                className="font-['Clash_Display'] text-3xl font-medium leading-tight text-white md:text-4xl lg:text-5xl"
              >
                Everything in one session.
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="mt-3 max-w-2xl font-['Satoshi'] text-base md:text-lg"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Built around your degree, skills, and target role. Not a generic checklist.
              </motion.p>
              <motion.div variants={itemVariants} className="mt-12 grid gap-6 md:grid-cols-3">
                {WHAT_YOU_GET.map((c) => (
                  <div
                    key={c.label}
                    className="flex h-full flex-col rounded-2xl p-7 transition-all duration-300 hover:brightness-110"
                    style={{
                      background: GLASS_BG,
                      border: `1px solid ${c.border}`,
                      borderTop: `2px solid ${c.accent}`,
                    }}
                  >
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                      style={{
                        background: c.iconBg,
                        border: `1px solid ${c.border}`,
                        color: c.iconColor,
                      }}
                    >
                      {c.icon}
                    </div>
                    <p
                      className="mt-5 font-['Satoshi'] text-xs font-bold uppercase tracking-wider"
                      style={{ color: c.accent, opacity: 0.7 }}
                    >
                      {c.label}
                    </p>
                    <h3
                      className="mt-1 font-['Clash_Display'] text-xl font-medium leading-snug text-white"
                    >
                      {c.title}
                    </h3>
                    <ul className="mt-5 space-y-2.5">
                      {c.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 font-['Satoshi'] text-sm leading-6"
                          style={{ color: "rgba(255,255,255,0.65)" }}
                        >
                          <span
                            className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: c.dotColor }}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/cc/chat?new=1"
                      className="mt-auto inline-flex items-center gap-1.5 pt-6 font-['Satoshi'] text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ color: c.accent }}
                    >
                      {c.cta} <FiArrowRight />
                    </Link>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Section>
        </section>

        {/* ── Quotes ───────────────────────────────────────────────────── */}
        <section
          className="py-16 md:py-24"
          style={{
            backgroundColor: PAGE_BG,
            borderBottom: `1px solid ${GLASS_BORDER}`,
          }}
        >
          <Section>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={containerVariants}
            >
              <motion.p
                variants={itemVariants}
                className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest"
                style={{ color: "#A78BFA" }}
              >
                What students say
              </motion.p>
              <motion.h2
                variants={itemVariants}
                className="font-['Clash_Display'] text-3xl font-medium leading-tight text-white md:text-4xl lg:text-5xl"
              >
                Real feedback from real profiles.
              </motion.h2>
              <motion.div variants={itemVariants} className="mt-12 grid gap-6 md:grid-cols-3">
                {QUOTES.map((q) => (
                  <div
                    key={q.name}
                    className="rounded-2xl p-7 transition-all duration-300 hover:brightness-110"
                    style={{
                      background: GLASS_BG,
                      border: `1px solid rgba(255,255,255,0.07)`,
                      borderTop: `2px solid ${q.accent}`,
                    }}
                  >
                    <p
                      className="font-['Satoshi'] text-base italic leading-7"
                      style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      "{q.text}"
                    </p>
                    <div
                      className="mt-5 pt-4"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <p className="font-['Satoshi'] text-sm font-bold text-white">
                        {q.name}
                      </p>
                      <p
                        className="mt-0.5 font-['Satoshi'] text-xs"
                        style={{ color: q.accent, opacity: 0.7 }}
                      >
                        {q.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Section>
        </section>

        {/* ── CTA banner ───────────────────────────────────────────────── */}
        <section
          className="py-16 md:py-24"
          style={{
            background: "linear-gradient(160deg, #1a0a3e 0%, #130D24 50%, #0a1a2e 100%)",
            borderBottom: `1px solid ${GLASS_BORDER}`,
          }}
        >
          <Section width="narrow" className="mx-auto text-center">
            <h2 className="font-['Clash_Display'] text-3xl font-medium leading-tight text-white md:text-5xl lg:text-6xl">
              Know exactly{" "}
              <span style={{ color: "#FCD34D" }}>where you stand.</span>
            </h2>
            <p
              className="relative mx-auto mt-5 max-w-xl font-['Satoshi'] text-lg"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Takes 8 minutes. Built around your real profile, not a quiz.
            </p>
            <div className="relative mt-10 flex justify-center">
              <Link
                to="/cc/chat?new=1"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-8 font-['Satoshi'] text-base font-bold transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
                  color: "#130D24",
                }}
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
