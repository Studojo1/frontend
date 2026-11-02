// The Growth Fellowship student page against a real Postgres: what one
// fellow's address can change, and what it can never read.
//
// The ugc_* tables belong to the admin panel (studojo.com runs no DDL), so
// this makes its own copies of them in a throwaway schema, points the app's
// db module at that schema, and drops it at the end. Skipped without
// DATABASE_URL; CI has one (.github/workflows/tests.yml).
import assert from "node:assert/strict";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.log("fellow-page: skipped (DATABASE_URL not set)");
  process.exit(0);
}

const SCHEMA = `fellow_page_test_${process.pid}`;
const setup = new pg.Client({ connectionString: process.env.DATABASE_URL });
await setup.connect();
await setup.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE; CREATE SCHEMA ${SCHEMA}; SET search_path TO ${SCHEMA}`);

// The app's db module reads DATABASE_URL when it is first imported.
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set("options", `-c search_path=${SCHEMA}`);
process.env.DATABASE_URL = url.toString();

const SECRET = "TEAM-ONLY-7741";
let appDb;
try {
  const { addDays, istDate, weekOf } = await import("./fellow-view.ts");
  const monday = weekOf(istDate());
  const lastTue = addDays(monday, -6), lastThu = addDays(monday, -4);
  const tue = addDays(monday, 1), thu = addDays(monday, 3), nextTue = addDays(monday, 8);

  // Column for column as the admin panel creates them (ugc-creators.server.ts), secrets included.
  await setup.query(`
    CREATE TABLE ugc_applications (id SERIAL PRIMARY KEY, full_name TEXT, email TEXT, whatsapp TEXT, course TEXT, year_of_study TEXT, city TEXT, team_notes TEXT);
    CREATE TABLE ugc_creators (
      id SERIAL PRIMARY KEY, application_id INTEGER, token TEXT NOT NULL, full_name TEXT NOT NULL, email TEXT, whatsapp TEXT,
      linkedin_url TEXT, college TEXT, field TEXT, cohort TEXT, status TEXT NOT NULL DEFAULT 'active', connections_at_join INTEGER,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), slug TEXT, team_notes TEXT, learnings TEXT, nudged_at TIMESTAMPTZ
    );
    CREATE TABLE ugc_creator_posts (
      id SERIAL PRIMARY KEY, creator_id INTEGER NOT NULL REFERENCES ugc_creators(id), title TEXT NOT NULL, body TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'personal', due_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'ready', copied_at TIMESTAMPTZ,
      own_line TEXT, posted_at TIMESTAMPTZ, post_url TEXT, impressions INTEGER, reactions INTEGER, comments INTEGER,
      screenshot_url TEXT, metrics_at TIMESTAMPTZ, review JSONB, insight TEXT, insight_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE ugc_creator_stories (id SERIAL PRIMARY KEY, creator_id INTEGER NOT NULL REFERENCES ugc_creators(id), prompt TEXT, text TEXT NOT NULL, spoken BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE ugc_creator_connections (id SERIAL PRIMARY KEY, creator_id INTEGER NOT NULL REFERENCES ugc_creators(id), connections INTEGER NOT NULL, recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE ugc_creator_drafts (id SERIAL PRIMARY KEY, creator_id INTEGER NOT NULL REFERENCES ugc_creators(id), title TEXT NOT NULL, body TEXT NOT NULL, due_date DATE NOT NULL);
    CREATE TABLE ugc_programme (id INTEGER PRIMARY KEY, rules JSONB NOT NULL);
  `);
  await setup.query(`INSERT INTO ugc_applications (full_name, email, whatsapp, course, year_of_study, city, team_notes) VALUES ('Asha Testfellow', 'asha@example.com', '+910000000001', 'BBA', '3rd year', 'Pune', $1)`, [SECRET]);
  await setup.query(`
    INSERT INTO ugc_creators (application_id, token, full_name, email, whatsapp, college, field, cohort, status, connections_at_join, joined_at, slug, team_notes, learnings, nudged_at) VALUES
      (1, $1, 'Asha Testfellow', 'asha@example.com', '+910000000001', 'Test College', 'Marketing', 'A', 'active', 500, now() - interval '10 days', 'asha-k3m9x2qa', $1, $1, now()),
      (NULL, 'tok-kiran', 'Kiran Testfellow', 'kiran@example.com', NULL, 'Test College', 'Product', 'A', 'active', 800, now() - interval '10 days', 'kiran-p7w2m4tq', NULL, NULL, NULL),
      (NULL, 'tok-gone', 'Gone Testfellow', NULL, NULL, 'Test College', 'Design', 'A', 'removed', 100, now() - interval '10 days', 'gone-z5y4x3w2', NULL, NULL, NULL)
  `, [SECRET]);
  const ids = {};
  const addPost = async (key, creator, due, status, extra = {}) => {
    const r = await setup.query(
      `INSERT INTO ugc_creator_posts (creator_id, title, body, due_date, status, posted_at, post_url, review, insight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [creator, extra.title ?? `Post ${key}`, extra.body ?? `Body ${key}`, due, status,
        status === "posted" ? new Date() : null, extra.url ?? null, extra.review ?? null, extra.insight ?? null],
    );
    ids[key] = r.rows[0].id;
  };
  await addPost("aMissed", 1, lastTue, "ready");
  await addPost("aDone", 1, lastThu, "posted", { url: "https://www.linkedin.com/posts/asha-done-activity-1", review: JSON.stringify({ note: SECRET }), insight: SECRET });
  await addPost("aTue", 1, tue, "ready");
  await addPost("aThu", 1, thu, "ready");
  await addPost("aNext", 1, nextTue, "ready", { title: `NEXT-WEEK-${SECRET}` });
  await addPost("kTue", 2, tue, "ready", { body: `KIRAN-BODY-${SECRET}` });
  await addPost("kPosted", 2, tue, "posted", { url: "https://www.linkedin.com/posts/kiran-activity-2" });
  await setup.query(`INSERT INTO ugc_creator_drafts (creator_id, title, body, due_date) VALUES (1, $1, $1, $2)`, [SECRET, thu]);
  await setup.query(`INSERT INTO ugc_programme (id, rules) VALUES (1, '{"milestones":[{"id":"trial","weeks":2,"name":"2-week certificate","detail":"d"}]}')`);

  const page = await import("./fellow-page.server.ts");
  const api = await import("../routes/api.fellowship-growth.$slug.tsx");
  const pageRoute = await import("../routes/fellowship-growth.$slug.tsx");
  const splat = await import("../routes/fellowship-growth.$.tsx");
  appDb = (await import("./db.ts")).default;
  const { FellowInputError } = page;
  const one = async (q, params = []) => (await setup.query(q, params)).rows[0];
  const refused = async (fn, status, label) => {
    await assert.rejects(fn, (e) => e instanceof FellowInputError && e.status === status, label);
  };

  // ---------------------------------------------------------------- reading
  const asha = await page.findFellow("asha-k3m9x2qa");
  assert.ok(asha, "an active fellow is found by their address");
  assert.deepEqual(Object.keys(asha).sort(), ["application_id", "cohort", "college", "connections_at_join", "field", "full_name", "id", "joined_at", "linkedin_url", "slug", "status"], "only the allow-listed columns are read");
  assert.equal(await page.findFellow("gone-z5y4x3w2"), null, "a removed fellow's address stops working");
  assert.equal(await page.findFellow("nobody-k3m9x2qa"), null);
  const kiran = await page.findFellow("kiran-p7w2m4tq");

  const view = await page.loadFellowView(asha);
  const seen = JSON.stringify(view);
  assert.ok(!seen.includes(SECRET), "no team notes, learnings, token, review, insight, draft, next week or other fellow's post");
  assert.ok(!seen.includes("asha@example.com") && !seen.includes("+910000000001"), "no contact details");
  assert.deepEqual(view.me.thisWeek.posts.map((p) => Number(p.id)), [ids.aTue, ids.aThu], "this week's posts only");
  assert.deepEqual(view.me.history[0].missed.map((p) => Number(p.id)), [ids.aMissed], "last week's unposted post is offered late");
  assert.equal(view.me.course, "BBA, 3rd year");

  // ---------------------------------------------------------------- another fellow's posts can't be touched
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.kTue, url: "https://www.linkedin.com/posts/x-activity-9" }), 404, "posted on another fellow's post");
  await refused(() => page.applyFellowChange(asha, { intent: "line", postId: ids.kTue, line: "mine now" }), 404, "line on another fellow's post");
  await refused(() => page.applyFellowChange(asha, { intent: "numbers", postId: ids.kPosted, impressions: 1, reactions: 1, comments: 1 }), 404, "numbers on another fellow's post");
  await page.applyFellowChange(asha, { intent: "copied", postId: ids.kTue });
  const k = await one(`SELECT status, own_line, copied_at, post_url FROM ugc_creator_posts WHERE id = $1`, [ids.kTue]);
  assert.deepEqual([k.status, k.own_line, k.copied_at, k.post_url], ["ready", null, null, null], "Kiran's post is untouched");
  assert.equal((await one(`SELECT impressions FROM ugc_creator_posts WHERE id = $1`, [ids.kPosted])).impressions, null);

  // ---------------------------------------------------------------- the fellow's own posts
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aNext, url: "https://www.linkedin.com/posts/x-activity-10" }), 409, "next week's post can't be marked yet");
  assert.equal((await one(`SELECT status FROM ugc_creator_posts WHERE id = $1`, [ids.aNext])).status, "ready");
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue, url: "https://www.linkedin.com/posts/asha-done-activity-1/" }), 409, "a link already saved for another post");
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue, url: "https://www.linkedin.com/posts/kiran-activity-2" }), 409, "another fellow's post link");
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue, url: "https://example.com/posts/x" }), 400, "not a LinkedIn post link");
  await page.applyFellowChange(asha, { intent: "copied", postId: ids.aTue });
  await page.applyFellowChange(asha, { intent: "line", postId: ids.aTue, line: "  My   own line \u0000 " });
  await page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue, url: "https://in.linkedin.com/posts/asha-tue-activity-3?utm_source=share" });
  const t = await one(`SELECT status, own_line, copied_at, post_url FROM ugc_creator_posts WHERE id = $1`, [ids.aTue]);
  assert.equal(t.status, "posted");
  assert.equal(t.own_line, "My own line");
  assert.ok(t.copied_at);
  assert.equal(t.post_url, "https://www.linkedin.com/posts/asha-tue-activity-3");
  await refused(() => page.applyFellowChange(asha, { intent: "line", postId: ids.aTue, line: "too late" }), 409, "the line can't change once posted");
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue, url: "https://www.linkedin.com/posts/asha-again-activity-4" }), 409, "posted twice");
  await refused(() => page.applyFellowChange(asha, { intent: "numbers", postId: ids.aThu, impressions: 1, reactions: 1, comments: 1 }), 409, "numbers before posting");
  await page.applyFellowChange(asha, { intent: "numbers", postId: ids.aTue, impressions: "1,240", reactions: 31, comments: "4" });
  assert.equal((await one(`SELECT impressions FROM ugc_creator_posts WHERE id = $1`, [ids.aTue])).impressions, 1240);
  await page.applyFellowChange(asha, { intent: "posted", postId: ids.aMissed, url: "https://www.linkedin.com/posts/asha-late-activity-5" });
  assert.equal((await one(`SELECT status FROM ugc_creator_posts WHERE id = $1`, [ids.aMissed])).status, "posted", "last week's post can be marked late");

  // The team pulls a post back (admin pullBack DELETEs it) while the page is open: the fellow is told, not misled.
  await page.applyFellowChange(asha, { intent: "copied", postId: ids.aThu });
  await setup.query(`DELETE FROM ugc_creator_posts WHERE id = $1 AND status <> 'posted'`, [ids.aThu]);
  for (const change of [{ intent: "posted", url: "https://www.linkedin.com/posts/asha-thu-activity-8" }, { intent: "line", line: "x" }, { intent: "numbers", impressions: 1, reactions: 1, comments: 1 }]) {
    await assert.rejects(() => page.applyFellowChange(asha, { ...change, postId: ids.aThu }), (e) => e.status === 404 && /taken this post back/.test(e.message), `${change.intent} on a pulled-back post`);
  }
  await addPost("aThu", 1, thu, "ready");

  for (const bad of [99999999999, "99999999999", 2147483648, -1, 0, "1e3", null]) {
    await refused(() => page.applyFellowChange(asha, { intent: "copied", postId: bad }), 404, `post id ${bad}`);
  }
  await refused(() => page.applyFellowChange(asha, { intent: "drop-table" }), 400, "unknown intent");

  // ---------------------------------------------------------------- connections: one reading a day
  await page.applyFellowChange(asha, { intent: "connections", connections: 600 });
  await Promise.all([610, 620, 630].map((n) => page.applyFellowChange(asha, { intent: "connections", connections: n })));
  const conn = await setup.query(`SELECT connections FROM ugc_creator_connections WHERE creator_id = 1`);
  assert.equal(conn.rows.length, 1, "saving again the same day replaces that day's reading");
  await refused(() => page.applyFellowChange(asha, { intent: "connections", connections: 40000 }), 400, "above LinkedIn's limit");
  assert.equal((await one(`SELECT count(*)::int AS n FROM ugc_creator_connections WHERE creator_id = 2`)).n, 0);

  // ---------------------------------------------------------------- stories: capped, and never cut short silently
  await refused(() => page.applyFellowChange(asha, { intent: "story", text: "x".repeat(8001) }), 400, "a story over 8,000 characters");
  await refused(() => page.applyFellowChange(asha, { intent: "story", text: "short" }), 400, "a story under 10 characters");
  await page.applyFellowChange(asha, { intent: "story", text: "y".repeat(8000), prompt: "not a real prompt" });
  const st = await one(`SELECT length(text) AS n, prompt, spoken FROM ugc_creator_stories WHERE creator_id = 1`);
  assert.equal(st.spoken, false, "a typed story is marked typed");
  assert.equal(st.n, 8000);
  assert.equal(st.prompt, null, "only the page's own prompts are stored");
  await page.applyFellowChange(kiran, { intent: "story", text: "A story Kiran told out loud, about his first internship.", spoken: true });
  await page.applyFellowChange(kiran, { intent: "story", text: "Another story, with a spoken flag that isn't true.", spoken: "yes" });
  assert.deepEqual((await setup.query(`SELECT spoken FROM ugc_creator_stories WHERE creator_id = 2 ORDER BY id`)).rows.map((r) => r.spoken), [true, false], "only spoken: true marks a story spoken");
  await setup.query(`DELETE FROM ugc_creator_stories WHERE creator_id = 2`);
  await setup.query(`INSERT INTO ugc_creator_stories (creator_id, text) SELECT 1, 'an earlier story today' FROM generate_series(1, 24)`);
  const burst = await Promise.allSettled(Array.from({ length: 12 }, (_, i) => page.applyFellowChange(asha, { intent: "story", text: `A story told in a burst, number ${i}` })));
  const stories = (await one(`SELECT count(*)::int AS n FROM ugc_creator_stories WHERE creator_id = 1`)).n;
  assert.equal(stories, 30, "a burst can't go past 30 a day");
  assert.equal(burst.filter((r) => r.status === "rejected" && r.reason.status === 429).length, 7);
  assert.equal((await one(`SELECT count(*)::int AS n FROM ugc_creator_stories WHERE creator_id = 2`)).n, 0);

  // ---------------------------------------------------------------- the API route
  const BASE = "https://studojo.com/api/fellowship-growth/";
  const post = (slug, body, headers = { "content-type": "application/json" }) =>
    api.action({ params: { slug }, request: new Request(BASE + slug, { method: "POST", headers, body }) });
  let res = await api.loader({ params: { slug: "asha-k3m9x2qa" }, request: new Request(BASE + "asha-k3m9x2qa") });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("referrer-policy"), "no-referrer");
  assert.ok(!(await res.text()).includes(SECRET));
  res = await api.loader({ params: { slug: "gone-z5y4x3w2" }, request: new Request(BASE + "gone-z5y4x3w2") });
  assert.equal(res.status, 404, "a removed fellow's data is gone");
  res = await post("asha-k3m9x2qa", JSON.stringify({ intent: "copied", postId: ids.aThu }), { "content-type": "text/plain" });
  assert.equal(res.status, 415, "JSON only, so another site's form can't post here");
  res = await post("asha-k3m9x2qa", JSON.stringify({ intent: "story", text: "z".repeat(50 * 1024) }));
  assert.equal(res.status, 413, "an oversized body");
  const flood = new ReadableStream({
    pull(c) { c.enqueue(new TextEncoder().encode("a".repeat(16 * 1024))); },
  });
  res = await api.action({
    params: { slug: "asha-k3m9x2qa" },
    request: new Request(BASE + "asha-k3m9x2qa", { method: "POST", headers: { "content-type": "application/json" }, body: flood, duplex: "half" }),
  });
  assert.equal(res.status, 413, "an endless body with no length is cut off");
  res = await post("asha-k3m9x2qa", "{not json");
  assert.equal(res.status, 400);
  res = await post("asha-k3m9x2qa", "[1,2]");
  assert.equal(res.status, 400);
  res = await post("gone-z5y4x3w2", JSON.stringify({ intent: "copied", postId: ids.aThu }));
  assert.equal(res.status, 404);
  res = await post("kiran-p7w2m4tq", JSON.stringify({ intent: "line", postId: ids.aThu, line: "via Kiran's address" }));
  assert.equal(res.status, 404, "Kiran's address can't change Asha's post");
  assert.equal((await one(`SELECT own_line FROM ugc_creator_posts WHERE id = $1`, [ids.aThu])).own_line, null);
  res = await post("asha-k3m9x2qa", JSON.stringify({ intent: "line", postId: ids.aThu, line: "Thursday's line" }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).me.thisWeek.posts.find((p) => Number(p.id) === ids.aThu).ownLine, "Thursday's line");
  assert.equal(api.headers({})["Cache-Control"], "no-store", "the .data spelling gets the same headers");

  // ---------------------------------------------------------------- the page routes
  const PAGE = "https://studojo.com/fellowship-growth/";
  res = await pageRoute.loader({ params: { slug: "asha-k3m9x2qa" }, request: new Request(PAGE + "asha-k3m9x2qa") });
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(res.headers.get("cache-control"), "no-store");
  for (const slug of ["gone-z5y4x3w2", "nobody-k3m9x2qa", "not a slug"]) {
    res = await pageRoute.loader({ params: { slug }, request: new Request(PAGE + encodeURIComponent(slug)) });
    assert.equal(res.status, 404, `page for ${slug}`);
  }
  const pageData = pageRoute.headers({});
  assert.equal(pageData["Content-Type"], undefined, "the .data spelling keeps its own content type");
  assert.equal(pageData["Cache-Control"], "no-store");
  res = splat.loader();
  assert.equal(res.status, 404);
  assert.equal(res.headers.get("cache-control"), "no-store", "a mangled address gets the fellowship's own page, not the site's");
  assert.ok(!(await res.text()).includes("posthog"));

  assert.ok(kiran);
  console.log("fellow-page: ok");
} finally {
  if (appDb) await appDb.$client.end().catch(() => {});
  await setup.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`).catch(() => {});
  await setup.end();
}
