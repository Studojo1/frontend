/**
 * Studojo AutoApply — Content Script
 *
 * Runs on studojo.com/autoapply*, studojo.pro/autoapply*, and /lkot* pages.
 * Signals extension presence and bridges page ↔ background messaging.
 */

// Tell the page the extension is installed
window.postMessage({ type: 'STUDOJO_EXTENSION_READY', version: '2.1.0' }, '*');

// Push background → page messages (auto-capture result, session captured, etc.)
chrome.runtime.onMessage.addListener((message) => {
  if (
    message.type === 'STUDOJO_SESSION_CAPTURED' ||
    message.type === 'STUDOJO_SESSION_CAPTURE_FAILED'
  ) {
    window.postMessage(message, '*');
  }
});

// Listen for page → background requests
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data?.type) return;

  // Manual capture triggered by page button
  if (event.data.type === 'STUDOJO_CAPTURE_SESSION') {
    chrome.runtime.sendMessage({ type: 'CONNECT_LINKEDIN' }, (response) => {
      window.postMessage({
        type: 'STUDOJO_SESSION_RESULT',
        success: response?.success ?? false,
        error: response?.error ?? null,
      }, '*');
    });
  }

  // Status check
  if (event.data.type === 'STUDOJO_CHECK_STATUS') {
    chrome.runtime.sendMessage({ type: 'CHECK_STATUS' }, (response) => {
      window.postMessage({ type: 'STUDOJO_STATUS_RESULT', ...response }, '*');
    });
  }

  // Option C: page asks background to open LinkedIn + arm auto-capture
  if (event.data.type === 'STUDOJO_OPEN_LINKEDIN') {
    chrome.runtime.sendMessage({ type: 'OPEN_LINKEDIN_FOR_CAPTURE' }, (response) => {
      window.postMessage({
        type: 'STUDOJO_LINKEDIN_OPENED',
        ok: response?.ok ?? false,
        tabId: response?.tabId ?? null,
      }, '*');
    });
  }
});
