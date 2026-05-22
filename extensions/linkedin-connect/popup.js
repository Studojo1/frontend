/**
 * Studojo AutoApply — Popup script
 */

// ── State management ──────────────────────────────────────────────────────────

const STATES = [
  "checking",
  "no-linkedin",
  "no-studojo",
  "ready",
  "connecting",
  "connected",
  "refreshing",
  "error",
];

function showState(name) {
  STATES.forEach((s) => {
    const el = document.getElementById(`state-${s}`);
    if (el) el.classList.toggle("hidden", s !== name);
  });
}

function showError(message) {
  const el = document.getElementById("error-message");
  if (el) {
    const friendly = {
      not_logged_in_linkedin: "You're not logged into LinkedIn. Open LinkedIn in a tab, sign in, then try again.",
      not_logged_in_studojo: "You're not logged into Studojo. Open studojo.com or studojo.pro, sign in, then try again.",
      no_jsessionid: "LinkedIn session incomplete. Refresh LinkedIn (or open www.linkedin.com/feed) and try again.",
      extension_error: "The extension hit an internal error. Try removing and reinstalling.",
      extension_runtime_error: "The extension hit an internal error. Try removing and reinstalling.",
    };
    // Pull out api_error:XYZ so the user sees the real status code
    const apiMatch = typeof message === "string" && message.match(/^api_error:(\d+)/);
    if (apiMatch) {
      const code = apiMatch[1];
      const apiMessages = {
        "401": "Studojo says you're not signed in. Refresh studojo.com and sign in, then try again.",
        "403": "Studojo refused the connection (forbidden). Make sure you're using the same account in both tabs.",
        "404": "Studojo's session endpoint is unreachable. The platform may be deploying — try again in a minute.",
        "500": "Studojo's server hit an error storing the session. Try again in a moment.",
      };
      el.textContent = apiMessages[code] || `Studojo returned HTTP ${code}. Try again or contact support.`;
    } else {
      el.textContent = friendly[message] || `Unexpected error: ${message}. Try again or reinstall the extension.`;
    }
  }
  showState("error");
}

function formatConnectedSince(timestamp) {
  if (!timestamp) return "AutoApply is active.";
  const days = Math.floor((Date.now() - timestamp) / 86400000);
  if (days === 0) return "Connected today. AutoApply is active.";
  if (days === 1) return "Connected 1 day ago. AutoApply is active.";
  return `Connected ${days} days ago. AutoApply is active.`;
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  showState("checking");

  chrome.runtime.sendMessage({ type: "CHECK_STATUS" }, (response) => {
    if (chrome.runtime.lastError) {
      showError("extension_error");
      return;
    }

    if (response.connected) {
      const since = document.getElementById("connected-since");
      if (since) since.textContent = formatConnectedSince(response.connected_at);
      showState("connected");
    } else if (!response.li_at_present) {
      showState("no-linkedin");
    } else {
      // LinkedIn logged in, not yet connected to Studojo AutoApply
      showState("ready");
    }
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────────

document.getElementById("btn-connect").addEventListener("click", () => {
  showState("connecting");

  chrome.runtime.sendMessage({ type: "CONNECT_LINKEDIN" }, (response) => {
    if (chrome.runtime.lastError) { showError("extension_error"); return; }
    if (response.success) {
      showState("connected");
    } else {
      showError(response.error || "unknown_error");
    }
  });
});

document.getElementById("btn-refresh").addEventListener("click", () => {
  showState("refreshing");

  chrome.runtime.sendMessage({ type: "REFRESH_NOW" }, (response) => {
    if (chrome.runtime.lastError) { showError("extension_error"); return; }
    if (response.success) {
      showState("connected");
    } else {
      showError(response.error || "unknown_error");
    }
  });
});

document.getElementById("btn-disconnect").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "DISCONNECT" }, () => {
    showState("ready");
  });
});

document.getElementById("btn-retry").addEventListener("click", () => {
  init();
});

// Start
init();
