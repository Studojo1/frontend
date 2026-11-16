// IG-GATE (16 Nov 2026, the owner: "Anybody on an Instagram browser that joins lands on a singular landing page which has
// only one thing in the middle that says use your own device browser to access Studojo. Okay, and they click on that
// and just takes them to the other app"; the same morning INAPP-IGEXT opened Safari from Instagram on his iPhone).
//
// Why (production, 3 to 15 Nov): 72% of visitors came in Instagram's browser and 8.9% of them signed up, against 28.5% in
// a real browser; Google has no session there and refuses some sign-ins outright.
//
// Instead of any page of the site, in Instagram's browser only (root.tsx, lib/inapp.ts instagramGateOs on the request,
// so it is drawn by the server and the site never flashes): the logo and one button.
//   - iPhone: Instagram's own instagram://extbrowser opens the same address (its ad keys too) in the phone's browser.
//   - Android: Chrome by intent; with no Chrome the intent comes back here with ?esc=1, and the same button then asks
//     Android for the phone's default browser.
//   - If the page is still here 1.5 s after the tap: the app's own steps, Copy link, and "Continue here anyway" (the site
//     in Instagram's browser for the rest of the visit), so nobody is ever stuck.
// Journey rows: inapp_escape_tried (how igext, intent or browser; cta "gate") and inapp_escape_sheet (why timeout).
import { useCallback, useState } from "react";
import gateCss from "./ig-gate.css?url";
import { escapeUrl, gateHow, withoutEscapeMark } from "~/lib/inapp";
import { sendJourney } from "~/lib/journey-pages";
import { STU_HEAD } from "~/components/home-b2c/links";
import { copyText, withHeld } from "./InAppEscape";

/**
 * IG-TAP (16 Nov 2026, the owner: "instead of adding an extra page ... clicks try for free on our homepage it automatically
 * takes them to the default browser"): the gate is off; a tap on a call start leaves Instagram's browser instead
 * (InAppEscape.tsx IG_TAP_ESCAPE). True puts the one page back.
 */
export const IG_GATE_ON = false;
/** How long a tap's own escape gets before the help shows (the other app may ask "Open in ...?" first). */
export const GATE_WAIT_MS = 1_500;
/** Set by "Continue here anyway": the site in Instagram's browser for the rest of this visit. */
export const GATE_SKIP_KEY = "stu_ig_gate_skip";

export function IgGate({ os, onSkip }: { os: "ios" | "android"; onSkip: () => void }) {
  const [stuck, setStuck] = useState(false);
  const [copied, setCopied] = useState<boolean | null>(null);

  const open = useCallback(() => {
    const here = withHeld(withoutEscapeMark(window.location.href));
    const how = gateHow(os, window.location.search);
    const base = { path: window.location.pathname, app: "instagram", os, cta: "gate" };
    // The page going to the background is the other app opening: then no help.
    let left = false;
    const onHide = () => {
      if (document.visibilityState === "hidden") left = true;
    };
    const onPageHide = () => {
      left = true;
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    sendJourney({ step: "inapp_escape_tried", ...base, how });
    try {
      window.location.href = escapeUrl(how, here);
    } catch {
      // the app refused the address: the help below
    }
    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      if (left) return;
      setStuck(true);
      sendJourney({ step: "inapp_escape_sheet", ...base, why: "timeout" });
    }, GATE_WAIT_MS);
  }, [os]);

  const dots = os === "android" ? "⋮" : "•••";
  const item = os === "android" ? "Open in Chrome" : "Open in external browser";
  return (
    <main className="sj-gate" id="main">
      <link rel="stylesheet" href={gateCss} precedence="default" />
      <div className="sj-gate-in">
        <img className="sj-gate-head" src={STU_HEAD} alt="Studojo" width={72} height={72} />
        <button type="button" className="sj-gate-go" onClick={open}>
          Use your phone&apos;s browser to access Studojo
        </button>
        {stuck && (
          <div className="sj-gate-help" role="status">
            <p>
              If nothing opened, tap {dots} at the top right, then {item}.
            </p>
            <button type="button" className="sj-gate-copy" onClick={() => void copyText(withoutEscapeMark(window.location.href)).then(setCopied)}>
              {copied ? "Link copied" : "Copy link"}
            </button>
            {copied === false && <p className="sj-gate-err">Copying didn&apos;t work here. Press and hold the address at the top to copy it.</p>}
            <button type="button" className="sj-gate-stay" onClick={onSkip}>
              Continue here anyway
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
