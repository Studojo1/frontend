import { timingSafeEqual } from "node:crypto";
import type { Route } from "./+types/api.auth.hash-password";

/** True only when the X-Internal-Secret header matches EMAILER_INTERNAL_SECRET
 * (the service-to-service secret the emailer already uses). No secret
 * configured means nobody gets in. */
export function hasInternalSecret(request: Request): boolean {
  const expected = process.env.EMAILER_INTERNAL_SECRET || "";
  const given = request.headers.get("x-internal-secret") || "";
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Internal API endpoint for hashing passwords using Better Auth's hashing function.
 * 
 * DEPRECATED: This endpoint is only used for HandleChangePassword since Better Auth
 * doesn't have a change-password endpoint for logged-in users. HandleResetPassword
 * now uses Better Auth's /api/auth/reset-password endpoint directly.
 * 
 * This is used by the emailer-service to ensure password hashes are compatible with Better Auth.
 * 
 * SECURITY: it was public and unauthenticated, an uncapped bcrypt CPU cost
 * for anyone (audit AS-N04). It now requires the X-Internal-Secret header.
 * The emailer falls back to hashing locally when this answers non-200.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!hasInternalSecret(request)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { password } = body as { password?: string };

  if (!password || typeof password !== "string") {
    return new Response(
      JSON.stringify({ error: "password is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Use Better Auth's password hashing algorithm (bcryptjs for credential accounts)
    // Better Auth uses bcryptjs with cost factor 10 for credential provider passwords
    // Better Auth expects $2a$10$ format (not $2b$10$)
    // bcryptjs produces $2b$ format by default, so we convert it to $2a$ format
    
    const bcrypt = await import("bcryptjs");
    
    // Generate hash with bcryptjs (cost 10, matching Better Auth's configuration)
    const hash = await bcrypt.hash(password, 10);
    
    // Convert $2b$ to $2a$ format for Better Auth compatibility
    // This is safe: $2a$ and $2b$ use identical algorithms, only the prefix differs
    // Better Auth's validation checks the prefix, so we must convert it
    const compatibleHash = hash.replace(/^\$2b\$/, "$2a$");
    
    return new Response(
      JSON.stringify({ hash: compatibleHash }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[api.auth.hash-password] Error hashing password:", error);
    return new Response(
      JSON.stringify({ error: "Failed to hash password" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

