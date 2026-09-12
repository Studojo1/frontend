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
  // The job's location. Stored so alternative-company suggestions can be
  // filtered to the student's city.
  location?: string | null;
  /** The posting's own text — "About the job". Extracted on LinkedIn, Naukri
   *  and Indeed alike, and until now thrown away at this boundary, which is
   *  why every draft was assembled from company + role + contact title and
   *  read like a template with names slotted in. */
  description?: string | null;
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

/* Lines every posting has and no student should quote back.
   Naming one of these is worse than naming nothing: it proves the sender
   pattern-matched a job ad instead of reading it. */
const BOILERPLATE = /equal opportunity|regardless of race|competitive salary|fast[- ]paced|rockstar|ninja|self[- ]starter|team player|excellent communication|roles? and responsibilit|about the compan|who we are|what we offer|benefits|perks|apply now|click here|send your (cv|resume)|bachelor'?s degree|years of experience|must have|good to have|we are looking for a|the ideal candidate|notice period|work from office|shifts?|rotational/i;

/* The most specific sentence in the posting, or null.

   Never the whole description: pasting it back reads as scraped, and most of a
   job ad is boilerplate. We want the ONE line that says what this team is
   actually building, so the student can name it as their own observation.

   Conservative: when nothing clears the bar we return null and the draft says
   less rather than quoting something generic. A vague "I saw you value
   innovation" is worse than not mentioning the posting at all. */
function detailFromPosting(description?: string | null): string | null {
  const text = (description ?? "").replace(/\s+/g, " ").trim();
  if (text.length < 80) return null;

  const sentences = text
    // Split on sentence ends, bullets, AND section-heading colons. Without the
    // colon rule "About the job: You will build X" stays glued into one
    // 200-char blob that the length filter then discards — a real posting
    // detail lost to a heading nobody wanted anyway.
    .split(/(?<=[.!?])\s+|\n+|(?:\s[•\u2022\u2023\u25aa-]\s)|(?<=^[^.!?]{0,40}):\s+/)
    .map((x) => x.trim())
    .filter(Boolean);

  const scored = sentences
    // Up to 220: a specific sentence naming what a team builds runs long, and
    // capping at 180 dropped real ones. Trimmed at the point of use, not here.
    .filter((x) => x.length >= 40 && x.length <= 220)
    .filter((x) => !BOILERPLATE.test(x))
    // A sentence that is mostly capitalised words is a heading or a skills list.
    .filter((x) => (x.match(/\b[A-Z][a-z]+/g) ?? []).length < x.split(" ").length * 0.6)
    .map((x) => {
      let score = 0;
      // Concrete nouns beat adjectives: what the team BUILDS.
      if (/\b(build|building|design|own|ship|scale|migrat|integrat|launch)\w*\b/i.test(x)) score += 3;
      // A named system or domain is the most specific thing a posting holds.
      if (/\b(pipeline|ledger|API|infrastructure|platform|latency|throughput|checkout|payments?|onboarding|recommendation|search|fraud|risk)\b/i.test(x)) score += 3;
      if (/\byou(?:'ll| will)?\b/i.test(x)) score += 1;
      return { x, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return null;
  let best = scored[0].x.replace(/[.;,]+$/, "");

  // Take ONE clause, not the whole sentence.
  //
  // Postings list several duties in one breath: "You will own the pipeline,
  // and build the dashboards the category teams use". Converting the leading
  // verb to "-ing" then leaves the later verbs unconverted — real output was
  // "designing the retry semantics ..., and build the internal dashboards",
  // which reads as broken software. Chasing every verb in the sentence is a
  // losing game; stopping at the first clause boundary is not, and one
  // concrete duty is what we wanted anyway.
  const clause = best.match(/^(.*?)(?:,\s+(?:and|or|as well as)\s|\s+and\s+(?:then\s+)?(?:own|build|design|ship|scale|lead|drive|create|help)\b)/i);
  if (clause && clause[1].length >= 40) best = clause[1].replace(/[.;,]+$/, "");

  // Job ads address the reader: "You will own the pipeline". Quoted as-is
  // after "the part that stuck with me was...", that reads as pasted from the
  // ad — the exact impression we are trying to avoid.
  //
  // Only the LEADING verb is converted, and only when the sentence starts with
  // one. An earlier version rewrote the first verb it saw and produced
  // "building and maintain the internal ticketing platform" — a sentence with
  // two verbs, one converted and one not. When the shape is not a clean
  // "You will <verb> ..." we leave the sentence alone rather than mangle it.
  const lead = best.match(/^you(?:'ll| will| would)?\s+(?:help\s+)?([a-z]+)\b(.*)$/i);
  if (lead) {
    const verb = lead[1].toLowerCase();
    const rest = lead[2];
    // "own and maintain X": converting only the first verb breaks agreement,
    // so convert BOTH sides of the conjunction or neither.
    const pair = rest.match(/^\s+and\s+([a-z]+)\b(.*)$/i);
    const ing = (v: string) =>
      /e$/.test(v) && !/ee$/.test(v) ? v.slice(0, -1) + "ing" : v + "ing";
    if (pair) {
      best = `${ing(verb)} and ${ing(pair[1].toLowerCase())}${pair[2]}`;
    } else {
      best = `${ing(verb)}${rest}`;
    }
  }

  return best.charAt(0).toLowerCase() + best.slice(1);
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
      // "your name came up" is a claim, and it is FALSE when we are greeting
      // "Hi there" — the page named nobody and the backend has not resolved
      // anyone yet. A draft that opens with something the student cannot stand
      // behind is worse than a plainer one. Naukri never names a contact, so
      // this was every Naukri draft.
      open: seed.contactName
        ? `I saw ${company} is hiring for ${role}, and your name came up as someone actually on the team rather than a careers inbox.`
        : `I saw ${company} is hiring for ${role}, and I would rather write to a person on the team than drop another application into a careers inbox.`,
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

  // The third input: the posting itself. This paragraph was the most generic
  // in the draft — it talked ABOUT writing to a person without ever showing
  // the student had read the job. One concrete line from the posting, named as
  // their own observation, is what makes it specific.
  //
  // When the posting yields nothing worth quoting we keep the old sentence
  // rather than inventing a detail. A vague reference is worse than none: it
  // proves the sender skimmed.
  const detail = detailFromPosting(seed.description);
  const why = seed.contactTitle
    ? (detail
      ? `I'm writing to you specifically rather than the careers inbox because you're ${withArticle(seed.contactTitle)}. The part of the posting that stuck with me was ${detail} — that is the work I want to be near, and you'd know what actually separates someone who lasts in ${role} from someone who looks good on paper.`
      : `I'm writing to you specifically rather than the careers inbox because you're ${withArticle(seed.contactTitle)} — you'd know what actually separates someone who lasts in ${role} from someone who looks good on paper.`)
    : (detail
      ? `I'm writing to a person rather than a careers inbox because an application form can't tell me what this team is actually trying to build. From the posting, ${detail} — that is the part I'd want to work on.`
      : `I'm writing to a person rather than a careers inbox because an application form can't tell me what this team is actually trying to build.`);

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
