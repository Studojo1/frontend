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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_webinar_registrations_created_at ON webinar_registrations (created_at DESC)
  `);
  tableCreated = true;
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
}) {
  await ensureTable();
  await db.execute(sql`
    INSERT INTO webinar_registrations (
      full_name, whatsapp, email, college, course,
      specialisation, year_of_study, graduation_year, life_stage
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
      ${params.lifeStage || null}
    )
  `);
}

export async function getWebinarRegistrations(limit = 200, offset = 0) {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT id, full_name, whatsapp, email, college, course,
           specialisation, year_of_study, graduation_year, life_stage, created_at
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
