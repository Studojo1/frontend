// Server-only helpers for the Studojo Contact Enrichment API keys.
//
// Security model:
//  - Only allowlisted emails may CREATE keys (API_BUILDER_ALLOWLIST env, plus
//    role=admin). Unset env falls back to the founders' addresses.
//  - A raw key is returned exactly once at creation. We store only a keyed hash
//    (HMAC-SHA256 with API_KEY_PEPPER when set, else plain SHA-256), so a DB
//    leak never yields usable keys and, with a pepper, is useless without the
//    app secret too.
//  - Each key has a fixed-window rate limit (60/min) and a monthly quota
//    (402 when exhausted). Both are tracked in api_counters.
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { randomBytes } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";

const KEY_PREFIX = "sk_live_";
const DEFAULT_ALLOW = ["mvijiabraham@gmail.com", "jeremy.zac@gmail.com"];

export const RATE_PER_MIN = 60;

function allowlist(): Set<string> {
  const fromEnv = (process.env.API_BUILDER_ALLOWLIST || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set(fromEnv.length ? fromEnv : DEFAULT_ALLOW);
}

/** Who is allowed to build an API key. */
export function isApiBuilder(email?: string | null, role?: string | null): boolean {
  if (role === "admin") return true;
  if (!email) return false;
  return allowlist().has(email.trim().toLowerCase());
}

let ensured = false;
async function ensureTables(): Promise<void> {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "api_keys" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" text,
      "email" text NOT NULL,
      "name" text NOT NULL DEFAULT 'API key',
      "key_prefix" text NOT NULL,
      "key_hash" text NOT NULL UNIQUE,
      "last_four" text NOT NULL DEFAULT '',
      "created_at" timestamp DEFAULT now() NOT NULL,
      "last_used_at" timestamp,
      "revoked_at" timestamp,
      "request_count" integer DEFAULT 0 NOT NULL,
      "monthly_quota" integer NOT NULL DEFAULT 10000
    )`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "api_counters" (
      "key_id" uuid NOT NULL,
      "bucket" text NOT NULL,
      "count" integer NOT NULL DEFAULT 0,
      "updated_at" timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY ("key_id", "bucket")
    )`);
  ensured = true;
}

// HMAC with a server pepper when configured, else plain sha256. Keys created
// before a pepper is set must be recreated after — there are none in prod yet.
function hashKey(plaintext: string): string {
  const pepper = process.env.API_KEY_PEPPER || "";
  return pepper
    ? createHmac("sha256", pepper).update(plaintext).digest("hex")
    : createHash("sha256").update(plaintext).digest("hex");
}

export type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  last_four: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  request_count: number;
  monthly_quota: number;
};

function rowsOf(result: any): any[] {
  return (result?.rows ?? result ?? []) as any[];
}

export async function listKeys(email: string): Promise<ApiKeyRow[]> {
  await ensureTables();
  const r = await db.execute(sql`
    SELECT id, name, key_prefix, last_four, created_at, last_used_at, revoked_at,
           request_count, monthly_quota
    FROM api_keys
    WHERE lower(email) = ${email.toLowerCase()}
    ORDER BY created_at DESC`);
  return rowsOf(r) as ApiKeyRow[];
}

export async function createKey(
  email: string,
  userId: string | null,
  name: string,
): Promise<{ id: string; plaintext: string; lastFour: string }> {
  await ensureTables();
  const secret = randomBytes(24).toString("base64url"); // ~32 url-safe chars
  const plaintext = KEY_PREFIX + secret;
  const keyHash = hashKey(plaintext);
  const lastFour = secret.slice(-4);
  const r = await db.execute(sql`
    INSERT INTO api_keys (user_id, email, name, key_prefix, key_hash, last_four)
    VALUES (${userId}, ${email}, ${name || "API key"}, ${KEY_PREFIX}, ${keyHash}, ${lastFour})
    RETURNING id`);
  const id = String(rowsOf(r)[0]?.id ?? "");
  return { id, plaintext, lastFour };
}

export async function revokeKey(email: string, id: string): Promise<void> {
  await ensureTables();
  await db.execute(sql`
    UPDATE api_keys SET revoked_at = now()
    WHERE id = ${id} AND lower(email) = ${email.toLowerCase()} AND revoked_at IS NULL`);
}

export type Caller = { id: string; email: string; monthlyQuota: number };

/** Authenticate an incoming API key. Constant-time compare on the hash. */
export async function verifyKey(plaintext: string): Promise<Caller | null> {
  if (!plaintext || !plaintext.startsWith(KEY_PREFIX)) return null;
  await ensureTables();
  const wanted = hashKey(plaintext);
  const r = await db.execute(sql`
    SELECT id, email, key_hash, monthly_quota FROM api_keys
    WHERE key_hash = ${wanted} AND revoked_at IS NULL
    LIMIT 1`);
  const row = rowsOf(r)[0];
  if (!row) return null;
  // Defensive constant-time recheck (the WHERE already matched the indexed hash).
  const a = Buffer.from(String(row.key_hash));
  const b = Buffer.from(wanted);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  await db.execute(sql`
    UPDATE api_keys SET last_used_at = now(), request_count = request_count + 1
    WHERE id = ${row.id}`);
  return { id: String(row.id), email: String(row.email), monthlyQuota: Number(row.monthly_quota) };
}

function minuteBucket(): string {
  // UTC minute, no Date.now sensitivity beyond the wall clock.
  return "rate:" + new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}
function monthBucket(): string {
  return "month:" + new Date().toISOString().slice(0, 7); // YYYY-MM
}

/** Fixed-window per-key rate limit. Returns whether allowed + headers info. */
export async function rateLimit(
  keyId: string,
  perMin = RATE_PER_MIN,
): Promise<{ ok: boolean; remaining: number; resetSec: number }> {
  await ensureTables();
  const bucket = minuteBucket();
  const r = await db.execute(sql`
    INSERT INTO api_counters (key_id, bucket, count) VALUES (${keyId}, ${bucket}, 1)
    ON CONFLICT (key_id, bucket)
    DO UPDATE SET count = api_counters.count + 1, updated_at = now()
    RETURNING count`);
  const count = Number(rowsOf(r)[0]?.count ?? 1);
  const now = new Date();
  const resetSec = 60 - now.getUTCSeconds();
  return { ok: count <= perMin, remaining: Math.max(0, perMin - count), resetSec };
}

/** Monthly usage vs quota (does not increment). */
export async function quotaStatus(
  keyId: string,
  quota: number,
): Promise<{ ok: boolean; used: number; quota: number }> {
  await ensureTables();
  const r = await db.execute(sql`
    SELECT count FROM api_counters WHERE key_id = ${keyId} AND bucket = ${monthBucket()}`);
  const used = Number(rowsOf(r)[0]?.count ?? 0);
  return { ok: used < quota, used, quota };
}

/** Charge n against the monthly quota. Call only on a billable success. */
export async function chargeUsage(keyId: string, n = 1): Promise<void> {
  if (n <= 0) return;
  await ensureTables();
  await db.execute(sql`
    INSERT INTO api_counters (key_id, bucket, count) VALUES (${keyId}, ${monthBucket()}, ${n})
    ON CONFLICT (key_id, bucket)
    DO UPDATE SET count = api_counters.count + ${n}, updated_at = now()`);
}
