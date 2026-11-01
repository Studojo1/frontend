// GET /api/account/export: "Download my data" on /settings (career-agent's settings link here too).
//
// One file with everything Studojo holds for the signed-in user (RELAUNCH, 2 Nov 2026; before, half of it came from
// job-outreach-svc, which is being removed): this app's tables (app/lib/account-export.server.ts: the sign-in
// account, support chat and tickets, attribution, report requests, API keys) and the product's own rows in the
// career_agent schema (app/lib/career-data.server.ts). All or nothing: if either half fails the student gets an
// error and can try again, never a file that silently lacks a part.
import { collectAppData } from "~/lib/account-export.server";
import { exportFilename, stripSecrets } from "~/lib/account-export";
import { CAREER_SECRET_COLUMNS } from "~/lib/career-data";
import { exportCareerData } from "~/lib/career-data.server";
import { describeError } from "~/lib/error-detail";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.account.export";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const userId = session.user.id;

  let career: Record<string, unknown[]>;
  let app: Record<string, unknown>;
  try {
    [career, app] = await Promise.all([exportCareerData(userId), collectAppData(userId, session.user.email ?? "")]);
  } catch (err) {
    console.error("[account-export] failed for", userId, describeError(err, "unknown error"));
    return Response.json(
      { error: "We couldn't put your data together just now. Please try again in a minute." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const now = new Date();
  const file = {
    ...stripSecrets({ exported_at: now.toISOString(), user_id: userId, ...app }),
    // The product's tables, keyed by table: a channel link code is a secret there too.
    studojo_agent: stripSecrets(career, CAREER_SECRET_COLUMNS),
  };

  return new Response(JSON.stringify(file, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFilename(now)}"`,
      "Cache-Control": "no-store",
    },
  });
}
