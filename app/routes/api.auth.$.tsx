import { auth } from "~/lib/auth";
import type { Route } from "./+types/api.auth.$";

// Helper to add CORS headers
function addCorsHeaders(response: Response, origin: string | null): Response {
  const headers = new Headers(response.headers);
  
  if (origin && (
    origin.includes(":3001") || 
    origin.includes("admin") ||
    origin === "http://localhost:3001" ||
    origin === "http://127.0.0.1:3001"
  )) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "http://localhost:3001",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  const response = await auth.handler(request);
  const origin = request.headers.get("origin");
  return addCorsHeaders(response, origin);
}

export async function action({ request }: Route.ActionArgs) {
  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "http://localhost:3001",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  const response = await auth.handler(request);
  const origin = request.headers.get("origin");
  return addCorsHeaders(response, origin);
}
