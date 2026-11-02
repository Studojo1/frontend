// Self-serve account deletion (B2C open item NEW-04), without job-outreach-svc (RELAUNCH, 2 Nov 2026).
//
// Its own page rather than a section of /settings, so it is one plain link away from anywhere (career-agent's
// settings link here too). The action deletes, in one transaction, the student's rows in the product's schema and
// their sign-in (app/lib/career-data.server.ts), then clears the session cookies.
import { useEffect, useState } from "react";
import { data, redirect, useFetcher, useNavigate, type ShouldRevalidateFunctionArgs } from "react-router";
import { Header } from "~/components";
import { auth } from "~/lib/auth";
import { authClient } from "~/lib/auth-client";
import { AccountDeleteBlocked, deleteAccount } from "~/lib/career-data.server";
import { clearTokenCache } from "~/lib/control-plane";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { resetPostHog } from "~/lib/posthog";
import type { Route } from "./+types/account.delete";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?mode=signin&redirect=/account/delete");
  return { email: session.user.email };
}

type DeleteResult = { ok: boolean; error: string | null };

/** Where a deleted account lands: sign in, with the "your account is deleted" line (auth._index.tsx), no return. */
export const DELETED_LANDING = "/auth?mode=signin&deleted=1";

// QA-FIX (2 Nov 2026): after a delete the loader must not run again. With the session gone it sent the page to
// /auth?mode=signin&redirect=/account/delete, with no word about the delete and a sign-in that led back here.
export function shouldRevalidate({ actionResult, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if ((actionResult as DeleteResult | undefined)?.ok) return false;
  return defaultShouldRevalidate;
}

const SUPPORT = "admin@studojo.com";

/** A browser's own origin only: a form on another site never deletes an account (the cookie is SameSite=Lax too). */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (request.headers.get("host") ?? "");
  } catch {
    return false;
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return data<DeleteResult>({ ok: false, error: "Method not allowed" }, { status: 405 });
  if (!sameOrigin(request)) return data<DeleteResult>({ ok: false, error: "Nothing was deleted." }, { status: 403 });
  const session = await getSessionFromRequest(request);
  if (!session) return data<DeleteResult>({ ok: false, error: "You are signed out. Sign in again, then delete." }, { status: 401 });
  const form = await request.formData();
  if (form.get("confirm") !== "DELETE") return data<DeleteResult>({ ok: false, error: "Type DELETE to confirm." }, { status: 400 });
  try {
    await deleteAccount(session.user.id);
  } catch (e) {
    if (e instanceof AccountDeleteBlocked) {
      return data<DeleteResult>(
        { ok: false, error: `We couldn't delete your account automatically, and nothing was deleted. Write to ${SUPPORT} and we will delete it for you.` },
        { status: 409 },
      );
    }
    console.error("[account-delete] failed for", session.user.id, e instanceof Error ? e.message : String(e));
    return data<DeleteResult>({ ok: false, error: "Something went wrong. Nothing was deleted. Please try again." }, { status: 500 });
  }
  // The session rows are gone; this clears the browser's cookies (and better-auth's cached copy of the session).
  const headers = new Headers();
  try {
    const out = await auth.api.signOut({ headers: request.headers, asResponse: true });
    for (const c of out.headers.getSetCookie()) headers.append("Set-Cookie", c);
  } catch {
    // The account is deleted either way; the page signs out in the browser too.
  }
  return data<DeleteResult>({ ok: true, error: null }, { headers });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Delete your account | Studojo" }, { name: "robots", content: "noindex" }];
}

export default function DeleteAccount({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const fetcher = useFetcher<DeleteResult>();
  const [confirm, setConfirm] = useState("");
  const deleting = fetcher.state !== "idle";
  const done = fetcher.data?.ok === true;
  const error = fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

  // Deleted: clear what the browser still holds, then a full load of the sign-in page with the deleted line.
  useEffect(() => {
    if (!done) return;
    clearTokenCache();
    resetPostHog();
    void authClient
      .signOut()
      .catch(() => {})
      .finally(() => window.location.replace(DELETED_LANDING));
  }, [done]);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm !== "DELETE" || deleting) return;
    fetcher.submit({ confirm }, { method: "post" });
  };

  const card =
    "rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8";
  const secondaryBtn =
    "inline-flex items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-purple-50">
        <div className="relative mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20">
          {done ? (
            <>
              <h1 className="mb-8 font-['Clash_Display'] text-4xl font-medium leading-tight tracking-tight text-neutral-900 md:text-5xl">
                Account deleted
              </h1>
              <div className={card} role="status">
                <h2 className="mb-4 font-['Clash_Display'] text-2xl font-medium leading-tight tracking-tight text-neutral-900">
                  Your account is deleted
                </h2>
                <p className="mb-6 font-['Satoshi'] text-base font-normal leading-6 text-neutral-700">
                  Everything we kept about you is gone. You can sign up again with the same email any time.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  Go to the homepage
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goBack}
                className="mb-4 inline-block font-['Satoshi'] text-sm font-medium leading-5 text-neutral-600 hover:text-neutral-900"
              >
                &larr; Back
              </button>
              <h1 className="mb-8 font-['Clash_Display'] text-4xl font-medium leading-tight tracking-tight text-neutral-900 md:text-5xl">
                Delete your account
              </h1>
              <div className="rounded-2xl border-2 border-red-500 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] md:p-8">
                <h2 className="mb-4 font-['Clash_Display'] text-2xl font-medium leading-tight tracking-tight text-neutral-900">
                  This cannot be undone
                </h2>
                <p className="mb-4 font-['Satoshi'] text-base font-normal leading-6 text-neutral-700">
                  You are deleting the account <strong className="break-all font-medium text-neutral-900">{loaderData.email}</strong>.
                </p>
                <ul className="mb-4 list-disc space-y-2 pl-5 font-['Satoshi'] text-base font-normal leading-6 text-neutral-700">
                  <li>Your profile, preferences and resumes, your calls with Stu and everything Stu learned about you.</li>
                  <li>Your matches, liked jobs and followed companies, and your chats with Stu.</li>
                  <li>Your email campaign: the emails, follow-ups and replies. Anything still waiting to send stops.</li>
                  <li>Your page and your projects, your connected inbox, your credits and your plan.</li>
                  <li>Your Studojo sign-in.</li>
                  <li>Unused credits and plan time are forfeited and can&apos;t be refunded (<a href="/refund-policy" className="underline">Refund Policy</a>). If you think a refund is owed, write to {SUPPORT} before you delete.</li>
                </ul>
                <p className="mb-6 font-['Satoshi'] text-sm font-normal leading-5 text-neutral-500">
                  If you have paid Studojo, we keep the payment records, with no name, email or phone attached, because tax law requires it.
                </p>

                {error && (
                  <div
                    className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 font-['Satoshi'] text-sm font-medium leading-5 text-red-700"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleDelete} className="space-y-4">
                  <div>
                    <label
                      htmlFor="confirm-delete"
                      className="mb-2 block font-['Satoshi'] text-sm font-medium leading-5 text-neutral-900"
                    >
                      Type DELETE to confirm
                    </label>
                    <input
                      id="confirm-delete"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      placeholder="DELETE"
                      className="w-full rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-base font-normal leading-6 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    />
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={goBack} className={secondaryBtn}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={confirm !== "DELETE" || deleting}
                      className="rounded-2xl border-2 border-neutral-900 bg-red-600 px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:pointer-events-none disabled:opacity-60"
                    >
                      {deleting ? "Deleting…" : "Delete my account"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
