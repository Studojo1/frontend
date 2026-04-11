/**
 * Studojo LinkedIn Connect — Content Script
 *
 * Injected into studojo.com/outreach/linkedin by the extension.
 * Bridges the page (which can't call chrome APIs) and the background
 * service worker (which can read LinkedIn cookies and call the Voyager API).
 *
 * Communication:
 *   Page → content:   window.dispatchEvent(new CustomEvent('STUDOJO_SEARCH', { detail: { jobId, keywords, location, apiUrl } }))
 *   content → bg:     chrome.runtime.sendMessage({ type: 'SEARCH_LINKEDIN', ... })
 *   bg → content:     response callback
 *   content → page:   window.dispatchEvent(new CustomEvent('STUDOJO_SEARCH_DONE', { detail: { jobId, ok, error } }))
 */

window.addEventListener('STUDOJO_SEARCH', (event) => {
  const { jobId, keywords, location, apiUrl, sessionCookie } = event.detail || {};
  if (!jobId || !keywords) return;

  chrome.runtime.sendMessage(
    {
      type: 'SEARCH_LINKEDIN',
      jobId,
      keywords,
      location: location || null,
      apiUrl,         // e.g. https://studojo.com/api/v1/outreach/linkedin/search/{jobId}/submit-results
      sessionCookie,  // Studojo session cookie value passed from page
    },
    (response) => {
      window.dispatchEvent(
        new CustomEvent('STUDOJO_SEARCH_DONE', {
          detail: {
            jobId,
            ok: response?.ok || false,
            error: response?.error || null,
          },
        })
      );
    }
  );
});

// Signal to the page that the extension is installed and content script is active
window.dispatchEvent(new CustomEvent('STUDOJO_EXTENSION_READY'));
