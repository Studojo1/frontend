// Guard: a page route with child routes must render an <Outlet/>.
//
// flatRoutes nests x.y.tsx under x.tsx. If x.tsx has no <Outlet/>, every
// /x/y URL silently renders the parent instead. That broke all 96 blog posts
// (audit HP-N03, 29 Sep 2026), plus /auth/2fa, /settings/email,
// /autoapply/outreach and /linkedin/leads/discovery. The fix is to name the
// parent x._index.tsx, or render <Outlet/> in it.
//
// Reads the real route tree from `react-router routes --json`.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const APP = new URL("../", import.meta.url).pathname;
const tree = JSON.parse(
  execFileSync("npx", ["react-router", "routes", "--json"], {
    cwd: new URL("../../", import.meta.url).pathname,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);

const bad = [];
(function walk(routes) {
  for (const r of routes) {
    if (r.children?.length && r.id !== "root") {
      const src = readFileSync(APP + r.file, "utf8");
      // Resource routes (no default export) have no UI, so nesting is harmless.
      const isPage = /export default/.test(src);
      if (isPage && !/\bOutlet\b/.test(src)) bad.push(`${r.file} (children: ${r.children.map((c) => c.path).join(", ")})`);
    }
    if (r.children) walk(r.children);
  }
})(tree);

for (const b of bad) console.log(`  FAIL parent without <Outlet/>: app/${b}`);
assert.equal(bad.length, 0, "rename these parents to x._index.tsx or render <Outlet/>");
console.log("route-nesting: ok");
