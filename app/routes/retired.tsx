import { redirect } from "react-router";
import { RETIRED_TARGET } from "~/lib/retired-routes";

// RELAUNCH (2 Nov 2026): every old product path (app/lib/retired-routes.ts, registered in app/routes.ts) answers a
// permanent redirect to the homepage, for every method, with the query string dropped. Nothing else runs here: no
// session read, no database, no old service.

export function loader() {
  return redirect(RETIRED_TARGET, 301);
}

export function action() {
  return redirect(RETIRED_TARGET, 301);
}

export default function Retired() {
  return null;
}
