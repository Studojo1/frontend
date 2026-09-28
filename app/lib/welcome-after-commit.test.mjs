// The signup welcome must go out only after the sign-up committed a login.
import { welcomeAfterCommit } from "./welcome-after-commit.ts";

let bad = 0;
const check = (ok, label, detail = "") => {
  if (ok) { console.log(`  ok   ${label}`); return; }
  bad++;
  console.log(`  FAIL ${label}\n       ${detail}`);
};
const user = { id: "u1", email: "a@example.com", name: "A" };
const fast = [1, 1, 1, 1];

{
  const sent = [];
  const ok = await welcomeAfterCommit(user, { isCommitted: async () => true, publish: async (p) => { sent.push(p); }, delays: fast });
  check(ok && sent.length === 1 && sent[0].user_id === "u1", "committed sign-up is welcomed once", JSON.stringify(sent));
}
{
  const sent = [];
  const ok = await welcomeAfterCommit(user, { isCommitted: async () => false, publish: async (p) => { sent.push(p); }, delays: fast });
  check(!ok && sent.length === 0, "rolled-back sign-up is never welcomed", JSON.stringify(sent));
}
{
  const sent = []; let calls = 0;
  const ok = await welcomeAfterCommit(user, { isCommitted: async () => ++calls >= 3, publish: async (p) => { sent.push(p); }, delays: fast });
  check(ok && sent.length === 1 && calls === 3, "a slow commit is waited for, not skipped", `calls=${calls}`);
}
{
  const sent = []; let calls = 0;
  const ok = await welcomeAfterCommit(user, {
    isCommitted: async () => { if (++calls === 1) throw new Error("db blip"); return true; },
    publish: async (p) => { sent.push(p); }, delays: fast,
  });
  check(ok && sent.length === 1, "a failed check is retried, not treated as committed or as final");
}

if (bad) { console.log(`\n${bad} failed`); process.exit(1); }
console.log("\nwelcome-after-commit: all passed");
