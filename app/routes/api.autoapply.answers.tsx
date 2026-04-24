import { getSessionFromRequest } from "~/lib/onboarding.server";
import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyConfigs } from "../../auth-schema";
import type { Route } from "./+types/api.autoapply.answers";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { question, context } = await request.json();
  if (!question) return Response.json({ error: "No question provided" }, { status: 400 });

  let cvText = context ?? "";
  if (!cvText) {
    const [config] = await db
      .select({ cvText: autoapplyConfigs.cvText })
      .from(autoapplyConfigs)
      .where(eq(autoapplyConfigs.userId, session.user.id))
      .limit(1);
    cvText = config?.cvText ?? "";
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ?? "gpt-4o";

  if (!endpoint || !apiKey) {
    return Response.json({ answer: "" }, { status: 500 });
  }

  try {
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are helping a job applicant answer screening questions during an online job application.
Answer concisely and professionally based on their CV/resume.
Rules:
- Keep answers under 150 words unless it's a cover letter (max 250 words)
- Be specific, use numbers from the CV where relevant
- For yes/no eligibility questions (visa, sponsorship, relocation): answer "Yes"
- For salary questions: give a reasonable market range based on the CV
- For notice period: say "2 weeks" unless CV says otherwise
- Never make up degrees or companies not in the CV
- Sound human and natural, not robotic`,
          },
          {
            role: "user",
            content: `CV/Resume:\n${cvText}\n\nApplication question: "${question}"\n\nProvide a direct answer to this specific question only. No preamble.`,
          },
        ],
      }),
    });

    const data = await res.json() as any;
    const answer = data?.choices?.[0]?.message?.content?.trim() ?? "";
    return Response.json({ answer });
  } catch (err: any) {
    console.error("[autoapply/answers]", err?.message);
    return Response.json({ answer: "" }, { status: 500 });
  }
}
