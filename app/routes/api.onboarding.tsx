import { validateOnboardingBody } from "~/lib/onboarding";
import { createProfile, updateProfile, getProfileStatus, getSessionFromRequest, subscribeToNewsletter } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.onboarding";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST" && request.method !== "PATCH") {
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

  // PATCH: Update existing profile fields incrementally
  if (request.method === "PATCH") {
    const data = body as Record<string, unknown>;
    const updates: Partial<{ fullName: string; college: string; yearOfStudy: string; course: string }> = {};
    if (typeof data.college === "string") updates.college = data.college;
    if (typeof data.yearOfStudy === "string") updates.yearOfStudy = data.yearOfStudy;
    if (typeof data.course === "string") updates.course = data.course;
    if (typeof data.fullName === "string") updates.fullName = data.fullName;

    const profile = await updateProfile(session.user.id, updates);
    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle newsletter subscription if requested
    const newsletterSubscribed = (data as { newsletterSubscribed?: boolean }).newsletterSubscribed;
    if (newsletterSubscribed && session.user.email) {
      try {
        await subscribeToNewsletter(session.user.email, session.user.id, "onboarding");
      } catch (error) {
        console.error("[api.onboarding] Error subscribing to newsletter:", error);
      }
    }

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // POST: Create new profile
  const validated = validateOnboardingBody(body as Record<string, unknown>);
  if (!validated.ok) {
    return new Response(
      JSON.stringify({ error: validated.error }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const existing = await getProfileStatus(session.user.id);
  if (existing.completed) {
    return new Response(
      JSON.stringify({ error: "Profile already exists" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }
  const profile = await createProfile(session.user.id, validated.data);
  
  // Handle newsletter subscription if requested
  const newsletterSubscribed = (body as { newsletterSubscribed?: boolean }).newsletterSubscribed;
  if (newsletterSubscribed && session.user.email) {
    try {
      await subscribeToNewsletter(session.user.email, session.user.id, "onboarding");
    } catch (error) {
      // Non-critical error, log but don't fail the onboarding
      console.error("[api.onboarding] Error subscribing to newsletter:", error);
    }
  }
  return new Response(
    JSON.stringify({
      profile: {
        id: profile.id,
        userId: profile.userId,
        fullName: profile.fullName,
        college: profile.college,
        yearOfStudy: profile.yearOfStudy,
        course: profile.course,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}
