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

  // No early return for a missing contact name. That used to mean "nobody to
  // look up"; it now means "find whoever hires for this role at this company",
  // which is exactly the case the check is most useful for.

  try {
    const res = await outreachServerFetch<{
      status: string;
      message: string;
      cached: boolean;
      contact_name?: string | null;
      contact_title?: string | null;
      found_by_search?: boolean;
      similar?: { company: string; contact_title?: string | null; industry?: string | null }[];
    }>("/extension/contact-check", {
      userId: session.user.id,
      method: "POST",
      body: {
        contact_name: draft.contactName || null,
        company: draft.company ?? "",
        role: draft.role,
        // Filters alternative suggestions to the student's city.
        location: draft.location,
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
    return json({
      status: res.status,
      message: res.message,
      cached: res.cached,
      contactName: res.contact_name ?? null,
      contactTitle: res.contact_title ?? null,
      foundBySearch: Boolean(res.found_by_search),
      // Only present when this company is unreachable. Advisory — the student
      // chooses; nothing is drafted or redirected for them.
      //
      // MAPPED to camelCase. Passing the service's snake_case straight through
      // would have rendered blank titles: the component reads contactTitle and
      // the service sends contact_title, and a missing key renders as nothing
      // rather than failing loudly.
      similar: (res.similar ?? []).map((c) => ({
        company: c.company,
        contactTitle: c.contact_title ?? null,
        industry: c.industry ?? null,
      })),
    });
  } catch (e: any) {
    // A failed check must never block writing the email. Degrade to silence
    // rather than showing an error about a feature the student did not ask
    // for.
    console.error("[crm.contact-check] failed:", String(e?.message ?? e).slice(0, 200));
    return json({ status: "unknown", message: "", cached: true, similar: [] });
  }
}
