import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import db from "~/lib/db";
import { stripDashes } from "~/lib/strip-dashes";
import {
  PB_EMOJI,
  PB_FORMATS,
  PB_LANGS,
  PB_LIMITS,
  PB_MARKETS,
  PB_MENTIONS,
  PB_POST_STATUSES,
  PB_RELATIONS,
  PB_STEPS,
  PB_TOPICS,
  profileCompleteness,
} from "./model";
import type {
  NewPbPost,
  PbJob,
  PbJobStatus,
  PbPost,
  PbPostStatus,
  PbProfile,
  PbProfileInput,
  PbReview,
  PbReviewItem,
  PbRun,
  PbStep,
  PbStory,
  PbStudentRow,
  PbTone,
} from "./model";

/**
 * Storage for /pb and /pbadmin: student profiles, generation runs, the job
 * queue the background runner works through, and the finished posts.
 *
 * Lazy CREATE TABLE IF NOT EXISTS, like the /content studio, rather than a
 * drizzle migration: these are staging-only tables and must not enter the
 * production migration chain through auth-schema.ts.
 *
 * Everything here is safe across the two staging replicas and across pod
 * restarts. Nothing relies on memory between requests: the job queue is
 * claimed with FOR UPDATE SKIP LOCKED, every write after a claim is guarded by
 * the claiming worker's lease, and "one active job per student" is a unique
 * index, so the database is what says no to a double trigger.
 *
 * No transaction is ever held open across a model call. The pool has 10
 * connections per pod and also serves sign-in, so every transaction here is a
 * handful of short statements.
 */

/* --------------------------------------------------------------- database */

/**
 * A database failure, safe to show. Drizzle wraps every driver error as
 * "Failed query: <sql> params: <values>", and the values can be a student's
 * whole profile, so a page that showed describeError(err) would print it.
 * This keeps the driver error as `cause` (for logs) and the Postgres error
 * code as `code` (23505 and friends), with a plain message on top.
 */
export class PbStoreError extends Error {
  code: string | null;
  constructor(message: string, code: string | null, cause: unknown) {
    super(message, { cause });
    this.name = "PbStoreError";
    this.code = code;
  }
}

function safeDbError(err: unknown): unknown {
  const e = err as { message?: unknown; cause?: unknown } | null;
  if (typeof e?.message === "string" && e.message.startsWith("Failed query:")) {
    const cause = e.cause as { code?: unknown } | null | undefined;
    const code = typeof cause?.code === "string" ? cause.code : null;
    return new PbStoreError("The database could not complete that. Try again in a moment.", code, e.cause);
  }
  return err;
}

/** db.execute with driver errors made safe to show. */
async function exec(query: SQL) {
  try {
    return await db.execute(query);
  } catch (err) {
    throw safeDbError(err);
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** db.transaction with driver errors made safe to show. Keep the work short. */
async function inTransaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
  try {
    return await db.transaction(work);
  } catch (err) {
    throw safeDbError(err);
  }
}

/* ------------------------------------------------------------------ tables */

/**
 * Memoised on the promise, not on a boolean, so concurrent first callers
 * share one setup. Cleared on failure so a transient database error does not
 * leave every later call awaiting a rejected promise.
 */
let tablesReady: Promise<void> | null = null;

function ensureTables(): Promise<void> {
  tablesReady ??= createTables().catch((err) => {
    tablesReady = null;
    throw err;
  });
  return tablesReady;
}

async function createTables() {
  // One transaction behind an advisory lock. The in-process memo above only
  // serialises callers inside one pod; with two replicas starting together,
  // two concurrent CREATE TABLE IF NOT EXISTS can still collide on pg_type
  // (error 23505). The lock makes the second pod wait, then find the tables
  // already there. The number is arbitrary and used for nothing else.
  await inTransaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(7426011903)`);

    // One row per signed-in student. Deleting the account deletes the row.
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS pb_profiles (
        user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
        email TEXT,
        name TEXT NOT NULL DEFAULT '',
        headline TEXT NOT NULL DEFAULT '',
        stage TEXT NOT NULL DEFAULT '',
        market TEXT NOT NULL DEFAULT 'India',
        relation TEXT NOT NULL DEFAULT 'none',
        goals TEXT NOT NULL DEFAULT '',
        topics JSONB NOT NULL DEFAULT '[]'::jsonb,
        stories JSONB NOT NULL DEFAULT '[]'::jsonb,
        writing_sample TEXT NOT NULL DEFAULT '',
        tone JSONB NOT NULL DEFAULT '{"formality":2,"rhythm":2,"energy":3}'::jsonb,
        emoji TEXT NOT NULL DEFAULT 'few',
        lang TEXT NOT NULL DEFAULT 'english',
        avoid TEXT NOT NULL DEFAULT '',
        linkedin_url TEXT NOT NULL DEFAULT '',
        extra TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // One row per staff trigger: the brief and settings every job in it uses.
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS pb_runs (
        id SERIAL PRIMARY KEY,
        brief TEXT NOT NULL DEFAULT '',
        posts_per_student INTEGER NOT NULL DEFAULT 2,
        mention TEXT NOT NULL DEFAULT 'mix',
        link TEXT,
        deliver TEXT NOT NULL DEFAULT 'now',
        created_by TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // The queue. One row per student per run. worker_id plus heartbeat_at is
    // the lease: a running job whose heartbeat is older than the stale window
    // belonged to a pod that died and may be claimed again. On a queued job
    // that was sent back after a passing error, heartbeat_at is when it was
    // sent back, so the retry waits a short while instead of firing at once.
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS pb_jobs (
        id SERIAL PRIMARY KEY,
        run_id INTEGER NOT NULL REFERENCES pb_runs(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'queued',
        step TEXT,
        error TEXT,
        attempts INTEGER NOT NULL DEFAULT 0,
        posts_created INTEGER NOT NULL DEFAULT 0,
        worker_id TEXT,
        heartbeat_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ
      )
    `);
    await tx.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pb_jobs_status_created
        ON pb_jobs (status, created_at)
    `);
    // At most one queued or running job per student, enforced by the
    // database so two replicas (or two clicks) cannot double trigger.
    await tx.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS pb_jobs_one_active
        ON pb_jobs (user_id) WHERE status IN ('queued', 'running')
    `);
    await tx.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pb_jobs_run ON pb_jobs (run_id)
    `);
    await tx.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pb_jobs_user ON pb_jobs (user_id)
    `);

    // Finished posts. held: waiting for staff. delivered: on the student's
    // /pb. removed: hidden everywhere. review is staff only.
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS pb_posts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        run_id INTEGER REFERENCES pb_runs(id) ON DELETE SET NULL,
        job_id INTEGER REFERENCES pb_jobs(id) ON DELETE SET NULL,
        body TEXT NOT NULL,
        hook TEXT NOT NULL DEFAULT '',
        angle TEXT NOT NULL DEFAULT '',
        format TEXT NOT NULL DEFAULT '',
        mention TEXT NOT NULL DEFAULT 'none',
        first_comment TEXT,
        status TEXT NOT NULL DEFAULT 'held',
        review JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        delivered_at TIMESTAMPTZ,
        copied_at TIMESTAMPTZ,
        posted_at TIMESTAMPTZ,
        posted_url TEXT
      )
    `);
    await tx.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pb_posts_user_status
        ON pb_posts (user_id, status)
    `);
    await tx.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pb_posts_run ON pb_posts (run_id)
    `);
    await tx.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pb_posts_job ON pb_posts (job_id)
    `);
    await tx.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pb_posts_created ON pb_posts (created_at DESC)
    `);
  });
}

/* ----------------------------------------------------------------- helpers */

type Row = Record<string, unknown>;

/**
 * A timestamp column as an ISO 8601 UTC string, formatted by Postgres.
 *
 * The driver hands timestamptz back as Postgres text ("2026-10-12
 * 10:23:45.12+00"), which is not ISO and does not parse reliably in every
 * JavaScript engine. Only ever called with a column name written in this
 * file, never with input.
 */
function iso(column: string): SQL {
  return sql.raw(
    `to_char((${column}) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`
  );
}

/** Seconds a requeued job waits before it may be claimed again. */
const RETRY_DELAY_SECONDS = 30;
/**
 * A running job whose heartbeat is older than this belonged to a worker that
 * died (pod restart, deploy). Must stay well above the slowest single model
 * call (90 s) plus the 30 s heartbeat interval.
 */
const STALE_MINUTES = 4;
/** Claims after which a job is failed instead of tried again. */
const MAX_ATTEMPTS = 3;

/** Cut at a UTF-16 boundary without leaving half an emoji behind. */
function cut(s: string, max: number): string {
  if (s.length <= max) return s;
  let out = s.slice(0, max);
  if (/[\uD800-\uDBFF]$/.test(out)) out = out.slice(0, -1);
  return out;
}

/**
 * Drop control characters other than tab and newline. Postgres refuses a NUL
 * in TEXT outright (the save would fail), and the rest are never wanted in a
 * profile or a post.
 */
function dropControl(s: string): string {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (c === 9 || c === 10 || (c >= 32 && c !== 127)) out += ch;
  }
  return out;
}

/** A single-line field: whitespace collapsed, trimmed, clamped. */
function oneLine(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return cut(dropControl(v.replace(/\s+/g, " ")).trim(), max).trim();
}

/** A multi-line field: line breaks kept, trailing spaces and runs of blank lines tidied, clamped. */
function multiLine(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  const text = dropControl(v.replace(/\r\n?/g, "\n"))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  return cut(text, max).trim();
}

/** Integer in [min, max], or the fallback when the input is not a number. */
function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** One of the allowed values (case-insensitive, canonical casing out), else the fallback. */
function pick(v: unknown, allowed: readonly string[], fallback: string): string {
  if (typeof v !== "string") return fallback;
  const want = v.trim().toLowerCase();
  return allowed.find((a) => a.toLowerCase() === want) ?? fallback;
}

/**
 * An http(s) URL, normalised, or null.
 *
 * Accepts a bare host and path ("linkedin.com/in/someone") by assuming
 * https, because that is how people paste profile links. Anything with
 * another scheme (javascript:, data:, mailto:) is refused, as are URLs with
 * credentials in them or with no dot in the host. Never truncated: a cut URL
 * is a broken link, so an over-long one is refused instead.
 */
/** Staff see a posted link as something to open, so only LinkedIn's own hosts are kept. */
function isLinkedinUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com") || host === "lnkd.in";
  } catch {
    return false;
  }
}

export function cleanHttpUrl(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  let s = v.trim();
  if (!s || s.length > max || /\s/.test(s)) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) {
    if (!/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(s)) return null;
    s = `https://${s}`;
  }
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (u.username || u.password) return null;
  if (!u.hostname.includes(".")) return null;
  const out = u.toString();
  return out.length <= max ? out : null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function strOrNull(v: unknown): string | null {
  return v == null ? null : str(v);
}

/** JSONB arrives parsed, but tolerate a JSON string too. */
function json(v: unknown): unknown {
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

const RELATION_VALUES: readonly string[] = PB_RELATIONS.map((r) => r.value);
const EMOJI_VALUES: readonly string[] = PB_EMOJI.map((e) => e.value);
const LANG_VALUES: readonly string[] = PB_LANGS.map((l) => l.value);
const MENTION_VALUES: readonly string[] = PB_MENTIONS.map((m) => m.value);
const POST_MENTIONS: readonly string[] = ["none", "soft", "cta"];
const POST_STATUSES: readonly string[] = PB_POST_STATUSES;
const FORMAT_VALUES: readonly string[] = PB_FORMATS;
const TOPIC_VALUES: readonly string[] = PB_TOPICS;

const DEFAULT_TONE: PbTone = { formality: 2, rhythm: 2, energy: 3 };

function cleanTone(v: unknown): PbTone {
  const t = (json(v) ?? {}) as Partial<Record<keyof PbTone, unknown>>;
  return {
    formality: clampInt(t?.formality, 1, 5, DEFAULT_TONE.formality),
    rhythm: clampInt(t?.rhythm, 1, 5, DEFAULT_TONE.rhythm),
    energy: clampInt(t?.energy, 1, 5, DEFAULT_TONE.energy),
  };
}

/** Topics: known ones in their canonical casing, custom ones clamped, no duplicates, at most PB_LIMITS.topics. */
function cleanTopics(v: unknown): string[] {
  const list = json(v);
  if (!Array.isArray(list)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of list) {
    const t = oneLine(raw, PB_LIMITS.customTopic);
    if (!t) continue;
    const canonical = pick(t, TOPIC_VALUES, t);
    const key = canonical.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(canonical);
    if (out.length >= PB_LIMITS.topics) break;
  }
  return out;
}

const STORY_ID = /^[a-z0-9-]{4,40}$/i;

/** Stories: non-empty text, clamped, at most PB_LIMITS.stories, each with a stable unique id. */
function cleanStories(v: unknown): PbStory[] {
  const list = json(v);
  if (!Array.isArray(list)) return [];
  const out: PbStory[] = [];
  const ids = new Set<string>();
  for (const raw of list) {
    const item = (typeof raw === "string" ? { text: raw } : raw) as { id?: unknown; text?: unknown } | null;
    const text = multiLine(item?.text, PB_LIMITS.story);
    if (!text) continue;
    let id = typeof item?.id === "string" ? item.id.trim() : "";
    if (!STORY_ID.test(id) || ids.has(id)) id = randomUUID();
    ids.add(id);
    out.push({ id, text });
    if (out.length >= PB_LIMITS.stories) break;
  }
  return out;
}

/**
 * Every profile field clamped to PB_LIMITS and every option checked against
 * its list. Pure, so the form parser's output can be trusted or not: the
 * store never relies on it.
 */
export function cleanProfileInput(input: Partial<PbProfileInput> | null | undefined): PbProfileInput {
  const i = (input ?? {}) as Partial<Record<keyof PbProfileInput, unknown>>;
  return {
    name: oneLine(i.name, PB_LIMITS.name),
    headline: oneLine(i.headline, PB_LIMITS.headline),
    stage: oneLine(i.stage, PB_LIMITS.stage),
    market: pick(i.market, PB_MARKETS, "India"),
    relation: pick(i.relation, RELATION_VALUES, "none"),
    goals: multiLine(i.goals, PB_LIMITS.goals),
    topics: cleanTopics(i.topics),
    stories: cleanStories(i.stories),
    writingSample: multiLine(i.writingSample, PB_LIMITS.writingSample),
    tone: cleanTone(i.tone),
    emoji: pick(i.emoji, EMOJI_VALUES, "few"),
    lang: pick(i.lang, LANG_VALUES, "english"),
    avoid: multiLine(i.avoid, PB_LIMITS.avoid),
    linkedinUrl: cleanHttpUrl(i.linkedinUrl, PB_LIMITS.linkedinUrl) ?? "",
    extra: multiLine(i.extra, PB_LIMITS.extra),
  };
}

/** The first non-empty line of a post. On LinkedIn that is the hook. */
function firstLine(body: string): string {
  return cut(body.split("\n").map((l) => l.trim()).find(Boolean) ?? "", 300);
}

function cleanReview(v: unknown): PbReview | null {
  const r = json(v) as { items?: unknown; verdict?: unknown; rounds?: unknown } | null;
  if (!r || typeof r !== "object" || !Array.isArray(r.items)) return null;
  const items: PbReviewItem[] = [];
  for (const raw of r.items.slice(0, 40)) {
    const it = raw as { check?: unknown; pass?: unknown; note?: unknown } | null;
    const check = stripDashes(oneLine(it?.check, 200));
    if (!check) continue;
    items.push({
      check,
      pass: it?.pass === true,
      note: stripDashes(oneLine(it?.note, 600)),
    });
  }
  return {
    items,
    verdict: r.verdict === "pass" ? "pass" : "fix",
    rounds: clampInt(r.rounds, 0, 20, 0),
  };
}

/** Longest post body kept. LinkedIn's own limit is 3,000 characters. */
const POST_BODY_MAX = 6000;
/** LinkedIn's comment limit. */
const FIRST_COMMENT_MAX = 1250;

type CleanPost = {
  body: string;
  hook: string;
  angle: string;
  format: string;
  mention: string;
  firstComment: string | null;
  review: string | null;
};

/** "pass", "fix" or "" from a stored review. A post with no review counts as not passed. */
function reviewVerdict(reviewJson: string | null): string {
  if (!reviewJson) return "";
  try {
    const v = (JSON.parse(reviewJson) as { verdict?: unknown }).verdict;
    return typeof v === "string" ? v : "";
  } catch {
    return "";
  }
}

/**
 * A pipeline post made safe to store. Dashes are stripped once more here as a
 * last line of defence for the product rule, and the hook is always the
 * body's real first line so the two can never drift apart.
 */
function cleanNewPost(p: NewPbPost | null | undefined): CleanPost | null {
  if (!p || typeof p !== "object") return null;
  const body = stripDashes(multiLine(p.body, POST_BODY_MAX));
  if (!body) return null;
  const format = oneLine(p.format, 40).toLowerCase();
  const firstComment = stripDashes(multiLine(p.firstComment, FIRST_COMMENT_MAX));
  const review = cleanReview(p.review);
  return {
    body,
    hook: firstLine(body),
    angle: stripDashes(oneLine(p.angle, 500)),
    format: FORMAT_VALUES.includes(format) ? format : format || "story",
    mention: pick(p.mention, POST_MENTIONS, "none"),
    firstComment: firstComment || null,
    review: review ? JSON.stringify(review) : null,
  };
}

/**
 * A job error as staff will read it on /pbadmin: one short plain line, never
 * a stack, never anything that looks like a key or token.
 */
export function cleanJobError(v: unknown): string {
  const text = oneLine(typeof v === "string" ? v : "", 2000)
    .replace(/\b(?:sk|pk|rk)-[A-Za-z0-9_-]{6,}/g, "[key]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [key]")
    .replace(/[A-Za-z0-9_+/=-]{40,}/g, "[redacted]");
  const out = stripDashes(cut(text, 300)).trim();
  return out || "Something went wrong.";
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: unknown; cause?: { code?: unknown } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

function isStep(v: unknown): v is PbStep {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(PB_STEPS, v);
}

function jobStatus(v: unknown): PbJobStatus {
  return v === "running" || v === "done" || v === "failed" ? v : "queued";
}

function postStatus(v: unknown): PbPostStatus {
  return POST_STATUSES.includes(str(v)) ? (str(v) as PbPostStatus) : "held";
}

/** Who a student is, for staff lists. Profile name, then account name, then email. */
const STUDENT_NAME = sql.raw(
  `COALESCE(NULLIF(btrim(pr.name), ''), NULLIF(btrim(u.name), ''), u.email, 'Student')`
);

/* ---------------------------------------------------------------- profiles */

const PROFILE_COLUMNS = sql.raw(
  `user_id, email, name, headline, stage, market, relation, goals, topics,
   stories, writing_sample, tone, emoji, lang, avoid, linkedin_url, extra,
   to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at,
   to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS updated_at`
);

function toProfile(r: Row): PbProfile {
  return {
    userId: str(r.user_id),
    email: strOrNull(r.email),
    name: str(r.name),
    headline: str(r.headline),
    stage: str(r.stage),
    market: str(r.market) || "India",
    relation: str(r.relation) || "none",
    goals: str(r.goals),
    topics: cleanTopics(r.topics),
    stories: cleanStories(r.stories),
    writingSample: str(r.writing_sample),
    tone: cleanTone(r.tone),
    emoji: str(r.emoji) || "few",
    lang: str(r.lang) || "english",
    avoid: str(r.avoid),
    linkedinUrl: str(r.linkedin_url),
    extra: str(r.extra),
    createdAt: str(r.created_at),
    updatedAt: str(r.updated_at),
  };
}

export async function getProfile(userId: string): Promise<PbProfile | null> {
  await ensureTables();
  if (!userId) return null;
  const res = await exec(sql`
    SELECT ${PROFILE_COLUMNS} FROM pb_profiles WHERE user_id = ${userId}
  `);
  return res.rows[0] ? toProfile(res.rows[0]) : null;
}

/**
 * Create or replace the student's profile. Every field is cleaned again here
 * (cleanProfileInput) whatever the form already did.
 */
export async function saveProfile(
  user: { id: string; email: string | null },
  input: PbProfileInput
): Promise<PbProfile> {
  await ensureTables();
  if (!user?.id) throw new Error("A signed-in user is required to save a profile.");
  const p = cleanProfileInput(input);
  const email = oneLine(user.email, 320) || null;
  const res = await exec(sql`
    INSERT INTO pb_profiles
      (user_id, email, name, headline, stage, market, relation, goals, topics,
       stories, writing_sample, tone, emoji, lang, avoid, linkedin_url, extra)
    VALUES
      (${user.id}, ${email}, ${p.name}, ${p.headline}, ${p.stage}, ${p.market},
       ${p.relation}, ${p.goals}, ${JSON.stringify(p.topics)}::jsonb,
       ${JSON.stringify(p.stories)}::jsonb, ${p.writingSample},
       ${JSON.stringify(p.tone)}::jsonb, ${p.emoji}, ${p.lang}, ${p.avoid},
       ${p.linkedinUrl}, ${p.extra})
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      headline = EXCLUDED.headline,
      stage = EXCLUDED.stage,
      market = EXCLUDED.market,
      relation = EXCLUDED.relation,
      goals = EXCLUDED.goals,
      topics = EXCLUDED.topics,
      stories = EXCLUDED.stories,
      writing_sample = EXCLUDED.writing_sample,
      tone = EXCLUDED.tone,
      emoji = EXCLUDED.emoji,
      lang = EXCLUDED.lang,
      avoid = EXCLUDED.avoid,
      linkedin_url = EXCLUDED.linkedin_url,
      extra = EXCLUDED.extra,
      updated_at = NOW()
    RETURNING ${PROFILE_COLUMNS}
  `);
  return toProfile(res.rows[0]);
}

/**
 * Every student with a profile, for /pbadmin, most recently updated first.
 *
 * Post counts come from one grouped subquery and the active job from a join
 * the partial unique index keeps to one row per student, so this is a single
 * query whatever the number of students. Only the first 200 characters of the
 * writing sample are read: enough for the completeness check, which only
 * asks whether it reaches 150.
 */
export async function listStudents(): Promise<PbStudentRow[]> {
  await ensureTables();
  const res = await exec(sql`
    SELECT
      p.user_id,
      COALESCE(u.email, p.email) AS email,
      p.name, p.headline, p.stage, p.market, p.relation, p.goals, p.topics,
      CASE WHEN jsonb_typeof(p.stories) = 'array' THEN (
        SELECT COUNT(*) FROM jsonb_array_elements(p.stories) s
        WHERE length(btrim(COALESCE(s->>'text', ''))) > 0
      ) ELSE 0 END AS stories_count,
      left(btrim(p.writing_sample), 200) AS sample_head,
      ${iso("p.updated_at")} AS updated_at,
      COALESCE(c.delivered, 0) AS posts_delivered,
      COALESCE(c.held, 0) AS posts_held,
      COALESCE(c.posted, 0) AS posts_posted,
      ${iso("c.last_post_at")} AS last_post_at,
      a.status AS active_job
    FROM pb_profiles p
    LEFT JOIN "user" u ON u.id = p.user_id
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
        COUNT(*) FILTER (WHERE status = 'held') AS held,
        COUNT(*) FILTER (WHERE status = 'delivered' AND posted_at IS NOT NULL) AS posted,
        MAX(created_at) FILTER (WHERE status <> 'removed') AS last_post_at
      FROM pb_posts
      GROUP BY user_id
    ) c ON c.user_id = p.user_id
    LEFT JOIN pb_jobs a
      ON a.user_id = p.user_id AND a.status IN ('queued', 'running')
    ORDER BY p.updated_at DESC, p.user_id
  `);
  return res.rows.map((r) => {
    const topics = cleanTopics(r.topics);
    const storiesCount = Number(r.stories_count ?? 0);
    const sampleHead = str(r.sample_head);
    const { score } = profileCompleteness({
      name: str(r.name),
      headline: str(r.headline),
      goals: str(r.goals),
      topics,
      // Only the count matters to the score; the texts are not read here.
      stories: Array.from({ length: storiesCount }, (_, n) => ({ id: String(n), text: "story" })),
      writingSample: sampleHead,
    });
    const active = r.active_job === "queued" || r.active_job === "running" ? r.active_job : null;
    return {
      userId: str(r.user_id),
      email: strOrNull(r.email),
      name: str(r.name),
      headline: str(r.headline),
      stage: str(r.stage),
      market: str(r.market),
      relation: str(r.relation),
      topics,
      storiesCount,
      hasSample: sampleHead.length >= 150,
      completeness: score,
      updatedAt: str(r.updated_at),
      postsDelivered: Number(r.posts_delivered ?? 0),
      postsHeld: Number(r.posts_held ?? 0),
      postsPosted: Number(r.posts_posted ?? 0),
      lastPostAt: strOrNull(r.last_post_at),
      activeJob: active,
    };
  });
}

/* -------------------------------------------------------------- runs, jobs */

/** createRun's refusal reasons are reported per student in `skipped`. */
export async function createRun(input: {
  brief: string;
  postsPerStudent: number;
  mention: string;
  link: string | null;
  deliver: "now" | "hold";
  createdBy: string;
  userIds: string[];
}): Promise<{ runId: number; jobsCreated: number; skipped: string[] }> {
  await ensureTables();
  const brief = multiLine(input.brief, PB_LIMITS.brief);
  const postsPerStudent = clampInt(input.postsPerStudent, 1, PB_LIMITS.postsPerStudent, 2);
  const mention = pick(input.mention, MENTION_VALUES, "mix");
  const link = cleanHttpUrl(input.link, PB_LIMITS.link);
  const deliver = input.deliver === "hold" ? "hold" : "now";
  const createdBy = oneLine(input.createdBy, 320) || "staff";

  const userIds: string[] = [];
  const seen = new Set<string>();
  for (const raw of Array.isArray(input.userIds) ? input.userIds : []) {
    const id = typeof raw === "string" ? raw.trim() : "";
    if (!id || id.length > 200 || seen.has(id)) continue;
    seen.add(id);
    userIds.push(id);
  }
  if (userIds.length === 0) return { runId: 0, jobsCreated: 0, skipped: [] };

  // One short transaction: the run, then one job per student who has a
  // profile, in the order staff picked them. ON CONFLICT DO NOTHING against
  // pb_jobs_one_active skips anyone who already has a queued or running job,
  // including one created a moment ago by the other replica.
  return inTransaction(async (tx) => {
    const run = await tx.execute(sql`
      INSERT INTO pb_runs (brief, posts_per_student, mention, link, deliver, created_by)
      VALUES (${brief}, ${postsPerStudent}::int, ${mention}, ${link}::text, ${deliver}, ${createdBy})
      RETURNING id
    `);
    const runId = Number(run.rows[0].id);
    const values = userIds.map((id, n) => sql`(${id}::text, ${n}::int)`);
    const inserted = await tx.execute(sql`
      INSERT INTO pb_jobs (run_id, user_id, step)
      SELECT ${runId}::int, v.user_id, 'queued'
      FROM (VALUES ${sql.join(values, sql`, `)}) AS v(user_id, ord)
      JOIN pb_profiles p ON p.user_id = v.user_id
      ORDER BY v.ord
      ON CONFLICT DO NOTHING
      RETURNING user_id
    `);
    const created = new Set(inserted.rows.map((r) => str(r.user_id)));
    const skipped = userIds.filter((id) => !created.has(id));
    if (created.size === 0) {
      // Nothing to do, so keep no empty run in the history.
      await tx.execute(sql`DELETE FROM pb_runs WHERE id = ${runId}::int`);
      return { runId: 0, jobsCreated: 0, skipped };
    }
    return { runId, jobsCreated: created.size, skipped };
  });
}

function toJob(r: Row): PbJob {
  return {
    id: Number(r.id),
    runId: Number(r.run_id),
    userId: str(r.user_id),
    studentName: str(r.student_name) || "Student",
    status: jobStatus(r.status),
    step: strOrNull(r.step),
    error: strOrNull(r.error),
    attempts: Number(r.attempts ?? 0),
    postsCreated: Number(r.posts_created ?? 0),
    createdAt: str(r.created_at),
    startedAt: strOrNull(r.started_at),
    finishedAt: strOrNull(r.finished_at),
  };
}

/** The newest runs with their jobs. Two queries in all, whatever the size. */
export async function listRuns(limit = 20): Promise<PbRun[]> {
  await ensureTables();
  const n = clampInt(limit, 1, 100, 20);
  const runs = await exec(sql`
    SELECT id, brief, posts_per_student, mention, link, deliver, created_by,
           ${iso("created_at")} AS created_at
    FROM pb_runs
    ORDER BY id DESC
    LIMIT ${n}
  `);
  if (runs.rows.length === 0) return [];
  const ids = runs.rows.map((r) => Number(r.id));
  const jobs = await exec(sql`
    SELECT j.id, j.run_id, j.user_id, j.status, j.step, j.error, j.attempts,
           j.posts_created,
           ${iso("j.created_at")} AS created_at,
           ${iso("j.started_at")} AS started_at,
           ${iso("j.finished_at")} AS finished_at,
           ${STUDENT_NAME} AS student_name
    FROM pb_jobs j
    LEFT JOIN pb_profiles pr ON pr.user_id = j.user_id
    LEFT JOIN "user" u ON u.id = j.user_id
    WHERE j.run_id IN (${sql.join(ids.map((id) => sql`${id}::int`), sql`, `)})
    ORDER BY j.id ASC
  `);
  const byRun = new Map<number, PbJob[]>();
  for (const r of jobs.rows) {
    const job = toJob(r);
    const list = byRun.get(job.runId);
    if (list) list.push(job);
    else byRun.set(job.runId, [job]);
  }
  return runs.rows.map((r) => ({
    id: Number(r.id),
    brief: str(r.brief),
    postsPerStudent: Number(r.posts_per_student ?? 2),
    mention: str(r.mention) || "mix",
    link: strOrNull(r.link),
    deliver: r.deliver === "hold" ? "hold" : "now",
    createdBy: str(r.created_by),
    createdAt: str(r.created_at),
    jobs: byRun.get(Number(r.id)) ?? [],
  }));
}

/** True while any job is queued or running anywhere. */
export async function hasActiveJobs(): Promise<boolean> {
  await ensureTables();
  const res = await exec(sql`
    SELECT EXISTS (
      SELECT 1 FROM pb_jobs WHERE status IN ('queued', 'running')
    ) AS active
  `);
  return res.rows[0]?.active === true;
}

export type ClaimedJob = {
  jobId: number;
  runId: number;
  userId: string;
  attempts: number;
  run: {
    brief: string;
    postsPerStudent: number;
    mention: string;
    link: string | null;
    deliver: "now" | "hold";
  };
  profile: PbProfile;
};

/**
 * Claim the oldest job that is ready, for this worker.
 *
 * One atomic UPDATE over a FOR UPDATE SKIP LOCKED pick, so two replicas can
 * never claim the same row. Ready means queued (and, if it was sent back
 * after a passing error, past its short retry delay), or running with a
 * heartbeat older than the stale window, which is a job whose pod died.
 *
 * A job claimed for the fourth time is failed instead of run, and so is one
 * whose profile has gone; either way the next job is claimed in its place.
 */
export async function claimNextJob(workerId: string): Promise<ClaimedJob | null> {
  await ensureTables();
  // Bounded so a pathological queue can never spin forever.
  for (let tries = 0; tries < 50; tries++) {
    const res = await exec(sql`
      UPDATE pb_jobs SET
        status = 'running',
        worker_id = ${workerId},
        attempts = attempts + 1,
        started_at = COALESCE(started_at, NOW()),
        heartbeat_at = NOW(),
        step = 'dossier',
        error = NULL
      WHERE id = (
        SELECT id FROM pb_jobs
        WHERE (
            status = 'queued'
            AND (heartbeat_at IS NULL
                 OR heartbeat_at < NOW() - make_interval(secs => ${RETRY_DELAY_SECONDS}::int))
          )
          OR (
            status = 'running'
            AND (heartbeat_at IS NULL
                 OR heartbeat_at < NOW() - make_interval(mins => ${STALE_MINUTES}::int))
          )
        ORDER BY created_at, id
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, run_id, user_id, attempts
    `);
    const row = res.rows[0];
    if (!row) return null;

    const jobId = Number(row.id);
    const runId = Number(row.run_id);
    const userId = str(row.user_id);
    const attempts = Number(row.attempts);

    if (attempts > MAX_ATTEMPTS) {
      await failJob(jobId, workerId, `Stopped after ${MAX_ATTEMPTS} attempts. Retry it to start again.`);
      continue;
    }

    const runRes = await exec(sql`
      SELECT brief, posts_per_student, mention, link, deliver
      FROM pb_runs WHERE id = ${runId}::int
    `);
    const run = runRes.rows[0];
    if (!run) {
      await failJob(jobId, workerId, "The run this job belonged to is gone.");
      continue;
    }
    const profile = await getProfile(userId);
    if (!profile) {
      await failJob(jobId, workerId, "This student no longer has a profile.");
      continue;
    }

    return {
      jobId,
      runId,
      userId,
      attempts,
      run: {
        brief: str(run.brief),
        postsPerStudent: clampInt(run.posts_per_student, 1, PB_LIMITS.postsPerStudent, 2),
        mention: pick(run.mention, MENTION_VALUES, "mix"),
        link: strOrNull(run.link),
        deliver: run.deliver === "hold" ? "hold" : "now",
      },
      profile,
    };
  }
  return null;
}

/**
 * Keep the lease alive and record the current step. False means the lease is
 * gone (the job was reclaimed after this worker looked dead, or finished):
 * stop work and write nothing more.
 */
export async function heartbeatJob(jobId: number, workerId: string, step: PbStep): Promise<boolean> {
  await ensureTables();
  const s = isStep(step) ? step : null;
  const res = await exec(sql`
    UPDATE pb_jobs SET
      heartbeat_at = NOW(),
      step = COALESCE(${s}::text, step)
    WHERE id = ${jobId}::int AND worker_id = ${workerId} AND status = 'running'
    RETURNING id
  `);
  return res.rows.length > 0;
}

/**
 * Save the finished posts and close the job, in one short transaction.
 *
 * The lease is checked first, by the same UPDATE that marks the job done, so
 * a worker whose job was reclaimed can never write posts. Returns the new
 * post ids, or null when the lease was lost (nothing written).
 *
 * The run and student come from the job row itself. If the caller's values
 * disagree the transaction is rolled back, so a mix-up can never file posts
 * under the wrong student.
 */
export async function completeJob(input: {
  jobId: number;
  workerId: string;
  runId: number;
  userId: string;
  posts: NewPbPost[];
  status: PbPostStatus;
  /** With status "delivered": hold back any post its review did not pass, for staff to look at first. */
  holdFlagged?: boolean;
}): Promise<number[] | null> {
  await ensureTables();
  const posts = (Array.isArray(input.posts) ? input.posts : [])
    .map(cleanNewPost)
    .filter((p): p is CleanPost => p !== null);
  const status: PbPostStatus = input.status === "delivered" ? "delivered" : "held";
  const statusOf = (p: CleanPost): PbPostStatus =>
    status === "delivered" && input.holdFlagged && reviewVerdict(p.review) !== "pass" ? "held" : status;

  return inTransaction(async (tx) => {
    const lease = await tx.execute(sql`
      UPDATE pb_jobs SET
        status = 'done',
        posts_created = ${posts.length}::int,
        error = NULL,
        heartbeat_at = NOW(),
        finished_at = NOW()
      WHERE id = ${input.jobId}::int AND worker_id = ${input.workerId} AND status = 'running'
      RETURNING run_id, user_id
    `);
    const job = lease.rows[0];
    if (!job) return null;
    const runId = Number(job.run_id);
    const userId = str(job.user_id);
    if (runId !== input.runId || userId !== input.userId) {
      throw new Error(`completeJob: job ${input.jobId} does not belong to that run and student.`);
    }
    if (posts.length === 0) return [];

    const values = posts.map((p) => {
      const st = statusOf(p);
      const deliveredAt = st === "delivered" ? sql`NOW()` : sql`NULL`;
      return sql`(
        ${userId}::text, ${runId}::int, ${input.jobId}::int, ${p.body}::text,
        ${p.hook}::text, ${p.angle}::text, ${p.format}::text, ${p.mention}::text,
        ${p.firstComment}::text, ${st}::text, ${p.review}::jsonb, ${deliveredAt}
      )`;
    });
    const res = await tx.execute(sql`
      INSERT INTO pb_posts
        (user_id, run_id, job_id, body, hook, angle, format, mention,
         first_comment, status, review, delivered_at)
      VALUES ${sql.join(values, sql`, `)}
      RETURNING id
    `);
    return res.rows.map((r) => Number(r.id));
  });
}

/**
 * Close a job as failed, or send it back to the queue for another attempt.
 * Lease guarded like every write after a claim. A requeued job waits
 * RETRY_DELAY_SECONDS before it can be claimed, and keeps its message so
 * staff can see why it is retrying. False means the lease was lost.
 */
export async function failJob(
  jobId: number,
  workerId: string,
  error: string,
  opts?: { requeue?: boolean }
): Promise<boolean> {
  await ensureTables();
  const message = cleanJobError(error);
  const res = opts?.requeue
    ? await exec(sql`
        UPDATE pb_jobs SET
          status = 'queued',
          step = 'queued',
          error = ${message},
          worker_id = NULL,
          heartbeat_at = NOW()
        WHERE id = ${jobId}::int AND worker_id = ${workerId} AND status = 'running'
        RETURNING id
      `)
    : await exec(sql`
        UPDATE pb_jobs SET
          status = 'failed',
          error = ${message},
          finished_at = NOW()
        WHERE id = ${jobId}::int AND worker_id = ${workerId} AND status = 'running'
        RETURNING id
      `);
  return res.rows.length > 0;
}

/**
 * Staff retry of a failed job: back to queued with attempts reset to 0.
 * Refused, with a plain reason, when the job is not failed or the student
 * already has another queued or running job. Never throws for a refusal.
 */
export async function tryRetryJob(
  jobId: number
): Promise<{ ok: true } | { ok: false; reason: string }> {
  await ensureTables();
  const busy = "This student already has posts being written. Wait for that job to finish.";
  try {
    const res = await exec(sql`
      UPDATE pb_jobs j SET
        status = 'queued',
        step = 'queued',
        attempts = 0,
        error = NULL,
        worker_id = NULL,
        heartbeat_at = NULL,
        started_at = NULL,
        finished_at = NULL,
        posts_created = 0
      WHERE j.id = ${jobId}::int
        AND j.status = 'failed'
        AND NOT EXISTS (
          SELECT 1 FROM pb_jobs o
          WHERE o.user_id = j.user_id AND o.id <> j.id
            AND o.status IN ('queued', 'running')
        )
      RETURNING j.id
    `);
    if (res.rows.length > 0) return { ok: true };
  } catch (err) {
    // The other replica queued a job for this student between our check and
    // our write; the unique index refused it.
    if (isUniqueViolation(err)) return { ok: false, reason: busy };
    throw err;
  }
  const cur = await exec(sql`
    SELECT j.status,
      EXISTS (
        SELECT 1 FROM pb_jobs o
        WHERE o.user_id = j.user_id AND o.id <> j.id
          AND o.status IN ('queued', 'running')
      ) AS busy
    FROM pb_jobs j WHERE j.id = ${jobId}::int
  `);
  const row = cur.rows[0];
  if (!row) return { ok: false, reason: "That job no longer exists." };
  if (row.status !== "failed") return { ok: false, reason: "Only a failed job can be retried." };
  if (row.busy === true) return { ok: false, reason: busy };
  return { ok: false, reason: "That job could not be retried. Try again." };
}

/**
 * Contract form of tryRetryJob. Throws an Error whose message is the plain
 * reason when the retry is refused, so an action can show it as is.
 */
export async function retryJob(jobId: number): Promise<void> {
  const result = await tryRetryJob(jobId);
  if (!result.ok) throw new Error(result.reason);
}

/* ------------------------------------------------------------------- posts */

function toPost(r: Row): PbPost {
  return {
    id: Number(r.id),
    userId: str(r.user_id),
    runId: r.run_id == null ? null : Number(r.run_id),
    body: str(r.body),
    hook: str(r.hook),
    angle: str(r.angle),
    format: str(r.format),
    mention: str(r.mention) || "none",
    firstComment: strOrNull(r.first_comment),
    status: postStatus(r.status),
    review: r.review == null ? null : cleanReview(r.review),
    createdAt: str(r.created_at),
    deliveredAt: strOrNull(r.delivered_at),
    copiedAt: strOrNull(r.copied_at),
    postedAt: strOrNull(r.posted_at),
    postedUrl: strOrNull(r.posted_url),
  };
}

/**
 * The student's own delivered posts for /pb, newest delivery first.
 *
 * The review and the angle are staff only and are never selected, so they
 * cannot reach the student's page: review is always null and angle is "".
 */
export async function listPostsForStudent(userId: string): Promise<PbPost[]> {
  await ensureTables();
  if (!userId) return [];
  const res = await exec(sql`
    SELECT p.id, p.user_id, p.run_id, p.body, p.hook, p.format, p.mention,
           p.first_comment, p.status, p.posted_url,
           ${iso("p.created_at")} AS created_at,
           ${iso("p.delivered_at")} AS delivered_at,
           ${iso("p.copied_at")} AS copied_at,
           ${iso("p.posted_at")} AS posted_at
    FROM pb_posts p
    WHERE p.user_id = ${userId} AND p.status = 'delivered'
    ORDER BY COALESCE(p.delivered_at, p.created_at) DESC, p.id DESC
    LIMIT 200
  `);
  return res.rows.map((r) => ({ ...toPost(r), angle: "", review: null }));
}

/** Held and delivered posts for /pbadmin, newest first, with the student's name. */
export async function listPostsForAdmin(opts?: {
  userId?: string;
  runId?: number;
  /** Only held or only delivered. Filtered here so the limit applies after it. */
  status?: "held" | "delivered";
  limit?: number;
}): Promise<(PbPost & { studentName: string })[]> {
  await ensureTables();
  const limit = clampInt(opts?.limit, 1, 500, 200);
  const status = opts?.status === "held" || opts?.status === "delivered" ? opts.status : null;
  const userId = opts?.userId ? opts.userId : null;
  const runId = typeof opts?.runId === "number" && Number.isFinite(opts.runId) ? Math.trunc(opts.runId) : null;
  const res = await exec(sql`
    SELECT p.id, p.user_id, p.run_id, p.body, p.hook, p.angle, p.format,
           p.mention, p.first_comment, p.status, p.review, p.posted_url,
           ${iso("p.created_at")} AS created_at,
           ${iso("p.delivered_at")} AS delivered_at,
           ${iso("p.copied_at")} AS copied_at,
           ${iso("p.posted_at")} AS posted_at,
           ${STUDENT_NAME} AS student_name
    FROM pb_posts p
    LEFT JOIN pb_profiles pr ON pr.user_id = p.user_id
    LEFT JOIN "user" u ON u.id = p.user_id
    WHERE p.status IN ('held', 'delivered')
      AND (${userId}::text IS NULL OR p.user_id = ${userId}::text)
      AND (${runId}::int IS NULL OR p.run_id = ${runId}::int)
      AND (${status}::text IS NULL OR p.status = ${status}::text)
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ${limit}
  `);
  return res.rows.map((r) => ({ ...toPost(r), studentName: str(r.student_name) || "Student" }));
}

/** How many posts each of these runs still has held. Counted in the database, so no list window can hide any. */
export async function heldCountsForRuns(runIds: number[]): Promise<Record<number, number>> {
  await ensureTables();
  const ids = [...new Set(runIds.filter((n) => Number.isSafeInteger(n) && n > 0))];
  if (ids.length === 0) return {};
  const res = await exec(sql`
    SELECT run_id, COUNT(*)::int AS n FROM pb_posts
    WHERE status = 'held' AND run_id IN (${sql.join(ids.map((i) => sql`${i}::int`), sql`, `)})
    GROUP BY run_id
  `);
  const out: Record<number, number> = {};
  for (const r of res.rows) out[Number(r.run_id)] = Number(r.n);
  return out;
}

/** Staff review action. Delivering stamps delivered_at the first time only. */
export async function setPostStatus(postId: number, status: PbPostStatus): Promise<void> {
  await ensureTables();
  if (!POST_STATUSES.includes(status)) throw new Error("Unknown post status.");
  await exec(sql`
    UPDATE pb_posts SET
      status = ${status}::text,
      delivered_at = CASE
        WHEN ${status}::text = 'delivered' THEN COALESCE(delivered_at, NOW())
        ELSE delivered_at
      END
    WHERE id = ${postId}::int
  `);
}

/** Deliver every held post in a run. Returns how many were delivered. */
export async function deliverHeldPosts(runId: number): Promise<number> {
  await ensureTables();
  const res = await exec(sql`
    UPDATE pb_posts SET
      status = 'delivered',
      delivered_at = COALESCE(delivered_at, NOW())
    WHERE run_id = ${runId}::int AND status = 'held'
    RETURNING id
  `);
  return res.rows.length;
}

/** The student copied a post. Only their own delivered post; first copy kept. */
/** False when no delivered post of this student matched (staff held or removed it). */
export async function markPostCopied(postId: number, userId: string): Promise<boolean> {
  await ensureTables();
  const res = await exec(sql`
    UPDATE pb_posts SET copied_at = COALESCE(copied_at, NOW())
    WHERE id = ${postId}::int AND user_id = ${userId} AND status = 'delivered'
    RETURNING id
  `);
  return res.rows.length > 0;
}

/**
 * The student says they posted it, optionally with the live URL. Only their
 * own delivered post. A URL that is not a LinkedIn link is dropped, and a later call
 * without a URL keeps the one already saved.
 */
export async function markPostPosted(postId: number, userId: string, url: string | null): Promise<boolean> {
  await ensureTables();
  const candidate = cleanHttpUrl(url, PB_LIMITS.postedUrl);
  const postedUrl = candidate && isLinkedinUrl(candidate) ? candidate : null;
  const res = await exec(sql`
    UPDATE pb_posts SET
      posted_at = COALESCE(posted_at, NOW()),
      posted_url = COALESCE(${postedUrl}::text, posted_url)
    WHERE id = ${postId}::int AND user_id = ${userId} AND status = 'delivered'
    RETURNING id
  `);
  return res.rows.length > 0;
}

/**
 * What this student has already been given, newest first, so the pipeline
 * does not repeat a hook or an angle. Removed posts count too: an angle staff
 * threw away is not one to serve again.
 */
export async function pastPostsForStudent(
  userId: string,
  limit = 12
): Promise<{ hook: string; angle: string; format: string }[]> {
  await ensureTables();
  const n = clampInt(limit, 1, 100, 12);
  const res = await exec(sql`
    SELECT hook, angle, format FROM pb_posts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC, id DESC
    LIMIT ${n}
  `);
  return res.rows.map((r) => ({ hook: str(r.hook), angle: str(r.angle), format: str(r.format) }));
}

/**
 * Other students' recent hooks and angles, so a cohort does not all post the
 * same thing in the same week. Held and delivered only.
 */
export async function cohortRecentPosts(opts: {
  days: number;
  excludeUserId?: string;
  limit?: number;
}): Promise<{ userId: string; name: string; hook: string; angle: string }[]> {
  await ensureTables();
  const days = clampInt(opts.days, 1, 365, 30);
  const limit = clampInt(opts.limit, 1, 200, 40);
  const exclude = opts.excludeUserId ? opts.excludeUserId : null;
  const res = await exec(sql`
    SELECT p.user_id, COALESCE(NULLIF(btrim(pr.name), ''), 'A student') AS name,
           p.hook, p.angle
    FROM pb_posts p
    LEFT JOIN pb_profiles pr ON pr.user_id = p.user_id
    WHERE p.status IN ('held', 'delivered')
      AND p.created_at > NOW() - make_interval(days => ${days}::int)
      AND (${exclude}::text IS NULL OR p.user_id <> ${exclude}::text)
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ${limit}
  `);
  return res.rows.map((r) => ({
    userId: str(r.user_id),
    name: str(r.name),
    hook: str(r.hook),
    angle: str(r.angle),
  }));
}
