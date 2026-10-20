// Guards for launched project pages at /:handle/:slug (app/routes/$handle.$slug.tsx).
//
// 1. Every first path segment of this site is a reserved handle. The page is a
//    flat route that catches any /x/y the site has no route for, so a student
//    with the handle "dojos" would otherwise own /dojos/<anything>. Read from
//    the route files, app/routes.ts and the real route tree. A new top-level
//    route fails here until its first segment is added to RESERVED in
//    app/lib/project-pages.ts and to career-agent's list (CONTRACT-PAGES.md
//    section 6), so both sides refuse it.
// 2. The page route is a direct child of root, with no children.
// 3. No raw HTML anywhere in the page's modules (contract 3.2).
// 4. The page's Content-Security-Policy is the contract's (section 4).
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { PAGE_CSP, RESERVED } from "./project-pages.ts";

const APP = new URL("../", import.meta.url).pathname;
const ROUTES = join(APP, "routes");
const routesTs = readFileSync(join(APP, "routes.ts"), "utf8");

/** A first segment as a handle would collide with it: ".well-known" is "well-known", "robots.txt" is "robots". */
const asHandle = (seg) => seg.replace(/^\.+/, "").split(".")[0].toLowerCase();

const segments = new Map(); // first segment -> where it came from
const add = (seg, from) => {
  if (!seg || seg.startsWith(":") || seg.startsWith("$") || seg === "*") return;
  if (!segments.has(seg)) segments.set(seg, from);
};

// ── 1a. Route files (flatRoutes naming), minus the ones routes.ts tells flatRoutes to skip.
const ignored = [...(routesTs.match(/ignoredRouteFiles:\s*\[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(([, glob]) => {
  const name = glob.replace(/^\*\*\//, "");
  return new RegExp(`^${name.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);
});
assert.ok(ignored.length > 0, "could not read ignoredRouteFiles from app/routes.ts");

for (const entry of readdirSync(ROUTES)) {
  const isDir = statSync(join(ROUTES, entry)).isDirectory();
  if (!isDir && !/\.(tsx?|jsx?)$/.test(entry)) continue;
  if (!isDir && ignored.some((re) => re.test(entry))) continue;
  const name = isDir ? entry : entry.replace(/\.(tsx?|jsx?)$/, "");
  // Split on dots that are not escaped as [.]; drop pathless layout segments (_x) and optional ones ((x)).
  const parts = name.split(/(?<!\[)\.(?![^[]*\])/).map((p) => p.replace(/\[(.*?)\]/g, "$1"));
  const first = parts.find((p) => !(p.startsWith("_") && p !== "_") && !/^\(.*\)$/.test(p));
  if (!first) continue; // _index.tsx
  add(first.replace(/_$/, ""), `app/routes/${entry}`);
}

// ── 1b. Paths declared by hand in routes.ts.
for (const [, path] of routesTs.matchAll(/\broute\(\s*"([^"]*)"/g)) add(path.split("/")[0], "app/routes.ts");

// ── 1c. The real route tree, so nothing the two readers above miss slips past.
const tree = JSON.parse(
  execFileSync("npx", ["react-router", "routes", "--json"], {
    cwd: new URL("../../", import.meta.url).pathname,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const root = tree.find((r) => r.id === "root");
(function walk(routes) {
  for (const r of routes) {
    // A pathless layout or index route hands its children the same first segment.
    if (!r.path) walk(r.children ?? []);
    else add(r.path.split("/")[0], `route ${r.id}`);
  }
})(root.children);

assert.ok(segments.size > 50, `only ${segments.size} first segments found: the readers above are broken`);
const missing = [...segments].filter(([seg]) => !RESERVED.has(asHandle(seg)));
for (const [seg, from] of missing) console.log(`  FAIL /${seg} (${from}) is not a reserved handle`);
assert.equal(missing.length, 0, "add these to RESERVED in app/lib/project-pages.ts and to career-agent's reserved list");
console.log(`  ok  ${segments.size} first segments, all reserved`);

// ── 2. A flat route straight under root.
const page = root.children.find((r) => r.file === "routes/$handle.$slug.tsx");
assert.ok(page, "app/routes/$handle.$slug.tsx must be a direct child of root");
assert.equal(page.path, ":handle/:slug");
assert.ok(!page.children?.length, "nothing may nest under the project page");
console.log("  ok  /:handle/:slug is a direct child of root");

// ── 3. No raw HTML in the page's modules.
const RAW = ["dangerously", "SetInnerHTML"].join("");
const pageFiles = [join(ROUTES, "$handle.$slug.tsx"), join(APP, "lib/project-pages.ts"), join(APP, "lib/project-pages.server.ts")];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|mjs)$/.test(e)) pageFiles.push(p);
  }
})(join(APP, "components/project-page"));
assert.ok(pageFiles.length >= 9, "the page's modules were not found");
const raw = pageFiles.filter((f) => readFileSync(f, "utf8").includes(RAW));
for (const f of raw) console.log(`  FAIL ${f.replace(APP, "app/")} uses ${RAW}`);
assert.equal(raw.length, 0, "every string on a project page is React text (contract 3.2)");
console.log(`  ok  no raw HTML in ${pageFiles.length} page modules`);

// ── 4. The contract's Content-Security-Policy, sent by the route.
assert.equal(
  PAGE_CSP,
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://cdn.fontshare.com; connect-src 'self'; frame-src 'self' https://docs.google.com https://www.figma.com https://*.notion.site https://www.loom.com https://www.youtube-nocookie.com https://www.canva.com https://public.tableau.com https://lookerstudio.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
);
const routeSrc = readFileSync(join(ROUTES, "$handle.$slug.tsx"), "utf8");
assert.match(routeSrc, /"Content-Security-Policy": PAGE_CSP/);
assert.match(routeSrc, /export const handle = \{ projectPage: true \}/, "root.tsx keeps analytics off pages with this handle");
// entry.server must keep a route's own policy instead of overwriting it.
const { setPageSecurityHeaders } = await import("../entry.server.tsx");
const h = new Headers({ "Content-Security-Policy": PAGE_CSP });
setPageSecurityHeaders(h);
assert.equal(h.get("content-security-policy"), PAGE_CSP);
assert.equal(h.get("x-content-type-options"), "nosniff");
assert.equal(h.get("referrer-policy"), "strict-origin-when-cross-origin");
console.log("  ok  the page sends the contract's CSP");

console.log("project-pages-reserved: ok");
