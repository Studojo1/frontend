/** In-app browser detection (EX-06).
 *
 * About 87% of Meta ad clicks land in the Instagram or Facebook in-app
 * browser, and those visitors are 35% of traffic but 18% of new accounts.
 * Google sign-in does work there (56 of 63 recent in-app signups used it), so
 * nothing is blocked or forced; the auth page flags these sessions in its
 * funnel events and offers a way out to the phone's real browser.
 */

export type InAppBrowser = "instagram" | "facebook" | null;

/** Which Meta in-app browser a user agent belongs to, if any. Pure, for tests. */
export function detectInAppBrowser(ua: string | null | undefined): InAppBrowser {
  if (!ua) return null;
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/.test(ua)) return "facebook";
  return null;
}

export function isAndroid(ua: string | null | undefined): boolean {
  return !!ua && /Android/i.test(ua);
}

/** An Android intent URL that asks the OS to open `href` in Chrome. The
 * in-app browser hands it to the system; if Chrome is missing, the
 * browser_fallback_url keeps the user on the same page. */
export function chromeIntentUrl(href: string): string {
  const url = new URL(href);
  const rest = url.host + url.pathname + url.search;
  return `intent://${rest}#Intent;scheme=${url.protocol.replace(":", "")};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(href)};end`;
}
