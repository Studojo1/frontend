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

const DIM_META: Record<string, { label: string; dot: string; textColor: string }> = {
  analytical:    { label: "Analytical",   dot: "#8b5cf6", textColor: "#8b5cf6" },
  creative:      { label: "Creative",     dot: "#f97316", textColor: "#f97316" },
  execution:     { label: "Execution",    dot: "#10b981", textColor: "#10b981" },
  social:        { label: "Social",       dot: "#ec4899", textColor: "#ec4899" },
  leadership:    { label: "Leadership",   dot: "#3b82f6", textColor: "#3b82f6" },
  strategic:     { label: "Strategic",    dot: "#f59e0b", textColor: "#d97706" },
  technical:     { label: "Technical",    dot: "#06b6d4", textColor: "#0891b2" },
  communication: { label: "Comms",        dot: "#e11d48", textColor: "#e11d48" },
};

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1400;
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
  const cx = 200, cy = 200, maxR = 130;
  const labelR = maxR + 48;
  const angles = dims.map((_, i) => -90 + (360 / N) * i);

  const toXY = (deg: number, r: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  });

  const gridLevels = [25, 50, 75, 100];

  const dataPoints = dims.map((dim, i) =>
    toXY(angles[i], ((scores[dim] * t) / 100) * maxR)
  );

  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto">
      <defs>
        {/* Filled area gradient */}
        <linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#db2777" stopOpacity="0.28" />
        </linearGradient>
        {/* Background wash */}
        <radialGradient id="radar-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5f3ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* Dot glow filter */}
        <filter id="dot-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodOpacity="0.3" />
        </filter>
        {/* Polygon glow */}
        <filter id="poly-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Soft background wash */}
      <circle cx={cx} cy={cy} r={maxR + 10} fill="url(#radar-bg)" />

      {/* Grid polygons */}
      {gridLevels.map((lv) => {
        const pts = angles.map((a) => toXY(a, (lv / 100) * maxR));
        return (
          <polygon
            key={lv}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={lv === 25 ? "rgba(139,92,246,0.04)" : "none"}
            stroke={lv === 100 ? "#c4b5fd" : lv === 75 ? "#ddd6fe" : "#ede9fe"}
            strokeWidth={lv === 100 ? "1.5" : "1"}
            strokeDasharray={lv < 100 ? "5,4" : undefined}
          />
        );
      })}

      {/* Axis lines */}
      {angles.map((a, i) => {
        const end = toXY(a, maxR);
        return (
          <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
            stroke="#ddd6fe" strokeWidth="1" />
        );
      })}

      {/* Data polygon — glow layer */}
      <polygon
        points={dataPoly}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="6"
        strokeLinejoin="round"
        opacity="0.15"
        filter="url(#poly-glow)"
      />

      {/* Data polygon — main */}
      <polygon
        points={dataPoly}
        fill="url(#radar-fill)"
        stroke="#7c3aed"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Data point dots */}
      {dataPoints.map((p, i) => {
        const meta = DIM_META[dims[i]];
        const color = meta?.dot ?? "#8b5cf6";
        return (
          <g key={i} filter="url(#dot-shadow)">
            {/* Outer ring */}
            <circle cx={p.x} cy={p.y} r="7" fill={color} opacity="0.18" />
            {/* Main dot */}
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />
          </g>
        );
      })}

      {/* Labels */}
      {dims.map((dim, i) => {
        const a = angles[i];
        const lp = toXY(a, labelR);
        const meta = DIM_META[dim] ?? { label: dim, dot: "#8b5cf6", textColor: "#8b5cf6" };
        const score = Math.round(scores[dim] * t);
        return (
          <g key={dim}>
            <text x={lp.x} y={lp.y - 9} textAnchor="middle"
              fontSize="10" fontWeight="800" fill={meta.textColor}
              style={{ letterSpacing: "0.5px" }}>
              {meta.label.toUpperCase()}
            </text>
            <text x={lp.x} y={lp.y + 8} textAnchor="middle"
              fontSize="15" fontWeight="700" fill="#0f172a">
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

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

      {/* Radar + dimension breakdown side by side */}
      <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Radar chart */}
          <div className="w-full md:w-1/2 flex-shrink-0">
            <RadarChart scores={scores} />
          </div>

          {/* Dimension bars */}
          <div className="w-full md:w-1/2 space-y-3">
            {dimEntries.map(([dim, score], i) => {
              const meta = DIM_META[dim] ?? { label: dim, dot: "#8b5cf6", textColor: "#8b5cf6" };
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
                        style={isTop ? { color: meta.textColor } : undefined}
                      >
                        {meta.label}
                      </span>
                      {isTop && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold font-satoshi"
                          style={{ background: `${meta.dot}18`, color: meta.textColor }}>
                          Top
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-clash font-bold text-studojo-ink">{Math.round(score)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-studojo-ink/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${score}%`, background: meta.dot, opacity: isTop ? 1 : 0.45 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traits */}
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

      {/* Recommended roles */}
      {data.recommended_roles?.length > 0 && (
        <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
          <p className="text-[11px] font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-3">
            Roles That Fit You
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.recommended_roles.slice(0, 6).map((role, i) => (
              <div
                key={role}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-studojo-surface-muted border border-studojo-ink/10"
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-clash font-bold flex-shrink-0 ${
                    i === 0
                      ? "bg-studojo-green text-white"
                      : i < 3
                      ? "bg-studojo-purple/10 text-studojo-purple"
                      : "bg-studojo-ink/5 text-studojo-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-satoshi font-medium text-studojo-ink leading-tight">
                  {role}
                </span>
              </div>
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
