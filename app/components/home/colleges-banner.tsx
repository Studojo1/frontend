type College = { name: string; logo: string; color: string };

const ROW_ONE: College[] = [
  {
    name: "NUS Singapore",
    logo: "https://upload.wikimedia.org/wikipedia/en/9/9b/NationalUniversityofSingapore.svg",
    color: "#003D7C",
  },
  {
    name: "IIT Bombay",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg",
    color: "#003087",
  },
  {
    name: "UCL London",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/c2/UCL_Logo%2C_plain_background.svg",
    color: "#500778",
  },
  {
    name: "IIT Delhi",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b6/IIT_Delhi_Wordmark_logo.svg",
    color: "#003087",
  },
  {
    name: "NTU Singapore",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f8/Nanyang_Technological_University_coat_of_arms_vector.svg",
    color: "#C8102E",
  },
  {
    name: "University of Toronto",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b5/UofT_logo.svg",
    color: "#003FA5",
  },
  {
    name: "IIT Madras",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/69/IIT_Madras_Logo.svg",
    color: "#003087",
  },
  {
    name: "King's College London",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/King%27s_College_London_logo.svg",
    color: "#8B0000",
  },
  {
    name: "BITS Pilani",
    logo: "https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg",
    color: "#C8102E",
  },
  {
    name: "University of Melbourne",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/50/The_University_of_Melbourne_Logo.svg",
    color: "#003087",
  },
  {
    name: "IIT Kharagpur",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/1c/IIT_Kharagpur_Logo.svg",
    color: "#003087",
  },
  {
    name: "NYU",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/New_York_University_Seal.svg",
    color: "#57068C",
  },
  {
    name: "VIT Vellore",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/c5/Vellore_Institute_of_Technology_seal_2017.svg",
    color: "#00539B",
  },
  {
    name: "UNSW Sydney",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/4d/University_of_New_South_Wales_Logo.png",
    color: "#FFD700",
  },
  {
    name: "NIT Trichy",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/4f/National_Institute_of_Technology%2C_Tiruchirappalli.svg",
    color: "#1A3C6E",
  },
  {
    name: "University of Warwick",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/5b/University_of_Warwick_logo.svg",
    color: "#532D8E",
  },
  {
    name: "Symbiosis Pune",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2a/Logo_of_Symbiosis_International_University.svg",
    color: "#8B1A1A",
  },
  {
    name: "Northeastern University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/NU_RGB_seal_R.png",
    color: "#C8102E",
  },
  {
    name: "Manipal University",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a3/MAHE_logo%281%29.svg",
    color: "#EE2D26",
  },
  {
    name: "SMU Singapore",
    logo: "https://upload.wikimedia.org/wikipedia/en/3/37/Singapore_Management_University_logo.svg",
    color: "#003087",
  },
];

const ROW_TWO: College[] = [
  {
    name: "University of Manchester",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/72/UniOfManchesterLogo.svg",
    color: "#660099",
  },
  {
    name: "Delhi University",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b6/Delhi_University.svg",
    color: "#003087",
  },
  {
    name: "Monash University",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/74/Monash_University_logo-en.svg",
    color: "#006DAE",
  },
  {
    name: "BITS Hyderabad",
    logo: "https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg",
    color: "#C8102E",
  },
  {
    name: "University of Queensland",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/8c/Logo_of_the_University_of_Queensland.svg",
    color: "#51247A",
  },
  {
    name: "SRM University",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/SRM_Institute_of_Science_and_Technology_Logo.svg",
    color: "#C8102E",
  },
  {
    name: "NIT Warangal",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/fb/National_Institute_of_Technology%2C_Warangal_logo.png",
    color: "#1A3C6E",
  },
  {
    name: "Christ University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Christ_University_Official_Logo.png",
    color: "#1A237E",
  },
  {
    name: "Jadavpur University",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/58/Jadavpur_University_Logo.svg",
    color: "#8B0000",
  },
  {
    name: "Hult International",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b6/HULT_IBS_Logo_Outline_Black_%28cropped%29.png",
    color: "#EE2D26",
  },
  {
    name: "NMIMS Mumbai",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/ec/Narsee_Monjee_Institute_of_Management_Studies_Logo.png",
    color: "#8B0000",
  },
  {
    name: "Thapar University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Thapar_Logo.png",
    color: "#003087",
  },
  {
    name: "PSG Tech",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/PSG_College_of_Technology_logo.png",
    color: "#1A3C6E",
  },
  {
    name: "Panjab University",
    logo: "https://upload.wikimedia.org/wikipedia/en/9/96/Panjab_University_logo.png",
    color: "#003087",
  },
  {
    name: "Shiv Nadar University",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/88/Shiv_Nadar_University_logo.png",
    color: "#003087",
  },
  {
    name: "KIIT University",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/ef/KIIT_logo.svg",
    color: "#003087",
  },
  {
    name: "Anna University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Anna_university_01.jpg",
    color: "#003087",
  },
  {
    name: "BML Munjal",
    logo: "https://upload.wikimedia.org/wikipedia/en/9/9d/BML_Munjal_University-Logo.png",
    color: "#003087",
  },
  {
    name: "Amity University",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/ff/Amity_University_logo.png",
    color: "#003087",
  },
];

function MarqueeRow({ items, reverse = false }: { items: College[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden relative">
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
