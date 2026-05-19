import type { Route } from "./+types/api.cc.session";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { redirect } from "react-router";

const CC_API = "/api/v1/cc";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/cc");

  const upstream = await fetch(`${CC_API}/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
