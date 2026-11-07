import type { Route } from "./+types/api.fellowship-growth.$slug_.stock";
import { API_HEADERS, fellowAt, json, logFailure, tooMany } from "~/lib/fellow-api.server";
import { FellowInputError, stockPicks } from "~/lib/fellow-page.server";

// Stock images for one of a fellow's posts (?post=<id>), offered when they have no photo of their own.
// Choosing one is a change like any other: the "stock-use" intent on the page's own address.

export const headers: Route.HeadersFunction = () => API_HEADERS;

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const limited = await tooMany(request);
    if (limited) return limited;
    const fellow = await fellowAt(params.slug);
    if (fellow instanceof Response) return fellow;
    try {
      return json({ stock: await stockPicks(fellow, new URL(request.url).searchParams.get("post")) });
    } catch (e) {
      if (e instanceof FellowInputError) return json({ error: e.message }, e.status);
      throw e;
    }
  } catch (e) {
    logFailure("stock images", e);
    return json({ error: "We couldn't get a stock image just now. Try again in a minute, or add your own photo." }, 503);
  }
}
