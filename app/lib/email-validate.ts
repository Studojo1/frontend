// Shared email validation for the webinar signup form. Used by both the client
// (instant feedback) and the server (authoritative — the client is bypassable).
//
// The basic shape regex accepts typos like "gmail.cok" or "gnail.com", which is
// how bad addresses got into the registrant list and bounced. This adds two
// cheap, low-false-positive checks: a known-typo map with a suggested fix, and
// a real-TLD check.

const SHAPE_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Misspellings of the domains our registrants actually use, mapped to the fix.
const DOMAIN_TYPOS: Record<string, string> = {
  // gmail
  "gmail.cok": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.como": "gmail.com",
  "gmail.comm": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.in": "gmail.com",
  // outlook / hotmail
  "outlook.con": "outlook.com",
  "outlok.com": "outlook.com",
  "hotnail.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmial.com": "hotmail.com",
  // yahoo
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yahooo.com": "yahoo.com",
  // icloud
  "icloud.con": "icloud.com",
  "iclould.com": "icloud.com",
};

// TLDs we accept. Covers the common consumer ones plus the academic/Indian
// domains our registrants use. Anything else is rejected as a likely typo.
const VALID_TLDS = new Set([
  "com", "net", "org", "edu", "gov", "co", "io", "ai", "app", "dev", "me",
  "in", "us", "uk", "ca", "au", "de", "fr", "es", "it", "nl", "se", "ch",
  "sg", "ae", "info", "biz", "xyz", "tech", "online", "site", "store",
  "edu.in", "ac.in", "org.in", "co.in", "net.in", "co.uk", "ac.uk", "edu.au",
]);

export interface EmailCheck {
  ok: boolean;
  /** Human-readable reason when ok === false. */
  error?: string;
  /** A corrected address to offer the user, when we can guess one. */
  suggestion?: string;
}

export function checkEmail(raw: string): EmailCheck {
  const email = (raw || "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Please enter your email address." };
  if (!SHAPE_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const domain = email.slice(email.lastIndexOf("@") + 1);

  // Known misspelling — offer the exact fix.
  const fixed = DOMAIN_TYPOS[domain];
  if (fixed) {
    const local = email.slice(0, email.lastIndexOf("@"));
    return {
      ok: false,
      error: `That email address looks like a typo. Did you mean ${local}@${fixed}?`,
      suggestion: `${local}@${fixed}`,
    };
  }

  // TLD must be real. Check the two-label suffix first (e.g. "ac.in"), then the last label.
  const labels = domain.split(".");
  const lastTwo = labels.slice(-2).join(".");
  const last = labels[labels.length - 1];
  if (!VALID_TLDS.has(lastTwo) && !VALID_TLDS.has(last)) {
    return { ok: false, error: "That email address does not look valid. Please check the domain." };
  }

  return { ok: true };
}
