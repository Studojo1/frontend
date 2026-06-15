import { FiCheck } from "react-icons/fi";
import type { TierPricing } from "~/lib/outreach/types";

interface TierSelectorProps {
  selected: 50 | 200 | 350 | 500;
  onSelect: (tier: 50 | 200 | 350 | 500) => void;
  pricing?: TierPricing[];
}

const tierDescriptions: Record<number, string> = {
  200: "Great for testing the waters with a focused outreach",
  350: "Recommended balance of reach and quality",
  500: "Maximum coverage across your target market",
};

const fallbackTiers = [
  { value: 200 as const, name: "Starter", desc: tierDescriptions[200], price: "$20", anchor: null, discount: null, recommended: false },
  { value: 350 as const, name: "Growth", desc: tierDescriptions[350], price: "$27", anchor: null, discount: null, recommended: true },
  { value: 500 as const, name: "Scale", desc: tierDescriptions[500], price: "$50", anchor: null, discount: null, recommended: false },
];

export function TierSelector({ selected, onSelect, pricing }: TierSelectorProps) {
  const tiers = pricing
    ? pricing.map((p) => ({
        value: p.tier as 200 | 350 | 500,
        name: p.label,
        desc: tierDescriptions[p.tier] || "",
        price: p.display_price,
        anchor: p.anchor_display ?? null,
        discount: p.discount_pct ?? null,
        recommended: p.tier === 350,
      }))
    : fallbackTiers;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tiers.map((tier) => {
        const isSelected = selected === tier.value;
        return (
          <button
            key={tier.value}
            onClick={() => onSelect(tier.value)}
            className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200
              ${isSelected
                ? "border-studojo-ink bg-studojo-purple-bg shadow-brutal"
                : "border-studojo-ink/30 hover:border-studojo-ink hover:shadow-brutal"
              }`}
          >
            {tier.recommended && (
              <span className="absolute -top-3 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-satoshi font-bold bg-studojo-purple text-white border-2 border-studojo-ink">
                Recommended
              </span>
            )}
            <span className="text-3xl text-studojo-purple font-bold font-clash">{tier.value}</span>
            <span className="text-lg font-bold text-studojo-ink mt-2 font-clash">{tier.name}</span>
            <p className="text-sm text-studojo-muted mt-2 text-center font-satoshi">{tier.desc}</p>

            {/* Price block — slashed anchor + current + discount badge */}
            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="flex items-baseline gap-2">
                {tier.anchor && (
                  <span className="text-sm text-studojo-muted line-through font-clash font-bold">
                    {tier.anchor}
                  </span>
                )}
                <span className="text-xl font-bold text-studojo-purple font-clash">{tier.price}</span>
              </div>
              {tier.discount != null && tier.discount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-satoshi font-bold bg-studojo-green/15 text-studojo-green border border-studojo-green/40">
                  Save {tier.discount}%
                </span>
              )}
            </div>

            {isSelected && (
              <div className="mt-3 w-8 h-8 rounded-full bg-studojo-purple border-2 border-studojo-ink flex items-center justify-center">
                <FiCheck className="w-5 h-5 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
