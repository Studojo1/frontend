import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
  FiSend, FiAlertCircle, FiBarChart2, FiPause, FiPlay, FiUsers,
  FiCheckCircle, FiXCircle, FiClock,
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
  to_email: string | null;
  subject: string | null;
  status: string;
  enrichment_status?: string;
  scheduled_at: string | null;
  sent_at: string | null;
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

function StatusBadge({ status }: { status: string }) {
  if (status === "sent") return (
    <div className="flex items-center gap-1">
      <FiCheckCircle className="w-4 h-4 text-studojo-green" />
      <span className="text-studojo-green font-bold">Sent</span>
    </div>
  );
  if (status === "failed") return (
    <div className="flex items-center gap-1">
      <FiXCircle className="w-4 h-4 text-red-600" />
      <span className="text-red-600 font-bold">Failed</span>
    </div>
  );
  if (status === "sending") return (
    <div className="flex items-center gap-1">
      <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-amber-600 font-bold">Sending</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      <FiClock className="w-4 h-4 text-studojo-muted" />
      <span className="text-studojo-muted font-bold">To Send</span>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { campaignId, setCampaignId } = useOutreachStore();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Test mode state
  const [testJobId, setTestJobId] = useState<string | null>(null);
  const [testJob, setTestJob] = useState<TestJobData | null>(null);
  const [testStartedAt, setTestStartedAt] = useState("");

  // Campaign mode state
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [emails, setEmails] = useState<CampaignEmail[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      // Only show error on initial load — poll failures are silent so the dashboard stays visible.
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-satoshi">
                    <thead>
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
  const campaignPendingEnrichment = (metrics as any)?.emails_pending_enrichment || 0;
  const campaignEnriched = (metrics as any)?.emails_enriched || 0;

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-clash text-2xl font-bold text-studojo-ink">{metrics.campaign_name}</h1>
                <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium border ${statusColor[metrics.status] || statusColor.draft}`}>
                  {metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)}
                </span>
              </div>
              <div className="flex gap-3">
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
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard label="To Send" value={campaignToSend + campaignPendingEnrichment} icon={<FiClock className="w-5 h-5" />} />
              <MetricCard label="Sent" value={campaignSent} icon={<FiSend className="w-5 h-5" />} trend={campaignSent > 0 ? "up" : undefined} trendValue={`${campaignTotal} total`} />
              <MetricCard label="Failed" value={campaignFailed} icon={<FiAlertCircle className="w-5 h-5" />} />
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
              {emails.length === 0 ? (
                <p className="text-sm text-studojo-muted font-satoshi text-center py-6">No emails scheduled yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-satoshi">
                    <thead>
                      <tr className="border-b-2 border-studojo-ink/10">
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Lead Name</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Email</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase hidden md:table-cell">Company</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Status</th>
                        <th className="text-left py-3 px-2 text-xs font-bold text-studojo-muted uppercase">Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map((email) => (
                        <tr key={email.id} className="border-b border-studojo-ink/5 hover:bg-studojo-surface-muted transition-colors">
                          <td className="py-3 px-2 font-bold text-studojo-ink">{email.lead_name}</td>
                          <td className="py-3 px-2 text-studojo-muted truncate max-w-[200px]">{email.to_email}</td>
                          <td className="py-3 px-2 text-studojo-muted hidden md:table-cell">{email.lead_company}</td>
                          <td className="py-3 px-2"><StatusBadge status={email.status === "queued" ? "queued" : email.status} /></td>
                          <td className="py-3 px-2 text-sm">
                            {email.status === "sent" && email.sent_at
                              ? <span className="text-studojo-green text-xs">Sent {formatTimestamp(email.sent_at, tz)}</span>
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
      </div>
      <Footer />
    </div>
  );
}