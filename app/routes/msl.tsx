/**
 * MSL Dashboard — internal revenue/signups view.
 * No .server.ts imports: all server code is inline in loader/action.
 * Auth: single hardcoded HttpOnly cookie token (no node:crypto needed).
 */

import { Form, redirect, useLoaderData } from "react-router";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import type { Route } from "./+types/msl";

// ─── Auth constants ────────────────────────────────────────────────────────
const USERNAME = "msl123";
const PASSWORD = "msl1/2/3";
const SESSION_TOKEN = "msl-s3ss10n-t0k3n-studojo-int3rn4l";
const COOKIE_NAME = "msl_auth";
const COOKIE_MAX_AGE = 60 * 60 * 12;

// ─── B2B deals ─────────────────────────────────────────────────────────────
// Update this object when new B2B deals close. Key = IST date (YYYY-MM-DD).
const B2B_BY_DATE: Record<string, number> = {
  "2026-06-02": 15000,
  "2026-06-03": 2550,
  "2026-06-13": 9650,
  "2026-07-13": 4000,
};
const DEFAULT_FX = 94; // 1 USD = ₹94

// ─── Helpers ───────────────────────────────────────────────────────────────
function buildCookie(): string {
  const isProd = process.env.NODE_ENV === "production";
  const flags = [`${COOKIE_NAME}=${SESSION_TOKEN}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${COOKIE_MAX_AGE}`];
  if (isProd) flags.push("Secure");
  return flags.join("; ");
}
function clearCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
function isAuthed(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return m?.[1] === SESSION_TOKEN;
}
function todayIst(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
function yesterdayIst(): string {
  const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
function shiftIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function b2bSum(start: string, end: string): number {
  return Object.entries(B2B_BY_DATE).filter(([d]) => d >= start && d <= end).reduce((s, [, v]) => s + v, 0);
}
function cents(n: unknown): number { return Number(n ?? 0) / 100; }
function mkTriple(inrCents: unknown, usdCents: unknown, b2b: number, fx = DEFAULT_FX) {
  const inr = cents(inrCents); const usd = cents(usdCents);
  const db2 = inr + usd * fx;
  return { inr, usd, db: db2, b2b, total: db2 + b2b };
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface CalDay { date: string; signups: number; orders: number; inr: number; usd: number; b2b: number; total: number }
interface Triple { inr: number; usd: number; db: number; b2b: number; total: number }
interface RangeStats { start: string; end: string; fxRate: number; b2bTotal: number; signups: number; rev: Triple }
interface Stats {
  fxRate: number; today: string; yesterday: string;
  rev: { today: Triple; yesterday: Triple; last7: Triple; last30: Triple; allTime: Triple };
  signups: { today: number; yesterday: number; last7: number; last30: number; allTime: number };
  calendar: CalDay[];
  selectedDay: CalDay | null;
  customRange: RangeStats | null;
  filter: { start: string; end: string; fx: string; b2b: string };
  generatedAt: string;
}

// ─── Loader ────────────────────────────────────────────────────────────────
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  if (!isAuthed(request)) return { authed: false, loginError: url.searchParams.get("error") };

  const today = todayIst();
  const yesterday = yesterdayIst();
  const calStart = shiftIso(today, -59);
  const dayParam = url.searchParams.get("day");

  // Custom range params
  const startParam = url.searchParams.get("start") ?? "";
  const endParam = url.searchParams.get("end") ?? "";
  const fxParam = url.searchParams.get("fx") ?? "";
  const b2bParam = url.searchParams.get("b2b") ?? "";

  const hasRange = startParam.length === 10 && endParam.length === 10 && startParam <= endParam;

  // Build all queries
  const baseQueries = Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE DATE(created_at + INTERVAL '5.5 hours') = ${today}::date`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE DATE(created_at + INTERVAL '5.5 hours') = ${yesterday}::date`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '7 days'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE created_at >= NOW() - INTERVAL '30 days'`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user"`),
    db.execute(sql`SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr, COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd FROM payment_orders WHERE status='paid' AND DATE(created_at + INTERVAL '5.5 hours') = ${today}::date`),
    db.execute(sql`SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr, COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd FROM payment_orders WHERE status='paid' AND DATE(created_at + INTERVAL '5.5 hours') = ${yesterday}::date`),
    db.execute(sql`SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr, COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd FROM payment_orders WHERE status='paid' AND created_at >= NOW() - INTERVAL '7 days'`),
    db.execute(sql`SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr, COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd FROM payment_orders WHERE status='paid' AND created_at >= NOW() - INTERVAL '30 days'`),
    db.execute(sql`SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr, COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd FROM payment_orders WHERE status='paid'`),
    db.execute(sql`SELECT DATE(created_at + INTERVAL '5.5 hours') AS day, COUNT(*)::int AS c FROM "user" WHERE DATE(created_at + INTERVAL '5.5 hours') >= ${calStart}::date GROUP BY day ORDER BY day DESC`),
    db.execute(sql`SELECT DATE(created_at + INTERVAL '5.5 hours') AS day, COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr, COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd, COUNT(*)::int AS orders FROM payment_orders WHERE status='paid' AND DATE(created_at + INTERVAL '5.5 hours') >= ${calStart}::date GROUP BY day ORDER BY day DESC`),
  ]);

  const rangeQuery = hasRange ? Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS c FROM "user" WHERE DATE(created_at + INTERVAL '5.5 hours') BETWEEN ${startParam}::date AND ${endParam}::date`),
    db.execute(sql`SELECT COALESCE(SUM(CASE WHEN currency='INR' THEN amount_cents END),0)::bigint AS inr, COALESCE(SUM(CASE WHEN currency<>'INR' THEN amount_cents END),0)::bigint AS usd FROM payment_orders WHERE status='paid' AND DATE(created_at + INTERVAL '5.5 hours') BETWEEN ${startParam}::date AND ${endParam}::date`),
  ]) : null;

  const [base, range] = await Promise.all([baseQueries, rangeQuery]);

  const [sToday, sYest, s7, s30, sAll,
    rToday, rYest, r7, r30, rAll,
    calSig, calRev] = base;

  const n = (r: { rows: { c?: number }[] }) => Number(r.rows[0]?.c ?? 0);
  const t = (r: { rows: { inr?: unknown; usd?: unknown }[] }, b2b: number) => mkTriple(r.rows[0]?.inr, r.rows[0]?.usd, b2b);

  const sigMap = new Map<string, number>();
  for (const row of calSig.rows as { day: string; c: number }[]) sigMap.set(String(row.day).slice(0, 10), Number(row.c));
  const revMap = new Map<string, { inr: number; usd: number; orders: number }>();
  for (const row of calRev.rows as { day: string; inr: unknown; usd: unknown; orders: number }[]) {
    revMap.set(String(row.day).slice(0, 10), { inr: cents(row.inr), usd: cents(row.usd), orders: Number(row.orders) });
  }
  const allDates = new Set([...sigMap.keys(), ...revMap.keys(), ...Object.keys(B2B_BY_DATE).filter(d => d >= calStart)]);
  const calendar: CalDay[] = Array.from(allDates).sort((a, b) => b.localeCompare(a)).map((date) => {
    const s = sigMap.get(date) ?? 0;
    const r = revMap.get(date) ?? { inr: 0, usd: 0, orders: 0 };
    const b2b = B2B_BY_DATE[date] ?? 0;
    const dbTotal = r.inr + r.usd * DEFAULT_FX;
    return { date, signups: s, orders: r.orders, inr: r.inr, usd: r.usd, b2b, total: dbTotal + b2b };
  });

  const b2bAll = Object.values(B2B_BY_DATE).reduce((s, v) => s + v, 0);

  // Custom range calculation
  let customRange: RangeStats | null = null;
  if (hasRange && range) {
    const [cSig, cRev] = range;
    const rangeFx = fxParam ? parseFloat(fxParam) : DEFAULT_FX;
    // b2b param: explicit number (including 0) overrides B2B_BY_DATE sum for the period
    const rangeB2b = b2bParam !== "" ? parseFloat(b2bParam) : b2bSum(startParam, endParam);
    const rangeSignups = Number(cSig.rows[0]?.c ?? 0);
    const rangeRev = mkTriple(cRev.rows[0]?.inr, cRev.rows[0]?.usd, rangeB2b, rangeFx);
    customRange = { start: startParam, end: endParam, fxRate: rangeFx, b2bTotal: rangeB2b, signups: rangeSignups, rev: rangeRev };
  }

  const stats: Stats = {
    fxRate: DEFAULT_FX, today, yesterday,
    rev: {
      today: t(rToday, b2bSum(today, today)),
      yesterday: t(rYest, b2bSum(yesterday, yesterday)),
      last7: t(r7, b2bSum(shiftIso(today, -6), today)),
      last30: t(r30, b2bSum(shiftIso(today, -29), today)),
      allTime: t(rAll, b2bAll),
    },
    signups: { today: n(sToday), yesterday: n(sYest), last7: n(s7), last30: n(s30), allTime: n(sAll) },
    calendar,
    selectedDay: dayParam ? (calendar.find(d => d.date === dayParam) ?? null) : null,
    customRange,
    filter: { start: startParam, end: endParam, fx: fxParam, b2b: b2bParam },
    generatedAt: new Date().toISOString(),
  };

  return { authed: true, stats };
}

// ─── Action ────────────────────────────────────────────────────────────────
export async function action({ request }: Route.ActionArgs) {
  const fd = await request.formData();
  if (String(fd.get("intent")) === "logout") return redirect("/msl", { headers: { "Set-Cookie": clearCookie() } });
  const u = String(fd.get("username") ?? ""), p = String(fd.get("password") ?? "");
  if (u !== USERNAME || p !== PASSWORD) return redirect("/msl?error=invalid");
  return redirect("/msl", { headers: { "Set-Cookie": buildCookie() } });
}

export function meta() {
  return [{ title: "MSL Dashboard" }, { name: "robots", content: "noindex,nofollow" }];
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function MslPage() {
  const data = useLoaderData<typeof loader>() as { authed: boolean; loginError?: string | null; stats?: Stats };
  if (!data.authed) return <LoginView error={data.loginError ?? null} />;
  return <DashboardView stats={data.stats!} />;
}

function LoginView({ error }: { error: string | null }) {
  return (
    <div className="min-h-screen bg-studojo-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm border-2 border-studojo-ink bg-white p-8 shadow-brutal">
        <h1 className="font-clash text-2xl font-bold text-studojo-ink">MSL</h1>
        <p className="mt-1 text-sm text-studojo-muted">Sign in to continue.</p>
        {error === "invalid" && (
          <div className="mt-4 border-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-800">Invalid credentials.</div>
        )}
        <Form method="post" className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-studojo-ink">Username</span>
            <input name="username" autoComplete="username" required
              className="mt-1 w-full border-2 border-studojo-ink bg-white px-3 py-2 text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-studojo-ink">Password</span>
            <input name="password" type="password" autoComplete="current-password" required
              className="mt-1 w-full border-2 border-studojo-ink bg-white px-3 py-2 text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple" />
          </label>
          <button type="submit"
            className="w-full border-2 border-studojo-ink bg-studojo-ink px-4 py-2 font-semibold text-white shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
            Sign in
          </button>
        </Form>
      </div>
    </div>
  );
}

const fmtInr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const fmtUsd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n: number) => n.toLocaleString("en-IN");

function DashboardView({ stats }: { stats: Stats }) {
  const generated = new Date(stats.generatedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="min-h-screen bg-studojo-surface">
      <header className="border-b-2 border-studojo-ink bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-clash text-2xl font-bold text-studojo-ink">MSL Dashboard</h1>
            <p className="text-xs text-studojo-muted">Live · {generated} · 1 USD = ₹{stats.fxRate}</p>
          </div>
          <Form method="post">
            <input type="hidden" name="intent" value="logout" />
            <button type="submit" className="border-2 border-studojo-ink bg-white px-3 py-1.5 text-sm font-medium text-studojo-ink hover:bg-studojo-ink hover:text-white">Sign out</button>
          </Form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        {/* DATE RANGE FILTER */}
        <RangeFilter filter={stats.filter} />

        {/* CUSTOM RANGE (shown when start+end set) */}
        {stats.customRange && <CustomRangeSection cr={stats.customRange} />}

        {/* HERO */}
        <Section title="Live snapshot">
          <div className="grid grid-cols-2 gap-4">
            <HeroTile dark label="Today's revenue" main={fmtInr(stats.rev.today.total)} sub={`${fmtInr(stats.rev.today.db)} DB${stats.rev.today.b2b ? ` + ${fmtInr(stats.rev.today.b2b)} B2B` : ""}`} />
            <HeroTile label="Today's signups" main={fmtInt(stats.signups.today)} sub={`7d: ${fmtInt(stats.signups.last7)} · 30d: ${fmtInt(stats.signups.last30)}`} />
            <HeroTile label="Yesterday's revenue" main={fmtInr(stats.rev.yesterday.total)} sub={`${fmtInr(stats.rev.yesterday.db)} DB${stats.rev.yesterday.b2b ? ` + ${fmtInr(stats.rev.yesterday.b2b)} B2B` : ""}`} />
            <HeroTile label="Yesterday's signups" main={fmtInt(stats.signups.yesterday)} sub={`All-time: ${fmtInt(stats.signups.allTime)}`} />
          </div>
        </Section>

        {/* REVENUE SUMMARY */}
        <Section title="Revenue summary">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <RevStat label="Today" t={stats.rev.today} />
            <RevStat label="Last 7 days" t={stats.rev.last7} />
            <RevStat label="Last 30 days" t={stats.rev.last30} />
            <div className="border-2 border-studojo-purple bg-white p-4 shadow-brutal">
              <div className="text-xs font-semibold uppercase tracking-wide text-studojo-muted">All-time (incl. B2B)</div>
              <div className="mt-1 font-clash text-2xl font-bold text-studojo-ink">{fmtInr(stats.rev.allTime.total)}</div>
              <div className="mt-1 text-[11px] text-studojo-muted">
                {fmtInr(stats.rev.allTime.inr)} + {fmtUsd(stats.rev.allTime.usd)}
                {stats.rev.allTime.b2b > 0 && <span className="ml-1 text-studojo-purple">+ {fmtInr(stats.rev.allTime.b2b)} B2B</span>}
              </div>
            </div>
          </div>
        </Section>

        {/* SIGNUPS */}
        <Section title="Signups">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Today" value={fmtInt(stats.signups.today)} />
            <Stat label="Last 7 days" value={fmtInt(stats.signups.last7)} />
            <Stat label="Last 30 days" value={fmtInt(stats.signups.last30)} />
            <Stat label="All-time" value={fmtInt(stats.signups.allTime)} />
          </div>
        </Section>

        {/* CALENDAR */}
        <Section title="Daily calendar — last 60 days">
          <p className="text-xs text-studojo-muted -mt-2">Click any row to expand.</p>
          {stats.selectedDay && (
            <div className="border-2 border-studojo-purple bg-white p-4 shadow-brutal">
              <div className="flex items-center justify-between mb-3">
                <span className="font-clash text-base font-bold text-studojo-ink">{stats.selectedDay.date}</span>
                <a href="/msl" className="text-xs text-studojo-muted underline">clear</a>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MiniStat label="Signups" value={fmtInt(stats.selectedDay.signups)} />
                <MiniStat label="Orders" value={fmtInt(stats.selectedDay.orders)} />
                <MiniStat label="INR (DB)" value={stats.selectedDay.inr ? fmtInr(stats.selectedDay.inr) : "—"} />
                <MiniStat label="USD (DB)" value={stats.selectedDay.usd ? fmtUsd(stats.selectedDay.usd) : "—"} />
                {stats.selectedDay.b2b > 0 && <MiniStat label="B2B" value={fmtInr(stats.selectedDay.b2b)} />}
                <MiniStat label="Total (₹)" value={stats.selectedDay.total ? fmtInr(stats.selectedDay.total) : "—"} />
              </div>
            </div>
          )}
          <CalendarGrid calendar={stats.calendar} selected={stats.selectedDay?.date ?? null} today={stats.today} yesterday={stats.yesterday} />
        </Section>
      </main>
    </div>
  );
}

function RangeFilter({ filter }: { filter: Stats["filter"] }) {
  const hasRange = filter.start && filter.end;
  return (
    <div className="border-2 border-studojo-ink bg-white p-5 shadow-brutal">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-clash text-base font-bold text-studojo-ink">Custom date range</h2>
        {hasRange && (
          <a href="/msl" className="text-xs text-studojo-muted underline hover:text-studojo-ink">Clear range</a>
        )}
      </div>
      <form method="get" action="/msl" className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">From</span>
          <input name="start" type="date" defaultValue={filter.start || ""}
            className="border-2 border-studojo-ink bg-white px-2 py-1.5 text-sm text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple" />
        </label>
        <label className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">To</span>
          <input name="end" type="date" defaultValue={filter.end || ""}
            className="border-2 border-studojo-ink bg-white px-2 py-1.5 text-sm text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple" />
        </label>
        <label className="flex flex-col gap-1 w-28">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">FX (₹/USD)</span>
          <input name="fx" type="number" step="0.1" min="1" placeholder={String(DEFAULT_FX)} defaultValue={filter.fx || ""}
            className="border-2 border-studojo-ink bg-white px-2 py-1.5 text-sm text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple" />
        </label>
        <label className="flex flex-col gap-1 w-36">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">B2B total (₹)</span>
          <input name="b2b" type="number" step="1" min="0" placeholder="Auto from log" defaultValue={filter.b2b || ""}
            className="border-2 border-studojo-ink bg-white px-2 py-1.5 text-sm text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple" />
        </label>
        <button type="submit"
          className="border-2 border-studojo-ink bg-studojo-ink px-4 py-1.5 text-sm font-semibold text-white shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
          Apply
        </button>
      </form>
      {!hasRange && (
        <p className="mt-3 text-xs text-studojo-muted">Set From + To to generate a range report. FX and B2B are optional overrides.</p>
      )}
    </div>
  );
}

function CustomRangeSection({ cr }: { cr: RangeStats }) {
  const label = `${cr.start} → ${cr.end}`;
  const days = Math.round((new Date(cr.end).getTime() - new Date(cr.start).getTime()) / 86400000) + 1;
  const avgRev = cr.signups > 0 ? cr.rev.total / cr.signups : 0;
  return (
    <section className="border-2 border-studojo-purple bg-white p-5 shadow-brutal">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-clash text-lg font-bold text-studojo-ink">Range report</h2>
          <p className="text-xs text-studojo-muted">{label} · {days} day{days !== 1 ? "s" : ""} · 1 USD = ₹{cr.fxRate}{cr.b2bTotal > 0 ? ` · B2B ₹${cr.b2bTotal.toLocaleString("en-IN")}` : ""}</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-studojo-purple border border-studojo-purple px-2 py-0.5">Custom range</span>
      </div>

      {/* Big numbers */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="border-2 border-studojo-ink bg-studojo-ink p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Total revenue</div>
          <div className="mt-1 font-clash text-3xl font-bold text-white">{fmtInr(cr.rev.total)}</div>
          <div className="mt-1 text-[10px] text-white/60">
            {fmtInr(cr.rev.db)} DB{cr.rev.b2b > 0 ? ` + ${fmtInr(cr.rev.b2b)} B2B` : ""}
          </div>
        </div>
        <div className="border-2 border-studojo-ink bg-white p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">Signups</div>
          <div className="mt-1 font-clash text-3xl font-bold text-studojo-ink">{fmtInt(cr.signups)}</div>
          <div className="mt-1 text-[10px] text-studojo-muted">{days > 0 ? `${(cr.signups / days).toFixed(1)}/day avg` : ""}</div>
        </div>
        <div className="border-2 border-studojo-ink bg-white p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">INR collected</div>
          <div className="mt-1 font-clash text-3xl font-bold text-studojo-ink">{fmtInr(cr.rev.inr)}</div>
          <div className="mt-1 text-[10px] text-studojo-muted">Direct INR payments</div>
        </div>
        <div className="border-2 border-studojo-ink bg-white p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">USD collected</div>
          <div className="mt-1 font-clash text-3xl font-bold text-studojo-ink">{fmtUsd(cr.rev.usd)}</div>
          <div className="mt-1 text-[10px] text-studojo-muted">= {fmtInr(cr.rev.usd * cr.fxRate)} at ₹{cr.fxRate}/USD</div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">Rev/day avg</div>
          <div className="mt-0.5 font-clash text-lg font-bold text-studojo-ink">{fmtInr(days > 0 ? cr.rev.total / days : 0)}</div>
        </div>
        <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">Rev/signup</div>
          <div className="mt-0.5 font-clash text-lg font-bold text-studojo-ink">{cr.signups > 0 ? fmtInr(avgRev) : "—"}</div>
        </div>
        <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">B2B included</div>
          <div className="mt-0.5 font-clash text-lg font-bold text-studojo-ink">{cr.b2bTotal > 0 ? fmtInr(cr.b2bTotal) : "None"}</div>
        </div>
      </div>
    </section>
  );
}

function CalendarGrid({ calendar, selected, today, yesterday }: { calendar: CalDay[]; selected: string | null; today: string; yesterday: string }) {
  const maxTotal = Math.max(1, ...calendar.map(d => d.total));
  return (
    <div className="border-2 border-studojo-ink bg-white overflow-hidden">
      <div className="grid grid-cols-6 bg-studojo-ink text-white text-xs font-semibold">
        <div className="px-3 py-2">Date</div>
        <div className="px-3 py-2 text-right">Signups</div>
        <div className="px-3 py-2 text-right">Orders</div>
        <div className="px-3 py-2 text-right">INR</div>
        <div className="px-3 py-2 text-right">B2B</div>
        <div className="px-3 py-2 text-right">Total (₹)</div>
      </div>
      {calendar.map((day) => {
        const isSelected = day.date === selected;
        const intensity = day.total > 0 ? Math.max(0.08, day.total / maxTotal) : 0;
        return (
          <a key={day.date} href={`/msl?day=${day.date}`}
            className={`grid grid-cols-6 border-t border-neutral-200 transition-colors ${isSelected ? "bg-studojo-purple/10 border-l-4 border-l-studojo-purple" : "hover:bg-neutral-50"}`}>
            <div className="px-3 py-2 flex items-center gap-2">
              {day.total > 0 && <div className="w-1.5 shrink-0 rounded-full bg-studojo-purple" style={{ height: "18px", opacity: intensity }} />}
              <span className="font-mono text-xs text-studojo-ink">
                {day.date}
                {day.date === today && <span className="ml-1 text-[9px] font-bold text-studojo-purple">TODAY</span>}
                {day.date === yesterday && <span className="ml-1 text-[9px] font-bold text-studojo-muted">YEST</span>}
              </span>
            </div>
            <div className="px-3 py-2 text-right text-sm">{fmtInt(day.signups)}</div>
            <div className="px-3 py-2 text-right text-sm">{fmtInt(day.orders)}</div>
            <div className="px-3 py-2 text-right text-sm">{day.inr ? fmtInr(day.inr) : "—"}</div>
            <div className="px-3 py-2 text-right text-sm">{day.b2b ? <span className="text-studojo-purple font-medium">{fmtInr(day.b2b)}</span> : "—"}</div>
            <div className="px-3 py-2 text-right text-sm font-semibold">{day.total ? fmtInr(day.total) : "—"}</div>
          </a>
        );
      })}
    </div>
  );
}

function HeroTile({ label, dark, main, sub }: { label: string; dark?: boolean; main: string; sub: string }) {
  return (
    <div className={`border-2 border-studojo-ink p-5 shadow-brutal ${dark ? "bg-studojo-ink" : "bg-white"}`}>
      <div className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-white/60" : "text-studojo-muted"}`}>{label}</div>
      <div className={`mt-1 font-clash text-4xl font-bold ${dark ? "text-white" : "text-studojo-ink"}`}>{main}</div>
      <div className={`mt-1 text-xs ${dark ? "text-white/60" : "text-studojo-muted"}`}>{sub}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-clash text-lg font-bold text-studojo-ink mb-3">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-studojo-ink bg-white p-4 shadow-brutal">
      <div className="text-xs font-semibold uppercase tracking-wide text-studojo-muted">{label}</div>
      <div className="mt-1 font-clash text-2xl font-bold text-studojo-ink">{value}</div>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">{label}</div>
      <div className="mt-0.5 font-clash text-lg font-bold text-studojo-ink">{value}</div>
    </div>
  );
}
function RevStat({ label, t }: { label: string; t: Triple }) {
  return (
    <div className="border-2 border-studojo-ink bg-white p-4 shadow-brutal">
      <div className="text-xs font-semibold uppercase tracking-wide text-studojo-muted">{label}</div>
      <div className="mt-1 font-clash text-2xl font-bold text-studojo-ink">{fmtInr(t.total)}</div>
      <div className="mt-1 text-[11px] text-studojo-muted">
        {fmtInr(t.inr)} + {fmtUsd(t.usd)}
        {t.b2b > 0 && <span className="ml-1 text-studojo-purple">+{fmtInr(t.b2b)}</span>}
      </div>
    </div>
  );
}
