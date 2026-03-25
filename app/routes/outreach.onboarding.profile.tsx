import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiUser, FiMapPin, FiBriefcase, FiTarget, FiZap,
  FiArrowRight, FiAward,
} from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { ProgressSteps } from "~/components/outreach/ProgressSteps";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const DIM_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  analytical: { bar: "bg-studojo-purple", bg: "bg-studojo-purple/12", text: "text-studojo-purple" },
  creative: { bar: "bg-studojo-orange", bg: "bg-studojo-orange/12", text: "text-studojo-orange" },
  execution: { bar: "bg-studojo-green", bg: "bg-studojo-green/12", text: "text-studojo-green" },
  social: { bar: "bg-studojo-pink", bg: "bg-studojo-pink/12", text: "text-studojo-pink" },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId } = useOutreachStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !candidateId) return;

    let retries = 0;
    const maxRetries = 3;

    const fetchProfile = () => {
      outreachFetch<{ parsed_json: any }>(`/candidate/${candidateId}/profile`)
        .then((data) => {
          const parsed = data?.parsed_json;
          if (parsed?.profile_summary || parsed?.career_analysis) {
            setProfile(data);
            setLoading(false);
          } else if (retries < maxRetries) {
            retries++;
            setTimeout(fetchProfile, 2000);
          } else {
            setProfile(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          setError(err?.body?.detail || err.message || "Failed to load profile");
          setLoading(false);
        });
    };

    fetchProfile();
  }, [candidateId, authLoading]);

  if (!candidateId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 text-center">
          <p className="text-base text-studojo-muted mt-8 font-satoshi">Please complete the chat first.</p>
          <button
            onClick={() => navigate("/outreach/onboarding/chat")}
            className="mt-6 h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Go to Chat
          </button>
        </div>
      </div>
    );
  }

  const parsed = profile?.parsed_json || {};
  const personalInfo = parsed.personal_info || {};
  const preferences = parsed.preferences || {};
  const career = parsed.career_analysis || {};
  const psych = (profile as any)?.psychometric || null;
  const skills = personalInfo.skills_detected || [];
  const name = personalInfo.name || personalInfo.full_name || "";
  const initials = name
    ? name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-studojo-surface-muted/50">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <ProgressSteps steps={["Upload Resume", "AI Chat", "Your Profile"]} currentStep={3} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-studojo-purple/20 border-t-studojo-purple rounded-full animate-spin mb-4" />
            <p className="text-sm text-studojo-muted font-satoshi">Building your profile...</p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-red-600 font-satoshi">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-5 animate-fade-in">

            {/* ── Hero card ──────────────────────────────────────────── */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
              {/* Purple accent bar */}
              <div className="h-2 bg-gradient-to-r from-studojo-purple via-studojo-pink to-studojo-orange" />

              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-studojo-purple to-studojo-pink flex items-center justify-center flex-shrink-0 border-2 border-studojo-ink">
                    <span className="text-white font-clash font-bold text-lg">{initials}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {name && (
                      <h1 className="font-clash text-xl font-bold text-studojo-ink truncate">{name}</h1>
                    )}
                    {parsed.profile_summary && (
                      <p className="text-sm text-studojo-muted font-satoshi mt-1 leading-relaxed line-clamp-3">
                        {parsed.profile_summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  {preferences.locations?.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studojo-surface-muted text-xs font-satoshi text-studojo-muted">
                      <FiMapPin className="w-3 h-3" />
                      {preferences.locations.slice(0, 2).join(", ")}
                    </span>
                  )}
                  {preferences.industry_interests?.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studojo-surface-muted text-xs font-satoshi text-studojo-muted">
                      <BsBuilding className="w-3 h-3" />
                      {preferences.industry_interests.slice(0, 2).join(", ")}
                    </span>
                  )}
                  {psych?.confidence_score != null && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studojo-green-bg text-xs font-satoshi font-semibold text-studojo-green border border-studojo-green/20">
                      <FiAward className="w-3 h-3" />
                      {Math.round(psych.confidence_score)}% match confidence
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Two-column grid ────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Skills */}
              {skills.length > 0 && (
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-studojo-purple-bg flex items-center justify-center">
                      <FiTarget className="w-3.5 h-3.5 text-studojo-purple" />
                    </div>
                    <h3 className="font-clash text-base font-bold text-studojo-ink">Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 12).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-satoshi font-medium bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/20">
                        {s}
                      </span>
                    ))}
                    {skills.length > 12 && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-satoshi text-studojo-muted">
                        +{skills.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Career DNA */}
              {psych?.dimension_scores && (
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-studojo-purple-bg flex items-center justify-center">
                      <FiZap className="w-3.5 h-3.5 text-studojo-purple" />
                    </div>
                    <h3 className="font-clash text-base font-bold text-studojo-ink">Career DNA</h3>
                  </div>

                  <div className="space-y-2.5">
                    {Object.entries(psych.dimension_scores as Record<string, number>)
                      .sort(([, a], [, b]) => b - a)
                      .map(([dim, score]) => {
                        const c = DIM_COLORS[dim] || DIM_COLORS.analytical;
                        return (
                          <div key={dim}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-satoshi font-semibold text-studojo-ink capitalize">{dim}</span>
                              <span className={`text-[11px] font-clash font-bold ${c.text}`}>{Math.round(score)}</span>
                            </div>
                            <div className={`h-1.5 rounded-full ${c.bg} overflow-hidden`}>
                              <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.max(score, 4)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {psych.traits?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-studojo-ink/8">
                      {psych.traits.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-satoshi font-semibold bg-studojo-purple-bg text-studojo-purple">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Recommended Roles ──────────────────────────────────── */}
            {career.recommended_roles?.length > 0 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-studojo-green-bg flex items-center justify-center">
                    <FiBriefcase className="w-3.5 h-3.5 text-studojo-green" />
                  </div>
                  <h3 className="font-clash text-base font-bold text-studojo-ink">Recommended Roles</h3>
                </div>

                <div className="space-y-2.5">
                  {career.recommended_roles.map((role: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-studojo-surface-muted border border-studojo-ink/8 hover:border-studojo-ink/20 transition-colors"
                    >
                      {/* Rank badge */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-clash font-bold ${
                        i === 0 ? "bg-studojo-green text-white" : i < 3 ? "bg-studojo-purple/10 text-studojo-purple" : "bg-studojo-ink/5 text-studojo-muted"
                      }`}>
                        {i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-satoshi font-semibold text-studojo-ink truncate">{role.title}</p>
                        {role.reasoning && (
                          <p className="text-[11px] text-studojo-muted font-satoshi mt-0.5 line-clamp-1">{role.reasoning}</p>
                        )}
                      </div>

                      {role.fit_score != null && (
                        <div className="flex-shrink-0 text-right">
                          <span className={`font-clash text-sm font-bold ${
                            role.fit_score >= 0.9 ? "text-studojo-green" : role.fit_score >= 0.8 ? "text-studojo-purple" : "text-studojo-muted"
                          }`}>
                            {Math.round(role.fit_score * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Reasoning quote (from psychometric) ────────────────── */}
            {psych?.reasoning && (
              <div className="rounded-xl border border-studojo-ink/10 bg-studojo-purple-bg/40 px-5 py-4">
                <p className="text-[13px] font-satoshi text-studojo-muted leading-relaxed italic">
                  "{psych.reasoning}"
                </p>
              </div>
            )}

            {/* ── CTA ────────────────────────────────────────────────── */}
            <div className="pt-2 pb-4">
              <button
                onClick={() => navigate("/outreach/leads/discovery")}
                className="w-full h-13 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center gap-2"
              >
                Find Decision Makers
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
