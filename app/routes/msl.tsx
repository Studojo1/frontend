import { Form, redirect, useLoaderData } from "react-router";
import {
  buildSessionCookie,
  clearSessionCookie,
  getMslStats,
  isAuthed,
  verifyCredentials,
  type MslStats,
} from "~/lib/msl.server";
import type { Route } from "./+types/msl";

export function meta() {
  return [{ title: "MSL Dashboard" }, { name: "robots", content: "noindex,nofollow" }];
}

interface LoaderData {
  authed: boolean;
  loginError?: string | null;
  stats?: MslStats;
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const url = new URL(request.url);
  if (!isAuthed(request)) {
    return { authed: false, loginError: url.searchParams.get("error") };
  }
  const stats = await getMslStats({
    start: url.searchParams.get("start"),
    end: url.searchParams.get("end"),
    fx: url.searchParams.get("fx"),
    b2b: url.searchParams.get("b2b"),
  });
  return { authed: true, stats };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "login");
  if (intent === "logout") {
    return redirect("/msl", { headers: { "Set-Cookie": clearSessionCookie() } });
  }
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!verifyCredentials(username, password)) return redirect("/msl?error=invalid");
  return redirect("/msl", { headers: { "Set-Cookie": buildSessionCookie() } });
}

export default function MslPage() {
  const data = useLoaderData<typeof loader>() as LoaderData;
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
          <div className="mt-4 border-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-800">
            Invalid username or password.
          </div>
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
const fmtUsd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const fmtInt = (n: number) => n.toLocaleString("en-IN");

function isoDaysAgo(days: number): string {
  const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function presetHref(start: string, end: string, fxRate: number, b2b: number) {
  return `?${new URLSearchParams({ start, end, fx: String(fxRate), b2b: String(b2b) })}`;
}

function DashboardView({ stats }: { stats: MslStats }) {
  const generated = new Date(stats.generatedAt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
  const todayIso = isoDaysAgo(0);

  // All-time total including B2B
  const allTimeTotal = stats.revenue.allTime.totalInr + stats.b2bInr;
  // Today total including B2B (B2B is shown as a manual add-on, not date-scoped)
  const todayTotal = stats.revenue.today.totalInr;

  return (
    <div className="min-h-screen bg-studojo-surface">
      <header className="border-b-2 border-studojo-ink bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-clash text-2xl font-bold text-studojo-ink">MSL Dashboard</h1>
            <p className="text-xs text-studojo-muted">Live numbers · updated {generated}</p>
          </div>
          <Form method="post">
            <input type="hidden" name="intent" value="logout" />
            <button type="submit"
              className="border-2 border-studojo-ink bg-white px-3 py-1.5 text-sm font-medium text-studojo-ink hover:bg-studojo-ink hover:text-white">
              Sign out
            </button>
          </Form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">

        {/* TODAY HERO */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="col-span-2 border-2 border-studojo-ink bg-studojo-ink p-5 shadow-brutal md:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Today's revenue (Razorpay/Dodo)</div>
            <div className="mt-1 font-clash text-4xl font-bold text-white">{fmtInr(todayTotal)}</div>
            <div className="mt-1 text-xs text-white/60">{fmtInr(stats.revenue.today.inr)} INR + {fmtUsd(stats.revenue.today.usd)} USD</div>
          </div>
          <div className="col-span-2 border-2 border-studojo-ink bg-white p-5 shadow-brutal md:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-studojo-muted">Today's signups</div>
            <div className="mt-1 font-clash text-4xl font-bold text-studojo-ink">{fmtInt(stats.signups.today)}</div>
            <div className="mt-1 text-xs text-studojo-muted">7d: {fmtInt(stats.signups.last7)} · 30d: {fmtInt(stats.signups.last30)}</div>
          </div>
        </div>

        <FilterBar stats={stats} todayIso={todayIso} />

        {/* FIXED BUCKETS */}
        <Section title="Revenue summary">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <RevStat label="Today" t={stats.revenue.today} />
            <RevStat label="Last 7 days" t={stats.revenue.last7} />
            <RevStat label="Last 30 days" t={stats.revenue.last30} />
            <div className="border-2 border-studojo-purple bg-white p-4 shadow-brutal">
              <div className="text-xs font-semibold uppercase tracking-wide text-studojo-muted">All-time (incl. B2B)</div>
              <div className="mt-1 font-clash text-2xl font-bold text-studojo-ink">{fmtInr(allTimeTotal)}</div>
              <div className="mt-1 text-[11px] text-studojo-muted">
                DB: {fmtInr(stats.revenue.allTime.totalInr)}
                {stats.b2bInr > 0 && <span className="ml-1 text-studojo-purple">+ {fmtInr(stats.b2bInr)} B2B</span>}
              </div>
            </div>
          </div>
        </Section>

        {/* RANGE SECTION */}
        <Section
          title={`Range: ${stats.range.start} → ${stats.range.end}`}
          subtitle={`FX: 1 USD = ₹${stats.fxRate}`}
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Stat label="Signups in range" value={fmtInt(stats.signups.range)} />
            <RevStat label="Revenue in range" t={stats.revenue.range} />
            <Stat
              label="Avg revenue / day"
              value={fmtInr(stats.revenue.range.totalInr / Math.max(1, stats.revenue.daily.length))}
            />
          </div>

          <BarChart
            data={stats.signups.daily.map((d) => ({ day: d.day, value: d.count }))}
            label="Signups per day"
          />
          <BarChart
            data={stats.revenue.daily.map((d) => ({ day: d.day, value: d.amount_total_inr }))}
            label="Revenue per day (INR equivalent)"
            valueFormatter={fmtInr}
          />
        </Section>

        {/* DAILY TABLE */}
        <Section title="Daily breakdown — selected range">
          <div className="overflow-x-auto border-2 border-studojo-ink bg-white">
            <table className="w-full text-sm">
              <thead className="bg-studojo-ink text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Day</th>
                  <th className="px-3 py-2 text-right font-semibold">Signups</th>
                  <th className="px-3 py-2 text-right font-semibold">Orders</th>
                  <th className="px-3 py-2 text-right font-semibold">INR</th>
                  <th className="px-3 py-2 text-right font-semibold">USD</th>
                  <th className="px-3 py-2 text-right font-semibold">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {mergeDaily(stats).map((row) => (
                  <tr key={row.day} className="border-t border-neutral-200">
                    <td className="px-3 py-2 font-mono text-studojo-ink">{row.day}</td>
                    <td className="px-3 py-2 text-right">{fmtInt(row.signups)}</td>
                    <td className="px-3 py-2 text-right">{fmtInt(row.orders)}</td>
                    <td className="px-3 py-2 text-right">{row.inr ? fmtInr(row.inr) : "—"}</td>
                    <td className="px-3 py-2 text-right">{row.usd ? fmtUsd(row.usd) : "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold">{row.totalInr ? fmtInr(row.totalInr) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </main>
    </div>
  );
}

function FilterBar({ stats, todayIso }: { stats: MslStats; todayIso: string }) {
  const presets = [
    { label: "7d", start: isoDaysAgo(6), end: todayIso },
    { label: "30d", start: isoDaysAgo(29), end: todayIso },
    { label: "90d", start: isoDaysAgo(89), end: todayIso },
    { label: "YTD", start: `${new Date().getUTCFullYear()}-01-01`, end: todayIso },
  ];
  return (
    <div className="border-2 border-studojo-ink bg-white p-4 shadow-brutal">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-studojo-muted">Filters</div>
      <Form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">Start</span>
          <input type="date" name="start" defaultValue={stats.range.start} max={stats.range.end}
            className="border-2 border-studojo-ink bg-white px-2 py-1.5 text-sm text-studojo-ink" />
        </label>
        <label className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">End</span>
          <input type="date" name="end" defaultValue={stats.range.end} max={todayIso}
            className="border-2 border-studojo-ink bg-white px-2 py-1.5 text-sm text-studojo-ink" />
        </label>
        <label className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studojo-muted">USD → INR</span>
          <input type="number" name="fx" step="0.01" min="1" defaultValue={stats.fxRate}
            className="w-24 border-2 border-studojo-ink bg-white px-2 py-1.5 text-sm text-studojo-ink" />
        </label>
        <label className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studojo-purple">B2B revenue (₹)</span>
          <input type="number" name="b2b" step="1" min="0" defaultValue={stats.b2bInr || ""}
            placeholder="e.g. 17550"
            className="w-32 border-2 border-studojo-purple bg-white px-2 py-1.5 text-sm text-studojo-ink placeholder:text-neutral-400" />
        </label>
        <button type="submit"
          className="border-2 border-studojo-ink bg-studojo-ink px-4 py-1.5 text-sm font-semibold text-white shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
          Update
        </button>
        <div className="ml-auto flex flex-wrap items-end gap-2">
          {presets.map((p) => (
            <a key={p.label} href={presetHref(p.start, p.end, stats.fxRate, stats.b2bInr)}
              className="border-2 border-studojo-ink bg-white px-3 py-1.5 text-xs font-semibold text-studojo-ink hover:bg-studojo-ink hover:text-white">
              {p.label}
            </a>
          ))}
        </div>
      </Form>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-clash text-lg font-bold text-studojo-ink">{title}</h2>
        {subtitle && <span className="text-xs text-studojo-muted">{subtitle}</span>}
      </div>
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

function RevStat({ label, t }: { label: string; t: { inr: number; usd: number; totalInr: number } }) {
  return (
    <div className="border-2 border-studojo-ink bg-white p-4 shadow-brutal">
      <div className="text-xs font-semibold uppercase tracking-wide text-studojo-muted">{label}</div>
      <div className="mt-1 font-clash text-2xl font-bold text-studojo-ink">{fmtInr(t.totalInr)}</div>
      <div className="mt-1 text-[11px] text-studojo-muted">{fmtInr(t.inr)} + {fmtUsd(t.usd)}</div>
    </div>
  );
}

function BarChart({ data, label, valueFormatter }: {
  data: { day: string; value: number }[];
  label: string;
  valueFormatter?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="border-2 border-studojo-ink bg-white p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-studojo-muted">{label}</div>
      {data.length === 0 ? (
        <div className="text-sm text-studojo-muted">No data in range.</div>
      ) : (
        <div className="flex h-40 items-end gap-1">
          {data.map((d) => {
            const h = (d.value / max) * 100;
            const fmt = valueFormatter ? valueFormatter(d.value) : fmtInt(d.value);
            return (
              <div key={d.day} className="group relative flex h-full flex-1 items-end" title={`${d.day}: ${fmt}`}>
                <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-studojo-ink px-2 py-0.5 text-[10px] text-white group-hover:block">
                  {d.day}: {fmt}
                </div>
                <div className="w-full bg-studojo-purple" style={{ height: `${Math.max(2, h)}%`, minHeight: "2px" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function mergeDaily(stats: MslStats) {
  const map = new Map<string, { day: string; signups: number; orders: number; inr: number; usd: number; totalInr: number }>();
  for (const s of stats.signups.daily) {
    map.set(s.day, { day: s.day, signups: s.count, orders: 0, inr: 0, usd: 0, totalInr: 0 });
  }
  for (const r of stats.revenue.daily) {
    const row = map.get(r.day) ?? { day: r.day, signups: 0, orders: 0, inr: 0, usd: 0, totalInr: 0 };
    row.orders = r.orders;
    row.inr = r.amount_inr;
    row.usd = r.amount_usd;
    row.totalInr = r.amount_total_inr;
    map.set(r.day, row);
  }
  return Array.from(map.values()).sort((a, b) => (a.day < b.day ? 1 : -1));
}
