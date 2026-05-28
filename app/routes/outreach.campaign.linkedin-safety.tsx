import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FiShield, FiClock, FiUsers, FiZap, FiCheckCircle, FiCalendar, FiHeart, FiMessageSquare,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

interface LinkedInCampaignSettings {
  id: number;
  daily_limit: number;
  weekly_invite_limit: number;
  send_with_note: boolean;
  like_post_before_connect: boolean;
  total_leads: number;
}

export default function LinkedInSafetyPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { linkedInCampaignId, orderId } = useOutreachStore();

  const [settings, setSettings] = useState<LinkedInCampaignSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!linkedInCampaignId) {
      // No campaign in store — kick them back to connect.
      navigate("/outreach/connect/linkedin");
      return;
    }
    outreachFetch<LinkedInCampaignSettings>(`/linkedin/automation/campaigns/${linkedInCampaignId}`)
      .then((d) => setSettings(d))
      .catch((err: any) => {
        setLoadError(err?.body?.detail || "Could not load campaign settings.");
      });
  }, [authLoading, linkedInCampaignId, navigate]);

  const toggle = async (field: "send_with_note" | "like_post_before_connect") => {
    if (!settings || !linkedInCampaignId) return;
    const next = !settings[field];
    setSaving(field);
    setSettings({ ...settings, [field]: next });
    try {
      const updated = await outreachFetch<LinkedInCampaignSettings>(
        `/linkedin/automation/campaigns/${linkedInCampaignId}/settings`,
        { method: "PATCH", body: JSON.stringify({ [field]: next }) },
      );
      setSettings(updated);
    } catch {
      // Rollback
      setSettings({ ...settings, [field]: !next });
    } finally {
      setSaving(null);
    }
  };

  const handleStart = () => {
    setStarting(true);
    navigate("/outreach/campaign/dashboard");
  };

  if (authLoading || !settings) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          {loadError ? (
            <div className="text-center">
              <p className="text-sm text-red-600 font-satoshi mb-3">{loadError}</p>
              <button
                onClick={() => navigate("/outreach/connect/linkedin")}
                className="h-10 px-5 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Back to Connect
              </button>
            </div>
          ) : (
            <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const totalLeads = settings.total_leads || 0;
  const weeksToFinish = totalLeads > 0
    ? Math.max(1, Math.round((totalLeads / settings.weekly_invite_limit) * 10) / 10)
    : null;

  const safeSettings = [
    {
      icon: <FiUsers className="w-4 h-4" />,
      label: "Daily limit",
      value: `${settings.daily_limit} invites/day`,
    },
    {
      icon: <FiCalendar className="w-4 h-4" />,
      label: "Weekly cap",
      value: `${settings.weekly_invite_limit} invites/week`,
    },
    {
      icon: <FiClock className="w-4 h-4" />,
      label: "Sending hours",
      value: "9 AM – 7 PM (recipient's local time)",
    },
    {
      icon: <FiZap className="w-4 h-4" />,
      label: "Gap between invites",
      value: "5–12 minutes (randomised)",
    },
    {
      icon: <FiShield className="w-4 h-4" />,
      label: "First invite",
      value: "Within ~10 minutes of starting",
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">LinkedIn Safe Sending</h1>
        <p className="text-sm text-studojo-muted font-satoshi mb-8">
          Review how we pace your invites. These settings protect your LinkedIn account from rate-limit warnings.
        </p>

        <div className="space-y-6">
          {/* Safe sending settings (read-only) */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-green">
                <FiShield className="w-5 h-5" />
              </div>
              <h3 className="font-clash text-lg font-bold text-studojo-ink">Safe Sending Settings</h3>
            </div>
            <p className="text-sm text-studojo-muted font-satoshi mb-4">
              These limits keep you safely under LinkedIn's ~100/week soft cap. They cannot be raised.
            </p>
            <div className="space-y-3">
              {safeSettings.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-studojo-surface-muted rounded-xl border-2 border-studojo-ink/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-studojo-purple">{s.icon}</span>
                    <span className="text-sm font-satoshi text-studojo-ink">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold font-satoshi text-studojo-ink">{s.value}</span>
                </div>
              ))}
            </div>

            {weeksToFinish !== null && (
              <div className="mt-4 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink/10 p-3 text-sm font-satoshi text-studojo-ink">
                At this pace, your <span className="font-bold">{totalLeads} queued invites</span> will finish in roughly{" "}
                <span className="font-bold">{weeksToFinish} weeks</span>.
              </div>
            )}
          </div>

          {/* Optional toggles */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
                <FiZap className="w-5 h-5" />
              </div>
              <h3 className="font-clash text-lg font-bold text-studojo-ink">Optional tweaks</h3>
            </div>
            <p className="text-sm text-studojo-muted font-satoshi mb-4">
              These don't affect safety — they affect acceptance rate. You can change them any time from the dashboard.
            </p>

            <div className="space-y-4">
              {/* Send with note */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-studojo-surface-muted border-2 border-studojo-ink/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.send_with_note}
                  onChange={() => toggle("send_with_note")}
                  disabled={saving === "send_with_note"}
                  className="mt-1 w-4 h-4 accent-studojo-purple"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FiMessageSquare className="w-4 h-4 text-studojo-ink" />
                    <p className="text-sm font-bold font-satoshi text-studojo-ink">Send a connection note</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-satoshi font-medium bg-studojo-green-bg text-studojo-green border border-studojo-green/30">
                      Default off
                    </span>
                  </div>
                  <p className="text-xs text-studojo-muted font-satoshi">
                    LinkedIn data shows acceptance is{" "}
                    <span className="font-bold text-studojo-ink">~10 points higher without a note</span>. We recommend
                    leaving this off. If you turn it on, we'll attach the AI-generated note we crafted for each lead.
                  </p>
                </div>
              </label>

              {/* Like-a-post warmup */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-studojo-surface-muted border-2 border-studojo-ink/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.like_post_before_connect}
                  onChange={() => toggle("like_post_before_connect")}
                  disabled={saving === "like_post_before_connect"}
                  className="mt-1 w-4 h-4 accent-studojo-purple"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FiHeart className="w-4 h-4 text-studojo-ink" />
                    <p className="text-sm font-bold font-satoshi text-studojo-ink">Like a recent post first</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-satoshi font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Optional warmup
                    </span>
                  </div>
                  <p className="text-xs text-studojo-muted font-satoshi">
                    Before each invite, we'll like one of the lead's recent posts. Small warm-touch that tends to lift
                    acceptance for active LinkedIn users. Skipped silently if they haven't posted recently.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* What happens next */}
          <div className="rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-5">
            <p className="text-xs font-bold font-satoshi text-studojo-muted uppercase mb-2">What happens next</p>
            <ul className="space-y-1.5 text-sm font-satoshi text-studojo-ink">
              <li className="flex items-start gap-2">
                <span className="text-studojo-green flex-shrink-0 mt-0.5">✓</span>
                <span>We start sending within ~10 minutes — no further action needed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-studojo-green flex-shrink-0 mt-0.5">✓</span>
                <span>Track invites, acceptances, and replies from your dashboard.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-studojo-green flex-shrink-0 mt-0.5">✓</span>
                <span>Accepted leads get an AI follow-up message within ~4 minutes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />

      {/* Floating Start button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={handleStart}
          disabled={starting}
          className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center whitespace-nowrap"
        >
          {starting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <FiCheckCircle className="w-5 h-5 mr-2" />
          )}
          Start Sending
        </button>
      </div>
    </div>
  );
}
