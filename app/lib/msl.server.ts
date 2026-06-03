import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import db from "./db";

const USERNAME = "msl123";
const PASSWORD = "msl1/2/3";
const COOKIE_NAME = "msl_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 12;

function getSecret(): string {
  const s = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!s) throw new Error("BETTER_AUTH_SECRET not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function constantEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyCredentials(username: string, password: string): boolean {
  return constantEq(username, USERNAME) && constantEq(password, PASSWORD);
}

export function buildSessionCookie(): string {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SEC;
  const payload = `${USERNAME}.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  const isProd = process.env.NODE_ENV === "production";
  const flags = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${COOKIE_MAX_AGE_SEC}`,
  ];
  if (isProd) flags.push("Secure");
  return flags.join("; ");
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function isAuthed(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!m) return false;
  const parts = m[1].split(".");
  if (parts.length !== 3) return false;
  const [user, expStr, mac] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return false;
  const expected = sign(`${user}.${expStr}`);
  if (!constantEq(mac, expected)) return false;
  return user === USERNAME;
}

export interface DailyPoint {
  day: string;
  count: number;
}

export interface DailyRevenuePoint {
  day: string;
  amount_inr: number;
  amount_usd: number;
  orders: number;
}

export interface MslStats {
  signups: {
    today: number;
    last7: number;
    last30: number;
    allTime: number;
    daily: DailyPoint[];
  };
  revenue: {
    todayInr: number;
    todayUsd: number;
    last7Inr: number;
    last7Usd: number;
    last30Inr: number;
    last30Usd: number;
    allTimeInr: number;
    allTimeUsd: number;
    daily: DailyRevenuePoint[];
  };
  paidUsers: {
    total: number;
    last30: number;
  };
  generatedAt: string;
}


export async function getMslStats(): Promise<MslStats> {
  const [
    signupsToday,
    signups7,
    signups30,
    signupsAll,
    signupsDaily,
    revToday,
    rev7,
    rev30,
    revAll,
    revDaily,
    paidTotal,
    paid30,
  ] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '1 day'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '7 days'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '30 days'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user"`),
    db.execute(sql`
      SELECT DATE(created_at) AS day, COUNT(*)::int AS c
      FROM "user"
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day ASC
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders
      WHERE status IN ('paid','captured','succeeded','completed') AND created_at >= NOW() - INTERVAL '1 day'
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders
      WHERE status IN ('paid','captured','succeeded','completed') AND created_at >= NOW() - INTERVAL '7 days'
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders
      WHERE status IN ('paid','captured','succeeded','completed') AND created_at >= NOW() - INTERVAL '30 days'
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders
      WHERE status IN ('paid','captured','succeeded','completed')
    `),
    db.execute(sql`
      SELECT
        DATE(created_at) AS day,
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd,
        COUNT(*)::int AS orders
      FROM payment_orders
      WHERE status IN ('paid','captured','succeeded','completed') AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day ASC
    `),
    db.execute(sql`SELECT COUNT(DISTINCT user_id)::int AS c FROM payment_orders WHERE status IN ('paid','captured','succeeded','completed')`),
    db.execute(sql`SELECT COUNT(DISTINCT user_id)::int AS c FROM payment_orders WHERE status IN ('paid','captured','succeeded','completed') AND created_at >= NOW() - INTERVAL '30 days'`),
  ]);

  const cents = (n: unknown) => Number(n ?? 0) / 100;
  const num = (r: { rows: { c?: number }[] }) => Number(r.rows[0]?.c ?? 0);
  const inr = (r: { rows: { inr?: bigint | number }[] }) => cents(r.rows[0]?.inr);
  const usd = (r: { rows: { usd?: bigint | number }[] }) => cents(r.rows[0]?.usd);

  return {
    signups: {
      today: num(signupsToday),
      last7: num(signups7),
      last30: num(signups30),
      allTime: num(signupsAll),
      daily: (signupsDaily.rows as { day: string; c: number }[]).map((r) => ({
        day: String(r.day).slice(0, 10),
        count: Number(r.c ?? 0),
      })),
    },
    revenue: {
      todayInr: inr(revToday),
      todayUsd: usd(revToday),
      last7Inr: inr(rev7),
      last7Usd: usd(rev7),
      last30Inr: inr(rev30),
      last30Usd: usd(rev30),
      allTimeInr: inr(revAll),
      allTimeUsd: usd(revAll),
      daily: (revDaily.rows as { day: string; inr: bigint | number; usd: bigint | number; orders: number }[]).map((r) => ({
        day: String(r.day).slice(0, 10),
        amount_inr: cents(r.inr),
        amount_usd: cents(r.usd),
        orders: Number(r.orders ?? 0),
      })),
    },
    paidUsers: {
      total: num(paidTotal),
      last30: num(paid30),
    },
    generatedAt: new Date().toISOString(),
  };
}
