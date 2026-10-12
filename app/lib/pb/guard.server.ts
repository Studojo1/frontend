/**
 * Access control for /pb (students) and /pbadmin (staff).
 *
 * Every gate runs on the server, in each loader and action, so none of it can
 * be skipped by calling a route directly or by editing client state.
 *
 *   1. Host gate. Both pages exist on the apex staging host (and localhost)
 *      only. Anywhere else, studojo.com above all, they throw a 404 rather
 *      than a 403: a 403 would confirm there is something here to find.
 *   2. Student gate. Any signed-in account. Signed-out visitors are sent to
 *      sign-in with a return path back to the page they asked for.
 *   3. Staff gate. Allowlisted email AND a verified email AND a linked Google
 *      account AND no password account. Staging lets anyone sign up with an
 *      unverified email and a password, so an email-only check could be
 *      squatted by registering the staff address first. The Google and
 *      password checks read the BetterAuth tables directly, together with a
 *      fresh copy of the user row, because the session cookie cache can be
 *      up to five minutes old.
 *
 * Staff who fail the gate get null (or a 403 for actions), never a redirect
 * to /auth: auth._index.tsx sends a signed-in visitor straight back, which
 * would loop forever. The page renders a wall instead.
 */
import { redirect } from "react-router";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { auth } from "~/lib/auth";
import { authUrl } from "~/lib/return-to";
import { isPbHost, isPbAdminEmail } from "./access.server";

export { isPbHost, isPbAdminEmail };

export type PbUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean | null;
};

function notFound(): never {
  throw new Response("Not Found", { status: 404 });
}

function toPbUser(u: SessionUser): PbUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    image: u.image ?? null,
  };
}

/** The signed-in user, or null. Throws the 404 first when off-host. */
async function sessionUser(request: Request): Promise<SessionUser | null> {
  if (!isPbHost(request)) notFound();
  const session = await auth.api.getSession({ headers: request.headers });
  const u = session?.user as SessionUser | undefined;
  if (!u?.id || typeof u.email !== "string") return null;
  return u;
}

/**
 * The staff checks that need the database: a fresh email and verified flag,
 * a Google account row, and no password (credential) account row. One small
 * query on indexed columns.
 *
 * The Google row must date from the moment the user was created. Google
 * sign-up writes the user and its account row together; a Google account
 * linked later onto a user someone else registered with a password is not
 * proof of who holds the session, even after the password row is removed.
 */
async function passesStaffAccountCheck(userId: string): Promise<boolean> {
  const res = await db.execute(sql`
    SELECT
      u.email,
      u.email_verified,
      EXISTS (
        SELECT 1 FROM "account" a
        WHERE a.user_id = u.id AND a.provider_id = 'google'
          AND a.created_at <= u.created_at + INTERVAL '1 minute'
      ) AS has_google,
      EXISTS (
        SELECT 1 FROM "account" a
        WHERE a.user_id = u.id AND a.provider_id = 'credential'
      ) AS has_password
    FROM "user" u
    WHERE u.id = ${userId}
  `);
  const row = res.rows[0];
  if (!row) return false;
  return (
    isPbAdminEmail(typeof row.email === "string" ? row.email : null) &&
    row.email_verified === true &&
    row.has_google === true &&
    row.has_password === false
  );
}

/** The staff user when every staff check passes, else null. */
async function staffFrom(u: SessionUser | null): Promise<PbUser | null> {
  if (!u) return null;
  if (!isPbAdminEmail(u.email)) return null;
  if (u.emailVerified !== true) return null;
  if (!(await passesStaffAccountCheck(u.id))) return null;
  return toPbUser(u);
}

/**
 * Guard for every /pb loader and action.
 *
 * 404 off-host. A signed-out visitor is redirected to sign-in and brought
 * back to this exact URL afterwards. Returns the signed-in user otherwise.
 */
export async function requirePbStudent(request: Request): Promise<PbUser> {
  const u = await sessionUser(request);
  if (!u) {
    const url = new URL(request.url);
    throw redirect(authUrl("signin", url.pathname + url.search));
  }
  return toPbUser(u);
}

/**
 * Guard for /pbadmin loaders. 404 off-host; otherwise the staff user, or null
 * when nobody is signed in or the account fails any staff check. Never
 * redirects: the page shows a wall (see pbAdminState for what to say on it).
 */
export async function requirePbAdmin(request: Request): Promise<PbUser | null> {
  const u = await sessionUser(request);
  return staffFrom(u);
}

/**
 * Everything the /pbadmin wall needs in one call: whether anyone is signed in,
 * with which address, and the staff user when the checks pass. Lets the page
 * say "you are signed in as x, which is not a staff account" instead of
 * offering a sign-in button to someone who is already signed in.
 */
export async function pbAdminState(request: Request): Promise<{
  signedIn: boolean;
  email: string | null;
  user: PbUser | null;
}> {
  const u = await sessionUser(request);
  if (!u) return { signedIn: false, email: null, user: null };
  const user = await staffFrom(u);
  return { signedIn: true, email: u.email, user };
}

/**
 * Same gates for /pbadmin actions and API calls. An action has no wall to
 * render, so an unauthorised call is a 403 with a JSON body. Still 404s
 * off-host.
 */
export async function requirePbAdminAction(request: Request): Promise<PbUser> {
  const user = await requirePbAdmin(request);
  if (!user) {
    throw new Response(JSON.stringify({ error: "Not authorised." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
