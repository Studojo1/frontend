// "Delete my account" and "Download my data" without job-outreach-svc (RELAUNCH, 2 Nov 2026): the plan
// (app/lib/career-data.ts), the routes that use it, and, against a throwaway local database only, the real thing.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AUTH_TABLES, CAREER_SCHEMA, CAREER_SECRET_COLUMNS, ident, planUserData, qualified, stepWhere } from "./career-data.ts";
import { stripSecrets } from "./account-export.ts";

const APP = new URL("../", import.meta.url).pathname;

// ── 1. The plan, pure.
assert.equal(CAREER_SCHEMA, "career_agent");
assert.deepEqual(planUserData({ schema: null, userTables: ["career_x"], fks: [] }), { steps: [], problems: [] }, "no schema, nothing");

const cat = {
  schema: "career_agent",
  userTables: ["career_threads", "career_sequences", "career_profiles", "career_uploads", "career_credit_orders", "jobs_feed"],
  fks: [
    // a thread's messages: no user_id, a child
    { child: "career_messages", childCol: "thread_id", parentName: "career_threads", parentCol: "id" },
    // a sequence's steps: a child
    { child: "career_sequence_steps", childCol: "sequence_id", parentName: "career_sequences", parentCol: "id" },
    // an upload points at a message (a child): the upload goes first
    { child: "career_uploads", childCol: "message_id", parentName: "career_messages", parentCol: "id" },
    // a key to a shared table (jobs) is not followed: jobs are nobody's
    { child: "career_sequences", childCol: "job_id", parentName: "career_jobs", parentCol: "id" },
    // a key of several columns cannot be followed
    { child: "career_odd", childCol: null, parentName: "career_profiles", parentCol: null },
  ],
};
const plan = planUserData(cat);
const order = plan.steps.map((s) => s.table);
assert.ok(!order.includes("jobs_feed"), "only career_* tables");
assert.ok(!order.includes("career_jobs"), "a shared table is never the person's");
for (const t of ["career_threads", "career_sequences", "career_profiles", "career_uploads", "career_credit_orders", "career_messages", "career_sequence_steps"]) {
  assert.ok(order.includes(t), `${t} is in the plan`);
}
const before = (a, b) => assert.ok(order.indexOf(a) < order.indexOf(b), `${a} is deleted before ${b} (${order.join(", ")})`);
before("career_uploads", "career_messages");
before("career_messages", "career_threads");
before("career_sequence_steps", "career_sequences");
assert.deepEqual(plan.problems, ["career_odd points at career_profiles with a key of several columns"]);
const msgStep = plan.steps.find((s) => s.table === "career_messages");
assert.equal(msgStep.kind, "child");
assert.equal(
  stepWhere("career_agent", msgStep, "t"),
  `t."thread_id" IN (SELECT "id" FROM "career_agent"."career_threads" WHERE user_id = $1)`,
);
assert.equal(stepWhere("career_agent", { kind: "own", table: "career_profiles" }, "t"), "t.user_id = $1");
assert.equal(ident('a"b'), '"a""b"');
assert.equal(qualified("career_agent", "career_x"), '"career_agent"."career_x"');

// A cycle is noted, never looped on.
const cyc = planUserData({
  schema: "s",
  userTables: ["career_a", "career_b"],
  fks: [
    { child: "career_a", childCol: "b_id", parentName: "career_b", parentCol: "id" },
    { child: "career_b", childCol: "a_id", parentName: "career_a", parentCol: "id" },
  ],
});
assert.equal(cyc.steps.length, 2);
assert.ok(cyc.problems.some((p) => p.startsWith("a cycle of keys")));

// The export drops every secret column of the product's tables, at any depth (a start over's saved copy holds rows).
assert.deepEqual(
  stripSecrets(
    { career_mail_accounts: [{ email: "a@b.co", secret: "v1.x" }], career_channel_codes: [{ code: "123456", channel: "wa" }], career_test_resets: [{ data: { tables: { career_go_sessions: [{ token_hash: "h", channel: "wa" }] } } }] },
    CAREER_SECRET_COLUMNS,
  ),
  { career_mail_accounts: [{ email: "a@b.co" }], career_channel_codes: [{ channel: "wa" }], career_test_resets: [{ data: { tables: { career_go_sessions: [{ channel: "wa" }] } } }] },
);

// ── 2. The code that runs it: one transaction, the product's rows, then the auth rows, then the user. No old table.
const server = readFileSync(APP + "lib/career-data.server.ts", "utf8");
assert.deepEqual([...AUTH_TABLES], ["session", "account", "user_profile"]);
const del = server.slice(server.indexOf("export async function deleteAccount"), server.indexOf("export async function exportCareerData"));
for (const want of ['c.query("BEGIN")', "planUserData(cat)", "for (const t of AUTH_TABLES)", 'DELETE FROM "user" WHERE id = $1', 'c.query("COMMIT")', 'c.query("ROLLBACK")', '"23503"']) {
  assert.ok(del.includes(want), `deleteAccount: ${want}`);
}
assert.ok(del.indexOf("planUserData(cat)") < del.indexOf("for (const t of AUTH_TABLES)") && del.indexOf("for (const t of AUTH_TABLES)") < del.indexOf('DELETE FROM "user"'), "product rows, then auth rows, then the user");
const OLD_TABLES = /\b(resumes|resume_versions|resume_drafts|internship_applications|internships|autoapply_\w+|job_queue|outreach_\w+|extension_drafts|webinar_\w+|campus_ambassador_\w+|consultation_signups|career_applications|newsletter_subscriptions|email_preferences|candidates|leads|campaigns|emails_sent)\b/;
assert.doesNotMatch(server.replace(/^\s*\/\/.*$/gm, ""), OLD_TABLES, "never names an old product's table");
assert.match(server, /BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY/, "the export reads one snapshot and writes nothing");

const delRoute = readFileSync(APP + "routes/account.delete.tsx", "utf8");
assert.match(delRoute, /if \(!sameOrigin\(request\)\)/, "a form on another site never deletes");
assert.match(delRoute, /if \(form\.get\("confirm"\) !== "DELETE"\)/);
assert.match(delRoute, /await deleteAccount\(session\.user\.id\);/, "only the signed-in person's own account");
assert.match(delRoute, /auth\.api\.signOut\(\{ headers: request\.headers, asResponse: true \}\)/, "the cookies are cleared");
assert.doesNotMatch(delRoute.replace(/^\s*\/\/.*$/gm, ""), /outreachFetch|job-outreach/);
const exportRoute = readFileSync(APP + "routes/api.account.export.tsx", "utf8");
assert.match(exportRoute, /exportCareerData\(userId\)/);
assert.match(exportRoute, /studojo_agent: stripSecrets\(career, CAREER_SECRET_COLUMNS\)/);
assert.doesNotMatch(exportRoute, /outreachServerFetch|server-api/);
const appExport = readFileSync(APP + "lib/account-export.server.ts", "utf8").replace(/^\s*\/\/.*$/gm, "");
assert.doesNotMatch(appExport.replace(/\/\*\*[\s\S]*?\*\//g, ""), OLD_TABLES, "the app half reads no old product table");

// ── 3. Against a real database: only a throwaway one on this machine (localhost, a name with "test"), and only when
// it has no career_agent schema of its own (the test makes one and drops it after). CI's tests.yml database fits.
const url = process.env.DATABASE_URL ?? "";
let local = false;
try {
  const u = new URL(url);
  local = ["localhost", "127.0.0.1"].includes(u.hostname) && /test/i.test(u.pathname);
} catch {}
if (!local) {
  console.log("  skip real-database checks (DATABASE_URL is not a local test database)");
} else {
  const pg = (await import("pg")).default;
  const pool = new pg.Pool({ connectionString: url });
  const has = (await pool.query("SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'career_agent') AS ok")).rows[0].ok;
  const authReady = (await pool.query(`SELECT to_regclass('public."user"') IS NOT NULL AS ok`)).rows[0].ok;
  if (has || !authReady) {
    console.log(`  skip real-database checks (${has ? "career_agent already exists here" : "no auth tables: run drizzle-kit push first"})`);
    await pool.end();
  } else {
    const { deleteAccount, exportCareerData } = await import("./career-data.server.ts");
    const ids = ["cd_test_a", "cd_test_b"];
    try {
      await pool.query(`
        CREATE SCHEMA career_agent;
        CREATE TABLE career_agent.career_threads (id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES "user"(id));
        CREATE TABLE career_agent.career_messages (id BIGSERIAL PRIMARY KEY, thread_id BIGINT NOT NULL REFERENCES career_agent.career_threads(id), body TEXT);
        CREATE TABLE career_agent.career_uploads (id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, message_id BIGINT REFERENCES career_agent.career_messages(id));
        CREATE TABLE career_agent.career_mail_accounts (id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, email TEXT, secret TEXT);
        CREATE TABLE career_agent.career_channel_codes (code TEXT PRIMARY KEY, user_id TEXT NOT NULL, channel TEXT);
        CREATE TABLE career_agent.career_jobs (id BIGSERIAL PRIMARY KEY, title TEXT);
      `);
      for (const id of ids) {
        await pool.query(`INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at) VALUES ($1, 'T', $2, false, now(), now())`, [id, `${id}@example.com`]);
        await pool.query(`INSERT INTO session (id, token, user_id, expires_at, created_at, updated_at) VALUES ($1, $2, $3, now() + interval '1 day', now(), now())`, [`s_${id}`, `tok_${id}`, id]);
        await pool.query(`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ($1, $2, 'credential', $2, 'hash', now(), now())`, [`a_${id}`, id]);
        await pool.query(`INSERT INTO user_profile (id, user_id, full_name, college, year_of_study, course) VALUES ($1, $2, 'T', 'C', '1', 'X')`, [`p_${id}`, id]);
        const t = await pool.query("INSERT INTO career_agent.career_threads (user_id) VALUES ($1) RETURNING id", [id]);
        const m = await pool.query("INSERT INTO career_agent.career_messages (thread_id, body) VALUES ($1, 'hello') RETURNING id", [t.rows[0].id]);
        await pool.query("INSERT INTO career_agent.career_uploads (user_id, message_id) VALUES ($1, $2)", [id, m.rows[0].id]);
        await pool.query("INSERT INTO career_agent.career_mail_accounts (user_id, email, secret) VALUES ($1, $2, 'v1.sealed')", [id, `${id}@example.com`]);
        await pool.query("INSERT INTO career_agent.career_channel_codes (code, user_id, channel) VALUES ($1, $2, 'wa')", [`c_${id}`, id]);
      }
      await pool.query("INSERT INTO career_agent.career_jobs (title) VALUES ('shared')");

      // Export: the person's rows only, every table, secrets dropped by the route's net.
      const out = await exportCareerData("cd_test_a");
      assert.deepEqual(Object.keys(out).sort(), ["career_channel_codes", "career_mail_accounts", "career_messages", "career_threads", "career_uploads"]);
      assert.equal(out.career_messages[0].body, "hello");
      assert.ok(!JSON.stringify(out).includes("cd_test_b"), "nobody else's rows");
      const clean = stripSecrets(out, CAREER_SECRET_COLUMNS);
      assert.ok(!JSON.stringify(clean).includes("v1.sealed") && !JSON.stringify(clean).includes("c_cd_test_a"), "no secret leaves");

      // Delete: everything of a, nothing of b, the shared table untouched.
      const done = await deleteAccount("cd_test_a");
      assert.equal(done.auth.user, 1);
      assert.equal(done.career.career_messages, 1);
      const count = async (sql, p) => Number((await pool.query(sql, p)).rows[0].n);
      assert.equal(await count(`SELECT count(*) AS n FROM "user" WHERE id = $1`, ["cd_test_a"]), 0);
      assert.equal(await count(`SELECT count(*) AS n FROM session WHERE user_id = $1`, ["cd_test_a"]), 0);
      assert.equal(await count(`SELECT count(*) AS n FROM account WHERE user_id = $1`, ["cd_test_a"]), 0);
      for (const t of ["career_threads", "career_uploads", "career_mail_accounts", "career_channel_codes"]) {
        assert.equal(await count(`SELECT count(*) AS n FROM career_agent.${t} WHERE user_id = $1`, ["cd_test_a"]), 0, t);
        assert.equal(await count(`SELECT count(*) AS n FROM career_agent.${t} WHERE user_id = $1`, ["cd_test_b"]), 1, `${t} of b`);
      }
      assert.equal(await count("SELECT count(*) AS n FROM career_agent.career_messages", []), 1, "only b's message is left");
      assert.equal(await count(`SELECT count(*) AS n FROM "user" WHERE id = $1`, ["cd_test_b"]), 1);
      assert.equal(await count("SELECT count(*) AS n FROM career_agent.career_jobs", []), 1);

      // A table outside the plan that keeps the user (a RESTRICT key, like some old product tables): the delete stops
      // and rolls back whole, so b keeps every row.
      await pool.query(`CREATE TABLE public.cd_test_hold (user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT)`);
      await pool.query("INSERT INTO public.cd_test_hold (user_id) VALUES ($1)", ["cd_test_b"]);
      const { AccountDeleteBlocked } = await import("./career-data.server.ts");
      const realError = console.error;
      console.error = () => {};
      try {
        await assert.rejects(deleteAccount("cd_test_b"), (e) => e instanceof AccountDeleteBlocked);
      } finally {
        console.error = realError;
      }
      assert.equal(await count(`SELECT count(*) AS n FROM "user" WHERE id = $1`, ["cd_test_b"]), 1, "rolled back: the user stays");
      assert.equal(await count("SELECT count(*) AS n FROM career_agent.career_threads WHERE user_id = $1", ["cd_test_b"]), 1, "rolled back: the rows stay");
      assert.equal(await count("SELECT count(*) AS n FROM session WHERE user_id = $1", ["cd_test_b"]), 1, "rolled back: the session stays");
      console.log("  ok  real database: export and delete, one account only; a blocked delete changes nothing");
    } finally {
      await pool.query("DROP TABLE IF EXISTS public.cd_test_hold");
      await pool.query("DROP SCHEMA IF EXISTS career_agent CASCADE");
      for (const id of ids) {
        await pool.query("DELETE FROM session WHERE user_id = $1", [id]);
        await pool.query("DELETE FROM account WHERE user_id = $1", [id]);
        await pool.query("DELETE FROM user_profile WHERE user_id = $1", [id]).catch(() => undefined);
        await pool.query(`DELETE FROM "user" WHERE id = $1`, [id]);
      }
      await pool.end();
      const { pool: appPool } = await import("./db.ts");
      await appPool.end();
    }
  }
}

console.log("career-data: ok");
