import crypto from "node:crypto";
import { isbot } from "isbot";
import { Pool, type PoolClient } from "pg";
import { consentFromCookie } from "./consent";
import {
  type BeaconStep,
  cleanBeacon,
  cookieDomainFor,
  deviceProps,
  FIRST_TOUCH_COOKIE,
  isLandingPath,
  isPrefetch,
  journeyEnv,
  LAST_TOUCH_COOKIE,
  parseCookies,
  planCookies,
  readSource,
  type Source,
  validVisitorId,
  VISITOR_COOKIE,
} from "./journey";

// FIRST-PARTY JOURNEY, the server half (contract in app/lib/journey.ts). Two jobs:
//   1. every page load (entry.server.tsx) sets stu_vid, stu_src and stu_lt on the parent domain;
//   2. INSERTs visited_home, clicked_join and (SITE-TRACK) page_view and page_engaged into
//      career_agent.career_journey_events.
// An INSERT never throws and never holds a page: it runs after the response is under way, on its own small pool
// with short timeouts, so a slow or missing database cannot take connections from sign-in. Until the product creates
// the table (42P01) every write is skipped quietly, checked again at most once a minute.

const TABLE = "career_agent.career_journey_events";

let pool: Pool | null = null;
function journeyPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 2_000,
      statement_timeout: 2_000,
      query_timeout: 3_000,
    });
    pool.on("error", () => {
      // an idle client dropped: the pool replaces it
    });
  }
  return pool;
}

let missingUntil = 0;
let warned = false;

export type JourneyEvent = {
  env: "prod" | "staging";
  visitorId: string;
  step: "visited_home" | BeaconStep;
  props: Record<string, unknown>;
  source: Source | null;
};

async function insert(e: JourneyEvent): Promise<void> {
  if (Date.now() < missingUntil) return;
  const p = journeyPool();
  if (!p) return;
  const values = [e.env, e.visitorId, e.step, JSON.stringify(e.props), e.source ? JSON.stringify(e.source) : null];
  try {
    await p.query(
      `INSERT INTO ${TABLE} (at, env, user_id, visitor_id, session_id, step, props, source)
       VALUES (now(), $1, NULL, $2, NULL, $3, $4::jsonb, $5::jsonb)`,
      values,
    );
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "42P01" || code === "3F000") {
      // The table (or the schema) is not there yet.
      missingUntil = Date.now() + 60_000;
      return;
    }
    if (code === "23502") {
      // An id (or session id) with no default: give it one and try once more.
      try {
        await p.query(
          `INSERT INTO ${TABLE} (id, at, env, user_id, visitor_id, session_id, step, props, source)
           VALUES (gen_random_uuid(), now(), $1, NULL, $2, $2, $3, $4::jsonb, $5::jsonb)`,
          values,
        );
        return;
      } catch {
        // fall through to the one warning below
      }
    }
    if (!warned) {
      warned = true;
      console.warn(`[journey] insert skipped (${code ?? "error"}); further failures are silent`);
    }
  }
}

/** Write one event without waiting for it and without ever throwing. */
export function recordJourneyEvent(e: JourneyEvent): void {
  try {
    void insert(e).catch(() => {});
  } catch {
    // never
  }
}

// visited_home once per visitor per day (an IST day, as the product counts its daily steps). Two guards:
//   1. per process, a day key per visitor, so a reload or a walk through the blog never reaches the database;
//   2. in the database (QA-FIX, 2 Nov 2026: web runs 2 pods, so the per-process guard alone wrote a second row when
//      the same visitor's next landing page hit the other pod, about 45 s later). One transaction takes an advisory
//      lock on (visitor, day), then inserts only when no visited_home row for that visitor exists since the IST day
//      began (career_journey_events_visitor_idx on (visitor_id, at) answers it). The INSERT runs after the lock, so it
//      sees a row another pod committed while this one waited: pods writing at once still keep one row.
const seenToday = new Map<string, string>();

/** The IST calendar day of an instant, "YYYY-MM-DD". Pure. */
export function istDay(now: Date): string {
  return new Date(now.getTime() + 330 * 60_000).toISOString().slice(0, 10);
}

/** The per-process guard: true the first time this process sees the visitor on that IST day. */
export function firstToday(visitorId: string, now: Date, seen: Map<string, string> = seenToday): boolean {
  const day = istDay(now);
  if (seen.get(visitorId) === day) return false;
  if (seen.size > 50_000) seen.clear();
  seen.set(visitorId, day);
  return true;
}

/** The lock key's text for one visitor's day; hashed by Postgres (hashtextextended) into the advisory lock. */
export function visitedLockKey(visitorId: string, day: string): string {
  return `visited_home:${visitorId}:${day}`;
}

/** The database guard's INSERT: a visited_home row only if the visitor has none since the IST day began. */
export const VISITED_ONCE_SQL = `INSERT INTO ${TABLE} (at, env, user_id, visitor_id, session_id, step, props, source)
       SELECT now(), $1, NULL, $2, NULL, 'visited_home', $3::jsonb, $4::jsonb
       WHERE NOT EXISTS (
         SELECT 1 FROM ${TABLE}
          WHERE visitor_id = $2 AND step = 'visited_home' AND env = $1
            AND at >= (date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')
       )`;

/** What insertVisitedOnce needs of a pg client (a pooled client, or a fake in the test). */
export type QueryClient = { query: (sql: string, values?: unknown[]) => Promise<{ rowCount?: number | null }> };

/**
 * One transaction: lock the visitor's day, insert visited_home unless that day already has one. Returns true when a
 * row was written. Throws what the database throws (the caller decides what is quiet); rolls back on any error.
 */
export async function insertVisitedOnce(client: QueryClient, e: JourneyEvent, now: Date): Promise<boolean> {
  await client.query("BEGIN");
  try {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [visitedLockKey(e.visitorId, istDay(now))]);
    const r = await client.query(VISITED_ONCE_SQL, [
      e.env,
      e.visitorId,
      JSON.stringify(e.props),
      e.source ? JSON.stringify(e.source) : null,
    ]);
    await client.query("COMMIT");
    return (r.rowCount ?? 0) > 0;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

async function insertVisited(e: JourneyEvent, now: Date): Promise<void> {
  if (Date.now() < missingUntil) return;
  const p = journeyPool();
  if (!p) return;
  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    await insertVisitedOnce(client, e, now);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "42P01" || code === "3F000") {
      missingUntil = Date.now() + 60_000;
      return;
    }
    if (!warned) {
      warned = true;
      console.warn(`[journey] visited_home skipped (${code ?? "error"}); further failures are silent`);
    }
  } finally {
    client?.release();
  }
}

/** visited_home without waiting for it and without ever throwing (once a visitor a day, across pods). */
export function recordVisitedHome(e: JourneyEvent, now: Date): void {
  try {
    void insertVisited(e, now).catch(() => {});
  } catch {
    // never
  }
}

// SITE-TRACK (3 Nov 2026, the owner): how many beacons one visitor may send an IST day (POST /api/journey). A real
// visit sends a page_view and a few page_engaged a page; 200 is far above any person and stops a loop or a script
// early. Per process, like firstToday: web runs 2 pods, so the most a visitor can write is twice this.
export const VISITOR_DAILY_CAP = 200;
const sentToday = { day: "", counts: new Map<string, number>() };

/** Counts one beacon for the visitor; false once they have sent `cap` this IST day (on this process). */
export function underDailyCap(
  visitorId: string,
  now: Date,
  state: { day: string; counts: Map<string, number> } = sentToday,
  cap: number = VISITOR_DAILY_CAP,
): boolean {
  const day = istDay(now);
  if (state.day !== day || state.counts.size > 50_000) {
    state.day = day;
    state.counts.clear();
  }
  const n = state.counts.get(visitorId) ?? 0;
  if (n >= cap) return false;
  state.counts.set(visitorId, n + 1);
  return true;
}

/** A crawler, or no browser at all. */
export function isBotRequest(request: Request): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  return !ua || isbot(ua);
}

/**
 * The event a POST /api/journey beacon asks for, or null when it is not to be written: a crawler, another site's page
 * posting here, a visitor who said no to tracking (the consent cookie the browser's rule reads), no stu_vid, or a body
 * that is not one of the allowed steps with its props (journey.ts cleanBeacon). device and inapp come from the user
 * agent; the source (stu_lt, else stu_src) goes on clicked_join only: page rows are many, and the visitor's
 * visited_home and clicked_join rows carry it (join a page row to them by visitor_id). Never throws. The route applies
 * the rate limits after this.
 */
export async function readJourneyBeacon(request: Request): Promise<JourneyEvent | null> {
  try {
    if (isBotRequest(request)) return null;
    // A beacon from our own page says same-origin; anything else is someone else's page posting here.
    const site = request.headers.get("sec-fetch-site");
    if (site && site !== "same-origin") return null;
    const cookieHeader = request.headers.get("cookie");
    if (consentFromCookie(cookieHeader) === "denied") return null;
    const cookies = parseCookies(cookieHeader);
    const visitorId = cookies.get(VISITOR_COOKIE);
    if (!validVisitorId(visitorId)) return null;
    let body: unknown = null;
    try {
      body = JSON.parse((await request.text()).slice(0, 2_000));
    } catch {
      return null;
    }
    const beacon = cleanBeacon(body);
    if (!beacon) return null;
    const join = beacon.step === "clicked_join";
    return {
      env: journeyEnv(request.headers.get("host")),
      visitorId,
      step: beacon.step,
      props: { ...beacon.props, ...deviceProps(request.headers.get("user-agent"), beacon.touch) },
      source: join ? (readSource(cookies.get(LAST_TOUCH_COOKIE)) ?? readSource(cookies.get(FIRST_TOUCH_COOKIE))) : null,
    };
  } catch {
    return null;
  }
}

function cookieSecure(host: string): boolean {
  const h = host.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  return h !== "localhost" && h !== "127.0.0.1";
}

/**
 * Called for every page render (entry.server.tsx). Appends the stu_* Set-Cookie headers and, on a landing page,
 * records visited_home. Never throws.
 */
export function journeyOnPage(request: Request, responseHeaders: Headers): void {
  try {
    if (request.method.toUpperCase() !== "GET" || isBotRequest(request)) return;
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    const now = new Date();
    const plan = planCookies({
      cookies: parseCookies(request.headers.get("cookie")),
      url,
      referer: request.headers.get("referer"),
      host,
      domain: cookieDomainFor(host, process.env.AUTH_COOKIE_DOMAIN),
      secure: cookieSecure(host),
      now,
      newId: crypto.randomUUID(),
    });
    for (const c of plan.setCookies) responseHeaders.append("Set-Cookie", c);
    if (!isLandingPath(url.pathname) || isPrefetch(request.headers)) return;
    if (!firstToday(plan.visitorId, now)) return;
    recordVisitedHome(
      {
        env: journeyEnv(host),
        visitorId: plan.visitorId,
        step: "visited_home",
        // SITE-TRACK (3 Nov 2026, the owner: "the device type isn't being saved"): device and in-app browser too.
        props: { path: url.pathname.slice(0, 200), ...deviceProps(request.headers.get("user-agent")) },
        source: plan.source,
      },
      now,
    );
  } catch {
    // tracking must never break a page
  }
}

/** The bare host of a Host header or URL host (no port, no trailing dot, lower case). */
function bareHost(host: string): string {
  return host.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

/**
 * The stu_* Set-Cookie values for a /go/<slug> short link whose destination is on another host (the product on
 * platform.studojo.com). That page is not rendered here, so the cookies are planned from the tagged destination
 * (its utm_*, utm_id and click ids; landing_path is the destination's path) and set on the parent domain by this
 * redirect, before the visitor reaches the product. A destination on this host returns none: its own page render
 * sets them (journeyOnPage) with the real landing path. Crawlers and non-GET requests get none. Never throws.
 */
export function journeyCookiesForRedirect(request: Request, target: URL): string[] {
  try {
    if (request.method.toUpperCase() !== "GET" || isBotRequest(request)) return [];
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    if (bareHost(target.host) === bareHost(host)) return [];
    return planCookies({
      cookies: parseCookies(request.headers.get("cookie")),
      url: target,
      referer: request.headers.get("referer"),
      host,
      domain: cookieDomainFor(host, process.env.AUTH_COOKIE_DOMAIN),
      secure: cookieSecure(host),
      now: new Date(),
      newId: crypto.randomUUID(),
    }).setCookies;
  } catch {
    return [];
  }
}
