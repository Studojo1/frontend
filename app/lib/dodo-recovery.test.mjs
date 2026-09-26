// The outreach checkout and /payment-success agree on how an interrupted Dodo
// payment is recovered. They are two files that never import each other, so the
// only thing holding the contract together is two string literals matching.
//
// The bug this guards: outreach.enrichment kept the Dodo session in a React ref,
// so a phone that locked mid-checkout lost it and the order never advanced even
// though the payment had gone through. payment-success can recover from
// localStorage -- but only if the producer wrote the keys it reads, with a
// job_type value it actually branches on.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const producer = readFileSync(join(ROOT, "routes/outreach.enrichment.tsx"), "utf8");
const consumer = readFileSync(join(ROOT, "routes/payment-success.tsx"), "utf8");
const altProducer = readFileSync(join(ROOT, "lib/payments.ts"), "utf8");

let bad = 0;
const check = (ok, label, detail) => {
  if (ok) { console.log(`  ok   ${label}`); return; }
  bad++;
  console.log(`  FAIL ${label}\n       ${detail}`);
};

// 1. The producer leaves a breadcrumb at all.
check(
  /localStorage\.setItem\(\s*["']dodo_session_id["']/.test(producer),
  "outreach checkout stores dodo_session_id",
  "without it a locked phone loses the session and the paid order never advances",
);

// 2. The consumer reads that exact key. A rename on either side breaks recovery
//    silently -- nothing throws, the user just stays unpaid.
check(
  /localStorage\.getItem\(\s*["']dodo_session_id["']/.test(consumer),
  "payment-success reads dodo_session_id",
  "producer and consumer must agree on the key name",
);

// 3. job_type has to be a value the consumer branches on, not merely present.
//    "outreach" picks /payment/verify-dodo; anything else routes the sale to the
//    control-plane endpoint and it is never credited.
const writesOutreach = /localStorage\.setItem\(\s*["']dodo_pending_job_type["']\s*,\s*["']outreach["']/.test(producer);
const branchesOutreach = /jobType\s*===\s*["']outreach["']/.test(consumer);
check(
  writesOutreach && branchesOutreach,
  'job_type "outreach" is written and branched on',
  `producer writes it: ${writesOutreach}; consumer branches on it: ${branchesOutreach}`,
);

// 4. Both sides must verify against the same endpoint, or recovery confirms a
//    payment the outreach flow never sees.
const ENDPOINT = "/payment/verify-dodo";
check(
  producer.includes(ENDPOINT) && consumer.includes(ENDPOINT),
  `both verify against ${ENDPOINT}`,
  "a recovered session must hit the endpoint that credits the outreach order",
);

// 5. The breadcrumb is cleared once the checkout resolves, or the next visit to
//    payment-success chases a session that is already settled.
check(
  /localStorage\.removeItem\(\s*["']dodo_session_id["']/.test(producer),
  "outreach checkout clears the breadcrumb when the modal closes",
  "a stale session id sends the next visit chasing a settled payment",
);

// 6. The other Dodo caller still writes job_type too -- it is the path that
//    already worked, and it is what proves the key name is the real convention
//    rather than something invented here.
check(
  /localStorage\.setItem\(\s*["']dodo_pending_job_type["']/.test(altProducer),
  "lib/payments.ts still writes dodo_pending_job_type",
  "the pre-existing caller defines this contract; if it changed, this test is stale",
);

if (bad) {
  console.log(`\n${bad} broken link(s) in the Dodo recovery path.`);
  process.exit(1);
}
console.log("\ndodo recovery contract intact — an interrupted checkout can be picked up");
