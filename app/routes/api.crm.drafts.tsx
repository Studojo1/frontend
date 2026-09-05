// Reading, editing and sending an extension-created draft.
//
// Send is the only place a campaign is created. Until a student presses it,
// no email exists anywhere in job-outreach-svc — which is the whole point of
// the draft step.
import { and, desc, eq } from "drizzle-orm";
import db from "~/lib/db";
import { extensionDrafts } from "../../auth-schema";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { outreachServerFetch } from "~/lib/outreach/server-api";
import { composeDraft, type SenderProfile } from "~/lib/extension-draft.server";
import { isKnownStyle } from "~/lib/outreach/email-styles";
import { describeError } from "~/lib/error-detail";
import type { Route } from "./+types/api.crm.drafts";

const json = (data: unknown, status = 200) => Response.json(data, { status });

// describeError lives in ~/lib/error-detail — shared, so every caller that
// renders an API error inherits the same handling.

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return json({ error: "Sign in to Studojo" }, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // Always scope by the SESSION's user id, never one supplied by the client.
  const rows = await db
    .select()
    .from(extensionDrafts)
    .where(
      id
        ? and(eq(extensionDrafts.userId, session.user.id), eq(extensionDrafts.id, id))
        : eq(extensionDrafts.userId, session.user.id),
    )
    .orderBy(desc(extensionDrafts.createdAt))
    .limit(id ? 1 : 100);

  return json({ ok: true, drafts: rows });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return json({ error: "Sign in to Studojo" }, 401);

  let body: {
    id?: string;
    intent?: "save" | "send" | "regenerate";
    subject?: string;
    body?: string;
    emailStyle?: string;
    profile?: SenderProfile;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Malformed request" }, 400);
  }

  if (!body.id) return json({ error: "Which draft?" }, 400);

  const [draft] = await db
    .select()
    .from(extensionDrafts)
    .where(and(eq(extensionDrafts.userId, session.user.id), eq(extensionDrafts.id, body.id)))
    .limit(1);

  if (!draft) return json({ error: "Not found" }, 404);

  // A sent email cannot be unsent, so it cannot be edited either. Saying so is
  // better than accepting the edit and silently doing nothing with it.
  if (draft.status !== "draft") {
    return json(
      { error: "This email has already been sent.", status: draft.status },
      409,
    );
  }

  if (body.intent === "regenerate") {
    const { subject, body: text } = composeDraft(
      {
        applicationId: draft.applicationId,
        company: draft.company ?? "",
        role: draft.role ?? "",
        jobUrl: draft.jobUrl,
        contactName: draft.contactName,
        contactTitle: draft.contactTitle,
        contactEmail: draft.contactEmail,
      },
      body.profile ?? {},
      isKnownStyle(body.emailStyle) ? body.emailStyle! : draft.emailStyle,
    );
    await db
      .update(extensionDrafts)
      .set({
        subject,
        body: text,
        ...(isKnownStyle(body.emailStyle) ? { emailStyle: body.emailStyle } : {}),
        updatedAt: new Date(),
      })
      .where(eq(extensionDrafts.id, draft.id));
    return json({ ok: true, subject, body: text });
  }

  if (body.intent === "save") {
    await db
      .update(extensionDrafts)
      .set({
        subject: (body.subject ?? "").slice(0, 300),
        body: (body.body ?? "").slice(0, 8000),
        // Ignore an unknown id rather than storing something the generator
        // would silently fall back on.
        ...(isKnownStyle(body.emailStyle) ? { emailStyle: body.emailStyle } : {}),
        updatedAt: new Date(),
      })
      .where(eq(extensionDrafts.id, draft.id));
    return json({ ok: true });
  }

  if (body.intent !== "send") return json({ error: "Unknown intent" }, 400);

  // ---- Send -------------------------------------------------------------
  const subject = (body.subject ?? draft.subject ?? "").trim();
  const text = (body.body ?? draft.body ?? "").trim();
  if (!subject || !text) return json({ error: "Add a subject and a message first." }, 400);

  // Without a named person there is nobody to look up and nobody to send to.
  // Caught HERE rather than at the service, which rejects an empty
  // contact_name as a 422 validation error — technically correct, useless to
  // read, and the reason this surfaced as "[object Object]".
  //
  // The draft is still worth keeping: the extension could not find a contact
  // on that page, but the same job posted elsewhere often names one.
  if (!draft.contactName?.trim()) {
    return json(
      {
        error: "no_contact",
        message:
          "This job didn't show us a person to write to, so there's no one to send it to yet. Your draft is saved.",
      },
      409,
    );
  }

  // Sending needs two things the drafting step deliberately did not: a
  // candidate profile and a connected mailbox. Both are resolved server-side
  // so the client cannot claim someone else's.
  let candidateId: number | null = null;
  let emailAccountId: number | null = null;
  try {
    const order = await outreachServerFetch<{
      order: { candidate_id?: number; email_account_id?: number } | null;
    }>("/orders/active", { userId: session.user.id, timeout: 8000 });
    candidateId = order?.order?.candidate_id ?? null;
    emailAccountId = order?.order?.email_account_id ?? null;
  } catch {
    /* fall through to the specific errors below */
  }

  if (!emailAccountId) {
    try {
      const acct = await outreachServerFetch<{ email_account_id?: number; token_valid?: boolean }>("/gmail/oauth/account", { userId: session.user.id, timeout: 6000 });
      if (acct?.email_account_id && acct.token_valid !== false) {
        emailAccountId = acct.email_account_id;
      }
    } catch {
      /* handled below */
    }
  }

  // Be specific about what is missing. "Failed to send" tells a student
  // nothing they can act on.
  if (!candidateId) {
    return json(
      {
        error: "needs_profile",
        message: "Add your resume so we know what to say about you.",
        actionUrl: "/crm/setup",
      },
      409,
    );
  }
  if (!emailAccountId) {
    return json(
      {
        error: "needs_gmail",
        message: "Connect Gmail so this sends from your own address.",
        // Our entry point: returns them to THIS draft rather than continuing
        // into the outreach funnel's campaign setup.
        actionUrl: `/crm/connect-gmail?back=${encodeURIComponent(
          draft.applicationId ? `/crm/${draft.applicationId}` : "/crm",
        )}`,
      },
      409,
    );
  }

  await db
    .update(extensionDrafts)
    .set({ status: "sending", subject, body: text, updatedAt: new Date() })
    .where(eq(extensionDrafts.id, draft.id));

  try {
    // ONE email, to the person on the job page, in the student's own words.
    //
    // This used to call /campaign/create, which could do neither of those
    // things: it picks recipients with `Lead.candidate_id == candidate_id`
    // ordered by score (campaign_service.py:104), so lead_limit=1 emailed the
    // student's top-scored EXISTING lead — a stranger — and it always
    // AI-generates, because blank selected_styles defaults to two styles
    // (routes_campaign.py:258-260), so the edited text was discarded.
    //
    // /extension/send-one resolves the contact's verified address via the same
    // Apollo lookup enrichment uses, sends the exact subject and body through
    // the student's Gmail, and charges 1 credit only after Gmail confirms.
    const sent = await outreachServerFetch<{
      sent: boolean;
      to_email: string;
      credits_charged: number;
    }>("/extension/send-one", {
      userId: session.user.id,
      method: "POST",
      body: {
        contact_name: draft.contactName ?? "",
        company: draft.company ?? "",
        contact_title: draft.contactTitle,
        linkedin_url: draft.jobUrl,
        contact_email: draft.contactEmail,
        subject,
        body: text,
      },
      timeout: 30000,
    });

    await db
      .update(extensionDrafts)
      .set({
        status: "sent",
        contactEmail: sent.to_email ?? draft.contactEmail,
        sentAt: new Date(),
        failureReason: null,
      })
      .where(eq(extensionDrafts.id, draft.id));

    return json({ ok: true, toEmail: sent.to_email, creditsCharged: sent.credits_charged });
  } catch (e: any) {
    // Put it back to draft: a failed send must leave something to retry.
    // FastAPI returns `detail` as a STRING for our own HTTPExceptions but as
    // an ARRAY OF OBJECTS for request-validation failures. String() on the
    // array produced "[object Object]" — which told the student nothing and
    // told me nothing either, hiding the actual cause for a full round trip.
    const raw = describeError(e).slice(0, 500);
    const status = Number(e?.status) || 0;
    console.error(`[crm.send] failed (${status || "no status"}): ${raw}`);

    await db
      .update(extensionDrafts)
      .set({ status: "draft", failureReason: raw })
      .where(eq(extensionDrafts.id, draft.id));

    // The service prefixes actionable failures with a machine-readable code so
    // the student gets a specific next step rather than "try again", which is
    // only honest when a retry can actually help.
    const [code, ...rest] = raw.split(":");
    const detail = rest.join(":").trim() || raw;
    const known: Record<string, { message: string; actionUrl?: string }> = {
      needs_profile: {
        message: "Add your resume so we know what to say about you.",
        actionUrl: "/crm/setup",
      },
      needs_gmail: {
        message: "Connect Gmail so this sends from your own address.",
        actionUrl: `/crm/connect-gmail?back=${encodeURIComponent(
          draft.applicationId ? `/crm/${draft.applicationId}` : "/crm",
        )}`,
      },
      needs_credits: { message: detail, actionUrl: "/outreach/enrichment" },
      no_contact_email: { message: detail },
      // The service-side kill switch. Not an error the student caused, so it
      // says so plainly rather than blaming their draft.
      send_paused: { message: "Sending is paused right now. Your draft is saved — try again shortly." },
      lookup_unavailable: { message: detail },
      lookup_failed: { message: detail },
      send_failed: { message: detail },
    };

    const mapped = known[code.trim()];
    if (mapped) {
      return json({ error: code.trim(), message: mapped.message, actionUrl: mapped.actionUrl }, 409);
    }
    return json(
      {
        error: "send_failed",
        status,
        message: raw ? `Couldn't send: ${raw}` : "Couldn't send just now — try again.",
      },
      502,
    );
  }
}
