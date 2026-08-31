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

  // Subject follows the framework's "[credential] → [company]" pattern, but
  // only when the credential is short enough to survive intact. A truncated
  // phrase ("built a fintech newsletter with → Acme") is worse than the plain
  // role line, so fall back rather than ship a half-sentence.
  const shortCredential =
    profile.topCredential && profile.topCredential.trim().length <= 38
      ? profile.topCredential.trim()
      : null;
  const subject = shortCredential
    ? `${shortCredential} → ${trimTo(company, 26)}`
    : `${trimTo(role, 40)} — ${trimTo(company, 26)}`;

  // The bridge is the honest part. With no credential we say less rather than
  // inventing one; the CRM tells the student exactly that and offers the
  // resume upload which fills it in.
  const bridge = profile.topCredential
    ? `I'm ${profile.name ? profile.name.split(/\s+/)[0] : "a student"}${
        profile.university ? ` at ${profile.university}` : ""
      }, and the short version of me is this: ${profile.topCredential}. I mention it because it is the closest thing I have to evidence that I can do the work rather than just say I want it.`
    : `I'm a student, and I'd rather say something true than something polished: I don't have a decade of experience to point at. What I do have is the willingness to learn ${company}'s problems properly before claiming I can solve them.`;

  const why = seed.contactTitle
    ? `I'm writing to you specifically rather than the careers inbox because you're ${withArticle(seed.contactTitle)} — you'd know what actually separates someone who lasts in ${role} from someone who looks good on paper. That's the part I can't work out from the job description.`
    : `I'm writing to a person rather than a careers inbox because an application form can't tell me what this team is actually trying to build, and that's what I'd want to know before asking anyone to take a chance on me.`;

  const ask = `I'm not asking you to find me a role. Would you be open to a 15-minute chat about what you look for?`;

  const body = [
    `Hi ${contact},`,
    ``,
    `I saw ${company} is hiring for ${role}, and I'd rather reach out properly than add one more application to the pile.`,
    ``,
    bridge,
    ``,
    why,
    ``,
    ask,
    ``,
    profile.name ? profile.name : "",
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n")
    .trim();

  return { subject, body };
}

/** Trim on a word boundary. Cutting mid-word ("newsletter with 2…") reads as
 *  broken software, not brevity. */
function trimTo(s: string, n: number) {
  const t = (s ?? "").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > n * 0.5 ? cut.slice(0, lastSpace) : cut).trimEnd();
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
