import { useState } from "react";
import { useNavigate } from "react-router";
import { FiArrowRight, FiSkipForward } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

function buildPreviewEmail(
  bestProject: string,
  outcome: string,
  workPrinciple: string,
  dreamCompany: string,
  targetRole: string,
) {
  const projectSlot = bestProject.trim() || null;
  const outcomeSlot = outcome.trim() || null;
  const principleSlot = workPrinciple.trim() || null;
  const role = targetRole || "this role";
  const company = dreamCompany || "your target company";

  return {
    // The real subject line the backend sends: lowercase, casual, no company name.
    subject: "quick question [First Name]",
    projectSlot,
    outcomeSlot,
    principleSlot,
    role,
    company,
  };
}

type SlotProps = { filled: string | null; placeholder: string };

function Slot({ filled, placeholder }: SlotProps) {
  if (filled) {
    return (
      <span className="text-emerald-700 font-medium transition-colors duration-300">
        {filled}
      </span>
    );
  }
  return (
    <span className="text-amber-600 bg-amber-50 rounded px-1 italic text-sm">
      {placeholder}
    </span>
  );
}

export default function DebriefPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, profileData } = useOutreachStore();

  const dreamCompany =
    profileData?.dream_companies?.[0] ||
    profileData?.parsed_json?.dream_companies?.[0] ||
    "your dream company";
  const targetRole =
    profileData?.target_role ||
    profileData?.parsed_json?.target_role ||
    "the role";

  const [bestProject, setBestProject] = useState("");
  const [outcome, setOutcome] = useState("");
  const [workPrinciple, setWorkPrinciple] = useState("");
  const [saving, setSaving] = useState(false);

  const preview = buildPreviewEmail(bestProject, outcome, workPrinciple, dreamCompany, targetRole);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (candidateId) {
        await outreachFetch(`/candidate/${candidateId}/flex-notes`, {
          method: "PATCH",
          body: JSON.stringify({
            best_project: bestProject.trim(),
            outcome: outcome.trim(),
            work_principle: workPrinciple.trim(),
          }),
        });
      }
    } catch {
      // non-blocking — don't stop the flow if save fails
    }
    navigate("/outreach/campaign/setup");
  };

  const handleSkip = () => navigate("/outreach/campaign/setup");

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

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mb-2">
            Make your emails <span className="text-studojo-purple">impossible to ignore</span>
          </h1>
          <p className="font-satoshi text-base text-studojo-muted max-w-xl mx-auto">
            Three sentences. That's all it takes to turn a generic email into one that hiring managers actually reply to.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Left — input fields */}
          <div className="lg:col-span-2 space-y-4">
            {/* Field 1 */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-studojo-purple text-white text-xs font-bold font-clash flex items-center justify-center">
                  1
                </span>
                <label className="font-clash text-base font-bold text-studojo-ink">
                  The closest thing you've made to {targetRole} work
                </label>
              </div>
              <p className="font-satoshi text-xs text-studojo-muted mb-3">
                What's one thing you made or ran that's closest to the work you want to do? Name the actual thing.
              </p>
              <textarea
                rows={3}
                value={bestProject}
                onChange={(e) => setBestProject(e.target.value)}
                placeholder="Built a real-time inventory dashboard for 200+ SKUs that cut stockouts by 40%…"
                className="w-full resize-none rounded-xl border-2 border-studojo-ink/30 bg-studojo-surface-muted px-3 py-2.5 font-satoshi text-sm text-studojo-ink placeholder:text-studojo-muted/50 focus:border-studojo-purple focus:outline-none transition-colors"
              />
            </div>

            {/* Field 2 */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-studojo-purple text-white text-xs font-bold font-clash flex items-center justify-center">
                  2
                </span>
                <label className="font-clash text-base font-bold text-studojo-ink">
                  How far did you take it?
                </label>
              </div>
              <p className="font-satoshi text-xs text-studojo-muted mb-3">
                How many people it reached, or what you actually built or produced. A number if you have one, plain words if you don't.
              </p>
              <textarea
                rows={2}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Shipped it to 200 users, or: built the whole ingestion pipeline end to end…"
                className="w-full resize-none rounded-xl border-2 border-studojo-ink/30 bg-studojo-surface-muted px-3 py-2.5 font-satoshi text-sm text-studojo-ink placeholder:text-studojo-muted/50 focus:border-studojo-purple focus:outline-none transition-colors"
              />
            </div>

            {/* Field 3 */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-studojo-purple text-white text-xs font-bold font-clash flex items-center justify-center">
                  3
                </span>
                <label className="font-clash text-base font-bold text-studojo-ink">
                  What did you do differently that made it work?
                </label>
              </div>
              <p className="font-satoshi text-xs text-studojo-muted mb-3">
                The one choice or trick, not the whole process.
              </p>
              <textarea
                rows={2}
                value={workPrinciple}
                onChange={(e) => setWorkPrinciple(e.target.value)}
                placeholder="I batched the reviews by clause type instead of by vendor, so one read covered thirty agreements…"
                className="w-full resize-none rounded-xl border-2 border-studojo-ink/30 bg-studojo-surface-muted px-3 py-2.5 font-satoshi text-sm text-studojo-ink placeholder:text-studojo-muted/50 focus:border-studojo-purple focus:outline-none transition-colors"
              />
            </div>

            {/* CTAs */}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full h-12 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Launch my campaign
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="w-full h-10 rounded-2xl bg-white text-studojo-muted font-satoshi text-sm border-2 border-studojo-ink/20 transition-all hover:border-studojo-ink hover:text-studojo-ink flex items-center justify-center gap-2"
            >
              <FiSkipForward className="w-3.5 h-3.5" />
              Skip, launch with my profile details only
            </button>

            <p className="font-satoshi text-xs text-studojo-purple font-bold text-center">
              Skipping means your emails will be generic. We strongly recommend filling this in.
            </p>
          </div>

          {/* Right — live email preview */}
          <div className="lg:col-span-3 sticky top-8">
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
              {/* Email client chrome */}
              <div className="bg-studojo-surface-muted border-b-2 border-studojo-ink px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500" />
                </div>
                <div className="flex-1 bg-white rounded-lg border border-studojo-ink/20 px-3 py-1">
                  <p className="font-satoshi text-xs text-studojo-muted truncate">
                    New message to {preview.company}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Email meta */}
                <div className="space-y-1.5 pb-4 border-b border-studojo-ink/10">
                  <div className="flex items-baseline gap-2">
                    <span className="font-satoshi text-xs text-studojo-muted w-12 flex-shrink-0">To:</span>
                    <span className="font-satoshi text-sm text-studojo-ink">
                      hiring@{preview.company.toLowerCase().replace(/\s+/g, "")}.com
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-satoshi text-xs text-studojo-muted w-12 flex-shrink-0">Subject:</span>
                    <span className="font-satoshi text-sm font-bold text-studojo-ink">{preview.subject}</span>
                  </div>
                </div>

                {/* Email body */}
                <div className="font-satoshi text-sm text-studojo-ink leading-relaxed space-y-3">
                  <p>Hi [First Name],</p>

                  <p className="text-studojo-muted italic">
                    [we research this person and open with something true only of them]
                  </p>

                  <p>
                    <Slot
                      filled={preview.projectSlot}
                      placeholder="[the closest thing you've made to this work]"
                    />
                    {preview.projectSlot && preview.outcomeSlot ? " " : ""}
                    <Slot
                      filled={preview.outcomeSlot}
                      placeholder="[how far you took it]"
                    />
                    {preview.outcomeSlot && preview.principleSlot ? " " : ""}
                    <Slot
                      filled={preview.principleSlot}
                      placeholder="[the one choice that made it work]"
                    />
                  </p>

                  <p>
                    Would you know if there's an opening, or who I should reach out to?
                  </p>

                  <p className="text-studojo-muted">Best,<br />[Your name]</p>
                </div>

                {/* Hint */}
                {!preview.projectSlot && !preview.outcomeSlot && !preview.principleSlot && (
                  <div className="mt-4 bg-amber-50 rounded-xl border-2 border-amber-200 px-4 py-3">
                    <p className="font-satoshi text-xs text-amber-700">
                      Fill in the fields on the left and watch your email come to life.
                    </p>
                  </div>
                )}

                {preview.projectSlot && preview.outcomeSlot && preview.principleSlot && (
                  <div className="mt-4 bg-studojo-green-bg rounded-xl border-2 border-studojo-ink/20 px-4 py-3">
                    <p className="font-satoshi text-xs text-studojo-green font-bold">
                      This email is ready to send.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="font-satoshi text-xs text-studojo-muted text-center mt-3">
              Will personalise this further for each company and contact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
