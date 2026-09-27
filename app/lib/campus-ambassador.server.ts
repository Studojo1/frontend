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
  // Attribution columns, added after the table shipped. ADD COLUMN IF NOT
  // EXISTS keeps this safe to run against a table that already holds
  // applications: existing rows simply carry NULL.
  await db.execute(sql`
    ALTER TABLE campus_ambassador_applications
      ADD COLUMN IF NOT EXISTS source_path TEXT,
      ADD COLUMN IF NOT EXISTS utm_source TEXT,
      ADD COLUMN IF NOT EXISTS utm_medium TEXT,
      ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
      ADD COLUMN IF NOT EXISTS referrer TEXT
  `);

  // One application per email. A repeat submission is a no-op rather than a
  // duplicate row — enforced at the DB level, so it holds under races too.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_campus_ambassador_email_unique
    ON campus_ambassador_applications (lower(email))
  `);

  // Referral code. Ambassadors hand this to people they bring to the webinar,
  // who type it into the registration form for a discount. Nullable: a code is
  // minted only once an application is accepted, so pending rows carry NULL.
  await db.execute(sql`
    ALTER TABLE campus_ambassador_applications
      ADD COLUMN IF NOT EXISTS ref_code TEXT
  `);
  // Codes are compared case-insensitively (people type them by hand), so the
  // uniqueness guarantee has to be case-insensitive too. A partial index keeps
  // the many NULL rows out of it.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_campus_ambassador_ref_code_unique
    ON campus_ambassador_applications (upper(ref_code))
    WHERE ref_code IS NOT NULL
  `);
  tableCreated = true;
}

/** An ambassador whose code was recognised, as shown back to a registrant. */
export interface AmbassadorRef {
  id: number;
  refCode: string;
  fullName: string;
  college: string;
}

/**
 * Resolve a referral code typed into a form to the ambassador who owns it.
 * Case- and whitespace-insensitive. Returns null for an unknown code, which
 * callers surface as "we don't recognise that code" rather than an error.
 *
 * Only a `selected` ambassador's code works: a code minted for someone who was
 * later dropped from the programme stops granting discounts.
 */
export async function lookupAmbassadorByRefCode(
  code: string
): Promise<AmbassadorRef | null> {
  await ensureTable();
  const normalised = code.trim().toUpperCase();
  if (!normalised) return null;
  const result = await db.execute(sql`
    SELECT id, ref_code, full_name, college
    FROM campus_ambassador_applications
    WHERE upper(ref_code) = ${normalised} AND status = 'selected'
    LIMIT 1
  `);
  const row = result.rows[0] as
    | { id: number; ref_code: string; full_name: string; college: string }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    refCode: row.ref_code,
    fullName: row.full_name,
    college: row.college,
  };
}

/**
 * Mint a referral code for an ambassador, idempotently: an ambassador who
 * already has one keeps it, so codes already printed on a poster stay valid.
 *
 * The code is the first name (letters only, capped) plus a two-digit suffix, so
 * it is short enough to type from memory and recognisably theirs. On the rare
 * collision we retry with a different suffix rather than failing the caller.
 */
export async function ensureRefCode(applicationId: number): Promise<string | null> {
  await ensureTable();
  const existing = await db.execute(sql`
    SELECT ref_code, full_name FROM campus_ambassador_applications
    WHERE id = ${applicationId} LIMIT 1
  `);
  const row = existing.rows[0] as
    | { ref_code: string | null; full_name: string }
    | undefined;
  if (!row) return null;
  if (row.ref_code) return row.ref_code;

  // Letters only — a name like "Anu R." must not produce a code with a dot in
  // it, since the code travels through URLs and gets read aloud.
  const firstName = (row.full_name || "")
    .trim()
    .split(/\s+/)[0]
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 10);
  const stem = firstName || "STUDOJO";

  for (let attempt = 0; attempt < 12; attempt++) {
    const suffix = String(Math.floor(Math.random() * 90) + 10); // 10–99
    const candidate = `${stem}${suffix}`;
    // WHERE ref_code IS NULL means a concurrent call that already set a code
    // wins and we return theirs, instead of overwriting a published code.
    const res = await db.execute(sql`
      UPDATE campus_ambassador_applications
      SET ref_code = ${candidate}
      WHERE id = ${applicationId}
        AND ref_code IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM campus_ambassador_applications
          WHERE upper(ref_code) = ${candidate}
        )
      RETURNING ref_code
    `);
    if (res.rows.length > 0) {
      return (res.rows[0] as { ref_code: string }).ref_code;
    }
    // Either the code was taken or someone else assigned one first. Re-read:
    // if they now have a code, that is the answer.
    const recheck = await db.execute(sql`
      SELECT ref_code FROM campus_ambassador_applications
      WHERE id = ${applicationId} LIMIT 1
    `);
    const got = (recheck.rows[0] as { ref_code: string | null } | undefined)?.ref_code;
    if (got) return got;
  }
  return null;
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
  sourcePath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}): Promise<{ isNew: boolean }> {
  await ensureTable();
  // RETURNING id yields a row only on a genuine insert, so an existing
  // applicant comes back as isNew = false and the form can say so kindly.
  const result = await db.execute(sql`
    INSERT INTO campus_ambassador_applications (
      full_name, whatsapp, email, college, course,
      year_of_study, graduation_year, social_handle, why_you, referral_source,
      source_path, utm_source, utm_medium, utm_campaign, referrer
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
      ${params.referralSource || null},
      ${params.sourcePath || null},
      ${params.utmSource || null},
      ${params.utmMedium || null},
      ${params.utmCampaign || null},
      ${params.referrer || null}
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
           referral_source, status, ref_code, created_at,
           source_path, utm_source, utm_medium, utm_campaign, referrer
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
