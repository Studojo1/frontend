import { describeError } from "~/lib/error-detail";

/**
 * Model calls for the /pb post pipeline.
 *
 * One provider, plain fetch, no SDK: Azure OpenAI (AZURE_OPENAI_ENDPOINT +
 * AZURE_OPENAI_API_KEY, the studoclaw resource the rest of the app uses). The
 * direct OpenAI key was retired on 2026-10-12 and is never read. Every call
 * walks a chain of deployments, so a deployment that does not exist, or one
 * out of quota, moves the call to the next one instead of failing the job.
 * The default chain is gpt-5-mini, then gpt-4o. PB_MODEL and PB_WRITER_MODEL
 * put other deployments first (comma separated, "azure:<deployment>" or just
 * "<deployment>"); writing stages (draft, revise, fix) use the writer chain
 * when it is set.
 *
 * gpt-5 family deployments take max_completion_tokens (max_tokens is
 * rejected), only the default temperature, and reasoning_effort; gpt-4o takes
 * max_tokens and a temperature. A parameter the API refuses anyway is dropped
 * and the call retried once, and remembered for that deployment, so a
 * PB_MODEL change cannot wedge the pipeline on a parameter name.
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
  /** "write" for the stages that produce post text, else the main chain. */
  role?: "think" | "write";
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

/** Azure API version that takes max_completion_tokens and reasoning_effort (gpt-5 family) and plain gpt-4o alike. */
const AZURE_API_VERSION = "2025-04-01-preview";
/** Deployments on the Azure resource, best first for this pipeline. */
export const PB_AZURE_DEFAULTS = ["gpt-5-mini", "gpt-4o"];

export type PbProvider = "azure";
/** One place a call can go: an Azure deployment. */
export type PbTarget = { provider: PbProvider; model: string };

function azureConfig(): { endpoint: string; key: string } | null {
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT ?? "").trim().replace(/\/+$/, "");
  const key = (process.env.AZURE_OPENAI_API_KEY ?? "").trim();
  return endpoint && key && /^https:\/\//i.test(endpoint) ? { endpoint, key } : null;
}

const warned = new Set<string>();
function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

/**
 * "azure:gpt-4o, gpt-5-mini" into targets. A bare name is an Azure deployment.
 * Any other provider ("openai:gpt-5.5") is ignored: the direct key is retired.
 */
export function parseTargets(raw: string | undefined): PbTarget[] {
  const out: PbTarget[] = [];
  for (const part of (raw ?? "").split(",")) {
    const t = part.trim();
    if (!t) continue;
    const m = t.match(/^([a-z]+):(.+)$/i);
    if (m && m[1].toLowerCase() !== "azure") {
      warnOnce(`[pb-llm] ignoring model target "${t}": only Azure deployments are used`);
      continue;
    }
    const model = (m ? m[2] : t).trim();
    if (/^[A-Za-z0-9._-]{1,64}$/.test(model)) out.push({ provider: "azure", model });
  }
  return out;
}

/**
 * Where a call may go, in order: configured deployments first, then the
 * defaults, so an override can never leave a job with nowhere to go. Empty
 * when Azure is not configured.
 */
export function pbTargetChain(role: "think" | "write" = "think"): PbTarget[] {
  if (!azureConfig()) return [];
  const writer = role === "write" ? parseTargets(process.env.PB_WRITER_MODEL) : [];
  const main = parseTargets(process.env.PB_MODEL);
  const defaults = PB_AZURE_DEFAULTS.map((model) => ({ provider: "azure" as const, model }));
  const all = [...writer, ...main, ...defaults];
  return all.filter((t, i) => all.findIndex((x) => x.model === t.model) === i);
}
const DEFAULT_TIMEOUT_MS = 90_000;
const MAX_TRANSIENT_RETRIES = 2;
const UNAVAILABLE_FOR_MS = 30 * 60_000;
/** A provider out of credits is skipped this long before it is tried again. */
const EXHAUSTED_FOR_MS = 10 * 60_000;

/** The main chain as "provider:model" strings, for logs and tests. */
export function pbModelChain(): string[] {
  return pbTargetChain("think").map(targetKey);
}

/** gpt-5.x and the o-series reason before answering and take different parameters. */
export function isReasoningModel(model: string): boolean {
  return /^(gpt-5|o\d)/i.test(model);
}

type Param = "temperature" | "reasoning_effort" | "max_tokens" | "max_completion_tokens" | "response_format";

/** Per pod: deployments the API said do not exist, and when it said so. */
const unavailableModels = new Map<string, number>();
/** Per pod: when the resource last said it is out of quota. */
const exhaustedProviders = new Map<PbProvider, number>();
/** Per pod: parameters the API refused for a target. */
const refusedParams = new Map<string, Set<Param>>();

class ModelUnavailable extends Error {}
/** The resource cannot pay for calls right now: try the next deployment, then give up clearly. */
class ProviderExhausted extends Error {}

function targetKey(t: PbTarget): string {
  return `${t.provider}:${t.model}`;
}

const EFFORT_DOWN: Record<PbEffort, PbEffort> = { high: "medium", medium: "low", low: "low", none: "none" };

/** The request body for one model, leaving out anything the API refused before. */
export function buildRequestBody(
  model: string,
  messages: PbChatMessage[],
  opts: { json?: boolean; maxTokens: number; effort?: PbEffort; temperature?: number },
  refused: ReadonlySet<Param> = new Set()
): Record<string, unknown> {
  const reasoning = isReasoningModel(model);
  // Azure takes the deployment from the URL, not the body.
  const body: Record<string, unknown> = { messages };
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
  if (e.code === "model_not_found" || e.code === "DeploymentNotFound") return true;
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
  const chain = pbTargetChain(opts.role ?? "think");
  if (chain.length === 0) {
    throw new PbPipelineError("Azure OpenAI is not configured on this environment, so posts cannot be written.", false);
  }
  const now = Date.now();
  const fresh = (t: PbTarget) =>
    (unavailableModels.get(targetKey(t)) ?? 0) < now - UNAVAILABLE_FOR_MS &&
    (exhaustedProviders.get(t.provider) ?? 0) < now - EXHAUSTED_FOR_MS;
  // Targets recently marked missing or out of credits go last rather than
  // nowhere: when everything else has failed too, the mark may be stale
  // (credits topped up), and one more try costs less than a failed job.
  const order = [...chain.filter(fresh), ...chain.filter((t) => !fresh(t))];
  let last: unknown = null;
  let exhausted = false;
  for (const target of order) {
    try {
      return await callModel(target, messages, opts);
    } catch (err) {
      if (err instanceof ModelUnavailable) {
        unavailableModels.set(targetKey(target), Date.now());
        console.warn(`[pb-llm] ${targetKey(target)} does not exist for this key, trying the next one`);
        last = err;
        continue;
      }
      if (err instanceof ProviderExhausted) {
        exhaustedProviders.set(target.provider, Date.now());
        console.warn(`[pb-llm] ${targetKey(target)} is out of quota, trying the next deployment`);
        exhausted = true;
        last = err;
        continue;
      }
      throw err;
    }
  }
  if (exhausted) {
    throw new PbPipelineError("The model account is out of quota. Posts cannot be written until it is topped up.", false);
  }
  throw new PbPipelineError(
    `No writing model is available (tried ${chain.map(targetKey).join(", ")}). ${last instanceof Error ? last.message : ""}`.trim(),
    false
  );
}

/** URL and headers for one deployment. The key never leaves this function except in the request itself. */
function requestFor(target: PbTarget): { url: string; headers: Record<string, string> } {
  const az = azureConfig();
  if (!az) throw new ModelUnavailable("Azure OpenAI is not configured.");
  return {
    url: `${az.endpoint}/openai/deployments/${encodeURIComponent(target.model)}/chat/completions?api-version=${AZURE_API_VERSION}`,
    headers: { "Content-Type": "application/json", "api-key": az.key },
  };
}

async function callModel(target: PbTarget, messages: PbChatMessage[], opts: PbChatOptions): Promise<PbChatResult> {
  const model = target.model;
  const where = targetKey(target);
  const { url, headers } = requestFor(target);
  const refused = new Set<Param>(refusedParams.get(where) ?? []);
  let effort = opts.effort;
  let maxTokens = opts.maxTokens;
  let attempt = 0;
  let transientRetries = 0;
  let timeoutRetries = 0;
  let paramFixes = 0;
  let roomRetries = 0;
  let parseRetries = 0;

  const retry = async (why: string, wait: number) => {
    console.warn(`[pb-llm] ${opts.label} on ${where}: ${why}; retrying`);
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
      const res = await fetch(url, {
        method: "POST",
        headers,
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
      opts.onCall?.({ label: opts.label, model: where, attempt, ms, ok: false, error: timedOut ? "timeout" : redact(describeError(err)) });
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
      opts.onCall?.({ label: opts.label, model: where, attempt, ms, ok: false, status, error: `${e.code || e.type || "error"}: ${e.message}`.slice(0, 200) });
      if (isModelUnavailable(e)) throw new ModelUnavailable(e.message);
      const param = refusedParam(e);
      if (param && paramFixes < 4) {
        paramFixes++;
        refused.add(param);
        if (param === "max_tokens") refused.delete("max_completion_tokens");
        if (param === "max_completion_tokens") refused.delete("max_tokens");
        refusedParams.set(where, new Set(refused));
        await retry(`the API refused ${param}`, 0);
        continue;
      }
      if (
        [400, 402, 403, 429].includes(status) &&
        /insufficient_quota|credit_balance|billing|out of credits|quota.*exceeded/i.test(`${e.code} ${e.type} ${e.message}`)
      ) {
        throw new ProviderExhausted(e.message);
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
      opts.onCall?.({ label: opts.label, model: where, attempt, ms, ok: false, status, error: "unreadable response" });
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
      model: where,
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
    // A reply cut off by the limit is not a shorter answer, it is a broken
    // one: a post that stops mid-sentence. Text and JSON alike get more room.
    if (!text || (finish === "length" && (!opts.json || parseJsonLoose(text) === null))) {
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

    if (!opts.json) return { text, json: null, model: where };
    const json = parseJsonLoose(text);
    if (json !== null) return { text, json, model: where };
    if (parseRetries < 1) {
      parseRetries++;
      await retry("the answer was not JSON", 0);
      continue;
    }
    throw new PbPipelineError(`The writing model returned malformed JSON (${opts.label}).`, true);
  }
}
