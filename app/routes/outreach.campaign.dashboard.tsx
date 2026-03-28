import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
  FiSend, FiAlertCircle, FiBarChart2, FiPause, FiPlay, FiUsers,
  FiCheckCircle, FiXCircle, FiClock, FiMessageCircle, FiX,
  FiArrowRight, FiThumbsUp, FiThumbsDown, FiMinus,
  FiPlus, FiTrash2, FiMail, FiRefreshCw,
} from "react-icons/fi";
import { RiFlaskLine } from "react-icons/ri";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { MetricCard } from "~/components/outreach/MetricCard";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import { formatTimestamp } from "~/lib/outreach/format-time";
import type { CampaignMetrics } from "~/lib/outreach/types";

interface TestLead {
  lead_name: string;
  company: string;
  email: string;
  status: string;
  subject: string;
  schedule_offset: number;
  error?: string;
}

interface TestJobData {
  job_id: string;
  status: string;
  started_at: string;
  total: number;
  emails_sent: number;
  emails_failed: number;
  leads: TestLead[];
  error?: string;
}

interface CampaignEmail {
  id: number;
  lead_name: string;
  lead_company: string;
  lead_title: string;
  to_email: string | null;
  subject: string | null;
  body: string | null;
  status: string;
  enrichment_status?: string;
  assigned_style?: string;
  scheduled_at: string | null;
  sent_at: string | null;
  reply_text: string | null;
  reply_sentiment: string | null;
  reply_received_at: string | null;
  bounce_reason: string | null;
  is_test: boolean;
}

interface TestRecipient {
  first_name: string;
  company: string;
  email: string;
}

function CountdownCell({ startedAt, offsetSeconds, status }: { startedAt: string; offsetSeconds: number; status: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (status === "sent" || status === "failed") { setRemaining(null); return; }
    const start = new Date(startedAt).getTime();
    const targetTime = start + offsetSeconds * 1000;

    const tick = () => {
      const diff = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, offsetSeconds, status]);

  if (status === "sent" || status === "failed") return <span className="text-studojo-muted">-</span>;
  if (status === "sending") return <span className="text-amber-600 font-bold">Sending now...</span>;
  if (remaining === null) return <span className="text-studojo-muted">-</span>;
  if (remaining <= 0) return <span className="text-amber-600 font-bold">Sending now...</span>;
  return <span className="text-studojo-purple font-bold">Sending in {remaining}s</span>;
}

function StatusBadge({ status, sentiment }: { status: string; sentiment?: string | null }) {
  if (status === "replied") {
    const sentimentConfig: Record<string, { color: string; icon: JSX.Element; label: string }> = {
      positive: { color: "text-studojo-green", icon: <FiThumbsUp className="w-3 h-3" />, label: "Positive" },
      negative: { color: "text-red-600", icon: <FiThumbsDown className="w-3 h-3" />, label: "Negative" },
      neutral: { color: "text-amber-600", icon: <FiMinus className="w-3 h-3" />, label: "Neutral" },
    };
    const config = sentimentConfig[sentiment || "neutral"] || sentimentConfig.neutral;
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <FiMessageCircle className={`w-4 h-4 ${config.color}`} />
        <span className={`${config.color} font-bold text-sm`}>Replied</span>
        <span className={`inline-flex items-center gap-0.5 text-xs ${config.color}`}>
          ({config.icon}{config.label})
        </span>
      </div>
    );
  }
  if (status === "bounced") return (
    <div className="flex items-center gap-1">
      <FiXCircle className="w-4 h-4 text-red-600" />
      <span className="text-red-600 font-bold text-sm">Bounced</span>
    </div>
  );
  if (status === "sent") return (
    <div className="flex items-center gap-1">
      <FiCheckCircle className="w-4 h-4 text-studojo-green" />
      <span className="text-studojo-green font-bold text-sm">Sent</span>
    </div>
  );
  if (status === "failed") return (
    <div className="flex items-center gap-1">
      <FiXCircle className="w-4 h-4 text-red-600" />
      <span className="text-red-600 font-bold text-sm">Failed</span>
    </div>
  );
  if (status === "sending") return (
    <div className="flex items-center gap-1">
      <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-amber-600 font-bold text-sm">Sending</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      <FiClock className="w-4 h-4 text-studojo-muted" />
      <span className="text-studojo-muted font-bold text-sm">To Send</span>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { campaignId, setCampaignId, emailAccountId } = useOutreachStore();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Test mode state
  const [testJobId, setTestJobId] = useState<string | null>(null);
  const [testJob, setTestJob] = useState<TestJobData | null>(null);
  const [testStartedAt, setTestStartedAt] = useState("");

  // Campaign mode state
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [emails, setEmails] = useState<CampaignEmail[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<CampaignEmail | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipients, setTestRecipients] = useState<TestRecipient[]>([{ first_name: "", company: "", email: "" }]);
  const [sendingTest, setSendingTest] = useState(false);
  const [testError, setTestError] = useState("");

  // Gmail re-auth state
  const [showReauthBanner, setShowReauthBanner] = useState(false);
  const [reauthLoading, setReauthLoading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoaded = useRef(false);

  // On mount: check for test job or campaign
  useEffect(() => {
    const storedJobId = sessionStorage.getItem("test_job_id");
    const storedStartedAt = sessionStorage.getItem("test_started_at");
    if (storedJobId) {
      setTestJobId(storedJobId);
      setTestStartedAt(storedStartedAt || new Date().toISOString());
      setLoading(false);
      return;
    }

    if (!campaignId) {
      outreachFetch<{ campaign?: { id: number } }>("/campaign/user/latest")
        .then((data) => {
          const c = data?.campaign;
          if (c?.id) {
            setCampaignId(c.id);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Poll test launch status
  const pollTestStatus = useCallback(async () => {
    if (!testJobId) return;
    try {
      const data = await outreachFetch<TestJobData>(`/campaign/test-launch/${testJobId}/status`);
      setTestJob(data);
      if (data.started_at) setTestStartedAt(data.started_at);
      if (data.status === "completed" || data.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
        sessionStorage.removeItem("test_job_id");
        sessionStorage.removeItem("test_started_at");
      }
    } catch { /* network blip — keep polling */ }
  }, [testJobId]);

  useEffect(() => {
    if (!testJobId) return;
    pollTestStatus();
    pollRef.current = setInterval(pollTestStatus, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [testJobId, pollTestStatus]);

  // Campaign metrics polling
  const fetchCampaignData = useCallback(async () => {
    if (!campaignId || testJobId) return;
    try {
      const [metricsData, emailsData] = await Promise.all([
        outreachFetch<CampaignMetrics>(`/campaign/${campaignId}/metrics`),
        outreachFetch<{ emails: CampaignEmail[] }>(`/campaign/${campaignId}/emails`),
      ]);
      setMetrics(metricsData);
      setEmails(emailsData.emails || []);
      setError("");
      initialLoaded.current = true;
    } catch (err: any) {
      if (!initialLoaded.current) {
        setError(err?.body?.detail || "Failed to load campaign data");
      }
    }
  }, [campaignId, testJobId]);

  useEffect(() => {
    if (!campaignId || testJobId) return;
    fetchCampaignData();
    const interval = setInterval(fetchCampaignData, 10000);
    return () => clearInterval(interval);
  }, [campaignId, testJobId, fetchCampaignData]);

  // Check if Gmail re-auth is needed (for reply tracking scope)
  useEffect(() => {
    if (!campaignId || !emailAccountId) return;
    const dismissed = localStorage.getItem(`reauth_banner_dismissed_${emailAccountId}`);
    if (dismissed) return;

    outreachFetch<{ email_account_id?: number; email_address?: string; token_valid?: boolean; scopes?: string[] }>(
      `/gmail/oauth/account?email_account_id=${emailAccountId}`
    ).then((data) => {
      // Show banner if account exists but we can't confirm gmail.readonly scope
      // The backend doesn't expose scopes, so show banner unless user has dismissed it
      if (data?.token_valid) {
        setShowReauthBanner(true);
      }
    }).catch(() => {});
  }, [campaignId, emailAccountId]);

  const handleReauth = async () => {
    setReauthLoading(true);
    try {
      const data = await outreachFetch<{ url: string }>("/gmail/oauth/connect-url");
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setReauthLoading(false);
    }
  };

  const dismissReauthBanner = () => {
    if (emailAccountId) {
      localStorage.setItem(`reauth_banner_dismissed_${emailAccountId}`, "true");
    }
    setShowReauthBanner(false);
  };

  const handleTransition = async (status: string) => {
    if (!campaignId) return;
    try {
      await outreachFetch(`/campaign/${campaignId}/transition`, {
        method: "POST",
        body: JSON.stringify({ target_status: status }),
      });
      fetchCampaignData();
    } catch (err: any) {
      setError(err?.body?.detail || "Failed to update campaign");
    }
  };

  // Filter emails by status
  const filteredEmails = emails.filter((email) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "replied") return email.status === "replied";
    if (statusFilter === "bounced") return email.status === "bounced";
    if (statusFilter === "failed") return email.status === "failed";
    if (statusFilter === "sent") return email.status === "sent";
    if (statusFilter === "pending") return !["sent", "replied", "bounced", "failed"].includes(email.status);
    return true;
  });

  // Row background color based on status + sentiment
  const getRowColor = (email: CampaignEmail) => {
    if (email.status === "replied") {
      if (email.reply_sentiment === "positive") return "bg-green-50 hover:bg-green-100";
      if (email.reply_sentiment === "negative") return "bg-red-50 hover:bg-red-100";
      return "bg-amber-50 hover:bg-amber-100";
    }
    if (email.status === "bounced") return "bg-red-50/60 hover:bg-red-100/60";
    if (email.status === "failed") return "bg-red-50/30 hover:bg-red-100/30";
    if (email.status === "sent") return "hover:bg-studojo-surface-muted";
    return "bg-studojo-surface-muted/30 hover:bg-studojo-surface-muted/60";
  };

  // Test emails modal handlers
  const handleSendTestEmails = async () => {
    if (!campaignId) return;
    const validRecipients = testRecipients.filter(r => r.email && r.first_name);
    if (validRecipients.length === 0) return;

    setSendingTest(true);
    setTestError("");
    try {
      await outreachFetch(`/campaign/${campaignId}/send-test-emails`, {
        method: "POST",
        body: JSON.stringify({ recipients: validRecipients }),
      });
      setShowTestModal(false);
      setTestRecipients([{ first_name: "", company: "", email: "" }]);
      setTestError("");
      fetchCampaignData();
    } catch (err: any) {
      setTestError(err?.body?.detail || "Failed to schedule test emails");
    } finally {
      setSendingTest(false);
    }
  };

  const addTestRecipient = () => {
    if (testRecipients.length >= 10) return;
    setTestRecipients([...testRecipients, { first_name: "", company: "", email: "" }]);
  };

  const removeTestRecipient = (index: number) => {
    setTestRecipients(testRecipients.filter((_, i) => i !== index));
  };

  const updateTestRecipient = (index: number, field: keyof TestRecipient, value: string) => {
    const updated = [...testRecipients];
    updated[index] = { ...updated[index], [field]: value };
    setTestRecipients(updated);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Test Mode Dashboard ──────────────────────────────────────────
  if (testJobId) {
    const leads = testJob?.leads || [];
    const total = testJob?.total || leads.length || 0;
    const sent = testJob?.emails_sent || 0;
    const failed = testJob?.emails_failed || 0;
    const toSend = Math.max(0, total - sent - failed);
    const isComplete = testJob?.status === "completed";
    const isFailed = testJob?.status === "failed" && testJob?.error;

    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-8 md:px-8">
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-clash text-2xl font-bold text-studojo-ink">Campaign Dashboard</h1>
                <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium border ${
                  isComplete
                    ? "bg-studojo-green-bg text-studojo-green border-studojo-green/30"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <RiFlaskLine className="w-3 h-3 mr-1" />
                  {isComplete ? "Test Complete" : isFailed ? "Test Failed" : "Test In Progress"}
                </span>
              </div>
              <button
                onClick={() => { sessionStorage.removeItem("test_job_id"); sessionStorage.removeItem("test_started_at"); navigate("/outreach/campaign/setup"); }}
                className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Back to Setup
              </button>
            </div>

            {isFailed && (
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6">
                <p className="text-red-600 font-satoshi font-bold">{testJob?.error}</p>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard label="To Send" value={toSend} icon={<FiClock className="w-5 h-5" />} />
              <MetricCard label="Sent" value={sent} icon={<FiSend className="w-5 h-5" />} trend={sent > 0 ? "up" : undefined} />
              <MetricCard label="Failed" value={failed} icon={<FiAlertCircle className="w-5 h-5" />} />
            </div>

            {/* Progress Bar */}
            {total > 0 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
                    <FiBarChart2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-clash text-lg font-bold text-studojo-ink">Sending Progress</h3>
                  {!isComplete && !isFailed && (
                    <div className="w-4 h-4 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="w-full h-3 bg-studojo-surface-muted rounded-full overflow-hidden border-2 border-studojo-ink/10">
                  <div className="h-full flex">
                    <div className="bg-studojo-green transition-all duration-500" style={{ width: `${total > 0 ? (sent / total) * 100 : 0}%` }} />
                    <div className="bg-red-500 transition-all duration-500" style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }} />
                  </div>
                </div>
                <p className="text-sm text-studojo-muted mt-2 font-satoshi">{sent + failed} of {total} emails processed</p>
              </div>
            )}

            {/* Leads Table */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-green">
                  <FiUsers className="w-5 h-5" />
                </div>
                <h3 className="font-clash text-lg font-bold text-studojo-ink">Campaign Leads</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/30">
                  {total} leads
                </span>
              </div>
              {leads.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-studojo-muted font-satoshi">Loading leads...</span>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto rounded-lg">
                  <table className="w-full text-sm font-satoshi">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b-2 border-studojo-ink/10">
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Lead Name</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Email</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase hidden md:table-cell">Company</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Status</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, i) => (
                        <tr key={i} className="border-b border-studojo-ink/5 hover:bg-studojo-surface-muted transition-colors">
                          <td className="py-3 px-2 font-bold text-studojo-ink">{lead.lead_name}</td>
                          <td className="py-3 px-2 text-studojo-muted truncate max-w-[200px]">{lead.email}</td>
                          <td className="py-3 px-2 text-studojo-muted hidden md:table-cell">{lead.company}</td>
                          <td className="py-3 px-2"><StatusBadge status={lead.status} /></td>
                          <td className="py-3 px-2 text-sm">
                            <CountdownCell startedAt={testStartedAt} offsetSeconds={lead.schedule_offset} status={lead.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Campaign Mode Dashboard ──────────────────────────────────────
  if (!campaignId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 text-center">
          <p className="text-base text-studojo-muted mt-10 font-satoshi">No active campaign.</p>
          <button
            onClick={() => navigate("/outreach/campaign/setup")}
            className="mt-6 h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Create Campaign
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    draft: "bg-studojo-surface-muted text-studojo-muted border-studojo-ink/20",
    running: "bg-studojo-green-bg text-studojo-green border-studojo-green/30",
    paused: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-studojo-purple-bg text-studojo-purple border-studojo-purple/30",
  };

  const campaignTotal = metrics?.emails_total || 0;
  const campaignSent = metrics?.emails_sent || 0;
  const campaignFailed = metrics?.emails_failed || 0;
  const campaignToSend = metrics?.emails_queued || 0;
  const campaignPendingEnrichment = metrics?.emails_pending_enrichment || 0;
  const campaignEnriched = metrics?.emails_enriched || 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-8 md:px-8">
        {error ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-red-600 font-satoshi">{error}</p>
          </div>
        ) : metrics ? (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-clash text-2xl font-bold text-studojo-ink">{metrics.campaign_name}</h1>
                <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium border ${statusColor[metrics.status] || statusColor.draft}`}>
                  {metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)}
                </span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {metrics.status === "running" && (
                  <button
                    onClick={() => handleTransition("paused")}
                    className="h-9 px-4 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                  >
                    <FiPause className="w-4 h-4 mr-2" /> Pause
                  </button>
                )}
                {metrics.status === "paused" && (
                  <button
                    onClick={() => handleTransition("running")}
                    className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                  >
                    <FiPlay className="w-4 h-4 mr-2" /> Resume
                  </button>
                )}
                {metrics.status === "completed" && (
                  <button
                    onClick={() => handleTransition("running")}
                    className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                  >
                    <FiPlay className="w-4 h-4 mr-2" /> Resume Campaign
                  </button>
                )}
                {["running", "completed", "paused"].includes(metrics.status) && (
                  <button
                    onClick={() => { setTestError(""); setShowTestModal(true); }}
                    className="h-9 px-4 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                  >
                    <FiMail className="w-4 h-4 mr-2" /> Send Test Emails
                  </button>
                )}
              </div>
            </div>

            {/* Gmail Re-Auth Banner */}
            {showReauthBanner && (
              <div className="rounded-2xl border-2 border-studojo-purple/30 bg-studojo-purple-bg p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-studojo-purple/10 border-2 border-studojo-purple/20 flex items-center justify-center flex-shrink-0">
                    <FiMessageCircle className="w-4 h-4 text-studojo-purple" />
                  </div>
                  <p className="text-sm font-satoshi text-studojo-ink">
                    <span className="font-bold">Reply tracking is now available!</span>{" "}
                    Reconnect your Gmail to see who replies to your outreach emails.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleReauth}
                    disabled={reauthLoading}
                    className="h-8 px-4 rounded-lg bg-studojo-purple text-white text-xs font-satoshi font-medium border border-studojo-ink shadow-brutal transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 inline-flex items-center"
                  >
                    {reauthLoading ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    ) : (
                      <FiRefreshCw className="w-3 h-3 mr-1.5" />
                    )}
                    Reconnect Gmail
                  </button>
                  <button
                    onClick={dismissReauthBanner}
                    className="w-7 h-7 rounded-lg hover:bg-studojo-purple/10 flex items-center justify-center transition-colors"
                    title="Dismiss"
                  >
                    <FiX className="w-4 h-4 text-studojo-muted" />
                  </button>
                </div>
              </div>
            )}

            {/* Summary Stats — 5 cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <MetricCard
                label="To Send"
                value={campaignToSend + campaignPendingEnrichment}
                icon={<FiClock className="w-5 h-5" />}
              />
              <MetricCard
                label="Sent"
                value={campaignSent}
                icon={<FiSend className="w-5 h-5" />}
                trend={campaignSent > 0 ? "up" : undefined}
                trendValue={`${campaignTotal} total`}
              />
              <MetricCard
                label="Replied"
                value={metrics.emails_replied || 0}
                icon={<FiMessageCircle className="w-5 h-5" />}
                trend={metrics.emails_replied > 0 ? "up" : undefined}
                trendValue={
                  metrics.emails_replied > 0
                    ? `${metrics.emails_positive || 0}+ · ${metrics.emails_negative || 0}- · ${metrics.emails_neutral || 0}~`
                    : undefined
                }
              />
              <MetricCard
                label="Bounced"
                value={metrics.emails_bounced || 0}
                icon={<FiXCircle className="w-5 h-5" />}
              />
              <MetricCard
                label="Failed"
                value={campaignFailed}
                icon={<FiAlertCircle className="w-5 h-5" />}
              />
            </div>

            {/* Enrichment Progress (JIT) */}
            {campaignPendingEnrichment > 0 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border-2 border-studojo-ink/20 flex items-center justify-center">
                      <FiUsers className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-satoshi text-studojo-ink">Enrichment Progress</p>
                      <p className="text-xs text-studojo-muted font-satoshi">Leads are enriched automatically before each email is sent</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    {campaignEnriched}/{campaignTotal} enriched
                  </span>
                </div>
                <div className="mt-3 w-full h-2 bg-studojo-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${campaignTotal > 0 ? (campaignEnriched / campaignTotal) * 100 : 0}%` }} />
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {campaignTotal > 0 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
                    <FiBarChart2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-clash text-lg font-bold text-studojo-ink">Campaign Progress</h3>
                </div>
                <div className="w-full h-3 bg-studojo-surface-muted rounded-full overflow-hidden border-2 border-studojo-ink/10">
                  <div className="h-full flex">
                    <div className="bg-studojo-green transition-all duration-500" style={{ width: `${campaignTotal > 0 ? (campaignSent / campaignTotal) * 100 : 0}%` }} />
                    <div className="bg-red-500 transition-all duration-500" style={{ width: `${campaignTotal > 0 ? (campaignFailed / campaignTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Leads Table */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-green">
                  <FiUsers className="w-5 h-5" />
                </div>
                <h3 className="font-clash text-lg font-bold text-studojo-ink">Campaign Leads</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/30">
                  {emails.length} leads
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {[
                  { key: "all", label: "All", count: emails.length },
                  { key: "pending", label: "Pending", count: emails.filter(e => !["sent", "replied", "bounced", "failed"].includes(e.status)).length },
                  { key: "sent", label: "Sent", count: emails.filter(e => e.status === "sent").length },
                  { key: "replied", label: "Replied", count: emails.filter(e => e.status === "replied").length },
                  { key: "bounced", label: "Bounced", count: emails.filter(e => e.status === "bounced").length },
                  { key: "failed", label: "Failed", count: emails.filter(e => e.status === "failed").length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1 rounded-full text-xs font-satoshi font-medium border transition-colors ${
                      statusFilter === tab.key
                        ? "bg-studojo-purple text-white border-studojo-purple"
                        : "bg-white text-studojo-muted border-studojo-ink/20 hover:border-studojo-purple/50"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {filteredEmails.length === 0 ? (
                <p className="text-sm text-studojo-muted font-satoshi text-center py-6">
                  {statusFilter === "all" ? "No emails scheduled yet." : `No ${statusFilter} emails.`}
                </p>
              ) : (
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto rounded-lg">
                  <table className="w-full text-sm font-satoshi">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b-2 border-studojo-ink/10">
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Lead Name</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Email</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase hidden md:table-cell">Company</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Status</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmails.map((email) => (
                        <tr
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className={`border-b border-studojo-ink/5 transition-colors cursor-pointer ${getRowColor(email)}`}
                        >
                          <td className="py-3 px-2 font-bold text-studojo-ink">
                            {email.lead_name}
                            {email.is_test && (
                              <span className="ml-1 text-xs text-studojo-purple font-normal">(test)</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-studojo-muted truncate max-w-[200px]">{email.to_email}</td>
                          <td className="py-3 px-2 text-studojo-muted hidden md:table-cell">{email.lead_company}</td>
                          <td className="py-3 px-2">
                            <StatusBadge status={email.status === "queued" ? "queued" : email.status} sentiment={email.reply_sentiment} />
                          </td>
                          <td className="py-3 px-2 text-sm">
                            {email.status === "replied" && email.reply_received_at
                              ? <span className="text-studojo-green text-xs">Replied {formatTimestamp(email.reply_received_at, tz)}</span>
                              : email.status === "sent" && email.sent_at
                                ? <span className="text-studojo-green text-xs">Sent {formatTimestamp(email.sent_at, tz)}</span>
                                : email.status === "bounced"
                                  ? <span className="text-red-600 text-xs" title={email.bounce_reason || ""}>Bounced</span>
                                  : email.status === "failed"
                                    ? <span className="text-red-600 text-xs">Failed</span>
                                    : email.scheduled_at
                                      ? <span className="text-studojo-purple text-xs font-medium">{formatTimestamp(email.scheduled_at, tz)}</span>
                                      : <span className="text-studojo-muted text-xs">Queued</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Side Drawer: Email Detail ── */}
        {selectedEmail && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setSelectedEmail(null)}
            />
            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white shadow-2xl border-l-2 border-studojo-ink overflow-y-auto animate-fade-in">
              <div className="sticky top-0 bg-white border-b-2 border-studojo-ink/10 p-4 flex items-center justify-between z-10">
                <h3 className="font-clash text-lg font-bold text-studojo-ink">Email Detail</h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="w-8 h-8 rounded-lg hover:bg-studojo-surface-muted flex items-center justify-center transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-5">
                {/* Lead Info */}
                <div>
                  <h4 className="font-clash font-bold text-studojo-ink text-base">{selectedEmail.lead_name}</h4>
                  {selectedEmail.lead_company && (
                    <p className="text-sm text-studojo-muted font-satoshi">{selectedEmail.lead_company}</p>
                  )}
                  {selectedEmail.lead_title && (
                    <p className="text-xs text-studojo-muted font-satoshi">{selectedEmail.lead_title}</p>
                  )}
                  <p className="text-xs text-studojo-muted font-satoshi mt-1">{selectedEmail.to_email}</p>
                  {selectedEmail.is_test && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/30 mt-2">
                      Test Email
                    </span>
                  )}
                </div>

                {/* Sent Email */}
                {(selectedEmail.subject || selectedEmail.body) && (
                  <div className="rounded-xl border-2 border-studojo-ink/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-studojo-purple-bg flex items-center justify-center">
                        <FiArrowRight className="w-3 h-3 text-studojo-purple" />
                      </div>
                      <span className="text-xs font-bold text-studojo-muted font-satoshi uppercase">Your Email</span>
                      {selectedEmail.sent_at && (
                        <span className="text-xs text-studojo-muted font-satoshi ml-auto">
                          {formatTimestamp(selectedEmail.sent_at, tz)}
                        </span>
                      )}
                    </div>
                    {selectedEmail.subject && (
                      <p className="text-sm font-bold text-studojo-ink font-satoshi mb-2">{selectedEmail.subject}</p>
                    )}
                    {selectedEmail.body && (
                      <p className="text-sm text-studojo-muted font-satoshi whitespace-pre-wrap leading-relaxed">{selectedEmail.body}</p>
                    )}
                  </div>
                )}

                {/* Reply */}
                {selectedEmail.status === "replied" && selectedEmail.reply_text && (
                  <div className={`rounded-xl border-2 p-4 ${
                    selectedEmail.reply_sentiment === "positive"
                      ? "border-studojo-green/30 bg-green-50"
                      : selectedEmail.reply_sentiment === "negative"
                        ? "border-red-300 bg-red-50"
                        : "border-amber-300 bg-amber-50"
                  }`}>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedEmail.reply_sentiment === "positive" ? "bg-studojo-green-bg"
                          : selectedEmail.reply_sentiment === "negative" ? "bg-red-100"
                          : "bg-amber-100"
                      }`}>
                        <FiMessageCircle className={`w-3 h-3 ${
                          selectedEmail.reply_sentiment === "positive" ? "text-studojo-green"
                            : selectedEmail.reply_sentiment === "negative" ? "text-red-600"
                            : "text-amber-600"
                        }`} />
                      </div>
                      <span className="text-xs font-bold text-studojo-muted font-satoshi uppercase">Their Reply</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                        selectedEmail.reply_sentiment === "positive" ? "bg-studojo-green-bg text-studojo-green"
                          : selectedEmail.reply_sentiment === "negative" ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-600"
                      }`}>
                        {selectedEmail.reply_sentiment}
                      </span>
                      {selectedEmail.reply_received_at && (
                        <span className="text-xs text-studojo-muted font-satoshi ml-auto">
                          {formatTimestamp(selectedEmail.reply_received_at, tz)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-studojo-ink font-satoshi whitespace-pre-wrap leading-relaxed">
                      {selectedEmail.reply_text}
                    </p>
                  </div>
                )}

                {/* Bounce */}
                {selectedEmail.status === "bounced" && (
                  <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiXCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-bold text-red-600 font-satoshi">Email Bounced</span>
                    </div>
                    <p className="text-sm text-red-600/80 font-satoshi">
                      {selectedEmail.bounce_reason || "Unknown reason"}
                    </p>
                  </div>
                )}

                {/* Sent but no reply yet */}
                {selectedEmail.status === "sent" && (
                  <div className="rounded-xl border-2 border-studojo-ink/10 bg-studojo-surface-muted p-4 text-center">
                    <FiClock className="w-6 h-6 text-studojo-muted mx-auto mb-2" />
                    <p className="text-sm text-studojo-muted font-satoshi">Awaiting reply...</p>
                  </div>
                )}

                {/* Meta info */}
                <div className="border-t border-studojo-ink/10 pt-4">
                  <div className="grid grid-cols-2 gap-y-2 text-xs font-satoshi text-studojo-muted">
                    {selectedEmail.assigned_style && (
                      <>
                        <span className="font-bold text-studojo-ink">Style</span>
                        <span className="capitalize">{selectedEmail.assigned_style.replace(/_/g, " ")}</span>
                      </>
                    )}
                    <span className="font-bold text-studojo-ink">Status</span>
                    <span className="capitalize">{selectedEmail.status}</span>
                    {selectedEmail.scheduled_at && (
                      <>
                        <span className="font-bold text-studojo-ink">Scheduled</span>
                        <span>{formatTimestamp(selectedEmail.scheduled_at, tz)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Send Test Emails Modal ── */}
        {showTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" onClick={() => setShowTestModal(false)} />
            <div className="relative bg-white rounded-2xl border-2 border-studojo-ink shadow-brutal p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-clash text-lg font-bold text-studojo-ink">Send Test Emails</h3>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-studojo-surface-muted flex items-center justify-center transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-studojo-muted font-satoshi mb-5">
                Send test emails to your own addresses. They go through the exact same pipeline as real campaign emails — sent in ~2 minutes. Reply to test reply detection and sentiment analysis.
              </p>

              {testError && (
                <div className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 mb-4">
                  <p className="text-sm text-red-600 font-satoshi">{testError}</p>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {testRecipients.map((recipient, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={recipient.first_name}
                        onChange={(e) => updateTestRecipient(i, "first_name", e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border-2 border-studojo-ink/20 text-sm font-satoshi focus:border-studojo-purple focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={recipient.company}
                        onChange={(e) => updateTestRecipient(i, "company", e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border-2 border-studojo-ink/20 text-sm font-satoshi focus:border-studojo-purple focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={recipient.email}
                        onChange={(e) => updateTestRecipient(i, "email", e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border-2 border-studojo-ink/20 text-sm font-satoshi focus:border-studojo-purple focus:outline-none"
                      />
                    </div>
                    {testRecipients.length > 1 && (
                      <button
                        onClick={() => removeTestRecipient(i)}
                        className="w-9 h-9 flex-shrink-0 rounded-lg border-2 border-studojo-ink/20 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-studojo-muted" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addTestRecipient}
                disabled={testRecipients.length >= 10}
                className="w-full h-9 rounded-lg border-2 border-dashed border-studojo-ink/20 text-sm font-satoshi text-studojo-muted hover:border-studojo-purple hover:text-studojo-purple transition-colors flex items-center justify-center gap-1 mb-6 disabled:opacity-50 disabled:pointer-events-none"
              >
                <FiPlus className="w-4 h-4" /> Add Another Recipient
              </button>

              <button
                onClick={handleSendTestEmails}
                disabled={sendingTest || testRecipients.every(r => !r.email || !r.first_name)}
                className="w-full h-12 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
              >
                {sendingTest
                  ? "Scheduling..."
                  : `Send ${testRecipients.filter(r => r.email && r.first_name).length} Test Email(s)`
                }
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
