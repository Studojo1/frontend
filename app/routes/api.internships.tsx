import type { Route } from "./+types/api.internships";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// GET /api/internships - Public internship list (only published)
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "12", 10);
  const status = url.searchParams.get("status") || "published";
  const search = url.searchParams.get("search");

  const offset = (page - 1) * limit;

  // Build query with proper parameterization
  let whereConditions: string[] = [`status = '${status}'`];
  
  if (search) {
    const escapedSearch = search.replace(/'/g, "''");
    whereConditions.push(`(title ILIKE '%${escapedSearch}%' OR company_name ILIKE '%${escapedSearch}%' OR description ILIKE '%${escapedSearch}%')`);
  }

  const whereClause = whereConditions.join(" AND ");

  const internships = await db.execute(
    sql.raw(`SELECT * FROM internships WHERE ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`)
  );

  const countResult = await db.execute(
    sql.raw(`SELECT COUNT(*) as total FROM internships WHERE ${whereClause}`)
  );

  const total = parseInt((countResult.rows[0] as any).total, 10);

  return Response.json({
    internships: internships.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

