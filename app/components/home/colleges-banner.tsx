// Logos are self-hosted 56px PNGs (public/logos/colleges). They used to be
// hotlinked from Wikimedia at full size: about 14 MB per homepage view,
// including an 8.5 MB photo and a 2.6 MB PNG, all shown at 28px (PH-01).
type College = { name: string; logo: string; color: string };

const ROW_ONE: College[] = [
  {
    name: "NUS Singapore",
    logo: "/logos/colleges/nationaluniversityofsingapore.png",
    color: "#003D7C",
  },
  {
    name: "IIT Bombay",
    logo: "/logos/colleges/indian-institute-of-technology-bombay-logo.png",
    color: "#003087",
  },
  {
    name: "UCL London",
    logo: "/logos/colleges/ucl-logo-plain-background.png",
    color: "#500778",
  },
  {
    name: "IIT Delhi",
    logo: "/logos/colleges/iit-delhi-wordmark-logo.png",
    color: "#003087",
  },
  {
    name: "NTU Singapore",
    logo: "/logos/colleges/nanyang-technological-university-coat-of-arms-vector.png",
    color: "#C8102E",
  },
  {
    name: "University of Toronto",
    logo: "/logos/colleges/uoft-logo.png",
    color: "#003FA5",
  },
  {
    name: "IIT Madras",
    logo: "/logos/colleges/iit-madras-logo.png",
    color: "#003087",
  },
  {
    name: "King's College London",
    logo: "/logos/colleges/king-s-college-london-logo.png",
    color: "#8B0000",
  },
  {
    name: "BITS Pilani",
    logo: "/logos/colleges/bits-pilani-logo.png",
    color: "#C8102E",
  },
  {
    name: "University of Melbourne",
    logo: "/logos/colleges/the-university-of-melbourne-logo.png",
    color: "#003087",
  },
  {
    name: "IIT Kharagpur",
    logo: "/logos/colleges/iit-kharagpur-logo.png",
    color: "#003087",
  },
  {
    name: "NYU",
    logo: "/logos/colleges/new-york-university-seal.png",
    color: "#57068C",
  },
  {
    name: "VIT Vellore",
    logo: "/logos/colleges/vellore-institute-of-technology-seal-2017.png",
    color: "#00539B",
  },
  {
    name: "UNSW Sydney",
    logo: "/logos/colleges/university-of-new-south-wales-logo.png",
    color: "#FFD700",
  },
  {
    name: "NIT Trichy",
    logo: "/logos/colleges/national-institute-of-technology-tiruchirappalli.png",
    color: "#1A3C6E",
  },
  {
    name: "University of Warwick",
    logo: "/logos/colleges/university-of-warwick-logo.png",
    color: "#532D8E",
  },
  {
    name: "Symbiosis Pune",
    logo: "/logos/colleges/logo-of-symbiosis-international-university.png",
    color: "#8B1A1A",
  },
  {
    name: "Northeastern University",
    logo: "/logos/colleges/nu-rgb-seal-r.png",
    color: "#C8102E",
  },
  {
    name: "Manipal University",
    logo: "/logos/colleges/mahe-logo-1.png",
    color: "#EE2D26",
  },
  {
    name: "SMU Singapore",
    logo: "/logos/colleges/singapore-management-university-logo.png",
    color: "#003087",
  },
];

const ROW_TWO: College[] = [
  {
    name: "University of Manchester",
    logo: "/logos/colleges/uniofmanchesterlogo.png",
    color: "#660099",
  },
  {
    name: "Delhi University",
    logo: "/logos/colleges/delhi-university.png",
    color: "#003087",
  },
  {
    name: "Monash University",
    logo: "/logos/colleges/monash-university-logo-en.png",
    color: "#006DAE",
  },
  {
    name: "BITS Hyderabad",
    logo: "/logos/colleges/bits-pilani-logo.png",
    color: "#C8102E",
  },
  {
    name: "University of Queensland",
    logo: "/logos/colleges/logo-of-the-university-of-queensland.png",
    color: "#51247A",
  },
  {
    name: "SRM University",
    logo: "/logos/colleges/srm-institute-of-science-and-technology-logo.png",
    color: "#C8102E",
  },
  {
    name: "NIT Warangal",
    logo: "/logos/colleges/national-institute-of-technology-warangal-logo.png",
    color: "#1A3C6E",
  },
  {
    name: "Christ University",
    logo: "/logos/colleges/christ-university-official-logo.png",
    color: "#1A237E",
  },
  {
    name: "Jadavpur University",
    logo: "/logos/colleges/jadavpur-university-logo.png",
    color: "#8B0000",
  },
  {
    name: "Hult International",
    logo: "/logos/colleges/hult-ibs-logo-outline-black-cropped.png",
    color: "#EE2D26",
  },
  {
    name: "NMIMS Mumbai",
    logo: "/logos/colleges/narsee-monjee-institute-of-management-studies-logo.png",
    color: "#8B0000",
  },
  {
    name: "Thapar University",
    logo: "/logos/colleges/thapar-logo.png",
    color: "#003087",
  },
  {
    name: "PSG Tech",
    logo: "/logos/colleges/psg-college-of-technology-logo.png",
    color: "#1A3C6E",
  },
  {
    name: "Panjab University",
    logo: "/logos/colleges/panjab-university-logo.png",
    color: "#003087",
  },
  {
    name: "Shiv Nadar University",
    logo: "/logos/colleges/shiv-nadar-university-logo.png",
    color: "#003087",
  },
  {
    name: "KIIT University",
    logo: "/logos/colleges/kiit-logo.png",
    color: "#003087",
  },
  {
    name: "Anna University",
    logo: "/logos/colleges/anna-university-01.png",
    color: "#003087",
  },
  {
    name: "BML Munjal",
    logo: "/logos/colleges/bml-munjal-university-logo.png",
    color: "#003087",
  },
  {
    name: "Amity University",
    logo: "/logos/colleges/amity-university-logo.png",
    color: "#003087",
  },
];

function MarqueeRow({ items, reverse = false }: { items: College[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    // Fade the edges so names slide out instead of being cut mid-word (VS-V07).
    <div className="overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex items-center gap-8 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {doubled.map((college, i) => (
          <span
            key={i}
            className="shrink-0 flex items-center gap-2.5 font-['Satoshi'] text-sm font-semibold text-studojo-ink whitespace-nowrap"
          >
            <img
              src={college.logo}
              alt=""
              aria-hidden
              width={28}
              height={28}
              loading="lazy"
              decoding="async"
              className="h-7 w-7 object-contain rounded-sm flex-shrink-0"
            />
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
