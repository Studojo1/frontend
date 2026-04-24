import db from "~/lib/db";
import { sql } from "drizzle-orm";

let tableCreated = false;

async function ensureTable() {
  if (tableCreated) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS consultation_signups (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      email TEXT,
      target_role TEXT NOT NULL,
      biggest_challenge TEXT NOT NULL,
      timeline TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_consultation_signups_created_at ON consultation_signups (created_at DESC)
  `);
  tableCreated = true;
}

export async function saveConsultationSignup(params: {
  userId?: string;
  email?: string;
  targetRole: string;
  biggestChallenge: string;
  timeline: string;
}) {
  await ensureTable();
  await db.execute(sql`
    INSERT INTO consultation_signups (user_id, email, target_role, biggest_challenge, timeline)
    VALUES (
      ${params.userId || null},
      ${params.email || null},
      ${params.targetRole},
      ${params.biggestChallenge},
      ${params.timeline}
    )
  `);
}

export async function getConsultationSignups(limit = 100, offset = 0) {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT id, user_id, email, target_role, biggest_challenge, timeline, created_at
    FROM consultation_signups
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return result.rows;
}

export async function getConsultationSignupStats() {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS last_7_days,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS last_30_days
    FROM consultation_signups
  `);
  return result.rows[0];
}
