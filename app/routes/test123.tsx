import { useState, useRef, useEffect } from "react";
import { redirect } from "react-router";
import { Header, Footer } from "~/components";
import {
  FiUpload, FiArrowRight, FiCheckCircle, FiZap, FiMapPin,
  FiBriefcase, FiGlobe, FiTarget, FiPause, FiPlay,
  FiRefreshCw, FiClock, FiTrendingUp, FiAlertTriangle,
  FiLink, FiShield, FiX, FiPlus,
} from "react-icons/fi";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/test123";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/test123");
  return { user: { name: session.user.name, email: session.user.email } };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AutoApply Beta | Studojo" },
    { name: "description", content: "Upload your resume. Set your preferences. Studojo applies to 100+ jobs while you sleep." },
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

type Step = "resume" | "prefs" | "linkedin" | "launch";
type View = "setup" | "dashboard";

interface Config {
  id: string;
  cvText: string;
  roles: string[];
  locations: string[];
  platforms: string[];
  workType: string;
  dailyLimit: number;
  status: string;
  createdAt: string;
}

interface Job {
  id: string;
  company: string;
  roleTitle: string;
  location: string;
  platform: string;
  matchScore: number | null;
  status: string;
  appliedAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  applied: number;
  queued: number;
  failed: number;
  skipped: number;
}

interface LinkedInSession {
  connected: boolean;
  isActive?: boolean;
  warmupDay?: number;
  cookieAgedays?: number;
  cookieExpiresSoon?: boolean;
  proxyCountry?: string;
  proxyCity?: string;
}

const toggle = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const HEALTH_CHECKS = [
  { id: "age", label: "Account age ≥ 3 months", detail: "New accounts face higher restriction risk" },
  { id: "connections", label: "100+ first-degree connections", detail: "Thin networks get flagged faster" },
  { id: "photo", label: "Profile photo set", detail: "Profiles without photos get 40% less responses" },
  { id: "experience", label: "Current job/experience listed", detail: "Required for recruiter credibility" },
  { id: "skills", label: "At least 3 skills listed", detail: "LinkedIn uses this for search ranking" },
];

export default function AutoApplyBeta({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  const [view, setView] = useState<View>("setup");
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [config, setConfig] = useState<Config | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, applied: 0, queued: 0, failed: 0, skipped: 0 });
  const [linkedInSession, setLinkedInSession] = useState<LinkedInSession | null>(null);

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

  // Company prefs
  const [companyInput, setCompanyInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [preferredCompanies, setPreferredCompanies] = useState<string[]>([]);
  const [excludedCompanies, setExcludedCompanies] = useState<string[]>([]);

  // LinkedIn session state
  const [liAt, setLiAt] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Kolkata");
  const [healthChecks, setHealthChecks] = useState<Record<string, boolean>>({});
  const [savingSession, setSavingSession] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/autoapply/config").then((r) => r.json()),
      fetch("/api/autoapply/jobs").then((r) => r.json()),
      fetch("/api/autoapply/session").then((r) => r.json()),
    ])
      .then(([configData, jobsData, sessionData]) => {
        if (configData.config) {
          setConfig(configData.config);
          setView("dashboard");
        }
        if (jobsData.jobs) setJobs(jobsData.jobs);
        if (jobsData.stats) setStats(jobsData.stats);
        setLinkedInSession(sessionData);
        if (sessionData?.connected) setSessionSaved(true);
      })
      .catch(() => {})
      .finally(() => setLoadingConfig(false));
  }, []);

  const canProceedFromResume = cvText.trim().length > 100;
  const canProceedFromPrefs = selectedRoles.length > 0 && selectedLocations.length > 0 && selectedPlatforms.length > 0;
  const healthScore = HEALTH_CHECKS.filter((c) => healthChecks[c.id]).length;
  const healthPct = Math.round((healthScore / HEALTH_CHECKS.length) * 100);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleFile = async (file: File) => {
    if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
      setParsing(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/resumes/parse", { method: "POST", body: fd });
        if (!res.ok) throw new Error();
        const { resumeData } = await res.json();
        setCvText(resumeDataToText(resumeData));
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

  const resumeDataToText = (d: any): string => {
    const lines: string[] = [];
    if (d.contact_info?.name) lines.push(d.contact_info.name);
    if (d.contact_info?.email) lines.push(d.contact_info.email);
    if (d.contact_info?.location) lines.push(d.contact_info.location);
    if (d.summary) { lines.push("", "SUMMARY", d.summary); }
    if (d.work_experiences?.length) {
      lines.push("", "EXPERIENCE");
      for (const e of d.work_experiences) {
        lines.push(`${e.role} at ${e.company} (${e.start_date} - ${e.end_date || "Present"})`);
        if (e.description) lines.push(e.description);
      }
    }
    if (d.educations?.length) {
      lines.push("", "EDUCATION");
      for (const e of d.educations) {
        lines.push(`${e.degree} ${e.field_of_study} - ${e.institution}`);
      }
    }
    if (d.skills?.length) {
      lines.push("", "SKILLS");
      lines.push(d.skills.map((s: any) => s.name).join(", "));
    }
    return lines.join("\n").trim();
  };

  const saveLinkedInSession = async () => {
    if (!liAt.trim()) return;
    setSavingSession(true);
    try {
      const tz = TIMEZONES.find((t) => t.value === selectedTimezone);
      const res = await fetch("/api/autoapply/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liAt: liAt.trim(),
          userAgent: navigator.userAgent,
          locale: tz?.locale ?? "en-US",
          timezone: selectedTimezone,
        }),
      });
      if (!res.ok) throw new Error();
      setSessionSaved(true);
      setLiAt("");
    } catch {
      alert("Failed to save LinkedIn session. Please try again.");
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
        body: JSON.stringify({
          cvText,
          roles: selectedRoles,
          locations: selectedLocations,
          platforms: selectedPlatforms,
          workType,
          dailyLimit,
          companyPrefs: { preferred: preferredCompanies },
          excludedCompanies,
        }),
      });
      if (!res.ok) throw new Error();
      const { config: saved } = await res.json();
      setConfig(saved);
      setView("dashboard");
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
    if (res.ok) {
      const { config: updated } = await res.json();
      setConfig(updated);
    }
  };

  const STEPS: Array<{ id: Step; label: string }> = [
    { id: "resume", label: "Resume" },
    { id: "prefs", label: "Preferences" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "launch", label: "Launch" },
  ];
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
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
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-violet-100 px-4 py-1.5 font-['Satoshi'] text-sm font-semibold text-violet-700">
            <FiZap className="h-3.5 w-3.5" />
            Beta | Free Access
          </span>
          <h1 className="mt-4 font-['Clash_Display'] text-4xl font-bold text-neutral-900 md:text-5xl">
            AutoApply
          </h1>
          <p className="mt-3 font-['Satoshi'] text-lg text-gray-600">
            Upload once. Apply everywhere. We handle 100+ applications while you sleep.
          </p>
        </div>

        {/* ── DASHBOARD VIEW ── */}
        {view === "dashboard" && config && (
          <div className="space-y-5">

            {/* Cookie expiry warning */}
            {linkedInSession?.cookieExpiresSoon && (
              <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 shadow-[3px_3px_0px_0px_rgba(217,119,6,0.3)]">
                <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-['Satoshi'] text-sm font-semibold text-amber-800">LinkedIn session expiring soon</p>
                  <p className="font-['Satoshi'] text-sm text-amber-700">
                    Your li_at cookie is {linkedInSession.cookieAgedays} days old. Refresh it to keep AutoApply running without interruption.
                  </p>
                  <button
                    onClick={() => { setView("setup"); setStep("linkedin"); }}
                    className="mt-2 font-['Satoshi'] text-sm font-semibold text-amber-800 underline"
                  >
                    Refresh now
                  </button>
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
                      ? `Up to ${config.dailyLimit} applications/day · Warm-up day ${linkedInSession?.warmupDay ?? 0}`
                      : "Resume AutoApply to start sending applications again"}
                  </p>
                </div>
              </div>
              <button
                onClick={togglePause}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-4 py-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                {config.status === "active"
                  ? <><FiPause className="h-4 w-4" /> Pause</>
                  : <><FiPlay className="h-4 w-4" /> Resume</>}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Applied", value: stats.applied, color: "bg-violet-100 text-violet-700" },
                { label: "In Queue", value: stats.queued, color: "bg-blue-100 text-blue-700" },
                { label: "Skipped", value: stats.skipped, color: "bg-amber-100 text-amber-700" },
                { label: "Failed", value: stats.failed, color: "bg-red-100 text-red-700" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl border-2 border-neutral-900 p-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] ${s.color}`}>
                  <p className="font-['Clash_Display'] text-3xl font-bold">{s.value}</p>
                  <p className="font-['Satoshi'] text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Config summary */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">Your Setup</h2>
                <button
                  onClick={() => { setView("setup"); setStep("resume"); setCvText(config.cvText); setSelectedRoles(config.roles); setSelectedLocations(config.locations); setSelectedPlatforms(config.platforms); setWorkType(config.workType as any); setDailyLimit(config.dailyLimit); }}
                  className="font-['Satoshi'] text-sm font-semibold text-violet-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Roles", value: config.roles.join(", ") || "—", icon: <FiBriefcase className="h-4 w-4 text-violet-500" /> },
                  { label: "Markets", value: config.locations.join(", ") || "—", icon: <FiMapPin className="h-4 w-4 text-emerald-500" /> },
                  { label: "Work type", value: config.workType, icon: <FiGlobe className="h-4 w-4 text-blue-500" /> },
                  { label: "Platforms", value: PLATFORMS.filter((p) => config.platforms.includes(p.id)).map((p) => p.label).join(", ") || "—", icon: <FiTarget className="h-4 w-4 text-orange-500" /> },
                  { label: "Daily limit", value: `${config.dailyLimit} applications/day`, icon: <FiTrendingUp className="h-4 w-4 text-neutral-500" /> },
                  ...(linkedInSession?.connected ? [{ label: "LinkedIn", value: `Connected · Proxy: ${linkedInSession.proxyCity ?? "—"}, ${linkedInSession.proxyCountry ?? "—"}`, icon: <FiLink className="h-4 w-4 text-blue-500" /> }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5">{row.icon}</div>
                    <span className="w-24 shrink-0 font-['Satoshi'] text-sm text-gray-500">{row.label}</span>
                    <span className="font-['Satoshi'] text-sm font-medium capitalize text-neutral-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobs queue */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">Application Queue</h2>
                <button onClick={() => fetch("/api/autoapply/jobs").then((r) => r.json()).then((d) => { setJobs(d.jobs ?? []); setStats(d.stats ?? stats); })} className="inline-flex items-center gap-1.5 font-['Satoshi'] text-sm text-gray-500 hover:text-neutral-900">
                  <FiRefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>

              {jobs.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-neutral-200 py-12 text-center">
                  <FiClock className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                  <p className="font-['Clash_Display'] text-lg font-bold text-neutral-400">No applications yet</p>
                  <p className="mt-1 font-['Satoshi'] text-sm text-gray-400">
                    {config.status === "active"
                      ? "First run kicks off within 24 hours. Check back soon."
                      : "Resume AutoApply above to start processing jobs."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
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
                        : job.status === "queued" ? "border-blue-300 bg-blue-50 text-blue-700"
                        : job.status === "failed" ? "border-red-300 bg-red-50 text-red-700"
                        : "border-neutral-300 bg-white text-neutral-500"
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── SETUP WIZARD ── */}
        {view === "setup" && (
          <>
            {/* Step indicator */}
            <div className="mb-8 flex items-center justify-center gap-2 overflow-x-auto">
              {STEPS.map(({ id, label }, i) => {
                const n = i + 1;
                const done = stepIdx > i;
                const active = stepIdx === i;
                return (
                  <div key={id} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-900 font-['Satoshi'] text-sm font-bold transition-colors ${done ? "bg-emerald-400 text-neutral-900" : active ? "bg-violet-600 text-white" : "bg-white text-neutral-400"}`}>
                        {done ? <FiCheckCircle className="h-4 w-4" /> : n}
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
                <h2 className="mb-1 font-['Clash_Display'] text-2xl font-bold text-neutral-900">Your Resume</h2>
                <p className="mb-6 font-['Satoshi'] text-sm text-gray-500">Upload a PDF or paste your CV text.</p>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => !parsing && fileRef.current?.click()}
                  className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-5 transition-colors ${parsing ? "cursor-wait border-violet-400 bg-violet-50" : dragOver ? "border-violet-600 bg-violet-50" : "border-neutral-300 bg-neutral-50 hover:border-violet-400 hover:bg-violet-50"}`}
                >
                  {parsing ? (
                    <>
                      <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                      <p className="font-['Satoshi'] text-sm font-medium text-violet-700">Parsing PDF...</p>
                    </>
                  ) : (
                    <>
                      <FiUpload className="mb-2 h-6 w-6 text-neutral-400" />
                      <p className="font-['Satoshi'] text-sm text-gray-500">Drop file here or <span className="font-semibold text-violet-600">click to upload</span></p>
                      <p className="mt-1 font-['Satoshi'] text-xs text-gray-400">.pdf, .txt, or .md</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleFileChange} />
                </div>

                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Or paste your CV / resume text here..."
                  rows={12}
                  className="w-full resize-none rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <div className="mt-2 flex items-center justify-between">
                  <p className="font-['Satoshi'] text-xs text-gray-400">
                    {cvText.trim().length} characters{cvText.trim().length < 100 && cvText.trim().length > 0 ? " | too short" : ""}
                  </p>
                  <button
                    disabled={!canProceedFromResume}
                    onClick={() => setStep("prefs")}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-600 px-6 py-2.5 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  >
                    Next <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 | Preferences */}
            {step === "prefs" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                <h2 className="mb-1 font-['Clash_Display'] text-2xl font-bold text-neutral-900">Job Preferences</h2>
                <p className="mb-6 font-['Satoshi'] text-sm text-gray-500">Be specific | it improves match quality.</p>

                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold text-neutral-800">
                    <FiBriefcase className="h-4 w-4 text-violet-600" />
                    Role Types <span className="font-normal text-gray-400">(pick all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_TYPES.map((r) => (
                      <button key={r} onClick={() => setSelectedRoles(toggle(selectedRoles, r))}
                        className={`rounded-lg border-2 border-neutral-900 px-3 py-1.5 font-['Satoshi'] text-sm font-medium transition-colors ${selectedRoles.includes(r) ? "bg-violet-600 text-white" : "bg-white text-neutral-700 hover:bg-violet-50"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold text-neutral-800">
                    <FiMapPin className="h-4 w-4 text-violet-600" /> Target Markets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((l) => (
                      <button key={l} onClick={() => setSelectedLocations(toggle(selectedLocations, l))}
                        className={`rounded-lg border-2 border-neutral-900 px-3 py-1.5 font-['Satoshi'] text-sm font-medium transition-colors ${selectedLocations.includes(l) ? "bg-emerald-500 text-white" : "bg-white text-neutral-700 hover:bg-emerald-50"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold text-neutral-800">
                    <FiGlobe className="h-4 w-4 text-violet-600" /> Work Arrangement
                  </label>
                  <div className="flex gap-2">
                    {(["remote", "hybrid", "onsite", "any"] as const).map((w) => (
                      <button key={w} onClick={() => setWorkType(w)}
                        className={`rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] text-sm font-medium capitalize transition-colors ${workType === w ? "bg-neutral-900 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"}`}>
                        {w === "any" ? "Any" : w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold text-neutral-800">
                    <FiTarget className="h-4 w-4 text-violet-600" /> Apply On
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <button key={p.id} onClick={() => setSelectedPlatforms(toggle(selectedPlatforms, p.id))}
                        className={`rounded-lg border-2 border-neutral-900 px-3 py-1.5 font-['Satoshi'] text-sm font-medium transition-colors ${selectedPlatforms.includes(p.id) ? "bg-orange-400 text-white" : "bg-white text-neutral-700 hover:bg-orange-50"}`}>
                        {p.flag} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block font-['Satoshi'] text-sm font-semibold text-neutral-800">
                    Daily Limit | <span className="font-normal text-violet-600">{dailyLimit} applications/day</span>
                  </label>
                  <input type="range" min={5} max={50} step={5} value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} className="w-full accent-violet-600" />
                  <div className="mt-1 flex justify-between font-['Satoshi'] text-xs text-gray-400"><span>5</span><span>50</span></div>
                </div>

                {/* Company preferences */}
                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold text-neutral-800">
                    <FiTarget className="h-4 w-4 text-emerald-600" /> Target Companies <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && companyInput.trim()) { setPreferredCompanies([...preferredCompanies, companyInput.trim()]); setCompanyInput(""); } }}
                      placeholder="Type company name and press Enter"
                      className="flex-1 rounded-lg border-2 border-neutral-900 px-3 py-2 font-['Satoshi'] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      onClick={() => { if (companyInput.trim()) { setPreferredCompanies([...preferredCompanies, companyInput.trim()]); setCompanyInput(""); } }}
                      className="rounded-lg border-2 border-neutral-900 bg-emerald-500 p-2 text-white"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>
                  {preferredCompanies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {preferredCompanies.map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-['Satoshi'] text-xs font-medium text-emerald-700">
                          {c}
                          <button onClick={() => setPreferredCompanies(preferredCompanies.filter((x) => x !== c))}><FiX className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 font-['Satoshi'] text-sm font-semibold text-neutral-800">
                    <FiX className="h-4 w-4 text-red-500" /> Exclude Companies <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && excludeInput.trim()) { setExcludedCompanies([...excludedCompanies, excludeInput.trim()]); setExcludeInput(""); } }}
                      placeholder="Companies to never apply to"
                      className="flex-1 rounded-lg border-2 border-neutral-900 px-3 py-2 font-['Satoshi'] text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <button
                      onClick={() => { if (excludeInput.trim()) { setExcludedCompanies([...excludedCompanies, excludeInput.trim()]); setExcludeInput(""); } }}
                      className="rounded-lg border-2 border-neutral-900 bg-red-400 p-2 text-white"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>
                  {excludedCompanies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {excludedCompanies.map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-3 py-1 font-['Satoshi'] text-xs font-medium text-red-700">
                          {c}
                          <button onClick={() => setExcludedCompanies(excludedCompanies.filter((x) => x !== c))}><FiX className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("resume")} className="font-['Satoshi'] text-sm text-gray-500 underline hover:text-neutral-900">Back</button>
                  <button disabled={!canProceedFromPrefs} onClick={() => setStep("linkedin")}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-600 px-6 py-2.5 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0">
                    Next <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 | LinkedIn Connect */}
            {step === "linkedin" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                <h2 className="mb-1 font-['Clash_Display'] text-2xl font-bold text-neutral-900">Connect LinkedIn</h2>
                <p className="mb-6 font-['Satoshi'] text-sm text-gray-500">
                  We use your LinkedIn session cookie to apply on your behalf from our regional servers | no password needed, and we match your browser fingerprint so it looks like you.
                </p>

                {sessionSaved ? (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4">
                    <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-['Satoshi'] text-sm font-semibold text-emerald-800">LinkedIn connected</p>
                      <p className="font-['Satoshi'] text-sm text-emerald-700">
                        Session saved and encrypted. AutoApply will use your session to apply from a server near you.
                      </p>
                      <button onClick={() => setSessionSaved(false)} className="mt-1 font-['Satoshi'] text-xs text-emerald-700 underline">Update cookie</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Extension auto-capture note */}
                    <div className="mb-5 flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                      <FiZap className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <p className="font-['Satoshi'] text-sm text-blue-700">
                        <span className="font-semibold">Have the Studojo extension?</span> Your cookie was captured automatically when you connected. You may already be set | check below.
                      </p>
                    </div>

                    {/* Manual flow */}
                    <p className="mb-3 font-['Satoshi'] text-sm font-semibold text-neutral-800">Manual setup (5 min)</p>
                    <ol className="mb-5 space-y-3">
                      {[
                        "Open LinkedIn in Chrome while logged in",
                        "Press F12 to open DevTools → Application tab → Cookies → linkedin.com",
                        `Find the cookie named "li_at" → copy its value`,
                        "Paste it below",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-600 font-['Satoshi'] text-xs font-bold text-white">{i + 1}</span>
                          <span className="font-['Satoshi'] text-sm text-neutral-700">{item}</span>
                        </li>
                      ))}
                    </ol>

                    <div className="mb-4">
                      <label className="mb-1.5 block font-['Satoshi'] text-sm font-semibold text-neutral-800">li_at cookie value</label>
                      <input
                        type="password"
                        value={liAt}
                        onChange={(e) => setLiAt(e.target.value)}
                        placeholder="AQEDATKr... (paste your li_at value)"
                        className="w-full rounded-xl border-2 border-neutral-900 px-4 py-3 font-mono text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="mb-1.5 block font-['Satoshi'] text-sm font-semibold text-neutral-800">Your timezone (for IP matching)</label>
                      <select
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="w-full rounded-xl border-2 border-neutral-900 px-4 py-3 font-['Satoshi'] text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      disabled={!liAt.trim() || savingSession}
                      onClick={saveLinkedInSession}
                      className="mb-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 bg-blue-600 px-6 py-3 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                      {savingSession ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> : <><FiShield className="h-4 w-4" /> Encrypt & Save Session</>}
                    </button>
                  </>
                )}

                {/* Profile health check */}
                <div className="mb-6 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-['Satoshi'] text-sm font-semibold text-neutral-800">LinkedIn profile health</p>
                    <span className={`rounded-full px-2.5 py-1 font-['Satoshi'] text-xs font-bold ${healthPct >= 80 ? "bg-emerald-100 text-emerald-700" : healthPct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {healthPct}%
                    </span>
                  </div>
                  <p className="mb-3 font-['Satoshi'] text-xs text-gray-500">Check all that apply to your LinkedIn profile. Stronger profiles face fewer restrictions.</p>
                  <div className="space-y-2">
                    {HEALTH_CHECKS.map((check) => (
                      <label key={check.id} className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={!!healthChecks[check.id]}
                          onChange={(e) => setHealthChecks({ ...healthChecks, [check.id]: e.target.checked })}
                          className="mt-0.5 h-4 w-4 accent-violet-600"
                        />
                        <div>
                          <p className="font-['Satoshi'] text-sm font-medium text-neutral-800">{check.label}</p>
                          <p className="font-['Satoshi'] text-xs text-gray-400">{check.detail}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {healthPct < 60 && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
                      <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="font-['Satoshi'] text-xs text-amber-700">
                        Low profile score increases restriction risk. We recommend starting at 5 applications/day and building up over 2 weeks.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("prefs")} className="font-['Satoshi'] text-sm text-gray-500 underline hover:text-neutral-900">Back</button>
                  <button onClick={() => setStep("launch")}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-600 px-6 py-2.5 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]">
                    {sessionSaved ? "Continue" : "Skip for now"} <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 | Launch */}
            {step === "launch" && (
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                <h2 className="mb-1 font-['Clash_Display'] text-2xl font-bold text-neutral-900">Ready to launch</h2>
                <p className="mb-6 font-['Satoshi'] text-sm text-gray-500">Here's what AutoApply will do for you.</p>

                {!sessionSaved && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                    <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-['Satoshi'] text-sm font-semibold text-amber-800">LinkedIn not connected</p>
                      <p className="font-['Satoshi'] text-sm text-amber-700">Without your LinkedIn session, we can only apply on platforms that don't require login. <button onClick={() => setStep("linkedin")} className="font-semibold underline">Connect now</button></p>
                    </div>
                  </div>
                )}

                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Roles", value: selectedRoles.length, color: "bg-violet-100 text-violet-700" },
                    { label: "Markets", value: selectedLocations.length, color: "bg-emerald-100 text-emerald-700" },
                    { label: "Platforms", value: selectedPlatforms.length, color: "bg-orange-100 text-orange-700" },
                    { label: "Per Day", value: `${dailyLimit}`, color: "bg-blue-100 text-blue-700" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl border-2 border-neutral-900 p-4 ${s.color}`}>
                      <p className="font-['Clash_Display'] text-2xl font-bold">{s.value}</p>
                      <p className="font-['Satoshi'] text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-6 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-5">
                  <p className="mb-3 font-['Satoshi'] text-sm font-semibold text-neutral-700">What happens next</p>
                  <div className="space-y-2.5">
                    {[
                      "Our servers scan your chosen platforms for matching roles every 6 hours",
                      "Each job is scored against your CV | only strong fits get applications",
                      "We generate tailored answers to screening questions using your CV",
                      "Applications go out automatically up to your daily limit",
                      "Limits ramp up over 14 days to protect your LinkedIn account",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-600 font-['Satoshi'] text-xs font-bold text-white">{i + 1}</div>
                        <p className="font-['Satoshi'] text-sm text-neutral-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6 rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                  <p className="font-['Satoshi'] text-sm font-semibold text-amber-800">Beta | free for now</p>
                  <p className="mt-1 font-['Satoshi'] text-sm text-amber-700">You're one of the first users. Free while we're in beta. We'll notify you before anything changes.</p>
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("linkedin")} className="font-['Satoshi'] text-sm text-gray-500 underline hover:text-neutral-900">Back</button>
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
