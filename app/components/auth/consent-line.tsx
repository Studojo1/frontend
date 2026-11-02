/**
 * What every sign-in and sign-up on this page agrees to: the Terms and the Privacy Policy, with the 18+ line. Same words
 * on every path. QA-FIX (2 Nov 2026): the clause about a public Studojo page is gone until the owner brings the page
 * back (no host serves /profile/<slug> now; retired-routes.ts sends /profile to /).
 */
export function ConsentLine({ lead }: { lead: "By continuing" | "By signing up" }) {
  return (
    <>
      {lead}, you confirm you are 18 or older and agree to Studojo&apos;s{" "}
      <a href="/terms" target="_blank" rel="noopener" className="underline">Terms</a> and{" "}
      <a href="/privacy" target="_blank" rel="noopener" className="underline">Privacy Policy</a>.
    </>
  );
}
