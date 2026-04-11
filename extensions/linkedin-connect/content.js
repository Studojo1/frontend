/**
 * Studojo LinkedIn Connect — Content Script
 *
 * Content scripts run in an isolated JS world — they share the DOM with
 * the page but NOT window globals. CustomEvents dispatched on window in
 * the content script are invisible to the page.
 *
 * Solution: use window.postMessage() which crosses the isolation boundary.
 *
 * Flow:
 *   Page → postMessage({ type: 'STUDOJO_SEARCH', ... })
 *   Content script → chrome.runtime.sendMessage to background
 *   Background → Voyager API → returns { ok, people }
 *   Content script → postMessage({ type: 'STUDOJO_SEARCH_RESULT', ... }) back to page
 *   Page → outreachFetch('/linkedin/search/{jobId}/submit-results', { people })
 */

// Listen for messages from the PAGE (crosses isolation boundary via postMessage)
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;

  if (event.data?.type === 'STUDOJO_SEARCH') {
    const { jobId, keywords, location } = event.data;

    chrome.runtime.sendMessage(
      { type: 'SEARCH_LINKEDIN', keywords, location: location || null },
      (response) => {
        window.postMessage({
          type: 'STUDOJO_SEARCH_RESULT',
          jobId,
          ok: response?.ok || false,
          people: response?.people || [],
          error: response?.error || null,
        }, '*');
      }
    );
  }
});

// Signal to the page that the extension content script is active
window.postMessage({ type: 'STUDOJO_EXTENSION_READY' }, '*');
