import { useLocation } from "react-router";
import homeCss from "./home-v2.css?url";
import { Brief } from "./Brief";
import { Call } from "./Call";
import { Expect } from "./Expect";
import { Faq } from "./Faq";
import { Floating } from "./Floating";
import { GetJob } from "./GetJob";
import { Hero } from "./Hero";
import { HomeFooter } from "./HomeFooter";
import { HomeHeader } from "./HomeHeader";
import { Matches } from "./Matches";
import { More } from "./More";
import { Proof } from "./Proof";
import { Read } from "./Read";
import { Sheet } from "./Sheet";
import { AgentProvider } from "./start";
import { What } from "./What";

// HOMEPAGE V2 (27 Oct 2026): the B2C homepage (studojo.pro), the design the owner picked (localhost h1.html, now
// hp/v2.html): Stu, your career agent, only. Rendered by app/routes/_index.tsx for a B2C host (app/lib/b2c-home.ts);
// studojo.com keeps its own homepage, untouched. Its own header and footer (h1's); every style in home-v2.css sits
// under .hv2.
// In page order: the header; the hero (Stu, live in place); what, the call, the brief, the matches, getting the
// job, more, proof, what to expect, questions, reading; the footer with "ready when you are"; the floating agent
// and the sheet it opens. The only ways to start are the hero, the floating agent and the footer's button
// (start.tsx); no section has a button of its own.
// ?stu=circle puts Stu back on the h1 purple disc, for the owner to compare (hv-stu-circle); the default has none.
// Its stylesheet is linked here, by this component (React hoists it into <head>, also in the server's HTML), not
// imported into the route: so studojo.com's homepage, which never renders HomeV2, links no new stylesheet at all.

export function HomeV2() {
  const { search } = useLocation();
  const circle = new URLSearchParams(search).get("stu") === "circle";
  return (
    <AgentProvider>
      <link rel="stylesheet" href={homeCss} precedence="default" />
      <div className={`hv2 hv-page${circle ? " hv-stu-circle" : ""}`}>
        <HomeHeader />
        <main id="main">
          <Hero />
          <What />
          <Call />
          <Brief />
          <Matches />
          <GetJob />
          <More />
          <Proof />
          <Expect />
          <Faq />
          <Read />
        </main>
        <HomeFooter />
        <Floating />
        <Sheet />
      </div>
    </AgentProvider>
  );
}
