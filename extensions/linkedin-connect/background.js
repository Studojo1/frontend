/**
 * Studojo LinkedIn Connect — Background Service Worker (Manifest V3)
 *
 * Handles:
 *   CONNECT_LINKEDIN  — read cookies, POST encrypted tokens to Studojo backend
 *   CHECK_STATUS      — check if extension is connected
 *   DISCONNECT        — clear stored state
 */

const STUDOJO_ORIGINS = ['https://studojo.com', 'https://studojo.pro'];
const SESSION_COOKIE_NAMES = [
  '__Secure-better-auth.session_token',
  'better-auth.session_token',
];

// ── Cookie helpers ─────────────────────────────────────────────────────────────

async function getCookie(url, name) {
  return new Promise((resolve) => {
    chrome.cookies.get({ url, name }, (cookie) => resolve(cookie ? cookie.value : null));
  });
}

async function getStudojoSession() {
  for (const origin of STUDOJO_ORIGINS) {
    for (const name of SESSION_COOKIE_NAMES) {
      const val = await getCookie(origin, name);
      if (val) return { value: val, origin };
    }
  }
  return null;
}

// ── Connect flow ───────────────────────────────────────────────────────────────

async function connectLinkedIn() {
  const liAt = await getCookie('https://www.linkedin.com', 'li_at');
  const jsessionid = await getCookie('https://www.linkedin.com', 'JSESSIONID');

  if (!liAt) throw new Error('not_logged_in');
  if (!jsessionid) throw new Error('no_jsessionid');

  const session = await getStudojoSession();
  if (!session) throw new Error('not_logged_in_studojo');

  const linkedinName = (await chrome.storage.local.get(['linkedin_name']))?.linkedin_name || null;

  const apiUrl = `${session.origin}/api/v1/outreach/linkedin/token`;

  // Use no-credentials fetch for token save — background can POST JSON fine,
  // backend auth uses the session value we pass in the body for this endpoint.
  // Actually, for the token endpoint we need auth. Use the connect tab approach:
  // open a studojo tab and inject a message, OR rely on the page doing this.
  // Simpler: just POST with credentials:include to studojo.com (same browser session).
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // browser sends Studojo session cookie
    body: JSON.stringify({ li_at: liAt, jsessionid, linkedin_name: linkedinName }),
  });

  if (response.status === 401) throw new Error('not_logged_in_studojo');
  if (!response.ok) throw new Error(`api_error:${response.status}`);

  chrome.storage.local.set({ connected: true, connected_at: Date.now() });
  return { ok: true };
}

// ── Message handler ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CONNECT_LINKEDIN') {
    connectLinkedIn()
      .then((r) => sendResponse({ success: true, ...r }))
      .catch((e) => sendResponse({ success: false, error: e.message }));
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
    chrome.storage.local.remove(['connected', 'connected_at'], () => sendResponse({ ok: true }));
    return true;
  }

});
