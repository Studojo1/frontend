type Company = { name: string; logo: string | null; color: string };

// logo: Simple Icons CDN URL (null = no SI entry, falls back to colored initial)
const COMPANIES: Company[] = [
  { name: "Google", logo: "https://cdn.simpleicons.org/google", color: "#4285F4" },
  { name: "Goldman Sachs", logo: "https://cdn.simpleicons.org/goldmansachs", color: "#7399C6" },
  { name: "Stripe", logo: "https://cdn.simpleicons.org/stripe", color: "#635BFF" },
  { name: "McKinsey", logo: null, color: "#003366" },
  { name: "PhonePe", logo: "https://cdn.simpleicons.org/phonepe", color: "#5F259F" },
  { name: "Figma", logo: "https://cdn.simpleicons.org/figma", color: "#F24E1E" },
  { name: "BCG", logo: null, color: "#00843D" },
  { name: "Amazon", logo: null, color: "#FF9900" },
  { name: "Monzo", logo: "https://cdn.simpleicons.org/monzo", color: "#14233C" },
  { name: "Razorpay", logo: "https://cdn.simpleicons.org/razorpay", color: "#0C2451" },
  { name: "Deloitte", logo: null, color: "#007B40" },
  { name: "Microsoft", logo: null, color: "#00A4EF" },
  { name: "CRED", logo: null, color: "#1A1A1A" },
  { name: "Bain & Co.", logo: null, color: "#C00000" },
  { name: "Revolut", logo: "https://cdn.simpleicons.org/revolut", color: "#191C1F" },
  { name: "Zepto", logo: null, color: "#A100FF" },
  { name: "JP Morgan", logo: null, color: "#003087" },
  { name: "Spotify", logo: "https://cdn.simpleicons.org/spotify", color: "#1ED760" },
  { name: "Groww", logo: null, color: "#00D09C" },
  { name: "Notion", logo: "https://cdn.simpleicons.org/notion", color: "#000000" },
  { name: "PwC", logo: null, color: "#D04A02" },
  { name: "Swiggy", logo: "https://cdn.simpleicons.org/swiggy", color: "#FC8019" },
  { name: "Airbnb", logo: "https://cdn.simpleicons.org/airbnb", color: "#FF5A5F" },
  { name: "Morgan Stanley", logo: null, color: "#003087" },
  { name: "Freshworks", logo: null, color: "#25C16F" },
  { name: "EY", logo: null, color: "#2E2D62" },
  { name: "Zomato", logo: "https://cdn.simpleicons.org/zomato", color: "#E23744" },
  { name: "Anthropic", logo: "https://cdn.simpleicons.org/anthropic", color: "#191919" },
  { name: "Netflix", logo: "https://cdn.simpleicons.org/netflix", color: "#E50914" },
  { name: "Vercel", logo: "https://cdn.simpleicons.org/vercel", color: "#000000" },
  { name: "Wise", logo: "https://cdn.simpleicons.org/wise", color: "#9FE870" },
];

export function TrustStrip() {
  const doubled = [...COMPANIES, ...COMPANIES];
  return (
    <section className="py-6 bg-white border-y-2 border-studojo-ink overflow-hidden">
      <p className="font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-studojo-muted text-center mb-4">
        Positive replies from
      </p>
      <div className="overflow-hidden">
        <div className="flex gap-3 w-max animate-marquee">
          {doubled.map((company, i) => (
            <span
              key={i}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 border-studojo-ink bg-studojo-purple-bg font-['Satoshi'] text-xs font-bold text-studojo-ink whitespace-nowrap"
            >
              {company.logo ? (
                <span
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: company.color }}
                  aria-hidden
                >
                  <img
                    src={company.logo}
                    alt=""
                    className="h-2.5 w-2.5 object-contain brightness-0 invert"
                  />
                </span>
              ) : (
                <span
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-black text-white"
                  style={{ backgroundColor: company.color }}
                  aria-hidden
                >
                  {company.name.charAt(0)}
                </span>
              )}
              {company.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
