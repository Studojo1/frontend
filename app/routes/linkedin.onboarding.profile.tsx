import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FiBriefcase, FiMapPin, FiTrendingUp, FiCheckCircle, FiArrowRight, FiAlertCircle, FiLinkedin } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const COMPANY_STAGES = [
  { id: "early-stage", label: "Early-stage startups", desc: "Seed / Series A · 1-50 people" },
  { id: "growth", label: "Growth-stage", desc: "Series B+ · 50-500 people" },
  { id: "mid-market", label: "Mid-market", desc: "500-5000 people · proven companies" },
  { id: "enterprise", label: "Big tech / enterprise", desc: "5000+ · MNCs, FAANG, unicorns" },
  { id: "any", label: "I'm open", desc: "Mix everything — surprise me" },
];

export default function LinkedInProfile() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { candidateId } = useOutreachStore();

  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState("any");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Bounce back if no candidate yet
  useEffect(() => {
    if (!candidateId) {
      const t = setTimeout(() => navigate("/linkedin/onboarding/upload"), 200);
      return () => clearTimeout(t);
    }
  }, [candidateId, navigate]);

  const submit = async () => {
    if (!candidateId) return;
    if (!targetRole.trim()) {
      setError("Tell us what role you're going after.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // The candidate profile already has target_roles set from resume parsing.
      // We try to override them with the user's typed answer via the existing
      // flex-notes mechanism (used by /outreach/onboarding to capture extra
      // preferences). If the endpoint isn't available we just keep the
      // resume-derived targeting — the user is never blocked.
      await outreachFetch(`/candidate/${candidateId}/flex`, {
        method: "PUT",
        body: JSON.stringify({
          flex_notes: {
            target_role_user_input: targetRole.trim(),
            location_user_input: location.trim() || null,
            company_stage_user_input: stage,
            source: "linkedin_onboarding",
          },
        }),
      }).catch(() => {/* non-fatal */});

      navigate("/linkedin/leads/discovery");
    } catch (e: any) {
      setError(e?.body?.detail || e.message || "Couldn't continue — try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-satoshi bg-[#0a66c2]/10 text-[#0a66c2] border-2 border-[#0a66c2]/25 mb-4">
            <FiLinkedin className="w-3.5 h-3.5" /> STEP 2 OF 3
          </span>
          <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mb-2">Three quick questions.</h1>
          <p className="text-base text-studojo-muted font-satoshi">We'll match you with the right hiring managers.</p>
        </div>

        <div className="space-y-6">
          {/* Q1 — target role */}
          <div>
            <label className="block mb-2">
              <span className="text-xs font-bold font-satoshi text-studojo-ink uppercase tracking-wide">What role are you going for?</span>
              <span className="block text-xs text-studojo-muted font-satoshi mt-0.5">e.g. "Product Manager", "Marketing Intern" — comma-separate up to 3.</span>
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studojo-muted" />
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Product Manager, Growth Marketing Intern"
                className="w-full border-2 border-studojo-ink/20 rounded-xl pl-10 pr-4 py-3 text-sm font-satoshi focus:outline-none focus:border-studojo-purple"
              />
            </div>
          </div>

          {/* Q2 — location */}
          <div>
            <label className="block mb-2">
              <span className="text-xs font-bold font-satoshi text-studojo-ink uppercase tracking-wide">Where? <span className="text-studojo-muted normal-case font-normal">(optional)</span></span>
              <span className="block text-xs text-studojo-muted font-satoshi mt-0.5">City, country, or just "remote".</span>
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studojo-muted" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bangalore, India · or remote"
                className="w-full border-2 border-studojo-ink/20 rounded-xl pl-10 pr-4 py-3 text-sm font-satoshi focus:outline-none focus:border-studojo-purple"
              />
            </div>
          </div>

          {/* Q3 — company stage */}
          <div>
            <label className="block mb-3">
              <span className="text-xs font-bold font-satoshi text-studojo-ink uppercase tracking-wide">What type of companies?</span>
              <span className="block text-xs text-studojo-muted font-satoshi mt-0.5">We'll bias your matches accordingly.</span>
            </label>
            <div className="space-y-2">
              {COMPANY_STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStage(s.id)}
                  className={`w-full text-left rounded-xl border-2 p-3.5 flex items-start gap-3 transition-colors ${
                    stage === s.id
                      ? "border-studojo-purple bg-studojo-purple-bg/30"
                      : "border-studojo-ink/15 bg-white hover:border-studojo-ink/40"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 ${stage === s.id ? "bg-studojo-purple border-studojo-purple" : "border-studojo-ink/30"}`}>
                    {stage === s.id && <FiCheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold font-satoshi text-studojo-ink">{s.label}</p>
                    <p className="text-xs text-studojo-muted font-satoshi mt-0.5">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border-2 border-red-200 bg-red-50 p-3 flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-satoshi text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={submit}
          disabled={saving || !targetRole.trim()}
          className="mt-8 w-full h-12 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding your matches…</>
          ) : (
            <><FiTrendingUp className="w-4 h-4" /> Find my hiring managers <FiArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
      <Footer />
    </div>
  );
}
