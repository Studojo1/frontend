// Acceptance poller — checks LinkedIn Voyager API for new connections
// and updates outreach_contacts status from 'requested' → 'accepted'.
//
// Runs every 2 hours per active user via the maintenance queue.
// No browser launch needed — direct HTTP with li_at + JSESSIONID.
// If JSESSIONID is expired (Voyager 400/401/403), skips gracefully and
// retries next cycle. Extension auto-refreshes cookies every 7 days.

import { eq, and, inArray } from "drizzle-orm";
import db from "~/lib/db";
import { outreachContacts, userLinkedinSessions, autoapplyConfigs } from "../../auth-schema";
import { decrypt } from "~/lib/encrypt.server";
import { logEvent } from "./safety-manager";
import { outreachQueue } from "~/lib/queues.server";

// ── Main entry point ──────────────────────────────────────────────────────────

export async function checkAcceptances(userId: string): Promise<{ accepted: number; skipped: string }> {
  // 1. Load session — need li_at + cookie jar for CSRF token
  const [session] = await db
    .select()
    .from(userLinkedinSessions)
    .where(and(eq(userLinkedinSessions.userId, userId), eq(userLinkedinSessions.isActive, true)))
    .limit(1);

  if (!session?.liAtEncrypted) return { accepted: 0, skipped: "no_session" };

  // 2. Decrypt credentials
  let liAt: string;
  let jsessionId: string | null = null;

  try {
    liAt = await decrypt(session.liAtEncrypted);
  } catch {
    return { accepted: 0, skipped: "decrypt_failed" };
  }

  if (session.cookiesEncrypted) {
    try {
      const cookieJar = await decrypt(session.cookiesEncrypted);
      jsessionId = extractCookieValue(cookieJar, "JSESSIONID");
    } catch {}
  }

  if (!jsessionId) return { accepted: 0, skipped: "no_jsessionid" };

  // 3. Fetch recently added LinkedIn connections via Voyager
  const recentConnections = await fetchRecentConnections(liAt, jsessionId, session.userAgent);
  if (!recentConnections) return { accepted: 0, skipped: "voyager_failed" };

  if (recentConnections.length === 0) return { accepted: 0, skipped: "none" };

  // 4. Load all 'requested' contacts for this user
  const requested = await db
    .select({ id: outreachContacts.id, linkedinUrl: outreachContacts.linkedinUrl, name: outreachContacts.name })
    .from(outreachContacts)
    .where(and(eq(outreachContacts.userId, userId), eq(outreachContacts.status, "requested")));

  if (requested.length === 0) return { accepted: 0, skipped: "no_pending" };

  // 5. Match connections against requested contacts
  // Voyager returns publicIdentifier (the slug) — match against the URL slug
  const newlyAccepted: string[] = [];

  for (const contact of requested) {
    const slug = extractLinkedInSlug(contact.linkedinUrl);
    if (!slug) continue;

    const matched = recentConnections.find(
      (c) => c.publicIdentifier === slug || c.linkedinUrl?.includes(slug)
    );

    if (matched) {
      newlyAccepted.push(contact.id);
      console.log(`[poller] Accepted: ${contact.name ?? slug} (${userId})`);
    }
  }

  if (newlyAccepted.length === 0) return { accepted: 0, skipped: "none" };

  // 6. Update status → accepted and fire intro message jobs immediately
  await db
    .update(outreachContacts)
    .set({
      status: "accepted",
      connectedAt: new Date(),
      sequenceStep: 1,
    })
    .where(inArray(outreachContacts.id, newlyAccepted));

  for (const contactId of newlyAccepted) {
    await outreachQueue.add(
      "outreach",
      { contactId },
      {
        attempts: 2,
        backoff: { type: "exponential", delay: 60_000 },
        // Small delay so the connection is fully established on LinkedIn's side
        delay: 5 * 60_000, // 5 minutes after detection
      }
    );
  }

  await logEvent("acceptances_detected", userId, { count: newlyAccepted.length });
  console.log(`[poller] User ${userId}: ${newlyAccepted.length} new acceptance(s) — messages queued`);

  return { accepted: newlyAccepted.length, skipped: "none" };
}

// ── Run poller for all active users ──────────────────────────────────────────

export async function pollAllUsers(): Promise<void> {
  const active = await db
    .select({ userId: autoapplyConfigs.userId })
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.status, "active"));

  console.log(`[poller] Checking acceptances for ${active.length} active users`);

  // Run sequentially — Voyager calls are cheap but no need to hammer in parallel
  for (const { userId } of active) {
    try {
      const result = await checkAcceptances(userId);
      if (result.accepted > 0) {
        console.log(`[poller] ${userId}: ${result.accepted} accepted`);
      }
    } catch (err: any) {
      console.error(`[poller] Error for user ${userId}:`, err?.message);
    }
  }
}

// ── Voyager: fetch recently added connections ─────────────────────────────────

interface VoyagerConnection {
  publicIdentifier: string;
  linkedinUrl?: string;
  firstName?: string;
  lastName?: string;
  connectedAt?: number; // epoch ms
}

async function fetchRecentConnections(
  liAt: string,
  jsessionId: string,
  userAgent?: string | null,
): Promise<VoyagerConnection[] | null> {
  // Strip quotes from JSESSIONID if present (LinkedIn stores it as "value")
  const csrfToken = jsessionId.replace(/^"|"$/g, "");

  const url = "https://www.linkedin.com/voyager/api/relationships/connectionsList" +
    "?start=0&count=40&sortType=RECENTLY_ADDED";

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "cookie": `li_at=${liAt}; JSESSIONID="${csrfToken}"`,
        "csrf-token": csrfToken,
        "x-restli-protocol-version": "2.0.0",
        "x-li-lang": "en_US",
        "accept": "application/vnd.linkedin.normalized+json+2.1",
        "user-agent": userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "referer": "https://www.linkedin.com/mynetwork/",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (res.status === 400 || res.status === 401 || res.status === 403) {
      console.warn(`[poller] Voyager ${res.status} — JSESSIONID likely expired`);
      return null;
    }

    if (res.status === 429 || res.status === 999) {
      console.warn(`[poller] Voyager rate-limited (${res.status})`);
      return null;
    }

    if (!res.ok) {
      console.warn(`[poller] Voyager non-ok: ${res.status}`);
      return null;
    }

    const data = await res.json() as any;
    return parseConnections(data);
  } catch (err: any) {
    console.error("[poller] Voyager fetch error:", err?.message);
    return null;
  }
}

function parseConnections(data: any): VoyagerConnection[] {
  const connections: VoyagerConnection[] = [];

  // Voyager normalized JSON — elements live at data.elements or included[]
  const elements = data?.elements ?? data?.data?.elements ?? [];

  for (const el of elements) {
    // Each element may have a miniProfile or connectedMember
    const profile = el?.miniProfile ?? el?.connectedMember?.miniProfile ?? el;
    const publicIdentifier = profile?.publicIdentifier ?? el?.publicIdentifier;

    if (!publicIdentifier) continue;

    connections.push({
      publicIdentifier,
      linkedinUrl: `https://www.linkedin.com/in/${publicIdentifier}`,
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      connectedAt: el?.createdAt ?? el?.connectedAt,
    });
  }

  // Also scan the included[] array in case Voyager uses normalized format
  const included = data?.included ?? [];
  for (const item of included) {
    if (item?.$type?.includes("MiniProfile") && item?.publicIdentifier) {
      const alreadyAdded = connections.some(c => c.publicIdentifier === item.publicIdentifier);
      if (!alreadyAdded) {
        connections.push({
          publicIdentifier: item.publicIdentifier,
          linkedinUrl: `https://www.linkedin.com/in/${item.publicIdentifier}`,
          firstName: item.firstName,
          lastName: item.lastName,
        });
      }
    }
  }

  return connections;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractLinkedInSlug(url: string): string | null {
  try {
    const match = url.match(/linkedin\.com\/in\/([^/?#]+)/);
    return match?.[1]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function extractCookieValue(cookieJar: string, name: string): string | null {
  const match = cookieJar.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1] ?? null;
}
