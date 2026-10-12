// Matches (fictional companies and people), packs, prices and the email
// builder for /jernew. Shared file: owned by the foundation. Import via ./data.
import type { CityId, PackId, QuizAnswers, RoleId, StageStop, Tone } from "./types";
import { monthLabel, roleById, scoreSpecificity, SAMPLE_PROJECT, toneById } from "./data-quiz";

// ── Money ──────────────────────────────────────────────────────────────────

/** Indian digit grouping: 1825 -> "₹1,825", 100000 -> "₹1,00,000", 9.98 -> "₹9.98". */
export function formatINR(value: number, opts: { decimals?: number; symbol?: boolean } = {}): string {
  const decimals = opts.decimals ?? (Number.isInteger(value) ? 0 : 2);
  const [int, frac] = Math.abs(value).toFixed(decimals).split(".");
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const grouped = rest ? `${rest},${last3}` : last3;
  return `${value < 0 ? "-" : ""}${opts.symbol === false ? "" : "₹"}${grouped}${frac ? `.${frac}` : ""}`;
}

/** Plain Indian grouping without the rupee sign, for counts: 1200 -> "1,200". */
export const formatCount = (n: number) => formatINR(Math.round(n), { symbol: false, decimals: 0 });

// ── Matches ─────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  company: string;
  /** What the company does, in a phrase that reads inside a sentence. */
  hook: string;
  sector: string;
  city: CityId | "remote";
  cityLabel: string;
  stage: StageStop;
  stageLabel: string;
  manager: {
    first: string;
    /** Partly masked surname, for example "R•••". Full names unlock after payment. */
    maskedLast: string;
    title: string;
  };
  /** The role they are hiring for, in their words. */
  hiringFor: string;
  /** Roles this match fits best. */
  roles: RoleId[];
  /** Starting fit before the quiz adjusts it. */
  baseFit: number;
  /** One line on why the student fits them. */
  why: string;
  /** Fixed angle on the radar, in degrees. */
  angle: number;
}

/** Twelve FICTIONAL companies and hiring managers. Shown with a "Sample" label. */
export const MATCHES: Match[] = [
  { id: "kitebase", company: "Kitebase", hook: "payments for small shops", sector: "Fintech", city: "bengaluru", cityLabel: "Bengaluru", stage: 1, stageLabel: "Seed",
    manager: { first: "Ananya", maskedLast: "R•••", title: "Engineering Manager" }, hiringFor: "Product engineering intern", roles: ["sde", "frontend"], baseFit: 88,
    why: "Your UPI tracker is their product in miniature: money moving between people who know each other.", angle: 18 },
  { id: "paperplane", company: "Paperplane Health", hook: "appointment reminders for clinics", sector: "Health tech", city: "pune", cityLabel: "Pune", stage: 2, stageLabel: "Series A",
    manager: { first: "Karan", maskedLast: "M•••", title: "Head of Engineering" }, hiringFor: "Full-stack intern", roles: ["sde", "frontend"], baseFit: 84,
    why: "Same city, same stack: React and Node.js on a product with real daily users.", angle: 62 },
  { id: "tandem", company: "Tandem Labs", hook: "developer tools for small teams", sector: "Dev tools", city: "remote", cityLabel: "Remote", stage: 1, stageLabel: "Seed",
    manager: { first: "Meera", maskedLast: "S•••", title: "Founder" }, hiringFor: "Developer advocate intern", roles: ["sde", "growth", "frontend"], baseFit: 81,
    why: "You can build and you can grow a user base. They need exactly that mix.", angle: 104 },
  { id: "quillpay", company: "Quillpay", hook: "payroll for startups", sector: "Fintech", city: "bengaluru", cityLabel: "Bengaluru", stage: 3, stageLabel: "Series B",
    manager: { first: "Arjun", maskedLast: "K•••", title: "Product Lead" }, hiringFor: "Associate product manager", roles: ["product", "sde"], baseFit: 79,
    why: "You shipped a payments product and measured it. That is an APM interview answer already.", angle: 151 },
  { id: "loomwell", company: "Loomwell", hook: "analytics for D2C brands", sector: "B2B SaaS", city: "mumbai", cityLabel: "Mumbai", stage: 2, stageLabel: "Series A",
    manager: { first: "Neha", maskedLast: "D•••", title: "Head of Growth" }, hiringFor: "Growth analyst intern", roles: ["growth", "data"], baseFit: 83,
    why: "You ran growth at a D2C brand and built its cohort dashboard. Their customers are you, last summer.", angle: 196 },
  { id: "seedline", company: "Seedline Agritech", hook: "crop price data for farmers", sector: "Agritech", city: "pune", cityLabel: "Pune", stage: 1, stageLabel: "Seed",
    manager: { first: "Vikram", maskedLast: "P•••", title: "CTO" }, hiringFor: "Data intern", roles: ["data", "ml"], baseFit: 76,
    why: "Your canteen analysis cut waste 18%. Their whole product is that idea at farm scale.", angle: 238 },
  { id: "brightfold", company: "Brightfold", hook: "practice tests for school students", sector: "Edtech", city: "hyderabad", cityLabel: "Hyderabad", stage: 2, stageLabel: "Series A",
    manager: { first: "Sana", maskedLast: "A•••", title: "Engineering Manager" }, hiringFor: "Frontend intern", roles: ["frontend", "sde", "design"], baseFit: 74,
    why: "1,200 students already use something you built. You know this audience.", angle: 279 },
  { id: "monsoon", company: "Monsoon Media", hook: "short news for regional readers", sector: "Media", city: "mumbai", cityLabel: "Mumbai", stage: 2, stageLabel: "Series A",
    manager: { first: "Rohan", maskedLast: "G•••", title: "Growth Lead" }, hiringFor: "Growth intern", roles: ["growth", "data"], baseFit: 72,
    why: "14 campaigns and a lift in repeat orders is the exact proof a growth lead asks for.", angle: 322 },
  { id: "orbitly", company: "Orbitly", hook: "route planning for delivery fleets", sector: "B2B SaaS", city: "bengaluru", cityLabel: "Bengaluru", stage: 2, stageLabel: "Series B",
    manager: { first: "Ishita", maskedLast: "N•••", title: "Data Lead" }, hiringFor: "Data analyst", roles: ["data", "ml", "sde"], baseFit: 70,
    why: "SQL, Python and a habit of turning messy data into one decision.", angle: 40 },
  { id: "fable", company: "Fable Robotics", hook: "warehouse picking robots", sector: "Robotics", city: "chennai", cityLabel: "Chennai", stage: 2, stageLabel: "Series A",
    manager: { first: "Aditya", maskedLast: "V•••", title: "Software Lead" }, hiringFor: "Software intern, fleet tools", roles: ["sde", "cloud"], baseFit: 68,
    why: "Their fleet dashboard is a React app on PostgreSQL. You have shipped that.", angle: 130 },
  { id: "northstar", company: "Northstar Freight", hook: "freight booking for exporters", sector: "Logistics", city: "mumbai", cityLabel: "Mumbai", stage: 3, stageLabel: "Growth stage",
    manager: { first: "Tara", maskedLast: "J•••", title: "Product Manager" }, hiringFor: "Product analyst", roles: ["product", "data"], baseFit: 66,
    why: "A big, process-heavy product that needs someone who measures before they change things.", angle: 218 },
  { id: "cobalt", company: "Cobalt Cloud", hook: "cloud hosting for Indian startups", sector: "Cloud", city: "hyderabad", cityLabel: "Hyderabad", stage: 4, stageLabel: "Large company",
    manager: { first: "Dev", maskedLast: "C•••", title: "Engineering Manager" }, hiringFor: "Graduate engineer, platform", roles: ["cloud", "sde"], baseFit: 64,
    why: "A structured graduate programme with mentors, if you want a big team first.", angle: 300 },
];

/** The headline count on the matches step. A SAMPLE figure: always label it "Sample". */
export const SAMPLE_MATCH_COUNT = 214;

export interface RankedMatch extends Match {
  /** 0 to 100 after the quiz answers are applied. */
  fit: number;
}

/** Applies the quiz answers to each match's fit, then sorts best first. Deterministic. */
export function rankMatches(q: QuizAnswers): RankedMatch[] {
  return MATCHES.map((m) => {
    let fit = m.baseFit;
    if (q.role && m.roles.includes(q.role)) fit += m.roles[0] === q.role ? 7 : 4;
    else if (q.role) fit -= 6;
    if (m.city === "remote" ? q.remote : q.cities.includes(m.city)) fit += 4;
    if (q.stage !== null) fit += 4 - Math.abs(q.stage - m.stage) * 3;
    return { ...m, fit: Math.max(55, Math.min(97, Math.round(fit))) };
  }).sort((a, b) => b.fit - a.fit || a.id.localeCompare(b.id));
}

// ── Packs ───────────────────────────────────────────────────────────────────

export interface Pack {
  id: PackId;
  name: string;
  /** INR, one-time. 0 for Free. */
  price: number;
  /** Emails included. 0 for Free. */
  outreaches: number;
  /** INR per email, or null for Free. */
  perEmail: number | null;
  tagline: string;
  badge?: string;
  includes: string[];
}

export const PACKS: Pack[] = [
  { id: "free", name: "Free", price: 0, outreaches: 0, perEmail: null, tagline: "Just keep my page",
    includes: ["Your Studojo page, link-only", "A preview of your matches", "Unpublish any time"] },
  { id: "starter", name: "Starter", price: 499, outreaches: 50, perEmail: 9.98, tagline: "Test the water",
    includes: ["50 personal emails from your Gmail", "Follow-ups that carry your page", "Reply alerts on your dashboard"] },
  { id: "standard", name: "Standard", price: 1825, outreaches: 200, perEmail: 9.13, tagline: "A proper search",
    includes: ["200 personal emails from your Gmail", "Follow-ups that carry your page", "Reply alerts on your dashboard"] },
  { id: "pro", name: "Pro", price: 3465, outreaches: 500, perEmail: 6.93, tagline: "Cast the widest net", badge: "Best value per email",
    includes: ["500 personal emails from your Gmail", "Follow-ups that carry your page", "Reply alerts on your dashboard"] },
];

export const packById = (id: PackId | null) => PACKS.find((p) => p.id === id) ?? null;

/** After a campaign: more emails to leads already matched, no new questions. */
export const TOP_UP = { price: 999, outreaches: 150 } as const;

/** Say these near any price. Exact wording is fine to reuse. */
export const PACK_RULES = {
  oneTime: "One-time payment. No subscription.",
  recredit: "If an email fails to send, that credit is given back.",
  noGuarantee: "Replies are not guaranteed.",
  hires: "Hires that come from your own emails are yours. No fee, ever.",
} as const;

// ── Gmail ───────────────────────────────────────────────────────────────────

export const GMAIL_SAMPLE_ADDRESS = "you@gmail.com";

/** How sending is paced, in one phrase. Use it wherever pace comes up, so every step agrees. */
export const SEND_PACE = "a steady trickle, never all at once";

/** Permissions in plain words, for the connect step. Matches privacy policy section 6. */
export const GMAIL_PERMISSIONS = [
  { id: "send", title: "Send the emails you approve, from your address", detail: `Only the sequence you approved, ${SEND_PACE}.` },
  { id: "replies", title: "Watch for replies so we can tell you", detail: "We only look at replies and bounce notices for your campaign emails." },
  { id: "disconnect", title: "Disconnect any time", detail: "One click from your dashboard. Sending stops straight away." },
] as const;

// ── Emails ──────────────────────────────────────────────────────────────────

export type EmailId = "first" | "follow" | "nudge";

export interface EmailDraft {
  id: EmailId;
  day: 0 | 4 | 9;
  label: string;
  subject: string;
  /** Paragraphs, in order. Render each as its own <p>. */
  paragraphs: string[];
  /** The follow-up embeds the profile page as a rich card after paragraph 1. */
  pageCard: boolean;
  signoff: string;
}

/** The send timeline track: when each email goes and what it is for. */
export const SEND_TIMELINE: { id: EmailId; day: 0 | 4 | 9; label: string; note: string }[] = [
  { id: "first", day: 0, label: "First email", note: "Short and plain. No links, so it lands like a real note." },
  { id: "follow", day: 4, label: "Follow-up", note: "Carries your page as a card they can open." },
  { id: "nudge", day: 9, label: "Last nudge", note: "One short line, then we stop." },
];

/** The project line used in emails: the student's own text if specific, else the sample. */
export function projectLine(q: QuizAnswers): string {
  const own = q.project.trim().replace(/\s+/g, " ");
  const text = own && scoreSpecificity(own).score >= 55 ? own : SAMPLE_PROJECT;
  const first = text.length > 180 ? `${text.slice(0, 177).trimEnd()}...` : text;
  return /[.!?]$/.test(first) ? first : `${first}.`;
}

const PAST_VERBS = new Set([
  "built", "shipped", "led", "ran", "cut", "made", "designed", "created", "launched", "grew", "wrote", "developed",
  "analysed", "analyzed", "founded", "started", "trained", "deployed", "organised", "organized", "won", "scaled",
  "automated", "redesigned", "improved", "reduced", "increased", "co-founded", "helped", "worked", "managed", "taught",
]);
/** Words that start a clause and read fine lower-cased after a colon. */
const LEAD_WORDS = new Set(["my", "a", "an", "the", "our", "we", "this", "in", "at", "for", "with", "as", "during", "last", "over", "after", "while", "using", "two", "three"]);

const lowerFirst = (t: string) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);

/**
 * Turns the project line into a real sentence, so the email never reads like
 * a mail merge. "Built X" becomes "I recently built X"; anything else becomes
 * "One thing I am proud of: ...". clause is the student's own words as they
 * appear in the sentence, without the closing stop (for highlighting).
 */
export function projectSentence(proj: string): { sentence: string; clause: string } {
  let text = proj.trim();
  const withoutI = text.replace(/^I\s+/, "");
  const first = withoutI.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z-]/g, "") ?? "";
  let clause: string;
  let sentence: string;
  if (PAST_VERBS.has(first)) {
    text = withoutI;
    clause = lowerFirst(text);
    sentence = `I recently ${clause}`;
  } else {
    const lead = LEAD_WORDS.has(text.split(/\s+/)[0]?.toLowerCase() ?? "");
    clause = lead ? lowerFirst(text) : text;
    sentence = `One thing I am proud of: ${clause}`;
  }
  if (!/[.!?]$/.test(sentence)) sentence += ".";
  return { sentence, clause: clause.replace(/[.!?]$/, "") };
}

/** The opening line of the first email, in a given tone. Shared by the quiz preview and the email. */
export function emailOpener(tone: Tone | null, m: Match): string {
  const id = toneById(tone).id;
  return id === "direct"
    ? `I am Riya, a final-year CSE student, and I would like to work on ${m.hook} at ${m.company}.`
    : id === "warm"
      ? `I came across ${m.company}'s work on ${m.hook}, and it is close to what I have spent the last year building.`
      : `I want to help ${m.company} with ${m.hook}, and I think I can show you why quickly.`;
}

/**
 * Builds the three-email sequence to one match, in the quiz tone. With the
 * page private (pageLive false), no email links or embeds it: the recipient
 * would only get a dead link.
 */
export function buildEmailSequence(q: QuizAnswers, m: Match, pageUrl: string, pageLive = true): EmailDraft[] {
  const tone = toneById(q.tone);
  const role = roleById(q.role);
  const noun = q.jobType === "fulltime" ? role.fulltime : role.intern;
  const when = q.jobType === "fulltime" ? "for 2027" : `from ${monthLabel(q.startMonth)}`;
  const article = /^[aeiou]/i.test(noun) ? "an" : "a";
  const proj = projectSentence(projectLine(q)).sentence;
  const hi = `Hi ${m.manager.first},`;
  const opener = emailOpener(tone.id, m);
  const subject =
    tone.id === "direct"
      ? `${noun.charAt(0).toUpperCase()}${noun.slice(1)} ${when}?`
      : tone.id === "warm"
        ? `Your work on ${m.hook}`
        : `I would like to build for ${m.company}`;

  return [
    { id: "first", day: 0, label: "First email", subject, signoff: tone.signoff, pageCard: false,
      paragraphs: [hi, opener, proj, `Are you taking on ${article} ${noun} ${when}? Happy to share more.`] },
    { id: "follow", day: 4, label: "Follow-up", subject: `Re: ${subject}`, signoff: tone.signoff, pageCard: pageLive,
      paragraphs: [hi, pageLive
        ? "Following up in case this got buried. I put my projects in one place so it is quick to check:"
        : "Following up in case this got buried. Happy to send a short summary of my projects if useful.",
        `If ${article} ${noun} is not open right now, who would be the right person to ask?`] },
    { id: "nudge", day: 9, label: "Last nudge", subject: `Re: ${subject}`, signoff: tone.signoff, pageCard: false,
      paragraphs: [hi, pageLive
        ? `Last note from me. If the timing is off, no worries at all. My page stays up if anything opens later: ${pageUrl}`
        : "Last note from me. If the timing is off, no worries at all. I would be glad to hear from you if anything opens later."] },
  ];
}
