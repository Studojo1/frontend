import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Header } from "~/components";
import { PasswordInput } from "~/components/password-input";
import { heldTrackingParams } from "~/lib/attribution";
import { authClient } from "~/lib/auth-client";
import { logFunnelStep } from "~/lib/funnel";
import { chromeIntentUrl, detectInAppBrowser, isAndroid, type InAppBrowser } from "~/lib/in-app-browser";
import { identifyUser, trackEvent } from "~/lib/mixpanel";
import type { Route } from "./+types/auth";

const floatY = [0, -24, -12, -30, 0];
const floatX = [0, 12, -18, 8, 0];
const floatRotate = [0, 6, -8, 4, 0];

const BACKGROUND_SHAPES = [
  { className: "right-0 top-20 h-32 w-32 rounded-full md:h-40 md:w-40 bg-yellow-500", shadow: "6px_6px" as const, duration: 18, delay: 0 },
  { className: "left-0 top-1/3 h-24 w-24 md:h-32 md:w-32 bg-emerald-300", shadow: "4px_4px" as const, rotate: 12, duration: 22, delay: 1 },
  { className: "bottom-20 right-1/4 h-20 w-20 md:h-24 md:w-24 bg-violet-500", shadow: "4px_4px" as const, duration: 20, delay: 2 },
  { className: "bottom-1/4 left-0 h-16 w-16 md:h-28 md:w-28 bg-pink-300", shadow: "4px_4px" as const, rotate: 45, duration: 24, delay: 0.5 },
  { className: "top-1/2 right-1/3 h-14 w-14 md:h-20 md:w-20 bg-amber-400", shadow: "3px_3px" as const, rotate: -12, duration: 19, delay: 1.5 },
  { className: "top-12 left-1/4 h-16 w-16 md:h-20 md:w-20 rounded-full bg-teal-300", shadow: "4px_4px" as const, duration: 21, delay: 0.8 },
  { className: "bottom-1/3 right-0 h-20 w-20 md:h-24 md:w-24 bg-rose-300", shadow: "4px_4px" as const, rotate: -20, duration: 23, delay: 1.2 },
  { className: "top-1/4 right-1/5 h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-indigo-300", shadow: "3px_3px" as const, rotate: 15, duration: 17, delay: 2.5 },
  { className: "bottom-32 left-1/3 h-14 w-14 md:h-18 md:w-18 rounded-full bg-lime-300", shadow: "3px_3px" as const, duration: 25, delay: 0.3 },
  { className: "top-2/3 left-1/5 h-20 w-20 md:h-28 md:w-28 bg-orange-200", shadow: "4px_4px" as const, rotate: -15, duration: 20, delay: 1.8 },
  { className: "top-16 right-1/4 h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-cyan-300", shadow: "3px_3px" as const, rotate: 25, duration: 26, delay: 0.6 },
  { className: "bottom-12 left-1/2 h-12 w-12 md:h-16 md:w-16 bg-fuchsia-200", shadow: "3px_3px" as const, rotate: -8, duration: 22, delay: 2.2 },
];

function FloatShape({
  className,
  shadow,
  rotate = 0,
  duration,
  delay,
}: {
  className: string;
  shadow: "6px_6px" | "4px_4px" | "3px_3px";
  rotate?: number;
  duration: number;
  delay: number;
}) {
  const shadowClass =
    shadow === "6px_6px"
      ? "shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]"
      : shadow === "4px_4px"
        ? "shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
        : "shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]";

  return (
    <motion.div
      className={`absolute rounded-2xl border-2 border-neutral-900 opacity-40 md:opacity-50 ${shadowClass} ${className}`}
      aria-hidden
      animate={{
        y: floatY,
        x: floatX,
        rotate: rotate ? floatRotate.map((r) => rotate + r) : floatRotate,
      }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration,
        delay,
      }}
    />
  );
}

// Which tab /auth opens on, from the URL alone. Shared by the page and its
// meta so the tab title can never disagree with the form: a signup link used
// to render a "Sign Up" form under a browser tab reading "Sign In".
function modeFromParams(params: URLSearchParams): "signin" | "signup" {
  // Someone bounced here off a product page (redirect, no explicit mode) is far
  // more likely new than returning, so open on Sign Up.
  const modeParam = params.get("mode");
  return modeParam === "signup" || (!modeParam && params.has("redirect")) ? "signup" : "signin";
}

const titleFor = (mode: "signin" | "signup") =>
  mode === "signup" ? "Sign Up | Studojo" : "Sign In | Studojo";

export function meta({ location }: Route.MetaArgs) {
  return [
    { title: titleFor(modeFromParams(new URLSearchParams(location.search))) },
    {
      name: "description",
      content: "Sign in or create your Studojo account to get started.",
    },
  ];
}

// Read and cleared by root.tsx once a session exists
const CONSENT_PENDING_KEY = "sj_consent_pending";

const IN_APP_DISMISSED_KEY = "sj_in_app_prompt_dismissed";

// Read at call time: the user agent only exists in the browser.
const inAppNow = (): InAppBrowser =>
  typeof navigator === "undefined" ? null : detectInAppBrowser(navigator.userAgent);

/** EX-06: the Instagram and Facebook in-app browsers convert far worse on
 * signup. Google works there, so nothing is blocked: this only offers a way
 * out to the phone's own browser, carrying the ad click with it. */
function InAppBrowserPrompt({ app, onDismiss }: { app: "instagram" | "facebook"; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  const android = typeof navigator !== "undefined" && isAndroid(navigator.userAgent);
  const appName = app === "instagram" ? "Instagram" : "Facebook";

  // The page URL plus the held fbclid/utm, so the new browser (which has none
  // of this tab's storage) still credits the ad that brought the user here.
  const shareUrl = (): string => {
    const u = new URL(window.location.href);
    u.searchParams.delete("error");
    heldTrackingParams().forEach((v, k) => {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    });
    return u.toString();
  };

  const copyLink = async () => {
    const href = shareUrl();
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      // Some in-app browsers withhold the clipboard API; fall back to a
      // selected textarea, which they do allow.
      const ta = document.createElement("textarea");
      ta.value = href;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    logFunnelStep("auth_in_app_copy_link", { in_app: app });
  };

  return (
    <div
      className="mb-6 rounded-2xl border-2 border-neutral-900 bg-yellow-100 p-4 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
      role="region"
      aria-label="Open in your browser"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-['Satoshi'] text-sm font-bold leading-5 text-neutral-900">
          Open in your browser for the smoothest sign up
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-700 hover:bg-yellow-200"
          aria-label="Dismiss"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="mt-1 font-['Satoshi'] text-sm leading-5 text-neutral-700">
        You are in {appName}&apos;s built in browser. Tap the menu (three dots, top right), then{" "}
        <span className="font-medium">{android ? "Open in Chrome" : "Open in external browser"}</span>.
        Or copy the link and paste it into {android ? "Chrome" : "Safari"}. Continue with Google also works here.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-white px-4 font-['Satoshi'] text-sm font-medium text-neutral-900"
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
        {android && (
          <a
            href={typeof window === "undefined" ? "#" : chromeIntentUrl(shareUrl())}
            onClick={() => logFunnelStep("auth_in_app_open_chrome", { in_app: app })}
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-neutral-900 px-4 font-['Satoshi'] text-sm font-medium text-white"
          >
            Open in Chrome
          </a>
        )}
      </div>
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Returning visitors are switched back to Sign In below once their last
  // login method is readable.
  const modeParam = searchParams.get("mode");
  const [mode, setMode] = useState<"signin" | "signup">(() => modeFromParams(searchParams));
  // meta only sees the URL; the mode can also change on the client (the
  // returning-visitor switch below), so keep the tab title in step with it.
  // searchParams is a dependency because a URL change re-renders meta's title,
  // and this has to run after that to have the last word.
  useEffect(() => {
    document.title = titleFor(mode);
  }, [mode, searchParams]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  // EX-06: set after hydration, since the user agent is browser only.
  const [inApp, setInApp] = useState<InAppBrowser>(null);
  const [inAppDismissed, setInAppDismissed] = useState(false);
  useEffect(() => {
    setInApp(inAppNow());
    try {
      setInAppDismissed(!!sessionStorage.getItem(IN_APP_DISMISSED_KEY));
    } catch {
      // Storage blocked: the prompt just shows again next load.
    }
  }, []);
  const dismissInApp = () => {
    setInAppDismissed(true);
    try {
      sessionStorage.setItem(IN_APP_DISMISSED_KEY, "1");
    } catch {
      // See above.
    }
  };
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: session, isPending } = authClient.useSession();
  const lastMethod = authClient.getLastUsedLoginMethod();
  const isLastGoogle = authClient.isLastUsedLoginMethod("google");
  const isLastEmail = authClient.isLastUsedLoginMethod("email");

  useEffect(() => logFunnelStep("auth_view", { in_app: inAppNow() }), []);

  // A link to /auth from /auth (the header's Get Started) changes only the
  // query, so the page does not remount; follow the URL's mode when it does.
  useEffect(() => {
    if (modeParam === "signin" || modeParam === "signup") setMode(modeParam);
  }, [modeParam]);

  // The last-used method is only readable in the browser, so this runs after
  // hydration rather than in the initial state.
  useEffect(() => {
    if (lastMethod && !modeParam) setMode("signin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMethod]);

  // On a 390px screen the signup form runs to 1.3 screens, so Sign Up sits below
  // the fold behind four fields and two consent checkboxes. 2,963 of the 3,510
  // users we lost arrived via Google, so lead with the buttons and let the email
  // form be a deliberate choice. Anyone who last signed in with email gets it
  // open, and so does anyone we bounced back here with an error to fix.
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const showEmailForm = emailFormOpen || !!error;

  // isLastUsedLoginMethod reads a cookie, so it is false during SSR and only
  // becomes true once we are on the client. Open the form in an effect rather
  // than in useState's initialiser, which would capture the server's answer and
  // never revisit it.
  useEffect(() => {
    if (isLastEmail) setEmailFormOpen(true);
  }, [isLastEmail]);
  const passkeyAttemptedRef = useRef(false);

  // Get redirect URL from query params, validate it's same-origin, default to "/"
  const getRedirectUrl = (): string => {
    const redirectParam = searchParams.get("redirect");
    if (!redirectParam) return "/";
    
    // Validate redirect URL is same-origin for security
    try {
      const redirectUrl = new URL(redirectParam, window.location.origin);
      // Only allow same-origin redirects
      if (redirectUrl.origin === window.location.origin) {
        return redirectUrl.pathname + redirectUrl.search + redirectUrl.hash;
      }
    } catch {
      // Invalid URL, default to "/"
    }
    return "/";
  };

  const redirectUrl = getRedirectUrl();

  useEffect(() => {
    if (!isPending && session) navigate(redirectUrl, { replace: true });
  }, [isPending, session, navigate, redirectUrl]);

  // Surface a failed OAuth round-trip. better-auth redirects a failed callback
  // to /api/auth/error?error=<code>, which forwards to "/?error=<code>"; nothing
  // rendered it, so a hard server error looked identical to a normal page load
  // and the user could not tell why they were still logged out.
  useEffect(() => {
    const code = searchParams.get("error");
    if (!code) return;
    logFunnelStep("auth_oauth_error", { in_app: inAppNow(), info: code });
    const messages: Record<string, string> = {
      state_mismatch:
        "Your sign-in took too long or your browser blocked a cookie. Please try again.",
      invalid_code: "Sign-in with that provider failed. Please try again.",
      internal_server_error:
        "Something went wrong on our end while signing you in. Please try again, and contact support if it keeps happening.",
      access_denied: "You cancelled the sign-in. Please try again when ready.",
    };
    setError(messages[code] ?? "Sign-in failed. Please try again.");
    // Clear the param so a refresh does not re-show a stale error.
    const next = new URLSearchParams(searchParams);
    next.delete("error");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    // Only attempt passkey autoFill once per mount, and only in signin mode
    if (mode !== "signin" || passkeyAttemptedRef.current) return;
    
    // Only run in browser
    if (typeof window === "undefined") return;
    
    const ok = typeof PublicKeyCredential !== "undefined" &&
      typeof PublicKeyCredential.isConditionalMediationAvailable === "function";
    if (!ok) return;
    
    passkeyAttemptedRef.current = true;
    
    void PublicKeyCredential.isConditionalMediationAvailable().then((avail) => {
      if (avail) {
        void authClient.signIn.passkey({ autoFill: true }).then((result) => {
          if (result.error) {
            // Only show error if it's not a user cancellation or webauthn input error
            const errorCode = (result.error as any).code;
            const errorMessage = result.error.message?.toLowerCase() ?? "";
            const isCancelled = errorCode === "AUTH_CANCELLED" || 
                               errorMessage.includes("auth cancelled") || 
                               errorMessage.includes("registration cancelled") ||
                               errorMessage.includes("webauthn") ||
                               errorMessage.includes("autocomplete");
            if (!isCancelled) {
              setError(result.error.message ?? "Passkey authentication failed");
            }
          }
        }).catch(() => {
          // Silently catch errors to prevent infinite loops
        });
      }
    });
  }, [mode]);

  if (!isPending && session) return null;

  const handleModeToggle = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setError(null);
    const next = new URLSearchParams(searchParams);
    next.set("mode", newMode);
    setSearchParams(next, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const passwordValue = password || (formData.get("password") as string);
    const confirmPasswordValue = confirmPassword || (formData.get("confirmPassword") as string | null);
    const remember = (form.querySelector<HTMLInputElement>("input[name=remember]")?.checked) ?? true;
    logFunnelStep("auth_email_submit", { in_app: inAppNow(), info: mode });

    if (mode === "signup") {
      if (passwordValue !== confirmPasswordValue) {
        setError("Passwords don't match");
        setSubmitting(false);
        return;
      }
      if (!termsAccepted || !privacyAccepted) {
        setError("Please accept the Terms & Conditions and Privacy Policy to continue");
        setSubmitting(false);
        return;
      }
      localStorage.setItem(CONSENT_PENDING_KEY, "1");
      const { error: err, data } = await authClient.signUp.email(
        {
          email,
          password: passwordValue,
          name: email.split("@")[0] || "User",
          callbackURL: redirectUrl,
        },
        // No onSuccess navigate here. better-auth fires that callback for a
        // completed request, not for a usable session, so a server-side failure
        // (e.g. the 500 the account.issuer schema mismatch produced) still
        // redirected the user onward and they landed logged out with no error.
        // The `session` effect above navigates once a session actually exists.
      );
      if (err) {
        const code = (err as { code?: string }).code;
        const msg =
          code === "PASSWORD_COMPROMISED"
            ? "This password has been found in a data breach. Please choose a different password."
            : code?.startsWith("USER_ALREADY_EXISTS")
              ? "You already have an account with this email. Sign in, or use Forgot password."
              : err.message ?? "Sign up failed";
        if (code?.startsWith("USER_ALREADY_EXISTS")) handleModeToggle("signin");
        setError(msg);
        // Track failed sign up
        trackEvent("Sign Up", {
          user_id: undefined,
          email: email,
          signup_method: "email",
          success: false,
        });
      } else if (data?.user) {
        // Track successful sign up
        const urlParams = new URLSearchParams(window.location.search);
        trackEvent("Sign Up", {
          user_id: data.user.id,
          email: data.user.email,
          signup_method: "email",
          utm_source: urlParams.get("utm_source") || undefined,
          utm_medium: urlParams.get("utm_medium") || undefined,
          utm_campaign: urlParams.get("utm_campaign") || undefined,
        });
        // Identify user
        identifyUser(data.user.id, {
          email: data.user.email,
          name: data.user.name,
        });
      }
    } else {
      const { error: err, data } = await authClient.signIn.email(
        {
          email,
          password: passwordValue,
          callbackURL: redirectUrl,
          rememberMe: remember,
        },
        // See the sign-up path above: navigation is driven by the confirmed
        // session, never by the request having completed.
      );
      if (err) {
        setError(err.message ?? "Sign in failed");
        // Track failed sign in
        trackEvent("Sign In", {
          user_id: undefined,
          login_method: "email",
          success: false,
        });
      } else if (data?.user) {
        // Track successful sign in
        trackEvent("Sign In", {
          user_id: data.user.id,
          login_method: "email",
          success: true,
        });
        // Identify user
        identifyUser(data.user.id, {
          email: data.user.email,
          name: data.user.name,
        });
      }
    }

    setSubmitting(false);
  };

  const handleGoogleSignIn = () => {
    setError(null);
    logFunnelStep("auth_google_click", { in_app: inAppNow(), info: mode });
    // Track Google sign in attempt
    trackEvent("Sign In", {
      login_method: "google",
      success: undefined, // Will be updated on success/failure
    });
    // Continuing with Google is acceptance of the notice under the button
    localStorage.setItem(CONSENT_PENDING_KEY, "1");
    authClient.signIn.social({
      provider: "google",
      callbackURL: redirectUrl,
      errorCallbackURL: `/auth?redirect=${encodeURIComponent(redirectUrl)}`,
    });
  };

  const handlePasskeySignIn = async () => {
    setError(null);
    setSubmitting(true);
    
    try {
      const result = await authClient.signIn.passkey({});
      
      if (result.error) {
        // Only show error if it's not a user cancellation
        const errorCode = (result.error as any).code;
        const errorMessage = result.error.message?.toLowerCase() ?? "";
        if (errorCode !== "AUTH_CANCELLED" && errorMessage !== "auth cancelled" && errorMessage !== "registration cancelled") {
          setError(result.error.message ?? "Passkey authentication failed. Please try again.");
        }
        setSubmitting(false);
      } else if (result.data) {
        // Track successful passkey sign in
        if (result.data.user) {
          trackEvent("Sign In", {
            user_id: result.data.user.id,
            login_method: "passkey",
            success: true,
          });
          // Identify user
          identifyUser(result.data.user.id, {
            email: result.data.user.email,
            name: result.data.user.name,
          });
        }
        // Success - navigate will happen via onSuccess callback if provided
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Passkey authentication failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-purple-50">
        {/* Background decorative shapes - Framer Motion, slow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {BACKGROUND_SHAPES.map((shape, i) => (
            <FloatShape key={i} {...shape} />
          ))}
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-[var(--section-max-width)] items-center justify-center px-4 py-12 md:px-8 md:py-20">
          <motion.div
            className="relative w-full max-w-md z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Studojo Logo */}
            <div className="mb-8 text-center">
              <h2 className="font-['Satoshi'] text-3xl font-black leading-9 text-neutral-900 md:text-4xl md:leading-7">
                studojo
              </h2>
            </div>

            {inApp && !inAppDismissed && <InAppBrowserPrompt app={inApp} onDismiss={dismissInApp} />}

            {/* Toggle Tabs */}
            <div className="mb-8 flex gap-2 rounded-2xl border-2 border-neutral-900 bg-white p-1 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <button
                type="button"
                onClick={() => handleModeToggle("signin")}
                className={`flex-1 rounded-xl px-4 py-3 font-['Satoshi'] text-base font-medium leading-6 transition-colors ${
                  mode === "signin"
                    ? "bg-neutral-900 text-white"
                    : "bg-transparent text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle("signup")}
                className={`flex-1 rounded-xl px-4 py-3 font-['Satoshi'] text-base font-medium leading-6 transition-colors ${
                  mode === "signup"
                    ? "bg-neutral-900 text-white"
                    : "bg-transparent text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Card */}
            <div className="relative rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h1 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight tracking-tight text-neutral-900">
                    {mode === "signin" ? "Welcome back" : "Create your account"}
                  </h1>
                  <p className="mb-8 font-['Satoshi'] text-base font-normal leading-6 text-neutral-700">
                    {mode === "signin"
                      ? "Sign in to continue to your account"
                      : "Get started with Studojo today"}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div
                    className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 font-['Satoshi'] text-sm font-medium leading-5 text-red-700"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  {lastMethod && (
                    <p className="font-['Satoshi'] text-sm font-medium leading-5 text-neutral-500">
                      Last signed in with {isLastGoogle ? "Google" : isLastEmail ? "email" : lastMethod}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={submitting}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none ${
                      isLastGoogle ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                    }`}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                  <p className="font-['Satoshi'] text-xs leading-4 text-neutral-500">
                    By continuing, you agree to our{" "}
                    <a href="/terms" target="_blank" rel="noopener" className="underline">Terms &amp; Conditions</a> and{" "}
                    <a href="/privacy" target="_blank" rel="noopener" className="underline">Privacy Policy</a>.
                  </p>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={handlePasskeySignIn}
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {submitting ? "Signing in…" : "Sign in with Passkey"}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden>
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center">
                    {showEmailForm ? (
                      <span className="bg-white px-3 font-['Satoshi'] text-sm font-medium leading-5 text-neutral-500">
                        or
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEmailFormOpen(true)}
                        className="inline-flex min-h-11 items-center bg-white px-3 font-['Satoshi'] text-sm font-medium leading-5 text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
                      >
                        or use email instead
                      </button>
                    )}
                  </div>
                </div>

                <div className={showEmailForm ? "contents" : "hidden"}>
                <div>
                  <label htmlFor="email" className="mb-2 block font-['Satoshi'] text-sm font-medium leading-5 text-neutral-900">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete={mode === "signin" ? "email webauthn" : "email"}
                    className="w-full rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-base font-normal leading-6 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    placeholder="you@example.com"
                  />
                </div>

                <PasswordInput
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "signin" ? "current-password webauthn" : "new-password"}
                  placeholder="••••••••"
                  showStrength={mode === "signup"}
                  label="Password"
                />

                {mode === "signup" && (
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    label="Confirm Password"
                  />
                )}

                {mode === "signin" && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" name="remember" defaultChecked className="h-4 w-4 rounded border-2 border-neutral-900 text-purple-500 focus:ring-2 focus:ring-purple-500" />
                      <span className="ml-2 font-['Satoshi'] text-sm font-normal leading-5 text-neutral-700">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="font-['Satoshi'] text-sm font-medium leading-5 text-purple-500 hover:text-purple-600">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {mode === "signup" && (
                  <div className="space-y-3">
                    <label className="flex min-h-11 items-start py-2">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-neutral-900 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <span className="ml-2 font-['Satoshi'] text-sm font-normal leading-5 text-neutral-700">
                        I agree to the{" "}
                        <a href="/terms" target="_blank" rel="noopener" className="font-medium text-purple-500 hover:text-purple-600 underline">
                          Terms & Conditions
                        </a>
                      </span>
                    </label>
                    <label className="flex min-h-11 items-start py-2">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-neutral-900 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <span className="ml-2 font-['Satoshi'] text-sm font-normal leading-5 text-neutral-700">
                        I agree to the{" "}
                        <a href="/privacy" target="_blank" rel="noopener" className="font-medium text-purple-500 hover:text-purple-600 underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-4 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none"
                >
                  {submitting ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
                </button>
                </div>
              </form>

              {mode === "signin" && (
                <p className="mt-6 text-center font-['Satoshi'] text-sm font-normal leading-5 text-neutral-700">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeToggle("signup")}
                    className="font-medium text-purple-500 hover:text-purple-600"
                  >
                    Sign up
                  </button>
                </p>
              )}

              {mode === "signup" && (
                <p className="mt-6 text-center font-['Satoshi'] text-sm font-normal leading-5 text-neutral-700">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeToggle("signin")}
                    className="font-medium text-purple-500 hover:text-purple-600"
                  >
                    Sign in
                  </button>
                </p>
              )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
