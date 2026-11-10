import {
  API,
  classifyError,
  readShare,
  type ApiErrorBody,
  type ClassifiedError,
  type GradeRequest,
  type GradeResponse,
  type MeResponse,
  type ResumeResponse,
  type ShareResponse,
  type WriteRequest,
  type WriteResponse,
} from "./contract";

// EMAILER: the browser's calls to the engine (career-agent, same origin, /api/emailer/*). Each returns
// { ok: true, data } or { ok: false, error } with the error already sorted into the page's kinds (contract.ts
// classifyError), so the page never reads a status code itself.
//
// DEV ONLY: with ?mock=1 (or ?mock=signed, ?mock=429, ...) on a local dev server, the calls are answered by a stand-in
// for the engine (mock.ts), so the page can be built and tested without it. The check is behind import.meta.env.DEV,
// which a production build replaces with false: the branch and mock.ts never reach the production bundle.

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ClassifiedError; status: number };

const MOCK_KEY = "stu_emailer_mock";

/** DEV ONLY: the stand-in's mode for this tab ("" when off). ?mock=<mode> sets it, ?mock=off clears it. */
export function devMockMode(): string {
  if (!import.meta.env.DEV || typeof window === "undefined") return "";
  try {
    const q = new URLSearchParams(window.location.search).get("mock");
    if (q !== null) {
      if (q === "off" || q === "0") sessionStorage.removeItem(MOCK_KEY);
      else sessionStorage.setItem(MOCK_KEY, q || "1");
    }
    return sessionStorage.getItem(MOCK_KEY) ?? "";
  } catch {
    return "";
  }
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  if (import.meta.env.DEV) {
    const mode = devMockMode();
    if (mode) {
      const { mockFetch } = await import("./mock");
      return mockFetch(path, init, mode);
    }
  }
  return fetch(path, { credentials: "same-origin", ...init });
}

async function call<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await send(path, init);
  } catch {
    return { ok: false, status: 0, error: { kind: "error", message: "We couldn't reach the writer. Check your connection and try again." } };
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.ok && body && typeof body === "object") return { ok: true, data: body as T };
  return { ok: false, status: res.status, error: classifyError(res.status, (body ?? null) as Partial<ApiErrorBody> | null) };
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify(body),
});

export function writeEmail(req: WriteRequest): Promise<ApiResult<WriteResponse>> {
  return call<WriteResponse>(API.write, json(req));
}

export function gradeEmail(req: GradeRequest): Promise<ApiResult<GradeResponse>> {
  return call<GradeResponse>(API.grade, json(req));
}

export function readResume(file: File): Promise<ApiResult<ResumeResponse>> {
  const form = new FormData();
  form.append("file", file);
  return call<ResumeResponse>(API.resume, { method: "POST", body: form, headers: { Accept: "application/json" } });
}

export function getMe(): Promise<ApiResult<MeResponse>> {
  return call<MeResponse>(API.me, { headers: { Accept: "application/json" } });
}

export async function getShare(id: string): Promise<ApiResult<ShareResponse>> {
  const r = await call<unknown>(API.share(id), { headers: { Accept: "application/json" } });
  if (!r.ok) return r;
  const share = readShare(r.data);
  return share ? { ok: true, data: share } : { ok: false, status: 200, error: { kind: "error" } };
}
