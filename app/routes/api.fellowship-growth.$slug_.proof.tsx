import type { Route } from "./+types/api.fellowship-growth.$slug_.proof";
import { API_HEADERS, fellowAt, json, logFailure, tooMany } from "~/lib/fellow-api.server";
import { addFellowImage, FellowInputError, loadFellowView, MAX_IMAGE_BYTES, readFellowImage, removeFellowImage } from "~/lib/fellow-page.server";
import type { ImageKind } from "~/lib/fellow-view";

// A fellow's own images, one post at a time: analytics screenshots (?post=<id>&shot=<token>) and the
// photos that go out with their posts (?post=<id>&photo=<token>; POST with ?post=<id>&kind=photo).
// GET shows one, POST adds one (the JPEG itself as the body), DELETE removes one. POST and DELETE answer
// with the fresh view, like the page's other changes. Only image/jpeg is accepted: it isn't a type a
// plain form can send, so other sites can't post here from a visitor's browser.

export const headers: Route.HeadersFunction = () => API_HEADERS;

const IMAGE_HEADERS: Record<string, string> = {
  ...API_HEADERS,
  "Cache-Control": "private, no-store",
  "Content-Type": "image/jpeg",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'",
};

/** Which kind, and which one: ?photo=<token> or kind=photo means a photo, anything else a screenshot. */
function which(q: URLSearchParams): { kind: ImageKind; token: string | null } {
  if (q.has("photo") || q.get("kind") === "photo") return { kind: "photo", token: q.get("photo") };
  return { kind: "shot", token: q.get("shot") };
}

/** The body's bytes, or null once it passes MAX_IMAGE_BYTES: reading stops there, whatever the sender claims. */
async function readImage(request: Request): Promise<Uint8Array | null> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES) return null;
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_IMAGE_BYTES) {
      await reader.cancel().catch(() => {});
      return null;
    }
    parts.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.byteLength; }
  return out;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const limited = await tooMany(request);
    if (limited) return limited;
    const fellow = await fellowAt(params.slug);
    if (fellow instanceof Response) return fellow;
    const q = new URL(request.url).searchParams;
    const { kind, token } = which(q);
    let image: Uint8Array | null;
    try {
      image = await readFellowImage(kind, fellow, q.get("post"), token);
    } catch (e) {
      if (e instanceof FellowInputError) return json({ error: e.message }, e.status);
      throw e;
    }
    if (!image) return json({ error: kind === "photo" ? "That photo isn't on this post." : "That screenshot isn't on this post." }, 404);
    return new Response(new Blob([image as Uint8Array<ArrayBuffer>]), { headers: { ...IMAGE_HEADERS, "Content-Length": String(image.byteLength) } });
  } catch (e) {
    logFailure("image read", e);
    return json({ error: "We couldn't load that picture just now. Please try again in a minute." }, 503);
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST" && request.method !== "DELETE") return json({ error: "Method not allowed" }, 405);
  if (request.method === "POST" && (request.headers.get("content-type") ?? "").toLowerCase().split(";")[0].trim() !== "image/jpeg") {
    return json({ error: "Unsupported content type" }, 415);
  }
  try {
    const limited = await tooMany(request);
    if (limited) return limited;
    const fellow = await fellowAt(params.slug);
    if (fellow instanceof Response) return fellow;
    const q = new URL(request.url).searchParams;
    const { kind, token } = which(q);
    try {
      if (request.method === "POST") {
        const image = await readImage(request);
        if (image === null) return json({ error: "That picture is too big to send." }, 413);
        await addFellowImage(kind, fellow, q.get("post"), image);
      } else {
        await removeFellowImage(kind, fellow, q.get("post"), token);
      }
    } catch (e) {
      if (e instanceof FellowInputError) return json({ error: e.message }, e.status);
      throw e;
    }
    return json(await loadFellowView(fellow));
  } catch (e) {
    logFailure(request.method === "POST" ? "image upload" : "image remove", e);
    return json({ error: "We couldn't save that picture just now. Please try again in a minute." }, 503);
  }
}
