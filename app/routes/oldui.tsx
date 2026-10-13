import { lazy, Suspense } from "react";
import { isSenseiAppHost } from "~/lib/sensei-ui";
import type { Route } from "./+types/oldui";

// The Sensei workspace in its original look, at <app host>/oldui.
//
// It is the same workspace as the one at "/" (same code, same account, same
// chats): only the look differs, so it never falls behind. Kept so the original
// look stays one click away while the new one is tried on the test app. Which
// look "/" gets is decided in app/lib/sensei-ui.ts.
const BobPage = lazy(() => import("./bob").then((m) => ({ default: m.SenseiApp })));

export async function loader({ request }: Route.LoaderArgs) {
  // Only the workspace hosts have this page; on the marketing sites it does not exist.
  if (!isSenseiAppHost(request.headers.get("host"))) throw new Response("Not Found", { status: 404 });
  return null;
}

export function meta() {
  return [{ title: "Sensei (original look) | Studojo" }, { name: "robots", content: "noindex" }];
}

export default function SenseiOriginalLook() {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}><BobPage ui="old" /></Suspense>;
}
