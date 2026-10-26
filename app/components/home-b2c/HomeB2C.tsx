import "./b2c.css";
import { BlogReports } from "./BlogReports";
import { FaqB2C } from "./FaqB2C";
import { FooterB2C } from "./FooterB2C";
import { HeaderB2C } from "./HeaderB2C";
import { HeroB2C } from "./HeroB2C";
import { HowItWorks } from "./HowItWorks";
import { StickyCta } from "./StickyCta";
import { StuDock } from "./stu-embed";
import { WhatB2C } from "./WhatB2C";
import { WhatYouGet } from "./WhatYouGet";
import { WhyCall } from "./WhyCall";

// The B2C homepage (studojo.pro): Studojo's job agent, Stu, only. Rendered by app/routes/_index.tsx when the
// request is for a B2C host (app/lib/b2c-home.ts); studojo.com keeps the current homepage. Signed in or not,
// everyone sees it; signed in, every "start the call" is "open my jobs" (cta.tsx).
// Sections in page order, each its own component: hero, what, how, why, get, faq, read, then the footer.

export function HomeB2C() {
  return (
    <div className="sjb sjb-page">
      <HeaderB2C />
      <main id="main">
        <HeroB2C />
        <WhatB2C />
        <HowItWorks />
        <WhyCall />
        <WhatYouGet />
        <FaqB2C />
        <BlogReports />
      </main>
      <FooterB2C />
      <StickyCta />
      <StuDock />
    </div>
  );
}
