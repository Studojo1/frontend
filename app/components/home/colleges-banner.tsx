const ROW_ONE = [
  "IIT Bombay", "NUS Singapore", "BITS Pilani", "UCL London", "IIT Delhi",
  "NTU Singapore", "VIT Vellore", "University of Toronto", "IIT Madras",
  "Symbiosis Pune", "NYU", "NIT Trichy", "King's College London",
  "Manipal University", "University of Melbourne", "NMIMS Mumbai",
  "IIT Kharagpur", "Christ University", "UNSW Sydney", "Amity University",
];

const ROW_TWO = [
  "Delhi University", "NIT Warangal", "Monash University", "SRM University",
  "University of Manchester", "BITS Hyderabad", "SMU Singapore",
  "Anna University", "University of Dubai", "Jadavpur University",
  "Panjab University", "University of Warwick", "Thapar University",
  "Northeastern University", "PSG Tech", "Loughborough University",
  "Shiv Nadar University", "University of Bath", "KIIT University",
  "Hult International", "BML Munjal", "University of Queensland",
];

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden relative">
      <div
        className={`flex gap-3 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {doubled.map((college, i) => (
          <span
            key={i}
            className="shrink-0 px-4 py-2 rounded-full border-2 border-studojo-ink bg-white font-['Satoshi'] text-xs font-semibold text-studojo-ink whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(25,26,35,0.08)]"
          >
            {college}
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
