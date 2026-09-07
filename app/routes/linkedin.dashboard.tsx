import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiLinkedin, FiSend, FiCheckCircle, FiMessageSquare, FiPause, FiPlay, FiAlertCircle, FiInbox } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

interface CampaignSummary {
  id: number;
  name: string;
  status: string;
  daily_limit: number;
  weekly_invite_limit: number;
  send_with_note: boolean;
  total_leads: number;
  total_sent: number;
  total_accepted: number;
  total_followups_sent: number;
  total_replied: number;
  launched_at: string | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  running: { label: "Running", color: "bg-studojo-green/15 text-studojo-green border-studojo-green/40" },
  paused: { label: "Paused", color: "bg-amber-100 text-amber-700 border-amber-300" },
  auth_failed: { label: "Session expired", color: "bg-red-100 text-red-700 border-red-300" },
  completed: { label: "Completed", color: "bg-studojo-purple-bg text-studojo-purple border-studojo-purple/40" },
  draft: { label: "Draft", color: "bg-studojo-surface-muted text-studojo-muted border-studojo-ink/15" },
};

function Metric({ icon, value, label, sub }: { icon: React.ReactNode; value: string | number; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
      <div className="flex items-center gap-2 text-studojo-muted mb-2">
        <span className="text-studojo-purple">{icon}</span>
        <span className="text-[11px] font-bold font-satoshi uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-clash text-3xl font-bold text-studojo-ink">{value}</p>
      {sub && <p className="text-xs font-satoshi text-studojo-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function LinkedInDashboard() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { linkedInCampaignId } = useOutreachStore();

  const [campaign, setCampaign] = useState<CampaignSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);

  // Resolve which campaign to show, prefer store value, then look up the
  // user's most-recent LinkedIn campaign as a fallback.
  const refresh = async () => {
    setLoading(true);
    try {
      let id = linkedInCampaignId;
      if (!id) {
        const list = await outreachFetch<CampaignSummary[]>("/linkedin/automation/campaigns").catch(() => null);
        if (list && list.length) id = list[0].id;
      }
      if (!id) {
        setLoading(false);
        return;
      }
      const c = await outreachFetch<CampaignSummary>(`/linkedin/automation/campaigns/${id}`);
      setCampaign(c);
    } catch (e: any) {
      setError(e?.body?.detail || "Couldn't load campaign");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedInCampaignId]);

  const toggle = async () => {
    if (!campaign) return;
    setToggling(true);
    try {
      const isRunning = campaign.status === "running";
      await outreachFetch(
        `/linkedin/automation/campaigns/${campaign.id}/${isRunning ? "pause" : "resume"}`,
        { method: "POST" },
      );
      await refresh();
    } finally {
      setToggling(false);
    }
  };

  // No campaign at all
  if (!loading && !campaign && !error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-16 md:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0a66c2]/10 border-2 border-studojo-ink flex items-center justify-center mx-auto mb-4 text-[#0a66c2]">
            <FiLinkedin className="w-8 h-8" />
          </div>
          <h1 className="font-clash text-3xl font-bold text-studojo-ink mb-2">No active campaign</h1>
          <p className="text-sm text-studojo-muted font-satoshi mb-6">Get started by uploading your resume.</p>
          <button
            onClick={() => navigate("/linkedin/onboarding/upload")}
            className="h-11 px-6 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            Upload your resume
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const acceptRate = campaign && campaign.total_sent > 0
    ? Math.round((campaign.total_accepted / campaign.total_sent) * 100)
    : 0;
  const replyRate = campaign && campaign.total_accepted > 0
    ? Math.round((campaign.total_replied / campaign.total_accepted) * 100)
    : 0;

  const status = campaign && (STATUS_LABEL[campaign.status] || { label: campaign.status, color: "bg-studojo-surface-muted text-studojo-muted border-studojo-ink/15" });

  return (
    <div className="min-h-screen bg-white pb-16">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">

        <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-satoshi bg-[#0a66c2]/10 text-[#0a66c2] border border-[#0a66c2]/30 mb-2">
              <FiLinkedin className="w-3 h-3" /> LINKEDIN
            </span>
            <h1 className="font-clash text-2xl md:text-3xl font-bold text-studojo-ink">
              {campaign?.name || "Your campaign"}
            </h1>
            {campaign && status && (
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-satoshi border ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>
          {campaign && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/outreach/campaign/inbox")}
                className="h-10 px-4 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-bold inline-flex items-center gap-2"
              >
                <FiInbox className="w-4 h-4" /> Inbox
                {campaign.total_replied > 0 && (
                  <span className="ml-1 px-1.5 rounded-full text-[10px] bg-studojo-purple text-white">{campaign.total_replied}</span>
                )}
              </button>
              <button
                onClick={toggle}
                disabled={toggling || campaign.status === "auth_failed"}
                className="h-10 px-4 rounded-xl border-2 border-studojo-ink bg-studojo-ink text-white text-sm font-satoshi font-bold inline-flex items-center gap-2 disabled:opacity-50"
              >
                {campaign.status === "running" ? (
                  <><FiPause className="w-4 h-4" /> Pause</>
                ) : (
                  <><FiPlay className="w-4 h-4" /> Resume</>
                )}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 mb-6 flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-satoshi text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" /></div>
        ) : campaign ? (
          <>
            {/* Auth-failed banner */}
            {campaign.status === "auth_failed" && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 mb-6 flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold font-satoshi text-amber-900">LinkedIn session expired</p>
                  <p className="text-xs font-satoshi text-amber-800 mt-0.5">
                    Reconnect to resume sending. Your queue is preserved, invites will pick up right where they left off.
                  </p>
                  <button
                    onClick={() => navigate("/linkedin/connect")}
                    className="mt-3 h-9 px-4 rounded-xl bg-amber-600 text-white text-sm font-satoshi font-bold inline-flex items-center gap-2"
                  >
                    <FiLinkedin className="w-4 h-4" /> Reconnect LinkedIn
                  </button>
                </div>
              </div>
            )}

            {/* Top-line metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Metric icon={<FiSend className="w-4 h-4" />} value={campaign.total_sent} label="Invites sent" sub={`of ${campaign.total_leads} queued`} />
              <Metric icon={<FiCheckCircle className="w-4 h-4" />} value={campaign.total_accepted} label="Accepted" sub={`${acceptRate}% accept rate`} />
              <Metric icon={<FiMessageSquare className="w-4 h-4" />} value={campaign.total_replied} label="Replies" sub={`${replyRate}% of accepts`} />
              <Metric icon={<FiSend className="w-4 h-4" />} value={campaign.total_followups_sent} label="Follow-ups sent" sub="auto on accept" />
            </div>

            {/* Send pacing card */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 mb-8">
              <p className="text-[11px] font-bold font-satoshi text-studojo-muted uppercase mb-3">Sending pace</p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm font-satoshi">
                <div>
                  <p className="text-xs text-studojo-muted">Daily limit</p>
                  <p className="font-bold text-studojo-ink text-base">{campaign.daily_limit} invites / day</p>
                </div>
                <div>
                  <p className="text-xs text-studojo-muted">Weekly cap</p>
                  <p className="font-bold text-studojo-ink text-base">{campaign.weekly_invite_limit} invites / week</p>
                </div>
                <div>
                  <p className="text-xs text-studojo-muted">Connection note</p>
                  <p className="font-bold text-studojo-ink text-base">{campaign.send_with_note ? "Personal note included" : "Note-free (higher accept)"}</p>
                </div>
              </div>
              {campaign.total_leads > 0 && (
                <div className="mt-4 pt-4 border-t border-studojo-ink/10">
                  <div className="flex items-center justify-between text-xs font-satoshi mb-1.5">
                    <span className="text-studojo-muted">Progress</span>
                    <span className="font-bold text-studojo-ink">{campaign.total_sent} / {campaign.total_leads}</span>
                  </div>
                  <div className="h-2 rounded-full bg-studojo-surface-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-studojo-purple"
                      style={{ width: `${Math.min(100, (campaign.total_sent / campaign.total_leads) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-studojo-muted font-satoshi text-center">
              Stats update every 30 seconds. Need help? <a href="mailto:studojo@gmail.com" className="underline text-studojo-purple">studojo@gmail.com</a>
            </p>
          </>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
