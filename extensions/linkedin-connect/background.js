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

// ── Auto-refresh alarm ─────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  try {
    await captureAndSendSession();
    console.log('[studojo] LinkedIn session auto-refreshed');
    // Re-arm for next cycle
    await chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: REFRESH_INTERVAL_DAYS * 24 * 60,
    });
  } catch (err) {
    console.warn('[studojo] Auto-refresh failed:', err.message);
    // Clear connected state if LinkedIn or Studojo session is gone
    if (err.message === 'not_logged_in_linkedin' || err.message === 'not_logged_in_studojo') {
      await chrome.storage.local.remove(['connected', 'connected_at']);
    }
    // Retry in 24h
    await chrome.alarms.create(ALARM_NAME, { delayInMinutes: 24 * 60 });
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
});
