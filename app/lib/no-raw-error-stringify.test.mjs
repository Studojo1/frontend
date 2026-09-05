// A codebase-wide guard against the pattern that produced "[object Object]".
//
// Fixing one call site is not enough — I found the SAME shape in a dozen
// places. This fails the moment someone reintroduces it.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e) && !/\.test\./.test(e)) files.push(p);
  }
})(ROOT);

// Comments explain the bug; they must not be mistaken for the bug.
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const OFFENDERS = [
  {
    // String(x.detail) — the exact call that shipped [object Object].
    re: /String\s*\(\s*[A-Za-z_$][\w$]*\??\.(?:body\??\.)?detail\b/,
    why: "String() on a `detail` that can be an array prints [object Object]",
  },
  {
    // `?? detail` / `|| detail` straight into a message: an array is truthy,
    // wins the fallback, then renders as [object Object].
    re: /(?:\?\?|\|\|)\s*[A-Za-z_$][\w$]*\??\.(?:body\??\.)?detail\s*(?:\?\?|\|\||,|\))/,
    why: "an array `detail` is truthy — it wins the fallback and renders as [object Object]",
  },
  {
    // setError(err.body.detail) — handing a possible array straight to React.
    re: /set[A-Z]\w*\s*\(\s*[A-Za-z_$][\w$]*\??\.body\??\.detail\b/,
    why: "passing a possible array into React state renders [object Object]",
  },
];

// Files this guard ENFORCES. The same pattern exists in 21 places under
// outreach.* / linkedin.* — the live outreach tool, which I am not to modify.
// Those are reported as warnings, not failures: flagging a known problem is
// useful, failing a build over files I must not touch is not.
//
// Fixing the two API clients did NOT rescue them. Verified: a caller reading
// `err.body.detail` directly still gets the raw array; only `err.message`
// carries the formatted text. So this is a real, live issue in that tool and
// it needs its own decision, not a silent edit here.
const ENFORCED = (f) => !/routes\/(outreach|linkedin)\.|components\/outreach\//.test(f);

let bad = 0, warn = 0, scanned = 0;
for (const f of files) {
  const src = strip(readFileSync(f, "utf8"));
  scanned++;
  for (const line of src.split("\n")) {
    for (const o of OFFENDERS) {
      if (o.re.test(line)) {
        const rel = f.replace(ROOT, "app/");
        if (ENFORCED(rel)) {
          bad++;
          console.log(`  FAIL ${rel}\n       ${line.trim().slice(0, 100)}\n       ${o.why}`);
        } else {
          warn++;
        }
      }
    }
  }
}

console.log(`\nscanned ${scanned} files`);
if (warn) {
  console.log(`${warn} occurrence(s) in the outreach tool — reported, not enforced.`);
  console.log("Those files are off limits; they render err.body.detail directly, so the");
  console.log("client-level fix does not reach them. They need their own change.");
}
if (bad) {
  console.log(`${bad} occurrence(s). Use describeError() from ~/lib/error-detail instead.`);
  process.exit(1);
}
console.log("no raw error stringification — every API error goes through describeError()");
