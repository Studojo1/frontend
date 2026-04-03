'use client';
import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  FiArrowRight, FiRefreshCw,
  FiClock, FiUpload, FiType,
  FiCheckCircle, FiZap, FiUser,
  FiSearch, FiFileText, FiChevronRight,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import type { AnalysisResult } from "~/lib/ai-risk/engine";

export function meta() {
  return [
    { title: "Will AI Replace Your Job? | Studojo" },
    {
      name: "description",
      content:
        "Find out if AI will replace your job, when, and exactly what career moves to make to stay ahead.",
    },
  ];
}

const EXAMPLES = [
  "Fin Crime Associate at Stripe",
  "Growth Manager at a Series B startup",
  "Investment Banking Analyst",
  "Software Engineer at FAANG",
  "Content Strategist at a D2C brand",
  "Credit Analyst at HDFC",
  "Management Consultant at McKinsey",
  "Product Manager at Razorpay",
];

const RISK_CONFIG = {
  critical: {
    label: "CRITICAL RISK",
    bg: "bg-red-50", border: "border-red-200", text: "text-red-600",
    pill: "bg-red-100 text-red-700 border-red-200", arc: "#ef4444",
    urgency: "Act immediately. The window to pivot is closing fast.",
    pivotIntro: "These pivots get you out of direct AI displacement. Ranked by how fast you can get there.",
  },
  high: {
    label: "HIGH RISK",
    bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600",
    pill: "bg-orange-100 text-orange-700 border-orange-200", arc: "#f97316",
    urgency: "Start planning your pivot now. You have 2-4 years before the role changes significantly.",
    pivotIntro: "Roles that build on your existing skills with significantly lower AI exposure.",
  },
  medium: {
    label: "MEDIUM RISK",
    bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600",
    pill: "bg-amber-100 text-amber-700 border-amber-200", arc: "#eab308",
    urgency: "Upskill strategically. Your role will change but skilled practitioners stay valuable.",
    pivotIntro: "Future-proofed moves that compound your existing expertise.",
  },
  low: {
    label: "LOW RISK",
    bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600",
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200", arc: "#10b981",
    urgency: "You are in a resilient role. Stay sharp with AI tools to widen your advantage.",
    pivotIntro: "Roles that compound your natural AI-resistance into even more durable careers.",
  },
};

type InputMode = "job" | "resume" | "linkedin";
type ResumeState = "idle" | "uploading" | "extracted" | "error";

interface EnhancedPivot {
  role: string;
  risk_pct: number;
  why: string;
  skills: string[];
  timeline: string;
  difficulty: 1 | 2 | 3;
}

// ── Semi-circle gauge ────────────────────────────────────────────────────────
function RiskGauge({ pct, animated, level }: { pct: number; animated: boolean; level: keyof typeof RISK_CONFIG }) {
  const r = 80; const cx = 100; const cy = 100;
  const circumference = Math.PI * r;
  const offset = animated ? circumference * (1 - pct / 100) : circumference;
  const color = RISK_CONFIG[level].arc;
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[280px] mx-auto">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: animated ? "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)" : "none" }} />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="32" fontWeight="800" fill={color} fontFamily="'Clash Display', sans-serif">{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="'Satoshi', sans-serif">replacement risk</text>
    </svg>
  );
}

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  const labels = ["", "Easy", "Medium", "Hard"];
  const colors = ["", "text-emerald-600", "text-amber-600", "text-red-500"];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i <= level ? "bg-studojo-purple" : "bg-studojo-ink/15"}`} />
        ))}
      </div>
      <span className={`text-[10px] font-satoshi font-semibold ${colors[level]}`}>{labels[level]}</span>
    </div>
  );
}

function PivotCard({ pivot, index, currentRisk, showCTA = false }: { pivot: EnhancedPivot; index: number; currentRisk: number; showCTA?: boolean }) {
  const navigate = useNavigate();
  const riskColor = pivot.risk_pct >= 60 ? "#ef4444" : pivot.risk_pct >= 35 ? "#f97316" : "#10b981";
  const riskBg = pivot.risk_pct >= 60 ? "#fef2f2" : pivot.risk_pct >= 35 ? "#fff7ed" : "#f0fdf4";
  const saved = currentRisk - pivot.risk_pct;
  const stepColors = ["bg-studojo-purple", "bg-blue-500", "bg-emerald-500"];

  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
      {/* top accent strip */}
      <div className={`h-1 w-full ${stepColors[index] || "bg-studojo-purple"}`} />
      <div className="p-5">
        <div className="flex gap-4">
          {/* Step number */}
          <div className={`w-8 h-8 rounded-xl ${stepColors[index] || "bg-studojo-purple"} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-clash font-bold text-sm">{index + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="font-clash text-base font-bold text-studojo-ink leading-snug">{pivot.role}</h4>
              {pivot.risk_pct > 0 && (
                <span className="flex-shrink-0 text-[10px] font-satoshi font-bold px-2 py-0.5 rounded-full" style={{ color: riskColor, background: riskBg }}>
                  {pivot.risk_pct}% risk
                </span>
              )}
            </div>
            {saved > 0 && (
              <p className="text-[11px] font-satoshi font-semibold text-emerald-600 mb-2">
                {saved}% lower risk than your current role
              </p>
            )}
            <p className="text-xs font-satoshi text-studojo-muted leading-relaxed mb-3">{pivot.why}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {pivot.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-satoshi font-medium bg-studojo-purple/8 text-studojo-purple border border-studojo-purple/20">{s}</span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-studojo-ink/8">
              <div className="flex items-center gap-3">
                <span className="text-xs font-satoshi text-studojo-muted flex items-center gap-1.5">
                  <FiClock className="w-3 h-3" /> {pivot.timeline}
                </span>
                <DifficultyDots level={pivot.difficulty} />
              </div>
              {showCTA && (
                <button
                  onClick={() => navigate("/outreach")}
                  className="flex items-center gap-1 text-xs font-satoshi font-semibold text-studojo-purple hover:underline"
                >
                  Find openings <FiChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PivotSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-studojo-ink/15 bg-white p-5 flex flex-col gap-3 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-100 rounded-md" />
        <div className="h-5 w-20 bg-gray-100 rounded-md" />
      </div>
    </div>
  );
}

function getTimelineInsights(risk_pct: number, title: string) {
  if (risk_pct >= 75) {
    return [
      { year: "In 12 months", insight: `AI tools are already handling core ${title} tasks. Employers are beginning to reduce headcount or freeze hiring in this role.` },
      { year: "In 3 years", insight: `Routine ${title} work is largely automated. Only specialists who transitioned to AI-adjacent roles retain strong salaries.` },
      { year: "In 5 years", insight: `Demand for standalone ${title} roles drops sharply. Those who pivoted early are now managing AI-powered workflows, not competing with them.` },
    ];
  }
  if (risk_pct >= 50) {
    return [
      { year: "In 12 months", insight: `AI tools begin replacing the most repetitive parts of your workflow. Expect pressure to use AI daily or be seen as falling behind.` },
      { year: "In 3 years", insight: `The ${title} role is being redefined. AI handles 50-70% of output volume. Human value is in judgment, strategy, and client relationships.` },
      { year: "In 5 years", insight: `A leaner ${title} workforce manages larger AI pipelines. Salaries split: AI-fluent practitioners earn significantly more than those who didn't adapt.` },
    ];
  }
  if (risk_pct >= 25) {
    return [
      { year: "In 12 months", insight: `AI becomes a daily co-pilot. Mastering these tools now makes you 2-3x more productive than peers who are slower to adopt.` },
      { year: "In 3 years", insight: `The ${title} role evolves but does not disappear. Human judgment, client trust, and contextual reasoning remain irreplaceable.` },
      { year: "In 5 years", insight: `${title}s who integrated AI deeply are indispensable. The role requires a broader, more strategic skill set than today.` },
    ];
  }
  return [
    { year: "In 12 months", insight: `AI becomes a powerful assistant but changes very little about the core value you deliver. Adoption is beneficial but not urgent.` },
    { year: "In 3 years", insight: `The ${title} role remains fundamentally human. AI handles peripheral admin. Your expertise gap vs AI actually widens.` },
    { year: "In 5 years", insight: `${title}s are in higher demand as AI scales, not lower. The premium on human skills in this domain grows.` },
  ];
}

function getUpskillingRecs(pivots: EnhancedPivot[], risk_pct: number) {
  const stayRelevant: string[] = [];
  if (risk_pct >= 50) {
    stayRelevant.push("AI tool proficiency: integrate ChatGPT, Claude, or Copilot into your daily workflow");
    stayRelevant.push("Prompt engineering for your specific domain and task types");
  }
  if (risk_pct >= 25) {
    stayRelevant.push("Data literacy: read, interpret, and act on dashboards and reports");
    stayRelevant.push("Light automation with Zapier or Make to eliminate manual repetitive tasks");
  }

  const easiest = pivots.find((p) => p.difficulty === 1) || pivots[0];
  return { stayRelevant, pivotSkills: easiest ? { label: easiest.role, skills: easiest.skills } : null };
}

// Convert engine pivots to EnhancedPivot format with estimated risk scores
function enginePivotsToEnhanced(pivots: AnalysisResult["pivots"], currentRisk: number): EnhancedPivot[] {
  return pivots.map((p) => ({
    ...p,
    // Estimate pivot role risk from difficulty relative to current risk
    // All recommended pivots are safer than the current role
    risk_pct: Math.max(5, Math.round(currentRisk * ({ 1: 0.45, 2: 0.40, 3: 0.30 }[p.difficulty]))),
  }));
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIRiskPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<InputMode>("job");
  const [input, setInput] = useState("");

  // Resume
  const [resumeState, setResumeState] = useState<ResumeState>("idle");
  const [extractedTitle, setExtractedTitle] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeError, setResumeError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LinkedIn
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [linkedinTitle, setLinkedinTitle] = useState("");

  const [sourceLabel, setSourceLabel] = useState("");

  // Analysis
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [gaugeAnimated, setGaugeAnimated] = useState(false);

  // LLM-enhanced pivots (async, replaces engine pivots when ready)
  const [enhancedPivots, setEnhancedPivots] = useState<EnhancedPivot[] | null>(null);
  const [pivotsLoading, setPivotsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Only call LLM suggest for truly unknown roles (low confidence from engine).
  // For known roles (high/medium confidence), engine pivots are always more specific.
  const fetchLLMPivots = async (res: AnalysisResult) => {
    setPivotsLoading(true);
    try {
      const resp = await fetch("/api/ai-risk/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: res.matched_title,
          risk_pct: res.risk_pct,
          risk_level: res.risk_level,
          risk_drivers: res.risk_drivers,
          human_edges: res.human_edges,
        }),
      });
      if (!resp.ok) throw new Error("LLM unavailable");
      const data = await resp.json();
      if (data.pivots && data.pivots.length >= 2) {
        setEnhancedPivots(data.pivots);
      } else {
        setEnhancedPivots(enginePivotsToEnhanced(res.pivots, res.risk_pct));
      }
    } catch {
      setEnhancedPivots(enginePivotsToEnhanced(res.pivots, res.risk_pct));
    } finally {
      setPivotsLoading(false);
    }
  };

  const runAnalysis = async (title: string, source: string) => {
    if (!title.trim()) return;
    setSourceLabel(source);
    setAnalyzing(true);
    setResult(null);
    setEnhancedPivots(null);
    setGaugeAnimated(false);
    try {
      const resp = await fetch("/api/ai-risk/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: title.trim() }),
      });
      if (!resp.ok) throw new Error("Analysis failed");
      const data = await resp.json();
      const { suggested_pivots, ...res } = data as AnalysisResult & { suggested_pivots: EnhancedPivot[] | null };
      setResult(res);
      setAnalyzing(false);
      setTimeout(() => setGaugeAnimated(true), 80);
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (res.confidence === "high" || res.confidence === "medium") {
        // Engine knows this role — its curated pivots are better than a small LLM's guess.
        // Use engine pivots immediately; no LLM call needed.
        if (res.pivots && res.pivots.length > 0) {
          setEnhancedPivots(enginePivotsToEnhanced(res.pivots, res.risk_pct));
          setPivotsLoading(false);
        } else {
          // Engine matched but has no pivots (shouldn't happen) — fall to LLM
          fetchLLMPivots(res);
        }
      } else if (suggested_pivots && suggested_pivots.length > 0) {
        // LLM already generated contextual pivots as part of the low-confidence analysis
        setEnhancedPivots(suggested_pivots);
        setPivotsLoading(false);
      } else {
        // Unknown role, no pre-generated pivots — ask LLM
        fetchLLMPivots(res);
      }
    } catch {
      setAnalyzing(false);
    }
  };

  const handleJobAnalyse = (value?: string) => {
    const q = (value ?? input).trim();
    if (!q) return;
    setInput(q);
    runAnalysis(q, "Searched role");
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setResumeError("File too large. Max 10MB."); return; }
    setResumeFileName(file.name);
    setResumeState("uploading");
    setResumeError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ai-risk/parse-resume", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not read that file. Please upload a PDF or enter your title manually.");
      }

      const role = data.job_title || "";
      if (!role) throw new Error("Could not find a job title in your resume. Please enter it manually.");
      setExtractedTitle(role);
      setResumeState("extracted");
    } catch (err: any) {
      setResumeError(err.message || "Failed to read resume. Please enter your job title manually.");
      setResumeState("error");
    }
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleLinkedInUrlChange = (url: string) => {
    setLinkedinUrl(url);
    const match = url.match(/linkedin\.com\/in\/([^\/\?#]+)/i);
    setLinkedinUsername(match ? match[1] : "");
  };

  const handleReset = () => {
    setResult(null); setInput(""); setGaugeAnimated(false);
    setResumeState("idle"); setExtractedTitle(""); setResumeFileName("");
    setLinkedinUrl(""); setLinkedinUsername(""); setLinkedinTitle("");
    setEnhancedPivots(null); setPivotsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const cfg = result ? RISK_CONFIG[result.risk_level] : null;

  // Pivots to display: LLM-enhanced if available, else engine data with estimated risk
  const displayPivots: EnhancedPivot[] | null = result
    ? (enhancedPivots ?? (pivotsLoading ? null : enginePivotsToEnhanced(result.pivots, result.risk_pct)))
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* ── INPUT SCREEN ── */}
      {!result && !analyzing && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
          <div className="w-full max-w-xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-studojo-purple/8 border border-studojo-purple/20 mb-6">
              <span className="text-xs font-satoshi font-semibold text-studojo-purple">AI Displacement Index</span>
            </div>
            <h1 className="font-clash text-4xl sm:text-5xl font-bold text-studojo-ink mb-4 leading-tight">
              Will AI replace<br />your job?
            </h1>
            <p className="text-base sm:text-lg font-satoshi text-studojo-muted mb-8 max-w-md mx-auto">
              Get your risk score, timeline, and a full career roadmap. In seconds.
            </p>

            {/* Mode tabs */}
            <div className="flex rounded-2xl border-2 border-studojo-ink/12 bg-studojo-surface-muted p-1 mb-6">
              {([
                { id: "job" as const, icon: FiType, label: "Job Title" },
                { id: "resume" as const, icon: FiFileText, label: "Resume" },
                { id: "linkedin" as const, icon: FiUser, label: "LinkedIn" },
              ]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-satoshi font-semibold transition-all ${
                    mode === id
                      ? "bg-white border-2 border-studojo-ink shadow-brutal text-studojo-ink"
                      : "text-studojo-muted hover:text-studojo-ink"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Job title */}
            {mode === "job" && (
              <div>
                <div className="relative mb-4">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-studojo-muted pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleJobAnalyse(); }}
                    placeholder="e.g. Accountant, Software Engineer, Nurse..."
                    autoFocus
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-studojo-ink text-studojo-ink font-satoshi text-base bg-white focus:outline-none focus:ring-4 focus:ring-studojo-purple/20 placeholder:text-studojo-muted/60"
                  />
                </div>
                <button
                  onClick={() => handleJobAnalyse()}
                  disabled={!input.trim()}
                  className="w-full h-13 px-8 py-3.5 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  Analyse my job <FiArrowRight className="w-4 h-4" />
                </button>
                <div className="mt-8">
                  <p className="text-xs font-satoshi text-studojo-muted mb-3">Try an example:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {EXAMPLES.map((ex) => (
                      <button key={ex} onClick={() => handleJobAnalyse(ex)} className="px-3 py-1.5 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi text-studojo-ink hover:bg-studojo-surface-muted hover:border-studojo-ink/40 transition-colors">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Resume upload */}
            {mode === "resume" && (
              <div>
                {resumeState === "idle" || resumeState === "error" ? (
                  <div>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-36 rounded-2xl border-2 border-dashed border-studojo-ink/30 bg-studojo-surface-muted hover:border-studojo-purple hover:bg-studojo-purple/4 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 mb-4"
                    >
                      <FiUpload className="w-8 h-8 text-studojo-muted" />
                      <p className="text-sm font-satoshi font-semibold text-studojo-ink">Drop your resume here</p>
                      <p className="text-xs font-satoshi text-studojo-muted">PDF or Word doc, max 10MB</p>
                      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                    </div>
                    {resumeError && (
                      <div className="mb-4 text-sm font-satoshi text-red-600 bg-red-50 rounded-xl border border-red-200 p-3 text-left">
                        {resumeError}
                        <button onClick={() => setMode("job")} className="mt-2 text-xs underline block">Enter job title manually instead</button>
                      </div>
                    )}
                    <p className="text-xs font-satoshi text-studojo-muted">We will extract your current job title automatically</p>
                  </div>
                ) : resumeState === "uploading" ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="w-10 h-10 border-[3px] border-studojo-purple/20 border-t-studojo-purple rounded-full animate-spin" />
                    <p className="text-sm font-satoshi text-studojo-muted">Scanning <span className="font-semibold text-studojo-ink">{resumeFileName}</span>...</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 mb-4 text-left">
                      <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-satoshi text-emerald-700 mb-0.5">Role extracted from {resumeFileName}</p>
                        <p className="text-sm font-satoshi font-bold text-studojo-ink">{extractedTitle}</p>
                      </div>
                    </div>
                    <div className="mb-4 text-left">
                      <label className="text-xs font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-1.5 block">Confirm or edit your job title</label>
                      <input
                        type="text"
                        value={extractedTitle}
                        onChange={(e) => setExtractedTitle(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border-2 border-studojo-ink text-studojo-ink font-satoshi text-base bg-white focus:outline-none focus:ring-4 focus:ring-studojo-purple/20"
                      />
                    </div>
                    <button
                      onClick={() => runAnalysis(extractedTitle, `From your resume (${resumeFileName})`)}
                      disabled={!extractedTitle.trim()}
                      className="w-full h-13 px-8 py-3.5 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      Analyse my role <FiArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setResumeState("idle")} className="mt-3 text-xs font-satoshi text-studojo-muted hover:text-studojo-ink underline block mx-auto">Upload a different file</button>
                  </div>
                )}
              </div>
            )}

            {/* LinkedIn */}
            {mode === "linkedin" && (
              <div>
                <div className="mb-4 text-left">
                  <label className="text-xs font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-1.5 block">Your LinkedIn profile URL</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-studojo-muted pointer-events-none" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => handleLinkedInUrlChange(e.target.value)}
                      placeholder="linkedin.com/in/your-username"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-studojo-ink text-studojo-ink font-satoshi text-sm bg-white focus:outline-none focus:ring-4 focus:ring-studojo-purple/20 placeholder:text-studojo-muted/60"
                    />
                  </div>
                  {linkedinUsername && (
                    <p className="mt-1.5 text-xs font-satoshi text-emerald-600 flex items-center gap-1">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Profile detected: <span className="font-bold">@{linkedinUsername}</span>
                    </p>
                  )}
                </div>
                <div className="mb-5 text-left">
                  <label className="text-xs font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-1.5 block">Your current job title</label>
                  <input
                    type="text"
                    value={linkedinTitle}
                    onChange={(e) => setLinkedinTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && linkedinTitle.trim()) runAnalysis(linkedinTitle, linkedinUsername ? `LinkedIn: @${linkedinUsername}` : "LinkedIn profile"); }}
                    placeholder="e.g. Marketing Manager, Software Engineer..."
                    className="w-full h-12 px-4 rounded-xl border-2 border-studojo-ink text-studojo-ink font-satoshi text-base bg-white focus:outline-none focus:ring-4 focus:ring-studojo-purple/20 placeholder:text-studojo-muted/60"
                  />
                </div>
                <button
                  onClick={() => runAnalysis(linkedinTitle, linkedinUsername ? `LinkedIn: @${linkedinUsername}` : "LinkedIn profile")}
                  disabled={!linkedinTitle.trim()}
                  className="w-full h-13 px-8 py-3.5 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  Analyse my profile <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {analyzing && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="w-12 h-12 border-[3px] border-studojo-purple/20 border-t-studojo-purple rounded-full animate-spin" />
          <p className="font-satoshi text-studojo-muted text-sm">Running analysis...</p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {result && cfg && !analyzing && (() => {
        const timelineInsights = getTimelineInsights(result.risk_pct, result.matched_title);
        const { stayRelevant, pivotSkills } = getUpskillingRecs(displayPivots ?? [], result.risk_pct);

        return (
          <div className="flex-1 px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-2xl">

              <button onClick={handleReset} className="flex items-center gap-1.5 text-studojo-muted text-sm font-satoshi hover:text-studojo-ink mb-8 transition-colors">
                <FiRefreshCw className="w-3.5 h-3.5" /> Try another job
              </button>

              {/* ── HERO ── */}
              <div className={`rounded-3xl border-2 ${cfg.border} ${cfg.bg} p-6 sm:p-8 text-center mb-6`}>
                {sourceLabel && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-studojo-ink/10 text-xs font-satoshi text-studojo-muted mb-3">
                    <FiSearch className="w-3 h-3" /> {sourceLabel}
                  </div>
                )}
                <p className="text-sm font-satoshi text-studojo-muted mb-1">Analysed role:</p>
                <h2 className="font-clash text-2xl sm:text-3xl font-bold text-studojo-ink mb-6">{result.matched_title}</h2>
                <RiskGauge pct={result.risk_pct} animated={gaugeAnimated} level={result.risk_level} />
                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-satoshi font-bold border ${cfg.pill}`}>{cfg.label}</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-satoshi font-bold bg-studojo-ink text-white">
                    <FiClock className="w-3 h-3" />
                    {result.timeline_years >= 99 ? "Never" : `~${result.timeline_years} years`}
                  </span>
                  {result.confidence === "low" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-satoshi bg-studojo-surface-muted text-studojo-muted border border-studojo-ink/15">Estimated match</span>
                  )}
                </div>
                <p className={`mt-5 text-sm sm:text-base font-satoshi ${cfg.text} italic max-w-md mx-auto leading-relaxed`}>
                  "{result.verdict}"
                </p>
                <div className="mt-5 rounded-xl bg-white/70 border border-studojo-ink/10 px-4 py-3">
                  <p className="text-xs font-satoshi font-semibold text-studojo-ink">{cfg.urgency}</p>
                </div>
              </div>

              {/* ── TOP CTA ── */}
              <div className="mb-6 rounded-2xl border-2 border-studojo-ink bg-studojo-ink p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-clash text-base font-bold text-white leading-snug">
                    {displayPivots?.[0]?.role
                      ? `Ready to pivot to ${displayPivots[0].role}?`
                      : "Ready to make your move?"}
                  </p>
                  <p className="text-xs font-satoshi text-white/60 mt-0.5">We find the exact hiring managers. Not job board noise.</p>
                </div>
                <button
                  onClick={() => navigate("/outreach/onboarding/upload")}
                  className="flex-shrink-0 flex items-center gap-2 h-10 px-5 rounded-xl bg-studojo-purple text-white font-satoshi font-semibold text-sm border-2 border-white/20 hover:bg-studojo-purple/90 transition-all"
                >
                  Find openings <FiArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* ── RISK / EDGES ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                  <h3 className="font-clash text-sm font-bold text-studojo-ink mb-4">Why AI is coming for this</h3>
                  <ul className="space-y-2.5">
                    {result.risk_drivers.map((d, i) => (
                      <li key={i} className="flex gap-2.5 text-xs font-satoshi text-studojo-muted leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                  <h3 className="font-clash text-sm font-bold text-studojo-ink mb-4">Your human edge</h3>
                  <ul className="space-y-2.5">
                    {result.human_edges.map((e, i) => (
                      <li key={i} className="flex gap-2.5 text-xs font-satoshi text-studojo-muted leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── TIMELINE ── */}
              <div className="mb-6">
                <h3 className="font-clash text-xl font-bold text-studojo-ink mb-4">What happens next</h3>
                <div className="space-y-3">
                  {timelineInsights.map(({ year, insight }, i) => (
                    <div key={i} className="rounded-xl border-2 border-studojo-ink/15 bg-white p-4 flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="inline-block text-xs font-satoshi font-bold text-studojo-purple uppercase tracking-wider whitespace-nowrap bg-studojo-purple/8 px-2 py-1 rounded-lg">{year}</span>
                      </div>
                      <p className="text-xs font-satoshi text-studojo-muted leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── CAREER PIVOT ROADMAP ── */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-clash text-xl font-bold text-studojo-ink">Your pivot roadmap</h3>
                  {pivotsLoading && (
                    <span className="text-xs font-satoshi text-studojo-muted flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-studojo-purple/30 border-t-studojo-purple rounded-full animate-spin inline-block" />
                      Finding best pivots...
                    </span>
                  )}
                </div>
                <p className="text-sm font-satoshi text-studojo-muted mb-5">{cfg.pivotIntro}</p>
                <div className="space-y-4">
                  {pivotsLoading && !displayPivots
                    ? [0, 1, 2].map((i) => <PivotSkeleton key={i} />)
                    : (displayPivots ?? []).map((pivot, i) => (
                        <PivotCard key={i} pivot={pivot} index={i} currentRisk={result.risk_pct} showCTA={true} />
                      ))}
                </div>
              </div>

              {/* ── COMPARISON BAR ── */}
              {displayPivots && displayPivots.length > 0 && (
                <div className="mb-6 rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                  <h3 className="font-clash text-base font-bold text-studojo-ink mb-4">Risk comparison: now vs after pivoting</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-satoshi text-studojo-muted px-2 py-0.5 rounded bg-studojo-surface-muted whitespace-nowrap">Now</span>
                        <span className="text-sm font-satoshi font-semibold text-studojo-ink truncate">{result.matched_title}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <div className="w-24 h-2 rounded-full bg-studojo-ink/8 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${result.risk_pct}%`, backgroundColor: RISK_CONFIG[result.risk_level].arc }} />
                        </div>
                        <span className="text-xs font-satoshi font-bold w-9 text-right" style={{ color: RISK_CONFIG[result.risk_level].arc }}>{result.risk_pct}%</span>
                      </div>
                    </div>
                    {displayPivots.slice(0, 3).map((p) => {
                      const pLevel = p.risk_pct >= 75 ? "critical" : p.risk_pct >= 50 ? "high" : p.risk_pct >= 25 ? "medium" : "low";
                      return (
                        <div key={p.role} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs font-satoshi text-studojo-purple px-2 py-0.5 rounded bg-studojo-purple/8 whitespace-nowrap">Pivot</span>
                            <span className="text-sm font-satoshi text-studojo-ink truncate">{p.role}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <div className="w-24 h-2 rounded-full bg-studojo-ink/8 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.risk_pct}%`, backgroundColor: RISK_CONFIG[pLevel].arc }} />
                            </div>
                            <span className="text-xs font-satoshi font-bold w-9 text-right" style={{ color: RISK_CONFIG[pLevel].arc }}>{p.risk_pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── UPSKILLING ── */}
              <div className="mb-6 rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                <h3 className="font-clash text-base font-bold text-studojo-ink mb-4">Skills to add right now</h3>
                {stayRelevant.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-2">Stay relevant in your current role</p>
                    <ul className="space-y-2">
                      {stayRelevant.map((s, i) => (
                        <li key={i} className="flex gap-2 text-xs font-satoshi text-studojo-ink leading-relaxed">
                          <FiZap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pivotSkills && (
                  <div className="mb-4">
                    <p className="text-xs font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-2">Skills for {pivotSkills.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pivotSkills.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-satoshi font-medium bg-studojo-purple/8 text-studojo-purple border border-studojo-purple/20">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <Link
                  to="/dojos/careers"
                  className="mt-2 flex items-center justify-center gap-2 w-full h-10 rounded-xl border-2 border-studojo-ink bg-studojo-surface-muted text-studojo-ink font-satoshi font-semibold text-sm shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <FiFileText className="w-4 h-4" />
                  Add these skills to your resume, free
                </Link>
              </div>

              {/* ── MID-PAGE OUTREACH CTA ── */}
              <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-ink shadow-brutal p-6 mb-6">
                <h4 className="font-clash text-lg font-bold text-white mb-1">
                  Find {displayPivots?.[0]?.role || "your pivot role"} openings right now
                </h4>
                <p className="text-sm font-satoshi text-white/70 mb-4">
                  We search 50,000+ companies and surface the exact hiring managers for your pivot. Not job board noise.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/outreach")}
                    className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-studojo-purple text-white font-satoshi font-semibold text-sm border-2 border-white/20 transition-all hover:bg-studojo-purple/90"
                  >
                    Browse open roles <FiArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate("/outreach/onboarding/upload")}
                    className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white/10 text-white font-satoshi font-semibold text-sm border-2 border-white/20 transition-all hover:bg-white/20"
                  >
                    Upload resume, get leads
                  </button>
                </div>
              </div>

              {/* ── INLINE CTAS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5 flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-clash text-sm font-bold text-studojo-ink">ATS resume for your pivot</p>
                    <p className="text-xs font-satoshi text-studojo-muted mt-0.5">Free builder. Optimised for {displayPivots?.[0]?.role || "your next role"}.</p>
                  </div>
                  <Link to="/dojos/careers" className="flex items-center gap-1.5 text-xs font-satoshi font-semibold text-emerald-600 hover:underline mt-auto">
                    Build free <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="rounded-2xl border-2 border-studojo-ink bg-emerald-500 shadow-brutal p-5 flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiSearch className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-clash text-sm font-bold text-white">Internships in {displayPivots?.[0]?.role?.split(" ")[0] || "your field"}</p>
                    <p className="text-xs font-satoshi text-white/80 mt-0.5">India, US, UK, UAE and Singapore. Updated weekly.</p>
                  </div>
                  <Link to="/dojos/internships" className="flex items-center gap-1.5 text-xs font-satoshi font-semibold text-white hover:underline mt-auto">
                    Browse now <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* ── FINAL CTA ── */}
              <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple shadow-brutal p-6 text-center">
                <h4 className="font-clash text-xl font-bold text-white mb-2">Ready to land one of these roles?</h4>
                <p className="text-sm font-satoshi text-white/75 mb-5">
                  Upload your resume and we find the exact hiring managers for your pivot right now. No job boards. No noise.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate("/outreach/onboarding/upload")}
                    className="h-11 px-6 rounded-xl bg-white text-studojo-purple font-satoshi font-semibold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2"
                  >
                    Find my leads <FiArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate("/outreach")}
                    className="h-11 px-6 rounded-xl bg-white/15 text-white font-satoshi font-semibold text-sm border-2 border-white/30 transition-all hover:bg-white/25 inline-flex items-center justify-center gap-2"
                  >
                    Browse all openings
                  </button>
                </div>
                <p className="text-xs font-satoshi text-white/50 mt-4">
                  Already on Studojo?{" "}
                  <Link to="/outreach" className="text-white/70 underline hover:text-white">Go to your dashboard</Link>
                </p>
              </div>

            </div>
          </div>
        );
      })()}

      <Footer />
    </div>
  );
}
