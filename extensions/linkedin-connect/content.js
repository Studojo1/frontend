/**
 * Studojo LinkedIn Connector — Content Script
 *
 * Bridges two protocols so a single extension serves both features:
 *
 *  1. AutoApply (legacy) — uses window.postMessage with type STUDOJO_*
 *  2. Outreach panel (new) — uses CustomEvent("STUDOJO_REQUEST_LI_COOKIES" etc.)
 *
 * The outreach LinkedInConnectPanel listens for an EXT_READY CustomEvent on
 * load and requests cookies on demand. We capture cookies via the background
 * script and dispatch them back as a CustomEvent — the page then POSTs them
 * to the outreach backend itself (we don't POST from the extension for the
 * outreach flow, because the page owns the auth + endpoint URL).
 */

const VERSION = "2.2.0";

// ── Announce readiness ────────────────────────────────────────────────────────
// Fire both protocols so old (autoapply) and new (outreach) pages both see us.
function announceReady() {
  window.postMessage({ type: "STUDOJO_EXTENSION_READY", version: VERSION }, "*");
  window.dispatchEvent(new CustomEvent("STUDOJO_EXT_READY", { detail: { version: VERSION } }));
}

// Announce immediately, then again on load (handles race with page mounting listeners)
announceReady();
window.addEventListener("load", announceReady);

// Re-announce on demand when the page asks. The outreach panel dispatches
// STUDOJO_CHECK_EXT in its mount effect.
window.addEventListener("STUDOJO_CHECK_EXT", announceReady);
window.addEventListener("message", (e) => {
  if (e.source === window && e.data?.type === "STUDOJO_CHECK_EXT") announceReady();
});

// ── Outreach protocol: hand cookies back to the page ──────────────────────────
// The page asks via CustomEvent("STUDOJO_REQUEST_LI_COOKIES"). We ask the
// background worker for the full LinkedIn cookie jar and dispatch a CustomEvent
// with { li_at, jsessionid, cookies, error } in detail. The page POSTs them.

window.addEventListener("STUDOJO_REQUEST_LI_COOKIES", () => {
  chrome.runtime.sendMessage({ type: "GET_LI_COOKIES_RAW" }, (response) => {
    const err = chrome.runtime.lastError;
    const detail = err
      ? { error: err.message || "extension_runtime_error" }
      : (response || { error: "no_response" });
    window.dispatchEvent(new CustomEvent("STUDOJO_LI_COOKIES", { detail }));
  });
});

// ── AutoApply protocol (legacy postMessage) ───────────────────────────────────
// Preserve the existing autoapply page <-> extension contract.

chrome.runtime.onMessage.addListener((message) => {
  if (
    message.type === "STUDOJO_SESSION_CAPTURED" ||
    message.type === "STUDOJO_SESSION_CAPTURE_FAILED"
  ) {
    window.postMessage(message, "*");
  }
});

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data?.type) return;

  if (event.data.type === "STUDOJO_CAPTURE_SESSION") {
    chrome.runtime.sendMessage({ type: "CONNECT_LINKEDIN" }, (response) => {
      window.postMessage({
        type: "STUDOJO_SESSION_RESULT",
        success: response?.success ?? false,
        error: response?.error ?? null,
      }, "*");
    });
  }

  if (event.data.type === "STUDOJO_CHECK_STATUS") {
    chrome.runtime.sendMessage({ type: "CHECK_STATUS" }, (response) => {
      window.postMessage({ type: "STUDOJO_STATUS_RESULT", ...response }, "*");
    });
  }

  if (event.data.type === "STUDOJO_OPEN_LINKEDIN") {
    chrome.runtime.sendMessage({ type: "OPEN_LINKEDIN_FOR_CAPTURE" }, (response) => {
      window.postMessage({
        type: "STUDOJO_LINKEDIN_OPENED",
        ok: response?.ok ?? false,
        tabId: response?.tabId ?? null,
      }, "*");
    });
  }
});
