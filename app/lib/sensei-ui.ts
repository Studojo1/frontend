/**
 * Which look the Sensei workspace gets on a host.
 *
 * The workspace (app/routes/bob.tsx) has two looks drawn from the same code: the
 * original one, and the new light one first shown at studojo.com/sensei-demo.
 * The new look is switched on per host, here and nowhere else. bob.tsx on its own
 * always draws the original look, so a host that is not listed below keeps it.
 * That is what stops production (app.studojo.com) from picking the new look up by
 * accident when bob.tsx is promoted.
 *
 * To put the new look on production: add "app.studojo.com" to NEW_UI_HOSTS.
 * To go back to the original look on the test app: remove "app.studojo.pro".
 * <host>/oldui always shows the original look (app/routes/oldui.tsx).
 *
 * Pure, for tests.
 */
export type SenseiUi = "new" | "old";

export const NEW_UI_HOSTS: readonly string[] = ["app.studojo.pro"];

function bareHost(host: string | null | undefined): string {
  return (host || "").toLowerCase().trim().split(":")[0];
}

/** Is this host the Sensei workspace (app.studojo.com, app.studojo.pro)? */
export function isSenseiAppHost(host: string | null | undefined): boolean {
  return bareHost(host).startsWith("app.studojo.");
}

export function senseiUi(host: string | null | undefined): SenseiUi {
  return NEW_UI_HOSTS.includes(bareHost(host)) ? "new" : "old";
}
