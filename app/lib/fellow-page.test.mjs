// The Growth Fellowship student page against a real Postgres: what one
// fellow's address can change, and what it can never read.
//
// The ugc_* tables belong to the admin panel (studojo.com runs no DDL), so
// this makes its own copies of them in a throwaway schema, points the app's
// db module at that schema, and drops it at the end. Skipped without
// DATABASE_URL; CI has one (.github/workflows/tests.yml).
import assert from "node:assert/strict";
import pg from "pg";
import JSZip from "jszip";

if (!process.env.DATABASE_URL) {
  console.log("fellow-page: skipped (DATABASE_URL not set)");
  process.exit(0);
}
// Read-backs use a stand-in model here; with no key the real one must say it's unavailable.
delete process.env.AZURE_OPENAI_API_KEY;

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
    CREATE TABLE ugc_applications (id SERIAL PRIMARY KEY, full_name TEXT, email TEXT, whatsapp TEXT, course TEXT, year_of_study TEXT, city TEXT, team_notes TEXT,
      target_roles TEXT, looking_for TEXT, fellowship_goals JSONB, topics JSONB, avoid_topics TEXT);
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
      photo_idea TEXT, photo_url TEXT, photo_help_at TIMESTAMPTZ, analytics_url TEXT, analytics JSONB,
      rewrite_body TEXT, rewrite_at TIMESTAMPTZ, rewrite_reply TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE ugc_creator_stories (id SERIAL PRIMARY KEY, creator_id INTEGER NOT NULL REFERENCES ugc_creators(id), prompt TEXT, text TEXT NOT NULL, spoken BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      coach JSONB, reply_to INTEGER);
    CREATE TABLE ugc_creator_connections (id SERIAL PRIMARY KEY, creator_id INTEGER NOT NULL REFERENCES ugc_creators(id), connections INTEGER NOT NULL, recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE ugc_creator_drafts (id SERIAL PRIMARY KEY, creator_id INTEGER NOT NULL REFERENCES ugc_creators(id), title TEXT NOT NULL, body TEXT NOT NULL, due_date DATE NOT NULL);
    CREATE TABLE ugc_programme (id INTEGER PRIMARY KEY, rules JSONB NOT NULL);
    CREATE TABLE ugc_creator_analytics (id SERIAL PRIMARY KEY, creator_id INTEGER NOT NULL REFERENCES ugc_creators(id) ON DELETE CASCADE,
      file_url TEXT NOT NULL, period_start DATE, period_end DATE, data JSONB NOT NULL, uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  `);
  await setup.query(`INSERT INTO ugc_applications (full_name, email, whatsapp, course, year_of_study, city, team_notes, target_roles, looking_for, topics, avoid_topics)
    VALUES ('Asha Testfellow', 'asha@example.com', '+910000000001', 'BBA', '3rd year', 'Pune', $1, 'Brand manager', 'An internship', '["College life", "Internships"]', 'Politics')`, [SECRET]);
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
  const proofRoute = await import("../routes/api.fellowship-growth.$slug_.proof.tsx");
  const analyticsRoute = await import("../routes/api.fellowship-growth.$slug_.analytics.tsx");
  // Files go to an in-memory store here; the real one is Azure Blob (fellow-proof.server.ts).
  const { proofStore } = await import("./fellow-proof.server.ts");
  const stored = new Map(), storedType = new Map();
  proofStore.put = async (name, data, type) => { if (stored.has(name)) throw new Error("overwrite"); stored.set(name, Buffer.from(data)); storedType.set(name, type); };
  proofStore.get = async (name) => stored.get(name) ?? null;
  proofStore.remove = async (name) => { stored.delete(name); };
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
  assert.ok(!seen.includes("Kiran") && !/cohort(Size|PostedThisWeek|Position|Feed)/.test(seen), "nothing about another fellow, even one who posted this week in the same cohort");
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

  // ---------------------------------------------------------------- photos: no post goes out without one
  const PHOTO = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 9, 8, 7, 6]);
  const photosOn = async (id) => JSON.parse((await one(`SELECT photo_url FROM ugc_creator_posts WHERE id = $1`, [id])).photo_url ?? "[]");
  await setup.query(`UPDATE ugc_creator_posts SET photo_idea = 'You at the fest stall' WHERE id = $1`, [ids.aTue]);
  assert.equal((await page.loadFellowView(asha)).me.thisWeek.posts.find((p) => Number(p.id) === ids.aTue).photoIdea, "You at the fest stall");
  await assert.rejects(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue }), (e) => e.status === 409 && /link/.test(e.message), "no photo and no link, no posting");
  assert.equal((await one(`SELECT status FROM ugc_creator_posts WHERE id = $1`, [ids.aTue])).status, "ready");
  await page.applyFellowChange(asha, { intent: "photo-help", postId: ids.aTue });
  assert.ok((await one(`SELECT photo_help_at FROM ugc_creator_posts WHERE id = $1`, [ids.aTue])).photo_help_at, "asking the team for a photo is saved");
  assert.equal((await page.loadFellowView(asha)).me.thisWeek.posts.find((p) => Number(p.id) === ids.aTue).photoHelp, true);
  await refused(() => page.applyFellowChange(asha, { intent: "photo-help", postId: ids.kTue }), 404, "help on another fellow's post");
  await assert.rejects(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue }), (e) => e.status === 409, "asking for help doesn't unlock it");
  await refused(() => page.addFellowImage("photo", asha, ids.kTue, PHOTO), 404, "a photo on another fellow's post");
  await refused(() => page.addFellowImage("photo", asha, ids.aNext, PHOTO), 404, "a photo on next week's post");
  await refused(() => page.addFellowImage("photo", asha, ids.aTue, Buffer.alloc(5 * 1024 * 1024 + 1, 0xff)), 413, "a photo over 5 MB");
  const p0 = Date.now();
  for (let i = 0; i < 4; i++) await page.addFellowImage("photo", asha, ids.aTue, PHOTO, p0 + i);
  await refused(() => page.addFellowImage("photo", asha, ids.aTue, PHOTO, p0 + 9), 409, "a fifth photo");
  let photos = await photosOn(ids.aTue);
  assert.equal(photos.length, 4);
  assert.match(photos[0], new RegExp(`^fellow-proof/1/${ids.aTue}/photo/${p0}-[0-9a-f]{12}\\.jpg$`), "photos live under /photo/");
  assert.equal((await one(`SELECT photo_help_at FROM ugc_creator_posts WHERE id = $1`, [ids.aTue])).photo_help_at, null, "a photo answers the request for help");
  assert.equal((await one(`SELECT screenshot_url FROM ugc_creator_posts WHERE id = $1`, [ids.aTue])).screenshot_url, null, "photos never mix with screenshots");
  const ph0 = photos[0].split("/").pop().slice(0, -4);
  assert.deepEqual([...(await page.readFellowImage("photo", asha, ids.aTue, ph0))], [...PHOTO]);
  assert.equal(await page.readFellowImage("shot", asha, ids.aTue, ph0), null, "a photo isn't readable as a screenshot");
  assert.equal(await page.readFellowImage("photo", kiran, ids.aTue, ph0), null, "another fellow can't see it");
  await page.removeFellowImage("photo", asha, ids.aTue, ph0, p0 + 3 * 24 * 3600 * 1000);
  photos = await photosOn(ids.aTue);
  assert.equal(photos.length, 3, "a photo can be removed any time before the post goes out");
  assert.equal(storedType.get(photos[0].slice("fellow-proof/".length)), "image/jpeg");

  // ---------------------------------------------------------------- their own version waits for the team's approval
  const MINE = "This is how I would say it myself, in my own words, with nothing that sounds made up.\n\nSecond paragraph.";
  const tueBody = (await one(`SELECT body FROM ugc_creator_posts WHERE id = $1`, [ids.aTue])).body;
  await assert.rejects(() => page.applyFellowChange(asha, { intent: "rewrite", postId: ids.aTue, text: "too short" }), (e) => e.status === 400, "a version needs the whole post");
  await assert.rejects(() => page.applyFellowChange(asha, { intent: "rewrite", postId: ids.aTue, text: `  ${tueBody}  ` }), (e) => e.status === 400 && /same as the post/.test(e.message), "an unchanged version isn't sent");
  await refused(() => page.applyFellowChange(asha, { intent: "rewrite", postId: ids.kTue, text: MINE }), 404, "a version of another fellow's post");
  await page.applyFellowChange(asha, { intent: "rewrite", postId: ids.aTue, text: MINE });
  let mineV = (await page.loadFellowView(asha)).me.thisWeek.posts.find((p) => Number(p.id) === ids.aTue);
  assert.equal(mineV.yourVersion.text, MINE, "the page shows their version as waiting");
  assert.equal(mineV.body, tueBody, "the post itself stays as approved until the team decides");
  await assert.rejects(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue }), (e) => e.status === 409 && /with Studojo for approval/.test(e.message), "no posting while their version waits");
  await page.applyFellowChange(asha, { intent: "rewrite-withdraw", postId: ids.aTue });
  assert.equal((await one(`SELECT rewrite_body FROM ugc_creator_posts WHERE id = $1`, [ids.aTue])).rewrite_body, null, "withdrawn, the original can go out");
  // The team kept the original: their page shows why, until they post it.
  await setup.query(`UPDATE ugc_creator_posts SET rewrite_reply = 'The first line is what works on LinkedIn.' WHERE id = $1`, [ids.aTue]);
  mineV = (await page.loadFellowView(asha)).me.thisWeek.posts.find((p) => Number(p.id) === ids.aTue);
  assert.deepEqual([mineV.yourVersion, mineV.versionReply], [null, "The first line is what works on LinkedIn."]);

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
  await refused(() => page.addFellowImage("photo", asha, ids.aTue, PHOTO), 409, "photos can't change once posted");
  await refused(() => page.removeFellowImage("photo", asha, ids.aTue, photos[1].split("/").pop().slice(0, -4)), 409, "a posted post's photos stay");
  await refused(() => page.applyFellowChange(asha, { intent: "photo-help", postId: ids.aTue }), 409, "no help needed once posted");
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aTue, url: "https://www.linkedin.com/posts/asha-again-activity-4" }), 409, "posted twice");
  await refused(() => page.applyFellowChange(asha, { intent: "numbers", postId: ids.aThu, impressions: 1, reactions: 1, comments: 1 }), 409, "numbers before posting");
  await page.applyFellowChange(asha, { intent: "numbers", postId: ids.aTue, impressions: "1,240", reactions: 31, comments: "4" });
  assert.equal((await one(`SELECT impressions FROM ugc_creator_posts WHERE id = $1`, [ids.aTue])).impressions, 1240);
  // "Did you post it?" can be answered without a link; the link can be added once, later.
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.kTue }), 404, "posted without a link on another fellow's post");
  // The team adds a photo from the admin panel (same column, same format): that unlocks it too.
  await setup.query(`UPDATE ugc_creator_posts SET photo_url = $2 WHERE id = $1`, [ids.aMissed, JSON.stringify([`fellow-proof/1/${ids.aMissed}/photo/${p0}-abcdefabcdef.jpg`])]);
  await page.applyFellowChange(asha, { intent: "posted", postId: ids.aMissed });
  const late = await one(`SELECT status, post_url, posted_at FROM ugc_creator_posts WHERE id = $1`, [ids.aMissed]);
  assert.deepEqual([late.status, late.post_url], ["posted", null], "last week's post can be marked late, without a link");
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aMissed, url: "" }), 409, "marked again without a link");
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aMissed, url: "https://www.linkedin.com/posts/kiran-activity-2" }), 409, "a link already saved for another fellow's post");
  await page.applyFellowChange(asha, { intent: "posted", postId: ids.aMissed, url: "https://www.linkedin.com/posts/asha-late-activity-5" });
  const linked = await one(`SELECT status, post_url, posted_at FROM ugc_creator_posts WHERE id = $1`, [ids.aMissed]);
  assert.equal(linked.post_url, "https://www.linkedin.com/posts/asha-late-activity-5", "the link is added later");
  assert.equal(linked.posted_at.getTime(), late.posted_at.getTime(), "adding the link keeps the time it was marked as posted");
  await refused(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aMissed, url: "https://www.linkedin.com/posts/asha-other-activity-6" }), 409, "a saved link can't be replaced");

  // The team puts a post on hold ('blocked'): the page shows a notice without its text, and every change is refused.
  await addPost("aHeld", 1, thu, "blocked", { body: `HELD-${SECRET}` });
  for (const change of [{ intent: "posted", url: "https://www.linkedin.com/posts/asha-held-activity-9" }, { intent: "line", line: "x" }, { intent: "numbers", impressions: 1, reactions: 1, comments: 1 }]) {
    await assert.rejects(() => page.applyFellowChange(asha, { ...change, postId: ids.aHeld }), (e) => e.status === 409 && /on hold/.test(e.message), `${change.intent} on a held post`);
  }
  await page.applyFellowChange(asha, { intent: "copied", postId: ids.aHeld });
  const heldRow = await one(`SELECT status, copied_at, own_line, post_url FROM ugc_creator_posts WHERE id = $1`, [ids.aHeld]);
  assert.deepEqual([heldRow.status, heldRow.copied_at, heldRow.own_line, heldRow.post_url], ["blocked", null, null, null], "a held post is untouched");
  const heldView = await page.loadFellowView(asha);
  assert.equal(heldView.me.thisWeek.posts.find((p) => Number(p.id) === ids.aHeld)?.status, "blocked");
  assert.ok(!JSON.stringify(heldView).includes(SECRET), "a held post's text never reaches the page");
  await setup.query(`DELETE FROM ugc_creator_posts WHERE id = $1`, [ids.aHeld]);

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
  // A name in a shared story can be fixed (speech-to-text mishears names), by its own fellow only, and nothing else.
  const kStory = (await one(`SELECT id FROM ugc_creator_stories WHERE creator_id = 2 ORDER BY id LIMIT 1`)).id;
  await setup.query(`UPDATE ugc_creator_stories SET text = $2, coach = $3 WHERE id = $1`, [kStory, "At Peakloop I ran the peakloop challenge. Peakloopers loved it; Peakloop grew.",
    JSON.stringify({ heard: ["You talked about Peakloop."], useful: ["Peakloop grew"], skip: [], next: ["When did Peakloop start?"], tip: "Say Peakloop's numbers.", parts: [kStory], at: "2026-11-05T10:00:00Z" })]);
  await page.applyFellowChange(kiran, { intent: "story-name", storyId: kStory, from: " peakloop ", to: "SpeakLoop" });
  assert.equal((await one(`SELECT text FROM ugc_creator_stories WHERE id = $1`, [kStory])).text,
    "At SpeakLoop I ran the SpeakLoop challenge. Peakloopers loved it; SpeakLoop grew.", "every whole-word match, in any case, and only those");
  const kCoach = (await one(`SELECT coach FROM ugc_creator_stories WHERE id = $1`, [kStory])).coach;
  assert.deepEqual([kCoach.heard, kCoach.useful, kCoach.next, kCoach.tip, kCoach.parts], [["You talked about SpeakLoop."], ["SpeakLoop grew"], ["When did SpeakLoop start?"], "Say SpeakLoop's numbers.", [kStory]],
    "the read-back gets the same fix, and keeps everything else");
  const kText = async () => (await one(`SELECT text FROM ugc_creator_stories WHERE id = $1`, [kStory])).text;
  const kBefore = await kText();
  await refused(() => page.applyFellowChange(asha, { intent: "story-name", storyId: kStory, from: "SpeakLoop", to: "Mine" }), 404, "another fellow's story");
  await refused(() => page.applyFellowChange(kiran, { intent: "story-name", storyId: kStory, from: "Nowhere Inc", to: "Somewhere" }), 400, "a name that isn't in the story");
  await refused(() => page.applyFellowChange(kiran, { intent: "story-name", storyId: kStory, from: "SpeakLoop", to: "a whole new sentence that rewrites the story" }), 400, "more than a name");
  await refused(() => page.applyFellowChange(kiran, { intent: "story-name", storyId: kStory, from: "SpeakLoop", to: "" }), 400, "no right name");
  await refused(() => page.applyFellowChange(kiran, { intent: "story-name", storyId: kStory, from: "SpeakLoop", to: "x".repeat(61) }), 400, "a name over 60 characters");
  await refused(() => page.applyFellowChange(kiran, { intent: "story-name", storyId: "nope", from: "SpeakLoop", to: "Peak" }), 404, "a made-up story id");
  await page.applyFellowChange(kiran, { intent: "story-name", storyId: kStory, from: "SpeakLoop.", to: "x" }).catch(() => {});
  assert.equal(await kText(), kBefore, "refused fixes change nothing, and a pattern character is just a character");
  assert.equal(page.swapName("Visited (Mumbai) and mumbai.", "mumbai", "Pune"), "Visited (Pune) and Pune.");
  assert.equal(page.swapName("a+b", "a+b", "c"), "c", "the name is matched as written, not as a pattern");
  await setup.query(`DELETE FROM ugc_creator_stories WHERE creator_id = 2`);
  await setup.query(`INSERT INTO ugc_creator_stories (creator_id, text) SELECT 1, 'an earlier story today' FROM generate_series(1, 24)`);
  const burst = await Promise.allSettled(Array.from({ length: 12 }, (_, i) => page.applyFellowChange(asha, { intent: "story", text: `A story told in a burst, number ${i}` })));
  const stories = (await one(`SELECT count(*)::int AS n FROM ugc_creator_stories WHERE creator_id = 1`)).n;
  assert.equal(stories, 30, "a burst can't go past 30 a day");
  assert.equal(burst.filter((r) => r.status === "rejected" && r.reason.status === 429).length, 7);
  assert.equal((await one(`SELECT count(*)::int AS n FROM ugc_creator_stories WHERE creator_id = 2`)).n, 0);

  // ---------------------------------------------------------------- reading a talk back
  const { CoachUnavailable, parseCoach } = await import("./fellow-coach.server.ts");
  const READ = { heard: ["You talked about the Pune hackathon"], useful: ["Coming second at the hackathon"], skip: ["The hostel food: nothing to do with your work"], next: ["Who was on your team?", "What did the judges say?"], tip: "Name people and numbers." };
  let calls = [];
  const model = (answer = READ, wait = 0) => async (system, user) => { calls.push({ system, user }); if (wait) await new Promise((r) => setTimeout(r, wait)); return typeof answer === "string" ? answer : JSON.stringify(answer); };
  const coachOn = async (id) => (await one(`SELECT coach FROM ugc_creator_stories WHERE id = $1`, [id])).coach;
  const storyOf = async (fellow, id) => (await page.loadFellowView(fellow)).me.stories.find((x) => Number(x.id) === id);
  const [p1, p2, p3] = (await setup.query(`SELECT id FROM ugc_creator_stories WHERE creator_id = 1 ORDER BY id DESC LIMIT 3`)).rows.map((r) => r.id).reverse();
  await setup.query(`UPDATE ugc_creator_stories SET text = 'Part one: the hackathon in Pune, ' || id WHERE id = $1`, [p1]);
  await setup.query(`UPDATE ugc_creator_stories SET text = 'Part two: we came second, ' || id WHERE id = $1`, [p2]);
  // One talk saved in two parts is read once, as one text, and the read-back goes on its last part.
  await page.coachTalk(asha, [String(p2), p1], model());
  assert.equal(calls.length, 1);
  assert.match(calls[0].user, /Part one: the hackathon[\s\S]*Part two: we came second/, "the parts are read in order, as one talk");
  assert.match(calls[0].user, /3rd year BBA at Test College/, "the read-back knows their course");
  assert.match(calls[0].user, /roles like Brand manager/);
  assert.match(calls[0].user, /topics: College life, Internships/, "the form's lists read as plain text");
  assert.match(calls[0].user, /avoid: Politics/);
  assert.ok(!calls[0].user.includes(SECRET) && !calls[0].user.includes("asha@example.com"), "no team notes or contact details go to the model");
  assert.match(calls[0].user, /Stories they shared before[\s\S]*an earlier story today/, "earlier stories are listed, so questions don't repeat them");
  const saved = await coachOn(p2);
  assert.deepEqual(saved.next, READ.next);
  assert.deepEqual(saved.parts, [p1, p2]);
  assert.equal(await coachOn(p1), null);
  // Read once: asking again doesn't call the model.
  await page.coachTalk(asha, [p1, p2], model());
  assert.equal(calls.length, 1, "a talk is read back once");
  let sv = await storyOf(asha, p2);
  assert.deepEqual(sv.coach, READ, "the page gets the read-back, and only its five parts");
  assert.equal(sv.canCoach, false);
  assert.equal((await storyOf(asha, p1)).canCoach, false, "a part the read-back covered doesn't offer its own");
  assert.equal((await storyOf(asha, p3)).canCoach, true, "a story from today without one does");
  assert.ok(!JSON.stringify(await page.loadFellowView(asha)).includes(SECRET));
  // Only the fellow's own stories, from the last day, and a sensible number of parts.
  const kiranStory = Number((await one(`INSERT INTO ugc_creator_stories (creator_id, text) VALUES (2, 'Kiran''s own story about his internship') RETURNING id`)).id);
  await refused(() => page.coachTalk(asha, [kiranStory], model()), 404, "another fellow's story");
  await refused(() => page.coachTalk(asha, [p3, kiranStory], model()), 404, "a talk with another fellow's story in it");
  await setup.query(`UPDATE ugc_creator_stories SET created_at = now() - interval '25 hours' WHERE id = $1`, [p1]);
  await setup.query(`UPDATE ugc_creator_stories SET coach = NULL WHERE id = $1`, [p2]);
  await refused(() => page.coachTalk(asha, [p1, p2], model()), 404, "a story older than a day");
  assert.equal((await storyOf(asha, p1)).canCoach, false, "an old story doesn't offer feedback");
  for (const bad of [[], "12", [0], ["x"], [-3], Array.from({ length: 13 }, (_, i) => p3 + i)]) {
    await refused(() => page.coachTalk(asha, bad, model()), 404, `story ids ${JSON.stringify(bad)}`);
  }
  assert.equal(calls.length, 1, "nothing refused reached the model");
  // The model failing, or answering badly: the fellow is told, and can ask again straight away.
  await refused(() => page.coachTalk(asha, [p3], async () => { throw new CoachUnavailable("down"); }), 503, "the model is down");
  assert.equal(await coachOn(p3), null, "a failed read leaves no claim behind");
  await refused(() => page.coachTalk(asha, [p3], model("not json")), 503, "an answer that isn't JSON");
  await refused(() => page.coachTalk(asha, [p3], model({ heard: [], next: ["q"] })), 503, "an answer with nothing heard");
  await refused(() => page.applyFellowChange(asha, { intent: "coach", storyIds: [p3] }), 503, "no model key on this environment");
  assert.equal(await coachOn(p3), null);
  // Two pages asking at once: one model call; the other sees it being read.
  calls = [];
  const slow = page.coachTalk(asha, [p3], model(READ, 300));
  await new Promise((r) => setTimeout(r, 50));
  sv = await storyOf(asha, p3);
  assert.equal(sv.reading, true, "the page shows a story being read");
  assert.equal(sv.canCoach, false);
  await page.coachTalk(asha, [p3], model());
  await slow;
  assert.equal(calls.length, 1, "two asks at once, one model call");
  assert.deepEqual((await storyOf(asha, p3)).coach, READ);
  // A read that died mid-way can be taken again after two minutes.
  await setup.query(`UPDATE ugc_creator_stories SET coach = jsonb_build_object('pending', true, 'at', now() - interval '3 minutes') WHERE id = $1`, [p3]);
  assert.equal((await storyOf(asha, p3)).canCoach, true, "a stale read offers feedback again");
  await page.coachTalk(asha, [p3], model());
  assert.equal(calls.length, 2);
  // Answering a follow-up question: the question comes from the stored read-back, never the request.
  await page.coachTalk(kiran, [kiranStory], model());
  await page.applyFellowChange(kiran, { intent: "story", text: "Riya and Dev were on my team, both in second year.", spoken: true, replyTo: String(kiranStory), q: 0 });
  await page.applyFellowChange(kiran, { intent: "story", text: "An answer to a question that isn't there.", replyTo: kiranStory, q: 7, prompt: "Something you learned the hard way" });
  await page.applyFellowChange(kiran, { intent: "story", text: "An answer pointed at someone else's story.", replyTo: p3, q: 0 });
  const answers = (await setup.query(`SELECT prompt, reply_to FROM ugc_creator_stories WHERE creator_id = 2 AND id > $1 ORDER BY id`, [kiranStory])).rows;
  // A follow-up answer is read with the story it follows up.
  const firstAnswer = Number((await one(`SELECT id FROM ugc_creator_stories WHERE creator_id = 2 AND reply_to = $1`, [kiranStory])).id);
  calls = [];
  await page.coachTalk(kiran, [firstAnswer], model());
  assert.match(calls[0].user, /follow-up question about this earlier story[\s\S]*Kiran's own story about his internship/, "the answer is read with the story it follows up");
  assert.deepEqual(answers, [
    { prompt: "Who was on your team?", reply_to: kiranStory },
    { prompt: "Something you learned the hard way", reply_to: null },
    { prompt: null, reply_to: null },
  ], "a real question links the answer; anything else is an ordinary story");
  await refused(() => page.applyFellowChange(kiran, { intent: "story", text: "An answer to a story id that isn't one.", replyTo: "abc", q: 0 }), 404, "a reply to a non-id");
  const kv = (await page.loadFellowView(kiran)).me.stories;
  assert.equal(kv.find((x) => x.prompt === "Who was on your team?").replyTo, String(kiranStory), "the page knows which story an answer follows up");
  assert.ok(kv.every((x) => !JSON.stringify(x).includes("Part one")), "no other fellow's stories");
  // The model's answer, cleaned: no dashes, capped lines, at most three questions.
  const clean = parseCoach(JSON.stringify({ heard: "You talked about Pune \u2014 and the team", useful: ["a", "b", "c", "d", "e"], skip: null, next: ["one", "two", "three", "four"], tip: "x".repeat(400) }));
  assert.deepEqual(clean.heard, ["You talked about Pune, and the team"]);
  assert.equal(clean.useful.length, 4);
  assert.deepEqual(clean.skip, []);
  assert.equal(clean.next.length, 3);
  assert.ok(clean.tip.length <= 240);
  await setup.query(`DELETE FROM ugc_creator_stories WHERE creator_id = 2`);

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

  // ---------------------------------------------------------------- analytics screenshots: retired, still readable
  const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
  await refused(() => page.addFellowImage("shot", asha, ids.aTue, JPEG), 410, "screenshots aren't taken any more");
  const oldShot = `${Date.now() - 86400000}-abcdefabcdef`;
  await setup.query(`UPDATE ugc_creator_posts SET screenshot_url = $2 WHERE id = $1`, [ids.aTue, JSON.stringify([`fellow-proof/1/${ids.aTue}/${oldShot}.jpg`])]);
  stored.set(`1/${ids.aTue}/${oldShot}.jpg`, JPEG);
  await refused(() => page.removeFellowImage("shot", asha, ids.aTue, oldShot), 410, "nor removed");
  assert.deepEqual([...(await page.readFellowImage("shot", asha, ids.aTue, oldShot))], [...JPEG], "one saved before can still be opened");
  assert.equal(await page.readFellowImage("shot", kiran, ids.aTue, oldShot), null, "by its own fellow only");
  await refused(() => page.readFellowImage("shot", asha, ids.aTue, "../../etc/passwd"), 404, "a made-up token");

  const PROOF = "https://studojo.com/api/fellowship-growth/";
  const proofReq = (slug, qs, init) => new Request(`${PROOF}${slug}/proof?${qs}`, init);
  res = await proofRoute.loader({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aTue}&shot=${oldShot}`) });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "image/jpeg");
  assert.equal(res.headers.get("cache-control"), "private, no-store");
  assert.equal(res.headers.get("cross-origin-resource-policy"), "same-origin");
  res = await proofRoute.loader({ params: { slug: "kiran-p7w2m4tq" }, request: proofReq("kiran-p7w2m4tq", `post=${ids.aTue}&shot=${oldShot}`) });
  assert.equal(res.status, 404, "Kiran's address can't open Asha's screenshot");
  res = await proofRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aDone}`, { method: "POST", headers: { "content-type": "image/jpeg" }, body: JPEG }) });
  assert.equal(res.status, 410, "the page can't add a screenshot");
  res = await proofRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aTue}&shot=${oldShot}`, { method: "DELETE" }) });
  assert.equal(res.status, 410);
  res = await proofRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aThu}&kind=photo`, { method: "POST", headers: { "content-type": "multipart/form-data" }, body: JPEG }) });
  assert.equal(res.status, 415, "image/jpeg only, so another site's form can't post here");
  res = await proofRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aThu}&kind=photo`, { method: "POST", headers: { "content-type": "image/jpeg" }, body: Buffer.alloc(5 * 1024 * 1024 + 1, 0xff) }) });
  assert.equal(res.status, 413, "over 5 MB");
  res = await proofRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aDone}`, { method: "PUT", body: JPEG }) });
  assert.equal(res.status, 405);

  // ---------------------------------------------------------------- LinkedIn's weekly analytics export
  const xlsx = async (sheets) => {
    const zip = new JSZip();
    const cell = (v, r, c) => (v == null ? "" : typeof v === "number"
      ? `<c r="${String.fromCharCode(65 + c)}${r}"><v>${v}</v></c>`
      : `<c r="${String.fromCharCode(65 + c)}${r}" t="inlineStr"><is><t>${v}</t></is></c>`);
    sheets.forEach((rows, k) => zip.file(`xl/worksheets/sheet${k + 1}.xml`,
      `<worksheet><sheetData>${rows.map((row, i) => `<row r="${i + 1}">${row.map((v, c) => cell(v, i + 1, c)).join("")}</row>`).join("")}</sheetData></worksheet>`));
    return Buffer.from(await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }));
  };
  // The export as LinkedIn writes it: month-first dates, the last 7 days up to today.
  const mdy = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${m}/${d}/${y}`; };
  const today = istDate(), from = addDays(today, -6), before = addDays(today, -20);
  const ACT = { done: "7254000000000000001", tue: "7254000000000000002", other: "7254000000000000099" };
  const liUrl = (a) => `https://www.linkedin.com/feed/update/urn:li:activity:${a}/`;
  const weekFile = (n) => xlsx([
    [["Overall Performance", `${mdy(from)} - ${mdy(today)}`], ["Impressions", n.total], ["Members reached", 1227]],
    [["Date", "Impressions", "Engagements"], [mdy(from), 100, 2], [mdy(today), 300, 9]],
    [["Post URL", "Post publish date", "Engagements", null, "Post URL", "Post publish date", "Impressions"],
      [liUrl(ACT.done), mdy(today), 40, null, liUrl(ACT.done), mdy(today), n.done],
      [liUrl(ACT.tue), mdy(before), 12, null, liUrl(ACT.tue), mdy(before), 77],
      [liUrl(ACT.other), mdy(from), 3, null, liUrl(ACT.other), mdy(from), 55]],
    [["Total followers on " + mdy(today) + ":", 845], [], ["Date", "New followers"], [mdy(from), 2], [mdy(today), 1]],
    [["Top Demographics", "Value", "Percentage"], ["Job titles", "Student", "0.34"], ["Locations", "Pune", 0.4]],
  ]);
  const rowsFor = async (creator) => (await setup.query(`SELECT * FROM ugc_creator_analytics WHERE creator_id = $1 ORDER BY id`, [creator])).rows;
  const storedFiles = () => [...stored.keys()].filter((k) => k.includes("/analytics/")).length;
  // aDone went out today; aTue's link names a post published before the period, so the file has only part of its impressions.
  await setup.query(`UPDATE ugc_creator_posts SET post_url = $2 WHERE id = $1`, [ids.aDone, `https://www.linkedin.com/posts/asha-done-activity-${ACT.done}-AbCd`]);
  await setup.query(`UPDATE ugc_creator_posts SET post_url = $2 WHERE id = $1`, [ids.aTue, `https://www.linkedin.com/posts/asha-tue-activity-${ACT.tue}-XyZw`]);
  const tueBefore = await one(`SELECT impressions, reactions, comments FROM ugc_creator_posts WHERE id = $1`, [ids.aTue]);
  const good = await weekFile({ total: 3101, done: 1873 });
  const noImpressions = await xlsx([[["Reactions", 3]]]);
  await refused(() => page.addFellowAnalytics(asha, JPEG), 415, "not an .xlsx");
  await refused(() => page.addFellowAnalytics(asha, noImpressions), 422, "an .xlsx with no impressions");
  await refused(() => page.addFellowAnalytics(asha, Buffer.alloc(5 * 1024 * 1024 + 1, 0x50)), 413, "over 5 MB");
  assert.equal(storedFiles(), 0, "nothing is stored for a refused file");
  assert.equal((await rowsFor(1)).length, 0);

  const a0 = Date.now();
  await page.addFellowAnalytics(asha, good, a0);
  let week = await rowsFor(1);
  assert.equal(week.length, 1);
  assert.match(week[0].file_url, new RegExp(`^fellow-proof/1/analytics/${a0}-[0-9a-f]{12}\\.xlsx$`), "the file is kept on the fellow, not on a post");
  assert.deepEqual([...stored.get(week[0].file_url.slice("fellow-proof/".length))], [...good]);
  assert.equal(storedType.get(week[0].file_url.slice("fellow-proof/".length)), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  assert.deepEqual([istDate(week[0].period_start.getTime() + 12 * 3600e3), istDate(week[0].period_end.getTime() + 12 * 3600e3)], [from, today]);
  assert.equal(week[0].uploaded_at.getTime(), a0);
  const data = week[0].data;
  assert.deepEqual(Object.keys(data).sort(), ["daily", "demographics", "periodEnd", "periodStart", "posts", "totals"]);
  assert.deepEqual(data.totals, { impressions: 3101, membersReached: 1227, totalFollowers: 845, engagements: 11, newFollowers: 3 });
  assert.deepEqual(data.posts.map((p) => [p.url, p.postId]), [[liUrl(ACT.done), ids.aDone], [liUrl(ACT.tue), ids.aTue], [liUrl(ACT.other), null]],
    "posts mapped to the fellow's own by the activity number in their saved link");
  assert.deepEqual(data.demographics, { "Job titles": [{ value: "Student", pct: 0.34 }], Locations: [{ value: "Pune", pct: 0.4 }] });
  let done = await one(`SELECT impressions, reactions, comments, metrics_at, analytics FROM ugc_creator_posts WHERE id = $1`, [ids.aDone]);
  assert.equal(done.impressions, 1873, "a post published in the period gets its impressions from the file");
  assert.ok(done.metrics_at);
  assert.deepEqual(done.analytics, { uploadedAt: new Date(a0).toISOString(), file: week[0].file_url, postedOn: today, postUrl: liUrl(ACT.done), metrics: { impressions: 1873, engagements: 40 }, demographics: {} });
  assert.deepEqual([done.reactions, done.comments], [null, null], "the file has no reactions or comments for a post");
  const tueAfter = await one(`SELECT impressions, reactions, comments, analytics FROM ugc_creator_posts WHERE id = $1`, [ids.aTue]);
  assert.deepEqual([tueAfter.impressions, tueAfter.reactions, tueAfter.comments, tueAfter.analytics], [tueBefore.impressions, tueBefore.reactions, tueBefore.comments, null],
    "a post published before the period keeps its numbers: the file has only part of its impressions");
  let anView = await page.loadFellowView(asha);
  assert.deepEqual(anView.me.analytics, { at: anView.me.analytics.at, periodStart: from, periodEnd: today, impressions: 3101, membersReached: 1227, newFollowers: 3,
    audience: { jobTitle: { value: "Student", pct: 0.34 }, location: { value: "Pune", pct: 0.4 }, industry: null } }, "the totals and the top of who saw them");
  const doneView = anView.me.history.flatMap((w) => w.posts).find((p) => Number(p.id) === ids.aDone);
  assert.ok(doneView.analyticsAt);
  assert.deepEqual(doneView.metrics, { impressions: 1873, reactions: null, comments: null }, "unknown counts stay unknown, never 0");
  // The same week again: both kept, the newest counts.
  await page.addFellowAnalytics(asha, await weekFile({ total: 3300, done: 2050 }), a0 + 1);
  assert.equal((await rowsFor(1)).length, 2);
  assert.equal((await one(`SELECT impressions FROM ugc_creator_posts WHERE id = $1`, [ids.aDone])).impressions, 2050);
  assert.equal((await page.loadFellowView(asha)).me.analytics.impressions, 3300);
  // Kiran uploading a file that lists Asha's posts changes nothing of Asha's.
  await page.addFellowAnalytics(kiran, await weekFile({ total: 10, done: 1 }), a0 + 2);
  assert.equal((await one(`SELECT impressions FROM ugc_creator_posts WHERE id = $1`, [ids.aDone])).impressions, 2050);
  assert.ok((await rowsFor(2))[0].data.posts.every((p) => p.postId === null));
  // Storage failing leaves nothing behind.
  proofStore.put = async () => { throw new Error("storage down"); };
  const lost = await weekFile({ total: 9999, done: 9999 });
  await assert.rejects(() => page.addFellowAnalytics(asha, lost, a0 + 3));
  proofStore.put = async (name, data, type) => { if (stored.has(name)) throw new Error("overwrite"); stored.set(name, Buffer.from(data)); storedType.set(name, type); };
  assert.equal((await rowsFor(1)).length, 2);
  assert.equal((await one(`SELECT impressions FROM ugc_creator_posts WHERE id = $1`, [ids.aDone])).impressions, 2050);
  // Ten uploads a day.
  for (let i = 0; i < 8; i++) await setup.query(`INSERT INTO ugc_creator_analytics (creator_id, file_url, data) VALUES (1, 'x', '{}')`);
  await refused(() => page.addFellowAnalytics(asha, good, a0 + 4), 429, "an eleventh upload in a day");
  await setup.query(`DELETE FROM ugc_creator_analytics WHERE file_url = 'x'`);

  const anReq = (slug, init) => new Request(`${PROOF}${slug}/analytics`, init);
  const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  res = await analyticsRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: anReq("asha-k3m9x2qa", { method: "POST", headers: { "content-type": "multipart/form-data" }, body: good }) });
  assert.equal(res.status, 415, "the .xlsx type only, so another site's form can't post here");
  res = await analyticsRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: anReq("asha-k3m9x2qa", { method: "POST", headers: { "content-type": XLSX }, body: Buffer.alloc(5 * 1024 * 1024 + 1, 0x50) }) });
  assert.equal(res.status, 413);
  res = await analyticsRoute.action({ params: { slug: "gone-z5y4x3w2" }, request: anReq("gone-z5y4x3w2", { method: "POST", headers: { "content-type": XLSX }, body: good }) });
  assert.equal(res.status, 404, "a removed fellow's address can't upload");
  res = await analyticsRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: anReq("asha-k3m9x2qa", { method: "POST", headers: { "content-type": XLSX }, body: noImpressions }) });
  assert.equal(res.status, 422);
  assert.match((await res.json()).error, /doesn't look like LinkedIn's analytics export/);
  res = await analyticsRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: anReq("asha-k3m9x2qa", { method: "POST", headers: { "content-type": XLSX }, body: await weekFile({ total: 4000, done: 2600 }) }) });
  assert.equal(res.status, 200);
  const fresh = await res.json();
  assert.equal(fresh.me.analytics.impressions, 4000, "the answer is the fresh view");
  assert.equal(fresh.me.history.flatMap((w) => w.posts).find((p) => Number(p.id) === ids.aDone).metrics.impressions, 2600);
  assert.equal(analyticsRoute.loader().status, 405);
  res = await analyticsRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: anReq("asha-k3m9x2qa", { method: "PUT", body: good }) });
  assert.equal(res.status, 405);

  // Photos go through the same route, by kind.
  res = await proofRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aThu}&kind=photo`, { method: "POST", headers: { "content-type": "image/jpeg" }, body: JPEG }) });
  assert.equal(res.status, 200);
  const thuPost = (await res.json()).me.thisWeek.posts.find((p) => Number(p.id) === ids.aThu);
  assert.deepEqual([thuPost.photos.length, thuPost.analyticsAt], [1, null], "a photo, nothing else");
  res = await proofRoute.loader({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aThu}&photo=${thuPost.photos[0]}`) });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "image/jpeg");
  res = await proofRoute.loader({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aThu}&shot=${thuPost.photos[0]}`) });
  assert.equal(res.status, 404, "a photo's token doesn't open it as a screenshot");
  res = await proofRoute.action({ params: { slug: "asha-k3m9x2qa" }, request: proofReq("asha-k3m9x2qa", `post=${ids.aThu}&photo=${thuPost.photos[0]}`, { method: "DELETE" }) });
  assert.equal(res.status, 200);
  assert.equal((await photosOn(ids.aThu)).length, 0);
  // Copied and put up on LinkedIn with their own photo (the founder, 9 Nov 2026): with no photo here, the link marks it posted.
  await assert.rejects(() => page.applyFellowChange(asha, { intent: "posted", postId: ids.aThu }), (e) => e.status === 409 && /link/.test(e.message), "no photo here needs the link");
  await page.applyFellowChange(asha, { intent: "posted", postId: ids.aThu, url: "https://www.linkedin.com/posts/asha-own-photo-activity-7392000000000000009-AbCd" });
  const own = await one(`SELECT status, post_url FROM ugc_creator_posts WHERE id = $1`, [ids.aThu]);
  assert.deepEqual([own.status, /activity-7392000000000000009/.test(own.post_url)], ["posted", true], "posted with its link, no photo here");

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
