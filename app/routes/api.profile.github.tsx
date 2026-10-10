import { getSessionFromRequest } from "~/lib/onboarding.server";
import { githubHandle } from "~/lib/talent-profile";
import { parseContributions, type Contributions } from "~/lib/github-contributions";
import type { Route } from "./+types/api.profile.github";

/**
 * GitHub contribution graph for the profile page: GET /api/profile/github?u=<handle>.
 *
 * GitHub serves the public graph as HTML at /users/<handle>/contributions with
 * no CORS headers, so the browser can't read it directly. Signed-in users only,
 * so this isn't an open proxy, and results are cached per pod for six hours.
 */

const TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; data: Contributions | null }>();

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const handle = githubHandle(new URL(request.url).searchParams.get("u"));
  if (!handle) return Response.json({ error: "Not a GitHub username" }, { status: 400 });

  const key = handle.toLowerCase();
  const hit = cache.get(key);
  let data: Contributions | null;
  if (hit && Date.now() - hit.at < TTL_MS) {
    data = hit.data;
  } else {
    try {
      const res = await fetch(`https://github.com/users/${encodeURIComponent(handle)}/contributions`, {
        headers: { "User-Agent": "studojo-profile", Accept: "text/html" },
        signal: AbortSignal.timeout(6000),
      });
      // 404 is a real answer (no such user), so cache it; other failures are not.
      if (res.status === 404) data = null;
      else if (!res.ok) return Response.json({ error: "GitHub is unavailable" }, { status: 502 });
      else data = parseContributions(await res.text());
    } catch {
      return Response.json({ error: "GitHub is unavailable" }, { status: 502 });
    }
    if (cache.size > 2000) cache.clear();
    cache.set(key, { at: Date.now(), data });
  }

  if (!data) return Response.json({ error: "No GitHub user with that name" }, { status: 404 });
  return Response.json(
    { handle, ...data },
    { headers: { "Cache-Control": "private, max-age=3600" } },
  );
}
