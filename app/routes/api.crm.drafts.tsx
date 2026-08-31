// Reading, editing and sending an extension-created draft.
//
// Send is the only place a campaign is created. Until a student presses it,
// no email exists anywhere in job-outreach-svc — which is the whole point of
// the draft step.
import { and, desc, eq } from "drizzle-orm";
import db from "~/lib/db";
import { extensionDrafts } from "../../auth-schema";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { outreachFetch } from "~/lib/outreach/api";
import { composeDraft, type SenderProfile } from "~/lib/extension-draft.server";
import type { Route } from "./+types/api.crm.drafts";

const json = (data: unknown, status = 200) => Response.json(data, { status });

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
    );
    await db
      .update(extensionDrafts)
      .set({ subject, body: text, updatedAt: new Date() })
      .where(eq(extensionDrafts.id, draft.id));
    return json({ ok: true, subject, body: text });
  }

  if (body.intent === "save") {
    await db
      .update(extensionDrafts)
      .set({
        subject: (body.subject ?? "").slice(0, 300),
        body: (body.body ?? "").slice(0, 8000),
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

  // Sending needs two things the drafting step deliberately did not: a
  // candidate profile and a connected mailbox. Both are resolved server-side
  // so the client cannot claim someone else's.
  let candidateId: number | null = null;
  let emailAccountId: number | null = null;
  try {
    const order = await outreachFetch<{
      order: { candidate_id?: number; email_account_id?: number } | null;
    }>("/orders/active", { timeout: 8000, maxRetries: 1 });
    candidateId = order?.order?.candidate_id ?? null;
    emailAccountId = order?.order?.email_account_id ?? null;
  } catch {
    /* fall through to the specific errors below */
  }

  if (!emailAccountId) {
    try {
      const acct = await outreachFetch<{ email_account_id?: number; token_valid?: boolean }>(
        "/gmail/oauth/account",
        { timeout: 6000, maxRetries: 1 },
      );
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
        actionUrl: "/outreach/connect/gmail",
      },
      409,
    );
  }

  await db
    .update(extensionDrafts)
    .set({ status: "sending", subject, body: text, updatedAt: new Date() })
    .where(eq(extensionDrafts.id, draft.id));

  try {
    // The student's edited text is handed over as the template. This is the
    // only channel job-outreach-svc offers for controlling the copy — there is
    // no per-email write endpoint.
    const created = await outreachFetch<{ campaign_id: number }>("/campaign/create", {
      method: "POST",
      body: JSON.stringify({
        candidate_id: candidateId,
        email_account_id: emailAccountId,
        name: `${draft.company ?? "Outreach"} — ${draft.role ?? "role"}`.slice(0, 120),
        user_timezone: "Asia/Kolkata",
        selected_styles: ["value_prop"],
        lead_limit: 1,
        subject_template: subject,
        body_template: text,
      }),
      timeout: 20000,
      maxRetries: 1,
    });

    await outreachFetch(`/campaign/${created.campaign_id}/send`, {
      method: "POST",
      timeout: 20000,
      maxRetries: 1,
    });

    await db
      .update(extensionDrafts)
      .set({ status: "sent", campaignId: created.campaign_id, sentAt: new Date() })
      .where(eq(extensionDrafts.id, draft.id));

    return json({ ok: true, campaignId: created.campaign_id });
  } catch (e: any) {
    // Put it back to draft: a failed send must leave something the student can
    // retry, not a row stuck in "sending" forever.
    await db
      .update(extensionDrafts)
      .set({
        status: "draft",
        failureReason: String(e?.body?.detail ?? e?.message ?? e).slice(0, 500),
      })
      .where(eq(extensionDrafts.id, draft.id));
    return json({ error: "send_failed", message: "Could not send just now — try again." }, 502);
  }
}
