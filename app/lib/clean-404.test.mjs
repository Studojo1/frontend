// AR-B05 (areas audit 30 Sep 2026): every unmatched URL (/meta.json from the
// Facebook crawler, scanner probes) was logged with a full stack trace.
// Calls the real entry.server handleError and the real /meta.json route.
import assert from "node:assert/strict";
import { UNSAFE_ErrorResponseImpl as ErrorResponse } from "react-router";

const { handleError } = await import("../entry.server.tsx");
const { loader } = await import("../routes/meta[.]json.tsx");

const logged = [];
const orig = console.error;
console.error = (...a) => logged.push(a);
try {
  const args = { request: new Request("https://studojo.com/meta.json"), params: {}, context: {} };
  handleError(new ErrorResponse(404, "Not Found", new Error('No route matches URL "/meta.json"'), true), args);
  assert.equal(logged.length, 0, "a 404 must not be logged as a server error");

  handleError(new Error("boom"), args);
  assert.equal(logged.length, 1, "real errors are still logged");

  const aborted = new AbortController();
  aborted.abort();
  handleError(new Error("gone"), { ...args, request: new Request("https://studojo.com/x", { signal: aborted.signal }) });
  assert.equal(logged.length, 1, "aborted requests are not logged");
} finally {
  console.error = orig;
}

const res = loader();
assert.equal(res.status, 404);
assert.equal(await res.text(), "Not Found");

console.log("clean-404: ok");
