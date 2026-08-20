import { saveSenseiDemoRequest } from "~/lib/sensei-demo.server";
import type { Route } from "./+types/api.sensei-demo";

const FREE_MAIL = new Set([
  "gmail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com",
  "live.com", "icloud.com", "rediffmail.com", "proton.me", "protonmail.com",
]);

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body?.name || "").trim();
  const workEmail = String(body?.workEmail || "").trim().toLowerCase();
  const organisation = String(body?.organisation || "").trim();

  if (!name || !workEmail || !organisation) {
    return Response.json(
      { error: "Name, work email and organisation are required." },
      { status: 400 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(workEmail)) {
    return Response.json({ error: "That email address does not look right." }, { status: 400 });
  }

  // A soft nudge, not a wall: plenty of small institutes genuinely run on Gmail,
  // so this is returned as guidance and the request is still accepted below if
  // they resubmit. Rejecting outright would lose real leads.
  const domain = workEmail.split("@")[1] || "";
  if (FREE_MAIL.has(domain) && !body?.allowPersonalEmail) {
    return Response.json(
      { error: "Please use your work email so we can find your organisation. Resend to use this address anyway.", needsConfirm: true },
      { status: 400 },
    );
  }

  try {
    await saveSenseiDemoRequest({
      name,
      workEmail,
      organisation,
      phone: String(body?.phone || "").trim() || undefined,
      cohortSize: String(body?.cohortSize || "").trim() || undefined,
      note: String(body?.note || "").trim().slice(0, 2000) || undefined,
      source: String(body?.source || "sensei-page").slice(0, 60),
    });
  } catch (e) {
    // Never show a stack trace to a prospect on a marketing page.
    console.error("[sensei-demo] save failed", e);
    return Response.json(
      { error: "Something went wrong saving that. Please email admin@studojo.com and we will pick it up." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
