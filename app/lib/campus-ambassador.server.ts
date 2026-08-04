import db from "~/lib/db";
import { sql } from "drizzle-orm";

let tableCreated = false;

async function ensureTable() {
  if (tableCreated) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS campus_ambassador_applications (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      college TEXT NOT NULL,
      course TEXT,
      year_of_study TEXT NOT NULL,
      graduation_year TEXT,
      social_handle TEXT,
      why_you TEXT NOT NULL,
      referral_source TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_campus_ambassador_created_at
    ON campus_ambassador_applications (created_at DESC)
  `);
  // One application per email. A repeat submission is a no-op rather than a
  // duplicate row — enforced at the DB level, so it holds under races too.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_campus_ambassador_email_unique
    ON campus_ambassador_applications (lower(email))
  `);
  tableCreated = true;
}

export async function saveCampusAmbassadorApplication(params: {
  fullName: string;
  whatsapp: string;
  email: string;
  college: string;
  course?: string;
  yearOfStudy: string;
  graduationYear?: string;
  socialHandle?: string;
  whyYou: string;
  referralSource?: string;
}): Promise<{ isNew: boolean }> {
  await ensureTable();
  // RETURNING id yields a row only on a genuine insert, so an existing
  // applicant comes back as isNew = false and the form can say so kindly.
  const result = await db.execute(sql`
    INSERT INTO campus_ambassador_applications (
      full_name, whatsapp, email, college, course,
      year_of_study, graduation_year, social_handle, why_you, referral_source
    )
    VALUES (
      ${params.fullName},
      ${params.whatsapp},
      ${params.email},
      ${params.college},
      ${params.course || null},
      ${params.yearOfStudy},
      ${params.graduationYear || null},
      ${params.socialHandle || null},
      ${params.whyYou},
      ${params.referralSource || null}
    )
    ON CONFLICT (lower(email)) DO NOTHING
    RETURNING id
  `);
  return { isNew: result.rows.length > 0 };
}

export async function getCampusAmbassadorApplications(limit = 200, offset = 0) {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT id, full_name, whatsapp, email, college, course,
           year_of_study, graduation_year, social_handle, why_you,
           referral_source, status, created_at
    FROM campus_ambassador_applications
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return result.rows;
}

export async function getCampusAmbassadorStats() {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '2 days') AS last_2_days,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS last_7_days,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS last_30_days
    FROM campus_ambassador_applications
  `);
  return result.rows[0];
}
