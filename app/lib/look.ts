// CLASSIC LOOK (27 Oct 2026, the owner: "the same flow we have, in our old UI style with the Clash Display"): a
// second look for the studojo.pro journey, Studojo's own neo-brutalist style (ink borders, hard offset shadows, flat
// fills, Clash Display headings). Same pages, same copy, same behaviour; only the look changes.
//
// The switch: ?look=classic (or ?look=new) on any studojo.pro page sets the first-party cookie sj_look (path /, 180
// days), which this app and career-agent (/b2cnew, the same host) both read on the server, so the first paint is
// already in the right look: <html data-look="classic"> plus the classic stylesheets (app/components/look/). With
// no query and no cookie nothing changes: no attribute, no extra stylesheet, no switch. The small floating switch
// (components/look/LookSwitch.tsx) shows only when the query or the cookie is there.
//
// Only on B2C hosts (app/lib/b2c-home.ts: studojo.pro, localhost, never on a studojo.com deployment), so
// studojo.com, which already is the classic look, never gets the switch. Pure, for tests (app/lib/look.test.mjs).

export type Look = "new" | "classic";

export const LOOK_COOKIE = "sj_look";
export const LOOK_QUERY = "look";
/** 180 days, in seconds. */
export const LOOK_MAX_AGE = 180 * 24 * 60 * 60;

function asLook(v: string | null | undefined): Look | null {
  const s = (v ?? "").trim().toLowerCase();
  return s === "classic" || s === "new" ? s : null;
}

/** The look a URL's query asks for (?look=classic or ?look=new), if any. */
export function lookFromSearch(search: string | URLSearchParams | null | undefined): Look | null {
  if (!search) return null;
  const q = typeof search === "string" ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search) : search;
  return asLook(q.get(LOOK_QUERY));
}

/** The look a Cookie header carries (sj_look), if any. */
export function lookFromCookie(cookieHeader: string | null | undefined): Look | null {
  for (const part of (cookieHeader ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() !== LOOK_COOKIE) continue;
    let v = part.slice(i + 1).trim();
    try {
      v = decodeURIComponent(v);
    } catch {
      /* keep it raw */
    }
    const l = asLook(v);
    if (l) return l;
  }
  return null;
}

export type LookState = {
  /** The look this page draws. */
  look: Look;
  /** Whether the floating switch shows (the query or the cookie is there). */
  switchable: boolean;
  /** The look to store in the cookie now (the query asked for one), else null. */
  store: Look | null;
};

/** What a page gets: null off B2C hosts (studojo.com and the rest: no attribute, no switch, ever). */
export function resolveLook(b2c: boolean, search: string | URLSearchParams | null | undefined, cookieHeader: string | null | undefined): LookState | null {
  if (!b2c) return null;
  const asked = lookFromSearch(search);
  const kept = lookFromCookie(cookieHeader);
  const look = asked ?? kept ?? "new";
  return { look, switchable: asked !== null || kept !== null, store: asked };
}

/** The Set-Cookie value that keeps a look (first party, host only, every path, 180 days). */
export function lookSetCookie(look: Look, secure: boolean): string {
  return `${LOOK_COOKIE}=${look}; Path=/; Max-Age=${LOOK_MAX_AGE}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** The same rule for a Request (server only: entry.server.tsx). */
export function lookForRequest(request: Request, b2c: boolean): LookState | null {
  const url = new URL(request.url);
  return resolveLook(b2c, url.search, request.headers.get("cookie"));
}

/** Whether the cookie may say Secure (not on a plain-http local run). */
export function lookCookieSecure(host: string | null | undefined): boolean {
  const h = (host ?? "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  return h !== "localhost" && h !== "127.0.0.1";
}

/** The URL the floating switch goes to: this page with ?look= set to the other look (the server stores it). */
export function switchHref(href: string, to: Look): string {
  const u = new URL(href);
  u.searchParams.set(LOOK_QUERY, to);
  return u.pathname + u.search + u.hash;
}
