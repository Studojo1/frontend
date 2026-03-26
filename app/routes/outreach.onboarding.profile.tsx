import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiUser, FiMapPin, FiBriefcase, FiTarget, FiZap,
  FiArrowRight, FiAward, FiTrendingUp, FiStar,
} from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { ProgressSteps } from "~/components/outreach/ProgressSteps";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const DIM_META: Record<string, { color: string; bg: string; text: string; stroke: string; fill: string; label: string; icon: string }> = {
  analytical: { color: "bg-studojo-purple", bg: "bg-studojo-purple/10", text: "text-studojo-purple", stroke: "#7c3aed", fill: "rgba(124,58,237,0.15)", label: "Analytical", icon: "" },
  creative:   { color: "bg-studojo-orange", bg: "bg-studojo-orange/10", text: "text-studojo-orange", stroke: "#ea580c", fill: "rgba(234,88,12,0.12)", label: "Creative",   icon: "" },
  execution:  { color: "bg-studojo-green",  bg: "bg-studojo-green/10",  text: "text-studojo-green",  stroke: "#16a34a", fill: "rgba(22,163,74,0.12)",  label: "Execution",  icon: "" },
  social:     { color: "bg-studojo-pink",   bg: "bg-studojo-pink/10",   text: "text-studojo-pink",   stroke: "#db2777", fill: "rgba(219,39,119,0.12)", label: "Social",     icon: "" },
};

// Primary radar color (purple-to-pink blend)
const RADAR_STROKE = "#7c3aed";
const RADAR_FILL = "rgba(124,58,237,0.12)";

interface RadarChartProps {
  scores: Record<string, number>;
  size?: number;
}

function RadarChart({ scores, size = 220 }: RadarChartProps) {
  const entries = Object.entries(scores);
  const n = entries.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.47;
  const gridLevels = [25, 50, 75, 100];

  const angleFor = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;

  const gridPolygon = (pct: number) =>
    entries
      .map((_, i) => {
        const a = angleFor(i);
        const r = (pct / 100) * maxR;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      })
      .join(" ");

  const dataPoints = entries.map(([, score], i) => {
    const a = angleFor(i);
    const r = (Math.max(score, 3) / 100) * maxR;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      {/* Grid rings */}
      {gridLevels.map((lvl) => (
        <polygon
          key={lvl}
          points={gridPolygon(lvl)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray={lvl < 100 ? "3 3" : "none"}
        />
      ))}

      {/* Axis lines */}
      {entries.map(([, ], i) => {
        const a = angleFor(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + maxR * Math.cos(a)}
            y2={cy + maxR * Math.sin(a)}
            stroke="#d1d5db"
            strokeWidth="1"
          />
        );
      })}

      {/* Filled data polygon */}
      <polygon
        points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        fill={RADAR_FILL}
        stroke={RADAR_STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Data point dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill={RADAR_STROKE} stroke="white" strokeWidth="2" />
      ))}

      {/* Labels */}
      {entries.map(([dim, score], i) => {
        const a = angleFor(i);
        const lx = cx + labelR * Math.cos(a);
        const ly = cy + labelR * Math.sin(a);
        const meta = DIM_META[dim];
        const icon = meta?.icon || "•";
        const label = meta?.label || dim;
        return (
          <g key={i}>
            <text
              x={lx}
              y={ly - 7}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill="#1a1a2e"
              fontFamily="'Clash Display', sans-serif"
            >
              {icon} {label}
            </text>
            <text
              x={lx}
              y={ly + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="700"
              fill={meta?.stroke || RADAR_STROKE}
              fontFamily="'Clash Display', sans-serif"
            >
              {Math.round(score)}
            </text>
          </g>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="3" fill="#d1d5db" />
    </svg>
  );
}

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

  // Ordered dimension scores for consistent display
  const dimScores: Record<string, number> = psych?.dimension_scores
    ? Object.fromEntries(
        ["analytical", "creative", "execution", "social"]
          .filter((k) => psych.dimension_scores[k] != null)
          .map((k) => [k, psych.dimension_scores[k]])
      )
    : {};

  const dimEntries = Object.entries(dimScores).sort(([, a], [, b]) => b - a);
  const topDim = dimEntries[0]?.[0];

  return (
    <div className="min-h-screen bg-studojo-surface-muted/50">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-5 md:px-8">
        <ProgressSteps steps={["Upload Resume", "AI Chat", "Your Profile"]} currentStep={3} />

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

            {/* ── Hero card ──────────────────────────────────────────── */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-studojo-purple via-studojo-pink to-studojo-orange" />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-studojo-purple to-studojo-pink flex items-center justify-center flex-shrink-0 border-2 border-studojo-ink">
                    <span className="text-white font-clash font-bold text-base">{initials}</span>
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

                {/* Quick stat chips */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
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
                  {topDim && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-satoshi font-semibold ${DIM_META[topDim]?.bg} ${DIM_META[topDim]?.text}`}>
                      <FiStar className="w-3 h-3" />
                      {DIM_META[topDim]?.label} dominant
                    </span>
                  )}
                  {psych?.confidence_score != null && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studojo-green/10 text-xs font-satoshi font-semibold text-studojo-green border border-studojo-green/20">
                      <FiAward className="w-3 h-3" />
                      {Math.round(psych.confidence_score)}% match confidence
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Career DNA (full-width, radar chart) ───────────────── */}
            {Object.keys(dimScores).length >= 3 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
                <div className="p-5 pb-3 border-b border-studojo-ink/8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-studojo-purple/10 flex items-center justify-center">
                      <FiZap className="w-3.5 h-3.5 text-studojo-purple" />
                    </div>
                    <div>
                      <h3 className="font-clash text-base font-bold text-studojo-ink leading-none">Career DNA</h3>
                      <p className="text-[11px] text-studojo-muted font-satoshi mt-0.5">Psychometric profile from your responses</p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    {/* Radar chart */}
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <RadarChart scores={dimScores} size={240} />
                    </div>

                    {/* Dimension breakdown */}
                    <div className="flex-1 w-full space-y-3">
                      {dimEntries.map(([dim, score]) => {
                        const meta = DIM_META[dim] || DIM_META.analytical;
                        const pct = Math.max(score, 2);
                        const descriptions: Record<string, string> = {
                          analytical: "Data-driven thinking, problem-solving, logical reasoning",
                          creative: "Ideation, innovation, design thinking, originality",
                          execution: "Getting things done, reliability, follow-through",
                          social: "Communication, teamwork, leadership, relationship-building",
                        };
                        return (
                          <div key={dim}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{meta.icon}</span>
                                <span className="text-sm font-satoshi font-semibold text-studojo-ink capitalize">{meta.label}</span>
                                {dim === topDim && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-satoshi font-bold ${meta.bg} ${meta.text}`}>
                                    Top trait
                                  </span>
                                )}
                              </div>
                              <span className={`text-base font-clash font-bold ${meta.text}`}>{Math.round(score)}</span>
                            </div>
                            <div className={`h-2.5 rounded-full ${meta.bg} overflow-hidden`}>
                              <div
                                className={`h-full rounded-full ${meta.color} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-studojo-muted font-satoshi mt-1">{descriptions[dim] || ""}</p>
                          </div>
                        );
                      })}

                      {/* Trait badges */}
                      {psych?.traits?.length > 0 && (
                        <div className="pt-2 border-t border-studojo-ink/8">
                          <p className="text-[11px] text-studojo-muted font-satoshi font-semibold uppercase tracking-wide mb-2">Identified traits</p>
                          <div className="flex flex-wrap gap-1.5">
                            {psych.traits.map((t: string) => (
                              <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-satoshi font-semibold bg-studojo-purple/8 text-studojo-purple border border-studojo-purple/15">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reasoning */}
                      {psych?.reasoning && (
                        <div className="pt-2 border-t border-studojo-ink/8">
                          <p className="text-[12px] font-satoshi text-studojo-muted leading-relaxed italic">"{psych.reasoning}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Skills ─────────────────────────────────────────────── */}
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
                {skills.length > 0 && (
                  <p className="text-[11px] text-studojo-muted/60 font-satoshi mt-2">
                    Top skills highlighted in purple
                  </p>
                )}
              </div>
            )}

            {/* ── Recommended Roles ──────────────────────────────────── */}
            {career.recommended_roles?.length > 0 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
                <div className="p-5 pb-3 border-b border-studojo-ink/8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-studojo-green/10 flex items-center justify-center">
                      <FiBriefcase className="w-3.5 h-3.5 text-studojo-green" />
                    </div>
                    <div>
                      <h3 className="font-clash text-base font-bold text-studojo-ink leading-none">Recommended Roles</h3>
                      <p className="text-[11px] text-studojo-muted font-satoshi mt-0.5">Based on your skills and career DNA</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-studojo-ink/6">
                  {career.recommended_roles.map((role: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-studojo-surface-muted/50 transition-colors">
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
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-studojo-surface-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${role.fit_score >= 0.9 ? "bg-studojo-green" : "bg-studojo-purple"}`}
                              style={{ width: `${Math.round(role.fit_score * 100)}%` }}
                            />
                          </div>
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

            {/* ── CTA ────────────────────────────────────────────────── */}
            <div className="pb-4">
              <button
                onClick={() => navigate("/outreach/leads/discovery")}
                className="w-full h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center gap-2"
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
