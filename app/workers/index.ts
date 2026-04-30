// AutoApply worker entry point
// Run with: bun app/workers/index.ts
// This process handles all BullMQ queues — runs in autoapply-worker pod

import { Queue, Worker } from "bullmq";
import { eq, and, lt, sql } from "drizzle-orm";
import db from "~/lib/db";
import {
  autoapplyConfigs,
  jobQueue,
  outreachContacts,
  userLinkedinSessions,
} from "../../auth-schema";
import { discoverJobsForUser } from "./job-discovery";
import { applyToJob } from "./apply-worker";
import { runOutreachStep, withdrawStaleInvitations } from "./outreach-worker";
import { checkFleetHealth, incrementWarmupDay, logEvent } from "./safety-manager";
import { pollAllUsers } from "./acceptance-poller";
import {
  outreachQueue,
  applyQueue,
  jobDiscoveryQueue,
} from "~/lib/queues.server";

// ── Redis connection (worker-only — for maintenanceQueue + Workers) ───────────

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";

function redisOpts() {
  const url = new URL(REDIS_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port || "6379", 10),
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
    maxRetriesPerRequest: null,
  };
}

const connection = redisOpts();

// ── Queue definitions ─────────────────────────────────────────────────────────
// outreachQueue / applyQueue / jobDiscoveryQueue imported from queues.server
// (shared with web app so API routes can enqueue directly)

export { outreachQueue, applyQueue, jobDiscoveryQueue };
export const maintenanceQueue = new Queue("maintenance", { connection });

// ── Workers ───────────────────────────────────────────────────────────────────

const discoveryWorker = new Worker(
  "job-discovery",
  async (job) => {
    const { userId } = job.data;
    console.log(`[worker] job-discovery for user ${userId}`);
    await discoverJobsForUser(userId);

    // After discovery, enqueue pending jobs for applying
    const pending = await db
      .select({ id: jobQueue.id })
      .from(jobQueue)
      .where(and(eq(jobQueue.userId, userId), eq(jobQueue.status, "pending")))
      .limit(5); // batch 5 at a time

    for (const j of pending) {
      await applyQueue.add("apply", { jobId: j.id }, {
        attempts: 2,
        backoff: { type: "exponential", delay: 60_000 },
        delay: Math.random() * 30_000, // stagger up to 30s
      });
    }
  },
  { connection, concurrency: 3 }
);

const applyWorker = new Worker(
  "apply",
  async (job) => {
    const { jobId } = job.data;
    console.log(`[worker] apply job ${jobId}`);
    const result = await applyToJob(jobId);
    console.log(`[worker] apply result:`, result);
    return result;
  },
  { connection, concurrency: 2 } // 2 simultaneous browsers
);

const outreachWorker = new Worker(
  "outreach",
  async (job) => {
    const { contactId } = job.data;
    console.log(`[worker] outreach contact ${contactId}`);
    const result = await runOutreachStep(contactId);
    console.log(`[worker] outreach result:`, result);
    return result;
  },
  { connection, concurrency: 1 } // sequential for safety
);

const maintenanceWorker = new Worker(
  "maintenance",
  async (job) => {
    const { task, userId } = job.data;
    switch (task) {
      case "fleet_health_check":
        await checkFleetHealth();
        break;
      case "schedule_discovery":
        await scheduleAllActiveUsers();
        break;
      case "schedule_outreach":
        await scheduleOutreachSteps();
        break;
      case "withdraw_stale":
        if (userId) await withdrawStaleInvitations(userId);
        break;
      case "increment_warmup":
        await incrementAllWarmupDays();
        break;
      case "poll_acceptances":
        await pollAllUsers();
        break;
    }
  },
  { connection, concurrency: 1 }
);

// ── Scheduled jobs (cron-style via BullMQ repeat) ─────────────────────────────

async function setupSchedules() {
  // Job discovery every 6 hours for all active users
  await maintenanceQueue.add(
    "schedule_discovery",
    { task: "schedule_discovery" },
    { repeat: { pattern: "0 */6 * * *" }, jobId: "schedule_discovery" }
  );

  // Fleet health check every hour
  await maintenanceQueue.add(
    "fleet_health_check",
    { task: "fleet_health_check" },
    { repeat: { pattern: "0 * * * *" }, jobId: "fleet_health_check" }
  );

  // Schedule outreach steps every 4 hours
  await maintenanceQueue.add(
    "schedule_outreach",
    { task: "schedule_outreach" },
    { repeat: { pattern: "0 */4 * * *" }, jobId: "schedule_outreach" }
  );

  // Acceptance poller every 2 hours — checks Voyager API for new connections
  await maintenanceQueue.add(
    "poll_acceptances",
    { task: "poll_acceptances" },
    { repeat: { pattern: "0 */2 * * *" }, jobId: "poll_acceptances" }
  );

  // Daily warmup increment at midnight UTC
  await maintenanceQueue.add(
    "increment_warmup",
    { task: "increment_warmup" },
    { repeat: { pattern: "0 0 * * *" }, jobId: "increment_warmup" }
  );

  console.log("[worker] Schedules registered");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function scheduleAllActiveUsers() {
  const active = await db
    .select({ userId: autoapplyConfigs.userId })
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.status, "active"));

  for (const { userId } of active) {
    await jobDiscoveryQueue.add("discover", { userId }, {
      attempts: 2,
      backoff: { type: "exponential", delay: 120_000 },
      delay: Math.random() * 60_000, // stagger across 1 minute
    });
  }
  console.log(`[worker] Scheduled discovery for ${active.length} active users`);
}

async function scheduleOutreachSteps() {
  const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

  // Step 1 (message) — accepted connections from 3+ days ago, not yet messaged
  const toMessage = await db
    .select({ id: outreachContacts.id })
    .from(outreachContacts)
    .where(and(
      eq(outreachContacts.status, "accepted"),
      eq(outreachContacts.sequenceStep, 1),
      lt(outreachContacts.connectedAt, threeDaysAgo)
    ))
    .limit(50);

  // Step 2 (follow-up) — messaged 7+ days ago, no reply
  const toFollowUp = await db
    .select({ id: outreachContacts.id })
    .from(outreachContacts)
    .where(and(
      eq(outreachContacts.status, "messaged"),
      eq(outreachContacts.replied, false),
      eq(outreachContacts.sequenceStep, 2),
      lt(outreachContacts.lastActionAt, sevenDaysAgo)
    ))
    .limit(50);

  for (const { id } of [...toMessage, ...toFollowUp]) {
    await outreachQueue.add("outreach", { contactId: id }, {
      attempts: 2,
      delay: Math.random() * 120_000,
    });
  }
}

async function incrementAllWarmupDays() {
  await db.execute(sql`
    UPDATE user_linkedin_sessions
    SET warmup_day = LEAST(warmup_day + 1, 15)
    WHERE is_active = true
  `);
  console.log("[worker] Incremented warmup day for all active sessions");
}

// ── Error handling ────────────────────────────────────────────────────────────

for (const worker of [discoveryWorker, applyWorker, outreachWorker, maintenanceWorker]) {
  worker.on("failed", (job, err) => {
    console.error(`[worker] ${worker.name} job ${job?.id} failed:`, err?.message, err?.stack?.split("\n")[1]);
    logEvent("worker_error", job?.data?.userId ?? null, {
      worker: worker.name,
      jobId: job?.id,
      error: err?.message?.slice(0, 200),
    }).catch(() => {});
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("[worker] AutoApply worker starting...");
  console.log(`[worker] Redis: ${REDIS_URL.replace(/:[^:@]+@/, ":***@")}`);

  await setupSchedules();

  // Immediate first-run discovery
  await scheduleAllActiveUsers();

  console.log("[worker] Ready — listening for jobs");
}

main().catch((err) => {
  console.error("[worker] Fatal startup error:", err);
  process.exit(1);
});
