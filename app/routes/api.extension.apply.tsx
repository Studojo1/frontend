// POST /api/extension/apply
//
// The single write endpoint behind "Apply through Studojo" in the extension.
//
// Must return in under a second: the panel is waiting on it. So this route only
// records the application and writes a draft. NOTHING IS SENT HERE — the
// campaign is created when the student presses Send in the CRM, which is what
// makes "review before it goes out" true rather than aspirational.
//
// The efficiency argument lives here. When the extension supplies a `contact`
// (it was on a person's profile, a post, or a job page with a "Meet the hiring
// team" block), we already have name/title/company from a page a human loaded.
// The outreach worker then skips the headless-browser profile fetch it would
// otherwise pay for — one fewer Chromium launch, one fewer proxied page load,
// and one fewer automated LinkedIn view against the account's rate limit.
import { outreachServerFetch } from "~/lib/outreach/server-api";
import { upsertDraft } from "~/lib/extension-draft.server";
import {
  resolveExtensionTokenDetailed,
  extJson,
  preflight,
} from "~/lib/extension-auth.server";
import type { Route } from "./+types/api.extension.apply";

const CAREER_AGENT_URL =
  // Bare service name, resolving in whatever namespace we are deployed to.
  // The previous value pinned `.studojo.svc`, so from the staging namespace it
  // pointed at the wrong cluster address — every CRM write failed silently and
  // the page showed "Nothing saved yet" while the extension said "Saved".
  process.env.CAREER_AGENT_URL ?? "http://studojo-career-agent:8000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";
/** Where the student's browser can reach us. Links sent to the extension are
 *  rendered inside a job board's page, so every one of them must be absolute. */
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN ?? "https://studojo.pro";

/** Board id from the extension → the career agent's `platform` values. */
const PLATFORM: Record<string, string> = {
  linkedin: "LinkedIn",
  naukri: "Naukri",
  indeed: "Indeed",
  wellfound: "Wellfound",
  generic: "Direct",
};

interface ApplyBody {
  board?: string;
  pageKind?: string;
  pageUrl?: string;
  job?: {
    role?: string;
    company?: string;
    location?: string;
    description?: string;
    jobId?: string;
    jobUrl?: string;
    applicants?: string;
    postedAt?: string;
    employmentType?: string;
    salary?: string;
    easyApply?: boolean;
    skills?: string[];
  };
  contact?: {
    linkedinUrl?: string;
    name?: string;
    title?: string;
    company?: string;
    email?: string;
    recentPostSnippet?: string;
    via?: string;
  } | null;
  quality?: { completeness?: number };
  note?: string;
}

/** Log the application to the student's CRM. Never blocks the response. */
async function writeCrmRow(userId: string, body: ApplyBody, board: string): Promise<string | null> {
  try {
    const res = await fetch(`${CAREER_AGENT_URL}/jobs/${encodeURIComponent(userId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_SECRET ? { "x-studojo-internal": INTERNAL_SECRET } : {}),
      },
      body: JSON.stringify({
        company_name: body.job?.company || "(unknown)",
        role: body.job?.role || "(unknown)",
        date_applied: new Date().toISOString().slice(0, 10),
        platform: PLATFORM[board] ?? "Other",
        source: "browser_extension",
        status: "applied",
        contact_name: body.contact?.name || null,
        contact_email: body.contact?.email || null,
        notes: [
          body.note?.trim() ? `Student note: ${body.note.trim().slice(0, 500)}` : null,
          `Logged from the Studojo extension · ${body.pageUrl ?? ""}`.trim(),
        ].filter(Boolean).join("\n"),

        // Signals for analysis. Without these the CRM can only count
        // applications; it cannot show whether emailing a named hiring-team
        // contact actually produces more replies.
        location: body.job?.location || null,
        job_url: body.job?.jobUrl || body.pageUrl || null,
        job_id: body.job?.jobId || null,
        applicants: body.job?.applicants || null,
        contact_url: body.contact?.linkedinUrl || null,
        contact_title: body.contact?.title || null,
        contact_source: body.contact?.via || (body.contact ? "page" : null),
        extraction_quality: body.quality?.completeness ?? null,
        // Everything the extension read, verbatim — new analyses will not need
        // another migration each time the extractor captures more.
        capture: {
          board: body.board,
          pageKind: body.pageKind,
          pageUrl: body.pageUrl,
          job: body.job,
          contact: body.contact,
          quality: body.quality,
          capturedAt: new Date().toISOString(),
        },
      }),
      signal: AbortSignal.timeout(4000),
    });
    // The agent returns the created row (main.py POST /jobs/{student_id}).
    // We used to discard it, which left the CRM page with no way to link an
    // application to its draft.
    const created = (await res.json()) as { id?: string };
    return created?.id ?? null;
  } catch (e) {
    // A CRM write failure must not lose the outreach — but it must not be
    // hidden either. Returning null silently let the extension announce
    // "Saved to your CRM" while the CRM page showed "Nothing saved yet".
    // The caller now reports what actually happened.
    console.error("[extension.apply] CRM write failed:", e);
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return extJson(request, { error: "Use POST" }, 405);

  const authResult = await resolveExtensionTokenDetailed(request);
  if (authResult && "unavailable" in authResult) {
    // Do NOT say "sign in". They may already be signed in; we simply could not
    // check. Sending them to sign in again is a loop with no exit.
    return extJson(
      request,
      { error: "service_unavailable",
        message: "We can't reach your account right now. Try again shortly." },
      503,
    );
  }
  const auth = authResult;
  if (!auth) return extJson(request, { error: "Sign in to Studojo" }, 401);

  let body: ApplyBody;
  try {
    body = await request.json();
  } catch {
    return extJson(request, { error: "Malformed request" }, 400);
  }

  const board = (body.board ?? "generic").toLowerCase();
  const role = body.job?.role?.trim() ?? "";
  const company = body.job?.company?.trim() ?? "";
  const hasContact = Boolean(body.contact?.name);

  if (!company && !role && !hasContact) {
    return extJson(request, { error: "Could not identify this job" }, 400);
  }

  // Low-confidence reads are rejected — unless we have a LinkedIn job id, in
  // which case the worker can fetch full detail server-side.
  const completeness = body.quality?.completeness ?? 0;
  if (completeness < 40 && !body.job?.jobId && !hasContact) {
    return extJson(
      request,
      { error: "Couldn't read enough from this page. Try editing the details." },
      422,
    );
  }

  // Gmail must be connected before we can send as the student.
  //
  // Do not write this as `outreachFetch<typeof gmail>`: at that point `gmail`
  // is initialised to null, so `typeof gmail` is `null`, the generic resolves
  // to `never`, and every field access below silently becomes unreachable.
  type GmailAccount = { email_account_id?: number; token_valid?: boolean };
  let gmail: GmailAccount | null = null;
  try {
    gmail = await outreachServerFetch<GmailAccount>("/gmail/oauth/account", {
      userId: auth.userId,
      timeout: 6000,
    });
  } catch {
    gmail = null;
  }

  if (!gmail?.email_account_id || gmail.token_valid === false) {
    // MUST be absolute. The extension renders this link inside a LinkedIn
    // page, so a relative path resolves against linkedin.com and 404s there
    // (observed: linkedin.com/outreach/connect/gmail).
    // Our own entry point, not the outreach funnel's. It starts the same OAuth
    // flow but returns the student to their draft instead of continuing into
    // campaign setup, which is not what they came here to do.
    let connectUrl = `${PUBLIC_ORIGIN}/crm/connect-gmail`;
    try {
      const r = await outreachServerFetch<{ url: string }>("/gmail/oauth/connect-url", {
        userId: auth.userId,
        timeout: 6000,
      });
      // The service may itself return a relative path; make it absolute here
      // rather than trusting it.
      // Deliberately NOT overriding connectUrl with r.url here. That URL sends
      // the student into the outreach funnel's post-connect steps; ours brings
      // them back to the email they were reading. The call is still made so a
      // service outage surfaces before the student clicks.
      void r;
    } catch {
      /* fall back to the in-app page */
    }
    // Still record the application AND prepare the draft — the student did
    // apply, and Gmail is only needed at Send, not to write the email.
    const applicationId = await writeCrmRow(auth.userId, body, board);
    const draft = await upsertDraft(auth.userId, {
      applicationId,
      company,
      role,
      jobUrl: body.job?.jobUrl || body.pageUrl || null,
      contactName: body.contact?.name ?? null,
      contactTitle: body.contact?.title ?? null,
      contactEmail: body.contact?.email ?? null,
    });
    return extJson(request, {
      ok: true,
      needsGmail: true,
      connectUrl: applicationId
        ? `${connectUrl}?back=${encodeURIComponent(`/crm/${applicationId}`)}`
        : connectUrl,
      applicationId,
      savedToCrm: Boolean(applicationId),
      draftId: draft?.id ?? null,
      message: "Saved. Review your email — connect Gmail when you're ready to send.",
    });
  }

  const applicationId = await writeCrmRow(auth.userId, body, board);

  // NOTHING IS QUEUED HERE ANY MORE.
  //
  // This used to enqueue an outreach job immediately, which meant the email
  // was composed and sent without the student ever seeing it. The draft is now
  // written to Postgres and the campaign is created only when they press Send
  // in the CRM — see app/routes/api.crm.drafts.tsx.
  const draft = await upsertDraft(auth.userId, {
    applicationId,
    company,
    role,
    jobUrl: body.job?.jobUrl || body.pageUrl || null,
    contactName: body.contact?.name ?? null,
    contactTitle: body.contact?.title ?? null,
    contactEmail: body.contact?.email ?? null,
  });

  return extJson(request, {
    ok: true,
    applicationId,
    // Whether the job actually reached the CRM. The panel must not claim a
    // save it cannot back up.
    savedToCrm: Boolean(applicationId),
    draftId: draft?.id ?? null,
    contactPrefilled: hasContact,
    message: hasContact
      ? `Draft ready for ${body.contact!.name} at ${company || "this company"} — review it before it sends.`
      : `Saved. Open your CRM to review the email before it sends.`,
    crmUrl: `${PUBLIC_ORIGIN}/crm`,
  });
}
