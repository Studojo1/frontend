import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiMapPin, FiBriefcase, FiTarget, FiZap, FiArrowRight,
  FiAward, FiCheck, FiUser, FiSearch, FiTrendingUp, FiTool, FiHome,
} from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { Header } from "~/components/common/header";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const STEPS = ["Upload Resume", "AI Chat", "Your Profile"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function inferRoleCluster(text: string): "engineering" | "data" | "product" | "design" | "marketing" | "sales" | "finance" | "consulting" | "general" {
  const t = (text || "").toLowerCase();
  if (/\b(engineer|developer|backend|frontend|full[- ]?stack|sde|swe|sre|devops)\b/.test(t)) return "engineering";
  if (/\b(data scientist|data analyst|analytics|ml engineer|machine learning)\b/.test(t)) return "data";
  if (/\b(product manager|product owner|associate pm|apm)\b/.test(t)) return "product";
  if (/\b(designer|design lead|ux|ui[/ ]ux)\b/.test(t)) return "design";
  if (/\b(growth|marketing|brand|content|seo|gtm)\b/.test(t)) return "marketing";
  if (/\b(sales|account executive|business development|bdr|sdr)\b/.test(t)) return "sales";
  if (/\b(financ|investment|valuation|equity research|fp&a)\b/.test(t)) return "finance";
  if (/\b(consultant|consulting|strategy|advisory)\b/.test(t)) return "consulting";
  return "general";
}

// Map a role cluster + the candidate's stated target_role to the manager titles
// the backend will actually search for. This mirrors decision_maker_engine on the
// server side — kept loose so the user just sees a clear summary.
function inferManagerTitles(targetRole: string, cluster: string): string[] {
  const r = (targetRole || "").toLowerCase();
  if (cluster === "engineering" || /engineer|developer|sde|swe/.test(r)) {
    return ["Engineering Manager", "Head of Engineering", "Director of Engineering", "VP Engineering", "CTO"];
  }
  if (cluster === "data" || /data|analyst|analytics|scientist/.test(r)) {
    return ["Head of Data", "Director of Data", "Analytics Manager", "Data Science Manager", "VP Data"];
  }
  if (cluster === "product" || /product/.test(r)) {
    return ["Head of Product", "Director of Product", "VP Product", "Group Product Manager", "Chief Product Officer"];
  }
  if (cluster === "design" || /design|ux|ui/.test(r)) {
    return ["Head of Design", "Design Lead", "Design Manager", "Director of Design", "VP Design"];
  }
  if (cluster === "marketing" || /marketing|growth|brand|content/.test(r)) {
    return ["Head of Growth", "Marketing Manager", "Director of Marketing", "VP Marketing", "Chief Marketing Officer"];
  }
  if (cluster === "sales" || /sales|account|business dev/.test(r)) {
    return ["Sales Manager", "Head of Sales", "Director of Sales", "VP Sales", "Chief Revenue Officer"];
  }
  if (cluster === "finance" || /financ|investment|fp&a/.test(r)) {
    return ["Finance Manager", "Head of Finance", "Director of Finance", "VP Finance", "CFO"];
  }
  if (cluster === "consulting" || /consult|strategy/.test(r)) {
    return ["Engagement Manager", "Project Lead", "Principal Consultant", "Director of Strategy"];
  }
  return ["Hiring Manager", "Department Head", "Director", "Operations Manager"];
}

function formatSizeBand(band: string | undefined | null): string {
  if (!band) return "";
  // Apollo-style "51,200" → "51-200"
  if (/^\d+,\d+$/.test(band)) return band.replace(",", "-");
  return band;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { candidateId, profileData, setProfileData } = useOutreachStore();
  const [profile, setProfile] = useState<any>(profileData ?? null);
  const [loading, setLoading] = useState(!profileData);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profileData || !candidateId) return;
    let cancelled = false;
    outreachFetch<any>(`/candidate/${candidateId}/profile`)
      .then((data) => {
        if (!cancelled) { setProfile(data); setProfileData(data); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.body?.detail || err.message || "Failed to load profile");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [candidateId, profileData]);

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
  const skills = personalInfo.skills_detected || [];
  const name = personalInfo.name || personalInfo.full_name || "";
  const initials = name
    ? name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  // ── Derived fields for Ideal Hiring Manager / What we know panels ─────────
  const recommendedRoles = career.recommended_roles || [];
  const targetRole = recommendedRoles[0]?.title || profile?.target_roles?.[0] || "";
  const cluster = inferRoleCluster(targetRole + " " + (parsed.profile_summary || ""));
  const managerTitles = inferManagerTitles(targetRole, cluster);

  const locations: string[] = preferences.locations || [];
  const nicheKeywords: string[] = preferences.niche_keywords || [];
  const techStack: string[] = preferences.tech_stack || [];
  const workMode: string = preferences.work_mode || "";
  const companySize: string = preferences.company_size || "";
  const dreamCompanies: string[] = profile?.dream_companies || [];

  const seniority = recommendedRoles[0]?.seniority || "";
  const sizeBands = companySize === "any" ? ["1-200", "201-2000", "2001+"] : [formatSizeBand(companySize)];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-studojo-surface-muted/50">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Persistent sidebar — same as chat page ── */}
        <aside className="hidden md:flex flex-col w-56 border-r border-studojo-ink/10 bg-studojo-surface-muted/30 items-center justify-center flex-shrink-0">
          <div className="flex flex-col" style={{ alignItems: "flex-start" }}>
          {STEPS.map((step, i) => {
            const num = i + 1;
            const active = num === 3;
            const done = num < 3;
            const isLast = i === STEPS.length - 1;
            return (
              <div key={i} className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                      active ? "bg-studojo-purple text-white border-studojo-purple"
                             : "bg-studojo-green text-white border-studojo-green"
                    }`}>
                      {done ? <FiCheck className="w-4 h-4" /> : num}
                    </div>
                    {!isLast && <div className={`w-0.5 h-10 ${done ? "bg-studojo-green" : "bg-studojo-ink/10"}`} />}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-satoshi leading-tight ${
                      active ? "text-studojo-ink font-semibold" : "text-studojo-green font-medium"
                    }`}>
                      {step}
                    </p>
                    {active && (
                      <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
                        {loading ? "Building..." : "Ready"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </aside>

        {/* ── Main scrollable content ── */}
        <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-5 md:px-8 pb-28">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-studojo-purple/20 border-t-studojo-purple rounded-full animate-spin mb-4" />
            <p className="text-sm text-studojo-muted font-satoshi">Building your profile...</p>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-red-600 font-satoshi">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4 animate-fade-in">

            {/* ── Hero card ──────────────────────────────────────────────────── */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-studojo-purple via-studojo-pink to-studojo-orange" />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-studojo-purple to-studojo-pink flex items-center justify-center flex-shrink-0 border-2 border-studojo-ink">
                    {initials ? (
                      <span className="text-white font-clash font-bold text-base">{initials}</span>
                    ) : (
                      <FiUser className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {name && <h1 className="font-clash text-lg font-bold text-studojo-ink truncate">{name}</h1>}
                    {parsed.profile_summary && (
                      <p className="text-sm text-studojo-muted font-satoshi mt-0.5 leading-relaxed line-clamp-2">
                        {parsed.profile_summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {locations.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studojo-surface-muted text-xs font-satoshi text-studojo-muted">
                      <FiMapPin className="w-3 h-3" />
                      {locations.slice(0, 2).join(", ")}
                    </span>
                  )}
                  {workMode && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studojo-surface-muted text-xs font-satoshi text-studojo-muted capitalize">
                      <FiHome className="w-3 h-3" />
                      {workMode}
                    </span>
                  )}
                  {nicheKeywords.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studojo-surface-muted text-xs font-satoshi text-studojo-muted">
                      <BsBuilding className="w-3 h-3" />
                      {nicheKeywords.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Ideal Hiring Manager — the new headline panel ─────────────── */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-studojo-purple to-studojo-pink" />
              <div className="p-5 pb-3 border-b border-studojo-ink/8">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-studojo-purple/10 flex items-center justify-center">
                    <FiSearch className="w-3.5 h-3.5 text-studojo-purple" />
                  </div>
                  <div>
                    <h3 className="font-clash text-base font-bold text-studojo-ink leading-none">Who we'll be looking for</h3>
                    <p className="text-[11px] text-studojo-muted font-satoshi mt-0.5">Your ideal hiring manager profile</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Manager titles */}
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted mb-1.5">Manager titles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {managerTitles.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-satoshi font-semibold bg-studojo-purple/10 text-studojo-purple border border-studojo-purple/20">
                        {t}
                      </span>
                    ))}
                  </div>
                  {targetRole && (
                    <p className="text-[11px] text-studojo-muted font-satoshi mt-2">
                      Plus managers who came up through your role (e.g. were once a {targetRole.toLowerCase()}).
                    </p>
                  )}
                </div>

                {/* Where */}
                {locations.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted mb-1.5">Where</p>
                    <p className="text-sm font-satoshi text-studojo-ink">
                      {locations.join(", ")}{workMode ? ` — ${workMode} roles` : ""}
                    </p>
                  </div>
                )}

                {/* Company kind */}
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted mb-1.5">At companies that look like</p>
                  <ul className="text-sm font-satoshi text-studojo-ink space-y-1">
                    <li>• {sizeBands.length > 0 && sizeBands[0] ? `Size band: ${sizeBands.join(", ")} employees` : "Any company size"}</li>
                    {nicheKeywords.length > 0 && <li>• Niche: {nicheKeywords.join(", ")}</li>}
                    {techStack.length > 0 && <li>• Stack overlaps with: {techStack.join(", ")}</li>}
                    <li>• Currently posting jobs for {targetRole || "your target role"} (last 30 days)</li>
                  </ul>
                </div>

                {/* Dream company callout */}
                {dreamCompanies.length > 0 && (
                  <div className="rounded-xl bg-studojo-pink/5 border border-studojo-pink/20 p-3">
                    <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-pink mb-1">Plus your dream list</p>
                    <p className="text-xs font-satoshi text-studojo-ink">
                      {dreamCompanies.slice(0, 8).join(" · ")}
                    </p>
                    <p className="text-[10px] text-studojo-muted font-satoshi mt-1">
                      Searched separately so they always show up regardless of other filters.
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-studojo-muted font-satoshi italic pt-1">
                  We'll fall back gracefully if a filter cuts volume too low — never below 500 leads if we can help it.
                </p>
              </div>
            </div>

            {/* ── What we know about you — the input-side panel ─────────────── */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
              <div className="p-5 pb-3 border-b border-studojo-ink/8">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-studojo-green/10 flex items-center justify-center">
                    <FiZap className="w-3.5 h-3.5 text-studojo-green" />
                  </div>
                  <div>
                    <h3 className="font-clash text-base font-bold text-studojo-ink leading-none">What we know about you</h3>
                    <p className="text-[11px] text-studojo-muted font-satoshi mt-0.5">From your resume + the quiz</p>
                  </div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-satoshi">
                {targetRole && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-bold text-studojo-muted mb-0.5 flex items-center gap-1.5"><FiTarget className="w-3 h-3" /> Target role</p>
                    <p className="text-studojo-ink">{targetRole}{seniority ? ` · ${seniority}` : ""}</p>
                  </div>
                )}
                {locations.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-bold text-studojo-muted mb-0.5 flex items-center gap-1.5"><FiMapPin className="w-3 h-3" /> Location</p>
                    <p className="text-studojo-ink">{locations.join(", ")}</p>
                  </div>
                )}
                {workMode && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-bold text-studojo-muted mb-0.5 flex items-center gap-1.5"><FiHome className="w-3 h-3" /> Work mode</p>
                    <p className="text-studojo-ink capitalize">{workMode}</p>
                  </div>
                )}
                {companySize && companySize !== "any" && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-bold text-studojo-muted mb-0.5 flex items-center gap-1.5"><BsBuilding className="w-3 h-3" /> Company size</p>
                    <p className="text-studojo-ink">{formatSizeBand(companySize)} employees</p>
                  </div>
                )}
                {nicheKeywords.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-wide font-bold text-studojo-muted mb-0.5 flex items-center gap-1.5"><FiTrendingUp className="w-3 h-3" /> Niches</p>
                    <p className="text-studojo-ink">{nicheKeywords.join(", ")}</p>
                  </div>
                )}
                {techStack.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-wide font-bold text-studojo-muted mb-0.5 flex items-center gap-1.5"><FiTool className="w-3 h-3" /> Tech stack</p>
                    <div className="flex flex-wrap gap-1">
                      {techStack.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-[11px] bg-studojo-surface-muted text-studojo-ink/80 border border-studojo-ink/10">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {dreamCompanies.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-wide font-bold text-studojo-muted mb-0.5 flex items-center gap-1.5"><FiAward className="w-3 h-3" /> Dream companies</p>
                    <p className="text-studojo-ink">{dreamCompanies.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Recommended Roles ──────────────────────────────────────────── */}
            {recommendedRoles.length > 0 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
                <div className="p-5 pb-3 border-b border-studojo-ink/8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-studojo-green/10 flex items-center justify-center">
                      <FiBriefcase className="w-3.5 h-3.5 text-studojo-green" />
                    </div>
                    <div>
                      <h3 className="font-clash text-base font-bold text-studojo-ink leading-none">Roles That Fit You</h3>
                      <p className="text-[11px] text-studojo-muted font-satoshi mt-0.5">Matched from your resume, skills and career goals</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {recommendedRoles.map((role: any, i: number) => {
                    const score = Math.round((role.fit_score ?? 0.75) * 100);
                    const isBest = i === 0;
                    const isStrong = score >= 85;
                    const scoreColor = isBest ? "text-studojo-green" : isStrong ? "text-studojo-purple" : "text-studojo-muted";
                    const matchingSkills: string[] = role.matching_skills ?? [];

                    return (
                      <div
                        key={i}
                        className={`rounded-xl p-4 border transition-all duration-200 ${
                          isBest
                            ? "border-studojo-green/30 bg-studojo-green/4"
                            : "border-studojo-ink/8 bg-studojo-surface-muted/30 hover:bg-studojo-surface-muted/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-clash text-sm font-bold text-studojo-ink">{role.title}</p>
                              {isBest && (
                                <span className="px-1.5 py-0.5 rounded-md bg-studojo-green text-white text-[10px] font-satoshi font-bold uppercase tracking-wide flex-shrink-0">
                                  Best match
                                </span>
                              )}
                              {role.seniority && (
                                <span className="px-1.5 py-0.5 rounded-md bg-studojo-surface-muted text-studojo-muted text-[10px] font-satoshi capitalize flex-shrink-0">
                                  {role.seniority}
                                </span>
                              )}
                            </div>
                            {role.reasoning && (
                              <p className="text-[11px] text-studojo-muted font-satoshi mt-1 leading-relaxed">{role.reasoning}</p>
                            )}
                          </div>

                          <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
                            <div className="relative w-10 h-10">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                                <circle
                                  cx="20" cy="20" r="16"
                                  fill="none"
                                  stroke={isBest ? "#10b981" : isStrong ? "#8b5cf6" : "#94a3b8"}
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 16}`}
                                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - score / 100)}`}
                                  className="transition-all duration-700"
                                />
                              </svg>
                              <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-clash font-bold ${scoreColor}`}>
                                {score}
                              </span>
                            </div>
                            <span className="text-[9px] text-studojo-muted font-satoshi">fit</span>
                          </div>
                        </div>

                        {matchingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {matchingSkills.map((skill: string) => (
                              <span
                                key={skill}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-satoshi font-medium ${
                                  isBest
                                    ? "bg-studojo-green/12 text-studojo-green border border-studojo-green/20"
                                    : "bg-studojo-purple/8 text-studojo-purple border border-studojo-purple/15"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Skills ─────────────────────────────────────────────────────── */}
            {skills.length > 0 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-studojo-purple/10 flex items-center justify-center">
                      <FiTarget className="w-3.5 h-3.5 text-studojo-purple" />
                    </div>
                    <h3 className="font-clash text-base font-bold text-studojo-ink">Skills</h3>
                  </div>
                  <span className="text-xs text-studojo-muted font-satoshi">{skills.length} detected</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s: string, i: number) => (
                    <span
                      key={s}
                      className={`px-2.5 py-1 rounded-lg text-xs font-satoshi font-medium border ${
                        i < 5
                          ? "bg-studojo-purple/8 text-studojo-purple border-studojo-purple/20"
                          : i < 12
                          ? "bg-studojo-surface-muted text-studojo-ink/70 border-studojo-ink/10"
                          : "bg-studojo-surface-muted text-studojo-muted border-transparent"
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-studojo-muted/60 font-satoshi mt-2">Top skills highlighted in purple</p>
              </div>
            )}

          </div>
        )}
        </div>{/* end max-w-2xl */}
        </div>{/* end main scrollable */}

      </div>{/* end flex-1 flex */}

      {/* ── Floating CTA pill ──────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none md:pl-56">
        <button
          onClick={() => navigate("/outreach/leads/discovery")}
          className="pointer-events-auto px-8 py-3.5 rounded-full bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center gap-2.5"
        >
          {loading && <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
          Find My Hiring Managers
          {!loading && <FiArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
