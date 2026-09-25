// fetchWithRetry against a real local server that misbehaves on purpose.
// Guards audit #22 (body download had no deadline), #27 (500/502/503 were never
// retried, only 504 by accident), and #55 (the global console was stubbed out
// during retries). Run: node app/lib/fetch-with-retry.test.mjs
import http from "node:http";
import { fetchWithRetry } from "./fetch-with-retry.ts";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console[cond ? "log" : "error"](`${cond ? "PASS" : "FAIL"} ${name}${detail ? ` -- ${detail}` : ""}`);
};

const hits = {};
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  const key = u.pathname + u.search;
  hits[key] = (hits[key] || 0) + 1;
  const n = hits[key];
  const fail = Number(u.searchParams.get("fail") || 0);
  if (u.pathname === "/stall") {
    // Headers and half a body, then nothing.
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write('{"leads": [');
    return;
  }
  if (u.pathname === "/status") {
    const code = Number(u.searchParams.get("code"));
    if (n <= fail) { res.writeHead(code); return res.end("err"); }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end('{"ok":true}');
  }
  res.writeHead(404); res.end();
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

// #22: a stalled body must be aborted by the same deadline.
{
  const t = Date.now();
  let err = null;
  try {
    const res = await fetchWithRetry(`${base}/stall`, { timeout: 800, maxRetries: 1 });
    await res.text();
  } catch (e) { err = e; }
  const ms = Date.now() - t;
  check("#22 stalled body is aborted by the deadline", err?.name === "AbortError" && ms >= 700 && ms < 3000, `${ms}ms, ${err?.name}`);
}

// #27: every 5xx is retried, not just 504.
for (const code of [500, 502, 503, 504]) {
  const res = await fetchWithRetry(`${base}/status?code=${code}&fail=2`, { maxRetries: 3, timeout: 2000 });
  check(`#27 ${code} twice then 200 -> retried to success`, res.status === 200 && hits[`/status?code=${code}&fail=2`] === 3, `status ${res.status}, ${hits[`/status?code=${code}&fail=2`]} attempts`);
}
{
  const res = await fetchWithRetry(`${base}/status?code=500&fail=9`, { maxRetries: 3, timeout: 2000 }).catch((e) => e);
  check("#27 persistent 500 gives up after maxRetries", hits["/status?code=500&fail=9"] === 3, `${hits["/status?code=500&fail=9"]} attempts`);
}
for (const code of [400, 401, 404]) {
  const res = await fetchWithRetry(`${base}/status?code=${code}&fail=9`, { maxRetries: 3, timeout: 2000 });
  check(`#27 ${code} is not retried`, res.status === code && hits[`/status?code=${code}&fail=9`] === 1);
}

// #55: overlapping retrying calls must leave console.error/warn intact.
{
  const origErr = console.error, origWarn = console.warn;
  await Promise.all([1, 2, 3].map((i) => fetchWithRetry(`${base}/status?code=503&fail=2&i=${i}`, { maxRetries: 3, timeout: 2000 })));
  check("#55 console untouched after overlapping retries", console.error === origErr && console.warn === origWarn);
}

server.close();
server.closeAllConnections?.();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
