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

  if (!fullName || !whatsapp || !email || !college || !course || !yearOfStudy) {
    return Response.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  await saveWebinarRegistration({
    fullName,
    whatsapp,
    email,
    college,
    course,
    specialisation: specialisation || undefined,
    yearOfStudy,
    graduationYear: graduationYear || undefined,
    lifeStage: lifeStage || undefined,
  });

  return Response.json({ ok: true });
}
