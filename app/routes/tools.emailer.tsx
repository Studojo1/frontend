import emailerCss from "~/components/emailer/emailer.css?url";
import { EmailerTool } from "~/components/emailer/EmailerTool";
import { COPY, FAQ } from "~/components/emailer/copy";
import { AnnouncementBar, Faq, HowItWorks, JobsCard, MoreFree, StuLink } from "~/components/emailer/parts";
import { SiteFooter } from "~/components/site-b2c/SiteFooter";
import { SiteHeader } from "~/components/site-b2c/SiteHeader";
import { ArrowIcon, StartViaContext } from "~/components/site-b2c/ui";
import { TOOL_PATH, originForHost, type Tab } from "~/lib/emailer/contract";
import type { Route } from "./+types/tools.emailer";

// EMAILER (11 Nov 2026, the owner: "a standalone email writer tool that we can blow up on X ... a free lead magnet ...
// as many CTAs as it possibly can ... to link it back to Studojo ... build on studojo.pro/tools/emailer"): the free job
// email writer. The engine is career-agent at /api/emailer/* on this same origin (lib/emailer/contract.ts); the tool is
// components/emailer/EmailerTool.tsx. Every Stu link goes to the product's /join with via=emailer (parts.tsx useStuHref),
// and the site's own "start the call" in the header and footer counts to via=emailer too (StartViaContext).
// Briefed in loop-work/emailer/BRIEF.md.

const CANONICAL = `https://studojo.com${TOOL_PATH}`;

export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: emailerCss }];

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tab: Tab = url.searchParams.get("tab") === "grade" ? "grade" : "write";
  return { origin: originForHost(request.headers.get("host")), tab };
}

export function meta({ data }: Route.MetaArgs) {
  const origin = data?.origin ?? "https://studojo.com";
  const image = `${origin}/og-emailer.png`;
  return [
    { title: COPY.title },
    { name: "description", content: COPY.description },
    { tagName: "link", rel: "canonical", href: CANONICAL },
    { property: "og:type", content: "website" },
    { property: "og:title", content: COPY.title },
    { property: "og:description", content: COPY.description },
    { property: "og:url", content: `${origin}${TOOL_PATH}` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: COPY.ogAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@studojo" },
    { name: "twitter:title", content: COPY.title },
    { name: "twitter:description", content: COPY.description },
    { name: "twitter:image", content: image },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication",
            name: "Studojo free cold email writer",
            url: CANONICAL,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            description: COPY.description,
            publisher: { "@type": "Organization", name: "Studojo", url: "https://studojo.com" },
          },
          {
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ],
      },
    },
  ];
}

export default function EmailerPage({ loaderData }: Route.ComponentProps) {
  return (
    <StartViaContext.Provider value="emailer">
      <div className="em-page">
        <AnnouncementBar />
        <SiteHeader />
        <main id="main" className="sv-page em-main">
          <header className="sv-in em-hero" id="em-hero">
            <span className="sv-kicker">{COPY.kicker}</span>
            <h1 className="sv-h1">{COPY.h1}</h1>
            <p className="sv-lead">{COPY.lead}</p>
            <p className="em-hero-sub">
              {COPY.heroCta}{" "}
              <StuLink cta="hero" className="sv-go em-hero-go">
                {COPY.heroCtaGo}
                <ArrowIcon size={15} />
              </StuLink>
            </p>
          </header>
          <EmailerTool initialTab={loaderData.tab} />
          <HowItWorks />
          <JobsCard />
          <MoreFree />
          <Faq />
        </main>
        <SiteFooter />
      </div>
    </StartViaContext.Provider>
  );
}
