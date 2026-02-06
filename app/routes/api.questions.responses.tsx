import { eq, inArray, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { userQuestionResponses, internshipQuestions, questionTags, questionTagMappings } from "../../auth-schema";
import type { Route } from "./+types/api.questions.responses";

// GET /api/questions/responses - Fetch user's previous responses for matching questions
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const questionIdsParam = url.searchParams.get("question_ids");
  const tagIdsParam = url.searchParams.get("tag_ids");

  let responses;

  if (questionIdsParam) {
    // Fetch responses for specific question IDs
    const questionIds = questionIdsParam.split(",").filter(Boolean);
    
    if (questionIds.length === 0) {
      return new Response(
        JSON.stringify({ responses: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    responses = await db
      .select({
        id: userQuestionResponses.id,
        userId: userQuestionResponses.userId,
        questionId: userQuestionResponses.questionId,
        response: userQuestionResponses.response,
        question: {
          id: internshipQuestions.id,
          questionText: internshipQuestions.questionText,
          questionType: internshipQuestions.questionType,
          options: internshipQuestions.options,
        },
      })
      .from(userQuestionResponses)
      .innerJoin(internshipQuestions, eq(userQuestionResponses.questionId, internshipQuestions.id))
      .where(
        and(
          eq(userQuestionResponses.userId, session.user.id),
          inArray(userQuestionResponses.questionId, questionIds)
        )
      );
  } else if (tagIdsParam) {
    // Fetch responses for questions with specific tags
    const tagIds = tagIdsParam.split(",").filter(Boolean);
    
    if (tagIds.length === 0) {
      return new Response(
        JSON.stringify({ responses: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // First get question IDs with these tags
    const taggedQuestions = await db
      .select({ questionId: questionTagMappings.questionId })
      .from(questionTagMappings)
      .where(inArray(questionTagMappings.tagId, tagIds));

    const questionIds = taggedQuestions.map((q) => q.questionId);

    if (questionIds.length === 0) {
      return new Response(
        JSON.stringify({ responses: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    responses = await db
      .select({
        id: userQuestionResponses.id,
        userId: userQuestionResponses.userId,
        questionId: userQuestionResponses.questionId,
        response: userQuestionResponses.response,
        question: {
          id: internshipQuestions.id,
          questionText: internshipQuestions.questionText,
          questionType: internshipQuestions.questionType,
          options: internshipQuestions.options,
        },
      })
      .from(userQuestionResponses)
      .innerJoin(internshipQuestions, eq(userQuestionResponses.questionId, internshipQuestions.id))
      .where(
        and(
          eq(userQuestionResponses.userId, session.user.id),
          inArray(userQuestionResponses.questionId, questionIds)
        )
      );
  } else {
    // Fetch all user responses
    responses = await db
      .select({
        id: userQuestionResponses.id,
        userId: userQuestionResponses.userId,
        questionId: userQuestionResponses.questionId,
        response: userQuestionResponses.response,
        question: {
          id: internshipQuestions.id,
          questionText: internshipQuestions.questionText,
          questionType: internshipQuestions.questionType,
          options: internshipQuestions.options,
        },
      })
      .from(userQuestionResponses)
      .innerJoin(internshipQuestions, eq(userQuestionResponses.questionId, internshipQuestions.id))
      .where(eq(userQuestionResponses.userId, session.user.id));
  }

  return new Response(
    JSON.stringify({ responses }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

