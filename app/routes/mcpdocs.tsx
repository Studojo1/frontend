import { useState, type ReactNode } from "react";
import type { Route } from "./+types/mcpdocs";
import { Header, Footer } from "~/components";

// FROZEN, public documentation page for the hosted Sensei MCP server — no auth, no
// loader/action, no per-user data. Keys are created + managed on /apidashboard. Mirrors
// the /apidocs house style (neo-brutalist cards, cURL/JSON tabs).

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sensei MCP - Studojo" },
    {
      name: "description",
      content:
        "Connect any MCP client to Sensei. Run hiring searches (companies + roles + contacts) and enrich LinkedIn profiles into verified emails and mobiles, straight from Claude, Cursor or your own agent.",
    },
  ];
}

// ── shared bits (self-contained; mirrors apidocs.tsx) ────────────────────────────────
const CARD = "border-2 border-neutral-900 rounded-2xl bg-white shadow-[5px_5px_0_0_#171717]";
type Lang = "json" | "curl" | "node";
const LANGS: { id: Lang; label: string }[] = [
  { id: "json", label: "Config" },
  { id: "curl", label: "cURL" },
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

function CodeSample({
  samples,
  lang,
  setLang,
}: {
  samples: Partial<Record<Lang, string>>;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const active = samples[lang] ?? Object.values(samples)[0] ?? "";
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

function Tool({ name, args, children }: { name: string; args: string; children: ReactNode }) {
  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-studojo-green text-neutral-900 font-mono">
          {name}
        </span>
        <span className="font-mono text-xs text-studojo-muted">{args}</span>
      </div>
      <p className="text-studojo-muted text-sm mt-2">{children}</p>
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

const NAV: [string, string][] = [
  ["introduction", "Introduction"],
  ["connect", "Connect a client"],
  ["auth", "Authentication"],
  ["tools", "Tools"],
  ["search-flow", "Running a search"],
  ["clarify", "Clarifying questions"],
  ["contacts", "Getting contacts"],
  ["enrich-flow", "Enriching anyone"],
  ["isolation", "Isolation & credits"],
  ["raw", "Raw JSON-RPC"],
  ["errors", "Errors"],
];

const CONNECT_JSON = `{
  "mcpServers": {
    "sensei": {
      "url": "https://studojo.com/api/mcp",
      "headers": {
        "Authorization": "Bearer sk_live_your_key_here"
      }
    }
  }
}`;

const SEARCH_FLOW = `# 1) start a search -> a run_id comes back immediately
sensei_search({ "query": "business analyst roles at funded startups in Bangalore, 0-2 years" })
# -> { "run_id": 8412, "chat_id": 320, "status": "running" }

# 2) poll every 20-30s (a run takes a few minutes)
sensei_status({ "run_id": 8412 })
# -> { "status": "running", "counters": { "found": 34, "kept": 12 } }
# -> ... eventually -> { "status": "done", "done": true }

# 3) read the companies. NOTE: contacts are blank at this point
sensei_results({ "run_id": 8412 })
# -> { "count": 22, "tables": [ { "table_id": 55, "name": "Companies", "rows": 22 } ],
#      "contacts_pending": 22,
#      "next": "22 of 22 rows have no contact yet. Call sensei_reveal_contacts...",
#      "companies": [ { "company": "...", "role": "...", "location": "Bengaluru",
#                       "fit_score": 88, "why_now": "...", "apply_url": "...",
#                       "table_id": 55, "row_id": 903,
#                       "contact": { "name": "", "email": "", "status": "pending" } } ] }

# 4) reveal the contacts (spends reveal credits), then read again
sensei_reveal_contacts({ "table_id": 55 })
# -> { "status": "revealing", "revealing": 22 }
#    ...wait ~30-60s...
sensei_results({ "run_id": 8412 })
# -> contacts now filled in: { "name": "Priya R", "title": "Talent Lead",
#                              "email": "priya@...", "phone": "+91...", "status": "found" }`;

const CLARIFY_FLOW = `# a poll can come back BLOCKED on a question instead of running
sensei_status({ "run_id": 8412 })
# -> { "status": "waiting_user", "needs_answer": true,
#      "question": "What pay band are we targeting?",
#      "options": ["Under 6 LPA", "6-12 LPA", "12 LPA+"],
#      "chat_id": 320 }

# answer it (ask your user if you can't infer it) -> you get a NEW run_id
sensei_reply({ "chat_id": 320, "answer": "6-12 LPA" })
# -> { "run_id": 8419, "status": "running" }

# poll the NEW run from here
sensei_status({ "run_id": 8419 })   # -> running ... -> done
sensei_results({ "run_id": 8419 })`;

const ENRICH_FLOW = `# one profile -> verified email + mobile (billed only on a hit)
enrich_contact({ "linkedin_url": "https://www.linkedin.com/in/janedoe" })
enrich_contact({ "first_name": "Jane", "last_name": "Doe", "company": "Acme" })

# a batch -> a job_id you poll
enrich_bulk({ "items": [ { "linkedin_url": "..." }, { "first_name": "...", "last_name": "...", "domain": "acme.com" } ] })
# -> { "job_id": "job_9f2c...", "count": 2 }
enrichment_status({ "job_id": "job_9f2c..." })

# check what's left on this key
sensei_credits({})`;

const RAW_CURL = `# The MCP endpoint speaks JSON-RPC 2.0 over Streamable HTTP. List the tools:
curl -s https://studojo.com/api/mcp \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Call a tool:
curl -s https://studojo.com/api/mcp \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"sensei_search",
                 "arguments":{"query":"growth marketing interns at climate startups, remote"}}}'`;

const RAW_NODE = `// Any MCP-capable client works. With the TypeScript SDK + Streamable HTTP:
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(
  new URL("https://studojo.com/api/mcp"),
  { requestInit: { headers: { Authorization: "Bearer sk_live_your_key_here" } } },
);
const client = new Client({ name: "my-app", version: "1.0.0" });
await client.connect(transport);
const { tools } = await client.listTools();
const res = await client.callTool({ name: "sensei_credits", arguments: {} });`;

// ── page ─────────────────────────────────────────────────────────────────────────────
export default function McpDocs() {
  const [lang, setLang] = useState<Lang>("json");
  const s = (samples: Partial<Record<Lang, string>>) => (
    <CodeSample samples={samples} lang={lang} setLang={setLang} />
  );

  return (
    <div className="min-h-screen bg-white text-studojo-ink font-satoshi">
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-8">
        <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-studojo-purple-bg text-studojo-purple border-2 border-studojo-purple mb-5">
          Model Context Protocol
        </span>
        <h1 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
          Sensei MCP
        </h1>
        <p className="mt-4 text-lg text-studojo-muted max-w-2xl">
          Give Claude, Cursor or your own agent direct access to Sensei. Run a hiring search from a
          plain-English brief and get back scored companies, roles and contacts, and turn any
          LinkedIn profile into a verified email and mobile, all over one connection.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-sm font-mono bg-studojo-surface-muted border border-neutral-300 rounded-lg px-3 py-1.5">
          <span className="text-studojo-muted">Endpoint</span>
          <span className="text-studojo-ink">https://studojo.com/api/mcp</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#connect"
            className="font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition bg-white"
          >
            Connect a client
          </a>
          <a
            href="https://dashboard.studojo.com"
            className="font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition bg-studojo-purple text-white"
          >
            Get your key
          </a>
          <a
            href="/apidocs"
            className="font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:translate-y-0.5 transition bg-studojo-green text-neutral-900"
          >
            Enrichment REST API
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
              The Sensei MCP server is a hosted Model Context Protocol endpoint. Point any MCP client
              at it and your agent gains nine tools: five to run, steer and read a Sensei hiring search,
              three to enrich people you already know, and one to check your balances. It speaks JSON-RPC 2.0 over
              Streamable HTTP, so it works with Claude, Cursor, and the official MCP SDKs without any
              local install.
            </p>
            <p className="text-studojo-muted">
              A Sensei search is asynchronous: it runs for a few minutes across job boards, LinkedIn
              posts and startup registries, scoring each company against your brief. You start it,
              poll for status, then read the results, so a single tool call never blocks.
            </p>
          </Section>

          <Section id="connect" title="Connect a client">
            <p className="text-studojo-muted mb-4">
              First get a key. If you run a Sensei workspace, open the manager dashboard at{" "}
              <span className="font-mono text-studojo-ink">dashboard.studojo.com</span>, go to{" "}
              <strong>AI agent</strong>, and press Generate key. That key is tied to your workspace, so
              your agent sees the same searches, companies and credits your team already works with.
              Then add the server to your client's MCP config. Most clients (Claude, Cursor, custom
              agents) accept this shape:
            </p>
            {s({ json: CONNECT_JSON })}
            <p className="text-studojo-muted text-sm mt-3">
              That's the whole setup. The connection is remote, so there is nothing to install and
              nothing runs on your machine.
            </p>
          </Section>

          <Section id="auth" title="Authentication">
            <p className="text-studojo-muted mb-3">
              Every request carries <span className="font-mono text-studojo-ink">Authorization: Bearer sk_live_…</span>.
              The key both authenticates you and scopes every call to your workspace, so no other key
              can see your searches or results. Generate and revoke keys from the{" "}
              <strong>AI agent</strong> tab of the manager dashboard, where only a workspace admin can
              create them. A missing or invalid key returns{" "}
              <span className="font-mono text-studojo-ink">401</span>; a revoked key stops working
              immediately.
            </p>
          </Section>

          <Section id="tools" title="Tools">
            <div className="space-y-3">
              <Tool name="sensei_search" args="{ query }">
                Start a hiring search from a plain-English brief (role, location, company type, pay,
                seniority). Returns a <span className="font-mono">run_id</span> immediately.
              </Tool>
              <Tool name="sensei_status" args="{ run_id }">
                Progress for a run: <span className="font-mono">running | waiting_user | done | error</span>{" "}
                plus live counters. Poll every 20-30 seconds. On{" "}
                <span className="font-mono">waiting_user</span> it also returns the question, its
                options and the chat_id to answer into.
              </Tool>
              <Tool name="sensei_reply" args="{ answer, chat_id | run_id }">
                Answer Sensei's clarifying question, or send a follow-up to refine a search ("make it
                Pune instead"). Returns a new run_id to poll.
              </Tool>
              <Tool name="sensei_results" args="{ run_id }">
                The companies and roles found: company, role, location, pay, fit score, why-now
                signal, apply link. Contacts are blank here; the response tells you how many are
                pending and the table_id to reveal them with.
              </Tool>
              <Tool name="sensei_reveal_contacts" args="{ table_id | row_id }">
                Reveal the hiring-side contact for search results. Pass a table_id to do a whole
                table at once. Spends the workspace's reveal credits.
              </Tool>
              <Tool name="enrich_contact" args="{ linkedin_url | first_name,last_name,company }">
                One person to a verified work email, personal email and mobile. Billed only on a hit.
              </Tool>
              <Tool name="enrich_bulk" args="{ items[], fields? }">
                Up to 500 contacts in one batch. Returns a <span className="font-mono">job_id</span>.
              </Tool>
              <Tool name="enrichment_status" args="{ job_id }">
                Status and results for a bulk enrichment job.
              </Tool>
              <Tool name="sensei_credits" args="{ }">
                Remaining Sensei search credits and your Contact Enrichment monthly quota.
              </Tool>
            </div>
          </Section>

          <Section id="search-flow" title="Running a search">
            <p className="text-studojo-muted mb-4">
              The three discovery tools chain together. Start, poll, read:
            </p>
            <Code>{SEARCH_FLOW}</Code>
          </Section>

          <Section id="clarify" title="When Sensei asks a question">
            <p className="text-studojo-muted mb-4">
              If a brief is missing something load-bearing (pay band, company type, location), Sensei
              pauses and asks one short question instead of guessing. The run stops at{" "}
              <span className="font-mono text-studojo-ink">waiting_user</span> and will not continue
              until it gets an answer, so your agent should check for it on every poll.
            </p>
            <Code>{CLARIFY_FLOW}</Code>
            <p className="text-studojo-muted text-sm mt-3">
              The same tool sends follow-ups on a finished search, so you can refine without starting
              over: <span className="font-mono text-studojo-ink">sensei_reply</span> with "only funded
              startups" or "make it Pune instead" re-runs against the existing thread.
            </p>
          </Section>

          <Section id="contacts" title="Getting contacts">
            <p className="text-studojo-muted mb-4">
              There are two different ways to get a phone number out of Sensei, and they are not
              interchangeable. Which one you want depends on whether Sensei found the person, or you did.
            </p>
            <div className={`${CARD} p-5 mb-4`}>
              <p className="font-bold mb-1">Companies Sensei found &rarr; <span className="font-mono text-sm">sensei_reveal_contacts</span></p>
              <p className="text-studojo-muted text-sm" style={{margin:0}}>
                Search results arrive without contacts. Revealing one works out the right hiring-side
                person for that specific role, using the apply channel, the job poster and the insider
                who wrote the post before it pays for a lookup. It draws on your workspace's reveal
                credits, the same pool the Enrich button in the app uses, so a reveal through your agent
                and a reveal in the browser are the same thing and show up in the same place. It runs in
                the background: read the results again after about a minute.
              </p>
            </div>
            <div className={`${CARD} p-5`}>
              <p className="font-bold mb-1">Someone you already know &rarr; <span className="font-mono text-sm">enrich_contact</span></p>
              <p className="text-studojo-muted text-sm" style={{margin:0}}>
                Give it a LinkedIn profile, or a name and company, and it returns a verified work email,
                personal email and mobile. This is the Contact Enrichment engine, independent of any
                search, and it answers immediately. It draws on your key's monthly enrichment quota
                rather than your workspace reveal credits, and you are charged only when a contact
                actually comes back.
              </p>
            </div>
          </Section>

          <Section id="enrich-flow" title="Enriching anyone">
            <p className="text-studojo-muted mb-4">
              The enrichment tools work standalone (they don't need a search) and are billed only when
              a verified contact comes back. The same identity requested twice in a month is served
              from cache and not charged again.
            </p>
            <Code>{ENRICH_FLOW}</Code>
          </Section>

          <Section id="isolation" title="Isolation & credits">
            <p className="text-studojo-muted mb-3">
              Each API key gets its own private Sensei workspace. Searches, runs and results created
              with one key are never visible to another, so the server is safe to hand to a customer or
              a teammate.
            </p>
            <p className="text-studojo-muted">
              Two meters apply. Sensei searches draw on your key's search credits (a run that finds and
              scores companies also spends the compute behind it). Contact enrichment draws on your
              monthly enrichment quota, and is billed only on a returned contact. Call{" "}
              <span className="font-mono text-studojo-ink">sensei_credits</span> any time to see both.
              To top up, contact <span className="font-mono text-studojo-ink">admin@studojo.com</span>.
            </p>
          </Section>

          <Section id="raw" title="Raw JSON-RPC">
            <p className="text-studojo-muted mb-4">
              You don't need an SDK. The endpoint is a plain JSON-RPC 2.0 POST, so cURL or any HTTP
              client works:
            </p>
            {s({ curl: RAW_CURL, node: RAW_NODE })}
          </Section>

          <Section id="errors" title="Errors">
            <div className={`${CARD} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="bg-studojo-surface-muted text-left">
                      <th className="p-2.5 font-semibold">Where</th>
                      <th className="p-2.5 font-semibold">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {[
                      ["HTTP 401", "Missing or invalid API key."],
                      ["isError on a tool result", "The tool ran but couldn't complete — the text explains why (bad input, out of credits, no such run)."],
                      ["Out of search credits", "sensei_search is out of this key's Sensei credits; top up via admin@studojo.com."],
                      ["Out of enrichment credits", "The monthly enrichment quota is spent; it resets at the start of the month."],
                      ["JSON-RPC -32601", "Unknown method (only initialize, tools/list, tools/call, ping are served)."],
                    ].map(([w, m]) => (
                      <tr key={w} className="align-top">
                        <td className="p-2.5 font-mono text-[13px] whitespace-nowrap">{w}</td>
                        <td className="p-2.5 text-studojo-muted">{m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
