// Gmail connection for students who arrived from the extension.
//
// Why this exists rather than reusing /outreach/connect/gmail:
//
// That page belongs to the outreach tool's funnel. On success it navigates to
// /outreach/connect/debrief or /outreach/connect/linkedin — the next step of
// CAMPAIGN SETUP. A student who came from a LinkedIn job has one email waiting
// for review; dropping them into campaign setup abandons the thing they were
// doing. Its destination is also chosen from `planType` in a client-side
// store, which someone arriving via the extension has never populated.
//
// We cannot change that page: it is live for students who came in the normal
// way. And we cannot ask the OAuth service to return somewhere else — the
// callback URL is hardcoded server-side to FRONTEND_URL/connect/gmail and
// `state` carries the user id, not a return path (job-outreach-svc
// api/routes_gmail.py:52,62).
//
// So this page starts the same OAuth flow, records where the student should
// end up, and /outreach/connect/gmail hands control back here on return.
import { useEffect, useState } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { Footer, Header } from "~/components";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { outreachFetch } from "~/lib/outreach/api";
import type { Route } from "./+types/crm.connect-gmail";

/** Where to send the student once Gmail is connected. Read by the shared
 *  outreach page so it can hand control back to us instead of continuing into
 *  campaign setup. */
export const RETURN_KEY = "sj_gmail_return";

export function meta() {
  return [{ title: "Connect Gmail · Studojo" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  const url = new URL(request.url);
  if (!session) {
    throw redirect(
      `/auth?redirect=${encodeURIComponent("/crm/connect-gmail" + url.search)}`,
    );
  }
  return null;
}

export default function CrmConnectGmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  // Where to come back to. Defaults to the CRM list when no draft is named.
  const back = params.get("back") || "/crm";

  useEffect(() => {
    (async () => {
      try {
        sessionStorage.setItem(RETURN_KEY, back);
      } catch {
        /* private mode — the outreach page falls back to /crm */
      }

      try {
        const data = await outreachFetch<{ url: string }>("/gmail/oauth/connect-url", {
          timeout: 10000,
          maxRetries: 1,
        });
        if (!data?.url) throw new Error("No connect URL returned");
        window.location.href = data.url;
      } catch (e: any) {
        setStarting(false);
        setError(
          e?.body?.detail ??
            "We couldn't start the Gmail connection. Your draft is saved — try again in a moment.",
        );
      }
    })();
  }, [back]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <h1 className="font-['Clash_Display'] text-3xl font-bold text-studojo-ink">
            {starting ? "Opening Google…" : "Couldn't connect Gmail"}
          </h1>

          {starting ? (
            <p className="mt-3 font-['Satoshi'] text-studojo-muted">
              You&rsquo;ll be asked to allow Studojo to send email as you. Tick
              both boxes — we need read access to spot replies.
            </p>
          ) : (
            <>
              <p className="mt-3 font-['Satoshi'] text-studojo-muted">{error}</p>
              <button
                onClick={() => navigate(back)}
                className="mt-6 rounded-2xl border-2 border-studojo-ink bg-white px-6 py-3 font-['Satoshi'] font-medium shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Back to my email
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
