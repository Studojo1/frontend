// AUTH-B2C (27 Oct 2026): /auth on B2C hosts (studojo.pro, app/lib/b2c-home.ts) wears the homepage's look, visual
// only. These static checks hold the line: the look is gated by useB2cHost, studojo.com gets no mark and no new class,
// and nothing that works (inputs, form, button types, link targets, handlers, text) depends on the host.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../routes/auth._index.tsx", import.meta.url), "utf8");

// Gated by the root loader's b2cHost, read through useB2cHost (components/home-b2c/links.ts).
assert.match(src, /import \{ useB2cHost \} from "~\/components\/home-b2c\/links";/);
assert.match(src, /\n  const b2c = useB2cHost\(\);\n/);
// A mark is a data attribute on B2C hosts only; on studojo.com the spread is empty, so its HTML is unchanged.
assert.match(src, /\n  const b2cMark = \(part: string\) => \(b2c \? \{ "data-b2c": part \} : \{\}\);\n/);
// The page root: "sjb sjb-auth" on B2C hosts, exactly the old classes elsewhere.
assert.match(
  src,
  /<main className=\{b2c \? "sjb sjb-auth relative min-h-screen overflow-hidden" : "relative min-h-screen overflow-hidden bg-purple-50"\}>/,
);
// The floating shapes are drawn only off B2C hosts, and that block holds nothing but the decorations.
const deco = src.slice(src.indexOf("{!b2c && ("), src.indexOf(")}", src.indexOf("{!b2c && (")));
assert.match(deco, /<div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">/);
assert.match(deco, /BACKGROUND_SHAPES\.map\(\(shape, i\) => \(\s*<FloatShape key=\{i\} \{\.\.\.shape\} \/>/);
assert.doesNotMatch(deco, /<(input|form|button|a|Link|label|p|h1|h2)\b/, "only decorations are B2C-gated");

// Every line that reads b2c is one of these, and none of them sets anything that works: no input, form, button type,
// link target, handler or text depends on the host. The submit button only gains the homepage's .nb-btn classes.
const ALLOWED = [
  /^import \{ useB2cHost \} from "~\/components\/home-b2c\/links";$/,
  /^import "~\/components\/home-b2c\/b2c\.css";$/,
  /^const b2c = useB2cHost\(\);$/,
  /^const b2cMark = \(part: string\) => \(b2c \? \{ "data-b2c": part \} : \{\}\);$/,
  /^<main className=\{b2c \? "sjb sjb-auth relative min-h-screen overflow-hidden" : "relative min-h-screen overflow-hidden bg-purple-50"\}>$/,
  /^\{!b2c && \($/,
  /^\{\.\.\.b2cMark\("[a-z-]+"\)\}$/,
  /^\{\.\.\.b2cMark\(mode === "(signin|signup)" \? "tab-on" : "tab"\)\}$/,
  /^<(h2|div|span) \{\.\.\.b2cMark\("[a-z-]+"\)\} className="[^"]*"?>?$/,
  /^<div \{\.\.\.b2cMark\("email-form"\)\} className=\{showEmailForm \? "contents" : "hidden"\}>$/,
  /^className=\{`\$\{b2c \? "nb-btn nb-wide " : ""\}[^$`]*`\}$/,
];
const lines = src.split("\n").map((l) => l.trim());
const b2cLines = lines.filter((l) => /\bb2c\b|b2cMark|useB2cHost|home-b2c/.test(l) && !l.startsWith("//") && !l.startsWith("{/*"));
assert.ok(b2cLines.length >= 15, `expected the gate and its marks, found ${b2cLines.length} lines`);
for (const l of b2cLines) {
  assert.ok(ALLOWED.some((re) => re.test(l)), `auth._index.tsx: an unexpected B2C branch: ${l}`);
  assert.doesNotMatch(l, /\b(type|href|to|name|action|method|value|onClick|onSubmit|onChange|disabled|required|autoComplete|htmlFor|id|target|rel)=/, `B2C changes behaviour: ${l}`);
}
// The submit button is still type="submit" and keeps every old class after the B2C prefix.
assert.match(
  src,
  /type="submit"\n\s+disabled=\{submitting\}\n\s+className=\{`\$\{b2c \? "nb-btn nb-wide " : ""\}w-full rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-4 /,
);
// Marks only ever name a part; they never wrap or replace an element.
const marks = [...src.matchAll(/b2cMark\(("[a-z-]+"|mode === "(?:signin|signup)" \? "tab-on" : "tab")\)/g)].map((m) => m[1]);
assert.deepEqual(
  marks.filter((m) => m.startsWith('"')).sort(),
  ['"brand"', '"card"', '"email-form"', '"google"', '"link"', '"link"', '"link"', '"or"', '"passkey"', '"tabs"'],
);
// The same fields, button types and link targets on every host (one tree, so these are the page's whole set).
const attrs = (re) => [...src.matchAll(re)].map((m) => m[1]).sort();
assert.deepEqual(attrs(/\bname="([^"]+)"/g), ["email", "password", "remember"]);
assert.deepEqual(attrs(/<input\s[^>]*?type="([^"]+)"/g), ["checkbox", "email"]);
assert.equal((src.match(/type="submit"/g) ?? []).length, 1);
assert.equal((src.match(/<form /g) ?? []).length, 1);
assert.match(src, /<form onSubmit=\{handleSubmit\} className="space-y-6">/);
assert.deepEqual(attrs(/<Link to="([^"]+)"/g), ["/forgot-password"]);
// Redirects and query handling are untouched by the look: the same callbackURL and error return on every host.
assert.match(src, /callbackURL: redirectUrl,\n\s+errorCallbackURL: `\/auth\?redirect=\$\{encodeURIComponent\(redirectUrl\)\}`,/);

// The CSS: every auth rule sits under .sjb.sjb-auth, hides nothing, writes no text and uses no purple token
// (the primary button gets purple from .nb-btn, the homepage's start button).
const css = readFileSync(new URL("../components/home-b2c/b2c.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const authRules = css.match(/[^{}]*\.sjb-auth[^{}]*\{[^{}]*\}/g) ?? [];
assert.ok(authRules.length >= 15, `auth rules: ${authRules.length}`);
for (const rule of authRules) {
  const sel = rule.slice(0, rule.indexOf("{")).trim();
  for (const part of sel.split(",")) assert.match(part.trim(), /^\.sjb\.sjb-auth(\s|\[|$)/, `unscoped auth selector: ${part.trim()}`);
  const body = rule.slice(rule.indexOf("{"));
  assert.doesNotMatch(body, /display:\s*none|visibility:\s*hidden|content:|--sjb-cta|gradient\(|blur\(|#8b5cf6|#a855f7/, `auth rule: ${sel}`);
}

console.log("auth-b2c: ok");
