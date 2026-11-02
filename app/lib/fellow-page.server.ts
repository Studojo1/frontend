import db from "~/lib/db";
import { sql } from "drizzle-orm";
import { checkRateLimit } from "~/lib/ratelimit.server";
import {
  buildFellowView,
  cleanPostUrl,
  cleanText,
  istDate,
  weekOf,
  addDays,
  wholeNumber,
  STORY_PROMPTS,
  type ApplicationRow,
  type CohortFellowRow,
  type CohortPostRow,
  type ConnectionRow,
  type FellowPostRow,
  type FellowRow,
  type FellowView,
  type ProgrammeRules,
  type StoryRow,
} from "~/lib/fellow-view";

// Reads and writes for the Growth Fellowship student page. The admin panel owns
// these tables and creates them (studojo.com runs no DDL). Every query lists its
// columns: the fellows table also holds the team's notes, Claude's learnings,
// contact details and nudge times, and none of that may reach a fellow's page.
// Every write is scoped to the fellow the page's address belongs to.

type Row = Record<string, unknown>;
const rows = <T>(r: { rows: unknown[] }) => r.rows as T[];

/**
 * The site's rate limiter, waited on for 1.5 s at most: the address is the only
 * key, so the limiter stays on, but a slow or unreachable Redis must not hang the page.
 */
export async function fellowRateLimit(request: Request) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      checkRateLimit(request),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 1500);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** The fellow at this address, or null (unknown, or removed from the programme). */
export async function findFellow(slug: string): Promise<FellowRow | null> {
  const r = await db.execute(sql`
    SELECT id, slug, full_name, college, field, cohort, status, connections_at_join, joined_at, linkedin_url, application_id
    FROM ugc_creators
    WHERE slug = ${slug} AND status <> 'removed'
    LIMIT 1
  `);
  return rows<FellowRow>(r)[0] ?? null;
}

export async function loadFellowView(fellow: FellowRow, now: Date = new Date()): Promise<FellowView> {
  const [application, posts, stories, connections, rules, cohortFellows, cohortPosts] = await Promise.all([
    fellow.application_id
      ? db.execute(sql`SELECT course, year_of_study, city FROM ugc_applications WHERE id = ${fellow.application_id}`)
          .then((r) => rows<ApplicationRow>(r)[0] ?? null)
          .catch(() => null)
      : Promise.resolve(null),
    db.execute(sql`
      SELECT id, title, body, kind, due_date, status, copied_at, own_line, posted_at, post_url, impressions, reactions, comments, metrics_at
      FROM ugc_creator_posts
      WHERE creator_id = ${fellow.id} AND status IN ('ready', 'posted')
      ORDER BY due_date, id
    `).then((r) => rows<FellowPostRow>(r)),
    db.execute(sql`
      SELECT id, prompt, text, spoken, created_at
      FROM ugc_creator_stories
      WHERE creator_id = ${fellow.id}
      ORDER BY created_at DESC
      LIMIT 50
    `).then((r) => rows<StoryRow>(r)),
    // The latest readings only (one a day is kept), so an old or busy history can't slow the page.
    db.execute(sql`
      SELECT connections, recorded_at FROM (
        SELECT connections, recorded_at
        FROM ugc_creator_connections
        WHERE creator_id = ${fellow.id}
        ORDER BY recorded_at DESC
        LIMIT 400
      ) latest
      ORDER BY recorded_at
    `).then((r) => rows<ConnectionRow>(r)),
    db.execute(sql`SELECT rules FROM ugc_programme WHERE id = 1`)
      .then((r) => (rows<Row>(r)[0]?.rules ?? null) as ProgrammeRules | null)
      .catch(() => null),
    // The rest of the cohort: an id and a first name only (shown only if the rules allow).
    db.execute(sql`
      SELECT id, split_part(trim(full_name), ' ', 1) AS first_name
      FROM ugc_creators
      WHERE cohort IS NOT DISTINCT FROM ${fellow.cohort} AND status = 'active' AND id <> ${fellow.id}
    `).then((r) => rows<CohortFellowRow>(r)),
    // Their posts this week and anything they did in the last 7 days, for counts and news.
    db.execute(sql`
      SELECT p.creator_id, p.status, p.due_date, p.posted_at, p.impressions, p.metrics_at
      FROM ugc_creator_posts p
      JOIN ugc_creators c ON c.id = p.creator_id
      WHERE c.cohort IS NOT DISTINCT FROM ${fellow.cohort}
        AND (c.status = 'active' OR c.id = ${fellow.id})
        AND p.status IN ('ready', 'posted')
        AND (p.due_date >= ${weekOf(istDate(now.getTime()))}::date
             OR p.posted_at >= now() - interval '7 days'
             OR p.metrics_at >= now() - interval '7 days')
    `).then((r) => rows<CohortPostRow>(r)),
  ]);
  return buildFellowView({ fellow, application, posts, stories, connections, rules, cohortFellows, cohortPosts }, now.getTime());
}

// ---------------------------------------------------------------- what the page can change

export class FellowInputError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const postId = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" && /^\d{1,10}$/.test(v) ? Number(v) : NaN;
  // Post ids are Postgres integers: anything larger can't be one of this fellow's posts.
  if (!Number.isInteger(n) || n <= 0 || n > 2147483647) throw new FellowInputError("That post isn't on your page.", 404);
  return n;
};

const updated = (r: { rowCount?: number | null }) => (r.rowCount ?? 0) > 0;

const TAKEN_BACK = "The team has taken this post back for changes. Reload the page to see your latest posts.";

/** Why a change to one of the fellow's posts did nothing: null when the post is gone (the team pulled it back), else its status. */
async function postStatus(exec: { execute: typeof db.execute }, fellow: FellowRow, id: number): Promise<string | null> {
  const r = await exec.execute(sql`SELECT status FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}`);
  return (rows<Row>(r)[0]?.status as string | undefined) ?? null;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Runs fn in a transaction that holds this fellow's write lock, so a burst of requests can't race past a check. */
function withFellowLock<T>(fellow: FellowRow, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('fellow-page'), ${fellow.id})`);
    return fn(tx);
  });
}

const STORY_MAX = 8000;

/**
 * One change from the page. Throws FellowInputError with a message the page can
 * show. The fellow comes from the address, never from the request body.
 */
export async function applyFellowChange(fellow: FellowRow, body: Record<string, unknown>): Promise<void> {
  // Posts can be acted on up to the end of this week (the page shows no later ones), earlier weeks included.
  const weekEnd = addDays(weekOf(istDate()), 6);

  switch (body.intent) {
    case "copied": {
      const id = postId(body.postId);
      await db.execute(sql`
        UPDATE ugc_creator_posts SET copied_at = COALESCE(copied_at, now()), updated_at = now()
        WHERE id = ${id} AND creator_id = ${fellow.id} AND status = 'ready' AND due_date <= ${weekEnd}::date
      `);
      return;
    }
    case "line": {
      const id = postId(body.postId);
      const line = cleanText(body.line, 220, true);
      const r = await db.execute(sql`
        UPDATE ugc_creator_posts SET own_line = ${line || null}, updated_at = now()
        WHERE id = ${id} AND creator_id = ${fellow.id} AND status = 'ready' AND due_date <= ${weekEnd}::date
      `);
      if (!updated(r)) {
        if ((await postStatus(db, fellow, id)) == null) throw new FellowInputError(TAKEN_BACK, 404);
        throw new FellowInputError("This post is already posted, so your line can't change now.", 409);
      }
      return;
    }
    case "posted": {
      // A post from an earlier week can still be marked, late; the page lists those in Your activity.
      const id = postId(body.postId);
      const url = cleanPostUrl(body.url);
      if (!url) throw new FellowInputError("That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/");
      await withFellowLock(fellow, async (tx) => {
        // One link, one post: a link already saved for another post can't complete this one as well.
        const used = await tx.execute(sql`
          SELECT 1 FROM ugc_creator_posts WHERE lower(post_url) = lower(${url}) AND id <> ${id} LIMIT 1
        `);
        if (used.rows.length) {
          throw new FellowInputError("That link is already saved for another post. Open this post on LinkedIn and copy its own link.", 409);
        }
        const r = await tx.execute(sql`
          UPDATE ugc_creator_posts SET status = 'posted', post_url = ${url}, posted_at = now(), updated_at = now()
          WHERE id = ${id} AND creator_id = ${fellow.id} AND status = 'ready' AND due_date <= ${weekEnd}::date
        `);
        if (!updated(r)) {
          if ((await postStatus(tx, fellow, id)) == null) throw new FellowInputError(TAKEN_BACK, 404);
          throw new FellowInputError("This post is already marked as posted.", 409);
        }
      });
      return;
    }
    case "numbers": {
      const id = postId(body.postId);
      const impressions = wholeNumber(body.impressions, 50_000_000);
      const reactions = wholeNumber(body.reactions, 5_000_000);
      const comments = wholeNumber(body.comments, 1_000_000);
      if (impressions == null || reactions == null || comments == null) {
        throw new FellowInputError("Add impressions, reactions and comments as whole numbers. Use 0 if there were none.");
      }
      const r = await db.execute(sql`
        UPDATE ugc_creator_posts
        SET impressions = ${impressions}, reactions = ${reactions}, comments = ${comments}, metrics_at = now(), updated_at = now()
        WHERE id = ${id} AND creator_id = ${fellow.id} AND status = 'posted'
      `);
      if (!updated(r)) {
        if ((await postStatus(db, fellow, id)) == null) throw new FellowInputError(TAKEN_BACK, 404);
        throw new FellowInputError("Numbers can be added once the post is marked as posted.", 409);
      }
      return;
    }
    case "connections": {
      const n = wholeNumber(body.connections, 30_000);
      if (n == null) throw new FellowInputError("Enter your connections as a whole number, up to 30,000.");
      // One reading a day, India time: saving again the same day replaces it, so the history stays small.
      await withFellowLock(fellow, async (tx) => {
        const r = await tx.execute(sql`
          UPDATE ugc_creator_connections SET connections = ${n}, recorded_at = now()
          WHERE creator_id = ${fellow.id}
            AND (recorded_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date
        `);
        if (!updated(r)) await tx.execute(sql`INSERT INTO ugc_creator_connections (creator_id, connections) VALUES (${fellow.id}, ${n})`);
      });
      return;
    }
    case "story": {
      const text = cleanText(body.text, STORY_MAX + 1);
      if (text.length < 10) throw new FellowInputError("Write a few more words first.");
      if (text.length > STORY_MAX) throw new FellowInputError("That's longer than one story can be (8,000 characters). Please share it in two parts.");
      const prompt = STORY_PROMPTS.includes(String(body.prompt)) ? String(body.prompt) : null;
      // A page can't flood the team's queue: at most 30 stories a day, counted under the fellow's lock.
      await withFellowLock(fellow, async (tx) => {
        const today = await tx.execute(sql`
          SELECT count(*)::int AS n FROM ugc_creator_stories WHERE creator_id = ${fellow.id} AND created_at >= now() - interval '1 day'
        `);
        if (Number(rows<Row>(today)[0]?.n ?? 0) >= 30) throw new FellowInputError("That's a lot of stories for one day. Try again tomorrow.", 429);
        await tx.execute(sql`
          INSERT INTO ugc_creator_stories (creator_id, prompt, text, spoken) VALUES (${fellow.id}, ${prompt}, ${text}, ${body.spoken === true})
        `);
      });
      return;
    }
    default:
      throw new FellowInputError("Unknown request.");
  }
}
