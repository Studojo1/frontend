// Outreach campaign CRUD
// GET /api/autoapply/campaigns — list campaigns
// POST /api/autoapply/campaigns — create campaign
// PATCH /api/autoapply/campaigns — update status (pause/resume)
// DELETE /api/autoapply/campaigns — delete campaign

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { eq, and } from "drizzle-orm";
import db from "~/lib/db";
import { outreachCampaigns } from "../../auth-schema";
import type { Route } from "./+types/api.autoapply.campaigns";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await db
    .select()
    .from(outreachCampaigns)
    .where(eq(outreachCampaigns.userId, session.user.id))
    .orderBy(outreachCampaigns.createdAt);

  return Response.json({ campaigns });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  if (request.method === "POST") {
    const body = await request.json() as any;
    const { name, targetTitles, targetCompanies, connectionNote, messageTemplate, followUpTemplate } = body;

    if (!name) return Response.json({ error: "name required" }, { status: 400 });

    const [campaign] = await db.insert(outreachCampaigns).values({
      userId,
      name,
      targetTitles: targetTitles ?? [],
      targetCompanies: targetCompanies ?? [],
      connectionNote: connectionNote ?? null,
      messageTemplate: messageTemplate ?? null,
      followUpTemplate: followUpTemplate ?? null,
      status: "active",
    }).returning();

    return Response.json({ campaign });
  }

  if (request.method === "PATCH") {
    const body = await request.json() as any;
    const { id, status } = body;
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    const [updated] = await db
      .update(outreachCampaigns)
      .set({ status: status ?? "paused" })
      .where(and(eq(outreachCampaigns.id, id), eq(outreachCampaigns.userId, userId)))
      .returning();

    return Response.json({ campaign: updated });
  }

  if (request.method === "DELETE") {
    const { id } = await request.json() as any;
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    await db.delete(outreachCampaigns)
      .where(and(eq(outreachCampaigns.id, id), eq(outreachCampaigns.userId, userId)));

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
