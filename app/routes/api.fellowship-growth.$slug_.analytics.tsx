import type { Route } from "./+types/api.fellowship-growth.$slug_.analytics";
import { API_HEADERS, contentType, fellowAt, json, logFailure, readBody, tooMany } from "~/lib/fellow-api.server";
import { addFellowAnalytics, FellowInputError, loadFellowView, MAX_ANALYTICS_BYTES } from "~/lib/fellow-page.server";

// LinkedIn's weekly analytics export for the fellow's whole account: POST with the .xlsx itself as the
// body. The answer is the fresh view, like the page's other changes. Only the .xlsx type is accepted: it
// isn't a type a plain form can send, so other sites can't post here from a visitor's browser.

export const headers: Route.HeadersFunction = () => API_HEADERS;

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function loader() {
  return json({ error: "Method not allowed" }, 405);
}

export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (contentType(request) !== XLSX) return json({ error: "Unsupported content type" }, 415);
  try {
    const limited = await tooMany(request);
    if (limited) return limited;
    const fellow = await fellowAt(params.slug);
    if (fellow instanceof Response) return fellow;
    const file = await readBody(request, MAX_ANALYTICS_BYTES);
    if (file === null) return json({ error: "That file is too big to be LinkedIn's analytics export." }, 413);
    try {
      await addFellowAnalytics(fellow, file);
    } catch (e) {
      if (e instanceof FellowInputError) return json({ error: e.message }, e.status);
      throw e;
    }
    return json(await loadFellowView(fellow));
  } catch (e) {
    logFailure("analytics upload", e);
    return json({ error: "We couldn't save that file just now. Please try again in a minute." }, 503);
  }
}
