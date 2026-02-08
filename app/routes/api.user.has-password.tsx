import { and, eq } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { account } from "../../auth-schema";
import type { Route } from "./+types/api.user.has-password";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check if user has a credential (password) account
  const [credentialAccount] = await db
    .select()
    .from(account)
    .where(and(
      eq(account.userId, session.user.id),
      eq(account.providerId, "credential")
    ))
    .limit(1);

  const hasPassword = !!(
    credentialAccount &&
    credentialAccount.password &&
    credentialAccount.password.trim() !== ""
  );

  return new Response(
    JSON.stringify({ hasPassword }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

