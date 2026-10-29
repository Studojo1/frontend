// EMAIL-PAUSE, 29 Oct 2026. The owner's order, word for word: "kill all the
// emails being sent by us to a user now, and the internal team emails as well;
// the only emails should be the ones the students send to hiring managers".
//
// Every email this app sends by itself is held while this returns true:
// support ticket mail (gmail-direct.server.ts), the LinkedIn connect email and
// the internship application notification (notifications.server.ts; it goes
// to INTERNSHIP_APPLICATIONS_NOTIFY_EMAIL, the team inbox) and the MCP ops
// alert (mcp/errors.server.ts).
//
// Paused by default. An unset EMAILS_PAUSED keeps them held, so any redeploy
// stays paused without a workflow change. Only EMAILS_PAUSED=0 sends again.
//
// Account emails (sign-in codes, verification, password reset) live in the
// emailer service, paused there.
export function emailsPaused(): boolean {
  return (process.env.EMAILS_PAUSED ?? "").trim() !== "0";
}
