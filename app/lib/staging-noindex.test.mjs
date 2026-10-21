// NOINDEX: studojo.pro (staging) says noindex on every page and asks crawlers to stay out in robots.txt;
// studojo.com never does. The host is the request's Host header only. Calls the real handleRequest (HEAD) and the
// real robots.txt loader.
import assert from "node:assert/strict";
import { markStaging, stagingHost, STAGING_NOINDEX } from "./staging-host.ts";

const { default: handleRequest } = await import("../entry.server.tsx");
const { loader: robots } = await import("../routes/robots.txt.tsx");

for (const h of ["studojo.pro", "STUDOJO.PRO", "studojo.pro:443", "admin.studojo.pro", "studojo.pro."]) assert.equal(stagingHost(h), true, h);
for (const h of ["studojo.com", "www.studojo.com", "api.studojo.com", "admin.studojo.com", "studojo.pro.evil.com", "evilstudojo.pro", "studojo.prod", "", null, undefined]) assert.equal(stagingHost(h), false, String(h));

const head = (host, extra = {}) => handleRequest(new Request(`https://${host}/profile/asha-rao`, { method: "HEAD", headers: { host, ...extra } }), 200, new Headers(), {}, {});
assert.equal((await head("studojo.pro")).headers.get("x-robots-tag"), STAGING_NOINDEX, "staging pages say noindex");
assert.equal((await head("studojo.com")).headers.get("x-robots-tag"), null, "studojo.com pages never do");
assert.equal((await head("studojo.com", { "x-forwarded-host": "studojo.pro" })).headers.get("x-robots-tag"), null, "X-Forwarded-Host is not read");
assert.equal((await head("studojo.com")).headers.get("x-frame-options"), "SAMEORIGIN", "the other headers as before");

const txt = async (host) => {
  const res = await robots({ request: new Request(`https://${host}/robots.txt`, { headers: { host } }) });
  return { body: await res.text(), tag: res.headers.get("x-robots-tag") };
};
const pro = await txt("studojo.pro");
assert.equal(pro.body, "User-agent: *\nDisallow: /\n");
assert.equal(pro.tag, STAGING_NOINDEX);
const com = await txt("studojo.com");
assert.match(com.body, /^User-agent: \*\nAllow: \/\n/, "studojo.com still allows crawling");
assert.match(com.body, /Sitemap: https:\/\/studojo\.com\/sitemap\.xml/);
assert.doesNotMatch(com.body, /^Disallow: \/$/m, "never a blanket Disallow on studojo.com");
assert.equal(com.tag, null);

const hs = new Headers();
markStaging(new Request("https://studojo.com/", { headers: { host: "studojo.com" } }), hs);
assert.equal(hs.get("x-robots-tag"), null);

console.log("staging-noindex: ok");
