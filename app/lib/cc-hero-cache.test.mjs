// HP-N11 (audit 30 Sep 2026): the Career Coach hero images are Vite imports
// (hashed, served from /assets with a 1-year cache), not public/ files, which
// react-router-serve sends with max-age=0 and browsers re-check every visit.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const APP = new URL("../", import.meta.url).pathname;
const PUBLIC = new URL("../../public/", import.meta.url).pathname;

const cc = readFileSync(APP + "routes/cc._index.tsx", "utf8");
assert.ok(!/(src|srcSet)="\/cc-hero/.test(cc), "cc hero images come from ~/assets, not public/");
assert.match(cc, /from "~\/assets\/cc\/cc-hero\.webp"/);
assert.match(cc, /from "~\/assets\/cc\/cc-hero-mobile\.webp"/);
for (const f of ["cc-hero.webp", "cc-hero-mobile.webp"]) {
  assert.ok(existsSync(APP + "assets/cc/" + f), `app/assets/cc/${f} exists`);
  assert.ok(!existsSync(PUBLIC + f), `no public/ copy of ${f}`);
}
console.log("cc-hero-cache: ok");
