import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { FiCheck, FiSearch, FiUsers, FiBarChart2, FiBriefcase } from "react-icons/fi";
import { RiRobot2Fill } from "react-icons/ri";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

// Phase 1: discovery stages (run while /discovery/search is in-flight, ~70s)
const DISCOVERY_STAGES = [
  { icon: RiRobot2Fill, label: "Building your professional profile...", duration: 4000 },
  { icon: FiSearch, label: "Mapping your niche across the market...", duration: 5000 },
  { icon: FiUsers, label: "Identifying decision-makers at target companies...", duration: 18000 },
  { icon: FiBarChart2, label: "Filtering for the highest-signal opportunities...", duration: 8000 },
  { icon: FiBriefcase, label: "Assembling your lead list...", duration: 60000 },
];

// Phase 2: scoring stages (run while polling /discovery/scoring-ready, ~90s)
const SCORING_STAGES = [
  { icon: FiBarChart2, label: "Analysing fit across hundreds of companies..." },
  { icon: RiRobot2Fill, label: "Crafting your personalised outreach intel..." },
];

const PREVIEW_POOL = [
  { initials: "AR", name: "Arjun R.", title: "Engineering Manager", company: "Razorpay", location: "Bangalore", color: "bg-studojo-purple" },
  { initials: "SK", name: "Shreya K.", title: "Product Director", company: "Meesho", location: "Bangalore", color: "bg-studojo-pink" },
  { initials: "NP", name: "Nikhil P.", title: "Head of Engineering", company: "CRED", location: "Bangalore", color: "bg-emerald-500" },
  { initials: "AM", name: "Aditya M.", title: "CTO", company: "Licious", location: "Bangalore", color: "bg-amber-500" },
  { initials: "RS", name: "Rohan S.", title: "VP Engineering", company: "PhonePe", location: "Bangalore", color: "bg-blue-500" },
  { initials: "PT", name: "Priya T.", title: "Founding Engineer", company: "Sarvam AI", location: "Bangalore", color: "bg-rose-500" },
  { initials: "DL", name: "David L.", title: "Head of Product", company: "Stripe", location: "San Francisco", color: "bg-indigo-500" },
  { initials: "JW", name: "Jamie W.", title: "Engineering Lead", company: "Vercel", location: "Remote", color: "bg-studojo-purple" },
  { initials: "MC", name: "Maya C.", title: "VP Engineering", company: "Deel", location: "New York", color: "bg-teal-500" },
  { initials: "RK", name: "Raj K.", title: "Director of Engineering", company: "Zepto", location: "Mumbai", color: "bg-orange-500" },
  { initials: "SB", name: "Siddharth B.", title: "Co-founder & CTO", company: "Krutrim", location: "Bangalore", color: "bg-studojo-pink" },
  { initials: "LN", name: "Lena N.", title: "Principal Engineer", company: "Figma", location: "London", color: "bg-emerald-500" },
  { initials: "VM", name: "Varun M.", title: "Head of Data", company: "Groww", location: "Bangalore", color: "bg-violet-500" },
  { initials: "TH", name: "Tanya H.", title: "Engineering Manager", company: "Notion", location: "Remote", color: "bg-amber-500" },
  { initials: "AS", name: "Aryan S.", title: "Director of Product", company: "Slice", location: "Bangalore", color: "bg-blue-500" },
  { initials: "KP", name: "Kiran P.", title: "Founding Engineer", company: "Ola Krutrim", location: "Bangalore", color: "bg-rose-500" },
];

const _startOffset = Math.floor(Math.random() * PREVIEW_POOL.length);

const POLL_INTERVAL_MS = 5000;

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId } = useOutreachStore();

  // Phase 1: discovery stage index (0..DISCOVERY_STAGES.length)
  const [discoveryStage, setDiscoveryStage] = useState(0);
  // Phase 2: true once /discovery/search resolves
  const [scoringPhase, setScoringPhase] = useState(false);
  const [scoringStage, setScoringStage] = useState(0);
  // bullets progress 0-500
  const [bulletsCount, setBulletsCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [error, setError] = useState("");
  const [leadCount, setLeadCount] = useState(0);
  const [previewOffset, setPreviewOffset] = useState(_startOffset);

  const counterRef = useRef<ReturnType<typeof setInterval>>();
  const cycleRef = useRef<ReturnType<typeof setInterval>>();
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const cardsVisible = discoveryStage >= 2;

  const previewLeads = Array.from({ length: 4 }, (_, i) =>
    PREVIEW_POOL[(previewOffset + i) % PREVIEW_POOL.length]
  );

  useEffect(() => {
    if (authLoading || !candidateId) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // ── Phase 1: advance discovery stages on a timer ──────────────────────
    let elapsed = 0;
    const lastIdx = DISCOVERY_STAGES.length - 1;
    DISCOVERY_STAGES.forEach((stage, i) => {
      elapsed += stage.duration;
      if (i < lastIdx) {
        timers.push(setTimeout(() => setDiscoveryStage(i + 1), elapsed));
      } else {
        timers.push(setTimeout(() => setDiscoveryStage(lastIdx), elapsed - stage.duration));
      }
    });

    // Lead counter: ramps to 500 starting at stage 2
    timers.push(
      setTimeout(() => {
        counterRef.current = setInterval(() => {
          setLeadCount((c) => {
            if (c >= 500) { clearInterval(counterRef.current); return 500; }
            const remaining = 500 - c;
            return c + Math.min(Math.floor(Math.random() * 15) + 8, remaining);
          });
        }, 300);
      }, 2000)
    );

    // Card preview cycles every 2.5s from stage 2 onward
    const cycleStart = setTimeout(() => {
      cycleRef.current = setInterval(() => {
        setPreviewOffset((o) => (o + 4) % PREVIEW_POOL.length);
      }, 2500);
    }, DISCOVERY_STAGES[0].duration + DISCOVERY_STAGES[1].duration);
    timers.push(cycleStart);

    // ── Call /discovery/search ────────────────────────────────────────────
    outreachFetch("/discovery/search", {
      method: "POST",
      body: JSON.stringify({ candidate_id: candidateId }),
      timeout: 300_000,
      maxRetries: 1,
    })
      .then(() => {
        // Discovery done — mark all discovery stages complete, enter scoring phase
        setDiscoveryStage(DISCOVERY_STAGES.length);
        setScoringPhase(true);
        setScoringStage(0);

        // ── Phase 2: poll /discovery/scoring-ready until bullets ready ──
        let scoringTick = 0;
        pollRef.current = setInterval(async () => {
          scoringTick++;
          // Alternate scoring stage label every ~15s
          setScoringStage(Math.floor(scoringTick / 3) % SCORING_STAGES.length);

          try {
            const data = await outreachFetch(`/discovery/scoring-ready/${candidateId}`, {
              method: "GET",
            });
            if (data?.with_bullets != null) {
              setBulletsCount(data.with_bullets);
            }
            if (data?.ready) {
              clearInterval(pollRef.current);
              setAllDone(true);
              setTimeout(() => navigate("/outreach/leads/results"), 800);
            }
          } catch {
            // Non-fatal — keep polling
          }
        }, POLL_INTERVAL_MS);
      })
      .catch((err) => {
        setError(err?.body?.detail || err.message || "Lead discovery failed");
      });

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(counterRef.current);
      clearInterval(cycleRef.current);
      clearInterval(pollRef.current);
    };
  }, [candidateId, authLoading, navigate]);

  if (!candidateId) {
    navigate("/outreach/onboarding/upload");
    return null;
  }

  // Progress:
  // 0-50%: discovery stages
  // 50-95%: scoring phase (based on bullets written)
  // 100%: done
  let progress: number;
  if (allDone) {
    progress = 100;
  } else if (scoringPhase) {
    const bulletFraction = Math.min(bulletsCount / 500, 1);
    progress = 50 + bulletFraction * 45;
  } else {
    progress = Math.min((discoveryStage / DISCOVERY_STAGES.length) * 50, 47);
  }

  const totalStages = DISCOVERY_STAGES.length + SCORING_STAGES.length;
  const currentStageIdx = scoringPhase
    ? DISCOVERY_STAGES.length + scoringStage
    : discoveryStage;

  const stageLabel = allDone
    ? "Discovery Complete"
    : scoringPhase
    ? SCORING_STAGES[scoringStage]?.label
    : DISCOVERY_STAGES[Math.min(discoveryStage, DISCOVERY_STAGES.length - 1)]?.label;

  const subLabel = allDone
    ? "Your leads are ready. Taking you there now..."
    : scoringPhase
    ? `Personalising ${bulletsCount > 0 ? bulletsCount.toLocaleString() : "your"} leads — almost there...`
    : "Our AI is working across thousands of data points to find your best opportunities.";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-12">
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
          <div className="w-full max-w-lg text-center">
            {/* Animated ring */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-6">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {allDone ? (
                  <FiCheck className="w-10 h-10 text-studojo-green" />
                ) : (
                  <div className="w-10 h-10 border-[3px] border-studojo-purple/20 border-t-studojo-purple rounded-full animate-spin" />
                )}
              </div>
              {!allDone && (
                <div className="absolute inset-0 rounded-full border-2 border-studojo-purple/10 animate-ping" style={{ animationDuration: "2s" }} />
              )}
            </div>

            {/* Stage label */}
            <h2 className="font-clash text-xl sm:text-2xl font-bold text-studojo-ink mb-1">
              {stageLabel}
            </h2>
            <p className="text-sm text-studojo-muted font-satoshi mb-5">{subLabel}</p>

            {/* Live counter */}
            {leadCount > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-studojo-purple/8 border border-studojo-purple/20 mb-6">
                <FiUsers className="w-4 h-4 text-studojo-purple" />
                <span className="font-clash text-lg font-bold text-studojo-purple">{leadCount.toLocaleString()}</span>
                <span className="text-xs font-satoshi text-studojo-muted">
                  {scoringPhase && bulletsCount > 0
                    ? `leads found · ${bulletsCount.toLocaleString()} personalised`
                    : "professionals scanned"}
                </span>
              </div>
            )}

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {Array.from({ length: totalStages }).map((_, i) => {
                const done = currentStageIdx > i;
                const active = currentStageIdx === i;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                        done
                          ? "bg-studojo-green text-white"
                          : active
                          ? "bg-studojo-purple text-white scale-110 shadow-lg shadow-studojo-purple/30"
                          : "bg-studojo-surface-muted text-studojo-muted border border-studojo-ink/10"
                      }`}
                    >
                      {done ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    {i < totalStages - 1 && (
                      <div className={`w-6 h-0.5 rounded-full transition-all duration-500 ${done ? "bg-studojo-green" : "bg-studojo-ink/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lead preview cards */}
            <div className="grid grid-cols-2 gap-3">
              {previewLeads.map((lead, i) => (
                <div
                  key={i}
                  className={`rounded-xl border border-studojo-ink/10 bg-white p-3 sm:p-4 text-left transition-all duration-700 ${
                    cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {cardsVisible ? (
                      <div className={`w-8 h-8 rounded-full ${lead.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold font-satoshi">{lead.initials}</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-studojo-ink/8 animate-pulse flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      {cardsVisible ? (
                        <p className="text-xs font-satoshi font-semibold text-studojo-ink truncate">{lead.name}</p>
                      ) : (
                        <div className="h-2.5 bg-studojo-ink/8 rounded-full animate-pulse w-16" />
                      )}
                    </div>
                  </div>
                  {cardsVisible ? (
                    <>
                      <div className="flex items-center gap-1 mb-1">
                        <FiBriefcase className="w-3 h-3 text-studojo-muted flex-shrink-0" />
                        <p className="text-xs font-satoshi text-studojo-muted truncate">{lead.title}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiBriefcase className="w-3 h-3 text-studojo-muted flex-shrink-0 opacity-0" />
                        <p className="text-xs font-satoshi text-studojo-muted truncate">{lead.company}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-2 bg-studojo-ink/5 rounded-full animate-pulse mb-1.5 w-full" />
                      <div className="h-2 bg-studojo-ink/5 rounded-full animate-pulse w-2/3" />
                    </>
                  )}
                </div>
              ))}
            </div>

            {cardsVisible && (
              <p className="text-xs text-studojo-muted font-satoshi mt-3">
                {scoringPhase
                  ? "Analysing each company and writing your personalised insights..."
                  : "+ many more being ranked for you..."}
              </p>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
