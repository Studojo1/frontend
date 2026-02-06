import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { user } from "../../auth-schema";
import type { Route } from "./+types/api.user.phone";

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

  const { phoneNumber, verified } = body as {
    phoneNumber?: string;
    verified?: boolean;
  };

  if (!phoneNumber) {
    return new Response(
      JSON.stringify({ error: "Phone number is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
    return new Response(
      JSON.stringify({ error: "Invalid phone number format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check if phone number is already taken by another user
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.phoneNumber, phoneNumber))
    .limit(1);

  if (existingUser && existingUser.id !== session.user.id) {
    return new Response(
      JSON.stringify({ error: "Phone number is already in use" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Update phone number and verification status
    // For Google users, verified is true (Google has already verified their account)
    await db
      .update(user)
      .set({
        phoneNumber,
        phoneNumberVerified: verified === true,
      })
      .where(eq(user.id, session.user.id));

    return new Response(
      JSON.stringify({ success: true, phoneNumber, verified: verified === true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[api.user.phone] Error updating phone number:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update phone number" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

