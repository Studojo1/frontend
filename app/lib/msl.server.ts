import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import db from "./db";

const USERNAME = "msl123";
const PASSWORD = "msl1/2/3";
const COOKIE_NAME = "msl_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 12;
export const DEFAULT_FX_RATE = 83.5;

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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function todayIsoIst(): string {
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function shiftIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface RangeInput {
  start?: string | null;
  end?: string | null;
  fx?: string | null;
  b2b?: string | null;
}

export function resolveRange(input: RangeInput) {
  const end = input.end && ISO_DATE.test(input.end) ? input.end : todayIsoIst();
  const startDefault = shiftIso(end, -29);
  let start = input.start && ISO_DATE.test(input.start) ? input.start : startDefault;
  if (start > end) start = end;
  const fxParsed = Number(input.fx ?? "");
  const fxRate = Number.isFinite(fxParsed) && fxParsed > 0 ? fxParsed : DEFAULT_FX_RATE;
  const b2bParsed = Number(input.b2b ?? "");
  const b2bInr = Number.isFinite(b2bParsed) && b2bParsed >= 0 ? b2bParsed : 0;
  return { start, end, fxRate, b2bInr };
}

export interface DailyPoint { day: string; count: number }
export interface DailyRevenuePoint { day: string; amount_inr: number; amount_usd: number; amount_total_inr: number; orders: number }
export interface RevenueTriple { inr: number; usd: number; totalInr: number }

export interface MslStats {
  range: { start: string; end: string };
  fxRate: number;
  b2bInr: number;
  signups: {
    today: number; last7: number; last30: number; allTime: number; range: number;
    daily: DailyPoint[];
  };
  revenue: {
    today: RevenueTriple; last7: RevenueTriple; last30: RevenueTriple;
    allTime: RevenueTriple; range: RevenueTriple;
    daily: DailyRevenuePoint[];
  };
  generatedAt: string;
}

function cents(n: unknown): number { return Number(n ?? 0) / 100; }

function triple(inrCents: unknown, usdCents: unknown, fxRate: number): RevenueTriple {
  const inr = cents(inrCents);
  const usd = cents(usdCents);
  return { inr, usd, totalInr: inr + usd * fxRate };
}

export async function getMslStats(input: RangeInput = {}): Promise<MslStats> {
  const { start, end, fxRate, b2bInr } = resolveRange(input);
  const endExclusive = shiftIso(end, 1);

  const [
    signupsToday, signups7, signups30, signupsAll, signupsRange, signupsDaily,
    revToday, rev7, rev30, revAll, revRange, revDaily,
  ] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '1 day'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '7 days'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '30 days'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user"`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= ${start}::date AND created_at < ${endExclusive}::date`),
    db.execute(sql`
      SELECT DATE(created_at) AS day, COUNT(*)::int AS c FROM "user"
      WHERE created_at >= ${start}::date AND created_at < ${endExclusive}::date
      GROUP BY day ORDER BY day ASC
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid' AND created_at >= NOW() - INTERVAL '1 day'
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid' AND created_at >= NOW() - INTERVAL '7 days'
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid' AND created_at >= NOW() - INTERVAL '30 days'
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid'
    `),
    db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid'
        AND created_at >= ${start}::date AND created_at < ${endExclusive}::date
    `),
    db.execute(sql`
      SELECT
        DATE(created_at) AS day,
        COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
        COALESCE(SUM(CASE WHEN currency<>'INR' OR currency IS NULL THEN amount_cents END),0)::bigint AS usd,
        COUNT(*)::int AS orders
      FROM payment_orders WHERE status='paid'
        AND created_at >= ${start}::date AND created_at < ${endExclusive}::date
      GROUP BY day ORDER BY day ASC
    `),
  ]);

  const num = (r: { rows: { c?: number }[] }) => Number(r.rows[0]?.c ?? 0);
  const tripleOf = (r: { rows: { inr?: bigint | number; usd?: bigint | number }[] }) =>
    triple(r.rows[0]?.inr, r.rows[0]?.usd, fxRate);

  return {
    range: { start, end },
    fxRate,
    b2bInr,
    signups: {
      today: num(signupsToday),
      last7: num(signups7),
      last30: num(signups30),
      allTime: num(signupsAll),
      range: num(signupsRange),
      daily: (signupsDaily.rows as { day: string; c: number }[]).map((r) => ({
        day: String(r.day).slice(0, 10),
        count: Number(r.c ?? 0),
      })),
    },
    revenue: {
      today: tripleOf(revToday),
      last7: tripleOf(rev7),
      last30: tripleOf(rev30),
      allTime: tripleOf(revAll),
      range: tripleOf(revRange),
      daily: (revDaily.rows as { day: string; inr: bigint | number; usd: bigint | number; orders: number }[]).map((r) => {
        const inr = cents(r.inr);
        const usd = cents(r.usd);
        return {
          day: String(r.day).slice(0, 10),
          amount_inr: inr,
          amount_usd: usd,
          amount_total_inr: inr + usd * fxRate,
          orders: Number(r.orders ?? 0),
        };
      }),
    },
    generatedAt: new Date().toISOString(),
  };
}
