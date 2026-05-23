import { eq, desc } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { applicationResumeUploads } from "../../auth-schema";
import type { Route } from "./+types/api.user.resume-uploads";

// GET /api/user/resume-uploads
//
// Returns the files this user has previously uploaded for internship
// applications, newest first. Powers the "use a previous resume" picker on the
// apply flow so candidates don't have to re-upload the same PDF for every job.
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: applicationResumeUploads.id,
      url: applicationResumeUploads.url,
      contentType: applicationResumeUploads.contentType,
      name: applicationResumeUploads.name,
      sizeBytes: applicationResumeUploads.sizeBytes,
      lastUsedAt: applicationResumeUploads.lastUsedAt,
    })
    .from(applicationResumeUploads)
    .where(eq(applicationResumeUploads.userId, session.user.id))
    .orderBy(desc(applicationResumeUploads.lastUsedAt))
    .limit(10);

  return Response.json({ uploads: rows });
}
