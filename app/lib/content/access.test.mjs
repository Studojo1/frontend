// The two gates on /content. studojo.com must get nothing, and only the two
// allowlisted Google accounts get in. Both are security properties, so they are
// asserted here rather than left to a manual check after each deploy.
//
// Run: npx tsx app/lib/content/access.test.mjs
import assert from "node:assert";
import { isContentHost, isAllowedEmail } from "./access.server.ts";

const req = (host, header = "host") =>
  new Request("https://x/content", { headers: { [header]: host } });

// Host gate: only .pro and localhost.
assert.equal(isContentHost(req("studojo.pro")), true, "studojo.pro");
assert.equal(isContentHost(req("studojo.pro:443")), true, "port is stripped");
assert.equal(isContentHost(req("STUDOJO.PRO")), true, "case insensitive");
assert.equal(isContentHost(req("www.studojo.pro")), true, "subdomain of .pro");
assert.equal(isContentHost(req("localhost:3000")), true, "localhost for dev");
assert.equal(isContentHost(req("127.0.0.1:3000")), true, "loopback for dev");
assert.equal(
  isContentHost(req("studojo.pro, studojo.com", "x-forwarded-host")),
  true,
  "first forwarded host wins when it is the only header"
);

// A client can set x-forwarded-host to anything. The real Host header decides,
// so a spoofed forwarded host can neither open the gate nor close it.
const spoof = (host, forwarded) =>
  new Request("https://x/content", {
    headers: { host, "x-forwarded-host": forwarded },
  });
assert.equal(
  isContentHost(spoof("studojo.com", "studojo.pro")),
  false,
  "spoofed x-forwarded-host cannot open the gate on production"
);
assert.equal(
  isContentHost(spoof("studojo.pro", "studojo.com")),
  true,
  "spoofed x-forwarded-host cannot close the gate on staging"
);

// The whole point: production must not serve this.
assert.equal(isContentHost(req("studojo.com")), false, "studojo.com blocked");
assert.equal(isContentHost(req("www.studojo.com")), false, "www.studojo.com blocked");
assert.equal(isContentHost(req("maverick.studojo.com")), false, "maverick blocked");
assert.equal(isContentHost(req("api.studojo.com")), false, "api blocked");
assert.equal(isContentHost(req("")), false, "missing host blocked");
// Suffix and prefix spoofs, the two ways a sloppy check leaks.
assert.equal(isContentHost(req("studojo.pro.evil.com")), false, "suffix spoof blocked");
assert.equal(isContentHost(req("evilstudojo.pro")), false, "prefix spoof blocked");

// Email gate: the two accounts, and nobody else.
assert.equal(isAllowedEmail("anamvanshikaa@gmail.com"), true);
assert.equal(isAllowedEmail("vanshikastudojo@gmail.com"), true);
assert.equal(isAllowedEmail("  AnamVanshikaa@Gmail.com  "), true, "trimmed, lowercased");
assert.equal(isAllowedEmail("jeremy@studojo.com"), false, "site admin is not on this list");
assert.equal(isAllowedEmail("admin@studojo.com"), false, "shared admin is not on this list");
assert.equal(isAllowedEmail("anamvanshikaa@gmail.com.evil.com"), false, "no substring match");
assert.equal(isAllowedEmail(null), false);
assert.equal(isAllowedEmail(""), false);

console.log("content access gates: all assertions passed");
