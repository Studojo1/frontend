import { normaliseSlug } from "~/lib/fellow-view";
import { fellowRateLimit, findFellow } from "~/lib/fellow-page.server";
import { fellowPageHtml, PAGE_HEADERS, type FellowPage } from "~/lib/fellow-page-html.server";

// What a fellow's page addresses answer (fellowship-growth.$slug.tsx for Today, fellowship-growth.$slug_.$tab.tsx
// for the other tabs): the rate limit, then the shell for a fellow who exists, or the "link isn't working" page.
// The slug is the only key, so the response is never cached, indexed or sent on as a referrer.
export async function fellowPageResponse(request: Request, rawSlug: string | undefined, page: FellowPage | null): Promise<Response> {
  const limit = await fellowRateLimit(request);
  if (limit && !limit.allowed) {
    return new Response("Too many requests. Please wait a minute and try again.", {
      status: 429,
      headers: { ...PAGE_HEADERS, "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" },
    });
  }
  const slug = normaliseSlug(rawSlug);
  if (!slug || !page) return new Response(fellowPageHtml("missing"), { status: 404, headers: PAGE_HEADERS });
  try {
    const fellow = await findFellow(slug);
    return new Response(fellow ? fellowPageHtml("ok", page, slug) : fellowPageHtml("missing"), { status: fellow ? 200 : 404, headers: PAGE_HEADERS });
  } catch (e) {
    // Log the code only: the driver's message carries bound values.
    const err = e as { cause?: { code?: string }; code?: string; name?: string };
    console.error("[fellow-page] lookup failed", err?.cause?.code ?? err?.code ?? err?.name ?? "unknown");
    return new Response(fellowPageHtml("error"), { status: 503, headers: PAGE_HEADERS });
  }
}
