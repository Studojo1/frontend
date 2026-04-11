/**
 * Studojo LinkedIn Connect — Background Service Worker (Manifest V3)
 *
 * Handles:
 *   CONNECT_LINKEDIN  — read cookies, POST encrypted tokens to Studojo backend
 *   CHECK_STATUS      — check if extension is connected
 *   DISCONNECT        — clear stored state
 *   SEARCH_LINKEDIN   — run Voyager people search from browser (real IP + cookies),
 *                       POST results to Studojo backend for message generation
 */

const STUDOJO_ORIGINS = ['https://studojo.com', 'https://studojo.pro'];
const SESSION_COOKIE_NAMES = [
  '__Secure-better-auth.session_token',
  'better-auth.session_token',
];

const LI_TRACK = JSON.stringify({
  clientVersion: '1.13.1862',
  mpVersion: '1.13.1862',
  osName: 'web',
  timezoneOffset: 5.5,
  timezone: 'Asia/Calcutta',
  deviceFormFactor: 'DESKTOP',
  mpName: 'voyager-web',
  displayDensity: 1,
  displayWidth: 1920,
  displayHeight: 1080,
});

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

// ── LinkedIn Voyager search ────────────────────────────────────────────────────

async function searchLinkedIn(keywords, location, count = 10) {
  const liAt = await getCookie('https://www.linkedin.com', 'li_at');
  const jsessionid = await getCookie('https://www.linkedin.com', 'JSESSIONID');

  if (!liAt) throw new Error('not_logged_in');
  if (!jsessionid) throw new Error('no_jsessionid');

  const query = location ? `${keywords} ${location}` : keywords;

  const params = new URLSearchParams({
    keywords: query,
    q: 'all',
    filters: 'List(resultType->PEOPLE)',
    origin: 'SWITCH_SEARCH_VERTICAL',
    count: String(count),
    start: '0',
  });

  const response = await fetch(
    `https://www.linkedin.com/voyager/api/search/blended?${params}`,
    {
      method: 'GET',
      headers: {
        Cookie: `li_at=${liAt}; JSESSIONID=${jsessionid}`,
        'csrf-token': jsessionid,
        'x-restli-protocol-version': '2.0.0',
        'x-li-lang': 'en_US',
        'x-li-track': LI_TRACK,
        Accept: 'application/vnd.linkedin.normalized+json+2.1',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://www.linkedin.com/search/results/people/',
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error('linkedin_session_expired');
  }
  if (response.status === 429) {
    throw new Error('linkedin_rate_limited');
  }
  if (!response.ok) {
    throw new Error(`linkedin_error_${response.status}`);
  }

  const data = await response.json();
  return parseVoyagerResults(data);
}

function parseVoyagerResults(data) {
  const people = [];
  const included = data.included || [];

  const entityMap = {};
  for (const entity of included) {
    const urn = entity.entityUrn || '';
    if (urn) entityMap[urn] = entity;
  }

  const elements = data?.data?.elements || [];
  for (const cluster of elements) {
    for (const item of cluster.elements || []) {
      const memberUrn = item.targetUrn || item.entityUrn || '';
      const profile = entityMap[memberUrn] || {};

      const publicId = profile.publicIdentifier || item.publicIdentifier;
      if (!publicId) continue;

      const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
      const headline = profile.headline || '';
      const company = profile.occupation || '';

      let imageUrl = '';
      const pic = profile.picture?.['com.linkedin.common.VectorImage'];
      if (pic?.artifacts?.length && pic.rootUrl) {
        const last = pic.artifacts[pic.artifacts.length - 1];
        imageUrl = pic.rootUrl + (last.fileIdentifyingUrlPathSegment || '');
      }

      people.push({
        name: name || 'Unknown',
        headline,
        company,
        profile_url: `https://www.linkedin.com/in/${publicId}/`,
        profile_image_url: imageUrl || null,
      });
    }
  }
  return people;
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

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${SESSION_COOKIE_NAMES[0]}=${session.value}`,
    },
    body: JSON.stringify({ li_at: liAt, jsessionid, linkedin_name: linkedinName }),
  });

  if (response.status === 401) throw new Error('not_logged_in_studojo');
  if (!response.ok) throw new Error(`api_error:${response.status}`);

  chrome.storage.local.set({ connected: true, connected_at: Date.now() });
  return { ok: true };
}

// ── Search flow ────────────────────────────────────────────────────────────────

async function runSearch({ jobId, keywords, location, apiUrl, sessionCookie }) {
  // 1. Do the Voyager search from the browser
  const people = await searchLinkedIn(keywords, location, 10);

  if (!people.length) {
    // POST empty results — backend will mark job done with 0 results
    await submitResults(apiUrl, sessionCookie, jobId, []);
    return { ok: true, count: 0 };
  }

  // 2. POST results to backend for message generation + storage
  await submitResults(apiUrl, sessionCookie, jobId, people);
  return { ok: true, count: people.length };
}

async function submitResults(apiUrl, sessionCookie, jobId, people) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${SESSION_COOKIE_NAMES[0]}=${sessionCookie}`,
    },
    body: JSON.stringify({ people }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`submit_error:${response.status}:${text.slice(0, 100)}`);
  }
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

  if (message.type === 'SEARCH_LINKEDIN') {
    runSearch(message)
      .then((r) => sendResponse({ ok: true, ...r }))
      .catch((e) => sendResponse({ ok: false, error: e.message }));
    return true;
  }
});
