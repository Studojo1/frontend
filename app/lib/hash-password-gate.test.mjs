// AS-N04 (audit 30 Sep 2026): /api/auth/hash-password hashed anything for
// anyone on the internet. It must now demand the service-to-service secret.
// Calls the real route action.
import assert from "node:assert/strict";

process.env.EMAILER_INTERNAL_SECRET = "test-internal-secret";
const { action } = await import("../routes/api.auth.hash-password.tsx");

const call = (headers = {}) =>
  action({
    request: new Request("https://studojo.com/api/auth/hash-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ password: "hunter22" }),
    }),
  });

let res = await call();
assert.equal(res.status, 403, "no secret must be refused");
res = await call({ "X-Internal-Secret": "wrong" });
assert.equal(res.status, 403, "wrong secret must be refused");
res = await call({ "X-Internal-Secret": "test-internal-secret-but-longer" });
assert.equal(res.status, 403, "longer secret must be refused");

res = await call({ "X-Internal-Secret": "test-internal-secret" });
assert.equal(res.status, 200);
const { hash } = await res.json();
assert.match(hash, /^\$2a\$10\$/);

// An unset secret on the server locks the route rather than opening it.
process.env.EMAILER_INTERNAL_SECRET = "";
res = await call({ "X-Internal-Secret": "" });
assert.equal(res.status, 403, "unset server secret must not open the route");

console.log("hash-password-gate: ok");
