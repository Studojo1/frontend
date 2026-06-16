function MesaLogo() {
  return (
    <svg viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      {/* m icon in rounded square */}
      <rect x="0" y="0" width="32" height="32" rx="6" fill="white" />
      <rect x="7" y="8" width="18" height="3" rx="1.5" fill="#1A2B2A" />
      <path d="M8 13 L8 24 L11 24 L11 17 L16 22 L21 17 L21 24 L24 24 L24 13 L16 20 Z" fill="#1A2B2A" />
      {/* Mesa wordmark */}
      <text x="38" y="22" fontFamily="sans-serif" fontWeight="700" fontSize="14" fill="white">Mesa</text>
    </svg>
  );
}

function StartupGrindLogo() {
  return (
    <svg viewBox="0 0 130 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
      <text x="0" y="20" fontFamily="Georgia, serif" fontWeight="700" fontSize="18" fill="#1A1A1A" letterSpacing="-0.5">startup</text>
      <text x="0" y="40" fontFamily="Georgia, serif" fontWeight="700" fontSize="18" fill="#1A1A1A" letterSpacing="-0.5">grind</text>
      <circle cx="44" cy="34" r="3" fill="#E8192C" />
    </svg>
  );
}

function MicrosoftStartupsLogo() {
  return (
    <svg viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
      {/* Windows 4-square */}
      <rect x="0" y="2" width="14" height="14" fill="#F25022" />
      <rect x="16" y="2" width="14" height="14" fill="#7FBA00" />
      <rect x="0" y="18" width="14" height="14" fill="#00A4EF" />
      <rect x="16" y="18" width="14" height="14" fill="#FFB900" />
      {/* Divider */}
      <line x1="38" y1="4" x2="38" y2="32" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
      <text x="44" y="16" fontFamily="'Segoe UI', sans-serif" fontWeight="300" fontSize="11" fill="white">Microsoft</text>
      <text x="44" y="30" fontFamily="'Segoe UI', sans-serif" fontWeight="300" fontSize="11" fill="white">for Startups</text>
    </svg>
  );
}

function GoogleStartupsLogo() {
  return (
    <svg viewBox="0 0 150 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
      {/* Google G */}
      <path d="M16 18C16 12.48 20.48 8 26 8C28.76 8 31.24 9.08 33.06 10.86L30.24 13.68C29.08 12.56 27.62 12 26 12C22.69 12 20 14.69 20 18C20 21.31 22.69 24 26 24C28.97 24 30.96 22.45 31.64 20H26V16H35.6C35.73 16.65 35.8 17.32 35.8 18C35.8 23.52 31.58 28 26 28C20.48 28 16 23.52 16 18Z" fill="#4285F4" />
      <path d="M35.6 18C35.6 17.32 35.53 16.65 35.4 16H26V20H31.64C30.96 22.45 28.97 24 26 24V28C31.58 28 35.8 23.52 35.8 18H35.6Z" fill="#34A853" />
      <path d="M20 18C20 14.69 22.69 12 26 12V8C20.48 8 16 12.48 16 18C16 20.76 17.08 23.24 18.86 25.06L21.68 22.24C20.62 21.08 20 19.62 20 18Z" fill="#EA4335" />
      <path d="M18.86 25.06C20.68 26.84 23.2 28 26 28V24C24.38 24 22.92 23.44 21.76 22.32L18.86 25.06Z" fill="#FBBC04" />
      <text x="44" y="16" fontFamily="'Product Sans', 'Google Sans', sans-serif" fontWeight="400" fontSize="11" fill="#1A1A1A">Google</text>
      <text x="44" y="30" fontFamily="'Product Sans', 'Google Sans', sans-serif" fontWeight="400" fontSize="11" fill="#5F6368">for Startups</text>
    </svg>
  );
}

function EmergentLogo() {
  return (
    <svg viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
      <circle cx="16" cy="16" r="15" fill="#1A1A1A" stroke="white" strokeWidth="0" />
      <path d="M10 16 C10 11.58 13.58 8 18 8 C20.2 8 22.2 8.9 23.66 10.34 L21.54 12.46 C20.66 11.54 19.4 11 18 11 C15.24 11 13 13.24 13 16 C13 18.76 15.24 21 18 21 C20.06 21 21.8 19.82 22.6 18.1 L18 18.1 L18 15.1 L25.8 15.1 C25.93 15.73 26 16.36 26 17 C26 21.42 22.42 25 18 25 C13.58 25 10 21.42 10 17" fill="white" />
      <text x="36" y="21" fontFamily="sans-serif" fontWeight="600" fontSize="13" fill="white">emergent</text>
    </svg>
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
            Supported by the best in tech
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
          {BACKERS.map(({ name, logo: Logo, bg }) => (
            <div
              key={name}
              className="flex h-16 w-44 items-center justify-center rounded-2xl border-2 border-neutral-900 px-5 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
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
