type Backer = {
  name: string;
  description: string;
  logo: string | null;
  bgColor: string;
  invert: boolean;
  textColor?: string;
};

const BACKERS: Backer[] = [
  {
    name: "Mesa",
    description: "Startup Accelerator",
    logo: null,
    bgColor: "#0D0D0D",
    invert: true,
    textColor: "#FFFFFF",
  },
  {
    name: "Startup Grind",
    description: "Global Community",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Startup_Grind_logo.svg",
    bgColor: "#E8192C",
    invert: true,
  },
  {
    name: "AWS",
    description: "Cloud Credits",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    bgColor: "#232F3E",
    invert: false,
  },
  {
    name: "Microsoft",
    description: "for Startups",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    bgColor: "#FFFFFF",
    invert: false,
  },
  {
    name: "Google Cloud",
    description: "AI & ML Credits",
    logo: "https://cdn.simpleicons.org/googlecloud",
    bgColor: "#FFFFFF",
    invert: false,
  },
  {
    name: "Anthropic",
    description: "AI Partner",
    logo: "https://cdn.simpleicons.org/anthropic",
    bgColor: "#191919",
    invert: true,
  },
  {
    name: "Emergent",
    description: "Venture Partner",
    logo: null,
    bgColor: "#1A1A2E",
    invert: true,
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

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
          {BACKERS.map((backer) => (
            <div key={backer.name} className="flex flex-col items-center gap-2">
              <div
                className="flex h-16 w-40 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-neutral-900 px-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
                style={{ backgroundColor: backer.bgColor }}
              >
                {backer.logo ? (
                  <img
                    src={backer.logo}
                    alt={backer.name}
                    className={`h-6 max-w-[100px] object-contain${backer.invert ? " brightness-0 invert" : ""}`}
                  />
                ) : (
                  <span
                    className="font-['Clash_Display'] text-base font-bold"
                    style={{ color: backer.textColor ?? "#FFFFFF" }}
                  >
                    {backer.name}
                  </span>
                )}
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
