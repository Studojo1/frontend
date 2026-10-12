// Typed client for the student desk API (contract section 3).
//
// Browser base /api/v1/outreach/agent; the ingress rewrites it to
// /api/v1/agent on job-outreach-svc. Auth is the session cookie, which
// outreachFetch sends with credentials: "include".
//
// Retry rules (contract section 2): every POST, PATCH and DELETE passes
// maxRetries: 1, which in fetchWithRetry means one attempt and no retry, so an
// approve or a revise is never sent twice. Revise gets a 90 second timeout.
// The chat stream does not live here: it is stream.ts, with its own fetch.
import { outreachFetch } from "~/lib/outreach/api";
import type {
  AgentErrorDetail,
  AgentSettings,
  ApproveAllBody,
  ApproveAllResult,
  ApproveDraftBody,
  ApproveResult,
  BootstrapResponse,
  CancelResult,
  CreateDraftsBody,
  CreateMemoryBody,
  CreateThreadBody,
  DiscardDraftBody,
  DraftsCreated,
  EditDraftBody,
  MatchDetail,
  MatchList,
  Memory,
  MemoryList,
  OkResult,
  OutreachDetail,
  OutreachId,
  OutreachList,
  OutreachRow,
  Profile,
  ReplyGroup,
  ReplyList,
  ReviseDraftBody,
  ReviseResult,
  RunPoll,
  SkipMatchBody,
  Status,
  StatusWord,
  Thread,
  ThreadDetail,
  ThreadList,
  UpdateNotesBody,
  UpdateSettingsBody,
} from "./types";

export const AGENT_BASE = "/agent";

type Query = Record<string, string | number | boolean | null | undefined>;

/** "?a=1&b=x" from the set values only; "" when nothing is set. */
export function toQuery(q: Query = {}): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === null || v === undefined || v === "") continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

const enc = (v: string | number) => encodeURIComponent(String(v));

function get<T>(path: string, q?: Query, maxRetries = 3): Promise<T> {
  return outreachFetch<T>(`${AGENT_BASE}${path}${toQuery(q)}`, { maxRetries });
}

function send<T>(method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown, timeout?: number): Promise<T> {
  return outreachFetch<T>(`${AGENT_BASE}${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    maxRetries: 1,
    ...(timeout ? { timeout } : {}),
  });
}

// ── Errors ─────────────────────────────────────────────────────────────────

/** HTTP status of an error thrown by outreachFetch (0 for network or timeout). */
export function errorStatus(err: unknown): number {
  const s = (err as { status?: unknown })?.status;
  return typeof s === "number" ? s : 0;
}

/** The contract's `detail` object, when the server sent one. */
export function errorDetail(err: unknown): AgentErrorDetail | null {
  const d = (err as { body?: { detail?: unknown } })?.body?.detail;
  if (d && typeof d === "object" && !Array.isArray(d) && typeof (d as { code?: unknown }).code === "string") {
    return d as AgentErrorDetail;
  }
  return null;
}

export function errorCode(err: unknown): string | null {
  return errorDetail(err)?.code ?? null;
}

/**
 * True when the agent API is not there for this student: the route is not
 * deployed yet (404 with no contract code), the account is not on the
 * allowlist (403), or the kill switch is on (503 agent_disabled, or a 503
 * from the ingress). A 404 `not_found` is a real missing record and a 503
 * `busy` is a transient overload, so neither counts.
 */
export function isAgentUnavailable(err: unknown): boolean {
  const status = errorStatus(err);
  const code = errorCode(err);
  if (status === 403) return true;
  if (status === 404) return code !== "not_found";
  if (status === 503) return code !== "busy";
  return false;
}

/** The student-facing line for a failed call. Contract messages are written for them. */
export function errorMessage(err: unknown, fallback = "Something went wrong on our side. Please try again."): string {
  const d = errorDetail(err);
  if (d?.message) return d.message;
  const status = errorStatus(err);
  if (status === 0) return "We could not reach Studojo. Check your connection and try again.";
  if (status === 422) return "That did not look right. Please check it and try again.";
  return fallback;
}

// ── 1, 2: bootstrap and status ─────────────────────────────────────────────

/** Two attempts at most, so the unavailable state shows quickly. */
export const getBootstrap = () => get<BootstrapResponse>("/bootstrap", undefined, 2);
export const getStatus = () => get<Status>("/status");

// ── 3 to 5: matches ────────────────────────────────────────────────────────

export interface MatchQuery {
  q?: string | null;
  company?: string | null;
  city?: string | null;
  title?: string | null;
  min_score?: number | null;
  state?: string | null;
  strong_only?: boolean;
  exclude_contacted?: boolean;
  limit?: number;
  offset?: number;
}
export const listMatches = (q: MatchQuery = {}) => get<MatchList>("/matches", { ...q });
export const getMatch = (leadId: number) => get<MatchDetail>(`/matches/${enc(leadId)}`);
export const skipMatch = (leadId: number, body: SkipMatchBody = {}) =>
  send<OutreachRow>("POST", `/matches/${enc(leadId)}/skip`, body);

// ── 6 to 14: outreach ──────────────────────────────────────────────────────

export interface OutreachQuery {
  status?: StatusWord | "all" | null;
  lead_id?: number | null;
  limit?: number;
  offset?: number;
}
export const listOutreach = (q: OutreachQuery = {}) => get<OutreachList>("/outreach", { ...q });
export const getOutreach = (id: OutreachId) => get<OutreachDetail>(`/outreach/${enc(id)}`);
export const createDrafts = (body: CreateDraftsBody) => send<DraftsCreated>("POST", "/outreach/drafts", body);
export const reviseDraft = (id: OutreachId, body: ReviseDraftBody) =>
  send<ReviseResult>("POST", `/outreach/${enc(id)}/revise`, body, 90_000);
export const editDraft = (id: OutreachId, body: EditDraftBody) =>
  send<OutreachDetail>("PATCH", `/outreach/${enc(id)}`, body);
export const approveDraft = (id: OutreachId, body: ApproveDraftBody) =>
  send<ApproveResult>("POST", `/outreach/${enc(id)}/approve`, body);
export const approveAll = (body: ApproveAllBody) => send<ApproveAllResult>("POST", "/outreach/approve-all", body);
export const discardDraft = (id: OutreachId, body: DiscardDraftBody = {}) =>
  send<OutreachDetail>("POST", `/outreach/${enc(id)}/discard`, body);
export const restoreDraft = (id: OutreachId) => send<OkResult>("POST", `/outreach/${enc(id)}/restore`, {});

// ── 15: replies ────────────────────────────────────────────────────────────

export interface ReplyQuery {
  group?: ReplyGroup | null;
  limit?: number;
  offset?: number;
}
export const listReplies = (q: ReplyQuery = {}) => get<ReplyList>("/replies", { ...q });

// ── 16 to 22: profile, memories, settings ──────────────────────────────────

export const getProfile = () => get<Profile>("/profile");
export const updateNotes = (body: UpdateNotesBody) => send<Profile>("PATCH", "/profile/notes", body);
export const listMemories = () => get<MemoryList>("/memories");
export const createMemory = (body: CreateMemoryBody) => send<Memory>("POST", "/memories", body);
export const deleteMemory = (id: number) => send<OkResult>("DELETE", `/memories/${enc(id)}`);
export const getSettings = () => get<AgentSettings>("/settings");
export const updateSettings = (body: UpdateSettingsBody) => send<AgentSettings>("PATCH", "/settings", body);

// ── 23 to 29: threads and runs ─────────────────────────────────────────────

export const listThreads = (scope?: string | null) => get<ThreadList>("/threads", { scope });
export const createThread = (body: CreateThreadBody = {}) => send<Thread>("POST", "/threads", body);
export const getThread = (id: number, q: { before?: number | null; limit?: number } = {}) =>
  get<ThreadDetail>(`/threads/${enc(id)}`, { ...q });
export const archiveThread = (id: number) => send<OkResult>("DELETE", `/threads/${enc(id)}`);
/** Route 27 is the stream: see stream.ts. */
export const getRun = (id: number, afterSeq = 0) => get<RunPoll>(`/runs/${enc(id)}`, { after_seq: afterSeq }, 1);
export const cancelRun = (id: number) => send<CancelResult>("POST", `/runs/${enc(id)}/cancel`, {});
