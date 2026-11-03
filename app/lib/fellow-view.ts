// The Growth Fellowship student page: turns one fellow's rows into the view the
// page renders (studojo.com/fellowship-growth/<slug>). Pure functions, no
// database, so the rules are tested directly (fellow-view.test.mjs).
//
// The tables belong to the admin panel (admin-panel app/lib/ugc-creators.server.ts),
// which creates them and holds the same week rules. Keep these in step:
// weeks run Monday to Sunday, India time; a post belongs to the week of its
// due date; a week is complete when it has posts and every one is posted; the
// run counts complete weeks back from last week (this week joins it once complete).
//
// Only allow-listed columns ever reach this file. The page must never carry the
// team's notes, Claude's analysis, drafts, contact details or another fellow's
// identity (unless the programme rules turn cohort names on).

export interface FellowRow {
  id: number;
  slug: string;
  full_name: string;
  college: string | null;
  field: string | null;
  cohort: string | null;
  status: string;
  connections_at_join: number | null;
  joined_at: string | Date;
  linkedin_url: string | null;
  application_id: number | null;
}

export interface ApplicationRow {
  course: string | null;
  year_of_study: string | null;
  city: string | null;
}

export interface FellowPostRow {
  id: number;
  title: string;
  body: string;
  kind: string;
  due_date: string | Date;
  status: string;
  copied_at: string | Date | null;
  own_line: string | null;
  posted_at: string | Date | null;
  post_url: string | null;
  impressions: number | null;
  reactions: number | null;
  comments: number | null;
  metrics_at: string | Date | null;
  screenshot_url?: string | null;
  photo_idea?: string | null;
  photo_url?: string | null;
  photo_help_at?: string | Date | null;
}

export interface StoryRow {
  id: number;
  prompt: string | null;
  text: string;
  spoken: boolean;
  created_at: string | Date;
  /** The talk's read-back (fellow-coach.server.ts), kept on its last saved part; { pending, at } while it's being read. */
  coach?: unknown;
  reply_to?: number | null;
}

/** How long a read-back may take before the page offers to ask again, and how long a story can still get one. */
export const COACH_WAIT_MS = 2 * 60_000;
export const COACH_WINDOW_MS = 24 * 3600_000;

type StoryCoach = { heard: string[]; useful: string[]; skip: string[]; next: string[]; tip: string };
const coachLines = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/**
 * A story as the page shows it, with its read-back. A long talk is saved in parts and read back once, on
 * its last part; the other parts it covered don't offer feedback of their own.
 */
function storyViews(stories: StoryRow[], nowMs: number) {
  const coachOf = (s: StoryRow) => (s.coach && typeof s.coach === "object" ? (s.coach as Record<string, unknown>) : null);
  const covered = new Set(stories.flatMap((s) => {
    const parts = coachOf(s)?.parts;
    return Array.isArray(parts) ? parts.map(Number).filter((id) => id !== s.id) : [];
  }));
  return stories
    .slice()
    .sort((a, b) => toMs(b.created_at) - toMs(a.created_at))
    .map((s) => {
      const c = coachOf(s);
      const done = c && Array.isArray(c.heard);
      const reading = !!c && c.pending === true && nowMs - toMs(c.at as string) < COACH_WAIT_MS;
      const coach: StoryCoach | null = done
        ? { heard: coachLines(c.heard), useful: coachLines(c.useful), skip: coachLines(c.skip), next: coachLines(c.next), tip: typeof c.tip === "string" ? c.tip : "" }
        : null;
      return {
        id: String(s.id),
        prompt: s.prompt ?? "Your own topic",
        text: s.text,
        spoken: s.spoken,
        createdAt: istDateTime(toMs(s.created_at)),
        replyTo: s.reply_to ? String(s.reply_to) : null,
        coach,
        reading,
        canCoach: !coach && !reading && !covered.has(s.id) && nowMs - toMs(s.created_at) < COACH_WINDOW_MS,
      };
    });
}

export interface ConnectionRow {
  connections: number;
  recorded_at: string | Date;
}

export interface CohortFellowRow {
  id: number;
  first_name: string;
}

export interface CohortPostRow {
  creator_id: number;
  status: string;
  due_date: string | Date;
  posted_at: string | Date | null;
  impressions: number | null;
  metrics_at: string | Date | null;
}

export interface Milestone {
  id: string;
  weeks: number | null;
  name: string;
  detail: string;
}

export interface ProgrammeRules {
  postingDays?: string[];
  postsPerWeek?: number;
  studojoPerWeek?: number;
  partnershipLabel?: string;
  milestones?: { id: string; weeks: number; name: string; detail: string }[];
  hiringPipeline?: { id: string; name: string; detail: string };
  /** Show other fellows' first names in the cohort news. Off unless the team turns it on. */
  cohortNames?: boolean;
}

export interface FellowInput {
  fellow: FellowRow;
  application: ApplicationRow | null;
  posts: FellowPostRow[];
  stories: StoryRow[];
  connections: ConnectionRow[];
  rules: ProgrammeRules | null;
  cohortFellows: CohortFellowRow[];
  cohortPosts: CohortPostRow[];
}

// ---------------------------------------------------------------- dates (India time)

const DAY = 86400000;
const IST_OFFSET = 330 * 60000;
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Milliseconds for a timestamp from the database. node-postgres hands back Date
 * objects, drizzle's execute can hand back text ("2026-10-27 14:10:00+00"),
 * and neither form is guaranteed to parse in every runtime, so normalise first.
 */
export function toMs(v: string | Date | null | undefined): number {
  if (v == null) return NaN;
  if (v instanceof Date) return v.getTime();
  let s = String(v).trim();
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/.exec(s);
  if (m) {
    let zone = m[3] ?? "Z";
    if (/^[+-]\d{2}$/.test(zone)) zone += ":00";
    else if (/^[+-]\d{4}$/.test(zone)) zone = zone.slice(0, 3) + ":" + zone.slice(3);
    s = `${m[1]}T${m[2]}${zone}`;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    s += "T00:00:00Z";
  }
  return new Date(s).getTime();
}

/** "YYYY-MM-DD" in India time for a moment. */
export function istDate(t: number | Date = Date.now()): string {
  const ms = t instanceof Date ? t.getTime() : t;
  return new Date(ms + IST_OFFSET).toISOString().slice(0, 10);
}

/** "YYYY-MM-DDTHH:MM:SS+05:30" in India time, the form the page reads. */
export function istDateTime(t: number): string {
  return new Date(t + IST_OFFSET).toISOString().slice(0, 19) + "+05:30";
}

/** A DATE column as "YYYY-MM-DD", whichever way the driver returned it. */
export function dayOf(v: string | Date): string {
  if (v instanceof Date) {
    // node-postgres turns a DATE into local midnight; read the calendar date back the same way.
    const y = v.getFullYear(), mo = v.getMonth() + 1, d = v.getDate();
    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return String(v).slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + n * DAY).toISOString().slice(0, 10);
}

/** The Monday of the week a "YYYY-MM-DD" date falls in. */
export function weekOf(day: string): string {
  const [y, m, d] = day.slice(0, 10).split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  const dow = (new Date(t).getUTCDay() + 6) % 7; // Monday = 0
  return new Date(t - dow * DAY).toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY);
}

const dowShort = (day: string) => DOW[new Date(day + "T00:00:00Z").getUTCDay()];

// ---------------------------------------------------------------- input checks

/**
 * The page address: first name and 8 random characters (admin-panel newCreatorSlug), or the older 8 hex
 * characters. The admin's backfill doesn't cap the name, so neither does this; lookups match exactly anyway.
 */
export const SLUG_RE = /^[a-z]{1,64}-[a-z0-9]{8}$/;

export function normaliseSlug(raw: string | undefined): string | null {
  const s = String(raw ?? "").trim().toLowerCase();
  return SLUG_RE.test(s) ? s : null;
}

// public/fellowship/feed.js checks links with the same pattern (LINK_OK): keep the two identical.
export const LINKEDIN_POST = /^(?:https?:\/\/)?(?:[a-z]{2,3}\.|www\.)?linkedin\.com\/(?:posts|feed\/update)\/[^\s<>"'?#/][^\s<>"']*$/i;

/**
 * A link to a LinkedIn post, as https://www.linkedin.com/..., or null. Tracking
 * parameters after "?" and trailing slashes are dropped; the post id is in the path.
 */
export function cleanPostUrl(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (!s || s.length > 600 || !LINKEDIN_POST.test(s)) return null;
  const path = s.replace(/^(?:https?:\/\/)?(?:[a-z]{2,3}\.|www\.)?linkedin\.com\//i, "").split(/[?#]/)[0].replace(/\/+$/, "");
  return `https://www.linkedin.com/${path}`;
}

/** A whole number from what a student typed ("1,240", " 85 "), or null. */
export function wholeNumber(raw: unknown, max: number): number | null {
  if (typeof raw === "number") return Number.isInteger(raw) && raw >= 0 && raw <= max ? raw : null;
  const s = String(raw ?? "").replace(/[,\s]/g, "");
  if (!/^\d{1,9}$/.test(s)) return null;
  const n = Number(s);
  return n <= max ? n : null;
}

/** Plain text a student typed: control characters out, length capped. */
export function cleanText(raw: unknown, max: number, oneLine = false): string {
  // eslint-disable-next-line no-control-regex -- stripping control characters is the point
  let s = String(raw ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "");
  if (oneLine) s = s.replace(/\s+/g, " ");
  return s.trim().slice(0, max);
}

// ---------------------------------------------------------------- the programme

const DEFAULT_LABEL = "In partnership with Studojo";

// What fellows are asked to share. Their posts are written only from what they share, so the first six
// cover the basics (in this order for someone new); the rest keep returning fellows on new questions.
// A saved story keeps its prompt's text, so a prompt is never reworded once in use, only added.
const CORE_PROMPTS = [
  "Something that shaped who you are today",
  "Why you chose your course, and whether you'd choose it again",
  "An internship, project or job you're proud of",
  "A time something didn't go to plan, and what you did next",
  "Something you're proud of that isn't on your CV",
  "What you want to be doing a year from now, and what's in the way",
];
const MORE_PROMPTS = [
  "Something you learned the hard way",
  "A conversation that changed how you think about your career",
  "A rejection that stung, and what it taught you",
  "The first time you were paid for your work, or the first thing you built",
  "Something you do outside class that most people don't know about",
  "A person who opened a door for you",
  "A moment at college you'll remember for a long time",
];
export const STORY_PROMPTS = [...CORE_PROMPTS, ...MORE_PROMPTS];

/** Stories a fellow is asked for before anything else on their page. */
export const STORIES_WANTED = 3;

/**
 * The prompts in the order to ask them: the basics this fellow hasn't answered, in order; then the
 * other unanswered ones, starting somewhere new each day; answered ones last.
 */
export function promptOrder(answered: (string | null)[], today: string): string[] {
  const used = new Set(answered.filter(Boolean));
  const more = MORE_PROMPTS.filter((p) => !used.has(p));
  const shift = more.length ? Math.abs(diffDays("2026-01-01", today)) % more.length : 0;
  return [
    ...CORE_PROMPTS.filter((p) => !used.has(p)),
    ...more.slice(shift), ...more.slice(0, shift),
    ...STORY_PROMPTS.filter((p) => used.has(p)),
  ];
}

// The rules row is JSON the team edits: take text fields only when they are text.
const textOf = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : typeof v === "number" ? `${v}` : fallback);

function milestonesOf(rules: ProgrammeRules | null): Milestone[] {
  // A list of whole-week milestones; anything else the row might hold is skipped, never fatal.
  const raw: unknown[] = Array.isArray(rules?.milestones) ? (rules?.milestones as unknown[]) : [];
  const list: Milestone[] = raw
    .map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>) : {}))
    .filter((m) => Number.isInteger(m.weeks) && (m.weeks as number) >= 1 && (m.weeks as number) <= 52 && textOf(m.name))
    .map((m) => ({ id: textOf(m.id, `m${m.weeks}`), weeks: m.weeks as number, name: textOf(m.name), detail: textOf(m.detail) }))
    .sort((a, b) => (a.weeks ?? 0) - (b.weeks ?? 0));
  const hp = rules?.hiringPipeline;
  if (hp && textOf(hp.name)) list.push({ id: textOf(hp.id, "pipeline"), weeks: null, name: textOf(hp.name), detail: textOf(hp.detail) });
  return list;
}

// ---------------------------------------------------------------- the view

/** A name as people write it on LinkedIn: words typed all in lower case get a capital ("veera allak" -> "Veera Allak"). */
const displayName = (full: string) =>
  full.trim().split(/\s+/).map((w) => (w && w === w.toLowerCase() ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
export const firstNameOf = (full: string) => (displayName(full).split(" ")[0] || "").slice(0, 40);

// College, city and course as LinkedIn would show them, whatever case they were typed in. Words typed
// with capitals stay exactly as typed; only all-lower-case words change ("amity university" -> "Amity University").
const SMALL_WORDS = new Set(["of", "and", "for", "in", "at", "the", "&"]);
const ACRONYMS = new Set(["cse", "ece", "eee", "it", "ai", "ml", "ds", "hr"]);
export function tidyWords(text: string, acronyms = false): string {
  return text.trim().split(/\s+/).map((w, i) => {
    if (acronyms && ACRONYMS.has(w.toLowerCase())) return w.toUpperCase();
    if (!w || w !== w.toLowerCase()) return w;
    if (i > 0 && SMALL_WORDS.has(w)) return w;
    return w[0].toUpperCase() + w.slice(1);
  }).join(" ");
}
// "Bsc", "BSC", "b.sc" -> "B.Sc."; "BTech", "B. Tech" -> "B.Tech"; "Bcom" -> "B.Com". Anything else is left as typed.
const DEGREE = /^([bm])\.?\s?(tech|sc|com|des|e|a)\b\.?/i;
const DEGREE_TAIL: Record<string, string> = { tech: ".Tech", sc: ".Sc.", com: ".Com", des: ".Des", e: ".E.", a: "A" };
export function tidyCourse(course: string): string {
  const t = course.trim();
  const m = DEGREE.exec(t);
  const degree = m ? m[1].toUpperCase() + DEGREE_TAIL[m[2].toLowerCase()] : "";
  const rest = tidyWords(m ? t.slice(m[0].length) : t, true);
  return [degree, rest].filter(Boolean).join(" ");
}
// ---------------------------------------------------------------- the fellow's own images
// Two kinds, both in one private blob container, each column a JSON array of refs, oldest first:
// - analytics screenshots (screenshot_url): "fellow-proof/<creatorId>/<postId>/<token>.jpg", added each week
//   for the posts that went out. A plain http(s) link the team saved there is kept as it was.
// - the fellow's own photos for a post (photo_url): "fellow-proof/<creatorId>/<postId>/photo/<token>.jpg".
//   Every post goes out with one; the team can add one from the admin panel in the same format.
export const PROOF_CONTAINER = "fellow-proof";
export const SHOT_TOKEN = /^\d{13}-[0-9a-f]{12}$/; // upload time in ms, then 12 random hex characters
export const SHOTS_PER_POST = 6;
export const PHOTOS_PER_POST = 4;
export const SHOT_UNDO_MS = 24 * 60 * 60 * 1000; // after a day a screenshot stays: it's the proof
export type ImageKind = "shot" | "photo";
const KIND_DIR: Record<ImageKind, string> = { shot: "", photo: "photo/" };

export function shotEntries(raw: string | null | undefined): string[] {
  const t = (raw ?? "").trim();
  if (!t) return [];
  if (t.startsWith("[")) {
    try {
      const list: unknown = JSON.parse(t);
      return Array.isArray(list) ? list.filter((e): e is string => typeof e === "string") : [];
    } catch {
      return [];
    }
  }
  return /^https?:\/\//i.test(t) ? [t] : [];
}
export const imageBlob = (kind: ImageKind, creatorId: number, postId: number, token: string) =>
  `${creatorId}/${postId}/${KIND_DIR[kind]}${token}.jpg`;
export const shotBlob = (creatorId: number, postId: number, token: string) => imageBlob("shot", creatorId, postId, token);
/** One post's images of one kind, by token (a screenshot list never includes photos, or the other way round). */
export function imageTokens(kind: ImageKind, raw: string | null | undefined, creatorId: number, postId: number): string[] {
  const prefix = `${PROOF_CONTAINER}/${creatorId}/${postId}/${KIND_DIR[kind]}`;
  return shotEntries(raw)
    .filter((e) => e.startsWith(prefix) && e.endsWith(".jpg"))
    .map((e) => e.slice(prefix.length, -".jpg".length))
    .filter((t) => SHOT_TOKEN.test(t));
}
export const shotTokens = (raw: string | null | undefined, creatorId: number, postId: number) => imageTokens("shot", raw, creatorId, postId);
export const photoTokens = (raw: string | null | undefined, creatorId: number, postId: number) => imageTokens("photo", raw, creatorId, postId);

// Year of study "Graduated" (or similar): the fellow is no longer a student, so the page never calls them one.
const GRADUATED = /graduat|alumn|passed out|completed|working|professional/i;

function initialsOf(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "S";
}

/** "Cohort A", or "" when the team hasn't put the fellow in a cohort yet (the page then leaves it out). */
function cohortLabel(c: string | null): string {
  const s = (c ?? "").trim();
  if (!s) return "";
  return /^cohort\b/i.test(s) ? s : `Cohort ${s}`;
}

function agoLabel(ms: number, now: number): string {
  const mins = Math.max(0, Math.round((now - ms) / 60000));
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = diffDays(istDate(ms), istDate(now));
  return days <= 1 ? "Yesterday" : `${days} days ago`;
}

const isPosted = (p: { status: string }) => p.status === "posted";

export function buildFellowView(input: FellowInput, nowMs: number = Date.now()) {
  const { fellow, application, rules } = input;
  const today = istDate(nowMs);
  const thisWeek = weekOf(today);
  const label = rules?.partnershipLabel || DEFAULT_LABEL;

  // Posts by the week they're due ('ready' and 'posted'). A 'blocked' post is one the team has put on hold to
  // fix: it shows as a notice this week, and never counts as due or missed in any week.
  const posts = input.posts.filter((p) => p.status === "ready" || p.status === "posted");
  const onHold = input.posts.filter((p) => p.status === "blocked" && weekOf(dayOf(p.due_date)) === thisWeek);
  const byWeek = new Map<string, FellowPostRow[]>();
  for (const p of posts) {
    const w = weekOf(dayOf(p.due_date));
    if (!byWeek.has(w)) byWeek.set(w, []);
    byWeek.get(w)!.push(p);
  }
  const complete = (w: string) => {
    const ps = byWeek.get(w);
    return Boolean(ps && ps.length && ps.every(isPosted));
  };
  // Both exclude this week: the page adds it once every post this week is up.
  let weeklyRun = 0;
  for (let w = addDays(thisWeek, -7); byWeek.has(w) && complete(w); w = addDays(w, -7)) weeklyRun++;
  const pastComplete = [...byWeek.keys()].filter((w) => w < thisWeek && complete(w)).sort();
  const completedWeeks = pastComplete.length;

  // When each week-count milestone was reached: the day the m-th week was completed, in the order
  // weeks were completed (a late post can finish an earlier week after a later one).
  const reachedOn = pastComplete
    .map((w) => {
      const last = Math.max(...byWeek.get(w)!.map((p) => toMs(p.posted_at)).filter(Number.isFinite));
      return Number.isFinite(last) ? istDate(last) : addDays(w, 6);
    })
    .sort();
  const milestones = milestonesOf(rules).map((m) => {
    if (m.weeks == null) return { ...m, status: "later" as const, weeksToGo: null };
    if (completedWeeks >= m.weeks) return { ...m, status: "earned" as const, earnedOn: reachedOn[m.weeks - 1] ?? null };
    return { ...m, status: "later" as const, weeksToGo: m.weeks - completedWeeks };
  });
  // Week 1 is the week of the first post the team approved onto the page, not the week they joined
  // (the founder, 3 Nov 2026): the fellowship's clock starts when posts start arriving. Until then it's week 1.
  const firstDue = input.posts.filter((p) => p.status === "ready" || p.status === "posted" || p.status === "blocked").map((p) => dayOf(p.due_date)).sort()[0];
  const startWeek = firstDue ? weekOf(firstDue) : null;
  const firstOpen = milestones.find((m) => m.status === "later" && m.weeks != null);
  if (firstOpen) (firstOpen as { status: string }).status = "next";

  const postView = (p: FellowPostRow) => {
    const due = dayOf(p.due_date);
    const postedMs = toMs(p.posted_at);
    const posted = isPosted(p) && Number.isFinite(postedMs);
    const hasNumbers = p.impressions != null && toMs(p.metrics_at) > 0;
    if (p.status === "blocked") {
      // On hold: the page shows only that it's being updated, never the text or the team's reason.
      return { id: String(p.id), day: dowShort(due), date: due, kind: p.kind === "studojo" ? "studojo" : "personal", title: p.title, body: "",
        status: "blocked", copiedAt: null, ownLine: null, postedAt: null, url: null, metrics: null, numbersDue: null, shots: [] as string[],
        photoIdea: null as string | null, photos: [] as string[], photoHelp: false };
    }
    return {
      id: String(p.id),
      day: dowShort(due),
      date: due,
      kind: p.kind === "studojo" ? "studojo" : "personal",
      title: p.title,
      body: p.body,
      status: posted ? "posted" : "ready",
      copiedAt: Number.isFinite(toMs(p.copied_at)) ? istDateTime(toMs(p.copied_at)) : null,
      ownLine: p.own_line || null,
      postedAt: posted ? istDateTime(postedMs) : null,
      url: posted ? p.post_url : null,
      metrics: hasNumbers ? { impressions: p.impressions ?? 0, reactions: p.reactions ?? 0, comments: p.comments ?? 0 } : null,
      numbersDue: posted ? addDays(istDate(postedMs), 7) : null,
      shots: posted ? shotTokens(p.screenshot_url, fellow.id, p.id) : [],
      photoIdea: p.photo_idea?.trim() || null,
      photos: photoTokens(p.photo_url, fellow.id, p.id),
      // Asked the team for a photo, and none has arrived yet.
      photoHelp: Number.isFinite(toMs(p.photo_help_at)) && !photoTokens(p.photo_url, fellow.id, p.id).length,
    };
  };

  const thisWeekPosts = (byWeek.get(thisWeek) ?? []).slice().sort((a, b) => dayOf(a.due_date).localeCompare(dayOf(b.due_date)) || a.id - b.id);
  const history = [...byWeek.keys()]
    .filter((w) => w < thisWeek)
    .sort()
    .reverse()
    .map((w) => {
      const ps = byWeek.get(w)!;
      return {
        week: w,
        complete: complete(w),
        due: ps.length,
        // Posts that week that never went up: they can still be marked posted, late.
        missed: ps
          .filter((p) => !isPosted(p))
          .sort((a, b) => dayOf(a.due_date).localeCompare(dayOf(b.due_date)) || a.id - b.id)
          .map((p) => {
            const v = postView(p);
            return { id: v.id, day: v.day, date: v.date, title: v.title, kind: v.kind, body: v.body, ownLine: v.ownLine,
              photoIdea: v.photoIdea, photos: v.photos, photoHelp: v.photoHelp };
          }),
        posts: ps
          .filter((p) => isPosted(p) && Number.isFinite(toMs(p.posted_at)))
          .sort((a, b) => toMs(a.posted_at) - toMs(b.posted_at))
          .map((p) => {
            const v = postView(p);
            return { id: v.id, day: v.day, date: v.date, title: v.title, kind: v.kind, postedAt: v.postedAt, metrics: v.metrics, numbersDue: v.numbersDue, shots: v.shots };
          }),
      };
    });

  // Connections: the count at joining (if they gave one), then each update (one a day, the last that day).
  // An unknown count stays unknown: never shown as 0, and never backdated to the join date.
  const joinedMs = toMs(fellow.joined_at);
  const joinedDay = Number.isFinite(joinedMs) ? istDate(joinedMs) : today;
  const atJoin = fellow.connections_at_join ?? null;
  const hist: { date: string; n: number }[] = atJoin != null ? [{ date: joinedDay, n: atJoin }] : [];
  for (const c of input.connections.slice().sort((a, b) => toMs(a.recorded_at) - toMs(b.recorded_at))) {
    const ms = toMs(c.recorded_at);
    if (!Number.isFinite(ms)) continue;
    const d = istDate(ms);
    const last = hist[hist.length - 1];
    if (last && last.date === d) last.n = c.connections;
    else hist.push({ date: d, n: c.connections });
  }

  // The cohort, as counts and anonymous news (names only if the team turns them on).
  const showNames = rules?.cohortNames === true;
  const nameOf = new Map(input.cohortFellows.map((f) => [f.id, firstNameOf(f.first_name)]));
  const cohortIds = new Set(input.cohortFellows.map((f) => f.id));
  cohortIds.add(fellow.id);
  const postedThisWeekBy = new Map<number, number>();
  for (const p of input.cohortPosts) {
    if (!cohortIds.has(p.creator_id) || !isPosted(p) || weekOf(dayOf(p.due_date)) !== thisWeek) continue;
    postedThisWeekBy.set(p.creator_id, (postedThisWeekBy.get(p.creator_id) ?? 0) + 1);
  }
  const cohortSize = cohortIds.size;
  const cohortPostedThisWeek = postedThisWeekBy.size;
  const mine = postedThisWeekBy.get(fellow.id) ?? 0;
  const ahead = [...postedThisWeekBy.entries()].filter(([id, n]) => id !== fellow.id && n > mine).length;
  let cohortPosition: string | null = null;
  if (cohortSize >= 4) {
    if (cohortPostedThisWeek === 0) cohortPosition = "No one in your cohort has posted yet this week";
    else if (mine > 0 && ahead === 0) cohortPosition = "You're among the most active in your cohort this week";
    // "Top 5" only means something in a cohort well above 5.
    else if (cohortSize >= 10 && mine > 0 && ahead < 5) cohortPosition = "You're in the top 5 of your cohort this week";
  }
  const weekAgo = nowMs - 7 * DAY;
  const news: { t: number; text: string }[] = [];
  for (const p of input.cohortPosts) {
    if (p.creator_id === fellow.id || !cohortIds.has(p.creator_id)) continue;
    const who = showNames ? nameOf.get(p.creator_id) || "A fellow" : "A fellow";
    const postedMs = toMs(p.posted_at);
    if (isPosted(p) && postedMs >= weekAgo && postedMs <= nowMs) news.push({ t: postedMs, text: `${who} posted` });
    const metricsMs = toMs(p.metrics_at);
    if (isPosted(p) && (p.impressions ?? 0) >= 1000 && metricsMs >= weekAgo && metricsMs <= nowMs) {
      news.push({ t: metricsMs, text: `${who === "A fellow" ? "A fellow's" : who + "'s"} post crossed ${Math.floor((p.impressions ?? 0) / 1000)}k` });
    }
  }
  news.sort((a, b) => b.t - a.t);

  const courseName = tidyCourse(application?.course ?? "");
  const collegeName = tidyWords(fellow.college ?? "");
  const year = application?.year_of_study?.trim() ?? "";
  const graduated = GRADUATED.test(year);
  const course = graduated ? (courseName ? `${courseName} graduate` : "Graduate") : [courseName, year].filter(Boolean).join(", ");
  const studying = graduated
    ? (courseName && collegeName ? `${courseName} graduate from ${collegeName}`
      : courseName ? `${courseName} graduate`
      : collegeName ? `Graduate of ${collegeName}`
      : "Graduate")
    : (courseName && collegeName ? `${courseName} student at ${collegeName}`
      : courseName ? `${courseName} student`
      : collegeName ? `Student at ${collegeName}`
      : "Student");
  // "Other" is a form choice, not something to show under their name.
  const field = /^other$/i.test(fellow.field?.trim() ?? "") ? "" : fellow.field?.trim();
  const headline = [studying, "Growth Fellow at Studojo", field].filter(Boolean).join(" | ");

  return {
    program: {
      name: "Studojo Growth Fellowship",
      cohort: cohortLabel(fellow.cohort),
      today,
      weekStart: thisWeek,
      postingDays: Array.isArray(rules?.postingDays) ? rules.postingDays : ["Mon", "Tue", "Wed", "Thu", "Fri"],
      postsPerWeek: typeof rules?.postsPerWeek === "number" ? rules.postsPerWeek : 5,
      studojoPerWeek: typeof rules?.studojoPerWeek === "number" ? rules.studojoPerWeek : 2,
      partnershipLabel: label,
      // Speaking a story uses the browser's own speech-to-text (the page shows it only where the browser has it).
      voice: true,
      uploads: true,
      shotsPerPost: SHOTS_PER_POST,
      photosPerPost: PHOTOS_PER_POST,
    },
    me: {
      name: displayName(fellow.full_name),
      first: firstNameOf(fellow.full_name),
      initials: initialsOf(fellow.full_name),
      headline,
      college: collegeName,
      course,
      city: tidyWords(application?.city ?? ""),
      field: fellow.field ?? "",
      joined: joinedDay,
      weekNo: startWeek ? Math.max(1, Math.floor(diffDays(startWeek, thisWeek) / 7) + 1) : 1,
      cohort: cohortLabel(fellow.cohort),
      paused: fellow.status === "paused",
      connections: { now: hist.length ? hist[hist.length - 1].n : null, atJoin, history: hist },
      weeklyRun,
      completedWeeks,
      milestones,
      cohortPosition,
      cohortPostedThisWeek,
      cohortSize,
      thisWeek: {
        start: thisWeek,
        due: thisWeekPosts.length,
        posted: thisWeekPosts.filter(isPosted).length,
        posts: [...thisWeekPosts, ...onHold].sort((a, b) => dayOf(a.due_date).localeCompare(dayOf(b.due_date)) || a.id - b.id).map(postView),
      },
      history,
      storyPrompts: promptOrder(input.stories.map((s) => s.prompt), today),
      storiesWanted: STORIES_WANTED,
      stories: storyViews(input.stories, nowMs),
      cohortFeed: news.slice(0, 6).map((n) => ({ text: n.text, ago: agoLabel(n.t, nowMs) })),
    },
  };
}

export type FellowView = ReturnType<typeof buildFellowView>;
