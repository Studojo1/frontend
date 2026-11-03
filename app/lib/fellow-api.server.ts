import { normaliseSlug } from "~/lib/fellow-view";
import { fellowRateLimit, findFellow } from "~/lib/fellow-page.server";

// What the fellow page's API routes share: their headers, JSON answers, logging, the rate limit and
// finding the fellow from the address. The slug in the address is the only key; the fellow is never
// taken from the request body.

export const API_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: API_HEADERS });

export function logFailure(where: string, e: unknown) {
  // Never log the error itself: the driver's message carries every bound value.
  const err = e as { cause?: { code?: string }; code?: string; name?: string };
  console.error(`[fellow-api] ${where} failed`, err?.cause?.code ?? err?.code ?? err?.name ?? "unknown");
}

export async function tooMany(request: Request) {
  const limit = await fellowRateLimit(request);
  return limit && !limit.allowed ? json({ error: "Too many requests. Please wait a minute and try again." }, 429) : null;
}

export async function fellowAt(rawSlug: string | undefined) {
  const slug = normaliseSlug(rawSlug);
  const fellow = slug ? await findFellow(slug) : null;
  return fellow ?? json({ error: "This link isn't working. Ask the Studojo team for your link." }, 404);
}
