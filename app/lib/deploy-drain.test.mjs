// AR-B01 (areas audit 30 Sep 2026): during rollouts a terminating frontend pod
// kept receiving requests from ingress-nginx and answered live users with
// 502s. Both deploy workflows must patch a preStop sleep onto the pod before
// the image change starts the rollout.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

for (const wf of ["deploy.yml", "deploy-staging.yml"]) {
  const text = readFileSync(new URL(`../../.github/workflows/${wf}`, import.meta.url), "utf8");
  const drain = text.indexOf('"preStop":{"sleep":{"seconds":');
  const rollout = text.indexOf("kubectl set image deployment/${{ env.APP_NAME }}");
  assert.ok(drain > 0, `${wf}: no preStop drain patch`);
  assert.ok(rollout > drain, `${wf}: the drain patch must come before set image`);
}

console.log("deploy-drain: ok");
