// Server-only helpers for the Studojo Contact Enrichment API keys.
//
// Security model:
//  - Only allowlisted emails may CREATE keys. The allowlist is Jeremy's to
//    control via the API_BUILDER_ALLOWLIST env (comma-separated emails), plus
//    any BetterAuth user with role="admin". If the env is unset we fall back
//    to the founders' addresses so the portal is never wide open by accident.
//  - A raw key is returned to the builder exactly once, at creation. We store
//    only its sha256 hash, so a DB leak never exposes usable keys.
import { createHash, randomBytes } from "crypto";
import { sql } from "drizzle-orm";
import db from "~/lib/db";

const KEY_PREFIX = "sk_live_";
const DEFAULT_ALLOW = ["mvijiabraham@gmail.com", "jeremy.zac@gmail.com"];

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
async function ensureTable(): Promise<void> {
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
      "request_count" integer DEFAULT 0 NOT NULL
    )`);
  ensured = true;
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
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
};

function rowsOf(result: any): any[] {
  return (result?.rows ?? result ?? []) as any[];
}

export async function listKeys(email: string): Promise<ApiKeyRow[]> {
  await ensureTable();
  const r = await db.execute(sql`
    SELECT id, name, key_prefix, last_four, created_at, last_used_at, revoked_at, request_count
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
  await ensureTable();
  const secret = randomBytes(24).toString("base64url"); // ~32 url-safe chars
  const plaintext = KEY_PREFIX + secret;
  const keyHash = sha256(plaintext);
  const lastFour = secret.slice(-4);
  const r = await db.execute(sql`
    INSERT INTO api_keys (user_id, email, name, key_prefix, key_hash, last_four)
    VALUES (${userId}, ${email}, ${name || "API key"}, ${KEY_PREFIX}, ${keyHash}, ${lastFour})
    RETURNING id`);
  const id = String(rowsOf(r)[0]?.id ?? "");
  return { id, plaintext, lastFour };
}

export async function revokeKey(email: string, id: string): Promise<void> {
  await ensureTable();
  await db.execute(sql`
    UPDATE api_keys SET revoked_at = now()
    WHERE id = ${id} AND lower(email) = ${email.toLowerCase()} AND revoked_at IS NULL`);
}

/** Authenticate an incoming API key (used by the enrichment endpoint). */
export async function verifyKey(
  plaintext: string,
): Promise<{ id: string; email: string } | null> {
  if (!plaintext || !plaintext.startsWith(KEY_PREFIX)) return null;
  await ensureTable();
  const r = await db.execute(sql`
    SELECT id, email FROM api_keys
    WHERE key_hash = ${sha256(plaintext)} AND revoked_at IS NULL
    LIMIT 1`);
  const row = rowsOf(r)[0];
  if (!row) return null;
  await db.execute(sql`
    UPDATE api_keys SET last_used_at = now(), request_count = request_count + 1
    WHERE id = ${row.id}`);
  return { id: String(row.id), email: String(row.email) };
}
