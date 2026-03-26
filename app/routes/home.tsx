import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
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

function InternshipPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("outreach-popup-dismissed")) return;
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    sessionStorage.setItem("outreach-popup-dismissed", "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-900 bg-neutral-100 font-['Satoshi'] text-sm font-medium text-neutral-900 hover:bg-neutral-200"
              aria-label="Close"
            >
              ×
            </button>

            <div className="flex flex-col gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-200 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-700"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="font-['Clash_Display'] text-2xl font-medium leading-tight text-neutral-900">
                  Find your dream internship
                </h2>
                <p className="font-['Satoshi'] text-base text-neutral-600">
                  AI finds the right roles, writes your outreach, and gets you in front of real hiring managers. No job boards.
                </p>
              </div>
              <Link
                to="/outreach"
                onClick={dismiss}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                Try the Outreach Tool →
              </Link>
              <button
                onClick={dismiss}
                className="font-['Satoshi'] text-sm text-neutral-500 hover:text-neutral-700 underline"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <InternshipPopup />
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={sectionVariants}>
          <Hero />
        </motion.div>
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
