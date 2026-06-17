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

  // Build the WHERE clause from parameterized sql fragments. Using the `sql`
  // tagged template (not sql.raw) makes every interpolated value a bound
  // parameter, so user-supplied `status`/`search` cannot inject SQL.
  // Exclude scraper-inserted rows — map data only, not for the dojo listing.
  let whereClause = sql`status = ${status} AND (created_by IS NULL OR created_by != 'scraper-system')`;

  if (search) {
    const like = `%${search}%`;
    whereClause = sql`${whereClause} AND (title ILIKE ${like} OR company_name ILIKE ${like} OR description ILIKE ${like})`;
  }

  const internships = await db.execute(
    sql`SELECT * FROM internships WHERE ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  );

  const countResult = await db.execute(
    sql`SELECT COUNT(*) as total FROM internships WHERE ${whereClause}`
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

