// META-TEST (2 Nov 2026): Meta's Test events tab shows a server event only when it carries the test code. With env
// META_TEST_EVENT_CODE set, every Conversions API payload gets test_event_code; unset, nothing changes. fetch is
// stubbed: nothing here reaches Meta.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const APP = new URL("../", import.meta.url).pathname;
const ROOT = new URL("../../", import.meta.url).pathname;

// The token is read when the module loads; a stand-in, never a real one, and fetch never leaves this process.
delete process.env.META_TEST_EVENT_CODE;
process.env.META_CAPI_TOKEN = "stand-in-token";
const bodies = [];
globalThis.fetch = async (url, init) => {
  assert.match(String(url), /^https:\/\/graph\.facebook\.com\/v[\d.]+\/\d+\/events\?access_token=/);
  bodies.push(JSON.parse(init.body));
  return new Response("{}", { status: 200 });
};
const capi = await import("./meta-capi.server.ts");

// Pure: unset or blank means the same object, no key.
const payload = { data: [{ event_name: "Lead", event_id: "lead_1" }] };
assert.equal(capi.withTestEventCode(payload, {}), payload);
assert.equal(capi.withTestEventCode(payload, { META_TEST_EVENT_CODE: "" }), payload);
assert.equal(capi.withTestEventCode(payload, { META_TEST_EVENT_CODE: "   " }), payload);
assert.deepEqual(capi.withTestEventCode(payload, { META_TEST_EVENT_CODE: " TEST4821 " }), { ...payload, test_event_code: "TEST4821" });
assert.equal("test_event_code" in payload, false, "the input is never changed");

// sendMetaEvent: off, the body is exactly as before (no key at all).
const ev = { eventName: "Lead", eventId: "lead_abc", eventSourceUrl: "https://studojo.com/", user: { clientIp: "203.0.113.5", userAgent: "UA" } };
assert.deepEqual(await capi.sendMetaEvent(ev), { ok: true });
assert.equal(bodies.length, 1);
assert.equal("test_event_code" in bodies[0], false);
assert.deepEqual(Object.keys(bodies[0]), ["data"]);
assert.equal(bodies[0].data[0].event_id, "lead_abc");

// On: every payload carries it, at the top level, beside data.
process.env.META_TEST_EVENT_CODE = "TEST4821";
await capi.sendMetaEvent(ev);
await capi.sendMetaEvent({ ...ev, eventName: "CompleteRegistration", eventId: "reg_u1" });
assert.equal(bodies[1].test_event_code, "TEST4821");
assert.equal(bodies[2].test_event_code, "TEST4821");
assert.equal(bodies[2].data[0].event_id, "reg_u1");

// Off again: gone.
delete process.env.META_TEST_EVENT_CODE;
await capi.sendMetaEvent(ev);
assert.equal("test_event_code" in bodies[3], false);

// The only fetch to Meta goes through withTestEventCode.
const src = readFileSync(`${APP}lib/meta-capi.server.ts`, "utf8");
assert.equal(src.match(/body: JSON\.stringify\(/g)?.length, 1);
assert.match(src, /body: JSON\.stringify\(withTestEventCode\(payload\)\)/);

// Production deploy: the code is an optional reference to app-secrets meta-test-event-code, production only.
const wf = readFileSync(`${ROOT}.github/workflows/deploy-web.yml`, "utf8");
assert.match(wf, /if \[ "\$NS" = "studojo" \]; then\n\s+REFS='\[\{"name": "META_TEST_EVENT_CODE", "valueFrom": \{"secretKeyRef": \{"name": "app-secrets", "key": "meta-test-event-code", "optional": true\}\}\}\]'/);
assert.match(wf, /--argjson refs "\$REFS"/);
const jqf = readFileSync(`${ROOT}k8s/web/deployment-from-frontend.jq`, "utf8");
assert.match(jqf, /def refs: \(\$ARGS\.named\.refs \/\/ \[\]\);/);

console.log("meta-test-code: ok");
