// The HTML document must not be cacheable without revalidation.
//
// Hashed assets under /assets carry `max-age=31536000, immutable`, which is
// right -- their name changes when their content does. The document that names
// those hashes is the opposite case: if a browser may reuse it without asking,
// a returning visitor keeps loading the OLD html pointing at the OLD bundles
// and the deploy looks like it did nothing.
//
// That is not hypothetical. After the mobile fixes shipped to studojo.pro the
// server was serving the new build -- `curl` proved it -- while the reporter
// still saw the old "View My Campaigns" button and the old free-tools section,
// because the document had no Cache-Control at all and their browser had kept
// it. This guard is here so the header cannot quietly go missing again.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const ENTRY = join(ROOT, "entry.server.tsx");

let bad = 0;
const check = (ok, label, detail) => {
  if (ok) { console.log(`  ok   ${label}`); return; }
  bad++;
  console.log(`  FAIL ${label}\n       ${detail}`);
};

check(
  existsSync(ENTRY),
  "app/entry.server.tsx exists",
  "without it React Router uses its default, which sets no Cache-Control on the document",
);

if (existsSync(ENTRY)) {
  const src = readFileSync(ENTRY, "utf8");

  // The header has to be set, and set to something that forces revalidation.
  const setsHeader = /responseHeaders\.set\(\s*["']Cache-Control["']/.test(src);
  check(setsHeader, "the document response sets Cache-Control",
    "no-cache on the html is what makes a deploy visible to a returning visitor");

  const value = src.match(/responseHeaders\.set\(\s*["']Cache-Control["']\s*,\s*["']([^"']+)["']/);
  const v = value?.[1] ?? "";
  check(
    /no-cache|no-store|max-age=0/.test(v),
    `the value forces revalidation (found ${v || "nothing"})`,
    "a plain max-age lets the browser reuse a stale document without asking",
  );

  // A long max-age here would be the exact bug, wearing the right header name.
  const longMaxAge = /responseHeaders\.set\(\s*["']Cache-Control["']\s*,\s*["'][^"']*max-age=(\d+)/.exec(src);
  check(
    !longMaxAge || Number(longMaxAge[1]) === 0,
    "the document is not given a long max-age",
    `max-age=${longMaxAge?.[1]} on the html would strand people on an old build`,
  );

  // Setting it unconditionally would stomp a route that deliberately opted out.
  check(
    /if\s*\(\s*!\s*responseHeaders\.has\(\s*["']Cache-Control["']\s*\)\s*\)/.test(src),
    "an upstream Cache-Control is left alone",
    "a route or middleware that set its own value should win over this default",
  );
}

if (bad) {
  console.log(`\n${bad} problem(s) with document caching.`);
  process.exit(1);
}
console.log("\ndocument caching intact — deploys reach returning visitors");
