type Company = { name: string; color: string };

const COMPANIES: Company[] = [
  { name: "Google", color: "#4285F4" },
  { name: "Goldman Sachs", color: "#1F3763" },
  { name: "Stripe", color: "#635BFF" },
  { name: "McKinsey", color: "#003366" },
  { name: "PhonePe", color: "#5F259F" },
  { name: "Figma", color: "#F24E1E" },
  { name: "BCG", color: "#00843D" },
  { name: "Amazon", color: "#FF9900" },
  { name: "Monzo", color: "#FF4B60" },
  { name: "Razorpay", color: "#2D9CDB" },
  { name: "Deloitte", color: "#007B40" },
  { name: "Microsoft", color: "#00A4EF" },
  { name: "CRED", color: "#1A1A1A" },
  { name: "Bain & Co.", color: "#C00000" },
  { name: "Revolut", color: "#0666EB" },
  { name: "Zepto", color: "#A100FF" },
  { name: "JP Morgan", color: "#003087" },
  { name: "Spotify", color: "#1DB954" },
  { name: "Groww", color: "#00D09C" },
  { name: "Notion", color: "#1A1A1A" },
  { name: "PwC", color: "#D04A02" },
  { name: "Swiggy", color: "#FC8019" },
  { name: "Airbnb", color: "#FF5A5F" },
  { name: "Morgan Stanley", color: "#003087" },
  { name: "Freshworks", color: "#25C16F" },
  { name: "EY", color: "#FFE600" },
  { name: "Zomato", color: "#E23744" },
  { name: "Anthropic", color: "#C96442" },
  { name: "Netflix", color: "#E50914" },
  { name: "Vercel", color: "#1A1A1A" },
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
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-black text-white"
                style={{ backgroundColor: company.color }}
                aria-hidden
              >
                {company.name.charAt(0)}
              </span>
              {company.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
