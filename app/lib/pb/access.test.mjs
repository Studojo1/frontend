// The two gates on /pb and /pbadmin. studojo.com must get nothing, subdomains
// of studojo.pro must get nothing, and only the staff list may trigger posts.
// Both are security properties, so they are asserted here rather than left to
// a manual check after each deploy.
//
// Run: npx tsx app/lib/pb/access.test.mjs
import assert from "node:assert";
import { isPbHost, isPbAdminEmail } from "./access.server.ts";

const req = (host, header = "host") =>
  new Request("https://x/pb", { headers: { [header]: host } });

// Host gate: the apex staging host and localhost only.
assert.equal(isPbHost(req("studojo.pro")), true, "studojo.pro");
assert.equal(isPbHost(req("studojo.pro:443")), true, "port is stripped");
assert.equal(isPbHost(req("STUDOJO.PRO")), true, "case insensitive");
assert.equal(isPbHost(req("  studojo.pro  ")), true, "whitespace trimmed");
assert.equal(isPbHost(req("localhost")), true, "localhost for dev");
assert.equal(isPbHost(req("localhost:5173")), true, "localhost with a port");
assert.equal(isPbHost(req("127.0.0.1:3000")), true, "loopback for dev");
assert.equal(
  isPbHost(req("studojo.pro, studojo.com", "x-forwarded-host")),
  true,
  "first forwarded host counts when it is the only header"
);
assert.equal(
  isPbHost(req("studojo.com, studojo.pro", "x-forwarded-host")),
  false,
  "only the first forwarded host counts"
);

// Subdomains are refused, unlike /content. app. and dashboard. route to the
// same pods, and sign-in does not work on them for this flow.
assert.equal(isPbHost(req("app.studojo.pro")), false, "app.studojo.pro blocked");
assert.equal(isPbHost(req("dashboard.studojo.pro")), false, "dashboard.studojo.pro blocked");
assert.equal(isPbHost(req("www.studojo.pro")), false, "www.studojo.pro blocked");

// A client can set x-forwarded-host to anything. The real Host header decides,
// so a spoofed forwarded host can neither open the gate nor close it.
const spoof = (host, forwarded) =>
  new Request("https://x/pb", {
    headers: { host, "x-forwarded-host": forwarded },
  });
assert.equal(
  isPbHost(spoof("studojo.com", "studojo.pro")),
  false,
  "spoofed x-forwarded-host cannot open the gate on production"
);
assert.equal(
  isPbHost(spoof("app.studojo.pro", "studojo.pro")),
  false,
  "spoofed x-forwarded-host cannot open the gate on a subdomain"
);
assert.equal(
  isPbHost(spoof("studojo.pro", "studojo.com")),
  true,
  "spoofed x-forwarded-host cannot close the gate on staging"
);

// The whole point: production must not serve this.
assert.equal(isPbHost(req("studojo.com")), false, "studojo.com blocked");
assert.equal(isPbHost(req("www.studojo.com")), false, "www.studojo.com blocked");
assert.equal(isPbHost(req("app.studojo.com")), false, "app.studojo.com blocked");
assert.equal(isPbHost(req("")), false, "missing host blocked");
assert.equal(isPbHost(new Request("https://studojo.pro/pb")), false, "no header at all is blocked, the URL is not trusted");
// Suffix and prefix spoofs, the two ways a sloppy check leaks.
assert.equal(isPbHost(req("studojo.pro.evil.com")), false, "suffix spoof blocked");
assert.equal(isPbHost(req("evilstudojo.pro")), false, "prefix spoof blocked");
assert.equal(isPbHost(req("studojo.pro.")), false, "trailing dot fails closed");
assert.equal(isPbHost(req("localhost.evil.com")), false, "localhost suffix spoof blocked");

// Staff gate, default list.
const savedEnv = process.env.PB_ADMIN_EMAILS;
delete process.env.PB_ADMIN_EMAILS;
assert.equal(isPbAdminEmail("jeremy.zac@gmail.com"), true, "default staff account");
assert.equal(isPbAdminEmail("  Jeremy.Zac@Gmail.com  "), true, "trimmed, lowercased");
assert.equal(isPbAdminEmail("JEREMY.ZAC@GMAIL.COM"), true, "upper case");
assert.equal(isPbAdminEmail("admin@studojo.com"), false, "shared admin is not on this list");
assert.equal(isPbAdminEmail("anamvanshikaa@gmail.com"), false, "content studio list does not carry over");
assert.equal(isPbAdminEmail("jeremy.zac@gmail.com.evil.com"), false, "no substring match");
assert.equal(isPbAdminEmail("xjeremy.zac@gmail.com"), false, "no suffix match");
assert.equal(isPbAdminEmail("jeremyzac@gmail.com"), false, "dots matter");
assert.equal(isPbAdminEmail(null), false);
assert.equal(isPbAdminEmail(undefined), false);
assert.equal(isPbAdminEmail(""), false);

// PB_ADMIN_EMAILS replaces the default list, it does not add to it.
process.env.PB_ADMIN_EMAILS = " Staff@Studojo.com , second@example.com ";
assert.equal(isPbAdminEmail("staff@studojo.com"), true, "env list, lowercased");
assert.equal(isPbAdminEmail("SECOND@EXAMPLE.COM"), true, "env list, case insensitive");
assert.equal(isPbAdminEmail("jeremy.zac@gmail.com"), false, "the env list replaces the default");
assert.equal(isPbAdminEmail("staff@studojo.com.evil.com"), false, "no substring match on env list");

// An env value with no real address falls back to the default, so a stray
// comma cannot lock staff out or open the gate.
process.env.PB_ADMIN_EMAILS = " , ";
assert.equal(isPbAdminEmail("jeremy.zac@gmail.com"), true, "blank env falls back to default");
assert.equal(isPbAdminEmail(""), false, "blank env does not admit an empty address");
process.env.PB_ADMIN_EMAILS = "";
assert.equal(isPbAdminEmail("jeremy.zac@gmail.com"), true, "empty env falls back to default");

if (savedEnv === undefined) delete process.env.PB_ADMIN_EMAILS;
else process.env.PB_ADMIN_EMAILS = savedEnv;

// The Host header is the client's to set. On a deployment whose own address
// is production, no Host value opens these pages.
{
  const savedUrl = process.env.BETTER_AUTH_URL;
  const req = (host) => new Request("http://internal/pb", { headers: { host } });
  process.env.BETTER_AUTH_URL = "https://studojo.com";
  assert.equal(isPbHost(req("studojo.pro")), false, "a forged staging Host on a production pod is refused");
  assert.equal(isPbHost(req("localhost")), false, "so is a forged localhost Host");
  process.env.BETTER_AUTH_URL = "https://studojo.pro";
  assert.equal(isPbHost(req("studojo.pro")), true, "staging serves the pages");
  assert.equal(isPbHost(req("studojo.com")), false, "but still not for another Host");
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  assert.equal(isPbHost(req("localhost:3000")), true, "local development works");
  process.env.BETTER_AUTH_URL = "not a url";
  assert.equal(isPbHost(req("studojo.pro")), false, "an unreadable address fails closed");
  if (savedUrl === undefined) delete process.env.BETTER_AUTH_URL;
  else process.env.BETTER_AUTH_URL = savedUrl;
}

console.log("pb access gates: all assertions passed");
