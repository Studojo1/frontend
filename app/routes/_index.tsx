import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, redirect } from "react-router";
import {
  BackedBySection,
  CTABanner,
  CollegesBanner,
  FeaturedProductCard,
  Footer,
  FreeToolsSection,
  Header,
  Hero,
  ProblemSolution,
  StepsSection,
  TrustStrip,
} from "~/components";
import { useLoaderData } from "react-router";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import BobPage from "./bob";
import DashboardPage from "./dashboard";
import type { Route } from "./+types/home";

// app.studojo.* is the Sensei workspace and dashboard.studojo.* is the org
// manager portal — each host's root IS that app, independent of the studojo.com
// marketing site. (The Studojo super-admin panel lives in the separate
// admin-panel app at admin.studojo.com.)
function senseiHostApp(request: Request): "bob" | "dashboard" | null {
  const host = (request.headers.get("host") || "").toLowerCase();
  if (host.startsWith("app.studojo.")) return "bob";
  if (host.startsWith("dashboard.studojo.")) return "dashboard";
  return null;
}

export async function loader({ request }: Route.LoaderArgs) {
  const senseiApp = senseiHostApp(request);
  if (senseiApp) return { bobApp: senseiApp === "bob", dashboardApp: senseiApp === "dashboard" };
  const session = await getSessionFromRequest(request);
  if (session) {
    const onboardingStatus = await requireOnboardingComplete(session.user.id);
    if (!onboardingStatus.complete) {
      throw redirect("/onboarding");
    }
  }
  return { bobApp: false, dashboardApp: false };
}

export function meta({ data }: Route.MetaArgs) {
  const d = data as { bobApp?: boolean; dashboardApp?: boolean } | undefined;
  if (d?.dashboardApp) {
    return [{ title: "Sensei Dashboard — Studojo" }, { name: "robots", content: "noindex" }];
  }
  if (d?.bobApp) {
    return [{ title: "Bob — Studojo" }, { name: "robots", content: "noindex" }];
  }
  const BASE_URL = "https://studojo.com";
  return [
    { title: "Studojo | Land Your Next Internship or Job" },
    {
      name: "description",
      content:
        "Skip the job portal queue. Studojo's AI finds the hiring manager, writes a personalised email, and sends it from your Gmail. 500+ students placed. TCS, Goldman, Figma. $20 for 200 outreaches.",
    },
    { tagName: "link", rel: "canonical", href: BASE_URL },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Studojo | Land Your Next Internship or Job" },
    { property: "og:description", content: "AI finds the hiring manager. AI writes the email. You just show up to the interview. 500+ students placed." },
    { property: "og:url", content: BASE_URL },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Studojo | Land Your Next Internship or Job" },
    { name: "twitter:description", content: "AI finds the hiring manager. AI writes the email. You just show up to the interview." },
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

function AnnouncementBar() {
  return (
    <div className="border-b border-neutral-900 bg-violet-500 px-4 py-2.5 text-center">
      <p className="font-['Satoshi'] text-xs font-medium text-white md:text-sm">
        2026 recruiting is on. Internships &amp; jobs are filling up fast.{" "}
        <Link
          to="/outreach"
          className="font-bold underline underline-offset-2 hover:no-underline"
        >
          Grab your spot now &rarr;
        </Link>
      </p>
    </div>
  );
}

function InternshipPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("outreach-popup-dismissed")) return;
    let fired = false;
    function onScroll() {
      if (fired) return;
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled >= 0.6) {
        fired = true;
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
              &times;
            </button>

            <div className="flex flex-col gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-200 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                <img src="/favicon.png" alt="Studojo" width="32" height="32" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="font-['Clash_Display'] text-2xl font-medium leading-tight text-neutral-900">
                  Email hiring managers directly
                </h2>
                <p className="font-['Satoshi'] text-base text-neutral-600">
                  Upload your resume. We find who can hire you and write the emails. Most students get a reply within a week.
                </p>
              </div>
              <Link
                to="/outreach/onboarding/upload"
                onClick={dismiss}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                Find My Hiring Managers &rarr;
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
  const { bobApp, dashboardApp } = useLoaderData<typeof loader>();
  if (dashboardApp) return <DashboardPage />;  // dashboard.studojo.* -> manager portal
  if (bobApp) return <BobPage />;       // app.studojo.* -> Bob workspace at root
  return (
    <>
      <AnnouncementBar />
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
          <CollegesBanner />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <StepsSection />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <ProblemSolution />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <TrustStrip />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <FeaturedProductCard />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <FreeToolsSection />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <BackedBySection />
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
