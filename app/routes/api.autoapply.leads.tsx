// POST /api/autoapply/leads — inject pre-approved leads into an outreach campaign
//
// Accepts a payload of LinkedIn profiles (from Apollo, manual list, or any source).
// Inserts them into outreach_contacts and immediately queues step-0 (connection request)
// jobs into the outreach BullMQ queue.
//
// Payload shape:
// {
//   campaignId: string,           // must belong to the authenticated user
//   leads: [
//     {
//       linkedinUrl: string,       // required — full LinkedIn profile URL
//       name?: string,
//       title?: string,
//       company?: string,
//       recentPostSnippet?: string,
//       mutualConnection?: string,
//     }
//   ]
// }

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { eq, and, inArray } from "drizzle-orm";
import db from "~/lib/db";
import { outreachContacts, outreachCampaigns } from "../../auth-schema";
import { outreachQueue } from "~/lib/queues.server";
import type { Route } from "./+types/api.autoapply.leads";

interface LeadInput {
  linkedinUrl: string;
  name?: string;
  title?: string;
  company?: string;
  recentPostSnippet?: string;
  mutualConnection?: string;
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  let body: { campaignId?: string; leads?: LeadInput[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { campaignId, leads } = body;

  if (!campaignId) return Response.json({ error: "campaignId is required" }, { status: 400 });
  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    return Response.json({ error: "leads array is required and must not be empty" }, { status: 400 });
  }

  // Verify campaign belongs to this user and is active
  const [campaign] = await db
    .select()
    .from(outreachCampaigns)
    .where(and(eq(outreachCampaigns.id, campaignId), eq(outreachCampaigns.userId, userId)))
    .limit(1);

  if (!campaign) return Response.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "paused") {
    return Response.json({ error: "Campaign is paused — resume it before adding leads" }, { status: 409 });
  }

  // Normalise and deduplicate LinkedIn URLs
  const validLeads = leads
    .filter((l) => l.linkedinUrl && typeof l.linkedinUrl === "string")
    .map((l) => ({ ...l, linkedinUrl: normaliseLinkedInUrl(l.linkedinUrl) }));

  if (validLeads.length === 0) {
    return Response.json({ error: "No valid LinkedIn URLs in payload" }, { status: 400 });
  }

  // Skip URLs already in outreach_contacts for this user (any campaign)
  const existingRows = await db
    .select({ linkedinUrl: outreachContacts.linkedinUrl })
    .from(outreachContacts)
    .where(eq(outreachContacts.userId, userId));

  const existingUrls = new Set(existingRows.map((r) => r.linkedinUrl));
  const freshLeads = validLeads.filter((l) => !existingUrls.has(l.linkedinUrl));

  if (freshLeads.length === 0) {
    return Response.json({
      ok: true,
      queued: 0,
      skipped: validLeads.length,
      message: "All leads already exist in outreach_contacts",
    });
  }

  // Insert into outreach_contacts
  const inserted = await db
    .insert(outreachContacts)
    .values(
      freshLeads.map((l) => ({
        userId,
        linkedinUrl: l.linkedinUrl,
        name: l.name ?? null,
        title: l.title ?? null,
        company: l.company ?? null,
        recentPostSnippet: l.recentPostSnippet ?? null,
        mutualConnection: l.mutualConnection ?? null,
        sequenceStep: 0,
        status: "pending",
        replied: false,
      }))
    )
    .returning({ id: outreachContacts.id });

  // Immediately enqueue step-0 (connection request) with warmup-aware stagger
  // Spread requests across the day — each job gets a random delay up to 8 hours
  // so they don't all fire at once.
  let enqueued = 0;
  for (const { id } of inserted) {
    await outreachQueue.add(
      "outreach",
      { contactId: id },
      {
        attempts: 2,
        backoff: { type: "exponential", delay: 120_000 },
        delay: Math.random() * 8 * 60 * 60 * 1000, // stagger up to 8h
      }
    );
    enqueued++;
  }

  return Response.json({
    ok: true,
    queued: enqueued,
    skipped: validLeads.length - freshLeads.length,
    total: validLeads.length,
  });
}

function normaliseLinkedInUrl(raw: string): string {
  try {
    const url = new URL(raw.trim());
    // Strip query params and trailing slashes, normalise to www.linkedin.com
    const path = url.pathname.replace(/\/$/, "");
    return `https://www.linkedin.com${path}`;
  } catch {
    // Not a valid URL — return trimmed as-is
    return raw.trim();
  }
}
