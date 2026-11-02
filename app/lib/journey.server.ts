import crypto from "node:crypto";
import { isbot } from "isbot";
import { Pool } from "pg";
import {
  cookieDomainFor,
  isLandingPath,
  isPrefetch,
  journeyEnv,
  parseCookies,
  planCookies,
  type Source,
} from "./journey";

// FIRST-PARTY JOURNEY, the server half (contract in app/lib/journey.ts). Two jobs:
//   1. every page load (entry.server.tsx) sets stu_vid, stu_src and stu_lt on the parent domain;
//   2. INSERTs visited_home and clicked_join into career_agent.career_journey_events.
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
  step: "visited_home" | "clicked_join";
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

// visited_home once per visitor per day: held per process (a day key per visitor), so a reload or a walk through the
// blog writes one row. A restart may write a second row that day, which a COUNT(DISTINCT visitor_id) absorbs.
const seenToday = new Map<string, string>();
function firstToday(visitorId: string, now: Date): boolean {
  const day = now.toISOString().slice(0, 10);
  if (seenToday.get(visitorId) === day) return false;
  if (seenToday.size > 50_000) seenToday.clear();
  seenToday.set(visitorId, day);
  return true;
}

/** A crawler, or no browser at all. */
export function isBotRequest(request: Request): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  return !ua || isbot(ua);
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
    recordJourneyEvent({
      env: journeyEnv(host),
      visitorId: plan.visitorId,
      step: "visited_home",
      props: { path: url.pathname.slice(0, 200) },
      source: plan.source,
    });
  } catch {
    // tracking must never break a page
  }
}
