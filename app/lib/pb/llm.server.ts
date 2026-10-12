import { describeError } from "~/lib/error-detail";

/**
 * Model calls for the /pb post pipeline.
 *
 * Same provider and key as the rest of the repo (OPENAI_API_KEY), plain fetch
 * like app/lib/content/llm.server.ts, no SDK. The model is PB_MODEL or
 * gpt-5.5, falling back to gpt-4.1 and then gpt-4o when the API says the
 * model itself is not available to this key.
 *
 * Verified against the live API (12 Oct 2026) for gpt-5.5: it takes
 * max_completion_tokens (max_tokens is rejected), rejects any temperature but
 * the default, and accepts reasoning_effort none, low, medium, high and xhigh
 * on chat completions ("minimal" is rejected). gpt-4.x takes max_tokens and a
 * temperature. A parameter the API refuses anyway is dropped and the call
 * retried once, and remembered for that model, so a PB_MODEL change cannot
 * wedge the pipeline on a parameter name.
 *
 * Every call has its own 90 second deadline, combined with the caller's abort
 * signal. 429, 5xx, timeouts and network errors are retried with backoff and
 * end as a transient PbPipelineError; a bad request, a bad key or a refusal
 * ends as a permanent one. Nothing here ever logs or returns the key.
 */

export class PbPipelineError extends Error {
  /** True when trying the same job again later may well succeed. */
  transient: boolean;
  constructor(message: string, transient = false, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PbPipelineError";
    this.transient = transient;
  }
}

export type PbEffort = "none" | "low" | "medium" | "high";

export type PbChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** One attempt at one call, for timing and logs. */
export type PbCallInfo = {
  label: string;
  model: string;
  attempt: number;
  ms: number;
  ok: boolean;
  status?: number;
  finish?: string;
  promptTokens?: number;
  cachedTokens?: number;
  completionTokens?: number;
  reasoningTokens?: number;
  error?: string;
};

export type PbChatOptions = {
  /** Short name of the stage, for logs: "dossier", "draft 2". */
  label: string;
  json?: boolean;
  /** Output budget. For reasoning models it includes the reasoning tokens. */
  maxTokens: number;
  /** Reasoning models only. */
  effort?: PbEffort;
  /** gpt-4.x only. */
  temperature?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
  onCall?: (info: PbCallInfo) => void;
  /** Called before every retry, so a long retry chain can keep a job lease alive. */
  onRetry?: () => void | Promise<void>;
};

export type PbChatResult = { text: string; json: unknown; model: string };

const API_URL = "https://api.openai.com/v1/chat/completions";
export const PB_DEFAULT_MODEL = "gpt-5.5";
const FALLBACK_MODELS = ["gpt-4.1", "gpt-4o"];
const DEFAULT_TIMEOUT_MS = 90_000;
const MAX_TRANSIENT_RETRIES = 2;
const UNAVAILABLE_FOR_MS = 30 * 60_000;

/** The models to try, in order. */
export function pbModelChain(): string[] {
  const primary = process.env.PB_MODEL?.trim() || PB_DEFAULT_MODEL;
  return [primary, ...FALLBACK_MODELS].filter((m, i, a) => a.indexOf(m) === i);
}

/** gpt-5.x and the o-series reason before answering and take different parameters. */
export function isReasoningModel(model: string): boolean {
  return /^(gpt-5|o\d)/i.test(model);
}

type Param = "temperature" | "reasoning_effort" | "max_tokens" | "max_completion_tokens" | "response_format";

/** Per pod: models the API said this key cannot use, and when it said so. */
const unavailableModels = new Map<string, number>();
/** Per pod: parameters the API refused for a model. */
const refusedParams = new Map<string, Set<Param>>();

class ModelUnavailable extends Error {}

const EFFORT_DOWN: Record<PbEffort, PbEffort> = { high: "medium", medium: "low", low: "low", none: "none" };

/** The request body for one model, leaving out anything the API refused before. */
export function buildRequestBody(
  model: string,
  messages: PbChatMessage[],
  opts: { json?: boolean; maxTokens: number; effort?: PbEffort; temperature?: number },
  refused: ReadonlySet<Param> = new Set()
): Record<string, unknown> {
  const reasoning = isReasoningModel(model);
  const body: Record<string, unknown> = { model, messages };
  const useCompletionTokens = reasoning ? !refused.has("max_completion_tokens") : refused.has("max_tokens");
  if (useCompletionTokens) body.max_completion_tokens = opts.maxTokens;
  else body.max_tokens = Math.min(opts.maxTokens, 4000);
  if (reasoning) {
    if (opts.effort && !refused.has("reasoning_effort")) body.reasoning_effort = opts.effort;
  } else if (opts.temperature !== undefined && !refused.has("temperature")) {
    body.temperature = opts.temperature;
  }
  if (opts.json && !refused.has("response_format")) body.response_format = { type: "json_object" };
  return body;
}

/** JSON from a model reply, tolerating fences and chatter around the object. */
export function parseJsonLoose(raw: string): unknown {
  const text = raw.trim();
  const attempts = [text, text.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "")];
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) attempts.push(text.slice(first, last + 1));
  for (const a of attempts) {
    try {
      const v = JSON.parse(a);
      if (v && typeof v === "object") return v;
    } catch {
      // try the next shape
    }
  }
  return null;
}

/** Strip anything shaped like an API key out of text that may end up in a log or on a page. */
function redact(text: string): string {
  return text.replace(/sk-[A-Za-z0-9_*-]{4,}/g, "sk-***").replace(/Bearer\s+\S+/gi, "Bearer ***");
}

function stopped(signal: AbortSignal | undefined): PbPipelineError {
  return new PbPipelineError("Generation was stopped.", true, { cause: signal?.reason });
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(stopped(signal));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(stopped(signal));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** The caller's signal plus a deadline, as one signal. Written out rather than AbortSignal.any for Node 20.0. */
function withDeadline(parent: AbortSignal | undefined, ms: number) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort(new Error(`deadline of ${ms} ms`));
  }, ms);
  const onAbort = () => controller.abort(parent?.reason);
  if (parent?.aborted) controller.abort(parent.reason);
  else parent?.addEventListener("abort", onAbort, { once: true });
  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    done: () => {
      clearTimeout(timer);
      parent?.removeEventListener("abort", onAbort);
    },
  };
}

function backoffMs(retry: number, retryAfter: string | null): number {
  const base = 2000 * 2 ** (retry - 1) + Math.floor(Math.random() * 600);
  const header = retryAfter ? Number(retryAfter) * 1000 : NaN;
  return Math.min(20_000, Number.isFinite(header) && header > 0 ? Math.max(header, 1000) : base);
}

type ApiError = { status: number; code: string; param: string; message: string; type: string };

function readApiError(status: number, raw: string): ApiError {
  let code = "";
  let param = "";
  let message = "";
  let type = "";
  try {
    const j = JSON.parse(raw) as { error?: { code?: unknown; param?: unknown; message?: unknown; type?: unknown } };
    code = typeof j.error?.code === "string" ? j.error.code : "";
    param = typeof j.error?.param === "string" ? j.error.param : "";
    message = typeof j.error?.message === "string" ? j.error.message : "";
    type = typeof j.error?.type === "string" ? j.error.type : "";
  } catch {
    message = raw.slice(0, 300);
  }
  return { status, code, param, message: redact(message).slice(0, 300), type };
}

function isModelUnavailable(e: ApiError): boolean {
  if (e.code === "model_not_found") return true;
  if (e.status === 404 && /model/i.test(e.message)) return true;
  return (
    (e.status === 400 || e.status === 403) &&
    /model/i.test(e.message) &&
    /(does not exist|do not have access|not (?:found|available|supported))/i.test(e.message) &&
    !e.param
  );
}

/** Which parameter a 400 is about, when it is one we know how to drop. */
function refusedParam(e: ApiError): Param | null {
  if (e.status !== 400) return null;
  const p = e.param || (e.message.match(/'(temperature|reasoning_effort|max_tokens|max_completion_tokens|response_format)'/)?.[1] ?? "");
  if (/unsupported|not supported|does not support|invalid/i.test(`${e.code} ${e.message}`)) {
    if (p === "temperature" || p === "reasoning_effort" || p === "max_tokens" || p === "max_completion_tokens" || p === "response_format") {
      return p;
    }
  }
  return null;
}

/**
 * One chat completion. Tries each model in the chain; within a model, retries
 * transient failures and self-heals refused parameters. JSON calls are parsed
 * here and retried once when the reply is not an object.
 */
export async function pbChat(messages: PbChatMessage[], opts: PbChatOptions): Promise<PbChatResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new PbPipelineError("The model key is not set on this environment, so posts cannot be written.", false);
  }
  const now = Date.now();
  const chain = pbModelChain();
  const usable = chain.filter((m) => (unavailableModels.get(m) ?? 0) < now - UNAVAILABLE_FOR_MS);
  let last: unknown = null;
  for (const model of usable.length ? usable : chain) {
    try {
      return await callModel(model, messages, opts, key);
    } catch (err) {
      if (err instanceof ModelUnavailable) {
        unavailableModels.set(model, Date.now());
        console.warn(`[pb-llm] ${model} is not available to this key, trying the next model`);
        last = err;
        continue;
      }
      throw err;
    }
  }
  throw new PbPipelineError(
    `No writing model is available to this key (tried ${chain.join(", ")}). ${last instanceof Error ? last.message : ""}`.trim(),
    false
  );
}

async function callModel(model: string, messages: PbChatMessage[], opts: PbChatOptions, key: string): Promise<PbChatResult> {
  const refused = new Set<Param>(refusedParams.get(model) ?? []);
  let effort = opts.effort;
  let maxTokens = opts.maxTokens;
  let attempt = 0;
  let transientRetries = 0;
  let timeoutRetries = 0;
  let paramFixes = 0;
  let roomRetries = 0;
  let parseRetries = 0;

  const retry = async (why: string, wait: number) => {
    console.warn(`[pb-llm] ${opts.label} on ${model}: ${why}; retrying`);
    if (opts.onRetry) await opts.onRetry();
    if (wait > 0) await sleep(wait, opts.signal);
  };

  for (;;) {
    attempt++;
    if (opts.signal?.aborted) throw stopped(opts.signal);
    const body = buildRequestBody(model, messages, { json: opts.json, maxTokens, effort, temperature: opts.temperature }, refused);
    const deadline = withDeadline(opts.signal, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    const t0 = Date.now();
    let status = 0;
    let raw = "";
    let retryAfter: string | null = null;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
        signal: deadline.signal,
      });
      status = res.status;
      retryAfter = res.headers.get("retry-after");
      raw = await res.text();
    } catch (err) {
      const ms = Date.now() - t0;
      const timedOut = deadline.timedOut();
      deadline.done();
      opts.onCall?.({ label: opts.label, model, attempt, ms, ok: false, error: timedOut ? "timeout" : redact(describeError(err)) });
      if (opts.signal?.aborted) throw stopped(opts.signal);
      if (timedOut) {
        // A slow answer is usually a long think: once more, thinking less.
        if (timeoutRetries < 1) {
          timeoutRetries++;
          if (effort) effort = EFFORT_DOWN[effort];
          await retry(`no answer within ${Math.round(ms / 1000)} s`, 0);
          continue;
        }
        throw new PbPipelineError(`The writing model did not answer within ${Math.round((opts.timeoutMs ?? DEFAULT_TIMEOUT_MS) / 1000)} seconds (${opts.label}).`, true);
      }
      if (transientRetries < MAX_TRANSIENT_RETRIES) {
        transientRetries++;
        await retry(`network error: ${redact(describeError(err))}`, backoffMs(transientRetries, null));
        continue;
      }
      throw new PbPipelineError(`Could not reach the writing model (${opts.label}): ${redact(describeError(err))}`, true, { cause: err });
    }
    deadline.done();
    const ms = Date.now() - t0;

    if (status < 200 || status >= 300) {
      const e = readApiError(status, raw);
      opts.onCall?.({ label: opts.label, model, attempt, ms, ok: false, status, error: `${e.code || e.type || "error"}: ${e.message}`.slice(0, 200) });
      if (isModelUnavailable(e)) throw new ModelUnavailable(e.message);
      const param = refusedParam(e);
      if (param && paramFixes < 4) {
        paramFixes++;
        refused.add(param);
        if (param === "max_tokens") refused.delete("max_completion_tokens");
        if (param === "max_completion_tokens") refused.delete("max_tokens");
        refusedParams.set(model, new Set(refused));
        await retry(`the API refused ${param}`, 0);
        continue;
      }
      if (status === 429 && /insufficient_quota|billing/i.test(`${e.code} ${e.type} ${e.message}`)) {
        throw new PbPipelineError("The model account is out of quota. Posts cannot be written until it is topped up.", false);
      }
      if (status === 408 || status === 409 || status === 429 || status >= 500) {
        if (transientRetries < MAX_TRANSIENT_RETRIES) {
          transientRetries++;
          await retry(`HTTP ${status}`, backoffMs(transientRetries, retryAfter));
          continue;
        }
        throw new PbPipelineError(
          status === 429
            ? `The writing model is rate limited right now (${opts.label}). Try again in a few minutes.`
            : `The writing model had a server error (HTTP ${status}, ${opts.label}).`,
          true
        );
      }
      if (status === 401) throw new PbPipelineError("The model key was rejected (HTTP 401).", false);
      if (e.code === "context_length_exceeded") {
        throw new PbPipelineError(`This profile is too long for one model call (${opts.label}).`, false);
      }
      throw new PbPipelineError(`The writing model rejected the request (HTTP ${status}, ${opts.label}): ${e.message}`, false);
    }

    let data: {
      choices?: { finish_reason?: string; message?: { content?: string | null; refusal?: string | null } }[];
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        prompt_tokens_details?: { cached_tokens?: number };
        completion_tokens_details?: { reasoning_tokens?: number };
      };
    };
    try {
      data = JSON.parse(raw);
    } catch {
      opts.onCall?.({ label: opts.label, model, attempt, ms, ok: false, status, error: "unreadable response" });
      if (transientRetries < MAX_TRANSIENT_RETRIES) {
        transientRetries++;
        await retry("unreadable response body", backoffMs(transientRetries, null));
        continue;
      }
      throw new PbPipelineError(`The writing model sent back something unreadable (${opts.label}).`, true);
    }

    const choice = data.choices?.[0];
    const finish = choice?.finish_reason ?? "";
    const text = (choice?.message?.content ?? "").trim();
    opts.onCall?.({
      label: opts.label,
      model,
      attempt,
      ms,
      ok: Boolean(text),
      status,
      finish,
      promptTokens: data.usage?.prompt_tokens,
      cachedTokens: data.usage?.prompt_tokens_details?.cached_tokens,
      completionTokens: data.usage?.completion_tokens,
      reasoningTokens: data.usage?.completion_tokens_details?.reasoning_tokens,
    });

    if (choice?.message?.refusal || finish === "content_filter") {
      throw new PbPipelineError(`The writing model declined this one (${opts.label}).`, false);
    }
    if (!text || (finish === "length" && opts.json && parseJsonLoose(text) === null)) {
      // Out of room, almost always because the thinking used the budget.
      if (roomRetries < 1) {
        roomRetries++;
        maxTokens = Math.min(maxTokens * 2, 24_000);
        if (effort) effort = EFFORT_DOWN[effort];
        await retry(finish === "length" ? "ran out of room" : "empty answer", 0);
        continue;
      }
      throw new PbPipelineError(`The writing model returned nothing usable (${opts.label}).`, true);
    }

    if (!opts.json) return { text, json: null, model };
    const json = parseJsonLoose(text);
    if (json !== null) return { text, json, model };
    if (parseRetries < 1) {
      parseRetries++;
      await retry("the answer was not JSON", 0);
      continue;
    }
    throw new PbPipelineError(`The writing model returned malformed JSON (${opts.label}).`, true);
  }
}
