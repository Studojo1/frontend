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
  { text: "Mapping your skills, personality and goals to the roles that actually fit you.", author: "Studojo" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Most outreach fails because it's generic. Yours won't be.", author: "Studojo" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You answered 13 questions. We're turning that into your competitive edge.", author: "Studojo" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Identifying the decision makers most likely to respond to someone like you.", author: "Studojo" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
];

const STEPS = [
  "Analysing your responses",
  "Building your Career DNA",
  "Matching you to roles",
  "Finalising your profile",
];

export default function OnboardingLoadingPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, setCurrentStep, setProfileData } = useOutreachStore();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const pollingRef = useRef(false);

  // Rotate quotes with fade every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setFadeIn(true);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Advance step label every ~5s to show progress
  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStepIndex(i), i * 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Poll profile until LLM data is ready
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
            setProfileData(data); // cache so profile page renders instantly
            setCurrentStep(3);
            navigate("/outreach/onboarding/profile");
            return;
          }
        } catch {}
      }
      // Timeout — navigate anyway
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
          <div className="absolute w-24 h-24 rounded-full bg-studojo-purple/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.4s" }} />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-studojo-purple via-[#a855f7] to-studojo-pink flex items-center justify-center shadow-[0_8px_32px_rgba(139,92,246,0.4)]">
            <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Step label */}
        <div className="mb-1 h-8 flex items-center justify-center">
          <p className="text-sm font-satoshi font-semibold text-studojo-purple uppercase tracking-wider">
            {STEPS[stepIndex]}
          </p>
        </div>

        <h1 className="font-clash text-2xl sm:text-3xl font-bold text-studojo-ink mb-1">
          Building your profile
        </h1>
        <p className="text-sm text-studojo-muted font-satoshi mb-8 max-w-xs">
          Usually takes 15–20 seconds. Good things take a moment.
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mb-8">
          <div className="h-1.5 rounded-full bg-studojo-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-studojo-purple to-studojo-pink transition-all duration-[3000ms] ease-out"
              style={{ width: `${Math.min((stepIndex + 1) * 25, 90)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {STEPS.map((s, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${i <= stepIndex ? "bg-studojo-purple" : "bg-studojo-ink/15"}`} />
            ))}
          </div>
        </div>

        {/* Quote card */}
        <div
          className="max-w-sm w-full transition-opacity duration-350"
          style={{ opacity: fadeIn ? 1 : 0 }}
        >
          <div className="rounded-2xl bg-studojo-surface-muted/70 border border-studojo-ink/8 px-6 py-5">
            <p className="text-sm sm:text-base font-satoshi text-studojo-ink leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs font-satoshi text-studojo-purple font-semibold mt-3 uppercase tracking-wide">
              — {quote.author}
            </p>
          </div>
        </div>

        {/* Subtle skip — only after 45s */}
        <SkipButton onSkip={() => { setCurrentStep(3); navigate("/outreach/onboarding/profile"); }} />
      </div>
    </div>
  );
}

function SkipButton({ onSkip }: { onSkip: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 45000);
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
