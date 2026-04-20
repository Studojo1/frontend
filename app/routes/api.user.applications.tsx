import { desc, eq } from "drizzle-orm";
import db from "~/lib/db";
import { internshipApplications, internships } from "../../auth-schema";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.user.applications";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: internshipApplications.id,
      status: internshipApplications.status,
      createdAt: internshipApplications.createdAt,
      internshipTitle: internships.title,
      internshipCompany: internships.companyName,
    })
    .from(internshipApplications)
    .innerJoin(internships, eq(internshipApplications.internshipId, internships.id))
    .where(eq(internshipApplications.userId, session.user.id))
    .orderBy(desc(internshipApplications.createdAt))
    .limit(20);

  return Response.json({ applications: rows });
}
