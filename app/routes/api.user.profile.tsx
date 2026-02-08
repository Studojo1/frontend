import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { userProfile, user } from "../../auth-schema";
import type { Route } from "./+types/api.user.profile";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Get user profile
  const [profile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, session.user.id))
    .limit(1);

  // Get user info
  const [userRecord] = await db
    .select({
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return new Response(
    JSON.stringify({
      profile: profile ? {
        id: profile.id,
        userId: profile.userId,
        fullName: profile.fullName,
        college: profile.college,
        yearOfStudy: profile.yearOfStudy,
        course: profile.course,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      } : null,
      user: userRecord ? {
        name: userRecord.name,
        email: userRecord.email,
      } : null,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

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

  const { fullName, college, yearOfStudy, course, name } = body as {
    fullName?: string;
    college?: string;
    yearOfStudy?: string;
    course?: string;
    name?: string;
  };

  try {
    // Update user name if provided
    if (name !== undefined) {
      await db
        .update(user)
        .set({ name: name.trim() })
        .where(eq(user.id, session.user.id));
    }

    // Update or create profile
    const [existingProfile] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1);

    if (existingProfile) {
      // Update existing profile
      const updateData: {
        fullName?: string;
        college?: string;
        yearOfStudy?: string;
        course?: string;
        updatedAt: Date;
      } = { updatedAt: new Date() };

      if (fullName !== undefined) updateData.fullName = fullName.trim();
      if (college !== undefined) updateData.college = college.trim() || "Not specified";
      if (yearOfStudy !== undefined) updateData.yearOfStudy = yearOfStudy.trim() || "Not specified";
      if (course !== undefined) updateData.course = course.trim() || "Not specified";

      await db
        .update(userProfile)
        .set(updateData)
        .where(eq(userProfile.userId, session.user.id));
    } else {
      // Create new profile if it doesn't exist
      const id = crypto.randomUUID();
      await db.insert(userProfile).values({
        id,
        userId: session.user.id,
        fullName: fullName?.trim() || session.user.name || "Not specified",
        college: college?.trim() || "Not specified",
        yearOfStudy: yearOfStudy?.trim() || "Not specified",
        course: course?.trim() || "Not specified",
      });
    }

    // Fetch updated data
    const [updatedProfile] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1);

    const [updatedUser] = await db
      .select({
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return new Response(
      JSON.stringify({
        success: true,
        profile: updatedProfile ? {
          id: updatedProfile.id,
          userId: updatedProfile.userId,
          fullName: updatedProfile.fullName,
          college: updatedProfile.college,
          yearOfStudy: updatedProfile.yearOfStudy,
          course: updatedProfile.course,
          createdAt: updatedProfile.createdAt,
          updatedAt: updatedProfile.updatedAt,
        } : null,
        user: updatedUser ? {
          name: updatedUser.name,
          email: updatedUser.email,
        } : null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[api.user.profile] Error updating profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update profile" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

