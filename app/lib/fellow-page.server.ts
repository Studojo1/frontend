import { randomBytes } from "node:crypto";
import db from "~/lib/db";
import { sql } from "drizzle-orm";
import { checkRateLimit } from "~/lib/ratelimit.server";
import { proofStore } from "~/lib/fellow-proof.server";
import {
  buildFellowView,
  imageBlob,
  imageTokens,
  PHOTOS_PER_POST,
  photoTokens,
  PROOF_CONTAINER,
  shotEntries,
  SHOT_TOKEN,
  SHOT_UNDO_MS,
  SHOTS_PER_POST,
  type ImageKind,
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
      SELECT id, title, body, kind, due_date, status, copied_at, own_line, posted_at, post_url, impressions, reactions, comments, metrics_at, screenshot_url,
        photo_idea, photo_url, photo_help_at
      FROM ugc_creator_posts
      WHERE creator_id = ${fellow.id} AND status IN ('ready', 'posted', 'blocked')
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
const ON_HOLD = "This post is on hold while the team updates it. Please don't post it yet; we'll let you know when it's back.";

/** A change that did nothing to one of the fellow's posts: say why (taken back, on hold) or fall through to `otherwise`. */
async function refuseChange(exec: { execute: typeof db.execute }, fellow: FellowRow, id: number, otherwise: string): Promise<never> {
  const status = await postStatus(exec, fellow, id);
  if (status == null) throw new FellowInputError(TAKEN_BACK, 404);
  if (status === "blocked") throw new FellowInputError(ON_HOLD, 409);
  throw new FellowInputError(otherwise, 409);
}

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
const NEEDS_PHOTO = "Add your own photo to this post first. Every post goes out with one.";

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
      if (!updated(r)) await refuseChange(db, fellow, id, "This post is already posted, so your line can't change now.");
      return;
    }
    case "posted": {
      // A post from an earlier week can still be marked, late; the page lists those in Your activity.
      // The link is optional ("Did you post it?" can be answered without one), and a post marked without
      // a link can get its link later, once. The admin panel marks posts the same way.
      const id = postId(body.postId);
      const raw = typeof body.url === "string" ? body.url.trim() : "";
      const url = raw ? cleanPostUrl(raw) : null;
      if (raw && !url) throw new FellowInputError("That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/");
      await withFellowLock(fellow, async (tx) => {
        // The hard rule: a post is never marked posted without a photo of the fellow's own (or one the team added).
        const before = rows<Row>(await tx.execute(sql`
          SELECT status, photo_url FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}
        `))[0];
        if (before?.status === "ready" && !photoTokens((before.photo_url as string | null) ?? null, fellow.id, id).length) {
          throw new FellowInputError(NEEDS_PHOTO, 409);
        }
        // One link, one post: a link already saved for another post can't complete this one as well.
        if (url) {
          const used = await tx.execute(sql`
            SELECT 1 FROM ugc_creator_posts WHERE lower(post_url) = lower(${url}) AND id <> ${id} LIMIT 1
          `);
          if (used.rows.length) {
            throw new FellowInputError("That link is already saved for another post. Open this post on LinkedIn and copy its own link.", 409);
          }
        }
        const r = await tx.execute(sql`
          UPDATE ugc_creator_posts
          SET post_url = COALESCE(${url}::text, post_url),
              posted_at = CASE WHEN status = 'ready' THEN now() ELSE posted_at END,
              status = 'posted', updated_at = now()
          WHERE id = ${id} AND creator_id = ${fellow.id}
            AND ((status = 'ready' AND due_date <= ${weekEnd}::date)
              OR (status = 'posted' AND post_url IS NULL AND ${url}::text IS NOT NULL))
        `);
        if (!updated(r)) await refuseChange(tx, fellow, id, "This post is already marked as posted.");
      });
      return;
    }
    case "photo-help": {
      // The fellow has no photo of their own for this post: the team adds one. Adding a photo clears it.
      const id = postId(body.postId);
      const r = await db.execute(sql`
        UPDATE ugc_creator_posts SET photo_help_at = COALESCE(photo_help_at, now()), updated_at = now()
        WHERE id = ${id} AND creator_id = ${fellow.id} AND status = 'ready' AND due_date <= ${weekEnd}::date
      `);
      if (!updated(r)) await refuseChange(db, fellow, id, "This post is already posted.");
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
      if (!updated(r)) await refuseChange(db, fellow, id, "Numbers can be added once the post is marked as posted.");
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

// ---------------------------------------------------------------- the fellow's own images
// Analytics screenshots go on posted posts (the weekly proof); photos go on posts before they go out.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const RULES: Record<ImageKind, {
  column: ReturnType<typeof sql.raw>;
  most: number;
  bytes: number;
  none: string;
  full: string;
}> = {
  shot: {
    column: sql.raw("screenshot_url"),
    most: SHOTS_PER_POST,
    bytes: 3 * 1024 * 1024,
    none: "That screenshot isn't on this post.",
    full: `This post has ${SHOTS_PER_POST} screenshots, the most it can have. Remove one to add another.`,
  },
  photo: {
    column: sql.raw("photo_url"),
    most: PHOTOS_PER_POST,
    bytes: MAX_IMAGE_BYTES,
    none: "That photo isn't on this post.",
    full: `This post has ${PHOTOS_PER_POST} photos, the most it can have. Remove one to add another.`,
  },
};

/** The post's entries of one kind, once the post can take another; otherwise why not. */
async function imageEntries(exec: { execute: typeof db.execute }, kind: ImageKind, fellow: FellowRow, id: number): Promise<string[]> {
  const rule = RULES[kind];
  const weekEnd = addDays(weekOf(istDate()), 6);
  const r = await exec.execute(sql`
    SELECT status, due_date <= ${weekEnd}::date AS open, ${rule.column} AS images
    FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}
  `);
  const row = rows<Row>(r)[0];
  if (!row || !["ready", "posted", "blocked"].includes(String(row.status))) throw new FellowInputError(TAKEN_BACK, 404);
  if (row.status === "blocked") throw new FellowInputError(ON_HOLD, 409);
  if (kind === "shot" && row.status !== "posted") throw new FellowInputError("Add analytics screenshots once the post is marked as posted.", 409);
  if (kind === "photo" && row.status !== "ready") throw new FellowInputError("This post is already posted, so its photos can't change now.", 409);
  if (kind === "photo" && !row.open) throw new FellowInputError("That post isn't on your page yet.", 404);
  const raw = (row.images as string | null) ?? null;
  const entries = shotEntries(raw);
  // Something in the column the page doesn't recognise is kept, never dropped.
  if (raw?.trim() && !entries.length) entries.push(raw.trim());
  if (imageTokens(kind, raw, fellow.id, id).length >= rule.most) throw new FellowInputError(rule.full, 409);
  return entries;
}

/** Saves one image (a JPEG the page has already re-encoded) on one of the fellow's posts. */
export async function addFellowImage(kind: ImageKind, fellow: FellowRow, rawPostId: unknown, jpeg: Uint8Array, now = Date.now()): Promise<void> {
  const id = postId(rawPostId);
  if (jpeg.length > RULES[kind].bytes) throw new FellowInputError("That picture is too big to send.", 413);
  if (jpeg.length < 4 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg[2] !== 0xff) {
    throw new FellowInputError("That file isn't a picture the page can use. Choose another one.", 415);
  }
  await imageEntries(db, kind, fellow, id); // refuse early, before anything is stored
  const blob = imageBlob(kind, fellow.id, id, `${now}-${randomBytes(6).toString("hex")}`);
  await proofStore.put(blob, jpeg);
  try {
    await withFellowLock(fellow, async (tx) => {
      const entries = await imageEntries(tx, kind, fellow, id);
      entries.push(`${PROOF_CONTAINER}/${blob}`);
      // A photo also answers "I don't have a photo for this".
      await tx.execute(kind === "photo"
        ? sql`UPDATE ugc_creator_posts SET photo_url = ${JSON.stringify(entries)}, photo_help_at = NULL, updated_at = now()
              WHERE id = ${id} AND creator_id = ${fellow.id}`
        : sql`UPDATE ugc_creator_posts SET screenshot_url = ${JSON.stringify(entries)}, updated_at = now()
              WHERE id = ${id} AND creator_id = ${fellow.id}`);
    });
  } catch (e) {
    await proofStore.remove(blob).catch(() => {});
    throw e;
  }
}

const imageToken = (kind: ImageKind, v: unknown) => {
  if (typeof v !== "string" || !SHOT_TOKEN.test(v)) throw new FellowInputError(RULES[kind].none, 404);
  return v;
};

/** Removes an image: a screenshot in its first day (after that it stays as proof), a photo until the post goes out. */
export async function removeFellowImage(kind: ImageKind, fellow: FellowRow, rawPostId: unknown, rawToken: unknown, now = Date.now()): Promise<void> {
  const id = postId(rawPostId);
  const token = imageToken(kind, rawToken);
  const blob = imageBlob(kind, fellow.id, id, token);
  const rule = RULES[kind];
  await withFellowLock(fellow, async (tx) => {
    const row = rows<Row>(await tx.execute(sql`
      SELECT status, ${rule.column} AS images FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}
    `))[0];
    const entries = shotEntries((row?.images as string | null) ?? null);
    if (!entries.includes(`${PROOF_CONTAINER}/${blob}`)) throw new FellowInputError(rule.none, 404);
    if (kind === "shot" && now - Number(token.slice(0, 13)) > SHOT_UNDO_MS) {
      throw new FellowInputError("A screenshot can be removed only in the first 24 hours. Ask the Studojo team if this one is wrong.", 409);
    }
    if (kind === "photo" && row?.status !== "ready") throw new FellowInputError("This post is already posted, so its photos stay.", 409);
    const rest = entries.filter((e) => e !== `${PROOF_CONTAINER}/${blob}`);
    const value = rest.length ? JSON.stringify(rest) : null;
    await tx.execute(kind === "photo"
      ? sql`UPDATE ugc_creator_posts SET photo_url = ${value}, updated_at = now() WHERE id = ${id} AND creator_id = ${fellow.id}`
      : sql`UPDATE ugc_creator_posts SET screenshot_url = ${value}, updated_at = now() WHERE id = ${id} AND creator_id = ${fellow.id}`);
  });
  await proofStore.remove(blob);
}

/** One of the fellow's own images, or null if it isn't on that post. */
export async function readFellowImage(kind: ImageKind, fellow: FellowRow, rawPostId: unknown, rawToken: unknown): Promise<Uint8Array | null> {
  const id = postId(rawPostId);
  const token = imageToken(kind, rawToken);
  const r = await db.execute(sql`SELECT ${RULES[kind].column} AS images FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}`);
  const raw = (rows<Row>(r)[0]?.images as string | null) ?? null;
  if (!imageTokens(kind, raw, fellow.id, id).includes(token)) return null;
  return proofStore.get(imageBlob(kind, fellow.id, id, token));
}
