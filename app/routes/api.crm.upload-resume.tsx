// Server-side proxy for the resume upload.
//
// The browser cannot mint the bearer token this endpoint needs without
// importing ~/lib/control-plane, which dynamically imports ~/lib/auth — a
// server-only module carrying better-auth, drizzle and the database client.
// Pulling that into a route's client bundle is what took /crm/setup down with
// "Oops!"; the page died on load, before anyone chose a file.
//
// Doing it here instead means the browser posts a plain multipart form to our
// own origin, and the token never leaves the server.
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { outreachServerFetch } from "~/lib/outreach/server-api";
import { describeError } from "~/lib/error-detail";
import type { Route } from "./+types/api.crm.upload-resume";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export async function action({ request }: Route.ActionArgs) {
  let session = null;
  try {
    session = await getSessionFromRequest(request);
  } catch (e) {
    console.error("[crm.upload] session lookup failed:", e);
  }
  if (!session) return json({ error: "Sign in to Studojo" }, 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "That upload didn't arrive properly. Try again." }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return json({ error: "Choose a PDF or DOCX file." }, 400);
  }

  // The service parses the resume and mints the candidate_id that Send needs.
  // Forwarded as multipart, unchanged.
  const upstream = new FormData();
  upstream.append("file", file, file.name);

  try {
    const data = await outreachServerFetch<{ candidate_id: number; preview?: unknown }>(
      "/candidate/upload",
      { userId: session.user.id, method: "POST", body: upstream, timeout: 60_000 },
    );
    return json({ ok: true, ...data });
  } catch (e: any) {
    const message = describeError(e, "We couldn't read that file. Try a PDF or DOCX.");
    console.error("[crm.upload] failed:", message);
    return json({ error: "upload_failed", message }, 502);
  }
}
