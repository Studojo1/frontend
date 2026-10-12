/**
 * The background worker that turns queued /pbadmin jobs into posts.
 *
 * Runs inside the web pods: kickPbRunner() starts a few worker loops in this
 * process, each loop claims jobs from Postgres until none are left, then
 * exits. All job state lives in the database, so a deploy or a crash loses
 * nothing: a job whose pod died stops heartbeating, goes stale after a few
 * minutes, and the next loop on any pod claims it again.
 *
 * The rules that keep two replicas and pod restarts safe:
 *   - Every write after a claim goes through the lease-guarded store calls
 *     (heartbeatJob, completeJob, failJob) with this loop's worker id. If one
 *     reports the lease is gone, the pipeline is aborted and its work dropped.
 *   - Heartbeats run every 30 s, and the stale window is 4 minutes, well
 *     above the slowest single model call (90 s).
 *   - No database transaction is held across a model call.
 *   - A loop catches everything. Nothing here can crash the process.
 */
import { hostname } from "node:os";
import { randomBytes } from "node:crypto";
import { describeError } from "~/lib/error-detail";
import { hookSignals, playbookPrompt, voiceSamples } from "~/lib/content/store.server";
import { generatePbPosts, PbPipelineError, type PbCorpus } from "./pipeline.server";
import {
  claimNextJob,
  cleanJobError,
  cohortRecentPosts,
  completeJob,
  failJob,
  hasActiveJobs,
  heartbeatJob,
  pastPostsForStudent,
  releaseJob,
  type ClaimedJob,
} from "./store.server";
import { deploymentAllowsPb } from "./access.server";
import type { NewPbPost, PbStep } from "./model";

const HEARTBEAT_MS = 30_000;
/** A job that has not finished in this long is stopped and failed. */
const TIMEOUT_MINUTES = 8;
const JOB_TIMEOUT_MS = TIMEOUT_MINUTES * 60_000;
const CORPUS_TTL_MS = 10 * 60_000;
/**
 * With nothing to claim but jobs still active somewhere (a job waiting out
 * its retry delay, or one running on a pod that may have died), a loop
 * checks back this often, up to MAX_IDLE_POLLS times, so those jobs are
 * picked up without anyone reloading /pbadmin. A kick wakes it early.
 */
const IDLE_POLL_MS = 20_000;
const MAX_IDLE_POLLS = 45;
/** Matches the store: claims after which a job is failed instead of retried. */
const MAX_ATTEMPTS = 3;
/** About two minutes in all, well inside the 4 minute stale window: a database restart should not cost the posts. */
const SAVE_RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000, 60_000];
const DEFAULT_LINK = "https://studojo.com/dojos/internships";

type RunnerState = {
  loops: number;
  corpus: { at: number; value: Promise<PbCorpus> } | null;
  /** Idle loops waiting to check the queue again; a kick wakes them. */
  wakers: Set<() => void>;
  /** Set on SIGTERM: no new claims, and jobs in flight go back to the queue. */
  stopping: boolean;
  /** The abort controller of every job running on this pod. */
  active: Set<AbortController>;
  hooked: boolean;
  booted: boolean;
};

// Kept on globalThis so a dev-server module reload cannot double the loops.
const holder = globalThis as typeof globalThis & { __studojoPbRunner?: RunnerState };
const state: RunnerState = (holder.__studojoPbRunner ??= {
  loops: 0,
  corpus: null,
  wakers: new Set(),
  stopping: false,
  active: new Set(),
  hooked: false,
  booted: false,
});
state.wakers ??= new Set();
state.active ??= new Set();

/**
 * A deploy sends SIGTERM, then kills the pod 30 seconds later. Jobs take
 * minutes, so a job still running then would sit leased for the whole stale
 * window and burn an attempt. Instead: stop claiming, abort what is running,
 * and hand it straight back to the queue for a pod that is staying.
 * react-router-serve keeps its own SIGTERM handler (it closes the server);
 * this one only adds to it.
 */
if (!state.hooked) {
  state.hooked = true;
  process.once("SIGTERM", () => {
    state.stopping = true;
    for (const c of Array.from(state.active)) c.abort(new Error("Shutting down."));
    for (const wake of Array.from(state.wakers)) wake();
  });
}

/** PB_CONCURRENCY loops per pod, default 1, at most 2: each pod has a 250m CPU limit. */
function concurrency(): number {
  const n = Number.parseInt(process.env.PB_CONCURRENCY ?? "", 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(2, Math.max(1, n));
}

function newWorkerId(): string {
  let host = "pod";
  try {
    host = hostname() || "pod";
  } catch {
    // keep the placeholder
  }
  return `${host}-${process.pid}-${randomBytes(4).toString("hex")}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    t.unref?.();
  });
}

/** sleep, but a kickPbRunner() call ends it early (new work was just queued). */
function idleSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(t);
      state.wakers.delete(done);
      resolve();
    };
    const t = setTimeout(done, ms);
    t.unref?.();
    state.wakers.add(done);
  });
}

/**
 * One line for the server log. Drizzle wraps driver errors as "Failed query:
 * <sql> params: <values>", and the values can be a student's profile, so for
 * a database error (raw, or already made safe by the store) the driver's own
 * message is logged instead. Keys and tokens are masked.
 */
function logText(err: unknown): string {
  const e = err as { name?: unknown; message?: unknown; cause?: unknown } | null;
  const isDb =
    e?.name === "PbStoreError" ||
    (typeof e?.message === "string" && e.message.startsWith("Failed query:"));
  return cleanJobError(describeError(isDb && e?.cause ? e.cause : err));
}

/** The first few stack frames of an unexpected error, for the log only. */
function stackHead(err: unknown): string {
  const stack = (err as { stack?: unknown } | null)?.stack;
  if (typeof stack !== "string") return "";
  return stack
    .split("\n")
    .slice(1, 6)
    .map((l) => l.trim())
    .join(" | ");
}

/** Lowercase a-z0-9 words joined by hyphens, for a utm value. */
function slug(name: string): string {
  const s = name
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return s || "student";
}

/**
 * The link a cta post points at, tagged so each run and each student can be
 * told apart in analytics. Falls back to the internships page when the run
 * has no link or it does not parse.
 */
export function trackedLink(base: string | null, runId: number, studentName: string): string {
  let url = new URL(DEFAULT_LINK);
  if (base) {
    try {
      const parsed = new URL(base);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") url = parsed;
    } catch {
      // keep the default
    }
  }
  url.searchParams.set("utm_source", "linkedin");
  url.searchParams.set("utm_medium", "ugc");
  url.searchParams.set("utm_campaign", `pb-run-${runId}`);
  url.searchParams.set("utm_content", slug(studentName));
  return url.toString();
}

function pipelineMention(v: string): "mix" | "none" | "soft" | "cta" {
  return v === "none" || v === "soft" || v === "cta" ? v : "mix";
}

/**
 * Playbook, example posts and hook signals, built once per process and kept
 * for 10 minutes. Every job in a run reads the same corpus, so there is no
 * reason to rebuild it per student. A failed build is not cached.
 */
function getCorpus(): Promise<PbCorpus> {
  const now = Date.now();
  if (state.corpus && now - state.corpus.at < CORPUS_TTL_MS) return state.corpus.value;
  const value = (async (): Promise<PbCorpus> => {
    const playbook = await playbookPrompt();
    // The whole corpus: the pipeline filters out team posts that do not suit a
    // student and shows the writer three, so it needs a real pool to pick from.
    const examples = await voiceSamples(null, 120);
    const signals = await hookSignals(25);
    return { playbook, examples, signals };
  })();
  const entry = { at: now, value };
  state.corpus = entry;
  value.catch(() => {
    if (state.corpus === entry) state.corpus = null;
  });
  return value;
}

/**
 * Resolves or rejects with `work`, or rejects as soon as `signal` aborts,
 * whichever comes first. The pipeline is asked to honour the signal itself;
 * this makes sure a pipeline that does not cannot hold the loop past the
 * timeout. Its late result is ignored (it writes nothing, it is DB-free).
 */
function untilAborted<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason ?? new Error("Aborted."));
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
    work.then(
      (v) => {
        signal.removeEventListener("abort", onAbort);
        resolve(v);
      },
      (e) => {
        signal.removeEventListener("abort", onAbort);
        reject(e);
      }
    );
  });
}

/** failJob, never throwing. */
async function settle(job: ClaimedJob, workerId: string, message: string, requeue: boolean): Promise<void> {
  try {
    const ok = await failJob(job.jobId, workerId, message, { requeue });
    if (!ok) console.warn(`[pb-runner] job ${job.jobId}: lease lost before the failure could be recorded`);
  } catch (err) {
    // The job stays running under this lease and goes stale, so it is
    // claimed again later. Nothing else to do.
    console.error(`[pb-runner] job ${job.jobId}: could not record the failure: ${logText(err)}`);
  }
}

/** Run one claimed job to the end. Never throws. */
async function runJob(job: ClaimedJob, workerId: string): Promise<void> {
  const { jobId } = job;
  const controller = new AbortController();
  let leaseLost = false;
  let timedOut = false;
  let step: PbStep = "dossier";

  // Records the step and renews the lease. Returns false only when the lease
  // is gone; a database error is logged and treated as alive, because the
  // stale window rides out a missed beat or two.
  // One heartbeat at a time per job: if the database is slow or a row is
  // locked, beats share the one in flight instead of each taking another
  // connection from a pool sign-in and other products also use.
  let inFlight: Promise<boolean> | null = null;
  const beat = async (next?: PbStep): Promise<boolean> => {
    if (next) step = next;
    if (leaseLost) return false;
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        const ok = await heartbeatJob(jobId, workerId, step);
        if (!ok && !leaseLost) {
          leaseLost = true;
          controller.abort(new Error("Lease lost."));
        }
        return ok;
      } catch (err) {
        console.error(`[pb-runner] job ${jobId}: heartbeat failed: ${logText(err)}`);
        return true;
      }
    })().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };

  const ticker = setInterval(() => {
    void beat();
  }, HEARTBEAT_MS);
  ticker.unref?.();
  const timer = setTimeout(() => {
    timedOut = true;
    // No more renewals past the deadline: if anything is still stuck, the
    // lease lapses and another loop can take the job over.
    clearInterval(ticker);
    controller.abort(new Error("Timed out."));
  }, JOB_TIMEOUT_MS);
  timer.unref?.();
  state.active.add(controller);

  /** On shutdown the job goes back to the queue as it was, for a pod that is staying. */
  const handBack = async (): Promise<void> => {
    try {
      const ok = await releaseJob(jobId, workerId);
      console.warn(`[pb-runner] job ${jobId}: ${ok ? "handed back to the queue" : "lease already gone"} at shutdown`);
    } catch (err) {
      console.error(`[pb-runner] job ${jobId}: could not hand back at shutdown: ${logText(err)}`);
    }
  };

  try {
    // 1. Everything the pipeline reads, loaded before any model call.
    let corpus: PbCorpus;
    let pastPosts: { hook: string; angle: string; format: string }[];
    let cohortPosts: { name: string; hook: string; angle: string }[];
    try {
      // Bounded by the same deadline as the pipeline: a hung query must not hold the job forever.
      corpus = await untilAborted(getCorpus(), controller.signal);
      pastPosts = await untilAborted(pastPostsForStudent(job.userId, 12), controller.signal);
      const cohort = await untilAborted(cohortRecentPosts({ days: 30, excludeUserId: job.userId, limit: 40 }), controller.signal);
      // First lines only. The angle is a staff note that summarises a
      // student's story; it has no business in another student's prompt.
      cohortPosts = cohort.map(({ name, hook }) => ({ name, hook, angle: "" }));
    } catch (err) {
      if (leaseLost) return;
      if (state.stopping) return await handBack();
      console.error(`[pb-runner] job ${jobId}: could not load context: ${logText(err)}`);
      await settle(
        job,
        workerId,
        job.attempts < MAX_ATTEMPTS
          ? "Could not load the writing context. It will try again shortly."
          : "Could not load the writing context. Retry it later.",
        job.attempts < MAX_ATTEMPTS
      );
      return;
    }
    if (leaseLost) return;

    // 2. The pipeline. DB-free: it only reports steps back through onStep.
    const mention = pipelineMention(job.run.mention);
    const link =
      mention === "cta" || mention === "mix"
        ? trackedLink(job.run.link, job.runId, job.profile.name)
        : null;
    let posts: NewPbPost[];
    try {
      posts = await untilAborted(
        generatePbPosts({
          profile: job.profile,
          brief: job.run.brief,
          postsWanted: job.run.postsPerStudent,
          mention,
          link,
          pastPosts,
          cohortPosts,
          corpus,
          onStep: async (s) => {
            await beat(s);
          },
          signal: controller.signal,
          // Two minutes before the hard stop, posts finish with their best version so far.
          softDeadlineMs: JOB_TIMEOUT_MS - 2 * 60_000,
        }),
        controller.signal
      );
    } catch (err) {
      if (leaseLost) {
        console.warn(`[pb-runner] job ${jobId}: lease lost, work dropped`);
        return;
      }
      if (state.stopping && !timedOut) return await handBack();
      if (timedOut) {
        console.error(`[pb-runner] job ${jobId}: stopped after ${TIMEOUT_MINUTES} minutes on step ${step}`);
        await settle(
          job,
          workerId,
          `Took longer than ${TIMEOUT_MINUTES} minutes and was stopped. Retry it to try again.`,
          false
        );
        return;
      }
      if (err instanceof PbPipelineError) {
        const requeue = err.transient && job.attempts < MAX_ATTEMPTS;
        console.error(
          `[pb-runner] job ${jobId} failed on attempt ${job.attempts} at step ${step}` +
            `${requeue ? ", will retry" : ""}: ${logText(err)}`
        );
        await settle(job, workerId, err.message, requeue);
        return;
      }
      console.error(
        `[pb-runner] job ${jobId} failed unexpectedly on attempt ${job.attempts} at step ${step}: ` +
          `${logText(err)} ${stackHead(err)}`
      );
      await settle(job, workerId, `Something went wrong while writing. The server log has the details (job ${jobId}).`, false);
      return;
    }
    if (leaseLost) {
      console.warn(`[pb-runner] job ${jobId}: lease lost, work dropped`);
      return;
    }

    // 3. Save. Only real posts, never more than the run asked for.
    const usable = (Array.isArray(posts) ? posts : [])
      .filter((p) => p && typeof p.body === "string" && p.body.trim().length > 0)
      .slice(0, job.run.postsPerStudent);
    if (usable.length === 0) {
      console.error(`[pb-runner] job ${jobId}: the pipeline returned no usable posts`);
      await settle(job, workerId, "No post passed the final checks. Retry it, or ask the student to add more detail.", false);
      return;
    }

    if (!(await beat("saving"))) {
      console.warn(`[pb-runner] job ${jobId}: lease lost before saving, work dropped`);
      return;
    }
    // The posts exist only in memory now, so a save that fails on a database
    // blip is retried here rather than paying for the whole pipeline again.
    for (let attempt = 0; ; attempt++) {
      try {
        const ids = await completeJob({
          jobId,
          workerId,
          runId: job.runId,
          userId: job.userId,
          posts: usable,
          status: job.run.deliver === "hold" ? "held" : "delivered",
          // Straight to the student only when the review passed everything.
          // A post the reviewer still flagged waits for staff instead.
          holdFlagged: true,
        });
        if (ids === null) console.warn(`[pb-runner] job ${jobId}: lease lost before saving, work dropped`);
        else console.log(`[pb-runner] job ${jobId}: saved ${ids.length} posts on attempt ${job.attempts}`);
        return;
      } catch (err) {
        const delay: number | undefined = SAVE_RETRY_DELAYS_MS[attempt];
        console.error(
          `[pb-runner] job ${jobId}: save failed${delay === undefined ? "" : ", retrying"}: ${logText(err)}`
        );
        if (delay === undefined || leaseLost) break;
        await sleep(delay);
      }
    }
    if (leaseLost) return;
    await settle(job, workerId, "The posts were written but could not be saved. Retry it.", false);
  } catch (err) {
    // Belt and braces: nothing above should throw, but a loop must survive.
    if (leaseLost) return;
    console.error(`[pb-runner] job ${jobId}: unexpected error: ${logText(err)} ${stackHead(err)}`);
    await settle(job, workerId, `Something went wrong. The server log has the details (job ${jobId}).`, false);
  } finally {
    clearInterval(ticker);
    clearTimeout(timer);
    state.active.delete(controller);
  }
}

/** One worker loop: claim, run, repeat, until there is nothing left. Never throws. */
async function runLoop(workerId: string): Promise<void> {
  let idle = 0;
  for (;;) {
    // A pod that is shutting down takes no new job: it would only be killed mid-way.
    if (state.stopping) return;
    let job: ClaimedJob | null;
    try {
      job = await claimNextJob(workerId);
    } catch (err) {
      console.error(`[pb-runner] ${workerId}: claim failed: ${logText(err)}`);
      if (++idle > MAX_IDLE_POLLS) return;
      await sleep(IDLE_POLL_MS);
      continue;
    }
    if (!job) {
      let active = false;
      try {
        active = await hasActiveJobs();
      } catch (err) {
        console.error(`[pb-runner] ${workerId}: could not check the queue: ${logText(err)}`);
      }
      if (!active || ++idle > MAX_IDLE_POLLS) return;
      await idleSleep(IDLE_POLL_MS);
      continue;
    }
    idle = 0;
    await runJob(job, workerId);
  }
}

/**
 * Make sure this pod is working through the queue. Fire and forget: returns
 * at once, never throws, and is a no-op while enough loops are already
 * running, so it is safe to call on every /pbadmin load and after createRun
 * or retryJob.
 */
export function kickPbRunner(): void {
  if (state.stopping) return;
  try {
    // Loops already waiting for work look again now instead of at their
    // next poll, so a run queued from /pbadmin starts at once.
    for (const wake of Array.from(state.wakers)) wake();
    const want = concurrency();
    while (state.loops < want) {
      state.loops += 1;
      const workerId = newWorkerId();
      void runLoop(workerId)
        .catch((err) => {
          console.error(`[pb-runner] ${workerId} stopped: ${logText(err)}`);
        })
        .finally(() => {
          state.loops = Math.max(0, state.loops - 1);
        });
    }
  } catch (err) {
    console.error(`[pb-runner] could not start: ${logText(err)}`);
  }
}

/**
 * A rolling deploy replaces every pod, and with it every worker loop. A new
 * pod therefore looks at the queue once on its own shortly after it starts,
 * so a run keeps going without anyone opening a page. Only where these pages
 * exist (the staging deployment and local development): production never
 * touches the pb tables.
 */
if (!state.booted && (process.env.BETTER_AUTH_URL ?? "").trim() && deploymentAllowsPb()) {
  state.booted = true;
  const t = setTimeout(kickPbRunner, 15_000);
  t.unref?.();
}

/** For /pbadmin diagnostics: how many loops this pod is running. */
export function pbRunnerLoops(): number {
  return state.loops;
}
