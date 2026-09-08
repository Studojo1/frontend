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

// Enforced everywhere, with no exemptions.
//
// This carried a carve-out for outreach.* / linkedin.* while those files were
// off limits — 35 known-broken call sites reported but not failed. Pranav
// authorised fixing them, they are fixed, and the exemption is gone with them.
// A guard with an exception list slowly becomes a guard that guards nothing.

let bad = 0, scanned = 0;
for (const f of files) {
  const src = strip(readFileSync(f, "utf8"));
  scanned++;
  for (const line of src.split("\n")) {
    for (const o of OFFENDERS) {
      if (o.re.test(line)) {
        const rel = f.replace(ROOT, "app/");
        bad++;
        console.log(`  FAIL ${rel}\n       ${line.trim().slice(0, 100)}\n       ${o.why}`);
      }
    }
  }
}

console.log(`\nscanned ${scanned} files`);
if (bad) {
  console.log(`${bad} occurrence(s). Use describeError() from ~/lib/error-detail instead.`);
  process.exit(1);
}
console.log("no raw error stringification — every API error goes through describeError()");
