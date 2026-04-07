/**
 * Proxy for career-ops-svc
 * All requests to /api/career-ops/* are forwarded to career-ops-svc
 * with the user's JWT attached.
 */
import type { Route } from "./+types/api.career-ops.$";
import { getSessionFromRequest } from "~/lib/onboarding.server";

const CAREER_OPS_URL = process.env.CAREER_OPS_URL || "http://career-ops-svc:3200";

async function proxy(request: Request, params: Record<string, string>) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = params["*"] || "";
  const url = new URL(request.url);
  const target = `${CAREER_OPS_URL}/api/v1/${slug}${url.search}`;

  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("Content-Type") || "application/json");
  headers.set("Authorization", `Bearer ${session.token}`);

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.text();
  }

  try {
    const upstream = await fetch(target, init);
    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("application/pdf")) {
      const buffer = await upstream.arrayBuffer();
      return new Response(buffer, {
        status: upstream.status,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": upstream.headers.get("Content-Disposition") || 'attachment; filename="cv.pdf"',
        },
      });
    }

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { "Content-Type": contentType || "application/json" },
    });
  } catch (e) {
    console.error("[career-ops proxy] error:", e);
    return Response.json({ error: "Career Ops service unavailable" }, { status: 503 });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  return proxy(request, params);
}

export async function loader({ request, params }: Route.LoaderArgs) {
  return proxy(request, params);
}
