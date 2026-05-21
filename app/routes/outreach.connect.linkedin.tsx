import { useNavigate } from "react-router";
import { FiCheckCircle, FiLinkedin } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { LinkedInConnectPanel } from "~/components/outreach/LinkedInConnectPanel";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { useOrder } from "~/lib/outreach/hooks";

export default function LinkedInConnectPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { orderId, planType, linkedInCampaignId, setLinkedInCampaignId } = useOutreachStore();
  const { updateOrder } = useOrder();

  const handleSuccess = (campaignId: number) => {
    setLinkedInCampaignId(campaignId);
    updateOrder({
      status: "campaign_setup",
      linkedin_campaign_id: campaignId,
      linkedin_connected: true,
      log_entry: "LinkedIn account connected and campaign created",
    });
    navigate("/outreach/campaign/dashboard");
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

  if (linkedInCampaignId) {
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
              Your LinkedIn account is ready. We'll start sending connection requests within your daily safety limit.
            </p>
            <button
              onClick={() => navigate("/outreach/campaign/dashboard")}
              className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Open Dashboard
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
            <div className="w-16 h-16 rounded-full bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center mx-auto text-studojo-purple mb-6">
              <FiLinkedin className="w-8 h-8" />
            </div>
            <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Connect Your LinkedIn</h1>
            <p className="text-sm text-studojo-muted font-satoshi">
              {planType === "both"
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
