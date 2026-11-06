// EMQ-IP6 and EMQ-REG (6 Nov 2026). Events Manager asked for IPv6 addresses on the Conversions API copies (the pixel sees
// the phone's IPv6, our IPv4-only ingress saw the carrier's shared IPv4) and CompleteRegistration had no phone (sent
// before the WhatsApp number is verified). The server copy now sends the browser's IPv6 address from the stu_ip6 cookie,
// and /auth here claims PostHog's signed_up alone (the platform sends Meta's once the phone is verified).
//
// Made-up addresses only (documentation-style values); nothing here reaches a network.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const APP = new URL("../", import.meta.url).pathname;
const { publicIpv6, ip6CookieDomain, IP6_COOKIE, IP6_ECHO_URL } = await import("./meta-ip6.ts");
const capi = await import("./meta-capi.server.ts");

// ── Only a public IPv6 address is kept.
assert.equal(publicIpv6("2401:4900:1c2a:5b3::1f"), "2401:4900:1c2a:5b3::1f");
assert.equal(publicIpv6(" 2401:4900:1C2A:05B3:0000:0000:0000:001F "), "2401:4900:1c2a:05b3:0000:0000:0000:001f");
assert.equal(publicIpv6("2a02:6b8::"), "2a02:6b8::");
for (const bad of ["::1", "fe80::1", "fd00::1", "::ffff:49.36.1.2", "49.36.1.2", "-", "", "2401:4900::1::2", "2401:1:2:3:4:5:6:7:8", "2401:4900:1:2:3:4:5", "2401:4900:zz::1", "2401:", "2401:4900:12345::1"]) {
  assert.equal(publicIpv6(bad), null, bad);
}
assert.equal(publicIpv6(undefined), null);

// ── The cookie goes on the parent domain, so studojo.com and platform.studojo.com both read it.
assert.equal(ip6CookieDomain("studojo.com"), "studojo.com");
assert.equal(ip6CookieDomain("platform.studojo.com"), "studojo.com");
assert.equal(ip6CookieDomain("platform.studojo.pro"), "studojo.pro");
assert.equal(ip6CookieDomain("notstudojo.com"), null);
assert.equal(ip6CookieDomain("localhost"), null);
assert.equal(IP6_COOKIE, "stu_ip6", "the platform reads the same cookie (career-agent app/lib/meta.ts)");
assert.equal(IP6_ECHO_URL, "https://studojo-ip6.azurewebsites.net/");

// ── The server copy sends the browser's IPv6 address in place of the ingress's IPv4 one.
const req = (cookie) => new Request("https://studojo.com/api/meta-event", { method: "POST", headers: { cookie, "x-forwarded-for": "49.36.1.2, 10.0.0.1", "user-agent": "UA/1" } });
assert.equal(capi.metaUserDataFromRequest(req("stu_ip6=2401:4900:1c2a::1f; _fbp=fb.1.1700000000000.42")).clientIp, "2401:4900:1c2a::1f");
assert.equal(capi.metaUserDataFromRequest(req("stu_ip6=-")).clientIp, "49.36.1.2", "an IPv4-only network: the address our ingress saw");
assert.equal(capi.metaUserDataFromRequest(req("stu_ip6=fe80::1")).clientIp, "49.36.1.2", "never a private or made-up one");
assert.equal(capi.metaUserDataFromRequest(req("stu_ip6=%E0%A4%A")).clientIp, "49.36.1.2", "a broken cookie never throws");
assert.equal(capi.metaUserDataFromRequest(req("")).clientIp, "49.36.1.2");

// ── Wiring: the pixel asks on init without waiting, the echo gets no cookie of ours, /auth claims PostHog's alone.
const pixel = readFileSync(`${APP}lib/meta-pixel.ts`, "utf8");
assert.match(pixel, /if \(!metaAllowed\(\)\) return;\n  void noteIpv6\(\);\n  void startPixel\(PIXEL_ID\);/);
assert.match(pixel, /fetch\(IP6_ECHO_URL, \{ credentials: "omit", cache: "no-store"/);
assert.match(pixel, /const allowed = opts\.meta !== false && metaAllowed\(\);/);
const analytics = readFileSync(`${APP}lib/analytics.ts`, "utf8");
assert.match(analytics, /claimMetaOnce\("CompleteRegistration", registrationEventId\(user\.id\), \{ posthog: true, meta: false \}\)/);

console.log("meta-ip6: ok");
