import { Form, redirect, useLoaderData, useSearchParams } from "react-router";
import {
  buildSessionCookie,
  clearSessionCookie,
  getMslStats,
  isAuthed,
  todayIst,
  yesterdayIst,
  verifyCredentials,
  type CalendarDay,
  type MslStats,
  type RevenueTriple,
} from "~/lib/msl.server";
import type { Route } from "./+types/msl";

export function meta() {
  return [{ title: "MSL Dashboard" }, { name: "robots", content: "noindex,nofollow" }];
}

interface LoaderData { authed: boolean; loginError?: string | null; stats?: MslStats }

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const url = new URL(request.url);
  if (!isAuthed(request)) return { authed: false, loginError: url.searchParams.get("error") };
  const stats = await getMslStats();
  return { authed: true, stats };
}

export async function action({ request }: Route.ActionArgs) {
  const fd = await request.formData();
  const intent = String(fd.get("intent") ?? "login");
  if (intent === "logout") return redirect("/msl", { headers: { "Set-Cookie": clearSessionCookie() } });
  const u = String(fd.get("username") ?? ""), p = String(fd.get("password") ?? "");
  if (!verifyCredentials(u, p)) return redirect("/msl?error=invalid");
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
const fmtUsd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const fmtInt = (n: number) => n.toLocaleString("en-IN");

function DashboardView({ stats }: { stats: MslStats }) {
  const [params] = useSearchParams();
  const selected = params.get("day") ?? null;

  const generated = new Date(stats.generatedAt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  const selectedDay = selected ? stats.calendar.find((d) => d.date === selected) ?? null : null;

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
            <button type="submit"
              className="border-2 border-studojo-ink bg-white px-3 py-1.5 text-sm font-medium text-studojo-ink hover:bg-studojo-ink hover:text-white">
              Sign out
            </button>
          </Form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">

        {/* TODAY / YESTERDAY HERO */}
        <div className="grid grid-cols-2 gap-4">
          <HeroTile
            label="Today's revenue"
            dark
            main={fmtInr(stats.rev.today.total)}
            sub={`${fmtInr(stats.rev.today.db)} DB${stats.rev.today.b2b ? ` + ${fmtInr(stats.rev.today.b2b)} B2B` : ""}`}
          />
          <HeroTile
            label="Today's signups"
            main={fmtInt(stats.signups.today)}
            sub={`7d: ${fmtInt(stats.signups.last7)} · 30d: ${fmtInt(stats.signups.last30)}`}
          />
          <HeroTile
            label="Yesterday's revenue"
            main={fmtInr(stats.rev.yesterday.total)}
            sub={`${fmtInr(stats.rev.yesterday.db)} DB${stats.rev.yesterday.b2b ? ` + ${fmtInr(stats.rev.yesterday.b2b)} B2B` : ""}`}
          />
          <HeroTile
            label="Yesterday's signups"
            main={fmtInt(stats.signups.yesterday)}
            sub={`All-time: ${fmtInt(stats.signups.allTime)}`}
          />
        </div>

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
          <p className="text-xs text-studojo-muted -mt-2">Click any day to see the breakdown.</p>

          {selectedDay && (
            <div className="border-2 border-studojo-purple bg-white p-4 shadow-brutal">
              <div className="flex items-center justify-between mb-3">
                <span className="font-clash text-base font-bold text-studojo-ink">{selectedDay.date}</span>
                <a href="/msl" className="text-xs text-studojo-muted underline">clear</a>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MiniStat label="Signups" value={fmtInt(selectedDay.signups)} />
                <MiniStat label="Orders" value={fmtInt(selectedDay.orders)} />
                <MiniStat label="INR (DB)" value={selectedDay.inr ? fmtInr(selectedDay.inr) : "—"} />
                <MiniStat label="USD (DB)" value={selectedDay.usd ? fmtUsd(selectedDay.usd) : "—"} />
                {selectedDay.b2b > 0 && <MiniStat label="B2B" value={fmtInr(selectedDay.b2b)} />}
                <MiniStat label="Total (₹)" value={selectedDay.total ? fmtInr(selectedDay.total) : "—"} />
              </div>
            </div>
          )}

          <CalendarGrid calendar={stats.calendar} selected={selected} today={stats.today} yesterday={stats.yesterday} />
        </Section>
      </main>
    </div>
  );
}

function CalendarGrid({ calendar, selected, today, yesterday }: {
  calendar: CalendarDay[]; selected: string | null; today: string; yesterday: string;
}) {
  // Group into weeks (rows) for a grid layout
  // We show last 60 days as a list with visual heat
  const maxTotal = Math.max(1, ...calendar.map((d) => d.total));

  return (
    <div className="border-2 border-studojo-ink bg-white overflow-hidden">
      {/* Header */}
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
        const isToday = day.date === today;
        const isYesterday = day.date === yesterday;
        const intensity = day.total > 0 ? Math.max(0.07, day.total / maxTotal) : 0;

        return (
          <a
            key={day.date}
            href={`/msl?day=${day.date}`}
            className={[
              "grid grid-cols-6 border-t border-neutral-200 transition-colors",
              isSelected ? "bg-studojo-purple/10 border-l-4 border-l-studojo-purple" : "hover:bg-neutral-50",
            ].join(" ")}
          >
            {/* Revenue heat strip on left */}
            <div className="px-3 py-2 flex items-center gap-2">
              {day.total > 0 && (
                <div
                  className="w-1.5 shrink-0 rounded-full bg-studojo-purple"
                  style={{ height: "20px", opacity: intensity }}
                />
              )}
              <span className="font-mono text-xs text-studojo-ink">
                {day.date}
                {isToday && <span className="ml-1 text-[10px] text-studojo-purple font-bold">TODAY</span>}
                {isYesterday && <span className="ml-1 text-[10px] text-studojo-muted font-bold">YEST</span>}
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
    <div className={`border-2 border-studojo-ink p-5 shadow-brutal ${dark ? "bg-studojo-ink text-white" : "bg-white"}`}>
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

function RevStat({ label, t }: { label: string; t: RevenueTriple }) {
  return (
    <div className="border-2 border-studojo-ink bg-white p-4 shadow-brutal">
      <div className="text-xs font-semibold uppercase tracking-wide text-studojo-muted">{label}</div>
      <div className="mt-1 font-clash text-2xl font-bold text-studojo-ink">{fmtInr(t.total)}</div>
      <div className="mt-1 text-[11px] text-studojo-muted">
        {fmtInr(t.inr)} + {fmtUsd(t.usd)}
        {t.b2b > 0 && <span className="ml-1 text-studojo-purple">+{fmtInr(t.b2b)} B2B</span>}
      </div>
    </div>
  );
}
