import { motion } from "framer-motion";
import { redirect } from "react-router";
import { Footer, Header } from "~/components";
import { HumanizerDojoPage } from "~/components/dojos/humanizer-dojo";
import { ComingSoon } from "~/components/dojos/coming-soon";
import { getSessionFromRequest, requireOnboardingComplete, checkAdminAccess } from "~/lib/onboarding.server";
import type { Route } from "./+types/dojos.humanizer";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }
  
  // Check if user is admin
  const isAdmin = await checkAdminAccess(request);
  
  return { isAdmin };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Humanizer Dojo – Studojo" },
    {
      name: "description",
      content:
        "Structure-safe document humanization. Preserve headings, tables, and formatting while humanizing paragraph content.",
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

export default function HumanizerDojoRoute({ data }: Route.ComponentProps) {
  const isAdmin = data?.isAdmin ?? false;
  
  return (
    <>
      <Header />
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={sectionVariants}>
          {isAdmin ? <HumanizerDojoPage /> : <ComingSoon />}
        </motion.div>
        <motion.div variants={sectionVariants}>
          <Footer />
        </motion.div>
      </motion.main>
    </>
  );
}

