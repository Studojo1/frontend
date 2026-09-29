// PS-N15: one-time Gmail OAuth codes must never reach PostHog, including
// when they are nested (URL-encoded) inside /auth's redirect param.
import assert from "node:assert/strict";
import { scrubSecrets } from "./posthog.ts";

const plain = "https://studojo.com/outreach/connect/gmail?gmail_code=4/0AbCd-efG&gmail_state=xyz.123&utm_source=ig";
assert.equal(
  scrubSecrets(plain),
  "https://studojo.com/outreach/connect/gmail?gmail_code=[redacted]&gmail_state=[redacted]&utm_source=ig",
);

const nested = "https://studojo.com/auth?mode=signin&redirect=%2Foutreach%2Fconnect%2Fgmail%3Fgmail_code%3D4%2F0AbCd%26gmail_state%3Dxyz";
const out = scrubSecrets(nested);
assert.ok(!out.includes("0AbCd") && !out.includes("xyz"), out);

const props = scrubSecrets({ $current_url: plain, $referrer: nested, n: 3, list: [plain] });
assert.ok(!JSON.stringify(props).includes("0AbCd"));
assert.equal(props.n, 3);

console.log("posthog-scrub: ok");
