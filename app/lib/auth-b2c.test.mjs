// AUTH-B2C (27 Oct 2026), SITE-V2 the same day: /auth, /auth/2fa, /forgot-password and /reset-password on B2C hosts
// (studojo.pro, site-b2c/host.tsx) wear the site's calm white-card look, visual only. These static checks hold the
// line: the look is gated by useSiteB2c, studojo.com gets no mark and no new class, and nothing that works (inputs,
// form, button types, link targets, handlers, text) depends on the host. The only B2C-only things drawn are Stu's
// head with a one-line kicker (AuthTop) and the compact site footer; the floating shapes are not drawn there.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");
const src = read("../routes/auth._index.tsx");

// ---------- /auth ----------
// Gated by the root loader's b2cHost, read through useSiteB2c; the homepage's stylesheet is no longer pulled in.
assert.match(src, /import \{ useSiteB2c \} from "~\/components\/site-b2c\/host";/);
assert.match(src, /\n  const b2c = useSiteB2c\(\);\n/);
assert.doesNotMatch(src, /home-b2c|useB2cHost|sjb/, "the old homepage gate, stylesheet and classes are gone");
// A mark is a data attribute on B2C hosts only; on studojo.com the spread is empty, so its HTML is unchanged.
assert.match(src, /\n  const b2cMark = \(part: string\) => \(b2c \? \{ "data-b2c": part \} : \{\}\);\n/);
// The page root: "sv2-auth" on B2C hosts, exactly the old classes elsewhere.
assert.match(src, /<main className=\{b2c \? "sv2-auth relative" : "relative min-h-screen overflow-hidden bg-purple-50"\}>/);
// The floating shapes are drawn only off B2C hosts, and that block holds nothing but the decorations.
const deco = src.slice(src.indexOf("{!b2c && ("), src.indexOf(")}", src.indexOf("{!b2c && (")));
assert.match(deco, /<div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">/);
assert.match(deco, /BACKGROUND_SHAPES\.map\(\(shape, i\) => \(\s*<FloatShape key=\{i\} \{\.\.\.shape\} \/>/);
assert.doesNotMatch(deco, /<(input|form|button|a|Link|label|p|h1|h2)\b/, "only decorations are B2C-gated");
// The second wordmark: on B2C hosts Stu's head and the kicker (AuthTop), elsewhere exactly the old wordmark.
assert.match(
  src,
  /\{b2c \? \(\n\s+<AuthTop kicker="stu, your career agent" \/>\n\s+\) : \(\n\s+<div className="mb-8 text-center">\n\s+<h2 className="font-\['Satoshi'\] text-3xl font-black leading-9 text-neutral-900 md:text-4xl md:leading-7">\n\s+studojo\n\s+<\/h2>\n\s+<\/div>\n\s+\)\}/,
);
assert.equal((src.match(/<AuthTop /g) ?? []).length, 1);
// AuthTop draws only Stu's head and the kicker: no link, button, field or handler.
const top = read("../components/site-b2c/auth-top.tsx");
assert.match(top, /<StuHead size=\{size\} \/>\n\s+<Kicker>\{kicker\}<\/Kicker>/);
assert.doesNotMatch(top, /<(a|Link|button|input|form|label)\b|on[A-Z]\w*=|href=/);
// The compact site footer, B2C only, after the page (no closing button: Footer compact).
assert.equal((src.match(/\{b2c && <Footer compact \/>\}/g) ?? []).length, 1);

// Every line that reads b2c is one of these, and none of them sets anything that works: no input, form, button type,
// link target, handler or text depends on the host. The submit button only gains the site's .sv-btn classes.
const ALLOWED = [
  /^import \{ useSiteB2c \} from "~\/components\/site-b2c\/host";$/,
  /^import \{ AuthTop \} from "~\/components\/site-b2c\/auth-top";$/,
  /^const b2c = useSiteB2c\(\);$/,
  /^const b2cMark = \(part: string\) => \(b2c \? \{ "data-b2c": part \} : \{\}\);$/,
  /^<main className=\{b2c \? "sv2-auth relative" : "relative min-h-screen overflow-hidden bg-purple-50"\}>$/,
  /^\{!b2c && \($/,
  /^\{b2c \? \($/,
  /^\{b2c && <Footer compact \/>\}$/,
  /^\{\.\.\.b2cMark\("[a-z-]+"\)\}$/,
  /^\{\.\.\.b2cMark\(mode === "(signin|signup)" \? "tab-on" : "tab"\)\}$/,
  /^<(div|span|p) \{\.\.\.b2cMark\("[a-z-]+"\)\} className="[^"]*"?>?$/,
  /^<div \{\.\.\.b2cMark\("email-form"\)\} className=\{showEmailForm \? "contents" : "hidden"\}>$/,
  /^className=\{`\$\{b2c \? "sv-btn sv-btn-wide " : ""\}[^$`]*`\}$/,
];
const BEHAVIOUR = /\b(type|href|to|name|action|method|value|onClick|onSubmit|onChange|disabled|required|autoComplete|htmlFor|id|target|rel)=/;
const b2cLinesOf = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /\bb2c\b|b2cMark|useSiteB2c|site-b2c/.test(l) && !l.startsWith("//") && !l.startsWith("{/*"));
const b2cLines = b2cLinesOf(src);
assert.ok(b2cLines.length >= 20, `expected the gate and its marks, found ${b2cLines.length} lines`);
for (const l of b2cLines) {
  assert.ok(ALLOWED.some((re) => re.test(l)), `auth._index.tsx: an unexpected B2C branch: ${l}`);
  assert.doesNotMatch(l, BEHAVIOUR, `B2C changes behaviour: ${l}`);
}
// The submit button is still type="submit" and keeps every old class after the B2C prefix.
assert.match(
  src,
  /type="submit"\n\s+disabled=\{submitting\}\n\s+className=\{`\$\{b2c \? "sv-btn sv-btn-wide " : ""\}w-full rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-4 /,
);
// Marks only ever name a part; they never wrap or replace an element.
const marksOf = (text) => [...text.matchAll(/b2cMark\(("[a-z-]+"|mode === "(?:signin|signup)" \? "tab-on" : "tab")\)/g)].map((m) => m[1]);
assert.deepEqual(
  marksOf(src).filter((m) => m.startsWith('"')).sort(),
  ['"card"', '"email-form"', '"fine"', '"fine"', '"google"', '"link"', '"link"', '"link"', '"or"', '"passkey"', '"shell"', '"switch"', '"switch"', '"tabs"'],
);
// The same fields, button types and link targets on every host (one tree, so these are the page's whole set).
const attrs = (text, re) => [...text.matchAll(re)].map((m) => m[1]).sort();
assert.deepEqual(attrs(src, /\bname="([^"]+)"/g), ["email", "password", "remember"]);
assert.deepEqual(attrs(src, /<input\s[^>]*?type="([^"]+)"/g), ["checkbox", "email"]);
assert.equal((src.match(/type="submit"/g) ?? []).length, 1);
assert.equal((src.match(/<form /g) ?? []).length, 1);
assert.match(src, /<form onSubmit=\{handleSubmit\} className="space-y-6">/);
assert.deepEqual(attrs(src, /<Link to="([^"]+)"/g), ["/forgot-password"]);
// Redirects and query handling are untouched by the look: the same callbackURL and error return on every host.
assert.match(src, /callbackURL: redirectUrl,\n\s+errorCallbackURL: `\/auth\?redirect=\$\{encodeURIComponent\(redirectUrl\)\}`,/);

// ---------- /forgot-password, /reset-password, /auth/2fa ----------
// The same gate and the same discipline: a root class, data marks, AuthTop, the .sv-btn prefix and the compact footer.
const PW_ALLOWED = [
  /^import \{ useSiteB2c \} from "~\/components\/site-b2c\/host";$/,
  /^import \{ AuthTop \} from "~\/components\/site-b2c\/auth-top";$/,
  /^const b2c = useSiteB2c\(\);$/,
  /^const b2cMark = \(part: string\) => \(b2c \? \{ "data-b2c": part \} : \{\}\);$/,
  /^<div className=\{b2c \? "sv2-auth" : "min-h-screen bg-white"\}>$/,
  /^<main className=\{b2c \? "sv2-auth relative" : "relative min-h-screen overflow-hidden bg-purple-50"\}>$/,
  /^<div \{\.\.\.b2cMark\("[a-z-]+"\)\} className="[^"]*">$/,
  /^\{b2c && <AuthTop kicker="your studojo account" size=\{56\} \/>\}$/,
  /^className=\{\(b2c \? "sv-btn sv-btn-wide " : ""\) \+ BTN_PRIMARY \+ " (w-full|block text-center)"\}$/,
  /^className=\{`\$\{b2c \? "sv-btn sv-btn-wide " : ""\}[^$`]*`\}$/,
  /^\{b2c && <Footer compact \/>\}$/,
];
const PAGES = {
  "forgot-password": {
    names: ["email"],
    inputs: ["email"],
    links: ["/auth", "/auth"],
    marks: ['"error"', '"note"', '"shell"', '"shell"', '"switch"'],
    calls: [/await requestPasswordReset\(email\);/, /<form onSubmit=\{handleSubmit\} className="space-y-4">/, /disabled=\{submitting \|\| !email\}/],
    classic: [/const BTN_PRIMARY =\n\s+"rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 font-\['Satoshi'\] text-base font-medium leading-6 text-white shadow-\[4px_4px_0px_0px_rgba\(25,26,35,1\)\] transition-transform /],
  },
  "reset-password": {
    names: ["confirmPassword", "password"],
    inputs: [],
    links: ["/auth", "/forgot-password"],
    marks: ['"error"', '"shell"', '"shell"', '"switch"', '"warn"'],
    calls: [/await resetPassword\(token, password\);/, /navigate\("\/auth"\);/, /<form onSubmit=\{handleSubmit\} className="space-y-4">/, /disabled=\{submitting \|\| !token \|\| !password \|\| !confirmPassword\}/],
    classic: [/const BTN_PRIMARY =\n\s+"rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 /],
  },
  "auth.2fa": {
    names: ["code"],
    inputs: ["checkbox", "text"],
    links: [],
    marks: ['"shell"'],
    calls: [/authClient\.twoFactor\.verifyTotp\(\{\n\s+code: code\.trim\(\),\n\s+trustDevice,\n\s+\}\)/, /navigate\("\/", \{ replace: true \}\);/, /disabled=\{submitting \|\| code\.length < 6\}/],
    classic: [],
  },
};
for (const [page, want] of Object.entries(PAGES)) {
  const text = read(`../routes/${page}.tsx`);
  assert.match(text, /\n  const b2c = useSiteB2c\(\);\n/, page);
  const lines = b2cLinesOf(text);
  assert.ok(lines.length >= 8, `${page}: expected the gate and its marks, found ${lines.length} lines`);
  for (const l of lines) {
    assert.ok(PW_ALLOWED.some((re) => re.test(l)), `${page}.tsx: an unexpected B2C branch: ${l}`);
    assert.doesNotMatch(l, BEHAVIOUR, `${page}: B2C changes behaviour: ${l}`);
  }
  assert.deepEqual(marksOf(text).sort(), want.marks, `${page}: marks`);
  assert.deepEqual(attrs(text, /\bname="([^"]+)"/g), want.names, `${page}: field names`);
  assert.deepEqual(attrs(text, /<input\s[^>]*?type="([^"]+)"/g), want.inputs, `${page}: input types`);
  assert.deepEqual(attrs(text, /\bto="([^"]+)"/g), want.links, `${page}: link targets`);
  assert.equal((text.match(/type="submit"/g) ?? []).length, 1, `${page}: one submit`);
  assert.equal((text.match(/<form /g) ?? []).length, 1, `${page}: one form`);
  for (const re of [...want.calls, ...want.classic]) assert.match(text, re, `${page}: ${re}`);
}

// ---------- the CSS: the auth block of site-pages.css ----------
// Every rule sits under html[data-sv2="auth"] .sv2-auth (so only these pages on B2C hosts), hides nothing and writes
// no text. The block is fenced by its markers; another agent's pages share the file.
const pagesCss = read("../components/site-b2c/site-pages.css");
const start = pagesCss.indexOf("/* ===== auth (auth agent) ===== */");
const end = pagesCss.indexOf("/* ===== end auth ===== */");
assert.ok(start >= 0 && end > start, "the auth block and its end marker");
const css = pagesCss.slice(start, end).replace(/\/\*[\s\S]*?\*\//g, "");
const authRules = css.match(/[^{}]*\{[^{}]*\}/g) ?? [];
assert.ok(authRules.length >= 40, `auth rules: ${authRules.length}`);
for (const rule of authRules) {
  const sel = rule.slice(0, rule.indexOf("{")).trim();
  for (const part of sel.split(",")) assert.match(part.trim(), /^html\[data-sv2="auth"\] \.sv2-auth(\s|\[|$)/, `unscoped auth selector: ${part.trim()}`);
  const body = rule.slice(rule.indexOf("{"));
  assert.doesNotMatch(
    body,
    /display:\s*none|visibility:\s*hidden|content:|opacity:\s*0(\.0*)?\s*[;}]|font-size:\s*0[;\s}]|color:\s*transparent|clip-path|text-indent/,
    `auth rule hides or writes: ${sel}`,
  );
}

console.log("auth-b2c: ok");
