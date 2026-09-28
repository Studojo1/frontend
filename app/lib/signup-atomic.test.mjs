// Sign-up must never leave a user without a way to log in.
//
// Email sign-up writes the user row, then the credential (password) row. If the
// second write fails and the first is kept, the student's email is "taken"
// and there is no password to sign in with. 7 real students were locked out
// like that. better-auth wraps the two writes in a transaction, but the
// Drizzle adapter only honours it with `transaction: true`, which was off.
//
// This runs real better-auth sign-up against a real Postgres (DATABASE_URL),
// makes the credential write fail, and checks what is left behind. It also
// runs the same with transactions OFF and expects the lockout, so the test
// proves it can see the bug rather than passing vacuously.
import { readFileSync } from "node:fs";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pg from "pg";
import * as schema from "../../auth-schema.ts";

let bad = 0;
const check = (ok, label, detail = "") => {
  if (ok) { console.log(`  ok   ${label}`); return; }
  bad++;
  console.log(`  FAIL ${label}\n       ${detail}`);
};

// 1. The real config keeps transactions on. Static, so it runs everywhere.
const authSrc = readFileSync(new URL("./auth.ts", import.meta.url), "utf8");
const adapterBlock = authSrc.slice(authSrc.indexOf("drizzleAdapter(db, {"), authSrc.indexOf("baseURL,"));
check(/transaction:\s*true/.test(adapterBlock), "auth.ts: drizzleAdapter has transaction: true", "sign-up is not atomic without it");
check(!/databaseHooks[\s\S]*publishEmailEvent\("event\.cc\.welcome_new_user"[\s\S]*session: \{\n    expiresIn/.test(authSrc.slice(authSrc.indexOf("databaseHooks"))),
  "auth.ts: the welcome is not published from inside the sign-up transaction");

// 2. Behaviour against a real database.
if (!process.env.DATABASE_URL) {
  console.log("  skip real-database checks (DATABASE_URL not set)");
} else {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });
  const tables = { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification };

  const signUpWithFailingPassword = async (transaction, email) => {
    const auth = betterAuth({
      secret: "test-secret-test-secret-test-secret-00",
      baseURL: "http://localhost:3000",
      database: drizzleAdapter(db, { provider: "pg", schema: tables, transaction }),
      emailAndPassword: { enabled: true },
      databaseHooks: {
        account: { create: { before: async () => { throw new Error("credential write failed"); } } },
      },
      logger: { disabled: true },
    });
    try {
      await auth.api.signUpEmail({ body: { email, password: "correct-horse-1", name: "T" } });
    } catch {}
    const rows = await db.select().from(schema.user).where(eq(schema.user.email, email));
    return rows.length;
  };

  const stamp = Date.now();
  const leftOff = await signUpWithFailingPassword(false, `off-${stamp}@example.test`);
  check(leftOff === 1, "control: with transactions OFF the lockout reproduces", `user rows left: ${leftOff}`);
  const leftOn = await signUpWithFailingPassword(true, `on-${stamp}@example.test`);
  check(leftOn === 0, "with transactions ON a failed sign-up leaves no user behind", `user rows left: ${leftOn}`);

  // Google sign-up takes a different route (createOAuthUser: user row, then
  // the google account row) under the same transaction wrapper.
  const oauthWithFailingAccount = async (transaction, email) => {
    const auth = betterAuth({
      secret: "test-secret-test-secret-test-secret-00",
      baseURL: "http://localhost:3000",
      database: drizzleAdapter(db, { provider: "pg", schema: tables, transaction }),
      emailAndPassword: { enabled: true },
      databaseHooks: {
        account: { create: { before: async () => { throw new Error("google account write failed"); } } },
      },
      logger: { disabled: true },
    });
    const ctx = await auth.$context;
    try {
      await ctx.internalAdapter.createOAuthUser(
        { email, name: "G", emailVerified: true },
        { providerId: "google", accountId: `g-${email}`, accessToken: "x" },
      );
    } catch {}
    const rows = await db.select().from(schema.user).where(eq(schema.user.email, email));
    return rows.length;
  };
  const gOff = await oauthWithFailingAccount(false, `g-off-${stamp}@example.test`);
  check(gOff === 1, "control: Google sign-up with transactions OFF also strands the user", `user rows left: ${gOff}`);
  const gOn = await oauthWithFailingAccount(true, `g-on-${stamp}@example.test`);
  check(gOn === 0, "Google sign-up with transactions ON leaves no user behind", `user rows left: ${gOn}`);

  // And a normal sign-up still works, leaving a user WITH a login.
  const auth = betterAuth({
    secret: "test-secret-test-secret-test-secret-00",
    baseURL: "http://localhost:3000",
    database: drizzleAdapter(db, { provider: "pg", schema: tables, transaction: true }),
    emailAndPassword: { enabled: true },
    logger: { disabled: true },
  });
  const email = `ok-${stamp}@example.test`;
  await auth.api.signUpEmail({ body: { email, password: "correct-horse-1", name: "T" } });
  const [u] = await db.select().from(schema.user).where(eq(schema.user.email, email));
  const accts = u ? await db.select().from(schema.account).where(eq(schema.account.userId, u.id)) : [];
  check(!!u && accts.length === 1, "a normal sign-up commits the user and its password together", `user=${!!u} accounts=${accts.length}`);
  await pool.end();
}

if (bad) { console.log(`\n${bad} failed`); process.exit(1); }
console.log("\nsignup-atomic: all passed");
