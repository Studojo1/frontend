/**
 * Studojo LinkedIn Connect — Content Script
 *
 * Bridge between the Studojo page and the background service worker.
 *
 * Flow:
 *   1. Page dispatches STUDOJO_SEARCH → content.js forwards to background
 *   2. Background searches LinkedIn Voyager (browser IP, credentials:include)
 *   3. Background returns { ok, people } → content.js dispatches STUDOJO_SEARCH_RESULT to page
 *   4. Page calls outreachFetch('/linkedin/search/{jobId}/submit-results', { people })
 *      This goes as an authenticated browser fetch — cookie sent natively.
 */

window.addEventListener('STUDOJO_SEARCH', (event) => {
  const { jobId, keywords, location } = event.detail || {};
  if (!jobId || !keywords) return;

  chrome.runtime.sendMessage(
    { type: 'SEARCH_LINKEDIN', keywords, location: location || null },
    (response) => {
      window.dispatchEvent(
        new CustomEvent('STUDOJO_SEARCH_RESULT', {
          detail: {
            jobId,
            ok: response?.ok || false,
            people: response?.people || [],
            error: response?.error || null,
          },
        })
      );
    }
  );
});

// Signal to the page that the extension is active
window.dispatchEvent(new CustomEvent('STUDOJO_EXTENSION_READY'));
