import { saveConsultationSignup } from "~/lib/consultation.server";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.consultation-signup";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { targetRole, biggestChallenge, timeline } = body;

  if (!targetRole || !biggestChallenge || !timeline) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const session = await getSessionFromRequest(request).catch(() => null);

  await saveConsultationSignup({
    userId: session?.user?.id,
    email: session?.user?.email,
    targetRole,
    biggestChallenge,
    timeline,
  });

  return Response.json({ ok: true });
}
