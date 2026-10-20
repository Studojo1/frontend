import { data, redirect } from "react-router";
import ProjectPage from "~/components/project-page/page";
import { pageView } from "~/components/project-page/view";
import { isPageHandle, isPageSlug, PAGE_CSP } from "~/lib/project-pages";
import { findLaunch } from "~/lib/project-pages.server";
import type { Route } from "./+types/$handle.$slug";

/**
 * /:handle/:slug: a student's launched project page (studojo.com/ananya/blinkit-vs-instamart).
 * career-agent (/b2cnew) builds the page and writes one row at launch; this
 * route reads it (read only) and draws it. Contract: career-agent
 * docs/b2c8/CONTRACT-PAGES.md. A flat top-level route: every other first
 * segment of the site is a reserved handle (app/lib/project-pages.ts), and a
 * reserved handle, a bad address, or no live row is the site's plain 404.
 * No analytics on these pages: root.tsx leaves them out for routes whose
 * handle says projectPage.
 */

export const handle = { projectPage: true };

/** Contract section 4. Only sent with the page itself: a 404 renders in root's boundary with the site's usual headers. */
export const headers: Route.HeadersFunction = () => ({
  "Content-Security-Policy": PAGE_CSP,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
});

/** The public address: studojo.pro on staging, studojo.com everywhere else. Host, not x-forwarded-host, which a client can set. */
const originOf = (request: Request) => ((request.headers.get("host") ?? "").split(":")[0].toLowerCase() === "studojo.pro" ? "https://studojo.pro" : "https://studojo.com");

const notFound = () => data("Not found", { status: 404 });

export async function loader({ params, request }: Route.LoaderArgs) {
  const handle = params.handle ?? "";
  const slug = params.slug ?? "";
  if (!isPageHandle(handle) || !isPageSlug(slug)) {
    // A link typed or printed in capitals still opens the page.
    const h = handle.toLowerCase();
    const s = slug.toLowerCase();
    if ((h !== handle || s !== slug) && isPageHandle(h) && isPageSlug(s)) throw redirect(`/${h}/${s}`, 301);
    throw notFound();
  }
  const row = await findLaunch(handle, slug);
  const page = row ? pageView(row) : null;
  if (!page) throw notFound();
  return { page, origin: originOf(request) };
}

export function meta({ data: d }: Route.MetaArgs) {
  if (!d) return [{ title: "Page not found | Studojo" }, { name: "robots", content: "noindex, nofollow" }];
  const p = d.page;
  const url = `${d.origin}${p.path}`;
  const title = `${p.title} | ${p.student.name}`;
  const description = p.summary || `${p.kind} by ${p.student.name}, launched on Studojo.`;
  const image = p.cover ? `${d.origin}${p.cover}` : `${d.origin}/og-default.png`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    ...(p.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : [{ tagName: "link", rel: "canonical", href: url }]),
  ];
}

export default function Page({ loaderData: d }: Route.ComponentProps) {
  return <ProjectPage page={d.page} />;
}
