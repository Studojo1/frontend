import { useEffect, useState } from "react";
import { FiZap, FiTarget, FiTrendingUp, FiUsers, FiCheck } from "react-icons/fi";

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

const DIMENSION_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  analytical: {
    label: "Analytical",
    color: "text-studojo-purple",
    bg: "bg-studojo-purple",
    border: "border-studojo-purple/30",
    icon: <FiZap className="w-3.5 h-3.5" />,
  },
  creative: {
    label: "Creative",
    color: "text-studojo-orange",
    bg: "bg-studojo-orange",
    border: "border-studojo-orange/30",
    icon: <FiTrendingUp className="w-3.5 h-3.5" />,
  },
  execution: {
    label: "Execution",
    color: "text-studojo-green",
    bg: "bg-studojo-green",
    border: "border-studojo-green/30",
    icon: <FiTarget className="w-3.5 h-3.5" />,
  },
  social: {
    label: "Social",
    color: "text-studojo-pink",
    bg: "bg-studojo-pink",
    border: "border-studojo-pink/30",
    icon: <FiUsers className="w-3.5 h-3.5" />,
  },
};

const DIMENSION_BAR_BG: Record<string, string> = {
  analytical: "bg-studojo-purple/15",
  creative: "bg-studojo-orange/15",
  execution: "bg-studojo-green/15",
  social: "bg-studojo-pink/15",
};

export function PsychometricResult({ data, onContinue, loading }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Sort dimensions by score for display
  const sortedDims = Object.entries(data.dimension_scores)
    .sort(([, a], [, b]) => b - a)
    .map(([key, score]) => ({ key, score, meta: DIMENSION_META[key] }));

  const confidence = Math.round(data.confidence_score);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header card */}
      <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-clash text-lg font-bold text-studojo-ink">Your Career DNA</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-studojo-green-bg border border-studojo-green/30">
            <FiCheck className="w-3 h-3 text-studojo-green" />
            <span className="text-xs font-satoshi font-semibold text-studojo-green">
              {confidence}% confidence
            </span>
          </div>
        </div>
        <p className="text-xs text-studojo-muted font-satoshi">
          Based on your resume + {data.recommended_roles?.length > 0 ? "13" : "8"} quiz answers
        </p>
      </div>

      {/* Dimension bars */}
      <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5 space-y-3.5">
        {sortedDims.map(({ key, score, meta }, i) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={meta.color}>{meta.icon}</span>
                <span className="text-sm font-satoshi font-semibold text-studojo-ink">
                  {meta.label}
                </span>
              </div>
              <span className={`text-sm font-clash font-bold ${meta.color}`}>
                {animated ? Math.round(score) : 0}
              </span>
            </div>
            <div className={`h-2.5 rounded-full ${DIMENSION_BAR_BG[key]} overflow-hidden`}>
              <div
                className={`h-full rounded-full ${meta.bg} transition-all duration-1000 ease-out`}
                style={{ width: animated ? `${Math.max(score, 4)}%` : "0%" }}
              />
            </div>
            {i === 0 && (
              <span className="text-[10px] font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mt-1 inline-block">
                Top strength
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Traits */}
      {data.traits?.length > 0 && (
        <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5">
          <p className="text-xs font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-3">
            Your working style
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
          <p className="text-xs font-satoshi font-semibold text-studojo-muted uppercase tracking-wider mb-3">
            Roles that fit you
          </p>
          <div className="grid grid-cols-2 gap-2">
            {data.recommended_roles.slice(0, 6).map((role, i) => (
              <div
                key={role}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-studojo-surface-muted border border-studojo-ink/10"
              >
                <span className="w-5 h-5 rounded-full bg-studojo-purple/10 text-studojo-purple flex items-center justify-center text-[10px] font-clash font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs font-satoshi font-medium text-studojo-ink leading-tight">
                  {role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      {data.reasoning && (
        <div className="rounded-2xl border border-studojo-ink/15 bg-studojo-purple-bg/50 p-4">
          <p className="text-[13px] font-satoshi text-studojo-muted leading-relaxed italic">
            "{data.reasoning}"
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="pt-1">
        <button
          onClick={onContinue}
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating your profile...
            </>
          ) : (
            "Continue to Find Decision Makers"
          )}
        </button>
      </div>
    </div>
  );
}
