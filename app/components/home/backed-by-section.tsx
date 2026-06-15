type Backer = {
  name: string;
  description: string;
  logo: string | null;
  bgColor: string;
  textColor: string;
};

const BACKERS: Backer[] = [
  {
    name: "Mesa",
    description: "Startup Accelerator",
    logo: null,
    bgColor: "#0D0D0D",
    textColor: "#FFFFFF",
  },
  {
    name: "AWS",
    description: "Cloud Credits",
    // AWS removed from Simple Icons; use their official smile logo from S3 press assets
    logo: null,
    bgColor: "#232F3E",
    textColor: "#FF9900",
  },
  {
    name: "Microsoft Azure",
    description: "Cloud Infrastructure",
    logo: null,
    bgColor: "#0078D4",
    textColor: "#FFFFFF",
  },
  {
    name: "Google Cloud",
    description: "AI & ML Credits",
    logo: "https://cdn.simpleicons.org/googlecloud",
    bgColor: "#FFFFFF",
    textColor: "#4285F4",
  },
  {
    name: "Anthropic",
    description: "AI Partner",
    logo: "https://cdn.simpleicons.org/anthropic",
    bgColor: "#191919",
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
            <div key={backer.name} className="flex flex-col items-center gap-2">
              <div
                className="flex h-16 w-40 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 px-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
                style={{ backgroundColor: backer.bgColor }}
              >
                {backer.logo && (
                  <img
                    src={backer.logo}
                    alt=""
                    aria-hidden
                    className="h-5 w-5 object-contain"
                    style={{
                      filter: backer.bgColor === "#FFFFFF" ? "none" : "brightness(0) invert(1)",
                    }}
                  />
                )}
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
