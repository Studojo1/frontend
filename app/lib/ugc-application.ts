// The Creator Program (LinkedIn UGC) application: the questions, the answers
// each one accepts, and one validator shared by the form (instant feedback)
// and /api/ugc-apply (the authority). No server imports, so the page can use
// it too.
//
// The form asks for far more than contact details on purpose: the team picks
// creators by what they already do on LinkedIn and where they are headed, not
// by what they promise. Stories are asked for after shortlisting, not here.

export const YEARS_OF_STUDY = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Final year", "Graduated"] as const;

export const CONNECTIONS = ["Under 100", "100-300", "300-500", "500-1,000", "1,000+"] as const;

export const POST_FREQUENCY = ["I haven't posted yet", "A few times ever", "About once a month", "Every week or more"] as const;

export const LAST_POSTED = ["In the last week", "In the last month", "1-6 months ago", "More than 6 months ago", "Never"] as const;

export const CROSSED_1K = ["Yes", "No"] as const;

export const FIELDS = [
  "Computer Science / IT",
  "Data / AI",
  "Product",
  "Finance",
  "Consulting",
  "Marketing",
  "Sales / Business development",
  "Design",
  "HR / People",
  "Operations",
  "Core engineering",
  "Law",
  "Media / Content",
  "Other",
] as const;

export const LOOKING_FOR = ["An internship", "A full-time job", "Exploring options", "Building my own thing"] as const;

export const TOPICS = [
  "Internships and first jobs",
  "Placements and interviews",
  "Rejections and comebacks",
  "College life",
  "Projects and building things",
  "Career switches",
  "AI and tools",
  "Productivity and habits",
  "Startups",
  "Money and personal finance",
  "Leadership and clubs",
] as const;

export const CAN_COMMIT = ["Yes, 3 posts a week for 4 weeks", "I can do 1-2 posts a week", "Not right now"] as const;

export const STUDOJO_OK = ["Yes, that's fine", "I'd like to know more first"] as const;

export const REFERRAL_SOURCES = [
  "A LinkedIn post",
  "A friend",
  "A Studojo campus ambassador",
  "A WhatsApp group",
  "Instagram",
  "Other",
] as const;

export const LIMITS = {
  name: 120,
  email: 200,
  whatsapp: 30,
  college: 160,
  course: 120,
  city: 80,
  url: 300,
  roles: 200,
  companies: 200,
  avoid: 300,
  why: 600,
  whyMin: 10,
  referredBy: 120,
  topicsMax: 5,
} as const;

/** Share codes: 8 lowercase letters and digits, one per applicant. */
export const SHARE_CODE = /^[a-z0-9]{8}$/;

export interface UgcApplication {
  fullName: string;
  email: string;
  whatsapp: string;
  college: string;
  course: string;
  yearOfStudy: string;
  graduationYear: string | null;
  city: string;
  /** False when they said they don't have LinkedIn; every LinkedIn answer is then null. */
  hasLinkedin: boolean;
  linkedinUrl: string | null;
  connections: string | null;
  postFrequency: string | null;
  lastPosted: string | null;
  bestPostUrl: string | null;
  crossed1k: string | null;
  field: string;
  targetRoles: string;
  dreamCompanies: string | null;
  lookingFor: string;
  topics: string[];
  avoidTopics: string | null;
  canCommit: string;
  studojoOk: string;
  whyJoin: string;
  referralSource: string | null;
  referredBy: string | null;
  /** The share code of the applicant whose link brought them here, if any. */
  cameFromCode: string | null;
}

/** A field the form can point at when something is wrong. */
export type UgcField = Exclude<keyof UgcApplication, "hasLinkedin" | "cameFromCode"> | "consent";

export type UgcValidation =
  | { ok: true; value: UgcApplication }
  | { ok: false; field: UgcField; error: string };

/** The form's steps, in order, and which answers live on each. */
export const STEPS: { title: string; fields: UgcField[] }[] = [
  { title: "About you", fields: ["fullName", "email", "whatsapp", "college", "course", "yearOfStudy", "graduationYear", "city"] },
  { title: "Your LinkedIn", fields: ["linkedinUrl", "connections", "postFrequency", "lastPosted", "bestPostUrl", "crossed1k"] },
  { title: "Where you're headed", fields: ["field", "targetRoles", "lookingFor", "dreamCompanies", "topics", "avoidTopics"] },
  { title: "Last bit", fields: ["canCommit", "studojoOk", "whyJoin", "referralSource", "referredBy", "consent"] },
];

export function stepOf(field: UgcField): number {
  const i = STEPS.findIndex((s) => s.fields.includes(field));
  return i < 0 ? 0 : i;
}

// Control characters (a NUL makes Postgres reject the insert) and invisible or
// direction-changing characters, which can disguise text in the admin panel.
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const HIDDEN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;

/** Only real strings count as answers: a number or an object is treated as blank. */
function str(v: unknown): string {
  return typeof v === "string" ? v.replace(HIDDEN, "") : "";
}

/** One line of text: collapse whitespace, trim, cap. */
function line(v: unknown, max: number): string {
  return str(v).replace(/\s+/g, " ").trim().slice(0, max);
}

/** Free text that keeps its paragraphs. */
function para(v: unknown, max: number): string {
  return str(v)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function oneOf(list: readonly string[], v: unknown): string | null {
  return typeof v === "string" && list.includes(v) ? v : null;
}

/**
 * A LinkedIn profile link in any of the shapes people paste ("linkedin.com/in/x",
 * "https://in.linkedin.com/in/x/?utm=..."), returned as one canonical URL, or
 * null when it is not a profile link.
 */
export function normalizeLinkedInProfile(raw: unknown): string | null {
  const s = str(raw).trim();
  const m = /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/in\/([^/?#\s]+)\/?(?:[?#]\S*)?$/i.exec(s);
  if (!m) return null;
  const slug = m[1];
  if (slug.length < 3 || slug.length > 100 || !/^[\w%.-]+$/u.test(slug)) return null;
  return `https://www.linkedin.com/in/${slug}`;
}

/** A link to a LinkedIn post or article, or null. Query strings are dropped. */
export function normalizeLinkedInPost(raw: unknown): string | null {
  const s = str(raw).trim();
  if (s.length > LIMITS.url) return null;
  const m =
    /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/(posts\/[\w%.-]+|feed\/update\/urn:li:(?:activity|share|ugcPost):\d+|pulse\/[\w%.-]+)\/?(?:[?#]\S*)?$/i.exec(s);
  if (!m || m[1].includes("..")) return null;
  return `https://www.linkedin.com/${m[1]}`;
}

/**
 * A WhatsApp number as +<country><number>. A bare 10-digit Indian mobile
 * (starting 6-9) gets +91. Anything that is not 10 to 15 digits is rejected.
 */
export function normalizeWhatsapp(raw: unknown): string | null {
  const s = str(raw).trim();
  if (!/^\+?[\d\s()-]+$/.test(s)) return null;
  let digits = s.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10 && /^[6-9]/.test(digits) && !s.startsWith("+")) return `+91${digits}`;
  if (digits.length < 10 || digits.length > 15) return null;
  return `+${digits}`;
}

const BASIC_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates and normalises an application. Checks run in the order of the
 * form's steps, so the first error is always on the earliest step that needs
 * attention. `checkEmail` lets the caller plug in the stricter typo check
 * (gmail.cok and friends); it returns an error message or null.
 *
 * `noLinkedin: true` means the applicant said they have no LinkedIn profile:
 * the LinkedIn questions are then skipped and stored as null.
 */
export function validateUgcApplication(
  body: Record<string, unknown>,
  checkEmail: (email: string) => string | null = (e) => (BASIC_EMAIL.test(e) ? null : "Please enter a valid email address."),
): UgcValidation {
  const fail = (field: UgcField, error: string): UgcValidation => ({ ok: false, field, error });

  // Step 1: about you
  const fullName = line(body.fullName, LIMITS.name);
  if (fullName.length < 2) return fail("fullName", "Please enter your full name.");
  const email = line(body.email, LIMITS.email).toLowerCase();
  if (!email) return fail("email", "Please enter your email address.");
  const emailError = checkEmail(email);
  if (emailError) return fail("email", emailError);
  if (!line(body.whatsapp, LIMITS.whatsapp)) return fail("whatsapp", "Please enter your WhatsApp number.");
  const whatsapp = normalizeWhatsapp(body.whatsapp);
  if (!whatsapp) return fail("whatsapp", "That doesn't look like a phone number. Use 10 digits, or + and your country code.");
  const college = line(body.college, LIMITS.college);
  if (college.length < 2) return fail("college", "Please tell us your college or university.");
  const course = line(body.course, LIMITS.course);
  if (course.length < 2) return fail("course", "Please tell us your course or degree.");
  const yearOfStudy = oneOf(YEARS_OF_STUDY, body.yearOfStudy);
  if (!yearOfStudy) return fail("yearOfStudy", "Please pick your year of study.");
  const graduationYear = /^\d{4}$/.test(str(body.graduationYear)) ? str(body.graduationYear) : null;
  const city = line(body.city, LIMITS.city);
  if (city.length < 2) return fail("city", "Please tell us which city you're in.");

  // Step 2: LinkedIn (skipped entirely when they have none)
  const hasLinkedin = body.noLinkedin !== true;
  let linkedinUrl: string | null = null;
  let connections: string | null = null;
  let postFrequency: string | null = null;
  let lastPosted: string | null = null;
  let bestPostUrl: string | null = null;
  let crossed1k: string | null = null;
  if (hasLinkedin) {
    if (!line(body.linkedinUrl, LIMITS.url)) return fail("linkedinUrl", "Please paste your LinkedIn profile link.");
    linkedinUrl = normalizeLinkedInProfile(body.linkedinUrl);
    if (!linkedinUrl) return fail("linkedinUrl", "Paste your profile link. It looks like linkedin.com/in/your-name.");
    connections = oneOf(CONNECTIONS, body.connections);
    if (!connections) return fail("connections", "Please pick roughly how many connections you have.");
    postFrequency = oneOf(POST_FREQUENCY, body.postFrequency);
    if (!postFrequency) return fail("postFrequency", "Please tell us how often you post.");
    lastPosted = oneOf(LAST_POSTED, body.lastPosted);
    if (!lastPosted) return fail("lastPosted", "Please tell us when you last posted.");
    if (line(body.bestPostUrl, LIMITS.url)) {
      bestPostUrl = normalizeLinkedInPost(body.bestPostUrl);
      if (!bestPostUrl) return fail("bestPostUrl", "That isn't a LinkedIn post link. Leave it empty if you don't have one.");
    }
    crossed1k = oneOf(CROSSED_1K, body.crossed1k);
    if (!crossed1k) return fail("crossed1k", "Please answer yes or no.");
  }

  // Step 3: direction
  const field = oneOf(FIELDS, body.field);
  if (!field) return fail("field", "Please pick your field.");
  const targetRoles = line(body.targetRoles, LIMITS.roles);
  if (targetRoles.length < 2) return fail("targetRoles", "Tell us the roles you're aiming for, even roughly.");
  const lookingFor = oneOf(LOOKING_FOR, body.lookingFor);
  if (!lookingFor) return fail("lookingFor", "Please tell us what you're looking for right now.");
  const dreamCompanies = line(body.dreamCompanies, LIMITS.companies) || null;
  const rawTopics: unknown[] = Array.isArray(body.topics) ? body.topics : [];
  const topics = [...new Set(rawTopics.filter((t): t is string => typeof t === "string"))].filter((t) =>
    (TOPICS as readonly string[]).includes(t),
  );
  if (!topics.length) return fail("topics", "Pick at least one topic you'd enjoy posting about.");
  if (topics.length > LIMITS.topicsMax) return fail("topics", `Pick up to ${LIMITS.topicsMax} topics.`);
  const avoidTopics = line(body.avoidTopics, LIMITS.avoid) || null;

  // Step 4: commitment and consent
  const canCommit = oneOf(CAN_COMMIT, body.canCommit);
  if (!canCommit) return fail("canCommit", "Please tell us how much you can post.");
  const studojoOk = oneOf(STUDOJO_OK, body.studojoOk);
  if (!studojoOk) return fail("studojoOk", "Please answer this one.");
  const whyJoin = para(body.whyJoin, LIMITS.why);
  if (whyJoin.length < LIMITS.whyMin)
    return fail("whyJoin", `Tell us in a line or two why you want to join (at least ${LIMITS.whyMin} characters).`);
  const referralSource = oneOf(REFERRAL_SOURCES, body.referralSource);
  const referredBy = line(body.referredBy, LIMITS.referredBy) || null;
  if (body.consent !== true) return fail("consent", "Please tick the box so we can contact you about the program.");

  // Attribution from a share link; a malformed code is ignored, never an error.
  const code = str(body.cameFromCode).trim().toLowerCase();
  const cameFromCode = SHARE_CODE.test(code) ? code : null;

  return {
    ok: true,
    value: {
      fullName, email, whatsapp, college, course, yearOfStudy, graduationYear, city,
      hasLinkedin, linkedinUrl, connections, postFrequency, lastPosted, bestPostUrl, crossed1k,
      field, targetRoles, dreamCompanies, lookingFor, topics, avoidTopics,
      canCommit, studojoOk, whyJoin, referralSource, referredBy, cameFromCode,
    },
  };
}
