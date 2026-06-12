import { getEmailerServiceUrl, emailerInternalHeaders } from "~/lib/emailer";
import type { Route } from "./+types/api.contact";

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

  const { name, email, subject, message } = body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  // Validate required fields
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "Name is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!email || typeof email !== "string") {
    return new Response(
      JSON.stringify({ error: "Email is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: "Invalid email format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!subject || typeof subject !== "string") {
    return new Response(
      JSON.stringify({ error: "Subject is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return new Response(
      JSON.stringify({ error: "Message must be at least 10 characters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const base = getEmailerServiceUrl();
    const res = await fetch(`${base}/v1/email/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...emailerInternalHeaders() },
      body: JSON.stringify({
        routing_key: "event.contact.form-submitted",
        event: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          subject,
          message: message.trim(),
        },
      }),
    });

    if (!res.ok) {
      console.error("[api.contact] Emailer service error:", res.status);
      return new Response(
        JSON.stringify({ error: "Failed to send message. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Message sent! We'll get back to you within 24 hours." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[api.contact] Error sending contact form:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
