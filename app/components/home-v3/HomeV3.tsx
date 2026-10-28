import { useLocation } from "react-router";
import homeCss from "./home-v3.css?url";
import { Faq } from "./Faq";
import { Floating } from "./Floating";
import { Hero } from "./Hero";
import { HomeFooter } from "./HomeFooter";
import { HomeHeader } from "./HomeHeader";
import { HowItWorks } from "./HowItWorks";
import { useHomeMotion } from "./Motion";
import { Proof } from "./Proof";
import { AgentProvider, useAgent } from "./start";
import { CallTakeover } from "./Takeover";
import { WhyEmail } from "./WhyEmail";

// HOMEPAGE V3 (finalized by the owner 28 Oct 2026, on studojo.pro 29 Oct): the B2C homepage (studojo.pro), Stu, your
// career agent, only. It sits beside HOMEPAGE V2 (components/home-v2, the page studojo.pro showed before it), which is
// kept unchanged as the undo. app/routes/_index.tsx renders this page for a B2C host (app/lib/b2c-home.ts) when the
// server's HOME_V3 is "1" (deploy-staging.yml sets it from the repository variable HOME_V3, 1 when unset), and HomeV2
// otherwise; studojo.com keeps its own homepage, untouched. Its own header and footer; every style in home-v3.css sits
// under .hv2, the same root class as HomeV2, so the classic look (look/classic.css) re-skins it the same way. Only one
// of the two renders in a deployment, so only its stylesheet is linked.
// In page order (27 Oct 2026, the owner: "the copy is terrible, the small fonts are not legible, it is too long";
// eleven sections became five; 28 Oct, "why is this section even there": the free and safe tiles went, the cost is one
// of the questions): the header; the hero (Stu, live in place); how it works; why email the person hiring; proof;
// questions; the footer with the closing start; the floating agent and the call takeover every start opens
// (Takeover.tsx), over the page, which is inert and locked under it. The only ways to start are the hero, the floating
// agent and the footer's button (start.tsx); no section has a button of its own.
// ?stu=circle puts Stu back on the h1 purple disc, for the owner to compare (hv-stu-circle); the default has none.
// Its stylesheet is linked here, by this component (React hoists it into <head>, also in the server's HTML), not
// imported into the route: so studojo.com's homepage, which never renders HomeV3, links no new stylesheet at all.

export function HomeV3() {
  const { search } = useLocation();
  const circle = new URLSearchParams(search).get("stu") === "circle";
  return (
    <AgentProvider>
      <link rel="stylesheet" href={homeCss} precedence="default" />
      <div className={`hv2 hv-page${circle ? " hv-stu-circle" : ""}`}>
        <Page />
        <CallTakeover />
      </div>
    </AgentProvider>
  );
}

/** The page itself: inert (no focus, no clicks) while the call takeover is over it. */
function Page() {
  const { callOpen } = useAgent();
  useHomeMotion();
  return (
    <div className="hv-pagewrap" inert={callOpen || undefined}>
      <HomeHeader />
      <main id="main">
        <Hero />
        <HowItWorks />
        <WhyEmail />
        <Proof />
        <Faq />
      </main>
      <HomeFooter />
      <Floating />
    </div>
  );
}
