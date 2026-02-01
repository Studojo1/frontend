import type { Route } from "./+types/internships.$id";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// GET /api/company/internships/:id?token=xxx - Get internship and applications (token auth)
export async function loader({ params, request }: Route.LoaderArgs) {
  const { id } = params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Token required" }, { status: 401 });
  }

  // Validate token
  const tokenResult = await db.execute(
    sql`SELECT * FROM company_tokens WHERE token = ${token} LIMIT 1`
  );

  if (tokenResult.rows.length === 0) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const companyToken = tokenResult.rows[0] as any;

  // Check expiration
  if (companyToken.expires_at && new Date(companyToken.expires_at) < new Date()) {
    return Response.json({ error: "Token has expired" }, { status: 401 });
  }

  // Verify token is for this internship
  if (companyToken.internship_id !== id) {
    return Response.json({ error: "Token not valid for this internship" }, { status: 403 });
  }

  // Get internship
  const internshipResult = await db.execute(
    sql`SELECT * FROM internships WHERE id = ${id} LIMIT 1`
  );

  if (internshipResult.rows.length === 0) {
    return Response.json({ error: "Internship not found" }, { status: 404 });
  }

  const internship = internshipResult.rows[0] as any;

  // Get applications that this token can access
  const applicationIds = companyToken.application_ids as string[];
  const applicationsResult = await db.execute(
    sql`
      SELECT 
        ia.*,
        u.name as user_name,
        u.email as user_email,
        r.name as resume_name
      FROM internship_applications ia
      JOIN "user" u ON ia.user_id = u.id
      JOIN resumes r ON ia.resume_id = r.id
      WHERE ia.id = ANY(${applicationIds})
      ORDER BY ia.created_at DESC
    `
  );

  // Update used_at timestamp
  await db.execute(
    sql`UPDATE company_tokens SET used_at = NOW() WHERE token = ${token}`
  );

  return Response.json({
    internship: {
      id: internship.id,
      title: internship.title,
      company_name: internship.company_name,
      description: internship.description,
      requirements: internship.requirements,
    },
    applications: applicationsResult.rows.map((row: any) => ({
      id: row.id,
      user_name: row.user_name,
      user_email: row.user_email,
      resume_name: row.resume_name,
      resume_snapshot: row.resume_snapshot,
      status: row.status,
      created_at: row.created_at,
    })),
  });
}

