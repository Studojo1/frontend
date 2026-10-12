// Shell hooks for the student desk: the boot sequence, the feed poll, the
// viewport and the small badges in the top bar. (The assistant panel's open
// state, remembered in localStorage as desk.agentOpen, lives in the agent
// store with the rest of the panel state.) Screens read data through cache.ts; these hooks keep it fresh.
import { useEffect, useState, useSyncExternalStore } from "react";
import { fetchNextStep } from "~/lib/outreach/hooks";
import type { NextStep } from "~/lib/outreach/next-step";
import {
  errorCode,
  errorStatus,
  getBootstrap,
  getProfile,
  getSettings,
  getStatus,
  isAgentUnavailable,
  listMatches,
  listMemories,
  listOutreach,
  listReplies,
  listThreads,
} from "./api";
import { invalidate, peekAll, peekResource, primeFromBootstrap, setDefaultLoader, setResource, useDeskResource } from "./cache";
import type { Bootstrap, BootstrapResponse, InvalidateKey, OutreachList, ReplyList, Status } from "./types";

// Loaders used when an invalidated key has nobody mounted to supply one.
setDefaultLoader("status", getStatus);
setDefaultLoader("settings", getSettings);
setDefaultLoader("profile", getProfile);
setDefaultLoader("memories", listMemories);
setDefaultLoader("threads", () => listThreads());
setDefaultLoader("outreach", () => listOutreach({ status: "all" }));
setDefaultLoader("top_matches", () => listMatches({ state: "new", limit: 5 }).then((l) => l.items));

export const FEED_POLL_MS = 15_000;
export const BUSY_POLL_MS = 3_000;
export const UPLOAD_PATH = "/outreach/onboarding/upload";

// ── Boot ───────────────────────────────────────────────────────────────────

export type UnavailableReason = "not_live" | "not_enabled" | "switched_off";

export type DeskBoot =
  | { phase: "loading" }
  | { phase: "ready"; boot: Bootstrap }
  | { phase: "needs_matches" }
  | { phase: "unavailable"; reason: UnavailableReason; step: NextStep | null }
  | { phase: "error"; message: string; retry: () => void };

function reasonFor(err: unknown, disabled?: "agent_disabled" | "agent_not_enabled"): UnavailableReason {
  if (disabled === "agent_disabled") return "switched_off";
  if (disabled === "agent_not_enabled") return "not_enabled";
  const code = errorCode(err);
  if (code === "agent_disabled" || errorStatus(err) === 503) return "switched_off";
  if (code === "agent_not_enabled" || errorStatus(err) === 403) return "not_enabled";
  return "not_live";
}

/** True when a student has nothing to work on yet: no resume, or no matches. */
export function needsMatches(status: Status): boolean {
  return status.state === "needs_resume" || !status.candidate_id || status.matches.total === 0;
}

/**
 * GET /bootstrap, priming every key it carries before anything renders from
 * it, so the tabs that mount next find their data and make no calls of their
 * own. Use this (not getBootstrap) wherever the desk needs the bootstrap.
 */
export function loadBootstrap(): Promise<BootstrapResponse> {
  return getBootstrap().then((b) => {
    if (b.enabled) primeFromBootstrap(b);
    return b;
  });
}
setDefaultLoader("bootstrap", loadBootstrap);

/**
 * One bootstrap call for the whole desk (primed through loadBootstrap). Decides
 * between the desk, the upload page, and the "not available" state that
 * keeps the page usable before the agent backend is deployed.
 */
export function useDeskBoot(): DeskBoot {
  const res = useDeskResource<BootstrapResponse>("bootstrap", loadBootstrap);
  const [step, setStep] = useState<NextStep | null | undefined>(undefined);

  const data = res.data;
  const unavailable = (data && data.enabled === false) || (!data && res.error != null && isAgentUnavailable(res.error));

  // Without the agent API, the next-step call says whether they have any leads.
  useEffect(() => {
    if (!unavailable || step !== undefined) return;
    let live = true;
    void fetchNextStep().then((s) => {
      if (live) setStep(s);
    });
    return () => {
      live = false;
    };
  }, [unavailable, step]);

  if (data && data.enabled) return needsMatches(data.status) ? { phase: "needs_matches" } : { phase: "ready", boot: data };
  if (unavailable) {
    if (step === undefined) return { phase: "loading" };
    // Unpaid with no leads anywhere: the search starts at upload.
    if (step && step.state === "not_paid" && !step.path && !step.lead_count) return { phase: "needs_matches" };
    return { phase: "unavailable", reason: reasonFor(res.error, data?.enabled === false ? data.reason : undefined), step };
  }
  if (res.error != null && !data) {
    return {
      phase: "error",
      message: "We could not load your desk. Please try again.",
      retry: () => void res.reload().catch(() => {}),
    };
  }
  return { phase: "loading" };
}

// ── Feed poll ──────────────────────────────────────────────────────────────

function visible(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

/** What changed between two status snapshots, as invalidate words. */
export function statusChanges(prev: Status | undefined, next: Status): InvalidateKey[] {
  if (!prev) return [];
  const out: InvalidateKey[] = [];
  const c = (k: keyof Status["counts"]) => prev.counts[k] !== next.counts[k];
  if ((["all", "needs_you", "scheduled", "sent", "failed", "skipped"] as const).some(c)) out.push("outreach");
  if (c("replied")) out.push("replies", "outreach");
  if (prev.matches.total !== next.matches.total || prev.matches.new !== next.matches.new) out.push("matches");
  return [...new Set(out)];
}

function anyBusy(): boolean {
  return peekAll<OutreachList>("outreach").some((l) => l?.items?.some((r) => r.busy));
}

/**
 * Keeps the tabs current without a reload: GET /status every 15 s while the
 * page is visible (and at once when it becomes visible again), refreshing
 * whatever its counts say has moved; and while any draft is still being
 * written, the outreach list every 3 s until none is.
 */
export function useFeedPolling(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let inflight = false;
    const poll = async () => {
      if (stopped || inflight || !visible()) return;
      inflight = true;
      try {
        const prev = peekResource<Status>("status");
        const next = await getStatus();
        if (stopped) return;
        setResource("status", next);
        const changed = statusChanges(prev, next);
        if (changed.length) invalidate(changed);
      } catch {
        // A missed poll is harmless; the next one tries again.
      } finally {
        inflight = false;
      }
    };
    let wasBusy = false;
    const busyTick = () => {
      if (stopped || !visible()) return;
      const busy = anyBusy();
      if (busy) invalidate(["outreach"]);
      else if (wasBusy) invalidate(["outreach", "matches", "status"]);
      wasBusy = busy;
    };
    const feed = window.setInterval(poll, FEED_POLL_MS);
    const fast = window.setInterval(busyTick, BUSY_POLL_MS);
    const onVisible = () => {
      if (visible()) void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearInterval(feed);
      window.clearInterval(fast);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}

// ── Viewport ───────────────────────────────────────────────────────────────

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** 1024px and up. false on the server, so nothing desktop only renders there. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

// ── Top bar data ───────────────────────────────────────────────────────────

/** Replies that want the student: positive plus questions. */
export function useInboxBadge(enabled: boolean): number {
  const r = useDeskResource<ReplyList>("replies", () => listReplies({ limit: 1 }), { params: "badge", enabled });
  const c = r.data?.counts;
  return c ? c.positive + c.question : 0;
}

export function useDeskStatus(enabled: boolean): Status | undefined {
  return useDeskResource<Status>("status", getStatus, { enabled }).data;
}
