/**
 * Instant resume read for /start, before the student has an account.
 *
 * Deterministic on purpose: no model call, so it costs nothing, answers in
 * milliseconds and is safe to expose without a session. It finds what a
 * resume states plainly (email, name, college, degree, graduation year,
 * skills, links, city, recent roles) and marks each field's confidence so the
 * confirm step can ask only about the shaky ones. Anything it can't find is
 * null; nothing is guessed from thin air.
 */

import { findPlace } from "./geo";
import { githubHandle } from "./talent-profile";

export type Confidence = "high" | "low";
export type Found<T> = { value: T; confidence: Confidence } | null;

export type QuickResume = {
  email: Found<string>;
  name: Found<string>;
  phone: Found<string>;
  college: Found<string>;
  course: Found<string>;
  gradYear: Found<number>;
  city: Found<string>;
  skills: string[];
  experience: { title: string; company: string }[];
  links: { github?: string; linkedin?: string; portfolio?: string };
};

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)\d{3,5}[\s-]?\d{3,5}/;
const INSTITUTION = /\b(university|college|institute|iit|nit|iiit|iim|bits|school of|academy|vidyalaya|polytechnic)\b/i;
const DEGREE =
  /\b(b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|b\.?\s?sc|m\.?\s?sc|b\.?\s?com|m\.?\s?com|bba|mba|bca|mca|b\.?\s?a\b|m\.?\s?a\b|b\.?\s?des|m\.?\s?des|ph\.?\s?d|bachelor(?:'s)? of [a-z &]+|master(?:'s)? of [a-z &]+|pgdm|llb|b\.?\s?arch)\b[^\n,|•]{0,60}/i;
const HEADING = /^(?:technical\s+|key\s+|core\s+)?(skills?|tools|technologies|tech stack|experience|work experience|internships?|education|projects?|achievements|certifications?|summary|profile|objective|positions? of responsibility|extra[- ]?curricular|languages|interests|awards)\b\s*:?\s*$/i;
const ROLE_WORD = /\b(intern|analyst|engineer|developer|manager|associate|lead|designer|consultant|executive|coordinator|founder|head|specialist|researcher|trainee|assistant)\b/i;

// Common skills, matched as whole words anywhere when the resume has no skills section.
const KNOWN_SKILLS = [
  "Python", "SQL", "Excel", "Java", "JavaScript", "TypeScript", "React", "Node.js", "C++", "C", "Go", "R", "Tableau",
  "Power BI", "Figma", "Canva", "Photoshop", "Illustrator", "AWS", "Docker", "Kubernetes", "Git", "MongoDB",
  "PostgreSQL", "MySQL", "Machine Learning", "Deep Learning", "NLP", "Pandas", "NumPy", "TensorFlow", "PyTorch",
  "Statistics", "Data Analysis", "Financial Modelling", "Financial Modeling", "Valuation", "SEO", "Google Analytics",
  "Content Writing", "Copywriting", "Social Media", "Digital Marketing", "Market Research", "Public Speaking",
  "Project Management", "Agile", "Jira", "Notion", "Salesforce", "HubSpot", "Flutter", "Kotlin", "Swift", "Django",
  "Flask", "FastAPI", "Next.js", "HTML", "CSS", "Tailwind", "UI/UX", "Product Management", "A/B Testing", "Looker",
  "dbt", "Spark", "Hadoop", "Mixpanel", "Premiere Pro", "After Effects", "Blender", "AutoCAD", "SolidWorks", "MATLAB",
];

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const high = <T>(value: T): Found<T> => ({ value, confidence: "high" });
const low = <T>(value: T): Found<T> => ({ value, confidence: "low" });

function looksLikeName(line: string): boolean {
  const l = clean(line);
  if (l.length < 4 || l.length > 40) return false;
  if (/[@\d|•:/]/.test(l) || /resume|curriculum|vitae|\bcv\b|profile|contact/i.test(l)) return false;
  if (INSTITUTION.test(l) || HEADING.test(l)) return false;
  const words = l.split(" ");
  return words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Za-z][A-Za-z.'-]*$/.test(w));
}

function titleCase(s: string): string {
  return s === s.toUpperCase() ? s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : s;
}

/** Lines under a heading matching `re`, up to the next heading. */
function section(lines: string[], re: RegExp): string[] {
  const start = lines.findIndex((l) => HEADING.test(l) && re.test(l));
  if (start < 0) return [];
  const out: string[] = [];
  for (const l of lines.slice(start + 1)) {
    if (HEADING.test(l)) break;
    out.push(l);
  }
  return out;
}

export function quickParseResume(text: string): QuickResume {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean);
  const joined = lines.join("\n");
  const out: QuickResume = {
    email: null, name: null, phone: null, college: null, course: null, gradYear: null, city: null,
    skills: [], experience: [], links: {},
  };

  const email = joined.match(EMAIL)?.[0];
  if (email) out.email = high(email.toLowerCase());

  const phone = lines.slice(0, 12).join(" ").replace(EMAIL, " ").match(PHONE)?.[0];
  if (phone && phone.replace(/\D/g, "").length >= 10) out.phone = high(clean(phone));

  // Name: the first name-shaped line near the top. Confident only when it is the very first line.
  const nameIdx = lines.slice(0, 6).findIndex(looksLikeName);
  if (nameIdx >= 0) out.name = (nameIdx === 0 ? high : low)(titleCase(lines[nameIdx]));
  else if (email) {
    // Fall back to the email local part when it reads like "firstname.lastname".
    const parts = email.split("@")[0].split(/[._-]/).filter((p) => /^[a-z]{2,}$/i.test(p));
    if (parts.length >= 2) out.name = low(parts.slice(0, 2).map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase()).join(" "));
  }

  // Education: prefer the education section, else the whole resume.
  const edu = section(lines, /education/i);
  const eduLines = edu.length ? edu : lines;
  const instLine = eduLines.find((l) => INSTITUTION.test(l));
  if (instLine) {
    let inst = clean(instLine.split(/\s[|•–-]\s|\t/)[0].replace(/\(.*?\)/g, ""));
    // "Christ University, Bengaluru": the trailing place is the city, not the name.
    const parts = inst.split(",").map(clean);
    if (parts.length > 1 && findPlace(parts[parts.length - 1])) inst = parts.slice(0, -1).join(", ");
    if (inst.length <= 90) out.college = (edu.length ? high : low)(inst);
  }
  const degree = eduLines.join("\n").match(DEGREE)?.[0];
  if (degree) out.course = (edu.length ? high : low)(clean(degree.replace(/\s*[(,–-]\s*$/, "")));
  const years = (edu.length ? edu.join(" ") : instLine ?? "").match(/\b(19|20)\d{2}\b/g)?.map(Number) ?? [];
  if (years.length) out.gradYear = (edu.length ? high : low)(Math.max(...years));

  // City: the contact block first, then the college line.
  const place = findPlace(lines.slice(0, 5).join(" ")) ?? findPlace(instLine ?? "");
  if (place) out.city = low(place.name);

  // Skills: the skills section, split on separators; "Languages: Python, SQL" keeps only the list.
  const skillLines = section(lines, /skills?|tools|technologies|tech stack/i);
  const seen = new Set<string>();
  const add = (s: string) => {
    const v = clean(s.replace(/^[-•·*▪◦]\s*/, ""));
    if (v.length < 1 || v.length > 32 || seen.has(v.toLowerCase()) || /^(and|etc\.?)$/i.test(v)) return;
    seen.add(v.toLowerCase());
    out.skills.push(v);
  };
  for (const l of skillLines) {
    const list = l.includes(":") ? l.slice(l.indexOf(":") + 1) : l;
    list.split(/[,;|•·]| {2,}/).forEach(add);
  }
  if (out.skills.length < 3) {
    for (const s of KNOWN_SKILLS) {
      const re = new RegExp(`(^|[^A-Za-z0-9+#.])${s.replace(/[.+*?^$()[\]{}|\\/]/g, "\\$&")}(?=$|[^A-Za-z0-9+#])`, "i");
      if (re.test(joined)) add(s);
    }
  }
  out.skills = out.skills.slice(0, 20);

  // Experience: role-shaped lines in the experience section, "Title | Company" or "Title at Company".
  const expLines = section(lines, /experience|internships?/i);
  for (const l of expLines) {
    if (!ROLE_WORD.test(l) || l.length > 110 || /^[-•·*]/.test(l)) continue;
    const m = l.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i) ?? l.match(/^(.+?)\s*[|,–-]\s*(.+)$/);
    const title = clean((m ? m[1] : l).replace(/\b(19|20)\d{2}.*$/, ""));
    const company = m ? clean(m[2].replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b.*$/i, "").replace(/\b(19|20)\d{2}.*$/, "")) : "";
    if (title.length >= 3) out.experience.push({ title, company });
    if (out.experience.length >= 4) break;
  }

  // Links.
  const gh = joined.match(/github\.com\/[A-Za-z0-9-]+/i)?.[0];
  if (gh) {
    const h = githubHandle(gh);
    if (h) out.links.github = h;
  }
  const li = joined.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i)?.[0];
  if (li) out.links.linkedin = `https://www.${li.replace(/^www\./i, "")}`;
  // Emails removed first, or "riya.menon@gmail.com" reads as the site "riya.me".
  const site = joined
    .replace(new RegExp(EMAIL.source, "g"), " ")
    .match(/(?<![\w.@-])(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:dev|me|io|design|site|xyz|in|com)(?![\w.-])(?:\/[^\s|,]*)?/gi)
    ?.find((u) => !/github|linkedin|gmail|outlook|yahoo|hotmail/i.test(u));
  if (site) out.links.portfolio = /^https?:/i.test(site) ? site : `https://${site}`;

  return out;
}

/** Share of the confirm card we could fill, for the "we read N of M" line. */
export function filledCount(r: QuickResume): { filled: number; total: number } {
  const fields = [r.name, r.email, r.college, r.course, r.gradYear, r.city];
  return { filled: fields.filter(Boolean).length + (r.skills.length ? 1 : 0), total: fields.length + 1 };
}
