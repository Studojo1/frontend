import db from "~/lib/db";
import { sql } from "drizzle-orm";

let tableCreated = false;

async function ensureTable() {
  if (tableCreated) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS webinar_registrations (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      college TEXT NOT NULL,
      course TEXT NOT NULL,
      specialisation TEXT,
      year_of_study TEXT NOT NULL,
      graduation_year TEXT,
      life_stage TEXT,
      referral_source TEXT,
      webinar_id INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // Migrate older tables that predate later columns.
  await db.execute(sql`
    ALTER TABLE webinar_registrations ADD COLUMN IF NOT EXISTS referral_source TEXT
  `);
  await db.execute(sql`
    ALTER TABLE webinar_registrations ADD COLUMN IF NOT EXISTS webinar_id INTEGER
  `);
  // Webinars catalogue. Each signup is tagged with the active (upcoming) webinar.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS webinars (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      webinar_date DATE,
      webinar_time TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'upcoming',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_webinar_registrations_created_at ON webinar_registrations (created_at DESC)
  `);
  // One registration per email PER WEBINAR. The same person can register for a
  // future webinar even if they attended a previous one, but not twice for the
  // same webinar. Enforced at the DB level, even under races.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_webinar_registrations_email_webinar_unique
    ON webinar_registrations (lower(email), webinar_id)
  `);
  tableCreated = true;
}

// The active webinar is the one marked 'upcoming' (most recently created if
// more than one). New signups are tagged with this. Returns null if none.
async function getActiveWebinarId(): Promise<number | null> {
  const result = await db.execute(sql`
    SELECT id FROM webinars WHERE status = 'upcoming'
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `);
  const row = result.rows[0] as { id: number } | undefined;
  return row ? row.id : null;
}

export async function saveWebinarRegistration(params: {
  fullName: string;
  whatsapp: string;
  email: string;
  college: string;
  course: string;
  specialisation?: string;
  yearOfStudy: string;
  graduationYear?: string;
  lifeStage?: string;
  referralSource?: string;
}): Promise<{ isNew: boolean }> {
  await ensureTable();
  const webinarId = await getActiveWebinarId();
  // Insert only if this email hasn't registered FOR THIS WEBINAR yet.
  // ON CONFLICT (lower(email), webinar_id) DO NOTHING makes a repeat submission
  // for the same webinar a no-op, while still allowing the same person to sign
  // up for a different webinar. RETURNING id is present only on a genuine
  // insert, so we can tell new vs. duplicate.
  const result = await db.execute(sql`
    INSERT INTO webinar_registrations (
      full_name, whatsapp, email, college, course,
      specialisation, year_of_study, graduation_year, life_stage, referral_source,
      webinar_id
    )
    VALUES (
      ${params.fullName},
      ${params.whatsapp},
      ${params.email},
      ${params.college},
      ${params.course},
      ${params.specialisation || null},
      ${params.yearOfStudy},
      ${params.graduationYear || null},
      ${params.lifeStage || null},
      ${params.referralSource || null},
      ${webinarId}
    )
    ON CONFLICT (lower(email), webinar_id) DO NOTHING
    RETURNING id
  `);
  const isNew = result.rows.length > 0;
  return { isNew };
}

export async function getWebinarRegistrations(limit = 200, offset = 0) {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT id, full_name, whatsapp, email, college, course,
           specialisation, year_of_study, graduation_year, life_stage,
           referral_source, created_at
    FROM webinar_registrations
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return result.rows;
}

export async function getWebinarRegistrationStats() {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '2 days') AS last_2_days,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '4 days') AS last_4_days,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS last_7_days,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS last_30_days
    FROM webinar_registrations
  `);
  return result.rows[0];
}
