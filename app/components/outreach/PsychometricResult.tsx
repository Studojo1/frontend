import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

interface DimensionScores {
  analytical: number;
  creative: number;
  execution: number;
  social: number;
}

interface PsychometricData {
  top_strengths: string[];
  dimension_scores: DimensionScores;
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

const DIMS = [
  { key: "analytical" as const, label: "Analytical", color: "text-studojo-purple", dot: "#8b5cf6" },
  { key: "creative" as const, label: "Creative", color: "text-studojo-orange", dot: "#f97316" },
  { key: "execution" as const, label: "Execution", color: "text-studojo-green", dot: "#10b981" },
  { key: "social" as const, label: "Social", color: "text-studojo-pink", dot: "#ec4899" },
];

const ANGLES = [-90, 0, 90, 180];

function RadarChart({ scores }: { scores: DimensionScores }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cx = 100, cy = 100, maxR = 65;
  const toXY = (deg: number, r: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  });

  const gridLevels = [25, 50, 75, 100];
  const dataPoints = DIMS.map((d, i) =>
    toXY(ANGLES[i], ((scores[d.key] * t) / 100) * maxR)
  );

  return (
    <div className="relative mx-auto w-60 h-60">
      <svg viewBox="0 0 200 200" className="absolute inset-5">
        <defs>
          <linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {gridLevels.map((lv) => {
          const pts = ANGLES.map((a) => toXY(a, (lv / 100) * maxR));
          return (
            <polygon
              key={lv}
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={lv === 100 ? "#d1d5db" : "#f0f0f0"}
              strokeWidth={lv === 100 ? "1" : "0.5"}
              strokeDasharray={lv < 100 ? "3,3" : "none"}
            />
          );
        })}

        {ANGLES.map((a, i) => {
          const end = toXY(a, maxR);
          return (
            <line
              key={DIMS[i].key}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          );
        })}

        <polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="url(#radar-fill)"
          stroke="rgba(139,92,246,0.6)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {dataPoints.map((p, i) => (
          <circle
            key={DIMS[i].key}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="white"
            stroke={DIMS[i].dot}
            strokeWidth="2.5"
          />
        ))}
      </svg>

      {/* Analytical — top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
        <p className={`text-[11px] font-satoshi font-bold ${DIMS[0].color}`}>{DIMS[0].label}</p>
        <p className="text-sm font-clash font-bold text-studojo-ink">
          {Math.round(scores.analytical * t)}
        </p>
      </div>
      {/* Creative — right */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 text-center">
        <p className={`text-[11px] font-satoshi font-bold ${DIMS[1].color}`}>{DIMS[1].label}</p>
        <p className="text-sm font-clash font-bold text-studojo-ink">
          {Math.round(scores.creative * t)}
        </p>
      </div>
      {/* Execution — bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <p className="text-sm font-clash font-bold text-studojo-ink">
          {Math.round(scores.execution * t)}
        </p>
        <p className={`text-[11px] font-satoshi font-bold ${DIMS[2].color}`}>{DIMS[2].label}</p>
      </div>
      {/* Social — left */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 text-center">
        <p className={`text-[11px] font-satoshi font-bold ${DIMS[3].color}`}>{DIMS[3].label}</p>
        <p className="text-sm font-clash font-bold text-studojo-ink">
          {Math.round(scores.social * t)}
        </p>
      </div>
    </div>
  );
}

export function PsychometricResult({ data, onContinue, loading }: Props) {
  const confidence = Math.round(data.confidence_score);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6 animate-fade-in">
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

      {/* Radar chart */}
      <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
        <RadarChart scores={data.dimension_scores} />
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
          <div className="grid grid-cols-2 gap-2">
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
