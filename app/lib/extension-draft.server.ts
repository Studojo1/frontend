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
import { DEFAULT_STYLE } from "~/lib/outreach/email-styles";

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

/** Why the most recent upsert failed, for the route to surface. */
let _lastError: string | null = null;
export function lastDraftError() { return _lastError; }

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
export function composeDraft(
  seed: DraftSeed,
  profile: SenderProfile = {},
  style: string = DEFAULT_STYLE,
) {
  const contact = FIRST_NAME(seed.contactName);
  const company = seed.company || "your team";
  const role = seed.role || "the role";
  const who = profile.name ? profile.name.split(/\s+/)[0] : "a student";
  const at = profile.university ? ` at ${profile.university}` : "";
  const cred = profile.topCredential?.trim();

  // Each style gets its own opener and ask, mirroring what the generator does
  // (email_generator_service.py:24-55). Without this the preview was identical
  // whichever style you picked, which made the picker look broken — and gave
  // no sense of what the sent email would read like.
  const S: Record<string, { open: string; ask: string }> = {
    warm_intro: {
      open: `I saw ${company} is hiring for ${role}, and your name came up as someone actually on the team rather than a careers inbox.`,
      ask: `Would you be open to pointing me in the right direction?`,
    },
    value_prop: {
      open: `I saw ${company} is hiring for ${role}. I've been looking at the kind of problems your team works on and I think I'd be useful on them.`,
      ask: `Is there someone on your team I should be talking to?`,
    },
    company_curiosity: {
      open: `I've been following what ${company} is building, and the ${role} opening was what made me finally write.`,
      ask: `Would you have a few minutes to tell me what your team is actually working on right now?`,
    },
    peer_to_peer: {
      open: `I saw the ${role} role at ${company}. I've been working on similar things myself, so I thought I'd write to a person rather than a form.`,
      ask: `Fancy a quick chat about what you're building?`,
    },
    direct_ask: {
      open: `I'm writing about the ${role} role at ${company}. I'll be direct: I want to work on this and I'd rather ask you than queue behind an application form.`,
      ask: `Do you know if the role is still open, or who I should be speaking to?`,
    },
    coffee_chat: {
      open: `I came across the ${role} opening at ${company}, and then spent longer reading about your own path than about the job.`,
      ask: `Would you be up for a short coffee chat about how you got there?`,
    },
  };
  const chosen = S[style] ?? S[DEFAULT_STYLE];

  // Subject follows the framework's "[credential] → [company]" pattern, but
  // only when the credential is short enough to survive intact. A truncated
  // phrase ("built a fintech newsletter with → Acme") is worse than the plain
  // role line, so fall back rather than ship a half-sentence.
  const shortCredential = cred && cred.length <= 38 ? cred : null;
  const subject = shortCredential
    ? `${shortCredential} → ${trimTo(company, 26)}`
    : `${trimTo(role, 40)} — ${trimTo(company, 26)}`;

  // The bridge is the honest part. With no credential we say less rather than
  // inventing one; the CRM tells the student exactly that and offers the
  // resume upload which fills it in.
  const bridge = cred
    ? `I'm ${who}${at}, and the short version of me is this: ${cred}. I mention it because it is the closest thing I have to evidence that I can do the work rather than just say I want it.`
    : `I'm a student, and I'd rather say something true than something polished: I don't have a decade of experience to point at. What I do have is the willingness to learn ${company}'s problems properly before claiming I can solve them.`;

  const why = seed.contactTitle
    ? `I'm writing to you specifically rather than the careers inbox because you're ${withArticle(seed.contactTitle)} — you'd know what actually separates someone who lasts in ${role} from someone who looks good on paper.`
    : `I'm writing to a person rather than a careers inbox because an application form can't tell me what this team is actually trying to build.`;

  const body = [
    `Hi ${contact},`,
    ``,
    chosen.open,
    ``,
    bridge,
    ``,
    why,
    ``,
    chosen.ask,
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
    // Keep the reason. The route returns it to the extension so the panel can
    // say what actually went wrong instead of "try again", and so this stops
    // being invisible from the outside.
    _lastError = String((e as { message?: string })?.message ?? e).slice(0, 300);
    console.error("[extension-draft] upsert failed:", e);
    return null;
  }
}
