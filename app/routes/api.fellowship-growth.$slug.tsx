import type { Route } from "./+types/api.fellowship-growth.$slug";
import { API_HEADERS, fellowAt, json, logFailure, tooMany } from "~/lib/fellow-api.server";
import { applyFellowChange, FellowInputError, loadFellowView } from "~/lib/fellow-page.server";

// The Growth Fellowship student page's data: GET returns the fellow's view,
// POST applies one change (copied, own line, posted, numbers, connections, a
// story) and returns the fresh view. The slug in the address is the only key;
// the fellow is never taken from the request body.

// The ".data" spelling of this address runs the same loader and action: send it the same headers.
export const headers: Route.HeadersFunction = () => API_HEADERS;

// A story is up to 8,000 characters, and one character can take up to 4 bytes.
const MAX_BODY = 40 * 1024;

/** The body as text, or null once it passes MAX_BODY: reading stops there, whatever the sender claims. */
async function readCapped(request: Request): Promise<string | null> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel().catch(() => {});
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const limited = await tooMany(request);
    if (limited) return limited;
    const fellow = await fellowAt(params.slug);
    if (fellow instanceof Response) return fellow;
    return json(await loadFellowView(fellow));
  } catch (e) {
    logFailure("load", e);
    return json({ error: "We couldn't load your page just now. Please try again in a minute." }, 503);
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  // JSON only: forces a CORS preflight, so other sites can't post here from a visitor's browser.
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return json({ error: "Unsupported content type" }, 415);
  }
  let body: Record<string, unknown>;
  try {
    const limited = await tooMany(request);
    if (limited) return limited;
    const text = await readCapped(request);
    if (text === null) return json({ error: "That's too long to send." }, 413);
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  try {
    const fellow = await fellowAt(params.slug);
    if (fellow instanceof Response) return fellow;
    try {
      await applyFellowChange(fellow, body);
    } catch (e) {
      if (e instanceof FellowInputError) return json({ error: e.message }, e.status);
      throw e;
    }
    return json(await loadFellowView(fellow));
  } catch (e) {
    logFailure("change", e);
    return json({ error: "We couldn't save that just now. Please try again in a minute." }, 503);
  }
}
