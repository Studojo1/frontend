import { eq, and, sql } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import {
  internships,
  internshipApplications,
  internshipQuestions,
  userQuestionResponses,
  user,
  applicationResumeUploads,
} from "../../auth-schema";
import { sendInternshipApplicationNotification } from "~/lib/notifications.server";
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

  const { original_file, question_responses } = body as {
    original_file?: { url?: unknown } | null;
    question_responses?: Record<string, unknown>;
  };

  // The apply flow is upload-only. The candidate either uploaded a new PDF via
  // /api/internships/applications/upload (which recorded a row in
  // application_resume_uploads), or picked a previously-used resume from
  // /api/user/resume-uploads. Either way the URL must exist as one of THIS
  // user's recorded uploads — that's both ownership verification and the
  // source of truth for content type and filename.
  const submittedUrl =
    original_file && typeof original_file === "object" && typeof original_file.url === "string"
      ? original_file.url
      : null;

  if (!submittedUrl) {
    return new Response(
      JSON.stringify({ error: "original_file.url is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const [uploadRow] = await db
    .select()
    .from(applicationResumeUploads)
    .where(
      and(
        eq(applicationResumeUploads.userId, session.user.id),
        eq(applicationResumeUploads.url, submittedUrl),
      ),
    )
    .limit(1);

  if (!uploadRow) {
    return new Response(
      JSON.stringify({ error: "Resume not found in your uploads. Upload a new one and try again." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const resolvedOriginalFile = {
    url: uploadRow.url,
    contentType: uploadRow.contentType,
    name: uploadRow.name,
  };

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

  // Upload-only flow: persist the raw file pointer. resume_id / resume_snapshot
  // remain in the schema for legacy rows; new applications leave them NULL.
  const [newApplication] = await db
    .insert(internshipApplications)
    .values({
      internshipId: internshipId,
      userId: session.user.id,
      resumeId: null,
      resumeSnapshot: null,
      resumeFileUrl: resolvedOriginalFile.url,
      resumeFileContentType: resolvedOriginalFile.contentType,
      resumeFileName: resolvedOriginalFile.name,
      status: "pending",
    })
    .returning();

  // Bump last_used_at so this resume bubbles to the top of the picker next
  // time the user hits Apply. Non-blocking: failure here doesn't break the
  // application that was just successfully inserted.
  db.update(applicationResumeUploads)
    .set({ lastUsedAt: sql`now()` })
    .where(eq(applicationResumeUploads.id, uploadRow.id))
    .catch((err) => console.error("[apply] failed to bump last_used_at:", err));

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
      resume_id: null,
      timestamp: newApplication.createdAt.toISOString(),
    });
  } catch (error) {
    // Log but don't fail the request
    console.error("Failed to publish internship application event:", error);
  }

  // Send ops notification via Resend (non-blocking)
  try {
    const [applicant] = await db
      .select({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (applicant) {
      await sendInternshipApplicationNotification({
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        applicantPhone: applicant.phoneNumber,
        internshipTitle: internship.title,
        companyName: internship.companyName,
        internshipId: internshipId,
        applicationId: newApplication.id,
        appliedAt: newApplication.createdAt,
      });
    }
  } catch (error) {
    console.error("Failed to send internship application notification email:", error);
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

