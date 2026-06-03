import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import db from "./db";

const USERNAME = "msl123";
const PASSWORD = "msl1/2/3";
const COOKIE_NAME = "msl_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 12;

const FX_RATE = 94; // 1 USD = ₹94

// B2B deals by IST date — update here when new deals close
const B2B_BY_DATE: Record<string, number> = {
  "2026-06-02": 15000, // ₹15,000 offline deal
  "2026-06-03": 2550,  // ₹2,550 offline deal
};

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

export function verifyCredentials(u: string, p: string): boolean {
  return constantEq(u, USERNAME) && constantEq(p, PASSWORD);
}

export function buildSessionCookie(): string {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SEC;
  const payload = `${USERNAME}.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  const isProd = process.env.NODE_ENV === "production";
  const flags = [`${COOKIE_NAME}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${COOKIE_MAX_AGE_SEC}`];
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
  if (!constantEq(mac, sign(`${user}.${expStr}`))) return false;
  return user === USERNAME;
}

export function todayIst(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function yesterdayIst(): string {
  const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
export function shiftIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Sum B2B for a date range [start, end] inclusive
function b2bForRange(start: string, end: string): number {
  return Object.entries(B2B_BY_DATE)
    .filter(([d]) => d >= start && d <= end)
    .reduce((s, [, v]) => s + v, 0);
}

export interface RevenueTriple { inr: number; usd: number; db: number; b2b: number; total: number }
export interface CalendarDay {
  date: string;
  signups: number;
  orders: number;
  inr: number;
  usd: number;
  b2b: number;
  total: number;
}
export interface MslStats {
  fxRate: number;
  today: string;
  yesterday: string;
  rev: {
    today: RevenueTriple;
    yesterday: RevenueTriple;
    last7: RevenueTriple;
    last30: RevenueTriple;
    allTime: RevenueTriple;
  };
  signups: { today: number; yesterday: number; last7: number; last30: number; allTime: number };
  calendar: CalendarDay[]; // last 60 days, one entry per day that has any data
  generatedAt: string;
}

function cents(n: unknown): number { return Number(n ?? 0) / 100; }
function mkTriple(inrCents: unknown, usdCents: unknown, b2b: number): RevenueTriple {
  const inr = cents(inrCents);
  const usd = cents(usdCents);
  const dbTotal = inr + usd * FX_RATE;
  return { inr, usd, db: dbTotal, b2b, total: dbTotal + b2b };
}

export async function getMslStats(): Promise<MslStats> {
  const today = todayIst();
  const yesterday = yesterdayIst();
  const calStart = shiftIso(today, -59); // 60-day calendar window

  const [
    sigToday, sigYest, sig7, sig30, sigAll,
    revToday, revYest, rev7, rev30, revAll,
    calSignups, calRev,
  ] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '1 day'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE DATE(created_at + INTERVAL '5.5 hours') = ${yesterday}::date`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '7 days'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '30 days'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user"`),

    db.execute(sql`
      SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
             COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid' AND created_at >= NOW() - INTERVAL '1 day'`),
    db.execute(sql`
      SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
             COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid'
        AND DATE(created_at + INTERVAL '5.5 hours') = ${yesterday}::date`),
    db.execute(sql`
      SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
             COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid' AND created_at >= NOW() - INTERVAL '7 days'`),
    db.execute(sql`
      SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
             COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid' AND created_at >= NOW() - INTERVAL '30 days'`),
    db.execute(sql`
      SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
             COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd
      FROM payment_orders WHERE status='paid'`),

    // Calendar: signups per IST day
    db.execute(sql`
      SELECT DATE(created_at + INTERVAL '5.5 hours') AS day, COUNT(*)::int AS c
      FROM "user"
      WHERE DATE(created_at + INTERVAL '5.5 hours') >= ${calStart}::date
      GROUP BY day ORDER BY day DESC`),
    // Calendar: revenue per IST day
    db.execute(sql`
      SELECT DATE(created_at + INTERVAL '5.5 hours') AS day,
             COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr,
             COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd,
             COUNT(*)::int AS orders
      FROM payment_orders WHERE status='paid'
        AND DATE(created_at + INTERVAL '5.5 hours') >= ${calStart}::date
      GROUP BY day ORDER BY day DESC`),
  ]);

  const num = (r: { rows: { c?: number }[] }) => Number(r.rows[0]?.c ?? 0);
  const rev = (r: { rows: { inr?: bigint | number; usd?: bigint | number }[] }, b2b: number) =>
    mkTriple(r.rows[0]?.inr, r.rows[0]?.usd, b2b);

  // Build calendar map
  const sigMap = new Map<string, number>();
  for (const row of calSignups.rows as { day: string; c: number }[])
    sigMap.set(String(row.day).slice(0, 10), Number(row.c));

  const revMap = new Map<string, { inr: number; usd: number; orders: number }>();
  for (const row of calRev.rows as { day: string; inr: bigint | number; usd: bigint | number; orders: number }[]) {
    const d = String(row.day).slice(0, 10);
    revMap.set(d, { inr: cents(row.inr), usd: cents(row.usd), orders: Number(row.orders) });
  }

  // Merge all dates that appear in either map
  const allDates = new Set([...sigMap.keys(), ...revMap.keys(), ...Object.keys(B2B_BY_DATE).filter(d => d >= calStart)]);
  const calendar: CalendarDay[] = Array.from(allDates).sort((a, b) => b.localeCompare(a)).map((date) => {
    const s = sigMap.get(date) ?? 0;
    const r = revMap.get(date) ?? { inr: 0, usd: 0, orders: 0 };
    const b2b = B2B_BY_DATE[date] ?? 0;
    const dbTotal = r.inr + r.usd * FX_RATE;
    return { date, signups: s, orders: r.orders, inr: r.inr, usd: r.usd, b2b, total: dbTotal + b2b };
  });

  const b2bToday = b2bForRange(today, today);
  const b2bYest = b2bForRange(yesterday, yesterday);
  const b2b7 = b2bForRange(shiftIso(today, -6), today);
  const b2b30 = b2bForRange(shiftIso(today, -29), today);
  const b2bAll = Object.values(B2B_BY_DATE).reduce((s, v) => s + v, 0);

  return {
    fxRate: FX_RATE,
    today,
    yesterday,
    rev: {
      today: rev(revToday, b2bToday),
      yesterday: rev(revYest, b2bYest),
      last7: rev(rev7, b2b7),
      last30: rev(rev30, b2b30),
      allTime: rev(revAll, b2bAll),
    },
    signups: {
      today: num(sigToday),
      yesterday: num(sigYest),
      last7: num(sig7),
      last30: num(sig30),
      allTime: num(sigAll),
    },
    calendar,
    generatedAt: new Date().toISOString(),
  };
}
