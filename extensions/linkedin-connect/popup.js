/**
 * Studojo LinkedIn Connect — Popup script
 */

// ── State management ──────────────────────────────────────────────────────────

const STATES = [
  "checking",
  "no-linkedin",
  "no-studojo",
  "ready",
  "connecting",
  "connected",
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
      not_logged_in: "You're not logged into LinkedIn. Open LinkedIn and sign in first.",
      no_jsessionid: "LinkedIn session incomplete. Try refreshing LinkedIn and reconnecting.",
      not_logged_in_studojo: "You're not logged into Studojo. Open Studojo and sign in first.",
    };
    el.textContent = friendly[message] || "Something went wrong. Please try again.";
  }
  showState("error");
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
      showState("connected");
    } else if (response.li_at_present) {
      // LinkedIn is logged in, Studojo not yet connected
      showState("ready");
    } else {
      showState("no-linkedin");
    }
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────────

document.getElementById("btn-connect").addEventListener("click", () => {
  showState("connecting");

  chrome.runtime.sendMessage({ type: "CONNECT_LINKEDIN" }, (response) => {
    if (chrome.runtime.lastError) {
      showError("extension_error");
      return;
    }

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
