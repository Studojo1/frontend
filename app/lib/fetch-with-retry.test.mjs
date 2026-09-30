// fetchWithRetry against a real local server that misbehaves on purpose.
// Guards audit #22 (body download had no deadline), #27 (500/502/503 were never
// retried, only 504 by accident), and #55 (the global console was stubbed out
// during retries). Run: node app/lib/fetch-with-retry.test.mjs
import http from "node:http";
import { fetchWithRetry } from "./fetch-with-retry.ts";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") => {
  if (cond) pass++; else fail++;
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
  if (u.pathname === "/detail") {
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end('{"detail":"Search infrastructure is busy. Try again in a minute."}');
  }
  if (u.pathname === "/slow") {
    setTimeout(() => { res.writeHead(200); res.end("late"); }, 300);
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
  await fetchWithRetry(`${base}/status?code=500&fail=9`, { maxRetries: 3, timeout: 2000 }).catch((e) => e);
  check("#27 persistent 500 gives up after maxRetries", hits["/status?code=500&fail=9"] === 3, `${hits["/status?code=500&fail=9"]} attempts`);
}
for (const code of [400, 401, 404]) {
  const res = await fetchWithRetry(`${base}/status?code=${code}&fail=9`, { maxRetries: 3, timeout: 2000 });
  check(`#27 ${code} is not retried`, res.status === code && hits[`/status?code=${code}&fail=9`] === 1);
}

// CF-N03: a persistent 5xx comes back as the Response, body intact, so the
// backend's recovery message can reach the student.
{
  const res = await fetchWithRetry(`${base}/detail`, { maxRetries: 2, timeout: 2000 });
  const body = await res.json().catch(() => null);
  check("CF-N03 persistent 503 returns the response", res.status === 503 && hits["/detail"] === 2, `status ${res.status}, ${hits["/detail"]} attempts`);
  check("CF-N03 the 503 body is readable", body?.detail?.startsWith("Search infrastructure is busy"), JSON.stringify(body));
}

// CF-N06: a caller abort is not retried and not reported as a timeout.
{
  const ac = new AbortController();
  setTimeout(() => ac.abort(), 50);
  const err = await fetchWithRetry(`${base}/slow`, { maxRetries: 3, timeout: 2000, signal: ac.signal }).catch((e) => e);
  check("CF-N06 aborted request is not retried", hits["/slow"] === 1, `${hits["/slow"]} attempts`);
  check("CF-N06 abort surfaces as AbortError", err?.name === "AbortError", `${err?.name}: ${err?.message}`);
  const ac2 = new AbortController();
  ac2.abort();
  const before = hits["/slow"];
  const err2 = await fetchWithRetry(`${base}/slow`, { maxRetries: 3, signal: ac2.signal }).catch((e) => e);
  check("CF-N06 already-aborted signal sends nothing", hits["/slow"] === before && err2?.name === "AbortError");
}

// CF-N06: "after 1 attempt", not "after 1 attempts".
{
  const err = await fetchWithRetry("http://127.0.0.1:1/", { maxRetries: 1, timeout: 2000 }).catch((e) => e);
  check("CF-N06 singular attempt in the message", /after 1 attempt:/.test(err?.message ?? ""), err?.message);
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
