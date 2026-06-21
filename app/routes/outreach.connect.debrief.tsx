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
  whyNow: string,
  dreamCompany: string,
  targetRole: string,
) {
  const projectSlot = bestProject.trim() || null;
  const outcomeSlot = outcome.trim() || null;
  const whySlot = whyNow.trim() || null;
  const role = targetRole || "this role";
  const company = dreamCompany || "your target company";

  return {
    subject: `Quick note: ${role} at ${company}`,
    projectSlot,
    outcomeSlot,
    whySlot,
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
  const [whyNow, setWhyNow] = useState("");
  const [saving, setSaving] = useState(false);

  const preview = buildPreviewEmail(bestProject, outcome, whyNow, dreamCompany, targetRole);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (candidateId) {
        await outreachFetch(`/candidate/${candidateId}/flex-notes`, {
          method: "PATCH",
          body: JSON.stringify({
            best_project: bestProject.trim(),
            outcome: outcome.trim(),
            why_now: whyNow.trim(),
          }),
        });
      }
    } catch {
      // non-blocking — don't stop the flow if save fails
    }
    navigate("/outreach/campaign/style-pick");
  };

  const handleSkip = () => navigate("/outreach/campaign/style-pick");

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
                  Your best project
                </label>
              </div>
              <p className="font-satoshi text-xs text-studojo-muted mb-3">
                What did you build, for whom, and what made it technically interesting?
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
                  The number that proves it
                </label>
              </div>
              <p className="font-satoshi text-xs text-studojo-muted mb-3">
                A single metric makes the email 3x more credible. Even rough estimates work.
              </p>
              <textarea
                rows={2}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Reduced report generation time from 4 hours to 20 minutes…"
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
                  Why {targetRole} specifically?
                </label>
              </div>
              <p className="font-satoshi text-xs text-studojo-muted mb-3">
                One sentence. Why this role, not just any role?
              </p>
              <textarea
                rows={2}
                value={whyNow}
                onChange={(e) => setWhyNow(e.target.value)}
                placeholder="I want to move from building dashboards to owning the data strategy behind them…"
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

                  <p>
                    I came across {preview.company} while researching companies doing interesting work in this space, and I wanted to reach out directly.
                  </p>

                  <p>
                    <Slot
                      filled={preview.projectSlot}
                      placeholder="[describe your best project, what you built and for whom]"
                    />
                    {preview.projectSlot && preview.outcomeSlot ? " " : ""}
                    <Slot
                      filled={preview.outcomeSlot}
                      placeholder="[the measurable result it drove]"
                    />
                  </p>

                  <p>
                    I'm specifically targeting {preview.role} roles because{" "}
                    <Slot
                      filled={preview.whySlot}
                      placeholder="[your reason, one sentence]"
                    />
                    .
                  </p>

                  <p>
                    Would you be open to a 15-minute call to explore if there's a fit? Happy to share more context on my work.
                  </p>

                  <p className="text-studojo-muted">Best,<br />[Your name]</p>
                </div>

                {/* Hint */}
                {!preview.projectSlot && !preview.outcomeSlot && !preview.whySlot && (
                  <div className="mt-4 bg-amber-50 rounded-xl border-2 border-amber-200 px-4 py-3">
                    <p className="font-satoshi text-xs text-amber-700">
                      Fill in the fields on the left and watch your email come to life.
                    </p>
                  </div>
                )}

                {preview.projectSlot && preview.outcomeSlot && preview.whySlot && (
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
