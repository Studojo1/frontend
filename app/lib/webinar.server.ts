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
  // Campus-ambassador attribution and payment state. Added after the table
  // shipped, so ADD COLUMN IF NOT EXISTS: existing rows carry NULL / false.
  //
  // ref_code is stored even when it matched no ambassador, so a mistyped code
  // is still visible when someone writes in asking where their discount went.
  // ambassador_id is set only on a genuine match and is what reporting counts.
  await db.execute(sql`
    ALTER TABLE webinar_registrations
      ADD COLUMN IF NOT EXISTS ref_code TEXT,
      ADD COLUMN IF NOT EXISTS ambassador_id INTEGER,
      ADD COLUMN IF NOT EXISTS amount_paise INTEGER,
      ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
      ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
      ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ
  `);
  // The webhook finds the registration by order id, on every payment.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_webinar_registrations_order_id
    ON webinar_registrations (razorpay_order_id)
    WHERE razorpay_order_id IS NOT NULL
  `);
  // Powers the per-ambassador leaderboard.
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_webinar_registrations_ambassador
    ON webinar_registrations (webinar_id, ambassador_id)
  `);
  // One registration per email PER WEBINAR. The same person can register for a
  // future webinar even if they attended a previous one, but not twice for the
  // same webinar. Enforced at the DB level, even under races.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_webinar_registrations_email_webinar_unique
    ON webinar_registrations (lower(email), webinar_id)
  `);
  // Standing subscribers: people who clicked "register for the next one too".
  // They are auto-enrolled into every future webinar created in admin.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS webinar_standing_subscribers (
      email TEXT PRIMARY KEY,
      full_name TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
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

// quickRegister handles the one-click "register for the next one too" button.
// It (1) registers the person for the currently active webinar using their
// known email/name (no form), and (2) records them as a standing subscriber so
// every future webinar auto-enrols them. Idempotent: clicking twice is safe.
export async function quickRegister(params: {
  email: string;
  fullName: string;
}): Promise<{ activeWebinarId: number | null; alreadyRegistered: boolean }> {
  await ensureTable();
  const email = params.email.trim().toLowerCase();
  const fullName = (params.fullName || "").trim();

  // Standing subscriber (upsert — keep the latest known name).
  await db.execute(sql`
    INSERT INTO webinar_standing_subscribers (email, full_name)
    VALUES (${email}, ${fullName})
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
  `);

  // Register for the active webinar, if there is one.
  const webinarId = await getActiveWebinarId();
  let alreadyRegistered = false;
  if (webinarId !== null) {
    const res = await db.execute(sql`
      INSERT INTO webinar_registrations (
        full_name, whatsapp, email, college, course,
        year_of_study, referral_source, webinar_id
      )
      VALUES (
        ${fullName || "there"}, '', ${email}, '', '',
        '', 'one-click-from-email', ${webinarId}
      )
      ON CONFLICT (lower(email), webinar_id) DO NOTHING
      RETURNING id
    `);
    alreadyRegistered = res.rows.length === 0;
  }
  return { activeWebinarId: webinarId, alreadyRegistered };
}

// Auto-enrol all standing subscribers as registrants of a given webinar. Called
// when a new webinar is created in admin. Returns the emails newly enrolled
// (so the caller can fire confirmation emails). Idempotent per (email,webinar).
export async function enrollStandingSubscribers(webinarId: number): Promise<{ email: string; full_name: string }[]> {
  await ensureTable();
  const res = await db.execute(sql`
    INSERT INTO webinar_registrations (
      full_name, whatsapp, email, college, course,
      year_of_study, referral_source, webinar_id
    )
    SELECT COALESCE(NULLIF(s.full_name, ''), 'there'), '', s.email, '', '',
           '', 'standing-subscriber', ${webinarId}
    FROM webinar_standing_subscribers s
    ON CONFLICT (lower(email), webinar_id) DO NOTHING
    RETURNING email, full_name
  `);
  return res.rows as { email: string; full_name: string }[];
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
  refCode?: string;
  ambassadorId?: number;
  amountPaise?: number;
}): Promise<{ isNew: boolean; registrationId: number | null }> {
  await ensureTable();
  const webinarId = await getActiveWebinarId();
  // Insert only if this email hasn't registered FOR THIS WEBINAR yet.
  // ON CONFLICT (lower(email), webinar_id) DO NOTHING makes a repeat submission
  // for the same webinar a no-op, while still allowing the same person to sign
  // up for a different webinar. RETURNING id is present only on a genuine
  // insert, so we can tell new vs. duplicate.
  // On a repeat submission for the same webinar, update the existing row rather
  // than doing nothing. A paid webinar makes this necessary: someone who
  // registered, abandoned checkout and came back must be able to correct a
  // typo'd referral code and get a fresh order, instead of being told they are
  // "already registered" while holding no ticket.
  //
  // WHERE NOT paid protects a ticket already bought: once payment lands, a
  // later submission with the same email cannot overwrite the row or reset the
  // price. RETURNING then yields nothing, which the caller reads as "already
  // registered and paid".
  const result = await db.execute(sql`
    INSERT INTO webinar_registrations (
      full_name, whatsapp, email, college, course,
      specialisation, year_of_study, graduation_year, life_stage, referral_source,
      webinar_id, ref_code, ambassador_id, amount_paise
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
      ${webinarId},
      ${params.refCode || null},
      ${params.ambassadorId ?? null},
      ${params.amountPaise ?? null}
    )
    ON CONFLICT (lower(email), webinar_id) DO UPDATE SET
      full_name       = EXCLUDED.full_name,
      whatsapp        = EXCLUDED.whatsapp,
      college         = EXCLUDED.college,
      course          = EXCLUDED.course,
      specialisation  = EXCLUDED.specialisation,
      year_of_study   = EXCLUDED.year_of_study,
      graduation_year = EXCLUDED.graduation_year,
      life_stage      = EXCLUDED.life_stage,
      referral_source = EXCLUDED.referral_source,
      ref_code        = EXCLUDED.ref_code,
      ambassador_id   = EXCLUDED.ambassador_id,
      amount_paise    = EXCLUDED.amount_paise
    WHERE webinar_registrations.paid = FALSE
    RETURNING id, (xmax = 0) AS inserted
  `);
  const row = result.rows[0] as { id: number; inserted: boolean } | undefined;
  return {
    isNew: row ? row.inserted : false,
    registrationId: row ? row.id : null,
  };
}

/**
 * Attach a freshly created Razorpay order to a registration, so the webhook can
 * find its way back here from the payment alone.
 */
export async function attachOrderToRegistration(params: {
  registrationId: number;
  orderId: string;
  amountPaise: number;
}): Promise<void> {
  await ensureTable();
  await db.execute(sql`
    UPDATE webinar_registrations
    SET razorpay_order_id = ${params.orderId},
        amount_paise = ${params.amountPaise}
    WHERE id = ${params.registrationId}
  `);
}

/**
 * Mark a registration paid, from a verified payment.
 *
 * Idempotent, and deliberately so: Razorpay retries webhooks, and the browser's
 * success callback may arrive for the same payment. `AND paid = FALSE` means
 * only the first one through returns a row, so the join-link email is sent
 * exactly once no matter how many times this is called.
 */
export async function markRegistrationPaid(params: {
  orderId: string;
  paymentId: string;
}): Promise<{ email: string; full_name: string; id: number } | null> {
  await ensureTable();
  const result = await db.execute(sql`
    UPDATE webinar_registrations
    SET paid = TRUE,
        razorpay_payment_id = ${params.paymentId},
        paid_at = NOW()
    WHERE razorpay_order_id = ${params.orderId}
      AND paid = FALSE
    RETURNING id, email, full_name
  `);
  const row = result.rows[0] as
    | { id: number; email: string; full_name: string }
    | undefined;
  return row ?? null;
}

/** Whether a registration has been paid for — drives the confirmation page. */
export async function getRegistrationPaymentStatus(
  orderId: string
): Promise<{ paid: boolean; fullName: string } | null> {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT paid, full_name FROM webinar_registrations
    WHERE razorpay_order_id = ${orderId}
    LIMIT 1
  `);
  const row = result.rows[0] as
    | { paid: boolean; full_name: string }
    | undefined;
  if (!row) return null;
  return { paid: row.paid, fullName: row.full_name };
}

/**
 * Per-ambassador totals for the active webinar: how many people each one
 * brought, how many of those actually paid, and the revenue behind them.
 */
export async function getAmbassadorLeaderboard(webinarId?: number) {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT r.ref_code,
           MAX(a.full_name) AS ambassador_name,
           MAX(a.college)   AS ambassador_college,
           COUNT(*)                                   AS registrations,
           COUNT(*) FILTER (WHERE r.paid)             AS paid_count,
           COALESCE(SUM(r.amount_paise) FILTER (WHERE r.paid), 0) AS revenue_paise
    FROM webinar_registrations r
    LEFT JOIN campus_ambassador_applications a ON a.id = r.ambassador_id
    WHERE r.ref_code IS NOT NULL
      AND (${webinarId ?? null}::int IS NULL OR r.webinar_id = ${webinarId ?? null})
    GROUP BY r.ref_code
    ORDER BY paid_count DESC, registrations DESC
  `);
  return result.rows;
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
