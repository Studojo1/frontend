// CLASSIC LOOK (27 Oct 2026, the owner: "the same flow we have, in our old UI style with the Clash Display"): the look
// switch (app/lib/look.ts, shared with career-agent). ?look=classic or ?look=new stores sj_look; the server draws the
// first paint in it (<html data-look>, the classic sheet, the floating switch). No query and no cookie: the page is
// exactly as before. Never on studojo.com (it already is the classic look), whatever Host a request claims.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { LOOK_COOKIE, LOOK_MAX_AGE, lookCookieSecure, lookForRequest, lookFromCookie, lookFromSearch, lookSetCookie, resolveLook, switchHref } from "./look.ts";
import { isB2cRequest } from "./b2c-home.ts";

// the query and the cookie name the look; anything else names none
assert.equal(lookFromSearch("?look=classic"), "classic");
assert.equal(lookFromSearch("look=NEW"), "new");
assert.equal(lookFromSearch(new URLSearchParams("a=1&look=classic")), "classic");
for (const s of ["", "?look=", "?look=old", "?looks=classic", null, undefined]) assert.equal(lookFromSearch(s), null, String(s));
assert.equal(lookFromCookie("a=1; sj_look=classic; b=2"), "classic");
assert.equal(lookFromCookie("sj_look=new"), "new");
for (const c of ["", "sj_look=", "sj_look=old", "xsj_look=classic", "sj_looks=classic", null, undefined]) assert.equal(lookFromCookie(c), null, String(c));

// default stays new: no query and no cookie is the page as it was, no switch
assert.deepEqual(resolveLook(true, "", ""), { look: "new", switchable: false, store: null });
assert.deepEqual(resolveLook(true, "?utm_source=meta", "better-auth.session_token=x"), { look: "new", switchable: false, store: null });

// ?look= wins over the cookie and is stored; the cookie alone keeps the look and shows the switch
assert.deepEqual(resolveLook(true, "?look=classic", ""), { look: "classic", switchable: true, store: "classic" });
assert.deepEqual(resolveLook(true, "?look=new", "sj_look=classic"), { look: "new", switchable: true, store: "new" });
assert.deepEqual(resolveLook(true, "", "sj_look=classic"), { look: "classic", switchable: true, store: null });
assert.deepEqual(resolveLook(true, "", "sj_look=new"), { look: "new", switchable: true, store: null });
assert.equal(lookSetCookie("classic", true), `${LOOK_COOKIE}=classic; Path=/; Max-Age=${LOOK_MAX_AGE}; SameSite=Lax; Secure`);
assert.equal(LOOK_MAX_AGE, 180 * 24 * 60 * 60, "about 180 days");
assert.doesNotMatch(lookSetCookie("new", false), /Secure|Domain|HttpOnly/, "host only, readable by both apps, plain http locally");
assert.equal(lookCookieSecure("studojo.pro"), true);
assert.equal(lookCookieSecure("127.0.0.1:3980"), false);
assert.equal(switchHref("https://studojo.pro/blog?utm_source=x&look=new#top", "classic"), "/blog?utm_source=x&look=classic#top");

// studojo.com never gets the switch: not by Host, and not on its deployment whatever Host a request claims
const req = (url, host, cookie) => new Request(url, { headers: { host, ...(cookie ? { cookie } : {}) } });
const saved = process.env.BETTER_AUTH_URL;
try {
  process.env.BETTER_AUTH_URL = "https://studojo.pro";
  const pro = req("http://pod/?look=classic", "studojo.pro");
  assert.deepEqual(lookForRequest(pro, isB2cRequest(pro)), { look: "classic", switchable: true, store: "classic" });
  for (const host of ["studojo.com", "www.studojo.com", "app.studojo.pro", "dashboard.studojo.pro", "admin.studojo.pro"]) {
    const r = req("http://pod/?look=classic", host, "sj_look=classic");
    assert.equal(lookForRequest(r, isB2cRequest(r)), null, host);
  }
  process.env.BETTER_AUTH_URL = "https://studojo.com";
  for (const host of ["studojo.pro", "localhost", "127.0.0.1"]) {
    const r = req("http://pod/?look=classic", host, "sj_look=classic");
    assert.equal(lookForRequest(r, isB2cRequest(r)), null, `${host} on the studojo.com deployment`);
  }
} finally {
  if (saved === undefined) delete process.env.BETTER_AUTH_URL;
  else process.env.BETTER_AUTH_URL = saved;
}

// the server draws the look: data-look on <html>, the classic sheet and the switch only when it is on
const has = (src, what, file) => assert.ok(src.includes(what), `${file} lacks: ${what}`);
const entry = readFileSync(new URL("../entry.server.tsx", import.meta.url), "utf8");
has(entry, "const look = lookForRequest(request, b2c);", "entry.server.tsx");
has(entry, 'if (look?.store) responseHeaders.append("Set-Cookie", lookSetCookie(look.store,', "entry.server.tsx");
has(entry, "<LookContext.Provider value={look?.switchable ? look.look : null}>", "entry.server.tsx");
const root = readFileSync(new URL("../root.tsx", import.meta.url), "utf8");
has(root, '<html lang="en" data-sv2={sv2 ?? undefined} data-look={look ?? undefined}>', "root.tsx");
has(root, '{look === "classic" ? (', "root.tsx");
has(root, '<link rel="stylesheet" href={classicCss} />', "root.tsx");
has(root, '<link rel="stylesheet" href={classicSiteCss} />', "root.tsx");
has(root, "{look ? <LookSwitch look={look} /> : null}", "root.tsx");

// the classic sheets only ever add rules under html[data-look="classic"] (a selector list split at its top-level commas)
function topLevel(sel) {
  const out = [];
  let depth = 0, quote = "", cur = "";
  for (const ch of sel) {
    if (quote) { if (ch === quote) quote = ""; }
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}
const dir = new URL("../components/look/", import.meta.url);
for (const f of readdirSync(dir).filter((f) => f.endsWith(".css"))) {
  const css = readFileSync(new URL(f, dir), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const block of css.split("}")) {
    const sel = block.split("{").slice(-2, -1)[0]?.trim() ?? "";
    if (!sel || sel.startsWith("@")) continue;
    for (const one of topLevel(sel)) {
      const s = one.trim();
      if (!s || /^(from|to|\d+%)$/.test(s)) continue;
      assert.match(s, /^html\[data-look="classic"\]/, `${f}: "${s}" is not under html[data-look="classic"]`);
    }
  }
}

console.log("look: ?look= and sj_look switch the look on studojo.pro only; default stays new; studojo.com never gets it");
