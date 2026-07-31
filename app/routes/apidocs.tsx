import { useState, type ReactNode } from "react";
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
    { title: "Contact Enrichment API â Studojo" },
    {
      name: "description",
      content:
        "Turn a LinkedIn profile (or a name + company) into a verified work email, personal email and mobile number. One call, verified results, billed only when we return a contact.",
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

// ââ shared bits âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const CARD = "border-2 border-neutral-900 rounded-2xl bg-white shadow-[5px_5px_0_0_#171717]";
type Lang = "curl" | "python" | "node";
const LANGS: { id: Lang; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "python", label: "Python" },
  { id: "node", label: "Node" },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="text-xs font-semibold px-2 py-1 rounded-md border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-400 transition"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Code({ children }: { children: string }) {
  return (
    <div className="relative">
      <div className="absolute top-2.5 right-2.5">
        <CopyBtn text={children} />
      </div>
      <pre className="overflow-x-auto rounded-xl border-2 border-neutral-900 bg-[#171717] text-neutral-100 text-[13px] leading-relaxed p-4">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/** Code block with cURL / Python / Node tabs, driven by a shared language state. */
function CodeSample({
  samples,
  lang,
  setLang,
}: {
  samples: Partial<Record<Lang, string>>;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const active = samples[lang] ?? samples.curl ?? Object.values(samples)[0] ?? "";
  const available = LANGS.filter((l) => samples[l.id]);
  return (
    <div className="rounded-xl border-2 border-neutral-900 overflow-hidden bg-[#171717]">
      <div className="flex items-center justify-between bg-[#0f0f0f] border-b border-neutral-800 px-2">
        <div className="flex">
          {available.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`px-3 py-2 text-xs font-semibold transition ${
                lang === l.id
                  ? "text-white border-b-2 border-studojo-purple"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <CopyBtn text={active} />
      </div>
      <pre className="overflow-x-auto text-neutral-100 text-[13px] leading-relaxed p-4">
        <code>{active}</code>
      </pre>
    </div>
  );
}

function Method({ m }: { m: string }) {
  const c = m === "POST" ? "bg-studojo-green text-neutral-900" : "bg-studojo-purple text-white";
  return <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${c}`}>{m}</span>;
}

function Endpoint({ m, path }: { m: string; path: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Method m={m} />
      <span className="font-mono text-sm text-studojo-ink">{path}</span>
    </div>
  );
}

type Param = [name: string, type: string, req: "required" | "optional", desc: string];
function Params({ rows }: { rows: Param[] }) {
  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="bg-studojo-surface-muted text-left">
              <th className="p-2.5 font-semibold">Field</th>
              <th className="p-2.5 font-semibold">Type</th>
              <th className="p-2.5 font-semibold"> </th>
              <th className="p-2.5 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map(([n, t, r, d]) => (
              <tr key={n} className="align-top">
                <td className="p-2.5 font-mono text-[13px] whitespace-nowrap">{n}</td>
                <td className="p-2.5 font-mono text-xs text-studojo-muted whitespace-nowrap">{t}</td>
                <td className="p-2.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      r === "required" ? "text-red-600" : "text-studojo-muted"
                    }`}
                  >
                    {r}
                  </span>
                </td>
                <td className="p-2.5 text-studojo-muted">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-clash text-2xl font-bold mb-4 tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

const NAV = [
  ["introduction", "Introduction"],
  ["endpoints", "Endpoints"],
  ["authentication", "Authentication"],
  ["keys", "Your API keys"],
  ["quickstart", "Quickstart"],
  ["enrich", "Enrich a person"],
  ["phone-verification", "Phone verification"],
  ["bulk", "Bulk enrichment"],
  ["response", "Response object"],
  ["errors", "Errors"],
  ["limits", "Rate limits & credits"],
];

// ââ access / key-management panel ââââââââââââââââââââââââââââââââââââââââââââââ
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
          Sign in to your Studojo account to create and manage keys. Access is granted per email.
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
          account is not enabled for API access yet. Email{" "}
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

      {actionData?.error && <p className="mb-4 text-sm text-red-600 font-semibold">{actionData?.error}</p>}

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
                      {k.key_prefix}â¦{k.last_four}
                    </span>
                  </div>
                  <div className="text-xs text-studojo-muted">
                    {revoked ? "Revoked" : "Active"} Â· {k.request_count} requests
                    {k.last_used_at ? " Â· last used " + new Date(k.last_used_at).toLocaleDateString() : ""}
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

// ââ page ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function ApiDocs() {
  const [lang, setLang] = useState<Lang>("curl");
  const s = (samples: Partial<Record<Lang, string>>) => (
    <CodeSample samples={samples} lang={lang} setLang={setLang} />
  );

  return (
    <div className="min-h-screen bg-white text-studojo-ink font-satoshi">
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-8">
        <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-studojo-purple-bg text-studojo-purple border-2 border-studojo-purple mb-5">
          Developer API Â· v1
        </span>
        <h1 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
          Contact Enrichment API
        </h1>
        <p className="mt-4 text-lg text-studojo-muted max-w-2xl">
          Send a LinkedIn profile, or a name and company, and get back a verified work email,
          personal email and mobile number. One call, results in seconds, billed only when a
          verified contact comes back.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-sm font-mono bg-studojo-surface-muted border border-neutral-300 rounded-lg px-3 py-1.5">
          <span className="text-studojo-muted">Base URL</span>
          <span className="text-studojo-ink">https://studojo.com/api</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#quickstart" className="font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition bg-white">
            Quickstart
          </a>
          <a href="#keys" className="font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition bg-studojo-purple text-white">
            Get your API key
          </a>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 pb-24 grid lg:grid-cols-[200px_1fr] gap-10">
        {/* Sticky nav */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 text-sm space-y-1">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="block px-3 py-1.5 rounded-lg text-studojo-muted hover:text-studojo-ink hover:bg-studojo-surface-muted transition"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-14 min-w-0">
          <Section id="introduction" title="Introduction">
            <p className="text-studojo-muted mb-3">
              The Contact Enrichment API resolves a person to their verified contact details. You
              send an identity, we return the work email, personal email and direct mobile we can
              confirm. Every email is checked (MX + SMTP) and every mobile is checked for line type,
              so you get a real cell number and not a switchboard. If a field cannot be verified we
              leave it out rather than guess.
            </p>
            <p className="text-studojo-muted">
              You are billed only when we return a verified contact, never on a miss. The same
              identity requested twice inside a month is served from cache and not charged again.
            </p>
          </Section>

          <Section id="endpoints" title="Endpoints">
            <p className="text-studojo-muted mb-4">Three endpoints, all enrichment. Send an identity, get verified contact details back.</p>
            <div className={`${CARD} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <tbody className="divide-y divide-neutral-200">
                    {[
                      ["POST", "/api/enrich", "Enrich one person by LinkedIn URL, or name + company."],
                      ["POST", "/api/enrich/bulk", "Submit up to 500 people as a single batch job."],
                      ["GET", "/api/jobs/{job_id}", "Poll a bulk job and read results as they complete."],
                    ].map(([m, p, d]) => (
                      <tr key={p} className="align-top">
                        <td className="p-3"><Method m={m} /></td>
                        <td className="p-3 font-mono text-[13px] whitespace-nowrap">{p}</td>
                        <td className="p-3 text-studojo-muted">{d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          <Section id="authentication" title="Authentication">
            <p className="text-studojo-muted mb-4">
              Every request is authenticated with your API key as a bearer token. Keep it
              server-side, never in browser or mobile code.
            </p>
            <Code>{`Authorization: Bearer sk_live_your_key_here`}</Code>
          </Section>

          <Section id="keys" title="Your API keys">
            <div className="mb-3 text-sm"><Link to="/apidashboard" className="font-bold text-studojo-purple hover:underline">View usage dashboard →</Link></div>
            <AccessPanel />
          </Section>

          <Section id="quickstart" title="Quickstart">
            <p className="text-studojo-muted mb-4">
              Enrich your first person. Replace the key with your own, then run:
            </p>
            {s({
              curl: `curl https://studojo.com/api/enrich \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ "linkedin_url": "https://www.linkedin.com/in/janedoe" }'`,
              python: `import requests

res = requests.post(
    "https://studojo.com/api/enrich",
    headers={"Authorization": "Bearer sk_live_your_key_here"},
    json={"linkedin_url": "https://www.linkedin.com/in/janedoe"},
)
print(res.json())`,
              node: `const res = await fetch("https://studojo.com/api/enrich", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ linkedin_url: "https://www.linkedin.com/in/janedoe" }),
});
console.log(await res.json());`,
            })}
          </Section>

          <Section id="enrich" title="Enrich a person">
            <Endpoint m="POST" path="/api/enrich" />
            <p className="text-studojo-muted my-3">
              Enrich one person. Identify them by a LinkedIn URL, or by name + company. The full
              contact returns in the response body, usually in 5 to 15 seconds.
            </p>
            <Params
              rows={[
                ["linkedin_url", "string", "optional", "LinkedIn profile URL. Highest match rate; use this when you have it."],
                ["first_name", "string", "optional", "Required if no linkedin_url."],
                ["last_name", "string", "optional", "Required if no linkedin_url."],
                ["company", "string", "optional", "Company name. Provide with first/last name."],
                ["domain", "string", "optional", "Company domain, e.g. acme.com. Can be used instead of company."],
                ["fields", "string[]", "optional", 'Any of ["email","phone"]. Defaults to both.'],
              ]}
            />
            <p className="text-sm font-semibold mt-5 mb-2">Request â by LinkedIn URL</p>
            {s({
              curl: `curl https://studojo.com/api/enrich \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "linkedin_url": "https://www.linkedin.com/in/janedoe",
    "fields": ["email", "phone"]
  }'`,
              python: `res = requests.post(
    "https://studojo.com/api/enrich",
    headers={"Authorization": "Bearer sk_live_your_key_here"},
    json={
        "linkedin_url": "https://www.linkedin.com/in/janedoe",
        "fields": ["email", "phone"],
    },
)`,
              node: `await fetch("https://studojo.com/api/enrich", {
  method: "POST",
  headers: { Authorization: "Bearer sk_live_your_key_here", "Content-Type": "application/json" },
  body: JSON.stringify({
    linkedin_url: "https://www.linkedin.com/in/janedoe",
    fields: ["email", "phone"],
  }),
});`,
            })}
            <p className="text-sm font-semibold mt-5 mb-2">Request â by name + company</p>
            {s({
              curl: `curl https://studojo.com/api/enrich \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "company": "Acme",
    "fields": ["phone"]
  }'`,
              python: `res = requests.post(
    "https://studojo.com/api/enrich",
    headers={"Authorization": "Bearer sk_live_your_key_here"},
    json={"first_name": "Jane", "last_name": "Doe", "company": "Acme", "fields": ["phone"]},
)`,
              node: `await fetch("https://studojo.com/api/enrich", {
  method: "POST",
  headers: { Authorization: "Bearer sk_live_your_key_here", "Content-Type": "application/json" },
  body: JSON.stringify({ first_name: "Jane", last_name: "Doe", company: "Acme", fields: ["phone"] }),
});`,
            })}
            <p className="text-sm font-semibold mt-5 mb-2">Response Â· 200</p>
            <Code>{`{
  "status": "ok",
  "person":  { "name": "Jane Doe", "title": "Head of Growth",
               "linkedin_url": "https://www.linkedin.com/in/janedoe" },
  "emails":  { "work": "jane@acme.com", "personal": "jane.doe@gmail.com" },
  "phone":   { "number": "+9198XXXXXX21", "line_type": "mobile", "verified": true },
  "confidence": 0.92,
  "found": ["work_email", "personal_email", "mobile"],
  "credits_used": 1
}`}</Code>
            <p className="text-studojo-muted text-sm mt-3">
              A profile we cannot resolve returns <span className="font-mono">status: "not_found"</span> with
              empty fields and <span className="font-mono">credits_used: 0</span>, you are not charged.
            </p>
          </Section>

          <Section id="phone-verification" title="Phone verification">
            <p className="text-studojo-muted mb-4">
              The API only ever returns a <strong>personal mobile</strong>. Office landlines,
              switchboards, toll-free and VOIP lines are rejected. Every candidate number is put
              through the verifier below, and you only ever receive a number once it passes as a
              genuine personal mobile.
            </p>
            <div className={`${CARD} p-5 mb-4`}>
              <div className="font-bold mb-3">The verifier, step by step</div>
              <ol className="space-y-2.5 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">1</span>
                  <span><span className="font-semibold">Present &amp; valid.</span> No number, or not a valid phone number → rejected.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">2</span>
                  <span><span className="font-semibold">Line type.</span> The number is classified (mobile vs fixed-line / toll-free / VOIP). Anything that is not a mobile is rejected as an office / landline number.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">3</span>
                  <span><span className="font-semibold">Work label.</span> If a number is tagged "Work" or "Office", it is rejected even when it is mobile-shaped, so you only get personal numbers.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">4</span>
                  <span><span className="font-semibold">No verified mobile.</span> If we cannot confirm a personal mobile, <span className="font-mono">phone</span> is <span className="font-mono">null</span> (the emails are still returned).</span>
                </li>
              </ol>
            </div>
            <p className="text-sm font-semibold mb-2">Example: an office landline is rejected, the personal mobile is kept</p>
            <Code>{`rejected   +91 44 2499 8199    office / landline
accepted   +9198XXXXXX21       personal mobile   →  returned as "phone"`}</Code>
          </Section>

          <Section id="bulk" title="Bulk enrichment">
            <p className="text-studojo-muted mb-4">
              For more than a handful of people, submit a batch and poll for results. You never hold
              a connection open waiting â the job resolves on its own and each person appears the
              moment they are done.
            </p>
            <div className={`${CARD} p-5 mb-5`}>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">1</span>
                  <span>
                    <span className="font-semibold">Submit</span> up to 500 people to{" "}
                    <span className="font-mono">/api/enrich/bulk</span>. Get a{" "}
                    <span className="font-mono">job_id</span> back immediately.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">2</span>
                  <span>
                    <span className="font-semibold">Poll</span>{" "}
                    <span className="font-mono">/api/jobs/{"{job_id}"}</span> every few seconds. Read{" "}
                    <span className="font-mono">results</span> as it fills in.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-studojo-purple">3</span>
                  <span>
                    <span className="font-semibold">Done</span> when{" "}
                    <span className="font-mono">status</span> is{" "}
                    <span className="font-mono">completed</span>. Billed only for people who returned
                    a verified contact.
                  </span>
                </li>
              </ol>
            </div>
            <p className="text-sm font-semibold mb-2">1. Submit</p>
            {s({
              curl: `curl https://studojo.com/api/enrich/bulk \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "profiles": [
      "https://www.linkedin.com/in/a",
      { "first_name": "Jane", "last_name": "Doe", "company": "Acme" }
    ],
    "fields": ["email", "phone"]
  }'
# -> { "job_id": "job_a1b2c3", "status": "processing", "count": 2 }`,
              python: `res = requests.post(
    "https://studojo.com/api/enrich/bulk",
    headers={"Authorization": "Bearer sk_live_your_key_here"},
    json={
        "profiles": [
            "https://www.linkedin.com/in/a",
            {"first_name": "Jane", "last_name": "Doe", "company": "Acme"},
        ],
        "fields": ["email", "phone"],
    },
)
job_id = res.json()["job_id"]`,
              node: `const res = await fetch("https://studojo.com/api/enrich/bulk", {
  method: "POST",
  headers: { Authorization: "Bearer sk_live_your_key_here", "Content-Type": "application/json" },
  body: JSON.stringify({
    profiles: ["https://www.linkedin.com/in/a", { first_name: "Jane", last_name: "Doe", company: "Acme" }],
    fields: ["email", "phone"],
  }),
});
const { job_id } = await res.json();`,
            })}
            <p className="text-sm font-semibold mt-5 mb-2">2. Poll</p>
            {s({
              curl: `curl https://studojo.com/api/jobs/job_a1b2c3 \\
  -H "Authorization: Bearer sk_live_your_key_here"
# -> { "status": "completed", "processed": 2, "total": 2,
#      "results": [ /* one enrich object per person */ ] }`,
              python: `import time
while True:
    job = requests.get(
        f"https://studojo.com/api/jobs/{job_id}",
        headers={"Authorization": "Bearer sk_live_your_key_here"},
    ).json()
    if job["status"] == "completed":
        break
    time.sleep(5)
print(job["results"])`,
              node: `let job;
do {
  await new Promise((r) => setTimeout(r, 5000));
  job = await (await fetch(\`https://studojo.com/api/jobs/\${job_id}\`, {
    headers: { Authorization: "Bearer sk_live_your_key_here" },
  })).json();
} while (job.status !== "completed");
console.log(job.results);`,
            })}
          </Section>

          <Section id="response" title="Response object">
            <p className="text-studojo-muted mb-4">Every enrich result has this shape:</p>
            <Params
              rows={[
                ["status", "string", "required", '"ok" when a contact was resolved, "not_found" otherwise.'],
                ["person.name", "string | null", "optional", "Full name."],
                ["person.title", "string | null", "optional", "Current job title."],
                ["person.linkedin_url", "string", "optional", "Resolved LinkedIn URL (even if you searched by name)."],
                ["emails.work", "string | null", "optional", "Verified work email."],
                ["emails.personal", "string | null", "optional", "Personal / direct email."],
                ["phone.number", "string", "optional", "Verified personal mobile in E.164 (null if none found)."],
                ["phone.line_type", "string", "optional", '"mobile" (office/landline numbers are never returned here).'],
                ["phone.verified", "boolean", "optional", "True once a number passes phone verification."],
                ["confidence", "number", "required", "0 to 1 across the resolved fields."],
                ["found", "string[]", "required", 'Which fields were found: "work_email", "personal_email", "mobile".'],
                ["credits_used", "number", "required", "Credits charged for this result. 0 on a miss or cache hit."],
              ]}
            />
          </Section>

          <Section id="errors" title="Errors">
            <div className={`${CARD} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[420px]">
                  <tbody className="divide-y divide-neutral-200">
                    {[
                      ['200 Â· "ok"', "Contact resolved."],
                      ['200 Â· "not_found"', "No verified contact. Not billed."],
                      ["401 invalid_api_key", "Missing, malformed, or revoked key."],
                      ["402 out_of_credits", "Monthly quota exhausted."],
                      ["422 bad_request", "No valid identity in the body (need a URL, or name + company)."],
                      ["429 rate_limited", "Over 60 requests/minute. Back off and retry."],
                    ].map(([c, d]) => (
                      <tr key={c} className="align-top">
                        <td className="p-3 font-mono text-xs whitespace-nowrap">{c}</td>
                        <td className="p-3 text-studojo-muted">{d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          <Section id="limits" title="Rate limits & credits">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ["Rate limit", "60 requests per minute per key on single enrich. Bulk accepts up to 500 people per job."],
                ["Billed on results only", "A credit is spent only when a verified contact is returned. Misses are free."],
                ["Idempotent", "The same identity within a month is served from cache and never re-billed. Retries are safe."],
                ["Headers", "Every response carries X-RateLimit-Limit, X-RateLimit-Remaining and X-RateLimit-Reset."],
              ].map(([t, d]) => (
                <div key={t} className={`${CARD} p-5`}>
                  <div className="font-bold mb-1">{t}</div>
                  <div className="text-sm text-studojo-muted">{d}</div>
                </div>
              ))}
            </div>
            <p className="text-studojo-muted text-sm mt-5">
              Need a higher limit or a volume plan? Email{" "}
              <a className="text-studojo-purple font-semibold" href="mailto:admin@studojo.com">
                admin@studojo.com
              </a>
              .
            </p>
          </Section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
