import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import { Header } from "~/components/common/header";

const QUOTES = [
  { text: "We're analysing your responses and building a profile that actually reflects who you are.", author: "Career Intelligence" },
  { text: "Most outreach fails because it's generic. Yours won't be.", author: "Studojo" },
  { text: "The best opportunities don't come from job boards. They come from the right person knowing you exist.", author: "Studojo" },
  { text: "Mapping your skills, goals and personality to the roles that actually fit.", author: "Career Intelligence" },
  { text: "Work on things that matter. We'll find the people who make that possible.", author: "Studojo" },
  { text: "Good outreach is personal. We're making sure yours is.", author: "Studojo" },
  { text: "Identifying the decision makers who are most likely to respond to someone like you.", author: "Lead Intelligence" },
  { text: "You answered 13 questions. We're turning that into your competitive edge.", author: "Career Intelligence" },
];

export default function OnboardingLoadingPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, setCurrentStep } = useOutreachStore();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dots, setDots] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const pollingRef = useRef(false);

  // Rotate quotes with fade
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    return () => clearInterval(interval);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll profile until LLM data is ready, then navigate
  useEffect(() => {
    if (authLoading || !candidateId || pollingRef.current) return;
    pollingRef.current = true;

    (async () => {
      let lastData: any = null;
      for (let i = 0; i < 60; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 2000));
        try {
          const data = await outreachFetch<any>(`/candidate/${candidateId}/profile`);
          lastData = data;
          const parsed = data?.parsed_json;
          if (parsed?.profile_summary || parsed?.career_analysis) {
            setCurrentStep(3);
            navigate("/outreach/onboarding/profile");
            return;
          }
        } catch {}
      }
      // Timeout after ~2 min — go anyway
      setCurrentStep(3);
      navigate("/outreach/onboarding/profile");
    })();
  }, [candidateId, authLoading]);

  const quote = QUOTES[quoteIndex];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">

        {/* Animated logo mark */}
        <div className="relative mb-10">
          {/* Outer pulse rings */}
          <div className="absolute inset-0 rounded-full bg-studojo-purple/10 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-[-8px] rounded-full bg-studojo-purple/6 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />
          {/* Inner spinner */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-studojo-purple to-studojo-pink flex items-center justify-center border-2 border-studojo-ink shadow-brutal">
            <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Status line */}
        <h1 className="font-clash text-2xl md:text-3xl font-bold text-studojo-ink mb-2">
          Building your profile{".".repeat(dots)}
        </h1>
        <p className="text-sm text-studojo-muted font-satoshi mb-12">
          {elapsed < 15
            ? "Analysing your answers with AI — usually takes 15–20 seconds"
            : elapsed < 40
            ? "Almost there — finalising your Career DNA and role matches"
            : "Taking a bit longer than usual — hang tight"}
        </p>

        {/* Quote card with fade transition */}
        <div
          className="max-w-md transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div className="rounded-2xl border-2 border-studojo-ink/8 bg-studojo-surface-muted/60 p-6 shadow-sm">
            <p className="text-base font-satoshi text-studojo-ink leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs font-satoshi text-studojo-purple font-semibold mt-3 uppercase tracking-wide">
              — {quote.author}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mt-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-full bg-studojo-purple transition-all duration-300"
              style={{
                width: i === (Math.floor(elapsed / 2) % 5) ? "24px" : "8px",
                height: "8px",
                opacity: i === (Math.floor(elapsed / 2) % 5) ? 1 : 0.25,
              }}
            />
          ))}
        </div>

        {/* Skip option after 30s */}
        {elapsed >= 30 && (
          <button
            onClick={() => { setCurrentStep(3); navigate("/outreach/onboarding/profile"); }}
            className="mt-8 text-sm text-studojo-muted font-satoshi underline underline-offset-2 hover:text-studojo-ink transition-colors"
          >
            Continue anyway →
          </button>
        )}
      </div>
    </div>
  );
}
