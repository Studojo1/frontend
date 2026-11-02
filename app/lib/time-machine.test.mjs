// The time machine page is frozen: no scripts, no handlers, every link goes to "/", no external assets.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isRetiredPath } from "./retired-routes.ts";
import { loader as oldLoader } from "../routes/old.tsx";

const html = readFileSync(new URL("../time-machine/old-home.html", import.meta.url), "utf8");
assert.doesNotMatch(html, /<script/i);
assert.doesNotMatch(html, /\son[a-z]+=/i);
assert.doesNotMatch(html, /(?:src|href)="https?:/i);
assert.match(html, /<meta name="robots" content="noindex"\/>/);
assert.match(html, /<link rel="canonical" href="\/"\/>/);
assert.match(html, /Studojo, as it looked until 2 November 2026\. This is a snapshot\./);
for (const m of html.matchAll(/<a\b[^>]*?\bhref="([^"]*)"/g)) assert.equal(m[1], "/");
assert.equal(isRetiredPath("/time-machine"), false);
assert.equal(isRetiredPath("/old"), false);
const res = oldLoader();
assert.equal(res.status, 301);
assert.equal(res.headers.get("Location"), "/time-machine");
console.log("time machine snapshot ok");
