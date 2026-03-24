import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, redirect } from "react-router";
import {
  CTABanner,
  DojoCards,
  Footer,
  Header,
  Hero,
  PricingSection,
  StepsSection,
  TestimonialsSection,
} from "~/components";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (session) {
    const onboardingStatus = await requireOnboardingComplete(session.user.id);
    if (!onboardingStatus.complete) {
      throw redirect("/onboarding");
    }
  }
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Studojo – Student life made simple" },
    {
      name: "description",
      content:
        "Assignments, projects, exam prep—all in one place. Work smarter, not harder.",
    },
  ];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

function InternshipCTA() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFloating(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* In-page CTA — sits where the stats bar was */}
      <section className="border-b border-neutral-900 bg-white px-4 py-10 md:px-8 md:py-14">
        <div
          ref={anchorRef}
          className="mx-auto flex max-w-[var(--section-max-width)] items-center justify-center"
        >
          <Link
            to="/outreach"
            className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 px-10 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            Find your dream internship →
          </Link>
        </div>
      </section>

      {/* Floating pill — slides in below header when in-page CTA scrolls out of view */}
      <AnimatePresence>
        {floating && (
          <motion.div
            className="fixed top-[68px] md:top-[96px] left-1/2 z-40 -translate-x-1/2"
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 8, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <Link
              to="/outreach"
              className="flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-violet-500 px-6 py-2.5 font-['Satoshi'] text-sm font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] whitespace-nowrap"
            >
              ✦ Find your dream internship →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={sectionVariants}>
          <Hero />
        </motion.div>
        <InternshipCTA />
        <motion.div variants={sectionVariants}>
          <DojoCards />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <StepsSection />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <TestimonialsSection />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <CTABanner />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <Footer />
        </motion.div>
      </motion.main>
    </>
  );
}
