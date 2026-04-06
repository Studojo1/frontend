import { redirect } from "react-router";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import type { Route } from "./+types/dojos.careers";

// Legacy route - redirect to new resume builder
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }
  
  // Redirect to resume list page (new UX)
  throw redirect("/resumes");
}

export function meta({}: Route.MetaArgs) {
  const BASE_URL = "https://studojo.com";
  return [
    { title: "Careers Dojo – Free ATS Resume Builder for Students | Studojo" },
    {
      name: "description",
      content:
        "Build a professional, ATS-optimised resume in minutes. 100% free. No paywalls. Built for students applying to internships and graduate roles.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/dojos/careers` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Careers Dojo – Free ATS Resume Builder for Students | Studojo" },
    { property: "og:description", content: "Build a professional, ATS-optimised resume in minutes. 100% free. No paywalls. Built for students." },
    { property: "og:url", content: `${BASE_URL}/dojos/careers` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Careers Dojo – Free ATS Resume Builder for Students | Studojo" },
    { name: "twitter:description", content: "Build a professional, ATS-optimised resume in minutes. 100% free. No paywalls. Built for students." },
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

export default function CareersDojoRoute() {
  return (
    <>
      <Header />
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={sectionVariants}>
          <CareersDojoPage />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <Footer />
        </motion.div>
      </motion.main>
    </>
  );
}
