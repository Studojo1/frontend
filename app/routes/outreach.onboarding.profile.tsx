import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiUser, FiMapPin, FiBriefcase, FiTarget, FiZap, FiTrendingUp, FiUsers } from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { ProgressSteps } from "~/components/outreach/ProgressSteps";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <ProgressSteps steps={["Upload Resume", "AI Chat", "Your Profile"]} currentStep={3} />

        <div className="mt-8">
          <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Your Candidate Profile</h1>
          <p className="text-sm text-studojo-muted font-satoshi mb-6">
            Here's what we've learned about you. This powers your lead discovery.
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
              <p className="text-red-600 font-satoshi">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {parsed.profile_summary && (
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <FiUser className="w-5 h-5 text-studojo-purple" />
                    <h3 className="font-clash text-lg font-bold text-studojo-ink">Summary</h3>
                  </div>
                  <p className="text-sm text-studojo-muted font-satoshi">{parsed.profile_summary}</p>
                </div>
              )}

              {personalInfo.skills_detected?.length > 0 && (
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <FiTarget className="w-5 h-5 text-studojo-purple" />
                    <h3 className="font-clash text-lg font-bold text-studojo-ink">Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {personalInfo.skills_detected.map((s: string) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {preferences.locations?.length > 0 && (
                  <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <FiMapPin className="w-5 h-5 text-studojo-purple" />
                      <h3 className="font-clash text-lg font-bold text-studojo-ink">Locations</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferences.locations.map((loc: string) => (
                        <span key={loc} className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-surface-muted text-studojo-muted border border-studojo-ink/20">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {preferences.industry_interests?.length > 0 && (
                  <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <BsBuilding className="w-5 h-5 text-studojo-purple" />
                      <h3 className="font-clash text-lg font-bold text-studojo-ink">Industries</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferences.industry_interests.map((ind: string) => (
                        <span key={ind} className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-surface-muted text-studojo-muted border border-studojo-ink/20">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {psych && (
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <FiZap className="w-5 h-5 text-studojo-purple" />
                    <h3 className="font-clash text-lg font-bold text-studojo-ink">Career DNA</h3>
                    {psych.confidence_score != null && (
                      <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-satoshi font-semibold bg-studojo-green-bg text-studojo-green border border-studojo-green/30">
                        {Math.round(psych.confidence_score)}% confidence
                      </span>
                    )}
                  </div>
                  {psych.traits?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {psych.traits.map((t: string) => (
                        <span key={t} className="px-3 py-1 rounded-xl text-sm font-satoshi font-semibold bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {psych.dimension_scores && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(psych.dimension_scores as Record<string, number>)
                        .sort(([, a], [, b]) => b - a)
                        .map(([dim, score]) => {
                          const colors: Record<string, string> = {
                            analytical: "bg-studojo-purple",
                            creative: "bg-studojo-orange",
                            execution: "bg-studojo-green",
                            social: "bg-studojo-pink",
                          };
                          const bgColors: Record<string, string> = {
                            analytical: "bg-studojo-purple/15",
                            creative: "bg-studojo-orange/15",
                            execution: "bg-studojo-green/15",
                            social: "bg-studojo-pink/15",
                          };
                          return (
                            <div key={dim}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-satoshi font-semibold text-studojo-ink capitalize">{dim}</span>
                                <span className="text-xs font-clash font-bold text-studojo-muted">{Math.round(score)}</span>
                              </div>
                              <div className={`h-2 rounded-full ${bgColors[dim] || "bg-gray-100"} overflow-hidden`}>
                                <div className={`h-full rounded-full ${colors[dim] || "bg-gray-400"}`} style={{ width: `${Math.max(score, 4)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  {psych.reasoning && (
                    <p className="text-xs text-studojo-muted font-satoshi mt-4 italic leading-relaxed">
                      "{psych.reasoning}"
                    </p>
                  )}
                </div>
              )}

              {career.recommended_roles?.length > 0 && (
                <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <FiBriefcase className="w-5 h-5 text-studojo-purple" />
                    <h3 className="font-clash text-lg font-bold text-studojo-ink">Recommended Roles</h3>
                  </div>
                  <div className="space-y-4">
                    {career.recommended_roles.map((role: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-studojo-surface-muted rounded-xl border-2 border-studojo-ink/20">
                        <div>
                          <p className="text-sm font-bold font-satoshi text-studojo-ink">{role.title}</p>
                          {role.reasoning && (
                            <p className="text-sm text-studojo-muted font-satoshi mt-1">{role.reasoning}</p>
                          )}
                        </div>
                        {role.fit_score != null && (
                          <div className="text-right">
                            <span className="font-clash text-lg font-bold text-studojo-purple">
                              {Math.round(role.fit_score * 100)}%
                            </span>
                            <span className="text-xs font-bold text-studojo-muted uppercase font-satoshi block">fit</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center pt-6">
                <button
                  onClick={() => navigate("/outreach/leads/discovery")}
                  className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  Find Decision Makers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}