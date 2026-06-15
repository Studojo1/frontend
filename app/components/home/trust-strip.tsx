type Company = { name: string; logo: string | null; color: string; invert?: boolean };

const COMPANIES: Company[] = [
  { name: "Google", logo: "https://cdn.simpleicons.org/google", color: "#4285F4", invert: true },
  { name: "Goldman Sachs", logo: "https://cdn.simpleicons.org/goldmansachs", color: "#7399C6", invert: true },
  { name: "Stripe", logo: "https://cdn.simpleicons.org/stripe", color: "#635BFF", invert: true },
  { name: "McKinsey", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e2/McKinsey_and_Company_Logo_1.svg", color: "#003366", invert: true },
  { name: "PhonePe", logo: "https://cdn.simpleicons.org/phonepe", color: "#5F259F", invert: true },
  { name: "Figma", logo: "https://cdn.simpleicons.org/figma", color: "#F24E1E", invert: true },
  { name: "BCG", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Boston_Consulting_Group_2020_logo.svg", color: "#00843D", invert: true },
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", color: "#FF9900", invert: false },
  { name: "Monzo", logo: "https://cdn.simpleicons.org/monzo", color: "#14233C", invert: true },
  { name: "Razorpay", logo: "https://cdn.simpleicons.org/razorpay", color: "#0C2451", invert: true },
  { name: "Deloitte", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Logo_of_Deloitte.svg", color: "#007B40", invert: true },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", color: "#F3F3F3", invert: false },
  { name: "CRED", logo: null, color: "#1A1A1A" }, // no public SVG available on any CDN
  { name: "Bain & Co.", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Bain_%26_Company_logo.svg", color: "#C00000", invert: true },
  { name: "Revolut", logo: "https://cdn.simpleicons.org/revolut", color: "#191C1F", invert: true },
  { name: "Zepto", logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Zepto_Logo.svg", color: "#A100FF", invert: true },
  { name: "JP Morgan", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/JPMorgan_logo.svg", color: "#003087", invert: true },
  { name: "Spotify", logo: "https://cdn.simpleicons.org/spotify", color: "#1ED760", invert: true },
  { name: "Groww", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Groww_app_logo.png", color: "#00D09C", invert: false },
  { name: "Notion", logo: "https://cdn.simpleicons.org/notion", color: "#000000", invert: true },
  { name: "PwC", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/PricewaterhouseCoopers_Logo.svg", color: "#D04A02", invert: true },
  { name: "Swiggy", logo: "https://cdn.simpleicons.org/swiggy", color: "#FC8019", invert: true },
  { name: "Airbnb", logo: "https://cdn.simpleicons.org/airbnb", color: "#FF5A5F", invert: true },
  { name: "Morgan Stanley", logo: "https://upload.wikimedia.org/wikipedia/commons/3/34/Morgan_Stanley_Logo_1.svg", color: "#003087", invert: true },
  { name: "Freshworks", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Freshworks-vector-logo.svg", color: "#25C16F", invert: true },
  { name: "EY", logo: "https://upload.wikimedia.org/wikipedia/commons/3/34/EY_logo_2019.svg", color: "#2E2D62", invert: true },
  { name: "Zomato", logo: "https://cdn.simpleicons.org/zomato", color: "#E23744", invert: true },
  { name: "Anthropic", logo: "https://cdn.simpleicons.org/anthropic", color: "#191919", invert: true },
  { name: "Netflix", logo: "https://cdn.simpleicons.org/netflix", color: "#E50914", invert: true },
  { name: "Vercel", logo: "https://cdn.simpleicons.org/vercel", color: "#000000", invert: true },
  { name: "Wise", logo: "https://cdn.simpleicons.org/wise", color: "#9FE870", invert: false },
  { name: "InMobi", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/InMobi_logo.svg", color: "#E8452C", invert: true },
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
              className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-studojo-ink bg-studojo-purple-bg font-['Satoshi'] text-sm font-bold text-studojo-ink whitespace-nowrap"
            >
              {company.logo ? (
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full overflow-hidden"
                  style={{ backgroundColor: company.color }}
                  aria-hidden
                >
                  <img
                    src={company.logo}
                    alt=""
                    className={`h-3.5 w-3.5 object-contain${company.invert ? " brightness-0 invert" : ""}`}
                  />
                </span>
              ) : (
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
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
