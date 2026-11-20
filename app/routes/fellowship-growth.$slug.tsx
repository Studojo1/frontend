import type { Route } from "./+types/fellowship-growth.$slug";
import { PAGE_DATA_HEADERS } from "~/lib/fellow-page-html.server";
import { fellowPageResponse } from "~/lib/fellow-page-route.server";

// A Growth Fellowship fellow's own page: studojo.com/fellowship-growth/<slug>, the Today tab.
// The other tabs are fellowship-growth.$slug_.$tab.tsx. A resource route (no component), so it
// renders outside root.tsx and its analytics. The slug is the only key, so the response is
// never cached, indexed or sent on as a referrer.

// The ".data" spelling of this address runs the same loader: send it the same privacy headers. Only route
// exports may touch the server module (React Router strips them from the browser build), so no top-level code.
export const headers: Route.HeadersFunction = () => PAGE_DATA_HEADERS;

export function loader({ params, request }: Route.LoaderArgs) {
  return fellowPageResponse(request, params.slug, "today");
}
