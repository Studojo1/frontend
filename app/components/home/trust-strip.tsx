const COMPANIES = [
  "Razorpay",
  "TCS",
  "Goldman Sachs",
  "Figma",
  "BCG",
  "Deloitte",
  "Monzo",
  "CRED",
  "Zepto",
];

export function TrustStrip() {
  return (
    <section className="border-b border-neutral-900 bg-neutral-100 px-4 py-4 md:px-8">
      <div className="mx-auto max-w-[var(--section-max-width)]">
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <span className="font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-neutral-400 shrink-0">
            Placed at
          </span>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {COMPANIES.map((company) => (
              <span
                key={company}
                className="font-['Satoshi'] text-xs font-semibold text-neutral-600 md:text-sm"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
