/**
 * Upload before signup, an experiment for ad visitors (audit EX-06).
 *
 * Most Meta ad clicks stall on /auth before tapping anything. Behind the
 * PostHog flag `upload-before-signup` (off by default), an ad visitor sent to
 * /auth on the way to resume upload can pick their resume first. The file is
 * held on this device only (IndexedDB, so it survives the Google sign-in
 * round trip), and the upload page sends it the moment the new account
 * exists, so the resume lands on that account with no second pick. Nothing
 * is sent anywhere before there is an account.
 *
 * With the flag off, or for anyone who is not an ad visitor, nothing here
 * runs and the flow is unchanged.
 */

export const UPLOAD_BEFORE_SIGNUP_FLAG = "upload-before-signup";

// The page says "up to 10MB" and the API enforces it (413).
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

export function isResumeFile(f: { type: string; name: string }): boolean {
  const name = f.name.toLowerCase();
  return f.type === "application/pdf" || name.endsWith(".pdf") || name.endsWith(".docx");
}

/** A visitor from a paid ad: utm_medium=paid, or a Meta click id. Pure, for
 * tests. `held` is the first-touch parameters kept from the landing page. */
export function isAdVisitor(search: string, held?: URLSearchParams | null): boolean {
  const check = (qs: URLSearchParams) =>
    (qs.get("utm_medium") || "").toLowerCase() === "paid" || !!qs.get("fbclid");
  if (check(new URLSearchParams(search))) return true;
  return held ? check(held) : false;
}

/** Only for signups headed to resume upload. Pure, for tests. */
export function headedToUpload(redirect: string | null | undefined): boolean {
  return (redirect || "").startsWith("/outreach/onboarding/upload");
}

// ── The held file ──────────────────────────────────────────────────────────

type Draft = { name: string; type: string; data: ArrayBuffer; savedAt: number };

const DB_NAME = "studojo";
const STORE = "resume_draft";
const KEY = "pending";
// A draft nobody claimed within a week is dropped, so a resume does not sit
// on a shared device indefinitely.
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Used when IndexedDB is missing or blocked: the draft then lasts for this
// page only (email signup stays on the page, so it still works there).
let memoryDraft: Draft | null = null;

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null);
        try {
          const req = fn(db.transaction(STORE, mode).objectStore(STORE));
          req.onsuccess = () => resolve((req.result as T) ?? null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      }),
  );
}

/** Hold a picked resume until the account exists. */
export async function saveResumeDraft(file: File, now = Date.now()): Promise<void> {
  const draft: Draft = { name: file.name, type: file.type, data: await file.arrayBuffer(), savedAt: now };
  memoryDraft = draft;
  await run("readwrite", (s) => s.put(draft, KEY));
}

/** The held resume, or null. An expired one is dropped. */
export async function loadResumeDraft(now = Date.now()): Promise<File | null> {
  const stored = (await run<Draft>("readonly", (s) => s.get(KEY))) ?? memoryDraft;
  if (!stored || !stored.data) return null;
  if (now - stored.savedAt > DRAFT_MAX_AGE_MS) {
    await clearResumeDraft();
    return null;
  }
  return new File([stored.data], stored.name, { type: stored.type });
}

export async function clearResumeDraft(): Promise<void> {
  memoryDraft = null;
  await run("readwrite", (s) => s.delete(KEY));
}
