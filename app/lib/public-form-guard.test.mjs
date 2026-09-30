// AS-N05 / ST-N12 (audit 30 Sep 2026): the anonymous POST surface (contact,
// newsletter, consultation, Sensei ticket, campus ambassador, webinar, and
// the tracking endpoints) had no working per-IP cap.
//
// Drives the real guardPublicForm / checkRateLimit against an in-memory store
// that behaves like a Redis sorted set (members are unique). It also pins the
// bug where every request in the same second shared one member, so a burst
// counted as a single request.
import assert from "node:assert/strict";
import { checkRateLimit, guardPublicForm, HONEYPOT_FIELD, PUBLIC_FORM_PATHS } from "./ratelimit.server.ts";

function fakeRedis() {
  const sets = new Map();
  const get = (k) => sets.get(k) ?? sets.set(k, new Map()).get(k);
  return {
    sets,
    async zRemRangeByScore(k, min, max) {
      for (const [m, s] of get(k)) if (s >= Number(min) && s <= Number(max)) get(k).delete(m);
    },
    async zCard(k) { return get(k).size; },
    async zAdd(k, { score, value }) { get(k).set(value, score); },
    async expire() {},
  };
}

const req = (path, ip = "203.0.113.9") =>
  new Request(`https://studojo.com${path}`, { method: "POST", headers: { "x-forwarded-for": ip } });

// Every public form route is covered.
for (const p of ["/api/contact", "/api/newsletter", "/api/consultation-signup", "/api/sensei-ticket",
  "/api/campus-ambassador-apply", "/api/webinar-register", "/api/webinar-confirm", "/api/webinar-ref-code"]) {
  assert.ok(PUBLIC_FORM_PATHS.has(p), `${p} is not rate limited`);
}

// 1. Honeypot filled: fake success, nothing counted.
let store = fakeRedis();
let res = await guardPublicForm(req("/api/contact"), { name: "x", [HONEYPOT_FIELD]: "http://spam" }, store);
assert.equal(res?.status, 200, "a filled honeypot must be answered, not processed");
assert.equal(store.sets.size, 0);

// 2. A same-second burst is counted request by request and capped at 30.
store = fakeRedis();
let allowed = 0;
let limited = 0;
for (let i = 0; i < 100; i++) {
  const r = await guardPublicForm(req("/api/contact"), { name: "x" }, store);
  if (r === null) allowed++;
  else if (r.status === 429) limited++;
}
assert.equal(allowed, 30, `burst of 100 let ${allowed} through`);
assert.equal(limited, 70);

// 3. Another IP, and the same IP on another form, are counted separately.
assert.equal(await guardPublicForm(req("/api/contact", "198.51.100.7"), {}, store), null);
assert.equal(await guardPublicForm(req("/api/newsletter"), {}, store), null);

// 4. Tracking endpoints (ST-N12) hit their 30/min cap on a burst too.
store = fakeRedis();
let ok = 0;
for (let i = 0; i < 50; i++) {
  const r = await checkRateLimit(req("/api/funnel-event"), undefined, store);
  if (r?.allowed) ok++;
}
assert.equal(ok, 30, `funnel-event burst let ${ok} through`);

console.log("public-form-guard: ok");
