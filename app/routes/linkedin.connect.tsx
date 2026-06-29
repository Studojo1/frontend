import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiLinkedin, FiShield, FiCheckCircle } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { LinkedInConnectPanel } from "~/components/outreach/LinkedInConnectPanel";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { useOrder } from "~/lib/outreach/hooks";
import { outreachFetch } from "~/lib/outreach/api";

export default function LinkedInConnectPage() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { orderId, setLinkedInCampaignId } = useOutreachStore();
  const { createOrder, updateOrder } = useOrder();
  const [resolvedOrderId, setResolvedOrderId] = useState<number | null>(orderId);
  const [checking, setChecking] = useState(true);

  // If the user is already connected (has a LinkedIn campaign), skip the connect
  // form and go straight to the dashboard — otherwise a connected user lands back
  // on this form and thinks it's "stuck".
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const camps = await outreachFetch<any[]>("/linkedin/automation/campaigns").catch(() => null);
        if (!cancelled && camps && camps.length) {
          navigate("/linkedin/dashboard");
          return;
        }
      } catch {}
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  // LinkedInConnectPanel requires an orderId. If the user got here from the
  // /linkedin pricing flow there's already an OutreachOrder; otherwise create
  // one on the fly so the connect panel can wire up a LinkedIn campaign.
  useEffect(() => {
    if (resolvedOrderId) return;
    (async () => {
      const id = await createOrder();
      if (id) setResolvedOrderId(id);
    })();
  }, [resolvedOrderId, createOrder]);

  const onConnected = (campaignId: number) => {
    setLinkedInCampaignId(campaignId);
    updateOrder({
      status: "campaign_setup",
      linkedin_campaign_id: campaignId,
      linkedin_connected: true,
      log_entry: "LinkedIn connected via /linkedin standalone flow",
    });
    navigate("/linkedin/dashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-satoshi text-studojo-muted">Checking your LinkedIn connection…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-12 md:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#0a66c2]/10 border-2 border-studojo-ink flex items-center justify-center mx-auto mb-4 text-[#0a66c2]">
            <FiLinkedin className="w-8 h-8" />
          </div>
          <h1 className="font-clash text-3xl font-bold text-studojo-ink mb-2">Connect your LinkedIn</h1>
          <p className="text-base text-studojo-muted font-satoshi">
            One-time secure login. We'll start sending invites within ~10 minutes.
          </p>
        </div>

        {/* Safety reassurance */}
        <div className="rounded-xl border-2 border-studojo-green/40 bg-studojo-green-bg p-4 mb-6 flex items-start gap-3">
          <FiShield className="w-5 h-5 text-studojo-green flex-shrink-0 mt-0.5" />
          <div className="text-xs font-satoshi text-studojo-ink/90 space-y-1">
            <p><span className="font-bold">Your account is safe.</span></p>
            <p>Invites go out at 8–12/day (well below LinkedIn's 100/week cap), 9 AM–7 PM in your timezone, with hand-personalised notes. We never use bots, scrapers, or third-party automation tools.</p>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
          {resolvedOrderId ? (
            <LinkedInConnectPanel
              orderId={resolvedOrderId}
              onSuccess={onConnected}
            />
          ) : (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Sessions only", desc: "We never store your password" },
            { label: "You stay in control", desc: "Revoke any time from LinkedIn → Sessions" },
            { label: "Pause anytime", desc: "Stop sending from the dashboard" },
          ].map((t) => (
            <div key={t.label} className="rounded-xl border border-studojo-ink/10 bg-studojo-surface-muted p-3">
              <FiCheckCircle className="w-4 h-4 text-studojo-green mx-auto mb-1" />
              <p className="text-[11px] font-bold font-satoshi text-studojo-ink leading-tight">{t.label}</p>
              <p className="text-[10px] text-studojo-muted font-satoshi mt-0.5 leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
