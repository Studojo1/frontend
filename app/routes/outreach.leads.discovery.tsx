import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiCheckCircle, FiSearch, FiBarChart2, FiUsers } from "react-icons/fi";
import { RiRobot2Fill } from "react-icons/ri";
import { Header } from "~/components/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const stages = [
  { icon: RiRobot2Fill, label: "Analyzing your candidate profile", duration: 2000 },
  { icon: FiSearch, label: "Generating role mapping and filters", duration: 3000 },
  { icon: FiUsers, label: "Searching for decision makers", duration: 8000 },
  { icon: FiBarChart2, label: "Scoring and ranking leads", duration: 4000 },
];

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId } = useOutreachStore();
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !candidateId) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    stages.forEach((stage, i) => {
      elapsed += stage.duration;
      timers.push(setTimeout(() => setCurrentStage(i + 1), elapsed));
    });

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

    return () => timers.forEach(clearTimeout);
  }, [candidateId, authLoading, navigate]);

  if (!candidateId) {
    navigate("/outreach/onboarding/upload");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-clash text-2xl font-bold text-studojo-ink">Discovering Decision Makers</h1>
          <p className="text-sm text-studojo-muted font-satoshi mt-2">Sit tight while we find the right people for you.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-red-600 text-base font-satoshi">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 h-12 px-6 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            {stages.map((stage, i) => {
              const done = currentStage > i;
              const active = currentStage === i;
              const Icon = stage.icon;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all duration-500 ${
                    done
                      ? "border-studojo-green bg-studojo-green-bg/50"
                      : active
                      ? "border-studojo-purple bg-studojo-purple-bg shadow-brutal"
                      : "border-studojo-ink/20 bg-white"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    done ? "bg-studojo-green text-white" : active ? "bg-studojo-purple/10 text-studojo-purple" : "bg-gray-100 text-studojo-muted"
                  }`}>
                    {done ? (
                      <FiCheckCircle className="w-5 h-5" />
                    ) : active ? (
                      <div className="w-5 h-5 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-sm font-satoshi ${done ? "text-studojo-green font-semibold" : active ? "text-studojo-ink font-semibold" : "text-studojo-muted"}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-4 mt-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 transition-all duration-1000 ${
                    currentStage > 2 ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse mb-2 w-full" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}