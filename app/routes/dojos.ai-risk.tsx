'use client';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  FiArrowRight, FiRefreshCw, FiAlertTriangle, FiShield,
  FiClock, FiTrendingUp, FiSearch,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { analyseJob, getRiskLevel } from "~/lib/ai-risk/engine";
import type { AnalysisResult } from "~/lib/ai-risk/engine";

const BASE_URL = "https://studojo.com";

export function meta() {
  const title = "Will AI Replace Your Job? | Studojo";
  const description =
    "Find out if AI will replace your job, when, and exactly what career moves to make to stay ahead. Free AI job risk assessment.";
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/dojos/ai-risk` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: `${BASE_URL}/dojos/ai-risk` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-default.png` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@studojo" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: `${BASE_URL}/og-default.png` },
  ];
}

const EXAMPLES = [
  "Accountant", "Software Engineer", "Nurse", "Copywriter",
  "Data Scientist", "Teacher", "Loan Officer", "AI Engineer",
];

const RISK_CONFIG = {
  critical: { label: "CRITICAL RISK", bg: "bg-red-50", border: "border-red-200", text: "text-red-600", pill: "bg-red-100 text-red-700 border-red-200", arc: "#ef4444" },
  high:     { label: "HIGH RISK",     bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", pill: "bg-orange-100 text-orange-700 border-orange-200", arc: "#f97316" },
  medium:   { label: "MEDIUM RISK",   bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", pill: "bg-amber-100 text-amber-700 border-amber-200", arc: "#eab308" },
  low:      { label: "LOW RISK",      bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", pill: "bg-emerald-100 text-emerald-700 border-emerald-200", arc: "#10b981" },
};

// Semi-circle gauge — 180° arc
function RiskGauge({ pct, animated, level }: { pct: number; animated: boolean; level: keyof typeof RISK_CONFIG }) {
  const r = 80;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * r; // half-circle
  const offset = animated ? circumference * (1 - pct / 100) : circumference;
  const color = RISK_CONFIG[level].arc;

  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[280px] mx-auto">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: animated ? "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)" : "none" }}
      />
      {/* Percentage */}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        className="font-clash"
        fontSize="32"
        fontWeight="800"
        fill={color}
        fontFamily="'Clash Display', sans-serif"
      >
        {pct}%
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontSize="11"
        fill="#94a3b8"
        fontFamily="'Satoshi', sans-serif"
      >
        replacement risk
      </text>
    </svg>
  );
}

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= level ? "bg-studojo-purple" : "bg-studojo-ink/15"}`}
        />
      ))}
    </div>
  );
}

function PivotCard({ pivot }: { pivot: AnalysisResult["pivots"][number] }) {
  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5 flex flex-col gap-3">
      <div>
        <h4 className="font-clash text-base font-bold text-studojo-ink mb-1">{pivot.role}</h4>
        <p className="text-xs font-satoshi text-studojo-muted leading-relaxed">{pivot.why}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {pivot.skills.map((s) => (
          <span
            key={s}
            className="px-2 py-0.5 rounded-md text-[11px] font-satoshi font-medium bg-studojo-purple/8 text-studojo-purple border border-studojo-purple/20"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-studojo-ink/8">
        <div className="flex items-center gap-1.5 text-studojo-muted">
          <FiClock className="w-3.5 h-3.5" />
          <span className="text-xs font-satoshi">{pivot.timeline}</span>
        </div>
        <DifficultyDots level={pivot.difficulty} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function AIRiskPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [gaugeAnimated, setGaugeAnimated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAnalyse = async (value?: string) => {
    const q = (value ?? input).trim();
    if (!q) return;
    setInput(q);
    setAnalyzing(true);
    setResult(null);
    setGaugeAnimated(false);
    await new Promise((r) => setTimeout(r, 1200));
    const res = analyseJob(q);
    setResult(res);
    setAnalyzing(false);
    setTimeout(() => setGaugeAnimated(true), 80);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setResult(null);
    setInput("");
    setGaugeAnimated(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Submit on Enter
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyse();
  };

  const cfg = result ? RISK_CONFIG[result.risk_level] : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* ── INPUT SCREEN ── */}
      {!result && !analyzing && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
          <div className="w-full max-w-xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-studojo-purple/8 border border-studojo-purple/20 mb-6">
              <span className="text-xs font-satoshi font-semibold text-studojo-purple">AI Displacement Index</span>
            </div>

            <h1 className="font-clash text-4xl sm:text-5xl font-bold text-studojo-ink mb-4 leading-tight">
              Will AI replace<br />your job?
            </h1>
            <p className="text-base sm:text-lg font-satoshi text-studojo-muted mb-8 max-w-md mx-auto">
              Get your risk score, timeline, and a full career roadmap. In seconds.
            </p>

            {/* Input */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-studojo-muted pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="e.g. Accountant, Software Engineer, Nurse…"
                autoFocus
                className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-studojo-ink text-studojo-ink font-satoshi text-base bg-white focus:outline-none focus:ring-4 focus:ring-studojo-purple/20 placeholder:text-studojo-muted/60"
              />
            </div>

            <button
              onClick={() => handleAnalyse()}
              disabled={!input.trim()}
              className="w-full h-13 px-8 py-3.5 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-brutal inline-flex items-center justify-center gap-2"
            >
              Analyse my job <FiArrowRight className="w-4 h-4" />
            </button>

            {/* Example chips */}
            <div className="mt-8">
              <p className="text-xs font-satoshi text-studojo-muted mb-3">Try an example:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => handleAnalyse(ex)}
                    className="px-3 py-1.5 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi text-studojo-ink hover:bg-studojo-surface-muted hover:border-studojo-ink/40 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {analyzing && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="w-12 h-12 border-[3px] border-studojo-purple/20 border-t-studojo-purple rounded-full animate-spin" />
          <p className="font-satoshi text-studojo-muted text-sm">Analysing <span className="font-semibold text-studojo-ink">"{input}"</span>…</p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {result && cfg && !analyzing && (
        <div className="flex-1 px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-2xl">

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-studojo-muted text-sm font-satoshi hover:text-studojo-ink mb-8 transition-colors"
            >
              <FiRefreshCw className="w-3.5 h-3.5" /> Try another job
            </button>

            {/* ── HERO SECTION ── */}
            <div className={`rounded-3xl border-2 ${cfg.border} ${cfg.bg} p-6 sm:p-8 text-center mb-6`}>
              <p className="text-sm font-satoshi text-studojo-muted mb-1">You searched for:</p>
              <h2 className="font-clash text-2xl sm:text-3xl font-bold text-studojo-ink mb-6">{result.matched_title}</h2>

              {/* Gauge */}
              <RiskGauge pct={result.risk_pct} animated={gaugeAnimated} level={result.risk_level} />

              {/* Pills */}
              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-satoshi font-bold border ${cfg.pill}`}>
                  {cfg.label}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-satoshi font-bold bg-studojo-ink text-white">
                  <FiClock className="w-3 h-3" />
                  {result.timeline_years >= 99 ? "Never" : `~${result.timeline_years} years`}
                </span>
                {result.confidence === "low" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-satoshi bg-studojo-surface-muted text-studojo-muted border border-studojo-ink/15">
                    Estimated match
                  </span>
                )}
              </div>

              {/* Verdict */}
              <p className={`mt-5 text-sm sm:text-base font-satoshi ${cfg.text} italic max-w-md mx-auto leading-relaxed`}>
                "{result.verdict}"
              </p>
            </div>

            {/* ── WHY / EDGES ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Risk drivers */}
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                    <FiAlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="font-clash text-sm font-bold text-studojo-ink">Why AI is coming for this</h3>
                </div>
                <ul className="space-y-2.5">
                  {result.risk_drivers.map((d, i) => (
                    <li key={i} className="flex gap-2.5 text-xs font-satoshi text-studojo-muted leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Human edges */}
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                    <FiShield className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="font-clash text-sm font-bold text-studojo-ink">Your human edge</h3>
                </div>
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

            {/* ── ROADMAP ── */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FiTrendingUp className="w-5 h-5 text-studojo-purple" />
                <h3 className="font-clash text-xl font-bold text-studojo-ink">Your career roadmap</h3>
              </div>
              <p className="text-sm font-satoshi text-studojo-muted mb-5">
                Roles to move into, ranked by how quickly you can get there.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.pivots.map((pivot, i) => (
                  <PivotCard key={i} pivot={pivot} />
                ))}
              </div>
            </div>

            {/* ── CTA ── */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple shadow-brutal p-6 text-center">
              <h4 className="font-clash text-xl font-bold text-white mb-2">
                Ready to land one of these roles?
              </h4>
              <p className="text-sm font-satoshi text-white/75 mb-5">
                Upload your resume and we'll find the exact decision makers hiring for your pivot role right now.
              </p>
              <button
                onClick={() => navigate("/outreach/onboarding/upload")}
                className="h-11 px-6 rounded-xl bg-white text-studojo-purple font-satoshi font-semibold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center gap-2"
              >
                Find my leads <FiArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
