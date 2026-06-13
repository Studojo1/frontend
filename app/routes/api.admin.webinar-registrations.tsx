import { getWebinarRegistrations, getWebinarRegistrationStats } from "~/lib/webinar.server";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.admin.webinar-registrations";

const ADMIN_EMAILS = [
  "admin@studojo.com",
  "jeremy@studojo.com",
  "jeremyabraham1411@gmail.com",
  "studojo@gmail.com",
];

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "200"), 1000);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const [registrations, stats] = await Promise.all([
    getWebinarRegistrations(limit, offset),
    getWebinarRegistrationStats(),
  ]);

  return Response.json({ registrations, stats });
}
