/**
 * The file picker step on phones, where a pick sometimes never comes back.
 *
 * Usage data, 60 days to 12 Oct 2026: on Chrome for Android about 1 in 8
 * picker opens returned no file, against 1 in 17 on desktop. In at least 4
 * sessions Chrome reloaded the tab while the picker was open, so the student
 * came back to an empty page with no explanation. In the Instagram in-app
 * browser 15% of picker opens were followed by a second tap within 3 seconds:
 * the picker had not opened. Nothing recorded which of these happened.
 *
 * The upload page notes when the picker opens (in sessionStorage, which
 * survives a reload of the tab) and uses these rules to say what happened.
 * Pure, for tests.
 */

export const PICKER_OPEN_KEY = "sj_resume_picker_open";

/** The note that the picker is open, kept in sessionStorage. Every call
 * tolerates storage being blocked or full: the hints are a nicety, the upload
 * must work without them. */
function store(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}
export const pickerNote = {
  read(): string | null {
    try {
      return store()?.getItem(PICKER_OPEN_KEY) ?? null;
    } catch {
      return null;
    }
  },
  write(now: number): void {
    try {
      store()?.setItem(PICKER_OPEN_KEY, String(now));
    } catch {
      // blocked or full
    }
  },
  clear(): void {
    try {
      store()?.removeItem(PICKER_OPEN_KEY);
    } catch {
      // blocked
    }
  },
};

/** A flag older than this did not come from the page load that just ended. */
const RELOAD_WINDOW_MS = 15 * 60 * 1000;
/** A second open this soon, with no file or cancel between, means the first never opened. */
const STUCK_WINDOW_MS = 3000;

export type PickHint = "reloaded" | "cancelled" | "stuck" | null;

/** On page load: was the picker open when the previous page went away? */
export function reloadedWhilePicking(flag: string | null | undefined, now: number): boolean {
  if (!flag) return false;
  const openedAt = Number(flag);
  return Number.isFinite(openedAt) && openedAt > 0 && now >= openedAt && now - openedAt < RELOAD_WINDOW_MS;
}

/** On a picker open: did the previous open, moments ago, bring nothing back? */
export function pickerLooksStuck(lastOpenAt: number, now: number): boolean {
  return lastOpenAt > 0 && now >= lastOpenAt && now - lastOpenAt < STUCK_WINDOW_MS;
}
