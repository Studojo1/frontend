import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FiLinkedin, FiCheckCircle, FiAlertCircle, FiSearch, FiUsers, FiZap } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const POLL_INTERVAL_MS = 4000;
const STAGES = [
  { icon: <FiSearch className="w-4 h-4" />, label: "Reading your resume" },
  { icon: <FiUsers className="w-4 h-4" />, label: "Scanning 2,000,000+ profiles" },
  { icon: <FiZap className="w-4 h-4" />, label: "Scoring & ranking your top matches" },
];

export default function LinkedInLeadsDiscovery() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { candidateId } = useOutreachStore();

  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<any>(null);

  // Bounce out if there's no candidate
  useEffect(() => {
    if (!candidateId) {
      const t = setTimeout(() => navigate("/linkedin/onboarding/upload"), 200);
      return () => clearTimeout(t);
    }
  }, [candidateId, navigate]);

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;

    // Walk the user through the three "stages" UI even though the backend
    // is just one search call, feels less janky on a slow connection.
    const stageTimer = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 7000);

    const finish = () => {
      if (cancelled) return;
      setDone(true);
      setTimeout(() => navigate("/linkedin/leads"), 800);
    };

    outreachFetch("/discovery/search", {
      method: "POST",
      body: JSON.stringify({ candidate_id: candidateId }),
      timeout: 300_000,
      maxRetries: 1,
    })
      .then(() => {
        const SCORING_TIMEOUT_MS = 6 * 60 * 1000;
        const startedAt = Date.now();
        pollRef.current = setInterval(async () => {
          if (Date.now() - startedAt >= SCORING_TIMEOUT_MS) {
            clearInterval(pollRef.current);
            finish();
            return;
          }
          try {
            const data = await outreachFetch<any>(`/discovery/scoring-ready/${candidateId}`);
            if (data?.ready) {
              clearInterval(pollRef.current);
              finish();
            }
          } catch {
            // non-fatal, keep polling
          }
        }, POLL_INTERVAL_MS);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.body?.detail || err?.message || "Lead discovery failed");
      });

    return () => {
      cancelled = true;
      clearInterval(stageTimer);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [candidateId, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-16 md:py-24 md:px-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#0a66c2]/10 border-2 border-studojo-ink flex items-center justify-center mx-auto mb-6 text-[#0a66c2] relative">
          <FiLinkedin className="w-10 h-10" />
          {!done && !error && (
            <div className="absolute inset-0 rounded-2xl border-4 border-studojo-purple/30 border-t-studojo-purple animate-spin" />
          )}
        </div>

        <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mb-2">
          {error ? "Something went wrong" : done ? "Done." : "Finding your hiring managers."}
        </h1>
        <p className="text-base text-studojo-muted font-satoshi mb-8">
          {error
            ? error
            : done
            ? "Loading your matches…"
            : "This usually takes about 2 minutes. Hang tight."}
        </p>

        {!error && (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5 text-left max-w-sm mx-auto">
            {STAGES.map((s, i) => {
              const active = i === stage && !done;
              const complete = done || i < stage;
              return (
                <div key={s.label} className="flex items-center gap-3 py-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                    complete
                      ? "bg-studojo-green border-studojo-ink text-white"
                      : active
                      ? "bg-studojo-purple border-studojo-ink text-white"
                      : "bg-white border-studojo-ink/20 text-studojo-muted"
                  }`}>
                    {complete ? <FiCheckCircle className="w-4 h-4" /> : s.icon}
                  </div>
                  <span className={`text-sm font-satoshi ${complete || active ? "text-studojo-ink font-bold" : "text-studojo-muted"}`}>
                    {s.label}
                  </span>
                  {active && (
                    <div className="ml-auto w-3 h-3 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border-2 border-red-200 bg-red-50 p-3 max-w-sm mx-auto flex items-start gap-2 text-left">
            <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-satoshi text-red-700">{error}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
