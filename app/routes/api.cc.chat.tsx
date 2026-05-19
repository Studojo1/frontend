import type { Route } from "./+types/api.cc.chat";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { redirect } from "react-router";

const CC_API = "/api/v1/cc";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/cc");

  const body = await request.json();

  const upstream = await fetch(`${CC_API}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Pass SSE streams straight through so the client gets real-time chunks
  if (upstream.headers.get("content-type")?.includes("text/event-stream")) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
