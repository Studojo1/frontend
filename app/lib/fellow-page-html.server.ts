// The Growth Fellowship student page's HTML shell. The page is served as a
// resource route, outside root.tsx, so PostHog and the Meta pixel never load on
// it: the address itself is the fellow's key, and analytics would record it.
// Styles and the script are static files in public/fellowship/; the script
// fetches the fellow's data from /api/fellowship-growth/<slug>.

/** Bump when public/fellowship/feed.css or feed.js changes, so browsers fetch the new files. */
export const ASSET_VERSION = "20261102f";

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

/** PAGE_HEADERS without the HTML content type, for the ".data" spelling of a fellow's address. */
export const PAGE_DATA_HEADERS: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_HEADERS).filter(([name]) => name !== "Content-Type"),
);

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
    <symbol id="i-share" viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></symbol>
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
    <symbol id="i-home" viewBox="0 0 24 24"><path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.8 9v11h4.7v-5.8h3V20h4.7V9"/></symbol>
    <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6.2 16.8V11a5.8 5.8 0 0 1 11.6 0v5.8l1.7 2.2H4.5z"/><path d="M10 21a2.2 2.2 0 0 0 4 0"/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 20.5 20.5"/></symbol>
    <symbol id="i-compose" viewBox="0 0 24 24"><path d="M12 4H6a2 2 0 0 0-2 2v14l4.5-3.5H18a2 2 0 0 0 2-2V12"/><path d="M14.5 10.2 20.3 4.4a1.5 1.5 0 0 0-2.1-2.1l-5.8 5.8-.6 2.7z"/></symbol>
    <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8.5 7.5h7M8.5 11h5"/></symbol>
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

// The fellow's page, with LinkedIn's top bar: the mark jumps to this week's posts; the script fills in the week pill.
const PAGE_TOP = `<a class="brand" href="#posts" aria-label="Studojo Growth Fellowship, this week's posts">
      <span class="mark" aria-hidden="true">S</span>
    </a>
    <button class="week-pill" id="week-pill" type="button" data-act="goto-next" hidden></button>
    <button class="m-me" type="button" data-act="tab" data-tab="me" aria-label="Your profile"><span class="avatar" id="m-avatar" aria-hidden="true"></span></button>
    <label class="m-search"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-search"/></svg><span class="sr-only">Search your posts</span><input id="m-search" type="search" placeholder="Search your posts" autocomplete="off" enterkeyhint="search"></label>
    <button class="m-compose" type="button" data-act="tab" data-tab="stories" aria-label="Share a story"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-compose"/></svg></button>
    <nav class="d-nav" aria-label="Sections">
      <button type="button" data-act="tab" data-tab="home" aria-current="page"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-home"/></svg><span>Home</span></button>
      <button type="button" data-act="tab" data-tab="stories"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-mic"/></svg><span>Stories</span></button>
      <button type="button" data-act="tab" data-tab="cohort"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-users"/></svg><span>Cohort</span></button>
      <button type="button" data-act="tab" data-tab="updates"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-bell"/></svg><span>Activity</span></button>
      <button type="button" data-act="tab" data-tab="milestones"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-briefcase"/></svg><span>Milestones</span></button>
      <button type="button" class="d-me" data-act="tab" data-tab="me"><span class="avatar" id="d-avatar" aria-hidden="true"></span><span>Me</span></button>
    </nav>`;

// A message page has nothing to jump to, so its logo is not a link.
const MESSAGE_TOP = `<span class="brand">
      ${LOGO}
    </span>`;

// "Understand LinkedIn's algorithm": a short read so fellows learn to post well on their own. Every "LinkedIn
// says" line is something LinkedIn has published (sources at the end); the tips are labelled as creators' rules of
// thumb. No numbers that LinkedIn hasn't published. Same for everyone, so it lives in the page itself.
const SRC = (href: string, text: string) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
const LEARN = `
    <section class="card card-pad learn" id="learn" aria-labelledby="learn-title">
      <div class="card-head"><h2 class="card-title" id="learn-title">Understand LinkedIn's algorithm</h2><span class="chip">3 min read</span></div>
      <p class="card-sub">How LinkedIn decides who sees a post, so you can post well on your own. Lines marked <span class="says">LinkedIn says</span> come from LinkedIn itself. The tips at the end are what tends to work for creators.</p>
      <div class="learn-list">
        <details open>
          <summary>Your post starts with your own network</summary>
          <div class="learn-body">
            <p><span class="says">LinkedIn says</span> A new post goes to the people you're connected to and the people who follow you. When they react, comment or share, it travels on to their networks too.</p>
            <p>So every connection is a door to another network. Growing your connections grows the first circle that sees you.</p>
          </div>
        </details>
        <details>
          <summary>Every post gets a quick check</summary>
          <div class="learn-body">
            <p><span class="says">LinkedIn says</span> Within moments, its systems sort each post as spam, low quality or fine. Spam and low-quality posts can be shown to fewer people, kept to your own network, or hidden.</p>
            <p><span class="says">LinkedIn says</span> The posts that travel furthest are the ones that add ideas, insight and inspiration.</p>
          </div>
        </details>
        <details>
          <summary>Real conversations beat empty reactions</summary>
          <div class="learn-body">
            <p><span class="says">LinkedIn says</span> It promotes posts that spark conversations and discussion, and it gives more weight to meaningful comments than to empty ones.</p>
            <p>A comment that responds to what you actually said is worth far more than a quick like or a "Great post!".</p>
          </div>
        </details>
        <details>
          <summary>Share what you know, as yourself</summary>
          <div class="learn-body">
            <p><span class="says">LinkedIn says</span> People value posts grounded in knowledge and advice, and posts from people they know. It also looks at whether you're writing about something you have real experience in.</p>
            <p>Your internship, your setback, the lesson you learned the hard way: that's your expertise. It's why your posts here are written from the stories you share.</p>
          </div>
        </details>
        <details>
          <summary>The first two lines decide if people stop</summary>
          <div class="learn-body">
            <p><span class="says">LinkedIn says</span> It measures how long people spend on a post, and shows posts that people scroll straight past to fewer people.</p>
            <p>So the lines people see before "…more" matter most. That's what <b>Add your line</b> is for: one line in your own words at the top gives people a reason to stop.</p>
          </div>
        </details>
        <details>
          <summary>You don't need a big following</summary>
          <div class="learn-body">
            <p><span class="says">LinkedIn says</span> The first few reactions and comments on a post matter most, and it deliberately moves some attention from the biggest accounts to everyone else.</p>
            <p>A student with a few hundred connections can be seen. Showing up every week is what counts.</p>
          </div>
        </details>
        <details>
          <summary>What LinkedIn holds back</summary>
          <div class="learn-body">
            <p><span class="says">LinkedIn says</span> It won't promote posts that ask for likes or reactions just to boost reach ("Like if you agree", "Comment YES"), chain posts asking for shares, or repetitive and irrelevant comments. It can limit or remove them.</p>
            <p><span class="says">LinkedIn says</span> Agreeing with friends to like or share each other's posts breaks its rules: it calls that artificial engagement.</p>
          </div>
        </details>
        <details>
          <summary>What tends to work</summary>
          <div class="learn-body">
            <p class="learn-note">Creators' rules of thumb, not LinkedIn's own words.</p>
            <ul>
              <li>Reply to comments, especially in the first hour after you post.</li>
              <li>Post on a steady schedule rather than in bursts. Your weekly posts here do that for you.</li>
              <li>Keep your profile complete: a clear photo, a headline that says what you do, and your college.</li>
              <li>Short paragraphs and plain words. Write the way you talk.</li>
              <li>Tag people only when they're really part of the story.</li>
              <li>Keep "In partnership with Studojo" on Studojo posts. It's required, and being open about it builds trust. Add your own line instead of rewriting the post.</li>
            </ul>
          </div>
        </details>
      </div>
      <p class="learn-src">Sources: LinkedIn Engineering on ${SRC("https://engineering.linkedin.com/publishing-platform/maximizing-our-publishing-platform-reach-network-distribution", "how posts spread")} (2014), ${SRC("https://www.linkedin.com/blog/engineering/feed/strategies-for-keeping-the-linkedin-feed-relevant", "keeping the feed relevant")} (2017), ${SRC("https://www.linkedin.com/blog/engineering/member-customer-experience/linkedin-feed-with-creator-side-optimization", "giving smaller creators a fair share")} (2018) and ${SRC("https://www.linkedin.com/blog/engineering/feed/understanding-feed-dwell-time", "time spent on posts")} (2020); the LinkedIn blog on ${SRC("https://www.linkedin.com/blog/member/product/keeping-your-feed-relevant-and-productive", "what it won't promote")} (May 2022) and ${SRC("https://www.linkedin.com/blog/member/product/mythbusting-the-feed-how-the-algorithm-works", "how the feed works")} (Aug 2022); LinkedIn's Alice Xiong and Dan Roth ${SRC("https://www.entrepreneur.com/science-technology/linkedin-changed-its-algorithms-heres-how-your-posts/454728", "in Entrepreneur")} (June 2023); LinkedIn Help on ${SRC("https://www.linkedin.com/help/linkedin/answer/a1338787", "spam")} and its ${SRC("https://www.linkedin.com/legal/professional-community-policies", "community policies")}.</p>
    </section>`;

const LEARN_TEASER = `
    <button class="card learn-teaser" type="button" data-act="tab" data-tab="learn">
      <span class="lt-ic" aria-hidden="true"><svg class="ic"><use href="#i-book"/></svg></span>
      <span class="lt-text"><b>Understand LinkedIn's algorithm</b><span>How LinkedIn decides who sees your post · 3 min read</span></span>
      <svg class="ic ic-sm" aria-hidden="true"><use href="#i-arrow"/></svg>
    </button>`;

const PAGE = `
<div class="page" id="page">
  <aside class="rail-left" aria-label="Your profile">
    <section class="card profile" id="profile"></section>
  </aside>

  <main class="feed" id="main" aria-busy="true">
    <div class="notice" id="notice" hidden></div>
    <section class="card ed-cover" id="ed-cover" aria-labelledby="ed-title"></section>${LEARN_TEASER}
    <div class="feed-head">
      <div class="fh-row"><h2>This week's posts</h2><span class="chip" id="week-range"></span></div>
      <p id="feed-help">Loading your posts.</p>
    </div>
    <div class="post-list" id="posts"></div>
  </main>

  <aside class="rail-right" aria-label="Milestones, stories, fellowship news and how LinkedIn works">
    <section class="card card-pad" id="milestones" aria-labelledby="ms-title"></section>
    <section class="card card-pad share" id="share" aria-labelledby="share-title"></section>
    <section class="card card-pad" id="news" aria-labelledby="news-title"></section>${LEARN}
  </aside>

  <section class="activity card card-pad" id="activity" aria-labelledby="act-title"></section>
</div>

<nav class="m-tabs" id="m-tabs" aria-label="Sections">
  <button type="button" data-act="tab" data-tab="home" aria-current="page"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-home"/></svg><span>Home</span></button>
  <button type="button" data-act="tab" data-tab="stories"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-mic"/></svg><span>Stories</span></button>
  <button type="button" data-act="tab" data-tab="cohort"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-users"/></svg><span>Cohort</span></button>
  <button type="button" data-act="tab" data-tab="updates"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-bell"/></svg><span>Activity</span></button>
  <button type="button" data-act="tab" data-tab="milestones"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-briefcase"/></svg><span>Milestones</span></button>
</nav>

<div class="toasts" id="toasts" role="status" aria-live="polite"></div>
<dialog class="ask" id="ask" aria-labelledby="ask-title" aria-describedby="ask-sub">
  <h2 class="ask-title" id="ask-title">Did you post it on LinkedIn?</h2>
  <p class="ask-sub" id="ask-sub"></p>
  <label class="panel-label" for="ask-url">Link to your post <span class="opt">(optional)</span></label>
  <p class="panel-help" id="ask-help">On LinkedIn, open your post, tap the three dots, then Copy link to post. You can add it later too.</p>
  <input class="field" id="ask-url" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="linkedin.com/posts/..." aria-describedby="ask-help ask-err">
  <p class="err" id="ask-err"></p>
  <div class="panel-actions">
    <button class="btn btn-ghost" type="button" data-act="ask-no">Not yet</button>
    <button class="btn btn-primary" type="button" data-act="ask-yes" autofocus>Yes, I posted it</button>
  </div>
</dialog>
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
