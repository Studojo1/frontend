import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FiShield, FiClock, FiMail, FiZap, FiCheckCircle, FiEye, FiEdit2,
} from "react-icons/fi";
import { RiFlaskLine } from "react-icons/ri";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOrder } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

interface TestEmail {
  index: number;
  lead_name: string;
  lead_company: string;
  original_email: string;
  subject: string;
  body: string;
}

export default function CampaignSetupPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, setCandidateId, emailAccountId, setEmailAccountId, setCampaignId, selectedTemplate, selectedStyles } = useOutreachStore();
  const { updateOrder } = useOrder();
  const [campaignName, setCampaignName] = useState("My Outreach Campaign");
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");
  const [previewEmail, setPreviewEmail] = useState<{ subject: string; body: string; lead_name: string; company: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Test launch state
  const [testEmails, setTestEmails] = useState<TestEmail[]>([]);
  const [testEmailsLoading, setTestEmailsLoading] = useState(false);
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [testLaunching, setTestLaunching] = useState(false);

  const safeSettings = [
    { icon: <FiMail className="w-4 h-4" />, label: "Daily limit", value: "5-7 emails/day" },
    { icon: <FiClock className="w-4 h-4" />, label: "Sending hours", value: "9 AM - 6 PM" },
    { icon: <FiZap className="w-4 h-4" />, label: "Gap between emails", value: "40-90 minutes (randomized)" },
    { icon: <FiShield className="w-4 h-4" />, label: "First email", value: "Within 3 minutes of launch" },
  ];

  // candidateId recovery is handled by useOutreachAuth hook — no duplicate needed here

  const fetchPreview = async () => {
    if (!candidateId) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await outreachFetch<{ subject: string; body: string; lead_name: string; company: string }>("/campaign/preview-email", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId, selected_styles: selectedStyles.length > 0 ? selectedStyles : ["value_prop"] }),
        maxRetries: 1,
        timeout: 15000,
      });
      setPreviewEmail(data);
    } catch (err: any) {
      setPreviewEmail(null);
      const detail = err?.body?.detail || err?.message || "Preview generation failed";
      setPreviewError(detail);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (!candidateId) return;
    updateOrder({ status: "campaign_setup", log_entry: "Entered campaign setup" });
    fetchPreview();
  }, [candidateId]);

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
          selected_styles: selectedStyles.length > 0 ? selectedStyles : ["value_prop"],
        }),
      });
      setTestEmails(data.emails);
      setOverrides({});
    } catch (err: any) {
      setError(err?.body?.detail || "Failed to load test emails");
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
          selected_styles: selectedStyles.length > 0 ? selectedStyles : ["value_prop"],
        }),
      });

      const jobId = data.job_id;
      if (!jobId) throw new Error("No job_id returned");

      sessionStorage.setItem("test_job_id", jobId);
      sessionStorage.setItem("test_started_at", new Date().toISOString());
      navigate("/outreach/campaign/dashboard");
    } catch (err: any) {
      setError(err?.body?.detail || "Failed to start test launch");
      setTestLaunching(false);
    }
  };

  const handleLaunch = async () => {
    if (!candidateId || !emailAccountId) return;
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
        setError(err?.body?.detail || "Validation failed");
        setLaunching(false);
        return;
      }
    }
    sessionStorage.setItem("campaign_launch", JSON.stringify({
      campaignName,
      selectedStyles: selectedStyles.length > 0 ? selectedStyles : [],
      selectedTemplate: selectedStyles.length === 0 ? selectedTemplate : null,
    }));
    navigate("/outreach/campaign/launching");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Campaign Setup</h1>
        <p className="text-sm text-studojo-muted font-satoshi mb-8">Review your email preview and settings before launching.</p>

        <div className="space-y-6">
          {/* Campaign Name */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <label className="text-xs font-bold text-studojo-muted block mb-2 font-satoshi uppercase">Campaign Name</label>
            <input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="My Outreach Campaign"
              className="w-full h-10 px-4 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
          </div>

          {/* Email Preview */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
                <FiEye className="w-5 h-5" />
              </div>
              <h3 className="font-clash text-lg font-bold text-studojo-ink">Email Preview</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/30">
                Sample
              </span>
            </div>
            <p className="text-sm text-studojo-muted font-satoshi mb-4">Here is a sample of what your outreach emails will look like.</p>
            {previewLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
              </div>
            ) : previewEmail ? (
              <div className="bg-studojo-surface-muted rounded-xl border-2 border-studojo-ink/20 p-6">
                <div className="mb-4 pb-4 border-b-2 border-studojo-ink/10">
                  <p className="text-xs text-studojo-muted font-satoshi">To: {previewEmail.lead_name} at {previewEmail.company}</p>
                </div>
                <p className="text-sm font-bold mb-4 font-satoshi text-studojo-ink">Subject: {previewEmail.subject}</p>
                <p className="text-sm text-studojo-muted whitespace-pre-line leading-relaxed font-satoshi">{previewEmail.body}</p>
              </div>
            ) : (
              <div className="bg-studojo-surface-muted rounded-xl p-6 text-center">
                <p className="text-sm text-studojo-muted font-satoshi mb-2">
                  {previewError || "Email preview could not be generated."}
                </p>
                <button
                  onClick={fetchPreview}
                  className="text-sm font-satoshi font-medium text-studojo-purple hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
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
              Send 5 quick test emails to your own inbox to confirm your email connection and deliverability before launching the campaign.
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
                <div className="space-y-3 mb-4">
                  {testEmails.map((email) => (
                    <div key={email.index} className="bg-studojo-surface-muted rounded-xl border-2 border-studojo-ink/20 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold font-satoshi text-studojo-ink truncate">{email.lead_name}</p>
                          <p className="text-xs text-studojo-muted font-satoshi truncate">{email.lead_company}</p>
                          <p className="text-xs text-studojo-muted font-satoshi mt-1 truncate">Subject: {email.subject}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium border ${
                          overrides[email.index]
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-studojo-green-bg text-studojo-green border-studojo-green/30"
                        }`}>
                          {overrides[email.index] ? "Override" : "Original"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <FiEdit2 className="w-3 h-3 text-studojo-muted flex-shrink-0" />
                        <input
                          value={overrides[email.index] || ""}
                          onChange={(e) => setOverrides((prev) => ({ ...prev, [email.index]: e.target.value }))}
                          placeholder={email.original_email}
                          className="flex-1 h-8 px-3 rounded-lg border-2 border-studojo-ink/20 text-xs font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
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
                {testLaunching && <p className="text-xs text-studojo-muted text-center mt-2 font-satoshi">Redirecting to launch screen...</p>}
              </>
            )}
          </div>

          {error && <p className="text-red-600 text-sm text-center font-satoshi">{error}</p>}

          <div className="text-center pt-6">
            <button
              onClick={handleLaunch}
              disabled={launching}
              className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center"
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
      </div>
      <Footer />
    </div>
  );
}
