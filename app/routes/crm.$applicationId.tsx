// Review, edit and send the email the extension prepared.
//
// This is the step that did not exist: previously Apply composed and sent an
// email the student never saw. Nothing leaves this page without someone
// reading it first.
import { useEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import { and, eq, or } from "drizzle-orm";
import db from "~/lib/db";
import { extensionDrafts } from "../../auth-schema";
import { Footer, Header } from "~/components";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { EMAIL_STYLES, DEFAULT_STYLE } from "~/lib/outreach/email-styles";
import type { Route } from "./+types/crm.$applicationId";

export function meta() {
  return [{ title: "Review your email · Studojo" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    throw redirect(`/auth?redirect=${encodeURIComponent(`/crm/${params.applicationId}`)}`);
  }

  // Guarded for the same reason as the CRM list: an unhandled query error here
  // renders "Oops! An unexpected error occurred", which tells a student
  // nothing and loses the page entirely.
  let draft: typeof extensionDrafts.$inferSelect | null = null;
  let failed = false;
  try {
    // Match on EITHER key. When the career-agent write fails there is no
    // applicationId, so the list links to the draft's own id — and looking up
    // only by applicationId meant that link led to "No draft for this
    // application" while the draft sat right there in the table.
    const key = params.applicationId as string;
    const rows = await db
      .select()
      .from(extensionDrafts)
      .where(
        and(
          eq(extensionDrafts.userId, session.user.id),
          or(eq(extensionDrafts.applicationId, key), eq(extensionDrafts.id, key)),
        ),
      )
      .limit(1);
    draft = rows[0] ?? null;
  } catch (e) {
    console.error("[crm] could not load draft:", e);
    failed = true;
  }

  return { draft, failed };
}

export default function CrmDraft({ loaderData }: Route.ComponentProps) {
  const { draft, failed } = loaderData as { draft: any; failed: boolean };
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const [style, setStyle] = useState(draft?.emailStyle ?? DEFAULT_STYLE);
  const [body, setBody] = useState(draft?.body ?? "");
  const [state, setState] = useState<"idle" | "saving" | "sending" | "sent" | "restyling">(
    draft?.status === "sent" ? "sent" : "idle",
  );
  const [problem, setProblem] = useState<{ message: string; actionUrl?: string } | null>(null);
  // The address the email actually went to. Worth showing: the student never
  // typed it — it is resolved server-side — so confirming it is the only way
  // they can tell the message reached the right person.
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Whether we can actually reach this person. Checked while they edit, so
  // "no verified email" arrives BEFORE the work rather than after it.
  const [reach, setReach] = useState<{
    status: string;
    message: string;
    contactName?: string | null;
    contactTitle?: string | null;
    foundBySearch?: boolean;
    similar?: { company: string; contactName?: string | null; contactTitle?: string | null; apolloId?: string | null; industry?: string | null }[];
  } | null>(null);

  const navigate = useNavigate();

  // Are we still looking? The check runs on mount and the backend now widens
  // its search three times before giving up, so it takes a moment. The page
  // used to render "we don't have a confirmed email address for anyone"
  // during that moment — a dead end announced before anyone had finished
  // looking.
  const [searching, setSearching] = useState(true);

  // Which alternative we are currently turning into a draft.
  const [drafting, setDrafting] = useState<string | null>(null);

  // Clicking a suggestion WRITES THE EMAIL. It used to be a list of names, so
  // the student had to go and find the company, find a person, and come back —
  // which nobody does. The search that produced the suggestion already knew
  // who to write to, so one click is all it should take.
  async function draftAlternative(c: {
    company: string; contactName?: string | null;
    contactTitle?: string | null; apolloId?: string | null;
  }) {
    if (!draft?.id || drafting) return;
    setDrafting(c.company);
    try {
      const res = await fetch("/api/crm/draft-alternative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id, company: c.company,
          contactName: c.contactName ?? null,
          contactTitle: c.contactTitle ?? null,
          apolloId: c.apolloId ?? null,
        }),
      });
      const d = await res.json();
      // Go to the NEW draft. The original stays untouched — the student may
      // still send it if we find someone there later.
      if (d?.id) navigate(`/crm/${d.id}`);
      else setDrafting(null);
    } catch {
      setDrafting(null);
    }
  }

  // Free on mount: the page's own contact, contacts already resolved, and — when
  // the page named nobody — a fresh Apollo search, and then the reveal, so the
  // page can say something true about whether this person is reachable.
  useEffect(() => {
    if (!draft?.id || draft.status !== "draft") return;
    let cancelled = false;
    fetch("/api/crm/contact-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // RESOLVE THE ADDRESS HERE, not at send.
      //
      // This is the bug Pranav kept hitting. The backend found 17 people at
      // Neo — the logs say so — and then refused to reveal an address because
      // allow_lookup was false, returning "unknown". The CRM read that as a
      // dead end and printed "we don't have a confirmed email for anyone".
      //
      // allow_lookup used to be set by the "Check now" button. Removing that
      // button was right — the student should not have to ask — but I never
      // moved the reveal anywhere, so nothing set the flag and the flow had no
      // path to an address at all.
      //
      // Doing it on mount is also the only honest option: the page TELLS the
      // student whether we can reach this person, so it has to actually find
      // out before saying so.
      body: JSON.stringify({ id: draft.id, allowLookup: true }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.status) setReach((prev) => ({ ...(prev ?? {}), ...d })); })
      .catch(() => {})
      // Always clears, so a failed check can never leave a spinner forever.
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [draft?.id, draft?.status]);


  if (!draft) {
    return (
      <Shell>
        <p className="font-['Satoshi'] text-studojo-ink">
          {failed
            ? "We couldn't load this draft just now. Try again in a moment."
            : "No draft for this application."}
        </p>
        <Link to="/crm" className="mt-4 inline-block font-['Satoshi'] underline">
          Back to CRM
        </Link>
      </Shell>
    );
  }

  const sent = state === "sent";
  // With no credential the bridge is generic. Say so rather than letting a
  // student send a thin email believing it is finished.
  const thin = !draft.subject?.includes("→");

  // Rewrite the draft in the chosen style. Without this the picker changed a
  // hidden value and the email on screen stayed identical — which reads as a
  // broken control, and gives no sense of what will actually be sent.
  async function pickStyle(id: string) {
    if (id === style) return;
    // Restyling REPLACES the text. If they have already edited it, say so
    // rather than quietly throwing their words away.
    const edited = body !== (draft.body ?? "") || subject !== (draft.subject ?? "");
    if (edited && !confirm("Rewriting in this style will replace your edits. Continue?")) {
      return;
    }
    setStyle(id);
    setProblem(null);
    setState("restyling");
    try {
      const res = await fetch("/api/crm/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, intent: "regenerate", emailStyle: id }),
      });
      const data = await res.json();
      if (res.ok && data.subject) {
        setSubject(data.subject);
        setBody(data.body);
      }
    } catch {
      setProblem({ message: "Couldn't rewrite the draft. Your text is unchanged." });
    } finally {
      setState("idle");
    }
  }

  async function post(intent: "save" | "send") {
    setProblem(null);
    setState(intent === "send" ? "sending" : "saving");
    try {
      const res = await fetch("/api/crm/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, intent, subject, body, emailStyle: style }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setProblem({ message: data.message ?? "Something went wrong.", actionUrl: data.actionUrl });
        setState("idle");
        return;
      }
      if (intent === "send" && data.toEmail) {
        setSentTo(
          data.contactName ? `${data.contactName} (${data.toEmail})` : data.toEmail,
        );
      }
      setState(intent === "send" ? "sent" : "idle");
    } catch {
      setProblem({ message: "Could not reach Studojo. Try again." });
      setState("idle");
    }
  }

  return (
    <Shell>
      <Link to="/crm" className="font-['Satoshi'] text-sm text-studojo-muted underline">
        ← Back to CRM
      </Link>

      <h1 className="mb-1 mt-4 font-['Clash_Display'] text-3xl font-bold text-studojo-ink">
        {sent ? "Email sent" : "Review your email"}
      </h1>
      <p className="mb-6 font-['Satoshi'] text-studojo-muted">
        {draft.contactName
          ? `To ${draft.contactName}${draft.contactTitle ? ` — ${draft.contactTitle}` : ""} at ${draft.company}`
          : `${draft.role} at ${draft.company}`}
      </p>

      {!sent && thin ? (
        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="font-['Satoshi'] text-sm font-semibold text-amber-900">
            This email is generic right now.
          </p>
          <p className="mt-1 font-['Satoshi'] text-sm text-amber-800">
            It knows the job but nothing about you. Add your resume and answer four
            questions and we'll rewrite it with a real credential.
          </p>
          <Link
            to="/crm/setup"
            className="mt-3 inline-block rounded-xl border-2 border-studojo-ink bg-white px-4 py-2 font-['Satoshi'] text-sm font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Add my resume
          </Link>
        </div>
      ) : null}

      {/* Reachability, shown while they edit rather than after they press Send.
          Deliberately understated when the answer is good and prominent when
          it is not — a green banner on every draft is noise, but "we can't
          reach this person" is worth interrupting for. */}
      {!sent && !searching && !draft.contactName ? (
        <div className="mb-6 rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-4">
          {/* A name is shown ONLY once we hold an address for them. Announcing
              "we found Santoshi" and then failing to send is worse than saying
              nothing: the student believes they have a contact and writes to
              that person in their head. Naming someone is a promise we can
              reach them, so we make it only when we can keep it. */}
          <p className="font-['Satoshi'] text-sm text-studojo-ink">
            {reach?.status === "reachable" && reach.contactName
              ? `This posting didn't name anyone, so we found ${reach.contactName}${
                  reach.contactTitle ? ` — ${reach.contactTitle}` : ""
                } at ${draft.company}.`
              : reach?.status === "unreachable"
                ? `We don't have a confirmed email address for anyone at ${draft.company} yet. Your draft is saved and we keep looking.`
                : `This posting didn't name anyone. We'll find whoever hires for this role at ${draft.company} when you send.`}
          </p>
        </div>
      ) : null}

      {/* WHILE WE LOOK: a skeleton, not a verdict. */}
      {!sent && searching ? (
        <div className="mb-6 rounded-2xl border-2 border-studojo-ink/10 bg-white p-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-studojo-ink/20 border-t-studojo-ink"
            />
            <p className="font-['Satoshi'] text-sm font-medium text-studojo-ink">
              Looking for the right hiring manager for{" "}
              <span className="font-semibold">{draft.role || "this role"}</span> at{" "}
              <span className="font-semibold">{draft.company || "this company"}</span>
              &hellip;
            </p>
          </div>
          <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
            <span className="h-3 w-2/3 animate-pulse rounded bg-studojo-ink/10" />
            <span className="h-3 w-1/2 animate-pulse rounded bg-studojo-ink/10" />
          </div>
          <p className="mt-3 font-['Satoshi'] text-xs text-studojo-muted">
            Your draft is saved. You can keep editing while we search.
          </p>
        </div>
      ) : null}

      {/* The "unreachable" case is explained inside the banner above when the
          posting named nobody. Only show a standalone notice when the page DID
          name someone — otherwise two boxes describe the same state. */}
      {/* When we cannot reach this company, offer ones we can. Same industry,
          size band and role, and every one has a contact with a verified
          email — an alternative we cannot email is the same dead end we are
          trying to escape. Advisory: the student chooses, nothing is
          redirected or drafted for them. */}
      {/* Gate on HAVING suggestions, not on one status string. The service
          populates `similar` only when it could not put an address in front of
          the student, so a non-empty list IS the signal — and it arrives under
          two different statuses: "unreachable" when nobody was found, and
          "unknown" when a person was found but their address has not been
          revealed yet. The old `status === "unreachable"` test silently
          dropped the second, which is the branch nearly every draft takes:
          the automatic check on mount passes allow_lookup=false. That is why
          the suggestions almost never appeared. */}
      {!sent && !searching && (reach?.similar?.length ?? 0) > 0 ? (
        <div className="mb-6 rounded-2xl border-2 border-studojo-ink/15 bg-white p-4">
          <p className="font-['Satoshi'] text-sm font-semibold text-studojo-ink">
            Companies like {draft.company} we can reach
          </p>
          <p className="mt-1 font-['Satoshi'] text-sm text-studojo-muted">
            Same industry and size, hiring for similar roles. Open one and apply
            through the extension to write to a real person there.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {reach!.similar!.map((c) => (
              <li key={c.company}>
                <button
                  type="button"
                  disabled={drafting === c.company}
                  onClick={() => draftAlternative(c)}
                  className="flex w-full flex-wrap items-baseline justify-between gap-2 rounded-xl border border-studojo-ink/10 px-3 py-2 text-left transition-all hover:border-studojo-ink/40 hover:bg-studojo-ink/[0.03] disabled:opacity-60"
                >
                  <span className="font-['Satoshi'] text-sm font-medium text-studojo-ink">
                    {c.company}
                    {c.contactName ? (
                      <span className="font-normal text-studojo-muted"> — {c.contactName}</span>
                    ) : null}
                  </span>
                  <span className="font-['Satoshi'] text-xs text-studojo-muted">
                    {drafting === c.company
                      ? "Writing…"
                      : [c.contactTitle, c.industry].filter(Boolean).join(" · ") || "Write to them"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!sent && !searching && draft.contactName && reach?.status === "unreachable" ? (
        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="font-['Satoshi'] text-sm font-semibold text-amber-900">
            We don&rsquo;t have a confirmed email for {draft.contactName} yet.
          </p>
          <p className="mt-1 font-['Satoshi'] text-sm text-amber-800">
            We know who they are; we don&rsquo;t yet have an address we trust.
            Your draft is saved and we keep looking.
          </p>
        </div>
      ) : null}

      {!sent && reach && reach.status === "reachable" ? (
        <p className="mb-6 font-['Satoshi'] text-sm text-studojo-green">
          ✓ We can reach {draft.contactName?.split(" ")[0] ?? "this person"}.
        </p>
      ) : null}

      {/* No "Check now" button.
          
          Finding WHO to write to is a free Apollo search, and the backend
          already runs it on the automatic check below. Getting their ADDRESS
          is the paid reveal, and send-one already does that when the student
          actually sends. The button gated the free half and made the paid half
          look like something the student had to ask for — so most never did,
          and the page sat saying "we'll look when you send" while the answer
          was one free call away. */}
      {!sent && !searching && (!reach || reach.status === "unknown") ? (
        <p className="mb-6 font-['Satoshi'] text-sm text-studojo-muted">
          We&rsquo;ll confirm their email when you send.
        </p>
      ) : null}

      {!sent ? (
        <div className="mb-6">
          <label className="mb-1 block font-['Satoshi'] text-xs font-bold uppercase tracking-wide text-studojo-muted">
            How should it sound
          </label>
          {/* Picking a style REWRITES the draft below. The text the student
              ends up with is now exactly what gets sent — /extension/send-one
              takes the subject and body verbatim — so this control shapes the
              starting point, and their edits always win over it. */}
          <p className="mb-3 font-['Satoshi'] text-sm text-studojo-muted">
            Pick a starting point, then edit it. We send exactly what you write below.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EMAIL_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickStyle(s.id)}
                disabled={state === "restyling"}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  style === s.id
                    ? "border-studojo-ink bg-studojo-purple-bg"
                    : "border-studojo-ink/15 hover:border-studojo-ink/40"
                }`}
              >
                <span className="block font-['Satoshi'] text-sm font-semibold text-studojo-ink">
                  {s.name}
                </span>
                <span className="mt-0.5 block font-['Satoshi'] text-xs text-studojo-muted">
                  {s.tone}
                </span>
                <span className="mt-1 block font-['Satoshi'] text-xs text-studojo-muted">
                  {s.ask}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <label className="mb-1 block font-['Satoshi'] text-xs font-bold uppercase tracking-wide text-studojo-muted">
        Subject
      </label>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        disabled={sent}
        className="mb-4 w-full rounded-xl border-2 border-studojo-ink/20 px-4 py-3 font-['Satoshi'] disabled:bg-studojo-surface-muted"
      />

      <label className="mb-1 block font-['Satoshi'] text-xs font-bold uppercase tracking-wide text-studojo-muted">
        Message
      </label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={sent}
        rows={14}
        className="mb-4 w-full rounded-xl border-2 border-studojo-ink/20 px-4 py-3 font-['Satoshi'] leading-relaxed disabled:bg-studojo-surface-muted"
      />

      {problem ? (
        <div className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 p-4">
          <p className="font-['Satoshi'] text-sm text-red-900">{problem.message}</p>
          {problem.actionUrl ? (
            <Link
              to={problem.actionUrl}
              className="mt-2 inline-block font-['Satoshi'] text-sm font-semibold text-red-900 underline"
            >
              Fix this
            </Link>
          ) : null}
        </div>
      ) : null}

      {sent ? (
        <p className="rounded-xl border-2 border-studojo-green/30 bg-studojo-green-bg p-4 font-['Satoshi'] text-sm text-studojo-green">
          {sentTo
            ? `Sent to ${sentTo} from your Gmail. Replies land in your inbox.`
            : "Sent from your Gmail. Replies land in your inbox."}
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => post("send")}
            disabled={state === "sending" || !subject.trim() || !body.trim()}
            className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple px-6 py-3 font-['Satoshi'] font-medium text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            {state === "sending" ? "Sending…" : "Send this email"}
          </button>
          <button
            onClick={() => post("save")}
            disabled={state === "saving"}
            className="rounded-2xl border-2 border-studojo-ink bg-white px-6 py-3 font-['Satoshi'] font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            {state === "saving" ? "Saving…" : "Save for later"}
          </button>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
