import { randomBytes } from "node:crypto";
import db from "~/lib/db";
import { sql } from "drizzle-orm";
import { checkRateLimit } from "~/lib/ratelimit.server";
import { proofStore } from "~/lib/fellow-proof.server";
import { CoachUnavailable, readBack, type CoachAsk, type CoachProfile } from "~/lib/fellow-coach.server";
import { stockById, stockFor, stockJpeg, stockSearch, StockTooBig, type StockPick } from "~/lib/fellow-stock.server";
import {
  activityOf,
  AnalyticsFileError,
  looksLikeXlsx,
  MAX_ANALYTICS_BYTES,
  NOT_AN_EXPORT,
  readAnalyticsExport,
  type WeekAnalytics,
} from "~/lib/fellow-analytics.server";
import {
  buildFellowView,
  PHOTOS_PER_POST,
  photoTokens,
  PROOF_CONTAINER,
  proofBlob,
  proofTokens,
  shotEntries,
  SHOT_TOKEN,
  type ImageKind,
  cleanPostUrl,
  cleanText,
  COACH_WAIT_MS,
  firstNameOf,
  istDate,
  weekOf,
  addDays,
  wholeNumber,
  STORY_PROMPTS,
  type AnalyticsRow,
  type ApplicationRow,
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
  const [application, posts, stories, connections, rules, analytics] = await Promise.all([
    fellow.application_id
      ? db.execute(sql`SELECT course, year_of_study, city FROM ugc_applications WHERE id = ${fellow.application_id}`)
          .then((r) => rows<ApplicationRow>(r)[0] ?? null)
          .catch(() => null)
      : Promise.resolve(null),
    db.execute(sql`
      SELECT id, title, body, kind, due_date, status, copied_at, own_line, posted_at, post_url, impressions, reactions, comments, metrics_at,
        photo_idea, photo_url, photo_help_at, analytics, rewrite_body, rewrite_at, rewrite_reply
      FROM ugc_creator_posts
      WHERE creator_id = ${fellow.id} AND status IN ('ready', 'posted', 'blocked')
      ORDER BY due_date, id
    `).then((r) => rows<FellowPostRow>(r)),
    db.execute(sql`
      SELECT id, prompt, text, spoken, created_at, coach, reply_to
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
    // Their latest LinkedIn analytics export: the totals and who saw their posts. The page works without it.
    db.execute(sql`
      SELECT uploaded_at, period_start::text AS period_start, period_end::text AS period_end, data->'totals' AS totals, data->'demographics' AS demographics
      FROM ugc_creator_analytics
      WHERE creator_id = ${fellow.id}
      ORDER BY uploaded_at DESC
      LIMIT 1
    `).then((r) => rows<AnalyticsRow>(r)[0] ?? null)
      .catch(() => null),
  ]);
  return buildFellowView({ fellow, application, posts, stories, connections, rules, analytics }, now.getTime());
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
const NEEDS_LINK = "Paste the link to your post on LinkedIn. With no photo added here, we need the link to see your post.";
const WAITING_VERSION = "Your version of this post is with Studojo for approval. Post it once it's approved, or withdraw it to post the original.";
const POST_TEXT_MAX = 3000; // LinkedIn's limit for one post

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
      // The link is optional ("Did you post it?" can be answered without one) when the post has a photo here, and
      // a post marked without a link can get its link later, once. The admin panel marks posts the same way.
      const id = postId(body.postId);
      const raw = typeof body.url === "string" ? body.url.trim() : "";
      const url = raw ? cleanPostUrl(raw) : null;
      if (raw && !url) throw new FellowInputError("That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/");
      await withFellowLock(fellow, async (tx) => {
        // The hard rule: a post never goes out without a photo. It's added here, or (the founder, 9 Nov 2026) the
        // fellow copied the post and put it up on LinkedIn themselves with their own photo: then its link is the proof.
        const before = rows<Row>(await tx.execute(sql`
          SELECT status, photo_url, rewrite_body FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}
        `))[0];
        // Their own version goes out only once the team has approved it.
        if (before?.status === "ready" && before.rewrite_body) throw new FellowInputError(WAITING_VERSION, 409);
        if (before?.status === "ready" && !url && !photoTokens((before.photo_url as string | null) ?? null, fellow.id, id).length) {
          throw new FellowInputError(NEEDS_LINK, 409);
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
    case "rewrite": {
      // The fellow's own version of the post: it waits for the team, and the post stays locked until they approve
      // it (it becomes the post) or keep the original. Sending again replaces the one waiting.
      const id = postId(body.postId);
      const text = cleanText(body.text, POST_TEXT_MAX);
      const cur = rows<Row>(await db.execute(sql`SELECT body FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}`))[0];
      const same = (a: string) => a.replace(/\s+/g, " ").trim();
      if (cur && same(String(cur.body)) === same(text)) throw new FellowInputError("That's the same as the post. Change it the way you'd write it, then send it.");
      if (text.length < 40) throw new FellowInputError("Write out your whole version of the post before you send it.");
      const r = await db.execute(sql`
        UPDATE ugc_creator_posts SET rewrite_body = ${text}, rewrite_at = now(), rewrite_reply = NULL, updated_at = now()
        WHERE id = ${id} AND creator_id = ${fellow.id} AND status = 'ready' AND due_date <= ${weekEnd}::date
      `);
      if (!updated(r)) await refuseChange(db, fellow, id, "This post is already posted, so it can't change now.");
      return;
    }
    case "rewrite-withdraw": {
      const id = postId(body.postId);
      await db.execute(sql`
        UPDATE ugc_creator_posts SET rewrite_body = NULL, rewrite_at = NULL, updated_at = now()
        WHERE id = ${id} AND creator_id = ${fellow.id} AND status = 'ready'
      `);
      return;
    }
    case "photo-help": {
      // The fellow has no photo of their own for this post: the page offers stock images for it. Adding a photo clears it.
      const id = postId(body.postId);
      const r = await db.execute(sql`
        UPDATE ugc_creator_posts SET photo_help_at = COALESCE(photo_help_at, now()), updated_at = now()
        WHERE id = ${id} AND creator_id = ${fellow.id} AND status = 'ready' AND due_date <= ${weekEnd}::date
      `);
      if (!updated(r)) await refuseChange(db, fellow, id, "This post is already posted.");
      return;
    }
    case "stock-use": {
      // The photo they chose, from our picks or their own search, saved on the post like their own photo. It's
      // looked up again here (the library, or Openverse by id): the page only sends which one.
      await openPost(fellow, body.postId);
      let pick: StockPick | null;
      let jpeg: Uint8Array;
      try {
        pick = await stockById(body.stockId);
        if (!pick) throw new FellowInputError("That photo isn't available any more. Pick another one.", 404);
        jpeg = await stockJpeg(pick, MAX_IMAGE_BYTES);
      } catch (e) {
        if (e instanceof FellowInputError) throw e;
        if (e instanceof StockTooBig) throw new FellowInputError("That photo is too big to use. Pick another one.", 413);
        console.error("[fellow-page] stock image fetch failed:", e instanceof Error ? e.message : "unknown");
        throw new FellowInputError(NO_STOCK, 503);
      }
      await addFellowImage("photo", fellow, body.postId, jpeg);
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
      let prompt = STORY_PROMPTS.includes(String(body.prompt)) ? String(body.prompt) : null;
      // An answer to one of a read-back's follow-up questions: the question is taken from the stored
      // read-back (never from the request), and the answer remembers which story it follows up.
      let replyTo: number | null = null;
      if (body.replyTo != null) {
        const parent = storyId(body.replyTo);
        const row = rows<Row>(await db.execute(sql`SELECT coach FROM ugc_creator_stories WHERE id = ${parent} AND creator_id = ${fellow.id}`))[0];
        const next = (row?.coach as { next?: unknown } | null | undefined)?.next;
        const question = Array.isArray(next) && typeof body.q === "number" ? next[body.q] : undefined;
        if (typeof question === "string" && question) { prompt = question; replyTo = parent; }
      }
      // A page can't flood the team's queue: at most 30 stories a day, counted under the fellow's lock.
      await withFellowLock(fellow, async (tx) => {
        const today = await tx.execute(sql`
          SELECT count(*)::int AS n FROM ugc_creator_stories WHERE creator_id = ${fellow.id} AND created_at >= now() - interval '1 day'
        `);
        if (Number(rows<Row>(today)[0]?.n ?? 0) >= 30) throw new FellowInputError("That's a lot of stories for one day. Try again tomorrow.", 429);
        await tx.execute(sql`
          INSERT INTO ugc_creator_stories (creator_id, prompt, text, spoken, reply_to) VALUES (${fellow.id}, ${prompt}, ${text}, ${body.spoken === true}, ${replyTo})
        `);
      });
      return;
    }
    case "story-name": {
      // A fellow fixes a name in a story they shared (speech-to-text gets companies, colleges, places, people
      // and events wrong). Only a name can change: a short phrase that's in the story, swapped everywhere it
      // appears, for another short phrase. The rest of the story stays as they shared it. Its read-back was
      // written from the old words, so the same swap goes through that too.
      const id = storyId(body.storyId);
      const from = cleanText(body.from, NAME_MAX + 1, true), to = cleanText(body.to, NAME_MAX + 1, true);
      const words = (s: string) => s.split(" ").filter(Boolean).length;
      if (!from || !to) throw new FellowInputError("Add the name as it's written, and the right name.");
      if (from.length > NAME_MAX || to.length > NAME_MAX || words(from) > NAME_WORDS || words(to) > NAME_WORDS) {
        throw new FellowInputError(`Only names can be changed here, up to ${NAME_WORDS} words each.`);
      }
      await withFellowLock(fellow, async (tx) => {
        const row = rows<{ text: string; coach: unknown }>(await tx.execute(sql`SELECT text, coach FROM ugc_creator_stories WHERE id = ${id} AND creator_id = ${fellow.id}`))[0];
        if (!row) throw new FellowInputError("That story isn't on your page.", 404);
        const fixed = swapName(row.text, from, to);
        if (fixed === null) throw new FellowInputError(`"${from}" isn't in this story. Type it exactly as it's written there.`);
        if (fixed.length > STORY_MAX) throw new FellowInputError("That would make the story longer than 8,000 characters.");
        const coach = row.coach && typeof row.coach === "object" ? { ...(row.coach as Record<string, unknown>) } : null;
        if (coach) {
          const swap = (v: unknown) => (typeof v === "string" ? swapName(v, from, to) ?? v : v);
          for (const key of ["heard", "useful", "skip", "next"]) if (Array.isArray(coach[key])) coach[key] = (coach[key] as unknown[]).map(swap);
          coach.tip = swap(coach.tip);
        }
        await tx.execute(sql`
          UPDATE ugc_creator_stories SET text = ${fixed}, coach = ${coach ? JSON.stringify(coach) : null}::jsonb
          WHERE id = ${id} AND creator_id = ${fellow.id}
        `);
      });
      return;
    }
    case "coach":
      await coachTalk(fellow, body.storyIds);
      return;
    default:
      throw new FellowInputError("Unknown request.");
  }
}

const NAME_MAX = 60;
const NAME_WORDS = 6;
/** The text with every whole-word match of `from` (any case) swapped for `to`, or null when there's none. */
export function swapName(text: string, from: string, to: string): string | null {
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "giu");
  if (!re.test(text)) return null;
  re.lastIndex = 0;
  return text.replace(re, () => to);
}

const storyId = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" && /^\d{1,10}$/.test(v) ? Number(v) : NaN;
  if (!Number.isInteger(n) || n <= 0 || n > 2147483647) throw new FellowInputError("That story isn't on your page.", 404);
  return n;
};

// ---------------------------------------------------------------- reading a talk back

/** A long talk is saved in parts of up to 8,000 characters; this many parts is well over an hour of talking. */
const TALK_PARTS_MAX = 12;
const FEEDBACK_DOWN = "Feedback isn't available right now. Your story is saved; try again in a minute.";

/** What the read-back knows about the fellow: their course and what they want, from their application. */
async function coachProfile(fellow: FellowRow): Promise<CoachProfile> {
  const app = fellow.application_id
    ? rows<Row>(await db.execute(sql`
        SELECT course, year_of_study, target_roles, looking_for, fellowship_goals::text AS goals, topics::text AS topics, avoid_topics
        FROM ugc_applications WHERE id = ${fellow.application_id}
      `).catch(() => ({ rows: [] })))[0] ?? {}
    : {};
  // JSON lists from the application form read as plain comma lists.
  const plain = (v: unknown) => String(v ?? "").replace(/^\[|\]$/g, "").replace(/"/g, "").replace(/\s+/g, " ").trim().slice(0, 300);
  return {
    first: firstNameOf(fellow.full_name),
    course: [plain(app.year_of_study), plain(app.course)].filter(Boolean).join(" "),
    college: fellow.college ?? "",
    field: fellow.field ?? "",
    wants: [plain(app.looking_for), plain(app.target_roles) && `roles like ${plain(app.target_roles)}`, plain(app.goals), plain(app.topics) && `topics: ${plain(app.topics)}`].filter(Boolean).join("; "),
    avoid: plain(app.avoid_topics),
  };
}

/**
 * Reads one talk back to the fellow and keeps the read-back on the talk's last saved part. A talk is
 * the stories the page saved for it, sent as their ids. A story is read once, and only within a day of
 * being shared, so there is at most one model call per story (and stories are capped at 30 a day).
 * Two pages asking at once: the first claims the talk and the other leaves it; a claim left by a read
 * that died can be taken again after COACH_WAIT_MS. The model is never called inside a transaction.
 */
export async function coachTalk(fellow: FellowRow, rawIds: unknown, ask?: CoachAsk): Promise<void> {
  const ids = Array.isArray(rawIds) ? [...new Set(rawIds.map(storyId))].sort((a, b) => a - b) : [];
  if (!ids.length || ids.length > TALK_PARTS_MAX) throw new FellowInputError("That story isn't on your page.", 404);
  const talk = rows<{ id: number; prompt: string | null; text: string; reply_to: number | null }>(await db.execute(sql`
    SELECT id, prompt, text, reply_to FROM ugc_creator_stories
    WHERE creator_id = ${fellow.id} AND id = ANY(${`{${ids.join(",")}}`}::int[]) AND created_at >= now() - interval '1 day'
    ORDER BY id
  `));
  if (talk.length !== ids.length) throw new FellowInputError("Feedback is given within a day of sharing a story. Share a new one to get feedback.", 404);
  const last = ids[ids.length - 1];
  const claimed = await db.execute(sql`
    UPDATE ugc_creator_stories SET coach = jsonb_build_object('pending', true, 'at', now())
    WHERE id = ${last} AND creator_id = ${fellow.id}
      AND (coach IS NULL OR (coach->>'pending' = 'true' AND (coach->>'at')::timestamptz < now() - ${`${COACH_WAIT_MS / 1000} seconds`}::interval))
  `);
  if (!updated(claimed)) return; // read already, or being read right now: the fresh view shows which
  try {
    const earlier = rows<{ prompt: string | null; text: string; coach: unknown }>(await db.execute(sql`
      SELECT prompt, text, coach FROM ugc_creator_stories
      WHERE creator_id = ${fellow.id} AND NOT (id = ANY(${`{${ids.join(",")}}`}::int[]))
      ORDER BY created_at DESC LIMIT 8
    `)).map((s) => {
      const heard = (s.coach as { heard?: unknown } | null)?.heard;
      return Array.isArray(heard) && typeof heard[0] === "string" ? heard[0] : `${s.prompt ? s.prompt + ": " : ""}${s.text.slice(0, 140)}`;
    });
    // A follow-up answer is read with the story it follows up (that talk's parts, as its read-back lists them).
    let followsUp: string | null = null;
    if (talk[0].reply_to) {
      const parent = rows<{ coach: unknown }>(await db.execute(sql`SELECT coach FROM ugc_creator_stories WHERE id = ${talk[0].reply_to} AND creator_id = ${fellow.id}`))[0];
      const parts = (parent?.coach as { parts?: unknown } | null | undefined)?.parts;
      const partIds = (Array.isArray(parts) ? parts : [talk[0].reply_to]).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, TALK_PARTS_MAX);
      followsUp = rows<{ text: string }>(await db.execute(sql`
        SELECT text FROM ugc_creator_stories WHERE creator_id = ${fellow.id} AND id = ANY(${`{${partIds.join(",")}}`}::int[]) ORDER BY id
      `)).map((r) => r.text).join("\n\n") || null;
    }
    const coach = await readBack({ profile: await coachProfile(fellow), asked: talk[0].prompt, talk: talk.map((t) => t.text).join("\n\n"), earlier, followsUp }, ask);
    await db.execute(sql`
      UPDATE ugc_creator_stories SET coach = ${JSON.stringify({ ...coach, parts: ids, at: new Date().toISOString() })}::jsonb
      WHERE id = ${last} AND creator_id = ${fellow.id}
    `);
  } catch (e) {
    // Let the fellow ask again straight away.
    await db.execute(sql`UPDATE ugc_creator_stories SET coach = NULL WHERE id = ${last} AND creator_id = ${fellow.id} AND coach->>'pending' = 'true'`).catch(() => {});
    if (e instanceof CoachUnavailable) {
      console.warn("[fellow-coach]", e.message);
      throw new FellowInputError(FEEDBACK_DOWN, 503);
    }
    throw e;
  }
}

// ---------------------------------------------------------------- the fellow's own files
// Photos go on posts before they go out; LinkedIn's analytics export on posts that went out. Analytics
// screenshots are no longer collected, but the ones already saved can still be opened.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export { MAX_ANALYTICS_BYTES };
const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const SHOTS_RETIRED = "Screenshots aren't needed any more. Upload the post's analytics export from LinkedIn instead.";
const IMAGE_COLUMN: Record<ImageKind, ReturnType<typeof sql.raw>> = { shot: sql.raw("screenshot_url"), photo: sql.raw("photo_url") };
const NOT_ON_POST: Record<ImageKind, string> = { shot: "That screenshot isn't on this post.", photo: "That photo isn't on this post." };

/** A post's column as a list. Something in it the page doesn't recognise is kept, never dropped. */
function entriesOf(raw: string | null): string[] {
  const entries = shotEntries(raw);
  if (raw?.trim() && !entries.length) entries.push(raw.trim());
  return entries;
}

/** The post's status, once it is one of the fellow's and not on hold; otherwise why not. */
function livePost(row: Row | undefined): string {
  if (!row || !["ready", "posted", "blocked"].includes(String(row.status))) throw new FellowInputError(TAKEN_BACK, 404);
  if (row.status === "blocked") throw new FellowInputError(ON_HOLD, 409);
  return String(row.status);
}

/** The post's photos, once it can take another; otherwise why not. */
async function photoEntries(exec: { execute: typeof db.execute }, fellow: FellowRow, id: number): Promise<string[]> {
  const weekEnd = addDays(weekOf(istDate()), 6);
  const row = rows<Row>(await exec.execute(sql`
    SELECT status, due_date <= ${weekEnd}::date AS open, photo_url
    FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}
  `))[0];
  if (livePost(row) !== "ready") throw new FellowInputError("This post is already posted, so its photos can't change now.", 409);
  if (!row!.open) throw new FellowInputError("That post isn't on your page yet.", 404);
  const raw = (row!.photo_url as string | null) ?? null;
  if (photoTokens(raw, fellow.id, id).length >= PHOTOS_PER_POST) {
    throw new FellowInputError(`This post has ${PHOTOS_PER_POST} photos, the most it can have. Remove one to add another.`, 409);
  }
  return entriesOf(raw);
}

const NO_STOCK = "We couldn't get a stock image just now. Try again in a minute, or add your own photo.";

/** One of the fellow's posts that's on their page and not out yet: what a photo can still be added to. */
async function openPost(fellow: FellowRow, rawPostId: unknown) {
  const id = postId(rawPostId);
  const weekEnd = addDays(weekOf(istDate()), 6);
  const row = rows<Row>(await db.execute(sql`
    SELECT status, due_date <= ${weekEnd}::date AS open, title, kind, photo_idea
    FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}
  `))[0];
  if (livePost(row) !== "ready") throw new FellowInputError("This post is already posted, so its photos can't change now.", 409);
  if (!row!.open) throw new FellowInputError("That post isn't on your page yet.", 404);
  return { id, title: String(row!.title ?? ""), kind: String(row!.kind ?? ""), photoIdea: (row!.photo_idea as string | null) ?? null };
}

/** Photos for one of the fellow's posts: what they searched for (q), or else the ones we picked for the post. */
export async function stockPicks(fellow: FellowRow, rawPostId: unknown, q?: unknown): Promise<StockPick[]> {
  const post = await openPost(fellow, rawPostId);
  try {
    return q ? await stockSearch(q) : await stockFor(post);
  } catch (e) {
    console.error("[fellow-page] stock search failed:", e instanceof Error ? e.message : "unknown");
    throw new FellowInputError(NO_STOCK, 503);
  }
}

/** Saves one photo (a JPEG the page has already re-encoded) on one of the fellow's posts. */
export async function addFellowImage(kind: ImageKind, fellow: FellowRow, rawPostId: unknown, jpeg: Uint8Array, now = Date.now()): Promise<void> {
  if (kind === "shot") throw new FellowInputError(SHOTS_RETIRED, 410);
  const id = postId(rawPostId);
  if (jpeg.length > MAX_IMAGE_BYTES) throw new FellowInputError("That picture is too big to send.", 413);
  if (jpeg.length < 4 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg[2] !== 0xff) {
    throw new FellowInputError("That file isn't a picture the page can use. Choose another one.", 415);
  }
  await photoEntries(db, fellow, id); // refuse early, before anything is stored
  const blob = proofBlob("photo", fellow.id, id, `${now}-${randomBytes(6).toString("hex")}`);
  await proofStore.put(blob, jpeg, "image/jpeg");
  try {
    await withFellowLock(fellow, async (tx) => {
      const entries = await photoEntries(tx, fellow, id);
      entries.push(`${PROOF_CONTAINER}/${blob}`);
      // A photo also answers "I don't have a photo for this".
      await tx.execute(sql`
        UPDATE ugc_creator_posts SET photo_url = ${JSON.stringify(entries)}, photo_help_at = NULL, updated_at = now()
        WHERE id = ${id} AND creator_id = ${fellow.id}
      `);
    });
  } catch (e) {
    await proofStore.remove(blob).catch(() => {});
    throw e;
  }
}

const imageToken = (kind: ImageKind, v: unknown) => {
  if (typeof v !== "string" || !SHOT_TOKEN.test(v)) throw new FellowInputError(NOT_ON_POST[kind], 404);
  return v;
};

/** Removes a photo, until the post goes out. */
export async function removeFellowImage(kind: ImageKind, fellow: FellowRow, rawPostId: unknown, rawToken: unknown): Promise<void> {
  if (kind === "shot") throw new FellowInputError(SHOTS_RETIRED, 410);
  const id = postId(rawPostId);
  const token = imageToken(kind, rawToken);
  const blob = proofBlob("photo", fellow.id, id, token);
  await withFellowLock(fellow, async (tx) => {
    const row = rows<Row>(await tx.execute(sql`
      SELECT status, photo_url FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}
    `))[0];
    const entries = shotEntries((row?.photo_url as string | null) ?? null);
    if (!entries.includes(`${PROOF_CONTAINER}/${blob}`)) throw new FellowInputError(NOT_ON_POST.photo, 404);
    if (row?.status !== "ready") throw new FellowInputError("This post is already posted, so its photos stay.", 409);
    const rest = entries.filter((e) => e !== `${PROOF_CONTAINER}/${blob}`);
    await tx.execute(sql`
      UPDATE ugc_creator_posts SET photo_url = ${rest.length ? JSON.stringify(rest) : null}, updated_at = now()
      WHERE id = ${id} AND creator_id = ${fellow.id}
    `);
  });
  await proofStore.remove(blob);
}

/** One of the fellow's own images (a photo, or a screenshot saved before they were retired), or null if it isn't on that post. */
export async function readFellowImage(kind: ImageKind, fellow: FellowRow, rawPostId: unknown, rawToken: unknown): Promise<Uint8Array | null> {
  const id = postId(rawPostId);
  const token = imageToken(kind, rawToken);
  const r = await db.execute(sql`SELECT ${IMAGE_COLUMN[kind]} AS images FROM ugc_creator_posts WHERE id = ${id} AND creator_id = ${fellow.id}`);
  const raw = (rows<Row>(r)[0]?.images as string | null) ?? null;
  if (!proofTokens(kind, raw, fellow.id, id).includes(token)) return null;
  return proofStore.get(proofBlob(kind, fellow.id, id, token));
}

const UPLOADS_PER_DAY = 10;
const UPLOADS_FULL = "That's a lot of uploads for one day. The latest one counts; try again tomorrow if it needs changing.";

/**
 * Saves LinkedIn's content analytics export (the whole account over a period, usually the last 7 days)
 * and reads it. The file and everything in it are kept, a row an upload: the same week uploaded twice
 * keeps both, and the newest counts. Each of the fellow's posted posts listed in it, matched by the
 * activity number in its saved link, gets its impressions from the file, as if typed, but only when it
 * was published inside the period: for an older post the file counts only that period's impressions.
 * Reactions and comments stay as they are (the file has no counts of them for each post).
 */
export async function addFellowAnalytics(fellow: FellowRow, file: Uint8Array, now = Date.now()): Promise<void> {
  if (file.length > MAX_ANALYTICS_BYTES) throw new FellowInputError("That file is too big to be LinkedIn's analytics export.", 413);
  if (!looksLikeXlsx(file)) throw new FellowInputError(NOT_AN_EXPORT, 415);
  const uploadsToday = async (exec: { execute: typeof db.execute }) => Number(rows<Row>(await exec.execute(sql`
    SELECT count(*)::int AS n FROM ugc_creator_analytics WHERE creator_id = ${fellow.id} AND uploaded_at > now() - interval '1 day'
  `))[0]?.n ?? 0);
  if ((await uploadsToday(db)) >= UPLOADS_PER_DAY) throw new FellowInputError(UPLOADS_FULL, 429);
  let week: WeekAnalytics;
  try {
    week = await readAnalyticsExport(file, now);
  } catch (e) {
    if (e instanceof AnalyticsFileError) throw new FellowInputError(e.message, 422);
    throw e;
  }
  const blob = proofBlob("analytics", fellow.id, null, `${now}-${randomBytes(6).toString("hex")}`);
  const ref = `${PROOF_CONTAINER}/${blob}`;
  await proofStore.put(blob, file, XLSX_TYPE);
  try {
    await withFellowLock(fellow, async (tx) => {
      if ((await uploadsToday(tx)) >= UPLOADS_PER_DAY) throw new FellowInputError(UPLOADS_FULL, 429);
      const mine = rows<{ id: number; post_url: string; posted_at: string | Date | null }>(await tx.execute(sql`
        SELECT id, post_url, posted_at FROM ugc_creator_posts
        WHERE creator_id = ${fellow.id} AND status = 'posted' AND post_url IS NOT NULL
      `));
      const byActivity = new Map(mine.map((p) => [activityOf(p.post_url), p] as const).filter(([a]) => a));
      const posts = week.posts.map((p) => ({ ...p, postId: byActivity.get(activityOf(p.url) ?? "")?.id ?? null }));
      const uploadedAt = new Date(now).toISOString();
      await tx.execute(sql`
        INSERT INTO ugc_creator_analytics (creator_id, file_url, period_start, period_end, data, uploaded_at)
        VALUES (${fellow.id}, ${ref}, ${week.periodStart}::date, ${week.periodEnd}::date, ${JSON.stringify({ ...week, posts })}::jsonb, ${uploadedAt}::timestamptz)
      `);
      for (const p of posts) {
        const own = mine.find((m) => m.id === p.postId);
        const published = p.publishedOn ?? (own?.posted_at ? istDate(new Date(own.posted_at).getTime()) : null);
        if (!own || p.impressions == null || !week.periodStart || !published || published < week.periodStart) continue;
        const metrics = p.engagements != null ? { impressions: p.impressions, engagements: p.engagements } : { impressions: p.impressions };
        await tx.execute(sql`
          UPDATE ugc_creator_posts
          SET impressions = ${p.impressions}, metrics_at = now(), updated_at = now(),
              analytics = ${JSON.stringify({ uploadedAt, file: ref, postedOn: p.publishedOn, postUrl: p.url, metrics, demographics: {} })}::jsonb
          WHERE id = ${own.id} AND creator_id = ${fellow.id} AND status = 'posted'
        `);
      }
    });
  } catch (e) {
    await proofStore.remove(blob).catch(() => {});
    throw e;
  }
}
