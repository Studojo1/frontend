import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Link,
  data,
  isRouteErrorResponse,
  useFetcher,
  useLocation,
  useNavigation,
  useSearchParams,
} from "react-router";
import { toast } from "sonner";
import type { Route } from "./+types/pbadmin";
import { pbAdminState, requirePbAdmin, requirePbAdminAction } from "~/lib/pb/guard.server";
import type { PbUser } from "~/lib/pb/guard.server";
import {
  createRun,
  deliverHeldPosts,
  hasActiveJobs,
  heldCountsForRuns,
  listPostsForAdmin,
  listRuns,
  listStudents,
  retryJob,
  setPostStatus,
} from "~/lib/pb/store.server";
import { kickPbRunner } from "~/lib/pb/runner.server";
import {
  PB_FORMAT_LABELS,
  PB_LIMITS,
  PB_MENTIONS,
  PB_STEPS,
  profileCompleteness,
  type PbJob,
  type PbJobStatus,
  type PbPost,
  type PbPostStatus,
  type PbReview,
  type PbRun,
  type PbStudentRow,
} from "~/lib/pb/model";
import { authClient } from "~/lib/auth-client";
import { authUrl } from "~/lib/return-to";
import { describeError } from "~/lib/error-detail";
import { Button, CARD, Empty, ErrorNote, LABEL, PageHead } from "~/components/content/ui";

/**
 * /pbadmin, the staff side of the post builder.
 *
 * Students fill in /pb. Staff pick students here, start a run (one background
 * job per student), watch the jobs, and review what comes out: deliver, hold
 * or remove each post. Delivered posts show up on that student's /pb.
 *
 * Gates, all on the server: requirePbAdmin 404s on any host but studojo.pro
 * and localhost, and returns null unless the signed-in account passes every
 * staff check. A null renders a wall, never a redirect: sending a signed-in
 * user to /auth from here bounces them straight back, forever. Every action
 * runs requirePbAdminAction before it reads the form.
 *
 * Polling: while any job is queued or running the page refreshes its data
 * every few seconds through a fetcher, not a full revalidation, so only this
 * route's loader runs. Nothing the admin types is copied out of loader data
 * into state, so a refresh can never overwrite a half-written brief: the form
 * fields are uncontrolled, and the only state here is selection, filters and
 * counters.
 *
 * A refresh or a submit that fails (a laptop waking up, a pod restarting in a
 * deploy) must not replace the console with an error page: clientLoader falls
 * back to the last good data and clientAction turns it into a message.
 */

const POLL_MS = 4000;
const RUNS_SHOWN = 8;
const POSTS_SHOWN = 100;
const MAX_STUDENTS_PER_RUN = 500;
/** Completeness under this sorts to the bottom of the student list. */
const READY_AT = 50;
const DEFAULT_LINK = "https://studojo.com/dojos/internships";

/** Studojo inputs, but at 16px: anything smaller makes iOS Safari zoom on focus. */
const FIELD =
  "w-full rounded-xl border-2 border-neutral-900 bg-white px-3 py-2 font-satoshi text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-studojo-purple disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

/** LABEL's look for table headers, minus its `block`, which breaks a table row. */
const TH =
  "px-3 py-2.5 text-left align-bottom font-satoshi text-xs font-bold uppercase tracking-[0.12em] text-neutral-500";

type Mention = (typeof PB_MENTIONS)[number]["value"];

/** Every action answers in this one shape so the page can toast any of them. */
type ActionResult = {
  ok: boolean;
  intent: string;
  message?: string;
  error?: string;
  runId?: number;
  jobsCreated?: number;
  skipped?: string[];
};

type AdminPost = PbPost & { studentName: string };

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Post builder | Studojo" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

/** Student names, emails and drafts: never cached anywhere along the way. */
export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "private, no-store",
});

export async function loader({ request }: Route.LoaderArgs) {
  const admin = await requirePbAdmin(request);
  if (!admin) {
    const state = await pbAdminState(request);
    return { allowed: false as const, at: Date.now(), signedIn: state.signedIn, email: state.email };
  }

  // Fire and forget. Picks up queued jobs after a deploy restarted the pods.
  kickPbRunner();

  const url = new URL(request.url);
  const studentParam = (url.searchParams.get("student") ?? "").trim();
  const studentFilter = studentParam && studentParam.length <= 128 ? studentParam : null;
  const runParam = Number(url.searchParams.get("run") ?? "");
  const runFilter = Number.isSafeInteger(runParam) && runParam > 0 ? runParam : null;
  const statusParam = url.searchParams.get("status");
  const statusFilter = statusParam === "held" || statusParam === "delivered" ? statusParam : null;

  const [students, runs, recent, active, filtered] = await Promise.all([
    listStudents(),
    listRuns(RUNS_SHOWN),
    listPostsForAdmin({ limit: POSTS_SHOWN }),
    hasActiveJobs(),
    studentFilter || runFilter || statusFilter
      ? listPostsForAdmin({
          userId: studentFilter ?? undefined,
          runId: runFilter ?? undefined,
          status: statusFilter ?? undefined,
          limit: POSTS_SHOWN,
        })
      : Promise.resolve(null),
  ]);
  // Exact, from the database: the list above is only the newest posts.
  const heldByRun = await heldCountsForRuns(runs.map((r) => r.id));

  // Derived here, on the server, so the counts never differ between the
  // server render and hydration, and so only one post list goes down the wire.
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let deliveredThisWeek = 0;
  for (const p of recent) {
    if (p.status === "delivered" && p.deliveredAt && Date.parse(p.deliveredAt) >= weekAgo) {
      deliveredThisWeek++;
    }
  }
  // When the recent window is full, older delivered posts exist that the
  // weekly count did not see. The page then says "at least".
  const windowFull = recent.length >= POSTS_SHOWN;

  return {
    allowed: true as const,
    // Stamped so the page can tell which of two snapshots is newer.
    at: Date.now(),
    adminEmail: admin.email,
    students,
    runs,
    posts: filtered ?? recent,
    active,
    deliveredThisWeek,
    weekCountPartial: windowFull,
    heldByRun,
  };
}

type LoaderData = Awaited<ReturnType<typeof loader>>;
type ConsoleData = Extract<LoaderData, { allowed: true }>;

/** The last console payload that loaded, kept so a failed refresh can fall back to it. */
let lastGood: ConsoleData | null = null;

/**
 * Runs in the browser around every reload of this route's data. A redirect or
 * a "not found" keeps its normal handling. A dropped connection, a pod
 * restarting mid-deploy or a passing server error falls back to what was last
 * loaded, so the console someone is working in stays on screen and the next
 * refresh simply tries again.
 */
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs): Promise<LoaderData> {
  try {
    const d = (await serverLoader()) as LoaderData;
    if (d.allowed) lastGood = d;
    return d;
  } catch (err) {
    const status = err instanceof Response ? err.status : isRouteErrorResponse(err) ? err.status : 0;
    if (lastGood && (status === 0 || status >= 500)) return lastGood;
    throw err;
  }
}

/**
 * Runs in the browser around every submission. A network failure would
 * otherwise reach the error page and throw away the brief being typed. The
 * 503 status also stops React Router reloading data after the failure.
 */
export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  try {
    return await serverAction();
  } catch (err) {
    if (err instanceof Response || isRouteErrorResponse(err)) throw err;
    return data<ActionResult>(
      { ok: false, intent: "", error: "Could not reach the server. Check your connection and try again." },
      { status: 503 },
    );
  }
}

function reply(result: ActionResult, status = 200) {
  return data<ActionResult>(result, { status });
}

function fail(intent: string, error: string, status = 400) {
  return reply({ ok: false, intent, error }, status);
}

function positiveInt(v: FormDataEntryValue | null): number | null {
  const n = Number(typeof v === "string" ? v.trim() : "");
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

function isMention(v: string): v is Mention {
  return PB_MENTIONS.some((m) => m.value === v);
}

/** An https link on studojo.com or one of its subdomains, normalised. Empty means no link. */
function parseStudojoLink(raw: string): { ok: true; link: string | null } | { ok: false; error: string } {
  const v = raw.trim();
  if (!v) return { ok: true, link: null };
  if (v.length > PB_LIMITS.link) {
    return { ok: false, error: `The link is too long. Keep it under ${PB_LIMITS.link} characters.` };
  }
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return { ok: false, error: "That link is not a full web address. Start it with https://studojo.com" };
  }
  const host = u.hostname.toLowerCase();
  const onStudojo = host === "studojo.com" || host.endsWith(".studojo.com");
  if (u.protocol !== "https:" || !onStudojo || u.username || u.password || u.port) {
    return { ok: false, error: "The link must be an https address on studojo.com." };
  }
  return { ok: true, link: u.toString() };
}

export async function action({ request }: Route.ActionArgs) {
  let admin: PbUser;
  try {
    admin = await requirePbAdminAction(request);
  } catch (err) {
    // The off-host 404 passes through untouched. A 403 (session ended, or a
    // different account in another tab) becomes a message on the page rather
    // than an error screen that throws away the admin's place.
    if (err instanceof Response && err.status === 403) {
      return fail("", "You are no longer signed in with a team account. Reload the page and sign in again.", 403);
    }
    throw err;
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("", "That request could not be read. Try again.");
  }
  const intent = String(form.get("intent") ?? "");

  if (intent === "generate") {
    const raw = form.getAll("userIds").map((v) => (typeof v === "string" ? v.trim() : ""));
    if (raw.some((v) => !v || v.length > 128)) {
      return fail(intent, "One of the selected students is not valid. Reload the page and select again.");
    }
    const userIds = [...new Set(raw)];
    if (userIds.length === 0) return fail(intent, "Select at least one student.");
    if (userIds.length > MAX_STUDENTS_PER_RUN) {
      return fail(intent, `Select ${MAX_STUDENTS_PER_RUN} students or fewer per run.`);
    }

    const brief = String(form.get("brief") ?? "").trim();
    if (brief.length > PB_LIMITS.brief) {
      return fail(intent, `The brief is too long. Keep it under ${PB_LIMITS.brief} characters.`);
    }

    const postsPerStudent = Number(form.get("postsPerStudent"));
    if (
      !Number.isInteger(postsPerStudent) ||
      postsPerStudent < 1 ||
      postsPerStudent > PB_LIMITS.postsPerStudent
    ) {
      return fail(intent, `Posts per student must be between 1 and ${PB_LIMITS.postsPerStudent}.`);
    }

    const mention = String(form.get("mention") ?? "");
    if (!isMention(mention)) return fail(intent, "Pick how the posts mention Studojo.");

    const deliver = String(form.get("deliver") ?? "");
    if (deliver !== "now" && deliver !== "hold") return fail(intent, "Pick how the posts are delivered.");

    // Only these two settings can produce a post with a link. For the others
    // the field is ignored, so a stale value there cannot block the run.
    let link: string | null = null;
    if (mention === "mix" || mention === "cta") {
      const parsed = parseStudojoLink(String(form.get("link") ?? ""));
      if (!parsed.ok) return fail(intent, parsed.error);
      link = parsed.link;
    }

    try {
      const result = await createRun({
        brief,
        postsPerStudent,
        mention,
        link,
        deliver,
        createdBy: admin.email,
        userIds,
      });
      kickPbRunner();
      return reply({
        ok: true,
        intent,
        runId: result.runId,
        jobsCreated: result.jobsCreated,
        skipped: result.skipped,
      });
    } catch (err) {
      console.error("[pbadmin] createRun failed", err);
      return fail(intent, `Could not start the run. ${describeError(err)}`, 500);
    }
  }

  if (intent === "deliver" || intent === "hold" || intent === "remove") {
    const postId = positiveInt(form.get("postId"));
    if (!postId) return fail(intent, "That post could not be found. Reload the page.");
    const status: PbPostStatus =
      intent === "deliver" ? "delivered" : intent === "hold" ? "held" : "removed";
    try {
      await setPostStatus(postId, status);
    } catch (err) {
      console.error("[pbadmin] setPostStatus failed", err);
      return fail(intent, `Could not update the post. ${describeError(err)}`, 500);
    }
    const message =
      intent === "deliver"
        ? "Delivered. It is on their page now."
        : intent === "hold"
          ? "Held. It is off their page until you deliver it."
          : "Removed. Nobody sees it now.";
    return reply({ ok: true, intent, message });
  }

  if (intent === "deliver-run") {
    const runId = positiveInt(form.get("runId"));
    if (!runId) return fail(intent, "That run could not be found. Reload the page.");
    try {
      const n = await deliverHeldPosts(runId);
      return reply({
        ok: true,
        intent,
        message: n === 0 ? "Nothing to deliver. This run has no held posts." : `${n} ${plural(n, "post")} delivered.`,
      });
    } catch (err) {
      console.error("[pbadmin] deliverHeldPosts failed", err);
      return fail(intent, `Could not deliver the posts. ${describeError(err)}`, 500);
    }
  }

  if (intent === "retry-job") {
    const jobId = positiveInt(form.get("jobId"));
    if (!jobId) return fail(intent, "That job could not be found. Reload the page.");
    try {
      await retryJob(jobId);
    } catch (err) {
      // Refused when this student already has another job queued or running.
      return fail(intent, describeError(err, "Could not retry this job."), 409);
    }
    kickPbRunner();
    return reply({ ok: true, intent, message: "Queued again. It starts in a moment." });
  }

  return fail(intent, "Unknown action.");
}

/* ------------------------------------------------------------------------ */
/* Small helpers, all client safe and deterministic so SSR matches hydration */
/* ------------------------------------------------------------------------ */

function plural(n: number, one: string, many = `${one}s`): string {
  return n === 1 ? one : many;
}

function listNames(names: string[]): string {
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
}

function time(iso: string | null | undefined): number {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** IST has no daylight saving, so a fixed offset is exact and needs no Intl. */
const IST_OFFSET_MS = 330 * 60 * 1000;

function ist(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : new Date(t + IST_OFFSET_MS);
}

function fmtDate(iso: string | null | undefined): string {
  const d = ist(iso);
  return d ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : "";
}

function fmtDateTime(iso: string | null | undefined): string {
  const d = ist(iso);
  if (!d) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${hh}:${mm}`;
}

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function displayName(name: string | null | undefined): string {
  return name?.trim() || "Unnamed student";
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyText(text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(done);
  } catch {
    toast.error("Copy failed. Select the text and copy it by hand.");
  }
}

function toastResult(r: ActionResult) {
  if (r.ok) toast.success(r.message ?? "Done.");
  else toast.error(r.error ?? "That did not work. Try again.");
}

/**
 * Runs `handle` once per action response. Fires as soon as the response
 * lands, not when the fetcher goes idle: by then a removed post's card has
 * already unmounted and its toast would never show.
 */
function useOnResult(result: ActionResult | undefined, handle: (r: ActionResult) => void = toastResult) {
  const seen = useRef<ActionResult | undefined>(undefined);
  const handler = useRef(handle);
  useEffect(() => {
    handler.current = handle;
  });
  useEffect(() => {
    if (!result || seen.current === result) return;
    seen.current = result;
    handler.current(result);
  }, [result]);
}

/** One shared fetcher carries the background refresh; the page reads its data by the same key. */
const LIVE_KEY = "pbadmin-live";

/**
 * Refreshes this route's data every POLL_MS while jobs are active. Pauses in
 * a hidden tab and while offline. A fetcher load runs only this route's
 * loader, and clientLoader absorbs a failed one, so a bad refresh costs
 * nothing but a few seconds.
 */
function useLivePolling(active: boolean) {
  const live = useFetcher<typeof loader>({ key: LIVE_KEY });
  const navigation = useNavigation();
  const location = useLocation();
  const href = location.pathname + location.search;
  const latest = useRef({ live, href, busy: navigation.state !== "idle" });
  useEffect(() => {
    latest.current = { live, href, busy: navigation.state !== "idle" };
  });

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const { live: f, href: to, busy } = latest.current;
      if (document.hidden || busy || f.state !== "idle") return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      f.load(to);
    };
    const id = window.setInterval(tick, POLL_MS);
    // Catch up straight away when the tab comes back, rather than up to one
    // interval later.
    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);
}

/* ------------------------------------------------------------------------ */
/* Students                                                                  */
/* ------------------------------------------------------------------------ */

type StudentView = PbStudentRow & { missing: string[]; sampleShort: boolean; ready: boolean };

/**
 * What a student still has to fill in. The row carries counts, not the
 * profile, and has no goals field, so this rebuilds a stand-in profile and
 * asks profileCompleteness which version reproduces the stored score: that
 * tells whether goals are missing and whether a sample on file is too short
 * to count. If nothing matches, it falls back to what the row shows.
 */
function profileGaps(s: PbStudentRow): { missing: string[]; sampleShort: boolean } {
  const stories = Array.from({ length: Math.max(0, s.storiesCount) }, (_, i) => ({
    id: String(i),
    text: "x",
  }));
  const fullSample = "x".repeat(150);
  const base = { name: s.name, headline: s.headline, topics: s.topics ?? [], stories };
  const variants = [
    { goals: "x", writingSample: s.hasSample ? fullSample : "", short: false },
    { goals: "", writingSample: s.hasSample ? fullSample : "", short: false },
    ...(s.hasSample
      ? [
          { goals: "x", writingSample: "", short: true },
          { goals: "", writingSample: "", short: true },
        ]
      : []),
  ];
  for (const v of variants) {
    const r = profileCompleteness({ ...base, goals: v.goals, writingSample: v.writingSample });
    if (r.score === s.completeness) return { missing: r.missing, sampleShort: v.short };
  }
  const r = profileCompleteness({ ...base, goals: "x", writingSample: s.hasSample ? fullSample : "" });
  return { missing: r.missing, sampleShort: false };
}

function prepareStudents(rows: PbStudentRow[]): StudentView[] {
  return rows
    .map((s) => ({ ...s, ...profileGaps(s), ready: s.completeness >= READY_AT }))
    .sort(
      (a, b) =>
        Number(b.ready) - Number(a.ready) ||
        time(b.updatedAt) - time(a.updatedAt) ||
        (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0),
    );
}

const RELATION_TAG: Record<string, string> = {
  ambassador: "Ambassador",
  intern: "Studojo intern",
  team: "Studojo team",
  partner: "Paid partner",
  user: "Uses Studojo",
};

const TONES = {
  neutral: "bg-neutral-100 text-neutral-700",
  purple: "bg-studojo-purple-bg text-studojo-purple-strong",
  green: "bg-studojo-green-bg text-emerald-800",
  yellow: "bg-studojo-yellow-bg text-yellow-800",
  red: "bg-red-50 text-red-700",
} as const;
type Tone = keyof typeof TONES;

function Pill({ tone, pulse, children }: { tone: Tone; pulse?: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-satoshi text-xs font-bold ${TONES[tone]}`}
    >
      {pulse && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-lg bg-neutral-100 px-2 py-0.5 font-satoshi text-[11px] font-bold text-neutral-600">
      {children}
    </span>
  );
}

const JOB_PILL: Record<PbJobStatus, { tone: Tone; label: string }> = {
  queued: { tone: "neutral", label: "Queued" },
  running: { tone: "purple", label: "Running" },
  done: { tone: "green", label: "Done" },
  failed: { tone: "red", label: "Failed" },
};

function JobPill({ status }: { status: string }) {
  const p = JOB_PILL[status as PbJobStatus] ?? { tone: "neutral" as const, label: status };
  return (
    <Pill tone={p.tone} pulse={status === "running"}>
      {p.label}
    </Pill>
  );
}

const POST_PILL: Record<PbPostStatus, { tone: Tone; label: string }> = {
  held: { tone: "yellow", label: "Held" },
  delivered: { tone: "green", label: "Delivered" },
  removed: { tone: "neutral", label: "Removed" },
};

function Meter({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone = v >= 80 ? "bg-studojo-green" : v >= READY_AT ? "bg-studojo-yellow" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full border border-neutral-900 bg-white" aria-hidden>
        <div className={`h-full ${tone}`} style={{ width: `${v}%` }} />
      </div>
      <span className="font-satoshi text-xs font-bold text-neutral-800">{v}%</span>
    </div>
  );
}

function StudentRow({
  s,
  checked,
  onToggle,
}: {
  s: StudentView;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  const id = `pb-sel-${s.userId}`;
  const locked = Boolean(s.activeJob);
  const relation = RELATION_TAG[s.relation];
  const sample = s.hasSample ? (s.sampleShort ? "short" : "yes") : "no";
  const missing = s.missing.map((m) => (m === "writing sample" && s.hasSample ? "a longer writing sample" : m));
  const where = [s.stage, s.market].filter((x) => x && x.trim()).join(" · ");

  return (
    <tr className={checked && !locked ? "bg-studojo-purple-bg" : s.ready ? "" : "bg-neutral-50"}>
      <td className="w-10 px-3 py-3 align-top">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 h-4 w-4 cursor-pointer accent-studojo-purple disabled:cursor-not-allowed"
          checked={checked && !locked}
          disabled={locked}
          onChange={() => onToggle(s.userId)}
          title={locked ? "A job is already queued or running for this student" : undefined}
        />
      </td>
      <td className="min-w-[220px] px-3 py-3 align-top">
        <div className="flex flex-wrap items-center gap-1.5">
          <label htmlFor={id} className="cursor-pointer font-bold text-neutral-900">
            {displayName(s.name)}
          </label>
          {relation && <Tag>{relation}</Tag>}
        </div>
        <div className="break-all text-xs text-neutral-500">{s.email ?? "No email on file"}</div>
        {s.headline.trim() && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-700">{s.headline}</p>
        )}
        {where && <p className="mt-0.5 text-xs text-neutral-500">{where}</p>}
      </td>
      <td className="min-w-[190px] px-3 py-3 align-top">
        <Meter value={s.completeness} />
        {missing.length > 0 && (
          <p className="mt-1 text-xs leading-snug text-neutral-500">Missing: {missing.join(", ")}</p>
        )}
        <p className="mt-0.5 text-xs text-neutral-500">
          {s.storiesCount} {plural(s.storiesCount, "story", "stories")} · sample {sample}
        </p>
      </td>
      <td className="min-w-[180px] px-3 py-3 align-top text-xs text-neutral-700">
        <p>
          <span className="font-bold text-neutral-900">{s.postsDelivered}</span> delivered ·{" "}
          <span className="font-bold text-neutral-900">{s.postsHeld}</span> held ·{" "}
          <span className="font-bold text-neutral-900">{s.postsPosted}</span> posted
        </p>
        <p className="mt-0.5 text-neutral-500">
          {s.lastPostAt ? `Last post ${fmtDate(s.lastPostAt)}` : "No posts yet"}
        </p>
        {s.postsDelivered + s.postsHeld > 0 && (
          <Link
            to={{ search: `?student=${encodeURIComponent(s.userId)}`, hash: "#posts" }}
            className="mt-1 inline-block font-bold text-studojo-purple-strong underline"
          >
            View posts
          </Link>
        )}
      </td>
      <td className="px-3 py-3 align-top">{s.activeJob && <JobPill status={s.activeJob} />}</td>
    </tr>
  );
}

function StudentsTable({
  students,
  selected,
  onToggle,
  onSetMany,
}: {
  students: StudentView[];
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onSetMany: (ids: string[], on: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const allRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const visible = q
    ? students.filter((s) =>
        [s.name, s.email ?? "", s.headline, s.stage, s.market].some((f) => f.toLowerCase().includes(q)),
      )
    : students;
  const selectable = visible.filter((s) => !s.activeJob);
  const chosen = selectable.filter((s) => selected.has(s.userId)).length;
  const allChecked = selectable.length > 0 && chosen === selectable.length;
  const someChecked = chosen > 0 && !allChecked;

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someChecked;
  }, [someChecked]);

  return (
    <section className="min-w-0" aria-labelledby="pb-students-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="pb-students-title" className="font-clash text-2xl font-medium text-neutral-900">
            Students
          </h2>
          <p className="mt-1 font-satoshi text-sm text-neutral-500">
            Everyone who saved a profile on /pb. Thin profiles sit at the bottom.
          </p>
        </div>
        {students.length > 0 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a student"
            aria-label="Find a student"
            className={`${FIELD} sm:w-64`}
          />
        )}
      </div>

      {students.length === 0 ? (
        <div className="mt-4">
          <Empty>
            No students yet. Share studojo.pro/pb with them. Once they sign in and save their profile,
            they show up here.
          </Empty>
        </div>
      ) : (
        <div className={`${CARD} mt-4 overflow-x-auto`}>
          <table className="w-full min-w-[760px] border-collapse text-left font-satoshi text-sm">
            <thead className="border-b-2 border-neutral-900 bg-neutral-50">
              <tr>
                <th scope="col" className="w-10 px-3 py-2.5">
                  <input
                    ref={allRef}
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-studojo-purple disabled:cursor-not-allowed"
                    checked={allChecked}
                    disabled={selectable.length === 0}
                    onChange={() => onSetMany(selectable.map((s) => s.userId), !allChecked)}
                    aria-label={q ? "Select every student shown" : "Select every student"}
                  />
                </th>
                <th scope="col" className={TH}>Student</th>
                <th scope="col" className={TH}>Profile</th>
                <th scope="col" className={TH}>Posts</th>
                <th scope="col" className={TH}>Job</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-100">
              {visible.map((s) => (
                <StudentRow key={s.userId} s={s} checked={selected.has(s.userId)} onToggle={onToggle} />
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                    Nobody matches that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Generate panel                                                            */
/* ------------------------------------------------------------------------ */

function GeneratePanel({
  selected,
  nameOf,
  onClear,
  onCreated,
}: {
  selected: StudentView[];
  nameOf: (id: string) => string;
  onClear: () => void;
  onCreated: (runId: number) => void;
}) {
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const [briefLength, setBriefLength] = useState(0);
  const [perStudent, setPerStudent] = useState(1);
  const [mention, setMention] = useState<string>("mix");

  const count = selected.length;
  const thin = selected.filter((s) => !s.ready).length;
  const linkUsed = mention === "mix" || mention === "cta";
  const result = fetcher.data;

  useOnResult(result, (r) => {
    if (r.intent !== "generate" || !r.ok) {
      toastResult(r);
      return;
    }
    const created = r.jobsCreated ?? 0;
    const skipped = (r.skipped ?? []).map(nameOf);
    const why = "no profile yet, or a job already queued or running";
    if (created === 0) {
      toast.error("Nothing was queued.", {
        description: skipped.length ? `Skipped ${listNames(skipped)}: ${why}.` : undefined,
      });
      return;
    }
    const runId = r.runId;
    toast.success(`Writing posts for ${created} ${plural(created, "student")}.`, {
      description: skipped.length
        ? `Skipped ${listNames(skipped)}: ${why}.`
        : "Progress shows under Runs. Posts appear as each student finishes.",
      action: runId ? { label: "View run", onClick: () => scrollToId(`run-${runId}`) } : undefined,
    });
    if (runId) onCreated(runId);
  });

  return (
    <section className={`${CARD} p-5`} aria-labelledby="pb-generate-title">
      <h2 id="pb-generate-title" className="font-clash text-xl font-medium text-neutral-900">
        Generate posts
      </h2>
      <p className="mt-1 font-satoshi text-sm leading-relaxed text-neutral-500">
        Each selected student gets posts written from their own profile, stories and voice.
      </p>

      <fetcher.Form
        method="post"
        className="mt-4 grid gap-4"
        // Enter in the link field (or on a radio) would start the run through
        // the form's only submit button. A run is only ever started by that button.
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault();
        }}
      >
        {selected.map((s) => (
          <input key={s.userId} type="hidden" name="userIds" value={s.userId} />
        ))}

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label className={LABEL} htmlFor="pb-brief">
              Brief
            </label>
            <span className="font-satoshi text-xs text-neutral-400">
              {briefLength}/{PB_LIMITS.brief}
            </span>
          </div>
          <textarea
            id="pb-brief"
            name="brief"
            rows={5}
            maxLength={PB_LIMITS.brief}
            defaultValue=""
            onChange={(e) => setBriefLength(e.target.value.length)}
            className={`${FIELD} mt-1.5 leading-relaxed`}
            placeholder="Example: Placement season starts next week. Write about one thing you learned the hard way this semester, from a project, an interview or an application that went nowhere. Specific and honest, no advice lists."
          />
          <p className="mt-1.5 font-satoshi text-xs leading-relaxed text-neutral-500">
            Optional. Leave it empty for evergreen posts built from their own stories.
          </p>
        </div>

        <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
          <div>
            <label className={LABEL} htmlFor="pb-per-student">
              Posts
            </label>
            <select
              id="pb-per-student"
              name="postsPerStudent"
              defaultValue="1"
              onChange={(e) => setPerStudent(Number(e.target.value) || 1)}
              className={`${FIELD} mt-1.5`}
            >
              {Array.from({ length: PB_LIMITS.postsPerStudent }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <p className="self-end pb-2.5 font-satoshi text-xs leading-snug text-neutral-500">
            per student, each on a different angle.
          </p>
        </div>

        <div>
          <label className={LABEL} htmlFor="pb-mention">
            Studojo mention
          </label>
          <select
            id="pb-mention"
            name="mention"
            defaultValue="mix"
            onChange={(e) => setMention(e.target.value)}
            className={`${FIELD} mt-1.5`}
          >
            {PB_MENTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor="pb-link">
            Link
          </label>
          <input
            id="pb-link"
            name="link"
            type="url"
            inputMode="url"
            defaultValue={DEFAULT_LINK}
            maxLength={PB_LIMITS.link}
            disabled={!linkUsed}
            className={`${FIELD} mt-1.5`}
          />
          <p className="mt-1.5 font-satoshi text-xs leading-relaxed text-neutral-500">
            {linkUsed
              ? "Used only in posts that mention Studojo with a link, in the first comment. Must be on studojo.com."
              : "Not used with this mention setting."}
          </p>
        </div>

        <fieldset>
          <legend className={LABEL}>Delivery</legend>
          <div className="mt-2 grid gap-2">
            <label className="flex cursor-pointer items-start gap-2.5 font-satoshi text-sm text-neutral-900">
              <input
                type="radio"
                name="deliver"
                value="now"
                className="mt-0.5 h-4 w-4 accent-studojo-purple"
              />
              <span>
                <span className="font-bold">Send to students straight away</span>
                <span className="block text-xs text-neutral-500">
                  A post that passes every check shows on their page as soon as it is written. One the review flagged waits for you.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 font-satoshi text-sm text-neutral-900">
              <input
                type="radio"
                name="deliver"
                value="hold"
                defaultChecked
                className="mt-0.5 h-4 w-4 accent-studojo-purple"
              />
              <span>
                <span className="font-bold">Hold for my review</span>
                <span className="block text-xs text-neutral-500">
                  Nothing reaches them until you deliver it below. Recommended: each post goes out under a real student's name.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="border-t-2 border-neutral-100 pt-4">
          {count > 0 ? (
            <div className="mb-3 font-satoshi text-xs leading-relaxed text-neutral-600">
              <span className="font-bold text-neutral-900">Selected:</span>{" "}
              {listNames(selected.map((s) => displayName(s.name)))}.{" "}
              <button
                type="button"
                onClick={onClear}
                className="font-bold text-studojo-purple-strong underline"
              >
                Clear
              </button>
              {thin > 0 && (
                <span className="mt-1 block text-yellow-800">
                  {thin} of them {thin === 1 ? "has a thin profile" : "have thin profiles"}. Expect more
                  generic posts.
                </span>
              )}
            </div>
          ) : (
            <p className="mb-3 font-satoshi text-xs text-neutral-500">
              Tick students in the table to choose who gets posts.
            </p>
          )}
          <Button
            type="submit"
            name="intent"
            value="generate"
            disabled={count === 0 || busy}
            className="w-full"
          >
            {busy ? "Starting..." : `Write posts for ${count} ${plural(count, "student")}`}
          </Button>
          {count > 0 && (
            <p className="mt-2 text-center font-satoshi text-xs text-neutral-500">
              About {count * perStudent} {plural(count * perStudent, "post")} in all.
            </p>
          )}
          {result && !result.ok && result.intent === "generate" && result.error && (
            <div className="mt-3">
              <ErrorNote>{result.error}</ErrorNote>
            </div>
          )}
        </div>
      </fetcher.Form>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Runs                                                                      */
/* ------------------------------------------------------------------------ */

const RUN_MENTION: Record<string, string> = {
  mix: "Mixed mentions",
  none: "No Studojo mention",
  soft: "Studojo in passing",
  cta: "Studojo with a link",
};

function stepLabel(step: string | null): string {
  if (!step) return PB_STEPS.queued;
  return (PB_STEPS as Record<string, string>)[step] ?? step;
}

function Brief({ text }: { text: string }) {
  const t = text.trim();
  if (!t) {
    return (
      <p className="mt-3 font-satoshi text-sm italic text-neutral-500">
        No brief. Evergreen posts from their own stories.
      </p>
    );
  }
  if (t.length <= 220) {
    return <p className="mt-3 whitespace-pre-wrap break-words font-satoshi text-sm text-neutral-800">{t}</p>;
  }
  return (
    <details className="mt-3 font-satoshi text-sm text-neutral-800">
      <summary className="cursor-pointer break-words">
        {t.slice(0, 200).trimEnd()}...{" "}
        <span className="font-bold text-studojo-purple-strong">Show the full brief</span>
      </summary>
      <p className="mt-2 whitespace-pre-wrap break-words">{t}</p>
    </details>
  );
}

function JobRow({ job }: { job: PbJob }) {
  const fetcher = useFetcher<typeof action>();
  useOnResult(fetcher.data);
  const busy = fetcher.state !== "idle";

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 font-satoshi text-sm">
      <span className="min-w-0 flex-1 truncate font-bold text-neutral-900">{displayName(job.studentName)}</span>
      <JobPill status={job.status} />
      {job.status === "running" && (
        <span className="text-xs font-bold text-studojo-purple-strong">{stepLabel(job.step)}</span>
      )}
      <span className="text-xs text-neutral-500">
        {job.attempts} {plural(job.attempts, "attempt")} · {job.postsCreated} {plural(job.postsCreated, "post")}
      </span>
      {job.status === "failed" && (
        <fetcher.Form method="post">
          <input type="hidden" name="jobId" value={job.id} />
          <Button type="submit" name="intent" value="retry-job" variant="ghost" disabled={busy}>
            {busy ? "Retrying..." : "Retry"}
          </Button>
        </fetcher.Form>
      )}
      {job.status === "failed" && job.error && (
        <p className="basis-full break-words text-xs leading-relaxed text-red-700">{job.error}</p>
      )}
    </li>
  );
}

function RunCard({
  run,
  highlight,
  held,
  maybeHeld,
}: {
  run: PbRun;
  highlight: boolean;
  held: number;
  maybeHeld: boolean;
}) {
  const fetcher = useFetcher<typeof action>();
  useOnResult(fetcher.data);
  const busy = fetcher.state !== "idle";

  const counts = { queued: 0, running: 0, done: 0, failed: 0 };
  let posts = 0;
  for (const j of run.jobs) {
    if (j.status in counts) counts[j.status as PbJobStatus]++;
    posts += j.postsCreated || 0;
  }
  const total = run.jobs.length;
  const jobs = [...run.jobs].sort((a, b) => {
    const x = displayName(a.studentName).toLowerCase();
    const y = displayName(b.studentName).toLowerCase();
    return x < y ? -1 : x > y ? 1 : a.id - b.id;
  });
  const summary = [
    `${counts.done} of ${total} done`,
    counts.running ? `${counts.running} running` : "",
    counts.queued ? `${counts.queued} waiting` : "",
    counts.failed ? `${counts.failed} failed` : "",
    `${posts} ${plural(posts, "post")}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const showDeliver = held > 0 || maybeHeld;

  return (
    <article
      id={`run-${run.id}`}
      className={`${CARD} scroll-mt-6 p-5 ${highlight ? "ring-4 ring-studojo-purple-light" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-clash text-lg font-medium text-neutral-900">Run {run.id}</h3>
            {counts.running + counts.queued > 0 ? (
              <Pill tone="purple" pulse>
                In progress
              </Pill>
            ) : counts.failed > 0 ? (
              <Pill tone="red">Finished with failures</Pill>
            ) : (
              <Pill tone="green">Finished</Pill>
            )}
          </div>
          <p className="mt-1 break-all font-satoshi text-xs text-neutral-500">
            {fmtDateTime(run.createdAt)} IST by {run.createdBy}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showDeliver && (
            <fetcher.Form
              method="post"
              onSubmit={(e) => {
                const what = held > 0 ? `${held} held ${plural(held, "post")}` : "every held post";
                if (!window.confirm(`Deliver ${what} from this run to the students now?`)) e.preventDefault();
              }}
            >
              <input type="hidden" name="runId" value={run.id} />
              <Button type="submit" name="intent" value="deliver-run" disabled={busy}>
                {busy ? "Delivering..." : held > 0 ? `Deliver all held posts (${held})` : "Deliver all held posts"}
              </Button>
            </fetcher.Form>
          )}
          <Link
            to={{ search: `?run=${run.id}`, hash: "#posts" }}
            className="inline-flex items-center rounded-xl border-2 border-neutral-900 bg-white px-4 py-2 font-satoshi text-sm font-bold text-neutral-900 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]"
          >
            View posts
          </Link>
        </div>
      </div>

      <Brief text={run.brief} />

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Tag>
          {run.postsPerStudent} {plural(run.postsPerStudent, "post")} each
        </Tag>
        <Tag>{RUN_MENTION[run.mention] ?? run.mention}</Tag>
        <Tag>{run.deliver === "hold" ? "Held for review" : "Sent straight away"}</Tag>
        {run.link && <Tag>{run.link.replace(/^https?:\/\//, "")}</Tag>}
      </div>

      {total > 0 && (
        <>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full border border-neutral-900 bg-white" aria-hidden>
            <div className="bg-studojo-green" style={{ width: `${(counts.done / total) * 100}%` }} />
            <div className="bg-red-400" style={{ width: `${(counts.failed / total) * 100}%` }} />
            <div className="bg-studojo-purple" style={{ width: `${(counts.running / total) * 100}%` }} />
          </div>
          <p className="mt-1.5 font-satoshi text-xs text-neutral-600">{summary}</p>
        </>
      )}

      {jobs.length === 0 ? (
        <p className="mt-4 font-satoshi text-sm text-neutral-500">
          No jobs in this run. Every selected student was skipped.
        </p>
      ) : (
        <ul className="mt-3 divide-y-2 divide-neutral-100 border-t-2 border-neutral-100">
          {jobs.map((j) => (
            <JobRow key={j.id} job={j} />
          ))}
        </ul>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------------ */
/* Posts                                                                     */
/* ------------------------------------------------------------------------ */

const POST_MENTION: Record<string, string> = {
  none: "No mention",
  soft: "Studojo in passing",
  cta: "Studojo with a link",
};

function ReviewDetails({ review }: { review: PbReview }) {
  const items = review.items ?? [];
  const flagged = items.filter((i) => !i.pass).length;
  const rounds = review.rounds ?? 0;
  return (
    <details className="mt-3 rounded-xl border-2 border-neutral-200 px-4 py-2.5">
      <summary className="cursor-pointer font-satoshi text-sm font-bold text-neutral-800">
        Review: {review.verdict === "pass" ? "passed" : `${flagged} ${plural(flagged, "item")} still flagged`},{" "}
        {rounds} {plural(rounds, "round")}
      </summary>
      {items.length === 0 ? (
        <p className="mt-2 font-satoshi text-sm text-neutral-500">No checklist was saved.</p>
      ) : (
        <ul className="mt-2 grid gap-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 font-satoshi text-sm leading-relaxed">
              <span
                className={`mt-0.5 shrink-0 font-bold ${item.pass ? "text-emerald-600" : "text-red-600"}`}
                aria-hidden
              >
                {item.pass ? "ok" : "no"}
              </span>
              <span className="min-w-0 break-words">
                <span className="sr-only">{item.pass ? "Passed: " : "Failed: "}</span>
                <span className={item.pass ? "text-neutral-500" : "font-bold text-neutral-900"}>{item.check}</span>
                {item.note && <span className="text-neutral-500"> {item.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

function PostCard({ post }: { post: AdminPost }) {
  const fetcher = useFetcher<typeof action>();
  useOnResult(fetcher.data);
  const busy = fetcher.state !== "idle";
  const pending = busy ? String(fetcher.formData?.get("intent") ?? "") : "";
  const status = POST_PILL[post.status] ?? { tone: "neutral" as const, label: post.status };
  const postedLink = post.postedUrl && /^https?:\/\//i.test(post.postedUrl) ? post.postedUrl : null;

  const dates = [
    `Written ${fmtDateTime(post.createdAt)}`,
    post.deliveredAt ? `Delivered ${fmtDateTime(post.deliveredAt)}` : "",
    post.copiedAt ? `Copied ${fmtDateTime(post.copiedAt)}` : "",
    post.postedAt ? `Posted ${fmtDateTime(post.postedAt)}` : "",
  ].filter(Boolean);

  return (
    <article className={`${CARD} flex min-w-0 flex-col p-5 transition-opacity ${busy ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-satoshi text-sm font-bold text-neutral-900">{displayName(post.studentName)}</span>
        <Pill tone={status.tone}>{status.label}</Pill>
        <Tag>{PB_FORMAT_LABELS[post.format] ?? post.format}</Tag>
        <Tag>{POST_MENTION[post.mention] ?? post.mention}</Tag>
        {post.review?.verdict === "fix" && <Pill tone="red">Review flagged</Pill>}
        <span className="ml-auto font-satoshi text-xs text-neutral-400">Post {post.id}</span>
      </div>

      {post.angle.trim() && (
        <p className="mt-3 break-words font-satoshi text-sm italic leading-relaxed text-neutral-600">{post.angle}</p>
      )}

      <div className="mt-3 whitespace-pre-wrap break-words rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4 font-satoshi text-[15px] leading-relaxed text-neutral-900">
        {post.body}
      </div>
      <p className="mt-1.5 font-satoshi text-xs text-neutral-400">
        {countWords(post.body)} words · {post.body.length} characters
      </p>

      {post.firstComment && (
        <div className="mt-3">
          <p className={LABEL}>First comment</p>
          <div className="mt-1.5 whitespace-pre-wrap break-words rounded-xl border-2 border-dashed border-neutral-300 p-3 font-satoshi text-sm leading-relaxed text-neutral-800">
            {post.firstComment}
          </div>
        </div>
      )}

      {post.review && <ReviewDetails review={post.review} />}

      <p className="mt-3 font-satoshi text-xs leading-relaxed text-neutral-500">
        {dates.join(" · ")}
        {postedLink && (
          <>
            {" · "}
            <a
              href={postedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-studojo-purple-strong underline"
            >
              Open the live post
            </a>
          </>
        )}
      </p>

      <fetcher.Form method="post" className="mt-auto flex flex-wrap gap-2 border-t-2 border-neutral-100 pt-4">
        <input type="hidden" name="postId" value={post.id} />
        {post.status === "held" && (
          <Button type="submit" name="intent" value="deliver" disabled={busy}>
            {pending === "deliver" ? "Delivering..." : "Deliver"}
          </Button>
        )}
        {post.status === "delivered" && (
          <Button
            type="submit"
            name="intent"
            value="hold"
            variant="ghost"
            disabled={busy}
            title="Takes it off the student's page"
            onClick={(e) => {
              if (post.postedAt && !window.confirm("They already posted this one. Take it off their page anyway?")) {
                e.preventDefault();
              }
            }}
          >
            {pending === "hold" ? "Holding..." : "Hold"}
          </Button>
        )}
        <Button variant="ghost" onClick={() => copyText(post.body, "Post copied.")}>
          Copy
        </Button>
        {post.firstComment && (
          <Button variant="ghost" onClick={() => copyText(post.firstComment ?? "", "First comment copied.")}>
            Copy comment
          </Button>
        )}
        <Button
          type="submit"
          name="intent"
          value="remove"
          variant="danger"
          disabled={busy}
          className="ml-auto"
          onClick={(e) => {
            if (!window.confirm("Remove this post? It disappears from the student's page and from this list.")) {
              e.preventDefault();
            }
          }}
        >
          {pending === "remove" ? "Removing..." : "Remove"}
        </Button>
      </fetcher.Form>
    </article>
  );
}

function PostsSection({ posts, students }: { posts: AdminPost[]; students: StudentView[] }) {
  const [params, setParams] = useSearchParams();
  const student = params.get("student") ?? "";
  const run = params.get("run") ?? "";
  const status = params.get("status") ?? "";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const options = useMemo(
    () =>
      [...students].sort((a, b) => {
        const x = displayName(a.name).toLowerCase();
        const y = displayName(b.name).toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
      }),
    [students],
  );
  const shown = status === "held" || status === "delivered" ? posts.filter((p) => p.status === status) : posts;

  return (
    <section id="posts" className="mt-12 scroll-mt-6" aria-labelledby="pb-posts-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="pb-posts-title" className="font-clash text-2xl font-medium text-neutral-900">
            Posts
          </h2>
          <p className="mt-1 font-satoshi text-sm text-neutral-500">
            Held posts wait for you. Delivered posts are on the student's page. Newest first.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <select
            aria-label="Filter posts by student"
            value={student}
            onChange={(e) => setParam("student", e.target.value)}
            className={`${FIELD} sm:w-56`}
          >
            <option value="">All students</option>
            {student && !options.some((s) => s.userId === student) && (
              <option value={student}>Selected student</option>
            )}
            {options.map((s) => (
              <option key={s.userId} value={s.userId}>
                {displayName(s.name)}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter posts by status"
            value={status}
            onChange={(e) => setParam("status", e.target.value)}
            className={`${FIELD} sm:w-48`}
          >
            <option value="">Held and delivered</option>
            <option value="held">Held only</option>
            <option value="delivered">Delivered only</option>
          </select>
        </div>
      </div>

      {run && (
        <div className="mt-4 flex flex-wrap items-center gap-2 font-satoshi text-sm text-neutral-700">
          <Pill tone="purple">Run {run}</Pill>
          <button
            type="button"
            onClick={() => setParam("run", "")}
            className="font-bold text-studojo-purple-strong underline"
          >
            Show every run
          </button>
        </div>
      )}

      <p className="mt-3 font-satoshi text-xs text-neutral-500">
        Showing {shown.length} {plural(shown.length, "post")}
        {posts.length >= POSTS_SHOWN ? `, the newest ${POSTS_SHOWN} only` : ""}.
      </p>

      <div className="mt-4">
        {shown.length === 0 ? (
          <Empty>
            {student || run || status ? "No posts match these filters." : "No posts yet. Start a run above."}
          </Empty>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {shown.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Page                                                                      */
/* ------------------------------------------------------------------------ */

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]">
      <div className={LABEL}>{label}</div>
      <div className="mt-0.5 font-clash text-2xl font-medium text-neutral-900">{value}</div>
      {sub && <div className="font-satoshi text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}

function Console({ d }: { d: ConsoleData }) {
  useLivePolling(d.active);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [newRunId, setNewRunId] = useState<number | null>(null);

  const students = useMemo(() => prepareStudents(d.students), [d.students]);
  const byId = useMemo(() => new Map(students.map((s) => [s.userId, s])), [students]);

  const selectedRows = students.filter((s) => selected.has(s.userId) && !s.activeJob);
  const running = students.filter((s) => s.activeJob === "running").length;
  const waiting = students.filter((s) => s.activeJob === "queued").length;
  const heldTotal = students.reduce((n, s) => n + (s.postsHeld || 0), 0);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const setMany = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  const nameOf = (id: string) => {
    const s = byId.get(id);
    return s ? displayName(s.name) : "a student who is no longer listed";
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <PageHead
          title="Post builder"
          blurb="Pick students, write their LinkedIn posts, and review what goes out. Delivered posts show on each student's /pb page."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {d.active && (
                <Pill tone="purple" pulse>
                  Live, updating every few seconds
                </Pill>
              )}
              <Button
                variant="ghost"
                onClick={() => copyText(`${window.location.origin}/pb`, "Student link copied.")}
              >
                Copy student link
              </Button>
              <span className="break-all font-satoshi text-xs text-neutral-500">{d.adminEmail}</span>
            </div>
          }
        />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Students" value={students.length} sub="saved a profile" />
          <Stat
            label="Delivered"
            value={`${d.deliveredThisWeek}${d.weekCountPartial ? "+" : ""}`}
            sub="last 7 days"
          />
          <Stat label="Jobs running" value={running} sub={waiting > 0 ? `${waiting} waiting` : "none waiting"} />
          <Stat label="Held" value={heldTotal} sub="waiting for review" />
        </div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <StudentsTable students={students} selected={selected} onToggle={toggle} onSetMany={setMany} />
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pb-2 lg:pr-2">
            <GeneratePanel
              selected={selectedRows}
              nameOf={nameOf}
              onClear={() => setSelected(new Set())}
              onCreated={(runId) => {
                setSelected(new Set());
                setNewRunId(runId);
              }}
            />
          </div>
        </div>

        <section id="runs" className="mt-12 scroll-mt-6" aria-labelledby="pb-runs-title">
          <h2 id="pb-runs-title" className="font-clash text-2xl font-medium text-neutral-900">
            Runs
          </h2>
          <p className="mt-1 font-satoshi text-sm text-neutral-500">
            The latest {RUNS_SHOWN}, newest first. One job per student. Times are IST.
          </p>
          <div className="mt-4 grid gap-4">
            {d.runs.length === 0 ? (
              <Empty>No runs yet. Select students above and write their first posts.</Empty>
            ) : (
              d.runs.map((run) => {
                // Counted in the database for exactly these runs.
                const held = d.heldByRun[run.id] ?? 0;
                return <RunCard key={run.id} run={run} highlight={run.id === newRunId} held={held} maybeHeld={false} />;
              })
            )}
          </div>
        </section>

        <PostsSection posts={d.posts} students={students} />
      </main>
    </div>
  );
}

function Wall({ signedIn, email }: { signedIn: boolean; email: string | null }) {
  const [leaving, setLeaving] = useState(false);
  const signInUrl = authUrl("signin", "/pbadmin");

  const switchAccount = async () => {
    setLeaving(true);
    try {
      await authClient.signOut();
    } catch {
      // Even if sign-out fails, the sign-in page is still the right next step.
    }
    window.location.assign(signInUrl);
  };

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)]">
        <p className="font-satoshi text-xs font-bold uppercase tracking-[0.18em] text-studojo-purple-strong">
          Post builder
        </p>
        <h1 className="mt-3 font-clash text-3xl font-medium text-neutral-900">
          This page is for the Studojo team
        </h1>
        {signedIn ? (
          <>
            <p className="mt-3 font-satoshi text-[15px] leading-relaxed text-neutral-600">
              You are signed in as{" "}
              <span className="break-all font-bold text-neutral-900">{email ?? "another account"}</span>, and that
              account cannot open this page.
            </p>
            <p className="mt-2 font-satoshi text-[15px] leading-relaxed text-neutral-600">
              Team members sign in with Google, using the account on the team list. If you signed in with a
              password, switch and use Google instead.
            </p>
            <Button className="mt-6 w-full" onClick={switchAccount} disabled={leaving}>
              {leaving ? "Signing out..." : "Switch account"}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-3 font-satoshi text-[15px] leading-relaxed text-neutral-600">
              Sign in with your team Google account to continue.
            </p>
            <a
              href={signInUrl}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border-2 border-neutral-900 bg-studojo-purple px-5 py-3 font-satoshi text-[15px] font-bold text-white shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(23,23,23,1)]"
            >
              Sign in
            </a>
          </>
        )}
      </div>
    </main>
  );
}

export default function PbAdmin({ loaderData }: Route.ComponentProps) {
  const live = useFetcher<typeof loader>({ key: LIVE_KEY });
  // Whichever snapshot the server stamped last: the page's own load, or the background refresh.
  const d = live.data && live.data.at > loaderData.at ? live.data : loaderData;
  useEffect(() => {
    if (d.allowed) lastGood = d;
  }, [d]);
  if (!d.allowed) return <Wall signedIn={d.signedIn} email={d.email} />;
  return <Console d={d} />;
}
