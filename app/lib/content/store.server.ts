import db from "~/lib/db";
import { sql } from "drizzle-orm";
import { seedIfEmpty } from "./seed.server";
import type {
  ContentAccount,
  PlaybookEntry,
  ContentIdea,
  ContentPost,
  KillCheck,
  PostRevision,
} from "./model";

/**
 * Storage for the /content studio: accounts, playbook, ideas, calendar.
 *
 * Uses the lazy ensureTable pattern from consultation.server.ts and
 * sensei-demo.server.ts rather than a drizzle migration. Deliberate: these
 * tables are internal to a staging-only tool and are not part of the auth
 * schema that drizzle-kit generates from, so adding them to auth-schema.ts
 * would put a staging tool's tables in the production migration chain.
 */

let tablesCreated = false;

async function ensureTables() {
  if (tablesCreated) return;

  // The 7 handles posts are written for. Persona and audience are fed to the
  // model as context, which is why they are free text and not an enum.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS content_accounts (
      id SERIAL PRIMARY KEY,
      handle TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'linkedin',
      display_name TEXT NOT NULL,
      persona TEXT,
      audience TEXT,
      notes TEXT,
      accent TEXT NOT NULL DEFAULT 'purple',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // The LinkedIn playbook: how to ideate, how to write, skills, references.
  // Every entry with include_in_prompt is concatenated into the system prompt
  // for both the idea generator and the writer.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS content_playbook (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL DEFAULT 'writing',
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      include_in_prompt BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS content_ideas (
      id SERIAL PRIMARY KEY,
      account_id INTEGER REFERENCES content_accounts(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      angle TEXT,
      hook TEXT,
      why_it_works TEXT,
      pillar TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      source TEXT NOT NULL DEFAULT 'ai',
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // One row per post. Doubles as the calendar: scheduled_for is the slot,
  // scheduled_where records the tool it was queued in (track only, we do not
  // post for you).
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS content_posts (
      id SERIAL PRIMARY KEY,
      account_id INTEGER REFERENCES content_accounts(id) ON DELETE SET NULL,
      idea_id INTEGER REFERENCES content_ideas(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'idea',
      scheduled_for TIMESTAMPTZ,
      scheduled_where TEXT,
      posted_at TIMESTAMPTZ,
      notes TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Every revision the writer produced, so a draft can be walked back. The
  // refine loop is the whole point of the writer, and a loop you cannot undo
  // is a loop people stop using.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS content_post_revisions (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      instruction TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Added after the first deploy, so ALTER rather than a change to CREATE:
  // the staging tables already exist and CREATE TABLE IF NOT EXISTS would
  // silently skip them.
  await db.execute(sql`
    ALTER TABLE content_accounts
      ADD COLUMN IF NOT EXISTS lane TEXT NOT NULL DEFAULT 'student'
  `);
  await db.execute(sql`
    ALTER TABLE content_accounts
      ADD COLUMN IF NOT EXISTS posts_per_week INTEGER NOT NULL DEFAULT 2
  `);
  await db.execute(sql`
    ALTER TABLE content_ideas
      ADD COLUMN IF NOT EXISTS hook_type TEXT
  `);
  await db.execute(sql`
    ALTER TABLE content_ideas
      ADD COLUMN IF NOT EXISTS hook_tier TEXT
  `);
  await db.execute(sql`
    ALTER TABLE content_ideas
      ADD COLUMN IF NOT EXISTS story_engine TEXT
  `);
  await db.execute(sql`
    ALTER TABLE content_ideas
      ADD COLUMN IF NOT EXISTS cinematic_detail TEXT
  `);
  await db.execute(sql`
    ALTER TABLE content_ideas
      ADD COLUMN IF NOT EXISTS why_different TEXT
  `);
  await db.execute(sql`
    ALTER TABLE content_posts
      ADD COLUMN IF NOT EXISTS kill_check JSONB
  `);
  await db.execute(sql`
    ALTER TABLE content_posts
      ADD COLUMN IF NOT EXISTS visual_plan TEXT
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_content_post_revisions_post
      ON content_post_revisions (post_id, created_at DESC)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_for
      ON content_posts (scheduled_for)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_content_ideas_created_at
      ON content_ideas (created_at DESC)
  `);

  // Seed the roster and playbook once the tables exist. Only fills empty
  // tables, so it can never overwrite anything edited in the UI.
  await seedIfEmpty();

  tablesCreated = true;
}

export type {
  ContentAccount,
  PlaybookEntry,
  ContentIdea,
  ContentPost,
  KillCheck,
  PostRevision,
} from "./model";
export { POST_STATUSES, IDEA_STATUSES, PLAYBOOK_KINDS, PLATFORMS } from "./model";

/* ---------------------------------------------------------------- accounts */

export async function listAccounts(): Promise<ContentAccount[]> {
  await ensureTables();
  const res = await db.execute(sql`
    SELECT id, handle, platform, display_name, persona, audience, notes, accent,
           active, lane, posts_per_week
    FROM content_accounts
    ORDER BY active DESC, id ASC
  `);
  return res.rows.map((r) => ({
    id: Number(r.id),
    handle: r.handle as string,
    platform: r.platform as string,
    displayName: r.display_name as string,
    persona: (r.persona as string) ?? null,
    audience: (r.audience as string) ?? null,
    notes: (r.notes as string) ?? null,
    accent: r.accent as string,
    active: Boolean(r.active),
    lane: (r.lane as string) ?? "student",
    postsPerWeek: Number(r.posts_per_week ?? 2),
  }));
}

export async function upsertAccount(input: {
  id?: number | null;
  handle: string;
  platform: string;
  displayName: string;
  persona?: string | null;
  audience?: string | null;
  notes?: string | null;
  accent?: string;
  active?: boolean;
  lane?: string;
  postsPerWeek?: number;
}) {
  await ensureTables();
  const accent = input.accent ?? "purple";
  const active = input.active ?? true;
  const lane = input.lane ?? "student";
  const postsPerWeek = input.postsPerWeek ?? 2;
  if (input.id) {
    await db.execute(sql`
      UPDATE content_accounts SET
        handle = ${input.handle},
        platform = ${input.platform},
        display_name = ${input.displayName},
        persona = ${input.persona ?? null},
        audience = ${input.audience ?? null},
        notes = ${input.notes ?? null},
        accent = ${accent},
        active = ${active},
        lane = ${lane},
        posts_per_week = ${postsPerWeek},
        updated_at = NOW()
      WHERE id = ${input.id}
    `);
    return input.id;
  }
  const res = await db.execute(sql`
    INSERT INTO content_accounts
      (handle, platform, display_name, persona, audience, notes, accent, active,
       lane, posts_per_week)
    VALUES
      (${input.handle}, ${input.platform}, ${input.displayName},
       ${input.persona ?? null}, ${input.audience ?? null}, ${input.notes ?? null},
       ${accent}, ${active}, ${lane}, ${postsPerWeek})
    RETURNING id
  `);
  return Number(res.rows[0].id);
}

export async function deleteAccount(id: number) {
  await ensureTables();
  await db.execute(sql`DELETE FROM content_accounts WHERE id = ${id}`);
}

/* ---------------------------------------------------------------- playbook */

export async function listPlaybook(): Promise<PlaybookEntry[]> {
  await ensureTables();
  const res = await db.execute(sql`
    SELECT id, kind, title, body, include_in_prompt, updated_at
    FROM content_playbook
    ORDER BY kind ASC, id ASC
  `);
  return res.rows.map((r) => ({
    id: Number(r.id),
    kind: r.kind as string,
    title: r.title as string,
    body: r.body as string,
    includeInPrompt: Boolean(r.include_in_prompt),
    updatedAt: String(r.updated_at),
  }));
}

export async function upsertPlaybookEntry(input: {
  id?: number | null;
  kind: string;
  title: string;
  body: string;
  includeInPrompt?: boolean;
}) {
  await ensureTables();
  const include = input.includeInPrompt ?? true;
  if (input.id) {
    await db.execute(sql`
      UPDATE content_playbook SET
        kind = ${input.kind},
        title = ${input.title},
        body = ${input.body},
        include_in_prompt = ${include},
        updated_at = NOW()
      WHERE id = ${input.id}
    `);
    return input.id;
  }
  const res = await db.execute(sql`
    INSERT INTO content_playbook (kind, title, body, include_in_prompt)
    VALUES (${input.kind}, ${input.title}, ${input.body}, ${include})
    RETURNING id
  `);
  return Number(res.rows[0].id);
}

export async function deletePlaybookEntry(id: number) {
  await ensureTables();
  await db.execute(sql`DELETE FROM content_playbook WHERE id = ${id}`);
}

/**
 * The playbook as one block of text, for the model's system prompt.
 * Only entries flagged include_in_prompt, so a reference doc can be parked
 * here without bloating every generation.
 */
export async function playbookPrompt(): Promise<string> {
  const entries = await listPlaybook();
  const included = entries.filter((e) => e.includeInPrompt);
  if (included.length === 0) return "";
  return included
    .map((e) => `### ${e.title} (${e.kind})\n${e.body}`)
    .join("\n\n");
}

/* ------------------------------------------------------------------- ideas */

export async function listIdeas(opts?: {
  accountId?: number | null;
  status?: string | null;
  limit?: number;
}): Promise<ContentIdea[]> {
  await ensureTables();
  const limit = opts?.limit ?? 200;
  const res = await db.execute(sql`
    SELECT i.id, i.account_id, a.handle AS account_handle, i.title, i.angle,
           i.hook, i.why_it_works, i.pillar, i.status, i.source, i.created_at,
           i.hook_type, i.hook_tier, i.story_engine, i.cinematic_detail,
           i.why_different
    FROM content_ideas i
    LEFT JOIN content_accounts a ON a.id = i.account_id
    WHERE (${opts?.accountId ?? null}::int IS NULL OR i.account_id = ${opts?.accountId ?? null}::int)
      AND (${opts?.status ?? null}::text IS NULL OR i.status = ${opts?.status ?? null}::text)
    ORDER BY i.created_at DESC
    LIMIT ${limit}
  `);
  return res.rows.map((r) => ({
    id: Number(r.id),
    accountId: r.account_id === null ? null : Number(r.account_id),
    accountHandle: (r.account_handle as string) ?? null,
    title: r.title as string,
    angle: (r.angle as string) ?? null,
    hook: (r.hook as string) ?? null,
    whyItWorks: (r.why_it_works as string) ?? null,
    pillar: (r.pillar as string) ?? null,
    status: r.status as string,
    source: r.source as string,
    createdAt: String(r.created_at),
    hookType: (r.hook_type as string) ?? null,
    hookTier: (r.hook_tier as string) ?? null,
    storyEngine: (r.story_engine as string) ?? null,
    cinematicDetail: (r.cinematic_detail as string) ?? null,
    whyDifferent: (r.why_different as string) ?? null,
  }));
}

export async function saveIdeas(
  ideas: {
    title: string;
    angle?: string | null;
    hook?: string | null;
    whyItWorks?: string | null;
    pillar?: string | null;
    hookType?: string | null;
    hookTier?: string | null;
    storyEngine?: string | null;
    cinematicDetail?: string | null;
    whyDifferent?: string | null;
  }[],
  opts: { accountId?: number | null; source?: string; createdBy?: string }
) {
  await ensureTables();
  const ids: number[] = [];
  for (const idea of ideas) {
    const res = await db.execute(sql`
      INSERT INTO content_ideas
        (account_id, title, angle, hook, why_it_works, pillar, source, created_by,
         hook_type, hook_tier, story_engine, cinematic_detail, why_different)
      VALUES
        (${opts.accountId ?? null}, ${idea.title}, ${idea.angle ?? null},
         ${idea.hook ?? null}, ${idea.whyItWorks ?? null}, ${idea.pillar ?? null},
         ${opts.source ?? "ai"}, ${opts.createdBy ?? null},
         ${idea.hookType ?? null}, ${idea.hookTier ?? null},
         ${idea.storyEngine ?? null}, ${idea.cinematicDetail ?? null},
         ${idea.whyDifferent ?? null})
      RETURNING id
    `);
    ids.push(Number(res.rows[0].id));
  }
  return ids;
}

export async function setIdeaStatus(id: number, status: string) {
  await ensureTables();
  await db.execute(
    sql`UPDATE content_ideas SET status = ${status} WHERE id = ${id}`
  );
}

export async function getIdea(id: number): Promise<ContentIdea | null> {
  const rows = await listIdeas({ limit: 1000 });
  return rows.find((r) => r.id === id) ?? null;
}

export async function deleteIdea(id: number) {
  await ensureTables();
  await db.execute(sql`DELETE FROM content_ideas WHERE id = ${id}`);
}

/* ------------------------------------------------------------------- posts */

export async function listPosts(opts?: {
  from?: Date | null;
  to?: Date | null;
  accountId?: number | null;
  limit?: number;
}): Promise<ContentPost[]> {
  await ensureTables();
  const limit = opts?.limit ?? 500;
  const res = await db.execute(sql`
    SELECT p.id, p.account_id, a.handle AS account_handle, a.accent AS account_accent,
           p.idea_id, p.title, p.body, p.status, p.scheduled_for, p.scheduled_where,
           p.posted_at, p.notes, p.updated_at, p.kill_check, p.visual_plan
    FROM content_posts p
    LEFT JOIN content_accounts a ON a.id = p.account_id
    WHERE (${opts?.from?.toISOString() ?? null}::timestamptz IS NULL
           OR p.scheduled_for >= ${opts?.from?.toISOString() ?? null}::timestamptz)
      AND (${opts?.to?.toISOString() ?? null}::timestamptz IS NULL
           OR p.scheduled_for < ${opts?.to?.toISOString() ?? null}::timestamptz)
      AND (${opts?.accountId ?? null}::int IS NULL OR p.account_id = ${opts?.accountId ?? null}::int)
    ORDER BY p.scheduled_for ASC NULLS LAST, p.updated_at DESC
    LIMIT ${limit}
  `);
  return res.rows.map(rowToPost);
}

function rowToPost(r: Record<string, unknown>): ContentPost {
  return {
    id: Number(r.id),
    accountId: r.account_id === null ? null : Number(r.account_id),
    accountHandle: (r.account_handle as string) ?? null,
    accountAccent: (r.account_accent as string) ?? null,
    ideaId: r.idea_id === null ? null : Number(r.idea_id),
    title: r.title as string,
    body: (r.body as string) ?? "",
    status: r.status as string,
    scheduledFor: r.scheduled_for ? String(r.scheduled_for) : null,
    scheduledWhere: (r.scheduled_where as string) ?? null,
    postedAt: r.posted_at ? String(r.posted_at) : null,
    notes: (r.notes as string) ?? null,
    updatedAt: String(r.updated_at),
    // node-postgres already parses jsonb, so this is an object, not a string.
    killCheck: (r.kill_check as KillCheck) ?? null,
    visualPlan: (r.visual_plan as string) ?? null,
  };
}

export async function getPost(id: number): Promise<ContentPost | null> {
  await ensureTables();
  const res = await db.execute(sql`
    SELECT p.id, p.account_id, a.handle AS account_handle, a.accent AS account_accent,
           p.idea_id, p.title, p.body, p.status, p.scheduled_for, p.scheduled_where,
           p.posted_at, p.notes, p.updated_at, p.kill_check, p.visual_plan
    FROM content_posts p
    LEFT JOIN content_accounts a ON a.id = p.account_id
    WHERE p.id = ${id}
    LIMIT 1
  `);
  if (res.rows.length === 0) return null;
  return rowToPost(res.rows[0]);
}

export async function upsertPost(input: {
  id?: number | null;
  accountId?: number | null;
  ideaId?: number | null;
  title: string;
  body?: string;
  status?: string;
  scheduledFor?: string | null;
  scheduledWhere?: string | null;
  notes?: string | null;
  visualPlan?: string | null;
  createdBy?: string | null;
}) {
  await ensureTables();
  const status = input.status ?? "idea";
  // posted_at is derived, not entered: it is set the moment status flips to
  // posted and cleared if the post moves back, so the calendar cannot show a
  // post as live with no date on it.
  if (input.id) {
    await db.execute(sql`
      UPDATE content_posts SET
        account_id = ${input.accountId ?? null},
        idea_id = ${input.ideaId ?? null},
        title = ${input.title},
        body = ${input.body ?? ""},
        status = ${status},
        scheduled_for = ${input.scheduledFor ?? null}::timestamptz,
        scheduled_where = ${input.scheduledWhere ?? null},
        notes = ${input.notes ?? null},
        visual_plan = ${input.visualPlan ?? null},
        -- A verdict belongs to the exact text it was run against. Any change
        -- to the body, hand-edited or regenerated, retires it. Without this a
        -- post keeps showing "Passes" over text the check never saw.
        kill_check = CASE
          WHEN body IS DISTINCT FROM ${input.body ?? ""} THEN NULL
          ELSE kill_check
        END,
        posted_at = CASE
          WHEN ${status} = 'posted' THEN COALESCE(posted_at, NOW())
          ELSE NULL
        END,
        updated_at = NOW()
      WHERE id = ${input.id}
    `);
    return input.id;
  }
  const res = await db.execute(sql`
    INSERT INTO content_posts
      (account_id, idea_id, title, body, status, scheduled_for, scheduled_where,
       notes, visual_plan, created_by, posted_at)
    VALUES
      (${input.accountId ?? null}, ${input.ideaId ?? null}, ${input.title},
       ${input.body ?? ""}, ${status}, ${input.scheduledFor ?? null}::timestamptz,
       ${input.scheduledWhere ?? null}, ${input.notes ?? null},
       ${input.visualPlan ?? null}, ${input.createdBy ?? null},
       ${status === "posted" ? sql`NOW()` : sql`NULL`})
    RETURNING id
  `);
  return Number(res.rows[0].id);
}

/**
 * Everything already said across the whole roster, for the dedup block in the
 * ideation prompt.
 *
 * Roster wide, not per account, because the playbook is explicit about it: an
 * idea is done once it has run anywhere, and these audiences already overlap
 * through reposts and shared students. Posts count as well as ideas, since a
 * post can be written without an idea row behind it.
 */
export async function usedAngles(limit = 200): Promise<string[]> {
  await ensureTables();
  const res = await db.execute(sql`
    SELECT text FROM (
      SELECT title AS text, created_at FROM content_ideas WHERE status <> 'binned'
      UNION ALL
      SELECT hook AS text, created_at FROM content_ideas
        WHERE hook IS NOT NULL AND status <> 'binned'
      UNION ALL
      SELECT title AS text, created_at FROM content_posts
    ) t
    WHERE text IS NOT NULL AND length(trim(text)) > 0
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  // Case-insensitive dedup, first spelling wins.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of res.rows) {
    const text = String(r.text).trim();
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

/* --------------------------------------------------------------- revisions */

export async function listRevisions(postId: number): Promise<PostRevision[]> {
  await ensureTables();
  const res = await db.execute(sql`
    SELECT id, body, instruction, created_at
    FROM content_post_revisions
    WHERE post_id = ${postId}
    ORDER BY created_at DESC, id DESC
    LIMIT 25
  `);
  return res.rows.map((r) => ({
    id: Number(r.id),
    body: r.body as string,
    instruction: (r.instruction as string) ?? null,
    createdAt: String(r.created_at),
  }));
}

export async function addRevision(input: {
  postId: number;
  body: string;
  instruction?: string | null;
  createdBy?: string | null;
}) {
  await ensureTables();
  await db.execute(sql`
    INSERT INTO content_post_revisions (post_id, body, instruction, created_by)
    VALUES (${input.postId}, ${input.body}, ${input.instruction ?? null},
            ${input.createdBy ?? null})
  `);
}

/** Body-only write, for the refine loop and for reverting to a revision. */
export async function setPostBody(id: number, body: string) {
  await ensureTables();
  await db.execute(sql`
    UPDATE content_posts
    SET body = ${body}, kill_check = NULL, updated_at = NOW()
    WHERE id = ${id}
  `);
}

export async function saveKillCheck(id: number, check: KillCheck) {
  await ensureTables();
  await db.execute(sql`
    UPDATE content_posts
    SET kill_check = ${JSON.stringify(check)}::jsonb, updated_at = NOW()
    WHERE id = ${id}
  `);
}

export async function deletePost(id: number) {
  await ensureTables();
  await db.execute(sql`DELETE FROM content_posts WHERE id = ${id}`);
}

/**
 * This week's output per account, against each account's own target.
 *
 * The week is Monday to Sunday in IST, matching the calendar. Counts a post
 * once it is scheduled or posted: a draft with no slot is not output yet, it
 * is intent.
 */
export async function rosterWeek(): Promise<
  {
    accountId: number;
    displayName: string;
    handle: string;
    accent: string;
    lane: string;
    target: number;
    done: number;
  }[]
> {
  await ensureTables();
  const res = await db.execute(sql`
    WITH week AS (
      SELECT
        date_trunc('week', (NOW() AT TIME ZONE 'Asia/Kolkata')) AS start_ist
    )
    SELECT a.id, a.display_name, a.handle, a.accent, a.lane, a.posts_per_week,
           COUNT(p.id) AS done
    FROM content_accounts a
    CROSS JOIN week w
    LEFT JOIN content_posts p
      ON p.account_id = a.id
     AND p.status IN ('scheduled', 'posted')
     AND p.scheduled_for IS NOT NULL
     AND (p.scheduled_for AT TIME ZONE 'Asia/Kolkata') >= w.start_ist
     AND (p.scheduled_for AT TIME ZONE 'Asia/Kolkata') < w.start_ist + INTERVAL '7 days'
    WHERE a.active
    GROUP BY a.id, a.display_name, a.handle, a.accent, a.lane, a.posts_per_week
    ORDER BY a.id ASC
  `);
  return res.rows.map((r) => ({
    accountId: Number(r.id),
    displayName: r.display_name as string,
    handle: r.handle as string,
    accent: r.accent as string,
    lane: (r.lane as string) ?? "student",
    target: Number(r.posts_per_week ?? 2),
    done: Number(r.done),
  }));
}

/** Counts for the overview tiles. One query, not five. */
export async function contentStats() {
  await ensureTables();
  const res = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM content_accounts WHERE active) AS accounts,
      (SELECT COUNT(*) FROM content_ideas WHERE status IN ('new', 'kept')) AS open_ideas,
      (SELECT COUNT(*) FROM content_posts WHERE status IN ('idea', 'drafted', 'ready')) AS in_progress,
      (SELECT COUNT(*) FROM content_posts WHERE status = 'scheduled') AS scheduled,
      (SELECT COUNT(*) FROM content_posts WHERE status = 'posted') AS posted,
      (SELECT COUNT(*) FROM content_posts
        WHERE status = 'scheduled'
          AND scheduled_for >= NOW()
          AND scheduled_for < NOW() + INTERVAL '7 days') AS next_7_days
  `);
  const r = res.rows[0];
  return {
    accounts: Number(r.accounts),
    openIdeas: Number(r.open_ideas),
    inProgress: Number(r.in_progress),
    scheduled: Number(r.scheduled),
    posted: Number(r.posted),
    next7Days: Number(r.next_7_days),
  };
}
