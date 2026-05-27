import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiAlertTriangle, FiCheckCircle, FiLinkedin } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { LinkedInConnectPanel } from "~/components/outreach/LinkedInConnectPanel";
import { outreachFetch } from "~/lib/outreach/api";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { useOrder } from "~/lib/outreach/hooks";

type CampaignStatus = "running" | "paused" | "auth_failed" | "completed" | "draft" | string;

export default function LinkedInConnectPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { orderId, planType, linkedInCampaignId, setLinkedInCampaignId } = useOutreachStore();
  const { updateOrder } = useOrder();

  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Verify the existing campaign's session is still valid before claiming "Connected".
  // Without this check, a campaign in auth_failed state still showed the success
  // screen here, contradicting the dashboard's "session expired" banner.
  useEffect(() => {
    if (!linkedInCampaignId) {
      setCampaignStatus(null);
      return;
    }
    let cancelled = false;
    setStatusLoading(true);
    outreachFetch<{ status: string }>(
      `/linkedin/automation/campaigns/${linkedInCampaignId}/stats`
    )
      .then((data) => {
        if (!cancelled) setCampaignStatus(data?.status ?? null);
      })
      .catch(() => {
        if (!cancelled) setCampaignStatus(null);
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [linkedInCampaignId]);

  const handleSuccess = (campaignId: number) => {
    setLinkedInCampaignId(campaignId);
    setCampaignStatus("running");
    updateOrder({
      status: "campaign_setup",
      linkedin_campaign_id: campaignId,
      linkedin_connected: true,
      log_entry: "LinkedIn account connected and campaign created",
    });
    navigate("/outreach/campaign/linkedin-safety");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!orderId) {
    navigate("/outreach/onboarding/upload");
    return null;
  }

  const sessionDead = campaignStatus === "auth_failed";
  const sessionHealthy =
    linkedInCampaignId &&
    !sessionDead &&
    campaignStatus !== null &&
    !statusLoading;

  if (linkedInCampaignId && statusLoading && campaignStatus === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sessionHealthy) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-8 h-8 text-studojo-green" />
            </div>
            <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">LinkedIn Connected</h1>
            <p className="text-base text-studojo-muted mb-8 font-satoshi">
              Your LinkedIn account is ready. Next, review your safe sending limits before we start.
            </p>
            <button
              onClick={() => navigate("/outreach/campaign/linkedin-safety")}
              className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Review Safe Sending →
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full border-2 border-studojo-ink flex items-center justify-center mx-auto mb-6 ${sessionDead ? "bg-red-50 text-red-600" : "bg-studojo-purple-bg text-studojo-purple"}`}>
              {sessionDead ? <FiAlertTriangle className="w-8 h-8" /> : <FiLinkedin className="w-8 h-8" />}
            </div>
            <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">
              {sessionDead ? "LinkedIn Session Expired" : "Connect Your LinkedIn"}
            </h1>
            <p className="text-sm text-studojo-muted font-satoshi">
              {sessionDead
                ? "Your LinkedIn session is no longer valid. Log in again to resume sending — your queued requests will pick up right where they left off."
                : planType === "both"
                ? "Last step — connect LinkedIn so we can send connection requests alongside your emails."
                : "Connect LinkedIn so we can send personalised connection requests to the right hiring managers."}
            </p>
          </div>

          <LinkedInConnectPanel orderId={orderId} onSuccess={handleSuccess} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
