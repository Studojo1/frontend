import db from "~/lib/db";
import { sql } from "drizzle-orm";

/**
 * Demo requests from /sensei, the B2B page for placement and T&P teams.
 *
 * Deliberately mirrors consultation.server.ts (same lazy ensureTable, same
 * shape) rather than inventing a second pattern: these land in the admin panel
 * next to the student signups and whoever maintains one should recognise the
 * other. Separate table because the questions are completely different, and
 * mixing B2B demo requests into the student funnel would corrupt both.
 */

let tableCreated = false;

async function ensureTable() {
  if (tableCreated) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sensei_demo_requests (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      work_email TEXT NOT NULL,
      organisation TEXT NOT NULL,
      phone TEXT,
      cohort_size TEXT,
      note TEXT,
      source TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_sensei_demo_requests_created_at
      ON sensei_demo_requests (created_at DESC)
  `);
  tableCreated = true;
}

export type SenseiDemoRequest = {
  name: string;
  workEmail: string;
  organisation: string;
  phone?: string;
  cohortSize?: string;
  note?: string;
  source?: string;
};

export async function saveSenseiDemoRequest(p: SenseiDemoRequest) {
  await ensureTable();
  await db.execute(sql`
    INSERT INTO sensei_demo_requests
      (name, work_email, organisation, phone, cohort_size, note, source)
    VALUES (
      ${p.name}, ${p.workEmail}, ${p.organisation},
      ${p.phone || null}, ${p.cohortSize || null},
      ${p.note || null}, ${p.source || "sensei-page"}
    )
  `);
}

export async function getSenseiDemoRequests(limit = 100, offset = 0) {
  await ensureTable();
  const r = await db.execute(sql`
    SELECT id, name, work_email, organisation, phone, cohort_size, note, source, created_at
    FROM sensei_demo_requests
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return r.rows;
}
