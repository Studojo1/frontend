// LEAD-LATE (7 Nov 2026, the owner on Events Manager: Lead 6.1 of 10). A signed-out Lead's server copy waits for the
// account the visitor makes next and goes with its email, phone and name, at the click's own time and event_id; else
// after 10 minutes as it is. Made-up people only; fetch is stubbed and the accounts are a fake: nothing here reaches
// Meta or a database.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const APP = new URL("../", import.meta.url).pathname;
const sha = (s) => createHash("sha256").update(s).digest("hex");

// The token is read when the module loads; a stand-in, never a real one.
delete process.env.META_TEST_EVENT_CODE;
process.env.META_CAPI_TOKEN = "stand-in-token";
const graph = [];
globalThis.fetch = async (url, init) => {
  assert.ok(String(url).startsWith("https://graph.facebook.com/"), "only Meta's address, stubbed");
  graph.push(JSON.parse(init.body));
  return new Response("{}", { status: 200 });
};

const capi = await import("./meta-capi.server.ts");
const late = await import("./meta-lead-late.server.ts");

// ── sendMetaEvent takes the click's time for a copy sent later; now when it is left out.
await capi.sendMetaEvent({ eventName: "Lead", eventId: "lead_t", user: {}, eventTime: 1_800_000_000_999 });
assert.equal(graph.pop().data[0].event_time, 1_800_000_000);
const before = Math.floor(Date.now() / 1000);
await capi.sendMetaEvent({ eventName: "Lead", eventId: "lead_n", user: {} });
assert.ok(graph.pop().data[0].event_time >= before);

// ── The queue, with a fake clock, sender and accounts.
let now = 1_800_000_000_000;
const sent = [];
const accounts = new Map();
late.setLeadDeps({
  now: () => now,
  send: async (e) => (sent.push(e), { ok: true }),
  accounts: async (ids) => new Map(ids.filter((v) => accounts.has(v)).map((v) => [v, accounts.get(v)])),
});
const click = (vid, extra = {}) => ({
  eventId: `lead_${vid}`,
  at: now,
  sourceUrl: "https://studojo.com/",
  user: { clientIp: "203.0.113.9", userAgent: "UA", fbp: "fb.1.1.1", externalIds: [vid] },
  visitorId: vid,
  ...extra,
});
const MIN = 60_000;

// A click, no account yet: it waits.
late.holdLead(click("vid_riya_test"));
assert.equal(await late.sendReadyLeads(), 0);
assert.equal(late.heldLeadCount(), 1);

// Signed up 40 s after the click, phone not verified yet: still waits (the phone is the point).
accounts.set("vid_riya_test", { id: "user_riya_test", email: "riya.test@example.com", name: "Riya Test", phone: null, signedUpAt: now + 40_000 });
now += MIN;
assert.equal(await late.sendReadyLeads(), 0);

// The phone verified: it goes now, with the account, at the click's time, under the click's event id.
accounts.get("vid_riya_test").phone = "+919800000001";
now += MIN;
assert.equal(await late.sendReadyLeads(), 1);
const lead = sent.pop();
assert.equal(lead.eventName, "Lead");
assert.equal(lead.eventId, "lead_vid_riya_test");
assert.equal(lead.eventTime, now - 2 * MIN, "the click's time, not the send's");
const ud = capi.metaUserDataPayload(lead.user);
assert.deepEqual(ud.em, [sha("riya.test@example.com")]);
assert.deepEqual(ud.ph, [sha("919800000001")]);
assert.deepEqual(ud.fn, [sha("riya")]);
assert.deepEqual(ud.ln, [sha("test")]);
assert.deepEqual(ud.country, [sha("in")]);
assert.deepEqual(ud.external_id, [sha("user_riya_test"), sha("vid_riya_test")]);
assert.equal(ud.client_ip_address, "203.0.113.9", "the click's own request data stays");
assert.equal(ud.fbp, "fb.1.1.1");
assert.equal(late.heldLeadCount(), 0);

// No account in 10 minutes: it goes as it is, at the click's time.
late.holdLead(click("vid_anon_test"));
const clickedAt = now;
now += 9 * MIN;
assert.equal(await late.sendReadyLeads(), 0);
now += MIN;
assert.equal(await late.sendReadyLeads(), 1);
const anon = sent.pop();
assert.equal(anon.eventTime, clickedAt);
assert.equal(anon.user.email, undefined);
assert.deepEqual(capi.metaUserDataPayload(anon.user).external_id, [sha("vid_anon_test")]);

// An account with no verified phone by then: it goes with the email and name.
late.holdLead(click("vid_nophone_test"));
accounts.set("vid_nophone_test", { id: "user_nophone_test", email: "arjun.test@example.com", name: "Arjun Test", phone: null, signedUpAt: now + 5_000 });
now += 10 * MIN;
assert.equal(await late.sendReadyLeads(), 1);
const noPhone = capi.metaUserDataPayload(sent.pop().user);
assert.deepEqual(noPhone.em, [sha("arjun.test@example.com")]);
assert.equal(noPhone.ph, undefined);

// An account made long before the click (someone else on a shared browser): never attached.
late.holdLead(click("vid_shared_test"));
accounts.set("vid_shared_test", { id: "user_old_test", email: "old.test@example.com", name: "Old Test", phone: "+919800000002", signedUpAt: now - 2 * 60 * MIN });
assert.equal(await late.sendReadyLeads(), 0, "an older account does not make it ready");
now += 10 * MIN;
assert.equal(await late.sendReadyLeads(), 1);
assert.equal(sent.pop().user.email, undefined);
assert.equal(late.accountForLead({ at: 1000 * MIN }, { signedUpAt: 1000 * MIN - 30_000 })?.signedUpAt, 1000 * MIN - 30_000, "a minute of clock slack");

// No database: a Lead still goes when its time is up.
late.setLeadDeps({ now: () => now, send: async (e) => (sent.push(e), { ok: true }), accounts: async () => Promise.reject(new Error("down")) });
late.holdLead(click("vid_nodb_test"));
assert.equal(await late.sendReadyLeads(), 0);
now += 10 * MIN;
assert.equal(await late.sendReadyLeads(), 1);
sent.pop();

// A Lead held while the accounts are being read is kept, not lost.
let release;
late.setLeadDeps({
  now: () => now,
  send: async (e) => (sent.push(e), { ok: true }),
  accounts: () => new Promise((r) => (release = () => r(new Map()))),
});
late.holdLead(click("vid_first_test"));
const tick = late.sendReadyLeads();
late.holdLead(click("vid_second_test"));
release();
await tick;
assert.equal(late.heldLeadCount(), 2, "both still held");

// Stopping (SIGTERM): everything held goes at once.
late.setLeadDeps({ now: () => now, send: async (e) => (sent.push(e), { ok: true }), accounts: async () => new Map() });
late.holdLead(click("vid_stop_a_test"));
late.holdLead(click("vid_stop_b_test"));
assert.equal(await late.flushHeldLeads(), 2);
assert.equal(late.heldLeadCount(), 0);
sent.length = 0;

// A flood: past the cap the oldest goes at once, as it is.
for (let i = 0; i < late.LEAD_QUEUE_CAP + 2; i++) late.holdLead(click(`vid_flood_${i}_test`));
await new Promise((r) => setImmediate(r));
assert.equal(late.heldLeadCount(), late.LEAD_QUEUE_CAP);
assert.deepEqual(sent.map((e) => e.eventId), ["lead_vid_flood_0_test", "lead_vid_flood_1_test"]);
late.setLeadDeps(null);

// ── The relay holds a signed-out Lead instead of sending it; a signed-in one still goes at once.
const relay = readFileSync(`${APP}routes/api.meta-event.tsx`, "utf8");
assert.match(relay, /if \(!signedIn && eventName === "Lead" && validVisitorId\(vid\)\) \{\s*holdLead\(\{ eventId, at: Date\.now\(\), sourceUrl, user, visitorId: vid \}\);\s*return ok\(\);/);
assert.ok(relay.indexOf("holdLead(") < relay.indexOf("await sendMetaEvent({"), "held before the immediate send");
const mod = readFileSync(`${APP}lib/meta-lead-late.server.ts`, "utf8");
assert.match(mod, /career_agent\.career_user_source/);
assert.match(mod, /p\.verified_at IS NOT NULL/, "only a verified phone");
assert.match(mod, /process\.once\("SIGTERM", \(\) => void flushHeldLeads\(\)\)/);

console.log("meta-lead-late: ok");
