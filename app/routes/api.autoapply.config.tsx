import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyConfigs } from "../../auth-schema";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.autoapply.config";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [config] = await db
    .select()
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.userId, session.user.id))
    .limit(1);

  return Response.json({ config: config ?? null });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (request.method === "DELETE") {
    await db.delete(autoapplyConfigs).where(eq(autoapplyConfigs.userId, session.user.id));
    return Response.json({ ok: true });
  }

  const body = await request.json();
  const { cvText, roles, locations, platforms, workType, dailyLimit, status } = body;

  const [existing] = await db
    .select({ id: autoapplyConfigs.id })
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.userId, session.user.id))
    .limit(1);

  let config;
  if (existing) {
    [config] = await db
      .update(autoapplyConfigs)
      .set({ cvText, roles, locations, platforms, workType, dailyLimit, status: status ?? "active", updatedAt: new Date() })
      .where(eq(autoapplyConfigs.userId, session.user.id))
      .returning();
  } else {
    [config] = await db
      .insert(autoapplyConfigs)
      .values({ userId: session.user.id, cvText, roles, locations, platforms, workType, dailyLimit })
      .returning();
  }

  return Response.json({ config });
}
