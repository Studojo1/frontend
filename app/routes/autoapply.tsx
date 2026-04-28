import { useState, useRef, useEffect, useCallback } from "react";
import { redirect } from "react-router";
import { Header, Footer } from "~/components";
import {
  FiUpload, FiArrowRight, FiCheckCircle, FiZap, FiMapPin,
  FiBriefcase, FiGlobe, FiTarget, FiPause, FiPlay,
  FiRefreshCw, FiClock, FiTrendingUp, FiAlertTriangle,
  FiLink, FiShield, FiX, FiPlus, FiMessageSquare,
  FiUserPlus, FiMail, FiBarChart2, FiSettings,
} from "react-icons/fi";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/autoapply";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/autoapply");
  return { user: { name: session.user.name, email: session.user.email } };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AutoApply | Studojo" },
    { name: "description", content: "Your personal job application agent. Applies 24/7 while you sleep." },
  ];
}

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", flag: "🌐" },
  { id: "naukri", label: "Naukri", flag: "🇮🇳" },
  { id: "indeed", label: "Indeed", flag: "🌎" },
  { id: "internshala", label: "Internshala", flag: "🎓" },
  { id: "wellfound", label: "Wellfound", flag: "🚀" },
  { id: "handshake", label: "Handshake", flag: "🤝" },
];

const ROLE_TYPES = [
  "Marketing", "Software Engineering", "Product Management",
  "Data & Analytics", "Finance", "Operations", "Design",
  "Sales", "HR & People", "Research",
];

const LOCATIONS = [
  "India", "United States", "United Kingdom",
  "UAE / Dubai", "Singapore", "Remote (Anywhere)",
];

const TIMEZONES = [
  { label: "India (IST)", value: "Asia/Kolkata", locale: "en-IN" },
  { label: "US Eastern", value: "America/New_York", locale: "en-US" },
  { label: "US Pacific", value: "America/Los_Angeles", locale: "en-US" },
  { label: "UK / London", value: "Europe/London", locale: "en-GB" },
  { label: "UAE / Dubai", value: "Asia/Dubai", locale: "en-AE" },
  { label: "Singapore", value: "Asia/Singapore", locale: "en-SG" },
];

const HEALTH_CHECKS = [
  { id: "age", label: "Account age ≥ 3 months", detail: "New accounts face higher restriction risk" },
  { id: "connections", label: "100+ first-degree connections", detail: "Thin networks get flagged faster" },
  { id: "photo", label: "Profile photo set", detail: "Profiles without photos get 40% less responses" },
  { id: "experience", label: "Current job/experience listed", detail: "Required for recruiter credibility" },
  { id: "skills", label: "At least 3 skills listed", detail: "LinkedIn uses this for search ranking" },
];

type Step = "resume" | "prefs" | "linkedin" | "launch";
type Tab = "applications" | "outreach" | "campaigns";

const toggle = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

export default function AutoApply({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  const [view, setView] = useState<"setup" | "dashboard">("setup");
  const [activeTab, setActiveTab] = useState<Tab>("applications");
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Config state
  const [config, setConfig] = useState<any>(null);
  const [linkedInSession, setLinkedInSession] = useState<any>(null);

  // Live feed state (from SSE)
  const [stats, setStats] = useState({ applied: 0, queued: 0, failed: 0, skipped: 0, connected: 0, messaged: 0, replied: 0 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [outreach, setOutreach] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<string[]>([]);

  // Setup wizard state
  const [step, setStep] = useState<Step>("resume");
  const [cvText, setCvText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [workType, setWorkType] = useState<"remote" | "hybrid" | "onsite" | "any">("any");
  const [dailyLimit, setDailyLimit] = useState(20);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [companyInput, setCompanyInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [preferredCompanies, setPreferredCompanies] = useState<string[]>([]);
  const [excludedCompanies, setExcludedCompanies] = useState<string[]>([]);

  const [liAt, setLiAt] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Kolkata");
  const [healthChecks, setHealthChecks] = useState<Record<string, boolean>>({});
  const [savingSession, setSavingSession] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  // Campaign form
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignTitles, setNewCampaignTitles] = useState("");
  const [newCampaignCompanies, setNewCampaignCompanies] = useState("");

  const sseRef = useRef<EventSource | null>(null);

  const startSSE = useCallback(() => {
    if (sseRef.current) sseRef.current.close();
    const es = new EventSource("/api/autoapply/stream");
    sseRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "snapshot" || data.type === "update") {
        if (data.stats) setStats(data.stats);
        if (data.jobs) setJobs(data.jobs);
        if (data.outreach) setOutreach(data.outreach);
      }
      if (data.type === "reconnect") {
        setTimeout(startSSE, 2000);
      }
      if (data.type === "update" && data.jobs?.length) {
        const latest = data.jobs[0];
        if (latest?.status === "applied") {
          setLiveEvents((prev) => [`Applied to ${latest.roleTitle} at ${latest.company}`, ...prev.slice(0, 9)]);
        }
      }
    };
    es.onerror = () => setTimeout(startSSE, 10_000);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/autoapply/config").then((r) => r.json()),
      fetch("/api/autoapply/session").then((r) => r.json()),
      fetch("/api/autoapply/campaigns").then((r) => r.json()),
    ])
      .then(([configData, sessionData, campaignsData]) => {
        if (configData.config) {
          setConfig(configData.config);
          setView("dashboard");
          startSSE();
        }
        setLinkedInSession(sessionData);
        if (sessionData?.connected) setSessionSaved(true);
        if (campaignsData.campaigns) setCampaigns(campaignsData.campaigns);
      })
      .catch(() => {})
      .finally(() => setLoadingConfig(false));

    return () => sseRef.current?.close();
  }, [startSSE]);

  const healthScore = HEALTH_CHECKS.filter((c) => healthChecks[c.id]).length;
  const healthPct = Math.round((healthScore / HEALTH_CHECKS.length) * 100);

  const STEPS: Array<{ id: Step; label: string }> = [
    { id: "resume", label: "Resume" },
    { id: "prefs", label: "Preferences" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "launch", label: "Launch" },
  ];
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  const handleFile = async (file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setParsing(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/resumes/parse", { method: "POST", body: fd });
        if (!res.ok) throw new Error();
        const { resumeData } = await res.json();
        const lines: string[] = [];
        if (resumeData.contact_info?.name) lines.push(resumeData.contact_info.name);
        if (resumeData.summary) lines.push("", "SUMMARY", resumeData.summary);
        if (resumeData.work_experiences?.length) {
          lines.push("", "EXPERIENCE");
          for (const e of resumeData.work_experiences) lines.push(`${e.role} at ${e.company}`);
        }
        if (resumeData.skills?.length) {
          lines.push("", "SKILLS");
          lines.push(resumeData.skills.map((s: any) => s.name).join(", "));
        }
        setCvText(lines.join("\n").trim());
      } catch {
        setCvText("Failed to parse PDF. Please paste your CV text below.");
      } finally {
        setParsing(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setCvText((e.target?.result as string) || "");
      reader.readAsText(file);
    }
  };

  const saveLinkedInSession = async () => {
    if (!liAt.trim()) return;
    setSavingSession(true);
    try {
      const tz = TIMEZONES.find((t) => t.value === selectedTimezone);
      const res = await fetch("/api/autoapply/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liAt: liAt.trim(), userAgent: navigator.userAgent, locale: tz?.locale ?? "en-US", timezone: selectedTimezone }),
      });
      if (!res.ok) throw new Error();
      setSessionSaved(true);
      setLiAt("");
    } catch {
      alert("Failed to save LinkedIn session.");
    } finally {
      setSavingSession(false);
    }
  };

  const handleLaunch = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/autoapply/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, roles: selectedRoles, locations: selectedLocations, platforms: selectedPlatforms, workType, dailyLimit, companyPrefs: { preferred: preferredCompanies }, excludedCompanies }),
      });
      if (!res.ok) throw new Error();
      const { config: saved } = await res.json();
      setConfig(saved);
      setView("dashboard");
      startSSE();
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const togglePause = async () => {
    if (!config) return;
    const newStatus = config.status === "active" ? "paused" : "active";
    const res = await fetch("/api/autoapply/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...config, status: newStatus }),
    });
    if (res.ok) setConfig({ ...config, status: newStatus });
  };

  const createCampaign = async () => {
    if (!newCampaignName.trim()) return;
    const res = await fetch("/api/autoapply/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCampaignName,
        targetTitles: newCampaignTitles.split(",").map((s) => s.trim()).filter(Boolean),
        targetCompanies: newCampaignCompanies.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      const { campaign } = await res.json();
      setCampaigns([...campaigns, campaign]);
      setNewCampaignName(""); setNewCampaignTitles(""); setNewCampaignCompanies("");
      setShowCampaignForm(false);
    }
  };

  const toggleCampaign = async (id: string, status: string) => {
    const newStatus = status === "active" ? "paused" : "active";
    const res = await fetch("/api/autoapply/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) setCampaigns(campaigns.map((c) => c.id === id ? { ...c, status: newStatus } : c));
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-white"><Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 md:py-16">

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-violet-100 px-4 py-1.5 font-['Satoshi'] text-sm font-semibold text-violet-700">
            <FiZap className="h-3.5 w-3.5" /> Beta | Free Access
          </span>
          <h1 className="mt-4 font-['Clash_Display'] text-4xl font-bold text-neutral-900 md:text-5xl">AutoApply</h1>
          <p className="mt-3 font-['Satoshi'] text-lg text-gray-600">Your personal job agent | applies 24/7 while you sleep.</p>
        </div>

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && config && (
          <div className="space-y-5">

            {linkedInSession?.cookieExpiresSoon && (
              <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4">
                <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-['Satoshi'] text-sm font-semibold text-amber-800">LinkedIn session expiring soon</p>
                  <p className="font-['Satoshi'] text-sm text-amber-700">Cookie is {linkedInSession.cookieAgedays} days old.
                    <button onClick={() => { setView("setup"); setStep("linkedin"); }} className="ml-1 font-semibold underline">Refresh now</button>
                  </p>
                </div>
              </div>
            )}

            {/* Status banner */}
            <div className={`flex items-center justify-between rounded-2xl border-2 border-neutral-900 p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] ${config.status === "active" ? "bg-emerald-400" : "bg-neutral-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-900 ${config.status === "active" ? "bg-white" : "bg-neutral-400"}`}>
                  <FiZap className={`h-5 w-5 ${config.status === "active" ? "text-emerald-600" : "text-neutral-600"}`} />
                </div>
                <div>
                  <p className="font-['Clash_Display'] text-lg font-bold text-neutral-900">
                    {config.status === "active" ? "AutoApply is running" : "AutoApply is paused"}
                  </p>
                  <p className="font-['Satoshi'] text-sm text-neutral-700">
                    {config.status === "active"
                      ? `Up to ${config.dailyLimit}/day · Warm-up day ${linkedInSession?.warmupDay ?? 0} · ${linkedInSession?.proxyCity ?? ""}, ${linkedInSession?.proxyCountry ?? ""}`
                      : "Resume to start sending applications"}
                  </p>
                </div>
              </div>
              <button onClick={togglePause} className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-4 py-2 font-['Satoshi'] text-sm font-semibold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                {config.status === "active" ? <><FiPause className="h-4 w-4" /> Pause</> : <><FiPlay className="h-4 w-4" /> Resume</>}
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {[
                { label: "Applied", value: stats.applied, color: "bg-violet-100 text-violet-700" },
                { label: "Queued", value: stats.queued, color: "bg-blue-100 text-blue-700" },
                { label: "Skipped", value: stats.skipped, color: "bg-amber-100 text-amber-700" },
                { label: "Failed", value: stats.failed, color: "bg-red-100 text-red-700" },
                { label: "Connected", value: stats.connected, color: "bg-emerald-100 text-emerald-700" },
                { label: "Messaged", value: stats.messaged, color: "bg-cyan-100 text-cyan-700" },
                { label: "Replied", value: stats.replied, color: "bg-pink-100 text-pink-700" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl border-2 border-neutral-900 p-3 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] ${s.color}`}>
                  <p className="font-['Clash_Display'] text-2xl font-bold">{s.value}</p>
                  <p className="font-['Satoshi'] text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Live event ticker */}
            {liveEvents.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-2.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <p className="font-['Satoshi'] text-sm text-emerald-800">{liveEvents[0]}</p>
              </div>
            )}

            {/* Tab nav */}
            <div className="flex gap-1 rounded-xl border-2 border-neutral-900 bg-neutral-100 p-1">
              {([
                { id: "applications", label: "Applications", icon: <FiBriefcase className="h-4 w-4" /> },
                { id: "outreach", label: "Outreach", icon: <FiUserPlus className="h-4 w-4" /> },
                { id: "campaigns", label: "Campaigns", icon: <FiBarChart2 className="h-4 w-4" /> },
              ] as const).map(({ id, label, icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-['Satoshi'] text-sm font-semibold transition-colors ${activeTab === id ? "bg-white text-neutral-900 shadow" : "text-neutral-500 hover:text-neutral-700"}`}>
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Applications tab */}
            {activeTab === "applications" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-['Clash_Display'] text-xl font-bold">Application Queue</h2>
                  <button onClick={startSSE} className="inline-flex items-center gap-1 font-['Satoshi'] text-sm text-gray-500 hover:text-neutral-900">
                    <FiRefreshCw className="h-3.5 w-3.5" /> Refresh
                  </button>
                </div>
                {jobs.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-neutral-200 py-12 text-center">
                    <FiClock className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                    <p className="font-['Clash_Display'] text-lg font-bold text-neutral-400">No applications yet</p>
                    <p className="mt-1 font-['Satoshi'] text-sm text-gray-400">
                      {config.status === "active" ? "First discovery run kicks off within 6 hours." : "Resume AutoApply to start."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jobs.slice(0, 20).map((job: any) => (
                      <div key={job.id} className="flex items-center justify-between rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 py-3">
                        <div>
                          <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900">
                            {job.roleTitle} <span className="font-normal text-gray-500">at</span> {job.company}
                          </p>
                          <p className="font-['Satoshi'] text-xs text-gray-400">
                            {job.location} · {PLATFORMS.find((p) => p.id === job.platform)?.label ?? job.platform}
                            {job.matchScore != null ? ` · ${job.matchScore}% match` : ""}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 font-['Satoshi'] text-xs font-semibold capitalize ${
                          job.status === "applied" ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : job.status === "pending" || job.status === "processing" ? "border-blue-300 bg-blue-50 text-blue-700"
                          : job.status === "failed" ? "border-red-300 bg-red-50 text-red-700"
                          : "border-neutral-300 bg-white text-neutral-500"
                        }`}>{job.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Outreach tab */}
            {activeTab === "outreach" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <h2 className="mb-4 font-['Clash_Display'] text-xl font-bold">Outreach Contacts</h2>
                {outreach.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-neutral-200 py-12 text-center">
                    <FiUserPlus className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                    <p className="font-['Clash_Display'] text-lg font-bold text-neutral-400">No outreach yet</p>
                    <p className="mt-1 font-['Satoshi'] text-sm text-gray-400">Create a campaign to start sending connection requests to hiring managers.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {outreach.map((contact: any) => (
                      <div key={contact.id} className="flex items-center justify-between rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 py-3">
                        <div>
                          <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900">
                            {contact.name ?? "Unknown"} <span className="font-normal text-gray-500">at</span> {contact.company ?? "—"}
                          </p>
                          <p className="font-['Satoshi'] text-xs text-gray-400">{contact.title ?? "—"}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 font-['Satoshi'] text-xs font-semibold capitalize ${
                          contact.status === "accepted" ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : contact.status === "replied" ? "border-violet-300 bg-violet-50 text-violet-700"
                          : contact.status === "messaged" ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                          : "border-neutral-300 bg-white text-neutral-500"
                        }`}>{contact.status} · step {contact.sequenceStep}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Campaigns tab */}
            {activeTab === "campaigns" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-['Clash_Display'] text-xl font-bold">Outreach Campaigns</h2>
                  <button onClick={() => setShowCampaignForm(!showCampaignForm)}
                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-neutral-900 bg-violet-600 px-3 py-1.5 font-['Satoshi'] text-sm font-semibold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                    <FiPlus className="h-4 w-4" /> New
                  </button>
                </div>

                {showCampaignForm && (
                  <div className="mb-4 rounded-xl border-2 border-violet-200 bg-violet-50 p-4 space-y-3">
                    <input value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="Campaign name (e.g. 'Engineering Managers at Fintech')"
                      className="w-full rounded-lg border-2 border-neutral-900 px-3 py-2 font-['Satoshi'] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <input value={newCampaignTitles} onChange={(e) => setNewCampaignTitles(e.target.value)}
                      placeholder="Target titles (comma-separated: Engineering Manager, CTO, VP Engineering)"
                      className="w-full rounded-lg border-2 border-neutral-900 px-3 py-2 font-['Satoshi'] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <input value={newCampaignCompanies} onChange={(e) => setNewCampaignCompanies(e.target.value)}
                      placeholder="Target companies (comma-separated, optional)"
                      className="w-full rounded-lg border-2 border-neutral-900 px-3 py-2 font-['Satoshi'] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <div className="flex gap-2">
                      <button onClick={createCampaign} disabled={!newCampaignName.trim()}
                        className="rounded-lg border-2 border-neutral-900 bg-violet-600 px-4 py-2 font-['Satoshi'] text-sm font-semibold text-white disabled:opacity-40">
                        Create Campaign
                      </button>
                      <button onClick={() => setShowCampaignForm(false)} className="rounded-lg border-2 border-neutral-900 bg-white px-4 py-2 font-['Satoshi'] text-sm font-semibold text-neutral-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {campaigns.length === 0 && !showCampaignForm ? (
                  <div className="rounded-xl border-2 border-dashed border-neutral-200 py-12 text-center">
                    <FiBarChart2 className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                    <p className="font-['Clash_Display'] text-lg font-bold text-neutral-400">No campaigns yet</p>
                    <p className="mt-1 font-['Satoshi'] text-sm text-gray-400">Campaigns automate LinkedIn connection requests to hiring managers at target companies.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 py-3">
                        <div>
                          <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900">{c.name}</p>
                          <p className="font-['Satoshi'] text-xs text-gray-400">
                            {(c.targetTitles as string[]).slice(0, 3).join(", ")}
                            {(c.targetCompanies as string[]).length > 0 ? ` · ${(c.targetCompanies as string[]).slice(0, 2).join(", ")}` : ""}
                          </p>
                        </div>
                        <button onClick={() => toggleCampaign(c.id, c.status)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 px-3 py-1 font-['Satoshi'] text-xs font-semibold ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                          {c.status === "active" ? <><FiPause className="h-3 w-3" /> Pause</> : <><FiPlay className="h-3 w-3" /> Resume</>}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ── SETUP WIZARD ── */}
        {view === "setup" && (
          <>
            <div className="mb-8 flex items-center justify-center gap-2 overflow-x-auto">
              {STEPS.map(({ id, label }, i) => {
                const done = stepIdx > i;
                const active = stepIdx === i;
                return (
                  <div key={id} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-900 font-['Satoshi'] text-sm font-bold transition-colors ${done ? "bg-emerald-400" : active ? "bg-violet-600 text-white" : "bg-white text-neutral-400"}`}>
                        {done ? <FiCheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`hidden font-['Satoshi'] text-sm font-medium sm:block ${active ? "text-neutral-900" : "text-neutral-400"}`}>{label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className="h-px w-6 bg-neutral-300" />}
                  </div>
                );
              })}
            </div>

            {/* Step 1 | Resume */}
            {step === "resume" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                <h2 className="mb-1 font-['Clash_Display'] text-2xl font-bold">Your Resume</h2>
                <p className="mb-6 font-['Satoshi'] text-sm text-gray-500">Upload a PDF or paste your CV text.</p>
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onClick={() => !parsing && fileRef.current?.click()}
                  className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-5 transition-colors ${parsing ? "cursor-wait border-violet-400 bg-violet-50" : dragOver ? "border-violet-600 bg-violet-50" : "border-neutral-300 bg-neutral-50 hover:border-violet-400"}`}>
                  {parsing ? <><div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" /><p className="font-['Satoshi'] text-sm text-violet-700">Parsing PDF...</p></> : <><FiUpload className="mb-2 h-6 w-6 text-neutral-400" /><p className="font-['Satoshi'] text-sm text-gray-500">Drop here or <span className="font-semibold text-violet-600">click to upload</span></p><p className="mt-1 font-['Satoshi'] text-xs text-gray-400">.pdf, .txt, .md</p></>}
                  <input ref={fileRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                </div>
                <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder="Or paste CV text here..." rows={10} className="w-full resize-none rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <div className="mt-2 flex justify-end">
                  <button disabled={cvText.trim().length < 100} onClick={() => setStep("prefs")}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-600 px-6 py-2.5 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
                    Next <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 | Preferences */}
            {step === "prefs" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8 space-y-6">
                <div>
                  <h2 className="mb-1 font-['Clash_Display'] text-2xl font-bold">Job Preferences</h2>
                  <p className="font-['Satoshi'] text-sm text-gray-500">Be specific | it improves match quality.</p>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold"><FiBriefcase className="h-4 w-4 text-violet-600" /> Role Types</label>
                  <div className="flex flex-wrap gap-2">{ROLE_TYPES.map((r) => <button key={r} onClick={() => setSelectedRoles(toggle(selectedRoles, r))} className={`rounded-lg border-2 border-neutral-900 px-3 py-1.5 font-['Satoshi'] text-sm font-medium transition-colors ${selectedRoles.includes(r) ? "bg-violet-600 text-white" : "bg-white text-neutral-700 hover:bg-violet-50"}`}>{r}</button>)}</div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold"><FiMapPin className="h-4 w-4 text-violet-600" /> Target Markets</label>
                  <div className="flex flex-wrap gap-2">{LOCATIONS.map((l) => <button key={l} onClick={() => setSelectedLocations(toggle(selectedLocations, l))} className={`rounded-lg border-2 border-neutral-900 px-3 py-1.5 font-['Satoshi'] text-sm font-medium transition-colors ${selectedLocations.includes(l) ? "bg-emerald-500 text-white" : "bg-white text-neutral-700 hover:bg-emerald-50"}`}>{l}</button>)}</div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold"><FiGlobe className="h-4 w-4 text-violet-600" /> Work Arrangement</label>
                  <div className="flex gap-2">{(["remote","hybrid","onsite","any"] as const).map((w) => <button key={w} onClick={() => setWorkType(w)} className={`rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] text-sm font-medium capitalize transition-colors ${workType === w ? "bg-neutral-900 text-white" : "bg-white hover:bg-neutral-100"}`}>{w === "any" ? "Any" : w}</button>)}</div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold"><FiTarget className="h-4 w-4 text-violet-600" /> Apply On</label>
                  <div className="flex flex-wrap gap-2">{PLATFORMS.map((p) => <button key={p.id} onClick={() => setSelectedPlatforms(toggle(selectedPlatforms, p.id))} className={`rounded-lg border-2 border-neutral-900 px-3 py-1.5 font-['Satoshi'] text-sm font-medium transition-colors ${selectedPlatforms.includes(p.id) ? "bg-orange-400 text-white" : "bg-white hover:bg-orange-50"}`}>{p.flag} {p.label}</button>)}</div>
                </div>
                <div>
                  <label className="mb-2 block font-['Satoshi'] text-sm font-semibold">Daily Limit | <span className="font-normal text-violet-600">{dailyLimit}/day</span></label>
                  <input type="range" min={5} max={50} step={5} value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} className="w-full accent-violet-600" />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold"><FiTarget className="h-4 w-4 text-emerald-600" /> Target Companies <span className="font-normal text-gray-400">(optional)</span></label>
                  <div className="flex gap-2"><input value={companyInput} onChange={(e) => setCompanyInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && companyInput.trim()) { setPreferredCompanies([...preferredCompanies, companyInput.trim()]); setCompanyInput(""); }}} placeholder="Type + Enter" className="flex-1 rounded-lg border-2 border-neutral-900 px-3 py-2 font-['Satoshi'] text-sm focus:outline-none" /><button onClick={() => { if (companyInput.trim()) { setPreferredCompanies([...preferredCompanies, companyInput.trim()]); setCompanyInput(""); }}} className="rounded-lg border-2 border-neutral-900 bg-emerald-500 p-2 text-white"><FiPlus className="h-4 w-4" /></button></div>
                  {preferredCompanies.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{preferredCompanies.map((c) => <span key={c} className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-['Satoshi'] text-xs text-emerald-700">{c}<button onClick={() => setPreferredCompanies(preferredCompanies.filter((x) => x !== c))}><FiX className="h-3 w-3" /></button></span>)}</div>}
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold"><FiX className="h-4 w-4 text-red-500" /> Exclude Companies <span className="font-normal text-gray-400">(optional)</span></label>
                  <div className="flex gap-2"><input value={excludeInput} onChange={(e) => setExcludeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && excludeInput.trim()) { setExcludedCompanies([...excludedCompanies, excludeInput.trim()]); setExcludeInput(""); }}} placeholder="Companies to skip" className="flex-1 rounded-lg border-2 border-neutral-900 px-3 py-2 font-['Satoshi'] text-sm focus:outline-none" /><button onClick={() => { if (excludeInput.trim()) { setExcludedCompanies([...excludedCompanies, excludeInput.trim()]); setExcludeInput(""); }}} className="rounded-lg border-2 border-neutral-900 bg-red-400 p-2 text-white"><FiPlus className="h-4 w-4" /></button></div>
                  {excludedCompanies.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{excludedCompanies.map((c) => <span key={c} className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-3 py-1 font-['Satoshi'] text-xs text-red-700">{c}<button onClick={() => setExcludedCompanies(excludedCompanies.filter((x) => x !== c))}><FiX className="h-3 w-3" /></button></span>)}</div>}
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("resume")} className="font-['Satoshi'] text-sm text-gray-500 underline">Back</button>
                  <button disabled={selectedRoles.length === 0 || selectedLocations.length === 0 || selectedPlatforms.length === 0} onClick={() => setStep("linkedin")}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-600 px-6 py-2.5 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
                    Next <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 | LinkedIn */}
            {step === "linkedin" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8 space-y-5">
                <div>
                  <h2 className="mb-1 font-['Clash_Display'] text-2xl font-bold">Connect LinkedIn</h2>
                  <p className="font-['Satoshi'] text-sm text-gray-500">Your session cookie lets us apply from our regional servers | no password, full fingerprint match.</p>
                </div>
                {sessionSaved ? (
                  <div className="flex items-start gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4">
                    <FiCheckCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-['Satoshi'] text-sm font-semibold text-emerald-800">LinkedIn connected</p>
                      <p className="font-['Satoshi'] text-sm text-emerald-700">Session encrypted and saved.</p>
                      <button onClick={() => setSessionSaved(false)} className="mt-1 font-['Satoshi'] text-xs underline text-emerald-700">Update cookie</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-3">
                      <FiZap className="mt-0.5 h-4 w-4 text-blue-600" />
                      <p className="font-['Satoshi'] text-sm text-blue-700"><span className="font-semibold">Have the extension?</span> Your cookie was captured automatically on connect.</p>
                    </div>
                    <ol className="space-y-2">{["Open LinkedIn in Chrome while logged in","Press F12 → Application → Cookies → linkedin.com","Copy the li_at cookie value","Paste it below"].map((item, i) => (<li key={i} className="flex items-start gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-600 font-['Satoshi'] text-xs font-bold text-white">{i + 1}</span><span className="font-['Satoshi'] text-sm text-neutral-700">{item}</span></li>))}</ol>
                    <input type="password" value={liAt} onChange={(e) => setLiAt(e.target.value)} placeholder="AQEDATKr... (paste li_at)" className="w-full rounded-xl border-2 border-neutral-900 px-4 py-3 font-mono text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <select value={selectedTimezone} onChange={(e) => setSelectedTimezone(e.target.value)} className="w-full rounded-xl border-2 border-neutral-900 px-4 py-3 font-['Satoshi'] text-sm focus:outline-none">
                      {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                    </select>
                    <button disabled={!liAt.trim() || savingSession} onClick={saveLinkedInSession}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 bg-blue-600 px-6 py-3 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
                      {savingSession ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> : <><FiShield className="h-4 w-4" /> Encrypt & Save</>}
                    </button>
                  </>
                )}
                <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-['Satoshi'] text-sm font-semibold">LinkedIn profile health</p>
                    <span className={`rounded-full px-2.5 py-1 font-['Satoshi'] text-xs font-bold ${healthPct >= 80 ? "bg-emerald-100 text-emerald-700" : healthPct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{healthPct}%</span>
                  </div>
                  <div className="space-y-2">{HEALTH_CHECKS.map((c) => (<label key={c.id} className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={!!healthChecks[c.id]} onChange={(e) => setHealthChecks({ ...healthChecks, [c.id]: e.target.checked })} className="mt-0.5 h-4 w-4 accent-violet-600" /><div><p className="font-['Satoshi'] text-sm font-medium">{c.label}</p><p className="font-['Satoshi'] text-xs text-gray-400">{c.detail}</p></div></label>))}</div>
                  {healthPct < 60 && <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3"><FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><p className="font-['Satoshi'] text-xs text-amber-700">Low score | recommend starting at 5 apps/day and warming up over 2 weeks.</p></div>}
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("prefs")} className="font-['Satoshi'] text-sm text-gray-500 underline">Back</button>
                  <button onClick={() => setStep("launch")} className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-600 px-6 py-2.5 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]">
                    {sessionSaved ? "Continue" : "Skip for now"} <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 | Launch */}
            {step === "launch" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8 space-y-6">
                <div>
                  <h2 className="mb-1 font-['Clash_Display'] text-2xl font-bold">Ready to launch</h2>
                  <p className="font-['Satoshi'] text-sm text-gray-500">Here's what AutoApply will do for you.</p>
                </div>
                {!sessionSaved && (
                  <div className="flex items-start gap-3 rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                    <FiAlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <div>
                      <p className="font-['Satoshi'] text-sm font-semibold text-amber-800">LinkedIn not connected</p>
                      <p className="font-['Satoshi'] text-sm text-amber-700">Without a session, we can only apply to platforms that don't require login. <button onClick={() => setStep("linkedin")} className="font-semibold underline">Connect now</button></p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[{label:"Roles",value:selectedRoles.length,color:"bg-violet-100 text-violet-700"},{label:"Markets",value:selectedLocations.length,color:"bg-emerald-100 text-emerald-700"},{label:"Platforms",value:selectedPlatforms.length,color:"bg-orange-100 text-orange-700"},{label:"Per Day",value:dailyLimit,color:"bg-blue-100 text-blue-700"}].map((s) => (<div key={s.label} className={`rounded-xl border-2 border-neutral-900 p-4 ${s.color}`}><p className="font-['Clash_Display'] text-2xl font-bold">{s.value}</p><p className="font-['Satoshi'] text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</p></div>))}
                </div>
                <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-5">
                  <p className="mb-3 font-['Satoshi'] text-sm font-semibold">What happens next</p>
                  <div className="space-y-2.5">{["Our servers scan your platforms for matching roles every 6 hours","Each job is scored against your CV | only strong fits get applications","Screening questions are pre-answered using your CV","Applications go out automatically up to your daily limit","Limits ramp over 14 days to protect your LinkedIn account"].map((item, i) => (<div key={i} className="flex items-start gap-3"><div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-600 font-['Satoshi'] text-xs font-bold text-white">{i + 1}</div><p className="font-['Satoshi'] text-sm text-neutral-700">{item}</p></div>))}</div>
                </div>
                <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                  <p className="font-['Satoshi'] text-sm font-semibold text-amber-800">Beta | free for now</p>
                  <p className="mt-1 font-['Satoshi'] text-sm text-amber-700">Free while we're in beta. We'll notify you before anything changes.</p>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("linkedin")} className="font-['Satoshi'] text-sm text-gray-500 underline">Back</button>
                  <button onClick={handleLaunch} disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-emerald-500 px-8 py-3 font-['Satoshi'] text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-wait disabled:opacity-60">
                    {saving ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> : <><FiZap className="h-4 w-4" /> Start AutoApply</>}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}
