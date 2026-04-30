// Shared BullMQ queue clients — usable from both the web app and worker process
// Both connect to the same Redis instance; the worker pod is the consumer.

import { Queue } from "bullmq";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";

function redisConnection() {
  const url = new URL(REDIS_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port || "6379", 10),
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
    maxRetriesPerRequest: null,
  };
}

const connection = redisConnection();

export const outreachQueue = new Queue("outreach", { connection });
export const applyQueue    = new Queue("apply",    { connection });
export const jobDiscoveryQueue = new Queue("job-discovery", { connection });
