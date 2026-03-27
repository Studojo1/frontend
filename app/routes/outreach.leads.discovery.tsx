import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { FiCheck, FiSearch, FiUsers, FiBarChart2 } from "react-icons/fi";
import { RiRobot2Fill } from "react-icons/ri";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const stages = [
  { icon: RiRobot2Fill, label: "Analyzing your profile", duration: 2000 },
  { icon: FiSearch, label: "Mapping roles & filters", duration: 3000 },
  { icon: FiUsers, label: "Finding decision makers", duration: 8000 },
  { icon: FiBarChart2, label: "Scoring & ranking leads", duration: 4000 },
];

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId } = useOutreachStore();
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");
  const [leadCount, setLeadCount] = useState(0);
  const counterRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (authLoading || !candidateId) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    stages.forEach((stage, i) => {
      elapsed += stage.duration;
      timers.push(setTimeout(() => setCurrentStage(i + 1), elapsed));
    });

    // Start counter at stage 2 (Mapping roles) — ramps up across stages 2-4
    timers.push(
      setTimeout(() => {
        counterRef.current = setInterval(() => {
          setLeadCount((c) => {
            // Starts slow, accelerates through stage 3, slows near realistic cap
            const base = c < 1000 ? 18 : c < 3000 ? 12 : 6;
            const increment = Math.floor(Math.random() * base) + Math.floor(base / 2);
            return c + increment;
          });
        }, 300);
      }, 2000)
    );

    outreachFetch("/discovery/search", {
      method: "POST",
      body: JSON.stringify({ candidate_id: candidateId }),
    })
      .then(() => {
        const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
        setTimeout(() => navigate("/outreach/leads/results"), Math.max(0, totalDuration - 1000));
      })
      .catch((err) => {
        setError(err?.body?.detail || err.message || "Lead discovery failed");
      });

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(counterRef.current);
    };
  }, [candidateId, authLoading, navigate]);

  if (!candidateId) {
    navigate("/outreach/onboarding/upload");
    return null;
  }

  const progress = Math.min(((currentStage) / stages.length) * 100, 100);
  const allDone = currentStage >= stages.length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {error ? (
          <div className="max-w-md w-full rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
              <span className="text-2xl">!</span>
            </div>
            <p className="text-red-600 text-sm font-satoshi mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="h-11 px-6 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-semibold border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="max-w-lg w-full text-center">
            {/* Animated ring */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              {/* Outer ring track */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#f5f5f5" strokeWidth="6" />
                <circle
                  cx="80" cy="80" r="70"
                  fill="none"
                  stroke={allDone ? "#10b981" : "#8b5cf6"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {allDone ? (
                  <FiCheck className="w-10 h-10 text-studojo-green animate-fade-in" />
                ) : (
                  <>
                    <div className="w-10 h-10 border-[3px] border-studojo-purple/20 border-t-studojo-purple rounded-full animate-spin" />
                  </>
                )}
              </div>

              {/* Pulse rings */}
              {!allDone && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-studojo-purple/10 animate-ping" style={{ animationDuration: "2s" }} />
                </>
              )}
            </div>

            {/* Stage label */}
            <h2 className="font-clash text-xl font-bold text-studojo-ink mb-2">
              {allDone ? "Discovery Complete" : stages[Math.min(currentStage, stages.length - 1)]?.label}
            </h2>
            <p className="text-sm text-studojo-muted font-satoshi mb-8">
              {allDone
                ? "We found your leads. Redirecting..."
                : "We're scanning thousands of profiles to find the right people."
              }
            </p>

            {/* Live counter */}
            {leadCount > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-studojo-purple-bg border border-studojo-purple/20 mb-8 animate-fade-in">
                <FiUsers className="w-4 h-4 text-studojo-purple" />
                <span className="font-clash text-lg font-bold text-studojo-purple">{leadCount}</span>
                <span className="text-xs font-satoshi text-studojo-muted">professionals scanned</span>
              </div>
            )}

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-10">
              {stages.map((_, i) => {
                const done = currentStage > i;
                const active = currentStage === i;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                        done
                          ? "bg-studojo-green text-white scale-100"
                          : active
                          ? "bg-studojo-purple text-white scale-110 shadow-lg shadow-studojo-purple/30"
                          : "bg-studojo-surface-muted text-studojo-muted border border-studojo-ink/10"
                      }`}
                    >
                      {done ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    {i < stages.length - 1 && (
                      <div className={`w-8 h-0.5 rounded-full transition-all duration-500 ${done ? "bg-studojo-green" : "bg-studojo-ink/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Skeleton preview cards */}
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => {
                const visible = currentStage > 2;
                return (
                  <div
                    key={i}
                    className={`rounded-xl border border-studojo-ink/10 bg-studojo-surface-muted p-4 transition-all duration-700 ${
                      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <div className="h-3 bg-studojo-ink/8 rounded-full animate-pulse mb-3 w-3/4" />
                    <div className="h-2.5 bg-studojo-ink/5 rounded-full animate-pulse mb-2 w-full" />
                    <div className="h-2.5 bg-studojo-ink/5 rounded-full animate-pulse w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
