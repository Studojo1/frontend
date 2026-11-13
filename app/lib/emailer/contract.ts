// EMAILER (11 Nov 2026, the owner: "a standalone email writer tool that we can blow up on X"): the free job email writer
// at /tools/emailer. The page lives here (Studojo1/frontend); the engine is career-agent, served on this same origin
// under /api/emailer/* by the ingress (staging studojo.pro, production studojo.com), so there is no CORS and the site's
// session cookie reaches it.
//
// This file is the API contract the page codes against (loop-work/emailer/BRIEF.md, "API contract") and the page's pure
// helpers: request building, validation, error kinds, highlights, share and Gmail links, the Stu links and their
// utm_source. No React and no browser globals, for tests (app/lib/emailer/emailer.test.mjs).

// ── The contract ────────────────────────────────────────────────────────────────────────────────────────────────

export type JobType = "job" | "internship";

export interface WriteRequest {
  company: string;
  website?: string;
  role: string;
  jobType: JobType;
  /** Pasted job post text, at most 8000 characters. */
  jobPost?: string;
  jobUrl?: string;
  to?: { name?: string; title?: string };
  you: {
    name: string;
    now: string;
    /** 1 to 3, each at most 300 characters. */
    results: string[];
    why?: string;
    /** At most 3. */
    links?: string[];
  };
  /** A run id; signed in only. */
  regenerateOf?: string;
  utm?: Record<string, string>;
}

export interface Score {
  /** 0 to 10. */
  value: number;
  /** One line. */
  verdict: string;
  /** Up to 3, plain. */
  fixes: string[];
}

export interface Usage {
  used: number;
  limit: number;
  signedIn: boolean;
}

export interface Followup {
  day: 3 | 7;
  body: string;
}

export interface WriteResponse {
  id: string;
  subject: string;
  body: string;
  /** null when locked (anonymous). */
  followups: Followup[] | null;
  score: Score;
  /** Exact substrings of body. */
  highlights: { result: string | null; company: string | null; ask: string | null };
  company: { name: string; domain: string | null; logo: string | null; what: string | null };
  locked: { followups: boolean; regenerate: boolean; more: boolean };
  usage: Usage;
  /** https://studojo.{pro|com}/tools/emailer/s/<id> */
  shareUrl: string;
}

export interface GradeRequest {
  /** Their draft, 40 to 3000 characters. */
  email: string;
  subject?: string;
  role?: string;
  company?: string;
  you?: { name?: string };
}

export interface GradeResponse {
  id: string;
  score: Score;
  /** null when locked (anonymous). */
  rewrite: { subject: string; body: string; score: number } | null;
  /** Signed in with no rewrite: why, in plain words ("already scores 9", "add one result"). EMAILER-FIX, 13 Nov 2026. */
  rewriteNote?: string | null;
  locked: { rewrite: boolean };
  usage: Usage;
  shareUrl: string;
}

export interface ResumeResponse {
  name: string | null;
  now: string | null;
  /** Up to 6, one line each, with numbers where they exist. */
  results: string[];
  links: string[];
}

export interface MeResponse {
  signedIn: boolean;
  firstName: string | null;
  used: number;
  limit: number;
}

export interface ShareResponse {
  kind: "write" | "grade";
  score: number;
  /** grade: their draft's score; write: null. */
  before: number | null;
  /** grade: the rewrite's score. */
  after: number | null;
  role: string | null;
  company: string | null;
  companyLogo: string | null;
  firstName: string | null;
  createdAt: string;
}

export interface ApiErrorBody {
  error: string;
  message: string;
  field?: string;
  signIn?: boolean;
}

export const API = {
  write: "/api/emailer/write",
  grade: "/api/emailer/grade",
  resume: "/api/emailer/resume",
  me: "/api/emailer/me",
  share: (id: string) => `/api/emailer/share/${encodeURIComponent(id)}`,
  card: (id: string) => `/api/emailer/card/${encodeURIComponent(id)}.png`,
} as const;

/** The page's own path, and where sign-in comes back to. */
export const TOOL_PATH = "/tools/emailer";
/** A share page's path. */
export const sharePath = (id: string) => `${TOOL_PATH}/s/${encodeURIComponent(id)}`;

/** A run id as the share route accepts it (the engine's ids: letters, digits, _ and -). */
export const SHARE_ID_RE = /^[A-Za-z0-9_-]{4,64}$/;

/** The signed-in daily limit (BRIEF: 5 actions per signed-in person per day). Used only for the sign-in pitch's copy;
 * the real numbers always come from the engine's `usage`. */
export const SIGNED_IN_LIMIT = 5;

export const LIMITS = {
  jobPost: 8000,
  result: 300,
  results: 3,
  links: 3,
  gradeMin: 40,
  gradeMax: 3000,
  resumeBytes: 5 * 1024 * 1024,
} as const;

// ── The form ────────────────────────────────────────────────────────────────────────────────────────────────────

export interface WriteForm {
  company: string;
  role: string;
  jobType: JobType;
  jobMode: "paste" | "link";
  jobPost: string;
  jobUrl: string;
  toName: string;
  toTitle: string;
  name: string;
  now: string;
  results: string[];
  why: string;
  links: string;
}

export interface GradeForm {
  email: string;
  subject: string;
  role: string;
  company: string;
}

export function emptyWriteForm(): WriteForm {
  return {
    company: "",
    role: "",
    jobType: "job",
    jobMode: "paste",
    jobPost: "",
    jobUrl: "",
    toName: "",
    toTitle: "",
    name: "",
    now: "",
    results: ["", "", ""],
    why: "",
    links: "",
  };
}

export function emptyGradeForm(): GradeForm {
  return { email: "", subject: "", role: "", company: "" };
}

/** A form field key, for errors: company, role, jobPost, jobUrl, to, name, now, results, results.<i>, why, links,
 * email (grade), form (no one field). */
export type FieldKey = string;
export type FieldErrors = Record<FieldKey, string>;

const URLISH = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;

/** "acme.io", "https://acme.io/careers" (no spaces, a dot and a top-level domain). */
export function looksLikeUrl(v: string): boolean {
  const t = v.trim();
  return t.length > 3 && !/\s/.test(t) && URLISH.test(t);
}

/** A website as https://host/path, or "" when it is not one. */
export function normaliseWebsite(v: string): string {
  const t = v.trim();
  if (!looksLikeUrl(t)) return "";
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withScheme);
    return u.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

/** Up to 3 links from one line (spaces, commas or new lines between them). */
export function parseLinks(v: string): string[] {
  return v
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, LIMITS.links);
}

/** The results that have words, trimmed, at most 3. */
export function filledResults(results: string[]): string[] {
  return results.map((r) => r.trim()).filter(Boolean).slice(0, LIMITS.results);
}

/** The write form's own checks, before anything is sent. Empty when it may be sent. */
export function validateWrite(f: WriteForm): FieldErrors {
  const e: FieldErrors = {};
  if (!f.company.trim()) e.company = "Add the company's name or website.";
  if (!f.role.trim()) e.role = "Add the role you want.";
  if (!f.name.trim()) e.name = "Add your name, for the sign-off.";
  if (!f.now.trim()) e.now = "Add one line about where you are now.";
  if (filledResults(f.results).length === 0) e["results.0"] = "Add at least one result. It's what the email leads with.";
  f.results.forEach((r, i) => {
    if (r.trim().length > LIMITS.result) e[`results.${i}`] = `Keep it under ${LIMITS.result} characters.`;
  });
  if (f.jobMode === "paste" && f.jobPost.length > LIMITS.jobPost) e.jobPost = `That's a long one. Keep it under ${LIMITS.jobPost} characters.`;
  if (f.jobMode === "link" && f.jobUrl.trim() && !looksLikeUrl(f.jobUrl)) e.jobUrl = "That doesn't look like a link.";
  return e;
}

/** The request body for POST /api/emailer/write. */
export function buildWriteRequest(f: WriteForm, utm: Record<string, string> = {}, regenerateOf?: string): WriteRequest {
  const company = f.company.trim();
  const website = normaliseWebsite(company);
  const req: WriteRequest = {
    company,
    role: f.role.trim(),
    jobType: f.jobType,
    you: {
      name: f.name.trim(),
      now: f.now.trim(),
      results: filledResults(f.results).map((r) => r.slice(0, LIMITS.result)),
    },
  };
  if (website) req.website = website;
  if (f.jobMode === "paste") {
    const post = f.jobPost.trim();
    // A pasted link alone is a link.
    if (post && looksLikeUrl(post)) req.jobUrl = normaliseWebsite(post) || post;
    else if (post) req.jobPost = post.slice(0, LIMITS.jobPost);
  } else if (f.jobUrl.trim()) {
    req.jobUrl = normaliseWebsite(f.jobUrl) || f.jobUrl.trim();
  }
  const toName = f.toName.trim();
  const toTitle = f.toTitle.trim();
  if (toName || toTitle) req.to = { ...(toName ? { name: toName } : {}), ...(toTitle ? { title: toTitle } : {}) };
  const why = f.why.trim();
  if (why) req.you.why = why;
  const links = parseLinks(f.links);
  if (links.length) req.you.links = links;
  if (regenerateOf) req.regenerateOf = regenerateOf;
  if (Object.keys(utm).length) req.utm = utm;
  return req;
}

export function validateGrade(f: GradeForm): FieldErrors {
  const e: FieldErrors = {};
  const n = f.email.trim().length;
  if (n === 0) e.email = "Paste the email you wrote.";
  else if (n < LIMITS.gradeMin) e.email = "Paste the whole email, not just a line.";
  else if (n > LIMITS.gradeMax) e.email = `Keep it under ${LIMITS.gradeMax} characters.`;
  return e;
}

export function buildGradeRequest(f: GradeForm, name?: string): GradeRequest {
  const req: GradeRequest = { email: f.email.trim() };
  if (f.subject.trim()) req.subject = f.subject.trim();
  if (f.role.trim()) req.role = f.role.trim();
  if (f.company.trim()) req.company = f.company.trim();
  if (name && name.trim()) req.you = { name: name.trim() };
  return req;
}

/** The engine's 400 field ("you.results.1", "to.name", "website") as the form's own key. */
export function formFieldFor(apiField: string | undefined | null): FieldKey {
  const f = String(apiField ?? "").trim();
  if (!f) return "form";
  const m = /^(?:you\.)?results(?:\.(\d+))?$/.exec(f);
  if (m) return `results.${m[1] ?? "0"}`;
  if (f === "you.name") return "name";
  if (f === "you.now") return "now";
  if (f === "you.why") return "why";
  if (f.startsWith("you.links")) return "links";
  if (f === "to" || f.startsWith("to.")) return "to";
  if (f === "website") return "company";
  if (["company", "role", "jobPost", "jobUrl", "email", "subject"].includes(f)) return f;
  if (f === "jobType") return "role";
  return "form";
}

// ── Errors ──────────────────────────────────────────────────────────────────────────────────────────────────────

export type ErrorKind =
  /** 429, anonymous used its free one: the sign-in wall. */
  | "signin"
  /** 429, signed in at the daily limit. */
  | "limit"
  /** 429, the day's total reached. */
  | "busy"
  /** 503, the kill switch. */
  | "off"
  /** 400, one field. */
  | "field"
  /** Anything else, or no answer. */
  | "error";

export interface ClassifiedError {
  kind: ErrorKind;
  field?: FieldKey;
  message?: string;
}

export function classifyError(status: number, body: Partial<ApiErrorBody> | null | undefined): ClassifiedError {
  const b = body ?? {};
  const message = typeof b.message === "string" && b.message.trim() ? b.message.trim() : undefined;
  if (status === 429) {
    if (b.error === "busy") return { kind: "busy", message };
    if (b.signIn === true) return { kind: "signin", message };
    return { kind: "limit", message };
  }
  if (status === 503) return { kind: "off", message };
  if (status === 400) return { kind: "field", field: formFieldFor(b.field), message };
  return { kind: "error", message };
}

// ── The result meter ────────────────────────────────────────────────────────────────────────────────────────────

const NUMBER_WORDS =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|hundred|hundreds|thousand|thousands|lakh|lakhs|crore|crores|million|millions|billion|double|doubled|triple|tripled|half|halved|quarter)\b/i;

/** Whether a result carries a number: a digit, or a number written as a word ("doubled", "two thousand"). */
export function hasNumber(text: string): boolean {
  return /\d/.test(text) || NUMBER_WORDS.test(text);
}

export type ResultStrength = "empty" | "short" | "nonumber" | "good";

/** How strong one result line is, for the live meter: empty, too short to say anything, no number, or good. */
export function resultStrength(text: string): ResultStrength {
  const t = text.trim();
  if (!t) return "empty";
  const number = hasNumber(t);
  if (t.length < 12) return "short";
  return number ? "good" : "nonumber";
}

/** Meter steps filled (0 to 3) for a strength. */
export function strengthSteps(s: ResultStrength): number {
  return s === "good" ? 3 : s === "nonumber" ? 2 : s === "short" ? 1 : 0;
}

// ── Highlights ──────────────────────────────────────────────────────────────────────────────────────────────────

export type HighlightKind = "result" | "company" | "ask";
export interface Segment {
  text: string;
  kind?: HighlightKind;
}

const HIGHLIGHT_ORDER: HighlightKind[] = ["result", "company", "ask"];

/**
 * The body cut into plain and highlighted runs. Each highlight is an exact substring of the body (the contract); one
 * that is missing (the person edited it away) or overlaps an earlier one is left out. The runs join back to the body.
 */
export function highlightSegments(body: string, highlights: Partial<Record<HighlightKind, string | null>> | null | undefined): Segment[] {
  const spans: { start: number; end: number; kind: HighlightKind }[] = [];
  for (const kind of HIGHLIGHT_ORDER) {
    const raw = highlights?.[kind];
    if (typeof raw !== "string") continue;
    const s = raw.trim();
    if (!s) continue;
    const at = body.indexOf(s);
    if (at < 0) continue;
    spans.push({ start: at, end: at + s.length, kind });
  }
  spans.sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let i = 0;
  for (const sp of spans) {
    if (sp.start < i) continue;
    if (sp.start > i) out.push({ text: body.slice(i, sp.start) });
    out.push({ text: body.slice(sp.start, sp.end), kind: sp.kind });
    i = sp.end;
  }
  if (i < body.length) out.push({ text: body.slice(i) });
  return out;
}

// ── Scores ──────────────────────────────────────────────────────────────────────────────────────────────────────

/** 7, 7.5 (never 7.0), clamped to 0 to 10. */
export function formatScore(v: number | null | undefined): string {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.min(10, Math.max(0, v)) : 0;
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export type ScoreTone = "high" | "mid" | "low";
export function scoreTone(v: number): ScoreTone {
  return v >= 8 ? "high" : v >= 5 ? "mid" : "low";
}

// ── Links out: Gmail, X, LinkedIn ───────────────────────────────────────────────────────────────────────────────

/** Gmail's compose window with the subject and body filled in. */
export function gmailComposeUrl(subject: string, body: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type ShareNetwork = "x" | "linkedin" | "copy";

/** The share URL with where it was shared, so a visit from it is counted to the share. */
export function withShareUtm(url: string, network: ShareNetwork): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", network === "copy" ? "share" : network);
    u.searchParams.set("utm_medium", "share");
    u.searchParams.set("utm_campaign", "emailer");
    return u.toString();
  } catch {
    return url;
  }
}

/** The prefilled post: "My cold email scored 8/10 on @studojo's free email writer. Try yours:" (the URL goes after). */
export function shareText(score: number, before?: number | null): string {
  if (typeof before === "number" && Number.isFinite(before) && before !== score) {
    return `My cold email went from ${formatScore(before)}/10 to ${formatScore(score)}/10 on @studojo's free email writer. Try yours:`;
  }
  return `My cold email scored ${formatScore(score)}/10 on @studojo's free email writer. Try yours:`;
}

export function xShareUrl(text: string, url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function linkedinShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

// ── The Stu links ───────────────────────────────────────────────────────────────────────────────────────────────

/** Every place on the page that sends someone to Stu, by its utm_content. */
export const CTA_IDS = [
  "bar", // 1. the announcement bar
  "hero", // 2. the hero's second line
  "result", // 3. next to the result
  "modal", // 4. after copy or Gmail
  "jobs", // 5. 5 matched jobs every day
  "limit", // the daily limit message
  "busy", // the everyone-is-busy message
  "sticky", // 7. the phone bottom bar
  "share", // the share page
  "lock", // the sign-in wall's second choice
] as const;
export type CtaId = (typeof CTA_IDS)[number];

const REFERRER_SOURCES: [RegExp, string][] = [
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "x"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)reddit\.com$/, "reddit"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(^|\.)(t\.me|telegram\.org)$/, "telegram"],
  [/(^|\.)google\.[a-z.]+$/, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)youtube\.com$/, "youtube"],
];

function cleanSource(v: string): string {
  return v.toLowerCase().trim().replace(/[^a-z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "direct";
}

/**
 * The utm_source for a Stu link: the page's own utm_source, else the visit's held first touch, else where the
 * referrer was (t.co is "x"), else "direct". Our own hosts are never a source.
 */
export function ctaSource(search: string | null | undefined, held: URLSearchParams | null | undefined, referrer: string | null | undefined): string {
  const here = new URLSearchParams(search ?? "").get("utm_source");
  if (here && here.trim()) return cleanSource(here);
  const kept = held?.get("utm_source");
  if (kept && kept.trim()) return cleanSource(kept);
  if (referrer) {
    try {
      const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
      if (/(^|\.)studojo\.(com|pro)$/.test(host) || host === "localhost" || host === "127.0.0.1") return "direct";
      for (const [re, name] of REFERRER_SOURCES) if (re.test(host)) return name;
      return cleanSource(host);
    } catch {
      return "direct";
    }
  }
  return "direct";
}

/**
 * A Stu link: the product's /join (`join`, productHref("/join"): https://platform.studojo.pro/join on staging,
 * https://platform.studojo.com/join on production, /b2cnew/join locally) with via=emailer and how=voice (the homepage's
 * own start, with its via), and utm_source, utm_medium=tool, utm_campaign=emailer, utm_content=<cta>.
 */
export function stuJoinHref(join: string, cta: CtaId, source: string): string {
  const q = new URLSearchParams({
    via: "emailer",
    how: "voice",
    utm_source: cleanSource(source),
    utm_medium: "tool",
    utm_campaign: "emailer",
    utm_content: cta,
  });
  return `${join}?${q}`;
}

/** The page's own utm_* keys, passed on to the engine as `utm`. */
export function pageUtm(search: string | null | undefined): Record<string, string> {
  const q = new URLSearchParams(search ?? "");
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "ref"]) {
    const v = q.get(k);
    if (v && v.trim()) out[k] = v.trim().slice(0, 120);
  }
  return out;
}

// ── The saved draft (localStorage) ──────────────────────────────────────────────────────────────────────────────

/** Where the page keeps the form and its last result, so sign-in comes back to them. */
export const DRAFT_KEY = "stu_emailer_v1";
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type Tab = "write" | "grade";

export interface Draft {
  v: 1;
  savedAt: number;
  tab: Tab;
  write: WriteForm;
  writeResult: WriteResponse | null;
  grade: GradeForm;
  gradeResult: GradeResponse | null;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 9000) => (typeof v === "string" ? v.slice(0, max) : "");

function readWriteForm(v: unknown): WriteForm {
  const base = emptyWriteForm();
  if (!isObj(v)) return base;
  const results = Array.isArray(v.results) ? v.results.map((r) => str(r, 600)).slice(0, 3) : [];
  while (results.length < 3) results.push("");
  return {
    company: str(v.company, 300),
    role: str(v.role, 300),
    jobType: v.jobType === "internship" ? "internship" : "job",
    jobMode: v.jobMode === "link" ? "link" : "paste",
    jobPost: str(v.jobPost, 9000),
    jobUrl: str(v.jobUrl, 2000),
    toName: str(v.toName, 200),
    toTitle: str(v.toTitle, 200),
    name: str(v.name, 200),
    now: str(v.now, 400),
    results,
    why: str(v.why, 600),
    links: str(v.links, 600),
  };
}

function readGradeForm(v: unknown): GradeForm {
  if (!isObj(v)) return emptyGradeForm();
  return { email: str(v.email, 4000), subject: str(v.subject, 300), role: str(v.role, 300), company: str(v.company, 300) };
}

function looksLikeWriteResult(v: unknown): v is WriteResponse {
  return isObj(v) && typeof v.id === "string" && typeof v.subject === "string" && typeof v.body === "string" && isObj(v.score);
}

function looksLikeGradeResult(v: unknown): v is GradeResponse {
  return isObj(v) && typeof v.id === "string" && isObj(v.score);
}

/** A saved draft read back, or null (none, broken, or older than a week). */
export function readDraft(raw: string | null | undefined, now: number): Draft | null {
  if (!raw) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(v) || v.v !== 1 || typeof v.savedAt !== "number") return null;
  if (now - v.savedAt > DRAFT_MAX_AGE_MS || v.savedAt > now + 60_000) return null;
  return {
    v: 1,
    savedAt: v.savedAt,
    tab: v.tab === "grade" ? "grade" : "write",
    write: readWriteForm(v.write),
    writeResult: looksLikeWriteResult(v.writeResult) ? v.writeResult : null,
    grade: readGradeForm(v.grade),
    gradeResult: looksLikeGradeResult(v.gradeResult) ? v.gradeResult : null,
  };
}

/** A share response checked field by field (it comes from the network). */
export function readShare(v: unknown): ShareResponse | null {
  if (!isObj(v)) return null;
  const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : null);
  const score = num(v.score);
  if (score === null) return null;
  const s = (x: unknown) => (typeof x === "string" && x.trim() ? x.trim().slice(0, 200) : null);
  return {
    kind: v.kind === "grade" ? "grade" : "write",
    score,
    before: num(v.before),
    after: num(v.after),
    role: s(v.role),
    company: s(v.company),
    companyLogo: typeof v.companyLogo === "string" && v.companyLogo.startsWith("https://") ? v.companyLogo : null,
    firstName: s(v.firstName),
    createdAt: typeof v.createdAt === "string" ? v.createdAt : "",
  };
}

/** "Data Analyst at Acme", "Data Analyst", "Acme" or "". */
export function roleAt(role: string | null | undefined, company: string | null | undefined): string {
  const r = (role ?? "").trim();
  const c = (company ?? "").trim();
  if (r && c) return `${r} at ${c}`;
  return r || c;
}

/**
 * The public origin for a Host header, for absolute share links and og:image: https://studojo.com or
 * https://studojo.pro (www dropped), http://localhost:<port> locally, else https://studojo.com. Pure.
 */
export function originForHost(host: string | null | undefined): string {
  const h = String(host ?? "").split(",")[0].trim().toLowerCase().replace(/\.$/, "");
  const bare = h.replace(/:\d+$/, "");
  if (bare === "studojo.com" || bare === "www.studojo.com") return "https://studojo.com";
  if (bare === "studojo.pro" || bare === "www.studojo.pro") return "https://studojo.pro";
  if ((bare === "localhost" || bare === "127.0.0.1") && /^[a-z0-9.:]+$/.test(h)) return `http://${h}`;
  return "https://studojo.com";
}
