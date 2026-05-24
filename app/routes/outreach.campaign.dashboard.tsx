import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import { useNavigate } from "react-router";
import {
  FiSend, FiAlertCircle, FiBarChart2, FiPause, FiPlay, FiUsers,
  FiCheckCircle, FiXCircle, FiClock, FiMessageCircle, FiX,
  FiArrowRight, FiThumbsUp, FiThumbsDown, FiMinus,
  FiPlus, FiTrash2, FiMail, FiRefreshCw, FiGlobe,
  FiChevronRight, FiChevronDown, FiCornerDownRight, FiLinkedin,
  FiExternalLink, FiPercent,
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
import { TicketModal } from "~/components/ticket-modal";
import { TicketBanner } from "~/components/ticket-banner";

interface LiStats {
  campaign_id: number;
  status: string;
  total_leads: number;
  total_sent: number;
  total_accepted: number;
  total_followups_sent: number;
  total_replied: number;
  acceptance_rate: number;
  reply_rate: number;
}

interface LiRequest {
  id: number;
  name: string;
  headline?: string;
  company?: string;
  profile_url?: string;
  connection_note?: string;
  match_reason?: string;
  status: string;
  sent_at?: string;
  accepted_at?: string;
  reply_text?: string;
  reply_sentiment?: string;
}

const LI_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:      { label: "Queued",          color: "text-studojo-muted" },
  sent:         { label: "Request Sent",    color: "text-studojo-purple" },
  accepted:     { label: "Connected",       color: "text-studojo-green" },
  declined:     { label: "Not Connected",   color: "text-red-500" },
  ignored:      { label: "Not Connected",   color: "text-red-500" },
  followup_sent:{ label: "Follow-up Sent",  color: "text-blue-600" },
  replied:      { label: "Replied",         color: "text-studojo-green" },
  error:        { label: "Error",           color: "text-red-600" },
};

function LiStatusBadge({ status }: { status: string }) {
  const cfg = LI_STATUS_LABELS[status] || { label: status, color: "text-studojo-muted" };
  const icon =
    status === "accepted" || status === "replied" ? <FiCheckCircle className="w-3.5 h-3.5" /> :
    status === "sent" || status === "followup_sent" ? <FiSend className="w-3.5 h-3.5" /> :
    status === "declined" || status === "ignored" || status === "error" ? <FiXCircle className="w-3.5 h-3.5" /> :
    <FiClock className="w-3.5 h-3.5" />;
  return (
    <div className={`flex items-center gap-1 font-bold text-sm ${cfg.color}`}>
      {icon} {cfg.label}
    </div>
  );
}

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
  followup_number?: number;
  parent_email_id?: number | null;
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
  if (status === "followup_pending") return (
    <div className="flex items-center gap-1">
      <FiClock className="w-4 h-4 text-studojo-muted" />
      <span className="text-studojo-muted font-bold text-sm">Queued</span>
    </div>
  );
  if (status === "cancelled_reply") return (
    <div className="flex items-center gap-1">
      <FiMinus className="w-4 h-4 text-studojo-muted" />
      <span className="text-studojo-muted font-medium text-sm italic">Skipped</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      <FiClock className="w-4 h-4 text-studojo-muted" />
      <span className="text-studojo-muted font-bold text-sm">To Send</span>
    </div>
  );
}

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "PST / PDT — US West Coast" },
  { value: "America/Denver", label: "MST / MDT — US Mountain" },
  { value: "America/Chicago", label: "CST / CDT — US Central" },
  { value: "America/New_York", label: "EST / EDT — US East Coast" },
  { value: "America/Toronto", label: "EST / EDT — Canada East" },
  { value: "America/Vancouver", label: "PST / PDT — Canada West" },
  { value: "Europe/London", label: "GMT / BST — United Kingdom" },
  { value: "Europe/Dublin", label: "GMT / IST — Ireland" },
  { value: "Europe/Paris", label: "CET / CEST — France" },
  { value: "Europe/Berlin", label: "CET / CEST — Germany" },
  { value: "Asia/Dubai", label: "GST — UAE" },
  { value: "Asia/Kolkata", label: "IST — India" },
  { value: "Asia/Singapore", label: "SGT — Singapore" },
  { value: "Asia/Tokyo", label: "JST — Japan" },
  { value: "Asia/Seoul", label: "KST — South Korea" },
  { value: "Australia/Sydney", label: "AEST / AEDT — Australia East" },
  { value: "Pacific/Auckland", label: "NZST / NZDT — New Zealand" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { campaignId, setCampaignId, emailAccountId, planType, linkedInCampaignId } = useOutreachStore();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const hasLinkedIn = (planType === "linkedin" || planType === "both") && !!linkedInCampaignId;
  const [activeTab, setActiveTab] = useState<"email" | "linkedin">(() =>
    planType === "linkedin" ? "linkedin" : "email"
  );

  // LinkedIn tab state
  const [liStats, setLiStats] = useState<LiStats | null>(null);
  const [liRequests, setLiRequests] = useState<LiRequest[]>([]);
  const [liStatusFilter, setLiStatusFilter] = useState("all");
  const [liLoading, setLiLoading] = useState(false);
  const [liError, setLiError] = useState("");
  const [liSendingOne, setLiSendingOne] = useState(false);
  const [liSendResult, setLiSendResult] = useState<{ ok: boolean; name: string; url?: string } | null>(null);

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
  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipients, setTestRecipients] = useState<TestRecipient[]>([{ first_name: "", company: "", email: "" }]);
  const [sendingTest, setSendingTest] = useState(false);
  const [testError, setTestError] = useState("");

  // Gmail re-auth state
  const [showReauthBanner, setShowReauthBanner] = useState(false);
  const [reauthLoading, setReauthLoading] = useState(false);
  const [gmailTokenValid, setGmailTokenValid] = useState(true);

  // Timezone change state (shown when paused)
  const [showTzPanel, setShowTzPanel] = useState(false);
  const [pendingTz, setPendingTz] = useState("");
  const [tzSaving, setTzSaving] = useState(false);
  const [tzError, setTzError] = useState("");
  const [reportIssueOpen, setReportIssueOpen] = useState(false);

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

    outreachFetch<{ email_account_id?: number; email_address?: string; token_valid?: boolean; scopes?: string[] }>(
      `/gmail/oauth/account?email_account_id=${emailAccountId}`
    ).then((data) => {
      const valid = data?.token_valid ?? true;
      setGmailTokenValid(valid);
      // Always show the banner when token is invalid (critical — don't respect dismiss)
      // Only respect dismiss for the informational "reply tracking available" banner
      if (!valid) {
        setShowReauthBanner(true);
      } else {
        const dismissed = localStorage.getItem(`reauth_banner_dismissed_${emailAccountId}`);
        if (!dismissed) setShowReauthBanner(true);
      }
    }).catch(() => {});
  }, [campaignId, emailAccountId]);

  // LinkedIn polling
  const fetchLinkedIn = useCallback(async () => {
    if (!linkedInCampaignId) return;
    try {
      const [statsData, reqData] = await Promise.all([
        outreachFetch<LiStats>(`/linkedin/automation/campaigns/${linkedInCampaignId}/stats`),
        outreachFetch<LiRequest[]>(`/linkedin/automation/campaigns/${linkedInCampaignId}/requests?limit=500`),
      ]);
      setLiStats(statsData);
      setLiRequests(reqData || []);
      setLiError("");
    } catch (err: any) {
      setLiError(err?.body?.detail || "Failed to load LinkedIn data");
    } finally {
      setLiLoading(false);
    }
  }, [linkedInCampaignId]);

  useEffect(() => {
    if (!linkedInCampaignId) return;
    setLiLoading(true);
    fetchLinkedIn();
    const interval = setInterval(fetchLinkedIn, 30000);
    return () => clearInterval(interval);
  }, [linkedInCampaignId, fetchLinkedIn]);

  const handleLiTransition = async (targetStatus: string) => {
    if (!linkedInCampaignId) return;
    // Use the dedicated pause/resume endpoints. PUT /campaigns/{id} expects
    // a full CreateCampaignRequest body and doesn't accept a status field at
    // all — sending {status: ...} there is silently ignored.
    const action = targetStatus === "running" ? "resume" : "pause";
    try {
      await outreachFetch(
        `/linkedin/automation/campaigns/${linkedInCampaignId}/${action}`,
        { method: "POST" },
      );
      fetchLinkedIn();
    } catch (e) {
      setLiError(`Couldn't ${action} the campaign. Try again in a moment.`);
    }
  };

  const handleSendOne = async () => {
    if (!linkedInCampaignId || liSendingOne) return;
    setLiSendingOne(true);
    setLiSendResult(null);
    try {
      // send-one drives a real Playwright nav through the Evomi proxy — easily
      // 60-120s end-to-end. Default 30s × 3 retries cascades into the same
      // failure pattern as the login endpoint (multiple parallel browser
      // sessions, duplicate sends, "Request timeout after 30s" banner).
      const res = await outreachFetch<{ ok: boolean; lead_name: string; profile_url?: string }>(
        `/linkedin/automation/campaigns/${linkedInCampaignId}/send-one`,
        { method: "POST", timeout: 180_000, maxRetries: 1 },
      );
      setLiSendResult({ ok: res?.ok ?? false, name: res?.lead_name ?? "Unknown", url: res?.profile_url ?? undefined });
      fetchLinkedIn();
    } catch (e: any) {
      setLiSendResult({ ok: false, name: e?.message ?? "Request failed" });
    } finally {
      setLiSendingOne(false);
    }
  };

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

  const handleReschedule = async () => {
    if (!campaignId || !pendingTz) return;
    setTzSaving(true);
    setTzError("");
    try {
      await outreachFetch(`/campaign/${campaignId}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ user_timezone: pendingTz }),
      });
      setShowTzPanel(false);
      fetchCampaignData();
    } catch (err: any) {
      setTzError(err?.body?.detail || "Failed to update timezone");
    } finally {
      setTzSaving(false);
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

  // Group emails by thread: parent email (Touch 1) + its follow-ups.
  // Only the parent is shown at top level; follow-ups render as children when expanded.
  const parentEmails = filteredEmails.filter((e) => !e.parent_email_id);
  const followupsByParent = new Map<number, CampaignEmail[]>();
  for (const e of emails) {
    if (e.parent_email_id) {
      const arr = followupsByParent.get(e.parent_email_id) || [];
      arr.push(e);
      followupsByParent.set(e.parent_email_id, arr);
    }
  }
  // Sort follow-ups by followup_number ascending (Touch 2, then Touch 3)
  for (const [, arr] of followupsByParent) {
    arr.sort((a, b) => (a.followup_number || 0) - (b.followup_number || 0));
  }

  const toggleThread = (parentId: number) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

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
                  {isComplete ? "Test Done" : isFailed ? "Test Failed" : "Sending Test Emails"}
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
  if (!campaignId && !hasLinkedIn) {
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
        {/* Channel tabs — only shown for 'both' plans */}
        {hasLinkedIn && planType === "both" && (
          <div className="flex gap-2 rounded-2xl border-2 border-studojo-ink/20 p-1 bg-studojo-surface-muted mb-6">
            <button
              onClick={() => setActiveTab("email")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-satoshi flex items-center justify-center gap-2 transition-all ${
                activeTab === "email"
                  ? "bg-white border border-studojo-ink/10 shadow-sm text-studojo-purple"
                  : "text-studojo-muted hover:text-studojo-ink"
              }`}
            >
              <FiMail className="w-4 h-4" /> Email Campaign
            </button>
            <button
              onClick={() => setActiveTab("linkedin")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-satoshi flex items-center justify-center gap-2 transition-all ${
                activeTab === "linkedin"
                  ? "bg-white border border-studojo-ink/10 shadow-sm text-studojo-purple"
                  : "text-studojo-muted hover:text-studojo-ink"
              }`}
            >
              <FiLinkedin className="w-4 h-4" /> LinkedIn Campaign
            </button>
          </div>
        )}

        {/* ── LinkedIn tab ── */}
        {hasLinkedIn && activeTab === "linkedin" && (
          <div className="space-y-8 animate-fade-in">
            {liError && (
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4">
                <p className="text-red-600 font-satoshi text-sm">{liError}</p>
              </div>
            )}

            {liLoading && !liStats ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
              </div>
            ) : liStats ? (
              <>
                {/* LI Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-clash text-2xl font-bold text-studojo-ink">LinkedIn Campaign</h1>
                    <span className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium border ${
                      liStats.status === "running" ? "bg-studojo-green-bg text-studojo-green border-studojo-green/30" :
                      liStats.status === "paused" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      liStats.status === "auth_failed" ? "bg-red-50 text-red-600 border-red-200" :
                      "bg-studojo-surface-muted text-studojo-muted border-studojo-ink/20"
                    }`}>
                      <FiLinkedin className="w-3 h-3" />
                      {liStats.status === "auth_failed" ? "Auth Failed" : liStats.status.charAt(0).toUpperCase() + liStats.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {liStats.status === "running" && (
                      <button
                        onClick={() => handleLiTransition("paused")}
                        className="h-9 px-4 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                      >
                        <FiPause className="w-4 h-4 mr-2" /> Pause
                      </button>
                    )}
                    {(liStats.status === "paused" || liStats.status === "auth_failed") && (
                      <button
                        onClick={() => handleLiTransition("running")}
                        className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                      >
                        <FiPlay className="w-4 h-4 mr-2" /> Resume
                      </button>
                    )}
                    <button
                      onClick={handleSendOne}
                      disabled={liSendingOne}
                      className="h-9 px-4 rounded-xl bg-studojo-ink text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-brutal"
                    >
                      {liSendingOne
                        ? <><span className="w-3.5 h-3.5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                        : <><FiSend className="w-4 h-4 mr-2" />Send 1 Now</>
                      }
                    </button>
                    <button
                      onClick={() => navigate("/outreach/campaign/inbox")}
                      className="h-9 px-4 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                    >
                      <FiMessageCircle className="w-4 h-4 mr-2" /> Inbox
                      {(liStats.total_replied ?? 0) > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-studojo-purple text-white text-[10px] font-bold">
                          {liStats.total_replied}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => navigate("/outreach/connect/linkedin")}
                      className="h-9 px-4 rounded-xl border-2 border-studojo-purple bg-studojo-purple-bg text-studojo-purple text-sm font-satoshi font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                    >
                      <FiLinkedin className="w-4 h-4 mr-2" /> Reconnect LinkedIn
                    </button>
                  </div>
                </div>

                {liSendResult && (
                  <div className={`rounded-2xl border-2 p-4 flex items-start gap-3 ${liSendResult.ok ? "border-studojo-green/40 bg-studojo-green-bg" : "border-red-300 bg-red-50"}`}>
                    {liSendResult.ok
                      ? <FiCheckCircle className="w-5 h-5 text-studojo-green flex-shrink-0 mt-0.5" />
                      : <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      {liSendResult.ok
                        ? <p className="text-sm font-satoshi"><span className="font-bold text-studojo-ink">Connection request sent</span> to <span className="font-bold">{liSendResult.name}</span>{liSendResult.url && <> · <a href={liSendResult.url} target="_blank" rel="noreferrer" className="underline text-studojo-purple">{liSendResult.url.split("/in/")[1]?.replace(/\/$/, "")}</a></>}</p>
                        : <p className="text-sm font-satoshi text-red-700"><span className="font-bold">Send failed:</span> {liSendResult.name}</p>
                      }
                    </div>
                    <button onClick={() => setLiSendResult(null)} className="text-studojo-muted hover:text-studojo-ink flex-shrink-0">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {liStats.status === "auth_failed" && (
                  <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700 font-satoshi">LinkedIn session expired</p>
                      <p className="text-sm text-red-600 font-satoshi mt-0.5">
                        Your LinkedIn session has expired. Go to{" "}
                        <button onClick={() => navigate("/outreach/connect/linkedin")} className="underline font-bold">
                          reconnect LinkedIn
                        </button>{" "}
                        to resume sending.
                      </p>
                    </div>
                  </div>
                )}

                {/* LI Campaign Settings */}
                <LinkedInSettingsCard campaignId={linkedInCampaignId!} onUpdate={fetchLinkedIn} />

                {/* LI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Requests Sent" value={liStats.total_sent} icon={<FiSend className="w-5 h-5" />} trend={liStats.total_sent > 0 ? "up" : undefined} trendValue={`${liStats.total_leads} total`} />
                  <MetricCard label="Connected" value={liStats.total_accepted} icon={<FiCheckCircle className="w-5 h-5" />} />
                  <MetricCard label="Acceptance Rate" value={`${liStats.acceptance_rate}%`} icon={<FiPercent className="w-5 h-5" />} />
                  <MetricCard label="Replied" value={liStats.total_replied} icon={<FiMessageCircle className="w-5 h-5" />} />
                </div>

                {/* LI Progress bar */}
                {liStats.total_leads > 0 && (
                  <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
                        <FiBarChart2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-clash text-lg font-bold text-studojo-ink">Campaign Progress</h3>
                      <span className="text-sm text-studojo-muted font-satoshi ml-auto">{liStats.total_sent} / {liStats.total_leads} sent</span>
                    </div>
                    <div className="w-full h-3 bg-studojo-surface-muted rounded-full overflow-hidden border-2 border-studojo-ink/10">
                      <div className="h-full flex">
                        <div className="bg-studojo-green transition-all duration-500" style={{ width: `${liStats.total_leads > 0 ? (liStats.total_accepted / liStats.total_leads) * 100 : 0}%` }} />
                        <div className="bg-studojo-purple/50 transition-all duration-500" style={{ width: `${liStats.total_leads > 0 ? ((liStats.total_sent - liStats.total_accepted) / liStats.total_leads) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs font-satoshi text-studojo-muted">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-studojo-green inline-block" /> Connected ({liStats.total_accepted})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-studojo-purple/50 inline-block" /> Sent, awaiting ({liStats.total_sent - liStats.total_accepted})</span>
                    </div>
                  </div>
                )}

                {/* LI Requests table */}
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
                      <FiLinkedin className="w-5 h-5" />
                    </div>
                    <h3 className="font-clash text-lg font-bold text-studojo-ink">Connection Requests</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/30">
                      {liRequests.length} leads
                    </span>
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {[
                      { key: "all", label: "All" },
                      { key: "pending", label: "Queued" },
                      { key: "sent", label: "Sent" },
                      { key: "accepted", label: "Connected" },
                      { key: "replied", label: "Replied" },
                      { key: "error", label: "Error" },
                    ].map((t) => {
                      const count = t.key === "all" ? liRequests.length :
                        t.key === "accepted" ? liRequests.filter(r => r.status === "accepted").length :
                        t.key === "error" ? liRequests.filter(r => r.status === "error" || r.status === "declined" || r.status === "ignored").length :
                        liRequests.filter(r => r.status === t.key).length;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setLiStatusFilter(t.key)}
                          className={`px-3 py-1 rounded-full text-xs font-satoshi font-medium border transition-colors ${
                            liStatusFilter === t.key
                              ? "bg-studojo-purple text-white border-studojo-purple"
                              : "bg-white text-studojo-muted border-studojo-ink/20 hover:border-studojo-purple/50"
                          }`}
                        >
                          {t.label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const filtered = liRequests.filter(r => {
                      if (liStatusFilter === "all") return true;
                      if (liStatusFilter === "error") return ["error", "declined", "ignored"].includes(r.status);
                      if (liStatusFilter === "accepted") return r.status === "accepted";
                      return r.status === liStatusFilter;
                    });
                    if (filtered.length === 0) return (
                      <p className="text-sm text-studojo-muted font-satoshi text-center py-6">No requests in this category yet.</p>
                    );
                    return (
                      <div className="overflow-x-auto max-h-[520px] overflow-y-auto rounded-lg">
                        <table className="w-full text-sm font-satoshi">
                          <thead className="sticky top-0 bg-white z-10">
                            <tr className="border-b-2 border-studojo-ink/10">
                              <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Name</th>
                              <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase hidden md:table-cell">Company</th>
                              <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Status</th>
                              <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase hidden lg:table-cell">Why this lead</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map(req => (
                              <tr key={req.id} className="border-b border-studojo-ink/5 hover:bg-studojo-surface-muted/40 transition-colors">
                                <td className="py-3 px-2">
                                  <div className="font-bold text-studojo-ink">{req.name}</div>
                                  {req.headline && <div className="text-xs text-studojo-muted">{req.headline}</div>}
                                </td>
                                <td className="py-3 px-2 text-studojo-muted hidden md:table-cell">{req.company || "—"}</td>
                                <td className="py-3 px-2">
                                  <LiStatusBadge status={req.status} />
                                  {req.status === "accepted" && req.accepted_at && (
                                    <div className="text-xs text-studojo-muted mt-0.5">{formatTimestamp(req.accepted_at, tz)}</div>
                                  )}
                                  {req.status === "sent" && req.sent_at && (
                                    <div className="text-xs text-studojo-muted mt-0.5">{formatTimestamp(req.sent_at, tz)}</div>
                                  )}
                                </td>
                                <td className="py-3 px-2 text-xs text-studojo-muted hidden lg:table-cell max-w-[240px]">
                                  <span className="line-clamp-2">{req.match_reason || "—"}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── Email tab (or only tab for email-only plans) ── */}
        {(!hasLinkedIn || activeTab === "email") && (
        <>
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
                <button
                  onClick={() => setReportIssueOpen(true)}
                  className="h-9 px-4 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                  title="Raise a ticket for the team"
                >
                  <FiAlertCircle className="w-4 h-4 mr-2" /> Report issue
                </button>
              </div>
            </div>

            {/* Ticket banner — shown when the user has an open ticket or a
                recently-resolved one. Resolved version overrides the open one. */}
            <TicketBanner />

            {/* Cadence info banner — shown while campaign is running and not yet complete */}
            {metrics.status === "running" && metrics.sent_count < metrics.total_leads && (
              <div className="rounded-2xl border-2 border-studojo-ink/20 bg-amber-50 p-4 flex items-start gap-3">
                <span className="text-lg mt-0.5">📬</span>
                <div className="flex-1">
                  <p className="text-sm font-satoshi text-studojo-ink">
                    <span className="font-bold">Your emails go out gradually</span> (5–7 per day) to protect your Gmail reputation. Check back tomorrow. Most replies come within 3–5 days.
                  </p>
                  {metrics.user_timezone && (
                    <p className="text-xs text-studojo-muted font-satoshi mt-1 flex items-center gap-1">
                      <FiGlobe className="w-3 h-3" />
                      Sending 9am–5pm {metrics.user_timezone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Paused — show timezone change option */}
            {metrics.status === "paused" && (
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FiGlobe className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-satoshi text-studojo-ink">
                        Sending timezone: {metrics.user_timezone || "Asia/Kolkata"}
                      </p>
                      <p className="text-xs text-studojo-muted font-satoshi">Emails go out 9am–5pm in this timezone</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setPendingTz(metrics.user_timezone || "Asia/Kolkata"); setShowTzPanel(!showTzPanel); setTzError(""); }}
                    className="h-8 px-3 rounded-lg border-2 border-amber-300 bg-white text-xs font-satoshi font-medium text-amber-700 hover:bg-amber-50 transition-colors flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
                {showTzPanel && (
                  <div className="mt-4 pt-4 border-t border-amber-200 space-y-3">
                    <select
                      value={pendingTz}
                      onChange={(e) => setPendingTz(e.target.value)}
                      className="w-full h-10 px-4 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple bg-white"
                    >
                      {TIMEZONES.some((t) => t.value === pendingTz) ? null : (
                        <option value={pendingTz}>{pendingTz}</option>
                      )}
                      {TIMEZONES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {tzError && <p className="text-xs text-red-600 font-satoshi">{tzError}</p>}
                    <button
                      onClick={handleReschedule}
                      disabled={tzSaving || !pendingTz || pendingTz === metrics.user_timezone}
                      className="h-9 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center"
                    >
                      {tzSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <FiGlobe className="w-4 h-4 mr-2" />
                      )}
                      Save &amp; Reschedule
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Gmail Re-Auth Banner */}
            {showReauthBanner && (
              <div className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-4 ${gmailTokenValid ? "border-studojo-purple/30 bg-studojo-purple-bg" : "border-red-300 bg-red-50"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${gmailTokenValid ? "bg-studojo-purple/10 border-studojo-purple/20" : "bg-red-100 border-red-200"}`}>
                    <FiMessageCircle className={`w-4 h-4 ${gmailTokenValid ? "text-studojo-purple" : "text-red-600"}`} />
                  </div>
                  <p className="text-sm font-satoshi text-studojo-ink">
                    {gmailTokenValid ? (
                      <><span className="font-bold">Reply tracking is now available!</span>{" "}Reconnect your Gmail to see who replies to your outreach emails.</>
                    ) : (
                      <><span className="font-bold text-red-700">Gmail connection issue.</span>{" "}Your emails cannot be sent. Reconnect Gmail and make sure to allow all permissions.</>
                    )}
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
                      {parentEmails.map((email) => {
                        const children = followupsByParent.get(email.id) || [];
                        const isExpanded = expandedThreads.has(email.id);
                        const hasFollowups = children.length > 0;
                        const sentFollowups = children.filter((c) => c.status === "sent").length;
                        return (
                          <Fragment key={email.id}>
                            <tr
                              onClick={() => setSelectedEmail(email)}
                              className={`border-b border-studojo-ink/5 transition-colors cursor-pointer ${getRowColor(email)}`}
                            >
                              <td className="py-3 px-2 font-bold text-studojo-ink">
                                <div className="flex items-center gap-2">
                                  {hasFollowups ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleThread(email.id);
                                      }}
                                      className="p-0.5 rounded hover:bg-studojo-ink/10 text-studojo-muted"
                                      title={isExpanded ? "Collapse follow-ups" : "Show follow-ups"}
                                    >
                                      {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                                    </button>
                                  ) : (
                                    <span className="w-5" />
                                  )}
                                  <span>{email.lead_name}</span>
                                  {email.is_test && (
                                    <span className="ml-1 text-xs text-studojo-purple font-normal">(test)</span>
                                  )}
                                  {hasFollowups && (
                                    <span className="ml-1 text-xs text-studojo-muted font-normal bg-studojo-ink/5 px-1.5 py-0.5 rounded">
                                      +{sentFollowups}/{children.length} follow-ups
                                    </span>
                                  )}
                                </div>
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
                            {isExpanded && children.map((fu) => {
                              const touchLabel = `Touch ${(fu.followup_number || 0) + 1}`;
                              return (
                                <tr
                                  key={fu.id}
                                  onClick={() => setSelectedEmail(fu)}
                                  className="border-b border-studojo-ink/5 bg-studojo-surface-muted/40 hover:bg-studojo-surface-muted/70 cursor-pointer"
                                >
                                  <td className="py-2 px-2 pl-10">
                                    <div className="flex items-center gap-2 text-studojo-muted">
                                      <FiCornerDownRight className="w-3.5 h-3.5" />
                                      <span className="text-xs font-bold">{touchLabel}</span>
                                      <span className="text-xs">— follow-up</span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 text-studojo-muted text-xs truncate max-w-[200px]">{fu.to_email}</td>
                                  <td className="py-2 px-2 text-studojo-muted hidden md:table-cell text-xs">{fu.lead_company}</td>
                                  <td className="py-2 px-2">
                                    <StatusBadge status={fu.status} sentiment={fu.reply_sentiment} />
                                  </td>
                                  <td className="py-2 px-2 text-sm">
                                    {fu.status === "sent" && fu.sent_at
                                      ? <span className="text-studojo-green text-xs">Sent {formatTimestamp(fu.sent_at, tz)}</span>
                                      : fu.status === "cancelled_reply"
                                        ? <span className="text-studojo-muted text-xs italic">Cancelled (reply received)</span>
                                        : fu.status === "failed"
                                          ? <span className="text-red-600 text-xs">Failed</span>
                                          : fu.scheduled_at
                                            ? <span className="text-studojo-purple text-xs font-medium">Queued for {formatTimestamp(fu.scheduled_at, tz)}</span>
                                            : <span className="text-studojo-muted text-xs">Queued</span>
                                    }
                                  </td>
                                </tr>
                              );
                            })}
                          </Fragment>
                        );
                      })}
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
        </>
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
                Send test emails to your own addresses. They go through the exact same pipeline as real campaign emails, sent in ~2 minutes. Reply to test reply detection and sentiment analysis.
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
      <TicketModal
        open={reportIssueOpen}
        source="outreach_dashboard"
        context={{
          campaign_id: campaignId ?? null,
          campaign_name: metrics?.campaign_name ?? null,
          status: metrics?.status ?? null,
        }}
        onClose={() => setReportIssueOpen(false)}
      />
      <Footer />
    </div>
  );
}


interface LinkedInCampaignSettings {
  daily_limit: number;
  weekly_invite_limit: number;
  send_with_note: boolean;
  like_post_before_connect: boolean;
}

function LinkedInSettingsCard({ campaignId, onUpdate }: { campaignId: number; onUpdate: () => void }) {
  const [settings, setSettings] = useState<LinkedInCampaignSettings | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    outreachFetch<LinkedInCampaignSettings>(`/linkedin/automation/campaigns/${campaignId}`)
      .then((d) => setSettings({
        daily_limit: d.daily_limit,
        weekly_invite_limit: d.weekly_invite_limit,
        send_with_note: d.send_with_note,
        like_post_before_connect: d.like_post_before_connect,
      }))
      .catch(() => {});
  }, [campaignId]);

  const toggle = async (field: "send_with_note" | "like_post_before_connect") => {
    if (!settings) return;
    const next = !settings[field];
    setSaving(field);
    // Optimistic update so the toggle feels instant
    setSettings({ ...settings, [field]: next });
    try {
      const updated = await outreachFetch<LinkedInCampaignSettings>(
        `/linkedin/automation/campaigns/${campaignId}/settings`,
        { method: "PATCH", body: JSON.stringify({ [field]: next }) },
      );
      setSettings({
        daily_limit: updated.daily_limit,
        weekly_invite_limit: updated.weekly_invite_limit,
        send_with_note: updated.send_with_note,
        like_post_before_connect: updated.like_post_before_connect,
      });
      onUpdate();
    } catch {
      // Rollback on failure
      setSettings({ ...settings, [field]: !next });
    } finally {
      setSaving(null);
    }
  };

  if (!settings) return null;

  return (
    <div className="rounded-2xl border-2 border-studojo-ink/15 bg-white">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold font-satoshi text-studojo-ink">Campaign settings</span>
          <span className="text-xs text-studojo-muted font-satoshi">
            {settings.daily_limit}/day · {settings.weekly_invite_limit}/week ·{" "}
            {settings.send_with_note ? "with note" : "no note"}
            {settings.like_post_before_connect ? " · like post" : ""}
          </span>
        </div>
        <span className="text-xs text-studojo-muted">{expanded ? "Hide" : "Edit"}</span>
      </button>
      {expanded && (
        <div className="border-t border-studojo-ink/10 px-5 py-4 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.send_with_note}
              onChange={() => toggle("send_with_note")}
              disabled={saving === "send_with_note"}
              className="mt-0.5 w-4 h-4 accent-studojo-purple"
            />
            <div className="flex-1">
              <p className="text-sm font-bold font-satoshi text-studojo-ink">Send a connection note</p>
              <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
                LinkedIn data shows acceptance rate is{" "}
                <span className="font-bold text-studojo-ink">about 10pt higher without a note</span>.
                Recommended off. If you turn this on, we'll attach the AI-generated note we crafted for each lead.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.like_post_before_connect}
              onChange={() => toggle("like_post_before_connect")}
              disabled={saving === "like_post_before_connect"}
              className="mt-0.5 w-4 h-4 accent-studojo-purple"
            />
            <div className="flex-1">
              <p className="text-sm font-bold font-satoshi text-studojo-ink">Like a recent post first (optional warmup)</p>
              <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
                Before sending the invite, we'll like one of the lead's recent posts. Small warm-touch that
                tends to lift acceptance for active LinkedIn users. Skipped silently if they haven't posted recently.
              </p>
            </div>
          </label>

          <div className="rounded-xl bg-studojo-surface-muted border border-studojo-ink/10 p-3 text-xs text-studojo-muted font-satoshi">
            Pacing is set automatically: <span className="font-bold text-studojo-ink">{settings.daily_limit} invites/day</span>{" "}
            with a randomised weekly cap of{" "}
            <span className="font-bold text-studojo-ink">{settings.weekly_invite_limit}</span> to stay under LinkedIn's
            ~100/week soft limit. A 200-invite plan completes in roughly 2.5 weeks at this rate.
          </div>
        </div>
      )}
    </div>
  );
}
