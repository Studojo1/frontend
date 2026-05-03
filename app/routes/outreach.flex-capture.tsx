import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { capturePostHog } from "~/lib/posthog";
import { FiArrowRight, FiZap } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

// Role families that the flex prompt copy adapts to. We infer the family
// from the candidate profile (parsed_json.career_analysis.recommended_roles
// or parsed_json.profile_summary). Each family gets sharper prompt copy
// matched to what someone in that role would actually call their work.
type RoleFamily = "engineering" | "marketing" | "sales" | "design" | "product" | "data" | "finance" | "consulting" | "other";

interface FlexCopy {
  artifactLabel: string;
  artifactHint: string;
  artifactPlaceholder: string;
  outcomeLabel: string;
  outcomeHint: string;
  outcomePlaceholder: string;
}

const FLEX_COPY: Record<RoleFamily, FlexCopy> = {
  engineering: {
    artifactLabel: "What's a thing you built that someone actually used?",
    artifactHint: "Tell me what it did and roughly how big the impact was.",
    artifactPlaceholder: "e.g. Built a Telegram bot that auto-summarizes my college's placement-cell announcements — used by 800+ students",
    outcomeLabel: "What's the most concrete number you can share?",
    outcomeHint: "Even rough is fine — '50 users', 'cut weekly work from 5h to 30 min', 'won the hackathon'.",
    outcomePlaceholder: "e.g. ~800 weekly users, runtime cut from 12s to 2s, or shipped to prod after one sprint",
  },
  marketing: {
    artifactLabel: "What's a campaign or growth experiment you ran that worked?",
    artifactHint: "What did you try, who was it aimed at, and what shifted as a result?",
    artifactPlaceholder: "e.g. Ran an Instagram launch campaign for a D2C jewellery brand that took us from 2k to 8k followers in 6 weeks",
    outcomeLabel: "What's the most concrete number you can share?",
    outcomeHint: "Numbers > adjectives — '6x reach', 'CAC dropped from 200 to 80', '40 demos booked'.",
    outcomePlaceholder: "e.g. CAC dropped 60%, 4× engagement, $15k attributed revenue in month one",
  },
  sales: {
    artifactLabel: "What's a deal or partnership you closed (or got close to)?",
    artifactHint: "Who was the buyer, what was the deal, how did you get it across the line?",
    artifactPlaceholder: "e.g. Closed a 20-seat pilot with a Bengaluru SaaS company after 4 months of cold outbound",
    outcomeLabel: "What's the deal size or pipeline number?",
    outcomeHint: "Even rough is fine — 'first paying customer', '$10k MRR added', '3 pilots in pipeline'.",
    outcomePlaceholder: "e.g. ~$8k ARR, became the company's first enterprise reference customer",
  },
  design: {
    artifactLabel: "What's a design project you shipped that someone actually used?",
    artifactHint: "Who used it, and what did it improve for them?",
    artifactPlaceholder: "e.g. Redesigned the onboarding flow for an edtech app — drop-off after step 1 dropped from 50% to 18%",
    outcomeLabel: "What's the most concrete number you can share?",
    outcomeHint: "Even rough — 'drop-off cut in half', 'support tickets fell', 'feature shipped to 50k users'.",
    outcomePlaceholder: "e.g. Activation rate up 32%, 4-week sprint shipped on time, used daily by 12k people",
  },
  product: {
    artifactLabel: "What's a product or feature you shipped (or co-shipped)?",
    artifactHint: "What was it, who was it for, and what changed?",
    artifactPlaceholder: "e.g. Shipped a referral feature for an Indian commerce app that drove 22% of new signups in month one",
    outcomeLabel: "What's the most concrete number you can share?",
    outcomeHint: "Anything quantitative — adoption %, cycle-time cut, revenue moved, NPS shift.",
    outcomePlaceholder: "e.g. 22% of new signups via referral, retention +14%, shipped under a 6-week PRD",
  },
  data: {
    artifactLabel: "What's a data project or analysis you ran that drove a decision?",
    artifactHint: "What did you investigate, what did you find, what changed because of it?",
    artifactPlaceholder: "e.g. Built a churn-prediction model for a fintech client — flagged 12% of accounts for proactive outreach",
    outcomeLabel: "What's the most concrete number you can share?",
    outcomeHint: "Numbers > adjectives — 'identified $2M revenue at risk', 'model accuracy 89%', 'dashboard adopted by 3 teams'.",
    outcomePlaceholder: "e.g. $2M ARR identified at risk, 89% precision, dashboard now used by 3 ops teams",
  },
  finance: {
    artifactLabel: "What's a finance / analysis project you owned?",
    artifactHint: "What was the question, what did you build, what was the call you helped make?",
    artifactPlaceholder: "e.g. Built the financial model for a Series B raise that closed at $30M",
    outcomeLabel: "What's the most concrete number you can share?",
    outcomeHint: "Deal size, valuation moved, cost saved, accuracy hit — anything specific.",
    outcomePlaceholder: "e.g. Raise closed at $30M with 18× revenue multiple, model used in IC pitch",
  },
  consulting: {
    artifactLabel: "What's a project or engagement you delivered that mattered?",
    artifactHint: "What was the client, what did you actually do, what shifted for them?",
    artifactPlaceholder: "e.g. Led a 6-week ops audit for an Indian D2C brand — identified 3 changes that cut fulfilment cost 18%",
    outcomeLabel: "What's the most concrete result you can share?",
    outcomeHint: "Cost saved, time cut, revenue lift, team scaled — anything quantitative.",
    outcomePlaceholder: "e.g. Fulfilment cost down 18%, recommendations adopted within 30 days",
  },
  other: {
    artifactLabel: "What's a project or piece of work you're most proud of?",
    artifactHint: "What was it, who was it for, and what came of it?",
    artifactPlaceholder: "e.g. Organized a city-wide hackathon with 200+ participants and 6 sponsor companies",
    outcomeLabel: "What's the most concrete result you can share?",
    outcomeHint: "Even one number is fine — '200 participants', '4 jobs from it', 'featured in YourStory'.",
    outcomePlaceholder: "e.g. 200 participants, 6 sponsors, raised ₹2L; featured on YourStory",
  },
};

// Heuristic: map a string of role / summary text to a role family.
// Order matters — more specific patterns first.
function detectRoleFamily(text: string): RoleFamily {
  const t = text.toLowerCase();
  if (/\b(engineer|developer|backend|frontend|full[- ]?stack|sre|devops|architect|sde|swe|programmer|coder|ml engineer)\b/.test(t)) {
    return "engineering";
  }
  if (/\b(data scientist|data analyst|analytics|business intelligence|bi |ml engineer|machine learning)\b/.test(t)) {
    return "data";
  }
  if (/\b(product manager|product management|product owner|associate pm|apm|group product)\b/.test(t)) {
    return "product";
  }
  if (/\b(designer|design lead|ux|ui[/ ]ux|product designer|visual designer)\b/.test(t)) {
    return "design";
  }
  if (/\b(growth|marketing|brand|content|seo|sem|paid|performance marketing|gtm|go[- ]to[- ]market)\b/.test(t)) {
    return "marketing";
  }
  if (/\b(sales|account executive|business development|bdr|sdr|account manager|partnerships)\b/.test(t)) {
    return "sales";
  }
  if (/\b(financ|investment|valuation|equity research|fp&a|m&a|private equity|venture capital|ib analyst|investment banking)\b/.test(t)) {
    return "finance";
  }
  if (/\b(consultant|consulting|strategy|advisory|management consult)\b/.test(t)) {
    return "consulting";
  }
  return "other";
}

interface CandidateProfileResp {
  parsed_json?: {
    profile_summary?: string;
    career_analysis?: {
      primary_cluster?: string;
      recommended_roles?: Array<{ title?: string }>;
    };
  } | null;
  target_roles?: string[] | null;
}

export default function FlexCapturePage() {
  const navigate = useNavigate();
  const { candidateId } = useOutreachStore();

  const [bestProject, setBestProject] = useState("");
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [roleFamily, setRoleFamily] = useState<RoleFamily>("other");

  // Load the candidate profile and infer role family for adaptive prompts.
  useEffect(() => {
    let cancelled = false;
    if (!candidateId) return;
    (async () => {
      try {
        const profile = (await outreachFetch(`/candidate/${candidateId}/profile`)) as CandidateProfileResp;
        if (cancelled) return;
        const parts: string[] = [];
        const parsed = profile?.parsed_json || {};
        const career = parsed.career_analysis || {};
        if (career.primary_cluster) parts.push(career.primary_cluster);
        if (career.recommended_roles) {
          for (const r of career.recommended_roles) {
            if (r?.title) parts.push(r.title);
          }
        }
        if (profile?.target_roles) parts.push(...profile.target_roles);
        if (parsed.profile_summary) parts.push(parsed.profile_summary);
        const detected = detectRoleFamily(parts.join(" "));
        setRoleFamily(detected);
      } catch {
        // Non-blocking — fall back to "other"
      }
    })();
    return () => { cancelled = true; };
  }, [candidateId]);

  const copy = FLEX_COPY[roleFamily];

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
      capturePostHog("flex_captured", {
        candidate_id: candidateId,
        has_project: !!bestProject.trim(),
        has_outcome: !!outcome.trim(),
        role_family: roleFamily,
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
          {/* Question 1 — adapts to role family */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <label className="block text-sm font-bold font-satoshi text-studojo-ink mb-1">
              {copy.artifactLabel}
            </label>
            <p className="text-xs text-studojo-muted font-satoshi mb-3">{copy.artifactHint}</p>
            <textarea
              value={bestProject}
              onChange={(e) => setBestProject(e.target.value.slice(0, 240))}
              placeholder={copy.artifactPlaceholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple resize-none placeholder:text-studojo-muted/60"
            />
            <p className="text-xs text-studojo-muted/60 font-satoshi mt-1 text-right">{bestProject.length}/240</p>
          </div>

          {/* Question 2 — also adapts */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
            <label className="block text-sm font-bold font-satoshi text-studojo-ink mb-1">
              {copy.outcomeLabel}
            </label>
            <p className="text-xs text-studojo-muted font-satoshi mb-3">{copy.outcomeHint}</p>
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value.slice(0, 180))}
              placeholder={copy.outcomePlaceholder}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple resize-none placeholder:text-studojo-muted/60"
            />
            <p className="text-xs text-studojo-muted/60 font-satoshi mt-1 text-right">{outcome.length}/180</p>
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
