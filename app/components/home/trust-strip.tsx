const COMPANIES = [
  "Google", "Goldman Sachs", "Stripe", "McKinsey", "PhonePe", "Figma",
  "BCG", "Amazon", "Monzo", "Razorpay", "Deloitte", "Microsoft",
  "CRED", "Bain & Company", "Revolut", "Zepto", "JP Morgan", "Spotify",
  "Groww", "Notion", "PwC", "Swiggy", "Airbnb", "InMobi", "Morgan Stanley",
  "Wise", "Freshworks", "Klarna", "Meesho", "EY", "Zomato", "Anthropic",
  "Browserstack", "Deel", "slice", "Netflix", "Navi", "Vercel",
];

export function TrustStrip() {
  const doubled = [...COMPANIES, ...COMPANIES];
  return (
    <section className="py-6 bg-white border-y-2 border-studojo-ink overflow-hidden">
      <p className="font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-studojo-muted text-center mb-4">
        Positive replies from
      </p>
      <div className="overflow-hidden">
        <div className="flex gap-4 w-max animate-marquee">
          {doubled.map((company, i) => (
            <span
              key={i}
              className="shrink-0 px-4 py-2 rounded-full border-2 border-studojo-ink bg-studojo-purple-bg font-['Satoshi'] text-xs font-bold text-studojo-ink whitespace-nowrap"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
