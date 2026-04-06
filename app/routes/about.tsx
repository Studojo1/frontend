import { motion } from "framer-motion";
import { Link } from "react-router";
import { FiBookOpen, FiZap, FiTarget, FiUsers, FiArrowRight, FiGlobe } from "react-icons/fi";
import { IoBriefcaseOutline } from "react-icons/io5";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  const BASE_URL = "https://studojo.com";
  return [
    { title: "About Studojo – Work on Things That Matter" },
    {
      name: "description",
      content: "Studojo is a global student career platform helping 10,000+ students land internships, build standout resumes, and work on things that actually matter. Based in Bangalore, serving students worldwide.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/about` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "About Studojo – Work on Things That Matter" },
    { property: "og:description", content: "Studojo is a global student career platform helping 10,000+ students land internships, build standout resumes, and work on things that actually matter." },
    { property: "og:url", content: `${BASE_URL}/about` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "About Studojo – Work on Things That Matter" },
    { name: "twitter:description", content: "Global student career platform helping 10,000+ students land internships, build standout resumes, and work on things that actually matter." },
  ];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const DOJOS = [
  {
    title: "Assignment Dojo",
    description: "AI-powered assignment help. Plagiarism-safe, formatted, properly referenced. Built for students who need something done right, not just done.",
    checklist: ["Plagiarism-safe content", "Properly formatted", "References included"],
    accent: "bg-violet-500",
    iconBg: "bg-violet-200",
    iconColor: "text-violet-500",
    ctaColor: "text-violet-600",
    icon: <FiBookOpen />,
    href: "/dojos/assignment",
    cta: "Try it now",
    comingSoon: false,
  },
  {
    title: "Internship Dojo",
    description: "Global internship discovery, ATS resume builder, AI-powered outreach to hiring managers and founders, application tracking. The full pipeline from zero to interview.",
    checklist: ["AI finds the right roles", "Outreach to real humans", "Full application tracking"],
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-200",
    iconColor: "text-emerald-500",
    ctaColor: "text-emerald-600",
    icon: <FiGlobe />,
    href: "/outreach",
    cta: "Get started",
    comingSoon: false,
  },
  {
    title: "Careers Dojo",
    description: "ATS-optimized resume builder. Professional-grade, 100% free. No paywalls on the thing every student needs most.",
    checklist: ["ATS optimized", "Professional design", "100% free forever"],
    accent: "bg-amber-500",
    iconBg: "bg-amber-200",
    iconColor: "text-amber-500",
    ctaColor: "text-amber-600",
    icon: <IoBriefcaseOutline />,
    href: "/dojos/careers",
    cta: "Build resume",
    comingSoon: false,
  },
  {
    title: "Revision Dojo",
    description: "Custom study notes, practice questions, flashcards, and mind maps. Everything you need to actually retain what you learn.",
    checklist: ["Custom study notes", "Practice questions", "Flashcards and mind maps"],
    accent: "bg-rose-500",
    iconBg: "bg-rose-200",
    iconColor: "text-rose-500",
    ctaColor: "text-rose-600",
    icon: <FiTarget />,
    href: "#",
    cta: "Coming soon",
    comingSoon: true,
  },
];

const PRINCIPLES = [
  {
    number: "01",
    heading: "No tutorials.",
    body: "Pick what you need, answer 2-3 questions, get something ready to use. That's the whole experience. No onboarding courses. No unnecessary steps.",
    bg: "bg-violet-500",
  },
  {
    number: "02",
    heading: "Built for students, not employers.",
    body: "Most career tools are designed to help companies filter applicants. We flipped that. Every feature exists to help you stand out, not to make someone else's job easier.",
    bg: "bg-emerald-500",
  },
  {
    number: "03",
    heading: "We editorialize.",
    body: "A role at a climate startup is different from a role at a bank. We'll tell you which one might actually teach you something. We don't just surface data. We have opinions.",
    bg: "bg-amber-500",
  },
];

const MARKETS = [
  { flag: "🇮🇳", name: "India", detail: "DU, IIMs, IITs, NITs, BITS, Symbiosis, Christ, Manipal, and a strong tier-2 and tier-3 college base." },
  { flag: "🇺🇸", name: "United States", detail: "Large state schools and private universities. Students navigating one of the most competitive internship markets in the world." },
  { flag: "🇬🇧", name: "United Kingdom", detail: "Russell Group and post-92 universities. Students looking at structured programmes and graduate schemes." },
  { flag: "🇦🇪", name: "Dubai and UAE", detail: "Expat and local university students. LinkedIn-heavy market with strong direct founder hiring." },
  { flag: "🇸🇬", name: "Singapore", detail: "NUS, NTU, and SMU students. Highly competitive, internationally focused, strong MNC and startup scene." },
];

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function About() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative w-full overflow-hidden border-b border-neutral-900 bg-violet-500 py-12 md:py-16">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Section width="narrow" className="mx-auto text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/20 px-4 py-2">
                <span className="font-['Satoshi'] text-sm font-medium text-white">Bengaluru, India. Serving students globally.</span>
              </div>
              <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight text-white md:text-6xl lg:text-7xl">
                Built for students<br />
                <span className="text-yellow-300">who mean business.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl font-['Satoshi'] text-lg font-normal leading-7 text-violet-100 md:text-xl">
                Studojo is a global student career platform. We build tools that cut through the noise so ambitious students can spend their time on work that genuinely moves the needle.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-8 font-['Satoshi'] text-base font-medium text-violet-600 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  Explore Studojo
                  <FiArrowRight />
                </Link>
              </div>
            </Section>
          </motion.div>
        </section>

        {/* Our Story */}
        <section className="border-b border-neutral-900 bg-white py-16 md:py-24">
          <Section width="default">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-12 md:grid-cols-2 md:items-center"
            >
              <motion.div variants={itemVariants}>
                <p className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-600">Our story</p>
                <h2 className="font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900 md:text-4xl lg:text-5xl">
                  Most career tools are built for employers.
                  <br />
                  <span className="text-violet-500">We built ours for you.</span>
                </h2>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-6">
                <p className="font-['Satoshi'] text-base leading-7 text-neutral-700 md:text-lg">
                  Studojo started with a simple observation: students were spending hours on job boards and finding nothing. Writing generic cover letters nobody read. Applying into silence.
                </p>
                <p className="font-['Satoshi'] text-base leading-7 text-neutral-700 md:text-lg">
                  The tools that existed were either built to help recruiters filter applicants, or built to extract money from students in exchange for marginal improvements.
                </p>
                <p className="font-['Satoshi'] text-base leading-7 text-neutral-700 md:text-lg">
                  We flipped that. Research-grade tools, AI that understands your context, and outreach infrastructure that was previously only available to paid recruiters.
                </p>
              </motion.div>
            </motion.div>
          </Section>
        </section>

        {/* How We Think - Principles */}
        <section className="border-b border-neutral-900 bg-violet-600 py-16 md:py-24">
          <Section width="default">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="mb-12 text-center">
                <p className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-200">How we think</p>
                <h2 className="font-['Clash_Display'] text-3xl font-medium text-white md:text-4xl lg:text-5xl">
                  Three things we never compromise on.
                </h2>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-3">
                {PRINCIPLES.map((p) => (
                  <motion.div
                    key={p.number}
                    variants={itemVariants}
                    className={`flex flex-col gap-4 rounded-[32px] border-2 border-neutral-900 p-8 shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] ${p.bg}`}
                  >
                    <span className="font-['Clash_Display'] text-5xl font-medium text-white/30">{p.number}</span>
                    <h3 className="font-['Clash_Display'] text-2xl font-medium text-white">{p.heading}</h3>
                    <p className="font-['Satoshi'] text-base leading-6 text-white/80">{p.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Section>
        </section>

        {/* The Dojos */}
        <section className="border-b border-neutral-900 bg-white py-16 md:py-24">
          <Section width="default">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="mb-12 text-center">
                <p className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-600">The products</p>
                <h2 className="font-['Clash_Display'] text-3xl font-medium text-neutral-900 md:text-4xl lg:text-5xl">
                  Each Dojo does one thing.{" "}
                  <span className="inline-flex rounded-2xl border-2 border-neutral-900 bg-emerald-300 px-3 py-1">
                    No bloat.
                  </span>
                </h2>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2">
                {DOJOS.map((d) => (
                  <motion.article
                    key={d.title}
                    variants={itemVariants}
                    className={`flex flex-col gap-5 rounded-[32px] border-2 border-neutral-900 p-8 shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] md:rounded-[45px] ${d.accent}`}
                  >
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white`}>
                      <span className={`text-2xl ${d.iconColor}`}>{d.icon}</span>
                    </div>
                    <h3 className="font-['Clash_Display'] text-2xl font-medium text-white md:text-3xl">{d.title}</h3>
                    <p className="font-['Satoshi'] text-base leading-6 text-white/90 md:text-lg">{d.description}</p>
                    <ul className="flex flex-col gap-2">
                      {d.checklist.map((item) => (
                        <li key={item} className="flex items-center gap-2 font-['Satoshi'] text-sm font-medium text-white md:text-base">
                          <span className="text-white"><CheckIcon /></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    {d.comingSoon ? (
                      <div className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white/80 px-8 py-3 font-['Satoshi'] text-base font-medium opacity-75 md:w-fit ${d.ctaColor}`}>
                        {d.cta}
                      </div>
                    ) : (
                      <Link
                        to={d.href}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-8 py-3 font-['Satoshi'] text-base font-medium transition-transform hover:translate-x-[2px] hover:translate-y-[2px] md:w-fit ${d.ctaColor}`}
                      >
                        {d.cta}
                        <FiArrowRight />
                      </Link>
                    )}
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </Section>
        </section>

        {/* Who We Serve */}
        <section className="border-b border-neutral-900 bg-purple-50 py-16 md:py-24">
          <Section width="default">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="mb-12 text-center">
                <p className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-600">Who we serve</p>
                <h2 className="font-['Clash_Display'] text-3xl font-medium text-neutral-900 md:text-4xl lg:text-5xl">
                  Ambitious students.<br />5 markets. One standard.
                </h2>
                <p className="mx-auto mt-4 max-w-xl font-['Satoshi'] text-base leading-7 text-neutral-600 md:text-lg">
                  Undergrad and postgrad students, 18-25, who are serious about building real careers. Not passive job seekers.
                </p>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MARKETS.map((m, i) => (
                  <motion.div
                    key={m.name}
                    variants={itemVariants}
                    className={`rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-3xl">{m.flag}</span>
                      <h3 className="font-['Clash_Display'] text-xl font-medium text-neutral-900">{m.name}</h3>
                    </div>
                    <p className="font-['Satoshi'] text-sm leading-6 text-neutral-600">{m.detail}</p>
                  </motion.div>
                ))}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-400 bg-white/60 p-6"
                >
                  <FiGlobe className="shrink-0 text-2xl text-neutral-400" />
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-500">
                    And wherever ambitious students are trying to build real careers.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </Section>
        </section>

        {/* Tagline section */}
        <section className="border-b border-neutral-900 bg-neutral-900 py-16 md:py-24">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center md:px-8">
            <motion.div
              className="w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <p className="mb-6 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-400">Our north star</p>
              <p className="font-['Clash_Display'] text-5xl font-medium leading-tight text-white md:text-7xl lg:text-8xl">
                Work on things<br />
                <span className="text-yellow-300">that matter.</span>
              </p>
              <p className="mx-auto mt-8 max-w-2xl font-['Satoshi'] text-base leading-7 text-neutral-400 md:text-lg">
                This is not motivational fluff. It is a filter. Is this role going to teach you something real? Will this experience make a difference to someone? Will you be proud of what you worked on? That is the standard we hold our products to. We think students should hold their opportunities to it too.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-violet-500 py-16 md:py-24">
          <Section width="narrow" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 font-['Clash_Display'] text-3xl font-medium text-white md:text-4xl lg:text-5xl">
                Ready to get started?
              </h2>
              <p className="mb-8 font-['Satoshi'] text-lg text-violet-100">
                10,000+ students already have.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-8 font-['Satoshi'] text-base font-medium text-violet-600 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  Explore Studojo
                  <FiArrowRight />
                </Link>
                <a
                  href="mailto:admin@studojo.com"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-white/50 bg-transparent px-8 font-['Satoshi'] text-base font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Get in touch
                </a>
              </div>
            </motion.div>
          </Section>
        </section>

      </main>
      <Footer />
    </>
  );
}
