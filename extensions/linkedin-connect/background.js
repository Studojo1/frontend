/**
 * Studojo LinkedIn Connect — Background Service Worker (Manifest V3)
 *
 * Reads li_at + JSESSIONID from LinkedIn cookies and the Studojo session
 * cookie, then posts the tokens to the Studojo backend for encrypted storage.
 *
 * This runs as a service worker so it has access to chrome.cookies for
 * httpOnly cookies — content scripts cannot read these.
 */

const STUDOJO_API = "https://studojo.com/api/v1/outreach/linkedin/token";
const STUDOJO_API_STAGING = "https://studojo.pro/api/v1/outreach/linkedin/token";

const SESSION_COOKIE_NAMES = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
];

/**
 * Get a cookie value by name from a given URL.
 * Returns null if not found.
 */
async function getCookie(url, name) {
  return new Promise((resolve) => {
    chrome.cookies.get({ url, name }, (cookie) => {
      resolve(cookie ? cookie.value : null);
    });
  });
}

/**
 * Try to get the Studojo session cookie from prod then staging.
 * Returns { value, apiUrl } or null.
 */
async function getStudojoSession() {
  for (const name of SESSION_COOKIE_NAMES) {
    const val = await getCookie("https://studojo.com", name);
    if (val) return { value: val, apiUrl: STUDOJO_API };
  }
  // Try staging (for dev/testing)
  for (const name of SESSION_COOKIE_NAMES) {
    const val = await getCookie("https://studojo.pro", name);
    if (val) return { value: val, apiUrl: STUDOJO_API_STAGING };
  }
  return null;
}

/**
 * Read LinkedIn name from storage (set during connect flow).
 */
async function getStoredName() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["linkedin_name"], (result) => {
      resolve(result.linkedin_name || null);
    });
  });
}

/**
 * Main connect flow: read cookies → POST to Studojo backend.
 * Returns { ok: true, linkedin_name? } or throws with a human-readable error.
 */
async function connectLinkedIn() {
  // 1. Read LinkedIn session cookies
  const liAt = await getCookie("https://www.linkedin.com", "li_at");
  const jsessionid = await getCookie("https://www.linkedin.com", "JSESSIONID");

  if (!liAt) {
    throw new Error("not_logged_in");
  }
  if (!jsessionid) {
    throw new Error("no_jsessionid");
  }

  // 2. Read Studojo session cookie
  const studojoSession = await getStudojoSession();
  if (!studojoSession) {
    throw new Error("not_logged_in_studojo");
  }

  // 3. Try to read LinkedIn name from the li_at payload (it's a JWT-like token)
  let linkedinName = null;
  try {
    // li_at is not a standard JWT but we can try to read cached name
    linkedinName = await getStoredName();
  } catch (_) {}

  // 4. POST to Studojo backend
  // Include the Studojo session as a Cookie header so the backend can auth the user
  const response = await fetch(studojoSession.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Send the session cookie manually — fetch from an extension can't use credentials:include
      Cookie: `${SESSION_COOKIE_NAMES[0]}=${studojoSession.value}`,
    },
    body: JSON.stringify({
      li_at: liAt,
      jsessionid: jsessionid,
      linkedin_name: linkedinName,
    }),
  });

  if (response.status === 401) {
    throw new Error("not_logged_in_studojo");
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`api_error:${response.status}:${text.slice(0, 100)}`);
  }

  // 5. Cache success state
  chrome.storage.local.set({ connected: true, connected_at: Date.now() });

  return { ok: true };
}

// ── Message handler ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "CONNECT_LINKEDIN") {
    connectLinkedIn()
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === "CHECK_STATUS") {
    // Quick check: is LinkedIn cookie present?
    getCookie("https://www.linkedin.com", "li_at").then((liAt) => {
      chrome.storage.local.get(["connected", "connected_at"], (stored) => {
        sendResponse({
          li_at_present: !!liAt,
          connected: !!stored.connected,
          connected_at: stored.connected_at || null,
        });
      });
    });
    return true;
  }

  if (message.type === "DISCONNECT") {
    chrome.storage.local.remove(["connected", "connected_at"], () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
