import { findStudentPage } from "~/lib/student-page.server";
import { sanitizeLinkedIn } from "~/lib/student-page-linkedin";
import type { Route } from "./+types/profile_.$slug_.photo";

/**
 * /profile/:slug/photo: the photo on a student's public page as a real image,
 * for link previews (og:image cannot be a data: URL). Same rules as the page:
 * a 404 unless the link is on and the student chose to show their photo.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const slug = (params.slug ?? "").toLowerCase();
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return new Response("Not found", { status: 404 });
  const found = await findStudentPage(slug);
  const li = sanitizeLinkedIn(found?.row.talent?.linkedin);
  const m = found?.page.visibility?.link && li?.usePhoto ? li.photo?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/) : null;
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" },
  });
}
