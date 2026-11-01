import { lazy, Suspense } from "react";
import { useLoaderData } from "react-router";
import { HomeV2 } from "~/components/home-v2/HomeV2";
import { HomeV3 } from "~/components/home-v3/HomeV3";
import { homeV3On } from "~/lib/b2c-home";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { senseiUi } from "~/lib/sensei-ui";
import type { Route } from "./+types/_index";

// HP-N10: static imports made every studojo.com homepage modulepreload the
// Sensei workspace (bob, ~26 KB br) and the manager dashboard, which only the
// app.* and dashboard.* hosts render. Load them on demand instead. SSR still
// works: the streaming renderer waits for a lazy component inside Suspense,
// and hydration keeps the server HTML until the chunk arrives.
// SenseiApp and DashboardApp, not the default exports: they are the ones that take the look
// (see bob.tsx).
const BobPage = lazy(() => import("./bob").then((m) => ({ default: m.SenseiApp })));
const DashboardPage = lazy(() => import("./dashboard").then((m) => ({ default: m.DashboardApp })));

// Blank white page, the same as those apps' own first paint, so there is no
// flash of marketing content on the Sensei hosts.
const senseiFallback = <div className="min-h-screen bg-white" />;

// app.studojo.* is the Sensei workspace and dashboard.studojo.* is the org
// manager portal: each host's root IS that app, independent of the studojo.com
// marketing site. (The Studojo super-admin panel lives in the separate
// admin-panel app at admin.studojo.com.)
function senseiHostApp(request: Request): "bob" | "dashboard" | null {
  const host = (request.headers.get("host") || "").toLowerCase();
  if (host.startsWith("app.studojo.")) return "bob";
  if (host.startsWith("dashboard.studojo.")) return "dashboard";
  return null;
}

export async function loader({ request }: Route.LoaderArgs) {
  const senseiApp = senseiHostApp(request);
  if (senseiApp) {
    // The look of the workspace and of the dashboard is decided per host
    // (app/lib/sensei-ui.ts), on the server, so the first paint is already in the right one.
    return { bobApp: senseiApp === "bob", dashboardApp: senseiApp === "dashboard", b2cHome: false, senseiUi: senseiUi(request.headers.get("host")) };
  }
  // RELAUNCH (2 Nov 2026): studojo.com, www.studojo.com (sent to the apex by entry.server.tsx) and studojo.pro all get
  // the new homepage, Studojo's job agent only. The old homepage and its redirect of signed-in students to the old
  // /onboarding are gone. Signed in or not, everyone sees it. The session is read here only so the first paint is
  // already right (signed in: "my jobs" in the header, "open my jobs" on every button); a failed read is "signed out".
  const signedIn = !!(await getSessionFromRequest(request).catch(() => null));
  return { bobApp: false, dashboardApp: false, b2cHome: true, signedIn, homeV3: homeV3On(process.env.HOME_V3), senseiUi: "old" as const };
}

export function meta({ data }: Route.MetaArgs) {
  const d = data as { bobApp?: boolean; dashboardApp?: boolean; b2cHome?: boolean } | undefined;
  if (d?.dashboardApp) {
    return [{ title: "Sensei Dashboard | Studojo" }, { name: "robots", content: "noindex" }];
  }
  if (d?.bobApp) {
    return [{ title: "Bob | Studojo" }, { name: "robots", content: "noindex" }];
  }
  // studojo.pro stays noindex (app/lib/staging-host.ts); the canonical address is studojo.com. The share image falls
  // back to root's og-default.png until the design brings a card for the new homepage.
  const BASE_URL = "https://studojo.com";
  const title = "Studojo | Stu, your career agent";
  const description = "Stu is your career agent at Studojo. A short call with Stu, then jobs that fit you, every day.";
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: BASE_URL },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: BASE_URL },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${BASE_URL}/#organization`,
            name: "Studojo",
            url: BASE_URL,
            logo: `${BASE_URL}/logo.png`,
          },
          {
            "@type": "WebSite",
            "@id": `${BASE_URL}/#website`,
            name: "Studojo",
            url: BASE_URL,
            publisher: { "@id": `${BASE_URL}/#organization` },
          },
        ],
      },
    },
  ];
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const { bobApp, dashboardApp, b2cHome, senseiUi: ui } = data;
  const homeV3 = "homeV3" in data && data.homeV3;
  // dashboard.studojo.* -> manager portal; app.studojo.* -> Bob workspace at root
  if (dashboardApp) return <Suspense fallback={senseiFallback}><DashboardPage ui={ui} /></Suspense>;
  if (bobApp) return <Suspense fallback={senseiFallback}><BobPage ui={ui} /></Suspense>;
  // Every other host: the new homepage, HOMEPAGE V3 (app/components/home-v3) unless HOME_V3 is "0", then HOMEPAGE V2
  // (app/components/home-v2), kept unchanged as the undo.
  if (b2cHome && homeV3) return <HomeV3 />;
  return <HomeV2 />;
}
