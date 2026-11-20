import type { Route } from "./+types/fellowship-growth.$slug_.$tab";
import { isFellowSubpage, PAGE_DATA_HEADERS } from "~/lib/fellow-page-html.server";
import { fellowPageResponse } from "~/lib/fellow-page-route.server";

// A fellow's other tabs: /fellowship-growth/<slug>/post, /talk, /numbers, /you, and /learn (How LinkedIn
// works). The same shell as Today with its own data-page; anything else after the slug is the fellowship's
// own "link isn't working" page. A resource route, outside root.tsx and its analytics, like Today.

export const headers: Route.HeadersFunction = () => PAGE_DATA_HEADERS;

export function loader({ params, request }: Route.LoaderArgs) {
  return fellowPageResponse(request, params.slug, isFellowSubpage(params.tab) ? params.tab : null);
}
