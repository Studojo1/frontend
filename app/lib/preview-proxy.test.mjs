// AS-N03 (audit 30 Sep 2026): /api/v2/resumes/preview-proxy fetched any URL
// for anyone, reaching the cloud metadata endpoint and returning the body.
// Drives the real handler with a fake session, resolver and fetch, and
// records which URLs it would actually have fetched.
import assert from "node:assert/strict";
import { checkPreviewTarget, handlePreviewProxy, isPrivateAddress } from "./preview-proxy.server.ts";

const BLOB = "acct.blob.core.windows.net";
const fetched = [];
const fakeFetch = async (url) => {
  fetched.push(url);
  return new Response(new Uint8Array([37, 80, 68, 70]), { status: 200 });
};
const dns = { [BLOB]: ["20.60.1.1"], "evil.example": ["169.254.169.254"] };
const resolve = async (h) => {
  if (!(h in dns)) throw new Error("ENOTFOUND");
  return dns[h];
};
const deps = (session) => ({
  getSession: async () => session,
  allowedHosts: [BLOB],
  resolve,
  fetchImpl: fakeFetch,
});
const req = (target) =>
  new Request(`https://studojo.com/api/v2/resumes/preview-proxy?url=${encodeURIComponent(target)}`);
const good = `https://${BLOB}/resumes/u1/preview.pdf`;

// 1. No session: refused before any fetch.
let res = await handlePreviewProxy(req(good), deps(null));
assert.equal(res.status, 401, "anonymous caller must be refused");
assert.equal(fetched.length, 0);

// 2. Signed in, but hosts outside the blob allowlist are refused.
for (const target of [
  "https://example.com/",
  "http://169.254.169.254/metadata/instance?api-version=2021-02-01",
  "http://127.0.0.1:6379/",
  "http://localhost:4566/bucket/x.pdf",
  `http://${BLOB}/resumes/x.pdf`, // not https
  `https://${BLOB}:8443/resumes/x.pdf`, // odd port
  `https://user:pw@${BLOB}/x.pdf`,
  "https://evil.example/x.pdf",
  "file:///etc/passwd",
  "not a url",
]) {
  res = await handlePreviewProxy(req(target), deps({ user: { id: "u1" } }));
  assert.equal(res.status, 400, `must refuse ${target}`);
}
assert.equal(fetched.length, 0, `refused targets were fetched: ${fetched.join(", ")}`);

// 3. An allowed host that resolves to a private address (DNS rebinding) is refused.
const rebind = await checkPreviewTarget(good, [BLOB], async () => ["10.0.0.5"]);
assert.equal(rebind.ok, false, "allowlisted host resolving privately must be refused");

// 4. The real case still works.
res = await handlePreviewProxy(req(good), deps({ user: { id: "u1" } }));
assert.equal(res.status, 200);
assert.equal(res.headers.get("content-type"), "application/pdf");
assert.deepEqual(fetched, [good]);

// 5. Upstream failures never echo the upstream status or body.
res = await handlePreviewProxy(req(good), {
  ...deps({ user: { id: "u1" } }),
  fetchImpl: async () => new Response("internal secret page", { status: 403 }),
});
assert.equal(res.status, 502);
assert.ok(!(await res.text()).includes("secret"));

// 6. Address classification.
for (const ip of [
  "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "127.0.0.1", "169.254.169.254",
  "100.64.0.1", "0.0.0.0", "224.0.0.1", "::1", "::", "fe80::1", "fd00::1", "fc00::1",
  "::ffff:169.254.169.254", "::ffff:a9fe:a9fe", "64:ff9b::a9fe:a9fe", "ff02::1", "garbage",
]) assert.equal(isPrivateAddress(ip), true, `${ip} must be private`);
for (const ip of ["20.60.1.1", "8.8.8.8", "172.32.0.1", "2603:1030::1", "::ffff:8.8.8.8"]) {
  assert.equal(isPrivateAddress(ip), false, `${ip} is public`);
}

console.log("preview-proxy: ok");
