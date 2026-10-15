// The one shape the student page draws, filled from the page the student
// approved in /flow (app/lib/student-page.server.ts). Anything a real page may
// not have is optional or may be empty, and the components skip it.
// Copied from Studojo1/outreach-flow (app/components/profile-ideas/v2/types.ts);
// keep the two in step.

/** One resume line, as saved with the page. Claims and entries point at these ids. */
export type Line = { id: string; section: string; text: string; strong?: boolean };

/** A logo tile: the org's name, its initials and a colour pair. */
export type Org = { name: string; short: string; tint: string; ink: string };

export type Stint = {
  id: string;
  title: string;
  org: Org;
  /** Hide the org line when it only repeats the title (a project with no org). */
  hideOrg?: boolean;
  from?: string;
  to?: string;
  /** "3 mos", "4 yrs": only when both dates are known. */
  span?: string;
  place?: string;
  note?: string;
  /** Resume lines this entry was read from. */
  evidence: string[];
};

export type Profile = {
  name: string;
  first: string;
  initials: string;
  /** Only when the student chose to show their photo. */
  photo: string | null;
  headline: string;
  about: string;
  city: string;
  college: string;
  degree: string;
  /** Short degree for tight spots ("BBA", "B.Tech"), or "". */
  degreeShort: string;
  classOf: string;
  /** Only when the student allows contact; otherwise every Email button is hidden. */
  email: string | null;
  /** Without the protocol: "studojo.pro/flow/p/riya-menon-c1m". */
  url: string;
  slug: string;
  /** The org tile shown on the profile card, if any. */
  feature?: { org: Org };
  /** What they want, from the six questions. Empty strings when not answered. */
  target: {
    role: string;
    start: string;
    type: string;
    stage: string;
    cities: { code: string; label: string }[];
    remote: boolean;
  };
  numbers: { value: string; label: string; evidence: string[] }[];
  experience: Stint[];
  projects: Stint[];
  education: Stint[];
  /** Each skill with where it was used ("Resume" when only listed). */
  skills: { name: string; where: string; org?: Org; evidence: string[] }[];
  prompts: { q: string; a: string }[];
  claims: { id: string; section: string; text: string; evidence: string[] }[];
  lines: Line[];
  /** Resume lines behind the hero's name, college and class fields. */
  src: { name: string[]; college: string[]; classOf: string[] };
};

/** Every hero gets the same props and owns the top of the page (desktop and phone). */
export type HeroProps<P extends Profile = Profile> = { p: P; reduced: boolean };

/** The page's own resume lines behind a piece of the profile, in resume order. */
export const linesFor = (lines: Line[], ids: string[]) => lines.filter((l) => ids.includes(l.id));

/** "Education", "Experience"...; "" for the header. */
export const SECTION_LABEL: Record<string, string> = {
  header: "",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  extra: "Leadership",
};

const IATA: Record<string, string> = {
  Pune: "PNQ", Bengaluru: "BLR", Bangalore: "BLR", Mumbai: "BOM", Delhi: "DEL", "Delhi NCR": "DEL", "New Delhi": "DEL", Hyderabad: "HYD", Chennai: "MAA",
  Kolkata: "CCU", Gurugram: "GGN", Gurgaon: "GGN", Noida: "NDA", Ahmedabad: "AMD", Jaipur: "JAI", Chandigarh: "IXC", Kochi: "COK", Indore: "IDR",
  Coimbatore: "CJB", Lucknow: "LKO", Bhubaneswar: "BBI", Goa: "GOI", Dubai: "DXB", Singapore: "SIN", London: "LHR", Berlin: "BER", "New York": "NYC", Toronto: "YYZ",
};

/** Three-letter code for a place: the airport when we know it, else its first letters. */
export const cityCode = (city: string) => IATA[city] ?? city.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();

/** The proof list's section labels (outreach-flow app/components/jernew/data.ts). */
export const CLAIM_SECTION_LABEL = {
  intro: "About",
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  more: "Also",
} as const;
