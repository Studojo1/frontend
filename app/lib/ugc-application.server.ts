import { randomInt } from "node:crypto";
import db from "~/lib/db";
import { sql } from "drizzle-orm";
import type { UgcApplication } from "~/lib/ugc-application";

// Applications to the Creator Program (LinkedIn UGC), from /creators.
// Reviewed in the admin panel at /ugc-applicants, which creates and migrates
// the same table if it gets there first, so keep the two definitions in step.

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ugc_applications (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      college TEXT NOT NULL,
      course TEXT NOT NULL,
      year_of_study TEXT NOT NULL,
      graduation_year TEXT,
      city TEXT,
      linkedin_url TEXT NOT NULL,
      followers TEXT NOT NULL,
      post_frequency TEXT NOT NULL,
      last_posted TEXT NOT NULL,
      best_post_url TEXT,
      crossed_1k TEXT,
      field TEXT NOT NULL,
      target_roles TEXT NOT NULL,
      dream_companies TEXT,
      looking_for TEXT NOT NULL,
      topics JSONB NOT NULL DEFAULT '[]'::jsonb,
      avoid_topics TEXT,
      story_work TEXT,
      story_setback TEXT,
      story_lesson TEXT,
      tone TEXT,
      can_commit TEXT NOT NULL,
      studojo_ok TEXT NOT NULL,
      why_join TEXT NOT NULL,
      referral_source TEXT,
      referred_by TEXT,
      consent_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      team_notes TEXT,
      source_path TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      referrer TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // One application per email, enforced by the database so it holds under races.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_ugc_applications_email_unique
    ON ugc_applications (lower(email))
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_ugc_applications_created_at
    ON ugc_applications (created_at DESC)
  `);
  // Second version of the form (Oct 2026): connections instead of followers,
  // "I don't have LinkedIn", no stories step, and share codes so the team can
  // see who brought whom. Idempotent, and identical in the admin panel.
  await db.execute(sql`ALTER TABLE ugc_applications ADD COLUMN IF NOT EXISTS connections TEXT`);
  await db.execute(sql`ALTER TABLE ugc_applications ADD COLUMN IF NOT EXISTS has_linkedin BOOLEAN NOT NULL DEFAULT true`);
  await db.execute(sql`ALTER TABLE ugc_applications ADD COLUMN IF NOT EXISTS share_code TEXT`);
  await db.execute(sql`ALTER TABLE ugc_applications ADD COLUMN IF NOT EXISTS came_from_code TEXT`);
  await db.execute(sql`ALTER TABLE ugc_applications ALTER COLUMN followers DROP NOT NULL`);
  await db.execute(sql`ALTER TABLE ugc_applications ALTER COLUMN linkedin_url DROP NOT NULL`);
  await db.execute(sql`ALTER TABLE ugc_applications ALTER COLUMN post_frequency DROP NOT NULL`);
  await db.execute(sql`ALTER TABLE ugc_applications ALTER COLUMN last_posted DROP NOT NULL`);
  // The Growth Fellowship questions (Oct 2026).
  await db.execute(sql`ALTER TABLE ugc_applications ADD COLUMN IF NOT EXISTS fellowship_goals JSONB`);
  await db.execute(sql`ALTER TABLE ugc_applications ADD COLUMN IF NOT EXISTS intern_interest TEXT`);
  await db.execute(sql`ALTER TABLE ugc_applications ADD COLUMN IF NOT EXISTS network_share TEXT`);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_ugc_applications_share_code
    ON ugc_applications (share_code) WHERE share_code IS NOT NULL
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_ugc_applications_came_from
    ON ugc_applications (came_from_code) WHERE came_from_code IS NOT NULL
  `);
  tableReady = true;
}

// No 0/o, 1/l/i: people read these out and type them.
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function newShareCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

function isShareCodeClash(e: unknown): boolean {
  const err = e as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } };
  const code = err?.cause?.code ?? err?.code;
  const constraint = err?.cause?.constraint ?? err?.constraint;
  return code === "23505" && constraint === "idx_ugc_applications_share_code";
}

export interface Attribution {
  sourcePath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

/**
 * Stores an application. Returns the applicant's share code either way: a new
 * one for a new applicant, the existing one when this email already applied
 * (older rows get one on the spot), so their share links always credit them.
 */
export async function saveUgcApplication(
  a: UgcApplication,
  src: Attribution,
): Promise<{ isNew: boolean; shareCode: string }> {
  await ensureTable();
  for (let attempt = 0; ; attempt++) {
    const shareCode = newShareCode();
    try {
      // RETURNING yields a row only on a genuine insert.
      const result = await db.execute(sql`
        INSERT INTO ugc_applications (
          full_name, email, whatsapp, college, course, year_of_study, graduation_year, city,
          has_linkedin, linkedin_url, connections, post_frequency, last_posted, best_post_url, crossed_1k,
          fellowship_goals, intern_interest, network_share,
          field, target_roles, dream_companies, looking_for, topics, avoid_topics,
          can_commit, studojo_ok, why_join, referral_source, referred_by, consent_at,
          share_code, came_from_code,
          source_path, utm_source, utm_medium, utm_campaign, referrer
        )
        VALUES (
          ${a.fullName}, ${a.email}, ${a.whatsapp}, ${a.college}, ${a.course}, ${a.yearOfStudy}, ${a.graduationYear}, ${a.city},
          ${a.hasLinkedin}, ${a.linkedinUrl}, ${a.connections}, ${a.postFrequency}, ${a.lastPosted}, ${a.bestPostUrl}, ${a.crossed1k},
          ${JSON.stringify(a.fellowshipGoals)}::jsonb, ${a.internInterest}, ${a.networkShare},
          ${a.field}, ${a.targetRoles}, ${a.dreamCompanies}, ${a.lookingFor}, ${JSON.stringify(a.topics)}::jsonb, ${a.avoidTopics},
          ${a.canCommit}, ${a.studojoOk}, ${a.whyJoin}, ${a.referralSource}, ${a.referredBy}, NOW(),
          ${shareCode}, ${a.cameFromCode},
          ${src.sourcePath || null}, ${src.utmSource || null}, ${src.utmMedium || null}, ${src.utmCampaign || null}, ${src.referrer || null}
        )
        ON CONFLICT (lower(email)) DO NOTHING
        RETURNING share_code
      `);
      if (result.rows.length > 0) return { isNew: true, shareCode: String(result.rows[0].share_code) };

      // Already applied: hand back their code, giving older rows one now.
      const existing = await db.execute(sql`
        UPDATE ugc_applications
        SET share_code = COALESCE(share_code, ${shareCode})
        WHERE lower(email) = lower(${a.email})
        RETURNING share_code
      `);
      return { isNew: false, shareCode: String(existing.rows[0]?.share_code ?? shareCode) };
    } catch (e) {
      // Two applicants drew the same code: try another one.
      if (attempt < 3 && isShareCodeClash(e)) continue;
      throw e;
    }
  }
}
