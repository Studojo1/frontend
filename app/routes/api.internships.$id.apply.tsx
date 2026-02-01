import { eq, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { internships, internshipApplications, resumes } from "../../auth-schema";
import type { Route } from "./+types/api.internships.$id.apply";

// POST /api/internships/:id/apply - Submit application (authenticated)
export async function action({ request, params }: Route.ActionArgs) {
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

  const { id: internshipId } = params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { resume_id } = body as { resume_id?: unknown };

  if (!resume_id || typeof resume_id !== "string") {
    return new Response(
      JSON.stringify({ error: "resume_id is required and must be a string" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate internship exists and is published
  const [internship] = await db
    .select()
    .from(internships)
    .where(eq(internships.id, internshipId))
    .limit(1);

  if (!internship) {
    return new Response(
      JSON.stringify({ error: "Internship not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (internship.status !== "published") {
    return new Response(
      JSON.stringify({ error: "Internship is not available for applications" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check if deadline has passed
  if (internship.applicationDeadline && new Date(internship.applicationDeadline) < new Date()) {
    return new Response(
      JSON.stringify({ error: "Application deadline has passed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate resume exists and belongs to user
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resume_id), eq(resumes.userId, session.user.id)))
    .limit(1);

  if (!resume) {
    return new Response(
      JSON.stringify({ error: "Resume not found or does not belong to you" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check if user has already applied
  const [existingApplication] = await db
    .select()
    .from(internshipApplications)
    .where(
      and(
        eq(internshipApplications.internshipId, internshipId),
        eq(internshipApplications.userId, session.user.id)
      )
    )
    .limit(1);

  if (existingApplication) {
    return new Response(
      JSON.stringify({ error: "You have already applied for this internship" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  // Create application with locked resume snapshot
  const [newApplication] = await db
    .insert(internshipApplications)
    .values({
      internshipId: internshipId,
      userId: session.user.id,
      resumeId: resume_id,
      resumeSnapshot: resume.resumeData, // Lock the resume data
      status: "pending",
    })
    .returning();

  // Increment application count
  await db
    .update(internships)
    .set({ applicationCount: internship.applicationCount + 1 })
    .where(eq(internships.id, internshipId));

  return new Response(
    JSON.stringify({
      application: {
        id: newApplication.id,
        internshipId: newApplication.internshipId,
        userId: newApplication.userId,
        resumeId: newApplication.resumeId,
        status: newApplication.status,
        createdAt: newApplication.createdAt.toISOString(),
      },
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

