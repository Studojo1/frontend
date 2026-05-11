import { redirect } from "react-router";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/lkot";
import { useEffect, useState, useRef } from "react";
import {
  FiArrowRight, FiArrowLeft, FiEye, FiEyeOff,
  FiAlertCircle, FiShield, FiSearch, FiUsers,
  FiExternalLink, FiPause, FiPlay, FiSend,
  FiRefreshCw, FiDownload, FiCheckCircle, FiMessageSquare,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { outreachFetch } from "~/lib/outreach/api";

// ── Auth guard ────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/lkot");
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface QuizData {
  target_role: string;
  target_industries: string[];
  target_locations: string[];
  target_company_sizes: string[];
  target_keywords: string;
  campaign_name: string;
}

interface Campaign {
  id: number; name: string; status: string; target_role: string;
  total_leads: number; total_sent: number; total_accepted: number;
  total_followups_sent: number; total_replied: number; daily_limit: number;
}

interface CampaignStats {
  total_sent: number; total_accepted: number; total_followups_sent: number;
  total_replied: number; acceptance_rate: number; reply_rate: number;
}

interface Lead {
  id: number; name: string; headline?: string; profile_url: string; status: string; reply_text?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ["Target", "Industries", "Location", "Connect", "Messages", "Live"];
const STORAGE_KEY = "li_lkot_v1";

const INDUSTRIES = [
  "SaaS / Software", "Fintech", "E-commerce", "Health Tech",
  "Ed Tech", "Climate Tech", "Media / Content", "Consulting",
  "D2C / Consumer", "AI / ML",
];

const LOCATIONS = [
  "India", "United States", "United Kingdom",
  "UAE / Dubai", "Singapore", "Europe", "Southeast Asia", "Global",
];

const COMPANY_SIZES = [
  "1–10 (pre-seed/seed)", "11–50 (early stage)",
  "51–200 (Series A/B)", "201–1000 (growth)", "1000+ (enterprise)",
];

const ROLE_SUGGESTIONS = [
  "Founder / Co-founder", "Head of Marketing", "VP Sales",
  "Product Manager", "CTO", "HR Manager", "Chief of Staff",
];

const NOTE_PLACEHOLDER = `Hi {{name}}, came across your work at {{company}} — really interesting what you're building. Would love to connect!`;
const FOLLOWUP_PLACEHOLDER = `Hey {{name}}, thanks for connecting! I'm a student interested in {{role}} at {{company}}. Would love to chat for 15 min if you have time.`;

const STATUS_STYLE: Record<string, string> = {
  pending:       "bg-neutral-100 text-neutral-500",
  sent:          "bg-blue-100 text-blue-700",
  accepted:      "bg-green-100 text-green-700",
  followup_sent: "bg-violet-100 text-violet-700",
  replied:       "bg-emerald-100 text-emerald-700",
  error:         "bg-red-100 text-red-600",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Queued", sent: "Sent", accepted: "Accepted",
  followup_sent: "Follow-up sent", replied: "Replied", error: "Error",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function errMsg(e: unknown): string {
  if (!e) return "Something went wrong.";
  if (e instanceof Error) return e.message;
  return String(e);
}

function saveWizard(step: Step, quiz: QuizData, campaignId: number | null) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, quiz, campaignId })); } catch {}
}
function clearWizard() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-sm border-2 font-satoshi font-medium transition-all ${
        selected
          ? "border-studojo-purple bg-studojo-purple text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
          : "border-studojo-ink bg-white text-studojo-ink hover:bg-neutral-50"
      }`}
    >
      {label}
    </button>
  );
}

function Btn({
  children, onClick, disabled, variant = "primary", className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-studojo-ink font-satoshi text-sm font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none";
  const styles = variant === "primary"
    ? "bg-studojo-purple text-white shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
    : "bg-white text-studojo-ink shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function StepNav({
  onBack, onNext, nextLabel = "Continue", disabled = false, hideBack = false,
}: {
  onBack?: () => void; onNext: () => void;
  nextLabel?: string; disabled?: boolean; hideBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-8">
      {!hideBack && onBack ? (
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-satoshi text-studojo-muted hover:text-studojo-ink transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>
      ) : <div />}
      <Btn onClick={onNext} disabled={disabled}>
        {nextLabel} <FiArrowRight className="w-4 h-4" />
      </Btn>
    </div>
  );
}

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1 mb-10">
      {STEPS.map((label, i) => {
        const idx = (i + 1) as Step;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full ${done || active ? "bg-studojo-purple" : "bg-neutral-200"}`} />
            <span className={`text-xs font-satoshi hidden sm:block ${active ? "font-semibold text-studojo-ink" : "text-studojo-muted"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MetricTile({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="border-2 border-studojo-ink rounded-2xl p-4 text-center bg-white shadow-brutal">
      <p className="text-2xl font-clash font-bold text-studojo-ink">{value}</p>
      <p className="text-xs font-satoshi text-studojo-muted mt-0.5">{label}</p>
      {sub && <p className="text-xs font-satoshi font-bold text-studojo-purple mt-1">{sub}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LkotPage() {
  const [step, setStep] = useState<Step>(1);
  const [restored, setRestored] = useState(false);

  const [quiz, setQuiz] = useState<QuizData>({
    target_role: "", target_industries: [], target_locations: [],
    target_company_sizes: [], target_keywords: "", campaign_name: "",
  });

  // Connect state
  const [liEmail, setLiEmail] = useState("");
  const [liPass, setLiPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginTab, setLoginTab] = useState<"password" | "extension">("extension");
  const [challengeRequired, setChallengeRequired] = useState(false);
  const [sessionKey, setSessionKey] = useState("");
  const [pin, setPin] = useState("");
  const [liAtCookie, setLiAtCookie] = useState("");
  const [jsessionidCookie, setJsessionidCookie] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [cookieLoading, setCookieLoading] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [extInstalled, setExtInstalled] = useState(false);
  const [extLoading, setExtLoading] = useState(false);

  // Messages
  const [connectionNote, setConnectionNote] = useState("");
  const [followupMessage, setFollowupMessage] = useState("");
  const [dailyLimit, setDailyLimit] = useState(20);

  // Campaign state
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [requests, setRequests] = useState<Lead[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchingLeads, setSearchingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState("");
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");
  const [toggling, setToggling] = useState(false);
  const [sendingOne, setSendingOne] = useState(false);
  const [sendOneResult, setSendOneResult] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "sent" | "accepted" | "replied">("all");

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const toggleMulti = (
    field: keyof Pick<QuizData, "target_industries" | "target_locations" | "target_company_sizes">,
    val: string,
  ) => {
    setQuiz(q => {
      const arr = q[field] as string[];
      return { ...q, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  };

  const canNext = () => {
    if (step === 1) return quiz.target_role.trim().length > 1;
    if (step === 2) return quiz.target_industries.length > 0;
    if (step === 3) return quiz.target_locations.length > 0 && quiz.target_company_sizes.length > 0 && quiz.campaign_name.trim().length > 1;
    if (step === 4) return loginTab === "extension" || (liEmail.length > 0 && liPass.length > 0);
    return true;
  };

  const goTo = (s: Step) => { setStep(s); saveWizard(s, quiz, campaignId); };
  const next = () => goTo((step + 1) as Step);
  const back = () => goTo((step - 1) as Step);

  // ── Extension detection ───────────────────────────────────────────────────────

  useEffect(() => {
    const onReady = () => setExtInstalled(true);
    window.addEventListener("STUDOJO_EXT_READY", onReady);
    // Ping the extension — it may have already fired STUDOJO_EXT_READY before this effect mounted
    window.dispatchEvent(new CustomEvent("STUDOJO_PING"));
    const t = setTimeout(() => window.removeEventListener("STUDOJO_EXT_READY", onReady), 1500);
    return () => { clearTimeout(t); window.removeEventListener("STUDOJO_EXT_READY", onReady); };
  }, []);

  // ── Restore from localStorage ─────────────────────────────────────────────────

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { setRestored(true); return; }
    try {
      const saved = JSON.parse(raw);
      const savedStep: Step = saved.step ?? 1;
      const savedQuiz: QuizData = saved.quiz ?? quiz;
      const savedCampaignId: number | null = saved.campaignId ?? null;
      setQuiz(savedQuiz);
      setCampaignId(savedCampaignId);
      if (savedStep === 6 && savedCampaignId) {
        fetchDashboard(savedCampaignId, true).then(() => {
          setStep(6); setRestored(true);
          pollRef.current = setInterval(() => fetchDashboard(savedCampaignId), 30000);
        }).catch(() => { clearWizard(); setRestored(true); });
      } else if (savedStep === 5 && savedCampaignId) {
        outreachFetch<Lead[]>(`/linkedin/automation/campaigns/${savedCampaignId}/requests?limit=50`)
          .then(r => {
            if (r.length > 0) setLeads(r);
            else setLeadsError("No leads found. Try broadening your search criteria.");
            setStep(5); setRestored(true);
          })
          .catch(() => { clearWizard(); setRestored(true); });
      } else {
        setStep(savedStep); setRestored(true);
      }
    } catch { clearWizard(); setRestored(true); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── API ───────────────────────────────────────────────────────────────────────

  const fetchDashboard = async (id: number, checkAuth = false) => {
    const [c, s, r] = await Promise.all([
      outreachFetch<Campaign>(`/linkedin/automation/campaigns/${id}`),
      outreachFetch<CampaignStats>(`/linkedin/automation/campaigns/${id}/stats`),
      outreachFetch<Lead[]>(`/linkedin/automation/campaigns/${id}/requests?limit=200`),
    ]);
    setCampaign(c); setStats(s); setRequests(r);
    // On first load of a running campaign, proactively verify the LinkedIn session
    if (checkAuth && c.status === "running") {
      try {
        const authRes = await outreachFetch<{ auth_ok: boolean }>(`/linkedin/automation/campaigns/${id}/check-auth`, { method: "POST" });
        if (!authRes.auth_ok) {
          setCampaign(prev => prev ? { ...prev, status: "auth_failed" } : prev);
        }
      } catch {}
    }
  };

  const startLeadSearch = async (id: number) => {
    setSearchingLeads(true); setLeadsError(""); setLeads([]);
    await outreachFetch(`/linkedin/automation/campaigns/${id}/search-leads`, { method: "POST" });
    let attempts = 0;
    const poll = async () => {
      try {
        const [r, c] = await Promise.all([
          outreachFetch<Lead[]>(`/linkedin/automation/campaigns/${id}/requests?limit=50`),
          outreachFetch<Campaign>(`/linkedin/automation/campaigns/${id}`),
        ]);
        if (r.length > 0) { setLeads(r); setSearchingLeads(false); return; }
        if (c.status === "search_failed") { setSearchingLeads(false); setLeadsError("search_failed"); return; }
      } catch {}
      attempts++;
      if (attempts < 20) pollRef.current = setTimeout(poll, 3000);
      else { setSearchingLeads(false); setLeadsError("No leads found. Try broadening your search criteria."); }
    };
    poll();
  };

  const proceedAfterLogin = async () => {
    // If campaign state is missing (e.g. hard-refresh on step 4), fetch it first
    // so we can decide whether to resume or create a new campaign.
    let activeCampaign = campaign;
    if (campaignId && !activeCampaign) {
      try {
        activeCampaign = await outreachFetch<Campaign>(`/linkedin/automation/campaigns/${campaignId}`);
        setCampaign(activeCampaign);
      } catch {}
    }

    if (campaignId && activeCampaign && ["auth_failed", "paused"].includes(activeCampaign.status)) {
      await outreachFetch(`/linkedin/automation/campaigns/${campaignId}/resume`, { method: "POST" });
      // Do NOT pass checkAuth here — Voyager calls from the server always fail
      // on datacenter IPs, causing a false auth_failed loop.
      await fetchDashboard(campaignId);
      setStep(6); saveWizard(6, quiz, campaignId);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchDashboard(campaignId), 30000);
      return;
    }
    const res = await outreachFetch<Campaign>("/linkedin/automation/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: quiz.campaign_name || `${quiz.target_role} outreach`,
        target_role: quiz.target_role,
        target_industries: quiz.target_industries,
        target_locations: quiz.target_locations,
        target_company_sizes: quiz.target_company_sizes,
        target_keywords: quiz.target_keywords || null,
        daily_limit: dailyLimit,
      }),
    });
    const id = res.id;
    setCampaignId(id); setStep(5); saveWizard(5, quiz, id);
    await startLeadSearch(id);
  };

  // ── Connect handlers ───────────────────────────────────────────────────────────

  const handleConnect = async () => {
    setConnectLoading(true); setConnectError("");
    try {
      const res = await outreachFetch<{ ok: boolean; challenge_required?: boolean; session_key?: string }>("/linkedin/automation/login", {
        method: "POST",
        body: JSON.stringify({ email: liEmail, password: liPass }),
      });
      if (res.challenge_required && res.session_key) {
        setSessionKey(res.session_key); setChallengeRequired(true);
      } else {
        await proceedAfterLogin();
      }
    } catch (e) { setConnectError(errMsg(e)); }
    finally { setConnectLoading(false); }
  };

  const handleVerifyPin = async () => {
    setPinLoading(true); setConnectError("");
    try {
      await outreachFetch("/linkedin/automation/login/verify-pin", {
        method: "POST",
        body: JSON.stringify({ session_key: sessionKey, pin }),
      });
      setChallengeRequired(false);
      await proceedAfterLogin();
    } catch (e) { setConnectError(errMsg(e)); }
    finally { setPinLoading(false); }
  };

  const handleCookieLogin = async () => {
    setCookieLoading(true); setConnectError("");
    try {
      await outreachFetch("/linkedin/automation/login/cookies", {
        method: "POST",
        body: JSON.stringify({ li_at: liAtCookie.trim(), jsessionid: jsessionidCookie.trim() }),
      });
      await proceedAfterLogin();
    } catch (e) { setConnectError(errMsg(e)); }
    finally { setCookieLoading(false); }
  };

  const handleExtensionLogin = () => {
    setExtLoading(true); setConnectError("");
    let tid: ReturnType<typeof setTimeout>;
    const onCookies = (e: Event) => {
      clearTimeout(tid);
      const { li_at, jsessionid, error } = (e as CustomEvent).detail || {};
      window.removeEventListener("STUDOJO_LI_COOKIES", onCookies);
      if (error || !li_at) {
        setConnectError(error || "Extension couldn't read LinkedIn cookies. Make sure you're logged in to LinkedIn.");
        setExtLoading(false); return;
      }
      outreachFetch("/linkedin/automation/login/cookies", {
        method: "POST",
        body: JSON.stringify({ li_at, jsessionid: jsessionid || "" }),
      })
        .then(() => proceedAfterLogin())
        .catch(err => setConnectError(errMsg(err)))
        .finally(() => setExtLoading(false));
    };
    window.addEventListener("STUDOJO_LI_COOKIES", onCookies);
    window.dispatchEvent(new CustomEvent("STUDOJO_REQUEST_LI_COOKIES"));
    tid = setTimeout(() => {
      window.removeEventListener("STUDOJO_LI_COOKIES", onCookies);
      setExtLoading(false);
      setConnectError("Extension didn't respond. Refresh the page or install the extension.");
    }, 5000);
  };

  const handleLaunch = async () => {
    if (!campaignId) return;
    setLaunching(true); setLaunchError("");
    try {
      await outreachFetch(`/linkedin/automation/campaigns/${campaignId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: quiz.campaign_name || `${quiz.target_role} outreach`,
          target_role: quiz.target_role,
          target_industries: quiz.target_industries,
          target_locations: quiz.target_locations,
          target_company_sizes: quiz.target_company_sizes,
          target_keywords: quiz.target_keywords || null,
          connection_note: connectionNote || NOTE_PLACEHOLDER,
          followup_message: followupMessage || FOLLOWUP_PLACEHOLDER,
          daily_limit: dailyLimit,
        }),
      });
      await outreachFetch(`/linkedin/automation/campaigns/${campaignId}/launch`, { method: "POST" });
      await fetchDashboard(campaignId);
      setStep(6); saveWizard(6, quiz, campaignId);
      pollRef.current = setInterval(() => fetchDashboard(campaignId), 30000);
    } catch (e) { setLaunchError(errMsg(e)); }
    finally { setLaunching(false); }
  };

  const sendOne = async () => {
    if (!campaignId) return;
    setSendingOne(true); setSendOneResult("");
    try {
      // Pull the next pending request from the backend
      const next = await outreachFetch<{
        pending: boolean; request_id?: number; profile_url?: string;
        profile_urn?: string; connection_note?: string; name?: string;
      }>(`/linkedin/automation/campaigns/${campaignId}/next-pending`);

      if (!next.pending) {
        setSendOneResult("No pending leads");
        return;
      }

      if (!extInstalled) {
        setSendOneResult("Extension not detected — install the Studojo LinkedIn Connector first");
        return;
      }

      // Send via the Chrome extension (uses real browser session — no proxy issues)
      const result = await new Promise<{ ok?: boolean; authToken?: string; error?: string; status?: number }>((resolve) => {
        const handler = (e: Event) => {
          window.removeEventListener("STUDOJO_INVITATION_RESULT", handler);
          resolve((e as CustomEvent).detail);
        };
        window.addEventListener("STUDOJO_INVITATION_RESULT", handler);
        window.dispatchEvent(new CustomEvent("STUDOJO_SEND_INVITATION", {
          detail: {
            profileUrl: next.profile_url,
            profileUrn: next.profile_urn,
            note: next.connection_note,
          },
        }));
        // 60-second timeout — profile page fetch can be slow
        setTimeout(() => {
          window.removeEventListener("STUDOJO_INVITATION_RESULT", handler);
          resolve({ error: "timeout" });
        }, 60000);
      });

      // Report result back to backend
      await outreachFetch(`/linkedin/automation/campaigns/${campaignId}/requests/${next.request_id}/report`, {
        method: "POST",
        body: JSON.stringify({ ok: result.ok ?? false, auth_token: result.authToken ?? null, error: result.error ?? null }),
      });

      if (result.ok) {
        setSendOneResult(`Sent to ${next.name}`);
      } else if (result.error === "timeout") {
        setSendOneResult(`Timeout — LinkedIn took too long to respond`);
      } else {
        setSendOneResult(`Failed for ${next.name} (status ${result.status ?? "unknown"})`);
      }

      await fetchDashboard(campaignId);
    } catch (e) {
      setSendOneResult(`Error: ${errMsg(e)}`);
      await fetchDashboard(campaignId);
    } finally { setSendingOne(false); }
  };

  const retryErrors = async () => {
    if (!campaignId) return;
    setSendOneResult("");
    try {
      const res = await outreachFetch<{ ok: boolean; reset: number }>(`/linkedin/automation/campaigns/${campaignId}/retry-errors`, { method: "POST" });
      setSendOneResult(`${res.reset} lead${res.reset === 1 ? "" : "s"} queued for retry`);
      await fetchDashboard(campaignId);
    } catch (e) {
      setSendOneResult(`Error: ${errMsg(e)}`);
    }
  };

  const toggleCampaign = async () => {
    if (!campaign || !campaignId) return;
    setToggling(true);
    try {
      const action = campaign.status === "running" ? "pause" : "resume";
      await outreachFetch(`/linkedin/automation/campaigns/${campaignId}/${action}`, { method: "POST" });
      await fetchDashboard(campaignId);
    } finally { setToggling(false); }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === "sent") return ["sent", "accepted", "followup_sent", "replied"].includes(r.status);
    if (activeTab === "accepted") return ["accepted", "followup_sent", "replied"].includes(r.status);
    if (activeTab === "replied") return r.status === "replied";
    return true;
  });

  // ── Render ────────────────────────────────────────────────────────────────────

  if (!restored) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <FiRefreshCw className="h-8 w-8 animate-spin text-studojo-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-10 md:px-6">

        <ProgressBar step={step} />

        {/* ── Step 1 ────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="font-clash text-2xl font-bold text-studojo-ink mb-1">Who do you want to reach?</h2>
            <p className="font-satoshi text-sm text-studojo-muted mb-6">Enter the job title of your ideal LinkedIn connection.</p>
            <input
              type="text"
              value={quiz.target_role}
              onChange={e => setQuiz(q => ({ ...q, target_role: e.target.value }))}
              placeholder="e.g. Founder, Head of Marketing, VP Sales"
              className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 font-satoshi text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 mb-4 bg-white"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              {ROLE_SUGGESTIONS.map(r => (
                <Chip key={r} label={r} selected={quiz.target_role === r} onClick={() => setQuiz(q => ({ ...q, target_role: r }))} />
              ))}
            </div>
            <StepNav hideBack onNext={next} disabled={!canNext()} />
          </div>
        )}

        {/* ── Step 2 ────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="font-clash text-2xl font-bold text-studojo-ink mb-1">What industries?</h2>
            <p className="font-satoshi text-sm text-studojo-muted mb-6">Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(ind => (
                <Chip key={ind} label={ind} selected={quiz.target_industries.includes(ind)} onClick={() => toggleMulti("target_industries", ind)} />
              ))}
            </div>
            <StepNav onBack={back} onNext={next} disabled={!canNext()} />
          </div>
        )}

        {/* ── Step 3 ────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-clash text-2xl font-bold text-studojo-ink mb-1">Where are they based?</h2>
              <p className="font-satoshi text-sm text-studojo-muted mb-4">Pick your target markets.</p>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(loc => (
                  <Chip key={loc} label={loc} selected={quiz.target_locations.includes(loc)} onClick={() => toggleMulti("target_locations", loc)} />
                ))}
              </div>
            </div>
            <div>
              <p className="font-satoshi text-sm font-semibold mb-3 text-studojo-ink">Company size</p>
              <div className="space-y-2">
                {COMPANY_SIZES.map(size => (
                  <button key={size} type="button"
                    onClick={() => toggleMulti("target_company_sizes", size)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 font-satoshi text-sm transition-all ${
                      quiz.target_company_sizes.includes(size)
                        ? "border-studojo-purple bg-studojo-purple/5 font-semibold"
                        : "border-studojo-ink bg-white hover:bg-neutral-50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-satoshi text-sm font-semibold block mb-1.5 text-studojo-ink">Campaign name</label>
              <input type="text" value={quiz.campaign_name}
                onChange={e => setQuiz(q => ({ ...q, campaign_name: e.target.value }))}
                placeholder={`${quiz.target_role || "Founder"} outreach — ${new Date().toLocaleDateString("en", { month: "short", year: "numeric" })}`}
                className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 font-satoshi text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              />
            </div>
            <div>
              <label className="font-satoshi text-sm font-semibold block mb-1.5 text-studojo-ink">
                Extra keywords <span className="font-normal text-studojo-muted">(optional)</span>
              </label>
              <input type="text" value={quiz.target_keywords}
                onChange={e => setQuiz(q => ({ ...q, target_keywords: e.target.value }))}
                placeholder="e.g. Series A, YC, AI, fintech"
                className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 font-satoshi text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              />
            </div>
            <StepNav onBack={back} onNext={next} disabled={!canNext()} />
          </div>
        )}

        {/* ── Step 4 ────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="font-clash text-2xl font-bold text-studojo-ink mb-1">
              {challengeRequired ? "Check your email" : "Connect your LinkedIn"}
            </h2>
            <p className="font-satoshi text-sm text-studojo-muted mb-6">
              {challengeRequired
                ? `LinkedIn sent a verification code to ${liEmail}`
                : "We'll find leads and send connection requests on your behalf."}
            </p>

            {!challengeRequired && (
              <div className="flex border-2 border-studojo-ink rounded-xl overflow-hidden mb-5">
                {(["extension", "password"] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => { setLoginTab(t); setConnectError(""); }}
                    className={`flex-1 py-2.5 font-satoshi text-sm font-semibold transition-colors ${
                      loginTab === t ? "bg-studojo-purple text-white" : "bg-white text-studojo-muted hover:text-studojo-ink"
                    }`}
                  >
                    {t === "extension" ? "Use extension" : "Email & password"}
                  </button>
                ))}
              </div>
            )}

            {!challengeRequired ? (
              <>
                {loginTab === "extension" ? (
                  <div className="space-y-4">
                    {/* Download card */}
                    <div className="border-2 border-studojo-purple bg-violet-50 rounded-2xl p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-satoshi font-semibold text-sm text-studojo-ink mb-0.5">Studojo LinkedIn Connector</p>
                          <p className="font-satoshi text-xs text-studojo-muted">Reads your LinkedIn session automatically — no copy-pasting needed.</p>
                        </div>
                        <a
                          href="/studojo-linkedin-connector.zip"
                          download
                          className="flex-shrink-0 inline-flex items-center gap-1.5 border-2 border-studojo-ink bg-studojo-ink text-white font-satoshi text-xs font-semibold px-3 py-2 rounded-lg shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                        >
                          <FiDownload className="w-3 h-3" /> Download
                        </a>
                      </div>
                      <p className="font-satoshi text-xs text-studojo-muted">
                        <strong>chrome://extensions</strong> → Developer mode → Load unpacked → select unzipped folder → refresh this page.
                      </p>
                    </div>

                    {extInstalled ? (
                      <div className="border-2 border-green-300 bg-green-50 rounded-2xl p-5 space-y-3 text-center">
                        <div className="flex items-center justify-center gap-2 font-satoshi text-sm font-semibold text-green-700">
                          <FiCheckCircle className="w-4 h-4" /> Extension detected
                        </div>
                        <p className="font-satoshi text-xs text-studojo-muted">
                          Make sure you&apos;re logged in to{" "}
                          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="underline">linkedin.com</a>
                          , then click below.
                        </p>
                        {connectError && (
                          <div className="flex items-start gap-2 border-2 border-red-300 bg-red-50 rounded-xl p-3 text-sm text-red-700 text-left">
                            <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="font-satoshi">{connectError}</span>
                          </div>
                        )}
                        <Btn onClick={handleExtensionLogin} disabled={extLoading} className="w-full justify-center">
                          {extLoading
                            ? <><FiRefreshCw className="w-4 h-4 animate-spin" /> Reading session…</>
                            : <>Connect via extension <FiArrowRight className="w-4 h-4" /></>}
                        </Btn>
                      </div>
                    ) : (
                      <div className="border-2 border-studojo-ink bg-white rounded-2xl p-4 text-center space-y-2">
                        <p className="font-satoshi text-xs text-studojo-muted">Extension not detected yet.</p>
                        <button type="button"
                          onClick={() => { window.dispatchEvent(new CustomEvent("STUDOJO_REQUEST_LI_COOKIES")); setTimeout(() => window.location.reload(), 300); }}
                          className="font-satoshi text-xs font-semibold text-studojo-purple hover:underline">
                          I installed it — refresh to detect
                        </button>
                      </div>
                    )}

                    {/* Manual paste accordion */}
                    <details className="group">
                      <summary className="font-satoshi text-xs text-studojo-muted cursor-pointer hover:text-studojo-ink list-none flex items-center gap-1.5 select-none">
                        <FiArrowRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                        Paste cookies manually instead
                      </summary>
                      <div className="mt-3 space-y-3">
                        <div className="border-2 border-blue-300 bg-blue-50 rounded-xl p-3 font-satoshi text-xs text-blue-700 space-y-1">
                          <p>1. Open <strong>linkedin.com</strong> and log in</p>
                          <p>2. Press <strong>F12</strong> → Application → Cookies → linkedin.com</p>
                          <p>3. Copy <strong>li_at</strong> and <strong>JSESSIONID</strong> below</p>
                        </div>
                        <div className="border-2 border-studojo-ink bg-white rounded-2xl p-4 space-y-3">
                          <div>
                            <label className="font-satoshi text-xs font-semibold block mb-1">li_at cookie</label>
                            <textarea value={liAtCookie} onChange={e => setLiAtCookie(e.target.value)}
                              placeholder="AQEDATxxxxxx..." rows={2}
                              className="w-full border-2 border-studojo-ink rounded-xl px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none bg-neutral-50" />
                          </div>
                          <div>
                            <label className="font-satoshi text-xs font-semibold block mb-1">JSESSIONID cookie</label>
                            <input type="text" value={jsessionidCookie} onChange={e => setJsessionidCookie(e.target.value)}
                              placeholder="ajax:xxxxxxxxxx"
                              className="w-full border-2 border-studojo-ink rounded-xl px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50" />
                          </div>
                          {connectError && (
                            <div className="flex items-start gap-2 border-2 border-red-300 bg-red-50 rounded-xl p-3 text-sm text-red-700">
                              <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span className="font-satoshi">{connectError}</span>
                            </div>
                          )}
                          <Btn onClick={handleCookieLogin} disabled={!liAtCookie.trim() || !jsessionidCookie.trim() || cookieLoading} className="w-full justify-center">
                            {cookieLoading
                              ? <><FiRefreshCw className="w-4 h-4 animate-spin" /> Connecting…</>
                              : <>Connect & find leads <FiArrowRight className="w-4 h-4" /></>}
                          </Btn>
                        </div>
                      </div>
                    </details>

                    <div className="flex items-center justify-between pt-1">
                      <button type="button" onClick={back} className="flex items-center gap-1.5 font-satoshi text-sm text-studojo-muted hover:text-studojo-ink">
                        <FiArrowLeft className="w-4 h-4" /> Back
                      </button>
                    </div>
                  </div>
                ) : (
                  // Password tab
                  <div className="space-y-4">
                    <div className="border-2 border-studojo-ink rounded-2xl p-5 bg-white space-y-4">
                      <div>
                        <label className="font-satoshi text-sm font-semibold block mb-1.5">LinkedIn email</label>
                        <input type="email" value={liEmail} onChange={e => setLiEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 font-satoshi text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50" />
                      </div>
                      <div>
                        <label className="font-satoshi text-sm font-semibold block mb-1.5">LinkedIn password</label>
                        <div className="relative">
                          <input type={showPass ? "text" : "password"} value={liPass}
                            onChange={e => setLiPass(e.target.value)} placeholder="••••••••"
                            className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 pr-10 font-satoshi text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50"
                            onKeyDown={e => e.key === "Enter" && canNext() && handleConnect()} />
                          <button type="button" onClick={() => setShowPass(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-studojo-muted">
                            {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {connectError && (
                        <div className="flex items-start gap-2 border-2 border-red-300 bg-red-50 rounded-xl p-3 text-sm text-red-700">
                          <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="font-satoshi">{connectError}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {["Credentials encrypted with AES-256 before storage", "Only used to send connection requests you configure", "Disconnect at any time"].map(item => (
                        <div key={item} className="flex items-center gap-2.5 font-satoshi text-sm text-studojo-muted">
                          <FiShield className="w-4 h-4 text-green-600 flex-shrink-0" /><span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={back} className="flex items-center gap-1.5 font-satoshi text-sm text-studojo-muted hover:text-studojo-ink">
                        <FiArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <Btn onClick={handleConnect} disabled={!liEmail || !liPass || connectLoading}>
                        {connectLoading
                          ? <><FiRefreshCw className="w-4 h-4 animate-spin" /> Connecting…</>
                          : <>Connect & find leads <FiArrowRight className="w-4 h-4" /></>}
                      </Btn>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // PIN verification
              <div>
                <div className="border-2 border-studojo-ink bg-white rounded-2xl p-5 space-y-4 mb-5">
                  <div>
                    <label className="font-satoshi text-sm font-semibold block mb-1.5">Verification code</label>
                    <input type="text" inputMode="numeric"
                      value={pin}
                      onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="Enter the code LinkedIn emailed you"
                      className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 font-mono text-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50"
                      autoFocus
                      onKeyDown={e => e.key === "Enter" && pin.length >= 4 && handleVerifyPin()}
                    />
                  </div>
                  {connectError && (
                    <div className="flex items-start gap-2 border-2 border-red-300 bg-red-50 rounded-xl p-3 text-sm text-red-700">
                      <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="font-satoshi">{connectError}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => { setChallengeRequired(false); setPin(""); setConnectError(""); }}
                    className="flex items-center gap-1.5 font-satoshi text-sm text-studojo-muted hover:text-studojo-ink">
                    <FiArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <Btn onClick={handleVerifyPin} disabled={pin.length < 4 || pinLoading}>
                    {pinLoading ? <><FiRefreshCw className="w-4 h-4 animate-spin" /> Verifying…</> : <>Verify & continue <FiArrowRight className="w-4 h-4" /></>}
                  </Btn>
                </div>
                <div className="mt-4 pt-4 border-t-2 border-neutral-200 text-center">
                  <p className="font-satoshi text-xs text-studojo-muted mb-2">Code not arriving?</p>
                  <button type="button"
                    onClick={() => { setChallengeRequired(false); setLoginTab("extension"); setPin(""); setConnectError(""); }}
                    className="font-satoshi text-sm font-semibold text-studojo-purple hover:underline">
                    Try another way — use the extension instead
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 5 ────────────────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <div className="mb-6">
              {searchingLeads ? (
                <div className="border-2 border-studojo-ink bg-white rounded-2xl p-6 text-center">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiSearch className="w-5 h-5 text-studojo-purple animate-pulse" />
                  </div>
                  <p className="font-satoshi font-semibold text-sm">Finding {quiz.target_role}s…</p>
                  <p className="font-satoshi text-xs text-studojo-muted mt-1">Searching for your target profiles</p>
                </div>
              ) : leadsError === "search_failed" ? (
                <div className="border-2 border-amber-300 bg-amber-50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <FiAlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-satoshi text-sm font-semibold text-amber-800">No leads found</p>
                      <p className="font-satoshi text-xs text-amber-700 mt-0.5">
                        LinkedIn session may have expired or the criteria returned no results.
                      </p>
                    </div>
                  </div>
                  <Btn onClick={() => campaignId && startLeadSearch(campaignId)} className="w-full justify-center">
                    <FiRefreshCw className="w-3.5 h-3.5" /> Retry search
                  </Btn>
                  <button type="button" onClick={() => { setLeadsError(""); goTo(4); }}
                    className="w-full font-satoshi text-xs text-amber-700 hover:underline text-center">
                    Reconnect LinkedIn session instead
                  </button>
                </div>
              ) : leadsError ? (
                <div className="border-2 border-red-300 bg-red-50 rounded-xl p-4 space-y-3">
                  <p className="font-satoshi text-sm text-red-700">{leadsError}</p>
                  <Btn onClick={() => campaignId && startLeadSearch(campaignId)} className="w-full justify-center">
                    <FiRefreshCw className="w-3.5 h-3.5" /> Retry search
                  </Btn>
                </div>
              ) : (
                <div className="border-2 border-studojo-ink bg-white rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b-2 border-studojo-ink flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-studojo-purple" />
                    <span className="font-satoshi text-sm font-semibold">{leads.length} leads found</span>
                  </div>
                  <div className="divide-y-2 divide-neutral-100 max-h-48 overflow-y-auto">
                    {leads.slice(0, 10).map(lead => (
                      <div key={lead.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-satoshi text-sm font-medium truncate">{lead.name}</p>
                          {lead.headline && <p className="font-satoshi text-xs text-studojo-muted truncate">{lead.headline}</p>}
                        </div>
                        <a href={lead.profile_url} target="_blank" rel="noopener noreferrer" className="text-studojo-muted hover:text-studojo-ink flex-shrink-0">
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                    {leads.length > 10 && (
                      <div className="px-4 py-2 font-satoshi text-xs text-center text-studojo-muted">
                        + {leads.length - 10} more leads
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <h2 className="font-clash text-xl font-bold text-studojo-ink mb-4">Set up your messages</h2>

            <div className="space-y-4 mb-6">
              <div className="border-2 border-studojo-ink bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiMessageSquare className="w-4 h-4 text-studojo-purple" />
                    <span className="font-satoshi text-sm font-semibold">Connection note</span>
                  </div>
                  <span className={`font-satoshi text-xs ${connectionNote.length > 300 ? "text-red-500" : "text-studojo-muted"}`}>
                    {connectionNote.length}/300
                  </span>
                </div>
                <textarea value={connectionNote} onChange={e => setConnectionNote(e.target.value)}
                  placeholder={NOTE_PLACEHOLDER} rows={2}
                  className="w-full font-satoshi text-sm border-2 border-studojo-ink rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50" />
                <p className="font-satoshi text-xs text-studojo-muted mt-1.5">
                  Use <code className="bg-neutral-100 px-1 rounded border border-neutral-200">{"{{name}}"}</code> and{" "}
                  <code className="bg-neutral-100 px-1 rounded border border-neutral-200">{"{{company}}"}</code> — AI personalises per lead
                </p>
              </div>

              <div className="border-2 border-studojo-ink bg-white rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiSend className="w-4 h-4 text-amber-500" />
                  <span className="font-satoshi text-sm font-semibold">Follow-up</span>
                  <span className="font-satoshi text-xs text-studojo-muted">sent after they accept</span>
                </div>
                <textarea value={followupMessage} onChange={e => setFollowupMessage(e.target.value)}
                  placeholder={FOLLOWUP_PLACEHOLDER} rows={3}
                  className="w-full font-satoshi text-sm border-2 border-studojo-ink rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50" />
              </div>

              <div className="border-2 border-studojo-ink bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-satoshi text-sm font-semibold">Daily limit</span>
                  <span className="font-satoshi text-sm font-bold text-studojo-purple">{dailyLimit}/day</span>
                </div>
                <input type="range" min={5} max={40} value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} className="w-full" />
                <p className="font-satoshi text-xs text-studojo-muted mt-1">Recommended: 15–25/day</p>
              </div>
            </div>

            {launchError && (
              <div className="flex items-start gap-2 border-2 border-red-300 bg-red-50 rounded-xl p-3 text-sm text-red-700 mb-4">
                <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="font-satoshi">{launchError}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button type="button" onClick={back} className="flex items-center gap-1.5 font-satoshi text-sm text-studojo-muted hover:text-studojo-ink">
                <FiArrowLeft className="w-4 h-4" /> Back
              </button>
              <Btn onClick={handleLaunch} disabled={searchingLeads || connectionNote.length > 300 || launching}>
                {launching ? <><FiRefreshCw className="w-4 h-4 animate-spin" /> Launching…</> : <>Launch campaign <FiArrowRight className="w-4 h-4" /></>}
              </Btn>
            </div>
          </div>
        )}

        {/* ── Step 6 ────────────────────────────────────────────────────── */}
        {step === 6 && campaign && stats && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-clash text-xl font-bold text-studojo-ink">{campaign.name}</h2>
                <p className="font-satoshi text-sm text-studojo-muted">{campaign.target_role} · {campaign.daily_limit}/day</p>
              </div>
              <div className="flex items-center gap-2">
                {campaign.status === "running" && (
                  <>
                    {requests.some(r => r.status === "error") && !requests.some(r => r.status === "pending") && (
                      <Btn onClick={retryErrors} variant="outline" className="text-xs px-3 py-2">
                        <FiRefreshCw className="w-3 h-3" /> Retry errors
                      </Btn>
                    )}
                    <Btn onClick={sendOne} disabled={sendingOne} variant="outline" className="text-xs px-3 py-2">
                      {sendingOne ? <><FiRefreshCw className="w-3 h-3 animate-spin" /> Sending…</> : <><FiSend className="w-3 h-3" /> Send one</>}
                    </Btn>
                  </>
                )}
                <Btn
                  onClick={toggleCampaign}
                  disabled={toggling || campaign.status === "auth_failed"}
                  variant={campaign.status === "running" ? "outline" : "primary"}
                >
                  {campaign.status === "running"
                    ? <><FiPause className="w-3.5 h-3.5" /> Pause</>
                    : <><FiPlay className="w-3.5 h-3.5" /> Resume</>
                  }
                </Btn>
              </div>
            </div>
            {sendOneResult && (
              <div className={`mb-4 px-4 py-2.5 rounded-xl border-2 font-satoshi text-sm ${sendOneResult.startsWith("Sent") ? "border-green-300 bg-green-50 text-green-700" : "border-red-300 bg-red-50 text-red-700"}`}>
                {sendOneResult}
              </div>
            )}

            {campaign.status === "auth_failed" && (
              <div className="border-2 border-amber-300 bg-amber-50 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <FiAlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-satoshi text-sm font-semibold text-amber-800">LinkedIn session expired</p>
                  <p className="font-satoshi text-xs text-amber-700 mt-0.5">Campaign paused — reconnect to resume sending.</p>
                </div>
                <button type="button" onClick={() => goTo(4)}
                  className="font-satoshi text-xs font-semibold text-amber-800 underline hover:no-underline flex-shrink-0">
                  Reconnect
                </button>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 mb-6">
              <MetricTile label="Sent" value={stats.total_sent} />
              <MetricTile label="Accepted" value={stats.total_accepted} sub={`${stats.acceptance_rate}%`} />
              <MetricTile label="Follow-ups" value={stats.total_followups_sent} />
              <MetricTile label="Replies" value={stats.total_replied} sub={`${stats.reply_rate}%`} />
            </div>

            <div className="border-2 border-studojo-ink bg-white rounded-2xl overflow-hidden">
              <div className="flex border-b-2 border-studojo-ink">
                {(["all", "sent", "accepted", "replied"] as const).map(tab => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 font-satoshi text-xs font-semibold transition-colors ${
                      activeTab === tab
                        ? "text-studojo-purple border-b-2 border-studojo-purple -mb-0.5"
                        : "text-studojo-muted hover:text-studojo-ink"
                    }`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-10 font-satoshi text-sm text-studojo-muted">
                  {activeTab === "all" ? "Requests will appear here as the campaign runs." : `No ${activeTab} yet.`}
                </div>
              ) : (
                <div className="divide-y-2 divide-neutral-100 max-h-96 overflow-y-auto">
                  {filteredRequests.map(req => {
                    const style = STATUS_STYLE[req.status] || STATUS_STYLE.pending;
                    const lbl = STATUS_LABEL[req.status] || "Pending";
                    return (
                      <div key={req.id} className="px-4 py-3 flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="font-satoshi text-sm font-medium truncate">{req.name}</p>
                            <a href={req.profile_url} target="_blank" rel="noopener noreferrer" className="text-studojo-muted">
                              <FiExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          {req.headline && <p className="font-satoshi text-xs text-studojo-muted truncate">{req.headline}</p>}
                          {req.reply_text && <p className="font-satoshi text-xs italic mt-1 line-clamp-1 text-studojo-ink/70">"{req.reply_text}"</p>}
                        </div>
                        <span className={`font-satoshi text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${style}`}>
                          {lbl}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-center font-satoshi text-xs text-studojo-muted mt-4">
              Refreshes every 30s · {campaign.total_leads} total leads loaded
            </p>
            <div className="mt-4 text-center">
              <button type="button"
                onClick={() => {
                  clearWizard();
                  setStep(1); setCampaignId(null); setCampaign(null); setStats(null);
                  setRequests([]); setLeads([]);
                  setQuiz({ target_role: "", target_industries: [], target_locations: [], target_company_sizes: [], target_keywords: "", campaign_name: "" });
                }}
                className="font-satoshi text-xs text-studojo-muted hover:text-studojo-ink hover:underline">
                Start a new campaign
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
