// RECORDINGS (5 Nov 2026, the owner and Pranav: "see how people are using the platform ... user recordings like
// Mixpanel gives us ... under our admin panel"): session replay of the site's own pages, played in the admin's
// /recordings. The recorder (recordings/recorder.ts, rrweb, about 25 KB gzip) is its own chunk, fetched only when the
// server's RECORDINGS is on (the root loader's rec), after the page has loaded and the browser is idle, so it never
// competes with the first paint (30% of ad visitors leave within 5 s). Its chunks go to the platform's POST api/rec
// (PRODUCT_ORIGIN), cookies included, so the site visit and the platform session that follows are one recording.
// Never inside a frame, never for a crawler, never after the platform said stop (stu_rec_off), never without
// CompressionStream, never on the pages Meta never sees (meta-pixel.ts) or the old homepage, and only where the
// tracking consent allows it (consent.ts trackingAllowed: a Europe time zone needs Accept; Decline is never recorded).
// No notice of its own (the owner, 5 Nov 2026). Pure helpers for tests (app/lib/recordings.test.mjs).
import { readConsent, trackingAllowed } from "../consent";
import { metaExcludedPath, metaExcludedSearch } from "../meta-pixel";
import { mayRecord } from "./gate";

/** Whether RECORDINGS switches recording on ("1", "on" or "true"). Pure. */
export function recordingsOn(value: string | null | undefined): boolean {
  return ["1", "on", "true"].includes((value ?? "").trim().toLowerCase());
}

/** Pages never recorded: what Meta never sees, the old homepage, staff and Sensei pages. Pure. */
export function recordingExcluded(pathname: string, search: string): boolean {
  if (metaExcludedPath(pathname) || metaExcludedSearch(search)) return true;
  return /^\/(time-machine|time-machine-assets|admin|bob|sensei)(\/|-|$)/.test(pathname);
}

/** The platform's chunk address, or "" when this server has no product origin (a local run). Pure. */
export function recEndpoint(productOrigin: string): string {
  return productOrigin ? `${productOrigin}/api/rec` : "";
}

let booted = false;

export function bootRecorder(on: boolean, endpoint: string): void {
  if (!on || !endpoint || booted || typeof window === "undefined") return;
  try {
    if (window.top !== window.self) return;
  } catch {
    return;
  }
  if (typeof CompressionStream === "undefined" || typeof fetch === "undefined") return;
  if (!mayRecord(navigator.userAgent, document.cookie)) return;
  if (readConsent() === "denied" || !trackingAllowed()) return;
  if (recordingExcluded(window.location.pathname, window.location.search)) return;
  booted = true;
  const go = () =>
    void import("./recorder")
      .then((m) => m.startRecorder({ endpoint, excluded: recordingExcluded }))
      .catch(() => {
        // the chunk did not load: no recording this time
      });
  const idle = () => {
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(go, { timeout: 4_000 });
    else window.setTimeout(go, 1_500);
  };
  if (document.readyState === "complete") window.setTimeout(idle, 300);
  else window.addEventListener("load", () => window.setTimeout(idle, 300), { once: true });
}
