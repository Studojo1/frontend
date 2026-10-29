import { fellowPageHtml, PAGE_HEADERS } from "~/lib/fellow-page-html.server";

// Anything else under /fellowship-growth/ (a cut-off or mangled fellow's link)
// gets the fellowship's own "link isn't working" page. The site's 404 would
// load analytics and send them the address, which may hold part of a slug.
export function loader() {
  return new Response(fellowPageHtml("missing"), { status: 404, headers: PAGE_HEADERS });
}
