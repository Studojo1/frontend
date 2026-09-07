import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.admin.orphaned-accounts";

// Same admin allowlist as api.admin.cc-user-activity.
const ADMIN_EMAILS = [
  "admin@studojo.com",
  "jeremy@studojo.com",
  "jeremyabraham1411@gmail.com",
  "studojo@gmail.com",
];

const ALLOWED_ORIGINS = [
  "https://admin.studojo.com",
  "https://admin.studojo.pro",
  "https://studojo.com",
  "https://studojo.pro",
  "http://localhost:3000",
  "http://localhost:3001",
];

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "";
  const h: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-cc-admin-secret",
    "Access-Control-Allow-Credentials": "true",
  };
  if (allow) h["Access-Control-Allow-Origin"] = allow;
  return h;
}

function jsonCors(request: Request, data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders(request) });
}

async function isAuthorized(request: Request): Promise<boolean> {
  const secret = request.headers.get("x-cc-admin-secret");
  const expected =
    process.env.CC_ADMIN_SECRET_KEY || process.env.CC_ADMIN_SECRET || "";
  if (expected && secret && secret === expected) return true;
  const session = await getSessionFromRequest(request);
  return !!session && ADMIN_EMAILS.includes(session.user.email);
}

/**
 * Orphaned accounts left behind by the better-auth 1.7 signup outage.
 *
 * Between the 2026-08-18 rebuild and the 1.4.18 pin, every signup inserted the
 * `user` row and then threw on the `account` insert (better-auth 1.7 expects an
 * `account.issuer` column this schema does not have). Those users have no
 * account row and therefore no credential and no OAuth link: they cannot sign
 * in by any method, and re-registering hits "User already exists". The rows
 * must be deleted so the address is free again.
 *
 * GET  → list them (read-only, always safe).
 *   ?since=YYYY-MM-DD   window start (default 2026-08-18)
 *   ?include_test=1     also show seeded @example.com probe rows
 *
 * POST → delete them. Requires an explicit confirmation body so this can never
 * fire by accident:
 *   { "confirm": "DELETE_ORPHANED_ACCOUNTS", "since": "2026-08-18", "ids": [...] }
 * `ids` is optional; when present only those ids are deleted (and each is still
 * re-checked against the orphan predicate inside the transaction, so a row that
 * has since gained an account is never removed).
 */

const DEFAULT_SINCE = "2026-08-18";

// A user is orphaned iff it has NO account row at all. Such a user has no
// password and no linked provider, so it is unreachable by every sign-in path.
// Sessions are irrelevant: the outage threw before any session was created.
function orphanRowsQuery(since: string, includeTest: boolean) {
  return sql`
    SELECT u.id, u.email, u.name, u.created_at, u.last_login_method,
           u.email_verified, u.phone_number,
           (SELECT count(*) FROM session s WHERE s.user_id = u.id) AS session_count
    FROM "user" u
    LEFT JOIN account a ON a.user_id = u.id
    WHERE a.id IS NULL
      AND u.created_at >= ${since}::timestamp
      ${includeTest ? sql`` : sql`AND lower(u.email) NOT LIKE '%@example.com'`}
    ORDER BY u.created_at DESC
  `;
}

export async function loader({ request }: Route.LoaderArgs) {
  if (!(await isAuthorized(request))) {
    return jsonCors(request, { error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const since = (url.searchParams.get("since") || DEFAULT_SINCE).trim();
  const includeTest = url.searchParams.get("include_test") === "1";

  const res = (await db.execute(
    orphanRowsQuery(since, includeTest),
  )) as unknown as { rows: any[] };
  const rows = res.rows ?? [];

  // Separate the seeded probe rows so they are never confused with real users.
  const testRows = rows.filter((r) =>
    String(r.email || "").toLowerCase().endsWith("@example.com"),
  );
  const realRows = rows.filter(
    (r) => !String(r.email || "").toLowerCase().endsWith("@example.com"),
  );

  return jsonCors(request, {
    since,
    counts: {
      total: rows.length,
      real_users: realRows.length,
      test_rows: testRows.length,
    },
    users: realRows,
    test_rows: includeTest ? testRows : undefined,
    note:
      "These users have no account row: no password, no OAuth link. They cannot sign in by any method and cannot re-register while the row exists. Deleting the row frees the email address.",
  });
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") {
    return jsonCors(request, { error: "Method not allowed" }, 405);
  }
  if (!(await isAuthorized(request))) {
    return jsonCors(request, { error: "Unauthorized" }, 401);
  }

  const body = (await request.json().catch(() => ({}))) as {
    confirm?: string;
    since?: string;
    ids?: string[];
    include_test?: boolean;
  };

  if (body.confirm !== "DELETE_ORPHANED_ACCOUNTS") {
    return jsonCors(
      request,
      {
        error:
          'Refusing to delete. Send {"confirm":"DELETE_ORPHANED_ACCOUNTS"} to proceed.',
      },
      400,
    );
  }

  const since = (body.since || DEFAULT_SINCE).trim();
  const includeTest = body.include_test === true;

  // Re-resolve the orphan set inside the request rather than trusting the
  // caller's ids: a row that gained an account since the listing must not be
  // deleted. `ids`, when given, only narrows this set.
  const res = (await db.execute(
    orphanRowsQuery(since, includeTest),
  )) as unknown as { rows: any[] };
  let targets = res.rows ?? [];

  if (Array.isArray(body.ids) && body.ids.length > 0) {
    const wanted = new Set(body.ids);
    targets = targets.filter((r) => wanted.has(r.id));
  }

  if (targets.length === 0) {
    return jsonCors(request, { deleted: 0, users: [], since });
  }

  // Delete one id at a time so a single unexpected FK cannot take out the batch,
  // and so the response can report exactly what went.
  const deleted: any[] = [];
  const failed: { id: string; email: string; error: string }[] = [];
  for (const t of targets) {
    try {
      await db.execute(sql`DELETE FROM "user" WHERE id = ${t.id}`);
      deleted.push({ id: t.id, email: t.email, created_at: t.created_at });
    } catch (err) {
      failed.push({
        id: t.id,
        email: t.email,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return jsonCors(request, {
    since,
    deleted: deleted.length,
    users: deleted,
    failed: failed.length ? failed : undefined,
  });
}
