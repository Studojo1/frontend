// POST /api/extension/apply
//
// The single write endpoint behind "Apply through Studojo" in the extension.
//
// Must return in under a second: the panel is waiting on it. So this route only
// records the application and enqueues work — the campaign creation, contact
// discovery and sending all happen on the queue.
//
// The efficiency argument lives here. When the extension supplies a `contact`
// (it was on a person's profile, a post, or a job page with a "Meet the hiring
// team" block), we already have name/title/company from a page a human loaded.
// The outreach worker then skips the headless-browser profile fetch it would
// otherwise pay for — one fewer Chromium launch, one fewer proxied page load,
// and one fewer automated LinkedIn view against the account's rate limit.
import { outreachFetch } from "~/lib/outreach/api";
import { outreachQueue } from "~/lib/queues.server";
import {
  resolveExtensionToken,
  extJson,
  preflight,
} from "~/lib/extension-auth.server";
import type { Route } from "./+types/api.extension.apply";

const CAREER_AGENT_URL =
  process.env.CAREER_AGENT_URL ?? "http://studojo-career-agent.studojo.svc.cluster.local:8000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";

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
async function writeCrmRow(userId: string, body: ApplyBody, board: string) {
  try {
    await fetch(`${CAREER_AGENT_URL}/jobs/${encodeURIComponent(userId)}`, {
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
  } catch (e) {
    // A CRM write failure must not lose the outreach. Log and continue.
    console.error("[extension.apply] CRM write failed:", e);
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return extJson(request, { error: "Use POST" }, 405);

  const auth = await resolveExtensionToken(request);
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
    gmail = await outreachFetch<GmailAccount>("/gmail/oauth/account", {
      timeout: 6000,
      maxRetries: 1,
    });
  } catch {
    gmail = null;
  }

  if (!gmail?.email_account_id || gmail.token_valid === false) {
    let connectUrl = "/outreach/connect/gmail";
    try {
      const r = await outreachFetch<{ url: string }>("/gmail/oauth/connect-url", {
        timeout: 6000,
        maxRetries: 1,
      });
      if (r?.url) connectUrl = r.url;
    } catch {
      /* fall back to the in-app page */
    }
    // Still record the application — the student did apply.
    await writeCrmRow(auth.userId, body, board);
    return extJson(request, {
      ok: true,
      needsGmail: true,
      connectUrl,
      message: "Saved. Connect Gmail to send outreach for this role.",
    });
  }

  await writeCrmRow(auth.userId, body, board);

  // Hand off. Everything slow happens on the queue. The job id comes back to
  // the extension so a note added on the success screen can be attached to
  // THIS application rather than guessed at.
  const queued = await outreachQueue.add(
    "extension-outreach",
    {
      source: "browser_extension",
      userId: auth.userId,
      emailAccountId: gmail.email_account_id,
      board,
      pageUrl: body.pageUrl,
      job: { role, company, location: body.job?.location, description: body.job?.description, jobId: body.job?.jobId },
      // Present → skip the profile fetch. Absent → worker runs scrapePeopleAtCompany.
      contact: hasContact ? body.contact : null,
      note: body.note?.trim()?.slice(0, 500) || null,
    },
    { attempts: 3, backoff: { type: "exponential", delay: 60_000 } },
  );

  return extJson(request, {
    ok: true,
    // Named to avoid colliding with body.job.jobId, which is the LinkedIn
    // posting id. This one identifies the queued outreach job.
    outreachJobId: queued.id ?? null,
    contactPrefilled: hasContact,
    message: hasContact
      ? `We'll email ${body.contact!.name} at ${company || "this company"} — read straight from the page.`
      : `Finding someone hiring at ${company || "this company"} to reach out to.`,
    crmUrl: "https://studojo.pro/crm",
  });
}
