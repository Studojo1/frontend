/**
 * Auth for the Studojo Job Assistant browser extension.
 *
 * The extension cannot use cookies: it calls from a `chrome-extension://` (or
 * `moz-extension://`) origin, which is cross-origin to studojo.pro. Instead the
 * user signs in on the website at /extension/connect, that page mints a token
 * here, and the extension sends it as `Authorization: Bearer <token>`.
 *
 * Mirrors the shipped one-time-token flow in api.autoapply.capture-token.tsx,
 * with two differences: a 30-day TTL (the extension is long-lived), and the
 * token is NOT deleted on read (it is reused until it expires or is revoked).
 */
import { createClient } from "redis";
import { randomUUID } from "crypto";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";
const TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days
const KEY = (t: string) => `ext_token:${t}`;

let _redis: ReturnType<typeof createClient> | null = null;
async function getRedis() {
  if (_redis) return _redis;
  _redis = createClient({ url: REDIS_URL, password: REDIS_PASSWORD || undefined });
  _redis.on("error", () => {});
  await _redis.connect();
  return _redis;
}

/** Issue a token for an already-authenticated user. Called from the connect page. */
export async function mintExtensionToken(userId: string): Promise<string> {
  const token = randomUUID();
  const redis = await getRedis();
  await redis.set(KEY(token), userId, { EX: TOKEN_TTL });
  return token;
}

/**
 * Resolve the bearer token on an extension request.
 * Returns null rather than throwing so callers decide the status code.
 */
/** Distinguishes "no valid token" from "we could not check".
 *
 *  Both used to return null, so an unreachable Redis was reported to the
 *  student as "sign in" — they signed in, it failed again, and nothing
 *  explained why. Never authorise on an error; just say which error it is. */
export type TokenResult =
  | { userId: string }
  | { unavailable: true }
  | null;

export async function resolveExtensionToken(
  request: Request,
): Promise<{ userId: string } | null> {
  const r = await resolveExtensionTokenDetailed(request);
  return r && "userId" in r ? r : null;
}

export async function resolveExtensionTokenDetailed(
  request: Request,
): Promise<TokenResult> {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;

  try {
    const redis = await getRedis();
    const userId = await redis.get(KEY(token));
    if (!userId) return null;
    // Sliding expiry: an actively used extension stays signed in.
    await redis.expire(KEY(token), TOKEN_TTL);
    return { userId };
  } catch (e) {
    // Redis down. NOT authorised — but not "signed out" either. Telling a
    // student to sign in when they already are sends them round a loop that
    // cannot succeed.
    console.error("[extension-auth] token store unreachable:", e);
    return { unavailable: true };
  }
}

/** Revoke a single token (sign out just this browser). */
export async function revokeExtensionToken(token: string): Promise<void> {
  try {
    const redis = await getRedis();
    await redis.del(KEY(token));
  } catch {
    /* best effort */
  }
}

/* ------------------------------------------------------------------ CORS */
/**
 * The extension's origin is `chrome-extension://<id>`, and on Firefox
 * `moz-extension://<uuid>` where the UUID is generated PER INSTALL — so it
 * cannot be allowlisted. We therefore accept any extension-scheme origin and
 * rely on the bearer token as the real authentication.
 */
const EXTENSION_ORIGIN = /^(chrome-extension|moz-extension|safari-web-extension):\/\/[a-z0-9-]+$/i;

export function isExtensionOrigin(origin: string | null): boolean {
  return Boolean(origin && EXTENSION_ORIGIN.test(origin));
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
  if (isExtensionOrigin(origin)) h["Access-Control-Allow-Origin"] = origin!;
  return h;
}

/** Standard OPTIONS preflight response for the extension API routes. */
export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

/** JSON response carrying the right CORS headers. */
export function extJson(request: Request, body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: corsHeaders(request.headers.get("origin")),
  });
}
