import { AnimatePresence, motion } from "framer-motion";
import { capturePostHog } from "~/lib/posthog";
import { useEffect, useRef, useState } from "react";
import { redirect, useNavigate } from "react-router";
import { Header } from "~/components";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
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

const TOTAL_STEPS = 5;

const YEAR_OPTIONS = [
  "First year",
  "Second year",
  "Third year",
  "Fourth year",
  "Final year",
  "Postgraduate",
  "Graduated",
  "Working professional",
  "Other",
];

const REFERRAL_SOURCE_OPTIONS = [
  "Instagram",
  "Google",
  "Friends/family",
  "LinkedIn",
  "Twitter",
  "Reddit",
  "WhatsApp",
];

const INPUT_CLASS =
  "w-full rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-base font-normal leading-6 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";
const BTN_PRIMARY =
  "rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none";
const BTN_SKIP =
  "rounded-2xl border-2 border-neutral-200 bg-white px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-500";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");

  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (onboardingStatus.complete) {
    throw redirect("/");
  }

  return {
    userName: session.user.name || null,
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome to Studojo | Complete your profile" },
    { name: "description", content: "Tell us a bit about yourself to personalize your experience." },
  ];
}

export default function Onboarding({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [fullName, setFullName] = useState(loaderData.userName || "");
  const [college, setCollege] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [course, setCourse] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    // Focus the input when slide changes
    setTimeout(() => inputRef.current?.focus(), 350);
  }, [step]);

  const greeting = loaderData.userName
    ? `Hi, ${loaderData.userName.split(" ")[0]}!`
    : "Hi there!";

  const goForward = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    setError(null);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
    setError(null);
  };

  const createProfileWithName = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, college: "", yearOfStudy: "", course: "" }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          // Profile already exists, that's fine
          setProfileCreated(true);
          goForward();
          return;
        }
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setProfileCreated(true);
      goForward();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = async (field: string, value: string) => {
    if (!value.trim()) return;
    try {
      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
        credentials: "include",
      });
    } catch {
      // Non-critical | field update failed but profile exists
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!fullName.trim()) {
        setError("Please enter your name");
        return;
      }
      await createProfileWithName();
    } else if (step === 1) {
      if (college.trim()) await updateField("college", college);
      goForward();
    } else if (step === 2) {
      if (yearOfStudy) await updateField("yearOfStudy", yearOfStudy);
      goForward();
    } else if (step === 3) {
      setSubmitting(true);
      if (course.trim()) await updateField("course", course);
      if (newsletterSubscribed) {
        try {
          await fetch("/api/onboarding", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newsletterSubscribed: true }),
            credentials: "include",
          });
        } catch {}
      }
      setSubmitting(false);
      goForward();
    } else if (step === 4) {
      if (referralSource) await updateField("referralSource", referralSource);
      capturePostHog("onboarding_completed", { referral_source: referralSource || null });
      navigate("/", { replace: true });
    }
  };

  const handleSkip = async () => {
    if (step === TOTAL_STEPS - 1) {
      // Last step | finish
      navigate("/", { replace: true });
    } else {
      goForward();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitting) {
      e.preventDefault();
      handleNext();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

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
              {/* Progress bar */}
              <div className="mb-6">
                <span className="font-['Satoshi'] text-sm font-medium leading-5 text-neutral-500">
                  Step {step + 1} of {TOTAL_STEPS}
                </span>
                <div
                  className="mt-2 flex gap-1"
                  role="progressbar"
                  aria-valuenow={step + 1}
                  aria-valuemin={1}
                  aria-valuemax={TOTAL_STEPS}
                  aria-label="Progress"
                >
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        i <= step ? "bg-neutral-900" : "bg-neutral-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div
                  className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 font-['Satoshi'] text-sm font-medium leading-5 text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="min-h-[200px]" onKeyDown={handleKeyDown}>
                <AnimatePresence mode="wait" custom={direction}>
                  {step === 0 && (
                    <motion.div
                      key="name"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-5"
                    >
                      <div>
                        <h1 className="mb-2 font-['Clash_Display'] text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">
                          {greeting} What should we call you?
                        </h1>
                        <p className="font-['Satoshi'] text-sm font-normal leading-5 text-neutral-500">
                          So we can personalize your experience
                        </p>
                      </div>
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className={INPUT_CLASS}
                        autoComplete="name"
                        autoFocus
                      />
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="college"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-5"
                    >
                      <div>
                        <h1 className="mb-2 font-['Clash_Display'] text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">
                          Where do you study?
                        </h1>
                        <p className="font-['Satoshi'] text-sm font-normal leading-5 text-neutral-500">
                          We'll show you opportunities at your university
                        </p>
                      </div>
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. MIT, IIT Delhi, Oxford"
                        className={INPUT_CLASS}
                        autoComplete="organization"
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="year"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-5"
                    >
                      <div>
                        <h1 className="mb-2 font-['Clash_Display'] text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">
                          What year are you in?
                        </h1>
                        <p className="font-['Satoshi'] text-sm font-normal leading-5 text-neutral-500">
                          We'll tailor content to your academic stage
                        </p>
                      </div>
                      <select
                        ref={inputRef as React.RefObject<HTMLSelectElement>}
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        className={INPUT_CLASS}
                      >
                        <option value="">Select your year...</option>
                        {YEAR_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="course"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-5"
                    >
                      <div>
                        <h1 className="mb-2 font-['Clash_Display'] text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">
                          What are you studying?
                        </h1>
                        <p className="font-['Satoshi'] text-sm font-normal leading-5 text-neutral-500">
                          We'll recommend tools relevant to your field
                        </p>
                      </div>
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="e.g. Computer Science, Business, Medicine"
                        className={INPUT_CLASS}
                        autoComplete="organization"
                      />
                      <div className="rounded-2xl border-2 border-neutral-200 bg-purple-50 p-4">
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
                            <p className="font-['Satoshi'] text-xs font-normal leading-4 text-neutral-500 mt-0.5">
                              Weekly tips, opportunities, and student insights
                            </p>
                          </div>
                        </label>
                      </div>
                    </motion.div>
                  )}
                  {step === 4 && (
                    <motion.div
                      key="referral"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-5"
                    >
                      <div>
                        <h1 className="mb-2 font-['Clash_Display'] text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">
                          Where did you hear about us?
                        </h1>
                        <p className="font-['Satoshi'] text-sm font-normal leading-5 text-neutral-500">
                          Help us understand how you found Studojo
                        </p>
                      </div>
                      <select
                        ref={inputRef as React.RefObject<HTMLSelectElement>}
                        value={referralSource}
                        onChange={(e) => setReferralSource(e.target.value)}
                        className={INPUT_CLASS}
                      >
                        <option value="">Select an option...</option>
                        {REFERRAL_SOURCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={submitting}
                    className="rounded-2xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-sm font-medium leading-6 text-neutral-700 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                  >
                    ←
                  </button>
                )}
                <div className="flex flex-1 gap-3 justify-end">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={submitting}
                      className={BTN_SKIP}
                    >
                      Skip
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={submitting || (step === 0 && !fullName.trim())}
                    className={`${BTN_PRIMARY} flex-1`}
                  >
                    {submitting
                      ? "Please wait…"
                      : step === TOTAL_STEPS - 1
                        ? "Get Started"
                        : "Next →"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
