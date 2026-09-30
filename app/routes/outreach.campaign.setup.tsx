import { describeError } from "~/lib/error-detail";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FiShield, FiClock, FiMail, FiZap, FiCheckCircle, FiEdit2, FiGlobe,
} from "react-icons/fi";
import { RiFlaskLine } from "react-icons/ri";
import { Header } from "~/components/common/header";
import { AppFooter } from "~/components/outreach/AppFooter";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOrder, fetchNextStep } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

// Campaign.daily_limit's default in job-outreach-svc; the setup page does not
// change it, so every email campaign sends at most this many a day.
const DAILY_LIMIT = 20;

interface TestEmail {
  index: number;
  lead_name: string;
  lead_company: string;
  original_email: string;
  subject: string;
  body: string;
}

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "PST / PDT: US West Coast" },
  { value: "America/Denver", label: "MST / MDT: US Mountain" },
  { value: "America/Chicago", label: "CST / CDT: US Central" },
  { value: "America/New_York", label: "EST / EDT: US East Coast" },
  { value: "America/Toronto", label: "EST / EDT: Canada East" },
  { value: "America/Vancouver", label: "PST / PDT: Canada West" },
  { value: "Europe/London", label: "GMT / BST: United Kingdom" },
  { value: "Europe/Dublin", label: "GMT / IST: Ireland" },
  { value: "Europe/Paris", label: "CET / CEST: France" },
  { value: "Europe/Berlin", label: "CET / CEST: Germany" },
  { value: "Asia/Dubai", label: "GST: UAE" },
  { value: "Asia/Kolkata", label: "IST: India" },
  { value: "Asia/Singapore", label: "SGT: Singapore" },
  { value: "Asia/Tokyo", label: "JST: Japan" },
  { value: "Asia/Seoul", label: "KST: South Korea" },
  { value: "Australia/Sydney", label: "AEST / AEDT: Australia East" },
  { value: "Pacific/Auckland", label: "NZST / NZDT: New Zealand" },
];

function getDefaultTimezone(): string {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONES.some((tz) => tz.value === detected)) return detected;
    return detected;
  } catch {
    return "Asia/Kolkata";
  }
}

export default function CampaignSetupPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, setCandidateId, emailAccountId, setEmailAccountId, setCampaignId } = useOutreachStore();
  const { updateOrder } = useOrder();
  const [campaignName, setCampaignName] = useState("My Outreach Campaign");
  const [userTimezone, setUserTimezone] = useState(() => getDefaultTimezone());
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");

  // Test launch state
  const [testEmails, setTestEmails] = useState<TestEmail[]>([]);
  const [testEmailsLoading, setTestEmailsLoading] = useState(false);
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [testLaunching, setTestLaunching] = useState(false);
  // The connected Gmail: where every deliverability-test email goes (PS-N13).
  const [ownInbox, setOwnInbox] = useState<string | null>(null);

  const safeSettings = [
    { icon: <FiMail className="w-4 h-4" />, label: "Daily limit", value: `Up to ${DAILY_LIMIT} emails/day` },
    // Matches campaign_worker: sends run 9 AM to 5 PM, spaced evenly with
    // jitter across that window (audit PS-N13).
    { icon: <FiClock className="w-4 h-4" />, label: "Sending hours", value: "9 AM - 5 PM" },
    { icon: <FiZap className="w-4 h-4" />, label: "Gap between emails", value: `About ${DAILY_LIMIT} a day, spread across the day` },
    { icon: <FiShield className="w-4 h-4" />, label: "First email", value: "Within 3 minutes of launch" },
  ];

  // candidateId recovery is handled by useOutreachAuth hook, no duplicate needed here

  useEffect(() => {
    if (!candidateId) return;
    updateOrder({ status: "campaign_setup", log_entry: "Entered campaign setup" });
  }, [candidateId]);

  // Fill whatever the local store is missing from the server's view of this
  // user. Someone arriving from the "launch your campaign" email, on another
  // device, has an empty store; before this, Launch told them to connect a
  // Gmail they had already connected.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchNextStep().then((step) => {
      if (cancelled || !step) return;
      if (step.state === "campaign_active") {
        // Open the campaign that is actually running or paused, not whatever
        // the store last held (audit PS-N02).
        if (step.campaign_id) setCampaignId(step.campaign_id);
        navigate("/outreach/campaign/dashboard");
        return;
      }
      // Setup is the paid part of the flow; the API refuses it unpaid (PS-N08).
      if (step.state === "not_paid") {
        navigate("/outreach/enrichment", { replace: true });
        return;
      }
      if (!candidateId && step.candidate_id) setCandidateId(step.candidate_id);
      if (!emailAccountId && step.email_account_id) setEmailAccountId(step.email_account_id);
      if (step.state === "launch_draft" && step.campaign_id) setCampaignId(step.campaign_id);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Active Gmail check: the local store can drift out of sync with the
  // backend (e.g. user connected Gmail in a different tab, the store still
  // has emailAccountId=null). Refetch on mount so the "Gmail not connected"
  // error doesn't show when the OAuth row actually exists.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    outreachFetch<{ email_account_id?: number; email_address?: string; token_valid?: boolean }>("/gmail/oauth/account")
      .then((data) => {
        if (cancelled) return;
        if (data?.email_address) setOwnInbox(data.email_address);
        if (data?.email_account_id && data.token_valid !== false) {
          if (data.email_account_id !== emailAccountId) {
            setEmailAccountId(data.email_account_id);
          }
        }
      })
      .catch(() => {
        // 404 = no OAuth row → emailAccountId stays null → user prompted to connect.
      });
    return () => { cancelled = true; };
    // run once on mount; we deliberately don't include emailAccountId so we
    // refetch fresh state regardless of what's currently in the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);


  const loadTestEmails = async () => {
    if (!candidateId || !emailAccountId) return;
    setTestEmailsLoading(true);
    setError("");
    try {
      const data = await outreachFetch<{ emails: TestEmail[] }>("/campaign/test-launch/preview", {
        method: "POST",
        body: JSON.stringify({
          candidate_id: candidateId,
          email_account_id: emailAccountId,
          // The style system is retired: the backend ignores the contents and uses one
          // email shape, with voice set by the lead's inferred team-size band. But a
          // NON-EMPTY list still selects AI generation; an empty one silently falls back
          // to template mode and sends a blank email. Always send the sentinel.
          selected_styles: ["ai"],
        }),
      });
      setTestEmails(data.emails);
      setOverrides({});
    } catch (err: any) {
      setError(describeError(err, "Failed to load test emails"));
    } finally {
      setTestEmailsLoading(false);
    }
  };

  const handleTestLaunch = async () => {
    if (!candidateId || !emailAccountId) return;
    setTestLaunching(true);
    setError("");

    const overrideList = Object.entries(overrides)
      .filter(([, email]) => email.trim().length > 0)
      .map(([idx, email]) => ({ lead_index: parseInt(idx), override_email: email.trim() }));

    try {
      const data = await outreachFetch<{ job_id: string }>("/campaign/test-launch", {
        method: "POST",
        body: JSON.stringify({
          candidate_id: candidateId,
          email_account_id: emailAccountId,
          overrides: overrideList,
          // The style system is retired: the backend ignores the contents and uses one
          // email shape, with voice set by the lead's inferred team-size band. But a
          // NON-EMPTY list still selects AI generation; an empty one silently falls back
          // to template mode and sends a blank email. Always send the sentinel.
          selected_styles: ["ai"],
        }),
      });

      const jobId = data.job_id;
      if (!jobId) throw new Error("No job_id returned");

      sessionStorage.setItem("test_job_id", jobId);
      sessionStorage.setItem("test_started_at", new Date().toISOString());
      navigate("/outreach/campaign/dashboard");
    } catch (err: any) {
      setError(describeError(err, "Failed to start test launch"));
      setTestLaunching(false);
    }
  };

  const handleLaunch = async () => {
    // A tap on Launch used to set an error far above the floating button and
    // look like nothing happened (audit PS-N04). Without Gmail, go connect it:
    // the connect page comes back here when done.
    if (!emailAccountId) {
      navigate("/outreach/connect/gmail");
      return;
    }
    if (!candidateId) {
      setError("We could not find your resume. Upload it again to continue.");
      return;
    }
    setLaunching(true);
    setError("");
    try {
      const validationData = await outreachFetch<{ valid: boolean; reason?: string }>(`/campaign/validate?candidate_id=${candidateId}&email_account_id=${emailAccountId}`);
      if (!validationData.valid) {
        setError(validationData.reason || "Validation failed.");
        setLaunching(false);
        return;
      }
    } catch (err: any) {
      if (err?.status !== 404) {
        setError(describeError(err, "Validation failed"));
        setLaunching(false);
        return;
      }
    }
    const launchConfig = {
      campaignName,
      userTimezone,
      selectedStyles: ["ai"],
      selectedTemplate: null,
    };
    // Router state carries this across the navigation itself; sessionStorage is
    // the backup for a reload on the launching screen. Mobile browsers evict
    // background tabs, so neither is guaranteed -- launching now falls back to
    // the same defaults this page starts with rather than dead-ending.
    try {
      sessionStorage.setItem("campaign_launch", JSON.stringify(launchConfig));
    } catch {
      // Private mode or blocked storage; router state still carries it.
    }
    navigate("/outreach/campaign/launching", { state: { launchConfig } });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    // PH-06: room for the floating Launch button (and any error above it), so
    // nothing ends up underneath it at the bottom of the page.
    <div className={`min-h-screen bg-white ${error ? "pb-48" : "pb-28"}`}>
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Campaign Setup</h1>
        <p className="text-sm text-studojo-muted font-satoshi mb-8">Review your settings before launching.</p>

        <div className="space-y-6">
          {/* Campaign Name */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <label className="text-xs font-bold text-studojo-muted block mb-2 font-satoshi uppercase">Campaign Name</label>
            <input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="My Outreach Campaign"
              className="w-full h-10 px-4 rounded-xl border-2 border-studojo-ink/20 text-base font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
          </div>

          {/* Safe Sending Settings */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-green">
                <FiShield className="w-5 h-5" />
              </div>
              <h3 className="font-clash text-lg font-bold text-studojo-ink">Safe Sending Settings</h3>
            </div>
            <p className="text-sm text-studojo-muted font-satoshi mb-4">These settings protect your email reputation. They cannot be changed.</p>
            <div className="space-y-3">
              {safeSettings.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-studojo-surface-muted rounded-xl border-2 border-studojo-ink/20">
                  <div className="flex items-center gap-3">
                    <span className="text-studojo-purple">{s.icon}</span>
                    <span className="text-sm font-satoshi text-studojo-ink">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold font-satoshi text-studojo-ink">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sending Timezone */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
                <FiGlobe className="w-5 h-5" />
              </div>
              <h3 className="font-clash text-lg font-bold text-studojo-ink">Sending Timezone</h3>
            </div>
            <p className="text-sm text-studojo-muted font-satoshi mb-4">
              Emails go out 9am-5pm in this timezone. Set it to match where your recipients are located.
            </p>
            <select
              value={userTimezone}
              onChange={(e) => setUserTimezone(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border-2 border-studojo-ink/20 text-base font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple bg-white"
            >
              {TIMEZONES.some((tz) => tz.value === userTimezone) ? null : (
                <option value={userTimezone}>{userTimezone} (detected)</option>
              )}
              {TIMEZONES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-studojo-muted font-satoshi mt-2">Auto-detected from your browser. Change to match your recipients' location.</p>
          </div>

          {/* Deliverability Test */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-studojo-ink flex items-center justify-center text-amber-600">
                <RiFlaskLine className="w-5 h-5" />
              </div>
              <h3 className="font-clash text-lg font-bold text-studojo-ink">Deliverability Test</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-amber-50 text-amber-700 border border-amber-200">
                5 emails
              </span>
            </div>
            <p className="text-sm text-studojo-muted font-satoshi mb-4">
              Sends 5 sample emails to your own inbox{ownInbox ? <> (<strong className="text-studojo-ink">{ownInbox}</strong>)</> : null}, each subject starting with [TEST], so you can check how they look and that your Gmail is connected. Nothing goes to the hiring managers.
            </p>

            {testEmails.length === 0 ? (
              <button
                onClick={loadTestEmails}
                disabled={testEmailsLoading}
                className="w-full h-10 px-5 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center"
              >
                {testEmailsLoading ? (
                  <div className="w-4 h-4 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <RiFlaskLine className="w-4 h-4 mr-2" />
                )}
                Load Test Emails
              </button>
            ) : (
              <>
                <p className="text-xs text-studojo-muted font-satoshi mb-3">
                  To use another of your own addresses, type it in. Anything else is sent to your connected Gmail.
                </p>
                <div className="space-y-3 mb-4">
                  {testEmails.map((email) => (
                    <div key={email.index} className="bg-studojo-surface-muted rounded-xl border-2 border-studojo-ink/20 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold font-satoshi text-studojo-ink truncate"><span className="font-medium text-studojo-muted">Sample written for </span>{email.lead_name}</p>
                          <p className="text-xs text-studojo-muted font-satoshi truncate">{email.lead_company}</p>
                          <p className="text-xs text-studojo-muted font-satoshi mt-1 truncate">Subject: {email.subject}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium border bg-studojo-green-bg text-studojo-green border-studojo-green/30 whitespace-nowrap">
                          To your inbox
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <FiEdit2 className="w-3 h-3 text-studojo-muted flex-shrink-0" />
                        <input
                          value={overrides[email.index] || ""}
                          onChange={(e) => setOverrides((prev) => ({ ...prev, [email.index]: e.target.value }))}
                          placeholder={ownInbox ?? "Your connected Gmail"}
                          aria-label="Send this test to another of your own addresses"
                          className="flex-1 h-8 px-3 rounded-lg border-2 border-studojo-ink/20 text-base font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleTestLaunch}
                  disabled={testLaunching}
                  className="w-full h-10 px-5 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center"
                >
                  {testLaunching ? (
                    <div className="w-4 h-4 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <RiFlaskLine className="w-4 h-4 mr-2" />
                  )}
                  Send Test Emails
                </button>
                {testLaunching && <p className="text-xs text-studojo-muted text-center mt-2 font-satoshi">Opening your test results...</p>}
              </>
            )}
          </div>

          {error ? (
            <p className="text-red-600 text-sm text-center font-satoshi">{error}</p>
          ) : null}
        </div>
      </div>
      <AppFooter />

      {/* Floating Launch Campaign button, with any error right above it */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex w-[min(92vw,28rem)] flex-col items-center gap-2">
        {error && (
          <p role="alert" className="w-full rounded-xl border-2 border-red-300 bg-red-50 px-3 py-2 text-center text-sm font-satoshi text-red-700 shadow-brutal">
            {error}
            {!candidateId && (
              <>
                {" "}
                <button onClick={() => navigate("/outreach/onboarding/upload")} className="font-semibold underline">
                  Upload resume
                </button>
              </>
            )}
          </p>
        )}
        <button
          onClick={handleLaunch}
          disabled={launching}
          className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center whitespace-nowrap"
        >
          {launching ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <FiCheckCircle className="w-5 h-5 mr-2" />
          )}
          Launch Campaign
        </button>
      </div>
    </div>
  );
}
