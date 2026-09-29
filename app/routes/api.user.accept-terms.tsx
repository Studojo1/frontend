import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { POLICY_VERSIONS, needsPolicyAcceptance } from "~/lib/legal";
import { user } from "../../auth-schema";
import type { Route } from "./+types/api.user.accept-terms";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET: does the signed-in user need to accept the current policy versions?
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return json({ error: "Unauthorized" }, 401);

  const [row] = await db
    .select({
      termsVersion: user.termsVersion,
      privacyVersion: user.privacyVersion,
      refundVersion: user.refundVersion,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return json({ needsAcceptance: row ? needsPolicyAcceptance(row) : false, versions: POLICY_VERSIONS });
}

// POST: record acceptance of the current Terms, Privacy Policy and Refund
// Policy, with their versions. Sign-up also sends ageConfirmed.
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const session = await getSessionFromRequest(request);
  if (!session) return json({ error: "Unauthorized" }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { termsAccepted, privacyAccepted, ageConfirmed } = body as {
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    ageConfirmed?: boolean;
  };

  const now = new Date();
  const updates: Partial<typeof user.$inferInsert> = {};
  if (termsAccepted) {
    updates.termsAcceptedAt = now;
    updates.termsVersion = POLICY_VERSIONS.terms;
    // The Refund Policy is part of the Terms (Terms §1), so accepting the
    // Terms accepts the refund version in force today.
    updates.refundVersion = POLICY_VERSIONS.refund;
  }
  if (privacyAccepted) {
    updates.privacyAcceptedAt = now;
    updates.privacyVersion = POLICY_VERSIONS.privacy;
  }
  if (ageConfirmed) {
    updates.ageConfirmedAt = now;
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: "No acceptance data provided" }, 400);
  }

  try {
    await db.update(user).set(updates).where(eq(user.id, session.user.id));
    return json({ success: true, versions: POLICY_VERSIONS });
  } catch (error) {
    console.error("[api.user.accept-terms] Error updating user:", error);
    return json({ error: "Failed to update acceptance" }, 500);
  }
}
