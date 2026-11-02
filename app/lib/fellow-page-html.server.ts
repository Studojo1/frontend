// The Growth Fellowship student page's HTML shell. The page is served as a
// resource route, outside root.tsx, so PostHog and the Meta pixel never load on
// it: the address itself is the fellow's key, and analytics would record it.
// Styles and the script are static files in public/fellowship/; the script
// fetches the fellow's data from /api/fellowship-growth/<slug>.

/** Bump when public/fellowship/feed.css or feed.js changes, so browsers fetch the new files. */
export const ASSET_VERSION = "20261102a";

export const PAGE_HEADERS: Record<string, string> = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; " +
    "frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'",
};

const ICONS = `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false">
  <defs>
    <symbol id="i-copy" viewBox="0 0 24 24"><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6.5a2.5 2.5 0 0 0-2.5-2.5H6.5A2.5 2.5 0 0 0 4 6.5V13a2.5 2.5 0 0 0 2.5 2.5h2"/></symbol>
    <symbol id="i-pen" viewBox="0 0 24 24"><path d="M4 20h4.2L19.3 8.9a2.3 2.3 0 0 0-3.2-3.2L5 16.8V20z"/><path d="M14.5 7.3l3.2 3.2"/></symbol>
    <symbol id="i-send" viewBox="0 0 24 24"><path d="M20.5 3.5 3.5 10.6l7 2.9 2.9 7 7.1-17z"/><path d="M10.5 13.5l4.4-4.4"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
    <symbol id="i-check-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.8 2.8 5.4-5.6"/></symbol>
    <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.6 3.7 5.6 3.7 9s-1.3 6.4-3.7 9c-2.4-2.6-3.7-5.6-3.7-9S9.6 5.6 12 3z"/></symbol>
    <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>
    <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M7 16.5V12M12 16.5V7M17 16.5V9.5"/></symbol>
    <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></symbol>
    <symbol id="i-mic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></symbol>
    <symbol id="i-keyboard" viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8"/></symbol>
    <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
    <symbol id="i-cert" viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="12.5" rx="2"/><path d="M7.5 8h9M7.5 11.5h4.5"/><circle cx="16" cy="15.5" r="2.6"/><path d="M14.7 17.7 14 21l2-1.1 2 1.1-.7-3.3"/></symbol>
    <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/></symbol>
    <symbol id="i-briefcase" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18"/></symbol>
    <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/></symbol>
    <symbol id="i-trend" viewBox="0 0 24 24"><path d="M3.5 17l6-6 4 4 7-7"/><path d="M15 8h5.5v5.5"/></symbol>
    <symbol id="i-thumb" viewBox="0 0 24 24"><path class="ic-solid" d="M2 10h4v11H2zM8 21h9.4a2 2 0 0 0 2-1.6l1.5-7A2 2 0 0 0 19 10h-5.2l.9-4.2A2 2 0 0 0 12.8 3.3L8 10z"/></symbol>
    <symbol id="i-comment" viewBox="0 0 24 24"><path d="M20 15a2 2 0 0 1-2 2H8.5L4 20.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/></symbol>
    <symbol id="i-image" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8.5 8.5"/></symbol>
    <symbol id="i-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.3v.2"/></symbol>
    <symbol id="i-edit-sm" viewBox="0 0 24 24"><path d="M4 20h4.2L19.3 8.9a2.3 2.3 0 0 0-3.2-3.2L5 16.8V20z"/></symbol>
    <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.2 14.6c1.9.9 3.3 2.8 3.3 5.4"/></symbol>
  </defs>
</svg>`;

const head = (top: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="color-scheme" content="light">
<link rel="icon" href="data:,">
<title>Your Growth Fellowship | Studojo</title>
<link rel="stylesheet" href="/fellowship/feed.css?v=${ASSET_VERSION}">
</head>
<body>
${ICONS}
<header class="topbar">
  <div class="topbar-in">
    ${top}
  </div>
</header>`;

const LOGO = `<span class="mark" aria-hidden="true">S</span>
      <span class="brand-text"><span class="brand-name">Studojo</span><span class="brand-sub">Growth Fellowship</span></span>`;

// The fellow's page: the logo jumps to this week's posts; the script fills in the week pill.
const PAGE_TOP = `<a class="brand" href="#posts" aria-label="Studojo Growth Fellowship, this week's posts">
      ${LOGO}
    </a>
    <button class="week-pill" id="week-pill" type="button" data-act="goto-next" hidden></button>`;

// A message page has nothing to jump to, so its logo is not a link.
const MESSAGE_TOP = `<span class="brand">
      ${LOGO}
    </span>`;

const PAGE = `
<div class="page" id="page">
  <aside class="rail-left" aria-label="Your profile">
    <section class="card profile" id="profile"></section>
  </aside>

  <main class="feed" id="main" aria-busy="true">
    <div class="notice" id="notice" hidden></div>
    <section class="card ed-cover" id="ed-cover" aria-labelledby="ed-title"></section>
    <div class="feed-head">
      <div class="fh-row"><h2>This week's posts</h2><span class="chip" id="week-range"></span></div>
      <p id="feed-help">Loading your posts.</p>
    </div>
    <div class="post-list" id="posts"></div>
  </main>

  <aside class="rail-right" aria-label="Milestones, stories and fellowship news">
    <section class="card card-pad" id="milestones" aria-labelledby="ms-title"></section>
    <section class="card card-pad share" id="share" aria-labelledby="share-title"></section>
    <section class="card card-pad" id="news" aria-labelledby="news-title"></section>
  </aside>

  <section class="activity card card-pad" id="activity" aria-labelledby="act-title"></section>
</div>

<div class="toasts" id="toasts" role="status" aria-live="polite"></div>
<script src="/fellowship/feed.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;

const message = (title: string, text: string) => `
<main class="page page-message">
  <section class="card card-pad message-card">
    <h1 class="card-title">${title}</h1>
    <p class="card-sub">${text}</p>
  </section>
</main>
</body>
</html>`;

export function fellowPageHtml(state: "ok" | "missing" | "error"): string {
  if (state === "ok") return head(PAGE_TOP) + PAGE;
  if (state === "missing") {
    return head(MESSAGE_TOP) + message("This link isn't working", "Check you opened the whole link from your message. If it still doesn't open, ask the Studojo team on WhatsApp for your link.");
  }
  return head(MESSAGE_TOP) + message("We couldn't load your page", "Something went wrong on our side. Please try again in a minute.");
}
