// Self-serve account deletion (B2C open item NEW-04).
//
// Its own page rather than a section of /settings: /settings requires a
// finished onboarding profile, which students who signed up by email through
// Outreach never see, so they could not have reached a button there.
import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { Header } from "~/components";
import { authClient } from "~/lib/auth-client";
import { clearTokenCache } from "~/lib/control-plane";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { outreachFetch } from "~/lib/outreach/api";
import { useOutreachStore } from "~/lib/outreach/store";
import { resetPostHog } from "~/lib/posthog";
import type { Route } from "./+types/account.delete";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/account/delete");
  return { email: session.user.email };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Delete your account | Studojo" }, { name: "robots", content: "noindex" }];
}

export default function DeleteAccount({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Not a link to /settings: that page sends anyone without a finished
  // profile to onboarding, and they are who this page exists for.
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm !== "DELETE") return;
    setDeleting(true);
    setError(null);
    try {
      // One attempt, no retry: once the first call succeeds the session is
      // gone, and a retry would 401 and bounce to sign-in. (fetchWithRetry's
      // maxRetries counts attempts, so 0 would never send the request.)
      await outreachFetch("/account/delete", {
        method: "POST",
        body: JSON.stringify({ confirm }),
        maxRetries: 1,
        timeout: 60_000,
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Nothing was deleted. Please try again.");
      setDeleting(false);
      return;
    }
    // The server already removed every session; this clears the browser's copy.
    useOutreachStore.getState().resetFunnel();
    clearTokenCache();
    resetPostHog();
    authClient.signOut().catch(() => {});
    setDone(true);
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
                  Your data is gone and Studojo can no longer use your Gmail. You can sign up again with the same
                  email any time.
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
                  <li>Your resumes, profile, leads and campaigns are deleted. Any campaign still sending stops.</li>
                  <li>Every email sent from your Gmail, and every reply, is deleted from Studojo.</li>
                  <li>Studojo&apos;s access to your Gmail is revoked with Google.</li>
                  <li>Unused credits are lost. If you want a refund, raise a ticket before you delete.</li>
                </ul>
                <p className="mb-6 font-['Satoshi'] text-sm font-normal leading-5 text-neutral-500">
                  We keep a record of your payments, with no name or email attached, because the law requires it.
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
