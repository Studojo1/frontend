import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiUser, FiMapPin, FiBriefcase, FiTarget, FiZap,
  FiArrowRight, FiAward, FiStar,
} from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { ProgressSteps } from "~/components/outreach/ProgressSteps";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

// ── Dimension metadata — all 8 dims ──────────────────────────────────────────

const DIM_META: Record<string, {
  label: string; chart: string;
  color: string; bg: string; text: string;
  dot: string;
  desc: string;
}> = {
  analytical:    { label: "Analytical",    chart: "Analytical",    dot: "#8b5cf6", color: "bg-[#8b5cf6]", bg: "bg-[#8b5cf6]/10", text: "text-[#8b5cf6]",  desc: "Data-driven thinking, problem-solving, logical reasoning" },
  creative:      { label: "Creative",      chart: "Creative",      dot: "#f97316", color: "bg-[#f97316]", bg: "bg-[#f97316]/10", text: "text-[#f97316]",  desc: "Ideation, innovation, design thinking, originality" },
  execution:     { label: "Execution",     chart: "Execution",     dot: "#10b981", color: "bg-[#10b981]", bg: "bg-[#10b981]/10", text: "text-[#10b981]",  desc: "Getting things done, reliability, follow-through" },
  social:        { label: "Social",        chart: "Social",        dot: "#ec4899", color: "bg-[#ec4899]", bg: "bg-[#ec4899]/10", text: "text-[#ec4899]",  desc: "Communication, teamwork, relationship-building" },
  leadership:    { label: "Leadership",    chart: "Leadership",    dot: "#3b82f6", color: "bg-[#3b82f6]", bg: "bg-[#3b82f6]/10", text: "text-[#3b82f6]",  desc: "Guiding teams, decision-making, inspiring others" },
  strategic:     { label: "Strategic",     chart: "Strategic",     dot: "#f59e0b", color: "bg-[#f59e0b]", bg: "bg-[#f59e0b]/10", text: "text-[#d97706]",  desc: "Long-term planning, vision, business acumen" },
  technical:     { label: "Technical",     chart: "Technical",     dot: "#06b6d4", color: "bg-[#06b6d4]", bg: "bg-[#06b6d4]/10", text: "text-[#0891b2]",  desc: "Engineering, coding, system design, technical depth" },
  communication: { label: "Communication", chart: "Communication", dot: "#e11d48", color: "bg-[#e11d48]", bg: "bg-[#e11d48]/10", text: "text-[#e11d48]",  desc: "Writing, presenting, storytelling, articulation" },
};

// ── Animated radar chart (same as Career DNA step) ───────────────────────────

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dims = Object.keys(scores);
  const N = dims.length;
  if (N < 3) return null;

  const VW = 600, VH = 460;
  const cx = VW / 2, cy = VH / 2;
  const maxR = 145;
  const labelGap = 56;

  const angle = (i: number) => -90 + (360 / N) * i;
  const toXY = (deg: number, r: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  });

  const maxScore = Math.max(...dims.map((d) => scores[d]), 1);
  const FLOOR_R = maxR * 0.35;
  const CEIL_R  = maxR * 0.92;
  const dispR   = (score: number) => FLOOR_R + (score / maxScore) * (CEIL_R - FLOOR_R);

  const gridLevels = [0.25, 0.50, 0.75, 1.00];
  const gridColors = ["#e8e4ff", "#d4caf9", "#bfaff3", "#a78bfa"];

  const dataPoints = dims.map((dim, i) => toXY(angle(i), dispR(scores[dim]) * t));
  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ display: "block" }}>
      <defs>
        <linearGradient id="prf-rf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.50" />
          <stop offset="100%" stopColor="#db2777" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="prf-rbg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ede9fe" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
        </radialGradient>
        <filter id="prf-ds" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.22" />
        </filter>
        <filter id="prf-pg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={maxR + 15} fill="url(#prf-rbg)" />

      <polygon
        points={dims.map((_, i) => { const p = toXY(angle(i), gridLevels[0] * maxR); return `${p.x},${p.y}`; }).join(" ")}
        fill="rgba(124,58,237,0.06)" stroke="none"
      />

      {gridLevels.map((fr, gi) => (
        <polygon key={fr}
          points={dims.map((_, i) => { const p = toXY(angle(i), fr * maxR); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke={gridColors[gi]}
          strokeWidth={gi === 3 ? "1.8" : "1"}
          strokeDasharray={gi < 3 ? "6,4" : undefined}
        />
      ))}

      {dims.map((dim, i) => {
        const end = toXY(angle(i), maxR);
        return <line key={`sp-${i}`} x1={cx} y1={cy} x2={end.x} y2={end.y}
          stroke={DIM_META[dim]?.dot ?? "#a78bfa"} strokeWidth="1" strokeOpacity="0.30" />;
      })}

      <polygon points={dataPoly} fill="none" stroke="#7c3aed" strokeWidth="10"
        strokeLinejoin="round" opacity="0.10" filter="url(#prf-pg)" />

      <polygon points={dataPoly} fill="url(#prf-rf)" stroke="#6d28d9"
        strokeWidth="2.8" strokeLinejoin="round" />

      {dataPoints.map((p, i) => {
        const c = DIM_META[dims[i]]?.dot ?? "#8b5cf6";
        return (
          <g key={`dot-${i}`} filter="url(#prf-ds)">
            <circle cx={p.x} cy={p.y} r="9"   fill={c} opacity="0.18" />
            <circle cx={p.x} cy={p.y} r="5.5" fill="white" stroke={c} strokeWidth="2.8" />
          </g>
        );
      })}

      {dims.map((dim, i) => {
        const deg = angle(i);
        const lp  = toXY(deg, maxR + labelGap);
        const meta = DIM_META[dim] ?? { chart: dim, dot: "#8b5cf6", text: "text-[#8b5cf6]" };
        const score = Math.round(scores[dim] * t);
        const EPS = 18;
        const anchor = lp.x < cx - EPS ? "end" : lp.x > cx + EPS ? "start" : "middle";
        return (
          <g key={`lbl-${dim}`}>
            <text x={lp.x} y={lp.y - 9} textAnchor={anchor}
              fontSize="11.5" fontWeight="700" fill={DIM_META[dim]?.dot ?? "#8b5cf6"}
              style={{ letterSpacing: "0.3px" }}>
              {meta.chart}
            </text>
            <text x={lp.x} y={lp.y + 9} textAnchor={anchor}
              fontSize="16" fontWeight="700" fill="#0f172a">
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, psychResult: storedPsych } = useOutreachStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !candidateId) return;

    let cancelled = false;

    (async () => {
      try {
        // Poll profile-status every 1s up to 30 attempts (~30s)
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 1000));
          if (cancelled) return;
          try {
            const status = await outreachFetch<{ ready: boolean }>(
              `/candidate/${candidateId}/profile-status`
            );
            if (status.ready) break;
          } catch {}
        }
        if (cancelled) return;
        // Single full profile fetch once ready
        const data = await outreachFetch<{ parsed_json: any }>(`/candidate/${candidateId}/profile`);
        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.body?.detail || err.message || "Failed to load profile");
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
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
  // Use stored psychometric data from chat (available immediately) or fall back to profile fetch
  const psych = storedPsych || (profile as any)?.psychometric || null;
  const skills = personalInfo.skills_detected || [];
  const name = personalInfo.name || personalInfo.full_name || "";
  const initials = name
    ? name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // All 8 dimensions, sorted by score
  const DIM_ORDER = ["analytical", "creative", "execution", "social", "leadership", "strategic", "technical", "communication"];
  const dimScores: Record<string, number> = psych?.dimension_scores
    ? Object.fromEntries(
        DIM_ORDER
          .filter((k) => psych.dimension_scores[k] != null)
          .map((k) => [k, psych.dimension_scores[k]])
      )
    : {};
  const dimEntries = Object.entries(dimScores).sort(([, a], [, b]) => b - a);
  const topDim = dimEntries[0]?.[0];

  return (
    <div className="min-h-screen bg-studojo-surface-muted/50">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-5 md:px-8 pb-28">
        <ProgressSteps steps={["Upload Resume", "AI Chat", "Your Profile"]} currentStep={3} />

        {loading && !psych ? (
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
            {!loading && (
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
                    {topDim && DIM_META[topDim] && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-satoshi font-semibold ${DIM_META[topDim].bg} ${DIM_META[topDim].text}`}>
                        <FiStar className="w-3 h-3" />
                        {DIM_META[topDim].label} dominant
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
            )}

            {/* ── Career DNA — radar + all 8 dimension bars ──────────────────── */}
            {Object.keys(dimScores).length >= 3 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
                <div className="p-5 pb-3 border-b border-studojo-ink/8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-studojo-purple/10 flex items-center justify-center">
                      <FiZap className="w-3.5 h-3.5 text-studojo-purple" />
                    </div>
                    <div>
                      <h3 className="font-clash text-base font-bold text-studojo-ink leading-none">Career DNA</h3>
                      <p className="text-[11px] text-studojo-muted font-satoshi mt-0.5">Your psychometric profile</p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <RadarChart scores={dimScores} />

                  <div className="mt-4 space-y-3">
                    {dimEntries.map(([dim, score]) => {
                      const meta = DIM_META[dim];
                      if (!meta) return null;
                      return (
                        <div key={dim}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
                              <span className={`text-sm font-satoshi font-semibold ${meta.text}`}>{meta.label}</span>
                              {dim === topDim && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-satoshi font-bold ${meta.bg} ${meta.text}`}>
                                  Top trait
                                </span>
                              )}
                            </div>
                            <span className={`text-base font-clash font-bold ${meta.text}`}>{Math.round(score)}</span>
                          </div>
                          <div className={`h-2 rounded-full ${meta.bg} overflow-hidden`}>
                            <div className={`h-full rounded-full ${meta.color} transition-all duration-700`} style={{ width: `${Math.max(score, 2)}%` }} />
                          </div>
                          <p className="text-[11px] text-studojo-muted font-satoshi mt-1">{meta.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {psych?.traits?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-studojo-ink/8">
                      <p className="text-[11px] text-studojo-muted font-satoshi font-semibold uppercase tracking-wide mb-2">Identified traits</p>
                      <div className="flex flex-wrap gap-1.5">
                        {psych.traits.map((t: string) => (
                          <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-satoshi font-semibold bg-studojo-purple/8 text-studojo-purple border border-studojo-purple/15">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {psych?.reasoning && (
                    <div className="mt-3 pt-3 border-t border-studojo-ink/8">
                      <p className="text-[12px] font-satoshi text-studojo-muted leading-relaxed italic">"{psych.reasoning}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Loading skeleton while full profile fetches ─────────────────── */}
            {loading && (
              <div className="rounded-2xl border-2 border-studojo-ink/10 bg-white p-5 space-y-3 animate-pulse">
                <div className="h-3 w-1/3 rounded-full bg-studojo-ink/8" />
                <div className="h-2 w-2/3 rounded-full bg-studojo-ink/6" />
                <div className="h-2 w-1/2 rounded-full bg-studojo-ink/6" />
              </div>
            )}

            {/* ── Recommended Roles ──────────────────────────────────────────── */}
            {career.recommended_roles?.length > 0 && (
              <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
                <div className="p-5 pb-3 border-b border-studojo-ink/8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-studojo-green/10 flex items-center justify-center">
                      <FiBriefcase className="w-3.5 h-3.5 text-studojo-green" />
                    </div>
                    <div>
                      <h3 className="font-clash text-base font-bold text-studojo-ink leading-none">Recommended Roles</h3>
                      <p className="text-[11px] text-studojo-muted font-satoshi mt-0.5">Based on your skills and Career DNA</p>
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
      </div>

      {/* ── Sticky bottom CTA ──────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t-2 border-studojo-ink/10 px-4 py-3 md:px-8">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate("/outreach/leads/discovery")}
            disabled={loading}
            className="w-full h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Finalising your profile...
              </>
            ) : (
              <>
                Find Decision Makers
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
