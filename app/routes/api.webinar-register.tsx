import { saveWebinarRegistration } from "~/lib/webinar.server";
import type { Route } from "./+types/api.webinar-register";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clamp(v: unknown, max = 200): string {
  return String(v ?? "").trim().slice(0, max);
}

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

  const fullName = clamp(body.fullName);
  const whatsapp = clamp(body.whatsapp, 30);
  const email = clamp(body.email).toLowerCase();
  const college = clamp(body.college);
  const course = clamp(body.course);
  const yearOfStudy = clamp(body.yearOfStudy, 40);
  // Optional fields
  const specialisation = clamp(body.specialisation);
  const graduationYear = clamp(body.graduationYear, 10);
  const lifeStage = clamp(body.lifeStage, 60);
  const referralSource = clamp(body.referralSource, 60);

  if (!fullName || !whatsapp || !email || !college || !course || !yearOfStudy) {
    return Response.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { isNew } = await saveWebinarRegistration({
    fullName,
    whatsapp,
    email,
    college,
    course,
    specialisation: specialisation || undefined,
    yearOfStudy,
    graduationYear: graduationYear || undefined,
    lifeStage: lifeStage || undefined,
    referralSource: referralSource || undefined,
  });

  // Already registered with this email — don't create a duplicate row and don't
  // re-send the confirmation email. Tell the form so it can show a friendly note.
  if (!isNew) {
    return Response.json({ ok: true, alreadyRegistered: true });
  }

  // Fire the instant "registration confirmed" email. The join link is sent
  // separately by the emailer's daily cron, one day before the webinar.
  // Non-blocking: a failed email must never fail the registration.
  try {
    const { publishEmailEvent } = await import("~/lib/events");
    await publishEmailEvent("event.cc.webinar_registered", {
      email,
      name: fullName,
    });
  } catch (err) {
    console.error("Failed to publish webinar_registered event:", err);
  }

  return Response.json({ ok: true });
}
