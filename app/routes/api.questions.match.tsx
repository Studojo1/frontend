import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { internshipQuestions } from "../../auth-schema";
import { sql } from "drizzle-orm";
import type { Route } from "./+types/api.questions.match";

// Simple Levenshtein distance calculation for text similarity
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[len1][len2];
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

function calculateSimilarity(text1: string, text2: string): number {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  if (maxLength === 0) return 1.0;
  
  return 1 - distance / maxLength;
}

// POST /api/questions/match - Match question text and return similar questions
export async function action({ request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
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

  const { question_text } = body as { question_text?: unknown };

  if (!question_text || typeof question_text !== "string") {
    return new Response(
      JSON.stringify({ error: "question_text is required and must be a string" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Get all existing questions
  const allQuestions = await db
    .select()
    .from(internshipQuestions);

  // Calculate similarity scores
  const matches = allQuestions
    .map((q) => {
      const similarity = calculateSimilarity(question_text, q.questionText);
      return {
        id: q.id,
        internshipId: q.internshipId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        required: q.required,
        order: q.order,
        tagId: q.tagId,
        similarity,
      };
    })
    .filter((m) => m.similarity >= 0.8) // 80% similarity threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10); // Top 10 matches

  return new Response(
    JSON.stringify({
      matches,
      query: question_text,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

