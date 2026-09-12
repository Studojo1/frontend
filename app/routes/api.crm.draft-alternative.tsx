// Turn a suggested company into a real draft, addressed to a real person.
//
// The alternatives used to be a LIST OF NAMES. Pranav: "it is not interactive
// it is not usefull what do you think theyll go search for it and if they find
// an open role theyll come apply agaim?" — correct. A student who cannot reach
// Novo is not helped by being told Zolve exists; they are helped by an email
// to a named human at Zolve, already written.
//
// The search that produced the suggestion ALREADY knew the person's name and
// Apollo's id for them. Both were being dropped at the API boundary. With them
// carried through, this route is small: copy the role the student was already
// after, attach the person, compose, save.
import { and, eq } from "drizzle-orm";
import db from "~/lib/db";
import { extensionDrafts } from "../../auth-schema";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { upsertDraft, lastDraftError } from "~/lib/extension-draft.server";


const json = (data: unknown, status = 200) => Response.json(data, { status });

export async function action({ request }: { request: Request }) {
  const session = await getSessionFromRequest(request);
  if (!session) return json({ error: "Sign in to Studojo" }, 401);

  let body: {
    id?: string;             // the draft they are looking at
    company?: string;        // the alternative they clicked
    contactName?: string | null;
    contactTitle?: string | null;
    apolloId?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Malformed request" }, 400);
  }
  if (!body.id || !body.company) return json({ error: "Which company?" }, 400);

  // Scope by the SESSION's user id, never one supplied by the client.
  const [source] = await db
    .select()
    .from(extensionDrafts)
    .where(and(eq(extensionDrafts.userId, session.user.id), eq(extensionDrafts.id, body.id)))
    .limit(1);
  if (!source) return json({ error: "Not found" }, 404);

  // A NEW draft, not an edit of the one they are reading. The original stays
  // exactly as it was: the student may still send it if we later find someone,
  // and silently repointing an email they had already written at a different
  // company would be indefensible.
  //
  // applicationId is null because this came from a suggestion, not from a job
  // page they opened. upsertDraft creates rather than updates in that case.
  const created = await upsertDraft(session.user.id, {
    applicationId: null,
    company: body.company,
    // The same role they were already chasing. The suggestion was matched on
    // it, so it is the role this company is hiring for too. The column is
    // nullable, and composeDraft writes "the role" when it is empty rather
    // than leaving a hole in the sentence.
    role: source.role ?? "",
    location: source.location,
    jobUrl: null,
    contactName: body.contactName ?? null,
    contactTitle: body.contactTitle ?? null,
    contactEmail: null,
    // The alternative's own posting is not on our page, so there is no
    // description to quote. composeDraft degrades to the shorter paragraph
    // rather than inventing one.
    description: null,
  });

  if (!created) {
    return json({ error: lastDraftError() ?? "Could not write that draft" }, 500);
  }
  return json({ id: created.id, company: body.company, contactName: body.contactName ?? null });
}
