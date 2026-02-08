import { eq, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { internships, internshipApplications, resumes, internshipQuestions, userQuestionResponses } from "../../auth-schema";
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

  const { resume_id, question_responses } = body as { resume_id?: unknown; question_responses?: Record<string, unknown> };

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

  // Validate required questions are answered
  const requiredQuestions = await db
    .select()
    .from(internshipQuestions)
    .where(and(
      eq(internshipQuestions.internshipId, internshipId),
      eq(internshipQuestions.required, true)
    ));

  if (requiredQuestions.length > 0) {
    const answeredQuestionIds = question_responses ? Object.keys(question_responses) : [];
    const missingRequired = requiredQuestions.filter(
      (q) => !answeredQuestionIds.includes(q.id)
    );

    if (missingRequired.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Please answer all required questions",
          missingQuestions: missingRequired.map((q) => ({
            id: q.id,
            questionText: q.questionText,
          })),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
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

  // Store question responses
  if (question_responses && typeof question_responses === "object") {
    const responseEntries = Object.entries(question_responses);
    
    for (const [questionId, response] of responseEntries) {
      if (response !== null && response !== undefined && response !== "") {
        // Check if question exists and belongs to this internship
        const [question] = await db
          .select()
          .from(internshipQuestions)
          .where(and(
            eq(internshipQuestions.id, questionId),
            eq(internshipQuestions.internshipId, internshipId)
          ))
          .limit(1);

        if (question) {
          // Check if response already exists
          const [existingResponse] = await db
            .select()
            .from(userQuestionResponses)
            .where(and(
              eq(userQuestionResponses.userId, session.user.id),
              eq(userQuestionResponses.questionId, questionId)
            ))
            .limit(1);

          if (existingResponse) {
            // Update existing response
            await db
              .update(userQuestionResponses)
              .set({
                response: response as any,
                updatedAt: new Date(),
              })
              .where(and(
                eq(userQuestionResponses.userId, session.user.id),
                eq(userQuestionResponses.questionId, questionId)
              ));
          } else {
            // Insert new response
            await db
              .insert(userQuestionResponses)
              .values({
                userId: session.user.id,
                questionId: questionId,
                response: response as any,
              });
          }
        }
      }
    }
  }

  // Increment application count
  await db
    .update(internships)
    .set({ applicationCount: internship.applicationCount + 1 })
    .where(eq(internships.id, internshipId));

  // Publish email event for internship application (non-blocking)
  try {
    const { publishEmailEvent } = await import("~/lib/events");
    await publishEmailEvent("event.internship.applied", {
      user_id: session.user.id,
      internship_id: internshipId,
      internship_title: internship.title,
      company_name: internship.companyName,
      resume_id: resume_id,
      timestamp: newApplication.createdAt.toISOString(),
    });
  } catch (error) {
    // Log but don't fail the request
    console.error("Failed to publish internship application event:", error);
  }

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

