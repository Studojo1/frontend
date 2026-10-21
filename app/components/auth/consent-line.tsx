/**
 * What every sign-in and sign-up on this page agrees to (the owner's choice, 22 Oct 2026): the Terms and the Privacy
 * Policy, including the public Studojo page the job search makes (Terms section 5). Same words on every path.
 */
export function ConsentLine({ lead }: { lead: "By continuing" | "By signing up" }) {
  return (
    <>
      {lead}, you confirm you are 18 or older and agree to Studojo&apos;s{" "}
      <a href="/terms" target="_blank" rel="noopener" className="underline">Terms</a> and{" "}
      <a href="/privacy" target="_blank" rel="noopener" className="underline">Privacy Policy</a>, including{" "}
      <a href="/terms#your-page" target="_blank" rel="noopener" className="underline">your public Studojo page</a>.
    </>
  );
}
