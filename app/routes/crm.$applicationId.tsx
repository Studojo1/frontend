// Review, edit and send the email the extension prepared.
//
// This is the step that did not exist: previously Apply composed and sent an
// email the student never saw. Nothing leaves this page without someone
// reading it first.
import { useState } from "react";
import { Link, redirect } from "react-router";
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

      {!sent ? (
        <div className="mb-6">
          <label className="mb-1 block font-['Satoshi'] text-xs font-bold uppercase tracking-wide text-studojo-muted">
            How should it sound
          </label>
          {/* This is not decoration. The campaign system rewrites the message
              in the chosen style, so this is what actually controls the email
              that gets sent — the text below is a preview of the intent. */}
          <p className="mb-3 font-['Satoshi'] text-sm text-studojo-muted">
            Studojo writes the final email in this style, using the details below.
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
          Sent from your Gmail. Replies land in your inbox.
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
