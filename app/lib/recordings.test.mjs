// RECORDINGS (5 Nov 2026, the owner and Pranav: "user recordings like Mixpanel gives us ... under our admin panel"):
// the site's half of session replay. The privacy rules every event goes through before it leaves the browser
// (recordings/recorder-rules.ts, the same rules as career-agent's), the gate and the switch (gate.ts, boot.ts), and the
// wiring: the recorder is its own chunk, loaded late, only when RECORDINGS is on, posting to the platform's api/rec.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mayRecord } from "./recordings/gate.ts";
import { recEndpoint, recordingExcluded, recordingsOn } from "./recordings/boot.ts";
import {
  BLOCKED, MASKED_AREAS, cleanHref, maskText, newVisit, scrubAttr, scrubEvent, scrubText, visitCookie, visitFromCookie,
} from "./recordings/recorder-rules.ts";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const NOW = Date.parse("2026-11-05T06:00:00Z");

// Emails and phone numbers are masked in any text; dates, prices and counts are not.
assert.equal(scrubText("Write to priya.s+jobs@gmail.com today"), "Write to ********************** today");
assert.equal(scrubText("Call +91 98765 43210 or 9876543210."), "Call +** ***** ***** or **********.");
for (const keep of ["5 Nov 2026, 10:30", "Rs 2,99,000 a year", "1,500 jobs", "2026-11-05"]) assert.equal(scrubText(keep), keep);

// Masked areas whole, the rest word for word (Stu's captions included); a failing check masks.
assert.equal(maskText("Priya Sharma", { closest: (s) => (s === MASKED_AREAS ? {} : null) }), "***** ******");
assert.equal(maskText("Tell me about your last internship", { closest: () => null }), "Tell me about your last internship");
assert.equal(maskText("x", { closest: () => { throw new Error("bad"); } }), "*");
for (const b of ["audio", "video", ".razorpay-container", "[data-rec-block]"]) assert.ok(BLOCKED.includes(b), b);

// Attributes and the page address.
assert.equal(scrubAttr("href", "mailto:hr@company.com"), "mailto:***");
assert.equal(scrubAttr("placeholder", "you@example.com"), "***************");
assert.equal(cleanHref("https://studojo.com/auth?redirect=%2Fjoin&email=a%40b.co#x"), "https://studojo.com/auth");
const meta = { type: 4, data: { href: "https://studojo.com/?utm_source=ig", width: 390, height: 800 } };
assert.equal(scrubEvent(meta).data.href, "https://studojo.com/");

// One visit across the site and the platform: the cookie is on the parent domain.
const v = newVisit(NOW);
const c = visitCookie(v, "studojo.com", true);
assert.match(c, /Domain=\.studojo\.com/);
assert.deepEqual(visitFromCookie(c.split(";")[0], NOW + 1_000), { id: v.id, start: NOW, last: NOW });
assert.equal(visitFromCookie(c.split(";")[0], NOW + 31 * 60_000), null);

// Crawlers never load it; the audit robot does; a stop from the platform holds.
const chrome = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36";
assert.ok(mayRecord(chrome, ""));
assert.ok(!mayRecord(chrome, "a=1; stu_rec_off=1"));
assert.ok(!mayRecord("Mozilla/5.0 (compatible; Googlebot/2.1)", ""));
assert.ok(mayRecord(`${chrome} StudojoAudit-bot/1.0`, ""));

// The switch, the pages never recorded, the platform's address.
assert.ok(recordingsOn("1") && recordingsOn("on") && !recordingsOn(undefined) && !recordingsOn("0"));
for (const p of ["/profile/priya", "/time-machine", "/time-machine-assets/x.png", "/admin", "/bob/x"]) assert.ok(recordingExcluded(p, ""), p);
assert.ok(recordingExcluded("/settings", "?gmail_code=abc"));
for (const p of ["/", "/blog/how-to", "/reports", "/auth", "/privacy"]) assert.ok(!recordingExcluded(p, ""), p);
assert.equal(recEndpoint("https://platform.studojo.com"), "https://platform.studojo.com/api/rec");
assert.equal(recEndpoint(""), "");

// The wiring: never a static import of the recorder; loaded after load and idle; never in a frame; consent first.
const root = read("root.tsx");
assert.doesNotMatch(root, /lib\/recordings\/recorder"/);
assert.match(root, /rec: recordingsOn\(process\.env\.RECORDINGS\) && isB2cRequest\(request\)/);
assert.match(root, /useEffect\(\(\) => bootRecorder\(recordHere, recEndpoint\(productOrigin\(\)\)\), \[recordHere\]\)/);
const boot = read("lib/recordings/boot.ts");
assert.match(boot, /import\("\.\/recorder"\)/);
assert.match(boot, /requestIdleCallback/);
assert.match(boot, /window\.top !== window\.self/);
assert.match(boot, /readConsent\(\) === "denied" \|\| !trackingAllowed\(\)/);
const rec = read("lib/recordings/recorder.ts");
assert.match(rec, /maskAllInputs: true/);
assert.match(rec, /recordCanvas: false/);
assert.match(rec, /credentials: "include"/);
const wf = readFileSync(new URL("../../.github/workflows/deploy-web.yml", import.meta.url), "utf8");
assert.match(wf, /PRODUCT_ORIGIN: \$p, RECORDINGS: "1"\}/);

console.log("recordings: the privacy rules, the gate, the switch and the late-loaded recorder hold");
