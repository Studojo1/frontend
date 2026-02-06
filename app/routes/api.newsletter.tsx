import { getSessionFromRequest, subscribeToNewsletter } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.newsletter";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, source } = body as { email?: string; source?: string };

  if (!email || typeof email !== "string") {
    return new Response(
      JSON.stringify({ error: "Email is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: "Invalid email format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Get user session if available
  const session = await getSessionFromRequest(request);
  const userId = session?.user?.id;

  try {
    const result = await subscribeToNewsletter(
      email.toLowerCase().trim(),
      userId,
      source || "footer"
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: result.alreadySubscribed
          ? "You're already subscribed!"
          : result.resubscribed
            ? "Welcome back! You've been resubscribed."
            : "Successfully subscribed to newsletter!",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[api.newsletter] Error subscribing to newsletter:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe to newsletter" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

