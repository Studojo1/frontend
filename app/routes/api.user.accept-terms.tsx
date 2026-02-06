import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { user } from "../../auth-schema";
import type { Route } from "./+types/api.user.accept-terms";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
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

  const { termsAccepted, privacyAccepted } = body as {
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
  };

  const updates: { termsAcceptedAt?: Date; privacyAcceptedAt?: Date } = {};
  if (termsAccepted) {
    updates.termsAcceptedAt = new Date();
  }
  if (privacyAccepted) {
    updates.privacyAcceptedAt = new Date();
  }

  if (Object.keys(updates).length === 0) {
    return new Response(
      JSON.stringify({ error: "No acceptance data provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await db
      .update(user)
      .set(updates)
      .where(eq(user.id, session.user.id));

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[api.user.accept-terms] Error updating user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update acceptance" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

