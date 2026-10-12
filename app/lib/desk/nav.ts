// URL state for the student desk.
//
// The desk is one route, /b2cnew, and everything that says where you are
// lives in the query string, so Back, reload and a shared link all land on
// the same screen:
//
//   /b2cnew                          Home, all outreach
//   /b2cnew?filter=needs_you         Home, one status chip
//   /b2cnew?tab=people&q=react&city=Pune&min_score=70&offset=25&lead=9912
//   /b2cnew?tab=inbox&filter=positive&id=e_4512
//   /b2cnew?tab=profile | ?tab=settings
//   /b2cnew?tab=outreach&id=d_88     the outreach page
//   ...&ask=1                        phones: the assistant sheet is open
//
// The route's shouldRevalidate skips the session loader for query-only
// changes, so switching tabs never calls the server.
import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { DeskRoute, NavigateTarget } from "./types";

export const DESK_BASE = "/b2cnew";
export const DESK_ROUTES: readonly DeskRoute[] = ["home", "people", "inbox", "profile", "settings", "outreach"];
/** The four tabs in the top bar and the phone dock; Settings is a link beside them. */
export const DESK_TABS: readonly { id: DeskRoute; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "people", label: "People" },
  { id: "inbox", label: "Inbox" },
  { id: "profile", label: "Profile" },
];

export interface DeskParams {
  tab: DeskRoute;
  /** Outreach id on the outreach page; the open reply on Inbox. */
  id: string | null;
  /** Status word on Home, reply group on Inbox. */
  filter: string | null;
  q: string | null;
  company: string | null;
  city: string | null;
  title: string | null;
  min_score: number | null;
  offset: number;
  /** People: the lead whose details drawer is open. */
  lead: number | null;
  /** Phones: the assistant sheet is open. */
  ask: boolean;
}

export type DeskParamsPatch = { [K in keyof DeskParams]?: DeskParams[K] | null };

const STRING_KEYS = ["id", "filter", "q", "company", "city", "title"] as const;

function toInt(v: string | null): number | null {
  if (v === null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** Read the desk state from a query string. Unknown or bad values fall back. */
export function parseDeskParams(search: URLSearchParams | string): DeskParams {
  const p = typeof search === "string" ? new URLSearchParams(search) : search;
  const rawTab = p.get("tab");
  const tab: DeskRoute = rawTab && (DESK_ROUTES as readonly string[]).includes(rawTab) ? (rawTab as DeskRoute) : "home";
  const out: DeskParams = {
    tab,
    id: null,
    filter: null,
    q: null,
    company: null,
    city: null,
    title: null,
    min_score: null,
    offset: Math.max(0, toInt(p.get("offset")) ?? 0),
    lead: toInt(p.get("lead")),
    ask: p.get("ask") === "1",
  };
  for (const k of STRING_KEYS) {
    const v = p.get(k);
    out[k] = v && v.trim() ? v.slice(0, 200) : null;
  }
  const ms = toInt(p.get("min_score"));
  out.min_score = ms === null ? null : Math.min(100, Math.max(0, ms));
  // The outreach page needs an id; without one it is Home.
  if (out.tab === "outreach" && !out.id) out.tab = "home";
  return out;
}

/** Write desk state back to a query string, leaving defaults out. */
export function serializeDeskParams(d: Partial<DeskParams>): string {
  const p = new URLSearchParams();
  if (d.tab && d.tab !== "home") p.set("tab", d.tab);
  for (const k of STRING_KEYS) {
    const v = d[k];
    if (v) p.set(k, v);
  }
  if (d.min_score !== null && d.min_score !== undefined) p.set("min_score", String(d.min_score));
  if (d.offset) p.set("offset", String(d.offset));
  if (d.lead !== null && d.lead !== undefined) p.set("lead", String(d.lead));
  if (d.ask) p.set("ask", "1");
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** The URL for an agent navigate event or any in-app link. */
export function deskPath(t: NavigateTarget | DeskRoute): string {
  const target: NavigateTarget = typeof t === "string" ? { to: t, id: null, filter: null } : t;
  if (target.to === "outreach" && !target.id) return DESK_BASE;
  const d: Partial<DeskParams> = { tab: target.to };
  if (target.id) {
    if (target.to === "people") {
      const lead = toInt(target.id);
      if (lead !== null) d.lead = lead;
    } else {
      d.id = target.id;
    }
  }
  if (target.filter) {
    if (target.to === "people") d.q = target.filter;
    else d.filter = target.filter;
  }
  return `${DESK_BASE}${serializeDeskParams(d)}`;
}

/**
 * Go somewhere in the desk. On phones this drops ?ask=1, so the assistant
 * sheet closes and the student sees the screen the agent opened.
 */
export function useDeskNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (t: NavigateTarget | DeskRoute, opts: { replace?: boolean } = {}) => {
      navigate(deskPath(t), { replace: opts.replace });
    },
    [navigate],
  );
}

/**
 * The desk state plus a setter. `set` merges a patch (null clears a value);
 * changing `tab` starts the new tab clean unless the patch carries its own
 * values. Filters replace the history entry, tab changes push one.
 */
export function useDeskParams(): [DeskParams, (patch: DeskParamsPatch, opts?: { replace?: boolean }) => void] {
  const [search, setSearch] = useSearchParams();
  const key = search.toString();
  const params = useMemo(() => parseDeskParams(key), [key]);
  const set = useCallback(
    (patch: DeskParamsPatch, opts: { replace?: boolean } = {}) => {
      const cur = parseDeskParams(window.location.search);
      const tabChange = patch.tab !== undefined && patch.tab !== cur.tab;
      const base: Partial<DeskParams> = tabChange ? { tab: cur.tab, ask: cur.ask } : { ...cur };
      const next: Partial<DeskParams> = { ...base };
      for (const [k, v] of Object.entries(patch) as [keyof DeskParams, unknown][]) {
        (next as Record<string, unknown>)[k] = v === null ? undefined : v;
      }
      // A new search or filter starts from the first page.
      const filterChange = ["q", "company", "city", "title", "min_score", "filter"].some((k) => k in patch);
      if (filterChange && !("offset" in patch)) next.offset = 0;
      setSearch(serializeDeskParams(next).replace(/^\?/, ""), {
        replace: opts.replace ?? !tabChange,
        preventScrollReset: !tabChange,
      });
    },
    [setSearch],
  );
  return [params, set];
}
