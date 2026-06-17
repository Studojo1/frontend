import type { Route } from "./+types/api.blog";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// GET /api/blog - Public blog list (only published posts)
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "12", 10);
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");
    const search = url.searchParams.get("search");

    const offset = (page - 1) * limit;

    // Parameterized WHERE built from `sql` fragments — every user value
    // (category/tag/search) is bound, not interpolated, so no SQL injection.
    let whereClause = sql`status = 'published'`;

    if (category) {
      whereClause = sql`${whereClause} AND ${category} = ANY(categories)`;
    }

    if (tag) {
      whereClause = sql`${whereClause} AND ${tag} = ANY(tags)`;
    }

    if (search) {
      const like = `%${search}%`;
      whereClause = sql`${whereClause} AND (title ILIKE ${like} OR excerpt ILIKE ${like} OR content ILIKE ${like})`;
    }

    const posts = await db.execute(
      sql`SELECT * FROM blog_posts WHERE ${whereClause} ORDER BY published_at DESC LIMIT ${limit} OFFSET ${offset}`
    );

    const countResult = await db.execute(
      sql`SELECT COUNT(*) as total FROM blog_posts WHERE ${whereClause}`
    );

    const total = parseInt((countResult.rows[0] as any)?.total || "0", 10);

    return Response.json({
      posts: posts.rows || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[api.blog] Error loading blog posts:", error);
    return Response.json(
      { 
        error: "Failed to load blog posts",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

