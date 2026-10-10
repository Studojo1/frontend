/**
 * The talent profile: what the /profile page knows about a student, gathered
 * from data we already hold instead of forms.
 *
 * Sources, in order of trust:
 *  - user_profile: what the student typed (name, college, year, course, links)
 *  - the outreach candidate (GET /candidate/{id}/profile): the parsed resume
 *    (`resume_profile`), the profiling chat (`parsed_json.preferences`,
 *    `parsed_json.career_analysis`) and their target roles
 *  - the Career Coach summary: readiness score and target role
 *
 * Every field here comes from an LLM somewhere upstream, so each reader takes
 * `unknown`, keeps only well-formed values and drops the rest. Nothing is
 * guessed.
 */

import type { ProfileLinks } from "../../auth-schema";

export type RoleFit = { title: string; fit: number | null; reasoning: string | null };
export type ExperienceItem = { title: string; company: string; duration: string | null };

export type TalentSignals = {
  summary: string | null;
  skills: string[];
  strengths: string[];
  experience: ExperienceItem[];
  roleFits: RoleFit[];
  targetRoles: string[];
  locations: string[];
  workMode: string | null;
  timeline: string | null;
  salary: string | null;
  industries: string[];
  dreamCompanies: string[];
  cluster: string | null;
};

export const EMPTY_SIGNALS: TalentSignals = {
  summary: null,
  skills: [],
  strengths: [],
  experience: [],
  roleFits: [],
  targetRoles: [],
  locations: [],
  workMode: null,
  timeline: null,
  salary: null,
  industries: [],
  dreamCompanies: [],
  cluster: null,
};

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const str = (v: unknown, max = 160): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim().replace(/\s+/g, " ");
  return t.length > 1 && t.length <= max ? t : null;
};

// Placeholder values the profiling chat writes when the student skipped a question.
const PLACEHOLDER = /^(any|none|n\/a|na|null|undefined|flexible|not specified|general|unknown|-)$/i;
const meaningful = (v: unknown, max = 160): string | null => {
  const s = str(v, max);
  return s && !PLACEHOLDER.test(s) ? s : null;
};

/** Unique non-empty strings, case-insensitively, keeping first spelling and order. */
function strings(v: unknown, max = 60, limit = 30): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    const s = meaningful(item, max);
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

const merge = (...lists: string[][]): string[] => strings(lists.flat(), 200, 40);

function title(s: string): string {
  return s.length > 0 && s === s.toLowerCase() ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : s;
}

function formatSalary(v: unknown): string | null {
  const s = obj(v);
  const num = (x: unknown) => {
    const n = typeof x === "number" ? x : typeof x === "string" ? Number(x.replace(/[^\d.]/g, "")) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const min = num(s.min_annual_ctc);
  const max = num(s.max_annual_ctc);
  if (!min && !max) return null;
  const cur = (str(s.currency, 5) ?? "INR").toUpperCase();
  const fmt = (n: number) => {
    if (cur === "INR") {
      // Annual CTC in rupees. Values under 1000 are already in lakhs.
      const lakhs = n >= 1000 ? n / 100000 : n;
      return `${Number(lakhs.toFixed(lakhs < 10 ? 1 : 0))}`;
    }
    return n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
  };
  const range = min && max && max !== min ? `${fmt(min)}–${fmt(max)}` : fmt((min ?? max)!);
  if (cur === "INR") return `₹${range} L`;
  const sym: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", AED: "AED ", SGD: "S$" };
  return `${sym[cur] ?? cur + " "}${range}`;
}

/** Signals from the outreach `GET /candidate/{id}/profile` response. */
export function signalsFromCandidate(resp: unknown): TalentSignals {
  const r = obj(resp);
  const parsed = obj(r.parsed_json);
  const resume = obj(r.resume_profile);
  const info = obj(parsed.personal_info);
  const prefs = obj(parsed.preferences);
  const analysis = obj(parsed.career_analysis);

  const roleFits: RoleFit[] = [];
  if (Array.isArray(analysis.recommended_roles)) {
    for (const raw of analysis.recommended_roles) {
      const o = obj(raw);
      const t = meaningful(o.title, 80);
      // The payload builder's default when it learned nothing is "Associate" at 0.5.
      if (!t || (t === "Associate" && o.fit_score === 0.5)) continue;
      const f = typeof o.fit_score === "number" && o.fit_score >= 0 && o.fit_score <= 1 ? o.fit_score : null;
      roleFits.push({ title: t, fit: f, reasoning: str(o.reasoning, 400) });
    }
    roleFits.sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0));
  }

  const experience: ExperienceItem[] = [];
  if (Array.isArray(resume.experience)) {
    for (const raw of resume.experience) {
      const o = obj(raw);
      const t = str(o.title, 100);
      const c = str(o.company, 100);
      if (t || c) experience.push({ title: t ?? "", company: c ?? "", duration: str(o.duration, 60) });
      if (experience.length >= 6) break;
    }
  }

  const summary = str(resume.summary_text, 600) ?? str(parsed.profile_summary, 600);
  return {
    summary: summary === "Profile generated from conversation." ? null : summary,
    skills: merge(strings(resume.skills), strings(info.skills_detected)).slice(0, 24),
    strengths: strings(resume.key_strengths, 120, 6),
    experience,
    roleFits: roleFits.slice(0, 4),
    targetRoles: strings(r.target_roles, 80, 6),
    locations: strings(prefs.locations, 60, 8).map(title),
    workMode: meaningful(prefs.work_mode, 30),
    timeline: meaningful(prefs.timeline, 40),
    salary: formatSalary(prefs.salary_expectations),
    industries: merge(strings(r.target_industries), strings(prefs.industry_interests)).slice(0, 8),
    dreamCompanies: strings(r.dream_companies, 60, 8),
    cluster: meaningful(analysis.primary_cluster, 60),
  };
}

// ── Links ────────────────────────────────────────────────────────────────────

const GITHUB_HANDLE = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

/** "octocat", "@octocat" or "https://github.com/octocat" -> "octocat". */
export function githubHandle(input: unknown): string | null {
  const s = str(input, 200);
  if (!s) return null;
  const m = s.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#\s]+)\/?(?:[?#].*)?$/i);
  const handle = (m ? m[1] : s).replace(/^@/, "");
  return GITHUB_HANDLE.test(handle) ? handle : null;
}

function httpUrl(input: string): URL | null {
  try {
    const u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u : null;
  } catch {
    return null;
  }
}

/**
 * Validate links from the edit form. Empty strings clear a link. Returns the
 * cleaned links, or the first problem in words a student can act on.
 */
export function normalizeLinks(input: unknown): { links: ProfileLinks } | { error: string } {
  const o = obj(input);
  const links: ProfileLinks = {};
  const raw = (k: string) => (typeof o[k] === "string" ? (o[k] as string).trim() : "");

  if (raw("github")) {
    const h = githubHandle(raw("github"));
    if (!h) return { error: "That GitHub link doesn't look right. Use your username, like octocat." };
    links.github = h;
  }
  if (raw("linkedin")) {
    const u = httpUrl(raw("linkedin"));
    if (!u || !/(^|\.)linkedin\.com$/i.test(u.hostname) || !/^\/in\/[^/]+/i.test(u.pathname)) {
      return { error: "Use your LinkedIn profile link, like linkedin.com/in/your-name." };
    }
    links.linkedin = `https://www.linkedin.com${u.pathname.replace(/\/+$/, "")}`;
  }
  if (raw("portfolio")) {
    const u = httpUrl(raw("portfolio"));
    if (!u || !u.hostname.includes(".") || raw("portfolio").length > 300) {
      return { error: "That portfolio link doesn't look like a web address." };
    }
    links.portfolio = u.toString();
  }
  return { links };
}

// ── Profile strength ─────────────────────────────────────────────────────────

export type StrengthAction =
  | { kind: "edit" }
  | { kind: "autofill" }
  | { kind: "link"; href: string; label: string };

export type StrengthItem = {
  key: string;
  label: string;
  done: boolean;
  weight: number;
  /** What doing it gets the student. Shown while not done. */
  why: string;
  action: StrengthAction;
};

export type StrengthInput = {
  basics: { name: boolean; college: boolean; course: boolean; year: boolean };
  /** At least one basic is missing and the parsed resume can fill it. */
  resumeCanFill: boolean;
  hasResume: boolean;
  hasCareerDna: boolean;
  signals: TalentSignals;
  links: ProfileLinks | null;
  hasApplied: boolean;
};

/**
 * Weighted checklist behind the profile strength ring. Weights add up to 100
 * and favour what recruiters and our matching actually use (resume, target
 * roles, proof of work) over form fields.
 */
export function profileStrength(i: StrengthInput): { score: number; items: StrengthItem[] } {
  const basicsDone = Object.values(i.basics).filter(Boolean).length;
  const items: StrengthItem[] = [
    {
      key: "basics",
      label: "Name, college, course and year",
      done: basicsDone === 4,
      weight: 15,
      why: "Recruiters filter by college and graduation year first.",
      action: i.resumeCanFill ? { kind: "autofill" } : { kind: "edit" },
    },
    {
      key: "resume",
      label: "Resume on file",
      done: i.hasResume,
      weight: 20,
      why: "We read your skills and experience from it, so you never fill a form twice.",
      action: { kind: "link", href: "/outreach/onboarding/upload", label: "Upload resume" },
    },
    {
      key: "roles",
      label: "Target roles picked",
      done: i.signals.targetRoles.length > 0 || i.signals.roleFits.length > 0,
      weight: 15,
      why: "Matches and outreach are aimed at these roles.",
      action: { kind: "link", href: "/outreach/onboarding/chat", label: "Pick roles" },
    },
    {
      key: "places",
      label: "Where you want to work",
      done: i.signals.locations.length > 0,
      weight: 10,
      why: "Puts your cities on the map and the roles there in front of you.",
      action: { kind: "link", href: "/outreach/onboarding/chat", label: "Add cities" },
    },
    {
      key: "skills",
      label: "5+ skills detected",
      done: i.signals.skills.length >= 5,
      weight: 10,
      why: "Skills drive which roles we rank as a strong fit.",
      action: { kind: "link", href: "/resume-maker", label: "Improve resume" },
    },
    {
      key: "dna",
      label: "Career DNA analysis",
      done: i.hasCareerDna,
      weight: 15,
      why: "Unlocks your readiness score and a weekly plan.",
      action: { kind: "link", href: "/cc", label: "Start Career DNA" },
    },
    {
      key: "proof",
      label: "GitHub, LinkedIn or portfolio",
      done: !!(i.links?.github || i.links?.linkedin || i.links?.portfolio),
      weight: 10,
      why: "Proof of work beats a resume line. Your GitHub graph shows here.",
      action: { kind: "edit" },
    },
    {
      key: "applied",
      label: "First application sent",
      done: i.hasApplied,
      weight: 5,
      why: "Your applications show up on your map.",
      action: { kind: "link", href: "/dojos/internships", label: "Browse internships" },
    },
  ];
  // Partial credit for basics so filling two of four still moves the ring.
  const score = items.reduce(
    (sum, it) => sum + (it.done ? it.weight : it.key === "basics" ? Math.round((it.weight * basicsDone) / 4) : 0),
    0,
  );
  return { score, items };
}

/** Headline under the name: the role they are going for, best evidence first. */
export function headline(signals: TalentSignals, coachTargetRole: string | null | undefined): string | null {
  const role = str(coachTargetRole, 80) ?? signals.targetRoles[0] ?? signals.roleFits[0]?.title ?? null;
  if (!role) return signals.cluster ? `Exploring ${signals.cluster}` : null;
  return `Aspiring ${role}`;
}

// ── Shared talent store (/start) ─────────────────────────────────────────────

/** Signals from user_profile.talent, written by /start. */
export function signalsFromTalent(t: unknown): TalentSignals {
  const store = obj(t);
  const resume = obj(store.resume);
  const prefs = obj(store.prefs);
  const experience: ExperienceItem[] = Array.isArray(resume.experience)
    ? resume.experience
        .map((e) => obj(e))
        .map((e) => ({ title: str(e.title, 100) ?? "", company: str(e.company, 100) ?? "", duration: null }))
        .filter((e) => e.title || e.company)
        .slice(0, 6)
    : [];
  const chat = obj(store.chat);
  const min = typeof prefs.minMonthly === "number" && prefs.minMonthly > 0 ? prefs.minMonthly : null;
  return {
    ...EMPTY_SIGNALS,
    summary: str(chat.proud, 400),
    dreamCompanies: strings(chat.dreamCompanies, 60, 8),
    workMode: meaningful(chat.workMode, 30) === "Any" ? null : meaningful(chat.workMode, 30),
    timeline: meaningful(chat.startWhen, 40),
    skills: strings(resume.skills, 32, 24),
    experience,
    targetRoles: strings(prefs.titles, 80, 6),
    locations: strings(prefs.cities, 60, 8),
    salary: min ? `₹${Math.round(min / 1000)}k+/mo` : null,
    industries: strings(prefs.clusters, 30, 6),
    cluster: strings(prefs.clusters, 30, 1)[0] ?? null,
  };
}

/** Field by field: the first source that has a value wins. */
export function mergeSignals(primary: TalentSignals, fallback: TalentSignals): TalentSignals {
  const pick = <K extends keyof TalentSignals>(k: K): TalentSignals[K] => {
    const a = primary[k];
    return (Array.isArray(a) ? a.length > 0 : a !== null) ? a : fallback[k];
  };
  return Object.fromEntries((Object.keys(EMPTY_SIGNALS) as (keyof TalentSignals)[]).map((k) => [k, pick(k)])) as TalentSignals;
}
