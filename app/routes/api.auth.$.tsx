import { auth } from "~/lib/auth";
import { withRateLimit } from "~/lib/ratelimit.server";
import { addSecurityHeaders } from "~/lib/security-headers.server";
import type { Route } from "./+types/api.auth.$";

// Allowed CORS origins - use exact matching, not substring
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  // Add production origins from environment variable
  ...(process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) || []),
]);

// Helper to add CORS headers with exact origin matching
function addCorsHeaders(response: Response, origin: string | null): Response {
  const headers = new Headers(response.headers);
  
  // Use exact origin matching, not substring matching
  if (origin && ALLOWED_ORIGINS.has(origin)) {
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
    const headers: HeadersInit = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    // Only set origin if it's in the allowed list
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
    return new Response(null, {
      status: 204,
      headers,
    });
  }
  
  // Apply rate limiting to auth endpoints
  return withRateLimit(request, async () => {
    const response = await auth.handler(request);
    const origin = request.headers.get("origin");
    const corsResponse = addCorsHeaders(response, origin);
    return addSecurityHeaders(corsResponse);
  });
}

export async function action({ request }: Route.ActionArgs) {
  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    const headers: HeadersInit = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    // Only set origin if it's in the allowed list
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
    return new Response(null, {
      status: 204,
      headers,
    });
  }
  
  // Apply rate limiting to auth endpoints
  return withRateLimit(request, async () => {
    const response = await auth.handler(request);
    const origin = request.headers.get("origin");
    const corsResponse = addCorsHeaders(response, origin);
    return addSecurityHeaders(corsResponse);
  });
}
