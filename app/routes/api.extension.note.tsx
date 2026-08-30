// Attach a note to an application the student has already submitted.
//
// The note used to be a field on the panel BEFORE applying, which made the
// card read as a form to fill in. It is now offered on the success screen, so
// the student commits first and adds context second — and most will skip it,
// which is the right default.
import { outreachQueue } from "~/lib/queues.server";
import {
  resolveExtensionToken,
  extJson,
  preflight,
} from "~/lib/extension-auth.server";
import type { Route } from "./+types/api.extension.note";

export async function loader({ request }: Route.LoaderArgs) {
  return preflight(request);
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return extJson(request, { error: "Use POST" }, 405);

  const auth = await resolveExtensionToken(request);
  if (!auth) return extJson(request, { error: "Sign in to Studojo" }, 401);

  let body: { outreachJobId?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return extJson(request, { error: "Malformed request" }, 400);
  }

  const note = (body.note ?? "").trim().slice(0, 500);
  if (!note) return extJson(request, { error: "Nothing to add" }, 400);
  if (!body.outreachJobId) return extJson(request, { error: "Unknown application" }, 400);

  const job = await outreachQueue.getJob(body.outreachJobId);
  if (!job) {
    // The job already ran. The draft is written, so a note cannot change it —
    // say so plainly rather than pretending it was saved.
    return extJson(request, { ok: false, tooLate: true,
      message: "That email has already been drafted." }, 409);
  }

  // Only the owner may amend their own application.
  if (job.data?.userId !== auth.userId) {
    return extJson(request, { error: "Not your application" }, 403);
  }

  await job.updateData({ ...job.data, note });
  return extJson(request, { ok: true, message: "Added to your email." });
}
