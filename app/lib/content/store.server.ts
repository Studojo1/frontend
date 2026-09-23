import db from "~/lib/db";
import { sql } from "drizzle-orm";
import type {
  ContentAccount,
  PlaybookEntry,
  ContentIdea,
  ContentPost,
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

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_for
      ON content_posts (scheduled_for)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_content_ideas_created_at
      ON content_ideas (created_at DESC)
  `);

  tablesCreated = true;
}

export type {
  ContentAccount,
  PlaybookEntry,
  ContentIdea,
  ContentPost,
} from "./model";
export { POST_STATUSES, IDEA_STATUSES, PLAYBOOK_KINDS, PLATFORMS } from "./model";

/* ---------------------------------------------------------------- accounts */

export async function listAccounts(): Promise<ContentAccount[]> {
  await ensureTables();
  const res = await db.execute(sql`
    SELECT id, handle, platform, display_name, persona, audience, notes, accent, active
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
}) {
  await ensureTables();
  const accent = input.accent ?? "purple";
  const active = input.active ?? true;
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
        updated_at = NOW()
      WHERE id = ${input.id}
    `);
    return input.id;
  }
  const res = await db.execute(sql`
    INSERT INTO content_accounts
      (handle, platform, display_name, persona, audience, notes, accent, active)
    VALUES
      (${input.handle}, ${input.platform}, ${input.displayName},
       ${input.persona ?? null}, ${input.audience ?? null}, ${input.notes ?? null},
       ${accent}, ${active})
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
           i.hook, i.why_it_works, i.pillar, i.status, i.source, i.created_at
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
  }));
}

export async function saveIdeas(
  ideas: {
    title: string;
    angle?: string | null;
    hook?: string | null;
    whyItWorks?: string | null;
    pillar?: string | null;
  }[],
  opts: { accountId?: number | null; source?: string; createdBy?: string }
) {
  await ensureTables();
  const ids: number[] = [];
  for (const idea of ideas) {
    const res = await db.execute(sql`
      INSERT INTO content_ideas
        (account_id, title, angle, hook, why_it_works, pillar, source, created_by)
      VALUES
        (${opts.accountId ?? null}, ${idea.title}, ${idea.angle ?? null},
         ${idea.hook ?? null}, ${idea.whyItWorks ?? null}, ${idea.pillar ?? null},
         ${opts.source ?? "ai"}, ${opts.createdBy ?? null})
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
           p.posted_at, p.notes, p.updated_at
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
  };
}

export async function getPost(id: number): Promise<ContentPost | null> {
  await ensureTables();
  const res = await db.execute(sql`
    SELECT p.id, p.account_id, a.handle AS account_handle, a.accent AS account_accent,
           p.idea_id, p.title, p.body, p.status, p.scheduled_for, p.scheduled_where,
           p.posted_at, p.notes, p.updated_at
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
       notes, created_by, posted_at)
    VALUES
      (${input.accountId ?? null}, ${input.ideaId ?? null}, ${input.title},
       ${input.body ?? ""}, ${status}, ${input.scheduledFor ?? null}::timestamptz,
       ${input.scheduledWhere ?? null}, ${input.notes ?? null}, ${input.createdBy ?? null},
       ${status === "posted" ? sql`NOW()` : sql`NULL`})
    RETURNING id
  `);
  return Number(res.rows[0].id);
}

export async function deletePost(id: number) {
  await ensureTables();
  await db.execute(sql`DELETE FROM content_posts WHERE id = ${id}`);
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
