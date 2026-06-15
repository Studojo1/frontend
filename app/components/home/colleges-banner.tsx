type College = { name: string; logo: string | null; color: string };

const ROW_ONE: College[] = [
  { name: "IIT Bombay", logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg", color: "#003087" },
  { name: "NUS Singapore", logo: "https://upload.wikimedia.org/wikipedia/en/9/9b/NationalUniversityofSingapore.svg", color: "#003D7C" },
  { name: "BITS Pilani", logo: "https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg", color: "#C8102E" },
  { name: "UCL London", logo: "https://upload.wikimedia.org/wikipedia/en/c/c2/UCL_Logo%2C_plain_background.svg", color: "#500778" },
  { name: "IIT Delhi", logo: "https://upload.wikimedia.org/wikipedia/en/b/b6/IIT_Delhi_Wordmark_logo.svg", color: "#003087" },
  { name: "NTU Singapore", logo: "https://upload.wikimedia.org/wikipedia/en/f/f8/Nanyang_Technological_University_coat_of_arms_vector.svg", color: "#C8102E" },
  { name: "VIT Vellore", logo: "https://upload.wikimedia.org/wikipedia/en/c/c5/Vellore_Institute_of_Technology_seal_2017.svg", color: "#00539B" },
  { name: "University of Toronto", logo: "https://upload.wikimedia.org/wikipedia/en/b/b5/UofT_logo.svg", color: "#003FA5" },
  { name: "IIT Madras", logo: "https://upload.wikimedia.org/wikipedia/en/6/69/IIT_Madras_Logo.svg", color: "#003087" },
  { name: "Symbiosis Pune", logo: "https://upload.wikimedia.org/wikipedia/en/2/2a/Logo_of_Symbiosis_International_University.svg", color: "#8B1A1A" },
  { name: "NYU", logo: null, color: "#57068C" },
  { name: "NIT Trichy", logo: null, color: "#1A3C6E" },
  { name: "King's College London", logo: null, color: "#8B0000" },
  { name: "Manipal University", logo: "https://upload.wikimedia.org/wikipedia/en/a/a3/MAHE_logo%281%29.svg", color: "#EE2D26" },
  { name: "University of Melbourne", logo: null, color: "#003087" },
  { name: "NMIMS Mumbai", logo: null, color: "#8B0000" },
  { name: "IIT Kharagpur", logo: null, color: "#003087" },
  { name: "Christ University", logo: null, color: "#1A237E" },
  { name: "UNSW Sydney", logo: null, color: "#FFD700" },
  { name: "Amity University", logo: null, color: "#003087" },
];

const ROW_TWO: College[] = [
  { name: "Delhi University", logo: "https://upload.wikimedia.org/wikipedia/en/b/b6/Delhi_University.svg", color: "#003087" },
  { name: "NIT Warangal", logo: null, color: "#1A3C6E" },
  { name: "Monash University", logo: null, color: "#006DAE" },
  { name: "SRM University", logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/SRM_Institute_of_Science_and_Technology_Logo.svg", color: "#C8102E" },
  { name: "University of Manchester", logo: null, color: "#660099" },
  { name: "BITS Hyderabad", logo: "https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg", color: "#C8102E" },
  { name: "SMU Singapore", logo: null, color: "#003087" },
  { name: "Anna University", logo: null, color: "#003087" },
  { name: "Jadavpur University", logo: null, color: "#8B0000" },
  { name: "Panjab University", logo: null, color: "#003087" },
  { name: "University of Warwick", logo: null, color: "#532D8E" },
  { name: "Thapar University", logo: null, color: "#003087" },
  { name: "Northeastern University", logo: null, color: "#C8102E" },
  { name: "PSG Tech", logo: null, color: "#1A3C6E" },
  { name: "Shiv Nadar University", logo: null, color: "#003087" },
  { name: "KIIT University", logo: null, color: "#003087" },
  { name: "Hult International", logo: null, color: "#EE2D26" },
  { name: "BML Munjal", logo: null, color: "#003087" },
  { name: "University of Queensland", logo: null, color: "#51247A" },
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
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-studojo-ink bg-white font-['Satoshi'] text-sm font-semibold text-studojo-ink whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(25,26,35,0.08)]"
          >
            {college.logo ? (
              <img
                src={college.logo}
                alt=""
                aria-hidden
                className="h-5 w-5 object-contain rounded-sm"
              />
            ) : (
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[8px] font-black text-white"
                style={{ backgroundColor: college.color }}
                aria-hidden
              >
                {college.name.charAt(0)}
              </span>
            )}
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
