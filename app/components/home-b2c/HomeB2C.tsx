import "./b2c.css";
import { FaqB2C } from "./FaqB2C";
import { FooterB2C } from "./FooterB2C";
import { GetB2C } from "./GetB2C";
import { HeaderB2C } from "./HeaderB2C";
import { HeroB2C } from "./HeroB2C";
import { HowB2C } from "./HowB2C";
import { ProofB2C } from "./ProofB2C";
import { StickyCta } from "./StickyCta";
import { WhyB2C } from "./WhyB2C";

// The B2C homepage (studojo.pro): Studojo's job agent, Stu, only. Rendered by app/routes/_index.tsx when the
// request is for a B2C host (app/lib/b2c-home.ts); studojo.com keeps the current homepage. Signed in or not,
// everyone sees it; signed in, every "start the call" is "open my jobs" (cta.tsx).
// In page order, each its own component (nb.html, nb-sections.html): the hero, then why, how, get, proof and faq,
// the footer, and the one floating start. Career-agent's Stu embed (stu-embed.tsx and its script)
// is not loaded here (owner, 27 Oct): its dock would duplicate the side pill. Rendering <StuDock /> again brings it
// back.

export function HomeB2C() {
  return (
    <div className="sjb sjb-page">
      <HeaderB2C />
      <main id="main">
        <HeroB2C />
        <WhyB2C />
        <HowB2C />
        <GetB2C />
        <ProofB2C />
        <FaqB2C />
      </main>
      <FooterB2C />
      <StickyCta />
    </div>
  );
}
