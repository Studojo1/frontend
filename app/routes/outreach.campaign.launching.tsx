import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  FiShield, FiCheckCircle, FiMail, FiZap, FiClock, FiSend, FiAlertCircle,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const stages = [
  { icon: FiShield, label: "Validating campaign configuration", duration: 1500 },
  { icon: FiCheckCircle, label: "Preparing leads for outreach", duration: 2000 },
  { icon: FiMail, label: "Setting up email pipeline", duration: 3000 },
  { icon: FiClock, label: "Scheduling send times", duration: 2000 },
  { icon: FiZap, label: "Starting enrichment engine", duration: 1500 },
  { icon: FiSend, label: "Campaign ready", duration: 1000 },
];

export default function CampaignLaunchingPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, emailAccountId, setCampaignId, selectedTier } = useOutreachStore();
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");
  const launched = useRef(false);

  useEffect(() => {
    if (authLoading || !candidateId || !emailAccountId || launched.current) return;
    launched.current = true;

    const launchData = sessionStorage.getItem("campaign_launch");
    if (!launchData) {
      setError("No campaign configuration found. Please go back to setup.");
      return;
    }

    const { campaignName, selectedStyles, selectedTemplate } = JSON.parse(launchData);

    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    stages.forEach((stage, i) => {
      elapsed += stage.duration;
      timers.push(setTimeout(() => setCurrentStage(i + 1), elapsed));
    });

    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);

    const launchCampaign = async () => {
      try {
        const createData = await outreachFetch<{ campaign_id: number; queued_messages: number }>("/campaign/create", {
          method: "POST",
          body: JSON.stringify({
            candidate_id: candidateId,
            email_account_id: emailAccountId,
            name: campaignName || "My Outreach Campaign",
            selected_styles: selectedStyles?.length > 0 ? selectedStyles : undefined,
            lead_limit: selectedTier || undefined,
            ...((!selectedStyles || selectedStyles.length === 0) && selectedTemplate && {
              template_id: selectedTemplate.id,
              subject_template: selectedTemplate.subject,
              body_template: selectedTemplate.body,
            }),
          }),
        });

        const newCampaignId = createData.campaign_id;
        setCampaignId(newCampaignId);

        if (createData.queued_messages === 0) {
          setError("No leads found. Please run lead discovery first.");
          return;
        }

        await outreachFetch(`/campaign/${newCampaignId}/send`, { method: "POST" });

        setTimeout(() => {
          navigate("/outreach/campaign/dashboard");
        }, Math.max(0, totalDuration + 500));
      } catch (err: any) {
        setError(err?.body?.detail || "Campaign launch failed. Please try again.");
      }
    };

    launchCampaign();

    return () => timers.forEach(clearTimeout);
  }, [candidateId, emailAccountId]);

  if (!candidateId) {
    navigate("/outreach/onboarding/upload");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-clash text-2xl font-bold text-studojo-ink">Preparing Your Campaign</h1>
          <p className="text-sm text-studojo-muted font-satoshi mt-2">
            Setting up your outreach. This takes about 15 seconds.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <FiAlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 text-base font-satoshi mb-6">{error}</p>
            <button
              onClick={() => navigate("/outreach/campaign/setup")}
              className="h-12 px-6 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Back to Setup
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
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}