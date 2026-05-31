import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.admin.cc-user-activity";

// Admins who may view this through a logged-in BetterAuth session.
const ADMIN_EMAILS = [
  "admin@studojo.com",
  "jeremy@studojo.com",
  "jeremyabraham1411@gmail.com",
  "studojo@gmail.com",
];

/**
 * Cross-platform user-activity feed for the Career Coach admin dashboard.
 *
 * Auth (either is accepted):
 *   - a logged-in admin BetterAuth session, OR
 *   - the shared secret header `x-cc-admin-secret` (server-to-server, used by
 *     the Career Coach backend proxy).
 *
 * Returns, for a given email: sign-up method + when, login history (last
 * sessions with IP/device), and tool usage (Resume Maker resumes, internship
 * applications, career applications, referral source).
 */
export async function loader({ request }: Route.LoaderArgs) {
  // --- auth ---
  const secret = request.headers.get("x-cc-admin-secret");
  const expected = process.env.CC_ADMIN_SECRET || "";
  let authorized = false;

  if (expected && secret && secret === expected) {
    authorized = true;
  } else {
    const session = await getSessionFromRequest(request);
    if (session && ADMIN_EMAILS.includes(session.user.email)) authorized = true;
  }
  if (!authorized) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  if (!email) {
    return Response.json({ error: "email query param required" }, { status: 400 });
  }

  // --- resolve the user by email ---
  const userRows = (await db.execute(sql`
    SELECT id, name, email, created_at, last_login_method, role, email_verified
    FROM "user"
    WHERE lower(email) = ${email}
    LIMIT 1
  `)) as unknown as { rows: any[] };
  const user = userRows.rows?.[0];

  if (!user) {
    // Not a registered main-platform user (e.g. anonymous coach session).
    return Response.json({ found: false, email });
  }
  const userId: string = user.id;

  // --- run the activity queries in parallel ---
  const [accounts, sessions, resumes, internshipApps, careerApps, profile] =
    await Promise.all([
      db.execute(sql`
        SELECT provider_id, created_at
        FROM account WHERE user_id = ${userId}
        ORDER BY created_at ASC
      `),
      db.execute(sql`
        SELECT created_at, ip_address, user_agent
        FROM session WHERE user_id = ${userId}
        ORDER BY created_at DESC LIMIT 20
      `),
      db.execute(sql`
        SELECT id, name, created_at, updated_at
        FROM resumes WHERE user_id = ${userId}
        ORDER BY created_at DESC LIMIT 20
      `),
      db.execute(sql`
        SELECT id, internship_id, status, created_at
        FROM internship_applications WHERE user_id = ${userId}
        ORDER BY created_at DESC LIMIT 50
      `),
      db.execute(sql`
        SELECT id, status, payment_status, amount, created_at
        FROM career_applications WHERE lower(email) = ${email}
        ORDER BY created_at DESC LIMIT 50
      `),
      db
        .execute(sql`
          SELECT referral_source, college, year_of_study, course, created_at
          FROM user_profile WHERE user_id = ${userId} LIMIT 1
        `)
        .catch(() => ({ rows: [] }) as any),
    ]);

  const rows = (r: any): any[] => (r?.rows ?? []) as any[];
  const accountRows = rows(accounts);
  const sessionRows = rows(sessions);
  const resumeRows = rows(resumes);
  const internshipRows = rows(internshipApps);
  const careerRows = rows(careerApps);
  const profileRow = rows(profile)[0] || null;

  // Map BetterAuth providerId to a human label.
  const providerLabel = (p: string): string => {
    if (p === "credential") return "Email + password";
    if (p === "google") return "Google";
    if (p === "github") return "GitHub";
    if (p === "phone") return "Phone (OTP)";
    return p;
  };

  const signupMethods = accountRows.map((a) => ({
    method: providerLabel(a.provider_id),
    provider_id: a.provider_id,
    linked_at: a.created_at,
  }));

  return Response.json({
    found: true,
    email,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified: user.email_verified,
      role: user.role,
      created_at: user.created_at, // when they signed up
      last_login_method: user.last_login_method
        ? providerLabel(user.last_login_method)
        : null,
    },
    signup_methods: signupMethods,
    logins: sessionRows.map((s) => ({
      at: s.created_at,
      ip: s.ip_address,
      user_agent: s.user_agent,
    })),
    tools: {
      resume_maker: {
        used: resumeRows.length > 0,
        count: resumeRows.length,
        items: resumeRows.map((r) => ({
          id: r.id,
          name: r.name,
          created_at: r.created_at,
          updated_at: r.updated_at,
        })),
      },
      internship_applications: {
        used: internshipRows.length > 0,
        count: internshipRows.length,
        items: internshipRows.map((i) => ({
          id: i.id,
          internship_id: i.internship_id,
          status: i.status,
          created_at: i.created_at,
        })),
      },
      career_applications: {
        used: careerRows.length > 0,
        count: careerRows.length,
        items: careerRows.map((c) => ({
          id: c.id,
          status: c.status,
          payment_status: c.payment_status,
          amount: c.amount,
          created_at: c.created_at,
        })),
      },
    },
    profile: profileRow
      ? {
          referral_source: profileRow.referral_source,
          college: profileRow.college,
          year_of_study: profileRow.year_of_study,
          course: profileRow.course,
          created_at: profileRow.created_at,
        }
      : null,
  });
}
