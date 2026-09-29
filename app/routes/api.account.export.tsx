// GET /api/account/export: "Download my data" on /settings.
//
// One file with everything Studojo holds for the signed-in user: job-outreach-svc's
// own export (fetched server-side, as the user) plus this app's tables
// (app/lib/account-export.server.ts). All or nothing: a file that silently
// lacks the outreach half would read as complete when it is not, so if either
// half fails the student gets an error and can try again.
import { collectAppData } from "~/lib/account-export.server";
import { exportFilename, stripSecrets } from "~/lib/account-export";
import { describeError } from "~/lib/error-detail";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { outreachServerFetch } from "~/lib/outreach/server-api";
import type { Route } from "./+types/api.account.export";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const userId = session.user.id;

  let outreach: unknown;
  let app: Record<string, unknown>;
  try {
    [outreach, app] = await Promise.all([
      outreachServerFetch("/account/export", { userId, timeout: 60_000 }),
      collectAppData(userId, session.user.email ?? ""),
    ]);
  } catch (err) {
    console.error("[account-export] failed for", userId, describeError(err, "unknown error"));
    return Response.json(
      { error: "We couldn't put your data together just now. Please try again in a minute." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const now = new Date();
  const file = stripSecrets({
    exported_at: now.toISOString(),
    user_id: userId,
    job_outreach: outreach,
    ...app,
  });

  return new Response(JSON.stringify(file, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFilename(now)}"`,
      "Cache-Control": "no-store",
    },
  });
}
