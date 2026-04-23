// SSE live feed: streams recent applications + outreach events to the dashboard
// GET /api/autoapply/stream

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { eq, desc } from "drizzle-orm";
import db from "~/lib/db";
import { jobQueue, outreachContacts, systemEvents } from "../../auth-schema";
import type { Route } from "./+types/api.autoapply.stream";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      try {
        // Send initial snapshot
        const [recentJobs, recentOutreach, warnings] = await Promise.all([
          db.select({
            id: jobQueue.id,
            company: jobQueue.company,
            roleTitle: jobQueue.roleTitle,
            location: jobQueue.location,
            platform: jobQueue.platform,
            status: jobQueue.status,
            matchScore: jobQueue.matchScore,
            appliedAt: jobQueue.appliedAt,
            createdAt: jobQueue.createdAt,
          })
            .from(jobQueue)
            .where(eq(jobQueue.userId, userId))
            .orderBy(desc(jobQueue.createdAt))
            .limit(50),

          db.select({
            id: outreachContacts.id,
            name: outreachContacts.name,
            title: outreachContacts.title,
            company: outreachContacts.company,
            status: outreachContacts.status,
            sequenceStep: outreachContacts.sequenceStep,
            lastActionAt: outreachContacts.lastActionAt,
          })
            .from(outreachContacts)
            .where(eq(outreachContacts.userId, userId))
            .orderBy(desc(outreachContacts.lastActionAt))
            .limit(20),

          db.select({
            eventType: systemEvents.eventType,
            createdAt: systemEvents.createdAt,
            metadata: systemEvents.metadata,
          })
            .from(systemEvents)
            .where(eq(systemEvents.userId, userId))
            .orderBy(desc(systemEvents.createdAt))
            .limit(10),
        ]);

        // Compute stats
        const stats = {
          applied: recentJobs.filter((j) => j.status === "applied").length,
          queued: recentJobs.filter((j) => j.status === "pending" || j.status === "processing").length,
          failed: recentJobs.filter((j) => j.status === "failed").length,
          skipped: recentJobs.filter((j) => j.status === "skipped").length,
          connected: recentOutreach.filter((o) => o.status === "accepted" || o.status === "messaged" || o.status === "replied").length,
          messaged: recentOutreach.filter((o) => o.status === "messaged" || o.status === "replied").length,
          replied: recentOutreach.filter((o) => o.status === "replied").length,
        };

        send({ type: "snapshot", jobs: recentJobs, outreach: recentOutreach, stats, warnings });

        // Poll for updates every 15 seconds
        let lastCheck = new Date();
        let ticks = 0;
        const maxTicks = 40; // ~10 minutes then close, client reconnects

        const interval = setInterval(async () => {
          ticks++;
          if (ticks >= maxTicks) {
            clearInterval(interval);
            send({ type: "reconnect" });
            controller.close();
            return;
          }

          try {
            const newJobs = await db.select({
              id: jobQueue.id,
              company: jobQueue.company,
              roleTitle: jobQueue.roleTitle,
              status: jobQueue.status,
              matchScore: jobQueue.matchScore,
              appliedAt: jobQueue.appliedAt,
            })
              .from(jobQueue)
              .where(eq(jobQueue.userId, userId))
              .orderBy(desc(jobQueue.createdAt))
              .limit(50);

            const newStats = {
              applied: newJobs.filter((j) => j.status === "applied").length,
              queued: newJobs.filter((j) => j.status === "pending" || j.status === "processing").length,
              failed: newJobs.filter((j) => j.status === "failed").length,
              skipped: newJobs.filter((j) => j.status === "skipped").length,
              connected: recentOutreach.filter((o) => o.status === "accepted").length,
              messaged: recentOutreach.filter((o) => o.status === "messaged").length,
              replied: recentOutreach.filter((o) => o.status === "replied").length,
            };

            send({ type: "update", stats: newStats, jobs: newJobs.slice(0, 5) });
            lastCheck = new Date();
          } catch {}
        }, 15_000);

        // Clean up on disconnect
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      } catch (err) {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
