import type { Route } from "./+types/api.internships.$slug";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// GET /api/internships/:slug - Get single internship (public)
export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const { slug } = params;

    // Decode URL-encoded characters and escape for SQL
    const decodedSlug = decodeURIComponent(slug);
    const escapedSlug = decodedSlug.replace(/'/g, "''").trim();
    
    // Try exact match first (case-sensitive)
    let result = await db.execute(
      sql.raw(`SELECT * FROM internships WHERE slug = '${escapedSlug}' AND status = 'published' LIMIT 1`)
    );

    // If not found, try case-insensitive match
    if (result.rows.length === 0) {
      result = await db.execute(
        sql.raw(`SELECT * FROM internships WHERE LOWER(slug) = LOWER('${escapedSlug}') AND status = 'published' LIMIT 1`)
      );
    }

    // If still not found, check if internship exists with different status
    if (result.rows.length === 0) {
      const anyStatusResult = await db.execute(
        sql.raw(`SELECT slug, status FROM internships WHERE LOWER(slug) = LOWER('${escapedSlug}') LIMIT 1`)
      );
      
      if (anyStatusResult.rows.length > 0) {
        const internshipStatus = (anyStatusResult.rows[0] as any).status;
        throw new Response(`Internship found but status is '${internshipStatus}', not 'published'`, { status: 404 });
      }
      
      throw new Response("Internship not found", { status: 404 });
    }

    const internship = result.rows[0] as any;

    // Increment view count (don't let this fail the request)
    try {
      await db.execute(
        sql`UPDATE internships SET view_count = view_count + 1 WHERE id = ${internship.id}`
      );
    } catch (error) {
      // Continue anyway - don't fail the request
      console.error("Failed to increment view count:", error);
    }

    // Ensure all Date objects and other non-serializable data are properly converted
    const serializedInternship = {
      id: String(internship.id),
      title: String(internship.title),
      company_name: String(internship.company_name),
      description: String(internship.description),
      requirements: String(internship.requirements),
      location: String(internship.location),
      duration: String(internship.duration),
      stipend: String(internship.stipend),
      application_deadline: internship.application_deadline ? new Date(internship.application_deadline).toISOString() : null,
      slug: String(internship.slug),
      view_count: Number(internship.view_count) || 0,
      click_count: Number(internship.click_count) || 0,
      application_count: Number(internship.application_count) || 0,
      created_at: internship.created_at ? new Date(internship.created_at).toISOString() : new Date().toISOString(),
      updated_at: internship.updated_at ? new Date(internship.updated_at).toISOString() : new Date().toISOString(),
    };

    return Response.json({ internship: serializedInternship });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error(`[api.internships.$slug] Loader error:`, error);
    throw new Response("Internal server error", { status: 500 });
  }
}

