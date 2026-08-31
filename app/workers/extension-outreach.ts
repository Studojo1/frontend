/*
 * Extension-sourced outreach.
 *
 * Consumes the "extension-outreach" job that api.extension.apply.tsx enqueues
 * when a student clicks "Apply through Studojo" on a job board.
 *
 * THE EFFICIENCY POINT — why this exists separately from runOutreachStep:
 * when the extension already read a named contact off the page the student was
 * looking at, we must NOT pay to discover that person again. runOutreachStep
 * launches headless Chromium through a residential proxy and loads the
 * profile, spending ~30s and one automated LinkedIn page view against the
 * account's rate-limit budget. A contact the student's own browser already
 * rendered costs nothing. So:
 *
 *   contact present  -> insert straight into outreach_contacts, no fetch
 *   contact absent   -> job-outreach-svc sources the lead at Send time
 */
import { eq, and } from "drizzle-orm";
import db from "~/lib/db";
import { outreachContacts } from "../../auth-schema";
import { outreachQueue } from "~/lib/queues.server";

export interface ExtensionOutreachJob {
  source: "browser_extension";
  userId: string;
  emailAccountId?: number | null;
  board: string;
  pageUrl?: string;
  job: {
    role?: string;
    company?: string;
    location?: string;
    description?: string;
    jobId?: string;
  };
  contact: {
    linkedinUrl?: string;
    name?: string;
    title?: string;
    company?: string;
    recentPostSnippet?: string;
    via?: string;
  } | null;
}

export interface ExtensionOutreachResult {
  status:
    | "queued_prefilled"    // contact came from the page — no lookup needed
    | "queued_discovered"   // we searched and found someone
    | "no_contact_found"
    | "duplicate"
    | "invalid";
  contactId?: string;
  discovered?: number;
  savedLookup?: boolean;
}

function normaliseLinkedInUrl(raw?: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    if (!/linkedin\.com$/.test(u.hostname.replace(/^www\./, ""))) return null;
    return `https://www.linkedin.com${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return null;
  }
}

/** Insert a contact, honouring the (userId, linkedinUrl) unique constraint. */
async function upsertContact(
  userId: string,
  c: { linkedinUrl: string; name?: string; title?: string; company?: string; snippet?: string },
): Promise<{ id: string; created: boolean } | null> {
  const existing = await db
    .select({ id: outreachContacts.id })
    .from(outreachContacts)
    .where(and(eq(outreachContacts.userId, userId), eq(outreachContacts.linkedinUrl, c.linkedinUrl)))
    .limit(1);

  if (existing.length) return { id: existing[0].id, created: false };

  const [row] = await db
    .insert(outreachContacts)
    .values({
      userId,
      linkedinUrl: c.linkedinUrl,
      name: c.name ?? null,
      title: c.title ?? null,
      company: c.company ?? null,
      recentPostSnippet: c.snippet ?? null,
      sequenceStep: 0,
      status: "pending",
      replied: false,
    })
    .returning({ id: outreachContacts.id });

  return row ? { id: row.id, created: true } : null;
}

export async function runExtensionOutreach(
  data: ExtensionOutreachJob,
): Promise<ExtensionOutreachResult> {
  const { userId, job, contact } = data;
  if (!userId || (!job?.company && !contact?.name)) return { status: "invalid" };

  // ---- Path A: the extension already gave us a person ---------------------
  if (contact?.name) {
    const url = normaliseLinkedInUrl(contact.linkedinUrl);
    if (!url) {
      // A name with no profile URL cannot be de-duplicated or actioned on
      // LinkedIn, so fall through to discovery rather than storing a stub.
      console.log("[ext-outreach] contact had no usable LinkedIn URL, discovering instead");
    } else {
      const res = await upsertContact(userId, {
        linkedinUrl: url,
        name: contact.name,
        title: contact.title,
        company: contact.company || job.company,
        snippet: contact.recentPostSnippet,
      });
      if (!res) return { status: "invalid" };
      if (!res.created) return { status: "duplicate", contactId: res.id, savedLookup: true };

      await outreachQueue.add(
        "outreach",
        { contactId: res.id },
        { attempts: 2, backoff: { type: "exponential", delay: 120_000 },
          delay: Math.random() * 30 * 60 * 1000 },   // spread, but sooner than the 8h lead path
      );
      return { status: "queued_prefilled", contactId: res.id, savedLookup: true };
    }
  }

  // ---- No contact on the page --------------------------------------------
  //
  // This used to call scrapePeopleAtCompany, which drives LinkedIn's private
  // Voyager API through a proxy using the student's own session cookie. It was
  // the ONLY caller of that function outside the LinkedIn-automation subsystem
  // — the real outreach tool never used it, sourcing leads server-side through
  // /campaign/create instead.
  //
  // Running a second, riskier lead-discovery system for this one path is not
  // worth the account-restriction exposure, so it is gone. A job page with no
  // visible contact now goes through exactly the same route as every other
  // campaign: the student's draft is created from the company and role, and
  // job-outreach-svc finds the lead when they press Send.
  return { status: "no_contact_found" };
}
