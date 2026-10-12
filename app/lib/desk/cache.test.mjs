// The desk's query cache (cache.ts) and URL state (nav.ts).
//
// The agent stream refreshes the workspace by invalidate words, so the
// mapping from words to resources, and what happens to resources on and off
// screen, is the thing that makes chat and tabs agree.
import assert from "node:assert/strict";
import {
  entryId,
  fetchResource,
  invalidate,
  patternMatches,
  peekAll,
  peekResource,
  primeFromBootstrap,
  resetDeskCache,
  setDefaultLoader,
  setResource,
  watchResource,
} from "./cache.ts";
import { deskPath, parseDeskParams, serializeDeskParams } from "./nav.ts";

const tick = () => new Promise((r) => setTimeout(r, 0));
let failures = 0;
async function test(name, fn) {
  resetDeskCache();
  try {
    await fn();
    console.log(`  ok  ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${name}\n       ${err?.message ?? err}`);
  }
}

await test("entry ids and patterns", () => {
  assert.equal(entryId("outreach"), "outreach");
  assert.equal(entryId("outreach", { status: "sent" }), 'outreach|{"status":"sent"}');
  assert.equal(entryId("replies", "badge"), "replies|badge");
  assert.ok(patternMatches("match:*", "match:12"));
  assert.ok(!patternMatches("match:*", "matches"));
  assert.ok(patternMatches("outreach", "outreach"));
  assert.ok(!patternMatches("outreach", "outreach:d_8"));
});

await test("a watched resource loads once and refetches on its invalidate word", async () => {
  let calls = 0;
  const stop = watchResource("outreach", async () => ({ n: ++calls }));
  await tick();
  assert.deepEqual(peekResource("outreach"), { n: 1 });
  invalidate(["status"]);
  await tick();
  assert.equal(calls, 1, "status does not touch outreach");
  invalidate(["outreach"]);
  await tick();
  assert.deepEqual(peekResource("outreach"), { n: 2 });
  stop();
});

await test("matches covers top_matches and every match:<id>; outreach covers outreach:<id>", async () => {
  const seen = [];
  const stops = ["matches", "top_matches", "match:9912", "outreach:d_88", "profile"].map((k) =>
    watchResource(k, async () => {
      seen.push(k);
      return k;
    }),
  );
  await tick();
  seen.length = 0;
  invalidate(["matches"]);
  await tick();
  assert.deepEqual(seen.sort(), ["match:9912", "matches", "top_matches"]);
  seen.length = 0;
  invalidate(["outreach"]);
  await tick();
  assert.deepEqual(seen.sort(), ["outreach:d_88", "top_matches"]);
  stops.forEach((s) => s());
});

await test("every params variant of a key refreshes", async () => {
  const loads = [];
  const a = watchResource(entryId("outreach", { status: "all" }), async () => (loads.push("all"), "all"));
  const b = watchResource(entryId("outreach", { status: "sent" }), async () => (loads.push("sent"), "sent"));
  await tick();
  loads.length = 0;
  invalidate(["outreach"]);
  await tick();
  assert.deepEqual(loads.sort(), ["all", "sent"]);
  assert.equal(peekAll("outreach").length, 2);
  a();
  b();
});

await test("off screen: marked stale, refetched when watched again", async () => {
  let calls = 0;
  const stop = watchResource("profile", async () => ++calls);
  await tick();
  stop();
  invalidate(["profile"]);
  await tick();
  assert.equal(calls, 1, "no fetch while nobody is looking");
  const again = watchResource("profile", async () => ++calls);
  await tick();
  assert.equal(calls, 2);
  assert.equal(peekResource("profile"), 2);
  again();
});

await test("fresh data is not refetched on remount", async () => {
  let calls = 0;
  const s1 = watchResource("settings", async () => ++calls);
  await tick();
  s1();
  const s2 = watchResource("settings", async () => ++calls);
  await tick();
  assert.equal(calls, 1);
  s2();
});

await test("a slow old response never overwrites a newer one", async () => {
  let release;
  let n = 0;
  setDefaultLoader("memories", () => {
    n++;
    if (n === 1) return new Promise((r) => (release = () => r("old")));
    return Promise.resolve("new");
  });
  const first = fetchResource("memories");
  await fetchResource("memories");
  release();
  await first;
  assert.equal(peekResource("memories"), "new");
});

await test("setResource wins over a request already in flight", async () => {
  let release;
  const stop = watchResource("status", () => new Promise((r) => (release = () => r("from server"))));
  setResource("status", "from approve");
  release();
  await tick();
  assert.equal(peekResource("status"), "from approve");
  stop();
});

await test("errors land on the snapshot, data is kept", async () => {
  let fail = false;
  const stop = watchResource("threads", async () => {
    if (fail) throw new Error("boom");
    return "t1";
  });
  await tick();
  fail = true;
  invalidate(["threads"]);
  await tick();
  assert.equal(peekResource("threads"), "t1");
  stop();
});

await test("primeFromBootstrap seeds every key in its API shape", () => {
  const b = {
    enabled: true,
    user: { id: "u1", first_name: "Riya" },
    status: { state: "launch_ready" },
    settings: { review_before_send: true, followups: true, never_contact: [] },
    status_labels: {},
    top_matches: [{ lead_id: 1 }],
    outreach: { items: [], counts: {}, total: 0, offset: 0, limit: 20 },
    threads: [{ id: 31 }],
    thread: { thread: { id: 31 }, messages: [], latest_run: null, has_more: false },
    suggestions: [],
    greeting: null,
  };
  primeFromBootstrap(b);
  assert.equal(peekResource("bootstrap"), b);
  assert.equal(peekResource("status"), b.status);
  assert.deepEqual(peekResource("top_matches"), [{ lead_id: 1 }]);
  assert.equal(peekResource("outreach"), b.outreach);
  assert.deepEqual(peekResource("threads"), { items: [{ id: 31 }] });
  assert.equal(peekResource("thread:31"), b.thread);
});

await test("URL state round trips and falls back safely", () => {
  assert.equal(deskPath("home"), "/b2cnew");
  assert.equal(deskPath({ to: "home", id: null, filter: "needs_you" }), "/b2cnew?filter=needs_you");
  assert.equal(deskPath({ to: "outreach", id: "d_88", filter: null }), "/b2cnew?tab=outreach&id=d_88");
  assert.equal(deskPath({ to: "outreach", id: null, filter: null }), "/b2cnew");
  assert.equal(deskPath({ to: "people", id: "9912", filter: null }), "/b2cnew?tab=people&lead=9912");
  const p = parseDeskParams("tab=people&q=react&min_score=150&offset=-3&ask=1");
  assert.equal(p.tab, "people");
  assert.equal(p.q, "react");
  assert.equal(p.min_score, 100);
  assert.equal(p.offset, 0);
  assert.equal(p.ask, true);
  assert.equal(parseDeskParams("tab=nope").tab, "home");
  assert.equal(parseDeskParams("tab=outreach").tab, "home", "the outreach page needs an id");
  assert.equal(serializeDeskParams(parseDeskParams("tab=inbox&filter=positive&id=e_4512")), "?tab=inbox&id=e_4512&filter=positive");
});

if (failures) {
  console.log(`\ndesk cache: ${failures} failure(s)`);
  process.exit(1);
}
console.log("desk cache: ok");
