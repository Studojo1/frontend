import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { internshipApplications, internships } from "../../auth-schema";
import type { Route } from "./+types/api.internships.applications";

// GET /api/internships/applications - Get user's applications (authenticated)
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const userApplications = await db
    .select({
      id: internshipApplications.id,
      internshipId: internshipApplications.internshipId,
      status: internshipApplications.status,
      createdAt: internshipApplications.createdAt,
      internship: {
        title: internships.title,
        companyName: internships.companyName,
        slug: internships.slug,
      },
    })
    .from(internshipApplications)
    .innerJoin(internships, eq(internshipApplications.internshipId, internships.id))
    .where(eq(internshipApplications.userId, session.user.id))
    .orderBy(internshipApplications.createdAt);

  return new Response(
    JSON.stringify({
      applications: userApplications.map((app) => ({
        id: app.id,
        internshipId: app.internshipId,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
        internship: {
          title: app.internship.title,
          companyName: app.internship.companyName,
          slug: app.internship.slug,
        },
      })),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

