// Composing the cold email a student will review before sending.
//
// This deliberately does NOT require a candidate_id or a resume. The framework
// in api.outreach.email-chat.tsx reads every sender field through `if (p.x)`
// (see buildStyleContext there), so it degrades rather than fails when the
// student has not onboarded yet. That is what lets the extension put a real,
// editable draft in front of someone the moment they click Apply.
//
// What the page gives us (company, role, contact and their title) covers the
// OPENER. What it cannot know — who the student is and their one best
// credential — is what the express onboarding asks for, and what makes the
// BRIDGE specific instead of generic.
import db from "~/lib/db";
import { extensionDrafts } from "../../auth-schema";
import { and, eq } from "drizzle-orm";

export interface DraftSeed {
  applicationId: string | null;
  company: string;
  role: string;
  jobUrl: string | null;
  contactName: string | null;
  contactTitle: string | null;
  contactEmail: string | null;
}

/** What the student told us about themselves. Every field is optional. */
export interface SenderProfile {
  name?: string | null;
  university?: string | null;
  careerStage?: string | null;
  topCredential?: string | null;
  tone?: "direct" | "warm" | "formal" | null;
}

const FIRST_NAME = (full: string | null) =>
  (full ?? "").trim().split(/\s+/)[0] || "there";

/**
 * A deterministic first draft.
 *
 * Not LLM-generated: this runs inside the Apply request, which the panel is
 * blocking on, and a model call would blow the sub-second budget. The student
 * gets something real and specific immediately; `/api/crm/drafts` regenerates
 * it through the actual framework once they ask for that, which is a
 * background action they are not waiting on.
 */
export function composeDraft(seed: DraftSeed, profile: SenderProfile = {}) {
  const contact = FIRST_NAME(seed.contactName);
  const company = seed.company || "your team";
  const role = seed.role || "the role";

  const subject = profile.topCredential
    ? `${trimTo(profile.topCredential, 34)} → ${trimTo(company, 26)}`
    : `${trimTo(role, 40)} — ${trimTo(company, 26)}`;

  // The bridge is the honest part. With no credential we say less rather than
  // inventing one; the CRM tells the student exactly that and offers the
  // resume upload which fills it in.
  const bridge = profile.topCredential
    ? `I'm ${profile.name ? profile.name.split(/\s+/)[0] : "a student"}${
        profile.university ? ` at ${profile.university}` : ""
      } — ${profile.topCredential}.`
    : `I'm a student and I've been following ${company}.`;

  const why = seed.contactTitle
    ? `I'm reaching out to you specifically because you're ${withArticle(seed.contactTitle)} — you'd know what actually matters for ${role}.`
    : `I'd rather talk to someone on the team than send another application into a queue.`;

  const body = [
    `Hi ${contact},`,
    ``,
    `I saw ${company} is hiring for ${role}.`,
    ``,
    bridge,
    ``,
    why,
    ``,
    `Would you be open to a 15-minute chat?`,
    ``,
    profile.name ? profile.name : "",
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n")
    .trim();

  return { subject, body };
}

function trimTo(s: string, n: number) {
  const t = (s ?? "").trim();
  return t.length <= n ? t : t.slice(0, n - 1).trimEnd() + "…";
}

function withArticle(title: string) {
  const t = title.trim();
  return /^[aeiou]/i.test(t) ? `an ${t}` : `a ${t}`;
}

/**
 * Store the draft. Idempotent on (userId, applicationId): clicking Apply twice
 * on the same posting must not produce two emails to the same person.
 *
 * A draft that has already been sent is never overwritten.
 */
export async function upsertDraft(
  userId: string,
  seed: DraftSeed,
  profile: SenderProfile = {},
): Promise<{ id: string; created: boolean } | null> {
  const { subject, body } = composeDraft(seed, profile);

  try {
    if (seed.applicationId) {
      const [existing] = await db
        .select({ id: extensionDrafts.id, status: extensionDrafts.status })
        .from(extensionDrafts)
        .where(
          and(
            eq(extensionDrafts.userId, userId),
            eq(extensionDrafts.applicationId, seed.applicationId),
          ),
        )
        .limit(1);

      if (existing) {
        // Already sent — leave it alone. Re-applying should not rewrite the
        // record of what actually went out.
        if (existing.status !== "draft") return { id: existing.id, created: false };
        await db
          .update(extensionDrafts)
          .set({ ...seed, subject, body, updatedAt: new Date() })
          .where(eq(extensionDrafts.id, existing.id));
        return { id: existing.id, created: false };
      }
    }

    const [row] = await db
      .insert(extensionDrafts)
      .values({ userId, ...seed, subject, body, status: "draft" })
      .returning({ id: extensionDrafts.id });

    return row ? { id: row.id, created: true } : null;
  } catch (e) {
    // A draft failure must not lose the application. The CRM row is already
    // written by this point; the student can still see the job, just without
    // a prepared email.
    console.error("[extension-draft] upsert failed:", e);
    return null;
  }
}
