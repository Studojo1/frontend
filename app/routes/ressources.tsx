import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router";
import { FiArrowRight, FiPlayCircle, FiCalendar, FiClock, FiVideo } from "react-icons/fi";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Webinar Resources | Studojo" },
    {
      name: "description",
      content:
        "Every Studojo webinar in one place. Live sessions, recordings, and playbooks on landing internships, writing resumes that get read, and reaching real hiring managers.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/ressources` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Webinar Resources | Studojo" },
    {
      property: "og:description",
      content:
        "Every Studojo webinar in one place. Live sessions, recordings, and playbooks for ambitious students.",
    },
    { property: "og:url", content: `${BASE_URL}/ressources` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Webinar Resources | Studojo" },
    {
      name: "twitter:description",
      content: "Live sessions, recordings, and playbooks for ambitious students.",
    },
  ];
}

// ── Resource list ────────────────────────────────────────────────────────────
// Add new webinars here. Newest first. `status` drives the card style:
//   "live"      = upcoming / registration open  → violet
//   "recording" = watch the replay              → emerald
//   "soon"      = announced, not scheduled yet   → amber (no link)
type Resource = {
  title: string;
  description: string;
  status: "live" | "recording" | "soon";
  date?: string;
  duration?: string;
  href?: string;
  cta?: string;
};

const RESOURCES: Resource[] = [
  {
    title: "How to actually land an internship in 2026",
    description:
      "The full pipeline, start to finish. Finding roles worth your time, a resume that gets read, and reaching the humans who make the call.",
    status: "live",
    date: "Live session",
    duration: "45 min",
    href: "/webinar",
    cta: "Register free",
  },
];

const STATUS_STYLES: Record<
  Resource["status"],
  { badge: string; badgeText: string; icon: ReactNode; accent: string; label: string }
> = {
  live: {
    badge: "bg-violet-100 border-violet-500",
    badgeText: "text-violet-700",
    icon: <FiVideo className="h-4 w-4" />,
    accent: "text-violet-600",
    label: "Live",
  },
  recording: {
    badge: "bg-emerald-100 border-emerald-500",
    badgeText: "text-emerald-700",
    icon: <FiPlayCircle className="h-4 w-4" />,
    accent: "text-emerald-600",
    label: "Recording",
  },
  soon: {
    badge: "bg-amber-100 border-amber-500",
    badgeText: "text-amber-700",
    icon: <FiClock className="h-4 w-4" />,
    accent: "text-amber-600",
    label: "Coming soon",
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function ResourceCard({ r }: { r: Resource }) {
  const s = STATUS_STYLES[r.status];
  const inner = (
    <div className="flex h-full flex-col rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
      <div
        className={`mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border-2 px-3 py-1 ${s.badge}`}
      >
        <span className={s.badgeText}>{s.icon}</span>
        <span className={`font-['Satoshi'] text-xs font-semibold ${s.badgeText}`}>{s.label}</span>
      </div>

      <h3 className="font-['Clash_Display'] text-xl font-medium leading-snug text-neutral-900">
        {r.title}
      </h3>
      <p className="mt-3 flex-1 font-['Satoshi'] text-base leading-7 text-neutral-600">
        {r.description}
      </p>

      <div className="mt-5 flex items-center gap-4 font-['Satoshi'] text-sm text-neutral-500">
        {r.date && (
          <span className="inline-flex items-center gap-1.5">
            <FiCalendar className="h-4 w-4" />
            {r.date}
          </span>
        )}
        {r.duration && (
          <span className="inline-flex items-center gap-1.5">
            <FiClock className="h-4 w-4" />
            {r.duration}
          </span>
        )}
      </div>

      {r.href ? (
        <span
          className={`mt-6 inline-flex items-center gap-2 font-['Satoshi'] text-base font-semibold ${s.accent}`}
        >
          {r.cta || "Watch now"}
          <FiArrowRight />
        </span>
      ) : (
        <span className="mt-6 font-['Satoshi'] text-base font-medium text-neutral-400">
          We will announce the date soon.
        </span>
      )}
    </div>
  );

  return (
    <motion.div variants={itemVariants} className="h-full">
      {r.href ? (
        <Link to={r.href} className="block h-full">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </motion.div>
  );
}

export default function Ressources() {
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
                <span className="font-['Satoshi'] text-sm font-medium text-white">
                  Free, forever. No fluff.
                </span>
              </div>
              <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight text-white md:text-6xl lg:text-7xl">
                Webinar<br />
                <span className="text-yellow-300">resources.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl font-['Satoshi'] text-lg font-normal leading-7 text-violet-100 md:text-xl">
                Every Studojo webinar in one place. Live sessions, recordings, and playbooks on landing
                internships, writing resumes that get read, and reaching real hiring managers.
              </p>
            </Section>
          </motion.div>
        </section>

        {/* Resource grid */}
        <section className="border-b border-neutral-900 bg-white py-16 md:py-24">
          <Section width="wide">
            {RESOURCES.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {RESOURCES.map((r) => (
                  <ResourceCard key={r.title} r={r} />
                ))}
              </motion.div>
            ) : (
              <div className="mx-auto max-w-xl rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
                <h3 className="font-['Clash_Display'] text-2xl font-medium text-neutral-900">
                  First webinar drops soon.
                </h3>
                <p className="mt-3 font-['Satoshi'] text-base text-neutral-600">
                  We are recording the good stuff. Check back here, or register for the next live session.
                </p>
                <Link
                  to="/webinar"
                  className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-violet-500 px-6 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                >
                  Register for the next one
                  <FiArrowRight />
                </Link>
              </div>
            )}
          </Section>
        </section>

        {/* CTA banner */}
        <section className="bg-neutral-900 py-16 md:py-20">
          <Section width="narrow" className="text-center">
            <h2 className="font-['Clash_Display'] text-3xl font-medium leading-tight text-white md:text-4xl">
              Want the next one in your inbox?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-['Satoshi'] text-lg leading-7 text-neutral-300">
              Register once and we will tell you when a new webinar goes live. No spam, just the sessions
              worth your time.
            </p>
            <Link
              to="/webinar"
              className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-yellow-300 px-8 font-['Satoshi'] text-base font-medium text-neutral-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]"
            >
              Save my spot
              <FiArrowRight />
            </Link>
          </Section>
        </section>
      </main>
      <Footer />
    </>
  );
}
