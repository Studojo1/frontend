import { redirect } from "react-router";
import { useEffect, useRef } from "react";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/extension-auth";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    const url = new URL(request.url);
    const ext = url.searchParams.get("ext") ?? "";
    throw redirect(`/auth?redirect=${encodeURIComponent(`/extension-auth?ext=${ext}`)}`);
  }

  const url = new URL(request.url);
  const extId = url.searchParams.get("ext") ?? "";
  const token = (session as any).session?.token ?? (session as any).session?.id ?? null;

  return { token, extId, name: session.user.name };
}

export default function ExtensionAuth({ loaderData }: Route.ComponentProps) {
  const { token, extId, name } = loaderData;
  const statusRef = useRef<HTMLDivElement>(null);

  function setStatus(ok: boolean, msg: string) {
    const el = statusRef.current;
    if (!el) return;
    el.className = ok
      ? "inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border-2 border-neutral-900 rounded-xl bg-green-50 text-green-700"
      : "inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border-2 border-neutral-900 rounded-xl bg-red-50 text-red-600";
    el.innerHTML = `<span class="w-2 h-2 rounded-full bg-current flex-shrink-0"></span>${msg}`;
  }

  useEffect(() => {
    if (!extId || !token) {
      setStatus(false, "Missing extension ID or token. Retry from the extension.");
      return;
    }

    const cr = (window as any).chrome;
    if (!cr?.runtime?.sendMessage) {
      setStatus(false, "Chrome extension API not available.");
      return;
    }

    try {
      cr.runtime.sendMessage(extId, { type: "SAVE_TOKEN", token }, (res: any) => {
        if (cr.runtime.lastError) {
          setStatus(false, "Extension not found. Make sure it is installed and enabled.");
        } else if (res?.ok) {
          setStatus(true, "Connected! You can close this tab.");
          setTimeout(() => window.close(), 1500);
        } else {
          setStatus(false, "Connection failed. Try again.");
        }
      });
    } catch (e: any) {
      setStatus(false, "Could not reach extension: " + e.message);
    }
  }, [extId, token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-neutral-900 rounded-2xl shadow-[5px_5px_0px_#1a1a1a] p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-3">⚡</div>
        <h1 className="text-xl font-extrabold text-neutral-900 mb-1.5">Connecting AutoApply</h1>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Signed in as <strong className="text-neutral-900">{name}</strong>.
          <br />Sending your credentials to the extension…
        </p>
        <div
          ref={statusRef}
          className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border-2 border-neutral-900 rounded-xl bg-green-50 text-green-700"
        >
          <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
          Connecting...
        </div>
      </div>
    </div>
  );
}
