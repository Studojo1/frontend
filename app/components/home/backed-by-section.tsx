type Backer = {
  name: string;
  bg: string;
  // logo image rendered inside the tile
  img: string;
  imgClass: string;
  // optional "for Startups" sublabel rendered next to the logo
  sublabel?: string;
  sublabelClass?: string;
};

const BACKERS: Backer[] = [
  {
    name: "Mesa",
    bg: "#1A2B2A",
    img: "/logos/mesa.png",
    imgClass: "h-7 w-auto", // white logo, shows on dark tile
  },
  {
    name: "Startup Grind",
    bg: "#FFFFFF",
    img: "/logos/startupgrind.svg",
    imgClass: "h-8 w-auto", // black + red wordmark on white
  },
  {
    name: "Microsoft for Startups",
    bg: "#FFFFFF",
    img: "/logos/microsoft.svg",
    imgClass: "h-6 w-auto",
    sublabel: "Microsoft for Startups",
    sublabelClass: "text-neutral-800",
  },
  {
    name: "Google for Startups",
    bg: "#FFFFFF",
    img: "/logos/google-g.svg",
    imgClass: "h-6 w-auto",
    sublabel: "Google for Startups",
    sublabelClass: "text-neutral-800",
  },
  {
    name: "Emergent",
    bg: "#1A1A1A",
    img: "/logos/emergent.svg",
    imgClass: "h-5 w-auto brightness-0 invert", // black wordmark -> white on dark tile
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
            Backed by the best in tech
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
          {BACKERS.map((b) => (
            <div
              key={b.name}
              className="flex h-16 w-48 items-center justify-center gap-2.5 rounded-2xl border-2 border-neutral-900 px-5 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
              style={{ backgroundColor: b.bg }}
            >
              <img src={b.img} alt={b.name} className={`shrink-0 object-contain ${b.imgClass}`} />
              {b.sublabel && (
                <span className={`font-['Satoshi'] text-xs font-semibold leading-tight ${b.sublabelClass ?? ""}`}>
                  {b.sublabel}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
