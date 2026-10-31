/**
 * Chat completions on Azure OpenAI: the one way this app reaches an OpenAI
 * model. The direct OpenAI key was retired on 2026-10-12, so every call goes
 * to the studoclaw Azure OpenAI resource (AZURE_OPENAI_ENDPOINT and
 * AZURE_OPENAI_API_KEY, both from app-secrets).
 *
 * Callers build the same body they would have sent to OpenAI. `model` picks
 * the Azure deployment and is not sent (Azure ignores it anyway). The raw
 * Response comes back, so each caller keeps its own status, JSON and fallback
 * handling exactly as it was.
 *
 * app/workers/prescreen.ts, app/routes/api.autoapply.answers.tsx and
 * app/lib/pb/llm.server.ts talk to the same resource with their own clients.
 */

export const AZURE_OPENAI_API_VERSION = "2024-10-21";

function endpoint(): string {
  return (process.env.AZURE_OPENAI_ENDPOINT ?? "").trim().replace(/\/+$/, "");
}

function apiKey(): string {
  return (process.env.AZURE_OPENAI_API_KEY ?? "").trim();
}

/** Read on every call, so a pod and a test both see the current environment. */
export function azureOpenAIConfigured(): boolean {
  return Boolean(endpoint() && apiKey());
}

/** The Azure deployment that serves an OpenAI model name. */
export function azureDeploymentFor(model: string): string {
  if (model === "gpt-4o-mini") {
    return process.env.AZURE_OPENAI_MINI_DEPLOYMENT?.trim() || "gpt-4o-mini";
  }
  if (model === "gpt-4o") {
    return process.env.AZURE_OPENAI_CHAT_DEPLOYMENT?.trim() || "gpt-4o-mini";
  }
  return model;
}

export async function azureChatCompletions(
  body: { model: string } & Record<string, unknown>,
  init: { signal?: AbortSignal } = {}
): Promise<Response> {
  const base = endpoint();
  const key = apiKey();
  if (!base || !key) {
    throw new Error("Azure OpenAI is not configured (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY).");
  }
  const { model, ...rest } = body;
  const deployment = encodeURIComponent(azureDeploymentFor(model));
  return fetch(
    `${base}/openai/deployments/${deployment}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": key },
      signal: init.signal,
      body: JSON.stringify(rest),
    }
  );
}
