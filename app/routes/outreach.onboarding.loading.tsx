import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import { Header } from "~/components/common/header";

const QUOTES = [
  { text: "The best opportunities don't come from job boards. They come from the right person knowing you exist.", author: "Studojo" },
  { text: "Your network is your net worth.", author: "Porter Gale" },
  { text: "Work on things that matter. We'll find the people who make that possible.", author: "Studojo" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Most outreach fails because it's generic. Yours won't be.", author: "Studojo" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Finding the hiring managers most likely to respond to someone like you.", author: "Studojo" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Your answers just became your competitive edge.", author: "Studojo" },
  { text: "The people who get hired aren't always the most qualified. They're the most visible to the right people.", author: "Studojo" },
];

const STEPS = [
  { label: "Reading your answers", icon: "📋" },
  { label: "Building your Career DNA", icon: "🧬" },
  { label: "Matching you to roles", icon: "🎯" },
  { label: "Profile ready", icon: "✓" },
];

export default function OnboardingLoadingPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, setCurrentStep, setProfileData } = useOutreachStore();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepsComplete, setStepsComplete] = useState(false);
  const pollingRef = useRef(false);

  // Rotate quotes every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setFadeIn(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Steps advance quickly — processing is fast now
  useEffect(() => {
    const timers = [
      setTimeout(() => setStepIndex(1), 400),
      setTimeout(() => setStepIndex(2), 900),
      setTimeout(() => setStepIndex(3), 1500),
      setTimeout(() => setStepsComplete(true), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Poll until profile data is ready
  useEffect(() => {
    if (authLoading || !candidateId || pollingRef.current) return;
    pollingRef.current = true;

    (async () => {
      for (let i = 0; i < 60; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 2000));
        try {
          const data = await outreachFetch<any>(`/candidate/${candidateId}/profile`);
          const parsed = data?.parsed_json;
          if (parsed?.profile_summary || parsed?.career_analysis) {
            setProfileData(data);
            setCurrentStep(3);
            navigate("/outreach/onboarding/profile");
            return;
          }
        } catch {}
      }
      setCurrentStep(3);
      navigate("/outreach/onboarding/profile");
    })();
  }, [candidateId, authLoading]);

  const quote = QUOTES[quoteIndex];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 text-center">

        {/* Animated orb */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full bg-studojo-purple/8 animate-ping" style={{ animationDuration: "2.5s" }} />
          <div className="absolute w-24 h-24 rounded-full bg-studojo-purple/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(139,92,246,0.4)] transition-all duration-500 ${
            stepsComplete
              ? "bg-studojo-green"
              : "bg-gradient-to-br from-studojo-purple via-[#a855f7] to-studojo-pink"
          }`}>
            {stepsComplete ? (
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-clash text-2xl sm:text-3xl font-bold text-studojo-ink mb-1">
          {stepsComplete ? "Profile built" : "Building your profile"}
        </h1>
        <p className="text-sm text-studojo-muted font-satoshi mb-8 max-w-xs">
          {stepsComplete ? "Loading your results…" : "Analysing your answers and resume."}
        </p>

        {/* Step checklist */}
        <div className="w-full max-w-xs mb-8 text-left space-y-2">
          {STEPS.map((step, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex && !stepsComplete;
            const complete = stepsComplete && i === STEPS.length - 1;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  done || complete
                    ? "bg-studojo-green/8 border border-studojo-green/20"
                    : active
                    ? "bg-studojo-purple/8 border border-studojo-purple/20"
                    : "bg-studojo-surface-muted/50 border border-transparent"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  done || complete ? "bg-studojo-green" : active ? "bg-studojo-purple" : "bg-studojo-ink/10"
                }`}>
                  {done || complete ? (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : active ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-studojo-ink/20" />
                  )}
                </div>
                <span className={`text-sm font-satoshi transition-colors duration-300 ${
                  done || complete ? "text-studojo-green font-medium"
                  : active ? "text-studojo-purple font-semibold"
                  : "text-studojo-muted"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quote card */}
        <div
          className="max-w-sm w-full transition-opacity duration-300"
          style={{ opacity: fadeIn ? 1 : 0 }}
        >
          <div className="rounded-2xl bg-studojo-surface-muted/60 border border-studojo-ink/8 px-6 py-5">
            <p className="text-sm sm:text-base font-satoshi text-studojo-ink leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs font-satoshi text-studojo-purple font-semibold mt-3 uppercase tracking-wide">
              {quote.author}
            </p>
          </div>
        </div>

        <SkipButton onSkip={() => { setCurrentStep(3); navigate("/outreach/onboarding/profile"); }} />
      </div>
    </div>
  );
}

function SkipButton({ onSkip }: { onSkip: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={onSkip}
      className="mt-8 text-xs text-studojo-muted font-satoshi hover:text-studojo-ink transition-colors underline underline-offset-2"
    >
      Taking too long? Continue anyway →
    </button>
  );
}
