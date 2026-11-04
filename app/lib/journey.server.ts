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
  inAppOf,
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

// A scripted browser that says so in its user agent, beyond isbot's list.
const AUTOMATION_UA = /puppeteer|playwright|selenium|webdriver|phantomjs|headless|electron\/|lighthouse|cypress/i;
// Browsers that load pages through their own servers or an old engine, so may not send a browser's usual headers.
const PROXY_BROWSER_UA = /UCBrowser|UCWEB|Opera Mini|OPiOS|Puffin/i;

/** Chrome 80+ or Firefox 90+ on a computer or Android: every one sends Sec-Fetch-Mode. */
function sendsFetchMetadata(ua: string): boolean {
  const chrome = /\bChrome\/(\d+)/.exec(ua);
  if (chrome) return Number(chrome[1]) >= 80;
  const firefox = /\bFirefox\/(\d+)/.exec(ua);
  return !!firefox && Number(firefox[1]) >= 90;
}

/**
 * NOT A VISIT (4 Nov 2026, the owner: "ban crawlers"): a request that is not a person's browser, so it is not counted.
 * isBotRequest; a scripted browser's user agent; or a browser's user agent without what that browser always sends: no
 * Accept-Language, a Chrome or Firefox with no Sec-Fetch-Mode, or (`page`, a page load) an Accept without text/html.
 * On 3 Nov 42 desktop blog and report landings with no referrer were counted as visitors and 1 of them ran the page's
 * script: scripts with a browser's user agent. An app's own browser (Instagram, Facebook, LinkedIn, an Android web
 * view) or a proxy browser is judged by its user agent alone, so a person from an ad is never dropped for a header
 * the app's view may not send. Gates visited_home and the beacons only: the stu_* cookies still go to every request
 * isBotRequest lets through, so a person judged wrongly here keeps their source.
 */
export function isAutomatedRequest(request: Request, page: boolean): boolean {
  if (isBotRequest(request)) return true;
  const ua = request.headers.get("user-agent") ?? "";
  if (AUTOMATION_UA.test(ua)) return true;
  if (inAppOf(ua) !== "none" || PROXY_BROWSER_UA.test(ua)) return false;
  if (!request.headers.get("accept-language")) return true;
  if (!request.headers.get("sec-fetch-mode") && sendsFetchMetadata(ua)) return true;
  return page && !(request.headers.get("accept") ?? "").includes("text/html");
}

// CRAWLER-COUNT (VISITORS, 4 Nov 2026, the owner: "how many crawlers and from what source"). Crawlers never reach the
// journey log, so a page render that is a bot adds one to public.site_bot_hits (drizzle/0038_site_bot_hits.sql): one
// row per IST day, bot family and path group. Only the family name and the path group are kept, never an IP, a user
// agent or a visitor id. Hits are added up in memory and written by one upsert at most every BOT_FLUSH_MS, after the
// response, on the journey pool; a missing table (42P01) is skipped quietly like the journey's.

export const BOT_TABLE = "public.site_bot_hits";
export const BOT_FLUSH_MS = 10_000;
/** At most this many (day, bot, path group) keys wait in memory; more are dropped until the next write. */
export const BOT_BATCH_CAP = 500;

/** Bot families, first match wins. Our own audit bot first, so a test never counts as Googlebot. */
const BOT_FAMILIES: [string, RegExp][] = [
  ["studojo_audit", /StudojoAudit-bot/i],
  ["googlebot", /Googlebot|GoogleOther|Google-InspectionTool|AdsBot-Google|Mediapartners-Google|Storebot-Google|Google-Read-Aloud|FeedFetcher-Google|APIs-Google|Google-Site-Verification/i],
  ["bingbot", /bingbot|BingPreview|msnbot|adidxbot/i],
  ["gptbot", /GPTBot/i],
  ["chatgpt", /ChatGPT-User|OAI-SearchBot/i],
  ["claudebot", /ClaudeBot|Claude-Web|Claude-SearchBot|Claude-User|anthropic-ai/i],
  ["perplexitybot", /PerplexityBot|Perplexity-User/i],
  ["meta_externalagent", /meta-externalagent|meta-externalfetcher|FacebookBot/i],
  ["facebook_preview", /facebookexternalhit|Facebot/i],
  ["applebot", /Applebot/i],
  ["yandexbot", /Yandex/i],
  ["duckduckbot", /DuckDuckBot|DuckAssistBot/i],
  ["baiduspider", /Baiduspider/i],
  ["bytespider", /Bytespider|TikTokSpider/i],
  ["amazonbot", /Amazonbot/i],
  ["ccbot", /CCBot/i],
  ["ahrefsbot", /AhrefsBot|AhrefsSiteAudit/i],
  ["semrushbot", /SemrushBot|SiteAuditBot|SplitSignalBot/i],
  ["seo_other", /MJ12bot|DotBot|DataForSeoBot|BLEXBot|Barkrowler|serpstatbot|SeekportBot|MegaIndex|rogerbot|ZoominfoBot|Screaming Frog|PetalBot/i],
  ["linkedinbot", /LinkedInBot/i],
  ["twitterbot", /Twitterbot/i],
  ["whatsapp_preview", /WhatsApp/i],
  ["preview_other", /Slackbot|TelegramBot|Discordbot|Pinterestbot|redditbot|Embedly|SkypeUriPreview|Iframely/i],
  ["monitor", /UptimeRobot|Pingdom|StatusCake|Site24x7|Better Uptime|kube-probe|Prometheus|Datadog/i],
  ["headless", /HeadlessChrome|PhantomJS|puppeteer|playwright|selenium|webdriver/i],
  ["script_client", /curl\/|Wget|python-requests|python-urllib|aiohttp|httpx|Go-http-client|okhttp|axios|node-fetch|undici|Java\/|libwww-perl|PostmanRuntime|Scrapy/i],
];

/** The family a bot's user agent belongs to; "no_user_agent" when there is none, "other_bot" when no family fits. Pure. */
export function botFamily(ua: string | null | undefined): string {
  const s = (ua ?? "").trim();
  if (!s) return "no_user_agent";
  for (const [name, re] of BOT_FAMILIES) if (re.test(s)) return name;
  return "other_bot";
}

/** home, blog, report, legal or other, for a page's path. Pure. */
export function botPathGroup(pathname: string): "home" | "blog" | "report" | "legal" | "other" {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (p === "/" || p === "") return "home";
  if (p === "/blog" || p.startsWith("/blog/")) return "blog";
  if (p === "/reports" || p.startsWith("/reports/")) return "report";
  if (p === "/terms" || p === "/privacy" || p === "/refund-policy") return "legal";
  return "other";
}

/**
 * What a page render counts as in site_bot_hits, or null for a person's browser: a GET whose user agent isbot (its
 * family), or a landing page that isAutomatedRequest drops from the visitors ("scripted", a browser's user agent
 * without a browser's headers). Pure.
 */
export function botHitOf(request: Request): { bot: string; pathGroup: string } | null {
  if (request.method.toUpperCase() !== "GET") return null;
  const path = new URL(request.url).pathname;
  if (isBotRequest(request)) return { bot: botFamily(request.headers.get("user-agent")), pathGroup: botPathGroup(path) };
  if (isLandingPath(path) && !isPrefetch(request.headers) && isAutomatedRequest(request, true)) return { bot: "scripted", pathGroup: botPathGroup(path) };
  return null;
}

/** Hits waiting to be written: "day|bot|path_group" -> count. */
export type BotBatch = Map<string, number>;
const botBatch: BotBatch = new Map();
let botTimer: ReturnType<typeof setTimeout> | null = null;
let botMissingUntil = 0;

/** Adds one hit to the batch; false when the batch is full (the hit is dropped). Pure apart from the map. */
export function addBotHit(batch: BotBatch, day: string, bot: string, pathGroup: string, cap: number = BOT_BATCH_CAP): boolean {
  const key = `${day}|${bot}|${pathGroup}`;
  if (!batch.has(key) && batch.size >= cap) return false;
  batch.set(key, (batch.get(key) ?? 0) + 1);
  return true;
}

/** The one upsert for a batch: its SQL and values, one row per key. Pure. */
export function botUpsert(batch: BotBatch): { text: string; values: unknown[] } | null {
  if (!batch.size) return null;
  const values: unknown[] = [];
  const rows: string[] = [];
  for (const [key, n] of batch) {
    const [day, bot, group] = key.split("|");
    const i = values.length;
    values.push(day, bot, group, n);
    rows.push(`($${i + 1}::date, $${i + 2}, $${i + 3}, $${i + 4}::int)`);
  }
  return {
    text: `INSERT INTO ${BOT_TABLE} (day, bot, path_group, hits) VALUES ${rows.join(", ")}
           ON CONFLICT (day, bot, path_group) DO UPDATE SET hits = ${BOT_TABLE}.hits + EXCLUDED.hits, updated_at = now()`,
    values,
  };
}

async function flushBotHits(): Promise<void> {
  botTimer = null;
  const batch: BotBatch = new Map(botBatch);
  botBatch.clear();
  const q = botUpsert(batch);
  const p = journeyPool();
  if (!q || !p || Date.now() < botMissingUntil) return;
  try {
    await p.query(q.text, q.values);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "42P01" || code === "3F000") {
      botMissingUntil = Date.now() + 60_000;
      return;
    }
    if (!warned) {
      warned = true;
      console.warn(`[journey] bot count skipped (${code ?? "error"}); further failures are silent`);
    }
  }
}

/** Counts a crawler's page render (botHitOf) without waiting and without ever throwing. */
export function countBotHit(request: Request, now: Date = new Date()): void {
  try {
    const hit = botHitOf(request);
    if (!hit || Date.now() < botMissingUntil || !process.env.DATABASE_URL) return;
    addBotHit(botBatch, istDay(now), hit.bot, hit.pathGroup);
    if (!botTimer) {
      botTimer = setTimeout(() => void flushBotHits().catch(() => {}), BOT_FLUSH_MS);
      botTimer.unref?.();
    }
  } catch {
    // counting must never break a page
  }
}

/**
 * The event a POST /api/journey beacon asks for, or null when it is not to be written: not a person's browser
 * (isAutomatedRequest), another site's page posting here, a visitor who said no to tracking (the consent cookie the
 * browser's rule reads), no stu_vid, or a body that is not one of the allowed steps with its props (journey.ts
 * cleanBeacon). device and inapp come from the user agent; the source (stu_lt, else stu_src) goes on clicked_join
 * only: page rows are many, and the visitor's visited_home and clicked_join rows carry it (join a page row to them by
 * visitor_id). Never throws. The route applies the rate limits after this.
 */
export async function readJourneyBeacon(request: Request): Promise<JourneyEvent | null> {
  try {
    if (isAutomatedRequest(request, false)) return null;
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
    // CRAWLER-COUNT: a crawler's page render adds to site_bot_hits (in memory, written later); a person's adds nothing.
    countBotHit(request);
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
    if (!isLandingPath(url.pathname) || isPrefetch(request.headers) || isAutomatedRequest(request, true)) return;
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
