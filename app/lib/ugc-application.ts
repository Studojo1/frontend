// The Creator Program (LinkedIn UGC) application: the questions, the answers
// each one accepts, and one validator shared by the form (instant feedback)
// and /api/ugc-apply (the authority). No server imports, so the page can use
// it too.
//
// The form asks for far more than contact details on purpose: the team writes
// each creator's posts from these answers, and picks creators by what they
// already do on LinkedIn rather than by what they promise.

export const YEARS_OF_STUDY = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Final year", "Graduated"] as const;

export const FOLLOWERS = ["Under 100", "100-300", "300-500", "500-1,000", "1,000-5,000", "5,000+"] as const;

export const POST_FREQUENCY = ["I haven't posted yet", "A few times ever", "About once a month", "Every week or more"] as const;

export const LAST_POSTED = ["In the last week", "In the last month", "1-6 months ago", "More than 6 months ago", "Never"] as const;

export const CROSSED_1K = ["Yes", "No", "Not sure"] as const;

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

export const TONES = ["Honest and reflective", "Light and funny", "Sharp and professional", "Storyteller"] as const;

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

export const STORY_PROMPTS = [
  {
    key: "storyWork",
    title: "An internship, job or project you've done",
    hint: "What did you actually do, and what surprised you?",
    placeholder:
      "e.g. I interned at a small fintech for two months. I thought I'd build models, but most of it was cleaning data for the ops team. What surprised me was...",
  },
  {
    key: "storySetback",
    title: "A rejection, or a time something didn't go to plan",
    hint: "What happened, and what did you do next?",
    placeholder:
      "e.g. I got through four rounds at a consulting firm and was rejected in the last one. The feedback was that I took too long to structure my answer, so I...",
  },
  {
    key: "storyLesson",
    title: "Something you learned the hard way",
    hint: "What do you wish someone had told you earlier?",
    placeholder: "e.g. Applying to 200 jobs on portals got me nothing. Two messages to real people got me an interview...",
  },
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
  story: 1500,
  storyMin: 60,
  why: 600,
  whyMin: 20,
  referredBy: 120,
  topicsMax: 5,
} as const;

export interface UgcApplication {
  fullName: string;
  email: string;
  whatsapp: string;
  college: string;
  course: string;
  yearOfStudy: string;
  graduationYear: string | null;
  city: string | null;
  linkedinUrl: string;
  followers: string;
  postFrequency: string;
  lastPosted: string;
  bestPostUrl: string | null;
  crossed1k: string | null;
  field: string;
  targetRoles: string;
  dreamCompanies: string | null;
  lookingFor: string;
  topics: string[];
  avoidTopics: string | null;
  storyWork: string | null;
  storySetback: string | null;
  storyLesson: string | null;
  tone: string | null;
  canCommit: string;
  studojoOk: string;
  whyJoin: string;
  referralSource: string | null;
  referredBy: string | null;
}

/** A field the form can point at when something is wrong. "stories" means the
 * three story boxes as a group. */
export type UgcField = keyof UgcApplication | "stories" | "consent";

export type UgcValidation =
  | { ok: true; value: UgcApplication }
  | { ok: false; field: UgcField; error: string };

/** The form's steps, in order, and which answers live on each. */
export const STEPS: { title: string; fields: UgcField[] }[] = [
  { title: "About you", fields: ["fullName", "email", "whatsapp", "college", "course", "yearOfStudy", "graduationYear", "city"] },
  { title: "Your LinkedIn", fields: ["linkedinUrl", "followers", "postFrequency", "lastPosted", "bestPostUrl", "crossed1k"] },
  { title: "Where you're headed", fields: ["field", "targetRoles", "lookingFor", "dreamCompanies", "topics", "avoidTopics"] },
  { title: "Your stories", fields: ["stories", "storyWork", "storySetback", "storyLesson", "tone"] },
  { title: "Last bit", fields: ["canCommit", "studojoOk", "whyJoin", "referralSource", "referredBy", "consent"] },
];

export function stepOf(field: UgcField): number {
  const i = STEPS.findIndex((s) => s.fields.includes(field));
  return i < 0 ? 0 : i;
}

/** One line of text: collapse whitespace, trim, cap. */
function line(v: unknown, max: number): string {
  return String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Free text that keeps its paragraphs. */
function para(v: unknown, max: number): string {
  return String(v ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function oneOf(list: readonly string[], v: unknown): string | null {
  const s = String(v ?? "");
  return list.includes(s) ? s : null;
}

/**
 * A LinkedIn profile link in any of the shapes people paste ("linkedin.com/in/x",
 * "https://in.linkedin.com/in/x/?utm=..."), returned as one canonical URL, or
 * null when it is not a profile link.
 */
export function normalizeLinkedInProfile(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  const m = /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/in\/([^/?#\s]+)\/?(?:[?#]\S*)?$/i.exec(s);
  if (!m) return null;
  const slug = m[1];
  if (slug.length < 3 || slug.length > 100 || !/^[\w%.-]+$/u.test(slug)) return null;
  return `https://www.linkedin.com/in/${slug}`;
}

/** A link to a LinkedIn post or article, or null. */
export function normalizeLinkedInPost(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  const m = /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/((?:posts|feed\/update|pulse)\/[^\s"'<>]+)$/i.exec(s);
  if (!m || s.length > LIMITS.url) return null;
  return `https://www.linkedin.com/${m[1]}`;
}

/**
 * A WhatsApp number as +<country><number>. A bare 10-digit Indian mobile
 * (starting 6-9) gets +91. Anything that is not 10 to 15 digits is rejected.
 */
export function normalizeWhatsapp(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
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
  const graduationYear = /^\d{4}$/.test(String(body.graduationYear ?? "")) ? String(body.graduationYear) : null;
  const city = line(body.city, LIMITS.city) || null;

  // Step 2: LinkedIn
  if (!line(body.linkedinUrl, LIMITS.url)) return fail("linkedinUrl", "Please paste your LinkedIn profile link.");
  const linkedinUrl = normalizeLinkedInProfile(body.linkedinUrl);
  if (!linkedinUrl) return fail("linkedinUrl", "Paste your profile link. It looks like linkedin.com/in/your-name.");
  const followers = oneOf(FOLLOWERS, body.followers);
  if (!followers) return fail("followers", "Please pick roughly how many followers you have.");
  const postFrequency = oneOf(POST_FREQUENCY, body.postFrequency);
  if (!postFrequency) return fail("postFrequency", "Please tell us how often you post.");
  const lastPosted = oneOf(LAST_POSTED, body.lastPosted);
  if (!lastPosted) return fail("lastPosted", "Please tell us when you last posted.");
  let bestPostUrl: string | null = null;
  if (line(body.bestPostUrl, LIMITS.url)) {
    bestPostUrl = normalizeLinkedInPost(body.bestPostUrl);
    if (!bestPostUrl) return fail("bestPostUrl", "That isn't a LinkedIn post link. Leave it empty if you don't have one.");
  }
  const crossed1k = oneOf(CROSSED_1K, body.crossed1k);

  // Step 3: direction
  const field = oneOf(FIELDS, body.field);
  if (!field) return fail("field", "Please pick your field.");
  const targetRoles = line(body.targetRoles, LIMITS.roles);
  if (targetRoles.length < 3) return fail("targetRoles", "Tell us the roles you're aiming for, even roughly.");
  const lookingFor = oneOf(LOOKING_FOR, body.lookingFor);
  if (!lookingFor) return fail("lookingFor", "Please tell us what you're looking for right now.");
  const dreamCompanies = line(body.dreamCompanies, LIMITS.companies) || null;
  const rawTopics = Array.isArray(body.topics) ? body.topics : [];
  const topics = [...new Set(rawTopics.map(String))].filter((t) => (TOPICS as readonly string[]).includes(t));
  if (!topics.length) return fail("topics", "Pick at least one topic you'd enjoy posting about.");
  if (topics.length > LIMITS.topicsMax) return fail("topics", `Pick up to ${LIMITS.topicsMax} topics.`);
  const avoidTopics = line(body.avoidTopics, LIMITS.avoid) || null;

  // Step 4: stories. At least one real story; the rest are welcome.
  const storyWork = para(body.storyWork, LIMITS.story) || null;
  const storySetback = para(body.storySetback, LIMITS.story) || null;
  const storyLesson = para(body.storyLesson, LIMITS.story) || null;
  const stories = [storyWork, storySetback, storyLesson].filter(Boolean) as string[];
  if (!stories.length) return fail("stories", "Tell us at least one story. A few lines is enough.");
  if (!stories.some((s) => s.length >= LIMITS.storyMin))
    return fail("stories", `Give us a little more in one of your stories (at least ${LIMITS.storyMin} characters) so we can write from it.`);
  const tone = oneOf(TONES, body.tone);

  // Step 5: commitment and consent
  const canCommit = oneOf(CAN_COMMIT, body.canCommit);
  if (!canCommit) return fail("canCommit", "Please tell us how much you can post.");
  const studojoOk = oneOf(STUDOJO_OK, body.studojoOk);
  if (!studojoOk) return fail("studojoOk", "Please answer this one.");
  const whyJoin = para(body.whyJoin, LIMITS.why);
  if (whyJoin.length < LIMITS.whyMin) return fail("whyJoin", "Tell us in a line or two why you want to join.");
  const referralSource = oneOf(REFERRAL_SOURCES, body.referralSource);
  const referredBy = line(body.referredBy, LIMITS.referredBy) || null;
  if (body.consent !== true) return fail("consent", "Please tick the box so we can contact you about the program.");

  return {
    ok: true,
    value: {
      fullName, email, whatsapp, college, course, yearOfStudy, graduationYear, city,
      linkedinUrl, followers, postFrequency, lastPosted, bestPostUrl, crossed1k,
      field, targetRoles, dreamCompanies, lookingFor, topics, avoidTopics,
      storyWork, storySetback, storyLesson, tone,
      canCommit, studojoOk, whyJoin, referralSource, referredBy,
    },
  };
}
