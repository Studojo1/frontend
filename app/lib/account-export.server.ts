// "Download my data": what THIS app's own tables hold for a user.
//
// job-outreach-svc exports its own tables (profile, candidates, leads,
// campaigns, emails sent, orders, payments, credits, LinkedIn activity). This
// adds everything the web app stores that it does not: the sign-in account,
// resume maker, internship applications, auto-apply, extension drafts, support
// chat and tickets, attribution, webinar and ambassador sign-ups.
//
// Rows are read with SELECT * and then cut down to an allowlist of columns
// (pickColumns), not the other way round. Several of these tables are created
// lazily and gain columns over time, so a named column that one environment
// does not have yet must not fail the whole export, and a column added later
// must stay out until someone lists it here. Never listed: password hashes,
// OAuth and session tokens, LinkedIn cookies, 2FA secrets and backup codes,
// passkey keys, API key hashes, company access tokens, payment signatures.
import { sql, type SQL } from "drizzle-orm";
import db from "~/lib/db";
import { pickColumns } from "~/lib/account-export";

type Row = Record<string, unknown>;

const existing = new Map<string, boolean>();

/** Lazily created tables may not exist yet in a given environment. */
async function tableExists(name: string): Promise<boolean> {
  const cached = existing.get(name);
  if (cached) return true;
  const res = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${name}
    ) AS ok
  `);
  const ok = Boolean((res.rows[0] as { ok?: boolean } | undefined)?.ok);
  // Cache only a hit: a table created after this process started must be seen.
  if (ok) existing.set(name, true);
  return ok;
}

async function rows(table: string, query: SQL, cols: readonly string[]): Promise<Row[]> {
  if (!(await tableExists(table))) return [];
  const res = await db.execute(query);
  return pickColumns(res.rows as Row[], cols);
}

async function one(table: string, query: SQL, cols: readonly string[]): Promise<Row | null> {
  return (await rows(table, query, cols))[0] ?? null;
}

const USER_COLS = [
  "id", "name", "email", "email_verified", "image", "phone_number", "phone_number_verified",
  "last_login_method", "two_factor_enabled", "terms_accepted_at", "privacy_accepted_at", "terms_version",
  "privacy_version", "refund_version", "age_confirmed_at", "created_at", "updated_at",
];
const SIGN_IN_COLS = ["provider_id", "scope", "created_at", "updated_at"];
const SESSION_COLS = ["ip_address", "user_agent", "created_at", "expires_at"];
const PASSKEY_COLS = ["name", "device_type", "backed_up", "transports", "created_at"];
const PROFILE_COLS = ["full_name", "college", "year_of_study", "course", "created_at", "updated_at"];
const EMAIL_PREF_COLS = ["product_emails", "resume_emails", "internship_emails", "security_emails", "updated_at"];

const RESUME_COLS = [
  "id", "name", "resume_data", "version", "template_id", "original_file_name", "created_at", "updated_at",
];
const RESUME_VERSION_COLS = ["resume_id", "version", "resume_data", "template_id", "change_summary", "created_at"];
const RESUME_DRAFT_COLS = ["id", "name", "template_id", "sections", "version", "is_archived", "created_at", "updated_at"];

const APPLICATION_COLS = [
  "id", "internship_title", "company", "status", "resume_snapshot", "resume_file_name", "forwarded_at",
  "created_at", "updated_at",
];
const UPLOAD_COLS = ["name", "content_type", "size_bytes", "created_at", "last_used_at"];
const ANSWER_COLS = ["question", "response", "created_at", "updated_at"];

const AUTOAPPLY_CONFIG_COLS = [
  "cv_text", "roles", "locations", "platforms", "work_type", "daily_limit", "status", "prescreen_answers",
  "company_prefs", "excluded_companies", "schedule_start_hour", "schedule_end_hour", "created_at", "updated_at",
];
const AUTOAPPLY_JOB_COLS = [
  "company", "role_title", "location", "platform", "apply_url", "match_score", "status", "applied_at", "created_at",
];
const JOB_QUEUE_COLS = [
  "company", "role_title", "location", "platform", "apply_url", "match_score", "prescreened_answers", "status",
  "applied_at", "created_at",
];
const LI_SESSION_COLS = ["is_active", "locale", "timezone", "created_at"];
const LI_CONTACT_COLS = [
  "linkedin_url", "name", "title", "company", "status", "sequence_step", "replied", "connected_at", "last_action_at",
  "created_at",
];
const LI_OUTREACH_CAMPAIGN_COLS = [
  "name", "target_titles", "target_companies", "connection_note", "message_template", "follow_up_template", "status",
  "created_at",
];

const DRAFT_COLS = [
  "contact_name", "contact_email", "contact_title", "company", "role", "location", "job_url", "subject", "body",
  "email_style", "status", "source", "created_at", "updated_at", "sent_at",
];
const API_KEY_COLS = ["name", "last_four", "created_at", "last_used_at", "revoked_at", "request_count"];

const CHAT_COLS = ["user_message", "bot_response", "created_at"];
const TICKET_COLS = ["id", "category", "priority", "status", "source", "context", "attachments", "created_at", "updated_at", "closed_at"];
const TICKET_MESSAGE_COLS = ["ticket_id", "author_type", "body", "created_at"];

const ATTRIBUTION_COLS = [
  "fbclid", "gclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "referrer",
  "landing_path", "captured_at", "created_at",
];
const WEBINAR_COLS = [
  "full_name", "whatsapp", "email", "college", "course", "specialisation", "year_of_study", "graduation_year",
  "life_stage", "referral_source", "webinar_title", "webinar_date", "ref_code", "amount_paise", "paid", "paid_at",
  "created_at",
];
const STANDING_COLS = ["email", "full_name", "created_at"];
const AMBASSADOR_COLS = [
  "full_name", "whatsapp", "email", "college", "course", "year_of_study", "graduation_year", "social_handle",
  "why_you", "referral_source", "status", "ref_code", "created_at",
];
const CONSULTATION_COLS = ["email", "target_role", "biggest_challenge", "timeline", "created_at"];
const CAREER_APP_COLS = [
  "name", "email", "phone_number", "city", "institution_name", "current_year", "course", "areas_of_interest",
  "form_data", "payment_status", "amount", "status", "created_at",
];
const NEWSLETTER_COLS = ["email", "source", "subscribed_at", "unsubscribed_at"];
const REPORT_REQUEST_COLS = ["topic", "email", "status", "created_at"];

/** The support widget sends no user id, so its logs are matched the way
 *  account deletion matches them (job-outreach-svc services/account_deletion.py
 *  _delete_chat_logs): the IP and browser of the user's own sessions, or their
 *  address written in a message. */
async function supportChat(userId: string, email: string): Promise<Row[]> {
  if (!(await tableExists("support_chat_logs"))) return [];
  const pattern = `%${email.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const byAddress = email ? sql`OR lower(l.user_message) LIKE ${pattern} ESCAPE '\\'` : sql``;
  const res = await db.execute(sql`
    SELECT user_message, bot_response, created_at FROM support_chat_logs l
    WHERE EXISTS (
      SELECT 1 FROM session s
      WHERE s.user_id = ${userId} AND s.ip_address IS NOT NULL
        AND s.ip_address = l.ip_address AND s.user_agent IS NOT DISTINCT FROM l.user_agent
    )
    ${byAddress}
    ORDER BY created_at
  `);
  return pickColumns(res.rows as Row[], CHAT_COLS);
}

async function tickets(userId: string): Promise<Row[]> {
  const list = await rows("tickets", sql`SELECT * FROM tickets WHERE user_id = ${userId} ORDER BY created_at`, TICKET_COLS);
  if (list.length === 0 || !(await tableExists("ticket_messages"))) return list.map((t) => ({ ...t, messages: [] }));
  const msgs = pickColumns(
    (
      await db.execute(sql`
        SELECT m.* FROM ticket_messages m JOIN tickets t ON t.id = m.ticket_id
        WHERE t.user_id = ${userId} ORDER BY m.created_at
      `)
    ).rows as Row[],
    TICKET_MESSAGE_COLS,
  );
  return list.map((t) => ({ ...t, messages: msgs.filter((m) => m.ticket_id === t.id) }));
}

async function webinarRegistrations(email: string): Promise<Row[]> {
  if (!(await tableExists("webinar_registrations"))) return [];
  const join = await tableExists("webinars");
  const res = await db.execute(
    join
      ? sql`SELECT r.*, w.title AS webinar_title, w.webinar_date FROM webinar_registrations r
            LEFT JOIN webinars w ON w.id = r.webinar_id WHERE lower(r.email) = ${email} ORDER BY r.created_at`
      : sql`SELECT * FROM webinar_registrations WHERE lower(email) = ${email} ORDER BY created_at`,
  );
  return pickColumns(res.rows as Row[], WEBINAR_COLS);
}

async function internshipApplications(userId: string): Promise<Row[]> {
  if (!(await tableExists("internship_applications"))) return [];
  const join = (await tableExists("internships")) && (await tableExists("companies"));
  const res = await db.execute(
    join
      ? sql`SELECT a.*, i.title AS internship_title, c.name AS company FROM internship_applications a
            LEFT JOIN internships i ON i.id = a.internship_id LEFT JOIN companies c ON c.id = i.company_id
            WHERE a.user_id = ${userId} ORDER BY a.created_at`
      : sql`SELECT * FROM internship_applications WHERE user_id = ${userId} ORDER BY created_at`,
  );
  return pickColumns(res.rows as Row[], APPLICATION_COLS);
}

async function questionAnswers(userId: string): Promise<Row[]> {
  if (!(await tableExists("user_question_responses"))) return [];
  const res = await db.execute(sql`
    SELECT q.question_text AS question, r.response, r.created_at, r.updated_at
    FROM user_question_responses r LEFT JOIN internship_questions q ON q.id = r.question_id
    WHERE r.user_id = ${userId} ORDER BY r.created_at
  `);
  return pickColumns(res.rows as Row[], ANSWER_COLS);
}

/** Everything this app's database holds for the user, keyed by source. */
export async function collectAppData(userId: string, rawEmail: string): Promise<Record<string, unknown>> {
  const email = rawEmail.trim().toLowerCase();
  const byUser = (table: string, cols: readonly string[], order = "created_at") =>
    rows(table, sql`SELECT * FROM ${sql.identifier(table)} WHERE user_id = ${userId} ORDER BY ${sql.identifier(order)}`, cols);
  const byEmail = (table: string, cols: readonly string[], order = "created_at") =>
    rows(table, sql`SELECT * FROM ${sql.identifier(table)} WHERE lower(email) = ${email} ORDER BY ${sql.identifier(order)}`, cols);

  const [
    account, signIn, sessions, passkeys, profile, emailPrefs,
    resumes, resumeVersions, resumeDrafts,
    applications, uploads, answers,
    autoapplyConfig, autoapplyJobs, jobQueue, liSession, liContacts, liCampaigns,
    drafts, apiKeys, chat, ticketList, attribution,
    webinars, standing, ambassador, consultations, careerApps, newsletter, reportRequests,
  ] = await Promise.all([
    one("user", sql`SELECT * FROM "user" WHERE id = ${userId}`, USER_COLS),
    byUser("account", SIGN_IN_COLS),
    byUser("session", SESSION_COLS),
    byUser("passkey", PASSKEY_COLS),
    one("user_profile", sql`SELECT * FROM user_profile WHERE user_id = ${userId}`, PROFILE_COLS),
    one("email_preferences", sql`SELECT * FROM email_preferences WHERE user_id = ${userId}`, EMAIL_PREF_COLS),
    byUser("resumes", RESUME_COLS),
    rows("resume_versions", sql`SELECT * FROM resume_versions WHERE created_by = ${userId} ORDER BY created_at`, RESUME_VERSION_COLS),
    byUser("resume_drafts", RESUME_DRAFT_COLS),
    internshipApplications(userId),
    byUser("application_resume_uploads", UPLOAD_COLS),
    questionAnswers(userId),
    one("autoapply_configs", sql`SELECT * FROM autoapply_configs WHERE user_id = ${userId}`, AUTOAPPLY_CONFIG_COLS),
    byUser("autoapply_jobs", AUTOAPPLY_JOB_COLS),
    byUser("job_queue", JOB_QUEUE_COLS),
    one("user_linkedin_sessions", sql`SELECT * FROM user_linkedin_sessions WHERE user_id = ${userId}`, LI_SESSION_COLS),
    byUser("outreach_contacts", LI_CONTACT_COLS),
    byUser("outreach_campaigns", LI_OUTREACH_CAMPAIGN_COLS),
    byUser("extension_drafts", DRAFT_COLS),
    byUser("api_keys", API_KEY_COLS),
    supportChat(userId, email),
    tickets(userId),
    one("user_attribution", sql`SELECT * FROM user_attribution WHERE user_id = ${userId}`, ATTRIBUTION_COLS),
    webinarRegistrations(email),
    byEmail("webinar_standing_subscribers", STANDING_COLS),
    byEmail("campus_ambassador_applications", AMBASSADOR_COLS),
    rows(
      "consultation_signups",
      sql`SELECT * FROM consultation_signups WHERE user_id = ${userId} OR lower(email) = ${email} ORDER BY created_at`,
      CONSULTATION_COLS,
    ),
    byEmail("career_applications", CAREER_APP_COLS),
    rows(
      "newsletter_subscriptions",
      sql`SELECT * FROM newsletter_subscriptions WHERE user_id = ${userId} OR lower(email) = ${email} ORDER BY subscribed_at`,
      NEWSLETTER_COLS,
    ),
    byUser("report_requests", REPORT_REQUEST_COLS),
  ]);

  return {
    account: account ? { ...account, sign_in_methods: signIn, sessions, passkeys } : null,
    profile,
    email_preferences: emailPrefs,
    resume_maker: { resumes, resume_versions: resumeVersions, resume_drafts: resumeDrafts },
    internships: { applications, resume_uploads: uploads, question_answers: answers },
    autoapply: {
      config: autoapplyConfig,
      jobs: autoapplyJobs,
      job_queue: jobQueue,
      linkedin_session: liSession,
      linkedin_contacts: liContacts,
      linkedin_campaigns: liCampaigns,
    },
    extension_drafts: drafts,
    api_keys: apiKeys,
    support_chat: chat,
    tickets: ticketList,
    attribution,
    webinars: { registrations: webinars, standing_subscription: standing },
    campus_ambassador: ambassador,
    consultation_signups: consultations,
    career_applications: careerApps,
    newsletter: newsletter,
    report_requests: reportRequests,
  };
}
