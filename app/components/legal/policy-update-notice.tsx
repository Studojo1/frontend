import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { authClient } from "~/lib/auth-client";

// Pages where the notice would get in the way of reading the policies, or of
// leaving instead of accepting.
const SKIP_PATHS = ["/auth", "/terms", "/privacy", "/refund-policy", "/account/delete"];

// Shown once to a signed-in user whose accepted policy versions are older
// than POLICY_VERSIONS (app/lib/legal.ts). Accepting stores the new versions.
export function PolicyUpdateNotice() {
  const { data: session } = authClient.useSession();
  const userId = (session as any)?.user?.id as string | undefined;
  const location = useLocation();
  const [needed, setNeeded] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    // A brand-new account records its sign-up consent from root.tsx; don't
    // flash the notice while that request is in flight.
    try {
      if (localStorage.getItem("sj_consent_pending")) return;
    } catch {}
    let cancelled = false;
    fetch("/api/user/accept-terms")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.needsAcceptance) setNeeded(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!needed || SKIP_PATHS.some((p) => location.pathname.startsWith(p))) return null;

  const accept = async () => {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/user/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsAccepted: true, privacyAccepted: true }),
      });
      if (!r.ok) throw new Error();
      setNeeded(false);
    } catch {
      setError("We couldn't save that. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-neutral-900/45 p-4" role="dialog" aria-modal="true" aria-labelledby="policy-update-title">
      <div className="w-full max-w-lg rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
        <h2 id="policy-update-title" className="font-['Clash_Display'] text-2xl font-medium leading-tight text-neutral-900 md:text-3xl">
          We've updated our policies
        </h2>
        <p className="mt-3 font-['Satoshi'] text-base leading-7 text-neutral-700">
          New versions of our Terms of Service, Privacy Policy and Refund Policy apply.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-['Satoshi'] text-sm font-medium">
          <a href="/terms" target="_blank" rel="noopener" className="text-studojo-purple-strong underline">Terms of Service</a>
          <a href="/privacy" target="_blank" rel="noopener" className="text-studojo-purple-strong underline">Privacy Policy</a>
          <a href="/refund-policy" target="_blank" rel="noopener" className="text-studojo-purple-strong underline">Refund Policy</a>
        </div>
        <label className="mt-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-neutral-900 accent-[#6d28d9]"
          />
          <span className="font-['Satoshi'] text-sm leading-5 text-neutral-900">
            I have read and agree to the updated Terms of Service, Privacy Policy and Refund Policy.
          </span>
        </label>
        {error && <p className="mt-3 font-['Satoshi'] text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <a href="/account/delete" className="font-['Satoshi'] text-sm text-neutral-600 underline">
            I don't agree, delete my account
          </a>
          <button
            type="button"
            onClick={accept}
            disabled={!agreed || saving}
            className="h-12 rounded-2xl border-2 border-neutral-900 bg-studojo-purple-strong px-6 font-['Satoshi'] text-base font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
