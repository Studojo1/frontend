import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigate,
  useRouteError,
} from "react-router";
import { Toaster } from "sonner";
import { useEffect } from "react";

import type { Route } from "./+types/root";
import { authClient } from "./lib/auth-client";
import { applyPostHogConsent, capturePostHog, identifyPostHogUser, initPostHog, registerPostHogProps } from "./lib/posthog";
import { clearTokenCache } from "./lib/control-plane";
import { grantMetaConsent, initMetaPixel, metaExcludedPath, revokeMetaConsent, trackMetaPageView } from "./lib/meta-pixel";
import { onConsentChange, trackingAllowed } from "./lib/consent";
import { trackSignedUpOnce } from "./lib/analytics";
import { installJoinTracking } from "./lib/journey-client";
import { installPageTracking, notePageView } from "./lib/journey-pages";
import { captureAttribution, carriesTrackingParams, flushAttribution, heldTrackingParams, withHeldTracking } from "./lib/attribution";
import { isB2cRequest, isPlatformHost } from "./lib/b2c-home";
import { googleOnlyEnabled } from "./lib/google-only";
import { mainOrigin, productOrigin, productOriginScript } from "./lib/product-origin";
import { ErrorPage } from "./components/error-page";
import { CookieNotice } from "./components/legal/cookie-notice";
import { PolicyUpdateNotice } from "./components/legal/policy-update-notice";
import "./app.css";
// Self-hosted Satoshi + Clash Display (@font-face -> /public/fonts/*.woff2, with the Fontshare
// CDN kept only as a src fallback). Replaces the render-blocking external Fontshare stylesheet so
// a Fontshare outage / CSP / network block can never blank the whole UI to serif again.
import "./fonts.css";
// SITE-V2: the studojo.pro look for every page but the homepage, linked only on those pages (see Layout).
import sv2Css from "./components/site-b2c/site.css?url";
import sv2BlogCss from "./components/site-b2c/site-blog.css?url";
import sv2ReportsCss from "./components/site-b2c/site-reports.css?url";
import sv2PagesCss from "./components/site-b2c/site-pages.css?url";
import { sv2PageFor } from "./components/site-b2c/site-links";
import { useSiteB2c } from "./components/site-b2c/host";
// CLASSIC LOOK (app/lib/look.ts): Studojo's old neo-brutalist look over the same pages, only when ?look=classic or the
// sj_look cookie asks for it (studojo.pro only). Linked only then, so the default look's pages are unchanged.
import classicCss from "./components/look/classic.css?url";
import classicSiteCss from "./components/look/classic-site.css?url";
import { useLook } from "./components/look/look-context";
import { LookSwitch } from "./components/look/LookSwitch";

// Site-wide Organization node (AEO): one canonical entity for studojo.com. sameAs lists only the
// profile links that already appear in the site footer (app/components/common/footer.tsx).
const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Studojo",
  url: "https://studojo.com",
  logo: "https://studojo.com/logo.png",
  sameAs: ["https://www.linkedin.com/company/studojo/", "https://instagram.com/studojo"],
};

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  // Warm the fallback host (the .woff2 CDN) in case a self-hosted file ever misses.
  { rel: "preconnect", href: "https://cdn.fontshare.com", crossOrigin: "anonymous" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  // SITE-V2: on B2C hosts (the root loader's b2cHost, app/lib/b2c-home.ts; site-b2c/host.tsx) the blog, reports, legal, contact, about,
  // sign-in and error pages get html[data-sv2] and the SITE-V2 stylesheets. studojo.com never does: no attribute and
  // no extra link, so its HTML is unchanged.
  const b2c = useSiteB2c();
  const routeError = useRouteError();
  const sv2 = b2c ? (routeError ? "error" : sv2PageFor(pathname)) : null;
  const look = useLook();
  return (
    <html lang="en" data-sv2={sv2 ?? undefined} data-look={look ?? undefined}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* PRODUCT_ORIGIN for the browser, before any module runs (app/lib/product-origin.ts) */}
        <script dangerouslySetInnerHTML={{ __html: productOriginScript(productOrigin()) }} />
        {/* A page Meta must not see would otherwise reach it as the referrer
            of the next page loaded from it: same-site navigations send the
            full URL by default. */}
        {metaExcludedPath(pathname) && <meta name="referrer" content="strict-origin" />}
        <Meta />
        {/* Site-wide share image. Pages with their own og:image render theirs
            first (via <Meta />), and link-preview crawlers use the first one,
            so this only fills in where a page has none (audit HP-N12). */}
        <meta property="og:image" content="https://studojo.com/og-default.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://studojo.com/og-default.png" />
        {/* Canonical Organization entity for AEO; sameAs = the footer's profile links only. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <Links />
        {sv2 ? (
          <>
            <link rel="stylesheet" href={sv2Css} />
            <link rel="stylesheet" href={sv2BlogCss} />
            <link rel="stylesheet" href={sv2ReportsCss} />
            <link rel="stylesheet" href={sv2PagesCss} />
          </>
        ) : null}
        {look === "classic" ? (
          <>
            <link rel="stylesheet" href={classicCss} />
            <link rel="stylesheet" href={classicSiteCss} />
          </>
        ) : null}
        {/* Suppress third-party warnings immediately, before any scripts load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                const originalWarn = console.warn.bind(console);
                const originalError = console.error.bind(console);
                const originalLog = console.log.bind(console);
                
                const suppressedPatterns = [
                  'Unrecognized feature', 'web-share', 'unsafe header', 'x-rtb-fingerprint-id',
                  'Permissions policy violation', 'accelerometer', 'devicemotion', 'deviceorientation',
                  'microphone', 'Mixed Content', 'ERR_CONNECTION_REFUSED', 'ERR_BLOCKED_BY_CLIENT',
                  'ERR_NETWORK_CHANGED', 'net::ERR_', 'Failed to load resource',
                  'localhost:', 'api.sardine.ai', 'sardine', 'checkout.js', 'v2-entry.modern.js',
                  'razorpay', 'loader.min.js', '.png', 'localhost:7070', 'localhost:7071', 'localhost:37857',
                  'Slow network is detected', 'Fallback font will be used', '[Intervention]', 'Intervention:',
                  'api-js.mixpanel.com', 'mixpanel'
                ];
                
                const shouldSuppress = (args) => {
                  const message = (args[0]?.toString() || '').toLowerCase();
                  return suppressedPatterns.some(pattern => 
                    message.includes(pattern.toLowerCase())
                  );
                };
                
                console.warn = function(...args) {
                  if (!shouldSuppress(args)) originalWarn.apply(console, args);
                };
                console.error = function(...args) {
                  if (!shouldSuppress(args)) originalError.apply(console, args);
                };
                console.log = function(...args) {
                  if (!shouldSuppress(args)) originalLog.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body>
        {/* Skip link for keyboard and screen-reader users. It targets #main;
            pages that have no #main fall back to their first <main> or h1, so
            the link never points at nothing. */}
        <a
          href="#main"
          onClick={(e) => {
            const target =
              document.getElementById("main") ??
              document.querySelector("main") ??
              document.querySelector("h1");
            if (!target) return;
            e.preventDefault();
            if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
            (target as HTMLElement).focus();
            target.scrollIntoView({ block: "start" });
          }}
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:border-2 focus:border-studojo-ink focus:text-studojo-ink"
        >
          Skip to main content
        </a>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "font-['Satoshi']",
              title: "font-['Satoshi'] font-medium",
              description: "font-['Satoshi']",
              success: "bg-emerald-50 border-emerald-200 text-emerald-900",
              error: "bg-red-50 border-red-200 text-red-900",
              info: "bg-blue-50 border-blue-200 text-blue-900",
            },
          }}
        />
        {look ? <LookSwitch look={look} /> : null}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AnalyticsInit({ pages }: { pages: boolean }) {
  const { data: session } = authClient.useSession();
  const location = useLocation();

  useEffect(() => {
    initPostHog();
    initMetaPixel();
  }, []);

  // Every join or start CTA: clicked_join to our own /api/journey and PostHog, Meta Lead (app/lib/journey-client.ts).
  useEffect(() => installJoinTracking(), []);

  // SITE-TRACK (3 Nov 2026, the owner: "how far they scrolled, how long they stayed, or what they looked at"):
  // page_view on every load and route change, and page_engaged (time, scroll, sections, the start button seen) to our
  // own /api/journey (app/lib/journey-pages.ts). The site's own hosts only (pages: the root loader's journeyPages).
  useEffect(() => (pages ? installPageTracking() : undefined), [pages]);
  useEffect(() => {
    if (pages) notePageView(location.pathname);
  }, [pages, location.pathname]);

  // EU/UK cookie choice (HP-N13): accepting switches on PostHog storage and
  // recording and starts the Meta pixel on this page; rejecting or withdrawing
  // switches them off.
  useEffect(
    () =>
      onConsentChange(() => {
        if (trackingAllowed()) {
          applyPostHogConsent(true);
          grantMetaConsent();
          trackMetaPageView();
        } else {
          applyPostHogConsent(false);
          revokeMetaConsent();
        }
      }),
    [],
  );

  // Register UTM params as PostHog super properties so all subsequent events carry them
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const utmProps: Record<string, string> = {};
    for (const key of ["utm_campaign", "utm_source", "utm_medium", "utm_content", "utm_term"]) {
      const val = params.get(key);
      if (val) utmProps[key] = val;
    }
    if (Object.keys(utmProps).length > 0) {
      registerPostHogProps(utmProps);
    }
  }, []);

  // Track scroll depth milestones (25/50/75/100%) per page, firing scroll_depth events
  useEffect(() => {
    if (typeof window === "undefined") return;
    const milestones = new Set<number>();
    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);
      for (const depth of [25, 50, 75, 100]) {
        if (pct >= depth && !milestones.has(depth)) {
          milestones.add(depth);
          capturePostHog("scroll_depth", { depth, path: location.pathname });
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // A cached bearer token belongs to whoever was signed in when it was minted.
  // Drop it whenever the signed-in user changes (sign-out, sign-in, account
  // switch in another tab), not only on the header's sign-out button.
  const sessionUserId = session?.user?.id ?? null;
  useEffect(() => {
    clearTokenCache();
  }, [sessionUserId]);

  // Identify user when session is available
  useEffect(() => {
    if (session?.user) {
      identifyPostHogUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });

      // Consent given on /auth (checkboxes or the notice under Google) is
      // stored once the account exists; the flag survives the OAuth round trip.
      if (localStorage.getItem("sj_consent_pending")) {
        fetch("/api/user/accept-terms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Both sign-up routes (checkboxes, and the notice under Google) include
          // the 18+ confirmation.
          body: JSON.stringify({ termsAccepted: true, privacyAccepted: true, ageConfirmed: true }),
        })
          .then((r) => { if (r.ok) localStorage.removeItem("sj_consent_pending"); })
          .catch(() => {});
      }

      // Fire a one-time `signed_up` event for brand-new accounts (any method:
      // email or Google). Anchors the admin funnel on real signups. Guarded by
      // recency of createdAt + a per-user localStorage flag so it fires once.
      try {
        const u = session.user as any;
        if (u.createdAt) {
          const ageMs = Date.now() - new Date(u.createdAt).getTime();
          if (ageMs >= 0 && ageMs < 10 * 60 * 1000) {
            // track() maps signed_up -> Meta CompleteRegistration. Meta optimises
            // delivery against it, so it must fire exactly once per real account;
            // the recency check and trackSignedUpOnce's per-user flag (shared
            // with /auth's email sign-up) are what guarantee that.
            // META-FIX (B4): claimed on the server first, so a sign-up seen on both hosts is reported once.
            void trackSignedUpOnce({ id: u.id, email: u.email, name: u.name });
          }
        }
      } catch {
        // analytics must never break the app
      }
    }
  }, [session]);

  // One page view per route change. Keyed on the path only: keying on the
  // session too re-fired it when the session resolved or the user signed in,
  // double-counting ~10% of signed-in sessions (audit ST-N10).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeoutId = setTimeout(() => {
      capturePostHog("$pageview", {
        $current_url: window.location.href,
        page_title: document.title,
      });
      // Client-side navigation does not reload the document, so the pixel's own
      // PageView would only ever fire on the first hard load.
      trackMetaPageView();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return null;
}

// Suppress known third-party console warnings
function suppressThirdPartyWarnings() {
  if (typeof window === "undefined") return;

  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);

  const shouldSuppress = (args: any[]): boolean => {
    const message = args[0]?.toString() || "";
    const suppressedPatterns = [
      "Unrecognized feature",
      "web-share",
      "unsafe header",
      "x-rtb-fingerprint-id",
      "Permissions policy violation",
      "accelerometer",
      "devicemotion",
      "deviceorientation",
      "microphone",
      "Mixed Content",
      "ERR_CONNECTION_REFUSED",
      "ERR_BLOCKED_BY_CLIENT", // Ad blocker blocking requests
      "ERR_NETWORK_CHANGED", // Network interface changes (handled by retry logic)
      "net::ERR_NETWORK_CHANGED", // Chrome's internal format
      "Failed to load resource: net::ERR_NETWORK_CHANGED",
      "net::ERR_", // Catch-all for network errors
      "Failed to load resource:", // Generic resource loading failures
      "localhost:",
      "api.sardine.ai",
      "api-js.mixpanel.com",
      "sardine",
      "checkout.js",
      "v2-entry.modern.js",
      "razorpay",
      "Slow network is detected", // Browser network intervention warnings
      "Fallback font will be used", // Font loading warnings
      "[Intervention]", // Browser intervention messages
      "Intervention:", // Browser intervention messages
      "mixpanel", // Mixpanel tracking
      "loader.min.js", // Third-party loaders
      ".png", // Image loading errors
      "localhost:7070",
      "localhost:7071",
      "localhost:37857",
    ];

    return suppressedPatterns.some((pattern) =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  console.warn = (...args: any[]) => {
    if (!shouldSuppress(args)) {
      originalWarn(...args);
    }
  };

  console.error = (...args: any[]) => {
    if (!shouldSuppress(args)) {
      originalError(...args);
    }
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  // Resolve the host on the SERVER so the cookie and policy notices are never even
  // rendered on Sensei subdomains (no SSR flash, no hydration mismatch).
  const host = (request.headers.get("host") || "").toLowerCase();
  // b2cHost: studojo.com, studojo.pro (and localhost) get the B2C homepage, header and footer (app/lib/b2c-home.ts).
  // Read by components/common/header.tsx and footer.tsx.
  // googleOnly: the GOOGLE_ONLY switch (app/lib/google-only.ts), read by /auth and /settings through useGoogleOnly.
  // mainOrigin: on the product's own host (platform.studojo.com or .pro) the main site's origin, else "": the header and
  // footer there link to the main site absolutely (site-b2c/host.tsx useMainOrigin).
  return {
    isSenseiHost: /^(app|admin|dashboard)\.studojo\./.test(host),
    b2cHost: isB2cRequest(request),
    googleOnly: googleOnlyEnabled(),
    mainOrigin: isPlatformHost(host) ? mainOrigin() : "",
    // SITE-TRACK: page views and engagement (journey-pages.ts) on the site's own hosts. Not Sensei's or the admin's,
    // and not the product's (platform.*: only its sign-in pages reach this app, and its /api/journey is the product's).
    journeyPages: isB2cRequest(request) && !isPlatformHost(host),
  };
}

export default function App() {
  useEffect(() => {
    suppressThirdPartyWarnings();
  }, []);

  // Hold the ad click that brought this visitor in, before anything navigates
  // away and loses the query string.
  useEffect(() => {
    captureAttribution();
  }, []);

  // VS-V09: on /auth and the upload step, keep the held ad click in the
  // address bar. Leaving the Instagram or Facebook in-app browser through its
  // own "Open in browser" menu carries only the URL, so without this the
  // signup in the new browser arrived untagged.
  const navigate = useNavigate();
  const here = useLocation();
  useEffect(() => {
    if (!carriesTrackingParams(here.pathname)) return;
    const next = withHeldTracking(here.search, heldTrackingParams());
    if (next) {
      navigate(
        { pathname: here.pathname, search: next, hash: here.hash },
        { replace: true, preventScrollReset: true, state: here.state },
      );
    }
    // Only on arrival at a page, not on every query change within it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here.pathname]);

  // Write it against the user as soon as a session exists. This runs on every
  // load rather than at signup on purpose: Google sign-in leaves the site for
  // the OAuth round trip, so there is no signup callback to hang it on. The
  // flush is a no-op once it has succeeded.
  const { data: attributionSession } = authClient.useSession();
  const attributionUserId = (attributionSession as any)?.user?.id as string | undefined;
  useEffect(() => {
    if (attributionUserId) flushAttribution(attributionUserId);
  }, [attributionUserId]);

  const { isSenseiHost, journeyPages } = useLoaderData<typeof loader>();
  const location = useLocation();
  const onSensei = isSenseiHost || location.pathname.startsWith("/bob");
  // A student's launched project page (/:handle/:slug) carries no analytics and
  // none of the site's widgets: its CSP allows only its own scripts (contract
  // section 4, app/routes/$handle.$slug.tsx).
  const projectPage = useMatches().some((m) => (m.handle as { projectPage?: boolean } | undefined)?.projectPage === true);

  return (
    <>
      {!projectPage && <AnalyticsInit pages={journeyPages && !onSensei} />}
      <Outlet />
      {!onSensei && !projectPage && <CookieNotice />}
      {!onSensei && !projectPage && <PolicyUpdateNotice />}
    </>
  );
}

function ErrorTracker({ errorType, errorMessage, errorCode }: { errorType: string; errorMessage: string; errorCode?: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // PostHog, so errors and broken inbound links show up in the admin funnel
    // (audit HP-N16; Mixpanel, which nobody read, is gone).
    initPostHog();
    if (errorCode === "404") {
      capturePostHog("page_not_found", { path: window.location.pathname, referrer: document.referrer || null });
    } else {
      capturePostHog("app_error", {
        error_type: errorType,
        error_message: errorMessage,
        error_code: errorCode,
        path: window.location.pathname,
      });
    }
  }, [errorType, errorMessage, errorCode]);
  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  let errorType = "unknown";
  let errorCode: string | undefined;
  let statusCode: number | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    message = error.status === 404 ? "Page Not Found" : error.status === 500 ? "Server Error" : "Error";
    details =
      error.status === 404
        ? "The page you're looking for doesn't exist or has been moved."
        : error.status === 500
        ? "Something went wrong on our end. We're working to fix it!"
        : error.statusText || details;
    errorType = "server";
    errorCode = error.status.toString();
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
    errorType = "application";
    message = "Application Error";
  }

  return (
    <>
      <title>{statusCode === 404 ? "Page not found | Studojo" : "Something went wrong | Studojo"}</title>
      {statusCode === 404 && <meta name="robots" content="noindex, nofollow" />}
      <ErrorTracker errorType={errorType} errorMessage={details} errorCode={errorCode} />
      <ErrorPage
        statusCode={statusCode}
        message={message}
        details={details}
        stack={stack}
      />
    </>
  );
}
