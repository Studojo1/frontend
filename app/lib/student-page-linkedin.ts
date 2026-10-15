// Copied from Studojo1/outreach-flow (app/lib/linkedin-profile.ts) for the student
// page at /profile/:slug, which validates the stored LinkedIn read with
// sanitizeLinkedIn. Keep the two in step.
/**
 * The student's own LinkedIn profile, as the flow reads it: who they are,
 * what they do now, what they did before, where they studied and what they
 * are good at. Used to understand the student and fill their page. Read only:
 * nothing here posts, messages or connects with anyone.
 *
 * Pure functions, safe on the server and in the browser:
 *  - sanitizeLinkedIn: keeps only well-formed values (flow state, the talent
 *    record and API bodies all pass through it)
 *  - profileFromOidc: what "Sign In with LinkedIn using OpenID Connect" gives
 *    (name, email, photo, locale), read after the student links LinkedIn
 *  - profileFromPublicHtml: the public profile page (the keyless pasted-link read)
 *
 * The full profile (roles with company logos, education, skills,
 * certifications, languages, counts) comes from a profile-data provider by
 * the student's profile URL: app/lib/linkedin-providers.ts maps it here.
 *  - normalizeProfileUrl, linkedInSummary: small helpers for the UI and the page draft
 */

export interface LinkedInRole {
  title: string;
  company: string;
  /** "Jan 2025", "2025" or null. */
  start: string | null;
  end: string | null;
  current: boolean;
  /** The company's LinkedIn page (https://www.linkedin.com/company/x/), when the provider gives it. */
  companyUrl?: string | null;
  /** The company's logo as a small data: URL (kept, so it never expires), or null. */
  logo?: string | null;
  description?: string | null;
  location?: string | null;
}

export interface LinkedInSchool {
  school: string;
  degree: string | null;
  field: string | null;
  start: string | null;
  end: string | null;
  /** The school's logo as a small data: URL, or null. */
  logo?: string | null;
}

export interface LinkedInCertification {
  name: string;
  issuer: string | null;
  /** "Mar 2024", "2024" or null. */
  date: string | null;
}

export interface LinkedInProfile {
  name: string;
  headline: string | null;
  location: string | null;
  summary: string | null;
  /** https://www.linkedin.com/in/<slug>/ */
  url: string | null;
  /** Small square photo as a data: URL (kept with the profile so it never expires), or null. */
  photo: string | null;
  /** Roles held now, newest first. */
  current: LinkedInRole[];
  /** Earlier roles, newest first. */
  past: LinkedInRole[];
  education: LinkedInSchool[];
  skills: string[];
  certifications: LinkedInCertification[];
  languages: string[];
  /** The country on their profile, when the provider gives it separately from the city. */
  country: string | null;
  /** Connection and follower counts from their public profile, when the provider gives them. */
  connections: number | null;
  followers: number | null;
  /**
   * The full public profile, fetched from a profile-data provider by URL:
   * which one and when. Null when we only have sign-in or a keyless read.
   * Re-fetched at most once per 7 days (linkedin-providers.server.ts).
   */
  full: { provider: "enrichlayer" | "scrapin"; fetchedAt: string } | null;
  /** The email on their LinkedIn account (from LinkedIn sign-in), or null. */
  email: string | null;
  /** LinkedIn's locale for them, like "en_US" (from LinkedIn sign-in), or null. */
  locale: string | null;
  /**
   * How we read it: "oidc" when they linked LinkedIn with the official sign-in
   * (a linked profile stays "oidc" when the full profile fills in the rest),
   * "link" from the profile link they confirmed or pasted, "zip" from
   * LinkedIn's "Get a copy of your data" archive. "pdf" (the retired PDF
   * upload) and "signin" (the retired password read) survive on older records.
   */
  source: "oidc" | "link" | "pdf" | "zip" | "signin";
  readAt: string;
  /** When the student last imported their LinkedIn data archive (ISO), else null. */
  imported: { zip: string | null };
  /** The student's choice: show the photo on their Studojo page. */
  usePhoto: boolean;
}

/** One of the student's LinkedIn connections, from their data archive (Connections.csv). No email kept. */
export interface LinkedInConnection {
  firstName: string;
  lastName: string;
  company: string | null;
  position: string | null;
  url: string | null;
  /** YYYY-MM-DD */
  connectedOn: string | null;
}

/** talent.linkedinConnections: the newest connections (up to the cap), and how many the archive had. */
export interface LinkedInConnectionsStore {
  importedAt: string;
  /** Connections in the archive. */
  total: number;
  items: LinkedInConnection[];
}

/** What the LinkedIn step shows about the imported connections (never the list itself). */
export interface ConnectionsSummary {
  count: number;
  total: number;
  importedAt: string;
}

/** Largest photo we keep (a ~200px JPEG is 10 to 30 KB). */
export const PHOTO_MAX_BYTES = 160_000;
/** Largest company or school logo we keep (LinkedIn's 100px logos are 2 to 8 KB). */
export const LOGO_MAX_BYTES = 24_000;

// ── Sanitising ──────────────────────────────────────────────────────────────

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Trimmed single-line text, or null when empty or not a string. */
export function text(v: unknown, max = 160): string | null {
  if (typeof v !== "string") return null;
  const t = decodeEntities(v).replace(/\s+/g, " ").trim();
  return t ? t.slice(0, max) : null;
}

function longText(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = decodeEntities(v).replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return t ? t.slice(0, max) : null;
}

const isImage = (v: unknown, max: number): v is string =>
  typeof v === "string" && /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length <= Math.ceil(max * 1.4) + 40;
const isPhoto = (v: unknown): v is string => isImage(v, PHOTO_MAX_BYTES) && !(v as string).startsWith("data:image/gif");
const logoOf = (v: unknown): string | null => (isImage(v, LOGO_MAX_BYTES) ? v : null);

/** https://www.linkedin.com/company/<slug>/ (or /school/), else null. */
export function normalizeCompanyUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 300) return null;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return null;
  }
  if (!/^([a-z]{2,3}\.|www\.)?linkedin\.com$/i.test(u.hostname)) return null;
  const m = u.pathname.match(/^\/(company|school|showcase)\/([^/?#]+)/i);
  if (!m || !/^[\p{L}\p{N}_%.-]{1,120}$/u.test(m[2])) return null;
  return `https://www.linkedin.com/${m[1].toLowerCase()}/${m[2]}/`;
}

function role(v: unknown): LinkedInRole | null {
  const r = obj(v);
  const title = text(r.title, 120);
  const company = text(r.company, 120);
  if (!title && !company) return null;
  return {
    title: title ?? "",
    company: company ?? "",
    start: text(r.start, 20),
    end: text(r.end, 20),
    current: r.current === true,
    companyUrl: normalizeCompanyUrl(r.companyUrl),
    logo: logoOf(r.logo),
    description: longText(r.description, 600),
    location: text(r.location, 120),
  };
}

function school(v: unknown): LinkedInSchool | null {
  const s = obj(v);
  const name = text(s.school, 160);
  if (!name) return null;
  return { school: name, degree: text(s.degree, 120), field: text(s.field, 120), start: text(s.start, 20), end: text(s.end, 20), logo: logoOf(s.logo) };
}

function certification(v: unknown): LinkedInCertification | null {
  const c = obj(v);
  const name = text(c.name, 160);
  return name ? { name, issuer: text(c.issuer, 120), date: text(c.date, 20) } : null;
}

const count = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 1e9 ? Math.round(v) : null);

function fullOf(v: unknown): LinkedInProfile["full"] {
  const f = obj(v);
  if ((f.provider !== "enrichlayer" && f.provider !== "scrapin") || typeof f.fetchedAt !== "string" || Number.isNaN(Date.parse(f.fetchedAt))) return null;
  return { provider: f.provider, fetchedAt: f.fetchedAt };
}

function uniqueStrings(v: unknown, max: number, limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr(v)) {
    const s = text(x, max);
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

const isoOrNull = (v: unknown): string | null => (typeof v === "string" && v.length <= 40 && !Number.isNaN(Date.parse(v)) ? v : null);

/** A profile with every field checked, or null when it is not one. */
export function sanitizeLinkedIn(v: unknown): LinkedInProfile | null {
  const p = obj(v);
  const name = text(p.name, 120);
  if (!name) return null;
  const roles = (x: unknown) => arr(x).map(role).filter((r): r is LinkedInRole => r !== null);
  return {
    name,
    headline: text(p.headline, 220),
    location: text(p.location, 120),
    summary: longText(p.summary, 2000),
    url: typeof p.url === "string" ? normalizeProfileUrl(p.url) : null,
    photo: isPhoto(p.photo) ? p.photo : null,
    current: roles(p.current).map((r) => ({ ...r, current: true })).slice(0, 4),
    past: roles(p.past).map((r) => ({ ...r, current: false })).slice(0, 14),
    education: arr(p.education).map(school).filter((s): s is LinkedInSchool => s !== null).slice(0, 6),
    skills: uniqueStrings(p.skills, 60, 50),
    certifications: arr(p.certifications).map(certification).filter((c): c is LinkedInCertification => c !== null).slice(0, 12),
    languages: uniqueStrings(p.languages, 40, 10),
    country: text(p.country, 60),
    connections: count(p.connections),
    followers: count(p.followers),
    full: fullOf(p.full),
    email: typeof p.email === "string" && /^[^\s@]{1,64}@[^\s@]{1,190}$/.test(p.email.trim()) ? p.email.trim() : null,
    locale: typeof p.locale === "string" && /^[a-z]{2,3}([_-][A-Za-z]{2,4})?$/.test(p.locale) ? p.locale : null,
    source: p.source === "link" || p.source === "oidc" || p.source === "pdf" || p.source === "zip" ? p.source : "signin",
    readAt: typeof p.readAt === "string" && !Number.isNaN(Date.parse(p.readAt)) ? p.readAt : new Date(0).toISOString(),
    imported: { zip: isoOrNull(obj(p.imported).zip) },
    usePhoto: p.usePhoto !== false,
  };
}

/** True when the read found more than a name: worth showing and keeping. */
export const hasSubstance = (p: LinkedInProfile) =>
  Boolean(p.headline || p.current.length || p.past.length || p.education.length || p.skills.length || p.summary || p.certifications.length);

// ── Profile links ───────────────────────────────────────────────────────────

/**
 * https://www.linkedin.com/in/<slug>/ for anything that points at a personal
 * profile ("linkedin.com/in/x", "in.linkedin.com/in/x?trk=..", "www.linkedin.com/in/x/details"),
 * else null. Company pages, posts and other sites are refused.
 */
export function normalizeProfileUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s || s.length > 300) return null;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  if (!/^([a-z]{2,3}\.|www\.)?linkedin\.com$/i.test(u.hostname)) return null;
  const m = u.pathname.match(/^\/in\/([^/?#]+)/i);
  if (!m) return null;
  let slug: string;
  try {
    slug = decodeURIComponent(m[1]);
  } catch {
    return null;
  }
  if (!/^[\p{L}\p{N}_-]{3,100}$/u.test(slug)) return null;
  return `https://www.linkedin.com/in/${encodeURIComponent(slug)}/`;
}

// ── Dates ───────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ym(v: unknown): { label: string; sort: number } | null {
  const d = obj(v);
  const year = typeof d.year === "number" ? d.year : null;
  if (!year || year < 1950 || year > 2100) return null;
  const month = typeof d.month === "number" && d.month >= 1 && d.month <= 12 ? d.month : null;
  return { label: month ? `${MONTHS[month - 1]} ${year}` : String(year), sort: year * 100 + (month ?? 0) };
}

/** "2023-06" or "2023" from JSON-LD dates. */
function isoYm(v: unknown): { label: string; sort: number } | null {
  if (typeof v !== "string") return null;
  const m = v.match(/^(\d{4})(?:-(\d{2}))?/);
  if (!m) return null;
  return ym({ year: Number(m[1]), month: m[2] ? Number(m[2]) : undefined });
}

// ── Reads ───────────────────────────────────────────────────────────────────

type Entity = Record<string, unknown>;

export interface ReadResult {
  profile: Pick<LinkedInProfile, "name" | "headline" | "location" | "summary" | "url" | "current" | "past" | "education" | "skills"> &
    Partial<Pick<LinkedInProfile, "certifications" | "languages" | "country" | "connections" | "followers">>;
  /** Where to fetch the photo from (LinkedIn's image server), if any. */
  photoUrl: string | null;
  /** The public slug, for the follow-up profile read. */
  publicId: string | null;
}

function sortRoles(list: { r: LinkedInRole; sort: number }[]) {
  const seen = new Set<string>();
  return list
    .sort((a, b) => b.sort - a.sort)
    .map((x) => x.r)
    .filter((r) => {
      const k = `${r.title}|${r.company}`.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

// ── LinkedIn sign-in (OpenID Connect) ───────────────────────────────────────

/**
 * The profile from LinkedIn's OpenID Connect userinfo
 * (https://api.linkedin.com/v2/userinfo): name, email, picture and locale.
 * That is all the official sign-in gives; headline and roles come only from
 * the pasted-link read. Null without a name.
 */
export function profileFromOidc(info: unknown): (ReadResult & { email: string | null; locale: string | null }) | null {
  const u = obj(info);
  const name = text(u.name, 120) ?? ([text(u.given_name, 60), text(u.family_name, 60)].filter(Boolean).join(" ") || null);
  if (!name) return null;
  // locale is a string ("en_US") or { language: "en", country: "US" }.
  const loc = obj(u.locale);
  const locale =
    typeof u.locale === "string"
      ? u.locale
      : typeof loc.language === "string"
        ? `${loc.language}${typeof loc.country === "string" ? `_${loc.country}` : ""}`
        : null;
  const picture = typeof u.picture === "string" && u.picture.startsWith("https://media.licdn.com/") ? u.picture : null;
  return {
    profile: { name, headline: null, location: null, summary: null, url: null, current: [], past: [], education: [], skills: [] },
    photoUrl: picture,
    publicId: null,
    email: text(u.email, 254),
    locale: text(locale, 12),
  };
}

// ── The public profile page (the pasted-link read) ──────────────────────────

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+|#39);/gi, (m, e: string) => {
    const k = e.toLowerCase();
    if (k in ENTITIES) return ENTITIES[k];
    if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16) || 32);
    if (k.startsWith("#")) return String.fromCodePoint(Number(k.slice(1)) || 32);
    return m;
  });
}

function meta(html: string, prop: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return content ? decodeEntities(content).trim() || null : null;
}

/** The Person record from the page's JSON-LD, if there is one. */
function personLd(html: string): Entity | null {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const b of blocks) {
    const body = b.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      continue;
    }
    const graph = [...arr(obj(json)["@graph"]), ...(Array.isArray(json) ? json : [json])].map(obj);
    const person = graph.find((g) => g["@type"] === "Person" && typeof g.name === "string");
    if (person) return person;
  }
  return null;
}

/** LinkedIn sent its sign-in wall instead of the profile. */
export function isAuthwall(html: string, finalUrl = ""): boolean {
  return /\/(authwall|login|checkpoint|uas\/login)/i.test(finalUrl) || (/authwall/i.test(html) && !personLd(html));
}

/**
 * The profile from the public page's JSON-LD and meta tags. Null when the
 * page carries no profile (a sign-in wall, a removed profile).
 */
export function profileFromPublicHtml(html: string, url: string): ReadResult | null {
  const p = personLd(html);
  const ogTitle = meta(html, "og:title");
  if (!p && !ogTitle) return null;
  const person = p ?? {};
  const name = text(person.name, 120) ?? text(ogTitle?.split(/\s[-|\u2013]\s/)[0], 120);
  if (!name || /^(linkedin|sign up|log in)/i.test(name)) return null;

  const roles: { r: LinkedInRole; sort: number }[] = [];
  const titles = arr(person.jobTitle).map((t) => text(t, 120)).filter((t): t is string => !!t);
  for (const [i, w] of arr(person.worksFor).map(obj).entries()) {
    const company = text(w.name, 120);
    if (!company) continue;
    const m = obj(w.member);
    const start = isoYm(m.startDate);
    const end = isoYm(m.endDate);
    roles.push({ r: { title: titles[i] ?? "", company, start: start?.label ?? null, end: end?.label ?? null, current: !end }, sort: end ? end.sort : 999999 + (start?.sort ?? 0) / 1e6 });
  }
  const ordered = sortRoles(roles);

  const education = arr(person.alumniOf)
    .map(obj)
    .filter((a) => a["@type"] === "EducationalOrganization" || /school|college|university|institute|iit|nit/i.test(String(a.name ?? "")))
    .map((a) => {
      const m = obj(a.member);
      return { school: text(a.name, 160) ?? "", degree: null, field: null, start: isoYm(m.startDate)?.label ?? null, end: isoYm(m.endDate)?.label ?? null };
    })
    .filter((s) => s.school);

  const img = obj(person.image);
  const imgUrl = (typeof img.contentUrl === "string" ? img.contentUrl : null) ?? meta(html, "og:image");
  const description = text(person.description, 2000) ?? null;
  const ogDesc = meta(html, "og:description") ?? meta(html, "description");
  // The public page's headline is the og:title after the name: "Name - Headline | LinkedIn".
  const fromTitle = ogTitle?.replace(/\s*\|\s*LinkedIn\s*$/i, "").split(/\s[-\u2013]\s/).slice(1).join(" - ").trim() || null;
  const address = obj(person.address);

  return {
    profile: {
      name,
      headline: text(titles[0] && ordered[0]?.company ? `${titles[0]} at ${ordered[0].company}` : fromTitle, 220) ?? text(ogDesc, 220),
      location: text(address.addressLocality, 120) ?? text(address.addressRegion, 120),
      summary: longText(description, 2000),
      url: normalizeProfileUrl(url),
      current: ordered.filter((r) => r.current),
      past: ordered.filter((r) => !r.current),
      education,
      skills: [],
    },
    photoUrl: imgUrl?.startsWith("https://media.licdn.com/") && !/ghost|static\.licdn/i.test(imgUrl) ? imgUrl : null,
    publicId: null,
  };
}

// ── Using it ────────────────────────────────────────────────────────────────

export const roleLine = (r: LinkedInRole) => [r.title, r.company].filter(Boolean).join(" at ");
export const roleDates = (r: LinkedInRole) => (r.start || r.end ? `${r.start ?? ""}${r.current ? " to now" : r.end ? ` to ${r.end}` : ""}`.trim() : "");
export const schoolLine = (s: LinkedInSchool) => [s.degree, s.field].filter(Boolean).join(", ");

/** Do two names share a word? A light check that a pasted link is the student's own. */
export function namesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const words = (s: string) => new Set(s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter((w) => w.length > 1));
  if (!a || !b) return false;
  const A = words(a);
  return [...words(b)].some((w) => A.has(w));
}

/**
 * The profile as short plain lines, for the page drafter and the brief:
 * headline, roles, education, skills. No photo, no links.
 */
export function linkedInSummary(p: LinkedInProfile): string[] {
  const lines: string[] = [];
  if (p.headline) lines.push(`Headline: ${p.headline}`);
  for (const r of p.current) lines.push(`Now: ${roleLine(r)}${roleDates(r) ? ` (${roleDates(r)})` : ""}`);
  for (const r of p.past.slice(0, 5)) lines.push(`Before: ${roleLine(r)}${roleDates(r) ? ` (${roleDates(r)})` : ""}`);
  for (const s of p.education.slice(0, 3)) lines.push(`Studied: ${[s.school, schoolLine(s)].filter(Boolean).join(", ")}${s.end ? ` (${s.end})` : ""}`);
  if (p.skills.length) lines.push(`Skills: ${p.skills.slice(0, 12).join(", ")}`);
  if (p.certifications.length) lines.push(`Certifications: ${p.certifications.slice(0, 5).map((c) => [c.name, c.issuer].filter(Boolean).join(", ")).join("; ")}`);
  if (p.languages.length) lines.push(`Languages: ${p.languages.slice(0, 6).join(", ")}`);
  if (p.location) lines.push(`Based in: ${p.location}`);
  if (p.summary) lines.push(`About: ${p.summary.replace(/\s+/g, " ").slice(0, 600)}`);
  return lines;
}
