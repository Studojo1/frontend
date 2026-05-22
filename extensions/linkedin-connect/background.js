/**
 * Studojo LinkedIn Connect — Background Service Worker (Manifest V3)
 *
 * Handles:
 *   CONNECT_LINKEDIN  — capture all LinkedIn cookies + UA → POST to AutoApply session endpoint
 *   CHECK_STATUS      — check extension connection state
 *   DISCONNECT        — clear stored state
 *   chrome.alarms     — 7-day auto-refresh of cookie session
 */

const STUDOJO_ORIGINS = ['https://studojo.com', 'https://studojo.pro'];
const LINKEDIN_ORIGINS = ['https://www.linkedin.com', 'https://linkedin.com'];

// All cookies LinkedIn uses for session / CSRF / fingerprinting
const LINKEDIN_COOKIE_NAMES = [
  'li_at',        // primary auth session
  'JSESSIONID',   // CSRF token (required for Voyager API)
  'bcookie',      // browser fingerprint
  'bscookie',     // secure browser fingerprint
  'lidc',         // datacenter routing
  'li_gc',        // consent
  'li_sugr',      // user tracking
  'lang',         // language preference
  'timezone',     // timezone
];

const ALARM_NAME = 'studojo-linkedin-refresh';
const REFRESH_INTERVAL_DAYS = 7;

// ── Cookie helpers ─────────────────────────────────────────────────────────────

async function getCookie(url, name) {
  return new Promise((resolve) => {
    chrome.cookies.get({ url, name }, (cookie) => resolve(cookie ? cookie.value : null));
  });
}

async function getAllLinkedInCookies() {
  const cookieMap = {};
  for (const origin of LINKEDIN_ORIGINS) {
    for (const name of LINKEDIN_COOKIE_NAMES) {
      if (cookieMap[name]) continue; // already got it from another origin
      const val = await getCookie(origin, name);
      if (val) cookieMap[name] = val;
    }
  }
  return cookieMap;
}

// Build a cookie string in the format the Voyager API expects
function buildCookieString(cookies) {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

async function getStudojoSession() {
  const SESSION_COOKIE_NAMES = [
    '__Secure-better-auth.session_token',
    'better-auth.session_token',
  ];
  for (const origin of STUDOJO_ORIGINS) {
    for (const name of SESSION_COOKIE_NAMES) {
      const val = await getCookie(origin, name);
      if (val) return { value: val, origin };
    }
  }
  return null;
}

// Capture the full LinkedIn cookie jar as an array of objects (not just a
// fixed name list — outreach's server-side Playwright needs every cookie
// LinkedIn sets to look authentic, including ones we haven't enumerated).
async function getFullLinkedInCookieJar() {
  const jar = [];
  const seen = new Set();
  for (const origin of LINKEDIN_ORIGINS) {
    const cookies = await new Promise((resolve) => {
      chrome.cookies.getAll({ url: origin }, (c) => resolve(c || []));
    });
    for (const c of cookies) {
      const key = `${c.name}@${c.domain}`;
      if (seen.has(key)) continue;
      seen.add(key);
      jar.push({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite,
      });
    }
  }
  return jar;
}

// ── Outreach session refresh ──────────────────────────────────────────────────
// Posts the current LinkedIn cookies to the job-outreach-svc cookies endpoint.
// Runs (a) right after the page-driven connect succeeds (via MARK_OUTREACH_
// CONNECTED) and (b) every 7 days via the same alarm that refreshes autoapply.

async function refreshOutreachSession() {
  const stored = await chrome.storage.local.get(['outreach_connected', 'studojo_origin']);
  if (!stored.outreach_connected) return { skipped: true };

  const cookies = await getAllLinkedInCookies();
  if (!cookies['li_at']) throw new Error('not_logged_in_linkedin');
  if (!cookies['JSESSIONID']) throw new Error('no_jsessionid');

  const session = await getStudojoSession();
  if (!session) throw new Error('not_logged_in_studojo');

  const jar = await getFullLinkedInCookieJar();
  const apiUrl = `${session.origin}/api/v1/outreach/linkedin/automation/login/cookies`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      li_at: cookies['li_at'],
      jsessionid: cookies['JSESSIONID'].replace(/^"|"$/g, ''),
      is_extension: true,
      cookies: jar,
    }),
  });

  if (response.status === 401) throw new Error('not_logged_in_studojo');
  if (!response.ok) throw new Error(`api_error:${response.status}`);

  await chrome.storage.local.set({ outreach_refreshed_at: Date.now() });
  return { ok: true };
}

// ── Session capture ────────────────────────────────────────────────────────────

async function captureAndSendSession() {
  const cookies = await getAllLinkedInCookies();

  if (!cookies['li_at']) throw new Error('not_logged_in_linkedin');

  const session = await getStudojoSession();
  if (!session) throw new Error('not_logged_in_studojo');

  // Build full cookie string for Voyager API (JSESSIONID for CSRF)
  const cookieString = buildCookieString(cookies);

  // Capture timezone + locale from browser
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = navigator.language || 'en-US';

  // userAgent — the exact UA Patchright needs to match to avoid fingerprint mismatch
  const userAgent = navigator.userAgent;

  const apiUrl = `${session.origin}/api/autoapply/session`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      liAt: cookies['li_at'],
      cookies: cookieString,
      userAgent,
      locale,
      timezone,
    }),
  });

  if (response.status === 401) throw new Error('not_logged_in_studojo');
  if (!response.ok) throw new Error(`api_error:${response.status}`);

  await chrome.storage.local.set({
    connected: true,
    connected_at: Date.now(),
    studojo_origin: session.origin,
  });

  // Schedule 7-day auto-refresh
  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: REFRESH_INTERVAL_DAYS * 24 * 60,
  });

  return { ok: true };
}

// ── Option C: auto-capture when LinkedIn tab fully loads ──────────────────────
// When the LKOT page calls STUDOJO_OPEN_LINKEDIN, the background opens a
// LinkedIn tab and sets pendingCapture = true. This listener fires when that tab
// reaches "complete" and auto-runs captureAndSendSession() — zero user interaction
// needed beyond opening the tab.

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url?.includes('linkedin.com')) return;

  const stored = await chrome.storage.local.get([
    'pendingCapture',
    'pendingCaptureTabId',
    'pendingCaptureExpiry',
  ]);
  if (!stored.pendingCapture) return;

  // Stale flag guard — auto-expires after 10 minutes
  if (stored.pendingCaptureExpiry && Date.now() > stored.pendingCaptureExpiry) {
    await chrome.storage.local.remove(['pendingCapture', 'pendingCaptureTabId', 'pendingCaptureExpiry']);
    return;
  }

  // If we tracked which tab we opened, only fire for that one
  if (stored.pendingCaptureTabId && stored.pendingCaptureTabId !== tabId) return;

  // Clear immediately — prevents double-fire if tab navigates again
  await chrome.storage.local.remove(['pendingCapture', 'pendingCaptureTabId', 'pendingCaptureExpiry']);

  try {
    await captureAndSendSession();
    console.log('[studojo] Auto-captured LinkedIn session (Option C)');

    // Notify open Studojo tabs — page can update immediately without waiting for next poll
    const studojoTabs = await chrome.tabs.query({ url: STUDOJO_ORIGINS.map(o => `${o}/*`) });
    for (const t of studojoTabs) {
      chrome.tabs.sendMessage(t.id, { type: 'STUDOJO_SESSION_CAPTURED' }).catch(() => {});
    }
  } catch (err) {
    console.warn('[studojo] Auto-capture failed:', err.message);
    const studojoTabs = await chrome.tabs.query({ url: STUDOJO_ORIGINS.map(o => `${o}/*`) });
    for (const t of studojoTabs) {
      chrome.tabs.sendMessage(t.id, {
        type: 'STUDOJO_SESSION_CAPTURE_FAILED',
        error: err.message,
      }).catch(() => {});
    }
  }
});

// ── Auto-refresh alarm ─────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  // Run both refreshes — autoapply and outreach are independent features that
  // can be connected separately. Don't let one failure starve the other.
  const results = await Promise.allSettled([
    captureAndSendSession(),
    refreshOutreachSession(),
  ]);

  const [autoApplyRes, outreachRes] = results;

  // If LinkedIn or Studojo session is gone, clear ALL connected flags — the
  // user will have to reconnect manually anyway.
  const fatalErrors = ['not_logged_in_linkedin', 'not_logged_in_studojo'];
  const hadFatal = results.some(
    (r) => r.status === 'rejected' && fatalErrors.includes(r.reason?.message),
  );
  if (hadFatal) {
    await chrome.storage.local.remove([
      'connected', 'connected_at', 'outreach_connected', 'outreach_refreshed_at',
    ]);
  }

  if (autoApplyRes.status === 'fulfilled') {
    console.log('[studojo] AutoApply session auto-refreshed');
  } else {
    console.warn('[studojo] AutoApply refresh failed:', autoApplyRes.reason?.message);
  }
  if (outreachRes.status === 'fulfilled' && !outreachRes.value?.skipped) {
    console.log('[studojo] Outreach session auto-refreshed');
  } else if (outreachRes.status === 'rejected') {
    console.warn('[studojo] Outreach refresh failed:', outreachRes.reason?.message);
  }

  // Re-arm: 7 days normally, 24h retry if every refresh failed.
  const allFailed = results.every(
    (r) => r.status === 'rejected' ||
           (r.status === 'fulfilled' && r.value?.skipped),
  );
  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: allFailed ? 24 * 60 : REFRESH_INTERVAL_DAYS * 24 * 60,
  });
});

// ── LinkedIn logout detection ─────────────────────────────────────────────────
// When the user signs out of LinkedIn in their browser, li_at is removed by
// LinkedIn itself. Detect that immediately, clear our connected flags, and
// notify any open Studojo tab so the UI can surface a reconnect prompt
// without waiting for the daemon to hit auth_failed.

chrome.cookies.onChanged.addListener(async (info) => {
  if (info.cookie?.name !== 'li_at') return;
  if (!info.removed) return;
  if (!(info.cookie.domain || '').includes('linkedin.com')) return;
  // Ignore "expired_overwrite" — that's just LinkedIn rotating the value, not a logout.
  if (info.cause === 'overwrite') return;

  console.log('[studojo] li_at removed (cause=%s) — treating as LinkedIn logout', info.cause);

  await chrome.storage.local.set({ li_logged_out_at: Date.now() });
  await chrome.storage.local.remove(['connected', 'outreach_connected']);

  const studojoTabs = await chrome.tabs.query({
    url: STUDOJO_ORIGINS.map((o) => `${o}/*`),
  });
  for (const t of studojoTabs) {
    chrome.tabs.sendMessage(t.id, { type: 'STUDOJO_LINKEDIN_LOGGED_OUT' }).catch(() => {});
  }
});

// ── Message handler ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CONNECT_LINKEDIN') {
    captureAndSendSession()
      .then((r) => sendResponse({ success: true, ...r }))
      .catch((e) => sendResponse({ success: false, error: e.message }));
    return true; // keep channel open for async response
  }

  // Outreach flow — return the cookie jar to the page so IT can POST to the
  // outreach backend. We don't post from the extension here because the page
  // already has the user's auth token and the right endpoint URL.
  if (message.type === 'GET_LI_COOKIES_RAW') {
    (async () => {
      try {
        // Pull full cookie jar from BOTH origins to maximise coverage — some
        // cookies are set on .linkedin.com, others on www.linkedin.com.
        const jar = [];
        const seen = new Set();
        for (const origin of LINKEDIN_ORIGINS) {
          const cookies = await new Promise((resolve) => {
            chrome.cookies.getAll({ url: origin }, (c) => resolve(c || []));
          });
          for (const c of cookies) {
            const key = `${c.name}@${c.domain}`;
            if (seen.has(key)) continue;
            seen.add(key);
            jar.push({
              name: c.name,
              value: c.value,
              domain: c.domain,
              path: c.path,
              secure: c.secure,
              httpOnly: c.httpOnly,
              sameSite: c.sameSite,
            });
          }
        }
        const liAt = jar.find((c) => c.name === 'li_at')?.value || null;
        const jsessionid = (jar.find((c) => c.name === 'JSESSIONID')?.value || '').replace(/^"|"$/g, '');

        if (!liAt) {
          sendResponse({ error: 'not_logged_in_linkedin' });
          return;
        }
        if (!jsessionid) {
          // li_at without JSESSIONID happens when the user has been logged in
          // for a while but hasn't visited LinkedIn recently — the CSRF cookie
          // got cleaned up. A single page-load on LinkedIn restores it.
          sendResponse({ error: 'no_jsessionid' });
          return;
        }

        sendResponse({
          li_at: liAt,
          jsessionid,
          cookies: jar,
        });
      } catch (err) {
        sendResponse({ error: err?.message || 'unknown_error' });
      }
    })();
    return true;
  }

  if (message.type === 'CHECK_STATUS') {
    getCookie('https://www.linkedin.com', 'li_at').then((liAt) => {
      chrome.storage.local.get(['connected', 'connected_at'], (stored) => {
        sendResponse({
          li_at_present: !!liAt,
          connected: !!stored.connected,
          connected_at: stored.connected_at || null,
        });
      });
    });
    return true;
  }

  if (message.type === 'DISCONNECT') {
    chrome.alarms.clear(ALARM_NAME);
    chrome.storage.local.remove(['connected', 'connected_at', 'studojo_origin'], () =>
      sendResponse({ ok: true })
    );
    return true;
  }

  if (message.type === 'REFRESH_NOW') {
    captureAndSendSession()
      .then(() => sendResponse({ success: true }))
      .catch((e) => sendResponse({ success: false, error: e.message }));
    return true;
  }

  // Page signals: the user just completed an outreach connect, so include
  // outreach in the 7-day refresh cycle from now on.
  if (message.type === 'MARK_OUTREACH_CONNECTED') {
    (async () => {
      const origin = message.origin || 'https://studojo.pro';
      await chrome.storage.local.set({
        outreach_connected: true,
        outreach_connected_at: Date.now(),
        studojo_origin: origin,
      });
      // Make sure an alarm is armed so the 7-day refresh actually fires —
      // alarms get cleared when the extension is reloaded.
      const existing = await chrome.alarms.get(ALARM_NAME);
      if (!existing) {
        await chrome.alarms.create(ALARM_NAME, {
          delayInMinutes: REFRESH_INTERVAL_DAYS * 24 * 60,
        });
      }
      sendResponse({ ok: true });
    })();
    return true;
  }

  if (message.type === 'REFRESH_OUTREACH_NOW') {
    refreshOutreachSession()
      .then((r) => sendResponse({ success: true, ...r }))
      .catch((e) => sendResponse({ success: false, error: e.message }));
    return true;
  }

  // Option C — page asks us to open LinkedIn + auto-capture on load
  if (message.type === 'OPEN_LINKEDIN_FOR_CAPTURE') {
    (async () => {
      await chrome.storage.local.set({
        pendingCapture: true,
        pendingCaptureExpiry: Date.now() + 10 * 60 * 1000, // 10 min TTL
      });

      // Open LinkedIn in a new tab and track its ID
      const tab = await chrome.tabs.create({ url: 'https://www.linkedin.com', active: true });
      await chrome.storage.local.set({ pendingCaptureTabId: tab.id });

      sendResponse({ ok: true, tabId: tab.id });
    })();
    return true;
  }
});
