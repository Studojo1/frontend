import { useState } from "react";
import { useNavigate } from "react-router";
import { FiArrowRight, FiZap } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

export default function FlexCapturePage() {
  const navigate = useNavigate();
  const { candidateId } = useOutreachStore();

  const [bestProject, setBestProject] = useState("");
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!bestProject.trim()) {
      setError("Please describe your project. Even one sentence helps a lot.");
      return;
    }
    if (!candidateId) {
      navigate("/outreach/enrichment");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await outreachFetch(`/candidate/${candidateId}/flex`, {
        method: "PUT",
        body: JSON.stringify({
          best_project: bestProject.trim(),
          outcome: outcome.trim(),
        }),
      });
    } catch {
      // Non-blocking — if it fails we still proceed, emails fall back to resume parse
    } finally {
      navigate("/outreach/enrichment");
    }
  };

  const handleSkip = () => {
    navigate("/outreach/enrichment");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-12 md:px-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
            <FiZap className="w-5 h-5" />
          </div>
          <span className="text-xs font-satoshi font-bold text-studojo-purple uppercase tracking-wider">Email Personalisation</span>
        </div>

        <h1 className="font-clash text-2xl font-bold text-studojo-ink mt-3 mb-1">
          What can we flex in your emails?
        </h1>
        <p className="text-sm text-studojo-muted font-satoshi mb-8">
          Two quick questions. This is what the AI uses to write your outreach. The more specific you are, the better your emails convert.
        </p>

        <div className="space-y-6">
          {/* Question 1 */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <label className="block text-sm font-bold font-satoshi text-studojo-ink mb-1">
              Describe your best project or experience in 1-2 sentences
            </label>
            <p className="text-xs text-studojo-muted font-satoshi mb-3">What did you build or do, and who was it for?</p>
            <textarea
              value={bestProject}
              onChange={(e) => setBestProject(e.target.value.slice(0, 200))}
              placeholder="e.g. Built an automated reporting tool for a fashion brand that cut weekly manual work from 5 hours to 20 minutes"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple resize-none placeholder:text-studojo-muted/60"
            />
            <p className="text-xs text-studojo-muted/60 font-satoshi mt-1 text-right">{bestProject.length}/200</p>
          </div>

          {/* Question 2 */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <label className="block text-sm font-bold font-satoshi text-studojo-ink mb-1">
              What was the result or impact?
            </label>
            <p className="text-xs text-studojo-muted font-satoshi mb-3">Numbers, reactions, or outcomes. Anything concrete.</p>
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value.slice(0, 150))}
              placeholder="e.g. The client renewed and referred two others, or grew Instagram from 2k to 8k followers in 3 months"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple resize-none placeholder:text-studojo-muted/60"
            />
            <p className="text-xs text-studojo-muted/60 font-satoshi mt-1 text-right">{outcome.length}/150</p>
          </div>

          {error && <p className="text-red-600 text-sm font-satoshi">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-12 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Save & Continue <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <button
              onClick={handleSkip}
              className="px-5 h-12 rounded-2xl border-2 border-studojo-ink/20 text-sm font-satoshi text-studojo-muted hover:border-studojo-ink transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
