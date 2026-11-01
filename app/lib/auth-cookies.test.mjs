// Sign-in cookies and origins for `web`, from env (RELAUNCH, 2 Nov 2026; app/lib/auth-cookies.ts): a prefix of our
// own ("stu"), one cookie for the whole domain, and trusted origins. The pure rules first, then better-auth itself,
// configured the way production will be, so the names and the domain are the ones a browser really gets.
import assert from "node:assert/strict";
import { DEFAULT_COOKIE_PREFIX, LAST_LOGIN_METHOD_COOKIE, authCookieConfig, normaliseOrigin, sessionCookieName } from "./auth-cookies.ts";

const PROD = {
  AUTH_COOKIE_PREFIX: "stu",
  AUTH_COOKIE_DOMAIN: ".studojo.com",
  AUTH_TRUSTED_ORIGINS: "https://studojo.com,https://www.studojo.com,https://platform.studojo.com",
};
const STAGING = {
  AUTH_COOKIE_PREFIX: "stu",
  AUTH_COOKIE_DOMAIN: ".studojo.pro",
  AUTH_TRUSTED_ORIGINS: "https://studojo.pro,https://platform.studojo.pro",
};

// ── 1. The rules.
assert.deepEqual(authCookieConfig(PROD), {
  cookiePrefix: "stu",
  crossSubDomainCookies: { enabled: true, domain: ".studojo.com" },
  trustedOrigins: ["https://studojo.com", "https://www.studojo.com", "https://platform.studojo.com"],
  problems: [],
});
assert.deepEqual(authCookieConfig(STAGING), {
  cookiePrefix: "stu",
  crossSubDomainCookies: { enabled: true, domain: ".studojo.pro" },
  trustedOrigins: ["https://studojo.pro", "https://platform.studojo.pro"],
  problems: [],
});
// Unset: exactly as before (host-only cookies under better-auth, no extra origin).
assert.deepEqual(authCookieConfig({}), { cookiePrefix: DEFAULT_COOKIE_PREFIX, crossSubDomainCookies: null, trustedOrigins: [], problems: [] });
// A shared domain never goes out under the default name, which the B2B hosts read.
const leak = authCookieConfig({ AUTH_COOKIE_DOMAIN: ".studojo.com" });
assert.equal(leak.crossSubDomainCookies, null);
assert.equal(leak.problems.length, 1);
assert.equal(authCookieConfig({ AUTH_COOKIE_DOMAIN: ".studojo.com", AUTH_COOKIE_PREFIX: "better-auth" }).crossSubDomainCookies, null);
// A bare domain gets its dot; junk is refused, never half used.
assert.deepEqual(authCookieConfig({ AUTH_COOKIE_PREFIX: "stu", AUTH_COOKIE_DOMAIN: "Studojo.com" }).crossSubDomainCookies, { enabled: true, domain: ".studojo.com" });
for (const d of ["studojo", ".com", "studojo.com/", "https://studojo.com", "*.studojo.com", "a b.com"]) {
  const c = authCookieConfig({ AUTH_COOKIE_PREFIX: "stu", AUTH_COOKIE_DOMAIN: d });
  assert.equal(c.crossSubDomainCookies, null, d);
  assert.equal(c.problems.length, 1, d);
}
for (const p of ["stu.x", "a b", "x".repeat(33), "stu;"]) {
  const c = authCookieConfig({ AUTH_COOKIE_PREFIX: p });
  assert.equal(c.cookiePrefix, DEFAULT_COOKIE_PREFIX, p);
  assert.equal(c.problems.length, 1, p);
}
// Origins: bare hosts mean https, duplicates go, anything but an https origin (or local http) is left out.
assert.equal(normaliseOrigin("platform.studojo.com"), "https://platform.studojo.com");
assert.equal(normaliseOrigin(" https://Studojo.com/ "), "https://studojo.com");
assert.equal(normaliseOrigin("http://localhost:5173"), "http://localhost:5173");
for (const bad of ["http://studojo.com", "https://studojo.com/path", "ftp://studojo.com", "https://user:pw@studojo.com", "*", "https://"]) {
  assert.equal(normaliseOrigin(bad), null, bad);
}
const mixed = authCookieConfig({ AUTH_TRUSTED_ORIGINS: "studojo.com, https://studojo.com ,,http://evil.com" });
assert.deepEqual(mixed.trustedOrigins, ["https://studojo.com"]);
assert.equal(mixed.problems.length, 1);
assert.equal(sessionCookieName("stu", true), "__Secure-stu.session_token");
assert.equal(sessionCookieName("stu", false), "stu.session_token");

// ── 2. better-auth itself, as production: BETTER_AUTH_URL https://studojo.com and the PROD settings above.
Object.assign(process.env, PROD, {
  BETTER_AUTH_URL: "https://studojo.com",
  BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-00",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "test",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "test",
});
delete process.env.DATABASE_URL; // nothing below reads the database
const realError = console.error;
const realWarn = console.warn;
console.error = () => {};
console.warn = () => {};
let auth;
try {
  ({ auth } = await import("./auth.ts"));
} finally {
  console.error = realError;
  console.warn = realWarn;
}
assert.equal(auth.options.advanced.cookiePrefix, "stu");
assert.deepEqual(auth.options.advanced.crossSubDomainCookies, { enabled: true, domain: ".studojo.com" });
assert.equal("cookieOptions" in auth.options.advanced, false, "the ignored option is gone");
const ctx = await auth.$context;
const names = Object.fromEntries(Object.entries(ctx.authCookies).map(([k, v]) => [k, v.name]));
assert.deepEqual(names, {
  sessionToken: "__Secure-stu.session_token",
  sessionData: "__Secure-stu.session_data",
  dontRememberToken: "__Secure-stu.dont_remember",
  accountData: "__Secure-stu.account_data",
});
for (const [k, v] of Object.entries(ctx.authCookies)) {
  assert.equal(v.attributes.domain, ".studojo.com", `${k} is shared across subdomains`);
  assert.equal(v.attributes.secure, true, k);
  assert.equal(v.attributes.httpOnly, true, k);
}
assert.equal(ctx.createAuthCookie("state").name, "__Secure-stu.state", "Google sign-in's state cookie");
assert.equal(ctx.createAuthCookie("state").attributes.domain, ".studojo.com");
assert.equal(sessionCookieName(ctx.options.advanced.cookiePrefix, true), ctx.authCookies.sessionToken.name);

// The "last signed in with" cookie keeps none of the default names either, on the server and in the browser client.
assert.equal(LAST_LOGIN_METHOD_COOKIE, "stu.last_used_login_method");
const lastPlugin = auth.options.plugins.find((p) => p.id === "last-login-method");
assert.ok(lastPlugin, "the lastLoginMethod plugin is on");
const { readFileSync } = await import("node:fs");
const authSrc = readFileSync(new URL("./auth.ts", import.meta.url), "utf8");
const clientSrc = readFileSync(new URL("./auth-client.ts", import.meta.url), "utf8");
assert.match(authSrc, /lastLoginMethod\(\{ storeInDatabase: true, cookieName: LAST_LOGIN_METHOD_COOKIE \}\)/);
assert.match(clientSrc, /lastLoginMethodClient\(\{ cookieName: LAST_LOGIN_METHOD_COOKIE \}\)/);

// Origins: a sign-out posted from each trusted origin passes the origin check (400: no session); anything else is
// 403 INVALID_ORIGIN.
const post = (origin) =>
  auth.handler(
    new Request("https://studojo.com/api/auth/sign-out", {
      method: "POST",
      headers: { origin, cookie: "__Secure-stu.session_token=x", "content-type": "application/json" },
      body: "{}",
    }),
  );
console.error = () => {};
try {
  for (const o of ["https://studojo.com", "https://www.studojo.com", "https://platform.studojo.com"]) {
    const res = await post(o);
    assert.notEqual(res.status, 403, `${o} is trusted`);
  }
  for (const o of ["https://evil.example", "https://app.studojo.com.evil.example", "https://platform.studojo.pro"]) {
    const res = await post(o);
    assert.equal(res.status, 403, `${o} is not trusted on production`);
  }
} finally {
  console.error = realError;
}

console.log("auth-cookies: prefix stu, shared .studojo.com cookies, trusted origins from env");
