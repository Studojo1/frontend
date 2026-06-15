type College = { name: string; abbr: string; color: string };

const ROW_ONE: College[] = [
  { name: "IIT Bombay", abbr: "IITB", color: "#003087" },
  { name: "NUS Singapore", abbr: "NUS", color: "#003D7C" },
  { name: "BITS Pilani", abbr: "BITS", color: "#C8102E" },
  { name: "UCL London", abbr: "UCL", color: "#500778" },
  { name: "IIT Delhi", abbr: "IITD", color: "#003087" },
  { name: "NTU Singapore", abbr: "NTU", color: "#C8102E" },
  { name: "VIT Vellore", abbr: "VIT", color: "#00539B" },
  { name: "University of Toronto", abbr: "UofT", color: "#003FA5" },
  { name: "IIT Madras", abbr: "IITM", color: "#003087" },
  { name: "Symbiosis Pune", abbr: "SIU", color: "#8B1A1A" },
  { name: "NYU", abbr: "NYU", color: "#57068C" },
  { name: "NIT Trichy", abbr: "NITT", color: "#1A3C6E" },
  { name: "King's College London", abbr: "KCL", color: "#8B0000" },
  { name: "Manipal University", abbr: "MU", color: "#EE2D26" },
  { name: "University of Melbourne", abbr: "UoM", color: "#003087" },
  { name: "NMIMS Mumbai", abbr: "NMIMS", color: "#8B0000" },
  { name: "IIT Kharagpur", abbr: "IITKGP", color: "#003087" },
  { name: "Christ University", abbr: "CU", color: "#1A237E" },
  { name: "UNSW Sydney", abbr: "UNSW", color: "#FFD700" },
  { name: "Amity University", abbr: "AU", color: "#003087" },
];

const ROW_TWO: College[] = [
  { name: "Delhi University", abbr: "DU", color: "#003087" },
  { name: "NIT Warangal", abbr: "NITW", color: "#1A3C6E" },
  { name: "Monash University", abbr: "MU", color: "#006DAE" },
  { name: "SRM University", abbr: "SRM", color: "#C8102E" },
  { name: "University of Manchester", abbr: "UoM", color: "#660099" },
  { name: "BITS Hyderabad", abbr: "BPHC", color: "#C8102E" },
  { name: "SMU Singapore", abbr: "SMU", color: "#003087" },
  { name: "Anna University", abbr: "AU", color: "#003087" },
  { name: "Jadavpur University", abbr: "JU", color: "#8B0000" },
  { name: "Panjab University", abbr: "PU", color: "#003087" },
  { name: "University of Warwick", abbr: "UoW", color: "#532D8E" },
  { name: "Thapar University", abbr: "TU", color: "#003087" },
  { name: "Northeastern University", abbr: "NEU", color: "#C8102E" },
  { name: "PSG Tech", abbr: "PSG", color: "#1A3C6E" },
  { name: "Shiv Nadar University", abbr: "SNU", color: "#003087" },
  { name: "KIIT University", abbr: "KIIT", color: "#003087" },
  { name: "Hult International", abbr: "Hult", color: "#EE2D26" },
  { name: "BML Munjal", abbr: "BMU", color: "#003087" },
  { name: "University of Queensland", abbr: "UQ", color: "#51247A" },
];

function MarqueeRow({ items, reverse = false }: { items: College[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden relative">
      <div
        className={`flex gap-3 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {doubled.map((college, i) => (
          <span
            key={i}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 border-studojo-ink bg-white font-['Satoshi'] text-xs font-semibold text-studojo-ink whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(25,26,35,0.08)]"
          >
            <span
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-[6px] font-black text-white"
              style={{ backgroundColor: college.color }}
              aria-hidden
            >
              {college.abbr.charAt(0)}
            </span>
            {college.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CollegesBanner() {
  return (
    <section className="py-8 bg-studojo-surface-muted border-y-2 border-studojo-ink overflow-hidden">
      <p className="font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-studojo-muted text-center mb-5">
        Students from these colleges use Studojo
      </p>
      <div className="flex flex-col gap-3">
        <MarqueeRow items={ROW_ONE} />
        <MarqueeRow items={ROW_TWO} reverse />
      </div>
    </section>
  );
}
