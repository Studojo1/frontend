import { useState } from "react";
import { Form, Link, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/apidocs";
import { auth } from "~/lib/auth";
import { Header, Footer } from "~/components";
import {
  isApiBuilder,
  listKeys,
  createKey,
  revokeKey,
  type ApiKeyRow,
} from "~/lib/api-keys.server";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Contact Enrichment API — Studojo" },
    {
      name: "description",
      content:
        "Turn a LinkedIn profile into a verified work email, personal email and mobile number. One call, verified results, billed only when we return a contact.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  const u = session?.user as
    | { id: string; email: string; name?: string; role?: string | null }
    | undefined;
  const user = u ? { id: u.id, email: u.email, name: u.name ?? "", role: u.role ?? null } : null;
  const allowed = isApiBuilder(user?.email, user?.role);
  const keys: ApiKeyRow[] = allowed && user ? await listKeys(user.email) : [];
  return { user, allowed, keys };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  const u = session?.user as { id: string; email: string; role?: string | null } | undefined;
  if (!u) return { error: "Please sign in first." };
  if (!isApiBuilder(u.email, u.role)) {
    return { error: "Your account is not enabled for API access yet." };
  }
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "create") {
    const name = String(form.get("name") || "API key").slice(0, 60);
    const { plaintext, lastFour } = await createKey(u.email, u.id, name);
    return { createdKey: plaintext, lastFour };
  }
  if (intent === "revoke") {
    await revokeKey(u.email, String(form.get("id")));
    return { revoked: true };
  }
  return {};
}

// ── Small presentational helpers ─────────────────────────────────────────────
const CARD =
  "border-2 border-neutral-900 rounded-2xl bg-white shadow-[5px_5px_0_0_#171717]";

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <button
        onClick={() => {
          navigator.clipboard?.writeText(children);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-md border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-400 transition"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto rounded-xl border-2 border-neutral-900 bg-[#171717] text-neutral-100 text-[13px] leading-relaxed p-4">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Pill({ method }: { method: string }) {
  const color =
    method === "POST" ? "bg-studojo-green text-neutral-900" : "bg-studojo-purple text-white";
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${color}`}>
      {method}
    </span>
  );
}

// ── The access / key-management panel ────────────────────────────────────────
function AccessPanel() {
  const { user, allowed, keys } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as
    | { error?: string; createdKey?: string; lastFour?: string; revoked?: boolean }
    | undefined;

  if (!user) {
    return (
      <div className={`${CARD} p-6`}>
        <h3 className="text-lg font-bold mb-1">Get an API key</h3>
        <p className="text-studojo-muted mb-4">
          Sign in to your Studojo account to manage keys. API access is granted per email.
        </p>
        <Link
          to="/auth?mode=signin"
          className="inline-block bg-studojo-purple text-white font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className={`${CARD} p-6`}>
        <h3 className="text-lg font-bold mb-1">Access pending</h3>
        <p className="text-studojo-muted">
          You are signed in as <span className="font-semibold">{user.email}</span>, but this
          account is not enabled for API access yet. API keys are issued to approved accounts
          only. Email{" "}
          <a className="text-studojo-purple font-semibold" href="mailto:admin@studojo.com">
            admin@studojo.com
          </a>{" "}
          to request access.
        </p>
      </div>
    );
  }

  return (
    <div className={`${CARD} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Your API keys</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-studojo-green-bg text-studojo-green">
          Access enabled
        </span>
      </div>

      {actionData?.error && (
        <p className="mb-4 text-sm text-red-600 font-semibold">{actionData?.error}</p>
      )}

      {actionData?.createdKey && (
        <div className="mb-5 rounded-xl border-2 border-studojo-purple bg-studojo-purple-bg p-4">
          <p className="text-sm font-bold text-neutral-900 mb-2">
            Copy your key now. You will not be able to see it again.
          </p>
          <Code>{actionData?.createdKey || ""}</Code>
        </div>
      )}

      {keys.length === 0 && !actionData?.createdKey && (
        <p className="text-studojo-muted mb-4">No keys yet. Create your first one below.</p>
      )}

      {keys.length > 0 && (
        <div className="mb-5 divide-y divide-neutral-200">
          {keys.map((k) => {
            const revoked = !!k.revoked_at;
            return (
              <div key={k.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {k.name}{" "}
                    <span className="font-mono text-studojo-muted text-sm">
                      {k.key_prefix}…{k.last_four}
                    </span>
                  </div>
                  <div className="text-xs text-studojo-muted">
                    {revoked ? "Revoked" : "Active"} · {k.request_count} requests
                    {k.last_used_at ? " · last used " + new Date(k.last_used_at).toLocaleDateString() : ""}
                  </div>
                </div>
                {!revoked && (
                  <Form method="post">
                    <input type="hidden" name="intent" value="revoke" />
                    <input type="hidden" name="id" value={k.id} />
                    <button
                      className="text-sm font-semibold text-red-600 hover:text-red-700 border border-red-300 rounded-lg px-3 py-1.5"
                      type="submit"
                    >
                      Revoke
                    </button>
                  </Form>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Form method="post" className="flex flex-col sm:flex-row gap-2">
        <input type="hidden" name="intent" value="create" />
        <input
          name="name"
          placeholder="Key name (e.g. Production)"
          maxLength={60}
          className="flex-1 border-2 border-neutral-900 rounded-xl px-3 py-2.5"
        />
        <button
          type="submit"
          className="bg-studojo-purple text-white font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition"
        >
          Create key
        </button>
      </Form>
      <p className="text-xs text-studojo-muted mt-3">
        Keep keys server-side. Anyone with a key can spend your enrichment credits.
      </p>
    </div>
  );
}

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-white text-studojo-ink font-satoshi">
      <Header />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-14 pb-8">
        <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-studojo-purple-bg text-studojo-purple border-2 border-studojo-purple mb-5">
          Developer API
        </span>
        <h1 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
          Contact Enrichment API
        </h1>
        <p className="mt-4 text-lg text-studojo-muted max-w-2xl">
          Send a LinkedIn profile, get back a verified work email, personal email and mobile
          number. One call, results in seconds, and you are billed only when a verified contact
          comes back.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#quickstart" className="font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition bg-white">
            Quickstart
          </a>
          <a href="#access" className="font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition bg-studojo-purple text-white">
            Get a key
          </a>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 pb-24 grid lg:grid-cols-[1fr_360px] gap-10">
        {/* Docs column */}
        <div className="space-y-12 order-2 lg:order-1">
          {/* Base + auth */}
          <section id="quickstart">
            <h2 className="font-clash text-2xl font-bold mb-3">Quickstart</h2>
            <p className="text-studojo-muted mb-3">
              The base URL is <span className="font-mono text-studojo-ink">https://studojo.com/api</span>.
              Authenticate every request with a bearer token, your API key.
            </p>
            <Code>{`curl https://studojo.com/api/enrich \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "linkedin_url": "https://www.linkedin.com/in/janedoe",
    "fields": ["email", "phone"]
  }'`}</Code>
          </section>

          {/* How it works */}
          <section>
            <h2 className="font-clash text-2xl font-bold mb-3">How it works</h2>
            <p className="text-studojo-muted mb-4">
              You send a LinkedIn profile, the Studojo engine returns the contact. Every email is
              verified (MX + SMTP) and every mobile is checked for line type, so you get a real
              cell number and not a switchboard. If a field cannot be verified we leave it out
              rather than guess, and you are billed only when we return a verified contact, never
              on a miss.
            </p>
            <div className={`${CARD} p-5`}>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">1</span>
                  <span><span className="font-semibold">Match.</span> We identify the person from the profile and pull their work and personal email.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">2</span>
                  <span><span className="font-semibold">Mobile.</span> We locate a direct mobile number and verify its line type.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">3</span>
                  <span><span className="font-semibold">Return.</span> Every field comes back with a confidence score and the exact list of what was found.</span>
                </li>
              </ol>
            </div>
          </section>

          {/* Response time */}
          <section id="response-time">
            <h2 className="font-clash text-2xl font-bold mb-3">Response time</h2>
            <p className="text-studojo-muted mb-4">
              A single call is synchronous, the full contact is in the response body. Large lists
              run through the bulk endpoint, which is asynchronous so a slow lookup never blocks
              the rest.
            </p>
            <div className={`${CARD} overflow-hidden`}>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="p-3 font-semibold whitespace-nowrap align-top">POST /api/enrich</td>
                    <td className="p-3 text-studojo-muted">
                      Usually <span className="font-semibold text-studojo-ink">5 to 15 seconds</span>,
                      with a hard <span className="font-semibold text-studojo-ink">20 second</span> timeout.
                      The verified email and mobile are returned in the same response.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold whitespace-nowrap align-top">POST /api/enrich/bulk</td>
                    <td className="p-3 text-studojo-muted">
                      Returns a <span className="font-mono">job_id</span> in
                      {" "}<span className="font-semibold text-studojo-ink">under 1 second</span>. A
                      job of 500 profiles finishes within a few minutes, and each profile is
                      readable the moment it resolves.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How bulk works */}
          <section id="bulk">
            <h2 className="font-clash text-2xl font-bold mb-3">How the bulk API works</h2>
            <p className="text-studojo-muted mb-4">
              Use bulk for anything over a handful of profiles. You never hold a connection open
              waiting, you submit and poll.
            </p>
            <div className={`${CARD} p-5 mb-4`}>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">1</span>
                  <span><span className="font-semibold">Submit</span> up to 500 LinkedIn URLs to <span className="font-mono text-sm">/api/enrich/bulk</span>. You get a <span className="font-mono text-sm">job_id</span> back immediately.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">2</span>
                  <span><span className="font-semibold">Poll</span> <span className="font-mono text-sm">/api/jobs/{"{job_id}"}</span> every few seconds. Each profile appears in <span className="font-mono text-sm">results</span> the moment it is done, so you can process the list as it fills in.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">3</span>
                  <span><span className="font-semibold">Finish</span> when <span className="font-mono text-sm">status</span> is <span className="font-mono text-sm">completed</span>. You are billed only for the profiles that returned a verified contact.</span>
                </li>
              </ol>
            </div>
            <Code>{`# 1. submit
curl https://studojo.com/api/enrich/bulk \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ "profiles": ["https://www.linkedin.com/in/a",
                     "https://www.linkedin.com/in/b"] }'
# → { "job_id": "job_a1b2c3", "status": "processing", "count": 2 }

# 2. poll until completed
curl https://studojo.com/api/jobs/job_a1b2c3 \\
  -H "Authorization: Bearer sk_live_your_key_here"
# → { "status": "completed",
#     "processed": 2, "total": 2,
#     "results": [ /* one enrich object per profile */ ] }`}</Code>
          </section>

          {/* Endpoints */}
          <section id="endpoints">
            <h2 className="font-clash text-2xl font-bold mb-4">Endpoints</h2>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill method="POST" />
                  <span className="font-mono text-sm">/api/enrich</span>
                </div>
                <p className="text-studojo-muted mb-2 text-sm">Enrich a single person. Pass a <span className="font-mono">linkedin_url</span>, or <span className="font-mono">first_name</span> + <span className="font-mono">last_name</span> + <span className="font-mono">company</span> (or <span className="font-mono">domain</span>). Synchronous, the full contact is in the response body, usually in 5 to 15 seconds.</p>
                <Code>{`{
  "linkedin_url": "https://www.linkedin.com/in/janedoe",
  "fields": ["email", "phone"]     // optional, defaults to both
}`}</Code>
                <p className="text-sm font-semibold mt-3 mb-1">200 OK</p>
                <Code>{`{
  "status": "ok",
  "person":  { "name": "Jane Doe", "title": "Head of Growth",
               "linkedin_url": "https://www.linkedin.com/in/janedoe" },
  "emails":  { "work": "jane@acme.com", "personal": "jane.doe@gmail.com" },
  "phone":   { "number": "+9198XXXXXX21", "type": "mobile", "verified": true },
  "confidence": 0.92,
  "found": ["work_email", "personal_email", "mobile"],
  "credits_used": 1
}`}</Code>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill method="POST" />
                  <span className="font-mono text-sm">/api/enrich/bulk</span>
                </div>
                <p className="text-studojo-muted mb-2 text-sm">Submit up to 500 profiles. Returns a job you poll.</p>
                <Code>{`{ "profiles": ["https://www.linkedin.com/in/a", "https://www.linkedin.com/in/b"] }
// → { "job_id": "job_a1b2c3", "status": "processing", "count": 2 }`}</Code>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill method="GET" />
                  <span className="font-mono text-sm">/api/jobs/{"{job_id}"}</span>
                </div>
                <p className="text-studojo-muted mb-2 text-sm">Poll a bulk job. Results stream in as each profile resolves.</p>
                <Code>{`{ "status": "completed", "results": [ /* one enrich object per profile */ ] }`}</Code>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill method="POST" />
                  <span className="font-mono text-sm">/api/verify/email</span>
                </div>
                <p className="text-studojo-muted mb-2 text-sm">Validate an email (syntax + MX + SMTP). Free, no reveal.</p>
                <Code>{`{ "email": "jane@acme.com" }
// → { "email": "jane@acme.com", "valid": true, "catch_all": false }`}</Code>
              </div>
            </div>
          </section>

          {/* Errors */}
          <section>
            <h2 className="font-clash text-2xl font-bold mb-3">Errors &amp; status</h2>
            <div className={`${CARD} overflow-hidden`}>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-neutral-200">
                  {[
                    ["200 · status \"ok\"", "Contact resolved."],
                    ["200 · status \"not_found\"", "No verified contact for this profile. Not billed."],
                    ["401 invalid_api_key", "Missing, malformed, or revoked key."],
                    ["402 out_of_credits", "Enrichment credits exhausted."],
                    ["422 bad_request", "Not a valid LinkedIn profile URL."],
                    ["429 rate_limited", "Too many requests. Back off and retry."],
                  ].map(([code, desc]) => (
                    <tr key={code}>
                      <td className="p-3 font-mono text-xs whitespace-nowrap align-top">{code}</td>
                      <td className="p-3 text-studojo-muted">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-studojo-muted text-sm mt-4">
              Rate limit: 60 requests/minute per key on single enrich, bulk up to 500 profiles per
              job. Every request is idempotent by LinkedIn URL, so retries never double-bill.
            </p>
          </section>
        </div>

        {/* Sticky access panel */}
        <aside id="access" className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <AccessPanel />
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
