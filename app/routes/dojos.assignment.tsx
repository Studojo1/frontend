import { motion } from "framer-motion";
import { redirect } from "react-router";
import { Footer, Header } from "~/components";
import { AssignmentDojoPage } from "~/components/dojos/assignment-dojo";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import type { Route } from "./+types/dojos.assignment";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }
  return null;
}

export function meta({}: Route.MetaArgs) {
  const BASE_URL = "https://studojo.com";
  return [
    { title: "Assignment Dojo | AI-Powered Assignment Help for Students | Studojo" },
    {
      name: "description",
      content:
        "Get well-structured, plagiarism-safe assignments for any subject. Answer 2-3 questions and get something ready to submit. Free for students.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/dojos/assignment` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Assignment Dojo | AI-Powered Assignment Help for Students | Studojo" },
    { property: "og:description", content: "Get well-structured, plagiarism-safe assignments for any subject. Answer 2-3 questions and get something ready to submit. Free for students." },
    { property: "og:url", content: `${BASE_URL}/dojos/assignment` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Assignment Dojo | AI-Powered Assignment Help | Studojo" },
    { name: "twitter:description", content: "Get well-structured, plagiarism-safe assignments for any subject. Answer 2-3 questions and get something ready to submit. Free." },
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

export default function AssignmentDojoRoute() {
  return (
    <>
      <Header />
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={sectionVariants}>
          <AssignmentDojoPage />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <Footer />
        </motion.div>
      </motion.main>
    </>
  );
}
