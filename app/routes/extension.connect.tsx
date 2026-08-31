// /extension/connect
//
// The bridge between "signed in on studojo.pro" and "the extension knows who
// you are". BetterAuth handles the actual sign-in; this page just mints a token
// and hands it to the extension.
//
// Chrome/Edge accept it via runtime.sendMessage (externally_connectable in the
// extension manifest lists studojo.pro). Firefox does not implement
// externally_connectable, so we also emit a DOM CustomEvent that the extension's
// content script picks up on this one URL.
import { useEffect, useState } from "react";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/extension.connect";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    const url = new URL(request.url);
    return Response.redirect(
      `${url.origin}/login?redirect=${encodeURIComponent("/extension/connect")}`,
      302,
    );
  }
  return { name: session.user.name ?? "", email: session.user.email ?? "" };
}

export default function ExtensionConnect({ loaderData }: Route.ComponentProps) {
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/extension/token", { method: "POST" });
        if (!res.ok) throw new Error(`Could not create a token (${res.status})`);
        const { token } = await res.json();

        // Chrome / Edge. `ext_id` comes from the extension when it opens this
        // page — externally_connectable is a permission, not an address, so
        // without an id there is nowhere to send the token. This page used to
        // say "Extension connected" while silently sending it nowhere.
        const w = window as any;
        const extId = new URL(window.location.href).searchParams.get("ext_id");
        if (w.chrome?.runtime?.sendMessage && extId) {
          w.chrome.runtime.sendMessage(extId, { type: "SJ_SET_TOKEN", token }, () => {
            void w.chrome.runtime.lastError;
          });
        } else if (!extId) {
          throw new Error(
            "This page was opened directly. Click Sign in from the extension instead.",
          );
        }

        // Firefox / fallback — the content script on this URL listens for it.
        window.dispatchEvent(new CustomEvent("STUDOJO_EXT_TOKEN", { detail: { token } }));

        setState("done");
      } catch (e: any) {
        setDetail(String(e?.message ?? e));
        setState("error");
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-violet-700 text-2xl font-extrabold text-white">
        S
      </div>

      {state === "working" && (
        <>
          <h1 className="text-xl font-semibold">Connecting your extension…</h1>
          <p className="mt-2 text-sm text-gray-500">One moment.</p>
        </>
      )}

      {state === "done" && (
        <>
          <h1 className="text-xl font-semibold">Extension connected</h1>
          <p className="mt-2 text-sm text-gray-500">
            Signed in as {loaderData.email}. Your job is being saved — nothing has
            been sent.
          </p>
          {/* Two useful exits. Telling someone to "go back and click Apply
              again" made them redo a step the extension can now finish on its
              own the moment the token arrives. */}
          <a
            href="/crm"
            className="mt-5 inline-block rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Review my emails
          </a>
          <p className="mt-3 text-xs text-gray-400">
            Or just switch back to the job tab — the extension already knows.
          </p>
        </>
      )}

      {state === "error" && (
        <>
          <h1 className="text-xl font-semibold">Couldn&rsquo;t connect</h1>
          <p className="mt-2 text-sm text-gray-500">{detail}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}
