import { saveCampusAmbassadorApplication } from "~/lib/campus-ambassador.server";
import { checkEmail } from "~/lib/email-validate";
import type { Route } from "./+types/api.campus-ambassador-apply";

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
  const yearOfStudy = clamp(body.yearOfStudy, 40);
  const whyYou = clamp(body.whyYou, 600);
  // Optional fields
  const course = clamp(body.course);
  const graduationYear = clamp(body.graduationYear, 10);
  const socialHandle = clamp(body.socialHandle, 120);
  const referralSource = clamp(body.referralSource, 60);

  if (!fullName || !whatsapp || !email || !college || !yearOfStudy || !whyYou) {
    return Response.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  // Authoritative email check — the client-side one is bypassable. Rejects typo
  // domains (gmail.cok, gnail.com, ...) and invalid TLDs.
  const emailCheck = checkEmail(email);
  if (!emailCheck.ok) {
    return Response.json(
      { error: emailCheck.error, suggestion: emailCheck.suggestion },
      { status: 400 }
    );
  }

  const { isNew } = await saveCampusAmbassadorApplication({
    fullName,
    whatsapp,
    email,
    college,
    course: course || undefined,
    yearOfStudy,
    graduationYear: graduationYear || undefined,
    socialHandle: socialHandle || undefined,
    whyYou,
    referralSource: referralSource || undefined,
  });

  // Already applied with this email — no duplicate row. Tell the form so it can
  // show a friendly note instead of pretending this was a fresh application.
  if (!isNew) {
    return Response.json({ ok: true, alreadyApplied: true });
  }

  return Response.json({ ok: true });
}
