// Can we actually reach the person this draft is addressed to?
//
// Asked while the student is still editing, because `no_contact_email` is the
// most likely failure of the whole flow — Apollo returns only verified
// addresses and rejects guessed ones — and finding out at Send, after writing
// the email, is the worst possible moment to learn it.
import { and, eq } from "drizzle-orm";
import db from "~/lib/db";
import { extensionDrafts } from "../../auth-schema";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { outreachServerFetch } from "~/lib/outreach/server-api";
import type { Route } from "./+types/api.crm.contact-check";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export async function action({ request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return json({ error: "Sign in to Studojo" }, 401);

  let body: { id?: string; allowLookup?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Malformed request" }, 400);
  }
  if (!body.id) return json({ error: "Which draft?" }, 400);

  // Scope by the SESSION's user id, never one supplied by the client.
  const [draft] = await db
    .select()
    .from(extensionDrafts)
    .where(and(eq(extensionDrafts.userId, session.user.id), eq(extensionDrafts.id, body.id)))
    .limit(1);

  if (!draft) return json({ error: "Not found" }, 404);

  // No contact name means there is nobody to look up — the draft is addressed
  // to a team, not a person.
  if (!draft.contactName) {
    return json({ status: "unknown", message: "", cached: true });
  }

  try {
    const res = await outreachServerFetch<{
      status: string;
      message: string;
      cached: boolean;
    }>("/extension/contact-check", {
      userId: session.user.id,
      method: "POST",
      body: {
        contact_name: draft.contactName,
        company: draft.company ?? "",
        contact_title: draft.contactTitle,
        linkedin_url: draft.jobUrl,
        contact_email: draft.contactEmail,
        // Only spend an Apollo call when the student explicitly asks. Drafting
        // happens far more often than sending, and a lookup on every draft
        // would burn quota on jobs nobody ever emails.
        allow_lookup: body.allowLookup === true,
      },
      timeout: 20000,
    });
    return json(res);
  } catch (e: any) {
    // A failed check must never block writing the email. Degrade to silence
    // rather than showing an error about a feature the student did not ask
    // for.
    console.error("[crm.contact-check] failed:", String(e?.message ?? e).slice(0, 200));
    return json({ status: "unknown", message: "", cached: true });
  }
}
