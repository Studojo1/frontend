/**
 * The one read the main site makes for a launched project page (contract
 * section 2): career-agent writes career_agent.career_project_launches at
 * launch; this site only ever reads a live row by (handle, slug). No row, any
 * other status, or no such table (production until career-agent ships there:
 * Postgres 42P01) is null, and the route answers 404.
 */
import { sql } from "drizzle-orm";
import db from "~/lib/db";

let missingTableLogged = false;

export async function findLaunch(handle: string, slug: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await db.execute<Record<string, unknown>>(sql`
      SELECT id::int AS id, handle, slug, title, summary, theme, fonts, blocks, meta, version,
             to_char(published_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS published_on,
             (noindex_until IS NOT NULL AND noindex_until > now()) AS noindex
        FROM career_agent.career_project_launches
       WHERE handle = ${handle} AND slug = ${slug} AND status = 'live'`);
    return res.rows[0] ?? null;
  } catch (e) {
    const code = (e as { code?: string; cause?: { code?: string } })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
    if (code === "42P01" || code === "3F000") {
      if (!missingTableLogged) {
        missingTableLogged = true;
        console.warn("[project-pages] career_agent.career_project_launches is not here yet, so every /<handle>/<slug> is a 404");
      }
    } else {
      console.error("[project-pages] lookup failed:", (e as Error)?.message ?? e);
    }
    return null;
  }
}
