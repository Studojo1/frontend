// Shared browser utilities — bandwidth optimization + watchdog

// ── Request interception: block everything that isn't needed ──────────────────
// Cuts ~70-80% of per-session bandwidth. We only need HTML + XHR/fetch for
// LinkedIn's own API calls. Images, fonts, CSS, media are all wasted bytes.

const BLOCKED_RESOURCE_TYPES = new Set([
  "image",
  "media",
  "font",
  "stylesheet",
  "ping",
  "other",
]);

// URL patterns that are safe to abort (tracking, analytics, ads)
const BLOCKED_URL_PATTERNS = [
  /static\.licdn\.com\/sc\/h\//,       // LinkedIn profile images
  /media\.licdn\.com/,                  // LinkedIn media
  /px\.ads\.linkedin\.com/,            // LinkedIn ad pixels
  /snap\.licdn\.com/,                  // LinkedIn analytics
  /platform\.linkedin\.com\/badges/,   // LinkedIn badges
  /googletagmanager\.com/,
  /google-analytics\.com/,
  /doubleclick\.net/,
];

export async function blockHeavyResources(ctx: any): Promise<void> {
  await ctx.route("**/*", (route: any) => {
    const type = route.request().resourceType();
    const url = route.request().url();

    if (BLOCKED_RESOURCE_TYPES.has(type)) {
      route.abort();
      return;
    }

    if (BLOCKED_URL_PATTERNS.some((re) => re.test(url))) {
      route.abort();
      return;
    }

    route.continue();
  });
}

// ── Watchdog: kill browser if a task takes too long ──────────────────────────
// Prevents hung browsers from wasting RAM + proxy bandwidth indefinitely.
// Based on OpenOutreach's daemon watchdog pattern.

export function withWatchdog<T>(
  fn: () => Promise<T>,
  browser: any,
  timeoutMs: number,
  label: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      console.warn(`[watchdog] ${label} exceeded ${timeoutMs}ms — killing browser`);
      browser?.close().catch(() => {});
      reject(new Error(`WATCHDOG_TIMEOUT:${label}`));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ── Human-like typing ─────────────────────────────────────────────────────────
// fill() is instant and looks robotic. Type character by character with
// randomized delays (50-200ms) matching real human keystroke patterns.

export async function humanType(page: any, selector: string, text: string): Promise<void> {
  await page.click(selector).catch(() => {});
  // Clear existing value first
  await page.fill(selector, "").catch(() => {});
  await page.type(selector, text, { delay: 50 + Math.random() * 150 });
}

export async function humanTypeLocator(locator: any, text: string): Promise<void> {
  await locator.click().catch(() => {});
  await locator.fill("").catch(() => {});
  await locator.type(text, { delay: 50 + Math.random() * 150 });
}

// ── Jitter delay ──────────────────────────────────────────────────────────────

export const jitter = (min = 800, max = 2500) =>
  new Promise<void>((r) => setTimeout(r, min + Math.random() * (max - min)));

// ── In-page Voyager API fetch ─────────────────────────────────────────────────
// Runs fetch() inside the browser context so it inherits the full browser
// fingerprint (TLS, headers, cookies) automatically. More stealthy than
// direct Node.js HTTP calls for authenticated LinkedIn API reads.

export async function voyagerFetch(
  page: any,
  url: string,
  csrfToken: string,
): Promise<any> {
  return page.evaluate(
    async ({ url, csrfToken }: { url: string; csrfToken: string }) => {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "csrf-token": csrfToken,
          "x-restli-protocol-version": "2.0.0",
          "x-li-lang": "en_US",
          Accept: "application/vnd.linkedin.normalized+json+2.1",
        },
      });
      if (!res.ok) throw new Error(`voyager_${res.status}`);
      return res.json();
    },
    { url, csrfToken },
  );
}
