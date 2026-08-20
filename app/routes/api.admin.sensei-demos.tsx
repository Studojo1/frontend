import { getSenseiDemoRequests } from "~/lib/sensei-demo.server";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.admin.sensei-demos";

// Same allowlist as the other admin endpoints. Kept literal rather than shared
// so this route cannot be widened by a change somewhere else.
const ADMIN_EMAILS = ["admin@studojo.com", "jeremy@studojo.com", "jeremyabraham1411@gmail.com"];

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const requests = await getSenseiDemoRequests(limit, offset);
  return Response.json({ requests });
}
