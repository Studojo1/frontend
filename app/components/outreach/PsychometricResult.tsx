import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

interface PsychometricData {
  top_strengths: string[];
  dimension_scores: Record<string, number>;
  traits: string[];
  recommended_roles: string[];
  reasoning: string;
  confidence_score: number;
}

interface Props {
  data: PsychometricData;
  onContinue: () => void;
  loading?: boolean;
}

// label = bar list name, chart = radar label (full quality name, proper case)
const DIM_META: Record<string, { label: string; chart: string; dot: string; color: string }> = {
  analytical:    { label: "Analytical",    chart: "Analytical",    dot: "#8b5cf6", color: "#8b5cf6" },
  creative:      { label: "Creative",      chart: "Creative",      dot: "#f97316", color: "#f97316" },
  execution:     { label: "Execution",     chart: "Execution",     dot: "#10b981", color: "#10b981" },
  social:        { label: "Social",        chart: "Social",        dot: "#ec4899", color: "#ec4899" },
  leadership:    { label: "Leadership",    chart: "Leadership",    dot: "#3b82f6", color: "#3b82f6" },
  strategic:     { label: "Strategic",     chart: "Strategic",     dot: "#f59e0b", color: "#d97706" },
  technical:     { label: "Technical",     chart: "Technical",     dot: "#06b6d4", color: "#0891b2" },
  communication: { label: "Communication", chart: "Communication", dot: "#e11d48", color: "#e11d48" },
};

// ─── Radar chart ────────────────────────────────────────────────────────────

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      // Ease-out cubic
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dims = Object.keys(scores);
  const N = dims.length;

  // ── geometry ──────────────────────────────────────────────────────────────
  // Wide viewBox (600×460) so labels on the left/right never clip.
  // cx pushed slightly right so vertical stack isn't lopsided.
  const VW = 600, VH = 460;
  const cx = VW / 2, cy = VH / 2;
  const maxR = 145;
  // Labels sit 56px beyond the polygon edge.
  // Dynamic text-anchor (end/middle/start) based on horizontal position
  // ensures text always grows away from center.
  const labelGap = 56;

  const angle = (i: number) => -90 + (360 / N) * i;

  const toXY = (deg: number, r: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  });

  // ── display scaling ───────────────────────────────────────────────────────
  // The chart shows RELATIVE strength, not absolute percentage.
  // Top scorer = 90% of maxR; floor = 35% so weak dims are still visible.
  const maxScore = Math.max(...dims.map((d) => scores[d]), 1);
  const FLOOR_R = maxR * 0.35;
  const CEIL_R  = maxR * 0.92;
  const dispR   = (score: number) =>
    FLOOR_R + (score / maxScore) * (CEIL_R - FLOOR_R);

  // ── grid ──────────────────────────────────────────────────────────────────
  const gridLevels = [0.25, 0.50, 0.75, 1.00];
  const gridColors = ["#e8e4ff", "#d4caf9", "#bfaff3", "#a78bfa"];

  // ── data polygon ──────────────────────────────────────────────────────────
  const dataPoints = dims.map((dim, i) =>
    toXY(angle(i), dispR(scores[dim]) * t)
  );
  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full"
      style={{ maxWidth: "100%", display: "block" }}
    >
      <defs>
        {/* Data fill gradient */}
        <linearGradient id="rf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.50" />
          <stop offset="100%" stopColor="#db2777" stopOpacity="0.35" />
        </linearGradient>

        {/* Soft background */}
        <radialGradient id="rbg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ede9fe" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
        </radialGradient>

        {/* Drop shadow for dots */}
        <filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.22" />
        </filter>

        {/* Glow behind polygon stroke */}
        <filter id="pg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background radial wash */}
      <circle cx={cx} cy={cy} r={maxR + 15} fill="url(#rbg)" />

      {/* Innermost tinted fill */}
      <polygon
        points={dims.map((_, i) => {
          const p = toXY(angle(i), gridLevels[0] * maxR);
          return `${p.x},${p.y}`;
        }).join(" ")}
        fill="rgba(124,58,237,0.06)"
        stroke="none"
      />

      {/* Grid rings */}
      {gridLevels.map((fr, gi) => (
        <polygon
          key={fr}
          points={dims.map((_, i) => {
            const p = toXY(angle(i), fr * maxR);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke={gridColors[gi]}
          strokeWidth={gi === 3 ? "1.8" : "1"}
          strokeDasharray={gi < 3 ? "6,4" : undefined}
        />
      ))}

      {/* Axis spokes — each coloured by dimension */}
      {dims.map((dim, i) => {
        const end = toXY(angle(i), maxR);
        return (
          <line
            key={`spoke-${i}`}
            x1={cx} y1={cy} x2={end.x} y2={end.y}
            stroke={DIM_META[dim]?.dot ?? "#a78bfa"}
            strokeWidth="1"
            strokeOpacity="0.30"
          />
        );
      })}

      {/* Data polygon — glow halo */}
      <polygon
        points={dataPoly}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="10"
        strokeLinejoin="round"
        opacity="0.10"
        filter="url(#pg)"
      />

      {/* Data polygon — main filled shape */}
      <polygon
        points={dataPoly}
        fill="url(#rf)"
        stroke="#6d28d9"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      {/* Dots at each vertex */}
      {dataPoints.map((p, i) => {
        const c = DIM_META[dims[i]]?.dot ?? "#8b5cf6";
        return (
          <g key={`dot-${i}`} filter="url(#ds)">
            {/* Outer coloured halo */}
            <circle cx={p.x} cy={p.y} r="9"   fill={c} opacity="0.18" />
            {/* Main white-filled dot */}
            <circle cx={p.x} cy={p.y} r="5.5" fill="white" stroke={c} strokeWidth="2.8" />
          </g>
        );
      })}

      {/* Labels — abbreviated to prevent clipping; anchor direction based on position */}
      {dims.map((dim, i) => {
        const deg = angle(i);
        const lp  = toXY(deg, maxR + labelGap);
        const meta = DIM_META[dim] ?? { label: dim, chart: dim, dot: "#8b5cf6", color: "#8b5cf6" };
        const score = Math.round(scores[dim] * t);

        // Determine text-anchor so labels always grow away from center
        const EPS = 18; // px threshold for "near vertical axis"
        const anchor =
          lp.x < cx - EPS ? "end" :
          lp.x > cx + EPS ? "start" :
          "middle";

        return (
          <g key={`lbl-${dim}`}>
            <text
              x={lp.x} y={lp.y - 9}
              textAnchor={anchor}
              fontSize="11.5"
              fontWeight="700"
              fill={meta.color}
              style={{ letterSpacing: "0.3px" }}
            >
              {meta.chart}
            </text>
            <text
              x={lp.x} y={lp.y + 9}
              textAnchor={anchor}
              fontSize="16"
              fontWeight="700"
              fill="#0f172a"
            >
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function PsychometricResult({ data, onContinue, loading }: Props) {
  const confidence = Math.round(data.confidence_score);
  const scores = data.dimension_scores ?? {};
  const dimEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-studojo-green-bg border border-studojo-green/20 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-studojo-green animate-pulse" />
          <span className="text-xs font-satoshi font-semibold text-studojo-green">
            {confidence}% match confidence
          </span>
        </div>
        <h2 className="font-clash text-2xl font-bold text-studojo-ink">Your Career DNA</h2>
        <p className="text-sm text-studojo-muted font-satoshi mt-1">
          Based on your resume + quiz responses
        </p>
      </div>

      {/* Radar + dimension bars */}
      <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* Radar chart — takes more horizontal space */}
          <div className="w-full md:w-[55%] flex-shrink-0">
            <RadarChart scores={scores} />
          </div>

          {/* Dimension bars */}
          <div className="w-full md:w-[45%] space-y-3">
            {dimEntries.map(([dim, score], i) => {
              const meta = DIM_META[dim] ?? { label: dim, chart: dim, dot: "#8b5cf6", color: "#8b5cf6" };
              const isTop = i < 2;
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: meta.dot }}
                      />
                      <span
                        className={`text-xs font-satoshi font-semibold ${isTop ? "" : "text-studojo-muted"}`}
                        style={isTop ? { color: meta.color } : undefined}
                      >
                        {meta.label}
                      </span>
                      {isTop && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold font-satoshi"
                          style={{ background: `${meta.dot}18`, color: meta.color }}
                        >
                          Top
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-clash font-bold text-studojo-ink">
                      {Math.round(score)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-studojo-ink/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${score}%`,
                        background: meta.dot,
                        opacity: isTop ? 1 : 0.45,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Working style traits */}
      {data.traits?.length > 0 && (
        <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
          <p className="text-[11px] font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-3">
            Your Working Style
          </p>
          <div className="flex flex-wrap gap-2">
            {data.traits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1.5 rounded-xl text-sm font-satoshi font-semibold bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/20"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      {data.reasoning && (
        <div className="rounded-xl border border-studojo-ink/10 bg-studojo-purple-bg/40 px-5 py-4">
          <p className="text-[13px] font-satoshi text-studojo-muted leading-relaxed italic">
            "{data.reasoning}"
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onContinue}
        disabled={loading}
        className="w-full h-12 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Building your profile...
          </>
        ) : (
          <>
            Continue to Profile
            <FiArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
