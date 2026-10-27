import { motion, type Variants } from "framer-motion";
import { Link } from "react-router";
import { FiTarget, FiArrowRight, FiGlobe } from "react-icons/fi";
import { IoBriefcaseOutline } from "react-icons/io5";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import type { Route } from "./+types/about";
import { useSiteB2c } from "~/components/site-b2c/host";
import { AboutB2C } from "~/components/site-b2c/pages/AboutB2C";

export function meta({}: Route.MetaArgs) {
  const BASE_URL = "https://studojo.com";
  return [
    { title: "About Studojo | Work on Things That Matter" },
    {
      name: "description",
      content: "Studojo is a job agent for students: Stu finds jobs and internships that fit you, tailors your resume and reaches the right people, so you can work on things that actually matter. Based in Bangalore, serving students worldwide.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/about` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "About Studojo | Work on Things That Matter" },
    { property: "og:description", content: "Studojo is a job agent for students: Stu finds jobs and internships that fit you, tailors your resume and reaches the right people, so you can work on things that actually matter." },
    { property: "og:url", content: `${BASE_URL}/about` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "About Studojo | Work on Things That Matter" },
    { name: "twitter:description", content: "A job agent for students: Stu finds jobs and internships that fit you, tailors your resume and reaches the right people." },
  ];
}

// Content must not depend on an animation firing. These variants used to start
// at opacity 0 and wait for whileInView, so a normal scroll showed blank slabs
// and any full-page capture (social preview, screenshot) got an empty page. They
// now start VISIBLE and animate from a small offset: the page reads with no JS,
// and the motion is a bonus rather than a gate.
const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 1, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// PRODUCT-ALIGN (27 Oct 2026, staging only): Studojo is one product, Stu the job agent; these are its parts. /b2cnew is
// another app, so the cards load it with a full page load.
const PARTS = [
  {
    title: "Finds your roles",
    description: "Stu reads company career sites and job boards and puts the jobs and internships that fit you first.",
    checklist: ["Roles that fit you, best first", "Jobs and internships", "New roles every day"],
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-200",
    iconColor: "text-emerald-500",
    ctaColor: "text-emerald-600",
    icon: <FiGlobe />,
    href: "/b2cnew/join?via=about&how=voice",
    cta: "Start with Stu",
    comingSoon: false,
  },
  {
    title: "Tailors your applications",
    description: "Upload your resume once. Stu makes it stronger and tailors your resume and cover letter to each job.",
    checklist: ["A resume version for each job", "Cover letters", "Answers to form questions"],
    accent: "bg-amber-500",
    iconBg: "bg-amber-200",
    iconColor: "text-amber-500",
    ctaColor: "text-amber-600",
    icon: <IoBriefcaseOutline />,
    href: "/b2cnew/join?via=about&how=voice",
    cta: "Start with Stu",
    comingSoon: false,
  },
  {
    title: "Reaches the right person",
    description: "Stu finds the hiring manager or recruiter and drafts the email. It goes from your own mailbox, only when you press Send.",
    checklist: ["The right person to write to", "Emails from your own mailbox", "You approve everything"],
    accent: "bg-rose-500",
    iconBg: "bg-rose-200",
    iconColor: "text-rose-500",
    ctaColor: "text-rose-600",
    icon: <FiTarget />,
    href: "/b2cnew/join?via=about&how=voice",
    cta: "Start with Stu",
    comingSoon: false,
  },
];

const PRINCIPLES = [
  {
    number: "01",
    heading: "No tutorials.",
    body: "Tell Stu what you want in a short call or a few lines, and it gets to work. No onboarding courses. No unnecessary steps.",
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
  // SITE-V2: B2C hosts get the h1 look (site-b2c/pages/AboutB2C.tsx) with the same copy and lists.
  const b2c = useSiteB2c();
  if (b2c) return <AboutB2C parts={PARTS} principles={PRINCIPLES} markets={MARKETS} />;
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative w-full overflow-hidden border-b border-neutral-900 bg-violet-500 py-12 md:py-16">
          <motion.div
            className="w-full"
            initial={{ opacity: 1, y: 10 }}
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
                Studojo is a job agent for students. Stu cuts through the noise so ambitious students can spend their time on work that genuinely moves the needle.
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
                  We flipped that. Stu, our job agent, finds the roles that fit you, tailors your resume to each one, and drafts the email to the right person that you send from your own mailbox.
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

        {/* Stu, the job agent */}
        <section className="border-b border-neutral-900 bg-white py-16 md:py-24">
          <Section width="default">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="mb-12 text-center">
                <p className="mb-3 font-['Satoshi'] text-sm font-semibold uppercase tracking-widest text-violet-600">The product</p>
                <h2 className="font-['Clash_Display'] text-3xl font-medium text-neutral-900 md:text-4xl lg:text-5xl">
                  One agent for the whole job hunt.{" "}
                  <span className="inline-flex rounded-2xl border-2 border-neutral-900 bg-emerald-300 px-3 py-1">
                    No bloat.
                  </span>
                </h2>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2">
                {PARTS.map((d) => (
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
                        reloadDocument
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
              initial={{ opacity: 1, scale: 0.95 }}
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
              initial={{ opacity: 1, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 font-['Clash_Display'] text-3xl font-medium text-white md:text-4xl lg:text-5xl">
                Ready to get started?
              </h2>
              <p className="mb-8 font-['Satoshi'] text-lg text-violet-100">
                Stu is ready when you are.
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
