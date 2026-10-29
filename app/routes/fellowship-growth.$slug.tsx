import type { Route } from "./+types/fellowship-growth.$slug";
import { normaliseSlug } from "~/lib/fellow-view";
import { findFellow } from "~/lib/fellow-page.server";
import { fellowPageHtml, PAGE_HEADERS } from "~/lib/fellow-page-html.server";
import { checkRateLimit } from "~/lib/ratelimit.server";

// A Growth Fellowship fellow's own page: studojo.com/fellowship-growth/<slug>.
// A resource route (no component), so it renders outside root.tsx and its
// analytics. The slug is the only key, so the response is never cached,
// indexed or sent on as a referrer.

export async function loader({ params, request }: Route.LoaderArgs) {
  const limit = await checkRateLimit(request);
  if (limit && !limit.allowed) {
    return new Response("Too many requests. Please wait a minute and try again.", {
      status: 429,
      headers: { ...PAGE_HEADERS, "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" },
    });
  }
  const slug = normaliseSlug(params.slug);
  if (!slug) return new Response(fellowPageHtml("missing"), { status: 404, headers: PAGE_HEADERS });
  try {
    const fellow = await findFellow(slug);
    return new Response(fellowPageHtml(fellow ? "ok" : "missing"), { status: fellow ? 200 : 404, headers: PAGE_HEADERS });
  } catch (e) {
    // Log the code only: the driver's message carries bound values.
    const err = e as { cause?: { code?: string }; code?: string; name?: string };
    console.error("[fellow-page] lookup failed", err?.cause?.code ?? err?.code ?? err?.name ?? "unknown");
    return new Response(fellowPageHtml("error"), { status: 503, headers: PAGE_HEADERS });
  }
}
