import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "react-router";
import { Toaster } from "sonner";
import { useEffect } from "react";

import type { Route } from "./+types/root";
import { authClient } from "./lib/auth-client";
import { identifyUser, initMixpanel, trackEvent } from "./lib/mixpanel";
import { capturePostHog, identifyPostHogUser, initPostHog, registerPostHogProps } from "./lib/posthog";
import { ErrorPage } from "./components/error-page";
import { ChatWidget } from "./components/chat-widget";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  { rel: "preconnect", href: "https://api.fontshare.com" },
  {
    rel: "stylesheet",
    href: "https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700,900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function MixpanelInit() {
  const { data: session } = authClient.useSession();
  const location = useLocation();

  useEffect(() => {
    initMixpanel();
    initPostHog();
  }, []);

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

  // Identify user when session is available
  useEffect(() => {
    if (session?.user) {
      identifyUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
      identifyPostHogUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });

      // Fire a one-time `signed_up` event for brand-new accounts (any method:
      // email or Google). Anchors the admin funnel on real signups. Guarded by
      // recency of createdAt + a per-user localStorage flag so it fires once.
      try {
        const u = session.user as any;
        if (u.createdAt) {
          const ageMs = Date.now() - new Date(u.createdAt).getTime();
          const key = `ph_signed_up_${u.id}`;
          if (ageMs >= 0 && ageMs < 10 * 60 * 1000 && !localStorage.getItem(key)) {
            capturePostHog("signed_up", { email: u.email, name: u.name });
            localStorage.setItem(key, "1");
          }
        }
      } catch {
        // analytics must never break the app
      }
    }
  }, [session]);

  // Track page views (with delay to ensure Mixpanel is initialized)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Small delay to ensure Mixpanel initialization completes
      const timeoutId = setTimeout(() => {
      trackEvent("Page View", {
        page_url: window.location.href,
        page_title: document.title,
        user_id: session?.user?.id,
      });
        capturePostHog("$pageview", {
          $current_url: window.location.href,
          page_title: document.title,
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, session?.user?.id]);

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
  // Resolve the host on the SERVER so the global chat widget is never even
  // rendered on Sensei subdomains (no SSR flash, no hydration mismatch).
  const host = (request.headers.get("host") || "").toLowerCase();
  return { isSenseiHost: /^(app|admin)\.studojo\./.test(host) };
}

export default function App() {
  useEffect(() => {
    suppressThirdPartyWarnings();
  }, []);

  const { isSenseiHost } = useLoaderData<typeof loader>();
  const location = useLocation();
  // The resume maker has its own coach chat, and Sensei has its own "Get
  // support" — the global floating widget would just float over those UIs.
  const onSensei = isSenseiHost || location.pathname.startsWith("/bob");
  const hideGlobalChat =
    location.pathname.startsWith("/jrs") || location.pathname.startsWith("/cc") || onSensei;

  return (
    <>
      <MixpanelInit />
      <Outlet />
      {!hideGlobalChat && <ChatWidget />}
    </>
  );
}

function ErrorTracker({ errorType, errorMessage, errorCode }: { errorType: string; errorMessage: string; errorCode?: string }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = authClient.getSession();
      trackEvent("Error", {
        error_type: errorType,
        error_message: errorMessage,
        error_code: errorCode,
        page_url: window.location.href,
        user_id: session?.user?.id,
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
