import { redirect } from "react-router";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import type { Route } from "./+types/go.$slug";

/** GET /go/:slug, the short form of a link built in the admin UTM builder.
 *
 * Short links exist so a tagged URL survives being pasted into LinkedIn,
 * WhatsApp or an Instagram bio, where long query strings get trimmed or look
 * like spam. The builder stores the destination and its utm_* values in
 * utm_campaigns; this route rebuilds the full URL, counts the click, and
 * redirects.
 *
 * A click is counted on the server, so it is recorded even when the landing
 * page's analytics never load (ad blockers, in-app browsers, a closed tab).
 */

const SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,79}$/;

// Link-preview fetchers open every URL pasted into a chat or post. Their hits
// are stored so nothing is silently dropped, but flagged so they never count
// as people.
const BOT_RE =
  /bot|crawler|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|linkedin|skype|embedly|vkshare|pinterest/i;

function isOurHost(host: string): boolean {
  return (
    host === "studojo.com" || host.endsWith(".studojo.com") ||
    host === "studojo.pro" || host.endsWith(".studojo.pro")
  );
}

let clicksTableReady = false;

async function recordClick(linkId: string, slug: string, request: Request) {
  if (!clicksTableReady) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS utm_link_clicks (
        id BIGSERIAL PRIMARY KEY,
        link_id TEXT NOT NULL,
        slug TEXT NOT NULL,
        is_bot BOOLEAN NOT NULL DEFAULT FALSE,
        referrer TEXT,
        user_agent TEXT,
        clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_utm_link_clicks_link
      ON utm_link_clicks (link_id, clicked_at)
    `);
    clicksTableReady = true;
  }
  const ua = (request.headers.get("user-agent") || "").slice(0, 400);
  const referrer = (request.headers.get("referer") || "").slice(0, 500) || null;
  await db.execute(sql`
    INSERT INTO utm_link_clicks (link_id, slug, is_bot, referrer, user_agent)
    VALUES (${linkId}, ${slug}, ${BOT_RE.test(ua)}, ${referrer}, ${ua || null})
  `);
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const slug = (params.slug || "").toLowerCase();
  if (!SLUG_RE.test(slug)) throw redirect("/");

  let row: Record<string, string | null> | undefined;
  try {
    const result = await db.execute(sql`
      SELECT id, base_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term
      FROM utm_campaigns WHERE slug = ${slug} LIMIT 1
    `);
    row = result.rows[0] as Record<string, string | null> | undefined;
  } catch (e) {
    console.error("[go] lookup failed:", e);
  }
  if (!row) throw redirect("/");

  let target: URL;
  try {
    target = new URL(row.base_url as string);
  } catch {
    throw redirect("/");
  }
  // Admin-created, but still never an open redirect.
  if (!isOurHost(target.hostname)) throw redirect("/");

  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = row[key];
    if (v) target.searchParams.set(key, v);
  }
  // Keep click ids the platform appended to the short link (Meta adds fbclid to
  // outbound links, Google adds gclid) so first-touch capture still sees them.
  const incoming = new URL(request.url).searchParams;
  for (const [k, v] of incoming) {
    if (!target.searchParams.has(k)) target.searchParams.set(k, v);
  }

  try {
    await recordClick(String(row.id), slug, request);
  } catch (e) {
    // A failed count must never cost the visitor the page.
    console.error("[go] click record failed:", e);
  }

  return redirect(target.toString(), { headers: { "Cache-Control": "no-store" } });
}
