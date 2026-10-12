// URL <-> state for /b2cnew:
//   /b2cnew?env=jan27&tab=today&day=6&p=kitebase&agent=chat&sheet=lever
// Defaults (jan27, today, 6) are left out; bad values fall back.
// Shared file: owned by the foundation.
import { DEFAULT_DAY, DEFAULT_ENV, DEFAULT_TAB, isDockSeg, isMissionId, isSheetId, isTabId, MAX_DAY } from "../config";
import type { AppState } from "../types";

/**
 * The part of the state the URL can set, given the current state for anything
 * it leaves alone. With `fillDefaults` (Back and Forward), a missing env, tab
 * or day means the default, because toSearch leaves defaults out. Without it
 * (first load), a missing key keeps the saved value.
 */
export function parseUrl(search: string, s: AppState, fillDefaults = true): Partial<AppState> {
  const q = new URLSearchParams(search);
  const env = q.get("env");
  const tab = q.get("tab");
  const dayRaw = q.get("day");
  const day = dayRaw === null ? NaN : Number(dayRaw);
  const p = q.get("p");
  const agent = q.get("agent");
  const sheet = q.get("sheet");
  const out: Partial<AppState> = {
    selected: p && s.people.some((x) => x.id === p) ? p : null,
    dock: isDockSeg(agent) ? { ...s.dock, overlay: true, seg: agent } : { ...s.dock, overlay: false },
    sheet: isSheetId(sheet) ? sheet : null,
  };
  const envOk = isMissionId(env) && s.missions.some((m) => m.id === env);
  const dayOk = Number.isInteger(day) && day >= 0 && day <= MAX_DAY;
  if (envOk) out.env = env;
  else if (fillDefaults) out.env = DEFAULT_ENV;
  if (isTabId(tab)) out.tab = tab;
  else if (fillDefaults) out.tab = DEFAULT_TAB;
  if (dayOk) out.day = day;
  else if (fillDefaults) out.day = DEFAULT_DAY;
  return out;
}

/** The query string for a state ("" for all defaults), without the leading "?". */
export function toSearch(s: AppState): string {
  const q = new URLSearchParams();
  if (s.env !== DEFAULT_ENV) q.set("env", s.env);
  if (s.tab !== DEFAULT_TAB) q.set("tab", s.tab);
  if (s.day !== DEFAULT_DAY) q.set("day", String(s.day));
  if (s.selected) q.set("p", s.selected);
  if (s.dock.overlay) q.set("agent", s.dock.seg);
  if (s.sheet) q.set("sheet", s.sheet);
  return q.toString();
}

/**
 * Whether going from a to b should add a history entry. env and tab push;
 * opening the agent overlay or a sheet pushes (so Back closes it); day and
 * the person drawer replace.
 */
export function shouldPush(a: AppState, b: AppState): boolean {
  if (a.env !== b.env || a.tab !== b.tab) return true;
  if (!a.dock.overlay && b.dock.overlay) return true;
  if (!a.sheet && b.sheet) return true;
  return false;
}

/** Normalises a search string so "?a=1" and "a=1" compare equal. */
export const normSearch = (search: string) => new URLSearchParams(search.replace(/^\?/, "")).toString();
