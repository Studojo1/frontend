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
  const stats = await getMslStats();
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
  if (!verifyCredentials(username, password)) {
    return redirect("/msl?error=invalid");
  }
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
            <input
              name="username"
              autoComplete="username"
              required
              className="mt-1 w-full border-2 border-studojo-ink bg-white px-3 py-2 text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-studojo-ink">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full border-2 border-studojo-ink bg-white px-3 py-2 text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
          </label>
          <button
            type="submit"
            className="w-full border-2 border-studojo-ink bg-studojo-ink px-4 py-2 font-semibold text-white shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            Sign in
          </button>
        </Form>
      </div>
    </div>
  );
}

function fmtInr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
function fmtUsd(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
function fmtInt(n: number) {
  return n.toLocaleString("en-IN");
}

function DashboardView({ stats }: { stats: MslStats }) {
  const generated = new Date(stats.generatedAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-studojo-surface">
      <header className="border-b-2 border-studojo-ink bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-clash text-2xl font-bold text-studojo-ink">MSL Dashboard</h1>
            <p className="text-xs text-studojo-muted">Live numbers from production · updated {generated}</p>
          </div>
          <Form method="post">
            <input type="hidden" name="intent" value="logout" />
            <button
              type="submit"
              className="border-2 border-studojo-ink bg-white px-3 py-1.5 text-sm font-medium text-studojo-ink hover:bg-studojo-ink hover:text-white"
            >
              Sign out
            </button>
          </Form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        <Section title="Signups">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Today" value={fmtInt(stats.signups.today)} />
            <Stat label="Last 7 days" value={fmtInt(stats.signups.last7)} />
            <Stat label="Last 30 days" value={fmtInt(stats.signups.last30)} />
            <Stat label="All time" value={fmtInt(stats.signups.allTime)} />
          </div>
          <BarChart
            data={stats.signups.daily.map((d) => ({ day: d.day, value: d.count }))}
            label="Signups per day (last 30)"
          />
        </Section>

        <Section title="Revenue (paid orders only)">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Today (INR)" value={fmtInr(stats.revenue.todayInr)} />
            <Stat label="Today (USD)" value={fmtUsd(stats.revenue.todayUsd)} />
            <Stat label="Last 30d (INR)" value={fmtInr(stats.revenue.last30Inr)} />
            <Stat label="Last 30d (USD)" value={fmtUsd(stats.revenue.last30Usd)} />
            <Stat label="Last 7d (INR)" value={fmtInr(stats.revenue.last7Inr)} />
            <Stat label="Last 7d (USD)" value={fmtUsd(stats.revenue.last7Usd)} />
            <Stat label="All time (INR)" value={fmtInr(stats.revenue.allTimeInr)} />
            <Stat label="All time (USD)" value={fmtUsd(stats.revenue.allTimeUsd)} />
          </div>
          <BarChart
            data={stats.revenue.daily.map((d) => ({
              day: d.day,
              value: d.amount_inr + d.amount_usd * 83,
            }))}
            label="Revenue per day (last 30, INR equivalent)"
            valueFormatter={(v) => fmtInr(v)}
          />
        </Section>

        <Section title="Paid users">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Distinct paid users (all time)" value={fmtInt(stats.paidUsers.total)} />
            <Stat label="Distinct paid users (last 30d)" value={fmtInt(stats.paidUsers.last30)} />
          </div>
        </Section>

        <Section title="Daily breakdown — last 30 days">
          <div className="overflow-x-auto border-2 border-studojo-ink bg-white">
            <table className="w-full text-sm">
              <thead className="bg-studojo-ink text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Day</th>
                  <th className="px-3 py-2 text-right font-semibold">Signups</th>
                  <th className="px-3 py-2 text-right font-semibold">Orders</th>
                  <th className="px-3 py-2 text-right font-semibold">INR</th>
                  <th className="px-3 py-2 text-right font-semibold">USD</th>
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

function BarChart({
  data,
  label,
  valueFormatter,
}: {
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
        <div className="flex h-32 items-end gap-1">
          {data.map((d) => {
            const h = (d.value / max) * 100;
            const fmt = valueFormatter ? valueFormatter(d.value) : fmtInt(d.value);
            return (
              <div key={d.day} className="group relative flex-1" title={`${d.day}: ${fmt}`}>
                <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-studojo-ink px-2 py-0.5 text-[10px] text-white group-hover:block">
                  {d.day}: {fmt}
                </div>
                <div
                  className="w-full bg-studojo-purple"
                  style={{ height: `${Math.max(2, h)}%` }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function mergeDaily(stats: MslStats) {
  const map = new Map<string, { day: string; signups: number; orders: number; inr: number; usd: number }>();
  for (const s of stats.signups.daily) {
    map.set(s.day, { day: s.day, signups: s.count, orders: 0, inr: 0, usd: 0 });
  }
  for (const r of stats.revenue.daily) {
    const row = map.get(r.day) ?? { day: r.day, signups: 0, orders: 0, inr: 0, usd: 0 };
    row.orders = r.orders;
    row.inr = r.amount_inr;
    row.usd = r.amount_usd;
    map.set(r.day, row);
  }
  return Array.from(map.values()).sort((a, b) => (a.day < b.day ? 1 : -1));
}
