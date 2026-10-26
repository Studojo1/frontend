import db from "~/lib/db";
import { sql } from "drizzle-orm";
import type { UgcApplication } from "~/lib/ugc-application";

// Applications to the Creator Program (LinkedIn UGC), from /creators.
// Reviewed in the admin panel at /ugc-applicants, which creates the same table
// if it gets there first, so keep the two definitions in step.

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
  tableReady = true;
}

export interface Attribution {
  sourcePath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

export async function saveUgcApplication(a: UgcApplication, src: Attribution): Promise<{ isNew: boolean }> {
  await ensureTable();
  // RETURNING id yields a row only on a genuine insert, so a repeat applicant
  // comes back as isNew = false and the form can say so kindly.
  const result = await db.execute(sql`
    INSERT INTO ugc_applications (
      full_name, email, whatsapp, college, course, year_of_study, graduation_year, city,
      linkedin_url, followers, post_frequency, last_posted, best_post_url, crossed_1k,
      field, target_roles, dream_companies, looking_for, topics, avoid_topics,
      story_work, story_setback, story_lesson, tone,
      can_commit, studojo_ok, why_join, referral_source, referred_by, consent_at,
      source_path, utm_source, utm_medium, utm_campaign, referrer
    )
    VALUES (
      ${a.fullName}, ${a.email}, ${a.whatsapp}, ${a.college}, ${a.course}, ${a.yearOfStudy}, ${a.graduationYear}, ${a.city},
      ${a.linkedinUrl}, ${a.followers}, ${a.postFrequency}, ${a.lastPosted}, ${a.bestPostUrl}, ${a.crossed1k},
      ${a.field}, ${a.targetRoles}, ${a.dreamCompanies}, ${a.lookingFor}, ${JSON.stringify(a.topics)}::jsonb, ${a.avoidTopics},
      ${a.storyWork}, ${a.storySetback}, ${a.storyLesson}, ${a.tone},
      ${a.canCommit}, ${a.studojoOk}, ${a.whyJoin}, ${a.referralSource}, ${a.referredBy}, NOW(),
      ${src.sourcePath || null}, ${src.utmSource || null}, ${src.utmMedium || null}, ${src.utmCampaign || null}, ${src.referrer || null}
    )
    ON CONFLICT (lower(email)) DO NOTHING
    RETURNING id
  `);
  return { isNew: result.rows.length > 0 };
}
