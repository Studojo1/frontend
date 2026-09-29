// "Download my data": the parts that are pure functions, so they can be tested
// without a database. The queries live in account-export.server.ts.
//
// Two layers keep secrets out of the file. Every table is read through a column
// allowlist (pickColumns), so a column added later stays out until someone
// decides it belongs. Then stripSecrets walks the WHOLE assembled file,
// job-outreach-svc's part included, and drops any key that names a credential.
// The allowlists are the rule; the walk is the net under them, for the day an
// allowlist is edited carelessly or the backend adds a field.

// Whole key segments that name a credential. Matched per segment, not as a
// substring, so "tokens_used" style counters would survive but "access_token",
// "session_token" and "li_at_encrypted" do not.
const SECRET_SEGMENTS = new Set([
  "password",
  "secret",
  "token",
  "tokens",
  "cookie",
  "cookies",
  "signature",
  "nonce",
  "otp",
  "encrypted",
  "hash",
]);

// Multi-segment names that are secrets even though no single word is.
const SECRET_PHRASES = ["li_at", "backup_codes", "public_key", "private_key", "credential_id", "api_key", "key_prefix"];

/** snake_case, lower: accessToken, access_token and credentialID all compare alike. */
function normaliseKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .toLowerCase();
}

/** True for a key whose value must never leave in an export. */
export function isSecretKey(key: string): boolean {
  const k = normaliseKey(key);
  if (k.split("_").some((seg) => SECRET_SEGMENTS.has(seg))) return true;
  return SECRET_PHRASES.some((p) => k === p || k.startsWith(`${p}_`) || k.endsWith(`_${p}`) || k.includes(`_${p}_`));
}

/** A deep copy of `value` with every secret-named key removed, at any depth. */
export function stripSecrets<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => stripSecrets(v)) as T;
  if (value instanceof Date) return value.toISOString() as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isSecretKey(k)) continue;
      out[k] = stripSecrets(v);
    }
    return out as T;
  }
  return value;
}

/** Only the allowlisted columns of each row. A column absent from the row is skipped, not null. */
export function pickColumns(rows: readonly Record<string, unknown>[], cols: readonly string[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const c of cols) if (c in row) out[c] = row[c];
    return out;
  });
}

/** studojo-data-YYYY-MM-DD.json, in UTC like the backend's own export. */
export function exportFilename(now: Date = new Date()): string {
  return `studojo-data-${now.toISOString().slice(0, 10)}.json`;
}
