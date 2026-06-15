const BACKERS = [
  {
    name: "Mesa",
    description: "Startup Accelerator",
    color: "#1A1A2E",
    textColor: "#FFFFFF",
  },
  {
    name: "AWS",
    description: "Cloud Credits",
    color: "#FF9900",
    textColor: "#1A1A1A",
  },
  {
    name: "Microsoft Azure",
    description: "Cloud Infrastructure",
    color: "#0078D4",
    textColor: "#FFFFFF",
  },
  {
    name: "Google Cloud",
    description: "AI & ML Credits",
    color: "#4285F4",
    textColor: "#FFFFFF",
  },
  {
    name: "Anthropic",
    description: "AI Partner",
    color: "#C96442",
    textColor: "#FFFFFF",
  },
];

export function BackedBySection() {
  return (
    <section className="border-b-2 border-neutral-900 bg-neutral-50 px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[var(--section-max-width)]">
        <div className="mb-8 text-center">
          <p className="inline-block rounded-full border-2 border-neutral-900 bg-violet-100 px-4 py-1.5 font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-violet-700 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
            Backed by
          </p>
          <h2 className="mt-4 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
            Supported by the best in tech
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {BACKERS.map((backer) => (
            <div
              key={backer.name}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="flex h-14 w-36 items-center justify-center rounded-2xl border-2 border-neutral-900 px-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
                style={{ backgroundColor: backer.color }}
              >
                <span
                  className="font-['Clash_Display'] text-sm font-bold leading-tight text-center"
                  style={{ color: backer.textColor }}
                >
                  {backer.name}
                </span>
              </div>
              <span className="font-['Satoshi'] text-xs text-neutral-500">
                {backer.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
