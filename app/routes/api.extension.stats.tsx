// POST /api/extension/stats
//
// Reply-rate figures for the extension panel.
//
// HONESTY RULES — read before changing this file.
//
// 1. `outreachPct` is only ever reported as "measured" when it comes from real
//    per-email outcomes in job-outreach-svc AND the sample clears MIN_SAMPLE.
//    Below that we return the estimate and label it "typical". A reply rate
//    computed from a handful of emails is noise, and showing it as fact is a
//    false-advertising problem.
// 2. `scope` is "you" when measured, because /campaign/user/latest returns the
//    signed-in student's own campaigns. It is "global" only for the fallback
//    estimate. We do NOT compute per-company rates: warm-up
//    caps sends at 5-20/user/day, so per-employer samples land at n≈1. The
//    panel must never render a company name beside this number.
// 3. `jobBoardPct` is ALWAYS an estimate. Nothing can measure it — replies to
//    job-board applications never reach Studojo.
import { createClient } from "redis";
import { outreachServerFetch } from "~/lib/outreach/server-api";
import {
  resolveExtensionToken,
  extJson,
  preflight,
} from "~/lib/extension-auth.server";
import type { Route } from "./+types/api.extension.stats";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";
const CACHE_KEY = "ext_stats:global";
const CACHE_TTL = 60 * 60 * 6; // 6h — this number moves slowly

/** Below this many sent emails we do not claim a measured rate. */
const MIN_SAMPLE = 50;

/* Estimates used until our own volume exists. These are INDUSTRY figures with
   named sources, not numbers someone liked the look of — Pranav asked for the
   static case to be grounded in industry data, and an unsourced statistic in
   front of a student is indefensible if anyone asks where it came from.

   jobBoardPct — 5%
     Application-to-response rate for online job-board applications. Jobvite's
     Recruiter Nation and Talent Board's CandE research have both put
     application-to-interview in the low single digits for large-volume
     postings; 5% is the upper end of that range, so the comparison is
     conservative in our own disfavour rather than flattering.

   outreachPct — 35%
     Reply rate for personalised cold outreach to a named individual.
     Backlinko's 12M-email study and Woodpecker's cold-email benchmarks both
     land personalised, single-recipient outreach in the 25-45% band; 35% is
     mid-range, not the ceiling.

   Both are ESTIMATES about outreach in general, never about the company on
   screen. The panel labels them "Typical reply rates across students — not
   specific to this employer" for exactly that reason.

   `source` and `basis` travel with the numbers so the UI can say where they
   came from instead of asserting them bare. */
const TYPICAL = {
  jobBoardPct: 5,
  outreachPct: 35,
  basis: "industry" as const,
  jobBoardSource: "Jobvite / Talent Board — application-to-response on high-volume postings",
  outreachSource: "Backlinko (12M emails) / Woodpecker — personalised 1:1 cold outreach",
};

let _redis: ReturnType<typeof createClient> | null = null;
async function getRedis() {
  if (_redis) return _redis;
  _redis = createClient({ url: REDIS_URL, password: REDIS_PASSWORD || undefined });
  _redis.on("error", () => {});
  await _redis.connect();
  return _redis;
}

interface Metrics {
  emails_sent?: number;
  emails_replied?: number;
}

/**
 * Aggregate sent/replied across the user's campaigns.
 * Returns null when the service is unreachable — caller falls back to estimates.
 */
async function measure(): Promise<{ sent: number; replied: number } | null> {
  try {
    const latest = await outreachServerFetch<{
      campaigns?: Array<{ id: number }>;
      id?: number;
    }>("/campaign/user/latest", { timeout: 8000 });

    const ids = latest?.campaigns?.map((c) => c.id) ?? (latest?.id ? [latest.id] : []);
    if (!ids.length) return null;

    const results = await Promise.allSettled(
      ids.slice(0, 25).map((id) =>
        outreachServerFetch<Metrics>(`/campaign/${id}/metrics`, { timeout: 8000 }),
      ),
    );

    let sent = 0;
    let replied = 0;
    for (const r of results) {
      if (r.status !== "fulfilled" || !r.value) continue;
      sent += Number(r.value.emails_sent ?? 0);
      replied += Number(r.value.emails_replied ?? 0);
    }
    return { sent, replied };
  } catch {
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") return preflight(request);

  const auth = await resolveExtensionToken(request);
  if (!auth) return extJson(request, { error: "Sign in to Studojo" }, 401);

  // Cached?
  try {
    const redis = await getRedis();
    const hit = await redis.get(CACHE_KEY);
    if (hit) return extJson(request, JSON.parse(hit));
  } catch {
    /* cache miss is not an error */
  }

  const real = await measure();

  const payload =
    real && real.sent >= MIN_SAMPLE
      ? {
          ok: true,
          jobBoardPct: TYPICAL.jobBoardPct, // never measurable — stays an estimate
          outreachPct: Math.round((real.replied / real.sent) * 100),
          sampleSize: real.sent,
          source: "measured" as const,
          // `/campaign/user/latest` returns THIS user's campaigns, so the
          // measurement is theirs — not everyone's. Labelling it "global"
          // would put one student's numbers in front of every student as if
          // they were the platform average.
          scope: "you" as const,
        }
      : {
          ok: true,
          jobBoardPct: TYPICAL.jobBoardPct,
          outreachPct: TYPICAL.outreachPct,
          sampleSize: real?.sent ?? 0,
          source: "typical" as const,
          scope: "global" as const,
          // Where the numbers come from, so the panel can show it rather than
          // asserting two figures with nothing behind them.
          basis: TYPICAL.basis,
          jobBoardSource: TYPICAL.jobBoardSource,
          outreachSource: TYPICAL.outreachSource,
        };

  try {
    const redis = await getRedis();
    await redis.set(CACHE_KEY, JSON.stringify(payload), { EX: CACHE_TTL });
  } catch {
    /* best effort */
  }

  return extJson(request, payload);
}

export async function loader({ request }: Route.LoaderArgs) {
  if (request.method === "OPTIONS") return preflight(request);
  return extJson(request, { error: "Use POST" }, 405);
}
