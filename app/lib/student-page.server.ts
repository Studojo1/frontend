/**
 * The saved page (user_profile.talent) as the Profile shape the boarding-pass
 * public page draws. Only what the student saved and approved goes in:
 * resume lines, the claims read from them, their quiz answers and the photo
 * when they chose to show it. Nothing is invented; what the resume does not
 * say (dates, durations, places) is left empty and the page skips it.
 *
 * The resume is the source of truth. Only when it has no experience (or no
 * education) section at all do the roles (or schools) from the student's own
 * LinkedIn fill that part, each marked source "linkedin" so the page labels
 * it "From LinkedIn" instead of offering resume lines.
 *
 * The student builds and approves the page in Studojo1/outreach-flow (/flow),
 * which writes it into user_profile.talent. This copy of its mapper
 * (app/lib/public-profile.server.ts there) draws it at /profile/:slug on the
 * main site. What they want comes from the readable values /flow saves next
 * to the quiz (prefs.titles, prefs.cities, chat.*), so this file needs none of
 * the flow's catalogues. Keep the two in step.
 */
import { sql } from "drizzle-orm";
import type { Line, Org, Profile, Stint } from "~/components/student-page/types";
import { cityCode } from "~/components/student-page/types";
import db from "~/lib/db";
import { namesMatch, sanitizeLinkedIn, schoolLine, type LinkedInRole, type LinkedInSchool } from "~/lib/student-page-linkedin";
import { clean as cleanText, entryMode, hidePhones, isBullet, personalLine, redact, redactLine, ROLE_TAIL, VERB } from "~/lib/student-page-text";

/**
 * What this page reads from user_profile.talent. /flow writes it (outreach-flow
 * auth-schema.ts TalentStore); the column is not in this repo's Drizzle schema,
 * so it is read with SQL.
 */
export type TalentStore = {
  resume?: { city?: string | null; gradYear?: string | null };
  prefs?: { titles?: string[]; cities?: string[] };
  chat?: { companyStage?: string; workMode?: string; startWhen?: string; proud?: string };
  page?: {
    slug: string;
    meta: string;
    headline: string;
    about: string;
    claims: { id: string; section: string; text: string; evidence: string[] }[];
    lines: { id: string; section: string; text: string }[];
    /** The skills the student checked on their page: kept from the resume (with their lines) or added in their own words. */
    skills?: { name: string; evidence?: string[]; by?: "resume" | "you" }[];
    /** The job app's onboarding sets it: page.skills is the student's checked list, even when empty. */
    skillsChecked?: boolean;
    visibility: { link: boolean; search: boolean; managers: boolean; adult: boolean; contact?: boolean };
    approvedAt: string;
  };
  quiz?: Record<string, unknown>;
  linkedin?: unknown;
};

export type ProfileRow = { fullName: string; college: string | null; course: string | null; yearOfStudy: string | null; talent: TalentStore | null };

const clean = (v: unknown) => (typeof v === "string" && v.trim() && !/^not specified$/i.test(v.trim()) ? v.trim() : "");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);
const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text: string, word: string) => new RegExp(`(?<![A-Za-z0-9])${esc(word)}(?![A-Za-z0-9])`, "i").test(text);

/** "RIYA MENON" → "Riya Menon"; mixed case is left alone. */
const nameCase = (s: string) => (s === s.toUpperCase() ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : s);

// ── Org tiles ─────────────────────────────────────────────────────────────────

const TINTS: [string, string][] = [
  ["#1f3a5f", "#ffffff"],
  ["#f2b233", "#3a2400"],
  ["#16a37f", "#ffffff"],
  ["#e8553e", "#ffffff"],
  ["#7c3aed", "#ffffff"],
  ["#0e7490", "#ffffff"],
  ["#fbcfe8", "#191a23"],
  ["#a7f3d0", "#191a23"],
  ["#fde68a", "#191a23"],
  ["#191a23", "#ffffff"],
];
const SMALL = new Set(["of", "and", "the", "in", "at", "for", "&", "to", "a", "an", "on"]);

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A tile for an org we only know by name: its initials on a colour picked from the name. */
export function orgFrom(name: string): Org {
  const words = name.replace(/\(.*?\)/g, "").split(",")[0].split(/\s+/).filter((w) => w && !SMALL.has(w.toLowerCase()) && /[A-Za-z0-9]/.test(w));
  let short: string;
  if (words.length >= 2) short = words.slice(0, words.length >= 3 ? 3 : 2).map((w) => w.replace(/[^A-Za-z0-9]/g, "")[0] ?? "").join("").toUpperCase();
  else {
    const w = (words[0] ?? name).replace(/[^A-Za-z0-9]/g, "");
    short = w.length <= 4 && w === w.toUpperCase() ? w : cap(w.slice(0, 2).toLowerCase());
  }
  const [tint, ink] = TINTS[hash(name.toLowerCase()) % TINTS.length];
  return { name, short: short || "•", tint, ink };
}

// ── Dates ─────────────────────────────────────────────────────────────────────

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?";
const YEAR = "(?:19|20)\\d{2}";
const DATE = `(?:${MONTH},?\\s+)?${YEAR}`;
const END = `(?:${DATE}|Present|Now|Current|Ongoing|Till date|Today)`;
const SEP = "\\s*(?:-|\u2013|\u2014|to|until|till)\\s*";
const RANGE = new RegExp(`\\(?(${DATE})${SEP}(${END})\\)?`, "i");
const RANGE_SAME_YEAR = new RegExp(`\\(?(${MONTH})${SEP}(${MONTH}),?\\s+(${YEAR})\\)?`, "i");
const SINGLE = new RegExp(`\\(?(${MONTH},?\\s+${YEAR})\\)?`, "i");
const HAS_DATE = new RegExp(`${YEAR}|${MONTH}\\s+${YEAR}`, "i");

type When = { y: number; m: number | null } | "now";

function normDate(s: string): string {
  if (/^(present|now|current|ongoing|till date|today)$/i.test(s.trim())) return "Now";
  const m = s.match(new RegExp(`(${MONTH})?,?\\s*(${YEAR})`, "i"));
  if (!m) return s.trim();
  return m[1] ? `${cap(m[1].slice(0, 3).toLowerCase())} ${m[2]}` : m[2];
}
function readDate(s: string): When | null {
  if (s === "Now") return "now";
  const m = s.match(/^(?:([A-Za-z]{3}) )?(\d{4})$/);
  if (!m) return null;
  return { y: Number(m[2]), m: m[1] ? MONTHS.indexOf(m[1].toLowerCase()) : null };
}

/** "3 mos", "1 yr 2 mos", "4 yrs": only when both ends are known. */
export function spanOf(from: string, to: string, now: Date): string {
  const a = readDate(from);
  let b = readDate(to);
  if (!a || a === "now" || !b) return "";
  if (b === "now") b = { y: now.getUTCFullYear(), m: a.m === null ? null : now.getUTCMonth() };
  if (a.m === null || b.m === null) {
    const yrs = b.y - a.y;
    return yrs >= 1 ? `${yrs} yr${yrs === 1 ? "" : "s"}` : "";
  }
  const months = (b.y - a.y) * 12 + (b.m - a.m) + 1;
  if (months < 1) return "";
  const y = Math.floor(months / 12), m = months % 12;
  const ys = y ? `${y} yr${y === 1 ? "" : "s"}` : "";
  const ms = m ? `${m} mo${m === 1 ? "" : "s"}` : "";
  return [ys, ms].filter(Boolean).join(" ");
}

/** Pull a date range out of a line: { from, to, rest }. */
function takeDates(text: string): { from?: string; to?: string; rest: string } {
  let m = text.match(RANGE_SAME_YEAR);
  if (m) return { from: normDate(`${m[1]} ${m[3]}`), to: normDate(`${m[2]} ${m[3]}`), rest: text.replace(m[0], " ") };
  m = text.match(RANGE);
  if (m) return { from: normDate(m[1]), to: normDate(m[2]), rest: text.replace(m[0], " ") };
  m = text.match(SINGLE);
  if (m) return { from: normDate(m[1]), rest: text.replace(m[0], " ") };
  return { rest: text };
}

const tidy = (s: string) =>
  s
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s|,:;\u2013\u2014-]+|[\s|,:;\u2013\u2014-]+$/g, "")
    .replace(/\s*\|\s*\|\s*/g, " | ")
    .trim();

// ── Timelines from resume lines ───────────────────────────────────────────────

const BULLET_START = /^[•\-\u2013*·▪►]\s*/;

/** "Canteen sales analysis": a few words, no figures or punctuation, not a sentence. */
const shortTitle = (t: string) => t.trim().split(/\s+/).length <= 5 && !/[\d,;.%]/.test(t) && !/^\w+ed\b/i.test(t.trim());

/** Split one section's lines into entries: a header line, then the lines under it. */
function entries(lines: Line[]): { head: Line; body: Line[] }[] {
  if (!lines.length) return [];
  const dated = lines.some((l) => HAS_DATE.test(l.text));
  const isHead = (l: Line, i: number) =>
    !BULLET_START.test(l.text) &&
    (i === 0 || l.strong || (dated ? HAS_DATE.test(l.text) : /^[^.;]{2,60}(:\s|\s\|\s)/.test(l.text) || shortTitle(l.text)));
  const out: { head: Line; body: Line[] }[] = [];
  lines.forEach((l, i) => {
    if (isHead(l, i) || !out.length) out.push({ head: l, body: [] });
    else out[out.length - 1].body.push(l);
  });
  return out;
}

function noteOf(body: Line[]) {
  const note = body.map((l) => sentence(l.text.replace(BULLET_START, ""))).join(" ");
  return note.length > 360 ? `${note.slice(0, 357).replace(/\s+\S*$/, "")}…` : note;
}

function stint(kind: "experience" | "projects", e: { head: Line; body: Line[] }, now: Date, i: number): Stint {
  const { from, to, rest } = takeDates(e.head.text.replace(BULLET_START, ""));
  const text = tidy(rest);
  let title = text, org = "", place = "";
  const pipes = text.split(/\s*\|\s*/).filter(Boolean);
  if (pipes.length > 1) {
    [title] = pipes;
    if (kind === "experience") org = pipes[1];
    place = pipes.slice(kind === "experience" ? 2 : 1).join(" · ");
  } else if (kind === "experience" && /\s(?:at|@)\s/i.test(text)) {
    [title, org] = text.split(/\s(?:at|@)\s/i, 2);
  } else if (/:\s/.test(text)) {
    const k = text.indexOf(":");
    title = text.slice(0, k);
    if (kind === "experience") org = text.slice(k + 1);
    else place = text.slice(k + 1);
  } else if (kind === "experience" && /,\s/.test(text)) {
    const k = text.indexOf(",");
    title = text.slice(0, k);
    org = text.slice(k + 1);
  } else if (kind === "experience" && /\s[\u2013\u2014-]\s/.test(text)) {
    [title, org] = text.split(/\s[\u2013\u2014-]\s/, 2);
  }
  title = tidy(title) || tidy(text);
  org = tidy(org);
  return {
    id: `${kind === "experience" ? "x" : "p"}-${i}`,
    title,
    org: orgFrom(org || title),
    hideOrg: !org,
    from,
    to,
    span: from && to ? spanOf(from, to, now) || undefined : undefined,
    place: tidy(place) ? cap(tidy(place)) : undefined,
    note: e.body.length ? noteOf(e.body) : undefined,
    evidence: [e.head.id, ...e.body.map((l) => l.id)],
  };
}

const SCHOOL = /\b(university|college|institute|school|academy|vidyalaya|vidyapeeth|iit|nit|iiit|iim|bits)\b/i;
const DEGREE = /\b(b\.?\s?tech|b\.?\s?e\b|bba|bca|bms|b\.?\s?com|b\.?\s?sc|b\.?\s?a\b|b\.?\s?des|b\.?\s?arch|b\.?\s?pharm|m\.?\s?tech|mba|mca|m\.?\s?sc|m\.?\s?a\b|m\.?\s?com|pgdm|llb|mbbs|bachelor|master|diploma|class (x|xii|10|12)|hsc|ssc|cbse|icse)/i;
const SCORE = /\b(c?gpa|percentage|score|grade)\s*[:\-]?\s*[\d.]+%?(\s*(\/|of|out of)\s*\d+(\.\d+)?)?|\b\d{2}(\.\d+)?\s?%/i;

/** "BBA", "B.Tech", "CSE": the short form of a degree, or "". */
export function degreeShort(degree: string): string {
  const m = degree.match(DEGREE);
  if (!m || /bachelor|master|diploma|class|hsc|ssc|cbse|icse/i.test(m[1])) return "";
  return m[1].replace(/\s/g, "");
}

/** The institution's name out of a line that may also hold the degree, dates and score. */
function schoolOf(text: string): string {
  const parts = takeDates(text).rest.split(/\s*[|,·]\s*/).map(tidy).filter(Boolean);
  const k = parts.findIndex((x) => SCHOOL.test(x));
  if (k < 0) return "";
  const out = [parts[k]];
  for (const x of parts.slice(k + 1)) {
    if (DEGREE.test(x) || SCORE.test(x) || /\d/.test(x) || x.split(/\s+/).length > 3) break;
    out.push(x);
  }
  return out.join(", ");
}

function education(lines: Line[], college: string, degree: string, now: Date): Stint[] {
  if (!lines.length) return [];
  const groups: Line[][] = [];
  for (const l of lines) {
    if (!groups.length || (SCHOOL.test(l.text) && groups[groups.length - 1].some((x) => SCHOOL.test(x.text)))) groups.push([l]);
    else groups[groups.length - 1].push(l);
  }
  return groups.map((g, i) => {
    const all = g.map((l) => l.text).join(" | ");
    const { from, to } = takeDates(all);
    const school = g.find((l) => SCHOOL.test(l.text));
    const schoolName = school ? schoolOf(school.text) : "";
    const isTheirs = !!college && (!schoolName || schoolName.toLowerCase().includes(college.toLowerCase().split(",")[0]) || college.toLowerCase().includes(schoolName.toLowerCase().split(",")[0]));
    const degreeLine = g.find((l) => DEGREE.test(l.text) && l !== school) ?? g.find((l) => DEGREE.test(l.text));
    let title = degreeLine ? tidy(takeDates(degreeLine.text).rest.replace(SCORE, " ").split(/\s*\|\s*/).filter((x) => DEGREE.test(x))[0] ?? "") : "";
    if (degreeLine === school && title) title = tidy(title.replace(schoolName, " "));
    if (isTheirs && degree) title = degree;
    const orgName = schoolName || (isTheirs ? college : "");
    const score = all.match(SCORE)?.[0];
    return {
      id: `e-${i}`,
      title: title || orgName || tidy(g[0].text),
      org: orgFrom(orgName || title || g[0].text),
      hideOrg: !orgName || orgName === title,
      from,
      to,
      span: from && to ? spanOf(from, to, now) || undefined : undefined,
      place: score ? score.replace(/\s+/g, " ").trim().replace(/^c?gpa/i, (x) => x.toUpperCase()) : undefined,
      evidence: g.map((l) => l.id),
    };
  });
}

// ── From LinkedIn, where the resume is silent ─────────────────────────────────

/** A timeline entry read from LinkedIn, not the resume: no resume lines behind it. */
export type SourcedStint = Stint & { source?: "linkedin" };

function linkedInRole(r: LinkedInRole, i: number, now: Date): SourcedStint {
  const from = r.start ?? undefined;
  const to = r.current ? "Now" : r.end ?? undefined;
  return {
    id: `li-x-${i}`,
    title: r.title || r.company,
    org: orgFrom(r.company || r.title),
    hideOrg: !r.company || !r.title,
    from,
    to,
    span: from && to ? spanOf(from, to, now) || undefined : undefined,
    evidence: [],
    source: "linkedin",
  };
}

function linkedInSchool(s: LinkedInSchool, i: number, now: Date): SourcedStint {
  const title = schoolLine(s);
  const from = s.start ?? undefined;
  const to = s.end ?? undefined;
  return {
    id: `li-e-${i}`,
    title: title || s.school,
    org: orgFrom(s.school),
    hideOrg: !title,
    from,
    to: to && to !== from ? to : undefined,
    span: from && to && to !== from ? spanOf(from, to, now) || undefined : undefined,
    evidence: [],
    source: "linkedin",
  };
}

// ── Numbers, skills ───────────────────────────────────────────────────────────

const NUM = /(?<![A-Za-z0-9.])(?:[₹$€£]\s?)?\d[\d,]*(?:\.\d+)?(?:\s?(?:%|\+|x(?![a-z])|k\b|K\b|L\b|M\b|Cr\b|lakh|crore))?(?![A-Za-z0-9])/g;

/** The first figure in a claim that is not a year, if any. */
function figure(text: string): string | null {
  for (const m of text.matchAll(NUM)) {
    const v = m[0].trim();
    if (/^(19|20)\d{2}$/.test(v)) continue;
    return v;
  }
  return null;
}

function splitSkills(text: string): string[] {
  return text
    .split(/[|;•·]/)
    .map((part) => part.replace(/^[^:,]{2,30}:\s*/, ""))
    .flatMap((part) => part.split(/,\s*|\s+and\s+/))
    .map((s) => s.replace(/[.()]+$/g, "").trim())
    .filter((s) => s.length >= 1 && s.length <= 30 && /[A-Za-z]/.test(s));
}

// ── Repairs on top of the parse ───────────────────────────────────────────────
// The parse above reads resume lines by position, so a resume laid out its own
// way can leave employers under Skills, a "from X to Y" number headlined by X,
// or a status word ("Current") as a skill. These rules fix what they can and
// tell the page how far to trust each entry (Stint.parse).

const RANGE_END = new RegExp(`\\(?(${DATE})${SEP}(${END})\\)?\\s*$`, "i");
const CURRENT_END = /\b(Current|Present|Ongoing|Now)\b\s*(?:\(\s*(\d+)\s*(months?|mos?|yrs?|years?)\s*\))?\s*$/i;
const CAPS_WORD = /^[A-Z][A-Z0-9&.'/-]*$/;
const STATUS = /^(current|present|now|ongoing|till date|to date|resume|skills?|others?)$/i;
const FIG = String.raw`(?:[\u20b9$\u20ac\u00a3]\s?)?\d[\d,]*(?:\.\d+)?(?:\s?(?:%|\+|x|k|K|L|M|Cr))?`;
const FROM_TO = new RegExp(String.raw`\bfrom\s+(${FIG})\s+to\s+(${FIG})`, "i");

/** An ALL CAPS employer ("FITMEDIK") takes the casing the resume uses elsewhere ("Fitmedik"); failing that, word-like words of 4+ letters are title-cased ("MULYA" to "Mulya") while acronyms stay ("AI", "KPMG"). */
function displayCase(org: string, lines: Line[]): string {
  if (/[a-z]/.test(org)) return org;
  const casedElsewhere = (w: string) => {
    const re = new RegExp(`(?<![A-Za-z])${esc(w)}(?![A-Za-z])`, "i");
    for (const l of lines) {
      const m = re.exec(l.text);
      if (m && /[a-z]/.test(m[0])) return m[0];
    }
    return null;
  };
  const whole = casedElsewhere(org);
  if (whole) return whole;
  return org
    .split(" ")
    .map((w) => {
      const letters = w.replace(/[^A-Za-z]/g, "");
      if (letters.length <= 3 || /[^AEIOUY\W\d]{3,}/i.test(letters)) return w;
      return casedElsewhere(w) ?? w.slice(0, 1) + w.slice(1).toLowerCase();
    })
    .join(" ");
}

/** "Brand and Growth Strategy Intern FITMEDIK Current (9 months)": a role line, wherever the parse filed it. */
function parseRoleLine(raw: string, lines: Line[], now: Date): { title: string; org: string; from: string; to: string; span: string } | null {
  if (!raw || isBullet(raw)) return null;
  const t = cleanText(raw);
  if (VERB.test(t)) return null;
  let from = "";
  let to = "";
  let span = "";
  let rest: string;
  const r = RANGE_END.exec(t);
  if (r) {
    from = normDate(r[1]);
    to = normDate(r[2]);
    rest = t.slice(0, r.index);
  } else {
    const c = CURRENT_END.exec(t);
    if (!c) return null;
    to = "Now";
    rest = t.slice(0, c.index);
    if (c[2]) {
      const n = Number(c[2]);
      span = /^y/i.test(c[3]) ? `${n} yr${n === 1 ? "" : "s"}` : `${n} mo${n === 1 ? "" : "s"}`;
    }
  }
  rest = rest.replace(/^[\s|,:;-]+|[\s|,:;-]+$/g, "");
  let title = "";
  let org = "";
  const at = /\s(?:at|@)\s/.exec(rest);
  if (rest.includes(" | ")) {
    const i = rest.indexOf(" | ");
    [title, org] = [rest.slice(0, i).trim(), rest.slice(i + 3).trim()];
  } else if (at) {
    [title, org] = [rest.slice(0, at.index).trim(), rest.slice(at.index + at[0].length).trim()];
  } else {
    // A trailing run of ALL CAPS words is the employer: "... Intern FITMEDIK", "... Intern MARIANA AI".
    const w = rest.split(" ");
    let k = w.length;
    while (k > 0 && CAPS_WORD.test(w[k - 1]) && /[A-Z]{2,}/.test(w[k - 1])) k--;
    if (k > 0 && k < w.length) [title, org] = [w.slice(0, k).join(" "), w.slice(k).join(" ")];
    else if (rest.includes(", ")) {
      const i = rest.indexOf(", ");
      [title, org] = [rest.slice(0, i).trim(), rest.slice(i + 2).trim()];
    }
  }
  if (!title || !org || (!ROLE_TAIL.test(title.replace(/\)+$/, "")) && !ROLE_TAIL.test(title))) return null;
  if (title.split(/\s+/).length > 8 || org.split(/\s+/).length > 6) return null;
  if (!span && from && to) span = spanOf(from, to, now);
  return { title, org: displayCase(org, lines), from, to, span };
}

/** Skills without role lines or status words, with a list wrapped across two resume lines rejoined ("Business" + "Partnerships"). Placed next to an entry only by that entry's body lines. */
function tidySkills(lines: Line[], experience: Stint[], projects: Stint[], skip: Set<string>): Profile["skills"] {
  const order = new Map(lines.map((l, i) => [l.id, i]));
  const src = lines.filter((l) => l.section === "skills" && !skip.has(l.id) && !STATUS.test(cleanText(l.text)));
  const items: { name: string; ids: string[] }[] = [];
  let prev: Line | null = null;
  for (const l of src) {
    let parts = splitSkills(cleanText(l.text));
    if (prev && parts.length && items.length && order.get(l.id) === (order.get(prev.id) ?? -2) + 1) {
      const pt = cleanText(prev.text);
      if (pt.length >= 90 && !/[,;|.:]$/.test(pt)) {
        const last = items[items.length - 1];
        last.name = `${last.name} ${parts[0]}`;
        last.ids.push(l.id);
        parts = parts.slice(1);
      }
    }
    items.push(...parts.map((name) => ({ name, ids: [l.id] })));
    prev = l;
  }
  const seen = new Set<string>();
  const out: Profile["skills"] = [];
  for (const { name, ids } of items) {
    if (STATUS.test(name) || seen.has(name.toLowerCase()) || out.length >= 16) continue;
    seen.add(name.toLowerCase());
    let placed: Profile["skills"][number] | null = null;
    for (const [kind, group] of [["experience", experience], ["projects", projects]] as const) {
      for (const st of group) {
        if (st.parse !== "clean") continue;
        const body = st.evidence.slice(1);
        const hit = lines.find((x) => body.includes(x.id) && has(x.text, name));
        if (hit) {
          placed = { name, where: kind === "projects" || st.hideOrg ? st.title : st.org.name, org: st.org, evidence: [hit.id] };
          break;
        }
      }
      if (placed) break;
    }
    out.push(placed ?? { name, where: "Resume", evidence: ids });
  }
  return out;
}

/** "Grew ... from $100K to $250K" headlines the outcome, $250K; 4+ digit values get separators. */
function outcomeValue(value: string, label: string): string {
  const m = FROM_TO.exec(label);
  const v = m && m[1].replace(/[\s,]/g, "") === value.replace(/[\s,]/g, "") ? m[2] : value;
  const d = /^([+\u2212-]?[\u20b9$\u20ac\u00a3]?)(\d{4,})(.*)$/.exec(v);
  if (d && !(d[2].length === 4 && Number(d[2]) >= 1900 && Number(d[2]) <= 2099 && !d[1])) return `${d[1]}${Number(d[2]).toLocaleString("en-US")}${d[3]}`;
  return v;
}

/**
 * Contact details never leave the server inside resume text. The page source carries the whole profile (the
 * loader's data), not only what is drawn, so an email or phone number in a resume line (usually the header)
 * would be readable there even when the student did not allow contact. Lines keep their place, so "Resume
 * line 20" still counts from the top of the student's resume. Left alone: the email the student allowed, the
 * page address and the photo (a data URL).
 */
const KEEP_AS_IS = new Set(["email", "photo", "url", "slug"]);
function scrubContacts<T>(v: T, key = ""): T {
  if (typeof v === "string") return (KEEP_AS_IS.has(key) ? v : redact(v)) as T;
  if (Array.isArray(v)) return v.map((x) => scrubContacts(x, key)) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, scrubContacts(x, k)])) as T;
  return v;
}

/**
 * The skills the student approved on their page, when they checked them (the
 * job app's onboarding saves page.skills): only those, in their order. One
 * from the resume sits next to the entry its line belongs to; one they added
 * in their own words says so.
 */
function approvedSkills(list: NonNullable<NonNullable<TalentStore["page"]>["skills"]>, lines: Line[], experience: Stint[], projects: Stint[], first: string): Profile["skills"] {
  const ids = new Set(lines.map((l) => l.id));
  const out: Profile["skills"] = [];
  const seen = new Set<string>();
  for (const s of list) {
    const name = cleanText(typeof s?.name === "string" ? s.name : "").slice(0, 40);
    if (!name || STATUS.test(name) || seen.has(name.toLowerCase()) || out.length >= 20) continue;
    seen.add(name.toLowerCase());
    const evidence = (Array.isArray(s.evidence) ? s.evidence : []).filter((id): id is string => typeof id === "string" && ids.has(id));
    if (s.by === "you" || !evidence.length) {
      out.push({ name, where: first ? `Added by ${first}` : "Added by them", evidence: [] });
      continue;
    }
    let placed: Profile["skills"][number] | null = null;
    for (const [kind, group] of [["experience", experience], ["projects", projects]] as const) {
      for (const st of group) {
        if (st.parse !== "clean") continue;
        // the whole entry, its head line included (a skill read from a role's title belongs with that role)
        const body = st.evidence;
        const hit = evidence.find((id) => body.includes(id)) ?? lines.find((x) => body.includes(x.id) && has(x.text, name))?.id;
        if (hit) {
          placed = { name, where: kind === "projects" || st.hideOrg ? st.title : st.org.name, org: st.org, evidence: [hit] };
          break;
        }
      }
      if (placed) break;
    }
    // Unplaced: "Resume" only when a line of the skills section lists it; else the view names the section its line is in.
    const listed = evidence.some((id) => lines.find((l) => l.id === id)?.section === "skills");
    out.push(placed ?? { name, where: listed ? "Resume" : "", evidence });
  }
  return out;
}

function repair(p: Profile, lines: Line[], approvedAt: string, now: Date, approved: NonNullable<TalentStore["page"]>["skills"] = undefined, first = "", checked = false): Profile {
  for (const st of [...p.experience, ...p.projects, ...p.education]) st.parse = entryMode(st);
  // Role lines filed under another section become real experience entries.
  const usedByClean = new Set(p.experience.filter((s) => s.parse === "clean").flatMap((s) => s.evidence));
  const roleIds = new Set<string>();
  const recovered: Stint[] = [];
  for (const l of lines) {
    if (l.section === "header" || l.section === "education" || usedByClean.has(l.id)) continue;
    const r = parseRoleLine(l.text, lines, now);
    if (!r) continue;
    roleIds.add(l.id);
    recovered.push({
      id: `x-r${recovered.length}`,
      title: r.title,
      org: { name: r.org, short: "", tint: "", ink: "" },
      hideOrg: false,
      ...(r.from ? { from: r.from } : {}),
      ...(r.to ? { to: r.to } : {}),
      ...(r.span ? { span: r.span } : {}),
      evidence: [l.id],
      parse: "clean",
    });
  }
  p.experience = [...p.experience, ...recovered];
  // The student's checked list when they checked one (an empty list means they took every skill off); older pages fall back to the resume's skills section.
  const useChecked = Array.isArray(approved) && (checked || approved.length > 0);
  p.skills = useChecked ? approvedSkills(approved, lines, p.experience, p.projects, first) : tidySkills(lines, p.experience, p.projects, roleIds);
  if (useChecked) p.skillsChecked = true;
  for (const n of p.numbers) n.value = outcomeValue(n.value, n.label);
  p.updated = approvedAt;
  // The page draws no org tiles any more.
  delete p.feature;
  return p;
}

// ── The mapper ────────────────────────────────────────────────────────────────

const STAGE_PHRASE = ["Tiny startups", "Seed-stage startups", "Series A to B startups", "Growth-stage companies", "Large companies"];
const CHAT_STAGE: Record<string, string> = { "Early-stage startup": "Early-stage startups", "Growing startup": "Growing startups", "Big company": "Big companies" };
const JOB_PHRASE: Record<string, string> = { internship: "Internship", fulltime: "Full-time role", either: "Internship or full-time role" };

export function toProfile(row: ProfileRow, opts: { origin: string; email: string | null; now?: Date }): Profile {
  const now = opts.now ?? new Date();
  const t = row.talent ?? {};
  const page = t.page!;
  // No line carries an address, a birth date, a parent's name or a phone number to the page: a line with a
  // personal particular, or a header line that reads like the contact band, is hidden whole.
  const lines: Line[] = (page.lines ?? []).map((l) => ({ id: l.id, section: l.section, text: redactLine(l.text, l.section) }));
  const ids = new Set(lines.map((l) => l.id));
  const sec = (s: string) => lines.filter((l) => l.section === s);
  const q = (t.quiz ?? {}) as { role?: string | null; cities?: unknown; remote?: unknown; jobType?: string | null; startMonth?: string | null; stage?: number | null };
  const li = sanitizeLinkedIn(t.linkedin);

  const name = nameCase(clean(row.fullName) || sec("header")[0]?.text || "Student");
  const words = name.split(/\s+/);
  const first = words[0];
  const initials = words.map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const savedCollege = clean(row.college);
  const degree = clean(row.course);
  const classOf = clean(row.yearOfStudy).match(/\d{4}/)?.[0] ?? clean(t.resume?.gradYear).match(/\d{4}/)?.[0] ?? "";
  const city = (clean(t.resume?.city) || clean(page.meta?.split("·").pop())).split(",")[0].trim();

  // What they want: /flow saves the quiz's answers as readable values next to it
  // (the role title, city names, start month label) and the stage as its index.
  const roleTitle = clean(t.prefs?.titles?.[0]);
  const start = /\b\d{4}\b/.test(clean(t.chat?.startWhen)) ? clean(t.chat?.startWhen) : "";
  const stage = typeof q.stage === "number" && STAGE_PHRASE[q.stage] ? STAGE_PHRASE[q.stage] : CHAT_STAGE[clean(t.chat?.companyStage)] ?? "";
  const cityNames = (t.prefs?.cities ?? []).filter((c): c is string => typeof c === "string").slice(0, 12);
  const remote = typeof q.remote === "boolean" ? q.remote : /remote|hybrid/i.test(clean(t.chat?.workMode));
  const type = q.jobType && q.jobType in JOB_PHRASE ? JOB_PHRASE[q.jobType] : "";

  const experience = entries(sec("experience")).map((e, i) => stint("experience", e, now, i));
  const projects = entries(sec("projects")).map((e, i) => stint("projects", e, now, i));
  const edu = education(sec("education"), savedCollege, degree, now);
  const college = savedCollege || (edu[0] && !edu[0].hideOrg ? edu[0].org.name : "");
  // Their own LinkedIn (same name as the page) fills a section the resume doesn't have.
  const ownLi = li && namesMatch(li.name, name) ? li : null;
  const liExperience = !experience.length && ownLi ? [...ownLi.current, ...ownLi.past].slice(0, 8).map((r, i) => linkedInRole(r, i, now)) : [];
  const liEducation = !edu.length && ownLi ? ownLi.education.slice(0, 4).map((x, i) => linkedInSchool(x, i, now)) : [];

  // Skills, each next to the role or project it shows up in.
  const seen = new Set<string>();
  const skills: Profile["skills"] = [];
  for (const l of sec("skills")) {
    for (const s of splitSkills(l.text)) {
      if (seen.has(s.toLowerCase()) || skills.length >= 16) continue;
      seen.add(s.toLowerCase());
      let placed: Profile["skills"][number] | null = null;
      for (const st of [...experience, ...projects]) {
        const hit = lines.find((x) => st.evidence.includes(x.id) && has(x.text, s));
        if (hit) {
          placed = { name: s, where: st.hideOrg ? st.title : st.org.name, org: st.org, evidence: [hit.id] };
          break;
        }
      }
      skills.push(placed ?? { name: s, where: "Resume", evidence: [l.id] });
    }
  }

  // A claim with a personal particular is never shown (pages saved before the job app left them off).
  const claims = (page.claims ?? [])
    .filter((c) => !personalLine(c.text ?? ""))
    .map((c) => ({ id: c.id, section: c.section, text: hidePhones(c.text), evidence: c.evidence.filter((id) => ids.has(id)) }))
    .filter((c) => c.text && c.evidence.length);

  const numbers: Profile["numbers"] = [];
  for (const c of claims) {
    const v = figure(c.text);
    if (v && numbers.length < 4) numbers.push({ value: v, label: c.text.replace(/\.$/, ""), evidence: c.evidence });
  }

  const header = sec("header");
  const nameLine = header.filter((l) => l.text.trim().toLowerCase() === name.toLowerCase() || has(l.text, first)).slice(0, 1);
  const collegeKey = college.split(",")[0].toLowerCase();
  const eduLines = sec("education");
  const proud = clean(t.chat?.proud);
  const slug = page.slug;
  const host = opts.origin.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const profile: Profile = {
    name,
    first,
    initials,
    photo: li?.usePhoto && li.photo ? li.photo : null,
    headline: clean(page.headline),
    about: clean(page.about),
    city,
    college,
    degree,
    degreeShort: degreeShort(degree),
    classOf,
    email: opts.email,
    url: `${host}/profile/${slug}`,
    slug,
    target: {
      role: roleTitle,
      start,
      type,
      stage,
      cities: cityNames.map((label) => ({ code: cityCode(label), label })),
      remote,
    },
    numbers,
    experience: experience.length ? experience : liExperience,
    projects,
    education: edu.length ? edu : liEducation,
    skills,
    prompts: proud ? [{ q: "What I'm proudest of", a: sentence(proud) }] : [],
    claims,
    lines,
    src: {
      name: nameLine.map((l) => l.id),
      college: collegeKey ? eduLines.filter((l) => l.text.toLowerCase().includes(collegeKey)).map((l) => l.id).slice(0, 2) : [],
      classOf: classOf ? eduLines.filter((l) => l.text.includes(classOf)).map((l) => l.id).slice(0, 1) : [],
    },
  };
  return scrubContacts(repair(profile, lines, typeof page.approvedAt === "string" ? page.approvedAt : "", now, page.skills, first, page.skillsChecked === true));
}

// ── Reading it ────────────────────────────────────────────────────────────────

/** Postgres "undefined_column": production has no talent column until /flow ships there. */
const isMissingColumn = (e: unknown): boolean => {
  const code = (x: unknown) => (x && typeof x === "object" && "code" in x ? (x as { code?: unknown }).code : undefined);
  return code(e) === "42703" || code((e as { cause?: unknown } | null)?.cause) === "42703";
};
let missingColumnLogged = false;

/** The saved page at this address, or null. Who may see it is the caller's check. */
export async function findStudentPage(slug: string): Promise<{ userId: string; row: ProfileRow; page: NonNullable<TalentStore["page"]> } | null> {
  try {
    const res = await db.execute<{ user_id: string; full_name: string; college: string | null; course: string | null; year_of_study: string | null; talent: TalentStore | null }>(sql`
      SELECT user_id, full_name, college, course, year_of_study, talent - 'linkedinConnections' AS talent
        FROM user_profile
       WHERE talent->'page'->>'slug' = ${slug}
       LIMIT 1`);
    const r = res.rows[0];
    const page = r?.talent?.page;
    if (!r || !page) return null;
    return { userId: r.user_id, page, row: { fullName: r.full_name, college: r.college, course: r.course, yearOfStudy: r.year_of_study, talent: r.talent } };
  } catch (e) {
    if (!isMissingColumn(e)) throw e;
    if (!missingColumnLogged) {
      missingColumnLogged = true;
      console.warn("[student-page] user_profile has no talent column here, so every /profile/:slug is a 404");
    }
    return null;
  }
}

/** The student's sign-in email, only ever read when they allowed contact. */
export async function studentEmail(userId: string): Promise<string | null> {
  const res = await db.execute<{ email: string }>(sql`SELECT email FROM "user" WHERE id = ${userId} LIMIT 1`);
  return res.rows[0]?.email ?? null;
}
