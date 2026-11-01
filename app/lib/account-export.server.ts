// "Download my data": what THIS app's own tables hold for a user (the sign-in
// account, support chat and tickets, attribution, report requests, API keys).
// The product's rows (career_agent) come from career-data.server.ts.
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
const API_KEY_COLS = ["name", "last_four", "created_at", "last_used_at", "revoked_at", "request_count"];

const CHAT_COLS = ["user_message", "bot_response", "created_at"];
const TICKET_COLS = ["id", "category", "priority", "status", "source", "context", "attachments", "created_at", "updated_at", "closed_at"];
const TICKET_MESSAGE_COLS = ["ticket_id", "author_type", "body", "created_at"];

const ATTRIBUTION_COLS = [
  "fbclid", "gclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "referrer",
  "landing_path", "captured_at", "created_at",
];
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




/** What this app's database holds for the user, keyed by source: the sign-in account and the parts of the site
 * that stay after the relaunch (support chat and tickets, attribution, report requests, API keys). The old products'
 * tables are not read (RELAUNCH, 2 Nov 2026); the product's own rows come from career-data.server.ts. */
export async function collectAppData(userId: string, rawEmail: string): Promise<Record<string, unknown>> {
  const email = rawEmail.trim().toLowerCase();
  const byUser = (table: string, cols: readonly string[], order = "created_at") =>
    rows(table, sql`SELECT * FROM ${sql.identifier(table)} WHERE user_id = ${userId} ORDER BY ${sql.identifier(order)}`, cols);

  const [account, signIn, sessions, passkeys, profile, apiKeys, chat, ticketList, attribution, reportRequests] = await Promise.all([
    one("user", sql`SELECT * FROM "user" WHERE id = ${userId}`, USER_COLS),
    byUser("account", SIGN_IN_COLS),
    byUser("session", SESSION_COLS),
    byUser("passkey", PASSKEY_COLS),
    one("user_profile", sql`SELECT * FROM user_profile WHERE user_id = ${userId}`, PROFILE_COLS),
    byUser("api_keys", API_KEY_COLS),
    supportChat(userId, email),
    tickets(userId),
    one("user_attribution", sql`SELECT * FROM user_attribution WHERE user_id = ${userId}`, ATTRIBUTION_COLS),
    byUser("report_requests", REPORT_REQUEST_COLS),
  ]);

  return {
    account: account ? { ...account, sign_in_methods: signIn, sessions, passkeys } : null,
    profile,
    api_keys: apiKeys,
    support_chat: chat,
    tickets: ticketList,
    attribution,
    report_requests: reportRequests,
  };
}
