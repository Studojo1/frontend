// The Growth Fellowship student page's HTML shell. The page is served as a
// resource route, outside root.tsx, so PostHog and the Meta pixel never load on
// it: the address itself is the fellow's key, and analytics would record it.
// Styles and the script are static files in public/fellowship/; the script
// fetches the fellow's data from /api/fellowship-growth/<slug>.
//
// Five tabs, each its own address: Today at /fellowship-growth/<slug>, then
// /post, /talk, /numbers and /you, plus /learn (How LinkedIn works, opened from
// You). Every tab gets the same shell with body[data-page] set; fellow.js draws it.

/** Bump when anything in public/fellowship/ changes, so browsers fetch the new files. */
export const ASSET_VERSION = "20261120a";

export const PAGE_HEADERS: Record<string, string> = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://pd.w.org https://api.openverse.org; connect-src 'self'; font-src 'self'; " +
    "frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'",
};

/** PAGE_HEADERS without the HTML content type, for the ".data" spelling of a fellow's address. */
export const PAGE_DATA_HEADERS: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_HEADERS).filter(([name]) => name !== "Content-Type"),
);

/** The tabs, in order, with their address under the fellow's page ("" is Today). */
export const FELLOW_TABS = [
  { id: "today", label: "Today", path: "" },
  { id: "post", label: "Post", path: "post" },
  { id: "talk", label: "Talk", path: "talk" },
  { id: "numbers", label: "Numbers", path: "numbers" },
  { id: "you", label: "You", path: "you" },
] as const;
export type FellowPage = (typeof FELLOW_TABS)[number]["id"] | "learn";
/** Pages with an address of their own after the slug: /fellowship-growth/<slug>/<page>. */
export const FELLOW_SUBPAGES: readonly FellowPage[] = ["post", "talk", "numbers", "you", "learn"];
export const isFellowSubpage = (v: string | undefined): v is FellowPage => !!v && (FELLOW_SUBPAGES as readonly string[]).includes(v);

const TITLES: Record<FellowPage, string> = { today: "Today", post: "Post", talk: "Talk", numbers: "Numbers", you: "You", learn: "How LinkedIn works" };

// The tab icons (fellow.js draws the rest of the page's icons the same way).
const ICON: Record<string, string> = {
  today: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
  post: '<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/>',
  talk: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  numbers: '<path d="M5 20V12M10 20V6M15 20v-9M20 20V9"/>',
  you: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
};
const icon = (id: string) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[id] ?? ""}</svg>`;

const LOGO = `<img class="mark" src="/logo.png" alt="Studojo" width="28" height="28">`;

const head = (title: string, page: FellowPage | "message") => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#F5F5F7">
<link rel="icon" href="data:,">
<title>${title} · Growth Fellowship</title>
<link rel="stylesheet" href="/fellowship/fellow.css?v=${ASSET_VERSION}">
</head>
<body data-page="${page}" class="${page === "message" ? "no-tabs" : "has-tabs"}">`;

/**
 * The page for one fellow's tab. The slug has passed normaliseSlug (lower-case letters, digits and one hyphen),
 * so it goes into the links as it is.
 */
function pageShell(page: FellowPage, slug: string): string {
  const base = `/fellowship-growth/${slug}`;
  // How LinkedIn works is opened from You, so You stays the current tab there.
  const current = page === "learn" ? "you" : page;
  const links = FELLOW_TABS.map((t) => `<a class="tab" href="${t.path ? `${base}/${t.path}` : base}"${t.id === current ? ' aria-current="page"' : ""}>${icon(t.id)}<span>${t.label}</span></a>`).join("");
  return `${head(TITLES[page], page)}
<header class="top"><div class="top-in">
  <a class="brand" href="${base}">${LOGO}<span>Growth Fellowship</span></a>
  <nav class="tabs" aria-label="Sections">${links}</nav>
  <a class="me-dot" id="me-dot" href="${base}/you" aria-label="You"></a>
</div></header>
<main class="page" id="main" aria-busy="true"><p class="loading">Loading your page</p></main>
<nav class="tabbar" aria-label="Sections">${links}</nav>
<div class="toasts" id="toasts" role="status" aria-live="polite"></div>
<script src="/fellowship/fellow.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}

// A message page has nothing to switch to: no tabs, and the logo is not a link.
const message = (title: string, text: string) => `${head(title, "message")}
<header class="top"><div class="top-in">
  <span class="brand">${LOGO}<span>Growth Fellowship</span></span>
</div></header>
<main class="page" id="main">
  <div class="card message"><h1>${title}</h1><p>${text}</p></div>
</main>
</body>
</html>`;

export function fellowPageHtml(state: "ok" | "missing" | "error", page: FellowPage = "today", slug = ""): string {
  if (state === "ok" && slug) return pageShell(page, slug);
  if (state === "error") return message("We couldn't load your page", "Something went wrong on our side. Please try again in a minute.");
  return message("This link isn't working", "Check you opened the whole link from your message. If it still doesn't open, ask the Studojo team on WhatsApp for your link.");
}
