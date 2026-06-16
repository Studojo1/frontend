function MesaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <rect x="4" y="5" width="16" height="2.5" rx="1.25" fill="#1A2B2A" />
          <path d="M5 9 L5 19 L7.5 19 L7.5 12.5 L12 17 L16.5 12.5 L16.5 19 L19 19 L19 9 L12 16 Z" fill="#1A2B2A" />
        </svg>
      </div>
      <span className="font-['Clash_Display'] text-lg font-bold text-white">Mesa</span>
    </div>
  );
}

function StartupGrindLogo() {
  return (
    <div className="leading-[0.95]">
      <div className="font-serif text-base font-bold tracking-tight text-neutral-900">startup</div>
      <div className="font-serif text-base font-bold tracking-tight text-neutral-900">
        grin<span className="text-[#E8192C]">d</span>
      </div>
    </div>
  );
}

function MicrosoftStartupsLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-6 w-6 shrink-0 grid-cols-2 gap-[2px]">
        <div className="bg-[#F25022]" />
        <div className="bg-[#7FBA00]" />
        <div className="bg-[#00A4EF]" />
        <div className="bg-[#FFB900]" />
      </div>
      <div className="h-7 w-px bg-white/30" />
      <div className="leading-tight">
        <div className="font-['Satoshi'] text-sm font-medium text-white">Microsoft</div>
        <div className="font-['Satoshi'] text-xs font-light text-white/80">for Startups</div>
      </div>
    </div>
  );
}

function GoogleStartupsLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
      </svg>
      <div className="leading-tight">
        <div className="font-['Satoshi'] text-sm font-medium text-neutral-900">Google</div>
        <div className="font-['Satoshi'] text-xs font-normal text-neutral-500">for Startups</div>
      </div>
    </div>
  );
}

function EmergentLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            d="M12 4 a8 8 0 1 0 6.5 12.6 M12 12 H20 a8 8 0 0 0 -8 -8"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="font-['Satoshi'] text-base font-semibold text-white">emergent</span>
    </div>
  );
}

const BACKERS = [
  { name: "Mesa", logo: MesaLogo, bg: "#1A2B2A" },
  { name: "Startup Grind", logo: StartupGrindLogo, bg: "#FFFFFF" },
  { name: "Microsoft for Startups", logo: MicrosoftStartupsLogo, bg: "#000000" },
  { name: "Google for Startups", logo: GoogleStartupsLogo, bg: "#FFFFFF" },
  { name: "Emergent", logo: EmergentLogo, bg: "#1A1A1A" },
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
          {BACKERS.map(({ name, logo: Logo, bg }) => (
            <div
              key={name}
              className="flex h-16 w-48 items-center justify-center rounded-2xl border-2 border-neutral-900 px-5 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
              style={{ backgroundColor: bg }}
            >
              <Logo />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
