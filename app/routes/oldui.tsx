import { lazy, Suspense } from "react";
import { useLoaderData } from "react-router";
import { senseiHostKind } from "~/lib/sensei-ui";
import type { Route } from "./+types/oldui";

// The Sensei workspace, or the team dashboard, in its original look, at
// <host>/oldui (app.studojo.* shows the workspace, dashboard.studojo.* the
// dashboard, the same as each host's root does).
//
// It is the same app as the one at "/" (same code, same account, same data):
// only the look differs, so it never falls behind. Kept so the original look
// stays one click away while the new one is tried on the test hosts. Which look
// "/" gets is decided in app/lib/sensei-ui.ts.
const BobPage = lazy(() => import("./bob").then((m) => ({ default: m.SenseiApp })));
const DashboardPage = lazy(() => import("./dashboard").then((m) => ({ default: m.DashboardApp })));

export async function loader({ request }: Route.LoaderArgs) {
  // Only the Sensei hosts have this page; on the marketing sites it does not exist.
  const app = senseiHostKind(request.headers.get("host"));
  if (!app) throw new Response("Not Found", { status: 404 });
  return { app };
}

export function meta({ data }: Route.MetaArgs) {
  const dashboard = (data as { app?: string } | undefined)?.app === "dashboard";
  return [{ title: dashboard ? "Sensei Dashboard (original look) | Studojo" : "Sensei (original look) | Studojo" }, { name: "robots", content: "noindex" }];
}

export default function SenseiOriginalLook() {
  const { app } = useLoaderData<typeof loader>();
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      {app === "dashboard" ? <DashboardPage ui="old" /> : <BobPage ui="old" />}
    </Suspense>
  );
}
