/**
 * Which look the Sensei apps get on a host.
 *
 * The workspace (app/routes/bob.tsx) and the team dashboard
 * (app/routes/dashboard.tsx) each have two looks drawn from the same code: the
 * original one, and the new light one first shown at studojo.com/sensei-demo.
 * The new look is switched on per host, here and nowhere else. Each of those two
 * files on its own always draws the original look, so a host that is not listed
 * below keeps it. That is what stops production (app.studojo.com,
 * dashboard.studojo.com) from picking the new look up by accident when one of
 * the files is promoted.
 *
 * To put the new look on production: add the production host to NEW_UI_HOSTS.
 * To go back to the original look on a test host: remove it from the list.
 * <host>/oldui always shows the original look (app/routes/oldui.tsx).
 *
 * Pure, for tests.
 */
export type SenseiUi = "new" | "old";

export const NEW_UI_HOSTS: readonly string[] = ["app.studojo.pro", "dashboard.studojo.pro"];

function bareHost(host: string | null | undefined): string {
  return (host || "").toLowerCase().trim().split(":")[0];
}

/** Which Sensei app a host serves at its root, if any. */
export function senseiHostKind(host: string | null | undefined): "workspace" | "dashboard" | null {
  const h = bareHost(host);
  if (h.startsWith("app.studojo.")) return "workspace";
  if (h.startsWith("dashboard.studojo.")) return "dashboard";
  return null;
}

/** Is this host the Sensei workspace (app.studojo.com, app.studojo.pro)? */
export function isSenseiAppHost(host: string | null | undefined): boolean {
  return senseiHostKind(host) === "workspace";
}

export function senseiUi(host: string | null | undefined): SenseiUi {
  return NEW_UI_HOSTS.includes(bareHost(host)) ? "new" : "old";
}
