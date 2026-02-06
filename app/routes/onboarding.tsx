import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { redirect, useNavigate } from "react-router";
import { eq } from "drizzle-orm";
import { Header } from "~/components";
import { PhoneInput } from "~/components/phone-input";
import { authClient } from "~/lib/auth-client";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { user } from "../../auth-schema";
import type { Route } from "./+types/onboarding";

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

const YEAR_OPTIONS = [
  "First year",
  "Second year",
  "Third year",
  "Fourth year",
  "Final year",
  "Postgraduate",
  "Other",
];

const INPUT_CLASS =
  "w-full rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-base font-normal leading-6 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";
const LABEL_CLASS = "mb-2 block font-['Satoshi'] text-sm font-medium leading-5 text-neutral-900";
const LABEL_OPTIONAL_CLASS = "mb-2 block font-['Satoshi'] text-sm font-medium leading-5 text-neutral-900";
const BTN_PRIMARY =
  "rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none";
const BTN_SECONDARY =
  "rounded-2xl border-2 border-neutral-900 bg-white px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  
  // Check if onboarding is complete (profile required, phone optional)
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (onboardingStatus.complete) {
    throw redirect("/");
  }
  
  // Check if user signed in via Google OAuth (for auto-verifying phone)
  const [userRecord] = await db
    .select({
      lastLoginMethod: user.lastLoginMethod,
      phoneNumber: user.phoneNumber,
      phoneNumberVerified: user.phoneNumberVerified,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);
  
  const isGoogleUser = userRecord?.lastLoginMethod === "google";
  
  return { 
    userEmail: session.user.email,
    userName: session.user.name || null, // Pre-fill name from Google OAuth if available
    isGoogleUser, // If true, we can auto-verify phone number
    hasPhone: !!(userRecord?.phoneNumber && userRecord?.phoneNumberVerified),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome to Studojo – Complete your profile" },
    { name: "description", content: "Tell us a bit about yourself to personalize your experience." },
  ];
}

export default function Onboarding({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  // UX improvement: Simplified to 2 steps - basic info (step 0) and phone collection (step 1)
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: loaderData.userName || "", // Pre-fill from Google OAuth
    college: "",
    yearOfStudy: "",
    course: "",
  });
  const [otherYearText, setOtherYearText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Phone collection state (required step, but verification method differs for Google users)
  const hasPhone = loaderData.hasPhone || false;
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91"); // Default to India
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const userEmail = loaderData.userEmail;
  const userName = loaderData.userName;
  const isGoogleUser = loaderData.isGoogleUser || false;

  // UX improvement: Only name is required, all other fields are optional
  const canSubmit = !!form.fullName.trim();

  useEffect(() => {
    // Focus name input on mount if not pre-filled
    if (!form.fullName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  // Cooldown timer for request new code
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds(s => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleSendOtp = async () => {
    const number = phone.trim();
    if (!number) return;
    setError(null);
    setSendingOtp(true);
    const fullNumber = countryCode + number;
    const { error: err } = await authClient.phoneNumber.sendOtp({
      phoneNumber: fullNumber,
    });
    setSendingOtp(false);
    if (err) {
      setError(err.message ?? "Failed to send code.");
      return;
    }
    setOtpSent(true);
    setOtpCode("");
    setCooldownSeconds(60); // Start 60 second cooldown
  };

  const handleVerify = async () => {
    const number = phone.trim();
    const code = otpCode.trim();
    if (!number || !code) return;
    setError(null);
    setVerifying(true);
    const fullNumber = countryCode + number;
    
    // Verify OTP first
    const { error: err } = await authClient.phoneNumber.verify({
      phoneNumber: fullNumber,
      code,
      updatePhoneNumber: true,
    });
    
    if (err) {
      setVerifying(false);
      const status = (err as { status?: number }).status;
      const msg =
        status === 403
          ? "Too many attempts. Request a new code."
          : err.message ?? "Verification failed.";
      setError(msg);
      return;
    }
    
    // For Google users, mark as verified (Google has already verified their account)
    // For others, phone is already verified via OTP
    if (isGoogleUser) {
      try {
        // Silently mark as verified for Google users (don't tell user)
        await fetch("/api/user/phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: fullNumber, verified: true }),
          credentials: "include",
        });
      } catch (err) {
        // Non-critical, phone is already verified via OTP
        console.error("[onboarding] Failed to update verification status:", err);
      }
    }
    
    setVerifying(false);
    // Phone verified successfully, submit profile
    await handleSubmitProfile();
  };

  // Handle phone submission - send OTP for verification
  // For Google users, we'll auto-verify after OTP (since Google verified their account)
  const handlePhoneSubmit = async () => {
    const number = phone.trim();
    if (!number) return;
    
    // Always require OTP verification for security
    await handleSendOtp();
  };

  const handleRequestNewCode = async () => {
    if (cooldownSeconds > 0) return; // Prevent during cooldown
    setError(null);
    setOtpCode("");
    await handleSendOtp();
  };

  const handleSubmitProfile = async () => {
    setError(null);
    setSubmitting(true);
    const payload = { ...form, newsletterSubscribed };
    if (form.yearOfStudy === "Other" && otherYearText.trim()) {
      payload.yearOfStudy = otherYearText.trim();
    }
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      // If profile already exists (409), just redirect to home
      if (res.status === 409) {
        navigate("/", { replace: true });
        return;
      }
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }
    navigate("/", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 0) {
      // Step 1: Basic info - move to phone step (or submit if already has phone)
      if (hasPhone) {
        // User already has phone, submit profile directly
        await handleSubmitProfile();
      } else {
        // Need to collect phone
        setStep(1);
      }
      return;
    }
    if (step === 1 && !otpSent) {
      // Step 2: Phone collection - submit phone (auto-verify for Google, send OTP for others)
      await handlePhoneSubmit();
      return;
    }
    if (step === 1 && otpSent) {
      // Step 2: Phone verification - verify OTP
      await handleVerify();
      return;
    }
  };

  // Generate friendly greeting based on user name
  const greeting = userName 
    ? `Hi, ${userName.split(' ')[0]}! 👋` // Use first name only for friendlier feel
    : "Hi! 👋";

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-purple-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {BACKGROUND_SHAPES.map((shape, i) => (
            <FloatShape key={i} {...shape} />
          ))}
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-[var(--section-max-width)] items-center justify-center px-4 py-12 md:px-8 md:py-20">
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="mb-6 text-center">
              <h2 className="font-['Satoshi'] text-2xl font-black leading-9 text-neutral-900 md:text-3xl md:leading-9">
                studojo
              </h2>
            </div>

            <div className="relative rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              {/* UX improvement: Simplified progress indicator - only 2 steps */}
              <div className="mb-6">
                <span className="font-['Satoshi'] text-sm font-medium leading-5 text-neutral-500">
                  Step {step + 1} of 2
                </span>
                <div
                  className="mt-2 flex gap-1"
                  role="progressbar"
                  aria-valuenow={step + 1}
                  aria-valuemin={1}
                  aria-valuemax={2}
                  aria-label="Progress"
                >
                  <div className="h-1.5 flex-1 rounded-full bg-neutral-900" />
                  <div className={`h-1.5 flex-1 rounded-full ${step === 1 ? "bg-neutral-900" : "bg-neutral-200"}`} />
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {error && (
                  <div
                    className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 font-['Satoshi'] text-sm font-medium leading-5 text-red-700"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {step === 0 ? (
                    // Step 1: Basic info form (single page with all fields)
                    <motion.div
                      key="basic-info"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-6"
                    >
                      {/* UX improvement: Friendly greeting and value proposition */}
                      <div>
                        <h1 className="mb-2 font-['Clash_Display'] text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">
                          {greeting}
                        </h1>
                        <p className="mb-6 font-['Satoshi'] text-sm font-normal leading-5 text-neutral-600 md:text-base">
                          Tell us a bit about yourself to personalize your experience
                        </p>
                      </div>

                      {/* Name field - required, pre-filled from Google */}
                      <div>
                        <label htmlFor="fullName" className={LABEL_CLASS}>
                          Name
                        </label>
                        <input
                          ref={nameInputRef}
                          type="text"
                          id="fullName"
                          value={form.fullName}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, fullName: e.target.value }))
                          }
                          placeholder="Your name"
                          className={INPUT_CLASS}
                          required
                          autoComplete="name"
                        />
                      </div>

                      {/* College field - optional */}
                      <div>
                        <label htmlFor="college" className={LABEL_OPTIONAL_CLASS}>
                          College / University <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          id="college"
                          value={form.college}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, college: e.target.value }))
                          }
                          placeholder="e.g. MIT"
                          className={INPUT_CLASS}
                          autoComplete="organization"
                        />
                      </div>

                      {/* Year of Study - optional */}
                      <div>
                        <label htmlFor="yearOfStudy" className={LABEL_OPTIONAL_CLASS}>
                          Year of Study <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <select
                          id="yearOfStudy"
                          value={form.yearOfStudy}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, yearOfStudy: e.target.value }))
                          }
                          className={INPUT_CLASS}
                        >
                          <option value="">Select…</option>
                          {YEAR_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {form.yearOfStudy === "Other" && (
                          <input
                            type="text"
                            placeholder="Specify (optional)"
                            className={`mt-3 ${INPUT_CLASS}`}
                            value={otherYearText}
                            onChange={(e) => setOtherYearText(e.target.value)}
                          />
                        )}
                      </div>

                      {/* Course field - optional */}
                      <div>
                        <label htmlFor="course" className={LABEL_OPTIONAL_CLASS}>
                          Course / Major <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          id="course"
                          value={form.course}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, course: e.target.value }))
                          }
                          placeholder="e.g. Computer Science"
                          className={INPUT_CLASS}
                          autoComplete="organization"
                        />
                      </div>

                      {/* UX improvement: Newsletter checkbox inline, not separate step */}
                      <div className="rounded-2xl border-2 border-neutral-900 bg-purple-50 p-4">
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newsletterSubscribed}
                            onChange={(e) => setNewsletterSubscribed(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-2 border-neutral-900 text-purple-500 focus:ring-2 focus:ring-purple-500"
                          />
                          <div className="ml-3">
                            <span className="font-['Satoshi'] text-sm font-medium leading-5 text-neutral-900">
                              Subscribe to newsletter
                            </span>
                            <p className="font-['Satoshi'] text-xs font-normal leading-4 text-neutral-600 mt-0.5">
                              Get weekly wisdom, tips, and exclusive student insights
                            </p>
                          </div>
                        </label>
                      </div>
                    </motion.div>
                  ) : (
                    // Step 2: Phone collection (required)
                    <motion.div
                      key="phone-collection"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <h1 className="mb-2 font-['Clash_Display'] text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">
                        Verify your phone number
                      </h1>
                      <p className="mb-4 font-['Satoshi'] text-sm font-normal leading-5 text-neutral-600 md:text-base">
                        We'll send a verification code to this number to keep your account secure.
                      </p>

                      {!otpSent ? (
                        <div className="space-y-4">
                          <label htmlFor="phone" className={LABEL_CLASS}>
                            Phone
                          </label>
                          <PhoneInput
                            value={phone}
                            onChange={setPhone}
                            onCountryChange={setCountryCode}
                            defaultCountry={countryCode}
                            className={INPUT_CLASS}
                            placeholder="1234567890"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="font-['Satoshi'] text-sm text-neutral-600">
                            Code sent to {countryCode} {phone}
                          </p>
                          <label htmlFor="otp" className={LABEL_CLASS}>
                            Verification code
                          </label>
                          <input
                            type="text"
                            id="otp"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="123456"
                            className={INPUT_CLASS}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  {step === 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStep(0);
                        setError(null);
                        setPhone("");
                        setOtpSent(false);
                        setOtpCode("");
                      }}
                      disabled={submitting || verifying || sendingOtp}
                      className={BTN_SECONDARY}
                    >
                      Back
                    </button>
                  )}
                  
                  {step === 0 ? (
                    // Step 1: Basic info - continue to phone step
                    <button
                      type="submit"
                      disabled={!canSubmit || submitting}
                      className={`${BTN_PRIMARY} w-full`}
                    >
                      Continue
                    </button>
                  ) : step === 1 && !otpSent ? (
                    // Step 2: Phone collection - send OTP for verification
                    <button
                      type="submit"
                      disabled={!phone.trim() || sendingOtp || verifying}
                      className={`${BTN_PRIMARY} ${step === 1 ? "flex-1" : "w-full"}`}
                    >
                      {sendingOtp ? "Sending…" : "Send code"}
                    </button>
                  ) : step === 1 && otpSent ? (
                    // Step 2: Phone verification - verify OTP
                    <>
                      <button
                        type="button"
                        onClick={() => void handleRequestNewCode()}
                        disabled={verifying || sendingOtp || cooldownSeconds > 0}
                        className={BTN_SECONDARY}
                      >
                        {sendingOtp 
                          ? "Sending…" 
                          : cooldownSeconds > 0 
                            ? `Request new code (${cooldownSeconds}s)`
                            : "Request new code"}
                      </button>
                      <button
                        type="submit"
                        disabled={!otpCode.trim() || verifying}
                        className={`${BTN_PRIMARY} flex-1`}
                      >
                        {verifying ? "Verifying…" : "Verify & Continue"}
                      </button>
                    </>
                  ) : null}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
