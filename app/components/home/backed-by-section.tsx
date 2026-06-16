type Backer = {
  name: string;
  description: string;
  bgColor: string;
  render: "wordmark" | "twoLine" | "lettermark";
  primary: string;
  secondary?: string;
  accent?: string;
};

const BACKERS: Backer[] = [
  {
    name: "Mesa",
    description: "Startup Accelerator",
    bgColor: "#1A2B2A",
    render: "twoLine",
    primary: "#FFFFFF",
    secondary: "School of Business",
  },
  {
    name: "startup grind",
    description: "Startup of the Year",
    bgColor: "#FFFFFF",
    render: "twoLine",
    primary: "#1A1A1A",
    secondary: "Bangalore",
    accent: "#E8192C",
  },
  {
    name: "Microsoft",
    description: "for Startups",
    bgColor: "#000000",
    render: "twoLine",
    primary: "#FFFFFF",
    secondary: "for Startups",
  },
  {
    name: "Google",
    description: "for Startups",
    bgColor: "#FFFFFF",
    render: "twoLine",
    primary: "#1A1A1A",
    secondary: "for Startups",
    accent: "#4285F4",
  },
  {
    name: "e",
    description: "Emergent",
    bgColor: "#1A1A1A",
    render: "lettermark",
    primary: "#FFFFFF",
  },
];

function BackerTile({ backer }: { backer: Backer }) {
  if (backer.render === "lettermark") {
    return (
      <div
        className="flex h-16 w-40 items-center justify-center rounded-2xl border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
        style={{ backgroundColor: backer.bgColor }}
      >
        <span
          className="font-['Clash_Display'] text-4xl font-bold leading-none"
          style={{ color: backer.primary }}
        >
          {backer.name}
        </span>
      </div>
    );
  }

  if (backer.render === "twoLine") {
    const isStartupGrind = backer.name === "startup grind";
    const isGoogle = backer.name === "Google";
    const isMicrosoft = backer.name === "Microsoft";

    return (
      <div
        className="flex h-16 w-40 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-neutral-900 px-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
        style={{ backgroundColor: backer.bgColor }}
      >
        {isStartupGrind ? (
          <>
            <span className="font-['Satoshi'] text-sm font-black leading-tight" style={{ color: backer.primary }}>
              startup <span style={{ color: backer.accent }}>grind</span>
            </span>
            <span className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-widest" style={{ color: backer.accent }}>
              {backer.secondary}
            </span>
          </>
        ) : isGoogle ? (
          <>
            <span className="font-['Clash_Display'] text-base font-bold leading-tight">
              <span style={{ color: "#4285F4" }}>G</span>
              <span style={{ color: "#EA4335" }}>o</span>
              <span style={{ color: "#FBBC04" }}>o</span>
              <span style={{ color: "#4285F4" }}>g</span>
              <span style={{ color: "#34A853" }}>l</span>
              <span style={{ color: "#EA4335" }}>e</span>
            </span>
            <span className="font-['Satoshi'] text-[10px] font-semibold" style={{ color: "#5F6368" }}>
              for Startups
            </span>
          </>
        ) : isMicrosoft ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="grid grid-cols-2 gap-[2px] w-4 h-4 flex-shrink-0">
                <div className="bg-[#F25022]" />
                <div className="bg-[#7FBA00]" />
                <div className="bg-[#00A4EF]" />
                <div className="bg-[#FFB900]" />
              </div>
              <span className="font-['Satoshi'] text-sm font-bold" style={{ color: backer.primary }}>
                Microsoft
              </span>
            </div>
            <span className="font-['Satoshi'] text-[10px] font-semibold" style={{ color: "#AAAAAA" }}>
              for Startups
            </span>
          </>
        ) : (
          <>
            <span className="font-['Clash_Display'] text-base font-bold leading-tight" style={{ color: backer.primary }}>
              {backer.name}
            </span>
            {backer.secondary && (
              <span className="font-['Satoshi'] text-[10px] font-semibold" style={{ color: backer.accent ?? backer.primary + "99" }}>
                {backer.secondary}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
}

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

        <div className="flex flex-wrap items-end justify-center gap-4 md:gap-6">
          {BACKERS.map((backer) => (
            <div key={backer.name} className="flex flex-col items-center gap-2">
              <BackerTile backer={backer} />
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
