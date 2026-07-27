import { type ReactNode } from "react";
import { Form, Link, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/apidashboard";
import { auth } from "~/lib/auth";
import { Header, Footer } from "~/components";
import { isApiBuilder, createKey, revokeKey, usageDashboard } from "~/lib/api-keys.server";

export function meta(_: Route.MetaArgs) {
  return [{ title: "API Dashboard — Studojo" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  const u = session?.user as { id: string; email: string; role?: string | null } | undefined;
  const user = u ? { id: u.id, email: u.email, role: u.role ?? null } : null;
  const allowed = isApiBuilder(user?.email, user?.role);
  const data = allowed && user ? await usageDashboard(user.email) : null;
  return { user, allowed, data };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  const u = session?.user as { id: string; email: string; role?: string | null } | undefined;
  if (!u || !isApiBuilder(u.email, u.role)) return { error: "Not enabled for API access." };
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "create") {
    const name = String(form.get("name") || "API key").slice(0, 60);
    const { plaintext } = await createKey(u.email, u.id, name);
    return { createdKey: plaintext };
  }
  if (intent === "revoke") {
    await revokeKey(u.email, String(form.get("id")));
    return { revoked: true };
  }
  return {};
}

const CARD = "border-2 border-neutral-900 rounded-2xl bg-white shadow-[5px_5px_0_0_#171717]";
const fmt = (n: number) => n.toLocaleString();

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={`${CARD} p-5`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-studojo-muted">{label}</div>
      <div className="text-3xl font-bold mt-1 tracking-tight">{value}</div>
      {sub && <div className="text-xs text-studojo-muted mt-1">{sub}</div>}
    </div>
  );
}

function Chart({ months }: { months: { month: string; credits: number }[] }) {
  const max = Math.max(1, ...months.map((m) => m.credits));
  return (
    <div className={`${CARD} p-5`}>
      <div className="font-bold mb-4">Credits used by month</div>
      {months.length === 0 ? (
        <p className="text-sm text-studojo-muted">No usage yet.</p>
      ) : (
        <div className="flex items-end gap-3 h-40">
          {months.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-2">
              <div className="text-xs font-semibold tabular-nums">{m.credits}</div>
              <div
                className="w-full rounded-t-md bg-studojo-purple border-2 border-neutral-900"
                style={{ height: `${Math.max(4, (m.credits / max) * 120)}px` }}
              />
              <div className="text-[11px] text-studojo-muted">{m.month.slice(5)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApiDashboard() {
  const { user, allowed, data } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as
    | { error?: string; createdKey?: string; revoked?: boolean }
    | undefined;

  const shell = (inner: ReactNode) => (
    <div className="min-h-screen bg-white text-studojo-ink font-satoshi">
      <Header />
      <div className="max-w-5xl mx-auto px-5 pt-12 pb-24">{inner}</div>
      <Footer />
    </div>
  );

  if (!user) {
    return shell(
      <div className={`${CARD} p-6 max-w-lg`}>
        <h1 className="text-xl font-bold mb-1">API Dashboard</h1>
        <p className="text-studojo-muted mb-4">Sign in to see your API usage.</p>
        <Link
          to="/auth?mode=signin"
          className="inline-block bg-studojo-purple text-white font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717]"
        >
          Sign in
        </Link>
      </div>,
    );
  }
  if (!allowed || !data) {
    return shell(
      <div className={`${CARD} p-6 max-w-lg`}>
        <h1 className="text-xl font-bold mb-1">Access pending</h1>
        <p className="text-studojo-muted">
          {user.email} is not enabled for API access yet. Email{" "}
          <a className="text-studojo-purple font-semibold" href="mailto:admin@studojo.com">
            admin@studojo.com
          </a>
          .
        </p>
      </div>,
    );
  }

  const { keys, months, summary } = data;
  return shell(
    <>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-studojo-purple">
            Contact Enrichment API
          </span>
          <h1 className="font-clash text-3xl font-bold tracking-tight mt-1">API Dashboard</h1>
          <p className="text-studojo-muted text-sm mt-1">{user.email}</p>
        </div>
        <Link to="/apidocs" className="text-sm font-bold text-studojo-purple hover:underline">
          API docs →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tile label="Requests this month" value={fmt(summary.requestsMonth)} />
        <Tile
          label="Credits used"
          value={fmt(summary.creditsMonth)}
          sub={`of ${fmt(summary.quotaTotal)} / month`}
        />
        <Tile label="Active keys" value={fmt(summary.activeKeys)} />
        <Tile
          label="Remaining"
          value={fmt(Math.max(0, summary.quotaTotal - summary.creditsMonth))}
          sub="this month"
        />
      </div>

      <div className="mb-8">
        <Chart months={months} />
      </div>

      {actionData?.createdKey && (
        <div className="mb-6 rounded-xl border-2 border-studojo-purple bg-studojo-purple-bg p-4">
          <p className="text-sm font-bold mb-2">Copy your new key now — you will not see it again.</p>
          <div className="font-mono text-sm break-all bg-white border border-neutral-300 rounded-lg p-2">
            {actionData.createdKey}
          </div>
        </div>
      )}

      <h2 className="font-clash text-xl font-bold mb-3">Keys &amp; usage</h2>
      <div className="space-y-3 mb-6">
        {keys.length === 0 && <p className="text-studojo-muted text-sm">No keys yet.</p>}
        {keys.map((k) => {
          const pct = k.monthly_quota ? Math.min(100, Math.round((k.creditsMonth / k.monthly_quota) * 100)) : 0;
          return (
            <div key={k.id} className={`${CARD} p-5`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-bold">
                    {k.name}{" "}
                    <span className="font-mono text-sm text-studojo-muted">
                      {k.key_prefix}…{k.last_four}
                    </span>
                    {!k.active && (
                      <span className="ml-2 text-xs font-bold text-red-600 uppercase">revoked</span>
                    )}
                  </div>
                  <div className="text-xs text-studojo-muted mt-0.5">
                    Created {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at ? " · last used " + new Date(k.last_used_at).toLocaleDateString() : " · never used"}
                  </div>
                </div>
                {k.active && (
                  <Form method="post">
                    <input type="hidden" name="intent" value="revoke" />
                    <input type="hidden" name="id" value={k.id} />
                    <button className="text-sm font-semibold text-red-600 border border-red-300 rounded-lg px-3 py-1.5">
                      Revoke
                    </button>
                  </Form>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <div className="text-xs text-studojo-muted uppercase tracking-wide">Requests (mo)</div>
                  <div className="font-bold text-lg tabular-nums">{fmt(k.requestsMonth)}</div>
                </div>
                <div>
                  <div className="text-xs text-studojo-muted uppercase tracking-wide">Credits (mo)</div>
                  <div className="font-bold text-lg tabular-nums">{fmt(k.creditsMonth)}</div>
                </div>
                <div>
                  <div className="text-xs text-studojo-muted uppercase tracking-wide">Requests (all time)</div>
                  <div className="font-bold text-lg tabular-nums">{fmt(k.request_count)}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-studojo-muted mb-1">
                  <span>{fmt(k.creditsMonth)} used</span>
                  <span>{fmt(k.remaining)} left of {fmt(k.monthly_quota)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-studojo-surface-muted border border-neutral-300 overflow-hidden">
                  <div
                    className={`h-full ${pct >= 90 ? "bg-red-500" : "bg-studojo-purple"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Form method="post" className="flex flex-col sm:flex-row gap-2 max-w-lg">
        <input type="hidden" name="intent" value="create" />
        <input
          name="name"
          placeholder="New key name (e.g. Production)"
          maxLength={60}
          className="flex-1 border-2 border-neutral-900 rounded-xl px-3 py-2.5"
        />
        <button className="bg-studojo-purple text-white font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717]">
          Create key
        </button>
      </Form>
      {actionData?.error && <p className="text-sm text-red-600 font-semibold mt-2">{actionData.error}</p>}
    </>,
  );
}
