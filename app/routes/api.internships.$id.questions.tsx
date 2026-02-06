import { eq, asc, sql } from "drizzle-orm";
import db from "~/lib/db";
import { internshipQuestions, internships } from "../../auth-schema";
import type { Route } from "./+types/api.internships.$id.questions";

// GET /api/internships/:id/questions - Get questions for an internship
export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

  if (!id) {
    return Response.json({ error: "Internship ID required" }, { status: 400 });
  }

  // Check if id is a UUID (36 chars with dashes) or a slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let questions;
  if (isUuid) {
    // Direct ID lookup
    questions = await db
      .select()
      .from(internshipQuestions)
      .where(eq(internshipQuestions.internshipId, id))
      .orderBy(asc(internshipQuestions.order));
  } else {
    // Slug lookup - need to get internship ID first
    const internshipResult = await db
      .select({ id: internships.id })
      .from(internships)
      .where(eq(internships.slug, id))
      .limit(1);
    
    if (internshipResult.length === 0) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }
    
    const internshipId = internshipResult[0].id;
    
    questions = await db
      .select()
      .from(internshipQuestions)
      .where(eq(internshipQuestions.internshipId, internshipId))
      .orderBy(asc(internshipQuestions.order));
  }

  // Transform camelCase to snake_case to match frontend expectations
  const transformedQuestions = questions.map((q: any) => {
    // Debug: log raw question data
    console.log("[api.internships.$id.questions] Raw question from DB:", {
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      hasQuestionText: !!q.questionText,
      questionTextType: typeof q.questionText,
      allKeys: Object.keys(q),
    });

    // Ensure options is properly parsed (Drizzle returns JSONB as parsed object/array)
    let parsedOptions: string[] | null = null;
    if (q.options) {
      if (typeof q.options === "string") {
        try {
          parsedOptions = JSON.parse(q.options);
        } catch {
          // If parsing fails, treat as array with single string
          parsedOptions = [q.options];
        }
      } else if (Array.isArray(q.options)) {
        parsedOptions = q.options;
      } else {
        // If it's an object, try to convert to array
        parsedOptions = Object.values(q.options) as string[];
      }
    }

    // Get questionText - try multiple possible field names
    const questionText = q.questionText || q.question_text || "";

    // Debug: log if questionText is missing
    if (!questionText) {
      console.error("[api.internships.$id.questions] Question missing questionText:", {
        id: q.id,
        questionText: q.questionText,
        question_text: q.question_text,
        questionType: q.questionType,
        allFields: Object.keys(q),
        rawQuestion: q,
      });
    }

    return {
      id: q.id,
      internship_id: q.internshipId || q.internship_id,
      question_text: questionText,
      question_type: q.questionType || q.question_type || "text",
      options: parsedOptions,
      required: q.required ?? false,
      order: q.order ?? 0,
      tag_id: q.tagId || q.tag_id || null,
      created_at: q.createdAt?.toISOString() || q.created_at || null,
      updated_at: q.updatedAt?.toISOString() || q.updated_at || null,
    };
  });

  console.log("[api.internships.$id.questions] Transformed questions:", transformedQuestions.map(q => ({
    id: q.id,
    question_text: q.question_text,
    question_type: q.question_type,
  })));

  return Response.json({ questions: transformedQuestions });
}

