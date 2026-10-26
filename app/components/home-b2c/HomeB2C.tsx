import { authClient } from "~/lib/auth-client";
import { BlogReports } from "./BlogReports";
import { FaqB2C } from "./FaqB2C";
import { FooterB2C } from "./FooterB2C";
import { HeaderB2C } from "./HeaderB2C";
import { HeroB2C } from "./HeroB2C";
import { HowItWorks } from "./HowItWorks";
import { JobsProof } from "./JobsProof";
import { SECTION_HOW, stuHref } from "./links";
import { StuDock, StuSlot } from "./stu-embed";

// The B2C homepage (studojo.pro): Studojo's job agent only. Rendered by app/routes/_index.tsx when the
// request is for a B2C host (app/lib/b2c-home.ts); studojo.com keeps the current homepage.
// Each section is its own component so the chosen visual direction can replace them one by one. Signed-in
// students never see this page: the loader sends them to /b2cnew.

// Placeholder hero copy until the owner picks the variant.
const HERO = {
  headline: "find jobs with studojo",
  subhead: "Stu is your job agent. Tell Stu what you want, and Stu finds roles that fit you and helps you go after them.",
  secondary: { label: "See how it works", href: `#${SECTION_HOW}` },
} as const;

export function HomeB2C() {
  const { data: session } = authClient.useSession();
  const stu = stuHref(!!session);
  return (
    <>
      <HeaderB2C />
      <main id="main">
        <HeroB2C
          headline={HERO.headline}
          subhead={HERO.subhead}
          primary={{ label: "Talk to Stu", href: stu }}
          secondary={HERO.secondary}
          stu={<StuSlot className="flex items-center justify-center" />}
        />
        <HowItWorks />
        <JobsProof stuHref={stu} />
        <BlogReports />
        <FaqB2C />
      </main>
      <FooterB2C />
      <StuDock />
    </>
  );
}
