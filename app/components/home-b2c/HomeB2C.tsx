import "./b2c.css";
import { BlogReports } from "./BlogReports";
import { BriefB2C } from "./BriefB2C";
import { CallB2C } from "./CallB2C";
import { ExpectB2C } from "./ExpectB2C";
import { FaqB2C } from "./FaqB2C";
import { FooterB2C } from "./FooterB2C";
import { GetJobB2C } from "./GetJobB2C";
import { HeaderB2C } from "./HeaderB2C";
import { HeroB2C } from "./HeroB2C";
import { MatchesB2C } from "./MatchesB2C";
import { MoreB2C } from "./MoreB2C";
import { ProofB2C } from "./ProofB2C";
import { StickyCta } from "./StickyCta";
import { StuDock } from "./stu-embed";
import { WhatB2C } from "./WhatB2C";

// The B2C homepage (studojo.pro): Studojo's job agent, Stu, only. Rendered by app/routes/_index.tsx when the
// request is for a B2C host (app/lib/b2c-home.ts); studojo.com keeps the current homepage. Signed in or not,
// everyone sees it; signed in, every "start the call" is "open my jobs" (cta.tsx).
// In page order, each its own component: the hero, then the story (what, call, brief, matches, getjob, more, proof,
// expect, faq, read), the footer, and the one floating start.

export function HomeB2C() {
  return (
    <div className="sjb sjb-page">
      <HeaderB2C />
      <main id="main">
        <HeroB2C />
        <WhatB2C />
        <CallB2C />
        <BriefB2C />
        <MatchesB2C />
        <GetJobB2C />
        <MoreB2C />
        <ProofB2C />
        <ExpectB2C />
        <FaqB2C />
        <BlogReports />
      </main>
      <FooterB2C />
      <StickyCta />
      <StuDock />
    </div>
  );
}
