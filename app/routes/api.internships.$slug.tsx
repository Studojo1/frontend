import type { Route } from "./+types/api.internships.$slug";
import db from "~/lib/db";
import { sql } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { eq, and } from "drizzle-orm";
import { internshipApplications } from "../../auth-schema";

// GET /api/internships/:id - Get single internship (public) or handle questions/apply
// Note: Route is registered as :id but we handle both UUIDs and slugs
export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    // React Router passes it as 'id' from route definition, but we treat it as slug/UUID
    // The route is registered as :id, so params.id will contain the value
    const idOrSlug = params.id;
    if (!idOrSlug) {
      console.error("[api.internships.$slug] No id/slug parameter provided", { params });
      throw new Response("Internship ID or slug required", { status: 400 });
    }
    const url = new URL(request.url);
    
    // Debug logging
    console.log(`[api.internships.$slug] Request for idOrSlug: ${idOrSlug}, pathname: ${url.pathname}`);

    // Check if this is actually a questions request (UUID with /questions path)
    // React Router might match :id before :id/questions, so handle it here
    if (url.pathname.endsWith('/questions')) {
      // The idOrSlug param will be the UUID (React Router extracts it)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      if (isUuid) {
        // This is a UUID, handle as questions request
        const { eq, asc } = await import("drizzle-orm");
        const { internshipQuestions } = await import("../../auth-schema");
        
        const questions = await db
          .select()
          .from(internshipQuestions)
          .where(eq(internshipQuestions.internshipId, idOrSlug))
          .orderBy(asc(internshipQuestions.order));
        
        return Response.json({ questions });
      }
    }
    
    // Check if this is an apply request - if so, let the :id/apply route handle it
    if (url.pathname.endsWith('/apply')) {
      // Return 404 to let React Router try the next route
      throw new Response("Not found", { status: 404 });
    }

    // Check if it's a UUID - if so, look up by ID directly
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    let result;
    if (isUuid) {
      // Direct ID lookup
      result = await db.execute(
        sql.raw(`SELECT * FROM internships WHERE id = '${idOrSlug}' AND status = 'published' LIMIT 1`)
      );
    } else {
    // Decode URL-encoded characters and escape for SQL
      const decodedSlug = decodeURIComponent(idOrSlug);
    const escapedSlug = decodedSlug.replace(/'/g, "''").trim();
    
    // Try exact match first (case-sensitive)
      result = await db.execute(
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
          console.log(`[api.internships.$slug] Found internship with slug '${idOrSlug}' but status is '${internshipStatus}', not 'published'`);
          // Return a more helpful error message
          return Response.json(
            { 
              error: "Internship not found", 
              message: `Internship exists but status is '${internshipStatus}', not 'published'`,
              slug: idOrSlug,
              status: internshipStatus
            }, 
            { status: 404 }
          );
      }
      
        // Check all slugs for debugging
        const allSlugsResult = await db.execute(
          sql.raw(`SELECT slug, status FROM internships WHERE slug ILIKE '%test%' LIMIT 5`)
        );
        console.log(`[api.internships.$slug] No internship found with slug '${idOrSlug}'. Found ${allSlugsResult.rows.length} internships with 'test' in slug:`, allSlugsResult.rows);
        
        // Return helpful error for debugging
        return Response.json(
          { 
            error: "Internship not found",
            message: "No internship found with the provided slug",
            slug: idOrSlug,
            debug: {
              searchedSlug: escapedSlug,
              similarSlugs: allSlugsResult.rows.map((r: any) => ({ slug: r.slug, status: r.status }))
            }
          }, 
          { status: 404 }
        );
      }
    }
    
    // If UUID lookup failed, check if it exists with different status
    if (result.rows.length === 0 && isUuid) {
      const anyStatusResult = await db.execute(
        sql.raw(`SELECT id, status FROM internships WHERE id = '${idOrSlug}' LIMIT 1`)
      );
      
      if (anyStatusResult.rows.length > 0) {
        const internshipStatus = (anyStatusResult.rows[0] as any).status;
        return Response.json(
          { 
            error: "Internship not found", 
            message: `Internship exists but status is '${internshipStatus}', not 'published'`,
            id: idOrSlug,
            status: internshipStatus
          }, 
          { status: 404 }
        );
      }
      
      return Response.json(
        { 
          error: "Internship not found",
          message: "No internship found with the provided ID",
          id: idOrSlug
        }, 
        { status: 404 }
      );
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

    // Check if user has already applied (if authenticated)
    let hasApplied = false;
    let applicationId: string | null = null;
    
    try {
      const session = await getSessionFromRequest(request);
      if (session?.user?.id) {
        const [existingApplication] = await db
          .select()
          .from(internshipApplications)
          .where(
            and(
              eq(internshipApplications.internshipId, internship.id),
              eq(internshipApplications.userId, session.user.id)
            )
          )
          .limit(1);
        
        if (existingApplication) {
          hasApplied = true;
          applicationId = existingApplication.id;
        }
      }
    } catch (error) {
      // Don't fail the request if checking application status fails
      console.error("Failed to check application status:", error);
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
      hasApplied,
      applicationId: applicationId || undefined,
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

