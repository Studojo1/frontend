/**
 * Studojo AutoApply — Content Script
 *
 * Runs on studojo.com/autoapply* pages.
 * Signals extension presence and handles page-initiated session capture.
 */

// Tell the page the extension is installed
window.postMessage({ type: 'STUDOJO_EXTENSION_READY', version: '2.0.0' }, '*');

// Listen for page requests to trigger session capture
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data?.type) return;

  if (event.data.type === 'STUDOJO_CAPTURE_SESSION') {
    chrome.runtime.sendMessage({ type: 'CONNECT_LINKEDIN' }, (response) => {
      window.postMessage({
        type: 'STUDOJO_SESSION_RESULT',
        success: response?.success ?? false,
        error: response?.error ?? null,
      }, '*');
    });
  }

  if (event.data.type === 'STUDOJO_CHECK_STATUS') {
    chrome.runtime.sendMessage({ type: 'CHECK_STATUS' }, (response) => {
      window.postMessage({
        type: 'STUDOJO_STATUS_RESULT',
        ...response,
      }, '*');
    });
  }
});
