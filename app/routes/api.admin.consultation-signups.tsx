import { getConsultationSignups, getConsultationSignupStats } from "~/lib/consultation.server";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.admin.consultation-signups";

const ADMIN_EMAILS = ["admin@studojo.com", "jeremy@studojo.com", "jeremyabraham1411@gmail.com"];

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const [signups, stats] = await Promise.all([
    getConsultationSignups(limit, offset),
    getConsultationSignupStats(),
  ]);

  return Response.json({ signups, stats });
}
